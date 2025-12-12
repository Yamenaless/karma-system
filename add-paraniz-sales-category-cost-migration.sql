-- Migration to add category and cost columns to daily_paraniz_sales table
-- Run this migration in your Supabase SQL Editor

-- Add category column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_paraniz_sales' AND column_name = 'category'
  ) THEN
    ALTER TABLE daily_paraniz_sales ADD COLUMN category TEXT DEFAULT 'FATURA' CHECK (category IN ('FATURA', 'KONTOR'));
  END IF;
END $$;

-- Add cost column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_paraniz_sales' AND column_name = 'cost'
  ) THEN
    ALTER TABLE daily_paraniz_sales ADD COLUMN cost NUMERIC NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Update existing rows to have default category if null
UPDATE daily_paraniz_sales SET category = 'FATURA' WHERE category IS NULL;

