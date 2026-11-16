import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCategory, extractSpecs } from '../src/utils/marketplaceNormalization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials (VITE_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncDatabaseTaxonomy() {
    console.log('Fetching active marketplace products for DB synchronization...');
    
    const { data: products, error } = await supabase
        .from('products')
        .select('*, seller:users(company_name)')
        .eq('is_active', true);

    if (error) {
        console.error('Error fetching products:', error);
        process.exit(1);
    }

    console.log(`Found ${products.length} products to evaluate.`);
    let updateCount = 0;

    for (const product of products) {
        // 1. Calculate normalized taxonomy
        const { category, subcategory } = normalizeCategory(product);
        const specs = extractSpecs({ ...product, category });
        
        // 2. Determine origin
        const isSkhy = (product.seller?.company_name?.toUpperCase() === 'SKHY' || product.manufacturer?.toUpperCase() === 'SKHY');
        const countryOrigin = isSkhy ? 'MY' : product.country_of_origin;

        // 3. Extract technical fields for DB columns
        let weightKg = product.weight_kg;
        if (specs['Weight']) {
            const wText = specs['Weight'].toString().toLowerCase();
            if (wText.includes('kg')) weightKg = parseFloat(wText);
            else if (wText.includes('g')) weightKg = parseFloat(wText) / 1000;
        }

        let powerW = product.power_draw_w;
        if (specs['Power Draw']) {
            powerW = parseFloat(specs['Power Draw'].toString().replace(/[<≤]/g, ''));
        }

        const dimensions = specs['Dimensions']?.toString() || product.dimensions;

        // 4. Check if update is needed to save API calls
        const needsUpdate = 
            product.category !== category || 
            product.subcategory !== subcategory || 
            product.country_of_origin !== countryOrigin ||
            product.weight_kg !== weightKg ||
            product.power_draw_w !== powerW ||
            product.dimensions !== dimensions;

        if (needsUpdate) {
            const { error: updateError } = await supabase
                .from('products')
                .update({
                    category,
                    subcategory,
                    country_of_origin: countryOrigin,
                    weight_kg: weightKg,
                    power_draw_w: powerW,
                    dimensions: dimensions
                })
                .eq('id', product.id);

            if (updateError) {
                console.error(`Failed to update product ${product.id} (${product.name}):`, updateError.message);
            } else {
                console.log(`[SYNCED] ${product.name}:`);
                if (product.category !== category) console.log(`  - Category: ${category}`);
                if (product.weight_kg !== weightKg) console.log(`  - Weight: ${weightKg}kg`);
                if (product.power_draw_w !== powerW) console.log(`  - Power: ${powerW}W`);
                if (product.dimensions !== dimensions) console.log(`  - Dims: ${dimensions}`);
                updateCount++;
            }
        }
    }

    console.log(`\nSynchronization complete. Updated ${updateCount} products in database.`);
    process.exit(0);
}

syncDatabaseTaxonomy();
