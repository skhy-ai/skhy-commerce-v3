import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config({ path: '.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function checkTmotorPricing() {
    const endpoint = `${supabaseUrl}/rest/v1/products?select=id,name,base_price,currency,sku&manufacturer=ilike.*T-MOTOR*`;

    const response = await fetch(endpoint, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    });

    const data = await response.json();
    console.log(`Found ${data.length} T-MOTOR products:`);
    console.table(data);
    fs.writeFileSync('src/data/tmotor_pricing.json', JSON.stringify(data, null, 2));
}

async function updateCRPAPricing() {
    // Find AJGPS / CRPA products
    const endpoint = `${supabaseUrl}/rest/v1/products?select=id,name,base_price,currency,sku&name=ilike.*AJGPS*`;

    const response = await fetch(endpoint, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    });

    let data = await response.json();
    console.log(`\nFound ${data.length} AJGPS/CRPA products:`);
    
    // Also try CRPA
    const endpoint2 = `${supabaseUrl}/rest/v1/products?select=id,name,base_price,currency,sku&name=ilike.*CRPA*`;
    const response2 = await fetch(endpoint2, {
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data2 = await response2.json();
    console.log(`Found ${data2.length} CRPA products (by CRPA keyword)`);
    
    // Combine and deduplicate
    const allCrpa = [...data, ...data2];
    const uniqueCrpa = Array.from(new Set(allCrpa.map(a => a.id)))
        .map(id => allCrpa.find(a => a.id === id));
        
    console.table(uniqueCrpa);
    
    for (const product of uniqueCrpa) {
        const newPrice = product.base_price * 0.9;
        console.log(`Updating ${product.name} from ${product.base_price} to ${newPrice}`);
        
        // Update in Supabase
        const updateEndpoint = `${supabaseUrl}/rest/v1/products?id=eq.${product.id}`;
        const updateRes = await fetch(updateEndpoint, {
            method: 'PATCH',
            headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ base_price: newPrice })
        });
        
        if (!updateRes.ok) {
            console.error(`Failed to update ${product.id}`);
        } else {
            console.log(`Successfully updated ${product.id}`);
        }
    }
}

async function run() {
    await checkTmotorPricing();
    await updateCRPAPricing();
}

run();
