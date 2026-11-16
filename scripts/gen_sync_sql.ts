import { cachedProducts } from '../src/data/cachedMarketplace';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbRaw = fs.readFileSync(path.join(__dirname, '../src/data/existing_product_table.json'), 'utf8');
const dbProducts: any[] = JSON.parse(dbRaw);
const dbMap = new Map<number, any>(dbProducts.map(p => [p.id as number, p]));

const escape = (v: string) => String(v).replace(/'/g, "''");

let sql = `-- ============================================================
-- Sync cachedMarketplace.ts → Supabase products table
-- Generated: ${new Date().toISOString()}
-- 
-- WHAT THIS DOES:
--   Updates segment, power_draw_w, features, description, sku,
--   weight_kg, dimensions, and subcategory for products where
--   cachedMarketplace.ts has richer data than the products table.
--
-- HOW TO USE:
--   1. Run this SQL in the Supabase Dashboard > SQL Editor
--   2. Then run: npm run prebuild   (re-generates cachedMarketplace.ts)
--   3. Commit the updated cachedMarketplace.ts
-- ============================================================

BEGIN;

`;

const updates: string[] = [];
const noMatch: string[] = [];

for (const cp of cachedProducts as any[]) {
  const db = dbMap.get(cp.id);
  if (!db) {
    noMatch.push(`-- MISSING IN DB: id=${cp.id} "${cp.name}"`);
    continue;
  }

  const setParts: string[] = [];

  // segment — main fix: DB has 'general', cache has 'air'/'gcs'/'rover'/etc
  const dbSeg = db.segment ?? 'general';
  const cSeg = cp.segment ?? 'general';
  if (cSeg !== dbSeg) setParts.push(`segment = '${escape(cSeg)}'`);

  // power_draw_w
  const dbPow = Number(db.power_draw_w ?? 0);
  const cPow = Number(cp.power_draw_w ?? 0);
  if (cPow !== dbPow) setParts.push(`power_draw_w = ${cPow}`);

  // description — only update if cached has a longer/richer one
  const dbDesc = (db.description || '').trim();
  const cDesc = (cp.description || '').trim();
  if (cDesc && cDesc !== dbDesc && cDesc.length > dbDesc.length) {
    setParts.push(`description = '${escape(cDesc)}'`);
  }

  // features — DB stores as JSON string, cache has proper array
  const dbFeatures: string[] = (() => {
    try { return JSON.parse(db.features || '[]'); } catch { return []; }
  })();
  const cFeatures: string[] = Array.isArray(cp.features) ? cp.features : [];
  if (cFeatures.length > dbFeatures.length) {
    setParts.push(`features = '${escape(JSON.stringify(cFeatures))}'`);
  }

  // sku — add if missing in DB
  if (cp.sku && !db.sku) setParts.push(`sku = '${escape(cp.sku)}'`);

  // weight_kg
  const dbWeight = db.weight_kg ? String(db.weight_kg).trim() : null;
  const cWeight = cp.weight_kg ? String(cp.weight_kg).trim() : null;
  if (cWeight && !dbWeight) setParts.push(`weight_kg = '${escape(cWeight)}'`);

  // dimensions
  const dbDim = db.dimensions ? String(db.dimensions).trim() : null;
  const cDim = cp.dimensions ? String(cp.dimensions).trim() : null;
  if (cDim && (!dbDim || dbDim === 'null')) setParts.push(`dimensions = '${escape(cDim)}'`);

  // subcategory
  if (cp.subcategory && !db.subcategory) setParts.push(`subcategory = '${escape(cp.subcategory)}'`);

  // youtube_url
  if (cp.youtube_url && !db.youtube_url) setParts.push(`youtube_url = '${escape(cp.youtube_url)}'`);

  // base_price — sync if different (DB stores as string)
  const dbPrice = Number(db.base_price ?? 0);
  const cPrice = Number(cp.base_price ?? 0);
  if (cPrice !== dbPrice) setParts.push(`base_price = ${cPrice}`);

  if (setParts.length > 0) {
    updates.push(
      `-- ${cp.name} (id=${cp.id})\nUPDATE public.products\n  SET ${setParts.join(',\n      ')},\n      updated_at = NOW()\n  WHERE id = ${cp.id};`
    );
  }
}

sql += updates.join('\n\n') + '\n\n';

if (noMatch.length > 0) {
  sql += '\n-- ============================================================\n';
  sql += '-- Products in cachedMarketplace NOT found in products table\n';
  sql += '-- These may need manual review:\n';
  sql += noMatch.join('\n') + '\n';
}

// Summary of DB-only products
const cachedIds = new Set((cachedProducts as any[]).map((p: any) => p.id));
const dbOnly = dbProducts.filter(p => !cachedIds.has(p.id));
if (dbOnly.length > 0) {
  sql += '\n-- ============================================================\n';
  sql += `-- ${dbOnly.length} products in DB but NOT in cachedMarketplace:\n`;
  for (const p of dbOnly) {
    sql += `-- id=${p.id}: "${p.name}" (segment=${p.segment})\n`;
  }
}

sql += '\nCOMMIT;\n';

const outPath = path.join(__dirname, '../src/data/sync_products.sql');
fs.writeFileSync(outPath, sql);
console.log(`✅ Written ${updates.length} UPDATE statements to src/data/sync_products.sql`);
console.log(`📋 Products updated:`);
for (const u of updates) {
  const m = u.match(/-- (.+) \(id=(\d+)\)/);
  if (m) console.log(`   [${m[2]}] ${m[1]}`);
}
if (noMatch.length) {
  console.log(`\n⚠️  ${noMatch.length} products in cache but not in DB:`);
  noMatch.forEach(n => console.log('  ' + n));
}
console.log(`\n📌 DB-only (not in cache): ${dbOnly.length} products`);
