# Content Editor & Handover Guide (Phase 1)

*Felege Genet Sema'etu Kidus Giorgis Church, London*  
*Document Version: 1.0 · Prepared for Church Trustees and Nominated Content Editor*

---

## 1. Overview

This website is engineered as a secure, fast, and accessible static website powered by **Astro** and **Tailwind CSS**. It requires no database and no server patching, meaning running costs for the registered charity remain near zero with an uptime target of 99.9% (NFR-6).

All editorial content—such as service times, notice banners, venue directions, and bilingual text—is completely separated from website code and lives in the [`src/data/`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/) directory.

---

## 2. Updating Content Without a Developer (EDIT-1)

A nominated volunteer content editor can update information in two ways:

### Method A: Web Editor UI (`/admin`)
1. Navigate to `https://<your-church-domain>/admin` in any web browser.
2. Sign in using your secure account with Two-Factor Authentication (2FA) enabled (via Netlify Identity or GitHub).
3. Select the section you want to modify:
   - **Notice Banner**: Toggle active alert on/off, select `info` or `warning`, and write bilingual alert messages.
   - **Service Times & Schedule**: Modify regular liturgy times, evening prayer hours, and calendar commemorations.
   - **Venue & Location**: Update the street address, host building notes, or transport guidance.
   - **Church Details**: Update the registered charity number or contact telephone once approved by trustees.
4. Preview your modifications and click **Publish**. The site rebuilds automatically within 1 to 2 minutes.

### Method B: Directly in the Data Files (`src/data/`)
For technical administrators or code maintainers:
| File | What It Controls |
|---|---|
| [`src/data/notices.json`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/notices.json) | The top alert banner (toggle `active: true/false`, notice level, and text). |
| [`src/data/services.json`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/services.json) | The next service card on the hero screen and the regular weekly service table. |
| [`src/data/venue.json`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/venue.json) | Physical address, coordinates, public transport routes, step-free access, and first-visit guidance. |
| [`src/data/church.json`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/church.json) | Official church name, charity registration number, telephone, and email. |
| [`src/data/i18n.json`](file:///home/devnhm/Projects/Sara%20Church%20Project/src/data/i18n.json) | UI labels, button text, and navigation menu translations for English and Amharic. |

---

## 3. Trustee Review & Approval Workflow (EDIT-3)

Per requirement **EDIT-3** and charity governance rules:
1. **No Invented Facts**: All names, schedules, addresses, and religious phrasing must originate from church trustees and clergy.
2. **Review on Staging**: When significant revisions are made, the content editor previews the staging deployment before publishing live.
3. **Rollback (EDIT-2)**: Because all changes are tracked in Git, any published change can be instantly reverted to the previous version with a single click.

---

## 4. Running the Project Locally

To run or test the project locally on your computer:

```bash
# 1. Install dependencies
pnpm install

# 2. Run local development server
pnpm dev

# 3. Run automated SRS specification and data integrity tests
pnpm test

# 4. Build static release
pnpm build

# 5. Preview production build
pnpm preview
```

---

## 5. Account Ownership & Handover (NFR-7)

To ensure the church retains full sovereign ownership over its digital assets:
1. **Domain Name (`.org.uk` or `.uk`)**: Must be registered in the name of the church with a designated trustee email address.
2. **DNS & Hosting (e.g., Cloudflare Pages, Netlify, or Vercel)**: Configured under a church-owned organization account.
3. **Contact Mailbox**: The contact form and public email (`contact@felegegenet.org.uk`) must be connected directly to a mailbox monitored by church stewards.
