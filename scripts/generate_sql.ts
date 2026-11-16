import fs from 'fs';
import { productCatalog } from '../src/data/productCatalog';
import { simulatorProducts } from '../src/data/shopProducts';

function escapeSql(str: string | undefined | null): string {
    if (str === null || str === undefined) return 'NULL';
    return "'" + str.replace(/'/g, "''") + "'";
}

const defaultSellerId = 'e2b3c4d5-e6f7-a8b9-c0d1-e2f3a4b5c6d7'; // Or any valid UUID; maybe we should create one? Or we can let it be NULL if foreign key allows?
// Let's create a known seller dummy or see what sellers exist. If we can't fetch them, we can't reliably insert if FK constraints exist.
// Let's create a seller SQL just in case, but we need an auth user first probably, or simply use an existing seller ID. To be safe, let's just use `(SELECT id FROM users WHERE seller_type = 'manufacturer' LIMIT 1)`

let sql = "DO $$\nDECLARE\n  seller_uuid uuid;\nBEGIN\n";
sql += "  SELECT id INTO seller_uuid FROM users WHERE seller_type = 'manufacturer' LIMIT 1;\n";
sql += "  IF seller_uuid IS NULL THEN\n";
sql += "    -- fallback to picking any user or raising error, let's pick any user\n";
sql += "    SELECT id INTO seller_uuid FROM users LIMIT 1;\n";
sql += "  END IF;\n\n";


const catalogProductsSql = productCatalog.map((item, index) => {
    const c = item.category;
    const dbCat = c === 'manet' ? 'Communication' :
        c === 'ajgps' ? 'Defense Systems' :
            c === 'hardware' ? 'Drone Components' : 'Hardware';

    return `  INSERT INTO products (id, name, description, category, type, pricing_model, base_price, currency, tax_exempt, user_id, show_on_marketplace, is_active, created_at, updated_at) 
  VALUES (
    ${900000 + index}, 
    ${escapeSql(item.name)}, 
    ${escapeSql(item.tagline)}, 
    ${escapeSql(dbCat)}, 
    'hardware', 
    'unit', 
    ${item.base_price ?? 0}, 
    'USD', 
    false, 
    seller_uuid, 
    true, 
    true, 
    now(), 
    now()
  ) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    category = EXCLUDED.category, 
    base_price = EXCLUDED.base_price;`;
});

const simProductsSql = simulatorProducts.map((item) => {
    return `  INSERT INTO products (id, name, description, category, type, pricing_model, base_price, currency, tax_exempt, user_id, show_on_marketplace, is_active, created_at, updated_at) 
  VALUES (
    ${item.id}, 
    ${escapeSql(item.name)}, 
    ${escapeSql(item.description)}, 
    ${escapeSql(item.category)}, 
    ${escapeSql(item.type)}, 
    ${escapeSql(item.pricing_model)}, 
    ${item.base_price ?? 0}, 
    ${escapeSql(item.currency || 'USD')}, 
    ${item.tax_exempt ? 'true' : 'false'}, 
    seller_uuid, 
    true, 
    true, 
    now(), 
    now()
  ) ON CONFLICT (id) DO UPDATE SET 
    name = EXCLUDED.name, 
    description = EXCLUDED.description, 
    category = EXCLUDED.category, 
    base_price = EXCLUDED.base_price;`;
});

sql += catalogProductsSql.join("\n") + "\n\n";
sql += simProductsSql.join("\n") + "\n\n";

let assetSqls: string[] = [];

productCatalog.forEach((item, index) => {
    if (item.imageUrl) {
        assetSqls.push(`  INSERT INTO product_assets (id, product_id, asset_type, file_url, created_at, updated_at) 
    VALUES (
      ${800000 + index}, 
      ${900000 + index}, 
      'image', 
      ${escapeSql(item.imageUrl)}, 
      now(), 
      now()
    ) ON CONFLICT (id) DO UPDATE SET file_url = EXCLUDED.file_url;`);
    }
});

simulatorProducts.forEach((item) => {
    if (item.product_assets && Array.isArray(item.product_assets)) {
        item.product_assets.forEach(asset => {
            assetSqls.push(`  INSERT INTO product_assets (id, product_id, asset_type, file_url, created_at, updated_at) 
      VALUES (
        ${asset.id}, 
        ${item.id}, 
        ${escapeSql(asset.asset_type)}, 
        ${escapeSql(asset.file_url)}, 
        now(), 
        now()
      ) ON CONFLICT (id) DO UPDATE SET file_url = EXCLUDED.file_url;`);
        });
    }
});

sql += assetSqls.join("\n") + "\n";
sql += "END $$;\n";

fs.writeFileSync('insert_products.sql', sql);
console.log("SQL generated to insert_products.sql");
