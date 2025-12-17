-- Migration to rename daily_products to daily_transformations
-- and create karma_products and products_types tables
-- Run this migration in your Supabase SQL Editor

-- Step 1: Rename daily_products table to daily_transformations
ALTER TABLE IF EXISTS daily_products RENAME TO daily_transformations;

-- Step 2: Rename the index
DROP INDEX IF EXISTS idx_daily_products_date;
CREATE INDEX IF NOT EXISTS idx_daily_transformations_date ON daily_transformations(date);

-- Step 3: Drop old policy and create new one for daily_transformations
-- After renaming the table, drop the old policy (if it exists) and create a new one
DROP POLICY IF EXISTS "Allow all operations on daily_products" ON daily_transformations;

CREATE POLICY "Allow all operations on daily_transformations" ON daily_transformations
  FOR ALL USING (true) WITH CHECK (true);

-- Step 4: Create products_types table (for managing types from frontend)
CREATE TABLE IF NOT EXISTS products_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert initial product types
INSERT INTO products_types (name) VALUES
  ('USB'),
  ('MICRO'),
  ('TYPEC'),
  ('LIGHTIN_TO_TYPEC'),
  ('TYPEC_TO_TYPEC')
ON CONFLICT (name) DO NOTHING;

-- Create index on products_types name for faster lookups
CREATE INDEX IF NOT EXISTS idx_products_types_name ON products_types(name);

-- Step 5: Create karma_products table
CREATE TABLE IF NOT EXISTS karma_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  product_cost NUMERIC NOT NULL,
  code TEXT NOT NULL,
  type_id UUID NOT NULL REFERENCES products_types(id) ON DELETE RESTRICT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_code UNIQUE(code)
);

-- Create indexes for karma_products
CREATE INDEX IF NOT EXISTS idx_karma_products_code ON karma_products(code);
CREATE INDEX IF NOT EXISTS idx_karma_products_type_id ON karma_products(type_id);
CREATE INDEX IF NOT EXISTS idx_karma_products_name ON karma_products(name);

-- Enable Row Level Security
ALTER TABLE products_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_products ENABLE ROW LEVEL SECURITY;

-- Create policies for products_types
CREATE POLICY "Allow all operations on products_types" ON products_types
  FOR ALL USING (true) WITH CHECK (true);

-- Create policies for karma_products
CREATE POLICY "Allow all operations on karma_products" ON karma_products
  FOR ALL USING (true) WITH CHECK (true);
