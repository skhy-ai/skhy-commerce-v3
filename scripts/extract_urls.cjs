const fs = require('fs');
const path = require('path');

// Path relative to workspace root: src/data/marketplace
const marketplaceDir = path.join(__dirname, '..', 'src', 'data', 'marketplace');
const netlifyPath = path.join(__dirname, '..', 'netlify.toml');

const urls = new Set();

console.log(`Checking directory: ${marketplaceDir}`);

for (let i = 0; i <= 8; i++) {
  const fileName = `chunk_${i}.json`;
  const filePath = path.join(marketplaceDir, fileName);
  
  if (fs.existsSync(filePath)) {
    console.log(`Processing ${fileName}...`);
    const content = fs.readFileSync(filePath, 'utf8');
    const matches = content.match(/https?:\/\/[^'\"\s]+/g);
    if (matches) {
      matches.forEach(url => {
        let cleanUrl = url.replace(/[,\}\]\"]+$/, '');
        urls.add(cleanUrl);
      });
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}

const domains = new Set();
urls.forEach(url => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.hostname;
    // Add https:// prefix for CSP
    domains.add(`https://${domain}`);
  } catch (e) {}
});

// Always include standard reliable domains used in the app
const standardDomains = [
  'https://fonts.googleapis.com',
  'https://fonts.gstatic.com',
  'https://cdnjs.cloudflare.com',
  'https://ae01.alicdn.com',
  'https://ardupilot.org',
  'https://asteria.co.in',
  'https://cdn.shopify.com',
  'https://down-ph.img.susercontent.com',
  'https://dronetechguide.com',
  'https://flyspark.in',
  'https://forumdrone.fr',
  'https://holybro.com',
  'https://i.ibb.co',
  'https://i.postimg.cc',
  'https://ideaforge.co.in',
  'https://images.pexels.com',
  'https://images.unsplash.com',
  'https://img.freepik.com',
  'https://img.gkbcdn.com',
  'https://img.waimaoniu.net',
  'https://img.youtube.com',
  'https://m.media-amazon.com',
  'https://offthegridsun.com',
  'https://ozrobotics.com',
  'https://p.globalsources.com',
  'https://rajant.com',
  'https://rcdrone.top',
  'https://res.cloudinary.com',
  'https://robu.in',
  'https://sgcctv.com.sg',
  'https://static.wixstatic.com',
  'https://ueeshop.ly200-cdn.com',
  'https://velodynelidar.com',
  'https://vtakeoff.com',
  'https://wm.cdn.cn86.cn',
  'https://www.carbon-light.com',
  'https://www.cubepilot.com',
  'https://www.flir.com',
  'https://www.kdedirect.com',
  'https://www.mhm-modellbau.de',
  'https://www.scaleflying.com',
  'https://xbotics.in',
  'https://zbotic.in',
  'https://www.startupindia.gov.in'
];

standardDomains.forEach(d => domains.add(d));

const sortedDomains = Array.from(domains).sort();
const domainString = sortedDomains.join(' ');

console.log(`\nExtracted ${sortedDomains.length} unique domains.`);

if (fs.existsSync(netlifyPath)) {
  let netlifyContent = fs.readFileSync(netlifyPath, 'utf8');
  
  // Update style-src
  const styleRegex = /(style-src\s+'self'\s+'unsafe-inline')[^;]+;/;
  netlifyContent = netlifyContent.replace(styleRegex, `$1 ${domainString} data:;`);
  
  // Fix font-src and ensure it exists with a semicolon
  const fontRegex = /font-src\s+'self'\s+[^;]+;/;
  const newFontSrc = `font-src 'self' https://fonts.gstatic.com https://cdnjs.cloudflare.com;`;
  if (fontRegex.test(netlifyContent)) {
    netlifyContent = netlifyContent.replace(fontRegex, newFontSrc);
  } else {
    // If it was somehow deleted or merged, insert it after style-src
    netlifyContent = netlifyContent.replace(/(style-src\s+'self'\s+'unsafe-inline'[^;]+;)/, `$1\n            ${newFontSrc}`);
  }
  
  // Update img-src
  const imgPrefix = "img-src 'self' https://*.ytimg.com https://5.imimg.com https://acasom.com h.cloudflare.com 5.imimg.com https://cdnjs.cloudflare.com";
  const newImgSrc = `${imgPrefix} ${domainString} data:;`;
  
  // Search for img-src. If missing, insert after font-src
  const imgRegex = /img-src\s+'self'[^;]+;/;
  if (imgRegex.test(netlifyContent)) {
    netlifyContent = netlifyContent.replace(imgRegex, newImgSrc);
  } else {
    netlifyContent = netlifyContent.replace(/(font-src\s+'self'[^;]+;)/, `$1\n            ${newImgSrc}`);
  }

  fs.writeFileSync(netlifyPath, netlifyContent);
  console.log('Successfully updated netlify.toml with extracted URLs and fixed CSP formatting.');
} else {
  console.log('netlify.toml not found at ' + netlifyPath);
}
