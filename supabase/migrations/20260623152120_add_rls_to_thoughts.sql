-- Enable RLS on thoughts table
ALTER TABLE thoughts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all thoughts (to show partner's thoughts randomly)
CREATE POLICY "Users can view all thoughts"
ON thoughts
FOR SELECT
USING (true);

-- Policy: Users can insert their own thoughts
CREATE POLICY "Users can insert own thoughts"
ON thoughts
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own thoughts
CREATE POLICY "Users can update own thoughts"
ON thoughts
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Policy: Users can delete their own thoughts
CREATE POLICY "Users can delete own thoughts"
ON thoughts
FOR DELETE
USING (true);

-- Note: We allow all authenticated users to read/write because:
-- 1. Only Aswin and Anu have access (controlled by passcode authentication)
-- 2. Thoughts need to be readable by partner to show random thoughts
-- 3. The application logic ensures users only edit/delete their own thoughts
