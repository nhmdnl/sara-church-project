# Project Handover & Content Editor Guide (Phase 1)

**Project:** Lideta Mariam and Felege Genet Semaetu Kidus Giorgis Church Website  
**Charity Details:** Registered Charity in England & Wales No. 1217660 (CIO)  
**Version:** 2.0 (Phase 1 Final Handover)  
**Date:** October 2026  
**Repository:** [github.com/nhmdnl/sara-church-project](https://github.com/nhmdnl/sara-church-project)  

---

## 1. Executive Summary

This project delivers the official, bilingual (English and Amharic), mobile-first web presence for **Lideta Mariam and Felege Genet Semaetu Kidus Giorgis Church** (Ethiopian Orthodox Tewahedo Church, London, UK).

### Key Architectural Strengths
- **Zero Server Costs & Maintenance**: Built as a high-performance static website using **Astro 5** and **Tailwind CSS**. It has no database, eliminates server-patching liabilities, and achieves an uptime rating of 99.9%+ at near-zero hosting cost.
- **Strictly Decoupled Content Layer**: All editorial text, dates, worship hours, contact details, and venue data are managed inside pure JSON files in [`src/data/`](../src/data/), completely separated from presentation code.
- **Privacy-First & Tracker-Free**: No third-party tracking scripts or profiling cookies. The interactive OpenStreetMap container runs strictly on demand—no third-party requests execute prior to explicit user interaction.
- **WCAG 2.2 Level AA Accessible**: High-contrast typography ($\ge 4.5:1$), touch targets ($\ge 44 \times 44\text{px}$), accessible skip-to-content links, mobile navigation drawer focus trapping, and screen-reader polite status announcements.
- **Self-Hosted Ethiopic Typography**: Native support for Ge'ez and Amharic script using locally bundled, subsetted Noto Sans Ethiopic WOFF2 fonts with generous line heights ($\ge 1.75$) to guarantee uniform rendering across iOS, Android, macOS, and Windows.
- **Charities Act 2011 Compliant**: Comprehensive legal disclosure in the footer, Schema.org `PlaceOfWorship` structured metadata, dedicated Privacy Notice (`/privacy`, `/am/privacy`), and Accessibility Statement (`/accessibility`, `/am/accessibility`).

---

## 2. Content Management & Editing Guide

Non-technical volunteers and church trustees can maintain the site without editing HTML or touching code.

### 2.1 The Data Layer (`src/data/`)

Every editable element maps to a dedicated file in [`src/data/`](../src/data/):

| File | Purpose | Key Fields to Edit |
|---|---|---|
| [`src/data/church.json`](../src/data/church.json) | Official church identity & charity registration | `name`, `shortName`, `tradition`, `dedication`, `charity.number` (`1217660`), `charity.activities`, `contact.phone`, `contact.email` |
| [`src/data/venue.json`](../src/data/venue.json) | Location, venue address & directions | `address` (`Flat 12, Marsh House, Thessaly Road, LONDON, SW8 4HB`), `coordinates`, `entranceInstructions`, `publicTransport` (Nine Elms, Battersea Park, Vauxhall, buses 156, 344, 436, 77), `accessibility` |
| [`src/data/services.json`](../src/data/services.json) | Worship times & liturgy schedule | `regularServices` (Sunday Divine Liturgy, Saturday Evening Prayer), `monthlyFeasts`, and `calendarGuidance` |
| [`src/data/notices.json`](../src/data/notices.json) | Important parish alerts & short-notice announcements | `active` (`true`/`false`), `level` (`info`/`warning`), `title`, and `message` in EN and AM |
| [`src/data/i18n.json`](../src/data/i18n.json) | UI labels & navigation text | Navigation links, button labels, form placeholders, and section titles |

### 2.2 How to Publish an Urgent Notice
When a service time changes or an urgent parish notice needs to be displayed:
1. Open [`src/data/notices.json`](../src/data/notices.json).
2. Set `"active": true`.
3. Provide the notice headline and details under both `"en"` and `"am"`.
4. Commit or save. The notice banner immediately appears at the top of the homepage in gold/amber.
5. Once the event has passed, set `"active": false` to hide the banner.

### 2.3 Web Content Editor UI (`/admin`)
Decap CMS is pre-configured in `public/admin/` with configuration in `public/admin/config.yml`. Once connected to your GitHub or Netlify Identity repository, nominated editors can log into `https://<domain>/admin` to edit notice banners, service schedules, and contact info via a simple web interface.

---

## 3. Verified Facts & Current Baseline Data

Following trustee and Charity Commission intake, the website reflects verified data:

- **Official Charity Name**: `LIDETA MARIAM AND FELEGE GENET SEMAETU KIDUS GIORGIS CHURCH`
- **Working Parish Title**: `Lideta Mariam and Felege Genet Semaetu Kidus Giorgis Church` (ልደታ ማርያም እና ፈለገ ገነት ሰማዕቱ ቅዱስ ጊዮርጊስ ቤተ ክርስቲያን)
- **Charity Commission Registration No.**: `1217660` (Registered 16 April 2026 · CIO)
- **Registered Office & Venue Address**:  
  `Flat 12, Marsh House, Thessaly Road, LONDON, SW8 4HB`  
  *Coordinates:* `51.4764, -0.1382`  
  *Nearest Tube:* Nine Elms Station (Northern Line, ~8 min walk)  
  *Nearest Rail:* Battersea Park / Queenstown Road (~12 min walk), Vauxhall (~15 min walk)  
  *Bus Routes:* 156, 344, 436, 77 (Stop: Thessaly Road / Carey Gardens)  
- **Official Contact Channels**:  
  *Email:* `felegegenetkidusgiorgis@gmail.com`  
  *Telephone:* `07701 332356` (`+447701332356`)  
- **Official Brand Assets**: Full-color traditional stamp seal vector (`/church-logo.svg`, `/favicon.svg`, `/favicon.ico`).

---

## 4. Development & Verification Workflow

### 4.1 Prerequisites
- **Node.js**: v20 or newer (tested on Node v26)
- **pnpm**: v9 or newer (`corepack enable pnpm`)

### 4.2 Local Setup
```bash
# Clone the repository
git clone https://github.com/nhmdnl/sara-church-project.git
cd "sara-church-project"

# Install project dependencies
pnpm install

# Start local development server (http://localhost:4321)
pnpm dev
```

### 4.3 Automated Verification Commands
The codebase contains a comprehensive 4-tier automated test suite:

```bash
# 1. Run baseline SRS specification & data model checks (Astro build + SRS tests)
pnpm test

# 2. Run the complete 7-suite end-to-end regression harness (Playwright headless)
node test/run-all-tests.js

# 3. Build static production release to dist/
pnpm build

# 4. Preview compiled production build locally
pnpm preview
```

### 4.4 Automated Test Suite Breakdown
| Suite ID | Description | Checks | Pass Rate |
|---|---|---|---|
| `SRS-SPEC` | SRS v0.1 baseline, data integrity, required fields | 35 / 35 | **100%** |
| `R1-RESPONSIVE` | Viewport stress testing (320px, 375px, 768px, 1024px, 1440px) | 7 / 7 | **100%** |
| `R2-WCAG` | WCAG 2.2 AA contrast, tap target bounds, ARIA, drawer trap | 8 / 8 | **100%** |
| `R3-INTERACTIVE` | Clipboard copy, on-demand OSM map, contact form & honeypot | 8 / 8 | **100%** |
| `R4-I18N` | Noto Sans Ethiopic font coverage, line height, bilingual URLs | 7 / 7 | **100%** |
| `R5-PROD-SEO` | PlaceOfWorship JSON-LD, OG tags, sitemap, <1MB bundle budget | 7 / 7 | **100%** |
| `E2E-SCENARIOS` | Full user journeys (visitor, parishioner, legal reviewer) | 4 / 4 | **100%** |
| **Total** | **Comprehensive Regression Suite** | **76 / 76** | **100%** |

---

## 5. Deployment & Production Hosting Handover

The static site builds directly into the `dist/` directory and can be deployed with zero backend dependencies to any modern static hosting provider.

### Option 1: Vercel (Recommended)
1. Sign in to [vercel.com](https://vercel.com) using the church's administrative account.
2. Click **Add New Project** → **Import Git Repository**.
3. Select `nhmdnl/sara-church-project`.
4. Framework Preset: **Astro** (auto-detected).
5. Build Command: `pnpm build` | Output Directory: `dist`.
6. Click **Deploy**. Vercel generates an SSL certificate and provides automatic staging previews on every push.

### Option 2: Cloudflare Pages
1. In the Cloudflare Dashboard, navigate to **Compute (Workers) > Pages**.
2. Connect to the GitHub repository.
3. Build preset: `Astro`, build command: `pnpm build`, output directory: `dist`.
4. Cloudflare provides globally distributed edge CDN caching with unlimited bandwidth.

### Option 3: Netlify
1. Log in to Netlify, import from GitHub, and deploy using `pnpm build`.
2. Connect Netlify Identity to enable Decap CMS login for volunteer editors at `/admin`.

---

## 6. Domain Name & DNS Configuration

When ready to link the church's official domain (e.g. `felegegenet.org.uk`):

1. **Domain Registrar**: Purchase and manage the domain through Nominet-accredited registrars (such as Cloudflare Registrar, Namecheap, or Google Domains/Squarespace) using a designated trustee administrative email.
2. **DNS Records**:
   - For Vercel:
     - `A` record `@` $\to$ `76.76.21.21`
     - `CNAME` record `www` $\to$ `cname.vercel-dns.com`
   - For Cloudflare Pages:
     - Add `CNAME` pointing to `<project>.pages.dev`.
3. **Canonical Domain in Astro Config**:
   Update `site` in [`astro.config.mjs`](../astro.config.mjs) to match the official live domain:
   ```javascript
   export default defineConfig({
     site: 'https://felegegenet.org.uk',
     // ...
   });
   ```

---

## 7. Transitioning from "Draft Preview" to Final Launch

During initial review, the site renders a red **Preview Development** ribbon and provisional badges. When the trustees give final launch approval:

1. In [`src/data/venue.json`](../src/data/venue.json), confirm `"verified": true`.
2. In [`src/components/DraftBanner.astro`](../src/components/DraftBanner.astro), toggle or remove the preview ribbon container.
3. Run `pnpm test && pnpm build` to confirm all 76 tests remain 100% passing.
4. Commit and push to `master`. The live site updates in under 2 minutes.

---

## 8. Sovereign Asset Checklist for Church Trustees

To ensure complete long-term institutional independence, the church trustees should hold direct credentials for:
- [x] **Source Code**: GitHub organization or account repository (`nhmdnl/sara-church-project`).
- [ ] **Hosting Account**: Vercel / Cloudflare / Netlify account registered to a church email.
- [ ] **Domain Name Registration**: `.org.uk` domain ownership under the charity's name.
- [ ] **Official Contact Mailbox**: `felegegenetkidusgiorgis@gmail.com` (monitored by church stewards).
- [ ] **Content Editor Nomination**: One or two nominated church volunteers trained on updating [`src/data/notices.json`](../src/data/notices.json) and [`src/data/services.json`](../src/data/services.json).

---
*Prepared by Arch Solutions / Engineering Team for Lideta Mariam and Felege Genet Semaetu Kidus Giorgis Church.*
