
# Email Campaign Template & Tracking Guide

## Overview
This document serves as a template for Skhy AI's automated email campaigns. It includes the email body structure and instructions for generating tracking links to monitor engagement.

## Tracking Link Logic

To track when a customer or partner opens a link (e.g., to the Pitch Deck or Product Page), append the recipient's unique email or ID to the URL parameters.

**Base URL:** `https://skhy.ai`

**Tracking Parameters:**
- `ref`: The campaign source (e.g., `email_campaign_feb26`)
- `uid`: The unique identifier of the user (or email hash)
- `target`: The specific page they are visiting (e.g., `pitch-deck`, `marketplace`, `partner-onboarding`)

**Example Constructed Link:**
```
https://skhy.ai/pitch-deck?ref=email_campaign_q1&uid={USER_ID_OR_EMAIL}&utm_source=email
```

**Pixel Tracking (For Open Rates):**
Embed a 1x1 transparent image at the bottom of the email body.
```html
<img src="https://api.skhy.ai/track/open?campaign_id={CAMPAIGN_ID}&recipient={EMAIL}" width="1" height="1" style="display:none;" />
```

---

## Campaign Body Templates

### 1. Potential Customer (Defense & Energy)

**Subject:** Advancing Strategic Capabilities with Skhy AI: Acoustic & Edge Solutions

**Body:**

Dear [Name],

I hope this email finds you well.

I am writing to you from **Skhy AI**, observing specifically [Company Name]'s ongoing commitment to advancing strategic capabilities in the [Region] region.

Given your focus on [Specific Interest from CSV Notes, e.g., Critical Infrastructure Protection], I wanted to introduce our latest portfolio of **Autonomous Threat Awareness Systems**.

**Key Solutions for [Company Name]:**
*   **SKHY-A16 Acoustic Arrays:** Passive, non-emitting detection of drones and aircraft up to 250km.
*   **Edge AI Fusion Nodes:** Jamming-resilient compute for real-time signal intelligence without cloud dependency.
*   **MANET Radios:** Unbreakable mesh networking for air-to-ground communication in contested environments.

We believe these technologies align perfectly with your operational requirements. You can view our full interactive pitch deck and product specifications here:

👉 **[View Skhy AI Technology Overview](https://skhy.ai/pitch-deck?ref=cold_outreach&uid=[Email_Placeholder])**

I would welcome the opportunity to discuss a potential pilot or demonstration.

Best regards,

**Dr. Skhy**
Founder, Skhy AI
[contact@skhy.ai](mailto:contact@skhy.ai)

---

### 2. Potential Partner (Sellers & Integrators)

**Subject:** Partnership Opportunity: Distributing Skhy AI Defense Solutions in [Country]

**Body:**

Dear [Name],

We have been following [Company Name]'s leadership in the [Defense/Electronics] market in [Country].

**Skhy AI** is expanding its partner network, and we see a strong synergy with your existing portfolio of [Product Category from CSV Notes]. We are looking for specialized partners to distribute and integrate our **Acoustic Defense** and **Anti-Jamming GNSS** solutions.

**Why Partner with Skhy?**
*   **High Demand:** Critical need for passive detection systems in today's defense landscape.
*   **Competitive Margins:** Attractive tier-based pricing for authorized distributors.
*   **Tech Integration:** Our open API allows seamless integration with your existing [Hardware/Software] offerings.

Please visit our Partner Portal to learn more about the program:

👉 **[Skhy AI Partner Program](https://skhy.ai/register?type=partner&ref=partner_outreach&uid=[Email_Placeholder])**

Looking forward to exploring this collaboration.

Sincerely,

**Skhy AI Partnership Team**
[partners@skhy.ai](mailto:partners@skhy.ai)
