-- =====================================================
-- Add created_by and updated_by audit fields
-- =====================================================

-- Add created_by and updated_by to challenges table
ALTER TABLE challenges
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id);

-- Add created_by and updated_by to meal_logs table
ALTER TABLE meal_logs
ADD COLUMN created_by UUID REFERENCES users(id),
ADD COLUMN updated_by UUID REFERENCES users(id);

-- Get Anu's user ID and prefill existing records
DO $$
DECLARE
  anu_user_id UUID;
BEGIN
  -- Get Anu's user ID
  SELECT id INTO anu_user_id FROM users WHERE name = 'Anu' LIMIT 1;

  -- Update existing challenges with Anu's ID
  UPDATE challenges
  SET created_by = anu_user_id,
      updated_by = anu_user_id
  WHERE created_by IS NULL;

  -- Update existing meal_logs with Anu's ID
  UPDATE meal_logs
  SET created_by = anu_user_id,
      updated_by = anu_user_id
  WHERE created_by IS NULL;
END $$;

-- =====================================================
-- Success! Audit fields added to both tables
-- =====================================================
