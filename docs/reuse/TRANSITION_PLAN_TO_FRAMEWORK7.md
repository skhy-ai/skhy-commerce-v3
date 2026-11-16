# Transition Plan: Migrating to Framework7 Marketplace Engine

This document outlines the phased transition for refactoring the current marketplace into a **Framework7-powered, mobile-first industrial platform**. The priority is to maintain **100% logic reusability** while upgrading the UI layer.

---

## 🏗 Phase 1: Preparation & Decoupling (Total Logic Reuse)
**Goal:** Extract business logic (Supabase, Auth, State) from the current React UI components.

*   **Logic Reuse (100%):**
    *   `src/lib/supabase.ts`: Remains the source of truth for DB connection.
    *   `src/contexts/AuthContext.tsx`: Stays as the auth manager.
    *   `src/contexts/CartContext.tsx`: The cart logic (calculation, persistence) remains unchanged.
    *   `src/utils/geoCurrency.ts`: Keep the geo-blocking and currency conversion logic.
*   **Action:** Ensure all UI components only consume hooks (`useAuth`, `useCart`) and don't contain inline API logic.

## 🚀 Phase 2: Framework7 Infrastructure Setup
**Goal:** Initialize the F7 shell and configure the industrial theme engine.

*   **Setup:**
    *   Initialize `framework7-react` into the project.
    *   Configure the **App Root** with industry-standard themes (iOS/Material Design).
*   **Reusability Strategy:** Create a `ThemeConfig.ts` that maps CSS variables from our existing design (Slate Grey, Teal, etc.) into Framework7's system.
*   **Routing Migration:** Map current `react-router-dom` paths to **Framework7 Routes**.

## 🎨 Phase 3: UI Migration (The "Shell" Swap)
**Goal:** Replace the current "Web-first" layout with Framework7 mobile-optimized components.

*   **Layout Refactor (REUSE Component Logic):**
    *   **Navbar:** Port the logic from `src/components/Navbar.tsx` to `<Navbar />` with F7's built-in back buttons and panels.
    *   **Side Panels:** Use F7 `<Panel />` for the Cart Drawer and User Menu.
    *   **Page Wrapper:** Move content from `App.tsx` into F7 `<View>` and `<Page>` structures.
*   **GTM Ready Features:** Enable **Framework7 Pull-to-Refresh** for the product catalog to handle real-time inventory updates.

## 📦 Phase 4: Component Refactoring (Atom Migration)
**Goal:** Rebuild core UI atoms using Framework7 blocks for maximum touch-responsiveness.

| Component | Target F7 Component | Reasoning |
| :--- | :--- | :--- |
| `ProductCard` | `<Card />` | Better padding, shadow control, and touch-interaction. |
| `SearchBar` | `<Searchbar />` | Built-in clear buttons and fixed scroll-to-top logic. |
| `ProductGallery` | `<Swiper />` | Native-feeling touch gestures for high-res material inspection. |
| `PriceFilter` | `<Range />` | Standard dual-handle sliders for price and grade ranges. |

## 📦 Phase 5: GTM Packaging & PWA Setup
**Goal:** Deploy as a standard website while preparing for native distribution.

*   **PWA Setup:** Standardize the `manifest.json` and Service Workers to allow "Offline Material Catalog" browsing.
*   **Capacitor Integration (Optional):** Wrap the F7 app for native iOS/Android builds for site engineers.
*   **Theme Switcher (Industrial Ready):** Finalize the "White Label" logic so a simple flag swaps the UI between Steel, Cement, or Chemicals.

---

## 📈 Reusability Summary Table

| Layer | Reuse Level | Action |
| :--- | :---: | :--- |
| **Database/Supabase** | 100% | No change; continue using existing tables. |
| **Auth & Security (RLS)** | 100% | No change; keep existing role-based access. |
| **Business Persistence** | 100% | Keep `localStorage` and `sessionStorage` handlers. |
| **Custom Hooks/Logic** | 90% | Move logic from current sections to F7-compatible pages. |
| **UI Presentation** | 20% | Replace ad-hoc CSS with Framework7 utility classes. |

---

## ⚡ Next Steps for Standardization
1. **Define the "Skhy Industrial UI Kit":** A subset of F7 components pre-styled for B2B.
2. **Unified Data Interface:** Every F7 page must use a standard `useIndustrialData(category)` hook to ensure consistent fetching across different marketplaces.
