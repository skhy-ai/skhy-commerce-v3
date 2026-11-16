# Supabase Database Migration Guide

## Overview
This directory contains 4 phased SQL migrations to transform your Supabase database into a complete marketplace platform.

## Migration Files

1. **001_core_extensions.sql** - Extends users and products tables
2. **002_product_assets.sql** - Creates product assets, pricing, and shipping tables  
3. **003_commerce.sql** - Creates orders, order items, and payments tables
4. **004_security_policies.sql** - Implements comprehensive Row Level Security

## Prerequisites

✅ Before running migrations:
- [ ] Run `node scripts/validate-supabase.js` from project root
- [ ] Verify Supabase connection is working
- [ ] Enable Authentication in Supabase Dashboard
- [ ] Backup existing data (if any)

## How to Run Migrations

### Option 1: Supabase Dashboard SQL Editor (RECOMMENDED)

1. Log in to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `<PROJECT_ID>`
3. Navigate to **SQL Editor** (left sidebar)
4. Click **New Query**

**For each migration file (in order):**

5. Open `001_core_extensions.sql`
6. Copy entire contents
7. Paste into SQL Editor
8. Click **Run** (or press Ctrl+Enter)
9. Verify success message: "Phase A Complete: Core extensions added"
10. Repeat for 002, 003, and 004

### Option 2: Supabase CLI (if installed)

```bash
cd /home/hriday/skhyai-website/skhy-ai-website

# Run all migrations in order
supabase db reset
supabase migration up
```

### Option 3: Node.js Script (requires @supabase/supabase-js)

```bash
# Coming soon - automated migration script
node scripts/run-migrations.js
```

## Validation After Each Phase

### After Phase A (001_core_extensions.sql)

```sql
-- Verify new columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' AND column_name IN ('user_id', 'approved', 'logo_url');

SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name IN ('show_on_marketplace', 'user_id');
```

### After Phase B (002_product_assets.sql)

```sql
-- Verify tables created
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('product_assets', 'pricing_tiers', 'usage_rates', 'shipping_rates');
```

### After Phase C (003_commerce.sql)

```sql
-- Verify commerce tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('orders', 'order_items', 'payments');
```

### After Phase D (004_security_policies.sql)

```sql
-- Verify RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
  AND tablename IN ('product_assets', 'pricing_tiers', 'orders');

-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

## Rollback

If you need to undo migrations:

```sql
-- Rollback Phase D (policies only - safe)
DROP POLICY IF EXISTS "Public can view marketplace products" ON public.products;
-- ... (drop other policies as needed)

-- Rollback Phase C (⚠️ will delete order data)
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.order_items CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;

-- Rollback Phase B (⚠️ will delete product assets)
DROP TABLE IF EXISTS public.shipping_rates CASCADE;
DROP TABLE IF EXISTS public.usage_rates CASCADE;
DROP TABLE IF EXISTS public.pricing_tiers CASCADE;
DROP TABLE IF EXISTS public.product_assets CASCADE;

-- Rollback Phase A (⚠️ will delete columns)
ALTER TABLE public.products DROP COLUMN IF EXISTS user_id CASCADE;
ALTER TABLE public.products DROP COLUMN IF EXISTS show_on_marketplace;
-- ... (drop other columns as needed)
```

## Troubleshooting

### Error: "relation does not exist"
**Cause:** Tables from earlier phases not created  
**Fix:** Run migrations in order (001 → 002 → 003 → 004)

### Error: "column already exists"
**Cause:** Migration already run  
**Fix:** Safe to ignore (using `IF NOT EXISTS`)

### Error: "foreign key violation"
**Cause:** Referencing non-existent auth.users  
**Fix:** Enable Authentication in Supabase Dashboard first

### Error: "permission denied"
**Cause:** Using ANON key instead of SERVICE key  
**Fix:** Run via Dashboard SQL Editor (has admin privileges)

## Next Steps

After successful migration:

1. ✅ Create storage buckets (Dashboard > Storage)
   - `product-images` (public)
   - `product-documents` (private)
   - `company-logos` (public)

2. ✅ Configure email templates (Dashboard > Authentication > Email Templates)

3. ✅ Test authentication flow (register test user)

4. ✅ Create first test product

5. ✅ Verify marketplace display

## Support

If migrations fail, check:
- [Supabase Status](https://status.supabase.com/)
- [Supabase Docs - Database](https://supabase.com/docs/guides/database)
- Project logs in Dashboard > Database > Logs

For specific errors, share the error message and which phase failed.
