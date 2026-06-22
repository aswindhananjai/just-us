-- Just us - Supabase Database Schema
-- Run this in your Supabase SQL Editor

-- Settings table (stores app configuration)
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  passcode_hash TEXT NOT NULL,
  partner_one_name TEXT DEFAULT 'Aswin',
  partner_two_name TEXT DEFAULT 'Anu',
  relationship_start_date DATE NOT NULL,
  cover_photo_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Memories table
CREATE TABLE IF NOT EXISTS memories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('first', 'milestone', 'trip', 'gift', 'moment', 'quote', 'celebration', 'special_day')),
  location TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster date-based queries
CREATE INDEX IF NOT EXISTS idx_memories_date ON memories(date DESC);
CREATE INDEX IF NOT EXISTS idx_memories_category ON memories(category);

-- Enable Row Level Security (RLS)
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE memories ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now since it's a private app)
-- In production, you'd want to add proper authentication
CREATE POLICY "Allow all operations on settings" ON settings
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on memories" ON memories
  FOR ALL USING (true) WITH CHECK (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memories_updated_at BEFORE UPDATE ON memories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default settings (you'll update this on first launch)
INSERT INTO settings (passcode_hash, relationship_start_date)
VALUES ('temp', '2023-01-01')
ON CONFLICT DO NOTHING;
