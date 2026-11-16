export interface User {
  id: string; // uuid from auth.users
  company_name: string;
  email: string;
  user_type: 'buyer' | 'seller' | 'admin';
  seller_type?: 'manufacturer' | 'reseller' | 'distributor' | 'seller' | null;
  stripe_customer_id?: string | null;
  logo_url?: string | null;
  restricted_countries?: string[] | null;
  shipping_preference?: 'self_managed' | 'skhy_ai' | null;
  default_currency?: string;
  business_doc_url?: string;
  approved?: boolean;
  is_blacklisted?: boolean;
  terms_accepted?: boolean;
  terms_accepted_at?: string;
  user_metadata?: {
    website?: string;
    description?: string;
    [key: string]: any;
  };
  policies?: {
    return_policy?: string;
    shipping_policy?: string;
    support_email?: string;
  };
  return_address?: {
    line1: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string | number;
  name: string;
  description?: string;
  type: string;
  category?: string;
  pricing_model: 'flat' | 'package' | 'tiered' | 'usage' | 'unit';
  base_price?: number;
  unit?: string;
  currency: string;
  tax_exempt: boolean;
  is_active?: boolean;
  show_on_marketplace?: boolean;
  restricted_countries?: string[];
  youtube_url?: string;
  hide_pricing?: boolean;
  ready_to_sale?: boolean;
  stock_quantity?: number;
  sku?: string;
  weight_kg?: number;
  dimensions?: string; // "LxWxH cm"
  manufacturer?: string;
  country_of_origin?: string;
  operating_voltage?: string;
  operating_current?: string;
  supplier_managed_pricing?: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PricingTier {
  id: number;
  product_id: string | number;
  min_units: number;
  max_units?: number;
  price: number;
}

export interface UsageRate {
  id: number;
  product_id: string | number;
  metric: string;
  rate: number;
}

export interface ProductAsset {
  id: number;
  product_id: string | number;
  asset_type: 'image' | 'video' | 'datasheet' | 'logo' | 'brochure' | 'manual';
  file_url: string;
  local_url?: string;
  file_name?: string;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ShippingRate {
  id: number;
  seller_id: string; // uuid -> public.users.id
  rate_type: 'flat' | 'weight_based' | 'tiered' | 'distance_based';
  origin_country: string;
  destination_country: string;
  courier_name?: string;
  base_rate: number;
  per_unit_rate?: number;
  min_weight?: number;
  max_weight?: number;
  estimated_days?: number;
  currency: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: number;
  order_id: number;
  payment_date: string;
  amount: number;
  payment_method?: string;
  transaction_id?: string;
  status: 'pending' | 'successful' | 'failed';
  stripe_payment_intent_id?: string;
  stripe_charge_id?: string;
  stripe_subscription_id?: string;
  created_at: string;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  required: boolean;
}


export interface MarketplaceProduct extends Product {
  seller: User;
  product_assets?: ProductAsset[];
  pricing_tiers?: PricingTier[];
  usage_rates?: UsageRate[];
  features?: string[];
  specifications?: Array<{ parameter: string; value: string }>;
  shipping?: {
    weight_kg?: number | string;
    dimensions?: string;
    shipping_class?: string;
    countries?: string[];
    requires_export_license?: boolean;
    installation_required?: boolean;
  };
  subcategory?: string;
  inventory_quantity?: number;
  is_active?: boolean;
  requires_shipping?: boolean;
  is_digital?: boolean;
  pin_layout?: string | null;
}

export interface PartnerPaymentInfo {
  user_id: string;
  account_holder_name: string;
  bank_name: string;
  account_number: string;
  swift_code: string;
  iban?: string;
  routing_number?: string;
  bank_country: string;
  // New fields
  payout_method: 'bank_transfer' | 'stripe' | 'paypal' | 'wise' | 'crypto';
  paypal_email?: string;
  wise_email?: string;
  crypto_wallet_address?: string;
  crypto_network?: string;
  // Stripe
  stripe_account_id?: string;
  stripe_account_verified?: boolean;
  // Address
  bank_address?: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  verification_status: 'pending' | 'under_review' | 'verified' | 'rejected';
  kyc_verified: boolean;
  is_active: boolean;
}

export interface QoSTerms {
  id: string;
  version: string;
  terms_text: string;
  qos_standards: {
    max_shipping_delay_days: number;
    defect_rate_threshold_percent: number;
    response_time_hours: number;
    accurate_product_description_required: boolean;
    quality_as_advertised_required: boolean;
    refund_acceptance_for_qos_violations?: boolean;
    [key: string]: any;
  };
  is_active: boolean;
  effective_date: string;
}

export interface PartnerQoSAcceptance {
  id: string;
  partner_id: string;
  qos_version: string;
  accepted: boolean;
  accepted_at: string;
  ip_address?: string;
  user_agent?: string;
}