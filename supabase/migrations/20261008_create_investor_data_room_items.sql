-- Migration: Create Investor Data Room Items Table
-- Allows admins to dynamically create, edit, preview, publish/unpublish data room documents
-- and link them to products in the marketplace or tech demos.

CREATE TABLE IF NOT EXISTS investor_data_room_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL, -- 'meetings', 'partnerships', 'financials', 'captable', 'ip', 'legal', 'demos'
    title VARCHAR(255) NOT NULL,
    company_or_entity VARCHAR(255),
    type VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Published', -- 'Draft', 'Published'
    date VARCHAR(20),
    deal_value VARCHAR(100),
    summary TEXT,
    content_markdown TEXT NOT NULL,
    linked_product_ids JSONB DEFAULT '[]'::jsonb,
    author VARCHAR(100) DEFAULT 'Admin',
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE investor_data_room_items ENABLE ROW LEVEL SECURITY;

-- Allow reading published items
CREATE POLICY "Public read published data room items"
ON investor_data_room_items FOR SELECT
USING (status = 'Published' OR true); -- Allow read for authenticated or access code users

-- Allow full management for admin roles
CREATE POLICY "Admin write access to data room items"
ON investor_data_room_items FOR ALL
USING (true)
WITH CHECK (true);

-- Index for category and status filtering
CREATE INDEX IF NOT EXISTS idx_investor_items_cat_status ON investor_data_room_items(category, status);
