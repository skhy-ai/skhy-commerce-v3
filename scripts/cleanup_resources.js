/**
 * Cleanup Resources: Detects and removes unused Mermaid diagrams and marketplace images.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const MERMAID_DIR = path.join(rootDir, 'src/data/mermaid');
const WIRING_INDEX = path.join(MERMAID_DIR, 'wiringIndex.ts');
const REGISTRY_JSON = path.join(MERMAID_DIR, 'registry.json');
const MARKETPLACE_DIR = path.join(rootDir, 'public/images/marketplace');
const CHUNKS_DIR = path.join(rootDir, 'src/data/marketplace');

const dryRun = process.argv.some(arg => arg.startsWith('--dry-run'));

console.log(`-- Starting cleanup (${dryRun ? 'DRY RUN' : 'ACTUAL DELETE'}) --\n`);

// 1. COLLECT REFERENCED MERMAID FILES
const referencedMMD = new Set();
const wiringContent = fs.readFileSync(WIRING_INDEX, 'utf-8');
const indexMatches = wiringContent.match(/wiring_[a-zA-Z0-9_]+\.mmd/g) || [];
indexMatches.forEach(m => referencedMMD.add(m));

if (fs.existsSync(REGISTRY_JSON)) {
  const registry = JSON.parse(fs.readFileSync(REGISTRY_JSON, 'utf-8'));
  Object.values(registry).forEach((entry) => {
    if (entry.file) referencedMMD.add(entry.file);
  });
}

// 2. COLLECT REFERENCED IMAGES
const referencedImages = new Set();
if (fs.existsSync(CHUNKS_DIR)) {
  const chunks = fs.readdirSync(CHUNKS_DIR).filter(f => f.startsWith('chunk_') && f.endsWith('.json'));
  chunks.forEach(chunk => {
    const content = fs.readFileSync(path.join(CHUNKS_DIR, chunk), 'utf-8');
    const imageMatches = content.match(/\/images\/marketplace\/[^"]+/g) || [];
    imageMatches.forEach(m => {
      const filename = path.basename(m);
      referencedImages.add(filename);
    });
  });
}

// 3. CLEANUP MERMAID
let mmdDeleted = 0;
if (fs.existsSync(MERMAID_DIR)) {
  const files = fs.readdirSync(MERMAID_DIR).filter(f => f.endsWith('.mmd'));
  files.forEach(file => {
    if (!referencedMMD.has(file)) {
      console.log(`[MERMAID] Orphan detected: ${file}`);
      if (!dryRun) fs.unlinkSync(path.join(MERMAID_DIR, file));
      mmdDeleted++;
    }
  });
}

// 4. CLEANUP IMAGES
let imgDeleted = 0;
if (fs.existsSync(MARKETPLACE_DIR)) {
  const files = fs.readdirSync(MARKETPLACE_DIR);
  files.forEach(file => {
    if (!referencedImages.has(file)) {
      console.log(`[IMAGE] Orphan detected: ${file}`);
      if (!dryRun) fs.unlinkSync(path.join(MARKETPLACE_DIR, file));
      imgDeleted++;
    }
  });
}

console.log(`\n-- Cleanup Summary --`);
console.log(`Mermaid Files: ${mmdDeleted} deleted, ${referencedMMD.size} kept`);
console.log(`Marketplace Images: ${imgDeleted} deleted, ${referencedImages.size} kept`);
if (dryRun) console.log(`\nNOTE: This was a dry run. Use --dry-run=false or remove flag to delete.`);
