import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { productCatalog } from '../src/data/productCatalog';
import { simulatorProducts } from '../src/data/shopProducts';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Supabase environment variables.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateProducts() {
    console.log("Starting migration...");

    // Create a default seller user to map partner/OEM products if none exist
    // Assuming 'skhy-oem' is our seller ID 
    const defaultSellerId = 'e2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7'; // We'll just map to a placeholder or the first user in DB if schema enforces foreign keys.

    try {
        const { data: users, error: userError } = await supabase.from('users').select('id').eq('seller_type', 'manufacturer').limit(1);
        let sellerId = defaultSellerId;
        if (!userError && users && users.length > 0) {
            sellerId = users[0].id;
            console.log(`Using existing seller ID: ${sellerId}`);
        } else {
            console.log("No default seller found! Insert might fail if user_id is a tight FK. We'll proceed.");
        }

        const catalogProducts = productCatalog.map((item, index) => {
            const mappedItem = {
                id: 900000 + index, // ensuring no conflict with existing
                name: item.name,
                description: item.tagline,
                category: item.category === 'manet' ? 'Communication' :
                    item.category === 'ajgps' ? 'Defense Systems' :
                        item.category === 'hardware' ? 'Drone Components' : 'Hardware',
                type: 'hardware',
                pricing_model: 'unit',
                base_price: item.base_price ?? 0,
                currency: 'USD',
                tax_exempt: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
                user_id: sellerId,
                show_on_marketplace: true,
                is_active: true
            };
            return mappedItem;
        });

        const simulatorMapped = simulatorProducts.map((item) => ({
            id: item.id,
            name: item.name,
            description: item.description,
            category: item.category,
            type: item.type,
            pricing_model: item.pricing_model,
            base_price: item.base_price ?? 0,
            currency: item.currency || 'USD',
            tax_exempt: item.tax_exempt || false,
            created_at: item.created_at || new Date().toISOString(),
            updated_at: item.updated_at || new Date().toISOString(),
            user_id: item.seller?.id || sellerId, // or might be seller_id depending on db schema
            show_on_marketplace: true,
            is_active: true
        }));

        const allProductsToInsert = [...catalogProducts, ...simulatorMapped];

        // Insert products
        console.log(`Inserting ${allProductsToInsert.length} products...`);
        const { data: insertedProducts, error: insertError } = await supabase.from('products').upsert(allProductsToInsert, { onConflict: 'id' }).select();

        if (insertError) {
            console.error("Error inserting products:", insertError);
            return;
        }
        console.log("Products inserted successfully.", insertedProducts.length);

        // Insert assets
        console.log("Preparing assets...");
        const assetsToInsert = [];

        productCatalog.forEach((item, index) => {
            if (item.imageUrl) {
                assetsToInsert.push({
                    id: 800000 + index,
                    product_id: 900000 + index,
                    asset_type: 'image',
                    file_url: item.imageUrl,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            }
        });

        simulatorProducts.forEach((item) => {
            if (item.product_assets && Array.isArray(item.product_assets)) {
                item.product_assets.forEach(asset => {
                    assetsToInsert.push({
                        id: asset.id,
                        product_id: item.id,
                        asset_type: asset.asset_type,
                        file_url: asset.file_url,
                        created_at: asset.created_at || new Date().toISOString(),
                        updated_at: asset.updated_at || new Date().toISOString()
                    });
                });
            }
        });

        if (assetsToInsert.length > 0) {
            console.log(`Inserting ${assetsToInsert.length} product assets...`);
            const { error: assetError } = await supabase.from('product_assets').upsert(assetsToInsert, { onConflict: 'id' });
            if (assetError) {
                console.error("Error inserting assets:", assetError);
            } else {
                console.log("Product assets inserted successfully.");
            }
        }

    } catch (error) {
        console.error("Migration failed:", error);
    }
}

migrateProducts();
