import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'resolution=merge-duplicates'
};

const SKHY_USER_ID = 'bb48fabc-b101-4d3c-a419-3c305143a80e';

async function ingestAcasom() {
    const csvPath = path.resolve(process.cwd(), 'scripts/acasom_products.csv');
    if (!fs.existsSync(csvPath)) {
        console.error('Acasom CSV not found at:', csvPath);
        return;
    }

    console.log(`Starting ingestion of Acasom products...`);

    const records: any[] = [];
    await new Promise((resolve, reject) => {
        fs.createReadStream(csvPath)
            .pipe(csv())
            .on('data', (data) => records.push(data))
            .on('end', resolve)
            .on('error', reject);
    });

    console.log(`Parsed ${records.length} records. Beginning Supabase sync...`);

    for (const record of records) {
        const sku = `AC-${record.id}`;
        console.log(`Processing: ${record.name} (${sku})...`);

        const dbProduct = {
            sku: sku,
            name: record.name,
            description: record.description,
            type: 'hardware',
            category: record.category || 'Hardware',
            base_price: parseFloat(record.base_price) || 0,
            currency: record.currency || 'USD',
            user_id: SKHY_USER_ID,
            manufacturer: record.manufacturer || 'ACASOM',
            country_of_origin: record.country_of_origin || 'CN',
            power_draw_w: parseFloat(record.power_draw_w) || null,
            show_on_marketplace: true,
            is_active: true,
            pricing_model: 'unit',
            ready_to_sale: true
        };

        // Upsert product
        const res = await fetch(`${supabaseUrl}/rest/v1/products?sku=eq.${sku}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(dbProduct)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Failed to upsert ${sku}:`, err);
            continue;
        }

        // Get product ID
        const fetchRes = await fetch(`${supabaseUrl}/rest/v1/products?sku=eq.${sku}&select=id`, { headers });
        const fetchData = await fetchRes.json();
        const productId = fetchData[0]?.id;

        if (productId) {
            // Manage assets
            await fetch(`${supabaseUrl}/rest/v1/product_assets?product_id=eq.${productId}`, {
                method: 'DELETE',
                headers
            });

            if (record.image_url) {
                const asset = {
                    product_id: productId,
                    file_url: record.image_url,
                    asset_type: 'image',
                    is_primary: true,
                    display_order: 0
                };
                await fetch(`${supabaseUrl}/rest/v1/product_assets`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(asset)
                });
            }
        }
    }

    console.log('Acasom ingestion complete!');
}

ingestAcasom().catch(console.error);
