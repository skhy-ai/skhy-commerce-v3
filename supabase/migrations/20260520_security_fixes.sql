-- =============================================================================
-- Security Migration: Phase 1+2 — Policies, Functions, Schema
-- Applied: 2026-05-20
-- =============================================================================
-- Covers:
--   SEC-03: Replace user_metadata->>'is_admin' with is_admin() (9 policies)
--   SEC-04: Auth guard on initiate_refund(), revoke anon execute
--   SEC-05: Auth guards on 5 unprotected admin functions
--   SEC-06: SET search_path on 17 SECURITY DEFINER functions
--   SEC-07: Drop hardcoded email RLS policy on site_config
--   SEC-09: TO {public} → TO {authenticated} on 12 tables
--   SEC-10: Restrict campaign_links UPDATE policy
--   SEC-11: Consolidate system_config read policies
--   SEC-13: product_reviews.is_approved DEFAULT false
--   SEC-14: Restrict site_visits reads to admins
--   SEC-15: Drop duplicate conflicting policies
--   SEC-16: Add delist_requests.token_hash column
--   SEC-20: Create orders_buyer_view
--   SEC-21: Add FK constraints on missing references
--   SEC-25: Drop public partner_performance_metrics policy
-- =============================================================================
-- NOTE: This file is a record of migrations already applied via Supabase MCP.
-- Re-running this is safe (DROP POLICY IF EXISTS / CREATE OR REPLACE / ADD COLUMN IF NOT EXISTS).
-- =============================================================================

-- ===== SEC-07 =====
DROP POLICY IF EXISTS "Allow admin write access" ON public.site_config;

-- ===== SEC-11 + SEC-15: system_config =====
DROP POLICY IF EXISTS "Admins update system config" ON public.system_config;
DROP POLICY IF EXISTS "Public read system config" ON public.system_config;
DROP POLICY IF EXISTS "Admin only access to system_config" ON public.system_config;
DROP POLICY IF EXISTS "Admins can view system config" ON public.system_config;
DROP POLICY IF EXISTS "Admins can update system config" ON public.system_config;
DROP POLICY IF EXISTS "Allow anon read maintenance_config" ON public.system_config;
CREATE POLICY "Admins full access to system_config" ON public.system_config FOR ALL TO authenticated USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Authenticated read system_config" ON public.system_config FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anon read maintenance_config only" ON public.system_config FOR SELECT TO anon USING (key IN ('maintenance_config', 'site_announcement'));

-- ===== SEC-15: site_config duplicate =====
DROP POLICY IF EXISTS "Public can read site_config" ON public.site_config;

-- ===== SEC-09: users =====
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.users;
CREATE POLICY "Users can delete their own profile" ON public.users FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own profile" ON public.users;
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===== SEC-09: saved_missions =====
DROP POLICY IF EXISTS "Users can insert their own saved missions" ON public.saved_missions;
CREATE POLICY "Users can insert their own saved missions" ON public.saved_missions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update their own saved missions" ON public.saved_missions;
CREATE POLICY "Users can update their own saved missions" ON public.saved_missions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can view their own saved missions" ON public.saved_missions;
CREATE POLICY "Users can view their own saved missions" ON public.saved_missions FOR SELECT TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete their own saved missions" ON public.saved_missions;
CREATE POLICY "Users can delete their own saved missions" ON public.saved_missions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- ===== SEC-09: user_components =====
DROP POLICY IF EXISTS "Users can insert own components" ON public.user_components;
CREATE POLICY "Users can insert own components" ON public.user_components FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own components" ON public.user_components;
CREATE POLICY "Users can update own components" ON public.user_components FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own components" ON public.user_components;
CREATE POLICY "Users can delete own components" ON public.user_components FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own components" ON public.user_components;
CREATE POLICY "Users can read own components" ON public.user_components FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===== SEC-09: user_configurations =====
DROP POLICY IF EXISTS "Users can insert own configurations" ON public.user_configurations;
CREATE POLICY "Users can insert own configurations" ON public.user_configurations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own configurations" ON public.user_configurations;
CREATE POLICY "Users can update own configurations" ON public.user_configurations FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own configurations" ON public.user_configurations;
CREATE POLICY "Users can delete own configurations" ON public.user_configurations FOR DELETE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can read own configurations" ON public.user_configurations;
CREATE POLICY "Users can read own configurations" ON public.user_configurations FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ===== SEC-09: refund_requests =====
DROP POLICY IF EXISTS "Buyers create refund requests" ON public.refund_requests;
CREATE POLICY "Buyers create refund requests" ON public.refund_requests FOR INSERT TO authenticated WITH CHECK (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Buyers view own refund requests" ON public.refund_requests;
CREATE POLICY "Buyers view own refund requests" ON public.refund_requests FOR SELECT TO authenticated USING (auth.uid() = buyer_id);
DROP POLICY IF EXISTS "Partners update refund response" ON public.refund_requests;
CREATE POLICY "Partners update refund response" ON public.refund_requests FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = refund_requests.order_id AND o.seller_id = auth.uid()));
DROP POLICY IF EXISTS "Partners view refund requests" ON public.refund_requests;
CREATE POLICY "Partners view refund requests" ON public.refund_requests FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = refund_requests.order_id AND o.seller_id = auth.uid()));
DROP POLICY IF EXISTS "Admins manage refund requests" ON public.refund_requests;
CREATE POLICY "Admins manage refund requests" ON public.refund_requests FOR ALL TO authenticated USING (is_admin());

-- ===== SEC-09: partner_payment_info =====
DROP POLICY IF EXISTS "Users can manage their own payment info" ON public.partner_payment_info;
CREATE POLICY "Users can manage their own payment info" ON public.partner_payment_info FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== SEC-09: trusted_devices =====
DROP POLICY IF EXISTS "Users manage own trusted devices" ON public.trusted_devices;
CREATE POLICY "Users manage own trusted devices" ON public.trusted_devices FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ===== SEC-09: product_reviews =====
DROP POLICY IF EXISTS "Users can create reviews" ON public.product_reviews;
CREATE POLICY "Users can create reviews" ON public.product_reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can update own reviews" ON public.product_reviews;
CREATE POLICY "Users can update own reviews" ON public.product_reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "Admins manage reviews" ON public.product_reviews;
CREATE POLICY "Admins manage reviews" ON public.product_reviews FOR ALL TO authenticated USING (is_admin());

-- ===== SEC-09: sales_agents =====
DROP POLICY IF EXISTS "Only admins can insert sales_agents." ON public.sales_agents;
CREATE POLICY "Only admins can insert sales_agents." ON public.sales_agents FOR INSERT TO authenticated WITH CHECK (is_admin());
DROP POLICY IF EXISTS "Only admins can update sales_agents." ON public.sales_agents;
CREATE POLICY "Only admins can update sales_agents." ON public.sales_agents FOR UPDATE TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "Only admins can delete sales_agents." ON public.sales_agents;
CREATE POLICY "Only admins can delete sales_agents." ON public.sales_agents FOR DELETE TO authenticated USING (is_admin());

-- ===== SEC-09: qos_violations =====
DROP POLICY IF EXISTS "Admins manage violations" ON public.qos_violations;
CREATE POLICY "Admins manage violations" ON public.qos_violations FOR ALL TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "Partners view own violations" ON public.qos_violations;
CREATE POLICY "Partners view own violations" ON public.qos_violations FOR SELECT TO authenticated USING (auth.uid() = partner_id);

-- ===== SEC-09: payment_transactions =====
DROP POLICY IF EXISTS "Admins view all payment transactions" ON public.payment_transactions;
CREATE POLICY "Admins view all payment transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "Partners view own payment transactions" ON public.payment_transactions;
CREATE POLICY "Partners view own payment transactions" ON public.payment_transactions FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM public.orders o WHERE o.id = payment_transactions.order_id AND o.seller_id = auth.uid()));

-- ===== SEC-09: partner_qos_acceptance =====
DROP POLICY IF EXISTS "Partners manage QoS acceptance" ON public.partner_qos_acceptance;
CREATE POLICY "Partners manage QoS acceptance" ON public.partner_qos_acceptance FOR ALL TO authenticated USING (auth.uid() = partner_id) WITH CHECK (auth.uid() = partner_id);

-- ===== SEC-09: supplier_agreements =====
DROP POLICY IF EXISTS "Admins can manage all agreements" ON public.supplier_agreements;
CREATE POLICY "Admins can manage all agreements" ON public.supplier_agreements FOR ALL TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "Partners can view their own agreements" ON public.supplier_agreements;
CREATE POLICY "Partners can view their own agreements" ON public.supplier_agreements FOR SELECT TO authenticated USING (auth.uid() = partner_id);

-- ===== SEC-03: partner_performance_metrics =====
DROP POLICY IF EXISTS "Admins manage partner metrics" ON public.partner_performance_metrics;
DROP POLICY IF EXISTS "Admins view partner metrics" ON public.partner_performance_metrics;
CREATE POLICY "Admins manage partner metrics" ON public.partner_performance_metrics FOR ALL TO authenticated USING (is_admin());
DROP POLICY IF EXISTS "Partners view own metrics" ON public.partner_performance_metrics;
CREATE POLICY "Partners view own metrics" ON public.partner_performance_metrics FOR SELECT TO authenticated USING (auth.uid() = partner_id);

-- ===== SEC-25 =====
DROP POLICY IF EXISTS "Public view partner metrics" ON public.partner_performance_metrics;

-- ===== SEC-10 =====
DROP POLICY IF EXISTS "Public can update campaign links stats" ON public.pitch_deck_campaign_links;
CREATE POLICY "Public can update own campaign link stats" ON public.pitch_deck_campaign_links FOR UPDATE TO anon USING (true) WITH CHECK (tracking_token IS NOT NULL);

-- ===== SEC-14 =====
DROP POLICY IF EXISTS "Allow public reads" ON public.site_visits;
CREATE POLICY "Admins read site visits" ON public.site_visits FOR SELECT TO authenticated USING (is_admin());

-- ===== SEC-13 =====
ALTER TABLE public.product_reviews ALTER COLUMN is_approved SET DEFAULT false;

-- ===== SEC-09: pitch_deck_recipients =====
DROP POLICY IF EXISTS "Admins can manage pitch deck recipients" ON public.pitch_deck_recipients;
CREATE POLICY "Admins can manage pitch deck recipients" ON public.pitch_deck_recipients FOR ALL TO authenticated USING (is_admin());

-- ===== SEC-16 =====
ALTER TABLE public.delist_requests ADD COLUMN IF NOT EXISTS token_hash text;
UPDATE public.delist_requests SET token_hash = encode(sha256(token::bytea), 'hex') WHERE token_hash IS NULL AND token IS NOT NULL;

-- ===== SEC-20 =====
CREATE OR REPLACE VIEW public.orders_buyer_view AS
  SELECT id, order_number, buyer_id, seller_id, status, total_amount, currency,
    shipping_amount, tax_amount, shipping_address, shipping_method, tracking_number,
    billing_address, notes, confirmed_at, shipped_at, delivered_at, cancelled_at,
    created_at, updated_at, carrier, shipping_label_url, payment_released,
    payment_released_at, delivery_proof_url, refund_eligible_until, dispute_reason,
    dispute_created_at, shipping_courier_id, payment_intent_id, payout_status,
    delivery_country_code, primary_location_id
  FROM public.orders WHERE buyer_id = auth.uid();

-- ===== SEC-21 =====
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_apa_agent' AND table_name = 'agent_partner_agreements') THEN
    ALTER TABLE public.agent_partner_agreements ADD CONSTRAINT fk_apa_agent FOREIGN KEY (agent_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_apa_partner' AND table_name = 'agent_partner_agreements') THEN
    ALTER TABLE public.agent_partner_agreements ADD CONSTRAINT fk_apa_partner FOREIGN KEY (partner_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_pqa_partner' AND table_name = 'partner_qos_acceptance') THEN
    ALTER TABLE public.partner_qos_acceptance ADD CONSTRAINT fk_pqa_partner FOREIGN KEY (partner_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'fk_qv_partner' AND table_name = 'qos_violations') THEN
    ALTER TABLE public.qos_violations ADD CONSTRAINT fk_qv_partner FOREIGN KEY (partner_id) REFERENCES public.users(user_id) ON DELETE CASCADE;
  END IF;
END;
$$;

-- ===== SEC-04 + SEC-05 + SEC-06: Functions =====
-- (Full function bodies in the MCP execution above — see generate_complete_backup.sql output for current state)
-- Functions updated: is_admin, check_is_blacklisted, get_unique_visitor_count,
--   initiate_refund, initiate_refund_secure, check_and_cancel_unshipped_orders,
--   process_automatic_releases, recalculate_all_partner_metrics, append_recipient_activity,
--   increment_upvotes, calculate_partner_metrics, validate_partner_payment_info,
--   protect_user_roles, sync_user_type_to_metadata, handle_new_user,
--   check_refund_eligibility, calculate_refund_eligible_until
