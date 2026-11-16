import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');

dotenv.config({ path: path.join(ROOT, '.env') });
dotenv.config({ path: path.join(ROOT, '.env.local') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing credentials. Check .env and ensure SUPABASE_SERVICE_ROLE_KEY is set.');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    const downloadDir = path.join(ROOT, 'download');
    const files = fs.readdirSync(downloadDir).filter(f => f.startsWith('potential_partners_') && f.endsWith('.csv'));
    
    console.log(`Found ${files.length} partner CSV files to process.`);
    
    // Pre-fetch existing admin users to check for conflicts
    let adminUsersList = [];
    let page = 1;
    let hasMore = true;
    while(hasMore) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
        if(error || !data.users || data.users.length === 0) break;
        adminUsersList.push(...data.users);
        if(data.users.length < 1000) hasMore = false;
        page++;
    }

    let totalInserted = 0;

    for (const file of files) {
        console.log(`\n--- Processing ${file} ---`);
        const csvPath = path.join(downloadDir, file);
        const fileContent = fs.readFileSync(csvPath, 'utf8');
        const lines = fileContent.split('\n').map(l => l.trim()).filter(l => l);
        const headers = lines[0].split(',').map(h => h.trim());
        
        const records = [];
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i];
            let parts = [];
            let inQuotes = false;
            let current = '';
            for (let char of line) {
                if (char === '"') inQuotes = !inQuotes;
                else if (char === ',' && !inQuotes) { parts.push(current); current = ''; }
                else current += char;
            }
            parts.push(current);
            
            let record = {};
            for (let j = 0; j < headers.length; j++) {
                record[headers[j]] = parts[j] ? parts[j].replace(/^"|"$/g, '').trim() : '';
            }
            records.push(record);
        }

        console.log(`Found ${records.length} records in ${file}.`);
        
        for (const record of records) {
            const { Name, Email, Company, Country, Region, Notes } = record;
            
            let EmailClean = Email;
            if (Email && Email.includes('@')) {
                const parts = Email.split('@');
                // Avoid double appending if we run the script multiple times or it already has +skhy
                if (!parts[0].endsWith('+skhy')) {
                    EmailClean = `${parts[0]}+skhy@${parts[1]}`;
                }
            }

            if (!EmailClean || !Company) continue;

            const existingUser = adminUsersList.find(u => u.email === EmailClean);
            if (existingUser) {
                console.log(`  -> Skipping ${Company} (${EmailClean}), already exists.`);
                continue;
            }
            
            console.log(`  Processing: ${Company} (${EmailClean})`);

            // Create auth user. The 'handle_new_user' trigger will automatically insert into public.users.
            const { data: authData, error: authError } = await supabase.auth.admin.createUser({
                email: EmailClean,
                password: 'TempPassword123!',
                email_confirm: true,
                user_metadata: {
                    name: Name,
                    company_name: Company,
                    user_type: 'partner',
                    seller_type: 'manufacturer',
                    country: Country,
                    region: Region
                }
            });

            if (authError) {
                console.error(`  Error creating auth user: ${authError.message}`);
            } else {
                console.log(`    Successfully onboarded: ${Company} (Pending Admin Approval)`);
                adminUsersList.push({ email: EmailClean, id: authData.user.id }); // Add to cache
                totalInserted++;
            }
        }
    }

    console.log(`\nOperation complete. Inserted a total of ${totalInserted} new partners across ${files.length} files.`);
}

run().catch(console.error);
