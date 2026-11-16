# Security Audit Report - Skhy AI Website
**Date**: 2026-02-07
**Severity Level**: CRITICAL

## Executive Summary
A thorough security audit of the `skhy-ai-website` codebase and Supabase configuration has revealed **CRITICAL** security vulnerabilities that allow any authenticated user to access sensitive system configuration, including payment gateway secret keys (Stripe, PayPal) and third-party API keys (Apollo). Additionally, the administrative dashboard is protected only by client-side checks, which can be easily bypassed.

## 🚨 Critical Vulnerabilities

### 1. API Keys & Secrets Exposure via `system_config`
*   **Issue**: The `system_config` table stores sensitive credentials (`stripe_config` with Secret Key, `paypal_config` with Secret Key, `apollo_api_key`).
*   **Vulnerability**: The Row Level Security (RLS) policy for `system_config` is set to `"Allow authenticated full access system_config"`, which the Supabase advisor confirms is "Always True" for authenticated users.
*   **Impact**: **Any user who logs in** (including customers or partners) can query the `system_config` table directly via the browser console and steal your Stripe Secret Key, PayPal keys, and Apollo keys. This could lead to financial loss and data theft.
*   **Location**: Database Table `system_config`.

### 2. Client-Side Only Admin Protection
*   **Issue**: The Admin Dashboard (`/admin`) is protected by a client-side check in `src/pages/admin/AdminLayout.tsx`:
    ```typescript
    if (email !== 'nikki@skhy.systems') { ... }
    ```
*   **Vulnerability**: This check happens *after* the user has authenticated. A malicious user can manually request data using the `supabase` client in the browser console, completely bypassing this UI redirect.
*   **Impact**: Effectively, there is no server-side security enforcing admin privileges.

### 3. Database Password in Frontend Environment Variables
*   **Issue**: The file `.env` contains:
    ```
    VITE_SUPABASE_DB_PASSWORD=...
    ```
*   **Vulnerability**: Variables prefixed with `VITE_` are intended for the frontend. If this variable is referenced (or if the build process blindly exposes all VITE_ vars), the raw PostgreSQL database password could be embedded in the public JavaScript bundle.
*   **Recommendation**: **DELETE** this line immediately. The frontend should never know the DB password.

## ⚠️ High Severity Issues

### 4. Row Level Security (RLS) Disabled on Sensitive Tables
*   **Issue**: RLS is reported as **DISABLED** or overly permissive for the following tables:
    *   `marketplace_products`
    *   `marketplace_orders`
    *   `marketplace_partners`
    *   `newsletter_subscribers`
    *   `users` (RLS enabled but needs verification of policy)
*   **Impact**: Without RLS, data isolation is not enforced. Users might be able to see other users' orders, products, or personal details.

### 5. Mutable Search Path in Database Functions
*   **Issue**: Functions like `validate_partner_payment_info` do not have a fixed `search_path`.
*   **Impact**: Potential for SQL injection-like attacks where a malicious user could define objects in a schema they control and trick the function into executing them.

---

## 🛡️ Remediation Plan (Immediate Actions Required)

### Step 1: Secure `system_config` Table
You must restrict access to the `system_config` table. Only a specific Admin user (by UUID) should be able to read/write this table.

**Run this SQL in Supabase SQL Editor:**
```sql
-- 1. Revoke generic access
DROP POLICY IF EXISTS "Allow authenticated full access system_config" ON system_config;

-- 2. Create a restricted policy (Replace ADMIN_UUID with Nikki's actual User UUID)
-- You can find the UUID in the Authentication > Users tab.
CREATE POLICY "Admin only access system_config"
ON system_config
FOR ALL
USING (auth.uid() = 'REPLACE_WITH_ACTUAL_ADMIN_UUID');
```

**BETTER ARCHITECTURE**:
Do **NOT** store `stripe_secret_key` in a database table accessible to the client at all.
*   **Move Secrets**: Store Stripe/PayPal keys in **Supabase Vault** or **Edge Function Secrets**.
*   **Backend Logic**: Create a Supabase Edge Function (e.g., `checkout`) that handles the payment logic. The frontend should *never* see the Secret Key.
*   The current implementation of `AdminSettings.tsx` fetching keys to the client for "editing" is fundamentally insecure if those keys are then used by the client or if the table is readable.

### Step 2: Implement True Admin Roles
Instead of hardcoding an email in React, use the database.

**Review `users` table**:
Add an `is_admin` column or use a dedicated `user_roles` table.

```sql
-- Example: Add admin flag to users table
ALTER TABLE users ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Update RLS policies to check this flag
CREATE POLICY "Admins can do everything"
ON any_table
FOR ALL
USING (
  exists (
    select 1 from users
    where users.user_id = auth.uid()
    and users.is_admin = true
  )
);
```

### Step 3: Remove Sensitive Env Vars
1. Edit `.env`.
2. Delete `VITE_SUPABASE_DB_PASSWORD`.
3. If you need it for scripts, use `SUPABASE_DB_PASSWORD` (no `VITE_` prefix) and ensure your build tool doesn't pick it up.

### Step 4: Enable RLS on All Tables
Run the following SQL for every table:
```sql
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
```
Then define specific policies (e.g., "Users can only see their own orders").
