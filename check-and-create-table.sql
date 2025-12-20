-- Quick check and create script for daily_transformations table
-- Run this in Supabase SQL Editor

-- First, check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('daily_products', 'daily_transformations')
ORDER BY table_name;

-- If daily_products exists, rename it
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'daily_products'
  ) THEN
    ALTER TABLE daily_products RENAME TO daily_transformations;
    RAISE NOTICE 'Renamed daily_products to daily_transformations';
  END IF;
END $$;

-- Create the table if it doesn't exist (with all required columns)
CREATE TABLE IF NOT EXISTS public.daily_transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  dollar_rate NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  withdraw NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_daily_transformations_date ON public.daily_transformations(date);

-- Enable RLS
ALTER TABLE public.daily_transformations ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy
DROP POLICY IF EXISTS "Allow all operations on daily_transformations" ON public.daily_transformations;

CREATE POLICY "Allow all operations on daily_transformations" ON public.daily_transformations
  FOR ALL USING (true) WITH CHECK (true);

-- Verify the table was created
SELECT 
  table_name,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'daily_transformations'
ORDER BY ordinal_position;





