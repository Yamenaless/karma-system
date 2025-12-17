# Karama Daily Accounting System

A daily accounting system built with Next.js, Supabase, and shadcn/ui.

## Features

- Daily transformation management with full CRUD operations
- Karma products catalog with product types management
- Product types can be added, edited, or removed from the frontend
- Real-time totals calculation
- Cash in box tracking with automatic date-based logic
- Responsive UI built with shadcn/ui components
- TypeScript strict mode

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up Supabase:
   - Create a new Supabase project
   - Go to SQL Editor in your Supabase dashboard
   - Run the SQL migration file: `supabase-migration.sql`
   - If you have an existing database, also run `rename-daily-products-migration.sql` to rename `daily_products` to `daily_transformations` and create the new `karma_products` and `products_types` tables
   - This will create the `daily_transformations`, `daily_cash`, `karma_products`, and `products_types` tables with proper indexes and RLS policies

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Add your Supabase URL and anon key

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000/dashboard](http://localhost:3000/dashboard)

## Usage

- Select a date to view products for that day
- Click "Add Product" to add a new product entry
- View totals automatically calculated below the table
- Enter cash in box values - yesterday's value is automatically loaded from the previous day
- Save cash data to persist it for the selected date

