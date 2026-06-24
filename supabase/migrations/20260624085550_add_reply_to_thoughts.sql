-- Add reply fields to thoughts table
ALTER TABLE thoughts
ADD COLUMN reply TEXT,
ADD COLUMN reply_at TIMESTAMP WITH TIME ZONE;

-- Create index on reply_at for better query performance
CREATE INDEX idx_thoughts_reply_at ON thoughts(reply_at);
