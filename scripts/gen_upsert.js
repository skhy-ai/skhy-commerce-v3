const fs = require('fs');
const path = require('path');

const dir = path.join(__dirname, 'src', 'data', 'marketplace');
const chunks = [];
for (let i = 0; i <= 7; i++) {
  const f = path.join(dir, `chunk_${i}.json`);
  if (fs.existsSync(f)) {
    const data = JSON.parse(fs.readFileSync(f, 'utf8'));
    chunks.push(...data);
  }
}

const seen = new Set();
const unique = chunks.filter(p => { if (seen.has(p.id)) return false; seen.add(p.id); return true; });

console.log(`Total cached: ${chunks.length}, Unique: ${unique.length}`);

// Generate upsert SQL (products table only, not product_assets)
const esc = (v) => {
  if (v === null || v === undefined) return 'NULL';
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE';
  if (typeof v === 'number') return v;
  if (Array.isArray(v)) return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  if (typeof v === 'object') return `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
  return `'${String(v).replace(/'/g, "''")}'`;
};

const fields = [
  'id','name','description','type','category','pricing_model','base_price','unit','currency',
  'tax_exempt','show_on_marketplace','youtube_url','hide_pricing','ready_to_sale','subcategory',
  'inventory_quantity','is_active','requires_shipping','is_digital','restricted_countries',
  'stock_quantity','sku','weight_kg','features','power_draw_w','segment','manufacturer',
  'country_of_origin',
];

let sql = `-- Supabase upsert for all ${unique.length} cached marketplace products\n`;
sql += `-- Run in Supabase SQL Editor. Conflict on 'id' -> update all fields.\n\n`;
sql += `INSERT INTO products (\n  ${fields.join(',\n  ')}\n) VALUES\n`;

const rows = unique.map(p => {
  const vals = fields.map(f => esc(p[f]));
  return `  (${vals.join(', ')})`;
});

sql += rows.join(',\n');
sql += `\nON CONFLICT (id) DO UPDATE SET\n`;
sql += fields.filter(f => f !== 'id').map(f => `  ${f} = EXCLUDED.${f}`).join(',\n');
sql += `;\n`;

fs.writeFileSync(path.join(__dirname, 'scripts', 'upsert_cached_products.sql'), sql);
console.log(`Written: scripts/upsert_cached_products.sql (${(sql.length/1024).toFixed(1)} KB)`);
