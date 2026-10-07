# Original User Request

## 2026-10-06T23:01:00Z

Conduct comprehensive UI and UX testing, visual accessibility verification (WCAG 2.2 AA), cross-device responsive validation, and production deployment readiness for the Felege Genet Sema'etu Kidus Giorgis Church website.

Working directory: /home/devnhm/Projects/Sara Church Project
Integrity mode: development

## Verification Resources
The repository contains an automated specification check suite in `test/srs-spec.test.js` executable via `pnpm test`, verifying 28 core requirements from the Phase 1 SRS.

## Requirements

### R1. Responsive UI and UX Validation
Thoroughly validate and polish the user interface across mobile (320px, 375px), tablet (768px), and desktop (1024px, 1440px) viewports in both English (`/`) and Amharic (`/am`). Ensure all layout components (sticky navigation, hero essentials, schedule table, transport cards, and footer) render cleanly without horizontal overflow, awkward wrapping, or layout shifts.

### R2. WCAG 2.2 AA Accessibility Audit and Hardening
Audit and guarantee full compliance with Web Content Accessibility Guidelines (WCAG 2.2 Level AA). Verify that:
- Text-to-background contrast ratios equal or exceed 4.5:1 (3:1 for large text).
- Base body text remains at least 18px with generous line height for legibility.
- Touch targets for all interactive controls (links, buttons, form inputs) are at least 44×44px.
- Full keyboard navigation is supported with high-visibility focus indicators and working skip-to-content links.
- ARIA states (`aria-expanded`, `aria-label`, landmarks) correctly reflect dynamic states on the mobile drawer, address copy button, and on-demand map container.

### R3. Interactive Flow & Privacy QA
Verify that all interactive client-side behaviors function flawlessly without runtime errors or privacy violations:
- "Copy Address" copies the complete venue string to the clipboard with clear visual feedback.
- "Load Interactive Map" loads an interactive map only upon explicit user click, without third-party trackers or cookies loading before user consent.
- "Get Directions" links open maps apps with valid coordinates.
- Contact form validates required fields, catches bot spam via the honeypot without blocking real users, and renders appropriate accessible feedback messages.

### R4. Ethiopic Typography and Localization Integrity
Verify that self-hosted Noto Sans Ethiopic fonts render all Amharic and Ge'ez characters correctly without tofu blocks, character clipping, or font fallback glitches across operating systems. Verify that language switching seamlessly toggles between English and Amharic paths while preserving subpage context (`/privacy` ↔ `/am/privacy`, `/accessibility` ↔ `/am/accessibility`).

### R5. Production Build and Discoverability Audit
Ensure the production static build compiles cleanly with zero warnings or dead links. Confirm that the total production bundle size remains under 1MB, Open Graph and Twitter Card tags display proper titles/descriptions for social sharing, and structured data (`schema.org/PlaceOfWorship`) is fully valid.

## Acceptance Criteria

### Visual & Layout Quality
- [ ] No horizontal scrolling or content clipping occurs on viewports from 320px to 1920px.
- [ ] Sticky header transitions smoothly and collapses appropriately on mobile without obstructing page content.
- [ ] Text hierarchy is clear, readable, and visually balanced for all age groups.

### Accessibility Standards (WCAG 2.2 AA)
- [ ] Zero critical or serious accessibility violations detected in automated axe-core audits.
- [ ] All interactive elements are reachable via Tab key with visible focus rings.
- [ ] Skip-to-content link jumps focus directly to `#main-content`.
- [ ] Form inputs have associated `<label>` elements and announce validation errors accessibly.

### Interactive Functionality
- [ ] Address copy button successfully writes to navigator clipboard with temporary confirmation message.
- [ ] Interactive map container initializes on demand without loading external tracker cookies beforehand.
- [ ] Contact form validates inputs and displays clear success feedback.
- [ ] Mobile navigation drawer opens, closes, and traps/restores focus properly.

### Localization & Typography
- [ ] English and Amharic pages display respective localized strings without untranslated leftovers.
- [ ] Noto Sans Ethiopic WOFF2 font loads locally with proper line height (`1.75+`).
- [ ] Language switcher toggles cleanly between corresponding English and Amharic URLs.

### Performance & Build Verification
- [ ] `pnpm build` and `pnpm test` pass with zero errors.
- [ ] Total transferred bundle size is strictly below 1MB.
- [ ] Schema.org JSON-LD validates against schema validator specifications.
