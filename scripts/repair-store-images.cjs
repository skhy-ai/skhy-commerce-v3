const fs = require('fs');
const path = require('path');

const chunksDir = path.join(__dirname, '..', 'src', 'data', 'marketplace');
const publicDir = path.join(__dirname, '..', 'public');

const interceptorMap = {
  900680: '/images/catalog/effectors/interceptor_5.png', // Wasp Kinetic interceptor
  900673: '/images/catalog/effectors/interceptor_5.png', // Zerodrag Interceptor
  900666: '/images/catalog/effectors/interceptor_7.png', // Heavy Interceptor 17
  900648: '/images/catalog/effectors/interceptor_5.png', // Aggressive Interceptor 15
  900632: '/images/catalog/effectors/interceptor_7.png', // Delta-Interceptor
  900603: '/images/catalog/effectors/interceptor_7.png', // Mamba interceptor
  900596: '/images/catalog/effectors/interceptor_7.png', // Wraith Interceptor
  900578: '/images/catalog/effectors/interceptor_5.png', // Sentry-15 Interceptor
};

let modifiedChunks = 0;
let updatedProducts = 0;

for (let i = 0; i < 32; i++) {
  const filePath = path.join(chunksDir, `chunk_${i}.json`);
  if (!fs.existsSync(filePath)) continue;

  const raw = fs.readFileSync(filePath, 'utf8');
  const products = JSON.parse(raw);
  let chunkChanged = false;

  for (const product of products) {
    if (!product.show_on_skhy_store) continue;

    if (!product.product_assets) product.product_assets = [];

    // 1. Repair specific broken items
    if (product.id === 396686609) {
      // 50A 4-in-1 ESC
      const local = '/images/marketplace/9b3c24dd-7d88-4a08-b96c-15bbed0fb07f.jpg';
      let asset = product.product_assets.find(a => a.asset_type === 'image') || product.product_assets[0];
      if (!asset) {
        asset = { id: 'asset-396686609', asset_type: 'image', product_id: product.id };
        product.product_assets.unshift(asset);
      }
      asset.file_url = local;
      asset.local_url = local;
      asset.asset_type = 'image';
      chunkChanged = true;
      updatedProducts++;
      console.log(`[FIXED] 396686609 (50A ESC) -> ${local}`);
    }

    if (product.id === 1421712257) {
      // 72-inch Carbon Fiber Propeller
      const local = '/images/products/carbon_propeller.png';
      let asset = product.product_assets.find(a => a.asset_type === 'image') || product.product_assets[0];
      if (!asset) {
        asset = { id: 'asset-1421712257', asset_type: 'image', product_id: product.id };
        product.product_assets.unshift(asset);
      }
      asset.file_url = local;
      asset.local_url = local;
      asset.asset_type = 'image';
      chunkChanged = true;
      updatedProducts++;
      console.log(`[FIXED] 1421712257 (72-inch Carbon Fiber) -> ${local}`);
    }

    if (product.id === 900008) {
      // AeroGuard: Aerodynamic Protective Cones
      const local = '/images/marketplace/2007ca8a-2879-49c9-a534-8844363b3474.png';
      let asset = product.product_assets.find(a => a.asset_type === 'image');
      if (!asset) {
        asset = { id: 'asset-900008', asset_type: 'image', product_id: product.id };
        product.product_assets.unshift(asset);
      }
      asset.file_url = local;
      asset.local_url = local;
      asset.asset_type = 'image';
      chunkChanged = true;
      updatedProducts++;
      console.log(`[FIXED] 900008 (AeroGuard) -> ${local}`);
    }

    if (product.id === 900027) {
      // SKHY Threat Awareness Manager
      const local = '/images/marketplace/acffe852-ab7c-4d9f-a078-d1769e49a8ae.jpg';
      let asset = product.product_assets.find(a => a.asset_type === 'image');
      if (!asset) {
        asset = { id: 'asset-900027', asset_type: 'image', product_id: product.id };
        product.product_assets.unshift(asset);
      }
      asset.file_url = local;
      asset.local_url = local;
      asset.asset_type = 'image';
      chunkChanged = true;
      updatedProducts++;
      console.log(`[FIXED] 900027 (Threat Awareness Manager) -> ${local}`);
    }

    // 2. Kinetic Interceptor image assignment
    if (interceptorMap[product.id]) {
      const interceptorImg = interceptorMap[product.id];
      let asset = product.product_assets.find(a => a.asset_type === 'image') || product.product_assets[0];
      if (!asset) {
        asset = { id: `asset-${product.id}`, asset_type: 'image', product_id: product.id };
        product.product_assets.unshift(asset);
      }
      asset.file_url = interceptorImg;
      asset.local_url = interceptorImg;
      asset.asset_type = 'image';
      chunkChanged = true;
      updatedProducts++;
      console.log(`[FIXED] ${product.id} (${product.name}) -> ${interceptorImg}`);
    }

    // 3. For any store product that has a local asset in public/images/marketplace/<file_name>, ensure local_url is valid
    const asset = product.product_assets.find(a => a.asset_type === 'image') || product.product_assets[0];
    if (asset && asset.file_name) {
      const fileNamePath = path.join(publicDir, 'images', 'marketplace', asset.file_name);
      if (fs.existsSync(fileNamePath)) {
        const local = `/images/marketplace/${asset.file_name}`;
        if (asset.local_url !== local) {
          asset.local_url = local;
          chunkChanged = true;
        }
      }
    }
  }

  if (chunkChanged) {
    fs.writeFileSync(filePath, JSON.stringify(products, null, 2), 'utf8');
    modifiedChunks++;
  }
}

console.log(`\nCompleted repair. Updated ${updatedProducts} products across ${modifiedChunks} chunk files.`);
