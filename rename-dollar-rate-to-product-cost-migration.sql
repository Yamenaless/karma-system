-- Migration to rename dollar_rate column to product_cost in daily_transformations table
-- Run this migration in your Supabase SQL Editor

DO $$
BEGIN
  -- Rename dollar_rate column to product_cost if it exists
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'daily_transformations' AND column_name = 'dollar_rate'
  ) THEN
    ALTER TABLE daily_transformations RENAME COLUMN dollar_rate TO product_cost;
    RAISE NOTICE 'Renamed column dollar_rate to product_cost in daily_transformations table.';
  ELSE
    RAISE NOTICE 'Column dollar_rate does not exist in daily_transformations table.';
  END IF;
END $$;

