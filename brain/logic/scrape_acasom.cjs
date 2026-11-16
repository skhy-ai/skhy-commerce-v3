const fs = require('fs');
const path = require('path');

const INPUT_FILE = path.join(__dirname, '..', 'scratch', 'acasom_products.json');
const OUTPUT_FILE = path.join(__dirname, 'acasom_products.csv');
const PLATFORM_FEE = 1.038; // 3.8% fee

async function processAcasomData() {
    console.log('Reading local ACASOM data...');
    try {
        const rawData = fs.readFileSync(INPUT_FILE, 'utf8');
        const data = JSON.parse(rawData);
        const products = data.products;
        
        console.log(`Found ${products.length} products.`);

        const csvRows = [
            'id,name,description,base_price,image_url,category,manufacturer,country_of_origin,power_draw_w,is_active,currency'
        ];

        products.forEach(p => {
            const id = p.id;
            const name = p.title.replace(/"/g, '""');
            // Clean HTML and preserve basic formatting
            const description = p.body_html 
                ? p.body_html
                    .replace(/<br\s*\/?>/gi, ' ')
                    .replace(/<\/p>/gi, ' ')
                    .replace(/<[^>]*>?/gm, '')
                    .replace(/&nbsp;/g, ' ')
                    .replace(/"/g, '""')
                    .replace(/\s+/g, ' ')
                    .trim()
                : '';
            
            const rawPrice = p.variants && p.variants[0] ? parseFloat(p.variants[0].price) : 0;
            const priceWithFee = (rawPrice * PLATFORM_FEE).toFixed(2);
            const imageUrl = p.images && p.images[0] ? p.images[0].src : '';
            const category = p.product_type || 'Hardware';
            const manufacturer = 'ACASOM';
            const countryOfOrigin = 'CN';
            
            // Try to extract power draw from title or description
            let powerDraw = 'NULL';
            const powerMatch = name.match(/(\d+)\s*W/i) || description.match(/(\d+)\s*W/i);
            if (powerMatch) {
                powerDraw = powerMatch[1];
            }

            csvRows.push(`"${id}","${name}","${description}","${priceWithFee}","${imageUrl}","${category}","${manufacturer}","${countryOfOrigin}",${powerDraw},true,"USD"`);
        });

        fs.writeFileSync(OUTPUT_FILE, csvRows.join('\n'));
        console.log(`Successfully saved ${products.length} products to ${OUTPUT_FILE}`);
        
    } catch (error) {
        console.error('Error processing ACASOM data:', error.message);
    }
}

processAcasomData();
