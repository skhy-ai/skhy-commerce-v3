# Marketplace Product Flags & Visibility

This document outlines the various boolean flags associated with the `products` table in the SKHY AI database schema. These flags orchestrate the complete lifecycle of a product—from vendor submission and admin approval, to public discovery, and eventual retirement.

Understanding these flags is critical for debugging visibility issues (e.g., why a product isn't showing up in the UI or via the API) and for correctly managing Row Level Security (RLS).

---

## 1. `is_active` (The Master Switch)
**Type:** `boolean` | **Default:** `false` (usually)

This is the most fundamental switch for a product. It determines whether the product is functionally "online" within the system.

*   **Significance:** If `is_active = false`, the product is completely disabled system-wide.
    *   It cannot be purchased or added to a user's cart.
    *   It cannot be used as a component within the Mission Architect simulators.
    *   It essentially acts as a soft-delete or an archival state.
*   **Use Cases:** 
    *   A vendor temporarily pausing sales due to supply chain shortages.
    *   Retiring an older version of a hardware component without losing historical order data linked to its `product_id`.

---

## 2. `show_on_marketplace` (The Visibility Switch)
**Type:** `boolean` | **Default:** `false`

This flag governs public discovery. It strictly controls whether the product appears in the public browsing catalog (the storefront UI) and whether it is exposed to anonymous users via the REST API.

*   **Significance:** A product can be `is_active = true` (transactable) but `show_on_marketplace = false` (hidden from search).
    *   **Admin Moderation:** When a vendor submits a new product, it defaults to `show_on_marketplace = false`. It remains hidden from the public until a SKHY Admin reviews the specifications and explicitly approves it (setting the flag to `true`).
    *   **Row Level Security (RLS):** The Supabase `anon` API key (used by build scripts like `cache_marketplace.js`) is restricted by RLS policies that typically enforce `show_on_marketplace = true`. Therefore, unapproved or hidden products will *never* be returned by public API queries, even if they are active.
    *   **Internal Components:** Some products are purely "internal" sub-assemblies needed for the drone simulator calculations. These are set to `is_active = true` (so they can be added to a system BOM) but `show_on_marketplace = false` (so they don't clutter the consumer-facing catalog).

---

## 3. `ready_to_sale` (The Inventory / Fulfillment Switch)
**Type:** `boolean` | **Default:** `false`

This flag indicates whether the product is fully configured for physical (or digital) fulfillment and is ready to be transacted immediately.

*   **Significance:** Even if a product is active and visible, it might not be ready for immediate sale. 
    *   It is often tied to the completion of vendor onboarding (e.g., shipping rates must be configured, payment gateways linked).
    *   It may be used to list products as "Coming Soon" or "Out of Stock". A product can show up in search (`show_on_marketplace = true`) but not have an active "Add to Cart" button if `ready_to_sale = false`.

---

## 4. `hide_pricing` (The Enterprise Gateway)
**Type:** `boolean` | **Default:** `false`

This flag controls whether the exact dollar amount is visible on the marketplace storefront.

*   **Significance:** SKHY AI deals with high-ticket defense hardware and enterprise software licensing. Many vendors prefer not to list public prices for strategic reasons.
*   **Use Cases:** 
    *   If `hide_pricing = true`, the UI dynamically replaces the price tag with a "Contact for Pricing" CTA, or requires the user to log in as an authenticated partner to negotiate rates.
    *   The product can still be requested for quotes or added to specialized enterprise carts, but it bypasses standard retail checkout flows.

---

## Comparing `is_active` vs `ready_to_sale`

A common question is how to differentiate between these two flags. The easiest way is to use a retail store analogy:

### The Retail Analogy
*   **`is_active` (The Light Switch):** Does this product legally and functionally exist in your catalog?
    *   *Analogy:* Have you decided to carry this product in your store at all?
    *   *Effect:* If `false`, the product is archived. It cannot be used in simulators, cannot be added to system BOMs, and is completely invisible.
*   **`ready_to_sale` (The Inventory Switch):** Is the product physically available for shipment today?
    *   *Analogy:* Is the product sitting on the shelf right now, or is it stuck on a cargo ship?
    *   *Effect:* If `false`, the product exists in the catalog (`is_active=true`) and people can plan drone builds with it, but the "Buy" button is disabled (Out of Stock/Pre-order).

### Summary Example: A New Battery Launch
1.  **Pre-release:** `is_active = true`, `show_on_marketplace = true`, `ready_to_sale = false`. (Users can plan builds, but can't buy).
2.  **Launch Day:** `is_active = true`, `show_on_marketplace = true`, `ready_to_sale = true`. (Users can buy).
3.  **Discontinued:** `is_active = false`. (Vanishes entirely).
