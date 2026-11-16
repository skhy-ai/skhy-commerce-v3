-- Add local_url column to product_assets
ALTER TABLE product_assets ADD COLUMN IF NOT EXISTS local_url TEXT;
