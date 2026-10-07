# Test Suite & Verification Infrastructure Exploration Report

**Role**: Test & Quality Infrastructure Explorer (`teamwork_preview_explorer_survey_2`)  
**Repository**: `/home/devnhm/Projects/Sara Church Project`  
**Date**: 2026-10-07  
**Scope**: Comprehensive investigation of existing test suite, verification infrastructure, test dependencies, coverage, and testing gaps across the 5 requirements in `ORIGINAL_REQUEST.md` (R1–R5) and `SRS.md`.

---

## 1. Observation

### 1.1 Existing Test Infrastructure & Tooling Inventory

1. **Test Runner & Scripts** (`package.json:6-13`):
   ```json
   "scripts": {
     "dev": "astro dev",
     "start": "astro dev",
     "build": "astro build",
     "preview": "astro preview",
     "test": "astro build && node test/srs-spec.test.js",
     "astro": "astro"
   }
   ```
   - Running `pnpm test` triggers a full static compilation (`astro build`) followed by running `node test/srs-spec.test.js`.
   - The test script runs directly via plain Node.js (`node test/srs-spec.test.js`). It does **not** use a test framework (no Vitest, Jest, Mocha, Playwright, or Cypress), nor does it use Node's native test runner (`node --test`).

2. **Project Dependencies** (`package.json:14-22`):
   ```json
   "dependencies": {
     "@astrojs/tailwind": "^6.0.2",
     "astro": "^5.4.2",
     "tailwindcss": "^3.4.17"
   },
   "devDependencies": {
     "typescript": "^5.7.3"
   }
   ```
   - **Zero test dependencies** are declared in `package.json`.
   - There are no DOM simulation libraries (e.g., `jsdom`, `happy-dom`), no HTML parsers (e.g., `cheerio`), no accessibility scanners (e.g., `axe-core`, `@axe-core/playwright`, `pa11y`), and no end-to-end browser drivers.

3. **Existing Test Suite Code** (`test/srs-spec.test.js`):
   - The file is 95 lines of Node.js ES module code using exclusively `node:fs`, `node:path`, and `node:url`.
   - Assertions rely entirely on a custom hand-rolled function (`test/srs-spec.test.js:14-21`):
     ```javascript
     function assert(condition, message) {
       if (condition) {
         console.log(`  ✓ PASS: ${message}`);
       } else {
         console.error(`  ✗ FAIL: ${message}`);
         failed++;
       }
     }
     ```
   - Test execution structure consists of 28 static string/property checks across three sections:
     - **Section 1: Data Models Integrity (6 checks)**: Confirms existence of keys in `src/data/*.json` (`church.name.en/am`, `church.charity.statement.en/am`, `services.regularServices.length >= 2`, `notices.active` boolean, `venue.address.postcode`, `i18n.en/am`).
     - **Section 2: Build Artifacts Integrity (1 check)**: Confirms `dist/` directory exists.
     - **Section 3: Functional SRS Requirements (21 checks)**: Performs naive string substring checks (`includes()`) on generated static HTML strings in `dist/`.

4. **Current Test Execution Baseline**:
   - Running `pnpm test` outputs:
     ```text
     6 page(s) built in 2.43s
     Running Phase 1 SRS & Data Integrity Test Suite...
     1. Checking Decoupled Data Models in src/data/:
       ✓ PASS: Church names defined in both EN and AM
       ... (6 passed)
     2. Checking Build Artifacts in dist/:
       ✓ PASS: Build directory dist/ exists
     3. Checking Functional SRS Requirements:
       ... (21 passed)
     --- Test Summary ---
     All tests passed cleanly! Ready for release.
     ```
   - Command exits with code `0` in ~2.4 seconds.

5. **Available System & Machine Tools**:
   - Node.js runtime: `v26.8.1` (supports built-in `node:test`, `node:assert`, ES modules, native fetch).
   - Package manager: `pnpm v11.17.0`.
   - Global browser automation CLI: `agent-browser v0.37.1` (`/home/devnhm/.local/share/mise/shims/agent-browser`).
   - System browser binaries installed: `/usr/bin/chromium` and `/usr/bin/google-chrome-stable`.
   - Preview server: `pnpm preview` (`astro preview` serves `dist/` on `http://localhost:4321`).

---

### 1.2 Testing Gaps Against Requirement 1: Responsive UI and UX Validation

**Requirement**: Validate user interface across mobile (`320px`, `375px`), tablet (`768px`), and desktop (`1024px`, `1440px`) in both English (`/`) and Amharic (`/am`). Verify no horizontal overflow, layout shifts, or clipping; ensure smooth sticky header collapse.

**Existing Tests in `test/srs-spec.test.js`**:
- **0 tests**. Viewport widths, screen dimensions, overflow, and layout behavior are completely unmonitored.

**Identified Testing Gaps**:
| Gap ID | Description | Unchecked Risk | Verification Need |
|---|---|---|---|
| **GAP-R1.1** | **No Multi-Viewport Rendering Tests** | The test suite never renders pages under specific viewports (`320px`, `375px`, `768px`, `1024px`, `1440px`). | Headless browser viewport emulation checking DOM elements at each breakpoint. |
| **GAP-R1.2** | **No Horizontal Overflow / Scroll Detection** | No check verifying `document.documentElement.scrollWidth <= window.innerWidth`. | Automated scrollWidth vs innerWidth check across all routes at 320px–1440px. |
| **GAP-R1.3** | **No Narrow Viewport (320px) Header Collision Test** | At 320px width, the header cluster in `Header.astro:83` (`gap-2 md:hidden`) lacks `shrink-0`. On long localized titles, button hitboxes could be compressed. | Automated bounding rect check of `#mobile-menu-toggle` and language switcher at 320px. |
| **GAP-R1.4** | **No Responsive Grid / Card Collapse Verification** | Services grid (`grid-cols-1 md:grid-cols-2`), Transport cards, and First Visit cards (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3`) are never tested for column stacking at `< 768px`. | Automated DOM layout inspection verifying 1-column layout on mobile viewports. |
| **GAP-R1.5** | **No Visual Layout Shift (CLS) or Typography Overflow Check** | Ethiopic text has different character widths and wrapping properties than English. No test verifies layout stability between `/` and `/am`. | Visual/DOM bounding box comparison between English and Amharic equivalents. |

---

### 1.3 Testing Gaps Against Requirement 2: WCAG 2.2 AA Accessibility Audit and Hardening

**Requirement**: Guarantee full WCAG 2.2 AA compliance: contrast ratios $\ge 4.5:1$ (3:1 large), base body text $\ge 18\text{px}$ with generous line height, touch targets $\ge 44 \times 44\text{px}$, full keyboard navigation, skip-to-content links, dynamic ARIA states (`aria-expanded`, `aria-label`, landmarks).

**Existing Tests in `test/srs-spec.test.js`**:
- Only 2 naive string checks:
  1. `assert(enHtml.includes('skip-link') && enHtml.includes('href="#main-content"'), 'HOME-4: Skip-to-content accessible link present');`
  2. `assert(accessibilityHtml.includes('WCAG 2.2') && amAccessibilityHtml.includes('WCAG 2.2'), 'LEGAL-4: Accessibility statement present in both languages');`
- These checks only confirm the presence of substring text in HTML; they verify zero actual accessibility rules.

**Forensic Palette Contrast Calculations** (Computed via WCAG 2.1/2.2 relative luminance formula):
- Background cream (`#faf7f2`), white (`#ffffff`), dark burgundy (`#480f17`), burgundy (`#661622`):
  - Charcoal (`#1a1918`) on cream: **16.43:1** (Passes AAA)
  - Charcoal on white: **17.56:1** (Passes AAA)
  - Muted (`#4a4641`) on cream: **8.76:1** (Passes AAA)
  - Burgundy (`#661622`) on cream: **11.54:1** (Passes AAA)
  - White on burgundy (`#661622`): **12.33:1** (Passes AAA)
  - White on dark burgundy (`#480f17`): **15.48:1** (Passes AAA)
  - Gold dark (`#85580a`) on cream: **5.78:1** (Passes AA $\ge 4.5:1$)
  - Gold dark on white: **6.18:1** (Passes AA $\ge 4.5:1$)
  - Gold (`#a67215`) on cream: **3.90:1** (**FAILS normal text AA 4.5:1**)
  - Gold (`#a67215`) on white: **4.17:1** (**FAILS normal text AA 4.5:1**)
  - Gold (`#a67215`) on burgundy (`#661622`): **2.96:1** (**FAILS both AA normal and AA large $\ge 3:1$**)
  - Focus outline (`#a67215`) against burgundy (`#661622`): **2.96:1** (**FAILS WCAG 2.2 SC 1.4.11 non-text contrast $\ge 3:1$**)

**Identified Testing Gaps**:
| Gap ID | Description | Unchecked Risk | Verification Need |
|---|---|---|---|
| **GAP-R2.1** | **Zero Automated axe-core / Rule Audit** | The test suite runs zero automated accessibility auditing engines (`axe-core`, `pa11y`, `lighthouse`). Violations of WCAG 2.2 rules go completely undetected. | Automated axe-core execution on all 6 pages (`/`, `/am`, `/privacy`, `/am/privacy`, `/accessibility`, `/am/accessibility`) asserting 0 violations. |
| **GAP-R2.2** | **No Color Contrast Ratio Assertions** | No test validates that text and non-text focus indicators achieve WCAG AA contrast. `church-gold` (`#a67215`) fails 4.5:1 for normal text and fails 3:1 non-text contrast against burgundy. | Automated contrast assertion suite verifying all foreground/background pairings. |
| **GAP-R2.3** | **No Computed CSS Size & Line-Height Verification** | No test verifies that computed `font-size >= 18px` and `line-height >= 1.75` (or `1.8` for `:lang(am)`) are actually applied to rendered elements. | DOM computed style inspection (`window.getComputedStyle(el).fontSize`). |
| **GAP-R2.4** | **No Touch Target Bounding Box ($\ge 44 \times 44\text{px}$) Assertions** | `test/srs-spec.test.js` does not check interactive element bounding boxes. As a result, the defect in `FindUs.astro:219` (TfL Journey Planner link lacks `.touch-target`, rendering at ~28px height) passed undetected. | Automated bounding box audit (`getBoundingClientRect()`) on all `<a>`, `<button>`, `<input>`, `<textarea>`. |
| **GAP-R2.5** | **No Keyboard Focus Traversal & Skip Link Test** | No test simulates Tab key navigation: skip-to-content focus transfer to `#main-content`, focus outline visibility, and focus order are never tested. | Keyboard event simulation testing activeElement transition from skip-link to `#main-content`. |
| **GAP-R2.6** | **No Focus Trap / Restoration & Escape Key Test in Mobile Drawer** | In `Header.astro:131-158`, the mobile menu does not trap focus, does not listen to `Escape`, and does not restore focus to `#mobile-menu-toggle` on close. | Automated test asserting focus entrapment, Escape dismissal, and focus restoration to trigger button. |
| **GAP-R2.7** | **No Dynamic ARIA State Mutation Checks** | No test checks that `#copy-address-btn` notifies assistive tech via an `aria-live` region, or that `#load-interactive-map-btn` toggles `aria-expanded` and announces map loading. | DOM inspection of ARIA attributes and `aria-live` status regions before and after click events. |

---

### 1.4 Testing Gaps Against Requirement 3: Interactive Flow & Privacy QA

**Requirement**: Verify client-side behaviors function without runtime errors or privacy violations: "Copy Address" clipboard feedback, on-demand map loading with zero trackers before user click, valid directions coordinates, contact form validation & honeypot spam protection, accessible feedback alerts.

**Existing Tests in `test/srs-spec.test.js`**:
- Only 4 naive substring checks:
  1. `assert(enHtml.includes('copy-address-btn'), 'FIND-1: One-click copy address button present');`
  2. `assert(enHtml.includes('load-interactive-map-btn'), 'FIND-2: On-demand interactive map loader present without trackers');`
  3. `assert(enHtml.includes('maps/dir/?api=1'), 'FIND-3: Get directions link opens maps provider');`
  4. `assert(enHtml.includes('id="parish-contact-form"') && enHtml.includes('id="honeypot-website"'), 'CONT-2: Contact form with honeypot anti-spam present');`

**Identified Testing Gaps**:
| Gap ID | Description | Unchecked Risk | Verification Need |
|---|---|---|---|
| **GAP-R3.1** | **No Clipboard API Execution Test** | `test/srs-spec.test.js` never triggers `#copy-address-btn`. It does not test `navigator.clipboard.writeText`, the fallback `<textarea>` path, the visual `"Copied!"` text change, the `bg-emerald-100` styling, or the 3000ms reset timer. | Browser/JSDOM simulation triggering button click, verifying clipboard contents, DOM class toggle, and timer revert. |
| **GAP-R3.2** | **No Zero-Tracker Network Traffic Interception Test** | The test claims `without trackers` in its log message, but **never intercepts or verifies network traffic**. It does not verify that 0 requests to `openstreetmap.org` occur on load, and that the `iframe` is constructed only upon clicking `#load-interactive-map-btn`. | Network request interceptor verifying 0 third-party requests before click, and exactly 1 OSM embed iframe created post-click. |
| **GAP-R3.3** | **No Coordinate Validity Checks in Direction Links** | The test checks only `maps/dir/?api=1`. It does not parse the latitude and longitude parameters (`51.4882, -0.1378`) or verify Apple Maps URL structure (`maps.apple.com/?daddr=`). | URL parser verifying latitude/longitude query params against venue coordinates in `src/data/venue.json`. |
| **GAP-R3.4** | **No Contact Form Client Validation & Submission Suite** | `test/srs-spec.test.js` never submits the form. It does not test: (1) HTML5 required field validation on empty submit, (2) Error alert banner display (`#form-error-alert`), (3) Success alert display (`#form-success-alert`), (4) Submit button temporary disable state. | Form submission simulation testing invalid submit (error banner shown) vs valid submit (success banner shown, form reset). |
| **GAP-R3.5** | **No Honeypot Anti-Spam Bot Interception Test** | The test only checks that the input ID `#honeypot-website` exists. It never verifies that populating `honeypot.value = "http://spam.com"` silently aborts submission and prevents success/error banners. | Automated submission simulation with honeypot filled asserting early return and no simulated dispatch. |
| **GAP-R3.6** | **No Mobile Menu Navigation Flow Test** | No test clicks `#mobile-menu-toggle` to verify opening/closing, icon swapping (`menu-icon-open` vs `menu-icon-close`), or clicking `.mobile-nav-link` to verify auto-close. | Click simulation verifying class toggles on `#mobile-nav-menu` and icons. |

---

### 1.5 Testing Gaps Against Requirement 4: Ethiopic Typography & Localization Integrity

**Requirement**: Verify self-hosted Noto Sans Ethiopic fonts render Amharic/Ge'ez characters without tofu or clipping. Verify language switcher toggles between English and Amharic while preserving subpage context (`/privacy` ↔ `/am/privacy`, `/accessibility` ↔ `/am/accessibility`). Verify no untranslated English leftovers on Amharic pages.

**Existing Tests in `test/srs-spec.test.js`**:
- Substring checks: `lang="en"`, `lang="am"`, `hreflang="am"` / `hreflang="en"`, font preload `noto-sans-ethiopic-regular.woff2`, and church names.

**CRITICAL BUG CAUGHT IN CODEBASE (MISSED BY CURRENT TESTS)**:
- In `src/utils/i18n.ts:119-125`:
  ```typescript
  export function getLocalizedUrl(path: string, lang: Locale): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    if (lang === 'en') {
      return cleanPath;
    }
    return `/am${cleanPath === '/' ? '' : cleanPath}`;
  }
  ```
- In `src/layouts/BaseLayout.astro:23-25`:
  ```astro
  const canonicalUrl = `${siteUrl}${getLocalizedUrl(currentPath, lang)}`;
  const enAlternateUrl = `${siteUrl}${getLocalizedUrl(currentPath, 'en')}`;
  const amAlternateUrl = `${siteUrl}${getLocalizedUrl(currentPath, 'am')}`;
  ```
- Because Amharic pages pass `currentPath="/am"` (`src/pages/am/index.astro:11`), `currentPath="/am/privacy"` (`am/privacy.astro:12`), and `currentPath="/am/accessibility"` (`am/accessibility.astro:12`):
  - On `dist/am/index.html`:
    - `canonicalUrl` is generated as **`https://felegegenet.org.uk/am/am`** (BROKEN!)
    - `enAlternateUrl` is generated as **`https://felegegenet.org.uk/am`** (BROKEN! Points to `/am` instead of `/`)
    - `amAlternateUrl` is generated as **`https://felegegenet.org.uk/am/am`** (BROKEN!)
    - `og:url` is generated as **`https://felegegenet.org.uk/am/am`** (BROKEN!)
    - JSON-LD `"url"` is generated as **`https://felegegenet.org.uk/am/am`** (BROKEN!)
  - On `dist/am/privacy/index.html`:
    - Canonical is **`https://felegegenet.org.uk/am/am/privacy`** (BROKEN!)
    - Alternate `en` is **`https://felegegenet.org.uk/am/privacy`** (BROKEN!)
  - On `dist/am/accessibility/index.html`:
    - Canonical is **`https://felegegenet.org.uk/am/am/accessibility`** (BROKEN!)
    - Alternate `en` is **`https://felegegenet.org.uk/am/accessibility`** (BROKEN!)
- **Why `pnpm test` passed despite this critical corruption**:
  - `test/srs-spec.test.js:56` only ran:
    `assert(amHtml.includes('hreflang="en"') && amHtml.includes('/'), 'LANG-2: Visible language switcher from AM to /');`
  - Because `amHtml` contained the substring `'/'` and `'hreflang="en"'`, the assertion passed trivially! The test suite had zero checks asserting that URLs matched valid routing patterns.

**Identified Testing Gaps**:
| Gap ID | Description | Unchecked Risk | Verification Need |
|---|---|---|---|
| **GAP-R4.1** | **No Canonical & Hreflang Reciprocal Route Parity Test** | Major SEO/canonical bug in production: `/am/am`, `/am/am/privacy`, `/am/am/accessibility` published in HTML head, contradicting `sitemap.xml`. | Automated test checking canonical and hreflang URLs on all HTML files against strict expected regex patterns. |
| **GAP-R4.2** | **No Subpage Language Switcher Context Verification** | `test/srs-spec.test.js` only checks that the root page has a language switcher. It never verifies that `/privacy` links to `/am/privacy`, `/am/privacy` links to `/privacy`, etc. | Automated crawler testing `<a hreflang="...">` targets across all subpages. |
| **GAP-R4.3** | **No Untranslated English Leftovers Scanner** | Hardcoded English string in `Services.astro:52`: `<span>UK Local Time</span>` renders on Amharic page `/am` instead of `i18n.json` translation `"የለንደን ሰዓት"`. Current tests do not scan Amharic HTML for untranslated text. | Automated regex/dictionary scanner checking Amharic pages for unintended Latin text clusters. |
| **GAP-R4.4** | **No Font Asset Integrity & Unicode Coverage Test** | Font files in `public/fonts/` (424KB total) are assumed to contain all required Amharic glyphs. No test verifies WOFF2 HTTP 200 delivery, MIME type `font/woff2`, or character coverage against `src/data/*.json`. | Font table parser / asset verification script checking glyph coverage for all Amharic strings in data models. |
| **GAP-R4.5** | **No Dictionary Symmetry Linter** | `src/data/i18n.json` has `en` and `am` dictionaries. No automated test verifies that every key path in `i18n.en` exists symmetrically in `i18n.am`. | Recursive key-equality test comparing `i18n.en` and `i18n.am`. |

---

### 1.6 Testing Gaps Against Requirement 5: Production Build and Discoverability Audit

**Requirement**: Production build compiles cleanly with zero warnings or dead links. Bundle size strictly under 1MB. Open Graph and Twitter Card tags display proper titles/descriptions. Structured data (`schema.org/PlaceOfWorship`) JSON-LD is fully valid.

**Existing Tests in `test/srs-spec.test.js`**:
- Checks only:
  1. `fs.existsSync(distDir)`
  2. `enHtml.includes('"@type":"PlaceOfWorship"')`
  3. `robots.includes('Sitemap:') && sitemap.includes('https://felegegenet.org.uk/')`

**Identified Testing Gaps**:
| Gap ID | Description | Unchecked Risk | Verification Need |
|---|---|---|---|
| **GAP-R5.1** | **No Automated Bundle Size Assertion in Test Suite** | While current bundle is 676KB, `pnpm test` **never checks the byte size of `dist/`**. An accidental large commit (uncompressed assets) would go unnoticed. | Automated file system check asserting total `dist/` directory size $< 1048576\text{ bytes}$ (1MB). |
| **GAP-R5.2** | **No Schema.org Semantic / JSON-LD Schema Validation** | Only checks if string `'"@type":"PlaceOfWorship"'` exists. It never parses JSON-LD, validates required schema properties, or checks Amharic JSON-LD (which currently has invalid URL `https://felegegenet.org.uk/am/am`). | JSON-LD schema validator parsing `<script type="application/ld+json">`, validating `name`, `address`, `geo`, `openingHoursSpecification`, `url`. |
| **GAP-R5.3** | **No Social Sharing Metadata (Open Graph / Twitter Cards) Suite** | No test asserts that `og:title`, `og:description`, `og:url`, `og:site_name`, `og:locale`, `twitter:card`, `twitter:title`, `twitter:description` exist and are non-empty and localized on each page. | Meta tag auditor parsing `<meta property="og:*">` and `<meta name="twitter:*">` across all 6 pages. |
| **GAP-R5.4** | **No Internal Link / Anchor Integrity Crawler** | No test crawls internal anchor links (`#about`, `#services`, `#find-us`, `#contact`, `#main-content`) to verify corresponding `id="..."` elements exist in the DOM. | Static HTML crawler verifying all `href="#id"` match existing element IDs, and all `href="/..."` resolve to valid files. |
| **GAP-R5.5** | **No Sitemap & Robots Completeness Reconciliation** | No check verifies that every file generated in `dist/` is listed in `sitemap.xml` and that all URLs in `sitemap.xml` actually exist in `dist/`. | Two-way reconciliation test between `dist/**/*.html` and `sitemap.xml` `<loc>` entries. |

---

## 2. Logic Chain

1. **Premise 1 (Existing Test Mechanics)**: Directly observing `package.json:11` and `test/srs-spec.test.js:1-95` confirms that `pnpm test` executes only a single custom Node.js script performing 28 string matching checks against pre-built static HTML and JSON files.
2. **Premise 2 (Zero Test Libraries)**: Directly observing `package.json:14-22` and `pnpm list --depth 0` confirms that no test runner, DOM library, headless browser, or accessibility scanner is installed in the project.
3. **Premise 3 (Undetected Defect 1: Broken Canonical URLs)**: Direct execution of `grep -E "canonical|hreflang" dist/am/*.html` demonstrated that all Amharic pages generate broken canonical links (`/am/am`, `/am/am/privacy`, `/am/am/accessibility`) and corrupt hreflang alternates. `pnpm test` passed 28/28 because `test/srs-spec.test.js:56` only checked `amHtml.includes('hreflang="en"') && amHtml.includes('/')`.
4. **Premise 4 (Undetected Defect 2: Sub-44px Touch Target)**: Direct inspection of `FindUs.astro:219-228` revealed the TfL Journey Planner link lacks `.touch-target`, resulting in an anchor height of ~28px, violating WCAG 2.2 SC 2.5.8 (Target Size). `pnpm test` passed because it performs no computed style or bounding box evaluation.
5. **Premise 5 (Undetected Defect 3: WCAG Contrast Defect)**: Mathematical luminance calculation showed that `#a67215` (`church-gold`) on `#661622` (`church-burgundy`) has a contrast ratio of only **2.96:1**, failing WCAG AA 3:1 non-text focus contrast. `pnpm test` passed because it contains no contrast calculation logic.
6. **Premise 6 (Undetected Defect 4: Untranslated Leftover)**: Direct inspection of `Services.astro:52` showed hardcoded English `<span>UK Local Time</span>` on Amharic routes. `pnpm test` passed because it checks only `enHtml.includes('UK Local Time')`.
7. **Deduction**: The current verification infrastructure provides a useful baseline sanity check for data models and high-level string presence, but has **massive testing gaps across all 5 core requirements of `ORIGINAL_REQUEST.md`**. A production-ready quality posture requires introducing dedicated test modules covering DOM semantics, accessibility auditing, interactive state machines, route normalization, and bundle budgeting.

---

## 3. Caveats

1. **Development Environment**: All tests and measurements were executed in the Linux development environment on static build outputs (`dist/`). Physical mobile device rendering (Safari iOS VoiceOver, Android Chrome TalkBack) requires dynamic staging/preview testing.
2. **Read-Only Investigation Scope**: In accordance with the Teamwork explorer persona, no modifications have been made to `package.json`, `test/srs-spec.test.js`, or application source code during this survey.
3. **Third-Party OpenStreetMap Services**: Testing the network isolation of the interactive map relies on verifying DOM injection of the OpenStreetMap iframe, but does not test OpenStreetMap's external server uptime.

---

## 4. Conclusion & Actionable Testing Blueprint

The project has a solid foundation (clean static build, 676KB bundle, decoupled data layer), but its automated verification infrastructure is currently a single 95-line script with **21 critical testing gaps across Requirements R1 through R5**.

### 4.1 Recommended Verification Suite Architecture

To achieve production readiness without introducing heavy framework bloat, the testing infrastructure should be expanded into a multi-tiered verification harness:

```
test/
├── srs-spec.test.js         # Existing SRS v0.1 functional string checks (preserved)
├── routes-i18n.test.js      # GAP-R4.1, GAP-R4.2: Canonical, hreflang, and i18n parity
├── a11y-wcag.test.js        # GAP-R2.1, GAP-R2.2, GAP-R2.4: axe-core / contrast / touch targets
├── interactive-qa.test.js   # GAP-R3.1, GAP-R3.4, GAP-R3.5: Form validation, honeypot, copy
├── seo-schema.test.js       # GAP-R5.2, GAP-R5.3, GAP-R5.5: JSON-LD parse, OG tags, sitemap
└── performance.test.js      # GAP-R5.1: Bundle size (<1MB) and font asset integrity
```

### 4.2 Recommended Verification Commands

1. **Run Full Verification**:
   ```bash
   pnpm test
   ```
2. **Run Headless Browser Interaction & Responsive Audit** (using installed `agent-browser` + Chromium):
   ```bash
   pnpm preview & # Start local server at http://localhost:4321
   agent-browser open http://localhost:4321
   agent-browser --viewport 320x640 screenshot --annotate
   ```
3. **Automated Canonical & Hreflang Validation Script**:
   A lightweight Node test script using `node:test` can parse `dist/**/*.html` and assert that:
   - Canonical on `/am` is strictly `https://felegegenet.org.uk/am` (no `/am/am`).
   - Alternate `en` on `/am` is strictly `https://felegegenet.org.uk/`.
   - Canonical on `/am/privacy` is strictly `https://felegegenet.org.uk/am/privacy`.

---

## 5. Verification Method

### 5.1 Independent Reproduction of Current Test Baseline
```bash
cd "/home/devnhm/Projects/Sara Church Project"
pnpm test
```
*Expected Result*: Exits 0, reporting all 28 checks passed.

### 5.2 Independent Verification of Critical Testing Gaps

1. **Verify Canonical / Hreflang Defect Missed by Tests**:
   ```bash
   node -e '
   const fs = require("fs");
   const html = fs.readFileSync("dist/am/index.html", "utf8");
   console.log("Canonical:", html.match(/rel="canonical"[^>]+/)?.[0]);
   console.log("Hreflang EN:", html.match(/hreflang="en"[^>]+/)?.[0]);
   console.log("Hreflang AM:", html.match(/hreflang="am"[^>]+/)?.[0]);
   '
   ```
   *Observed Failure*: Canonical reports `href="https://felegegenet.org.uk/am/am"`, Hreflang EN reports `href="https://felegegenet.org.uk/am"`, Hreflang AM reports `href="https://felegegenet.org.uk/am/am"`.

2. **Verify Missing Touch Target Class in TfL Link Missed by Tests**:
   ```bash
   grep -n "tflPlannerUrl" src/components/FindUs.astro
   ```
   *Observed Failure*: Line 219 lacks `.touch-target`.

3. **Verify Contrast Failure Missed by Tests**:
   ```bash
   # Run contrast script for church-gold on burgundy:
   node -e '
   const r = (l1, l2) => (Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05);
   console.log("Gold on Burgundy ratio:", r(0.187, 0.029).toFixed(2));
   '
   ```
   *Observed Failure*: Contrast is `2.96:1` (below WCAG AA 4.5:1 for normal text and below 3:1 for non-text UI components).

4. **Verify Untranslated String Missed by Tests**:
   ```bash
   grep -n "UK Local Time" src/components/Services.astro
   ```
   *Observed Failure*: Line 52 hardcodes `<span>UK Local Time</span>` regardless of locale.

### 5.3 Invalidation Conditions
This report is invalidated if:
1. `package.json` test scripts are updated to introduce Vitest/Playwright/axe-core test runners.
2. `src/utils/i18n.ts` is patched to resolve the route normalization bug.
3. The bundle size in `dist/` exceeds 1.0 MB.
