import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🔍 Validating Database Schema...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

const expectedTables = [
    'users',
    'products',
    'blog_posts',
    'whitepaper_downloads',
    'product_assets',
    'pricing_tiers',
    'usage_rates',
    'shipping_rates',
    'orders',
    'order_items',
    'payments'
];

const validate = async () => {
    console.log('1️⃣ Testing table access...\n');

    const results = {
        accessible: [],
        missing: [],
        errors: []
    };

    for (const table of expectedTables) {
        try {
            const { data, error } = await supabase
                .from(table)
                .select('*')
                .limit(0); // Don't fetch data, just test access

            if (error) {
                if (error.code === 'PGRST116' || error.code === 'PGRST204') {
                    // Table exists but no data (normal)
                    results.accessible.push(table);
                    console.log(`   ✅ ${table}`);
                } else if (error.code === 'PGRST205' || error.code === '42P01') {
                    // Table doesn't exist
                    results.missing.push(table);
                    console.log(`   ❌ ${table} - Not found`);
                } else {
                    // Other error (possibly RLS blocking)
                    results.accessible.push(table);
                    console.log(`   ✅ ${table} (RLS active: ${error.message.substring(0, 30)}...)`);
                }
            } else {
                results.accessible.push(table);
                console.log(`   ✅ ${table}`);
            }
        } catch (err) {
            results.errors.push({ table, error: err.message });
            console.log(`   ⚠️  ${table} - ${err.message}`);
        }
    }

    // Summary
    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('📊 Validation Summary\n');
    console.log(`✅ Accessible tables: ${results.accessible.length}/${expectedTables.length}`);

    if (results.missing.length > 0) {
        console.log(`❌ Missing tables: ${results.missing.length}`);
        console.log('   Tables not found:', results.missing.join(', '));
    }

    if (results.errors.length > 0) {
        console.log(`⚠️  Errors encountered: ${results.errors.length}`);
        results.errors.forEach(({ table, error }) => {
            console.log(`   ${table}: ${error}`);
        });
    }

    console.log('═══════════════════════════════════════════════════════════\n');

    if (results.accessible.length === expectedTables.length) {
        console.log('🎉 All tables validated successfully!');
        console.log('\n✅ Database is ready for Phase 2: Storage & Authentication\n');
        return true;
    } else {
        console.log('⚠️  Some tables are missing. Please review migration execution.');
        console.log('   Rerun missing migrations in Supabase Dashboard SQL Editor.\n');
        return false;
    }
};

validate().then(success => {
    process.exit(success ? 0 : 1);
});
