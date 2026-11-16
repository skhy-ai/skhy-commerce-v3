
import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars from root .env if it exists
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error('❌ Missing DATABASE_URL environment variable');
    process.exit(1);
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

const TARGET_EMAIL = 'nikki@skhy.systems';

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

async function migrate() {
    const client = await pool.connect();
    console.log(`🚀 Starting migration for user: ${TARGET_EMAIL}`);

    try {
        await client.query('BEGIN');

        // 1. Get User ID
        const userRes = await client.query(
            'SELECT user_id FROM users WHERE email = $1 UNION SELECT id as user_id FROM auth.users WHERE email = $1 LIMIT 1',
            [TARGET_EMAIL]
        );

        if (userRes.rows.length === 0) {
            console.error(`❌ User '${TARGET_EMAIL}' not found in 'users' or 'auth.users'.`);
            await client.query('ROLLBACK');
            process.exit(1);
        }

        const userId = userRes.rows[0].user_id;
        console.log(`✅ Found user ID: ${userId}`);

        let successCount = 0;
        let skipCount = 0;

        // 2. Iterate and Insert
        for (const item of productCatalog) {
            if (!['acoustic', 'edge-ai', 'ajgps', 'manet'].includes(item.category)) {
                continue;
            }

            console.log(`\n📦 Processing: ${item.name}`);

            // Check existence
            const existRes = await client.query(
                'SELECT id FROM products WHERE user_id = $1 AND name = $2',
                [userId, item.name]
            );

            if (existRes.rows.length > 0) {
                console.log(`   ⚠️  Product already exists (ID: ${existRes.rows[0].id}). Skipping.`);
                skipCount++;
                continue;
            }

            // Prepare data
            const mappedCategory = categoryTitles[item.category] || item.category;
            const priceData = configPrices[item.id];
            const basePrice = priceData ? priceData.inr : 0;

            let description = item.tagline;
            if (item.details && item.details.length > 0) {
                const firstText = item.details.find(d => d.type === 'text');
                if (firstText && firstText.text) {
                    description += '\n\n' + firstText.text;
                }
            }

            // Insert Product
            const insertRes = await client.query(
                `INSERT INTO products (
          name, description, type, category, base_price, currency, 
          pricing_model, user_id, tax_exempt, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id`,
                [
                    item.name,
                    description,
                    'hardware',
                    mappedCategory,
                    basePrice,
                    'INR',
                    'flat',
                    userId,
                    false,
                    true
                ]
            );

            const newProductId = insertRes.rows[0].id;
            console.log(`   ✅ Created product! (ID: ${newProductId})`);

            // 3. Insert Assets
            if (item.imageUrl) {
                await client.query(
                    `INSERT INTO product_assets (product_id, asset_type, file_url) VALUES ($1, $2, $3)`,
                    [newProductId, 'image', item.imageUrl]
                );
                console.log(`   Example image linked.`);
            }

            successCount++;
        }

        await client.query('COMMIT');

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('Migration Summary');
        console.log(`✅ Success: ${successCount}`);
        console.log(`⚠️  Skipped: ${skipCount}`);
        console.log('═══════════════════════════════════════════════════════════\n');

    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ Migration failed:', e);
        process.exit(1);
    } finally {
        client.release();
        await pool.end();
    }
}

migrate();
