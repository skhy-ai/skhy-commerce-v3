const fs = require('fs');
const path = require('path');

const csvPath = 'c:/Projects/skhyai-website/skhy-ai-website-main/scripts/acasom_products.csv';
const sqlPath = 'c:/Projects/skhyai-website/skhy-ai-website-main/scratch/acasom_inserts_full.sql';

// ACASOM Seller UUID
const ACASOM_SELLER_ID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';

function escapeSql(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, "''");
}

function parseCsvLine(line) {
  const result = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(cur);
      cur = '';
    } else {
      cur += char;
    }
  }
  result.push(cur);
  return result;
}

const lines = fs.readFileSync(csvPath, 'utf8').split('\n').filter(l => l.trim() !== '');
const header = parseCsvLine(lines[0]);
const dataLines = lines.slice(1);

let sql = `-- Full ACASOM Product Ingestion
-- Seller: ACASOM (${ACASOM_SELLER_ID})

-- 1. Ensure Seller Exists (Placeholder profile/user if needed)
-- INSERT INTO profiles (id, full_name, role) VALUES ('${ACASOM_SELLER_ID}', 'ACASOM', 'partner') ON CONFLICT DO NOTHING;

-- 2. Upsert Products
INSERT INTO products (
  id,
  user_id,
  name,
  description,
  type,
  category,
  base_price,
  currency,
  manufacturer,
  country_of_origin,
  power_draw_w,
  show_on_marketplace,
  ready_to_sale,
  is_active
) VALUES
`;

const values = [];
const assetValues = [];

let currentId = 901001;

dataLines.forEach((line) => {
  const [
    shopifyId,
    name,
    description,
    price,
    imageUrl,
    category,
    manufacturer,
    country,
    powerDraw,
    isActive,
    currency
  ] = parseCsvLine(line);

  const id = currentId++;
  
  // Products table values
  // Mapping: id, user_id, name, description, type, category, base_price, currency, manufacturer, country_of_origin, power_draw_w, show_on_marketplace, ready_to_sale, is_active
  values.push(`  (${id}, '${ACASOM_SELLER_ID}', '${escapeSql(name)}', '${escapeSql(description)}', 'hardware', '${escapeSql(category)}', ${price}, '${currency}', '${escapeSql(manufacturer)}', '${escapeSql(country)}', ${powerDraw || 0}, true, true, ${isActive === 'true'})`);

  // Asset table values (using UUID for id)
  if (imageUrl) {
    assetValues.push(`  (gen_random_uuid(), ${id}, 'image', '${escapeSql(imageUrl)}', true)`);
  }
});

sql += values.join(',\n') + '\nON CONFLICT (id) DO UPDATE SET\n  name = EXCLUDED.name,\n  description = EXCLUDED.description,\n  base_price = EXCLUDED.base_price,\n  power_draw_w = EXCLUDED.power_draw_w,\n  is_active = EXCLUDED.is_active,\n  show_on_marketplace = EXCLUDED.show_on_marketplace,\n  ready_to_sale = EXCLUDED.ready_to_sale;\n\n';

sql += `-- 3. Insert Product Assets\nINSERT INTO product_assets (id, product_id, asset_type, file_url, is_primary) VALUES\n`;
sql += assetValues.join(',\n') + '\nON CONFLICT DO NOTHING;';

fs.writeFileSync(sqlPath, sql);
console.log(`Generated SQL for ${dataLines.length} products at ${sqlPath}`);
