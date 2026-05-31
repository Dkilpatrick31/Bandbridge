-- Musicians table
CREATE TABLE musicians (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  stage_name text,
  bio text,
  genre text[],
  city text,
  state text,
  hourly_rate numeric,
  spotify_url text,
  youtube_url text,
  soundcloud_url text,
  website_url text,
  profile_image text,
  is_available boolean default true,
  is_verified boolean default false,
  stripe_account_id text,
  created_at timestamp default now()
);

-- Venues table
CREATE TABLE venues (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  name text,
  bio text,
  street_address text,
  city text,
  state text,
  zip_code text,
  capacity int,
  phone text,
  website_url text,
  show_email boolean default true,
  show_phone boolean default false,
  profile_image text,
  created_at timestamp default now()
);

-- Event Hosts table
CREATE TABLE event_hosts (
  id uuid references auth.users primary key,
  first_name text,
  last_name text,
  full_name text,
  email text,
  phone text,
  city text,
  state text,
  event_type text,
  event_date date,
  budget_range text,
  notes text,
  created_at timestamp default now()
);

-- Notifications table
CREATE TABLE notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  type text not null,
  message text not null,
  read boolean default false,
  link text,
  created_at timestamp default now()
);

-- Messages table
CREATE TABLE messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null,
  sender_id uuid references auth.users not null,
  recipient_id uuid references auth.users not null,
  content text not null,
  read boolean default false,
  created_at timestamp default now()
);

-- Enable Row Level Security
ALTER TABLE musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Anyone can read musicians and venues
CREATE POLICY "Public read musicians" ON musicians FOR SELECT USING (true);
CREATE POLICY "Public read venues" ON venues FOR SELECT USING (true);

-- Users can insert their own row
CREATE POLICY "Users insert own musician" ON musicians FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users insert own venue" ON venues FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can only update their own row
CREATE POLICY "Users update own musician" ON musicians FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users update own venue" ON venues FOR UPDATE USING (auth.uid() = id);

-- Event hosts: own row only
CREATE POLICY "Users read own host" ON event_hosts FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own host" ON event_hosts FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own host" ON event_hosts FOR UPDATE USING (auth.uid() = id);

-- Notifications: own only
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Messages: sender or recipient
CREATE POLICY "Users read own messages" ON messages FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);
CREATE POLICY "Users send messages" ON messages FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users update own messages" ON messages FOR UPDATE USING (auth.uid() = recipient_id);

-- ─── Migrations (run these if tables already exist) ───────────────────────────
-- ALTER TABLE musicians ADD COLUMN IF NOT EXISTS first_name text;
-- ALTER TABLE musicians ADD COLUMN IF NOT EXISTS last_name text;
-- ALTER TABLE venues ADD COLUMN IF NOT EXISTS first_name text;
-- ALTER TABLE venues ADD COLUMN IF NOT EXISTS last_name text;
-- ALTER TABLE event_hosts ADD COLUMN IF NOT EXISTS first_name text;
-- ALTER TABLE event_hosts ADD COLUMN IF NOT EXISTS last_name text;
