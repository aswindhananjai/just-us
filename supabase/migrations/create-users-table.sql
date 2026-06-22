-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  passcode TEXT NOT NULL,
  profile_picture_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert Aswin and Anu
INSERT INTO users (name, passcode, profile_picture_url) VALUES
  ('Aswin', '140297', '/aswin.png'),
  ('Anu', '010195', '/anu.png')
ON CONFLICT (name) DO NOTHING;

-- Create relationship_config table to store the relationship start date
CREATE TABLE IF NOT EXISTS relationship_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  start_date DATE NOT NULL DEFAULT '2026-05-21',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert the relationship start date
INSERT INTO relationship_config (start_date) VALUES ('2026-05-21')
ON CONFLICT DO NOTHING;

-- Add RLS policies for users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read users (needed for passcode verification)
CREATE POLICY "Allow read access to all users" ON users
  FOR SELECT
  USING (true);

-- Allow users to update their own profile picture
CREATE POLICY "Allow users to update their profile" ON users
  FOR UPDATE
  USING (true);

-- Add RLS for relationship_config
ALTER TABLE relationship_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read access to relationship config" ON relationship_config
  FOR SELECT
  USING (true);
