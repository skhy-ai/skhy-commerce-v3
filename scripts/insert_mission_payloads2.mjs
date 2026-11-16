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

const configsPath = path.join(ROOT, 'src', 'data', 'preGeneratedConfigs.ts');
const content = fs.readFileSync(configsPath, 'utf8');
const payloadRegex = /payload:\s*'([^']+)'/g;

let match;
const payloadSet = new Set();
while ((match = payloadRegex.exec(content)) !== null) {
    payloadSet.add(match[1]);
}

const payloads = Array.from(payloadSet);
const PLACEHOLDER_IMG = 'https://i.ibb.co/LtbLd7J/placeholder.jpg';

function getEstimatedPrice(id) {
    const s = id.toLowerCase();
    if (s.includes('lidar') || s.includes('rieghl')) return 5000;
    if (s.includes('camera') || s.includes('eo') || s.includes('cam') || s.includes('gimbal') || s.includes('thermal') || s.includes('zenmuse') || s.includes('sony') || s.includes('flir') || s.includes('optics') || s.includes('vision') || s.includes('photogrammetry')) return 1500;
    if (s.includes('radar') || s.includes('sensor') || s.includes('analyzer') || s.includes('detector') || s.includes('gnss')) return 1200;
    if (s.includes('radio') || s.includes('booster') || s.includes('jammer') || s.includes('mesh') || s.includes('ew') || s.includes('ais')) return 800;
    if (s.includes('hook') || s.includes('winch') || s.includes('grabber') || s.includes('release')) return 150;
    if (s.includes('tank') || s.includes('pod') || s.includes('box') || s.includes('case') || s.includes('carrier') || s.includes('bay') || s.includes('pallet') || s.includes('container') || s.includes('dispenser')) return 80;
    return 300;
}

function formatName(id) {
    return id.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
             .split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function run() {
    console.log(`Starting to insert ${payloads.length} payloads and 3 motors...`);
    
    const records = [];
    
    for (const p of payloads) {
        records.push({
            name: formatName(p),
            description: `SKHY Simulator Asset: ${formatName(p)}`,
            category: 'Drone Components',
            base_price: getEstimatedPrice(p),
            stock_quantity: 99,
            is_active: true,
            show_on_marketplace: true,
            // Assuming we need a user_id for seller, let's look up SKHY user or just leave seller blank if it's optional
            // We'll leave seller out for now if not required, or fetch the SKHY user id
        });
    }

    records.push({
        name: 'Zerodrag 3115 (900KV)',
        description: 'Zerodrag 3115 Drone Motor',
        category: 'Drone Components',
        base_price: 45,
        stock_quantity: 99,
        
        is_active: true,
        show_on_marketplace: true
    });
    records.push({
        name: 'Zerodrag 2807 (1300KV)',
        description: 'Zerodrag 2807 Drone Motor',
        category: 'Drone Components',
        base_price: 32,
        stock_quantity: 99,
        
        is_active: true,
        show_on_marketplace: true
    });
    records.push({
        name: 'Zerodrag 1404 (3800KV)',
        description: 'Zerodrag 1404 Drone Motor',
        category: 'Drone Components',
        base_price: 18,
        stock_quantity: 99,
        
        is_active: true,
        show_on_marketplace: true
    });

    // Let's get the SKHY user id
    const { data: skhyUser } = await supabase.from('users').select('user_id').ilike('company_name', '%skhy%').limit(1);
    const seller_id = skhyUser && skhyUser.length > 0 ? skhyUser[0].user_id : null;

    let inserted = 0;
    
    for (const record of records) {
        if (seller_id) record.user_id = seller_id;
        
        const { data: existing } = await supabase.from('products').select('id, name').eq('name', record.name).limit(1);
            
        if (existing && existing.length > 0) {
            console.log(`Skipping ${record.name}, already exists with ID ${existing[0].id}`);
            // Let's make sure it has an asset just in case
            const productId = existing[0].id;
            const { data: assets } = await supabase.from('product_assets').select('id').eq('product_id', productId).limit(1);
            if (!assets || assets.length === 0) {
                 await supabase.from('product_assets').insert({
                     product_id: productId,
                     file_url: PLACEHOLDER_IMG,
                     asset_type: 'image',
                     is_primary: true
                 });
                 console.log(`  -> Added missing asset for ${record.name}`);
            }
            continue;
        }
        
        const { data: newProd, error } = await supabase.from('products').insert(record).select();
        if (error) {
            console.error(`Error inserting ${record.name}:`, error.message);
        } else if (newProd && newProd.length > 0) {
            const productId = newProd[0].id;
            const { error: assetError } = await supabase.from('product_assets').insert({
                product_id: productId,
                file_url: PLACEHOLDER_IMG,
                asset_type: 'image',
                is_primary: true
            });
            
            if (assetError) {
                console.error(`  Error inserting asset for ${record.name}:`, assetError.message);
            } else {
                console.log(`Inserted ${record.name} - $${record.base_price}`);
                inserted++;
            }
        }
    }
    
    console.log(`\nOperation complete. Inserted ${inserted} new items.`);
}

run();
