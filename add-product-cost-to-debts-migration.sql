-- Migration to add product_cost column to debts table
-- Run this migration in your Supabase SQL Editor

-- Add product_cost column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'debts' AND column_name = 'product_cost'
  ) THEN
    ALTER TABLE debts ADD COLUMN product_cost NUMERIC NOT NULL DEFAULT 0;
  END IF;
END $$;

