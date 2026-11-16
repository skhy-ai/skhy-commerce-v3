import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Validating Supabase Connection...\n');

// Test 1: Environment Variables
console.log('1️⃣ Checking environment variables...');
if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing environment variables!');
    console.log('   VITE_SUPABASE_URL:', supabaseUrl ? '✓' : '✗');
    console.log('   VITE_SUPABASE_ANON_KEY:', supabaseKey ? '✓' : '✗');
    process.exit(1);
}
console.log('✅ Environment variables found');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseKey.substring(0, 20) + '...\n');

// Test 2: Connection
const supabase = createClient(supabaseUrl, supabaseKey);
console.log('2️⃣ Testing database connection...');

try {
    const { data, error } = await supabase.from('users').select('count');

    // PGRST116 = JSON object not found (sometimes returned for single row requests)
    // 42P01 = PostgreSQL table doesn't exist
    // PGRST205 = Resource not found (table doesn't exist in exposed schema)
    if (error && error.code !== 'PGRST116' && error.code !== '42P01' && error.code !== 'PGRST205') {
        throw error;
    } else if (error && (error.code === '42P01' || error.code === 'PGRST205')) {
        console.log('✅ Database connection successful (Note: Tables missing, ready for migration)\n');
    } else {
        console.log('✅ Database connection successful\n');
    }
} catch (err) {
    console.error('❌ Database connection failed:', err.message);
    console.error('   Error code:', err.code);
    process.exit(1);
}

// Test 3: Check existing tables
console.log('3️⃣ Checking existing tables...');
const tablesToCheck = ['users', 'products', 'blog_posts'];
const existingTables = [];

for (const table of tablesToCheck) {
    try {
        const { error } = await supabase.from(table).select('*').limit(1);
        if (!error || error.code === 'PGRST103') { // PGRST103 = no rows (but table exists)
            existingTables.push(table);
            console.log(`   ${table}: ✓ exists`);
        } else {
            // PGRST205 = table not found
            console.log(`   ${table}: ✗ missing (will be created)`);
        }
    } catch (err) {
        console.log(`   ${table}: ✗ missing or inaccessible`);
    }
}

if (existingTables.length > 0) {
    console.log(`✅ Found ${existingTables.length} existing tables\n`);
} else {
    console.log('⚠️  No existing tables found (normal for first-time setup)\n');
}

// Test 4: Check auth enabled
console.log('4️⃣ Testing authentication service...');
try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    console.log('✅ Auth service is enabled\n');
} catch (err) {
    console.error('⚠️  Auth may not be configured:', err.message);
    console.log('   👉 Enable auth in: Supabase Dashboard > Authentication > Providers\n');
}

// Test 5: Check storage
console.log('5️⃣ Testing storage service...');
try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) throw error;
    console.log('✅ Storage service is accessible');
    if (data && data.length > 0) {
        console.log(`   Found ${data.length} storage buckets:`);
        data.forEach(bucket => console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`));
    } else {
        console.log('   No storage buckets created yet');
    }
    console.log('');
} catch (err) {
    console.error('⚠️  Storage may not be configured:', err.message);
    console.log('   👉 Storage buckets can be created after migration\n');
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
console.log('🎉 Validation Complete!\n');
console.log('Summary:');
console.log(`  ✓ Database connection: Working`);
console.log(`  ✓ Existing tables: ${existingTables.length} found`);
console.log(`  ${existingTables.length > 0 ? '✓' : '⚠'} Ready for migration: ${existingTables.length > 0 ? 'Yes (will extend existing)' : 'Yes (fresh install)'}`);
console.log('');
console.log('Next steps:');
console.log('  1. Review migration files in supabase/migrations/');
console.log('  2. Run migrations in order: 001, 002, 003, 004');
console.log('  3. Verify each phase before proceeding');
console.log('═══════════════════════════════════════════════════════════\n');
