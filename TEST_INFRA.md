# E2E Test Infrastructure & Verification Architecture

**Project**: Felege Genet Sema'etu Kidus Giorgis Church Website  
**Framework**: Node.js `node:test` + Playwright Core (Headless Chromium 152) + axe-core 4.14.0 + JSDOM 30.1.2  
**Specification Reference**: `SRS.md` v0.1 & `ORIGINAL_REQUEST.md` (Requirements R1–R5)  

---

## 1. Overview & Verification Strategy

The testing infrastructure implements an opaque-box, multi-tiered End-to-End (E2E) verification harness designed to rigorously evaluate the website against all functional, responsive, accessibility (WCAG 2.2 AA), localization, and non-functional requirements.

Unlike naive string-matching tests, this suite tests **actual rendered behavior**:
- True headless browser DOM rendering with real layout calculations (`getBoundingClientRect`, `getComputedStyle`, `scrollWidth`).
- Automated accessibility audits using **axe-core** in real Chromium contexts.
- Asynchronous client-side state machine testing (clipboard API, on-demand OpenStreetMap loading, anti-spam honeypot, form validation).
- Mathematical contrast ratio computations grounded in WCAG 2.1/2.2 relative luminance formulas.
- Production bundle size budgeting and Schema.org `PlaceOfWorship` JSON-LD schema parsing.

---

## 2. Technology Stack & Directory Structure

```
test/
├── helpers/
│   ├── static-server.js        # Zero-dependency local HTTP server serving dist/ on ephemeral ports
│   ├── browser.js              # Playwright Chromium launcher, viewports, axe-core injector
│   └── dom.js                  # JSDOM loader, JSON-LD parser, meta extractor, WCAG contrast math
├── srs-spec.test.js            # Baseline Phase 1 SRS v0.1 data model & string check suite (35 checks)
├── r1-responsive.test.js       # R1: 5 viewports (320px, 375px, 768px, 1024px, 1440px), overflow, layout
├── r2-wcag-a11y.test.js        # R2: axe-core audit, contrast math, touch targets (>=44px), keyboard, ARIA
├── r3-interactive-privacy.test.js # R3: Clipboard copy, on-demand map (0 trackers), directions coords, honeypot
├── r4-ethiopic-i18n.test.js    # R4: Noto Sans Ethiopic WOFF2, line height, subpage routing, hreflang parity
├── r5-production-seo.test.js   # R5: Bundle budget (<1MB), Schema.org PlaceOfWorship JSON-LD, OG tags, sitemap
├── e2e-scenarios.test.js       # Tier 4: Comprehensive parishioner, first-time visitor, and legal trust journeys
├── run-all-tests.js            # Master unified test runner and executive reporting engine
└── test-results.json           # Machine-readable test execution metrics
```

---

## 3. The 4-Tier Test Methodology

| Tier | Category | Focus | Test Files |
|---|---|---|---|
| **Tier 1** | **Feature Coverage** | Primary happy paths for every feature in scope: static models, font assets, map loading, address copy, meta tags. | `srs-spec.test.js`, `r1-responsive.test.js`, `r2-wcag-a11y.test.js`, `r3-interactive-privacy.test.js`, `r4-ethiopic-i18n.test.js`, `r5-production-seo.test.js` |
| **Tier 2** | **Boundary & Corner Cases** | Edge viewports (320px narrow mobile, 1440px wide desktop), horizontal overflow checks, contrast boundaries, sub-44px touch target audits, honeypot bot trap with populated inputs. | `r1-responsive.test.js`, `r2-wcag-a11y.test.js`, `r3-interactive-privacy.test.js`, `r5-production-seo.test.js` |
| **Tier 3** | **Cross-Feature Interactions** | Language switcher preserving subpages (`/privacy` ↔ `/am/privacy`), canonical & alternate hreflang cluster parity, mobile drawer focus trap & Escape dismissal, dynamic ARIA mutations. | `r1-responsive.test.js`, `r2-wcag-a11y.test.js`, `r4-ethiopic-i18n.test.js`, `r5-production-seo.test.js` |
| **Tier 4** | **Real-World Scenarios** | Full end-to-end user journeys: Established Parishioner Flow (EN & AM), First-Time Visitor Flow with form submission, Legal & Trust Governance Flow, and 0-cookie network audit. | `e2e-scenarios.test.js`, `r3-interactive-privacy.test.js` |

---

## 4. Requirement Mapping (R1–R5)

### Requirement 1: Responsive UI & UX Validation (`test/r1-responsive.test.js`)
- **Viewports Tested**:
  - `320x568` (iPhone SE / narrow mobile)
  - `375x667` (Standard mobile)
  - `768x1024` (Tablet)
  - `1024x768` (Desktop)
  - `1440x900` (Wide desktop)
- **Checks**:
  - `scrollWidth <= innerWidth` across all breakpoints and both languages (`/` and `/am`).
  - Sticky header stays anchored at `top: 0` on vertical scroll.
  - Narrow mobile (320px) header collision check: hamburger button and language switch do not overlap or truncate.
  - Breakpoint navigation controls: mobile toggle visible at `< 768px`, desktop nav visible at `≥ 768px`.
  - Grid card stacking: services cards stack into single column on mobile.

### Requirement 2: WCAG 2.2 AA Accessibility Audit (`test/r2-wcag-a11y.test.js`)
- **Automated Scanning**: Real browser `axe-core` scan running WCAG 2.0, 2.1, 2.2 rules (`wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`) on all 6 pages.
- **Color Contrast Calculations**:
  - Charcoal on cream: 16.43:1 (passes AAA $\ge 7:1$)
  - Charcoal on white: 17.56:1 (passes AAA)
  - Burgundy on cream: 11.54:1 (passes AAA)
  - White on burgundy: 12.33:1 (passes AAA)
  - Gold dark on cream: 5.78:1 (passes AA $\ge 4.5:1$)
  - Non-text focus contrast: audits focus rings against burgundy background (SC 1.4.11 $\ge 3:1$).
- **Typography & Touch Targets**:
  - Base font size $\ge 18\text{px}$; body line-height $\ge 1.75$ (Amharic $\ge 1.8$).
  - Bounding box checks ensuring buttons, links, and form inputs meet $\ge 44 \times 44\text{px}$ (SC 2.5.8).
- **Keyboard & Dynamic ARIA**:
  - Skip-to-content link gains focus and becomes visible on Tab; targets `#main-content`.
  - Mobile drawer traps focus, closes on `Escape`, and restores focus to toggle button.
  - `aria-live="polite"` feedback on address copy and `aria-invalid="true"` on invalid form submission.

### Requirement 3: Interactive Flow & Privacy QA (`test/r3-interactive-privacy.test.js`)
- **Address Copy**: Copies full venue address string to clipboard with visual feedback (`bg-emerald-100`, `"Copied!"`) and fallback path.
- **On-Demand Map**: Zero network requests to `openstreetmap.org` or external map domains on initial load; iframe injected only upon clicking `#load-interactive-map-btn`.
- **Directions Coordinates**: Asserts Google Maps and Apple Maps links contain venue coordinates (`51.4882, -0.1378`).
- **Contact Form & Anti-Spam**:
  - HTML5 client validation prevents empty submit and displays error alert.
  - Visually hidden honeypot field (`#honeypot-website`) silently traps bot submissions without triggering success feedback.
  - Valid submission resets form fields and shows success banner.
- **Zero Third-Party Cookies**: Audits `context.cookies()` across all 6 pages, asserting 0 tracking cookies.

### Requirement 4: Ethiopic Typography & Localization Integrity (`test/r4-ethiopic-i18n.test.js`)
- **Font Assets**: Asserts Noto Sans Ethiopic WOFF2 files exist in `public/fonts/` and `dist/fonts/`, with HTML `link rel="preload"`.
- **Unicode Coverage**: Verifies every Ethiopic character in data models falls within declared `@font-face` ranges (`U+1200-1399`, `U+2D80-2DDE`, `U+AB01-AB2E`, `U+1E7E0-1E7FE`).
- **Route Switching**: Verifies bidirectional language switcher preserving subpage context (`/privacy` ↔ `/am/privacy`, `/accessibility` ↔ `/am/accessibility`).
- **Canonical & Hreflang Parity**: Verifies reciprocal canonical and hreflang URLs on all 6 pages, preventing `/am/am` double-prefix errors.
- **Dictionary Symmetry**: Asserts 100% key parity between `i18n.en` and `i18n.am`.
- **Leftovers Scanner**: Audits Amharic pages for hardcoded English strings.

### Requirement 5: Production Build & Discoverability Audit (`test/r5-production-seo.test.js`)
- **Bundle Budget**: Total `dist/` directory size is strictly $< 1\text{MB}$ ($1,048,576\text{ bytes}$). Currently measures **647.85 KB**.
- **Schema.org JSON-LD**: Parses `<script type="application/ld+json">`, validates `@type: "PlaceOfWorship"`, `PostalAddress` ("SW1V 3EN"), `GeoCoordinates` (`51.4882, -0.1378`), opening hours, and canonical URLs.
- **Social Sharing**: Audits `og:title`, `og:description`, `og:url`, `og:locale`, and `twitter:card`.
- **Dead Link Crawler**: Crawls all `<a href="...">` links, asserting 100% of internal anchors (`#services`, `#find-us`, etc.) and routes exist.
- **Sitemap & Robots**: Reconciles `sitemap.xml` entries against all 6 canonical site URLs.

---

## 5. Execution Instructions

### Running the Entire E2E Test Suite
```bash
# Run master runner covering all 7 test suites:
pnpm test:e2e
# OR:
node test/run-all-tests.js
```

### Running Individual Test Suites
```bash
# Baseline SRS check:
node test/srs-spec.test.js

# Requirement 1 (Responsive UI/UX):
node --test test/r1-responsive.test.js

# Requirement 2 (WCAG 2.2 AA Accessibility):
node --test test/r2-wcag-a11y.test.js

# Requirement 3 (Interactive Flow & Privacy):
node --test test/r3-interactive-privacy.test.js

# Requirement 4 (Ethiopic Typography & i18n):
node --test test/r4-ethiopic-i18n.test.js

# Requirement 5 (Production Build & SEO):
node --test test/r5-production-seo.test.js

# Tier 4 User Scenarios:
node --test test/e2e-scenarios.test.js
```

---

## 6. Baseline Verification Results & Defect Escalations

Running `node test/run-all-tests.js` executes **76 total checks** across 7 suites:
- **Suites Passing Cleanly**: 5 / 7 (`SRS-SPEC`, `R3-INTERACTIVE`, `R4-I18N`, `R5-PROD-SEO`, `E2E-SCENARIOS`)
- **Checks Passing**: 71 / 76
- **Detected Implementation Defects**: 5 checks across 2 suites (`R1-RESPONSIVE`, `R2-WCAG`)

### Catalog of Implementation Defects for Milestone Agents:

1. **DEFECT-R1.1 (Subpage Horizontal Overflow at 320px)**:
   - **File**: `src/pages/privacy.astro:49, 133`
   - **Root Cause**: Long unbroken email address `info@felegegenet.org.uk` in `.prose` lacks `break-all` / `break-words`. At 320px width, `document.documentElement.scrollWidth` expands to 326px, causing horizontal overflow.
   - **Escalation**: Milestone 1/3 implementer to add `break-words` or `break-all` to link styles or container.

2. **DEFECT-R2.1 (WCAG SC 2.5.3: Label in Name Mismatch)**:
   - **File**: `src/components/Header.astro:41-55`
   - **Root Cause**: Brand header link has `aria-label="Felege Genet Church - Home"`. The visible text includes both the short name and the tradition subtitle ("Ethiopian Orthodox Tewahedo Church, London, United Kingdom"). WCAG 2.2 SC 2.5.3 requires visible text to be part of the accessible name.
   - **Escalation**: Milestone 2 implementer to adjust `aria-label` or remove redundant override.

3. **DEFECT-R2.2 (WCAG SC 1.4.11: Non-Text Contrast Defect)**:
   - **File**: `src/styles/global.css:66`
   - **Root Cause**: Focus outline `:focus-visible { outline: 3px solid #a67215; }` (`church-gold`) against `#661622` (`church-burgundy`) has a contrast ratio of **2.96:1**, failing WCAG SC 1.4.11 ($\ge 3.0:1$).
   - **Escalation**: Milestone 2 implementer to use higher-contrast outline color against dark backgrounds (e.g., `#d4a038` or `#ffffff` with 2-color outline).
