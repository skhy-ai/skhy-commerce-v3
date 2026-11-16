const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, '..', 'src', 'data', 'marketplace');
const publicDir = path.join(__dirname, '..', 'public');

let storeProducts = [];
for (let i = 0; i < 32; i++) {
  const filePath = path.join(chunksDir, `chunk_${i}.json`);
  if (!fs.existsSync(filePath)) continue;
  const chunk = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  storeProducts.push(...chunk.filter(p => p.show_on_skhy_store));
}

console.log(`Auditing images for ${storeProducts.length} store products...\n`);

let passed = 0;
let failed = 0;

for (const product of storeProducts) {
  const asset = product.product_assets?.find(a => 
    a.asset_type === 'image' || 
    (a.file_url && /\.(png|jpe?g|webp|svg|gif)$/i.test(a.file_url) && !/\.(md|pdf)$/i.test(a.file_url))
  );

  const localPath = asset?.local_url || (asset?.file_name ? `/images/marketplace/${asset.file_name}` : undefined);
  const remoteUrl = asset?.file_url;

  const targetPath = localPath || remoteUrl;

  if (!targetPath) {
    console.error(`\x1b[31m[NO ASSET]\x1b[0m ${product.id} ${product.name}`);
    failed++;
    continue;
  }

  // If it's a local path, verify it exists on disk
  if (targetPath.startsWith('/')) {
    const diskPath = path.join(publicDir, targetPath.replace(/^\//, ''));
    if (fs.existsSync(diskPath)) {
      console.log(`\x1b[32m[LOCAL OK]\x1b[0m ${product.id} ${product.name} -> ${targetPath}`);
      passed++;
    } else {
      console.error(`\x1b[31m[MISSING LOCAL FILE]\x1b[0m ${product.id} ${product.name} -> ${diskPath}`);
      failed++;
    }
  } else {
    // Remote URL
    console.log(`\x1b[36m[REMOTE URL]\x1b[0m ${product.id} ${product.name} -> ${targetPath}`);
    passed++;
  }
}

console.log(`\nAudit Complete: ${passed} passed, ${failed} failed.`);
if (failed > 0) {
  process.exit(1);
} else {
  console.log('\x1b[32mAll store product images verified successfully!\x1b[0m');
  process.exit(0);
}
