-- =============================================================================
-- COMPLETE DDL BACKUP INCLUDING TABLES
-- Run this ONE query in Supabase SQL Editor
-- Copy ALL output rows and save to a .sql file
-- =============================================================================
--
-- NOTE ON spatial_ref_sys (and geometry_columns, geography_columns):
--   These tables appear in the public schema because Supabase installs the
--   PostGIS extension there. They are SYSTEM tables owned by PostGIS and
--   contain 8,500+ pre-loaded EPSG coordinate reference system definitions.
--   They are NOT your application tables. They are recreated automatically
--   whenever `CREATE EXTENSION IF NOT EXISTS postgis` is run, so the DDL
--   captured below for them is informational only -- do not try to replay
--   their INSERT data; just ensure the postgis extension line is present.
--
-- =============================================================================

WITH table_ddl AS (
  SELECT 
    t.tablename,
    'CREATE TABLE IF NOT EXISTS public.' || t.tablename || E' (\n  ' ||
    string_agg(
      c.column_name || ' ' || 
      c.data_type ||
      CASE 
        WHEN c.character_maximum_length IS NOT NULL 
        THEN '(' || c.character_maximum_length || ')'
        WHEN c.data_type = 'ARRAY' THEN '[]'
        WHEN c.data_type = 'numeric' AND c.numeric_precision IS NOT NULL
        THEN '(' || c.numeric_precision || ',' || COALESCE(c.numeric_scale::text, '0') || ')'
        ELSE ''
      END ||
      CASE WHEN c.column_default IS NOT NULL THEN ' DEFAULT ' || c.column_default ELSE '' END ||
      CASE WHEN c.is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END,
      E',\n  '
      ORDER BY c.ordinal_position
    ) || E'\n);' AS ddl
  FROM pg_tables t
  JOIN information_schema.columns c 
    ON c.table_schema = t.schemaname 
    AND c.table_name = t.tablename
  WHERE t.schemaname = 'public'
  GROUP BY t.tablename
),

constraint_ddl AS (
  SELECT 
    tc.table_name,
    'ALTER TABLE public.' || tc.table_name || 
    ' ADD CONSTRAINT ' || tc.constraint_name || ' ' ||
    CASE tc.constraint_type
      WHEN 'PRIMARY KEY' THEN 
        'PRIMARY KEY (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ')'
      WHEN 'FOREIGN KEY' THEN 
        'FOREIGN KEY (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ') ' ||
        'REFERENCES ' || (SELECT ccu.table_name FROM information_schema.constraint_column_usage ccu 
                          WHERE ccu.constraint_name = tc.constraint_name LIMIT 1) ||
        '(' || (SELECT string_agg(ccu.column_name, ', ') FROM information_schema.constraint_column_usage ccu 
                WHERE ccu.constraint_name = tc.constraint_name) || ')' 
      WHEN 'UNIQUE' THEN 
        'UNIQUE (' || string_agg(kcu.column_name, ', ' ORDER BY kcu.ordinal_position) || ')'
      ELSE tc.constraint_type
    END || ';' AS ddl
  FROM information_schema.table_constraints tc
  LEFT JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
  WHERE tc.table_schema = 'public'
    AND tc.constraint_type IN ('PRIMARY KEY', 'FOREIGN KEY', 'UNIQUE')
  GROUP BY tc.table_name, tc.constraint_name, tc.constraint_type
),

ddl_parts AS (
  -- Extensions
  SELECT 1 AS sort_order, 'EXTENSIONS' AS section, '' AS table_name,
         'CREATE EXTENSION IF NOT EXISTS "' || extname || '";' AS ddl
  FROM pg_extension 
  WHERE extname NOT IN ('plpgsql')
  
  UNION ALL
  
  -- Functions
  SELECT 2, 'FUNCTIONS', '',
         pg_get_functiondef(p.oid) || ';'
  FROM pg_proc p
  JOIN pg_namespace n ON p.pronamespace = n.oid
  WHERE n.nspname = 'public'
  
  UNION ALL
  
  -- Tables
  SELECT 3, 'TABLES', tablename,
         ddl
  FROM table_ddl
  
  UNION ALL
  
  -- Constraints
  SELECT 4, 'CONSTRAINTS', table_name,
         ddl
  FROM constraint_ddl
  
  UNION ALL
  
  -- Indexes (excluding those created by constraints)
  SELECT 5, 'INDEXES', tablename,
         indexdef || ';'
  FROM pg_indexes
  WHERE schemaname = 'public'
    AND indexname NOT LIKE '%_pkey'
    AND indexname NOT LIKE '%_key'
  
  UNION ALL
  
  -- Enable RLS
  SELECT 6, 'RLS_ENABLE', tablename,
         'ALTER TABLE public.' || tablename || ' ENABLE ROW LEVEL SECURITY;'
  FROM pg_tables
  WHERE schemaname = 'public'
  
  UNION ALL
  
  -- Policies
  SELECT 7, 'POLICIES', tablename,
         'DROP POLICY IF EXISTS "' || policyname || '" ON public.' || tablename || ';' || E'\n' ||
         'CREATE POLICY "' || policyname || '" ON public.' || tablename || 
         ' FOR ' || cmd || ' TO ' || COALESCE(roles::text, 'public') ||
         CASE WHEN qual IS NOT NULL THEN E'\n  USING (' || qual || ')' ELSE '' END ||
         CASE WHEN with_check IS NOT NULL THEN E'\n  WITH CHECK (' || with_check || ')' ELSE '' END || ';'
  FROM pg_policies
  WHERE schemaname = 'public'
  
  UNION ALL
  
  -- Triggers
  SELECT 8, 'TRIGGERS', event_object_table,
         'DROP TRIGGER IF EXISTS ' || trigger_name || ' ON public.' || event_object_table || ';' || E'\n' ||
         'CREATE TRIGGER ' || trigger_name || ' ' || action_timing || ' ' || event_manipulation ||
         ' ON public.' || event_object_table || ' FOR EACH ' || action_orientation ||
         ' EXECUTE FUNCTION ' || action_statement || ';'
  FROM information_schema.triggers
  WHERE trigger_schema = 'public'
)

SELECT 
  '-- =============================================================================' || E'\n' ||
  '-- ' || section || 
  CASE WHEN table_name != '' THEN ': ' || table_name ELSE '' END || E'\n' ||
  '-- =============================================================================' || E'\n' ||
  ddl || E'\n' AS complete_ddl
FROM ddl_parts
ORDER BY sort_order, table_name, ddl;
