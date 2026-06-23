-- Create activities table for tracking in-app notifications
CREATE TABLE IF NOT EXISTS activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  memory_id UUID REFERENCES memories(id) ON DELETE CASCADE,
  action_type TEXT NOT NULL CHECK (action_type IN ('created', 'updated', 'deleted')),
  action_by TEXT NOT NULL CHECK (action_by IN ('Aswin', 'Anu')),
  memory_title TEXT NOT NULL,
  memory_icon TEXT, -- Category icon for display
  read_by_aswin BOOLEAN DEFAULT FALSE,
  read_by_anu BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activities_memory_id ON activities(memory_id);
CREATE INDEX IF NOT EXISTS idx_activities_read_status ON activities(read_by_aswin, read_by_anu);
