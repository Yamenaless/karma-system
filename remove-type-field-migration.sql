-- Remove type field from inventory_products table
-- Run this migration in Supabase SQL Editor

ALTER TABLE inventory_products 
DROP COLUMN IF EXISTS type;

-- Drop index if it exists
DROP INDEX IF EXISTS idx_inventory_products_type;

