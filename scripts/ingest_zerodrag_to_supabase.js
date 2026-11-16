import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL ;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables (URL or SERVICE_ROLE_KEY).');
    process.exit(1);
}

const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
};

const DEFAULT_USER_ID = "bb48fabc-b101-4d3c-a419-3c305143a80e";

async function ingestZerodrag() {
    const dataPath = path.resolve(process.cwd(), 'download', 'indian_products_v3.json');

    if (!fs.existsSync(dataPath)) {
        console.error('indian_products_v3.json not found.');
        process.exit(1);
    }

    const content = fs.readFileSync(dataPath, 'utf-8');
    
    // Handle concatenated JSON arrays
    let allProducts = [];
    const arrays = content.match(/\[[\s\S]*?\]/g) || [];
    for (const arrStr of arrays) {
        try {
            const data = JSON.parse(arrStr);
            if (Array.isArray(data)) {
                allProducts = allProducts.concat(data);
            }
        } catch (e) {
            console.warn('Failed to parse a JSON block:', e.message);
        }
    }

    // Filter and Unique
    const seenSkus = new Set();
    const zerodragProducts = allProducts.filter(p => {
        if (p.manufacturer === "Zerodrag Technologies" && !seenSkus.has(p.sku)) {
            seenSkus.add(p.sku);
            return true;
        }
        return false;
    });

    console.log(`Starting ingestion of ${zerodragProducts.length} unique Zerodrag products...`);

    for (const p of zerodragProducts) {
        try {
            const { images, ...rawProductData } = p;
            
            // Map to Supabase Schema
            const productData = {
                user_id: DEFAULT_USER_ID,
                name: rawProductData.name,
                description: rawProductData.description || `High-performance drone component from ${rawProductData.manufacturer}`,
                type: 'hardware',
                category: rawProductData.category || 'Drone Components',
                base_price: parseFloat(String(rawProductData.base_price).replace(/,/g, '')) || 0,
                currency: 'USD',
                show_on_marketplace: true,
                ready_to_sale: true,
                is_active: true,
                manufacturer: rawProductData.manufacturer,
                country_of_origin: rawProductData.country_of_origin || 'IN',
                stock_quantity: 10,
                sku: rawProductData.sku,
                segment: 'air'
            };

            // 1. Insert Product
            const res = await fetch(`${supabaseUrl}/rest/v1/products`, {
                method: 'POST',
                headers,
                body: JSON.stringify(productData)
            });

            if (!res.ok) {
                const err = await res.text();
                console.error(`Failed to insert product ${p.name}: ${err}`);
                continue;
            }

            const insertedProducts = await res.json();
            const newProductId = insertedProducts[0].id;
            console.log(`[SUCCESS] Inserted: ${p.name} (ID: ${newProductId})`);

            // 2. Insert Assets (Images)
            if (images && images.length > 0) {
                const assetData = images.map((url, index) => ({
                    product_id: newProductId,
                    file_url: url,
                    asset_type: 'image',
                    is_primary: index === 0,
                    display_order: index
                }));

                const assetRes = await fetch(`${supabaseUrl}/rest/v1/product_assets`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(assetData)
                });

                if (!assetRes.ok) {
                    const assetErr = await assetRes.text();
                    console.error(`  [ERROR] Failed to insert assets for ${p.name}: ${assetErr}`);
                } else {
                    console.log(`  [SUCCESS] Inserted ${images.length} assets.`);
                }
            }
        } catch (err) {
            console.error(`Error processing ${p.name}:`, err);
        }
    }

    console.log('Ingestion complete. Next: run node scripts/cache_marketplace.js to sync the frontend.');
}

ingestZerodrag();
