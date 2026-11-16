import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Try loading from various locations to ensure it finds the .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '..', '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

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

async function ingestProducts() {
    const dataPath = path.resolve(process.cwd(), 'batteries.json');
    const rootDataPath = path.resolve(process.cwd(), 'scripts', 'batteries.json');
    const finalDataPath = fs.existsSync(dataPath) ? dataPath : rootDataPath;

    if (!fs.existsSync(finalDataPath)) {
        console.error('batteries.json not found. Run the Python scraper first.');
        process.exit(1);
    }

    const products = JSON.parse(fs.readFileSync(finalDataPath, 'utf-8'));
    console.log(`Starting ingestion of ${products.length} products...`);

    for (const p of products) {
        try {
            const { images, ...productData } = p;
            
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

ingestProducts();
