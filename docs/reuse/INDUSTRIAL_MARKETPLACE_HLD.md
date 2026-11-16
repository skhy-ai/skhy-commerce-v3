# High-Level Design (HLD): B2B Industrial Materials Marketplace

This document provides the architectural overview and detailed feature list for an industrial marketplace platform (Steel, Cement, Chemicals, etc.).

---

## 🏗 System Architecture Overview

### 1. **Technology Stack (MOBILE-FIRST REUSE)**
*   **UI Layer:** **Framework7 (F7-React)** – Provides a native iOS/Android shell, touch-optimized components, and PWA readiness. (**UPGRADE**)
*   **Routing:** **Framework7 Router** – Integrated page transitions, side panels, and view-based state. (**UPGRADE**)
*   **Backend & DB:** Supabase (PostgreSQL) – Auth, Data, and Real-time updates. (**REUSE: 100% Logic**)
*   **Hosting & CI/CD:** Netlify + Capacitor (for native packing).

### 2. **User Roles & Auth (REUSE: 90% Logic)**
*   **Admin:** Desktop-optimized F7 web interface for moderation and analytics. (**REUSE Logic**)
*   **Partner (Seller):** Multi-device F7 portal for inventory and order management. (**REUSE Logic**)
*   **Buyer (Customer):** Mobile-first F7 optimized for on-site construction ordering. (**REUSE Logic**)
*   **Manager:** Corporate role for hierarchical approvals in large firms.

---

## 📊 Component & Module Breakdown

### 1. **Core Marketplace Engine (REUSE: 85% Logic)**
*   **F7 View Shell:** The main container driving all marketplace views. (**UPGRADE**)
*   **Faceted Search & Filtering:** F7 `<Searchbar />` & `<SmartSelect />` integration. (**REUSE Logic**)
*   **Infinite Scrolling Catalog:** Handled natively by F7 `<List />` and `<PageContent />`. (**UPGRADE**)
*   **Analytics Dashboard:** F7 Dashboard layout using charts (e.g., ApexCharts/Chart.js integration). (**REUSE**)

### 2. **B2B Checkout & Order System (REUSE: 60% Logic)**
*   **Cart Panel:** F7 `<Panel side="right" />` for persistent cart access. (**UPGRADE**)
*   **Step-by-Step Checkout:** F7 `<Stepper />` or sequential pages for Purchase Orders. (**UPGRADE**)
*   **Tax Calculator (REUSE LOGIC):** Business logic for GST/VAT integrated as an F7 middleware.

### 3. **Industrial Logistics & Supply Chain (NEW: 100%)**
*   **Freight Estimator:** Weight-based shipping logic integrated into the checkout flow.
*   **Regional Stock Checking:** Inventory visibility based on the buyer's warehouse location or site.
*   **Delivery Scheduling:** Calendar-based dispatch and delivery slot selection.

### 4. **B2B Negotiation & RFQ (NEW: 100%)**
*   **RFQ Engine:** "Request for Quote" button for bulk orders.
*   **Bidding Dashboard:** Allows a seller to offer a one-time discounted price to a buyer for a specific inquiry.

---

## 🎨 Frontend Design & UI Components

| Component | Architecture | Reuse Level |
| :--- | :--- | :---: |
| **App Root** | F7 `<App />` with Theme Selector (iOS/MD). | **NEW Shell** |
| **Product List** | F7 `<List />` with virtual list optimization. | **UPGRADE** |
| **Product Card** | Custom F7 `<Card />` for Industrial assets. | **REUSE UI Logic** |
| **Buyer Auth** | F7 `<LoginScreen />` with Supabase backend. | **REUSE Logic** |
| **Notifications** | F7 `<Toast />` & `<Notification />` for order alerts. | **UPGRADE** |
| **Technical Decks** | Integrated Viewer within F7 `<Page />`. | **REUSE** |

---

## 📦 Detailed Feature List

### A. **Public Experience**
- [x] **Hero Banner (REUSE):** High-impact industrial imagery/video background.
- [x] **Product Discovery (REUSE):** Categorized material types (Structural Steel, Bulk Cement, Industrial Acids).
- [ ] **Technical Doc Library (REUSE/NEW):** Searchable index of Material Safety Data Sheets (MSDS) and Quality Certs.

### B. **Buyer Functionality**
- [x] **Easy Onboarding (REUSE):** Instant signup for individual contractors.
- [ ] **Corporate Onboarding (NEW):** Business documentation upload (Trade License, Tax ID).
- [ ] **Finance/Credit Dashboard (NEW):** Real-time view of remaining credit limit and outstanding invoices.
- [x] **Order History (REUSE):** Tracking status of current and past shipments.

### C. **Partner/Seller Functionality**
- [x] **Store Management (REUSE):** Profile page with manufacturer branding.
- [ ] **Tiered Pricing (NEW):** Logic to set price-per-ton that automatically drops based on quantity intervals.
- [ ] **Batch Management (NEW):** Linking specific batches to MTC (Mill Test Certificates).
- [x] **Order Fulfillment (REUSE):** Update status from "Processing" to "Shipped".

### D. **Platform Admin**
- [x] **Partner Vetting (REUSE):** Approve or reject manufacturers based on certifications.
- [x] **Global Marketplace Analytics (REUSE):** Sales charts, top products, and geographical distribution.
- [x] **Email Campaign Manager (REUSE):** Send technical updates and promotional newsletters to the buyer database.

---

## ⚙️ Backend Logic & Infrastructure

*   **Database Schema:**
    *   `products` table (**REUSE**): Add columns for weight, purity, and MOQ (Minimum Order Quantity).
    *   `orders` table (**REUSE**): Add columns for Freight Cost and Credit Status.
    *   `quotes` table (**NEW**): For handling RFQ/Bidding logic.
*   **Row Level Security (RLS) (REUSE):** Predetermined security policies for keeping partner data private.
*   **Supabase Storage (REUSE):** Centralized library for industrial PDFs and high-res material catalogs.
