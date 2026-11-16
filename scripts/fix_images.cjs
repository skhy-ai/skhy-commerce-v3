const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const CHUNKS_DIR = path.join(ROOT, 'src', 'data', 'marketplace');
const MAP_FILE = path.join(ROOT, 'src', 'data', 'componentIdMap.ts');
const DRONE_COMPONENTS_FILE = path.join(ROOT, 'src', 'data', 'droneComponents.ts');

// 1. Build product ID -> file_url map from chunks
const productImages = {};
const chunkFiles = fs.readdirSync(CHUNKS_DIR).filter(f => f.endsWith('.json'));
for (const file of chunkFiles) {
    const raw = fs.readFileSync(path.join(CHUNKS_DIR, file), 'utf-8');
    try {
        const products = JSON.parse(raw);
        for (const p of products) {
            if (p.product_assets && p.product_assets.length > 0) {
                productImages[p.id] = p.product_assets[0].file_url;
            }
        }
    } catch (e) { }
}

// 2. Read componentIdMap.ts
const mapRaw = fs.readFileSync(MAP_FILE, 'utf-8');
const mapMatch = mapRaw.match(/export const COMPONENT_ID_MAP: Record<string, number> = (\{[\s\S]*?\});/);
if (!mapMatch) {
    console.error('Could not parse COMPONENT_ID_MAP');
    process.exit(1);
}
const componentMap = JSON.parse(mapMatch[1]);

// 3. Read droneComponents.ts and replace images
let content = fs.readFileSync(DRONE_COMPONENTS_FILE, 'utf-8');

let replaceCount = 0;
for (const [simId, productId] of Object.entries(componentMap)) {
    const fileUrl = productImages[productId];
    if (!fileUrl) continue;

    // We want to find the object with id: 'simId' (or key simId:) and replace its imageUrl.
    // In droneComponents.ts, frames are keys like `tarot_650: { ... imageUrl: '...' }`
    // Others are inside arrays `id: '...', ... imageUrl: '...'`

    // Let's replace by doing a regex that looks for the block containing the simId, but it's tricky because of formatting.
    // Since we just want to replace the imageUrl of the specific component.
}

console.log('done');
