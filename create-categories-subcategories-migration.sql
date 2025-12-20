-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT unique_subcategory_per_category UNIQUE(name, category_id)
);

-- Create products table (new one, not using existing)
CREATE TABLE IF NOT EXISTS inventory_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  code TEXT NOT NULL UNIQUE,
  quantity NUMERIC NOT NULL DEFAULT 0,
  product_cost NUMERIC NOT NULL DEFAULT 0,
  image TEXT,
  company_brand TEXT,
  type TEXT,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  subcategory_id UUID REFERENCES subcategories(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_categories_name ON categories(name);
CREATE INDEX IF NOT EXISTS idx_subcategories_category_id ON subcategories(category_id);
CREATE INDEX IF NOT EXISTS idx_subcategories_name ON subcategories(name);
CREATE INDEX IF NOT EXISTS idx_inventory_products_code ON inventory_products(code);
CREATE INDEX IF NOT EXISTS idx_inventory_products_name ON inventory_products(name);
CREATE INDEX IF NOT EXISTS idx_inventory_products_category_id ON inventory_products(category_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_subcategory_id ON inventory_products(subcategory_id);
CREATE INDEX IF NOT EXISTS idx_inventory_products_company_brand ON inventory_products(company_brand);

-- Create updated_at trigger functions
CREATE OR REPLACE FUNCTION update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_subcategories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_inventory_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers to automatically update updated_at
CREATE TRIGGER trigger_update_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_categories_updated_at();

CREATE TRIGGER trigger_update_subcategories_updated_at
  BEFORE UPDATE ON subcategories
  FOR EACH ROW
  EXECUTE FUNCTION update_subcategories_updated_at();

CREATE TRIGGER trigger_update_inventory_products_updated_at
  BEFORE UPDATE ON inventory_products
  FOR EACH ROW
  EXECUTE FUNCTION update_inventory_products_updated_at();

-- Insert categories
INSERT INTO categories (name) VALUES
  ('phone'),
  ('laptop'),
  ('pc'),
  ('ps4'),
  ('ps5'),
  ('xbox')
ON CONFLICT (name) DO NOTHING;

-- Insert subcategories for phone
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('redmi'),
  ('samsung'),
  ('oppo'),
  ('huawei')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'phone'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for laptop
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('asus'),
  ('lenovo'),
  ('huawei'),
  ('hp')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'laptop'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for pc
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('asus'),
  ('lenovo'),
  ('hp'),
  ('dell'),
  ('acer')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'pc'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for ps4
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('standard'),
  ('pro'),
  ('slim')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'ps4'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for ps5
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('standard'),
  ('digital'),
  ('pro')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'ps5'
ON CONFLICT (name, category_id) DO NOTHING;

-- Insert subcategories for xbox
INSERT INTO subcategories (name, category_id)
SELECT 
  subcat.name,
  cat.id
FROM (VALUES 
  ('xbox one'),
  ('xbox series s'),
  ('xbox series x')
) AS subcat(name)
CROSS JOIN categories cat
WHERE cat.name = 'xbox'
ON CONFLICT (name, category_id) DO NOTHING;

