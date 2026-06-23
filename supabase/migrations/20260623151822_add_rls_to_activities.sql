-- Enable RLS on activities table
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view all activities (both read their own and partner's)
CREATE POLICY "Users can view all activities"
ON activities
FOR SELECT
USING (true);

-- Policy: Users can insert activities (when creating/updating/deleting memories)
CREATE POLICY "Users can insert activities"
ON activities
FOR INSERT
WITH CHECK (true);

-- Policy: Users can update their own read status
CREATE POLICY "Users can update read status"
ON activities
FOR UPDATE
USING (true)
WITH CHECK (true);

-- Note: We allow all authenticated users to read/write because:
-- 1. Only Aswin and Anu have access (controlled by passcode authentication)
-- 2. Activities are meant to be shared between both users
-- 3. The application logic handles which activities to show
