import fs from 'fs';
import path from 'path';
import https from 'https';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

const headers = {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json'
};

const ASSET_DIR = path.resolve(process.cwd(), 'public/images/marketplace');

if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
}

function downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(dest);
        https.get(url, (response) => {
            if (response.statusCode === 301 || response.statusCode === 302) {
                downloadFile(response.headers.location!, dest).then(resolve).catch(reject);
                return;
            }
            if (response.statusCode !== 200) {
                reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
                return;
            }
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                resolve();
            });
        }).on('error', (err) => {
            fs.unlink(dest, () => reject(err));
        });
    });
}

async function syncImages() {
    console.log('Fetching product assets...');
    const res = await fetch(`${supabaseUrl}/rest/v1/product_assets?asset_type=eq.image&select=*`, { headers });
    if (!res.ok) {
        console.error('Failed to fetch assets:', await res.text());
        return;
    }
    const assets = await res.json();
    console.log(`Processing ${assets.length} images...`);

    for (const asset of assets) {
        if (!asset.file_url || !asset.file_url.startsWith('http')) continue;

        const url = asset.file_url;
        let ext = '.jpg';
        try {
            ext = path.extname(new URL(url).pathname) || '.jpg';
        } catch (e) {
            console.error(`Invalid URL for asset ${asset.id}: ${url}`);
            continue;
        }
        const fileName = `${asset.id}${ext}`;
        const dest = path.join(ASSET_DIR, fileName);
        const localUrl = `/images/marketplace/${fileName}`;

        if (fs.existsSync(dest) && asset.local_url === localUrl) {
            // console.log(`Skipping ${asset.id}, already downloaded.`);
            continue;
        }

        try {
            console.log(`Downloading ${url} -> ${fileName}`);
            await downloadFile(url, dest);
            
            // Update Supabase with the filename
            const updateRes = await fetch(`${supabaseUrl}/rest/v1/product_assets?id=eq.${asset.id}`, {
                method: 'PATCH',
                headers,
                body: JSON.stringify({ file_name: fileName })
            });
            if (!updateRes.ok) {
                console.error(`Failed to update asset ${asset.id}:`, await updateRes.text());
            }
        } catch (err: any) {
            console.error(`Error processing asset ${asset.id}: ${err.message}`);
            // If it's a 404 and it's a primary image, hide the product
            if (err.message.includes('404')) {
                console.warn(`Asset ${asset.id} is 404!`);
                if (asset.is_primary) {
                    console.log(`Hiding product ${asset.product_id} due to broken primary image.`);
                    await fetch(`${supabaseUrl}/rest/v1/products?id=eq.${asset.product_id}`, {
                        method: 'PATCH',
                        headers,
                        body: JSON.stringify({ show_on_marketplace: false })
                    });
                }
            }
        }
    }

    console.log('Sync complete!');
}

syncImages().catch(console.error);
