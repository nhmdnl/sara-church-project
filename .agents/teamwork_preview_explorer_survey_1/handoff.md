# Codebase Architecture & Requirements Mapping Report

**Agent**: Codebase Architecture Explorer (`teamwork_preview_explorer_survey_1`)  
**Repository**: `/home/devnhm/Projects/Sara Church Project`  
**Date**: 2026-10-07  
**Scope**: Exploration and mapping of components, architecture, styling, typography, accessibility, interactive logic, i18n routing, and production build metadata against R1–R5 requirements and SRS v0.1.

---

## 1. Observation

### 1.1 Architecture & Tech Stack Overview
- **Framework & Compiler**: Astro `v5.4.2` (`package.json:16`), configured with static output (`output: 'static'`, default) and `@astrojs/tailwind` `v6.0.2` integration (`astro.config.mjs:7`).
- **Styling**: Tailwind CSS `v3.4.17` (`package.json:17`) with custom configuration in `tailwind.config.mjs` defining custom breakpoints (`xs: 380px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`), ecclesiastical palette tokens (`church-burgundy: #661622`, `church-burgundy-dark: #480f17`, `church-gold: #a67215`, `church-gold-dark: #85580a`, `church-cream: #faf7f2`), and accessible typography scaling.
- **Content Separation Layer**: 100% decoupled JSON content layer located in `src/data/`:
  - `church.json` (Parish legal identity, dedication, charity status, phone, email, office hours)
  - `services.json` (Next service highlight, regular weekly services, monthly commemorations, calendar note)
  - `venue.json` (Sanctuary name, host building, physical address, coordinates, transit routes, step-free access, first-time visit guide)
  - `notices.json` (Top alert banner with active toggle, info/warning level, bilingual copy)
  - `i18n.json` (Bilingual UI dictionaries for English and Amharic)
- **Content Management**: Decap CMS `v3.0.0` configured in `public/admin/index.html` and `public/admin/config.yml` with Git Gateway and local backend fallback (`local_backend: true`), directly bound to the JSON files in `src/data/`.
- **Automated Verification**: Test suite in `test/srs-spec.test.js` executed via `pnpm test` (which triggers `astro build && node test/srs-spec.test.js`), passing 28/28 checks with exit code 0.
- **Production Build Artifacts**: The static release compiles into `dist/` with a total bundle size of **676 KB**, well under the 1.0 MB NFR-1 target:
  - `dist/fonts`: 424 KB (self-hosted WOFF2 fonts)
  - `dist/index.html`: 53 KB
  - `dist/am/index.html`: 55 KB
  - `dist/_astro/`: 28 KB (bundled CSS & JS)
  - `dist/privacy/`, `dist/am/privacy/`, `dist/accessibility/`, `dist/am/accessibility/`: ~20 KB each.

---

### 1.2 Component & Layout Inventory

| Component / File | Purpose & Responsibilities | Key Attributes & Dependencies |
|---|---|---|
| `src/layouts/BaseLayout.astro` | Root HTML shell, SEO head tags, Open Graph, Twitter cards, JSON-LD Schema, font preloading, skip link, Header/Footer injection. | `lang: Locale`, `title`, `description`, `currentPath`. Injects Schema.org `PlaceOfWorship`. |
| `src/components/Header.astro` | Sticky top navigation bar, parish emblem, desktop menu, mobile hamburger toggle, collapsible drawer, language switcher. | Uses `ChurchEmblem.astro`, `getLocalizedUrl`, `aria-expanded`, `aria-controls`. |
| `src/components/Hero.astro` | Landing hero section: tradition badge, church title, dedication line, welcome text, primary CTAs ("Get Directions", "View Service Times"), and "Quick Essentials" card (next service highlight and venue summary). | Direct deep-links to Google Maps directions (`directionsUrl`). |
| `src/components/NoticeBanner.astro` | Conditional top alert banner. Renders only if `notices.active === true`. Adapts styling for `info` vs `warning`. | `role="region"`, `aria-label={dict.notice.badge}`. |
| `src/components/About.astro` | Parish background narrative (~100–150 words), mission, community demographics, and dedication summary. | Section id `#about`. |
| `src/components/Services.astro` | Regular service schedule grid (Divine Liturgy, Saturday Vespers, monthly feasts of St. George and St. Mary) and Ethiopian calendar guidance note. | Section id `#services`. |
| `src/components/FindUs.astro` | Venue location details, selectable physical address, one-click copy address button, on-demand OpenStreetMap loader, public transport cards, step-free access details, and "What to Expect on Your First Visit" 5-topic accordion/grid. | Section id `#find-us`. Client script for clipboard copy and on-demand iframe creation. |
| `src/components/Contact.astro` | Direct contact channels (phone, email, hours), official social announcement status, and accessible contact form with anti-spam honeypot and client feedback loop. | Section id `#contact`. Form id `#parish-contact-form`, honeypot input `#honeypot-website`. |
| `src/components/Footer.astro` | UK charity disclosures (Charities Act 2011 s.39), legal registration note, quick links, privacy notice link, accessibility statement link, copyright. | Background `#480f17`, top gold border `#a67215`. |
| `src/components/ChurchEmblem.astro` | Reusable inline SVG of Ethiopian Orthodox processional cross (Lalibela-style decorative trefoil motif). | `viewBox="0 0 100 100"`, `aria-hidden="true"`, `focusable="false"`. |

---

### 1.3 Detailed Requirement Observations

#### R1. Responsive UI and UX Validation
- **Breakpoint Configuration**: `tailwind.config.mjs` defines `xs: 380px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`.
- **Mobile Container Padding**: Section containers use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
- **Narrow Viewport (320px) Header Behavior**:
  - In `Header.astro:51`, the subtitle text `{church.tradition}` has class `hidden xs:inline-block`. This prevents vertical blowup on viewports under 380px.
  - However, in `Header.astro:36-108`, on a 320px screen:
    - Available header width: 320px - 32px padding = 288px.
    - Brand logo + margin = 48px + 12px = 60px.
    - Right side mobile language switcher (`px-2.5 py-1 text-sm font-bold`) is ~60px.
    - Mobile menu button (`p-2`, 28px icon) is 44px.
    - Right-side cluster width = 60px + 8px gap + 44px = 112px.
    - Remaining space for brand text (`church.shortName`): 288px - 60px - 112px = 116px.
    - In Amharic (`"ፈለገ ገነት ቤተ ክርስቲያን"`) and English (`"Felege Genet Church"`), the title wraps into 2 lines. Because `leading-tight` is applied, it fits, but the right-side cluster in `Header.astro:83` (`<div class="flex items-center gap-2 md:hidden">`) lacks `shrink-0`. Without `shrink-0`, long brand names in non-standard fonts can compress the button hitboxes.
- **Public Transport TfL Link**:
  - In `FindUs.astro:219`: `<a href={venue.publicTransport.tflPlannerUrl} target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-2 text-church-burgundy font-bold text-base hover:underline">`
  - This anchor tag lacks the `.touch-target` class or `min-h-[44px]` container padding, rendering at approximately 28px height.

#### R2. WCAG 2.2 AA Accessibility Audit
- **Font Sizing**:
  - `src/styles/global.css:45`: `html { font-size: 18px; }`
  - `tailwind.config.mjs:50`: `base: ['1.125rem', { lineHeight: '1.75' }]`
  - Since `1rem` = 18px, `text-base` renders at `1.125 * 18px = 20.25px`. This exceeds the 18px minimum requirement (NFR-2).
- **Color Contrast Calculations**:
  - Background cream (`#faf7f2`) luminance: $0.931$
  - Text burgundy (`#661622`) vs cream (`#faf7f2`): **11.54:1** (WCAG AAA passes, $\ge 7:1$)
  - Text charcoal (`#1a1918`) vs cream (`#faf7f2`): **16.43:1** (WCAG AAA passes, $\ge 7:1$)
  - Text muted (`#4a4641`) vs cream (`#faf7f2`): **8.76:1** (WCAG AAA passes, $\ge 7:1$)
  - Accent gold-dark (`#85580a`) vs cream (`#faf7f2`): **5.78:1** (WCAG AA passes, $\ge 4.5:1$)
  - Accent gold-light (`#c98e26`) vs footer dark burgundy (`#480f17`): **5.44:1** (WCAG AA passes, $\ge 4.5:1$)
  - Focus ring gold (`#a67215`) vs cream (`#faf7f2`): **3.90:1** (Exceeds WCAG 2.2 non-text contrast requirement of $3.0:1$)
  - Success badge emerald-800 (`#065f46`) vs emerald-100 (`#d1fae5`): **6.78:1** (WCAG AA passes)
- **Skip Link**:
  - `src/styles/global.css:73-90`: `.skip-link` positioned at `top: -100px`, jumps to `top: 0` on focus with z-index 100, background `#661622`, text `#ffffff`. Verified working in `BaseLayout.astro:111`.
- **Keyboard Navigation & ARIA Defects**:
  1. **Mobile Navigation Drawer** (`Header.astro:131-158`):
     - Sets `aria-expanded` and toggles `.hidden` on `#mobile-nav-menu`.
     - **Missing Keyboard Escape Listener**: Pressing `Escape` does not dismiss the drawer.
     - **Missing Focus Trap**: Tabbing while the drawer is open bleeds focus into the background `#main-content`.
     - **Missing Focus Restoration**: When closed by clicking a link or pressing toggle, focus is not programmatically restored to `#mobile-menu-toggle`.
  2. **Address Copy Button** (`FindUs.astro:59-73`, `310-342`):
     - Button updates visual text from `"Copy Address"` to `"Address Copied!"`.
     - **Missing Screen Reader Announcement**: The button has a static `aria-label={dict.findUs.copyAddress}` that does not update dynamically, and there is no associated `aria-live="polite"` status region. Screen reader users receive zero confirmation that the clipboard write succeeded.
  3. **On-Demand Map Container** (`FindUs.astro:137-168`, `344-367`):
     - When `#load-interactive-map-btn` is clicked, `#static-map-view` is hidden and the `iframe` is injected into `#interactive-map-frame`.
     - **Missing ARIA State**: The button lacks `aria-expanded` or `aria-controls="interactive-map-frame"`, and the container lacks an `aria-live` announcement confirming that the map has rendered.
  4. **Contact Form Validation** (`Contact.astro:110-240`):
     - Form uses standard HTML5 `required` attributes and `<label for="...">`.
     - However, the error banner (`#form-error-alert`) is generic, and individual inputs do not receive `aria-invalid="true"` or `aria-describedby` when submission fails client-side.

#### R3. Interactive Flow & Privacy QA
- **Privacy-Preserving Map Loading**:
  - `FindUs.astro:137-168`: The page renders an SVG fallback (`#static-map-view`) on initial load.
  - Zero external tracking scripts, map tiles, or cookies are fetched during initial page load.
  - The OpenStreetMap iframe (`https://www.openstreetmap.org/export/embed.html...`) is constructed and appended via DOM manipulation **only** inside the click handler of `#load-interactive-map-btn`.
- **Address Clipboard Copy**:
  - `FindUs.astro:315-341`: Attempts `navigator.clipboard.writeText(address)` within a `try/catch` block.
  - Fallback creates a temporary `<textarea>` element, performs `document.execCommand('copy')`, and cleans up the DOM.
- **Anti-Spam Honeypot**:
  - `Contact.astro:113-116`: `<div class="hidden" aria-hidden="true"><input type="text" id="honeypot-website" name="website" tabindex="-1" autocomplete="off" /></div>`
  - In `Contact.astro:212-216`, if `honeypot` contains any characters, form submission is discarded silently without sending requests or displaying misleading errors.

#### R4. Ethiopic Typography and Localization Integrity
- **Self-Hosted Font Integration**:
  - `public/fonts/noto-sans-ethiopic-regular.woff2` (198 KB)
  - `public/fonts/noto-sans-ethiopic-semibold.woff2` (198 KB)
  - `public/fonts/noto-sans-latin-regular.woff2` (31 KB)
  - Defined in `src/styles/global.css:1-36` with explicit `unicode-range` covering Ge'ez and Ethiopic blocks (`U+1200-1399`, `U+2D80-2DDE`, `U+AB01-AB2E`).
  - Font preloaded in `BaseLayout.astro:81-87`:
    `<link rel="preload" href="/fonts/noto-sans-ethiopic-regular.woff2" as="font" type="font/woff2" crossorigin="anonymous" />`
- **Amharic CSS Legibility**:
  - `src/styles/global.css:59-62`: `:lang(am) { line-height: 1.8; word-break: break-word; }`
- **Localization Inconsistencies**:
  1. **Hardcoded English String in Service Table** (`Services.astro:52`):
     ```astro
     52: <span>UK Local Time</span>
     ```
     This string is hardcoded in English across both English (`/`) and Amharic (`/am`) versions of the page. `src/data/i18n.json:141` already contains the localized Amharic string `"tableTime": "የለንደን ሰዓት"`, but `Services.astro` does not reference it.
  2. **Heuristic Locale Detection via String Content** (`FindUs.astro:248, 260, 272`):
     ```astro
     248: {dict.findUs.accessTitle.includes('ተደራሽነት') ? 'ደረጃ የሌለው መግቢያ' : 'Step-free Access'}
     ```
     The code checks if the translated section title includes Amharic characters rather than checking `lang === 'am'`.

---

### 1.4 CRITICAL DEFECT: Malformed Canonical and Alternate Hreflang URLs on Amharic Routes

In `src/utils/i18n.ts:119-125`:
```typescript
export function getLocalizedUrl(path: string, lang: Locale): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') {
    return cleanPath;
  }
  return `/am${cleanPath === '/' ? '' : cleanPath}`;
}
```

In `src/layouts/BaseLayout.astro:23-25`:
```astro
const canonicalUrl = `${siteUrl}${getLocalizedUrl(currentPath, lang)}`;
const enAlternateUrl = `${siteUrl}${getLocalizedUrl(currentPath, 'en')}`;
const amAlternateUrl = `${siteUrl}${getLocalizedUrl(currentPath, 'am')}`;
```

In Amharic pages (`src/pages/am/index.astro:11`, `src/pages/am/privacy.astro:12`, `src/pages/am/accessibility.astro:12`):
```astro
// am/index.astro
<BaseLayout lang="am" currentPath="/am">

// am/privacy.astro
<BaseLayout lang="am" currentPath="/am/privacy">

// am/accessibility.astro
<BaseLayout lang="am" currentPath="/am/accessibility">
```

#### Verbatim Output in Generated Build Files (`dist/`):
- In `dist/am/index.html`:
  ```html
  <link rel="canonical" href="https://felegegenet.org.uk/am/am">
  <link rel="alternate" hreflang="en" href="https://felegegenet.org.uk/am">
  <link rel="alternate" hreflang="am" href="https://felegegenet.org.uk/am/am">
  <link rel="alternate" hreflang="x-default" href="https://felegegenet.org.uk/am">
  <meta property="og:url" content="https://felegegenet.org.uk/am/am">
  "url": "https://felegegenet.org.uk/am/am"
  ```
- In `dist/am/privacy/index.html`:
  ```html
  <link rel="canonical" href="https://felegegenet.org.uk/am/am/privacy">
  <link rel="alternate" hreflang="en" href="https://felegegenet.org.uk/am/privacy">
  <link rel="alternate" hreflang="am" href="https://felegegenet.org.uk/am/am/privacy">
  <meta property="og:url" content="https://felegegenet.org.uk/am/am/privacy">
  ```
- In `dist/am/accessibility/index.html`:
  ```html
  <link rel="canonical" href="https://felegegenet.org.uk/am/am/accessibility">
  <link rel="alternate" hreflang="en" href="https://felegegenet.org.uk/am/accessibility">
  <link rel="alternate" hreflang="am" href="https://felegegenet.org.uk/am/am/accessibility">
  <meta property="og:url" content="https://felegegenet.org.uk/am/am/accessibility">
  ```

---

## 2. Logic Chain

1. **Premise 1 (SEO & Canonical Compliance)**: Web standards and search crawlers require that `<link rel="canonical">` points to the exact, resolvable URL representing the canonical version of the page, and `<link rel="alternate" hreflang="...">` points to reciprocal, valid language variants.
2. **Premise 2 (Sitemap Specification)**: `src/pages/sitemap.xml.ts` publishes canonical URLs as `https://felegegenet.org.uk/am`, `https://felegegenet.org.uk/am/privacy`, and `https://felegegenet.org.uk/am/accessibility`.
3. **Premise 3 (Observed Generation)**: Because `getLocalizedUrl` unconditionally prepends `/am` when `lang === 'am'`, without stripping any existing `/am` prefix from `cleanPath`:
   - Input `/am` produces `/am/am`.
   - Input `/am/privacy` produces `/am/am/privacy`.
   - Input `/am/accessibility` produces `/am/am/accessibility`.
   - Furthermore, when calculating `enAlternateUrl`, passing `/am` or `/am/privacy` with `lang === 'en'` returns `/am` and `/am/privacy` rather than `/` and `/privacy`.
4. **Deduction 1**: Search engines crawling the Amharic pages will receive canonical directives pointing to non-existent URLs (`/am/am/*`), producing indexation dropouts, canonical conflicts with `sitemap.xml`, and broken hreflang clusters.
5. **Deduction 2**: This defect was partially masked during development because `Header.astro:19-22` implemented a local patch:
   ```astro
   let cleanPath = currentPath;
   if (lang === 'am' && cleanPath.startsWith('/am')) {
     cleanPath = cleanPath.slice(3) || '/';
   }
   const switchUrl = getLocalizedUrl(cleanPath, targetLang);
   ```
   This fixed the header language switcher button, but left `BaseLayout.astro` (which constructs canonical, hreflang, OG, and JSON-LD URLs) vulnerable.
6. **Premise 4 (WCAG 2.2 AA Criteria for Dynamic States)**: Under WCAG 2.2 AA (SC 4.1.2 Name, Role, Value and SC 4.1.3 Status Messages), state changes initiated by user actions (such as copying an address, opening a modal drawer, or triggering on-demand content) must be programmatically exposed to assistive technology through appropriate ARIA roles, states, or live regions.
7. **Deduction 3**: The current implementations of the mobile drawer, address copy button, and on-demand map fail SC 4.1.2 and SC 4.1.3 due to absent live regions, lack of focus traps, and unannounced DOM updates.

---

## 3. Caveats

1. **Development Environment**: Investigation was performed in development mode on static build output (`dist/`). Real-device behavior on physical iOS (Mobile Safari) and Android (Chrome) screen readers (VoiceOver, TalkBack) should be verified during dynamic preview testing.
2. **Third-Party OpenStreetMap Availability**: While the on-demand map loader prevents third-party cookies prior to user click, the loaded iframe relies on OpenStreetMap's public embed service (`openstreetmap.org`), which is subject to external rate-limiting or network policies.
3. **Clergy / Trustee Placeholders**: As documented in `docs/CONTENT_CHECKLIST.md`, charity registration number (`"Pending Trustee Confirmation"`), public phone number (`"020 7946 0192 (Placeholder)"`), and host venue details remain subject to formal sign-off by parish trustees prior to public launch.

---

## 4. Conclusion & Actionable Proposals

The codebase architecture is cleanly designed, highly modular, adheres strictly to decoupled JSON content management, passes all 28 automated SRS checks, and maintains an exceptionally lean bundle size (676 KB).

However, **two categories of issues require immediate remediation** before production deployment:

### High Priority Fix 1: Route Normalization in `src/utils/i18n.ts`
Fix `getLocalizedUrl` to strip `/am` prefix universally before constructing target routes.

```typescript
// Proposed src/utils/i18n.ts
export function getLocalizedUrl(path: string, lang: Locale): string {
  let cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (cleanPath === '/am' || cleanPath.startsWith('/am/')) {
    cleanPath = cleanPath.slice(3) || '/';
  }
  if (lang === 'en') {
    return cleanPath;
  }
  return `/am${cleanPath === '/' ? '' : cleanPath}`;
}
```
*Impact*: Instantly resolves all canonical, hreflang, OpenGraph, Twitter, and Schema.org URL corruptions across all Amharic pages.

### Medium Priority Fix 2: Accessibility & ARIA Hardening
1. **Mobile Drawer (`src/components/Header.astro`)**:
   - Add `Escape` key event listener to close the menu.
   - Restore focus to `#mobile-menu-toggle` when closing.
   - Implement focus trapping within `#mobile-nav-menu` while open.
2. **Copy Address Feedback (`src/components/FindUs.astro`)**:
   - Add an `aria-live="polite"` container or visually hidden status span (e.g. `<span class="sr-only" role="status" id="copy-status"></span>`) that announces `"Address copied to clipboard"` upon click.
   - Dynamically toggle `aria-label` on `#copy-address-btn`.
3. **Map Container (`src/components/FindUs.astro`)**:
   - Add `aria-expanded="false"` to `#load-interactive-map-btn` and toggle to `"true"` on load.
   - Add an `aria-live="polite"` region informing assistive technology that the interactive map has loaded.
4. **Localization of Service Time Note (`src/components/Services.astro:52`)**:
   - Replace hardcoded `<span>UK Local Time</span>` with `<span>{dict.services.tableTime}</span>`.
5. **Touch Target for TfL Journey Planner (`src/components/FindUs.astro:219`)**:
   - Add `touch-target` class to the TfL anchor tag to guarantee $\ge 44 \times 44\text{px}$ touch boundary.

---

## 5. Verification Method

### 5.1 Automated Command Verification
Execute the project test suite and inspect build artifacts:
```bash
cd "/home/devnhm/Projects/Sara Church Project"
pnpm test
```

### 5.2 Independent Inspection of Fixed Artifacts
After applying the `getLocalizedUrl` normalization fix, re-run `pnpm build` and verify:
```bash
# Verify no double /am/am appears in canonical or alternate hreflang tags:
grep -E "canonical|hreflang|og:url" dist/am/index.html
grep -E "canonical|hreflang|og:url" dist/am/privacy/index.html
grep -E "canonical|hreflang|og:url" dist/am/accessibility/index.html
```

**Expected Pass Criteria**:
- `dist/am/index.html`: `href="https://felegegenet.org.uk/am"` (canonical), `hreflang="en" href="https://felegegenet.org.uk/"`, `hreflang="am" href="https://felegegenet.org.uk/am"`.
- `dist/am/privacy/index.html`: `href="https://felegegenet.org.uk/am/privacy"` (canonical), `hreflang="en" href="https://felegegenet.org.uk/privacy"`.
- `dist/am/accessibility/index.html`: `href="https://felegegenet.org.uk/am/accessibility"` (canonical), `hreflang="en" href="https://felegegenet.org.uk/accessibility"`.

### 5.3 Invalidation Conditions
This report is invalidated if:
1. `src/utils/i18n.ts` is restructured to use a different i18n routing strategy (e.g. prefixDefaultLocale: true).
2. The site domain in `astro.config.mjs` changes from `https://felegegenet.org.uk`.
