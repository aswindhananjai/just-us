#!/usr/bin/env node

/**
 * Script to apply FCM token migration to Supabase
 * Run with: node apply-fcm-migration.mjs
 */

console.log('🔄 FCM Token Migration\n');
console.log('The fcm_token column needs to be added to your Supabase users table.\n');
console.log('Please follow these steps:\n');
console.log('1. Go to: https://supabase.com/dashboard/project/uaahpmiitvoycuwsdsws/sql');
console.log('2. Click "New Query"');
console.log('3. Paste the following SQL:\n');
console.log('─'.repeat(70));
console.log(`
-- Add fcm_token column to users table
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
`);
console.log('─'.repeat(70));
console.log('\n4. Click "Run"');
console.log('5. Refresh your app and check Settings > Notifications\n');
console.log('✅ After running this, FCM tokens will be saved to the database!');
