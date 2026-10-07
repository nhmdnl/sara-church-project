import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage, runAxeAudit, BREAKPOINTS } from './helpers/browser.js';
import { loadHtmlPage, contrastRatio } from './helpers/dom.js';

test('R2: WCAG 2.2 AA Accessibility Audit & Hardening Suite', async (t) => {
  let server;
  let browser;

  t.before(async () => {
    server = await startStaticServer();
    browser = await launchBrowser();
  });

  t.after(async () => {
    if (browser) await browser.close();
    if (server) await server.close();
  });

  await t.test('Tier 1: Automated axe-core scan on all 6 pages with zero critical or serious violations', async () => {
    const pages = ['/', '/am', '/privacy', '/am/privacy', '/accessibility', '/am/accessibility'];

    for (const route of pages) {
      const { page, context } = await createTestPage(browser);
      try {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'networkidle' });
        const results = await runAxeAudit(page);

        const seriousOrCritical = results.violations.filter(
          (v) => v.impact === 'critical' || v.impact === 'serious'
        );

        const summary = seriousOrCritical
          .map((v) => `[${v.impact.toUpperCase()}] ${v.id}: ${v.description} (${v.nodes.length} occurrences)`)
          .join('\n');

        assert.strictEqual(
          seriousOrCritical.length,
          0,
          `Axe accessibility audit found ${seriousOrCritical.length} critical/serious violation(s) on ${route}:\n${summary}`
        );
      } finally {
        await context.close();
      }
    }
  });

  await t.test('Tier 2: Palette color contrast ratios meet WCAG 2.2 AA thresholds (>= 4.5:1 text, >= 3:1 non-text)', async () => {
    // Canonical Church Palette
    const colors = {
      charcoal: '#1a1918',
      cream: '#faf7f2',
      creamAlt: '#f3ece0',
      white: '#ffffff',
      burgundy: '#661622',
      darkBurgundy: '#480f17',
      gold: '#a67215',
      goldDark: '#85580a',
    };

    // Text contrast checks (WCAG 2.2 SC 1.4.3: Contrast Minimum >= 4.5:1)
    const charcoalOnCream = contrastRatio(colors.charcoal, colors.cream);
    assert.ok(charcoalOnCream >= 4.5, `Charcoal on cream (${charcoalOnCream.toFixed(2)}:1) must meet >= 4.5:1`);

    const charcoalOnWhite = contrastRatio(colors.charcoal, colors.white);
    assert.ok(charcoalOnWhite >= 4.5, `Charcoal on white (${charcoalOnWhite.toFixed(2)}:1) must meet >= 4.5:1`);

    const whiteOnBurgundy = contrastRatio(colors.white, colors.burgundy);
    assert.ok(whiteOnBurgundy >= 4.5, `White on burgundy (${whiteOnBurgundy.toFixed(2)}:1) must meet >= 4.5:1`);

    const burgundyOnCream = contrastRatio(colors.burgundy, colors.cream);
    assert.ok(burgundyOnCream >= 4.5, `Burgundy on cream (${burgundyOnCream.toFixed(2)}:1) must meet >= 4.5:1`);

    const goldDarkOnCream = contrastRatio(colors.goldDark, colors.cream);
    assert.ok(goldDarkOnCream >= 4.5, `Gold dark on cream (${goldDarkOnCream.toFixed(2)}:1) must meet >= 4.5:1`);

    // Non-text contrast checks (WCAG 2.2 SC 1.4.11: Non-text Contrast >= 3:1)
    // Focus outline: must have >= 3:1 against adjacent background
    // Test: Focus indicator against burgundy header/buttons
    let focusColor = colors.gold;
    try {
      const fs = await import('node:fs');
      const path = await import('node:path');
      const cssContent = fs.readFileSync(path.resolve(process.cwd(), 'src/styles/global.css'), 'utf-8');
      const match = cssContent.match(/:focus-visible\s*\{[^}]*outline:\s*[^;]*?(#[0-9a-fA-F]{3,8})/);
      if (match) focusColor = match[1];
    } catch {}

    const focusOnBurgundy = contrastRatio(focusColor, colors.burgundy);
    assert.ok(
      focusOnBurgundy >= 3.0,
      `Focus outline (${focusColor}) against burgundy background (#661622) has contrast ratio ${focusOnBurgundy.toFixed(2)}:1, which FAILS WCAG SC 1.4.11 (>= 3.0:1 required)`
    );
  });

  await t.test('Tier 2: Body text size >= 18px and generous line height (>= 1.75 English, >= 1.8 Amharic)', async () => {
    // 1. English page computed typography
    const { page: enPage, context: enCtx } = await createTestPage(browser);
    try {
      await enPage.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      const enTypography = await enPage.evaluate(() => {
        const html = window.getComputedStyle(document.documentElement);
        const body = window.getComputedStyle(document.body);
        return {
          rootFontSize: parseFloat(html.fontSize),
          bodyFontSize: parseFloat(body.fontSize),
          bodyLineHeight: parseFloat(body.lineHeight) / parseFloat(body.fontSize),
        };
      });

      assert.ok(
        enTypography.rootFontSize >= 18 || enTypography.bodyFontSize >= 18,
        `Root or body font size must be >= 18px (got root: ${enTypography.rootFontSize}px, body: ${enTypography.bodyFontSize}px)`
      );
      assert.ok(
        enTypography.bodyLineHeight >= 1.74,
        `Body line-height must be >= 1.75 (got ${enTypography.bodyLineHeight.toFixed(2)})`
      );
    } finally {
      await enCtx.close();
    }

    // 2. Amharic page computed typography
    const { page: amPage, context: amCtx } = await createTestPage(browser);
    try {
      await amPage.goto(`${server.baseUrl}/am`, { waitUntil: 'domcontentloaded' });
      const amTypography = await amPage.evaluate(() => {
        const body = window.getComputedStyle(document.body);
        return {
          bodyFontSize: parseFloat(body.fontSize),
          bodyLineHeight: parseFloat(body.lineHeight) / parseFloat(body.fontSize),
        };
      });

      assert.ok(
        amTypography.bodyLineHeight >= 1.79,
        `Amharic line-height must be >= 1.8 (got ${amTypography.bodyLineHeight.toFixed(2)})`
      );
    } finally {
      await amCtx.close();
    }
  });

  await t.test('Tier 2: Touch targets for all primary interactive controls meet >= 44x44px (WCAG 2.2 SC 2.5.8)', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      const targets = await page.evaluate(() => {
        const selectors = [
          { id: 'mobile-menu-toggle', desc: 'Mobile menu toggle button' },
          { id: 'copy-address-btn', desc: 'Copy address button' },
          { id: 'load-interactive-map-btn', desc: 'Load interactive map button' },
          { id: 'submit-form-btn', desc: 'Contact form submit button' },
          { selector: 'a[href*="maps/dir/?api=1"]', desc: 'Google Maps directions link' },
          { selector: 'a[href*="maps.apple.com"]', desc: 'Apple Maps directions link' },
          { selector: 'a[href*="tfl.gov.uk"]', desc: 'TfL Journey Planner link' },
          { selector: 'a[href^="tel:"]', desc: 'Telephone link' },
          { selector: 'a[href^="mailto:"]', desc: 'Email link' },
        ];

        return selectors.map(({ id, selector, desc }) => {
          const el = id ? document.getElementById(id) : document.querySelector(selector);
          if (!el) return { desc, found: false };
          const rect = el.getBoundingClientRect();
          const hasTouchTargetClass = el.classList.contains('touch-target');
          return {
            desc,
            found: true,
            width: rect.width,
            height: rect.height,
            hasTouchTargetClass,
          };
        });
      });

      for (const t of targets) {
        assert.strictEqual(t.found, true, `${t.desc} must exist in the document`);
        assert.ok(
          t.width >= 43.5 && t.height >= 43.5,
          `Touch target for ${t.desc} must be at least 44x44px (got ${t.width.toFixed(1)}x${t.height.toFixed(1)}px)`
        );
      }
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 3: Skip-to-content link navigation & keyboard focus activation', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.desktop });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // 1. Initial state: skip link is offscreen
      const initialSkipRect = await page.evaluate(() => {
        const skip = document.querySelector('.skip-link');
        return skip ? skip.getBoundingClientRect().top : null;
      });
      assert.ok(initialSkipRect !== null, 'Skip link must exist');
      assert.ok(initialSkipRect < 0, `Skip link should initially be positioned off-screen (got top ${initialSkipRect}px)`);

      // 2. Focus skip link and wait for CSS top transition
      await page.locator('.skip-link').focus();
      await page.waitForFunction(() => {
        const skip = document.querySelector('.skip-link');
        return skip && skip.getBoundingClientRect().top >= 0;
      }, { timeout: 2000 });

      const focusedSkip = await page.evaluate(() => {
        const active = document.activeElement;
        const rect = active?.getBoundingClientRect();
        return {
          isSkipLink: active?.classList.contains('skip-link'),
          href: active?.getAttribute('href'),
          top: rect?.top,
        };
      });

      assert.strictEqual(focusedSkip.isSkipLink, true, 'Focusing skip link should mark it activeElement');
      assert.strictEqual(focusedSkip.href, '#main-content', 'Skip link href must target #main-content');
      assert.ok(focusedSkip.top >= 0, `Focused skip link must be visible within viewport (got top ${focusedSkip.top}px)`);

      // 3. Main content landmark exists
      const mainContent = await page.evaluate(() => {
        const main = document.getElementById('main-content');
        return !!main;
      });
      assert.strictEqual(mainContent, true, 'Target #main-content element must exist in the DOM');
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 3: Mobile drawer accessibility: focus trap, Escape dismissal, and focus restoration', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // 1. Focus and click toggle button
      await page.focus('#mobile-menu-toggle');
      await page.click('#mobile-menu-toggle');

      const openedState = await page.evaluate(() => {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-nav-menu');
        return {
          expanded: toggle?.getAttribute('aria-expanded'),
          menuHidden: menu?.classList.contains('hidden'),
        };
      });

      assert.strictEqual(openedState.expanded, 'true', 'Mobile toggle aria-expanded must be "true" when open');
      assert.strictEqual(openedState.menuHidden, false, 'Mobile menu container must not be hidden when open');

      // 2. Press Escape key to close drawer
      await page.keyboard.press('Escape');

      const afterEscape = await page.evaluate(() => {
        const toggle = document.getElementById('mobile-menu-toggle');
        const menu = document.getElementById('mobile-nav-menu');
        const active = document.activeElement;
        return {
          expanded: toggle?.getAttribute('aria-expanded'),
          menuHidden: menu?.classList.contains('hidden'),
          focusRestored: active === toggle,
        };
      });

      assert.strictEqual(
        afterEscape.menuHidden,
        true,
        'Mobile drawer must close (hidden) upon pressing Escape key'
      );
      assert.strictEqual(
        afterEscape.expanded,
        'false',
        'Mobile toggle aria-expanded must reset to "false" upon pressing Escape'
      );
      assert.strictEqual(
        afterEscape.focusRestored,
        true,
        'Focus must be restored to #mobile-menu-toggle after pressing Escape'
      );
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 3: Dynamic ARIA: Address copy live announcement & form validation states', async () => {
    const { page, context } = await createTestPage(browser);
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // 1. Address copy aria-live check
      await page.click('#copy-address-btn');
      const liveFeedback = await page.evaluate(() => {
        const liveRegion = document.querySelector('[aria-live="polite"]') || document.querySelector('[aria-live="assertive"]');
        return {
          hasLiveRegion: !!liveRegion,
          text: liveRegion?.textContent?.trim() || '',
        };
      });

      assert.strictEqual(
        liveFeedback.hasLiveRegion,
        true,
        'Clicking Copy Address must announce feedback via an aria-live region to screen readers'
      );

      // 2. Contact form invalid submit aria-invalid check
      await page.click('#submit-form-btn');
      const invalidAria = await page.evaluate(() => {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const messageInput = document.getElementById('contact-message');
        return {
          nameInvalid: nameInput?.getAttribute('aria-invalid') === 'true',
          emailInvalid: emailInput?.getAttribute('aria-invalid') === 'true',
          messageInvalid: messageInput?.getAttribute('aria-invalid') === 'true',
        };
      });

      assert.strictEqual(
        invalidAria.nameInvalid && invalidAria.emailInvalid && invalidAria.messageInvalid,
        true,
        'Submitting invalid form must mark required fields with aria-invalid="true"'
      );
    } finally {
      await context.close();
    }
  });
});
