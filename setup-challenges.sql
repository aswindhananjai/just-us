-- =====================================================
-- Just Us - Challenges Feature Database Setup Script
-- =====================================================
-- Run this script in your Supabase SQL Editor
-- =====================================================

-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  duration_days INTEGER NOT NULL,
  start_date DATE NOT NULL,
  participant_id UUID REFERENCES users(id),
  participant_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_logs table
CREATE TABLE IF NOT EXISTS meal_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES challenges(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  meal_type TEXT NOT NULL CHECK (meal_type IN ('breakfast', 'lunch', 'dinner')),
  meal_name TEXT NOT NULL,
  photo_url TEXT,
  log_date DATE NOT NULL,
  log_time TIME NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_challenges_status ON challenges(status);
CREATE INDEX IF NOT EXISTS idx_challenges_participant ON challenges(participant_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_challenge ON meal_logs(challenge_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_user ON meal_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_meal_logs_date ON meal_logs(log_date DESC);

-- Add RLS policies for challenges table
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all challenges" ON challenges;
CREATE POLICY "Allow read access to all challenges" ON challenges
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert challenges" ON challenges;
CREATE POLICY "Allow insert challenges" ON challenges
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update challenges" ON challenges;
CREATE POLICY "Allow update challenges" ON challenges
  FOR UPDATE
  USING (true);

-- Add RLS policies for meal_logs table
ALTER TABLE meal_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow read access to all meal logs" ON meal_logs;
CREATE POLICY "Allow read access to all meal logs" ON meal_logs
  FOR SELECT
  USING (true);

DROP POLICY IF EXISTS "Allow insert meal logs" ON meal_logs;
CREATE POLICY "Allow insert meal logs" ON meal_logs
  FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow update meal logs" ON meal_logs;
CREATE POLICY "Allow update meal logs" ON meal_logs
  FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Allow delete meal logs" ON meal_logs;
CREATE POLICY "Allow delete meal logs" ON meal_logs
  FOR DELETE
  USING (true);

-- Insert Anu's 3-Day Meal Challenge (if not exists)
INSERT INTO challenges (title, description, duration_days, start_date, participant_name, status)
SELECT
  'Anu''s 3-Day Meal Challenge',
  'Log breakfast, lunch & dinner every day for 30 days',
  30,
  '2026-07-16',
  'Anu',
  'active'
WHERE NOT EXISTS (
  SELECT 1 FROM challenges WHERE title = 'Anu''s 3-Day Meal Challenge'
);

-- =====================================================
-- Success! Your challenges feature is now ready to use!
-- =====================================================
-- You can now:
-- 1. View challenges on the home page
-- 2. Log meals with photos
-- 3. Track your 30-day progress
-- 4. View your meal history
-- =====================================================
