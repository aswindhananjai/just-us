-- Add is_active column to memories table for soft delete functionality
ALTER TABLE memories ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;

-- Create an index for faster filtering of active memories
CREATE INDEX IF NOT EXISTS idx_memories_is_active ON memories(is_active);

-- Update existing records to be active
UPDATE memories SET is_active = TRUE WHERE is_active IS NULL;
