#!/usr/bin/env node
/**
 * cache_marketplace_from_csv.js
 * 
 * Reads the exported CSV files from supabase/migrations and regenerates
 * the marketplace chunk JSON files + cachedMarketplace.ts.
 * 
 * No Supabase connection required — uses local data snapshots.
 * 
 * Usage: node scripts/cache_marketplace_from_csv.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const PRODUCTS_CSV = path.resolve(projectRoot, 'supabase/migrations/Supabase Snippet List All Products.csv');
const ASSETS_CSV = path.resolve(projectRoot, 'supabase/migrations/Supabase Snippet List All Product_assets.csv');
const CHUNK_SIZE = 20;

// ─── CSV Parser ────────────────────────────────────────────────────────────────
/**
 * A simple, RFC-4180-aware CSV parser that handles quoted fields with embedded
 * commas, double-quote escapes, and embedded newlines.
 */
function parseCSV(raw) {
  const rows = [];
  let i = 0;
  const n = raw.length;

  // Skip BOM if present
  if (raw.charCodeAt(0) === 0xfeff) i++;

  let headers = null;

  while (i < n) {
    const row = [];
    while (i < n) {
      if (raw[i] === '"') {
        // Quoted field
        i++; // skip opening quote
        let field = '';
        while (i < n) {
          if (raw[i] === '"') {
            if (i + 1 < n && raw[i + 1] === '"') {
              field += '"';
              i += 2;
            } else {
              i++; // skip closing quote
              break;
            }
          } else {
            field += raw[i++];
          }
        }
        row.push(field);
      } else {
        // Unquoted field
        let field = '';
        while (i < n && raw[i] !== ',' && raw[i] !== '\n' && raw[i] !== '\r') {
          field += raw[i++];
        }
        row.push(field.trim());
      }

      if (i < n && raw[i] === ',') {
        i++; // move to next field
      } else {
        break; // end of record
      }
    }

    // Consume line ending
    if (i < n && raw[i] === '\r') i++;
    if (i < n && raw[i] === '\n') i++;

    if (!headers) {
      headers = row;
    } else if (row.length > 1 || (row.length === 1 && row[0] !== '')) {
      const obj = {};
      headers.forEach((h, idx) => {
        const val = row[idx] !== undefined ? row[idx] : null;
        obj[h] = val === 'null' || val === '' ? null : val;
      });
      rows.push(obj);
    }
  }
  return rows;
}

// ─── Coerce types ──────────────────────────────────────────────────────────────
function coerceProduct(raw) {
  const numericFields = ['base_price', 'power_draw_w', 'weight_kg', 'inventory_quantity', 'stock_quantity', 'low_stock_threshold'];
  const boolFields = ['tax_exempt', 'show_on_marketplace', 'hide_pricing', 'ready_to_sale', 'is_active', 'requires_shipping', 'is_digital'];

  const p = { ...raw };

  numericFields.forEach(f => {
    if (p[f] !== null) {
      const n = parseFloat(p[f]);
      p[f] = isNaN(n) ? null : n;
    }
  });

  boolFields.forEach(f => {
    if (p[f] !== null) {
      p[f] = p[f] === 'true';
    }
  });

  // Parse JSON fields
  ['features', 'pin_layout', 'dimensions', 'restricted_countries'].forEach(f => {
    if (p[f] !== null) {
      try {
        p[f] = JSON.parse(p[f]);
      } catch {
        // Keep as string if parse fails
      }
    }
  });

  // Numeric ID
  if (p.id !== null) {
    const n = parseInt(p.id, 10);
    p.id = isNaN(n) ? p.id : n;
  }

  return p;
}

function coerceAsset(raw) {
  const boolFields = ['is_primary'];
  const numericFields = ['display_order', 'file_size'];
  const a = { ...raw };

  numericFields.forEach(f => {
    if (a[f] !== null) {
      const n = parseInt(a[f], 10);
      a[f] = isNaN(n) ? null : n;
    }
  });

  boolFields.forEach(f => {
    if (a[f] !== null) {
      a[f] = a[f] === 'true';
    }
  });

  // product_id as number
  if (a.product_id !== null) {
    const n = parseInt(a.product_id, 10);
    a.product_id = isNaN(n) ? a.product_id : n;
  }

  return a;
}

// ─── Main ──────────────────────────────────────────────────────────────────────
function main() {
  console.log('📂 Reading CSV exports from supabase/migrations...');

  if (!fs.existsSync(PRODUCTS_CSV)) {
    console.error(`ERROR: Products CSV not found at ${PRODUCTS_CSV}`);
    process.exit(1);
  }
  if (!fs.existsSync(ASSETS_CSV)) {
    console.error(`ERROR: Assets CSV not found at ${ASSETS_CSV}`);
    process.exit(1);
  }

  const rawProducts = parseCSV(fs.readFileSync(PRODUCTS_CSV, 'utf-8'));
  const rawAssets = parseCSV(fs.readFileSync(ASSETS_CSV, 'utf-8'));

  console.log(`✅ Parsed ${rawProducts.length} products, ${rawAssets.length} assets`);

  const products = rawProducts.map(coerceProduct);
  const assets = rawAssets.map(coerceAsset);

  // Build asset map: productId -> asset[]
  const assetMap = {};
  assets.forEach(a => {
    const pid = a.product_id;
    if (!assetMap[pid]) assetMap[pid] = [];
    assetMap[pid].push(a);
  });

  // Attach assets to products (mimicking the Supabase join)
  const enriched = products
    .filter(p => p.show_on_marketplace === true && p.is_active === true)
    .map(p => ({
      ...p,
      product_assets: (assetMap[p.id] || []).sort((a, b) => (a.display_order || 0) - (b.display_order || 0)),
      seller: null, // no seller join from CSV; handled separately if needed
    }));

  console.log(`✅ ${enriched.length} marketplace-visible products after filtering`);

  // ─── Write chunks ────────────────────────────────────────────────────────────
  const outputDir = path.resolve(projectRoot, 'src/data');
  const chunkDir = path.resolve(outputDir, 'marketplace');

  if (!fs.existsSync(chunkDir)) fs.mkdirSync(chunkDir, { recursive: true });

  // Clear old chunks
  const oldChunks = fs.readdirSync(chunkDir).filter(f => f.startsWith('chunk_') && f.endsWith('.json'));
  oldChunks.forEach(f => {
    fs.unlinkSync(path.join(chunkDir, f));
    console.log(`🗑  Removed old ${f}`);
  });

  const chunkFiles = [];
  for (let i = 0; i < enriched.length; i += CHUNK_SIZE) {
    const chunk = enriched.slice(i, i + CHUNK_SIZE);
    const chunkIndex = Math.floor(i / CHUNK_SIZE);
    const chunkName = `chunk_${chunkIndex}.json`;
    const chunkPath = path.join(chunkDir, chunkName);
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
    chunkFiles.push(chunkName);
    console.log(`💾 Saved ${chunkName} (${chunk.length} products)`);
  }

  // ─── Write cachedMarketplace.ts ───────────────────────────────────────────────
  const loaderPath = path.join(outputDir, 'cachedMarketplace.ts');
  const loaderContent = `// Automatically generated by scripts/cache_marketplace_from_csv.js
// Source: supabase/migrations CSV exports
// Number of products: ${enriched.length}
// Number of chunks: ${chunkFiles.length}
// Generated: ${new Date().toISOString()}

export const getMarketplaceProducts = async (): Promise<any[]> => {
  const loadChunks = [
${chunkFiles.map(f => `    import('./marketplace/${f}')`).join(',\n')}
  ];
  const results = await Promise.all(loadChunks);
  return results.flatMap(c => c.default);
};

// Backward compatibility (optional placeholder for old imports)
// Usage: import { getMarketplaceProducts } from '../data/cachedMarketplace';
`;

  fs.writeFileSync(loaderPath, loaderContent);
  console.log(`\n✅ Updated ${loaderPath}`);
  console.log(`\n🎉 Done! ${enriched.length} products across ${chunkFiles.length} chunks.`);

  // ─── Category summary ─────────────────────────────────────────────────────────
  const categories = {};
  enriched.forEach(p => {
    const cat = p.category || 'Unknown';
    categories[cat] = (categories[cat] || 0) + 1;
  });
  console.log('\n📊 Category breakdown:');
  Object.entries(categories).sort((a,b) => b[1] - a[1]).forEach(([cat, count]) => {
    console.log(`   ${cat.padEnd(25)} ${count}`);
  });

  // ─── Segment summary ──────────────────────────────────────────────────────────
  const segments = {};
  enriched.forEach(p => {
    const seg = p.segment || 'Unknown';
    segments[seg] = (segments[seg] || 0) + 1;
  });
  console.log('\n🎯 Segment breakdown:');
  Object.entries(segments).sort((a,b) => b[1] - a[1]).forEach(([seg, count]) => {
    console.log(`   ${seg.padEnd(25)} ${count}`);
  });
}

main();
