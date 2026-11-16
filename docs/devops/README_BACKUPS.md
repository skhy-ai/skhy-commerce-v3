# Supabase Schema Backups

Complete DDL backup system for the Skhy AI Website database.

## Files

- **`final_consolidated_schema.sql`** - Complete production-ready schema backup
- **`generate_complete_backup.sql`** - Query to generate fresh backup from live database  
- **`HOW_TO_BACKUP.md`** - Detailed backup instructions
- **`backups/`** - Timestamped backup archives (gitignored)

## Quick Restore

```bash
# Via Supabase Dashboard (Easiest)
1. Go to: https://supabase.com/dashboard/project/<PROJECT_ID>/sql
2. Copy contents of final_consolidated_schema.sql
3. Paste and run
```

## Create New Backup

**Using Supabase CLI:**
```bash
npx supabase link --project-ref <PROJECT_ID>
npx supabase db dump --linked -f supabase/backups/backup_$(date +%Y%m%d).sql
```

**Manual via Dashboard:**
1. Run `generate_complete_backup.sql` in SQL Editor
2. Copy all results
3. Save to file

## What's Included

✅ **14 Tables** - users, products, orders, payments, etc.  
✅ **Functions** - is_admin(), update_updated_at_column(), etc.  
✅ **RLS Policies** - Complete security policies  
✅ **Triggers** - Automatic timestamp updates  
✅ **Constraints** - Primary keys, foreign keys, checks  
✅ **Indexes** - All performance indexes  

## Migration History

- `001-004` - Core schema and security
- `005-024` - Features and enhancements  
- `025` - Anonymous marketplace access (current)

All migrations in `migrations/` directory.
