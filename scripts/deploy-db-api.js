import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🚀 Deploying migrations via Supabase API...\n');

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.error('   Required: VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const runMigrations = async () => {
    try {
        const migrationsDir = path.join(__dirname, '../supabase/migrations');

        if (!fs.existsSync(migrationsDir)) {
            throw new Error(`Migrations directory not found at ${migrationsDir}`);
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        if (files.length === 0) {
            console.log('No migration files found.');
            return;
        }

        console.log(`Found ${files.length} migration files:`);
        files.forEach(f => console.log(` - ${f}`));
        console.log('\n⚠️  NOTE: This script uses the Supabase REST API, which has limitations.');
        console.log('For complex migrations, use the Supabase Dashboard SQL Editor instead.\n');
        console.log('Starting deployment...\n');

        // Execute sequentially via RPC
        for (const file of files) {
            console.log(`⏳ Running ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                // Use Supabase RPC to execute raw SQL
                // Note: This requires a database function to execute arbitrary SQL
                // which may not exist. This is a limitation of the REST API approach.

                // Alternative: We'll guide user to use Dashboard
                console.log(`⚠️  ${file} - Manual execution required`);
                console.log(`   Please run this file in Supabase Dashboard > SQL Editor`);

            } catch (err) {
                console.error(`❌ ${file} FAILED:`, err.message);
                throw err;
            }
        }

        console.log('\n⚠️  API-based migration has limitations.');
        console.log('\n📋 RECOMMENDED APPROACH:');
        console.log('1. Go to: https://supabase.com/dashboard/project/<PROJECT_ID>/sql');
        console.log('2. Click "New Query"');
        console.log('3. Copy and paste each migration file in order:');
        files.forEach((f, i) => {
            console.log(`   ${i + 1}. ${f}`);
        });
        console.log('4. Click "Run" for each migration');
        console.log('\nThis is the most reliable method for complex schema changes.');

    } catch (err) {
        console.error('\n❌ Deployment preparation failed:', err.message);
        process.exit(1);
    }
};

runMigrations();
