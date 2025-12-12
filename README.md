# Karama Daily Accounting System

A daily accounting system built with Next.js, Supabase, and shadcn/ui.

## Features

- Daily product management with full CRUD operations
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
   - This will create the `daily_products` and `daily_cash` tables with proper indexes and RLS policies

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

