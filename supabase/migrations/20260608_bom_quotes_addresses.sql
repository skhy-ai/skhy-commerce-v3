-- Migration: BOM save system, quotes, and user addresses
-- Date: 2026-06-08

-- ── Equipment Configurations ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.equipment_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  is_public BOOLEAN DEFAULT false,
  config_json JSONB NOT NULL,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.equipment_configs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "eq_cfg_sel" ON public.equipment_configs;
CREATE POLICY "eq_cfg_sel" ON public.equipment_configs
  FOR SELECT USING (is_public = true OR auth.uid() = user_id);

DROP POLICY IF EXISTS "eq_cfg_ins" ON public.equipment_configs;
CREATE POLICY "eq_cfg_ins" ON public.equipment_configs
  FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

DROP POLICY IF EXISTS "eq_cfg_upd" ON public.equipment_configs;
CREATE POLICY "eq_cfg_upd" ON public.equipment_configs
  FOR UPDATE USING (auth.uid() = user_id);

-- ── Quotes (RFQ) ──────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.quotes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id TEXT UNIQUE NOT NULL,
  config_id UUID REFERENCES public.equipment_configs(id),
  customer_email TEXT,
  customer_name TEXT,
  items_json JSONB NOT NULL,
  status TEXT DEFAULT 'pending',  -- pending | reviewed | quoted | accepted | rejected
  admin_notes TEXT,
  quoted_price NUMERIC,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.quotes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quotes_ins" ON public.quotes;
CREATE POLICY "quotes_ins" ON public.quotes
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "quotes_sel" ON public.quotes;
CREATE POLICY "quotes_sel" ON public.quotes
  FOR SELECT USING (true);

-- ── User Addresses ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  label TEXT DEFAULT 'Default',
  name TEXT,
  line1 TEXT,
  line2 TEXT,
  city TEXT,
  state TEXT,
  postal_code TEXT,
  country TEXT,
  country_code TEXT,
  phone TEXT,
  is_default BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "addr_sel" ON public.user_addresses;
CREATE POLICY "addr_sel" ON public.user_addresses
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "addr_ins" ON public.user_addresses;
CREATE POLICY "addr_ins" ON public.user_addresses
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "addr_upd" ON public.user_addresses;
CREATE POLICY "addr_upd" ON public.user_addresses
  FOR UPDATE USING (auth.uid() = user_id);
