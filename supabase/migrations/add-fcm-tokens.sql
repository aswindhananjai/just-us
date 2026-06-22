-- Add fcm_token column to users table to store Firebase Cloud Messaging tokens
ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);

-- Add updated_at trigger if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for users table
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
