-- Migration to remove daily_paraniz table
-- Run this migration in your Supabase SQL Editor

-- Drop the daily_paraniz table if it exists
DROP TABLE IF EXISTS daily_paraniz CASCADE;

-- Note: CASCADE will also drop any dependent objects like indexes, constraints, etc.

