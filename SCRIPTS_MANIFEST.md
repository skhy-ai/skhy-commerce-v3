# SKHY Scripts & Brain Manifest

This document tracks and explains the purpose of all utility scripts in the repository. The scripts are organized into two primary directories:

- **`/scripts`**: Operational, infrastructure, and maintenance utilities.
- **`/brain/logic`**: Analytical, AI-driven logic, data enrichment, and optimization utilities.

---

## 🧠 /brain/logic (Intelligence & Optimization)

These scripts represent the "logic center" of the platform, handling complex calculations, data scraping, and AI-driven enrichment.

### Optimization & Simulation
- **`drone_configuration_optimizer.py`**: Multi-variable optimization engine for drone builds (mass budget, power, and efficiency).
- **`system_architecture_and_hardware_configuration_and_calibaration.py`**: Advanced calibration logic for hardware integration.

### Data Ingestion & Enrichment
- **`ingest_catalog.ts`**: Synchronizes the local `productCatalog.ts` with the Supabase database.
- **`ingest_acasom.ts`**: Processes vendor CSV data (specifically for Acasom) and synchronizes it with the marketplace database.
- **`discover_products.py`**: AI-assisted product discovery and classification utility.
- **`enrich_specifications.js`**: Automatically pulls and formats detailed hardware specs from manufacturer documentation.
- **`fetch_drone_images.py` / `update_drone_images.py`**: Automated image retrieval and filtering for new product entries.

### Scraping & Intelligence
- **`scrape_acasom.cjs`**: Specialized scraper for vendor hardware data.
- **`extract_functions.js`**: Logic extraction utility for parsing manufacturer feature sets.
- **`validate_emails.js`**: Email validation and campaign readiness checker.

---

## 🛠️ /scripts (Operations & Infrastructure)

These scripts manage the day-to-day operations, deployments, and marketplace synchronization.

### Marketplace & Caching
- **`cache_marketplace.js`**: Primary script to fetch products from Supabase and generate local JSON chunks for the frontend. Updates `cachedMarketplace.ts`.
- **`cache_marketplace_from_csv.js`**: Generates marketplace chunks from a local CSV source instead of the live database.
- **`download_assets.cjs`**: Downloads external product images to local storage for caching and CSP compliance.
- **`extract_urls.cjs`**: Utility to find and list all external asset URLs from marketplace data.

### PDF Presentation & Export
- **`capture-pitch-deck-pdf.mjs`**: Puppeteer-driven automated deck capturer. It navigates to the pitch deck, captures each slide in high-resolution (1920x1080), extracts links, and compiles a vector-perfect PDF with clickable hyperlink annotations using `pdf-lib`.


### Database & Deployment
- **`deploy-db.js` / `deploy-db-api.js`**: Scripts for deploying database schemas and API edge functions to Supabase.
- **`validate-supabase.js`**: Connection and health check for the Supabase integration.
- **`validate-schema.js`**: Ensures the local codebase types align with the Supabase table definitions.
- **`validate-storage.js`**: Validates Supabase bucket configurations and permissions.

### Ingestion & Migration
- **`migrate-products.js` / `migrate-products-pg.js`**: High-level migration scripts for moving product data between environments.
- **`ingest_to_supabase.js`**: Core utility for pushing local data to the production database.
- **`generate_sql.ts` / `gen_sync_sql.ts`**: Generates PostgreSQL compatible SQL for bulk updates.
