import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';

const startDir = 'public/images/catalog';

async function compressLargeImages(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await compressLargeImages(fullPath);
    } else if (entry.name.endsWith('.png') || entry.name.endsWith('.jpg')) {
      const stat = await fs.stat(fullPath);
      if (stat.size > 500 * 1024) { // larger than 500KB
        console.log(`Compressing ${entry.name} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
        const tempPath = fullPath + '.tmp';
        
        try {
          if (entry.name.endsWith('.png')) {
            await sharp(fullPath)
              .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
              .png({ quality: 75, compressionLevel: 9 })
              .toFile(tempPath);
          } else {
            await sharp(fullPath)
              .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
              .jpeg({ quality: 75 })
              .toFile(tempPath);
          }
          await fs.rename(tempPath, fullPath);
          const newStat = await fs.stat(fullPath);
          console.log(` -> New size: ${(newStat.size / 1024 / 1024).toFixed(2)} MB`);
        } catch (e) {
          console.error(`Failed to compress ${entry.name}:`, e);
        }
      }
    }
  }
}

compressLargeImages(startDir).catch(console.error);
