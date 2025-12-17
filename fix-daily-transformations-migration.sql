-- Migration to ensure daily_transformations table exists
-- This script handles both cases:
-- 1. If daily_products exists, rename it to daily_transformations
-- 2. If neither exists, create daily_transformations from scratch
-- Run this in your Supabase SQL Editor

-- Step 1: Check if daily_products exists and rename it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'daily_products'
  ) THEN
    -- Rename daily_products to daily_transformations
    ALTER TABLE daily_products RENAME TO daily_transformations;
    
    -- Drop old index if exists
    DROP INDEX IF EXISTS idx_daily_products_date;
    
    -- Create new index
    CREATE INDEX IF NOT EXISTS idx_daily_transformations_date ON daily_transformations(date);
    
    -- Drop old policy if exists
    DROP POLICY IF EXISTS "Allow all operations on daily_products" ON daily_transformations;
    
    RAISE NOTICE 'Table daily_products renamed to daily_transformations';
  END IF;
END $$;

-- Step 2: Create daily_transformations if it doesn't exist
CREATE TABLE IF NOT EXISTS daily_transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  dollar_rate NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  withdraw NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_transformations_date ON daily_transformations(date);

-- Enable Row Level Security
ALTER TABLE daily_transformations ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Allow all operations on daily_transformations" ON daily_transformations;

-- Create policy for daily_transformations
CREATE POLICY "Allow all operations on daily_transformations" ON daily_transformations
  FOR ALL USING (true) WITH CHECK (true);

