const fs = require('fs');
const path = require('path');
const https = require('https');

const catalogPath = path.join(__dirname, 'src', 'data', 'productCatalog.ts');
const targetDir = path.join(__dirname, 'public', 'images', 'catalog');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const content = fs.readFileSync(catalogPath, 'utf8');
const regex = /https:\/\/i\.ibb\.co\/[a-zA-Z0-9\/_-]+\.png/g;
const urls = [...new Set(content.match(regex) || [])];

console.log(`Found ${urls.length} unique image URLs to download.`);

async function downloadImage(url) {
  const filename = url.split('/').pop();
  const filePath = path.join(targetDir, filename);

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${res.statusCode}`));
        return;
      }
      const stream = fs.createWriteStream(filePath);
      res.pipe(stream);
      stream.on('finish', () => {
        stream.close();
        console.log(`Downloaded: ${filename}`);
        resolve({ url, localPath: `/images/catalog/${filename}` });
      });
    }).on('error', err => reject(err));
  });
}

async function run() {
  try {
    const results = [];
    for (const url of urls) {
      const res = await downloadImage(url);
      results.push(res);
    }
    
    // Update productCatalog.ts
    let updatedContent = content;
    for (const { url, localPath } of results) {
      updatedContent = updatedContent.split(url).join(localPath);
    }
    fs.writeFileSync(catalogPath, updatedContent);
    console.log('Updated productCatalog.ts');
    
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
