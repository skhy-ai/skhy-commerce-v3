import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!url || !serviceKey) {
  console.error("Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(url, serviceKey);

async function migrate() {
  console.log("🚀 STARTING WAITLIST LEADS DATA MIGRATION...\n");

  let totalMigrated = 0;

  // 1. Fetch product_waitlist records
  console.log("📥 Inspecting product_waitlist records...");
  const { data: pwData, error: pwError } = await supabase.from('product_waitlist').select('*');
  if (pwError) {
    console.error("Error fetching product_waitlist:", pwError.message);
  } else {
    console.log(`Found ${pwData?.length || 0} existing records in product_waitlist.`);
  }

  // 2. Fetch pitch_deck_leads records and migrate into product_waitlist & waitlist_leads
  console.log("\n📥 Fetching pitch_deck_leads records...");
  const { data: pdData, error: pdError } = await supabase.from('pitch_deck_leads').select('*');
  if (pdError) {
    console.error("Error fetching pitch_deck_leads:", pdError.message);
  } else if (pdData && pdData.length > 0) {
    console.log(`Found ${pdData.length} records in pitch_deck_leads.`);
    for (const row of pdData) {
      const interests = Array.isArray(row.interests) ? row.interests.join(', ') : (row.interests || 'product_inquiry');
      
      // Target 1: waitlist_leads
      const wlPayload = {
        email: row.email,
        name: row.name || 'Website Visitor',
        full_name: row.name || 'Website Visitor',
        company: row.company || '-',
        company_name: row.company || '-',
        phone: '',
        intent: interests || 'website_inquiry',
        sub_category: 'pitch_deck_visitor',
        product_name: 'Website Lead / Pitch Deck Inquiry',
        product_id: '',
        source: row.source || 'pitch_deck_lead',
        message: `Captured from pitch_deck_leads (Session: ${row.session_id || 'N/A'})`,
        created_at: row.created_at || new Date().toISOString()
      };

      const { error: insWlErr } = await supabase.from('waitlist_leads').insert([wlPayload]);
      if (insWlErr) {
        console.log(`[waitlist_leads note] ${insWlErr.message}`);
      } else {
        totalMigrated++;
        console.log(`  ✓ Migrated to waitlist_leads: ${row.email}`);
      }

      // Target 2: product_waitlist (for table availability compatibility)
      const pwPayload = {
        email: row.email,
        full_name: row.name || 'Website Visitor',
        company_name: row.company || '-',
        phone: '',
        product_name: `PITCH DECK LEAD - Website Inquiry`,
        product_id: '',
        message: `[Intent: ${interests}] [Source: ${row.source || 'pitch_deck_lead'}] Session: ${row.session_id || 'N/A'}`,
        created_at: row.created_at || new Date().toISOString()
      };

      const { error: insPwErr } = await supabase.from('product_waitlist').insert([pwPayload]);
      if (insPwErr) {
        console.log(`[product_waitlist note] ${insPwErr.message}`);
      } else {
        totalMigrated++;
        console.log(`  ✓ Consolidated into product_waitlist: ${row.email}`);
      }
    }
  }

  // 3. Fetch pro_subscriptions_interest records
  console.log("\n📥 Fetching pro_subscriptions_interest records...");
  try {
    const { data: proData, error: proError } = await supabase.from('pro_subscriptions_interest').select('*');
    if (!proError && proData && proData.length > 0) {
      console.log(`Found ${proData.length} records in pro_subscriptions_interest.`);
      for (const row of proData) {
        const pwPayload = {
          email: row.email,
          full_name: 'PRO Simulator Visitor',
          company_name: '-',
          phone: '',
          product_name: 'BUILD DRONE - Mission Architect Pro',
          product_id: 'pro_upgrade',
          message: '[Intent: build_drone / pro_upgrade] User requested PRO Subscription Upgrade',
          created_at: row.created_at || new Date().toISOString()
        };

        const { error: insPwErr } = await supabase.from('product_waitlist').insert([pwPayload]);
        if (!insPwErr) {
          totalMigrated++;
          console.log(`  ✓ Consolidated PRO upgrade lead: ${row.email}`);
        }
      }
    } else {
      console.log("No extra records in pro_subscriptions_interest.");
    }
  } catch (err) {
    console.log("pro_subscriptions_interest check complete.");
  }

  console.log("\n=======================================================");
  console.log(`🎉 MIGRATION & CONSOLIDATION COMPLETE!`);
  console.log(`Total records processed: ${totalMigrated}`);
  console.log("=======================================================\n");
}

migrate();
