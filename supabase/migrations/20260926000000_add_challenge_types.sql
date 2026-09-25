-- Add challenge_type field to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS challenge_type TEXT NOT NULL DEFAULT 'meal'
CHECK (challenge_type IN ('meal', 'exercise', 'fruit'));

-- Rename meal_logs table to challenge_logs to be more generic
ALTER TABLE meal_logs RENAME TO challenge_logs;

-- Add new columns to challenge_logs for exercise and fruit challenges
ALTER TABLE challenge_logs
ADD COLUMN IF NOT EXISTS log_type TEXT,
ADD COLUMN IF NOT EXISTS activity_type TEXT,  -- for exercise: walk, run, gym, yoga, cycle
ADD COLUMN IF NOT EXISTS duration TEXT,        -- for exercise: duration of workout
ADD COLUMN IF NOT EXISTS fruit_name TEXT;       -- for fruit: apple, banana, etc.

-- Update the meal_type constraint to be optional and add log_type
ALTER TABLE challenge_logs
DROP CONSTRAINT IF EXISTS challenge_logs_meal_type_check;

ALTER TABLE challenge_logs
ADD CONSTRAINT challenge_logs_log_type_check
CHECK (log_type IN ('meal', 'exercise', 'fruit'));

-- Migrate existing data: set log_type to 'meal' for all existing logs
UPDATE challenge_logs SET log_type = 'meal' WHERE log_type IS NULL;

-- Make log_type NOT NULL after migration
ALTER TABLE challenge_logs
ALTER COLUMN log_type SET NOT NULL;

-- Make meal_type optional (NULL for exercise/fruit logs)
ALTER TABLE challenge_logs
ALTER COLUMN meal_type DROP NOT NULL;

-- Update existing meal challenge to have challenge_type = 'meal'
UPDATE challenges SET challenge_type = 'meal' WHERE challenge_type IS NULL OR challenge_type = 'meal';

-- Insert Exercise Challenge
INSERT INTO challenges (title, description, duration_days, start_date, participant_name, status, challenge_type)
VALUES (
  '30-Day Exercise Challenge',
  'Work out once every day',
  30,
  '2026-09-26',
  'Aswin',
  'active',
  'exercise'
)
ON CONFLICT DO NOTHING;

-- Insert Fruit Challenge
INSERT INTO challenges (title, description, duration_days, start_date, participant_name, status, challenge_type)
VALUES (
  '30-Day Fruit Challenge',
  'Eat one fruit every day',
  30,
  '2026-09-26',
  'Anu',
  'active',
  'fruit'
)
ON CONFLICT DO NOTHING;
