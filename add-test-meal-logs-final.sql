-- =====================================================
-- Add test meal logs with hardcoded IDs
-- =====================================================
-- Anu's user ID: 0826a6c6-8db2-489d-8336-4d5ce74cb630
-- Challenge ID: 226a652c-11a0-410c-9220-0aeabb3400cf
-- =====================================================

-- Day 1 (July 16): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Oats with berries', '2026-07-16', '08:30', 'Healthy start to the challenge!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Grilled chicken salad', '2026-07-16', '13:00', 'Fresh and filling', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Salmon with vegetables', '2026-07-16', '19:30', 'Perfect end to day 1', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 2 (July 17): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Eggs and toast', '2026-07-17', '09:00', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Quinoa bowl', '2026-07-17', '12:45', 'So delicious!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Chicken stir-fry', '2026-07-17', '20:00', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 3 (July 18): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Smoothie bowl', '2026-07-18', '08:15', 'Refreshing!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Turkey sandwich', '2026-07-18', '13:30', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Pasta primavera', '2026-07-18', '19:00', 'Yummy comfort food', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 4 (July 19): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Pancakes with syrup', '2026-07-19', '09:30', 'Weekend treat!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Greek salad', '2026-07-19', '13:00', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'BBQ chicken', '2026-07-19', '19:45', 'Grilled to perfection', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 5 (July 20): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'French toast', '2026-07-20', '08:45', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Sushi rolls', '2026-07-20', '12:30', 'Love sushi!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Vegetable curry', '2026-07-20', '20:15', 'Spicy and delicious', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 6 (July 21): Only 2 meals (partial day - streak breaks here)
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Cereal', '2026-07-21', '09:00', 'Quick breakfast', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Sandwich', '2026-07-21', '13:15', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');
-- Missing dinner on day 6

-- Day 7 (July 22): All 3 meals logged (new streak starts)
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Avocado toast', '2026-07-22', '08:30', 'Back on track!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Chicken wrap', '2026-07-22', '12:45', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Fish tacos', '2026-07-22', '19:30', 'Taco Tuesday!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 8 (July 23): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Yogurt parfait', '2026-07-23', '09:15', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Caesar salad', '2026-07-23', '13:00', 'Classic favorite', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Beef stew', '2026-07-23', '20:00', 'Hearty meal', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 9 (July 24): Only 1 meal (partial day)
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Coffee and croissant', '2026-07-24', '10:00', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');
-- Missing lunch and dinner on day 9

-- Day 10 (July 25): All 3 meals logged (new streak)
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Bagel with cream cheese', '2026-07-25', '08:45', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Poke bowl', '2026-07-25', '12:30', 'Fresh and tasty', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Lamb chops', '2026-07-25', '19:45', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 11 (July 26): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Protein shake', '2026-07-26', '08:00', 'Post-workout', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Burrito bowl', '2026-07-26', '13:15', NULL, '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Margherita pizza', '2026-07-26', '20:30', 'Cheat day!', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 12 (July 27): All 3 meals logged
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Waffles', '2026-07-27', '09:30', 'Sunday brunch', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'lunch', 'Caprese salad', '2026-07-27', '13:00', 'Light and fresh', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630'),
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'dinner', 'Roast chicken', '2026-07-27', '19:00', 'Classic Sunday dinner', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');

-- Day 13 (July 28 - TODAY): Only breakfast so far
INSERT INTO meal_logs (challenge_id, user_id, meal_type, meal_name, log_date, log_time, note, created_by, updated_by)
VALUES
  ('226a652c-11a0-410c-9220-0aeabb3400cf', '0826a6c6-8db2-489d-8336-4d5ce74cb630', 'breakfast', 'Acai bowl', '2026-07-28', '08:30', 'Energizing breakfast', '0826a6c6-8db2-489d-8336-4d5ce74cb630', '0826a6c6-8db2-489d-8336-4d5ce74cb630');
-- Lunch and dinner not yet logged (showing today's incomplete status)

-- =====================================================
-- Success! Test data added!
-- =====================================================
-- Test data includes:
-- - Days 1-5: Perfect streak (all 3 meals each day) ✓
-- - Day 6: Partial (2/3 meals - breaks streak) 🟡
-- - Days 7-8: New streak (all 3 meals) ✓
-- - Day 9: Partial (1/3 meals - breaks streak) 🟡
-- - Days 10-12: New streak (all 3 meals) ✓
-- - Day 13 (TODAY): Only breakfast logged 🔥
--
-- Expected streak: 3 days (July 26-28)
-- Note: Today only has breakfast, so actual complete streak is 2 days
-- =====================================================
