-- ── Bookings table ────────────────────────────────────────────────────────────
-- Run this migration in the Supabase SQL editor (Database > SQL Editor > New query).

CREATE TABLE IF NOT EXISTS bookings (
  id                       uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  musician_id              uuid        NOT NULL REFERENCES musicians(id)   ON DELETE CASCADE,
  venue_id                 uuid        NOT NULL REFERENCES venues(id)      ON DELETE CASCADE,
  requester_id             uuid        NOT NULL REFERENCES auth.users(id)  ON DELETE CASCADE,
  status                   text        NOT NULL DEFAULT 'pending'
                                       CHECK (status IN ('pending','accepted','declined','cancelled','completed')),
  event_date               date        NOT NULL,
  start_time               time        NOT NULL,
  end_time                 time        NOT NULL,
  set_length_minutes       integer,
  offered_rate             numeric     NOT NULL CHECK (offered_rate > 0),
  agreed_rate              numeric,
  message                  text        NOT NULL,
  venue_notes              text,
  stripe_payment_intent_id text,
  stripe_transfer_id       text,
  created_at               timestamptz DEFAULT now(),
  updated_at               timestamptz DEFAULT now()
);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'bookings_updated_at'
  ) THEN
    CREATE TRIGGER bookings_updated_at
      BEFORE UPDATE ON bookings
      FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
  END IF;
END;
$$;

ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Musicians see their own bookings
CREATE POLICY "Musicians read own bookings"
  ON bookings FOR SELECT USING (auth.uid() = musician_id);

-- Venues see their own bookings
CREATE POLICY "Venues read own bookings"
  ON bookings FOR SELECT USING (auth.uid() = venue_id);

-- Authenticated users can create bookings where they are the requester
CREATE POLICY "Users create own bookings"
  ON bookings FOR INSERT WITH CHECK (auth.uid() = requester_id);

-- Either party (musician or venue) can update the booking
CREATE POLICY "Parties update own bookings"
  ON bookings FOR UPDATE
  USING (auth.uid() = musician_id OR auth.uid() = venue_id);
