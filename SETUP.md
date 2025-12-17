# Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set up Supabase**
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Once your project is ready, go to Settings > API
   - Copy your Project URL and anon/public key

3. **Configure Environment Variables**
   - Create a `.env.local` file in the root directory
   - Add the following:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   ```

4. **Set up Database Tables**
   - In your Supabase dashboard, go to SQL Editor
   - Copy and paste the contents of `supabase-migration.sql`
   - Click "Run" to execute the migration
   - If you have an existing database with `daily_products` table, also run `rename-daily-products-migration.sql` to rename it to `daily_transformations`
   - This will create:
     - `daily_transformations` table (or `daily_products` if running initial migration)
     - `daily_cash` table
     - `karma_products` table
     - `products_types` table
     - Required indexes
     - Row Level Security policies

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   - Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Database Schema

### daily_transformations
- Stores transformation entries for each day (renamed from daily_products)
- Columns: id, date, product_name, quantity, dollar_rate, selling_price, withdraw, created_at

### daily_cash
- Stores cash in box data for each day
- Columns: id, date, cash_in_box_yesterday, cash_in_box_today, dollar_to_tl_rate, created_at
- The `date` column is unique (one record per day)

### karma_products
- Stores product catalog information
- Columns: id, name, description, price, product_cost, code, type_id, created_at, updated_at
- Required fields: name, price, product_cost, code, type_id
- The `code` column is unique

### products_types
- Stores product type definitions (can be managed from frontend)
- Columns: id, name, created_at, updated_at
- The `name` column is unique
- Initial types: USB, MICRO, TYPEC, LIGHTIN_TO_TYPEC, TYPEC_TO_TYPEC

## Notes

- The system automatically loads yesterday's `cashInBoxToday` value into today's `cashInBoxYesterday` field
- All totals are calculated automatically based on the products for the selected date
- You can change the date using the date picker in the header to view different days

