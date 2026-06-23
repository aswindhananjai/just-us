-- Migration to add sort_order column to memories table
-- Run this in your Supabase SQL Editor

ALTER TABLE memories
ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;
