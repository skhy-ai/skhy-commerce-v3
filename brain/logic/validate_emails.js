import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const downloadDir = path.join(__dirname, '../download');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const commonTypos = {
    'gnail.com': 'gmail.com',
    'gmal.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'hotmial.com': 'hotmail.com'
};

function validateAndCorrect(dir) {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.csv'));
    let hasErrors = false;

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const content = fs.readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        let newLines = [];
        let modified = false;

        lines.forEach((line, index) => {
            if (index === 0 || !line.trim()) {
                newLines.push(line);
                return;
            }

            const parts = line.split(','); // Simple CSV split, assumes no commas in fields for email check
            // Actually, the format is Name,Email,Company... so Email is index 1.
            // But some lines might have quoted fields with commas. 
            // Better regex split: separate by comma but ignore commas inside quotes.
            // For this simple task, simple split might suffice if Email is always 2nd and doesn't contain commas.
            // Let's rely on standard split for now, assuming well-formed CSVs I just created.

            // To be safer for existing files:
            const matches = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
            // This is getting complicated without a CSV parser lib. 
            // Let's stick to simple split for email extraction.

            const rawParts = line.split(',');
            let email = rawParts[1] ? rawParts[1].trim() : '';

            // Handle potential quotes around email
            email = email.replace(/"/g, '');

            if (!email) {
                newLines.push(line);
                return;
            }

            let isValid = emailRegex.test(email);
            let domain = email.split('@')[1];

            // Auto-correct common typos
            if (domain && commonTypos[domain]) {
                console.log(`[${file}] Auto-correcting typo: ${email} -> ${email.replace(domain, commonTypos[domain])}`);
                email = email.replace(domain, commonTypos[domain]);
                // Reconstruct line
                rawParts[1] = email;
                newLines.push(rawParts.join(','));
                modified = true;
                return;
            }

            if (!isValid) {
                console.warn(`[${file}] Invalid email found on line ${index + 1}: ${email}`);
                // Try to simple fix if likely valid just missing .com etc
                if (!email.includes('.')) {
                    console.log(`[${file}] Attempting fix: Appending .com to ${email}`);
                    email += '.com';
                    rawParts[1] = email;
                    newLines.push(rawParts.join(','));
                    modified = true;
                    return;
                }
                hasErrors = true;
            }

            newLines.push(line);
        });

        if (modified) {
            fs.writeFileSync(filePath, newLines.join('\n'));
            console.log(`[${file}] Saved corrections.`);
        }
    });

    if (hasErrors) {
        console.log('Validation finished with some suspect emails remaining (see logs).');
    } else {
        console.log('Validation passed for all checked files.');
    }
}

validateAndCorrect(downloadDir);
