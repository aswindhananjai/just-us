-- Migration to add user tracking columns to memories table
-- Run this in your Supabase SQL Editor

-- Add created_by column
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS created_by TEXT DEFAULT 'Aswin';

-- Add updated_by column
ALTER TABLE memories
ADD COLUMN IF NOT EXISTS updated_by TEXT DEFAULT 'Aswin';

-- Update existing rows to have default values
UPDATE memories
SET created_by = 'Aswin', updated_by = 'Aswin'
WHERE created_by IS NULL OR updated_by IS NULL;
