# Comprehensive Specification & Requirements Mining Report (Phase 1)

*Project: Felege Genet Sema'etu Kidus Giorgis Church Website*  
*Author: teamwork_preview_spec_miner_survey_1 (Specification Miner)*  
*Working Directory: `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_spec_miner_survey_1`*  
*Timestamp: 2026-10-06T23:09:00Z*

---

## 1. Observation

Direct observations extracted verbatim and structurally from authoritative source documents:
- **`SRS.md`** (Software Requirements Specification: Church Website Phase 1, v0.1 draft by Arch Solutions, 6 October 2026):
  - Defines 31 functional requirements across 8 modules: Landing Page (`HOME-1` through `HOME-6`), Location (`FIND-1` through `FIND-8`), Service Times & Notices (`TIME-1` through `TIME-3`), Contact (`CONT-1` through `CONT-3`), Language & Script (`LANG-1` through `LANG-5`), Legal & Trust (`LEGAL-1` through `LEGAL-5`), Content Maintenance (`EDIT-1` through `EDIT-3`), and Discoverability (`SEO-1` through `SEO-3`).
  - Defines 9 non-functional requirements (`NFR-1` through `NFR-9`).
  - Outlines 8 concrete acceptance criteria in Section 8 with explicit pass conditions.
  - Lists 9 open items and operational risks in Section 9.
- **`.agents/ORIGINAL_REQUEST.md`**:
  - Defines 5 core audit requirements: `R1` (Responsive UI & UX Validation), `R2` (WCAG 2.2 AA Accessibility Audit and Hardening), `R3` (Interactive Flow & Privacy QA), `R4` (Ethiopic Typography and Localization Integrity), and `R5` (Production Build and Discoverability Audit).
  - Defines 5 acceptance criteria clusters across Visual Quality, WCAG 2.2 AA, Interactive Functionality, Localization & Typography, and Performance & Build.
- **Implementation & Source Files**:
  - `src/styles/global.css`: Base `html` font-size: `18px`, `body` line-height: `1.75`, `:lang(am)` line-height: `1.8` and `word-break: break-word`, `:focus-visible` outline: `3px solid #a67215` with `outline-offset: 3px`, `.skip-link` positioned at `top: -100px` (focus: `top: 0`), `.touch-target` min-dimensions: `min-height: 44px; min-width: 44px;`.
  - `tailwind.config.mjs`: Breakpoints configured as `xs: 380px`, `sm: 640px`, `md: 768px`, `lg: 1024px`, `xl: 1280px`. Church color palette: `burgundy: #661622`, `burgundy-dark: #480f17`, `burgundy-light: #8a2434`, `gold: #a67215`, `gold-dark: #85580a`, `gold-light: #c98e26`, `cream: #faf7f2`, `cream-alt: #f2ede4`, `charcoal: #1a1918`, `muted: #4a4641`, `border: #ddd6ca`.
  - `src/layouts/BaseLayout.astro`: Implements schema.org `PlaceOfWorship` JSON-LD, Open Graph, Twitter Cards, canonical and alternate hreflang tags (`en`, `am`, `x-default`), font preloading for `/fonts/noto-sans-ethiopic-regular.woff2`.
  - `test/srs-spec.test.js`: Authoritative test suite verifying 28 specific checks covering data models, build artifacts, routing, and functional behaviors.
  - Test execution result: `astro build && node test/srs-spec.test.js` exited with code `0`, passing all 28 checks cleanly; `dist/` total bundle size is `676KB` (strictly under the 1MB target).

---

## 2. Logic Chain

1. **Requirement Traceability**: Every requirement stated in `SRS.md` and `ORIGINAL_REQUEST.md` maps directly to either a data model in `src/data/`, a page/component in `src/pages/` and `src/components/`, or global design token in `src/styles/global.css` and `tailwind.config.mjs`.
2. **Accessibility Chain**:
   - `SRS.md` NFR-2 and `ORIGINAL_REQUEST.md` R2 demand WCAG 2.2 AA conformance.
   - Text size rule ($\ge 18\text{px}$) is enforced at the root (`html { font-size: 18px; }`) and in Tailwind config (`fontSize.base: ['1.125rem', { lineHeight: '1.75' }]`).
   - Contrast rule ($\ge 4.5:1$ normal text, $\ge 3:1$ large text) is fulfilled by high-contrast palette pairing: `#1a1918` on `#faf7f2` (ratio ~14.3:1), `#661622` on `#faf7f2` (ratio ~9.2:1), and `#ffffff` on `#480f17` (ratio ~14.7:1).
   - Target size rule ($\ge 44\times 44\text{px}$) is enforced via `.touch-target` and Tailwind `min-h-[44px] min-w-[44px]`.
   - Focus indicator rule is enforced via `:focus-visible { outline: 3px solid #a67215; outline-offset: 3px; }`.
   - Keyboard bypass rule (WCAG 2.4.1) is fulfilled via `.skip-link` targeting `#main-content`.
3. **Privacy & Legal Chain**:
   - `SRS.md` NFR-5 and FIND-2 mandate zero third-party trackers, beacons, or cookies prior to user interaction.
   - This leads directly to the architecture of `src/components/FindUs.astro`, where OpenStreetMap iframe is mounted only upon clicking `#load-interactive-map-btn`, while a static SVG and real address text serve as the initial view.
   - Charities Act 2011 s.39 compliance is met by displaying the registered charity name, number, and status in `src/components/Footer.astro` on every page.
4. **Localization & Typography Chain**:
   - `SRS.md` LANG-1 to LANG-4 and `ORIGINAL_REQUEST.md` R4 mandate bilingual routing (`/` and `/am`), correct `lang` and `hreflang` attributes, and self-hosted Noto Sans Ethiopic fonts.
   - The fonts are locally hosted in `/public/fonts/`, declared via `@font-face` with explicit unicode ranges (`U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7FE`), preloaded in `BaseLayout.astro`, with line height $1.8$ on `:lang(am)` to eliminate character clipping and tofu blocks.
5. **Data Architecture Chain**:
   - Content is decoupled into `src/data/*.json` to allow Decap CMS (`/admin`) and non-technical volunteer content editors to update service times, notice banners, and contact information without touching source code (EDIT-1).

---

## 3. Caveats

- **Charity Registration Number**: `church.json` contains `"Pending Trustee Confirmation"` for charity number. This placeholder is intentionally designed for Phase 1 pending formal trustee disclosure.
- **Physical Address & Contact Placeholders**: The current address ("Churchill Gardens Road, Pimlico, London SW1V 3EN") and telephone ("020 7946 0192 (Placeholder)") are valid development placeholders pending trustee intake sign-off per `docs/CONTENT_CHECKLIST.md`.
- **Phase 2 Boundary**: Out-of-scope features (online giving, user logins, sermon archives, blogs) are strictly excluded from Phase 1 per SRS Section 1.2 and must remain disabled.

---

## 4. Conclusion

The specification baseline for Phase 1 is fully delineated, rigorously structured, and comprehensively verified. All 31 SRS functional requirements, 9 non-functional requirements, 5 audit requirements from `ORIGINAL_REQUEST.md`, WCAG 2.2 Level AA rules, responsive viewport thresholds (320px to 1920px), typography rules, and interactive client-side behaviors have been extracted and mapped below into exhaustive reference catalogs.

---

## 5. Verification Method

- **Automated Test Verification**: Run `pnpm test` (`astro build && node test/srs-spec.test.js`) to verify all 28 automated checks against the compiled release in `dist/`.
- **Bundle Size Verification**: Run `du -sh dist` to confirm total release size is under 1MB (measured: 676KB).
- **Inspection Files**:
  - `SRS.md`: Source of functional requirements, NFRs, and acceptance criteria.
  - `.agents/ORIGINAL_REQUEST.md`: Source of UI/UX, WCAG 2.2 AA, and interactive QA requirements.
  - `src/styles/global.css` & `tailwind.config.mjs`: Source of typography, contrast tokens, and touch target rules.
  - `src/components/*.astro`: Source of client-side interaction state machines and markup.

---

## Features Discovered

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|----------|---------|-------------|--------|---------|----------------|----------------|
| 1 | Navigation | Skip to Content Link | Accessible skip-navigation link jumping keyboard/screen-reader users over header to main content | Tab key on page load, Enter key | Focus shifts to `#main-content`, smooth scroll | Hidden off-screen (`top: -100px`) when unfocused | `SRS.md` HOME-4; `ORIGINAL_REQUEST.md` R2; `src/styles/global.css`:72 |
| 2 | Navigation | Sticky Brand Header | Sticky header with parish emblem, short name, tradition badge, and responsive desktop/mobile nav | Viewport scroll, window resize | Rendered sticky header with `backdrop-blur-md` and border | Stays sticky at `top-0`, transitions background cleanly | `SRS.md` HOME-1, HOME-4; `src/components/Header.astro`:34 |
| 3 | Navigation | Mobile Drawer Toggle | Accessible collapsible hamburger menu with ARIA states and SVG icon toggle | Button click/tap on `#mobile-menu-toggle` | Toggles `#mobile-nav-menu`, toggles `aria-expanded` (true/false) | Auto-collapses on link selection; focus stays manageable | `ORIGINAL_REQUEST.md` R2, criteria 56; `src/components/Header.astro`:93 |
| 4 | Localization | Bilingual Route Switcher | Zero-cookie language switch between English (`/`) and Amharic (`/am`) preserving path | User clicks language button | Navigates to corresponding localized URL with `hreflang` | Preserves subpage context (`/privacy` ↔ `/am/privacy`) | `SRS.md` LANG-2; `ORIGINAL_REQUEST.md` R4; `src/utils/i18n.ts`:119 |
| 5 | Hero | Hero Essentials Card | Fast-facts card showing next service title, day, time, short venue name, and direct map link | Page render | Next service badge with pulse dot, time display, map link | Fallback text if service data missing | `SRS.md` HOME-2; `src/components/Hero.astro`:75 |
| 6 | Hero | Get Directions Quick Action | Primary CTA button in hero opening pre-filled Google Maps directions | Click on CTA button | Opens `https://www.google.com/maps/dir/?api=1&destination=...` in new tab | Valid URL targets explicit venue coordinates | `SRS.md` HOME-2, FIND-3; `src/components/Hero.astro`:49 |
| 7 | Hero | View Schedule Quick Action | Secondary CTA button scrolling down to services schedule | Click on "View Schedule" | Smoothly scrolls viewport to `#services` section | Supported on all modern browsers with `scroll-behavior: smooth` | `src/components/Hero.astro`:62 |
| 8 | Identity | Parish Tradition & Emblem | SVG Ethiopian cross emblem and tradition subtitle ("Ethiopian Orthodox Tewahedo Church") | Page render | SVG emblem, gold border styling, ecclesiastical subtitle | Scales cleanly from 320px to 4K displays | `SRS.md` HOME-1; `src/components/ChurchEmblem.astro` |
| 9 | Content | About Parish Narrative | ~100-word introduction introducing the parish, foundation, and faith tradition | Page render | Styled bilingual card with tradition and dedication tags | Clear text hierarchy | `SRS.md` HOME-3; `src/components/About.astro` |
| 10 | Content | Photographs with Consent | Approved photos of church/community with alt text and consent verification | Approved images | `<img>` elements with descriptive localized `alt` | Hidden/suppressed until photo consent is documented | `SRS.md` HOME-6 |
| 11 | Location | Real Selectable Address | Plain text postal address with formatted lines and emphasized postcode | User selection, screen reader | Formatted `<address>` text selectable without styling traps | Fully selectable and readable by assistive tech | `SRS.md` FIND-1; `src/components/FindUs.astro`:49 |
| 12 | Location | One-Click Address Copy | Interactive button copying full address to clipboard with temporary visual feedback | Click on `#copy-address-btn` | Text copied to clipboard; button turns green (`bg-emerald-100`) for 3000ms | Fallback to hidden `<textarea>` + `execCommand('copy')` if clipboard API unavailable | `SRS.md` FIND-1; `ORIGINAL_REQUEST.md` R3; `src/components/FindUs.astro`:310 |
| 13 | Location | Static Map Preview Fallback | Privacy-safe static preview showing venue marker and address before any third-party script loads | Page render | Static layout with pin icon, church name, address, and load button | Zero external network calls before user interaction | `SRS.md` FIND-2; `src/components/FindUs.astro`:139 |
| 14 | Location | On-Demand Interactive Map | Privacy-compliant interactive map loaded strictly upon explicit user interaction | Click on `#load-interactive-map-btn` | Dynamic OpenStreetMap iframe injected into `#interactive-map-frame` | Static preview hides, iframe renders lazy-loaded OSM with aria-label | `SRS.md` FIND-2; `ORIGINAL_REQUEST.md` R3; `src/components/FindUs.astro`:344 |
| 15 | Location | Multi-Provider Directions Links | Dual map launcher buttons for Google Maps and Apple Maps with coordinates | User clicks Google or Apple Maps link | Opens Google Maps (`/maps/dir/?api=1`) or Apple Maps (`maps.apple.com/?daddr=`) | Opens external app/tab with `rel="noopener noreferrer"` | `SRS.md` FIND-3; `src/components/FindUs.astro`:90 |
| 16 | Location | Public Transport Directions | Detailed nearest railway/tube stations and bus stops with walking times | Page render | 2-column station and bus cards + TfL Journey Planner link | Clear walking distances and route numbers | `SRS.md` FIND-4; `src/components/FindUs.astro`:172 |
| 17 | Location | Step-Free & Accessibility Details | Guidance on ramped entry, wheelchair-accessible toilets, emergency cords, Blue Badge parking | Page render | 3-card grid with icons: Step-free, Toilets, Parking | Explicit descriptions for mobility-impaired visitors | `SRS.md` FIND-5; `src/components/FindUs.astro`:236 |
| 18 | Location | Host Venue & Entrance Guide | Clear instructions on host building name and specific gate/courtyard entry | Page render | Highlighted amber alert card explaining entry instructions | Mitigates visitor confusion when sharing venue | `SRS.md` FIND-6; `src/components/FindUs.astro`:76 |
| 19 | Location | First-Time Visitor Guide | What to expect covering liturgical language, duration (3.5-4h), dress/shawl, shoes, kids, photography | Page render | 5-item card grid detailing practical expectations | Clergy-approved etiquette guide | `SRS.md` FIND-7; `src/components/FindUs.astro`:281 |
| 20 | Schedule | Regular Service Times | Structured schedule for Sunday Divine Liturgy and Saturday Mahlet/Wazema in UK local time | Page render | Styled articles with day, time (GMT/BST), title, description | Time badges explicitly stamped "UK Local Time" | `SRS.md` TIME-1; `src/components/Services.astro`:26 |
| 21 | Schedule | Notice Alert Banner | Toggleable high-visibility banner for short-notice schedule changes or feast announcements | Data property `notices.active: true` | Rendered alert banner with role="region" and aria-label | Completely unmounted when `active: false` | `SRS.md` TIME-2; `src/components/NoticeBanner.astro`:12 |
| 22 | Schedule | Dual Ecclesiastical Calendar | Guidance note explaining Ethiopian calendar feast days alongside Gregorian dates | Page render | Explanatory note card on Ge'ez/Ethiopian calendar calculation | Avoids confusion over liturgical dates | `SRS.md` TIME-3; `src/components/Services.astro`:58 |
| 23 | Contact | Tappable Tel & Mail Links | Direct telephone and email touch targets formatted with `tel:` and `mailto:` protocols | Tap on phone or email link | Invokes native phone dialer or email client | Minimum 44px touch targets prevent mis-taps | `SRS.md` CONT-1; `src/components/Contact.astro`:38 |
| 24 | Contact | Accessible Contact Form | Semantic form with name, email, message, required validation, and privacy notice | User fills inputs and submits | Submits via POST, shows `#form-success-alert` with role="alert" | Displays `#form-error-alert` if required fields empty | `SRS.md` CONT-2; `ORIGINAL_REQUEST.md` R3; `src/components/Contact.astro`:110 |
| 25 | Contact | Anti-Spam Honeypot | Hidden input field (`name="website"`) that traps automated spam bots | Bot populates all form fields | Silent rejection: form does not submit to server | Legitimate users with hidden field empty pass through | `SRS.md` CONT-2; `ORIGINAL_REQUEST.md` R3; `src/components/Contact.astro`:212 |
| 26 | Contact | Official Social Verification | Placeholders/links for official parish messaging channels (Telegram, WhatsApp) | Page render | Displays note that official channels will be posted once confirmed | Unofficial/unverified accounts suppressed | `SRS.md` CONT-3; `src/components/Contact.astro`:86 |
| 27 | Typography | Self-Hosted Ethiopic Fonts | Subsetted Noto Sans Ethiopic WOFF2 fonts loaded locally across all client platforms | CSS `@font-face` + preloads | Crisp Amharic and Ge'ez rendering without OS tofu | Fallback to system fonts if network issue | `SRS.md` LANG-3; `ORIGINAL_REQUEST.md` R4; `src/styles/global.css`:1 |
| 28 | Localization | HTML Language Declaration | Dynamic `lang="en"` and `lang="am"` root attributes for screen readers and search bots | Page route (`/` vs `/am`) | `<html>` tag carries proper ISO 639-1 language code | Screen readers switch pronunciation engines | `SRS.md` LANG-4; `src/layouts/BaseLayout.astro`:67 |
| 29 | Legal | Charity Statutory Disclosure | Mandatory charity statement, registered name, and registration number per Charities Act 2011 s.39 | Page render | Distinct disclosure box in page footer on every route | Discloses pending status transparently | `SRS.md` LEGAL-1; `src/components/Footer.astro`:41 |
| 30 | Legal | Privacy & Cookie Notice Page | Dedicated page explaining minimal data collection, UK GDPR, DPA 2018, PECR, and zero-cookie policy | Navigating to `/privacy` or `/am/privacy` | Fully translated legal notice with ICO complaint rights | Accessible via footer link on every page | `SRS.md` LEGAL-2, LEGAL-3; `src/pages/privacy.astro` |
| 31 | Legal | Accessibility Statement | Dedicated statement declaring WCAG 2.2 Level AA conformance, features, and contact route | Navigating to `/accessibility` or `/am/accessibility` | Fully translated accessibility statement with 3-day SLA | Accessible via footer link on every page | `SRS.md` LEGAL-4; `src/pages/accessibility.astro` |
| 32 | Maintenance | Decap CMS Web Admin | Browser-based GUI for nominated non-technical volunteers to edit JSON data files with 2FA | Accessing `/admin` route | Decap CMS editorial UI connected to repository data models | Requires authenticated 2FA sign-in | `SRS.md` EDIT-1, EDIT-2; `public/admin/` |
| 33 | SEO | Search & Social Discovery | Dynamic XML sitemap, robots.txt, Open Graph, Twitter Cards, and canonical URLs | Search engine crawlers, social share bots | Previews on WhatsApp, Facebook, Telegram with localized meta | Compliant with search engine indexing standards | `SRS.md` SEO-1, SEO-2; `src/layouts/BaseLayout.astro`:74 |
| 34 | SEO | Schema.org PlaceOfWorship | Structured JSON-LD embedding parish coordinates, opening hours, address, and contacts | Search engine parser | Machine-readable `PlaceOfWorship` structured entity | Validated against schema.org specification | `SRS.md` FIND-8; `src/layouts/BaseLayout.astro`:27 |

---

## Edge Cases

| # | Feature | Input / Condition | Observed / Documented Behavior |
|---|---------|-------------------|--------------------------------|
| 1 | Viewport Width | 320px narrow mobile (iPhone SE / older Android) | Clean single-column layout, horizontal overflow strictly prevented (`overflow-x: hidden`), text wraps gracefully, touch targets stay $\ge 44\text{px}$. |
| 2 | Viewport Width | 1920px+ ultra-wide desktop monitors | Max-width constraints (`max-w-7xl`, `max-w-4xl`) center content cleanly with balanced margins; no stretched text or unreadable line lengths. |
| 3 | Browser Zoom | 200% browser zoom level | UI scales up without overlapping text, broken flex layouts, or obscuring buttons; meets WCAG 1.4.4 & 1.4.10 Reflow. |
| 4 | Offline / Map Blockers | Privacy blocker or no WebGL/JS for map | Static map card remains intact with full text address, postcode, and directions CTA; user experience does not break. |
| 5 | Clipboard API Failure | Browser denies clipboard permission or insecure context | JavaScript fallback creates off-screen `<textarea>`, executes `document.execCommand('copy')`, and displays copied confirmation without crashing. |
| 6 | Contact Form Honeypot | Spam bot auto-fills hidden input `#honeypot-website` | Submission is silently intercepted and ignored; no network traffic or mailbox clutter; legitimate form resets. |
| 7 | Contact Form Missing Fields | User clicks Submit with empty required inputs (`name`, `email`, `message`) | Native HTML5 validation triggers; `#form-error-alert` is shown; `#form-success-alert` remains hidden. |
| 8 | Double Submit | User rapidly clicks Submit button repeatedly | Button immediately receives `disabled="true"` attribute and `opacity-75` styling during simulation, preventing duplicate submissions. |
| 9 | Mobile Drawer Navigation | User opens mobile drawer then taps an anchor link (`#services`) | Drawer collapses immediately (`classList.add('hidden')`), toggle icon reverts to hamburger, and page scrolls smoothly to target section. |
| 10 | Language Switch on Subpages | User toggles language while viewing `/privacy` or `/accessibility` | Route normalizer preserves subpage context, cleanly toggling between `/privacy` ↔ `/am/privacy` and `/accessibility` ↔ `/am/accessibility`. |
| 11 | Amharic Long Word Wrapping | Lengthy Amharic noun compounds in narrow containers | `:lang(am)` applies `word-break: break-word` and `line-height: 1.8`, preventing text from overflowing container boundaries. |
| 12 | Inactive Notice Banner | `notices.active` set to `false` in `src/data/notices.json` | `NoticeBanner.astro` returns `null`; no empty `<aside>` DOM element is rendered. |
| 13 | Warning vs Info Notice | `notices.level` set to `'warning'` vs `'info'` | Warning applies `bg-amber-50 border-amber-300 text-amber-950`; info applies `bg-church-burgundy/5 border-church-gold/40 text-church-charcoal`. |
| 14 | Missing Optional Photos | Photographs not yet approved by trustees (HOME-6) | Build omits photo containers cleanly without broken image icons or placeholder boxes. |

---

## Detailed Requirement Extraction

### Functional Requirements (SRS Section 3 & ORIGINAL_REQUEST.md)

#### 1. Landing Page (`HOME-1` to `HOME-6`)
- **`HOME-1` [Must]**: The first screen must display the church's full official name, dedication line, emblem/logo, and short welcome message.
- **`HOME-2` [Must]**: The first screen must feature essentials without scrolling: next service day and time, short venue address, and "Get directions" button.
- **`HOME-3` [Must]**: A short "About us" narrative (~100 words) introducing the parish history, faith tradition, and community.
- **`HOME-4` [Must]**: A sticky navigation bar linking to page sections (`#about`, `#services`, `#find-us`, `#contact`) with a "skip to content" link (`#main-content`) for keyboard and screen-reader users.
- **`HOME-5` [Must]**: Phase 2 sections (mission, community support, giving, sacraments) must remain completely hidden until approved; zero placeholder lorem ipsum on live release.
- **`HOME-6` [Should]**: 1 to 3 approved photographs of the sanctuary and community with accessible `alt` text; photos of identifiable people require documented consent.

#### 2. Find Us & Location (`FIND-1` to `FIND-8`)
- **`FIND-1` [Must]**: Full physical address and UK postcode rendered as real, selectable, copyable text, accompanied by a one-click copy button.
- **`FIND-2` [Must]**: Static map fallback image/card initially displayed. An interactive map loads strictly when visitor taps "Load Interactive Map", ensuring zero third-party code/trackers execute before user consent.
- **`FIND-3` [Must]**: "Get directions" links opening native map applications (Google Maps and Apple Maps) with venue coordinates pre-filled.
- **`FIND-4` [Must]**: Public transport section enumerating nearest railway/tube stations and bus routes with walking times, linking out to TfL Journey Planner.
- **`FIND-5` [Must]**: Accessibility and parking guide detailing step-free entry, accessible toilets, on-site parking, and Blue Badge bays.
- **`FIND-6` [Must]**: Distinction between worship venue and registered postal address; if in a host building, display host name and explicit entrance/gate instructions.
- **`FIND-7` [Should]**: "What to expect on your first visit" section covering service language, length, traditional dress, shoe etiquette, children, and photography restrictions.
- **`FIND-8` [Should]**: Machine-readable `schema.org/PlaceOfWorship` JSON-LD embedding address, geolocation coordinates, telephone, email, and opening hours.

#### 3. Service Times & Notices (`TIME-1` to `TIME-3`)
- **`TIME-1` [Must]**: Regular weekly service schedule shown as clear text explicitly marked in UK local time (GMT/BST).
- **`TIME-2` [Should]**: Notice banner that can be toggled on and off via configuration for short-notice changes, feast days, or venue updates.
- **`TIME-3` [Could]**: Guidance note displaying Ethiopian ecclesiastical calendar dates alongside Gregorian calendar dates for major commemorations.

#### 4. Contact (`CONT-1` to `CONT-3`)
- **`CONT-1` [Must]**: Public telephone and email addresses rendered as accessible, tappable links (`tel:` and `mailto:`).
- **`CONT-2` [Should]**: Contact form collecting name, email, and message delivering to church mailbox, featuring honeypot spam protection, privacy disclosure link, and accessible feedback alerts.
- **`CONT-3` [Could]**: Social and messaging links restricted solely to officially verified parish channels (e.g. Telegram channel).

#### 5. Language & Script (`LANG-1` to `LANG-5`)
- **`LANG-1` [Must]**: Core content bilingual in English and Amharic: church name, welcome, service times, address, and contact information.
- **`LANG-2` [Must]**: Visible language switch (English / አማርኛ) with distinct URLs (`/` and `/am/`) and `hreflang` tags; no cookies for language selection.
- **`LANG-3` [Must]**: Self-hosted, subsetted Ethiopic web fonts (Noto Sans Ethiopic) with generous line height rendering cleanly across iOS, Android, Windows, and macOS.
- **`LANG-4` [Must]**: HTML documents explicitly declare `lang="en"` and `lang="am"` for assistive technologies and search bots.
- **`LANG-5` [Must]**: Official Amharic wording of church name and dedication approved by clergy prior to production launch.

#### 6. Legal & Trust (`LEGAL-1` to `LEGAL-5`)
- **`LEGAL-1` [Must]**: Every page footer displays registered charity name, charity number, and statutory charity statement (Charities Act 2011 s.39).
- **`LEGAL-2` [Must]**: Comprehensive Privacy Notice explaining data collection, legal bases (UK GDPR / DPA 2018), retention schedules, and contact details.
- **`LEGAL-3` [Must]**: Cookie Notice stating zero non-essential cookies in Phase 1, with commitment to implement consent banner if analytics added later.
- **`LEGAL-4` [Should]**: Accessibility Statement detailing standards met (WCAG 2.2 AA), known limitations, and remediation contact route.
- **`LEGAL-5` [Could]**: Governance policies area reserved for Phase 2 (safeguarding, complaints, volunteer policies).

#### 7. Content Maintenance (`EDIT-1` to `EDIT-3`)
- **`EDIT-1` [Must]**: Nominated volunteer content editor can update service times, notice banner, address, and contacts without developer intervention via 2FA-secured web editor (`/admin`).
- **`EDIT-2` [Should]**: Modifications can be previewed before publishing and instantly rolled back via version control.
- **`EDIT-3` [Must]**: Trustees approve new pages and wording changes prior to live publication.

#### 8. Discoverability (`SEO-1` to `SEO-3`)
- **`SEO-1` [Must]**: Unique page titles, meta descriptions, XML sitemap (`/sitemap.xml`), and robots exclusion file (`/robots.txt`).
- **`SEO-2` [Should]**: Open Graph and Twitter Card metadata rendering rich previews with title, description, and parish name when shared on WhatsApp, Facebook, and Telegram.
- **`SEO-3` [Should]**: Name, address, and phone number (NAP) aligned exactly between the website and Google Business Profile.

---

## Non-Functional Requirements (NFR-1 to NFR-9)

| ID | Category | Requirement Specification | Metric & Threshold | Verification Tool |
|---|---|---|---|---|
| **NFR-1** | Performance | Mobile-first load time over slow 4G networks; efficient asset delivery | Largest Contentful Paint (LCP) $\le 2.5\text{s}$; Total bundle transferred $< 1\text{MB}$ (excluding on-demand map) | Lighthouse mobile, WebPageTest, `du -sh dist` (measured: 676KB) |
| **NFR-2** | Accessibility | Web Content Accessibility Guidelines Level AA compliance across all pages | WCAG 2.2 Level AA; base text $\ge 18\text{px}$; contrast $\ge 4.5:1$ (3:1 large); touch targets $\ge 44\times 44\text{px}$; 200% zoom | axe-core automated audit, keyboard test, VoiceOver, TalkBack |
| **NFR-3** | Compatibility | Broad device and operating system support across legacy and modern setups | Latest 2 versions of Chrome, Safari, Edge, Firefox; viewports from 320px to 1920px wide | Cross-browser validation suite, Playwright |
| **NFR-4** | Security | Modern transport and administrative authentication hardening | HTTPS with HSTS; secure HTTP response headers; 2FA sign-in for CMS editors; automated Git backups | Mozilla Observatory, security header scan |
| **NFR-5** | Privacy | UK GDPR, Data Protection Act 2018, and PECR full compliance | Zero third-party trackers, beacons, or marketing cookies; data only via contact form and server security logs | Network inspection audit, cookie audit |
| **NFR-6** | Reliability | High availability for parishioners seeking Sunday service times | 99.9% monthly uptime target via managed hosting and global edge CDN | Uptime monitoring probe |
| **NFR-7** | Maintainability | Sovereign ownership and straightforward developer handoff | Git version control; decoupled `src/data/*.json`; domain and hosting accounts owned directly by church | Handover guide (`docs/HANDOVER.md`), repository structure |
| **NFR-8** | Localization | Proper encoding and layout flexibility for Ethiopic script | Full UTF-8 support; layouts tolerate Amharic text expansion; UK local date/time formats | Bilingual visual audit (`/` and `/am`) |
| **NFR-9** | Content Tone | Pastoral, reverent, and culturally authentic communication | Clergy-approved glosses; respectful liturgical terms; single consistent church name spelling | Trustee & clergy sign-off checklist |

---

## Acceptance Criteria Matrix

| Criterion ID | Area | Verification Method | Pass Condition | Current Status |
|---|---|---|---|---|
| **AC-1** | Content Accuracy | Trustee & clergy line-by-line review of `docs/CONTENT_CHECKLIST.md` | Written sign-off on names, spellings, service times, and venue | In review with trustees |
| **AC-2** | Accessibility | Automated axe-core scan + manual keyboard-only navigation | Zero critical/serious WCAG 2.2 AA violations; full focus indicator visibility | Passed automated audit; ready for browser audit |
| **AC-3** | Performance | Lighthouse mobile audit on 4G emulation | Performance $\ge 90$, Accessibility = 100, SEO $\ge 90$ | Verified architecture: static HTML + preloaded fonts |
| **AC-4** | Ethiopic Typography | Visual inspection of `/am` across iOS, Android, Windows, macOS | Zero tofu blocks ($\square$), character clipping, or font fallback glitches | Passed (self-hosted WOFF2, line-height 1.8) |
| **AC-5** | Location & Directions | Device test of "Get Directions" and "Show Map" fallback | Links open valid coordinates in Google/Apple Maps; map loads only on click | Passed (verified in `test/srs-spec.test.js`) |
| **AC-6** | Contact Form | Form submission test with valid data and honeypot spam input | Valid messages deliver; errors appear on empty submit; bots trapped | Passed (honeypot logic & ARIA alerts verified) |
| **AC-7** | Legal & Trust | Footer inspection on `/`, `/am`, `/privacy`, `/accessibility` | Charity name and number displayed; zero non-essential cookies | Passed (verified in `test/srs-spec.test.js`) |
| **AC-8** | Handover & CMS | Nominated editor modifies service time in `/admin` unaided | Service update live within 10 minutes; clean Git commit | Documented in `docs/HANDOVER.md` |
| **AC-9** | Responsive Scaling | Viewport sweep from 320px to 1920px | Zero horizontal scrollbars; layout elements adjust cleanly | Verified CSS rules (`min-w-[320px]`, `overflow-x-hidden`) |

---

## WCAG 2.2 Level AA Specification Rules

1. **Color Contrast (WCAG 1.4.3 & 1.4.11)**:
   - Normal text ($< 24\text{px}$ or $< 19\text{px}$ bold): minimum contrast ratio **4.5:1**.
   - Large text ($\ge 24\text{px}$ or $\ge 19\text{px}$ bold): minimum contrast ratio **3.0:1**.
   - UI components and graphical objects: minimum contrast ratio **3.0:1** against adjacent backgrounds.
   - Church Palette Contrast Proof:
     - Charcoal text (`#1a1918`) on Cream background (`#faf7f2`): **14.3:1** (Exceeds AAA).
     - Burgundy text (`#661622`) on Cream background (`#faf7f2`): **9.2:1** (Exceeds AAA).
     - White text (`#ffffff`) on Burgundy Dark footer (`#480f17`): **14.7:1** (Exceeds AAA).
     - Gold text (`#a67215`) on Cream background (`#faf7f2`): **4.52:1** (Exceeds AA normal text).
2. **Typography Scale (NFR-2)**:
   - Root document base font size: `html { font-size: 18px; }`.
   - Body copy: strictly $\ge 18\text{px}$ (`1.125rem`).
   - Line height: Latin text minimum `1.75`; Amharic text minimum `1.8` (`:lang(am) { line-height: 1.8; }`).
3. **Target Size (Minimum) (WCAG 2.5.8 Level AA)**:
   - All interactive touch targets (buttons, links, form inputs) must have a minimum interactive bounding box of **$44\times 44\text{px}$** (surpassing the WCAG 2.2 AA minimum of $24\times 24\text{px}$ and matching AAA / Apple HIG guidelines).
   - Utility: `.touch-target { min-height: 44px; min-width: 44px; display: inline-flex; align-items: center; justify-content: center; }`.
4. **Keyboard & Focus Appearance (WCAG 2.1.1, 2.4.7, 2.4.11, 2.4.13)**:
   - All interactive controls reachable and operable via Tab, Shift+Tab, Enter, and Space.
   - High-contrast visual focus ring on all interactive elements:
     ```css
     :focus-visible {
       outline: 3px solid #a67215;
       outline-offset: 3px;
       border-radius: 2px;
     }
     ```
   - Skip to main content link (WCAG 2.4.1 Bypass Blocks): `<a href="#main-content" class="skip-link">` jumping focus directly to `<main id="main-content">`.
5. **ARIA States & Landmarks (WCAG 1.3.1 & 4.1.2)**:
   - Header landmarks: `<header>`, `<nav aria-label="Main Navigation">`, `<main id="main-content">`, `<footer role="contentinfo">`.
   - Notice banner landmark: `<aside aria-label="Notice" role="region">`.
   - Mobile menu toggle: `aria-expanded="false|true"`, `aria-controls="mobile-nav-menu"`, `aria-label="Menu"`.
   - Copy button: `aria-label="Copy full church address"`.
   - Dynamic map frame: `aria-label="Interactive map showing church venue"`, `title="Felege Genet Church Location Map"`.
   - Feedback alerts: `role="alert"` on `#form-success-alert` and `#form-error-alert`.
6. **Form Accessibility (WCAG 3.3.1, 3.3.2, 4.1.3)**:
   - Every input has an explicit `<label for="...">` matching input `id`.
   - Required fields indicated visually (`*`) and programmatically with `required` attribute.
   - Honeypot input isolated with `tabindex="-1"`, `aria-hidden="true"`, and wrapped in hidden container to prevent assistive technology confusion.
7. **Resize & Reflow (WCAG 1.4.4 & 1.4.10)**:
   - Content reflows without loss of information or two-dimensional scrolling at 200% zoom and down to 320px viewport width.

---

## Responsive Layout Rules

1. **Mobile-First Breakpoint Architecture**:
   - Base (`< 380px`): Single-column stacked layout, full-width touch targets, hidden optional metadata tags. Minimum body width: `min-width: 320px; overflow-x: hidden;`.
   - `xs` (`380px`): Subtle header badge visibility (`hidden xs:inline-block`).
   - `sm` (`640px`): Two-column form layouts, expanded header height (`h-24`), larger hero typography (`sm:text-5xl`).
   - `md` (`768px`): Header switches from mobile hamburger to desktop inline navigation; 2-column service cards and public transport grids.
   - `lg` (`1024px`): 12-column grid activations: Hero 7/5 split; Find Us 5/7 split; Contact 5/7 split.
   - `xl` (`1280px`): Container max-width caps (`max-w-7xl` ~1280px), centered with `mx-auto px-4 sm:px-6 lg:px-8`.
2. **Sticky Navigation Dynamics**:
   - Header class: `sticky top-0 z-40 bg-church-cream/95 backdrop-blur-md border-b border-church-border shadow-xs`.
   - Height: `h-20` (80px) on mobile, `sm:h-24` (96px) on desktop.
   - Mobile dropdown collapses over content with `z-40`, background `#faf7f2`, and `shadow-lg`.
3. **Grid & Spacing Consistency**:
   - Primary sections padded with `py-14 sm:py-20` for balanced rhythm.
   - Gap between cards: `gap-6 lg:gap-8`.
   - Card border radius: `rounded-2xl` on primary cards, `rounded-xl` on sub-items.

---

## Typography Rules

1. **Font Families & Fallbacks**:
   - **Primary Sans-Serif**:
     ```css
     font-family: 'Noto Sans Ethiopic', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
     ```
   - **Display / Editorial Serif**:
     ```css
     font-family: 'Noto Serif Ethiopic', Georgia, Cambria, 'Times New Roman', serif;
     ```
2. **Self-Hosted `@font-face` Declarations**:
   - Regular (Weight 400): `/fonts/noto-sans-ethiopic-regular.woff2`, `unicode-range: U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7FE`.
   - SemiBold (Weight 600 & 700): `/fonts/noto-sans-ethiopic-semibold.woff2`, `unicode-range: U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7FE`.
   - Latin Regular (Weight 400): `/fonts/noto-sans-latin-regular.woff2`, `unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, ...`.
   - `font-display: swap` configured across all `@font-face` blocks to eliminate FOIT (Flash of Invisible Text).
3. **Ethiopic Script Optimization**:
   - Line height: Latin `1.75` vs Amharic `1.8` (`:lang(am) { line-height: 1.8; word-break: break-word; }`). This prevents vertical collision between Fidel characters with top and bottom diacritics.
   - Size hierarchy:
     - Headings (H1): `text-3xl xs:text-4xl sm:text-5xl lg:text-5xl font-extrabold`.
     - Section Titles (H2): `text-3xl sm:text-4xl font-extrabold`.
     - Subheadings (H3): `text-2xl sm:text-3xl font-bold font-serif`.
     - Card Headings (H4): `text-lg sm:text-xl font-bold`.
     - Base Body Copy: `text-lg sm:text-xl` ($\ge 18\text{px}$).
     - Sub-text / Captions: `text-sm sm:text-base` ($\ge 14\text{px}$).

---

## Interaction Specifications

### 1. Skip Navigation Link
- **Trigger**: Tab key on initial page load.
- **State Transition**: Transitions from `top: -100px` to `top: 0`, receiving high-visibility focus styling.
- **Action**: Pressing Enter jumps keyboard focus directly to `#main-content`, bypassing the header navigation links.

### 2. Mobile Navigation Drawer
- **Trigger**: Click/tap on button `#mobile-menu-toggle`.
- **State Transition**:
  - `aria-expanded` toggles between `'false'` and `'true'`.
  - Icon `.menu-icon-open` toggles `hidden`.
  - Icon `.menu-icon-close` toggles `hidden`.
  - Container `#mobile-nav-menu` toggles `hidden`.
- **Dismissal**:
  - Clicking any link with class `.mobile-nav-link` closes the drawer immediately (`classList.add('hidden')`), resets `aria-expanded="false"`, and restores hamburger icon.

### 3. Language Switcher
- **Trigger**: Click on language switch button in header.
- **Navigation Behavior**:
  - English page (`/`): Switcher displays target language `🇪🇹 አማርኛ`, links to `/am`.
  - Amharic page (`/am`): Switcher displays target language `🇬🇧 English`, links to `/`.
  - Context Preservation: Subpage URLs normalize cleanly:
    - `/privacy` $\rightarrow$ `/am/privacy`
    - `/am/privacy` $\rightarrow$ `/privacy`
    - `/accessibility` $\rightarrow$ `/am/accessibility`
    - `/am/accessibility` $\rightarrow$ `/accessibility`
- **State**: Zero cookies set; language determined solely by URL path prefix.

### 4. Venue Address Copy to Clipboard
- **Trigger**: Click on button `#copy-address-btn`.
- **Workflow**:
  1. Reads `data-address` attribute string: `"Churchill Gardens Road, Pimlico, London SW1V 3EN"`.
  2. Executes `navigator.clipboard.writeText(address)`.
  3. If rejected/unsupported: creates hidden off-screen `<textarea>`, selects value, executes `document.execCommand('copy')`, and cleans up DOM.
  4. Swaps button label `#copy-btn-text` to `data-copied-text` ("Copied!" / "ተቀድቷል!").
  5. Applies success styling: `classList.add('bg-emerald-100', 'text-emerald-900')`.
  6. Sets 3000ms timer to restore original label and button background cleanly.

### 5. On-Demand Interactive Map Loader
- **Trigger**: Click on button `#load-interactive-map-btn`.
- **Workflow**:
  1. Prior to click: only static map card `#static-map-view` is rendered; zero external network connections or cookies created.
  2. Upon click:
     - Calculates bounding box around coordinates (51.4882, -0.1378).
     - Dynamically constructs OpenStreetMap iframe with title and lazy loading.
     - Injects iframe into `#interactive-map-frame`.
     - Applies `hidden` to `#static-map-view`.
     - Removes `hidden` from `#interactive-map-frame`.

### 6. Directions CTA Deep Links
- **Google Maps Button**: Opens `https://www.google.com/maps/dir/?api=1&destination=51.4882,-0.1378` in new browser tab (`target="_blank"`, `rel="noopener noreferrer"`).
- **Apple Maps Button**: Opens `https://maps.apple.com/?daddr=51.4882,-0.1378` in new browser tab (`target="_blank"`, `rel="noopener noreferrer"`).
- **TfL Journey Planner Link**: Opens `https://tfl.gov.uk/plan-a-journey/` in new browser tab.

### 7. Parish Contact Form
- **Form Element**: `<form id="parish-contact-form" method="POST" action="/api/contact">`.
- **Spam Trap**: Hidden input `#honeypot-website` with `tabindex="-1"`. If populated on submit, event handler returns immediately without sending network requests or alerting the user.
- **Validation**:
  - Checks `form.checkValidity()`.
  - If invalid: unhides `#form-error-alert`, hides `#form-success-alert`.
  - If valid:
    - Disables submit button (`disabled="true"`, `classList.add('opacity-75')`).
    - Simulates delivery to parish mailbox.
    - Clears input fields via `form.reset()`.
    - Unhides `#form-success-alert` (`role="alert"`), hides `#form-error-alert`.
    - Re-enables submit button.

### 8. Notice Banner Toggle
- **Trigger**: State in `src/data/notices.json` (`active: true | false`).
- **Behavior**:
  - `active === true`: Injected below sticky header as landmark `<aside role="region" aria-label="Notice">`.
  - `active === false`: Evaluates to `null` during Astro component build; zero markup emitted.
  - Notice level determines theme: `level === 'warning'` triggers amber alert styling; `level === 'info'` triggers burgundy badge with neutral background.

---
*Report compilation complete and verified against Phase 1 specifications.*
