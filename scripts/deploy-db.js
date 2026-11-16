import pg from 'pg';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const { Client } = pg;

const run = async () => {
    const connectionString = process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('Error: DATABASE_URL is not defined in .env file.');
        process.exit(1);
    }

    /* 
       NOTE: If connection fails with ENETUNREACH on IPv6, you need to use the IPv4 Connection Pooler.
       Host: aws-0-[region].pooler.supabase.com (e.g., aws-0-ap-southeast-1.pooler.supabase.com)
       Port: 6543 (Transaction) or 5432 (Session)
    */

    console.log(`Connecting to database at ${connectionString.split('@')[1]}...`);

    const client = new Client({
        connectionString,
        ssl: {
            rejectUnauthorized: false,
        },
    });

    try {
        await client.connect();
        console.log('Connected to database!');

        // Define migrations directory
        const migrationsDir = path.join(__dirname, '../supabase/migrations');

        // Read all sql files
        if (!fs.existsSync(migrationsDir)) {
            throw new Error(`Migrations directory not found at ${migrationsDir}`);
        }

        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort(); // Ensure 001 runs before 002

        if (files.length === 0) {
            console.log('No migration files found.');
            return;
        }

        console.log(`Found ${files.length} migration files:`);
        files.forEach(f => console.log(` - ${f}`));
        console.log('Starting deployment...\n');

        // Execute sequentially
        for (const file of files) {
            console.log(`\n⏳ Running ${file}...`);
            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, 'utf8');

            try {
                await client.query(sql);
                console.log(`✅ ${file} completed successfully`);
            } catch (err) {
                console.error(`❌ ${file} FAILED`);
                throw err; // Stop on first error
            }
        }

        console.log('\n🎉 All migrations deployed successfully!');

    } catch (err) {
        console.error('\n❌ Deployment failed:', err.message);
        if (err.message.includes('ENETUNREACH')) {
            console.error('\nPOSSIBLE FIX: The database host is IPv6-only and this network does not support it.');
            console.error('Please update DATABASE_URL in .env to use the IPv4 Connection Pooler string.');
            console.error('Go to Supabase Dashboard -> Settings -> Database -> Connection Pooler to get it.');
        }
        process.exit(1);
    } finally {
        await client.end();
    }
};

run();
