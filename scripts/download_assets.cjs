const fs = require('fs');
const path = require('path');
const https = require('https');

const ASSET_DIR = path.join(__dirname, '../public/images/simulators');
const MAPPING_FILE = path.join(__dirname, '../src/data/asset_migration_map.json');

if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR);
}

const walk = (dir, pattern) => {
    let results = [];
    if (!fs.existsSync(dir)) return [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath, pattern));
        } else {
            if (filePath.match(pattern)) results.push(filePath);
        }
    });
    return results;
};

const downloadFile = (url, dest) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
                // Handle redirects
                downloadFile(response.headers.location, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close(resolve);
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
};

const slugify = (text) => {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^\w\-.]+/g, '_')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
};

async function run() {
    const publicFiles = walk(path.join(__dirname, '../public'), /\.html$/);
    const srcFiles = walk(path.join(__dirname, '../src'), /\.(tsx|ts)$/);
    const files = [...publicFiles, ...srcFiles];

    const externalUrls = new Set();
    const mapping = {};

    console.log(`Scanning ${files.length} files...`);

    for (const file of files) {
        const content = fs.readFileSync(file, 'utf8');
        // Simple regex for https URLs in quotes
        const matches = content.match(/https?:\/\/[^\s"']+/g);
        if (matches) {
            matches.forEach(url => {
                // Filter for JS, CSS, and common images
                if (url.match(/\.(js|css|jpg|jpeg|png|svg|gif|woff2|webp)(\?.*)?$/i)) {
                    // Exclude known internal or provider URLs we keep
                    if (!url.includes('supabase.co') && 
                        !url.includes('cloudinary.com') && 
                        !url.includes('skhy.systems') &&
                        !url.includes('localhost')) {
                        externalUrls.add(url);
                    }
                }
            });
        }
    }

    console.log(`Found ${externalUrls.size} unique external assets.`);

    for (const url of externalUrls) {
        try {
            const urlObj = new URL(url);
            const fileName = slugify(urlObj.hostname + urlObj.pathname);
            const dest = path.join(ASSET_DIR, fileName);
            
            console.log(`Downloading ${url} -> ${fileName}`);
            await downloadFile(url, dest);
            mapping[url] = fileName;
        } catch (err) {
            console.error(`Error downloading ${url}:`, err.message);
        }
    }

    fs.writeFileSync(MAPPING_FILE, JSON.stringify(mapping, null, 2));
    console.log(`Migration map saved to ${MAPPING_FILE}`);
}

run().catch(console.error);
