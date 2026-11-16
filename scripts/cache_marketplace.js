import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { normalizeCategory, extractSpecs } from '../src/utils/marketplaceNormalization.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// Settings
const CHUNK_SIZE = 20;

// Load .env
dotenv.config({ path: path.resolve(projectRoot, '.env') });
dotenv.config({ path: path.resolve(projectRoot, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-key';

async function cacheMarketplace() {
    console.log('Fetching marketplace products for chunking...');
    try {
        let allProducts = [];
        let offset = 0;
        const limit = 1000;
        let hasMore = true;

        while (hasMore) {
            const endpoint = `${supabaseUrl}/rest/v1/products?select=*,country_of_origin,product_assets(*),seller:users(user_id,company_name,email,seller_type,shipping_rates(*))&order=created_at.desc&is_active=eq.true&or=(show_on_marketplace.eq.true,show_on_skhy_store.eq.true)&limit=${limit}&offset=${offset}`;

            const response = await fetch(endpoint, {
                headers: {
                    'apikey': supabaseKey,
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                console.error(`Fetch failed: ${response.status}`);
                process.exit(1);
            }

            const data = await response.json();
            allProducts = allProducts.concat(data);

            if (data.length < limit) {
                hasMore = false;
            } else {
                offset += limit;
            }
        }

        const total = allProducts.length;
        
        // Prioritization and grouping logic
        allProducts.sort((a, b) => {
            const aIsSkhy = (a.seller?.company_name?.toUpperCase() === 'SKHY' || a.manufacturer?.toUpperCase() === 'SKHY');
            const bIsSkhy = (b.seller?.company_name?.toUpperCase() === 'SKHY' || b.manufacturer?.toUpperCase() === 'SKHY');

            // 1. SKHY Products Priority (Strict)
            if (aIsSkhy && !bIsSkhy) return -1;
            if (!aIsSkhy && bIsSkhy) return 1;

            // 2. Verified Sellers / Authorized Partners Priority (Future Proofing)
            const aIsVerified = a.seller?.seller_type === 'verified';
            const bIsVerified = b.seller?.seller_type === 'verified';
            if (aIsVerified && !bIsVerified) return -1;
            if (!aIsVerified && bIsVerified) return 1;

            // 3. Group by Category
            if (a.category !== b.category) {
                return (a.category || '').localeCompare(b.category || '');
            }

            // 4. Recency (Newest first within priority groups)
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        });

        const data = allProducts;
        console.log(`Processing ${total} products into chunks of ${CHUNK_SIZE}...`);

        const outputDir = path.resolve(projectRoot, 'src/data');
        const chunkDir = path.resolve(outputDir, 'marketplace');
        const publicImagesDir = path.resolve(projectRoot, 'public/images/marketplace');

        if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });
        if (!fs.existsSync(publicImagesDir)) fs.mkdirSync(publicImagesDir, { recursive: true });

        // Clear old chunks
        const oldChunks = fs.readdirSync(chunkDir).filter(f => f.startsWith('chunk_') && f.endsWith('.json'));
        oldChunks.forEach(f => fs.unlinkSync(path.join(chunkDir, f)));

        const chunkFiles = [];
        for (let i = 0; i < data.length; i += CHUNK_SIZE) {
            const chunk = data.slice(i, i + CHUNK_SIZE);
            const chunkIndex = i / CHUNK_SIZE;
            const chunkName = `chunk_${chunkIndex}.json`;
            const chunkPath = path.join(chunkDir, chunkName);
            
            // Process images and normalize data for this chunk
            for (const product of chunk) {
                // Apply data normalization during caching
                const isSkhy = (product.seller?.company_name?.toUpperCase() === 'SKHY' || product.manufacturer?.toUpperCase() === 'SKHY');
                const manufacturerUpper = (product.manufacturer || '').toUpperCase();
                
                // SKHY products are from Malaysia
                if (isSkhy) {
                    product.country_of_origin = 'MY';
                } else if (manufacturerUpper === 'ACASOM') {
                    product.country_of_origin = 'CN';
                } else if (['REVOGREEN', 'MPOWER', 'PARAS', 'ZERODRAG TECHNOLOGIES', 'IOTECH', 'EUCLION', 'FLYSPARK', 'NEURON'].includes(manufacturerUpper)) {
                    product.country_of_origin = 'IN';
                } else if (['SILVUS TECHNOLOGIES', 'TRELLISWARE', 'KDE', 'COBRA'].includes(manufacturerUpper)) {
                    product.country_of_origin = 'US';
                } else if (manufacturerUpper === 'MOLICEL') {
                    product.country_of_origin = 'TW';
                } else if (['T-MOTOR', 'HOBBYWING', 'HOLYBRO', 'SUNNYSKY', 'EMAX', 'SIYI', 'SKYDROID', 'SKYRC', 'TAROT', 'TATTU', 'ULTRA POWER', 'CUBEPILOT'].includes(manufacturerUpper)) {
                    product.country_of_origin = 'CN';
                } else if (product.country_of_origin === 'MY') {
                    // Fallback for any other 'MY' tagged items that aren't SKHY
                    product.country_of_origin = 'CN';
                }

                const { category, subcategory } = normalizeCategory(product);
                product.category = category;
                product.subcategory = subcategory;

                // Extract technical specs into the features array for display
                const specs = extractSpecs({ ...product, category });
                const currentFeatures = Array.isArray(product.features) ? product.features : [];
                
                // Merge specs while avoiding duplicates
                const specEntries = Object.entries(specs).map(([k, v]) => `${k}: ${v}`);
                product.features = Array.from(new Set([
                    ...currentFeatures.filter(f => !f.includes(':')), // Keep original non-spec features
                    ...specEntries
                ]));

                if (product.product_assets) {
                    for (const asset of product.product_assets) {
                        if (asset.asset_type === 'image' && asset.file_url) {
                            try {
                                const url = new URL(asset.file_url);
                                let filename = `${product.id}_${path.basename(url.pathname).replace(/[^a-zA-Z0-9.-]/g, '_')}`;
                                const localPath = path.join(publicImagesDir, filename);
                                asset.local_url = `/images/marketplace/${filename}`;
                            } catch (e) { }
                        }
                    }
                }
            }

            fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
            chunkFiles.push(chunkName);
            console.log(`[SAVED] ${chunkName} (${chunk.length} products)`);
        }

        // Generate the dynamic loader in cachedMarketplace.ts
        const loaderPath = path.join(outputDir, 'cachedMarketplace.ts');
        const loaderContent = `// Automatically generated by scripts/cache_marketplace.js
// Number of products: ${total}
// Number of chunks: ${chunkFiles.length}

export const getMarketplaceProducts = async (): Promise<any[]> => {
  const loadChunks = [
${chunkFiles.map((f, i) => `    import('./marketplace/${f}')`).join(',\n')}
  ];
  const results = await Promise.all(loadChunks);
  return results.flatMap(c => c.default);
};

// Backward compatibility (optional placeholder for old imports)
// Usage: import { getMarketplaceProducts } from '../data/cachedMarketplace';
`;

        fs.writeFileSync(loaderPath, loaderContent);
        console.log(`Successfully updated ${loaderPath} with dynamic loader.`);
        process.exit(0);
    } catch (err) {
        console.error('Error during chunking:', err);
        process.exit(1);
    }
}

cacheMarketplace();
