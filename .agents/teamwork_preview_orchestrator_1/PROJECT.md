# Project: Sara Church Project (Felege Genet Sema'etu Kidus Giorgis Church Website)

## Architecture
- **Framework & Runtime**: Astro 5.4.2 (static HTML export) + Tailwind CSS 3.4.17
- **Content Separation**: 100% decoupled content layer in `src/data/*.json` (`church.json`, `services.json`, `venue.json`, `notices.json`, `i18n.json`)
- **Bilingual Routing**: English (`/`, `/privacy`, `/accessibility`) and Amharic (`/am`, `/am/privacy`, `/am/accessibility`)
- **Ethiopic Typography**: Self-hosted Noto Sans Ethiopic WOFF2 fonts in `/public/fonts/` with Latin subsets preloaded in `BaseLayout.astro`
- **Accessibility & Contrast**: Base font >= 18px (computed 20.25px), line height >= 1.75 (Amharic 1.8), touch targets >= 44x44px, high-contrast palette (burgundy #661622, gold #a67215, cream #faf7f2, charcoal #1a1918)
- **Privacy & Legal**: Zero third-party trackers or cookies on initial load; on-demand OSM map frame; statutory charity disclosure (Charities Act 2011 s.39) in footer
- **SEO & Discovery**: Schema.org `PlaceOfWorship` JSON-LD, OpenGraph, Twitter Cards, `sitemap.xml`, `robots.txt`

## Feature Inventory
Every feature from the Survey phase appears here with its assigned milestone. No feature is left unassigned.

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Skip to Content Link | Accessible skip-navigation link jumping keyboard/screen-reader users over header to #main-content | M2 | Survey (SRS HOME-4; ORIGINAL_REQUEST R2) |
| 2 | Sticky Brand Header | Sticky header with parish emblem, short name, tradition badge, and responsive desktop/mobile nav | M2 | Survey (SRS HOME-1, HOME-4) |
| 3 | Mobile Drawer Toggle | Accessible collapsible hamburger menu with ARIA states, Escape key handling, focus trap, and focus restoration | M2 | Survey (ORIGINAL_REQUEST R2) |
| 4 | Bilingual Route Switcher | Zero-cookie language switch between English and Amharic preserving subpage routes | M1 | Survey (SRS LANG-2; ORIGINAL_REQUEST R4) |
| 5 | Hero Essentials Card | Fast-facts card showing next service title, day, time, short venue name, and direct map link | M3 | Survey (SRS HOME-2) |
| 6 | Get Directions Quick Action | Primary CTA button in hero opening pre-filled Google Maps directions with valid venue coordinates | M3 | Survey (SRS HOME-2, FIND-3) |
| 7 | View Schedule Quick Action | Secondary CTA button scrolling viewport smoothly down to services schedule | M3 | Survey (SRS HOME-2) |
| 8 | Parish Tradition & Emblem | SVG Ethiopian cross emblem and tradition subtitle ("Ethiopian Orthodox Tewahedo Church") | M3 | Survey (SRS HOME-1) |
| 9 | About Parish Narrative | ~100-word introduction introducing the parish, foundation, and faith tradition | M3 | Survey (SRS HOME-3) |
| 10 | Photographs with Consent | Approved photos of church/community with alt text and consent verification | M3 | Survey (SRS HOME-6) |
| 11 | Real Selectable Address | Plain text postal address with formatted lines and emphasized postcode in <address> | M3 | Survey (SRS FIND-1) |
| 12 | One-Click Address Copy | Interactive button copying full address to clipboard with dynamic aria-live feedback | M2 | Survey (SRS FIND-1; ORIGINAL_REQUEST R3) |
| 13 | Static Map Preview Fallback | Privacy-safe static preview showing venue marker and address before any third-party script loads | M3 | Survey (SRS FIND-2) |
| 14 | On-Demand Interactive Map | Privacy-compliant interactive map loaded strictly upon explicit user interaction with dynamic ARIA announcement | M2 | Survey (SRS FIND-2; ORIGINAL_REQUEST R3) |
| 15 | Multi-Provider Directions Links | Dual map launcher buttons for Google Maps and Apple Maps with coordinates | M3 | Survey (SRS FIND-3) |
| 16 | Public Transport Directions | Detailed nearest railway/tube stations and bus stops with walking times and touch-target compliant links | M2 | Survey (SRS FIND-4) |
| 17 | Step-Free & Accessibility Details | Guidance on ramped entry, wheelchair-accessible toilets, emergency cords, Blue Badge parking | M3 | Survey (SRS FIND-5) |
| 18 | Host Venue & Entrance Guide | Clear instructions on host building name and specific gate/courtyard entry | M3 | Survey (SRS FIND-6) |
| 19 | First-Time Visitor Guide | What to expect covering liturgical language, duration, dress/shawl, shoes, kids, photography | M3 | Survey (SRS FIND-7) |
| 20 | Regular Service Times | Structured schedule for Divine Liturgy and Mahlet/Wazema with localized time strings | M3 | Survey (SRS TIME-1) |
| 21 | Notice Banner Alert | Toggleable high-visibility banner for short-notice schedule changes or feast announcements | M3 | Survey (SRS TIME-2) |
| 22 | Dual Ecclesiastical Calendar | Guidance note explaining Ethiopian calendar feast days alongside Gregorian dates | M3 | Survey (SRS TIME-3) |
| 23 | Tappable Tel & Mail Links | Direct telephone and email touch targets formatted with tel: and mailto: protocols | M3 | Survey (SRS CONT-1) |
| 24 | Accessible Contact Form | Semantic form with name, email, message, required validation, aria-invalid states, and feedback | M2 | Survey (SRS CONT-2; ORIGINAL_REQUEST R3) |
| 25 | Anti-Spam Honeypot | Hidden input field that traps automated spam bots without blocking legitimate users | M3 | Survey (SRS CONT-2; ORIGINAL_REQUEST R3) |
| 26 | Official Social Verification | Placeholders/links for official parish messaging channels | M3 | Survey (SRS CONT-3) |
| 27 | Self-Hosted Ethiopic Fonts | Subsetted Noto Sans Ethiopic WOFF2 fonts loaded locally across all client platforms | M3 | Survey (SRS LANG-3; ORIGINAL_REQUEST R4) |
| 28 | HTML Language Declaration | Dynamic lang="en" and lang="am" root attributes for screen readers and search bots | M1 | Survey (SRS LANG-4) |
| 29 | Charity Statutory Disclosure | Mandatory charity statement, registered name, and registration number per Charities Act 2011 s.39 | M3 | Survey (SRS LEGAL-1) |
| 30 | Privacy & Cookie Notice Page | Dedicated page explaining minimal data collection, UK GDPR, DPA 2018, PECR, and zero-cookie policy | M3 | Survey (SRS LEGAL-2, LEGAL-3) |
| 31 | Accessibility Statement Page | Dedicated statement declaring WCAG 2.2 Level AA conformance, features, and contact route | M3 | Survey (SRS LEGAL-4) |
| 32 | Decap CMS Web Admin | Browser-based GUI for nominated non-technical volunteers to edit JSON data files with 2FA | M3 | Survey (SRS EDIT-1, EDIT-2) |
| 33 | Search & Social Discovery | Dynamic XML sitemap, robots.txt, Open Graph, Twitter Cards, canonical and alternate hreflang URLs | M1 | Survey (SRS SEO-1, SEO-2) |
| 34 | Schema.org PlaceOfWorship | Structured JSON-LD embedding parish coordinates, opening hours, address, and contacts | M1 | Survey (SRS FIND-8) |

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|--------------|--------|
| M1 | Routing & i18n URL Parity | Normalization of localized URLs in `src/utils/i18n.ts`, fixing `/am/am` bug in `BaseLayout.astro`, canonical, hreflang, OpenGraph, and Schema.org PlaceOfWorship URLs | None | DONE |
| M2 | WCAG 2.2 AA Accessibility & Touch Target Hardening | Keyboard focus trap & Escape dismissal on mobile menu (`Header.astro`), dynamic `aria-live` on address copy and map container (`FindUs.astro`), `aria-invalid` on contact form (`Contact.astro`), and touch-target sizing on TfL link | None | DONE |
| M3 | Interactive Flows & Localization Polish | Fix hardcoded `UK Local Time` string in `Services.astro:52`, refine Amharic locale checks in `FindUs.astro`, ensure zero-cookie map loading and clipboard fallbacks | M1, M2 | DONE |
| M4 | E2E Testing Suite Creation (Dual Track) | Comprehensive multi-tier test suite (Tiers 1-4) covering all 5 user requirements (R1–R5), responsive viewports (320px–1440px), automated axe-core accessibility audits, interactive flows, and bundle budgeting; publish `TEST_READY.md` | None | DONE |
| M5 | Final Milestone: 100% E2E Test Suite Pass & Adversarial Hardening | Phase 1: Pass 100% of E2E tests (Tiers 1-4); Phase 2: Adversarial coverage hardening (Tier 5) with zero gaps; final production build and audit verification | M1, M2, M3, M4 | DONE |

## Interface Contracts
### `src/utils/i18n.ts` ↔ `src/layouts/BaseLayout.astro`
- Signature: `getLocalizedUrl(path: string, lang: Locale): string`
- Input: `path` may be `/`, `/am`, `/privacy`, `/am/privacy`, `/accessibility`, `/am/accessibility`.
- Contract: `getLocalizedUrl` must first strip any leading `/am` prefix to obtain the canonical base path. If `lang === 'en'`, return `cleanPath`. If `lang === 'am'`, return `/am` (if `cleanPath === '/'`) or `/am${cleanPath}`. Never produce double prefixes such as `/am/am`.

### Accessibility State Contracts
- Mobile Drawer (`Header.astro`):
  - `#mobile-menu-toggle` controls `#mobile-nav-menu`.
  - `aria-expanded` reflects open/closed state.
  - Pressing `Escape` closes the drawer and restores focus to `#mobile-menu-toggle`.
  - Focus is trapped within drawer links while open.
- Address Copy (`FindUs.astro`):
  - Injects or updates an `aria-live="polite"` container announcing address copy confirmation to screen readers.
- Contact Form (`Contact.astro`):
  - On submit with invalid inputs, sets `aria-invalid="true"` on invalid fields and associates error messaging via `aria-describedby`.

## Code Layout
- `src/layouts/BaseLayout.astro`: Layout shell, SEO, Schema.org, OpenGraph, font preload.
- `src/components/Header.astro`: Navigation, brand, language switcher, mobile menu.
- `src/components/Hero.astro`: Top visual section, quick CTAs, next service badge.
- `src/components/NoticeBanner.astro`: Alert banner.
- `src/components/About.astro`: Church intro and tradition.
- `src/components/Services.astro`: Schedule table, feast commemorations, calendar note.
- `src/components/FindUs.astro`: Address, map, transport, step-free access, visitor guide.
- `src/components/Contact.astro`: Contact details, honeypot form, status announcements.
- `src/components/Footer.astro`: Charity disclosures, legal links.
- `src/utils/i18n.ts`: Language helpers, translations, route generators.
- `src/data/*.json`: Church content data files.
- `src/styles/global.css`: Global styles, font-face, skip-link, touch-target utilities.
- `test/`: Verification and automated test suites.
