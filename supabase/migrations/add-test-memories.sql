-- Add test memories across multiple years for testing the All Memories page year scrubber
-- This creates memories for 2024, 2025, and 2026

-- 2026 memories (current year based on relationship start date)
INSERT INTO memories (title, date, description, category, location, created_by) VALUES
  ('Our first date', '2026-05-21', 'The day we first met and fell in love', 'first', 'Coffee Shop', 'Anu'),
  ('Summer beach trip', '2026-07-15', 'Amazing weekend at the beach', 'trip', 'Goa', 'Aswin'),
  ('Surprise birthday gift', '2026-08-20', 'Got you that special gift you always wanted', 'gift', 'Home', 'Aswin');

-- 2025 memories
INSERT INTO memories (title, date, description, category, location, created_by) VALUES
  ('Cherry blossoms in Leh', '2025-04-18', 'Beautiful cherry blossom season in the mountains', 'trip', 'Leh', 'Aswin'),
  ('Dinner in the city', '2025-03-02', 'Romantic dinner at our favorite restaurant', 'moment', 'Mumbai', 'Aswin'),
  ('Weekend in the hills', '2025-02-09', 'Cozy weekend getaway in the hills', 'special_day', 'Shimla', 'Anu'),
  ('Anniversary celebration', '2025-05-21', 'Celebrating our love', 'celebration', 'Home', 'Anu'),
  ('Christmas together', '2025-12-25', 'First Christmas as a couple', 'celebration', 'Home', 'Aswin');

-- 2024 memories
INSERT INTO memories (title, date, description, category, location, created_by) VALUES
  ('New Year countdown', '2024-12-31', 'Watching fireworks together', 'special_day', 'Marine Drive', 'Anu'),
  ('Surprise birthday party', '2024-08-14', 'Threw a surprise party for your birthday', 'gift', 'Home', 'Aswin'),
  ('Road trip adventure', '2024-10-10', 'Epic road trip across the state', 'trip', 'Karnataka', 'Aswin'),
  ('Movie marathon night', '2024-06-15', 'Watched all our favorite movies together', 'moment', 'Home', 'Anu');

-- Note: Run this SQL in your Supabase SQL Editor to add test data
