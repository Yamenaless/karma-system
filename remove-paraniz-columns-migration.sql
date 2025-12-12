-- Migration to remove paraniz_kontor and paraniz_fatura columns from daily_products table
-- Run this migration in your Supabase SQL Editor

-- Remove paraniz_kontor column
ALTER TABLE daily_products 
DROP COLUMN IF EXISTS paraniz_kontor;

-- Remove paraniz_fatura column
ALTER TABLE daily_products 
DROP COLUMN IF EXISTS paraniz_fatura;

