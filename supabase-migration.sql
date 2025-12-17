-- Create daily_transformations table
-- Note: Using snake_case for column names (PostgreSQL standard)
-- Supabase PostgREST automatically converts camelCase to snake_case
CREATE TABLE IF NOT EXISTS daily_transformations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  product_name TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  dollar_rate NUMERIC NOT NULL DEFAULT 0,
  selling_price NUMERIC NOT NULL DEFAULT 0,
  withdraw NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_transformations_date ON daily_transformations(date);

-- Create daily_cash table
CREATE TABLE IF NOT EXISTS daily_cash (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE UNIQUE NOT NULL,
  cash_in_box_yesterday NUMERIC NOT NULL DEFAULT 0,
  cash_in_box_today NUMERIC NOT NULL DEFAULT 0,
  dollar_to_tl_rate NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_cash_date ON daily_cash(date);

-- Add dollar_to_tl_rate column if it doesn't exist (for existing databases)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_cash' AND column_name = 'dollar_to_tl_rate'
  ) THEN
    ALTER TABLE daily_cash ADD COLUMN dollar_to_tl_rate NUMERIC NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create daily_expenses table
CREATE TABLE IF NOT EXISTS daily_expenses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_expenses_date ON daily_expenses(date);

-- Create daily_paraniz table
CREATE TABLE IF NOT EXISTS daily_paraniz (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  kontor_amount NUMERIC NOT NULL DEFAULT 0,
  kontor_cost NUMERIC NOT NULL DEFAULT 0,
  fatura_amount NUMERIC NOT NULL DEFAULT 0,
  fatura_cost NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_paraniz_date ON daily_paraniz(date);

-- Create daily_paraniz_sales table
CREATE TABLE IF NOT EXISTS daily_paraniz_sales (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  subscription_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on date for faster queries
CREATE INDEX IF NOT EXISTS idx_daily_paraniz_sales_date ON daily_paraniz_sales(date);

-- Create products_types table (for managing types from frontend)
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

-- Create karma_products table
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

-- Enable Row Level Security (optional, adjust policies as needed)
ALTER TABLE daily_transformations ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cash ENABLE ROW LEVEL SECURITY;
ALTER TABLE products_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE karma_products ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (adjust based on your auth requirements)
CREATE POLICY "Allow all operations on daily_transformations" ON daily_transformations
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on daily_cash" ON daily_cash
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE daily_expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on daily_expenses" ON daily_expenses
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE daily_paraniz ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on daily_paraniz" ON daily_paraniz
  FOR ALL USING (true) WITH CHECK (true);

ALTER TABLE daily_paraniz_sales ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on daily_paraniz_sales" ON daily_paraniz_sales
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on products_types" ON products_types
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on karma_products" ON karma_products
  FOR ALL USING (true) WITH CHECK (true);

