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

const configs = [];
const blocks = content.match(/\{\s*id:\s*'[^']+',\s*name:\s*'[^']+',\s*description:\s*'[^']+',\s*platform:\s*'[^']+',[^}]+specs:\s*\{[^}]+\}\s*\}/g) || [];

for (const block of blocks) {
    const id = block.match(/id:\s*'([^']+)'/)?.[1] || 'unknown';
    const name = block.match(/name:\s*'([^']+)'/)?.[1] || 'Unknown Drone';
    const desc = block.match(/description:\s*'([^']+)'/)?.[1] || 'Pre-configured drone system.';
    const platform = block.match(/platform:\s*'([^']+)'/)?.[1] || 'multirotor';
    
    const suitabilityMatch = block.match(/suitability:\s*\[(.*?)\]/);
    const suitability = suitabilityMatch ? suitabilityMatch[1].replace(/'/g, '').split(',').map(s => s.trim()) : [];

    configs.push({ id, name, description: desc, platform, suitability });
}

if (configs.length === 0) {
    const simpleBlocks = content.match(/\{\s*id:\s*'[^']+',\s*name:\s*'[^']+',[\s\S]*?specs:\s*\{[\s\S]*?\}\s*\}/g) || [];
    for (const block of simpleBlocks) {
        const id = block.match(/id:\s*'([^']+)'/)?.[1] || 'unknown';
        const name = block.match(/name:\s*'([^']+)'/)?.[1] || 'Unknown Drone';
        const desc = block.match(/description:\s*'([^']+)'/)?.[1] || 'Pre-configured drone system.';
        const platform = block.match(/platform:\s*'([^']+)'/)?.[1] || 'multirotor';
        const suitabilityMatch = block.match(/suitability:\s*\[(.*?)\]/);
        const suitability = suitabilityMatch ? suitabilityMatch[1].replace(/'/g, '').split(',').map(s => s.trim()) : [];
        configs.push({ id, name, description: desc, platform, suitability });
    }
}

function getArchetypeImage(config) {
    const s = config.suitability.join(' ').toLowerCase();
    const platform = config.platform.toLowerCase();
    const name = config.name.toLowerCase();

    if (platform === 'multirotor') {
        if (s.includes('agri') || name.includes('agri') || s.includes('spray')) return 'https://upload.wikimedia.org/wikipedia/commons/d/dc/Drone_crop_fertilizer.jpg';
        if (s.includes('heavy') || s.includes('logistics') || s.includes('cargo') || name.includes('heavy')) return 'https://images.unsplash.com/photo-1579820010410-c10411aaaa88?q=80&w=800';
        if (s.includes('tactical') || s.includes('defense') || s.includes('recon') || s.includes('stealth')) return 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?q=80&w=800';
        if (s.includes('survey') || s.includes('inspection') || s.includes('lidar') || s.includes('mapping')) return 'https://images.unsplash.com/photo-1527668752968-14dc70a27c95?q=80&w=800';
        return 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=800';
    } else {
        if (s.includes('tactical') || s.includes('defense') || s.includes('interception')) return 'https://upload.wikimedia.org/wikipedia/commons/1/12/MQ-9_Reaper_UAV_%28cropped%29.jpg';
        return 'https://images.unsplash.com/photo-1563223771-5fe4038fbfc9?q=80&w=800';
    }
}

function getEstimatedPrice(config) {
    const s = config.suitability.join(' ').toLowerCase();
    let price = 5000;
    if (s.includes('heavy')) price += 10000;
    if (s.includes('tactical')) price += 5000;
    if (s.includes('survey')) price += 3000;
    if (config.platform === 'fixed-wing') price += 8000;
    return price;
}

async function run() {
    console.log(`Starting to insert ${configs.length} pre-configured drones...`);
    
    const { data: skhyUser } = await supabase.from('users').select('user_id').ilike('company_name', '%skhy%').limit(1);
    const seller_id = skhyUser && skhyUser.length > 0 ? skhyUser[0].user_id : null;

    let inserted = 0;
    
    for (const config of configs) {
        const record = {
            name: config.name,
            description: config.description,
            category: 'Pre-configured Systems',
            base_price: getEstimatedPrice(config),
            stock_quantity: 10,
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
                     file_url: getArchetypeImage(config),
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
                file_url: getArchetypeImage(config),
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
