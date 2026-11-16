# Skhy AI — Investor Data Room & Customer CRM Architecture

Welcome to the **Skhy AI Investor Data Room & Interaction Repository**. This directory maintains version-controlled documentation, customer/investor meeting notes, partnership records, financial models, cap table structures, and legal manifests.

---

## 📁 Repository Structure

```
docs/investor-data-room/
├── README.md                           # This index file
├── meetings/                           # Per-customer / per-investor meeting notes
│   ├── TEMPLATE.md                     # Standardized template for new meeting logs
│   ├── 2026-10-08_sima-ai_partnership.md
│   └── 2026-09-24_lockheed-martin-ventures.md
├── partnerships/                       # MOUs, LOIs, and joint-development status
│   └── SUMMARY.md
├── financials/                         # Financial projections & unit economics
│   └── MODEL_SUMMARY.md
├── cap-table/                          # Equity structure & cap table breakdown
│   └── CAP_TABLE_SUMMARY.md
├── ip/                                 # Patent filings, acoustic beamforming & OS IP
│   └── PATENTS_PORTFOLIO.md
└── legal/                              # Corporate entity & legal manifest
    └── LEGAL_INDEX.md
```

---

## 📋 How to Record a New Meeting

1. Copy `docs/investor-data-room/meetings/TEMPLATE.md`.
2. Save it as `YYYY-MM-DD_company-name.md` inside `docs/investor-data-room/meetings/`.
3. Fill in the meeting details, lead status, key action items, and technical notes.
4. Commit the change to Git. The web app Data Room (`/investor-data-room`) renders curated summaries of these interactions.

---

## 🔐 Security & Access Control

- **Web Portal Access Code**: `SKHY-SEED-2026`
- Confidential documents (full financial models, signed agreements) are available upon request under mutual NDA (`/nda`).
