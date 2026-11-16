
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
    {
        id: 896144026,
        specifications: [
            {"parameter": "Configuration", "value": "6S3P"},
            {"parameter": "Nominal Voltage", "value": "21.6V"},
            {"parameter": "Capacity", "value": "13500mAh"},
            {"parameter": "Energy", "value": "291.6Wh"},
            {"parameter": "Max Continuous Discharge", "value": "135A"},
            {"parameter": "Cell Type", "value": "21700 Lithium-Ion"}
        ]
    },
    {
        id: 2007802693,
        specifications: [
            {"parameter": "Configuration", "value": "4S1P"},
            {"parameter": "Nominal Voltage", "value": "14.8V"},
            {"parameter": "Capacity", "value": "5000mAh"},
            {"parameter": "Discharge Rate", "value": "35C"},
            {"parameter": "Max Continuous Current", "value": "175A"},
            {"parameter": "Connector", "value": "XT60"}
        ]
    },
    {
        id: 230423742,
        specifications: [
            {"parameter": "Configuration", "value": "6S1P"},
            {"parameter": "Nominal Voltage", "value": "22.2V"},
            {"parameter": "Capacity", "value": "22000mAh"},
            {"parameter": "Energy", "value": "488.4Wh"},
            {"parameter": "Discharge Rate", "value": "25C"},
            {"parameter": "Max Continuous Current", "value": "550A"}
        ]
    },
    {
        id: 510581947,
        specifications: [
            {"parameter": "Configuration", "value": "12S1P"},
            {"parameter": "Nominal Voltage", "value": "44.4V"},
            {"parameter": "Capacity", "value": "16000mAh"},
            {"parameter": "Energy", "value": "710Wh"},
            {"parameter": "Connector", "value": "AS150U Anti-Spark"},
            {"parameter": "Features", "value": "Smart BMS with Telemetry"}
        ]
    },
    {
        id: 2013919665,
        specifications: [
            {"parameter": "Configuration", "value": "6S1P"},
            {"parameter": "Nominal Voltage", "value": "22.2V"},
            {"parameter": "Capacity", "value": "16000mAh"},
            {"parameter": "Energy", "value": "355.2Wh"},
            {"parameter": "Max Continuous Discharge", "value": "15C-25C"},
            {"parameter": "Application", "value": "Agricultural / Heavy Lift"}
        ]
    },
    {
        id: 900026,
        specifications: [
            {"parameter": "Frequency Range", "value": "300 MHz - 6 GHz"},
            {"parameter": "Throughput", "value": "Up to 100 Mbps"},
            {"parameter": "Output Power", "value": "Up to 4W (8W Beamforming)"},
            {"parameter": "Bandwidth", "value": "5, 10, 20 MHz"},
            {"parameter": "MIMO", "value": "MN-MIMO with Beamforming"},
            {"parameter": "Form Factor", "value": "Rugged Brick / OEM"}
        ]
    },
    {
        id: 900025,
        specifications: [
            {"parameter": "Frequency Range", "value": "L-UHF, U-UHF, L/S Bands"},
            {"parameter": "Throughput", "value": "16 - 32 Mbps"},
            {"parameter": "Output Power", "value": "100mW to 2W (Configurable)"},
            {"parameter": "Bandwidth", "value": "1.2, 4, 10, 20, 40 MHz"},
            {"parameter": "Environmental", "value": "MIL-STD-810G, IP68"},
            {"parameter": "Weight", "value": "0.32 kg"}
        ]
    },
    {
        id: 900020,
        specifications: [
            {"parameter": "Type", "value": "Primary MANET Command Node"},
            {"parameter": "Antenna Array", "value": "Four-Band Spatial Diversity"},
            {"parameter": "Range", "value": "100+ km Ground-to-Air LOS"},
            {"parameter": "Interface", "value": "Gigabit LAN"},
            {"parameter": "Security", "value": "Hardware AES-256 Crypto"},
            {"parameter": "Mounting", "value": "19-inch 1U or Tripod"}
        ]
    }
];

async function enrichSpecifications() {
    console.log(`Starting enrichment of ${updates.length} products...`);

    for (const update of updates) {
        try {
            const { error } = await supabase
                .from('products')
                .update({ specifications: update.specifications })
                .eq('id', update.id);

            if (error) {
                console.error(`❌ Failed to update product ${update.id}:`, error.message);
            } else {
                console.log(`✅ Updated product ${update.id}`);
            }
        } catch (err) {
            console.error(`❌ Error updating product ${update.id}:`, err.message);
        }
    }

    console.log('Enrichment complete.');
}

enrichSpecifications();
