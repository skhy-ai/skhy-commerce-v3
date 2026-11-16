# Supabase Storage Configuration Guide

## Storage Buckets Setup

You need to create 3 storage buckets for the marketplace:

### 1. Product Images (Public)
**Bucket Name:** `product-images`
**Settings:**
- Public: ✅ Yes
- Allowed MIME types: `image/*`
- Max file size: 5 MB

**Storage Policies:**
```sql
-- Allow public to read product images
CREATE POLICY "Public can view product images"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'product-images');

-- Allow authenticated users to upload their own product images
CREATE POLICY "Authenticated users can upload product images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-images');

-- Allow users to update their own uploads
CREATE POLICY "Users can update their own product images"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner);

-- Allow users to delete their own uploads
CREATE POLICY "Users can delete their own product images"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-images' AND auth.uid()::text = owner);
```

### 2. Product Documents (Private)
**Bucket Name:** `product-documents`
**Settings:**
- Public: ❌ No
- Allowed MIME types: `application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document`
- Max file size: 10 MB

**Storage Policies:**
```sql
-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-documents');

-- Allow authenticated users to view documents
CREATE POLICY "Authenticated users can view documents"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'product-documents');

-- Allow users to manage their own documents
CREATE POLICY "Users can manage their own documents"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-documents' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete their own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-documents' AND auth.uid()::text = owner);
```

### 3. Company Logos (Public)
**Bucket Name:** `company-logos`
** Settings:**
- Public: ✅ Yes
- Allowed MIME types: `image/*`
- Max file size: 2 MB

**Storage Policies:**
```sql
-- Allow public to view company logos
CREATE POLICY "Public can view company logos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'company-logos');

-- Allow authenticated users to upload logos
CREATE POLICY "Authenticated users can upload company logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'company-logos');

-- Allow users to manage their own logo
CREATE POLICY "Users can update their own company logo"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = owner);

CREATE POLICY "Users can delete their own company logo"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'company-logos' AND auth.uid()::text = owner);
```

---

## Quick Setup Steps

### Via Supabase Dashboard (Recommended)

1. Go to [Storage](https://supabase.com/dashboard/project/<PROJECT_ID>/storage/buckets)
2. Click **"New Bucket"**
3. Create each bucket with settings above
4. For each bucket, go to **Policies** tab and add the SQL policies listed above

### Via SQL (All at once)

You can run all the storage policies in one go by copying the combined SQL above into the SQL Editor.

---

## Verification

After setup, test with this script:

```bash
node scripts/test-storage.js
```

(Script to be created next)
