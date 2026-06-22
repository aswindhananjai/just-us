#!/usr/bin/env node

/**
 * Script to apply FCM token migration to Supabase
 * Run with: node apply-fcm-migration.js
 */

import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('🔄 Applying FCM token migration...\n');

  try {
    // Step 1: Add fcm_token column
    console.log('Step 1: Adding fcm_token column...');
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;'
    });

    if (alterError) {
      console.log('⚠️  Could not add column via RPC (expected)');
      console.log('📋 Please run this SQL in Supabase Dashboard SQL Editor:\n');
      console.log('-- Add fcm_token column');
      console.log('ALTER TABLE users ADD COLUMN IF NOT EXISTS fcm_token TEXT;\n');
      console.log('-- Create index');
      console.log('CREATE INDEX IF NOT EXISTS idx_users_fcm_token ON users(fcm_token);\n');
      console.log('-- Add updated_at trigger');
      console.log('CREATE OR REPLACE FUNCTION update_updated_at_column()');
      console.log('RETURNS TRIGGER AS $$');
      console.log('BEGIN');
      console.log('    NEW.updated_at = NOW();');
      console.log('    RETURN NEW;');
      console.log('END;');
      console.log("$$ language 'plpgsql';\n");
      console.log('DROP TRIGGER IF EXISTS update_users_updated_at ON users;');
      console.log('CREATE TRIGGER update_users_updated_at');
      console.log('    BEFORE UPDATE ON users');
      console.log('    FOR EACH ROW');
      console.log('    EXECUTE FUNCTION update_updated_at_column();\n');
      console.log('🔗 Go to: https://supabase.com/dashboard/project/uaahpmiitvoycuwsdsws/sql\n');
      return;
    }

    console.log('✅ Migration applied successfully!\n');

    // Verify the column exists
    console.log('Step 2: Verifying column...');
    const { data, error } = await supabase.from('users').select('name, fcm_token').limit(1);

    if (error) {
      console.error('❌ Verification failed:', error.message);
    } else {
      console.log('✅ Column verified successfully!');
      console.log('📊 Sample data:', data);
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n📋 Please apply the migration manually via Supabase Dashboard');
    console.log('🔗 https://supabase.com/dashboard/project/uaahpmiitvoycuwsdsws/sql');
  }
}

applyMigration();
