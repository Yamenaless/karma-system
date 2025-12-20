-- Add price field to inventory_products table
-- Run this migration in Supabase SQL Editor

ALTER TABLE inventory_products 
ADD COLUMN IF NOT EXISTS price NUMERIC NOT NULL DEFAULT 0;

-- Create index for price field
CREATE INDEX IF NOT EXISTS idx_inventory_products_price ON inventory_products(price);

