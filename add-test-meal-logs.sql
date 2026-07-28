-- =====================================================
-- Add test meal logs for visualizing different scenarios
-- =====================================================

DO $$
DECLARE
  anu_user_id UUID;
  challenge_id UUID;
BEGIN
  -- Get Anu's user ID
  SELECT id INTO anu_user_id FROM users WHERE name = 'Anu' LIMIT 1;

  -- Get the challenge ID
  SELECT id INTO challenge_id FROM challenges WHERE title = 'Anu''s 3-Day Meal Challenge' LIMIT 1;

  -- Insert test meal logs with different scenarios

  -- Day 1 (July 16): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Oats with berries', '2026-07-16', '08:30', 'Healthy start to the challenge!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Grilled chicken salad', '2026-07-16', '13:00', 'Fresh and filling', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Salmon with vegetables', '2026-07-16', '19:30', 'Perfect end to day 1', anu_user_id, anu_user_id);

  -- Day 2 (July 17): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Eggs and toast', '2026-07-17', '09:00', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Quinoa bowl', '2026-07-17', '12:45', 'So delicious!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Chicken stir-fry', '2026-07-17', '20:00', NULL, anu_user_id, anu_user_id);

  -- Day 3 (July 18): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Smoothie bowl', '2026-07-18', '08:15', 'Refreshing!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Turkey sandwich', '2026-07-18', '13:30', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Pasta primavera', '2026-07-18', '19:00', 'Yummy comfort food', anu_user_id, anu_user_id);

  -- Day 4 (July 19): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Pancakes with syrup', '2026-07-19', '09:30', 'Weekend treat!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Greek salad', '2026-07-19', '13:00', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'BBQ chicken', '2026-07-19', '19:45', 'Grilled to perfection', anu_user_id, anu_user_id);

  -- Day 5 (July 20): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'French toast', '2026-07-20', '08:45', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Sushi rolls', '2026-07-20', '12:30', 'Love sushi!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Vegetable curry', '2026-07-20', '20:15', 'Spicy and delicious', anu_user_id, anu_user_id);

  -- Day 6 (July 21): Only 2 meals (partial day - streak breaks here)
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Cereal', '2026-07-21', '09:00', 'Quick breakfast', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Sandwich', '2026-07-21', '13:15', NULL, anu_user_id, anu_user_id);
  -- Missing dinner on day 6

  -- Day 7 (July 22): All 3 meals logged (new streak starts)
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Avocado toast', '2026-07-22', '08:30', 'Back on track!', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Chicken wrap', '2026-07-22', '12:45', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Fish tacos', '2026-07-22', '19:30', 'Taco Tuesday!', anu_user_id, anu_user_id);

  -- Day 8 (July 23): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Yogurt parfait', '2026-07-23', '09:15', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Caesar salad', '2026-07-23', '13:00', 'Classic favorite', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Beef stew', '2026-07-23', '20:00', 'Hearty meal', anu_user_id, anu_user_id);

  -- Day 9 (July 24): Only 1 meal (partial day)
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Coffee and croissant', '2026-07-24', '10:00', anu_user_id, anu_user_id);
  -- Missing lunch and dinner on day 9

  -- Day 10 (July 25): All 3 meals logged (new streak)
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Bagel with cream cheese', '2026-07-25', '08:45', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Poke bowl', '2026-07-25', '12:30', 'Fresh and tasty', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Lamb chops', '2026-07-25', '19:45', NULL, anu_user_id, anu_user_id);

  -- Day 11 (July 26): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Protein shake', '2026-07-26', '08:00', 'Post-workout', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Burrito bowl', '2026-07-26', '13:15', NULL, anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Margherita pizza', '2026-07-26', '20:30', 'Cheat day!', anu_user_id, anu_user_id);

  -- Day 12 (July 27): All 3 meals logged
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Waffles', '2026-07-27', '09:30', 'Sunday brunch', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'lunch', 'Caprese salad', '2026-07-27', '13:00', 'Light and fresh', anu_user_id, anu_user_id),
    (challenge_id, anu_user_id, 'dinner', 'Roast chicken', '2026-07-27', '19:00', 'Classic Sunday dinner', anu_user_id, anu_user_id);

  -- Day 13 (July 28 - TODAY): Only breakfast so far
  INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
  VALUES
    (challenge_id, anu_user_id, 'breakfast', 'Acai bowl', '2026-07-28', '08:30', 'Energizing breakfast', anu_user_id, anu_user_id);
  -- Lunch and dinner not yet logged (showing today's incomplete status)

END $$;

-- =====================================================
-- Test data added successfully!
-- =====================================================
-- This data includes:
-- - Days 1-5: Perfect streak (all 3 meals each day)
-- - Day 6: Partial (2/3 meals - breaks streak)
-- - Days 7-8: New streak (all 3 meals)
-- - Day 9: Partial (1/3 meals - breaks streak)
-- - Days 10-12: New streak (all 3 meals)
-- - Day 13 (TODAY): Only breakfast logged
--
-- Current expected streak: 4 days (July 25-28, but today incomplete)
-- Calendar should show:
-- - Orange dots for days 1-5, 7-8, 10-12
-- - Yellow partial indicators for days 6 (2/3) and 9 (1/3)
-- - Today indicator for day 13 with breakfast logged
-- =====================================================
