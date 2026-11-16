export interface Address {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    country_code?: string; // ISO 3166-1 alpha-2
    phone?: string;
    name?: string; // Contact name for this address
}

export interface CartItem {
    id: string; // cart_item id
    product_id: string | number;
    quantity: number;
    unit_price?: number; // Snapshot price
    platform_pill?: string;
    phase?: string;

    // Expanded for UI — data sourced from cachedMarketplace (richer than live DB)
    product?: {
        id: string | number;
        name: string;
        description: string;
        image_url?: string;
        fallback_url?: string;
        seller_name: string;
        stock_quantity: number;
        user_id: string; // Seller ID
        base_price: number;
        currency?: string;
        category?: string;
        subcategory?: string;
        power_draw_w?: number;
        segment?: 'air' | 'gcs' | 'rover' | 'jamming' | 'edge-ai';
        // Rich fields from build-time cache
        sku?: string;
        weight_kg?: number;
        dimensions?: { length?: number; width?: number; height?: number };
        features?: string[];
    };
}

export interface TaxMetadata {
    rate: number;
    amount: number;
    customs_fee?: number;
    customs_category?: string;
    is_exempt?: boolean;
}

export interface OrderSummary {
    subtotal: number;
    shipping: number;
    tax: number;
    tax_metadata?: TaxMetadata;
    total: number;
    currency: string;
}

export interface Invoice {
    id: string;
    invoice_number: string;
    order_id: string;
    issue_date: string;
    due_date?: string;
    status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled' | 'refunded';
    total_amount: number;
    currency: string;
    pdf_url?: string;

    bill_to_name: string;
    bill_to_address: Address;
}

export interface PayoutSettings {
    bank_name?: string;
    bank_last4?: string;
    currency?: string;
    country?: string;
    account_holder_name?: string;
    account_holder_type?: 'individual' | 'company';
}

export interface SellerPolicies {
    return_policy?: string;
    shipping_policy?: string;
    support_email?: string;
    support_phone?: string;
}
