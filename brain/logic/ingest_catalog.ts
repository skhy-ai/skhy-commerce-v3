import { productCatalog } from '../../src/data/productCatalog';
import config from '../../src/data/config.json';
import dotenv from 'dotenv';
import path from 'path';

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

const categoryMap: Record<string, string> = {
    'acoustic': 'Sensors',
    'edge-ai': 'Payloads',
    'ajgps': 'GPS',
    'manet': 'Communication',
    'paas': 'Software',
    'drone': 'Drones',
    'software': 'Software',
    'hardware': 'Hardware'
};

async function ingestCatalog() {
    console.log(`Starting ingestion of ${productCatalog.length} products...`);

    for (const product of productCatalog) {
        console.log(`Processing: ${product.name} (${product.id})...`);

        // Get pricing from config
        const prices = config.prices as Record<string, { inr: number }>;
        const priceInr = prices[product.id]?.inr;
        const basePriceUsd = product.base_price || (priceInr ? Math.round(priceInr / 84.5) : 0);

        // Flatten details into description and features
        let description = product.tagline + '\n\n';
        const features: string[] = [];
        
        for (const block of product.details) {
            if (block.type === 'text') {
                description += (block.title ? `**${block.title}**\n` : '') + block.text + '\n\n';
            } else if (block.type === 'list') {
                description += `**${block.title}**\n` + block.items.map(it => `- ${it}`).join('\n') + '\n\n';
                features.push(...block.items);
            } else if (block.type === 'specs') {
                description += `**${block.title}**\n` + block.items.map(it => `${it.label}: ${it.value}`).join('\n') + '\n\n';
                block.items.forEach(it => features.push(`${it.label}: ${it.value}`));
            }
        }

        const dbProduct = {
            sku: product.id,
            name: product.name,
            description: description.trim(),
            type: 'hardware', // Most are hardware
            category: categoryMap[product.category] || 'Hardware',
            base_price: basePriceUsd,
            currency: 'USD',
            user_id: SKHY_USER_ID,
            manufacturer: 'SKHY',
            show_on_marketplace: true,
            is_active: true,
            features: features.slice(0, 10), // Limit to 10 features for display
            pricing_model: 'unit',
            ready_to_sale: true
        };

        // Upsert product
        const res = await fetch(`${supabaseUrl}/rest/v1/products?sku=eq.${product.id}`, {
            method: 'POST',
            headers,
            body: JSON.stringify(dbProduct)
        });

        if (!res.ok) {
            const err = await res.text();
            console.error(`Failed to upsert ${product.id}:`, err);
            continue;
        }

        // Get the product ID (might be newly created or existing)
        const fetchRes = await fetch(`${supabaseUrl}/rest/v1/products?sku=eq.${product.id}&select=id`, { headers });
        const fetchData = await fetchRes.json();
        const productId = fetchData[0]?.id;

        if (productId) {
            console.log(`Product ID: ${productId}. Managing assets...`);
            
            // Delete existing assets for this product to avoid duplicates
            await fetch(`${supabaseUrl}/rest/v1/product_assets?product_id=eq.${productId}`, {
                method: 'DELETE',
                headers
            });

            // Add images
            const imageUrls = product.imageUrls || [product.imageUrl];
            for (let i = 0; i < imageUrls.length; i++) {
                const asset = {
                    product_id: productId,
                    file_url: imageUrls[i],
                    asset_type: 'image',
                    is_primary: i === 0,
                    display_order: i
                };
                await fetch(`${supabaseUrl}/rest/v1/product_assets`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(asset)
                });
            }
        }
    }

    console.log('Ingestion complete!');
}

ingestCatalog().catch(console.error);
