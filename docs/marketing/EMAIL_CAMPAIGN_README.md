# Gas Pipeline Monitoring & Email Campaign Features

## Overview
This document describes the newly implemented Gas Pipeline Monitoring application and Admin Email Campaign features.

## 1. Gas Pipeline Monitoring Application

### Location
`/src/sections/CoreApplications.tsx` - New section added after Skhy Vidur Platform

### Features
- **Tagline**: "Protect your strategic assets over vast area of network"
- **Partner**: Morrigan AI (already in partners list)
- **Video Placeholder**: Custom-generated Morrigan AI branded video placeholder
- **Key Capabilities**:
  - Acoustic Leak Detection with Advanced AI
  - GIS-Integrated Asset Management & Visualization
  - Real-time Pressure & Flow Monitoring
  - Predictive Maintenance & Compliance Reporting

### Assets
- Video placeholder: `/public/morrigan_video_placeholder.png`
- Morrigan AI logo: `https://i.postimg.cc/mDp0yy43/morrigan.png` (already in use)

### Integration
The application is displayed prominently on the homepage in the Core Applications section, featuring:
- Side-by-side layout with video placeholder on left, content on right
- Morrigan AI partnership badge
- "Express Interest" CTA button that scrolls to contact form

---

## 2. Admin Email Campaign Manager

### Purpose
Allows admins to send automated email campaigns to partners for:
- Acquiring Letters of Intent (LOIs)
- Promoting device pre-booking
- Product-specific marketing campaigns

### Location
Admin Dashboard → Marketplace → Email Campaigns
- Route: `/admin/marketplace/campaigns`
- Component: `/src/pages/admin/EmailCampaign.tsx`

### Features

#### Product Selection
- Multi-select interface for approved products
- Displays all products currently available in the marketplace
- Shows selected count

#### Email Composer
- **Subject Line**: Custom email subject
- **Email Body**: Rich text area with template variable support
  - Use `[PRODUCTS]` to auto-insert selected product names
- **Template Example**: Pre-filled example for LOI acquisition

#### Campaign Execution
1. Admin selects one or more products
2. Composes email with subject and body
3. System automatically:
   - Identifies partners who offer selected products
   - Fetches partner email addresses and company names
   - Sends personalized emails via Web3Forms API
   - Logs campaign results in database

#### Campaign Tracking
All campaigns are logged in the `email_campaigns` table with:
- Subject and body content
- Product IDs targeted
- Recipient count
- Success/failure counts
- Timestamp and admin who sent it

### Database Schema

#### email_campaigns Table
```sql
CREATE TABLE email_campaigns (
    id UUID PRIMARY KEY,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    subject TEXT NOT NULL,
    body TEXT NOT NULL,
    product_ids TEXT[] NOT NULL,
    recipients_count INTEGER,
    success_count INTEGER,
    fail_count INTEGER,
    sent_by UUID REFERENCES auth.users(id)
);
```

### Security
- **RLS Policies**: Only admin (nikki@skhy.systems) can view and create campaigns
- **Admin-Only Access**: Route is within AdminLayout which checks user authentication
- **Email Service**: Uses Web3Forms API (requires `VITE_WEB3FORMS_KEY` env variable)

### Usage Flow
1. Admin logs into `/admin/login`
2. Navigates to Marketplace → Email Campaigns
3. Selects products to campaign
4. Writes campaign email using template or custom message
5. Clicks "Send Campaign"
6. System sends emails to all partners offering those products
7. Results are displayed and logged

### Email Template Variables
- `[PRODUCTS]` - Replaced with comma-separated list of product names

### Example Campaign
```
Subject: Exclusive Pre-Booking Opportunity for Skhy Products

Body:
Dear Partner,

We're excited to announce an exclusive pre-booking opportunity 
for the following Skhy products: [PRODUCTS]

This is your chance to:
• Secure early access to cutting-edge technology
• Provide a Letter of Intent (LOI) for priority allocation
• Pre-book devices at special rates

Please respond with your interest level and LOI by [DATE].

Best regards,
Skhy AI Team
```

---

## Environment Variables

Ensure the following is set in `.env`:
```
VITE_WEB3FORMS_KEY=your_web3forms_api_key
```

---

## Migration

To apply the email campaigns database schema:
```bash
# If using Supabase CLI
supabase db push

# Or apply migration manually in Supabase Dashboard
# Run: supabase/migrations/037_email_campaigns.sql
```

---

## Future Enhancements

Potential improvements for the email campaign system:
1. Campaign scheduling (send at specific date/time)
2. Email templates library
3. A/B testing capabilities
4. Detailed analytics and open/click tracking
5. Campaign drafts
6. Email previews before sending
7. Recipient filtering (beyond just products)
8. Campaign history viewer with detailed stats
9. Email unsubscribe management
10. Rich HTML email templates with drag-and-drop editor
10. Rich HTML email templates with drag-and-drop editor

---

## Hardware Catalog Links

The following catalog links are available for use in email campaigns and outreach materials. These links correspond to the hardware categories displayed in the Enabling Hardware section:

### Acoustic Detection Systems
- **Catalog URL**: https://tinyurl.com/skhy-pc-acoustic
- **Description**: Advanced acoustic detection solutions for aerial and ground applications
- **Marketplace Filter**: [Acoustic Sensors](https://skhy.systems/marketplace?category=Sensors)

### Edge AI & RF Fusion
- **Catalog URL**: https://tinyurl.com/skhy-pc-edge-ai-adv
- **Description**: Intelligent edge computing for real-time signal processing
- **Marketplace Filter**: [Edge AI Devices](https://skhy.systems/marketplace?category=edge-ai)

### Anti-Jamming GNSS
- **Catalog URL**: https://tinyurl.com/skhy-pc-crpa
- **Description**: Resilient navigation systems for GPS-denied environments
- **Marketplace Filter**: [Anti-Jamming GPS](https://skhy.systems/marketplace?search=Anti-Jamming)

### MANET Radios
- **Catalog URL**: https://tinyurl.com/skhy-pc-manet
- **Description**: High-performance mobile ad-hoc networking solutions
- **Marketplace Filter**: [MANET Radios](https://skhy.systems/marketplace?search=manet)

### Usage in Email Templates
Include these links in your email campaigns to provide recipients with direct access to technical specifications and product details. The catalog links offer comprehensive PDF documentation, while the marketplace filters provide interactive browsing for available products.

---
---

## Files Modified/Created

### Created
- `/src/pages/admin/EmailCampaign.tsx` - Email campaign manager component
- `/supabase/migrations/037_email_campaigns.sql` - Database schema
- `/public/morrigan_video_placeholder.png` - Video placeholder image
- `EMAIL_CAMPAIGN_README.md` - This documentation

### Modified
- `/src/sections/CoreApplications.tsx` - Added Gas Pipeline Monitoring section
- `/src/pages/admin/AdminLayout.tsx` - Added Email Campaigns navigation link
- `/src/App.tsx` - Added EmailCampaign route and lazy import
- `/src/data/index.ts` - (Morrigan AI already present in partners array)

---

## Testing Checklist

- [ ] Gas Pipeline Monitoring section displays on homepage
- [ ] Morrigan AI video placeholder loads correctly
- [ ] "Express Interest" button scrolls to contact form
- [ ] Morrigan AI partnership badge is visible
- [ ] Admin can access Email Campaigns page
- [ ] Product selection works correctly
- [ ] Email composer accepts input
- [ ] `[PRODUCTS]` variable is replaced in email body
- [ ] Campaigns are logged to database
- [ ] Only admin can access the feature
- [ ] Email sending works via Web3Forms
- [ ] Success/failure counts are accurate

---

## Support

For questions or issues, contact the development team.
