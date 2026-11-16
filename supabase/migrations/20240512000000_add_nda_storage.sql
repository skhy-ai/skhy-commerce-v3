-- Migration: Add signed_documents table and compliance storage bucket
-- Description: Supports the digital NDA signing feature

-- 1. Create signed_documents table
CREATE TABLE IF NOT EXISTS public.signed_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT now(),
    document_type TEXT NOT NULL,
    company_name TEXT NOT NULL,
    signatory_name TEXT NOT NULL,
    email TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- 2. Enable RLS
ALTER TABLE public.signed_documents ENABLE ROW LEVEL SECURITY;

-- 3. Allow anonymous inserts (for the public NDA page)
-- In a production environment, you might want to add rate limiting or CAPTCHA
CREATE POLICY "Allow anonymous inserts for NDA" ON public.signed_documents
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public select for NDA" ON public.signed_documents
    FOR SELECT USING (true);

-- 4. Create storage bucket for compliance documents
-- Note: This might need to be done via the Supabase Dashboard if the 'storage' schema is restricted
INSERT INTO storage.buckets (id, name, public) 
VALUES ('compliance', 'compliance', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Storage policies for the 'compliance' bucket
-- Allow anyone to upload to 'ndas/' folder
CREATE POLICY "Allow public upload of NDAs" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'compliance' AND (storage.foldername(name))[1] = 'ndas');

-- Allow admins (authenticated) to read
CREATE POLICY "Allow authenticated read of compliance docs" ON storage.objects
    FOR SELECT USING (bucket_id = 'compliance' AND auth.role() = 'authenticated');

-- Allow public select/update to support client upsert pre-checks during upload
CREATE POLICY "Allow public select of compliance objects" ON storage.objects
    FOR SELECT USING (bucket_id = 'compliance');

CREATE POLICY "Allow public update of compliance objects" ON storage.objects
    FOR UPDATE USING (bucket_id = 'compliance');
