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
  city text,
  state text,
  capacity int,
  website_url text,
  profile_image text,
  created_at timestamp default now()
);

-- Enable Row Level Security
ALTER TABLE musicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE venues ENABLE ROW LEVEL SECURITY;

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
