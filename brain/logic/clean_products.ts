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

async function cleanProducts() {
    console.log('Fetching all products for cleaning...');
    const res = await fetch(`${supabaseUrl}/rest/v1/products?select=*,product_assets(id)`, { headers });
    if (!res.ok) {
        console.error('Failed to fetch products:', await res.text());
        return;
    }
    const products = await res.json();
    console.log(`Analyzing ${products.length} products...`);

    // --- 1. Duplicate Removal ---
    const groups = new Map<string, any[]>();
    products.forEach((p: any) => {
        const key = (p.sku || p.name).toLowerCase().trim();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(p);
    });

    const toDelete: number[] = [];
    for (const [key, list] of groups.entries()) {
        if (list.length > 1) {
            // Rank them by data completeness
            list.sort((a, b) => {
                const aScore = Object.values(a).filter(v => v !== null && v !== '').length;
                const bScore = Object.values(b).filter(v => v !== null && v !== '').length;
                return bScore - aScore; // Highest score first
            });

            // Keep the best one, delete the rest
            const keep = list[0];
            const others = list.slice(1);
            console.log(`Duplicate Group [${key}]: Keeping ID ${keep.id}, deleting ${others.map(o => o.id).join(', ')}`);
            others.forEach(o => toDelete.push(o.id));
        }
    }

    if (toDelete.length > 0) {
        console.log(`Deleting ${toDelete.length} duplicate products...`);
        // Batch delete
        for (let i = 0; i < toDelete.length; i += 50) {
            const chunk = toDelete.slice(i, i + 50);
            const delRes = await fetch(`${supabaseUrl}/rest/v1/products?id=in.(${chunk.join(',')})`, {
                method: 'DELETE',
                headers
            });
            if (!delRes.ok) console.error(`Failed to delete chunk:`, await delRes.text());
        }
    }

    // --- 2. Pin Layout Sanitization ---
    console.log('Sanitizing pin layouts...');
    let sanitizedCount = 0;
    for (const product of products) {
        if (toDelete.includes(product.id)) continue;

        let pinLayout = product.pin_layout;
        let needsUpdate = false;

        if (pinLayout) {
            const layoutStr = typeof pinLayout === 'string' ? pinLayout : JSON.stringify(pinLayout);
            
            // Criteria for "incorrectly copied description"
            const isTooLong = layoutStr.length > 250;
            const containsDescKeywords = ['deliver', 'provide', 'performance', 'advanced', 'clean', 'perfect', 'ensure'];
            const looksLikeSentence = layoutStr.split(' ').length > 20;
            
            if (isTooLong || (looksLikeSentence && containsDescKeywords.some(k => layoutStr.toLowerCase().includes(k)))) {
                console.log(`PinLayout for [${product.name}] looks like description. Marking as N/A.`);
                pinLayout = 'N/A';
                needsUpdate = true;
            }

            // Fix generic "autopilot" defaults that were incorrectly applied to non-flight controllers
            if (layoutStr.includes('ESC_SIG') && !product.name.toLowerCase().includes('flight control') && !product.name.toLowerCase().includes('fc')) {
                 if (product.category !== 'Autopilot' && product.category !== 'Navigation') {
                    console.log(`PinLayout for [${product.name}] has default FC pinout but isn't an FC. Marking as N/A.`);
                    pinLayout = 'N/A';
                    needsUpdate = true;
                 }
            }
        }

        if (needsUpdate) {
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${product.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ pin_layout: pinLayout })
            });
            if (updateRes.ok) sanitizedCount++;
            else console.error(`Failed to sanitize ${product.id}:`, await updateRes.text());
        }
    }

    console.log(`Cleaning complete! Duplicates removed: ${toDelete.length}, PinLayouts sanitized: ${sanitizedCount}`);
}

cleanProducts().catch(console.error);
