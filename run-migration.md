# Run FCM Token Migration

The `fcm_token` column needs to be added to the `users` table in Supabase.

## Option 1: Via Supabase Dashboard (Easiest)

1. Go to https://supabase.com/dashboard/project/uaahpmiitvoycuwsdsws/sql
2. Click "New Query"
3. Paste the following SQL:

```sql
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
```

4. Click "Run"
5. Verify the column was added by running: `SELECT * FROM users;`

## Option 2: Via Supabase CLI

```bash
# Link to your project (if not already linked)
npx supabase link --project-ref uaahpmiitvoycuwsdsws

# Push the migration
npx supabase db push
```

After running the migration, refresh the Settings page and the notification status should load properly!
