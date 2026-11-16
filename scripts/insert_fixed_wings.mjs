import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; 

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const fixedWings = [
    { id: 'fixed_wing_surveyor', name: 'SKHY Surveyor (VTOL Fixed-Wing)', price: 4500 },
    { id: 'fixed_wing_talon', name: 'Mini Talon (Long Range)', price: 1200 },
    { id: 'fixed_wing_composite_cruiser', name: 'SKHY Composite Cruiser (Mid-Wing)', price: 3500 },
    { id: 'fixed_wing_delta', name: 'Delta Flying Wing (Sprint)', price: 800 }
];

const PLACEHOLDER_IMG = 'https://i.ibb.co/LtbLd7J/placeholder.jpg';

async function run() {
    const { data: skhyUser } = await supabase.from('users').select('user_id').ilike('company_name', '%skhy%').limit(1);
    const seller_id = skhyUser && skhyUser.length > 0 ? skhyUser[0].user_id : null;

    let inserted = 0;
    
    for (const fw of fixedWings) {
        const record = {
            name: fw.name,
            description: `SKHY Simulator Asset: ${fw.name}`,
            category: 'Drone Platforms',
            base_price: fw.price,
            stock_quantity: 99,
            is_active: true,
            show_on_marketplace: true,
        };
        if (seller_id) record.user_id = seller_id;
        
        const { data: existing } = await supabase.from('products').select('id, name').eq('name', record.name).limit(1);
            
        if (existing && existing.length > 0) {
            console.log(`Skipping ${record.name}, already exists with ID ${existing[0].id}`);
            const productId = existing[0].id;
            const { data: assets } = await supabase.from('product_assets').select('id').eq('product_id', productId).limit(1);
            if (!assets || assets.length === 0) {
                 await supabase.from('product_assets').insert({
                     product_id: productId,
                     file_url: PLACEHOLDER_IMG,
                     asset_type: 'image',
                     is_primary: true
                 });
            }
            continue;
        }
        
        const { data: newProd, error } = await supabase.from('products').insert(record).select();
        if (error) {
            console.error(`Error inserting ${record.name}:`, error.message);
        } else if (newProd && newProd.length > 0) {
            const productId = newProd[0].id;
            await supabase.from('product_assets').insert({
                product_id: productId,
                file_url: PLACEHOLDER_IMG,
                asset_type: 'image',
                is_primary: true
            });
            console.log(`Inserted ${record.name} - $${record.base_price}`);
            inserted++;
        }
    }
    
    console.log(`Operation complete. Inserted ${inserted} new fixed wings.`);
}

run();
