# Stripe Payment Integration – Activation Guide

## PART 1 — Admin: Get Stripe Credentials

### Step 1: Create a Stripe Account

1. Go to **[https://stripe.com](https://stripe.com)** → click **"Start now"**
2. Enter email, name, country, password → verify email  
3. Complete business profile (can use "Software" as industry)

### Step 2: Get Test API Keys

1. In Stripe Dashboard: **Developers** (top-right) → **API keys**
2. Ensure **"Test mode"** toggle is ON (top-right)
3. Copy both keys:
   - **Publishable key**: `pk_test_XXXX...` ← goes in `.env` and Admin settings
   - **Secret key**: `sk_test_XXXX...` ← goes ONLY in Supabase Edge Function secrets

> [!IMPORTANT]
> The **secret key** must NEVER be exposed to the browser. It goes only into Supabase Edge Function environment secrets.

---

## PART 2 — Configuration Steps (Required)

### Step 1: Add Publishable Key to `.env`

Open `/home/hriday/skhyai-website/skhy-ai-website/.env` and add:

```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXXXXXXXXXXXXXX
```

Restart dev server after adding this.

### Step 2: Set Secret Key as Supabase Edge Function Secret

Option A — via CLI (recommended):
```bash
cd /home/hriday/skhyai-website/skhy-ai-website
npx supabase secrets set STRIPE_SECRET_KEY=sk_test_XXXX --project-ref <PROJECT_ID>
```

Option B — via Dashboard:
- Go to: [https://supabase.com/dashboard/project/<PROJECT_ID>/settings/functions](https://supabase.com/dashboard/project/<PROJECT_ID>/settings/functions)
- Click **"Edit secrets"** → Add: `STRIPE_SECRET_KEY` = `sk_test_...`

### Step 3: Deploy the Edge Function

```bash
cd /home/hriday/skhyai-website/skhy-ai-website
npx supabase functions deploy create-payment-intent --project-ref <PROJECT_ID>
npx supabase functions deploy get-bank-transfer-details --project-ref <PROJECT_ID>
```

> [!NOTE]
> You may need to run `npx supabase login` first if not already logged in. Use your Supabase account credentials.

### Step 4: Run Database Migration

Open the Supabase SQL Editor: [https://supabase.com/dashboard/project/<PROJECT_ID>/editor](https://supabase.com/dashboard/project/<PROJECT_ID>/editor)

Run this SQL to add missing columns to the `orders` table:

```sql
-- Add payment tracking fields to orders table
ALTER TABLE public.orders 
  ADD COLUMN IF NOT EXISTS payment_method text,
  ADD COLUMN IF NOT EXISTS payment_intent_id text;

CREATE INDEX IF NOT EXISTS idx_orders_payment_intent ON public.orders (payment_intent_id);
```

### Step 5: Enter Keys in Admin Portal (Record Keeping)

Login to admin portal → `/admin/settings` → **"Stripe Configuration"** section:
- Paste **Publishable Key** → "Publishable Key (Public)"
- Paste **Secret Key** → "Secret Key (Private)"
- Click **Save Configuration**

> [!NOTE]
> The edge function reads from Supabase env secrets (Step 2), not from `system_config`. This admin panel save is for audit/record purposes.

---

## PART 3 — Create $1 Test Product

In the Supabase SQL Editor, first get an admin/seller user ID:

```sql
-- Find an admin or Skhy-branded seller
SELECT user_id, email, company_name, approved 
FROM users 
WHERE (email ILIKE '%skhy%' OR company_name ILIKE '%skhy%' OR user_type = 'admin')
  AND approved = true
LIMIT 5;
```

Then insert the test product (replace `<USER_ID>` with result from above):

```sql
INSERT INTO products (
  user_id,
  name,
  description,
  base_price,
  currency,
  category,
  type,
  pricing_model,
  show_on_marketplace,
  is_active,
  ready_to_sale,
  stock_quantity,
  requires_shipping
) VALUES (
  '<USER_ID>',
  'Stripe Test Product – $1',
  'A $1 test product used to validate the Stripe payment integration. Safe to ignore.',
  1.00,
  'USD',
  'Test',
  'hardware',
  'one_time',
  true,   -- show_on_marketplace
  true,   -- is_active
  true,   -- ready_to_sale
  999,    -- stock_quantity
  false   -- no shipping required for test
)
RETURNING id, name, base_price, show_on_marketplace, ready_to_sale;
```

> [!IMPORTANT]
> All three flags `show_on_marketplace`, `is_active`, AND `ready_to_sale` must be `true`, AND the seller's `approved = true` — otherwise the product won't appear in the marketplace (RLS policy requirement).

---

## PART 4 — Execute End-to-End Test Transaction

### Prerequisites
- Dev server running: `npm run dev`
- Stripe keys configured (Parts 1 & 2 complete)
- Edge function deployed and secret set
- DB migration run
- Test product inserted

### Test Steps

1. Open `http://localhost:5173/marketplace`
2. Find **"Stripe Test Product – $1"** → click **Add to Cart**
3. Navigate to **Cart** → click **Checkout** 
4. **Step 1 – Address**: Fill any valid address (e.g., "123 Main St, New York, NY 10001, US")
5. **Step 2 – Shipping**: Select Standard (free)
6. **Step 3 – Payment**: Choose **Credit Card**
   - The Stripe Elements form loads (proves edge function is working)
   - Enter Stripe test card:

| Field | Value |
|-------|-------|
| Card Number | `4242 4242 4242 4242` |
| Expiry | `12/28` |
| CVC | `123` |
| Postal Code | `10001` |

7. Click **"Pay $1.00"**
8. You should be redirected to `/checkout/success`

### Verify Transaction

| Where | What to check |
|-------|---------------|
| **Stripe Dashboard → Developers → Payments** | $1 charge with status "Succeeded" |
| **Supabase → orders table** | New row with `status = 'paid'`, `payment_intent_id` filled |
| **Supabase → payments table** | `status = 'successful'`, `transaction_id` = PaymentIntent ID |
| **Supabase → order_items table** | Product row linked to order |

### Other Test Cards (for testing failure flows)

| Card | Behavior |
|------|----------|
| `4000 0000 0000 0002` | Card declined |
| `4000 0025 0000 3155` | Requires 3D Secure authentication |
| `4000 0000 0000 9995` | Insufficient funds |

---

## Current Status Summary

| Item | Status | Action |
|------|--------|--------|
| `order_number` generation | ✅ Fixed | Already committed |
| `payment_intent_id` field fix | ✅ Fixed | Already committed |
| Stripe account | ❌ Not created | Create at stripe.com |
| `VITE_STRIPE_PUBLISHABLE_KEY` in `.env` | ❌ Missing | Add after getting keys |
| `STRIPE_SECRET_KEY` Supabase secret | ❌ Missing | `supabase secrets set` |
| `create-payment-intent` Edge Function deployed | ❓ Unknown | `supabase functions deploy` |
| DB migration (payment_method/payment_intent_id) | ❌ Not run | SQL in Step 4 |
| $1 Test Product in DB | ❌ Not created | SQL in Part 3 |
| Stripe keys in Admin portal | ❌ Not set | After getting keys |

## Architecture Reference

```
Browser (CheckoutPage.tsx)
  │
  ├─ VITE_STRIPE_PUBLISHABLE_KEY → loadStripe() → Stripe Elements UI
  │
  └─ User clicks Pay → supabase.functions.invoke('create-payment-intent')
                          │
                          └─ Edge Function (Deno/Supabase)
                               ├─ Reads STRIPE_SECRET_KEY from env secrets
                               └─ stripe.paymentIntents.create(amount, currency)
                                    → returns clientSecret → Browser
                                         │
                                         └─ stripe.confirmPayment() → Stripe processes
                                              │
                                              └─ onSuccess(paymentIntentId)
                                                   └─ Create order + payment record in Supabase DB
```
