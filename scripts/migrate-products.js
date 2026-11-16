
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root .env if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_EMAIL = 'nikki@skhy.systems';

// ------------------------------------------------------------------
// DATA DEFINITIONS (Copied/Adapted from src/data/productCatalog.ts and config.json)
// ------------------------------------------------------------------

const categoryTitles = {
    'acoustic': 'Acoustic Detection Systems',
    'edge-ai': 'Edge AI & RF Fusion',
    'ajgps': 'Anti-Jamming GNSS',
    'manet': 'MANET Radios'
};

const configPrices = {
    "skhy-a7": { "inr": 83000 },
    "skhy-a16": { "inr": 145000 },
    "skhy-mobisense": { "inr": 145000, "prefix": "From" },
    "aeroguard": { "inr": 12500, "prefix": "From" },
    "skhy-jamming-resilient": { "inr": 290000 },
    "skhy-light-edge-ai": { "inr": 89000 },
    "ajgps-301": { "inr": 239000 },
    "ajgps-302": { "inr": 308000 },
    "ajgps-303": { "inr": 477000 },
    "ajgps-601": { "inr": 503000 },
    "ajgps-602": { "inr": 542000 },
    "manet-overview": { "inr": 257640, "prefix": "From" },
    "manet-ab40": { "inr": 581724 },
    "manet-ab20": { "inr": 512116 },
    "manet-ab2": { "inr": 257640, "prefix": "From" },
    "manet-vc20": { "inr": 1039600 },
    "manet-hh20": { "inr": 366120 },
    "morrigan-ai": { "inr": 6650000, "prefix": "From" },
    "robin-platform": { "inr": 6650000, "prefix": "From" },
    "scarlet-platform": { "inr": 6650000, "prefix": "From" }
};

const productCatalog = [
    {
        id: 'skhy-a7',
        name: 'SKHY-A7: Compact Acoustic Sentinel',
        tagline: 'The lightweight standard for autonomous aerial & ground detection.',
        category: 'acoustic',
        imageUrl: 'https://i.ibb.co/kgX9nYCP/7-MEMS-Acoustic-sensor-with-sound-board-and-edge-computer.png',
        details: [
            {
                type: 'text',
                text: 'The SKHY-7 is our compact powerhouse. Designed for versatility, it integrates a 7-MEMS microphone array within a precision-machined aluminum housing. It is ideal for mounting on mid-sized drones or ground vehicles where weight is a critical factor without compromising on detection range and get directional heading of objects to be detected.'
            }
        ]
    },
    {
        id: 'skhy-a16',
        name: 'SKHY-A16: Long-Range Acoustic Array',
        tagline: 'Maximum sensitivity for high-value asset protection.',
        category: 'acoustic',
        imageUrl: 'https://i.ibb.co/ycG3jprJ/18cm-16-MEMS-sensor.png',
        details: [
            {
                type: 'text',
                text: 'The SKHY-16 significantly expands the acoustic aperture using a 16-MEMS array. With a larger 165mm aluminum circumference, this unit captures lower frequency signatures more effectively, providing extended warning times for high-speed threats like jet aircraft and get directional heading of the object.'
            }
        ]
    },
    {
        id: 'skhy-mobisense',
        name: 'SKHY-MOBISENSE: Multi-Spectral Mobile Station',
        tagline: 'Fusion of Acoustic and RF Intelligence on a Rapid-Deploy Mast.',
        category: 'acoustic',
        imageUrl: 'https://i.ibb.co/sdqMvbHs/acoustic-RF-sensor-with-metal-telescopic-mast.png',
        details: [
            {
                type: 'text',
                text: 'The SKHY-MOBISENSE is a turnkey solution for perimeter defense. It combines the precision of the SKHY-7 acoustic sensor with the electromagnetic spectrum awareness of dual Log-Periodic Dipole Array (LPDA) antennas. Mounted on a 5m telescopic mast, this system correlates sound and radio signals to virtually eliminate false positives.'
            }
        ]
    },
    {
        id: 'aeroguard',
        name: 'AeroGuard: Aerodynamic Protective Cones',
        tagline: 'Flight-ready protection for SKHY sensors.',
        category: 'acoustic',
        imageUrl: 'https://i.ibb.co/8DWd3ff3/7-MEMS-mounted-on-drone.png',
        details: [
            {
                type: 'text',
                text: 'Designed for airborne applications, the AeroGuard series provides aerodynamic efficiency and physical protection for the MEMS sensor arrays. Manufactured from ultra-lightweight Carbon Fiber, these cones minimize drag on fixed-wing drones while allowing sound waves to penetrate freely.'
            }
        ]
    },
    {
        id: 'skhy-jamming-resilient',
        name: 'SKHY Jamming Resilient Edge AI & RF Fusion Node',
        tagline: 'Multi-domain edge computing & signal intelligence unit.',
        category: 'edge-ai',
        imageUrl: 'https://i.ibb.co/Vc6GZCnC/skhy-jamming-resilient-AI-edge-RF-fusion-device.png',
        details: [
            {
                type: 'specs',
                text: 'Multi-Domain Edge Computing & Signal Intelligence Unit'
            }
        ]
    },
    {
        id: 'skhy-light-edge-ai',
        name: 'SKHY Light Edge AI & RF Fusion Node',
        tagline: 'Compact edge compute for RF/Acoustic classification.',
        category: 'edge-ai',
        imageUrl: 'https://i.ibb.co/CKqc1B4t/skhy-light-edge-AI.png',
        details: [
            {
                type: 'specs',
                text: 'Compact edge compute for RF/Acoustic classification.'
            }
        ]
    },
    {
        id: 'ajgps-301',
        name: 'AJGPS 301 Four-channel GNSS Anti-Jamming System',
        tagline: '4-channel GNSS anti-interference with anti-deception.',
        category: 'ajgps',
        imageUrl: 'https://i.ibb.co/MxYgYTHs/ajgps301-2.png',
        details: [
            {
                type: 'text',
                text: 'This anti-interference system is designed to receive, amplify, down-convert, filter and perform anti-interference processing on the BDS_B1, GPS_L1, GAL_E1 frequency signals of 4 channels.'
            }
        ]
    },
    {
        id: 'ajgps-302',
        name: 'AJGPS 302 Four-channel GNSS Anti-Jamming System',
        tagline: '4-channel GNSS anti-jam with wide input voltage.',
        category: 'ajgps',
        imageUrl: 'https://i.ibb.co/q3n8qGgT/ajgps302-2.png',
        details: [
            {
                type: 'text',
                text: 'This anti-interference system is designed to receive, amplify, down-convert, filter and perform anti-interference processing on the BDS_B1, GPS_L1, GAL_E1, GLO_G1 frequency signals of 4 channels.'
            }
        ]
    },
    {
        id: 'ajgps-303',
        name: 'AJGPS 303 Four-channel GNSS Anti-Jamming System',
        tagline: '4-channel GNSS anti-jam for GPS_L1/L2/L5 + GALILEO_E1.',
        category: 'ajgps',
        imageUrl: 'https://i.ibb.co/1JGXhntp/ajgps303-2.png',
        details: [
            {
                type: 'text',
                text: 'This anti-interference system is designed to receive, amplify, down-convert, filter and perform anti-interference processing on the GPS_L1, GPS_L2, GPS_L5 frequency signals of 4 channels.'
            }
        ]
    },
    {
        id: 'ajgps-601',
        name: 'AJGPS 601 Eight-channel GNSS Anti-Jamming System',
        tagline: '8-channel anti-jam processing to counter six broadband sources.',
        category: 'ajgps',
        imageUrl: 'https://i.ibb.co/FqkqxxFZ/ajgps601-3.png',
        details: [
            {
                type: 'text',
                text: 'The anti-jam system is designed to receive, amplify, down-convert, filter, and perform anti-jam processing on 7 channels of Bei Dou BDS B1, GPS L1, GLONASS G1 frequency signals.'
            }
        ]
    },
    {
        id: 'ajgps-602',
        name: 'AJGPS 602 Eight-channel GNSS Anti-Jamming System',
        tagline: 'Compact low-power anti-interference processing with 9 channels.',
        category: 'ajgps',
        imageUrl: 'https://i.ibb.co/yck3YNWV/ajgps602.png',
        details: [
            {
                type: 'text',
                text: 'The anti-jam system is designed to receive, amplify, down-convert, filter, and perform anti-jam processing on 9 channels of Bei Dou BDS B1, GPS L1, GALILEO E1, GLONASS G1 frequency signals.'
            }
        ]
    },
    {
        id: 'manet-overview',
        name: 'SKHY Enhanced MANET Solutions (Overview)',
        tagline: 'High-throughput resilient mesh networking with performance upgrade tiers.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'text',
                text: 'High-throughput resilient mesh networking with performance upgrade tiers.'
            }
        ]
    },
    {
        id: 'manet-ab40',
        name: 'AB40 MANET Radio (High-Altitude Backbone)',
        tagline: '100–200 km LOS air-to-ground backbone radio for high-altitude relay.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'specs',
                text: '100–200 km LOS air-to-ground backbone radio for high-altitude relay.'
            }
        ]
    },
    {
        id: 'manet-ab20',
        name: 'AB20 MANET Radio (Medium ISR – Active Cooling)',
        tagline: '50–100 km LOS air-to-ground medium ISR mesh node.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'specs',
                text: '50–100 km LOS air-to-ground medium ISR mesh node.'
            }
        ]
    },
    {
        id: 'manet-ab2',
        name: 'AB2 MANET Radio (Tactical Swarm)',
        tagline: '20–50 km LOS tactical swarm mesh node for drones and small platforms.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'specs',
                text: '20–50 km LOS tactical swarm mesh node for drones and small platforms.'
            }
        ]
    },
    {
        id: 'manet-vc20',
        name: 'VC20 MANET Ground Command Unit (Four-band Antennas)',
        tagline: 'Ground command unit: 30–50 km ground-to-ground, 100+ km ground-to-air.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'specs',
                text: 'Ground command unit: 30–50 km ground-to-ground, 100+ km ground-to-air.'
            }
        ]
    },
    {
        id: 'manet-hh20',
        name: 'HH20 MANET Dual-Band Ground User',
        tagline: 'Dual-band user node: 10–30 km open ground, 1–5 km urban/obstructed.',
        category: 'manet',
        imageUrl: 'https://i.postimg.cc/sgCYy2Jh/threat-awareness-prevention.jpg?auto=compress&cs=tiny',
        details: [
            {
                type: 'specs',
                text: 'Dual-band user node: 10–30 km open ground, 1–5 km urban/obstructed.'
            }
        ]
    }
];

// ------------------------------------------------------------------
// MIGRATION LOGIC
// ------------------------------------------------------------------

async function migrate() {
    console.log(`🚀 Starting migration for user: ${TARGET_EMAIL}`);

    // 1. Get User ID
    const { data: userData, error: userError } = await supabase
        .from('users')
        .select('user_id')
        .eq('email', TARGET_EMAIL)
        .single();

    if (userError || !userData) {
        if (userError && userError.code === 'PGRST116') {
            console.error(`❌ User '${TARGET_EMAIL}' not found in 'users' table.`);
            // Try searching in auth.users just in case, but usually we rely on public.users
            console.error('   Please ensure the user has signed up and is in the public.users table.');
        } else {
            console.error('❌ Error fetching user:', userError);
        }
        process.exit(1);
    }

    const userId = userData.user_id;
    console.log(`✅ Found user ID: ${userId}`);

    let successCount = 0;
    let skipCount = 0;
    let failCount = 0;

    // 2. Iterate and Insert
    for (const item of productCatalog) {
        // Filter out items not in our target categories
        if (!['acoustic', 'edge-ai', 'ajgps', 'manet'].includes(item.category)) {
            continue;
        }

        try {
            console.log(`\n📦 Processing: ${item.name}`);

            // Check if already exists to avoid duplicates
            const { data: existing } = await supabase
                .from('products')
                .select('id')
                .eq('user_id', userId)
                .eq('name', item.name)
                .maybeSingle();

            if (existing) {
                console.log(`   ⚠️  Product already exists (ID: ${existing.id}). Skipping.`);
                skipCount++;
                continue;
            }

            // Prepare data
            const mappedCategory = categoryTitles[item.category] || item.category;

            const priceData = configPrices[item.id];
            const basePrice = priceData ? priceData.inr : 0;

            // Construct description from details if possible
            let description = item.tagline;
            if (item.details && item.details.length > 0) {
                const firstText = item.details.find(d => d.type === 'text');
                if (firstText && firstText.text) {
                    // Append a bit of detail but keep it reasonable length if needed. 
                    // Postgres text is fine with long strings.
                    description += '\n\n' + firstText.text;
                }
            }

            const productPayload = {
                name: item.name,
                description: description,
                type: 'hardware',
                category: mappedCategory,
                base_price: basePrice,
                currency: 'INR', // Using source currency
                pricing_model: 'flat',
                user_id: userId,
                tax_exempt: false, // Default
                is_active: true
            };

            // Insert Product
            const { data: productData, error: insertError } = await supabase
                .from('products')
                .insert([productPayload])
                .select()
                .single();

            if (insertError) {
                throw insertError;
            }

            const newProductId = productData.id;
            console.log(`   ✅ Created product! (ID: ${newProductId})`);

            // 3. Insert Assets (Image)
            if (item.imageUrl) {
                const assetPayload = {
                    product_id: newProductId,
                    asset_type: 'image',
                    file_url: item.imageUrl
                };

                const { error: assetError } = await supabase
                    .from('product_assets')
                    .insert([assetPayload]);

                if (assetError) {
                    console.error(`   ❌ Failed to link image asset:`, assetError.message);
                } else {
                    console.log(`   Example image linked.`);
                }
            }

            successCount++;

        } catch (err) {
            console.error(`   ❌ Failed to process item ${item.name}:`, err.message);
            failCount++;
        }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('Migration Summary');
    console.log(`✅ Success: ${successCount}`);
    console.log(`⚠️  Skipped: ${skipCount}`);
    console.log(`❌ Failed:  ${failCount}`);
    console.log('═══════════════════════════════════════════════════════════\n');
}

migrate();
