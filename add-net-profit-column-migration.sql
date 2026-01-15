-- Migration to add is_net_profit column to daily_transformations table
-- Run this migration in your Supabase SQL Editor

-- Add is_net_profit column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_transformations' AND column_name = 'is_net_profit'
  ) THEN
    ALTER TABLE daily_transformations 
    ADD COLUMN is_net_profit BOOLEAN NOT NULL DEFAULT false;
    
    RAISE NOTICE 'Added is_net_profit column to daily_transformations table';
  ELSE
    RAISE NOTICE 'Column is_net_profit already exists in daily_transformations table';
  END IF;
END $$;

-- Create index on is_net_profit for faster filtering
CREATE INDEX IF NOT EXISTS idx_daily_transformations_is_net_profit 
ON daily_transformations(is_net_profit);

