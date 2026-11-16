# Database Migration Deployment

Due to connection pooler authentication issues, please deploy the migrations manually via the **Supabase Dashboard**.

## Quick Start

1. **Open Supabase SQL Editor**: [Click Here](https://supabase.com/dashboard/project/<PROJECT_ID>/sql)

2. **Run each migration in order**:

### Migration 001: Core Extensions
```bash
# Copy contents of: supabase/migrations/001_core_extensions.sql
# Paste into SQL Editor and click "Run"
```

### Migration 002: Product Assets
```bash
# Copy contents of: supabase/migrations/002_product_assets.sql
# Paste into SQL Editor and click "Run"
```

### Migration 003: Commerce
```bash
# Copy contents of: supabase/migrations/003_commerce.sql
# Paste into SQL Editor and click "Run"
```

### Migration 004: Security Policies
```bash
# Copy contents of: supabase/migrations/004_security_policies.sql
# Paste into SQL Editor and click "Run"
```

## Verification

After running all migrations, verify with this query:

```sql
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Should show:
-- blog_posts
-- order_items
-- orders
-- payments
-- pricing_tiers
-- product_assets
-- products
-- shipping_rates
-- usage_rates
-- users
-- whitepaper_downloads
```

## Troubleshooting

### "relation already exists"
This is fine - the migrations use `CREATE TABLE IF NOT EXISTS` and `CREATE POLICY IF NOT EXISTS`.

### "permission denied"
Make sure you're logged into the correct project in the Supabase Dashboard.

### Need to rollback?
See `supabase/migrations/README.md` for rollback instructions.

---

**Why manual deployment?**
Direct Postgres connection via pooler is having authentication issues. The Supabase Dashboard SQL Editor has full admin privileges and is the most reliable method for complex schema changes.
