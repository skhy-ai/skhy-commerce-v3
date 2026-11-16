const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '..', 'dist');

if (!fs.existsSync(distDir)) {
  console.log('[Security Audit] dist directory does not exist, skipping check.');
  process.exit(0);
}

const sensitivePatterns = [
  /sk-or-v1-[a-zA-Z0-9_-]{20,}/i,
  /VITE_OPENROUTER_KEY/i,
];

let leaksFound = 0;

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (/\.(js|html|css|json|map)$/i.test(entry.name)) {
      const content = fs.readFileSync(fullPath, 'utf8');

      for (const pattern of sensitivePatterns) {
        if (pattern.test(content)) {
          console.error(`\x1b[31m[SECURITY VIOLATION] Found sensitive secret matching pattern ${pattern} in:\x1b[0m ${fullPath}`);
          leaksFound++;
        }
      }
    }
  }
}

console.log('[Security Audit] Scanning dist/ for leaked OpenRouter secrets...');
scanDirectory(distDir);

if (leaksFound > 0) {
  console.error(`\x1b[31m[FAILED] Build rejected: ${leaksFound} secret leak(s) detected in build artifacts!\x1b[0m`);
  process.exit(1);
} else {
  console.log('\x1b[32m[Security Audit Passed] No OpenRouter API secrets found in build bundle.\x1b[0m');
  process.exit(0);
}
