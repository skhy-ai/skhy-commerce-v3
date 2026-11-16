import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

// Load environment variables
dotenv.config({ path: path.join(ROOT, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY; // Or service key

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Parse preGeneratedConfigs.ts to get all payloads
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
    
    // Add Payloads
    for (const p of payloads) {
        records.push({
            name: formatName(p),
            description: `SKHY Simulator Asset: ${formatName(p)}`,
            category: 'Payload', // Actually, Drone Components is main. Let's use Drone Components and rely on tags or just let them be Drone Components.
            // Let's use Drone Components so the marketplace loader picks them up.
            base_price: getEstimatedPrice(p),
            stock_quantity: 99,
            seller_name: 'SKHY OEM',
            status: 'active',
            image_url: PLACEHOLDER_IMG
        });
    }

    // Add Missing Motors
    records.push({
        name: 'Zerodrag 3115 (900KV)',
        description: 'Zerodrag 3115 Drone Motor',
        category: 'Drone Components',
        base_price: 45,
        stock_quantity: 99,
        seller_name: 'Zerodrag',
        status: 'active',
        image_url: PLACEHOLDER_IMG
    });
    records.push({
        name: 'Zerodrag 2807 (1300KV)',
        description: 'Zerodrag 2807 Drone Motor',
        category: 'Drone Components',
        base_price: 32,
        stock_quantity: 99,
        seller_name: 'Zerodrag',
        status: 'active',
        image_url: PLACEHOLDER_IMG
    });
    records.push({
        name: 'Zerodrag 1404 (3800KV)',
        description: 'Zerodrag 1404 Drone Motor',
        category: 'Drone Components',
        base_price: 18,
        stock_quantity: 99,
        seller_name: 'Zerodrag',
        status: 'active',
        image_url: PLACEHOLDER_IMG
    });

    // We will use upsert to avoid creating exact duplicates based on name if they already exist.
    // Wait, name is not uniquely constrained in Supabase by default unless we set it.
    // We can just query by name first and only insert if not found.
    
    let inserted = 0;
    
    for (const record of records) {
        // override category to 'Drone Components' so useMarketplace picks them up without issue
        record.category = 'Drone Components';
        record.is_active = true;
        record.show_on_marketplace = true;
        
        // check if it exists
        const { data: existing } = await supabase.from('products')
            .select('id, name')
            .eq('name', record.name)
            .limit(1);
            
        if (existing && existing.length > 0) {
            console.log(`Skipping ${record.name}, already exists with ID ${existing[0].id}`);
            continue;
        }
        
        const { error } = await supabase.from('products').insert(record);
        if (error) {
            console.error(`Error inserting ${record.name}:`, error.message);
        } else {
            console.log(`Inserted ${record.name} - $${record.base_price}`);
            inserted++;
        }
    }
    
    console.log(`\nOperation complete. Inserted ${inserted} new items.`);
}

run();
