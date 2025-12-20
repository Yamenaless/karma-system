-- Create company_brands table
CREATE TABLE IF NOT EXISTS company_brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on name for faster queries
CREATE INDEX IF NOT EXISTS idx_company_brands_name ON company_brands(name);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_company_brands_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_company_brands_updated_at
  BEFORE UPDATE ON company_brands
  FOR EACH ROW
  EXECUTE FUNCTION update_company_brands_updated_at();

-- Insert company brands
INSERT INTO company_brands (name) VALUES
  ('LINK'),
  ('SOFFANY'),
  ('NEXER'),
  ('SAMSUNG'),
  ('XIAOMI'),
  ('TORIMA'),
  ('CARBON'),
  ('SYROX')
ON CONFLICT (name) DO NOTHING;

-- Update inventory_products table to use company_brand_id instead of company_brand text
-- First, add the new column
ALTER TABLE inventory_products 
ADD COLUMN IF NOT EXISTS company_brand_id UUID REFERENCES company_brands(id) ON DELETE SET NULL;

-- Create index for company_brand_id
CREATE INDEX IF NOT EXISTS idx_inventory_products_company_brand_id ON inventory_products(company_brand_id);

-- Migrate existing data (if any) - match by name
UPDATE inventory_products ip
SET company_brand_id = cb.id
FROM company_brands cb
WHERE ip.company_brand = cb.name
AND ip.company_brand_id IS NULL;

-- After migration, you can optionally drop the old company_brand column
-- Uncomment the line below if you want to remove the old text column
-- ALTER TABLE inventory_products DROP COLUMN IF EXISTS company_brand;

