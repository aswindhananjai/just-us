-- Add created_by and updated_by to challenges table
ALTER TABLE challenges
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);

-- Add created_by and updated_by to meal_logs table
ALTER TABLE meal_logs
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES users(id),
ADD COLUMN IF NOT EXISTS updated_by UUID REFERENCES users(id);
