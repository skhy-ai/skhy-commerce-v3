import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

console.log('🗄️  Validating Storage Buckets...\n');

const supabase = createClient(supabaseUrl, supabaseKey);

const expectedBuckets = [
    'product-images',
    'product-documents',
    'company-logos'
];

const validate = async () => {
    console.log('1️⃣ Checking storage buckets...\n');

    try {
        const { data: buckets, error } = await supabase.storage.listBuckets();

        if (error) {
            console.error('❌ Error fetching buckets:', error.message);
            return false;
        }

        const bucketNames = buckets.map(b => b.name);
        const results = {
            found: [],
            missing: []
        };

        for (const bucket of expectedBuckets) {
            if (bucketNames.includes(bucket)) {
                results.found.push(bucket);
                const bucketInfo = buckets.find(b => b.name === bucket);
                console.log(`   ✅ ${bucket}`);
                console.log(`      Public: ${bucketInfo.public ? 'Yes' : 'No'}`);
                console.log(`      Max size: ${(bucketInfo.file_size_limit / 1024 / 1024).toFixed(1)}MB`);
            } else {
                results.missing.push(bucket);
                console.log(`   ❌ ${bucket} - Not found`);
            }
        }

        console.log('\n═══════════════════════════════════════════════════════════');
        console.log('📊 Validation Summary\n');
        console.log(`✅ Found buckets: ${results.found.length}/${expectedBuckets.length}`);

        if (results.missing.length > 0) {
            console.log(`❌ Missing buckets: ${results.missing.length}`);
            console.log('   Buckets not found:', results.missing.join(', '));
            console.log('\n📝 Action required:');
            console.log('   Run migration: 005_storage_setup.sql in Supabase Dashboard');
        }

        console.log('═══════════════════════════════════════════════════════════\n');

        if (results.found.length === expectedBuckets.length) {
            console.log('🎉 All storage buckets validated successfully!');
            console.log('\n✅ Storage is ready for file uploads\n');
            return true;
        } else {
            return false;
        }

    } catch (err) {
        console.error('❌ Validation failed:', err.message);
        return false;
    }
};

validate().then(success => {
    process.exit(success ? 0 : 1);
});
