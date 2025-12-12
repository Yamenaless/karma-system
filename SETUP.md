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
   - This will create:
     - `daily_products` table
     - `daily_cash` table
     - Required indexes
     - Row Level Security policies

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. **Open the Application**
   - Navigate to [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Database Schema

### daily_products
- Stores product entries for each day
- Columns: id, date, product_name, quantity, cost_price_tl, dollar_rate, selling_price, debt, withdraw, paraniz_kontor, paraniz_fatura, created_at

### daily_cash
- Stores cash in box data for each day
- Columns: id, date, cash_in_box_yesterday, cash_in_box_today, created_at
- The `date` column is unique (one record per day)

## Notes

- The system automatically loads yesterday's `cashInBoxToday` value into today's `cashInBoxYesterday` field
- All totals are calculated automatically based on the products for the selected date
- You can change the date using the date picker in the header to view different days

