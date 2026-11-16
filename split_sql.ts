import fs from 'fs';
import { productCatalog } from './src/data/productCatalog';
import { simulatorProducts } from './src/data/shopProducts';

function escapeSql(str: string | undefined | null): string {
  if (str === null || str === undefined) return 'NULL';
  return "'" + str.replace(/'/g, "''") + "'";
}

let sqls: string[] = [];

sqls.push("DO $$\nDECLARE\n  seller_uuid uuid;\nBEGIN\n  SELECT user_id INTO seller_uuid FROM users WHERE seller_type = 'manufacturer' LIMIT 1;\n  IF seller_uuid IS NULL THEN\n    SELECT user_id INTO seller_uuid FROM users LIMIT 1;\n    IF seller_uuid IS NULL THEN\n      seller_uuid := '00000000-0000-0000-0000-000000000000'::uuid;\n    END IF;\n  END IF;\n");

const catalogProducts = productCatalog.map((item, index) => {
  const c = item.category;
  const dbCat = c === 'manet' ? 'Communication' : c === 'ajgps' ? 'Defense Systems' : c === 'hardware' ? 'Drone Components' : 'Hardware';
  return `  INSERT INTO products (id, name, description, category, type, pricing_model, base_price, currency, tax_exempt, user_id, show_on_marketplace, is_active, created_at, updated_at) VALUES (${900000 + index}, ${escapeSql(item.name)}, ${escapeSql(item.tagline)}, ${escapeSql(dbCat)}, 'hardware', 'unit', ${item.base_price ?? 0}, 'USD', false, seller_uuid, true, true, now(), now()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category, base_price = EXCLUDED.base_price;`;
});

const simProducts = simulatorProducts.map((item) => {
  return `  INSERT INTO products (id, name, description, category, type, pricing_model, base_price, currency, tax_exempt, user_id, show_on_marketplace, is_active, created_at, updated_at) VALUES (${item.id}, ${escapeSql(item.name)}, ${escapeSql(item.description)}, ${escapeSql(item.category)}, ${escapeSql(item.type)}, ${escapeSql(item.pricing_model)}, ${item.base_price ?? 0}, ${escapeSql(item.currency || 'USD')}, ${item.tax_exempt ? 'true' : 'false'}, seller_uuid, true, true, now(), now()) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, category = EXCLUDED.category, base_price = EXCLUDED.base_price;`;
});

const assets: string[] = [];
productCatalog.forEach((item, index) => {
  if (item.imageUrl) {
    // Generate UUID or let DB handle it. We will use gen_random_uuid(). We will also skip ON CONFLICT since it's hard to handle without a known unique constraint.
    assets.push(`  INSERT INTO product_assets (id, product_id, asset_type, file_url, created_at, updated_at) VALUES (gen_random_uuid(), ${900000 + index}, 'image', ${escapeSql(item.imageUrl)}, now(), now());`);
  }
});
simulatorProducts.forEach((item) => {
  if (item.product_assets) {
    item.product_assets.forEach(asset => {
      assets.push(`  INSERT INTO product_assets (id, product_id, asset_type, file_url, created_at, updated_at) VALUES (gen_random_uuid(), ${item.id}, ${escapeSql(asset.asset_type)}, ${escapeSql(asset.file_url)}, now(), now());`);
    });
  }
});

let chunk1 = sqls[0] + catalogProducts.join("\n") + "\nEND $$;\n";
let chunk2 = sqls[0] + simProducts.join("\n") + "\nEND $$;\n";
// Wrap chunk3 in DO $$ block as well since it might not need seller_uuid, but let's keep it consistent or just simple SQL.
let chunk3 = "DO $$\nBEGIN\n" + assets.join("\n") + "\nEND $$;\n";

fs.writeFileSync('chunk1.sql', chunk1);
fs.writeFileSync('chunk2.sql', chunk2);
fs.writeFileSync('chunk3.sql', chunk3);

console.log('Chunks written. Check chunk3.sql');
