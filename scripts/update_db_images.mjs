import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const updates = [
  { name: 'SKHY Surveyor (VTOL Fixed-Wing)', url: 'https://i.ibb.co/Lz3VM34Y/Screenshot-2026-05-02-010558.png' },
  { name: 'SKHY Composite Cruiser (Mid-Wing)', url: 'https://i.ibb.co/C3bd1HTr/AB4v1-Air-unit-for-FPV-drones.png' },
  { name: 'Mini Talon (Long Range)', url: '/images/products/mini_talon_drone.png' },
  { name: 'Delta Flying Wing (Sprint)', url: '/images/products/delta_wing_drone.png' }
];

async function updateDatabaseImages() {
  for (const item of updates) {
    console.log(`Looking up product: ${item.name}`);
    const { data: product, error: pErr } = await supabase
      .from('products')
      .select('id')
      .eq('name', item.name)
      .single();

    if (pErr || !product) {
      console.error(`Failed to find ${item.name}:`, pErr?.message);
      continue;
    }

    console.log(`Found ${item.name} with ID ${product.id}. Updating assets...`);
    
    // Check if asset exists
    const { data: assets, error: aErr } = await supabase
      .from('product_assets')
      .select('id')
      .eq('product_id', product.id);

    if (assets && assets.length > 0) {
      // Update existing asset
      const { error: updErr } = await supabase
        .from('product_assets')
        .update({ file_url: item.url })
        .eq('id', assets[0].id);
      
      if (updErr) console.error(`Error updating asset for ${item.name}:`, updErr.message);
      else console.log(`Successfully updated asset for ${item.name}`);
    } else {
      // Create new asset
      const { error: insErr } = await supabase
        .from('product_assets')
        .insert({
          product_id: product.id,
          file_url: item.url,
          asset_type: 'image',
          is_primary: true
        });

      if (insErr) console.error(`Error inserting asset for ${item.name}:`, insErr.message);
      else console.log(`Successfully inserted asset for ${item.name}`);
    }
  }
}

updateDatabaseImages().then(() => console.log('Done.')).catch(console.error);
