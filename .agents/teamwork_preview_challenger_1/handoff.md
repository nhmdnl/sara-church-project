# Handoff Report — Challenger 1 (Layout Adversarial Challenger)

**Author**: Challenger 1 (Layout Adversarial Challenger)  
**Date**: 2026-10-07  
**Working Directory**: `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_1`  
**Verdict**: **REQUEST_CHANGES**  

---

## 1. Observation

Direct empirical observations gathered by executing `pnpm build` and `node --test test/challenger-layout-stress.test.js`:

### A. Viewport Matrix Results (320px–1920px across all 6 routes)
- Executed 42 viewport-route combinations: 7 viewports (`320px`, `360px`, `375px`, `768px`, `1024px`, `1440px`, `1920px`) across 6 routes (`/`, `/am`, `/privacy`, `/am/privacy`, `/accessibility`, `/am/accessibility`).
- **Result**: `Matrix: No horizontal overflow across all 7 viewports and 6 routes` — **PASSED** (0 failures).
- `scrollWidth <= innerWidth` held true for all routes at 100% zoom.
- 47-character compound unspaced Amharic word wrapping test at 320px — **PASSED** (`word-break: break-word` active).
- Mobile menu drawer opening & touch target minimums ($\ge 44 \times 44\text{px}$) at 320px — **PASSED**.

### B. Defect 1: Sticky Header Obstructs Section Headings on Anchor Navigation
- **Tool Command**: `node --test test/challenger-layout-stress.test.js`
- **Verbatim Error Output**:
  ```
  ✖ Sticky Header: Preserves visibility and does not obstruct anchor targets (485.028329ms)
    AssertionError [ERR_ASSERTION]: Sticky header anchor obstruction detected:
    [320px] Section #services heading is obstructed by sticky header! Heading top (63px) is below header bottom (91px) by 28px
    [320px] Section #find-us heading is obstructed by sticky header! Heading top (63px) is below header bottom (91px) by 28px
    [320px] Section #contact heading is obstructed by sticky header! Heading top (63px) is below header bottom (91px) by 28px
    [1024px] Section #services heading is obstructed by sticky header! Heading top (90px) is below header bottom (109px) by 19px
    [1024px] Section #find-us heading is obstructed by sticky header! Heading top (90px) is below header bottom (109px) by 19px
    [1024px] Section #contact heading is obstructed by sticky header! Heading top (90px) is below header bottom (109px) by 19px
  ```
- **File Locations**:
  - `src/components/Header.astro:34` (`sticky top-0 z-40 bg-church-cream/95 ... h-20 sm:h-24`)
  - `src/components/Services.astro:13` (`<section id="services" class="py-14 sm:py-20 ...">`)
  - `src/components/FindUs.astro:13` (`<section id="find-us" class="py-14 sm:py-20 ...">`)
  - `src/components/Contact.astro:14` (`<section id="contact" class="py-14 sm:py-20 ...">`)
  - `src/components/About.astro:14` (`<section id="about" class="py-14 sm:py-20 ...">`)

### C. Defect 2: Tailwind Utility Classes Override Ethiopic Line-Height Standards
- **Tool Command**: `node --test test/challenger-layout-stress.test.js`
- **Verbatim Error Output**:
  ```
  ✖ Typography: Computed line heights on Amharic pages meet Ethiopic standards (664.836474ms)
    AssertionError [ERR_ASSERTION]: Amharic line-height standards check failed:
    [/am] Low line-height detected on Amharic elements: [
      {"tag":"p","textSample":"ለእመቤታችን ቅድስት ድንግል ማርያም እና ለሰማዕ","fontSize":13.5,"lineHeight":18,"ratio":1.33},
      {"tag":"p","textSample":"Churchill Gardens Road, Pimlic","fontSize":15.75,"lineHeight":22.5,"ratio":1.43},
      {"tag":"li","textSample":"ፒምሊኮ ባቡር ጣቢያ (ቪክቶሪያ መስመር) የ8 ደ","fontSize":15.75,"lineHeight":22.5,"ratio":1.43},
      {"tag":"li","textSample":"ቪክቶሪያ ባቡር ጣቢያ የ14 ደቂቃ የእግር መንገ","fontSize":15.75,"lineHeight":22.5,"ratio":1.43},
      {"tag":"p","textSample":"የ3 ደቂቃ የእግር መንገድ","fontSize":13.5,"lineHeight":18,"ratio":1.33},
      {"tag":"p","textSample":"እሑድ፡ 7:00 – 14:00 | ቅዳሜ፡ 16:00","fontSize":13.5,"lineHeight":18,"ratio":1.33},
      {"tag":"p","textSample":"ለአጠቃላይ ጥያቄዎች እና መንፈሳዊ አገልግሎቶች","fontSize":13.5,"lineHeight":18,"ratio":1.33},
      {"tag":"p","textSample":"የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተ ክርስቲያን፣ ","fontSize":13.5,"lineHeight":18,"ratio":1.33},
      {"tag":"p","textSample":"Registered Charity Name: Feleg","fontSize":13.5,"lineHeight":18,"ratio":1.33}
    ]
    [/am/privacy] Low line-height detected on Amharic elements: ... ratio: 1.33 and 1.43
    [/am/accessibility] Low line-height detected on Amharic elements: ... ratio: 1.33 and 1.43
  ```
- **File Locations**:
  - `src/styles/global.css:59-62`:
    ```css
    :lang(am) {
      line-height: 1.8;
      word-break: break-word;
    }
    ```
  - `src/components/Services.astro:48-55` (uses `text-sm`, `text-xs`)
  - `src/components/FindUs.astro:82, 107` (uses `text-sm`, `text-xs`, `leading-tight`)
  - `src/components/Footer.astro:44-55` (uses `text-xs`)

### D. Defect 3: 200% Text Resizing (WCAG 1.4.4) Causes 584px Horizontal Overflow on Mobile
- **Tool Command**: `node --test test/challenger-layout-stress.test.js`
- **Verbatim Error Output**:
  ```
  ✖ Reflow: 200% root font scaling without horizontal overflow or header collision (258.009415ms)
    AssertionError [ERR_ASSERTION]: 200% font scaling caused horizontal overflow: 584px > 360px.
    Culprits: [
      {"tag":"div","id":"","class":"flex items-center gap-2 md:hidden shrink","right":584,"excess":224},
      {"tag":"button","id":"mobile-menu-toggle","class":"touch-target p-2 text-church-burgundy ho","right":584,"excess":224},
      {"tag":"svg","id":"","class":"[object SVGAnimatedString]","right":566,"excess":206},
      {"tag":"path","id":"","class":"[object SVGAnimatedString]","right":555,"excess":195},
      {"tag":"div","id":"","class":"space-y-1","right":539,"excess":179}
    ]
  ```
- **File Locations**:
  - `src/components/Header.astro:36, 82` (`<div class="flex items-center justify-between h-20 sm:h-24">` and `<div class="flex items-center gap-2 md:hidden shrink-0">`)
  - `src/components/Contact.astro:39, 45, 62, 68` (`<div class="flex items-start gap-4 ...">` text container lacks `min-w-0`)

---

## 2. Logic Chain

1. **Premise 1 (Sticky Header Obstruction)**:
   - When a user navigates to an anchor (e.g. clicking `#services` in the navigation menu or arriving at `https://felegegenet.org.uk/#services`), browsers scroll the targeted `<section id="services">` to the viewport top (`y = 0`).
   - The `<header>` element is sticky (`position: sticky; top: 0`) with a rendered height of 91px on mobile (320px) and 109px on desktop (1024px).
   - Because `<section id="services">` has `py-14` (padding-top: $3.5 \times 18\text{px} = 63\text{px}$), the section's `<h2>` heading sits at $y = 63\text{px}$.
   - The sticky header extends down to $y = 91\text{px}$, directly obscuring the top 28px of the section's title text on mobile, and 19px on desktop.
   - None of the sections define `scroll-margin-top` (Tailwind `scroll-mt-*`), leaving anchor destinations obstructed.

2. **Premise 2 (Ethiopic Line-Height Collapse)**:
   - Ethiopic (Amharic) characters feature intricate diacritics and vowel modifiers both above and below consonants. The Phase 1 SRS (R4) and `AGENTS.md` explicitly mandate generous line height ($\ge 1.75$ / $1.80$) to avoid character overlap and clipping.
   - `src/styles/global.css` declares `:lang(am) { line-height: 1.8; }`.
   - However, in CSS specificity and the Tailwind utility cascade, classes directly applied to HTML elements (such as `text-sm`, `text-xs`) apply both `font-size` AND `line-height` (e.g., `text-sm` sets `line-height: 1.25rem`, ratio 1.43; `text-xs` sets `line-height: 1rem`, ratio 1.33).
   - These inline utility declarations override the inherited `:lang(am)` line height, causing over 17 text elements on Amharic pages to render at ratios between 1.33 and 1.43.

3. **Premise 3 (WCAG 1.4.4 Text Zoom Overflow)**:
   - WCAG 2.2 AA SC 1.4.4 requires that text can be resized up to 200% without assistive technology and without loss of content or functionality (no horizontal overflow or text clipping).
   - When root font size is increased to 200% (from 18px to 36px) on mobile viewports (320px–360px), `Header.astro`'s brand container and mobile control cluster (`shrink-0` with language switcher and menu button) cannot wrap and blow out horizontally to **584px** on a 360px screen.
   - Contact cards in `Contact.astro` similarly lack `min-w-0` on their flex items, causing large text to force the flex container beyond the screen boundary.

---

## 3. Caveats

- **Normal 100% Zoom Viewport Responsiveness**: All 42 combinations of standard viewports (320px, 360px, 375px, 768px, 1024px, 1440px, 1920px) across all 6 pages passed with zero horizontal scroll or overflow under 100% zoom. The previously reported email string overflow at 320px (`DEFECT-R1.1`) has been confirmed resolved.
- **Word Wrapping**: Amharic compound text wrapping is robust under normal font sizes; 47-character compound words wrap properly without blowing out the layout.
- **Touch Targets**: All interactive controls on 320px mobile satisfy the $44 \times 44\text{px}$ minimum size.
- **Zoom Scope**: This review evaluated zoom through both CSS viewport equivalents (WCAG 1.4.10) and root font scaling (WCAG 1.4.4). Full browser physical zoom (Ctrl + '+') operates similarly to combined viewport shrinking and text scaling.

---

## 4. Conclusion & Recommended Mitigations

**Final Verdict**: **REQUEST_CHANGES**

Three concrete, reproducible layout defects must be resolved before production approval:

### 1. Fix Sticky Header Anchor Obstruction (High Priority)
- **Fix**: In `src/components/About.astro`, `Services.astro`, `FindUs.astro`, and `Contact.astro`, add `scroll-mt-24 sm:scroll-mt-28` to the root `<section>` element.
  ```html
  <section id="services" class="scroll-mt-24 sm:scroll-mt-28 py-14 sm:py-20 bg-church-cream border-b border-church-border">
  ```

### 2. Fix Ethiopic Line-Height Collapse (High Priority)
- **Fix**: In `src/styles/global.css`, enforce un-collapsed line heights for Ethiopic text elements by adding:
  ```css
  :lang(am) p,
  :lang(am) li,
  :lang(am) address,
  :lang(am) dd,
  :lang(am) dt,
  :lang(am) td {
    line-height: 1.8 !important;
  }
  ```
  This ensures Tailwind utility classes (`text-sm`, `text-xs`) cannot reduce Amharic line height below 1.8.

### 3. Fix 200% Text Scaling Header & Contact Overflow (Medium Priority)
- **Fix in `src/components/Header.astro`**:
  - Add `min-w-0` to the brand link container.
  - In the mobile cluster, change `flex items-center gap-2 md:hidden shrink-0` to allow brand title truncation or graceful wrapping if text size expands past 300px.
- **Fix in `src/components/Contact.astro`**:
  - Add `min-w-0 flex-1` to the inner `.space-y-1` text container on lines 45 and 68.

---

## 5. Verification Method

To independently verify these findings:

1. **Run the Layout Stress Test Suite**:
   ```bash
   node --test test/challenger-layout-stress.test.js
   ```
2. **Inspect the Test Results**:
   - Verify that Suite 1 (`Matrix: No horizontal overflow`) passes across all 42 combinations.
   - Verify that the 3 specific failing tests report the exact stack traces and coordinate deltas documented in Section 1.
3. **Invalidation Condition**:
   - The verdict changes to **APPROVE** when all 9 tests in `test/challenger-layout-stress.test.js` exit with code 0 (`pass 9`, `fail 0`).
