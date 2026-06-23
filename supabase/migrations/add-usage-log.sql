-- Usage log table: tracks per-user, per-day app usage (passcode entries)
CREATE TABLE IF NOT EXISTS usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_name TEXT NOT NULL,
  date DATE NOT NULL,
  login_count INTEGER NOT NULL DEFAULT 1,
  last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_name, date)
);

-- Index for fast lookups by user and date
CREATE INDEX IF NOT EXISTS idx_usage_log_user_date ON usage_log(user_name, date DESC);

-- Enable Row Level Security
ALTER TABLE usage_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on usage_log" ON usage_log
  FOR ALL USING (true) WITH CHECK (true);

-- Atomic upsert function: increments count if row exists for today, inserts new row otherwise
-- p_date is passed from client so it uses local date (IST), not UTC server date
CREATE OR REPLACE FUNCTION log_app_usage(p_user_name TEXT, p_date DATE)
RETURNS void AS $$
BEGIN
  INSERT INTO usage_log (user_name, date, login_count, last_seen_at)
  VALUES (p_user_name, p_date, 1, NOW())
  ON CONFLICT (user_name, date)
  DO UPDATE SET
    login_count = usage_log.login_count + 1,
    last_seen_at = NOW();
END;
$$ LANGUAGE plpgsql;
