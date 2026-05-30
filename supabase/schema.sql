-- Musicians table
CREATE TABLE musicians (
  id uuid references auth.users primary key,
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

-- Enable Row Level Security
ALTER TABLE musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_hosts ENABLE ROW LEVEL SECURITY;

-- Anyone can read musicians and venues
CREATE POLICY "Public read musicians"
  ON musicians FOR SELECT
  USING (true);

CREATE POLICY "Public read venues"
  ON venues FOR SELECT
  USING (true);

-- Users can insert their own row
CREATE POLICY "Users insert own musician"
  ON musicians FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users insert own venue"
  ON venues FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can only update their own row
CREATE POLICY "Users update own musician"
  ON musicians FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users update own venue"
  ON venues FOR UPDATE
  USING (auth.uid() = id);

-- Event hosts: read and update own row only
CREATE POLICY "Users read own host"
  ON event_hosts FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users insert own host"
  ON event_hosts FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users update own host"
  ON event_hosts FOR UPDATE
  USING (auth.uid() = id);
