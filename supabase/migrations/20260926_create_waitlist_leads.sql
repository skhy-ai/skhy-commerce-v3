-- =============================================================================
-- Migration: Create waitlist_leads table and consolidate lead storage
-- Applied: 2026-09-26
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.waitlist_leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    name TEXT,
    full_name TEXT,
    email TEXT NOT NULL,
    phone TEXT,
    company TEXT,
    company_name TEXT,
    intent TEXT DEFAULT 'solutions',
    sub_category TEXT,
    product_name TEXT DEFAULT 'General Product Inquiry',
    product_id TEXT,
    source TEXT DEFAULT 'website_lead',
    message TEXT
);

-- Enable RLS
ALTER TABLE public.waitlist_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies
DROP POLICY IF EXISTS "Allow public insert to waitlist_leads" ON public.waitlist_leads;
CREATE POLICY "Allow public insert to waitlist_leads" ON public.waitlist_leads FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow select for waitlist_leads" ON public.waitlist_leads;
CREATE POLICY "Allow select for waitlist_leads" ON public.waitlist_leads FOR SELECT TO anon, authenticated USING (true);

-- Migrate existing product_waitlist rows into waitlist_leads if available
INSERT INTO public.waitlist_leads (
    created_at,
    full_name,
    name,
    email,
    phone,
    company_name,
    company,
    product_name,
    product_id,
    message,
    intent,
    source
)
SELECT
    pw.created_at,
    pw.full_name,
    pw.full_name,
    pw.email,
    pw.phone,
    pw.company_name,
    pw.company_name,
    pw.product_name,
    pw.product_id,
    pw.message,
    'product_interest',
    'express_interest_form'
FROM public.product_waitlist pw
ON CONFLICT DO NOTHING;
