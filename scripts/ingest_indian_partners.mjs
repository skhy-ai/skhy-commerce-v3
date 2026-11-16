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
    const csvPath = path.join(ROOT, 'download', 'potential_partners_drones_india.csv');
    
    if (!fs.existsSync(csvPath)) {
        console.error('CSV file not found:', csvPath);
        process.exit(1);
    }

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

    console.log(`Found ${records.length} records in CSV.`);
    let inserted = 0;

    for (const record of records) {
        const { Name, Email, Company, Country, Region, Notes } = record;
        
        let EmailClean = Email;
        if (Email.includes('@')) {
            const parts = Email.split('@');
            EmailClean = `${parts[0]}+skhy@${parts[1]}`;
        }

        if (!EmailClean || !Company) continue;
        console.log(`Processing: ${Company} (${EmailClean})`);

        // Get existing user ID if already created
        const { data: adminUsers, error: adminErr } = await supabase.auth.admin.listUsers();
        if (!adminErr && adminUsers && adminUsers.users) {
            const u = adminUsers.users.find(u => u.email === EmailClean);
            if (u) {
                console.log(`  -> Deleting existing user to recreate with correct metadata...`);
                await supabase.auth.admin.deleteUser(u.id);
            }
        }

        // 1. Create auth user. The 'handle_new_user' trigger will automatically insert into public.users.
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
            console.log(`  -> Successfully onboarded partner: ${Company} (Pending Admin Approval)`);
            inserted++;
        }
    }

    console.log(`\nOperation complete. Inserted ${inserted} partners.`);
}

run().catch(console.error);
