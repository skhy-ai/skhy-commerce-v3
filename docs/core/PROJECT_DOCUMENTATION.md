# Skhy AI Project Documentation

This document serves as a central hub for all documentation and functionality related to the Skhy AI website and platform.

## 📚 Documentation Table of Contents

### Core System & Setup
- **[README.md](../../README.md)**: General project overview and start guide.
- **[SUPABASE_SETUP_INSTRUCTIONS.md](../devops/SUPABASE_SETUP_INSTRUCTIONS.md)**: Instructions for setting up the Supabase backend.
- **[STORAGE_SETUP.md](../marketplace/STORAGE_SETUP.md)**: Configuration guide for Supabase Storage buckets.
- **[DEPLOYMENT_INSTRUCTIONS.md](../devops/DEPLOYMENT_INSTRUCTIONS.md)**: Steps to deploy the application.
- **[Supabase Backups](../devops/HOW_TO_BACKUP.md)**: Instructions on how to backup the database schema.

### Features & Guides
- **[Email Campaign Guide](../marketing/EMAIL_CAMPAIGN_README.md)**: Comprehensive guide on the Email Campaign feature, including setup, templates, and sending logic.
- **[Email Templates](../marketing/EMAIL_TEMPLATES.md)**: Reference for available email templates.
- **[Technology Guide](./technology_guide.md)**: Deep dive into the tech stack and architecture.
- **[Blog Posts](../../src/data/blog_posts.md)**: Documentation on managing blog content.

---

## 🛠 Functionalities Overview

### 1. **Public Website**
- **Landing Page**: Main showcase of Skhy AI's defense solutions.
- **Pitch Deck (`/pitch-deck`)**: Interactive presentation for investors.
- **Teaser Deck (`/teaser-deck`)**: A shorter, high-impact version of the pitch deck for initial engagement.
- **Blog (`/blog`)**: Public-facing blog with Markdown support.
- **Marketplace (`/marketplace`)**: Product catalog for approved customers/partners.
- **Whitepapers (`/whitepapers`)**: Gated technical document viewer for lead capture.

### 2. **Admin Panel (`/admin`)**
*Restricted access for administrators.*

- **Dashboard**: Overview of key metrics (users, sales, etc.).
- **User Management**: Approve/reject pending partner signups.
- **Partner & Seller Management**: Track partner compliance, review seller profiles, and handle product catalog approvals.
- **Email Campaigns (`/admin/email-campaign`)**:
    - Send various campaign types (Product, Onboarding, Newsletter, etc.).
    - **New**: **ADB Proposal Mode** for generating and sending specific government proposals.
    - Analytics tracking (clicks, opens).
- **Blog Editor (`/admin/blog`)**: Create and edit blog posts using a Markdown editor.
- **Settings (`/admin/settings`)**:
    - **Maintenance Mode**: Toggle a site-wide banner.
    - **Apollo API**: Configure Apollo.io integration for enrichment.
    - **Site Analytics**: Real-time visitor tracking and geographic resolution.
    - **Change Password**: Update admin credentials.

### 3. **Authentication, Security & Compliance**
- **Supabase Auth**: Handles user signup, login, and session management.
- **Row Level Security (RLS)**: Database policies ensure users only access authorized data.
- **Role-Based Access**: Distinction between 'admin', 'partner', 'customer', and 'pending' users.
- **Digital NDA Workflow**: Canvas-based digital signature capture, PDF generation, and secure storage for partner compliance (e.g., Acasom).

### 4. **Backend Services**
- **Netlify Functions**:
    - `send-email`: Handles SMTP email dispatch via specialized providers.
- **Supabase Database**: Stores users, products, campaigns, analytics, and content.
- **Supabase Storage**: Hosts product images, assets, and generated PDF agreements.

---

## 🔗 Quick Links

| Feature | Path | Description |
| :--- | :--- | :--- |
| **Admin Login** | `/login` | Access the admin dashboard. |
| **Pitch Deck** | `/pitch-deck` | Investor presentation. |
| **Web Teaser** | `/teaser-deck` | **New!** High-impact teaser presentation. |
| **Blog** | `/blog` | Read latest updates. |
| **Marketplace** | `/marketplace` | Browse defense products. |

---

## 🚀 Recent Updates

- **Digital NDA & Compliance**: Automated PDF generation and signing workflow for partners.
- **Whitepaper Lead Gates**: Gated access to technical documentation for lead capture.
- **Site Visitor Analytics**: Geographic IP resolution and real-time visitor tracking dashboards.
- **Seller Profiles**: Tools for manufacturers to claim and manage their product catalogs.
- **ADB Proposal Campaign**: Dedicated email template for Army Design Bureau proposals.
- **Maintenance Mode**: Admin-controlled banner for system alerts.
- **Markdown Blog**: Enhanced blog rendering with `react-markdown`.
- **Teaser Deck**: A simplified, punchy version of the pitch deck.

For further assistance, refer to the [Technology Guide](./technology_guide.md) or contact the development team.
