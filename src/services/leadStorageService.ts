// src/services/leadStorageService.ts
import { supabase } from '../lib/supabase';

export interface WaitlistLeadPayload {
  email: string;
  name?: string;
  fullName?: string;
  company?: string;
  companyName?: string;
  phone?: string;
  intent?: string;
  subCategory?: string;
  productName?: string;
  productId?: string;
  source?: string;
  message?: string;
}

export async function saveWaitlistLead(payload: WaitlistLeadPayload): Promise<void> {
  const email = payload.email?.trim();
  if (!email) throw new Error('Email is required for waitlist lead');

  const name = payload.name || payload.fullName || 'Website Visitor';
  const company = payload.company || payload.companyName || '-';
  const phone = payload.phone || '';
  const intent = payload.intent || 'Product Interest';
  const subCategory = payload.subCategory || '';
  const productName = payload.productName || 'General Product Inquiry';
  const productId = payload.productId || '';
  const source = payload.source || 'website_lead';
  const message = payload.message || '';

  // 1. Primary insert to waitlist_leads table
  const primaryRecord = {
    email,
    name,
    full_name: name,
    company,
    company_name: company,
    phone,
    intent,
    sub_category: subCategory,
    product_name: productName,
    product_id: productId,
    source,
    message,
    created_at: new Date().toISOString()
  };

  try {
    const { error: primaryError } = await supabase
      .from('waitlist_leads')
      .insert([primaryRecord]);

    if (primaryError) {
      console.warn('[saveWaitlistLead] Primary waitlist_leads insert note:', primaryError.message);
      
      // 2. Fallback insert to product_waitlist table for schema compatibility
      const fallbackRecord = {
        email,
        full_name: name,
        company_name: company,
        phone,
        product_name: `${intent.toUpperCase()} - ${productName}`,
        product_id: productId,
        message: `[Intent: ${intent}${subCategory ? ` / ${subCategory}` : ''}] [Source: ${source}] ${message}`.trim()
      };

      const { error: fallbackError } = await supabase
        .from('product_waitlist')
        .insert([fallbackRecord]);

      if (fallbackError) {
        console.warn('[saveWaitlistLead] Fallback product_waitlist insert note:', fallbackError.message);
      }
    } else {
      // Mirror to product_waitlist as well to ensure total admin view consistency
      await supabase
        .from('product_waitlist')
        .insert([{
          email,
          full_name: name,
          company_name: company,
          phone,
          product_name: `${intent.toUpperCase()} - ${productName}`,
          product_id: productId,
          message: `[Intent: ${intent}${subCategory ? ` / ${subCategory}` : ''}] [Source: ${source}] ${message}`.trim()
        }])
        .then(() => {})
        .catch(() => {});
    }
  } catch (err) {
    console.error('[saveWaitlistLead] Lead insertion error:', err);
  }
}
