-- Migration to add subscription_number column to daily_paraniz_sales table
-- Run this migration in your Supabase SQL Editor

-- Add subscription_number column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_paraniz_sales' AND column_name = 'subscription_number'
  ) THEN
    ALTER TABLE daily_paraniz_sales ADD COLUMN subscription_number TEXT;
  END IF;
END $$;

