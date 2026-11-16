import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
};

async function enrichProducts() {
    console.log('Fetching products for enrichment...');
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*`, { headers });
    if (!res.ok) {
        console.error('Failed to fetch products:', await res.text());
        return;
    }
    const products = await res.json();
    console.log(`Processing ${products.length} products...`);

    for (const product of products) {
        const desc = product.description || '';
        const updates: any = {};

        // 1. Extract Features (if empty)
        if (!product.features || product.features.length === 0) {
            // Look for bullet points or lists in description
            let lines = desc.split('\n').map((l: string) => l.trim()).filter((l: string) => l.startsWith('-') || l.startsWith('•') || l.startsWith('*'));
            
            if (lines.length === 0) {
                // Try splitting by semicolon or period if there are technical keywords
                const techKeywords = ['gain', 'range', 'weight', 'frequency', 'power', 'vswr', 'efficiency', 'connector', 'dimensions', 'mimo', 'independent', 'dual-channel'];
                const sentences = desc.split(/[.;|]/).map((s: string) => s.trim()).filter((s: string) => s.length > 10 && s.length < 150);
                lines = sentences.filter((s: string) => techKeywords.some(k => s.toLowerCase().includes(k)));
            }

            if (lines.length > 0) {
                updates.features = lines.map((l: string) => l.replace(/^[-•*]\s*/, '').trim()).slice(0, 10);
            }
        }

        // 2. Extract Power Draw (if null)
        if (product.power_draw_w === null) {
            const powerMatch = desc.match(/(\d+(\.\d+)?)\s*(W|Watt|watts)/i);
            if (powerMatch) {
                updates.power_draw_w = parseFloat(powerMatch[1]);
            } else {
                // Look for Voltage and Current
                const vMatch = desc.match(/(\d+(\.\d+)?)\s*(V|Volt|VDC)/i);
                const aMatch = desc.match(/(\d+(\.\d+)?)\s*(mA|A|Amp)/i);
                if (vMatch && aMatch) {
                    let v = parseFloat(vMatch[1]);
                    let a = parseFloat(aMatch[1]);
                    if (aMatch[3].toLowerCase() === 'ma') a = a / 1000;
                    updates.power_draw_w = parseFloat((v * a).toFixed(2));
                }
            }
        }

        // 3. Extract Pin Layout (if null)
        if (!product.pin_layout) {
            // Look for keywords
            const layoutKeywords = ['Pinout', 'Pin layout', 'Interface', 'Connector', 'Wiring'];
            if (layoutKeywords.some(k => desc.toLowerCase().includes(k.toLowerCase()))) {
                // Try to grab the line or section
                const lines = desc.split('\n');
                const layoutLine = lines.find((l: string) => layoutKeywords.some(k => l.toLowerCase().includes(k.toLowerCase())));
                if (layoutLine && layoutLine.length > 10) {
                    updates.pin_layout = layoutLine.trim();
                }
            }
        }

        // 4. Standardize Category
        if (!product.category || product.category === 'Hardware') {
            const name = product.name.toLowerCase();
            if (name.includes('amplifier') || name.includes('booster') || name.includes('signal extender')) {
                updates.category = 'RF Components';
                updates.subcategory = 'Signal Boosters';
            } else if (name.includes('jammer') || name.includes('interdiction')) {
                updates.category = 'Electronic Warfare';
                updates.subcategory = 'Drone Jammers';
            } else if (name.includes('gps') || name.includes('gnss')) {
                updates.category = 'Navigation';
                updates.subcategory = 'GPS Modules';
            } else if (name.includes('link') || name.includes('telemetry')) {
                updates.category = 'Communication';
                updates.subcategory = 'Data Links';
            }
        }

        if (Object.keys(updates).length > 0) {
            console.log(`Updating ${product.sku || product.name}:`, updates);
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify(updates)
            });
            if (!updateRes.ok) {
                console.error(`Failed to update ${product.id}:`, await updateRes.text());
            }
        }
    }

    console.log('Enrichment complete!');
}

enrichProducts().catch(console.error);
