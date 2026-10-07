import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage, BREAKPOINTS } from './helpers/browser.js';

test('R1: Responsive UI & UX Validation Suite', async (t) => {
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

  await t.test('Tier 1: No horizontal overflow across all 5 viewports in English (/) and Amharic (/am)', async () => {
    const routes = ['/', '/am'];
    const viewports = Object.entries(BREAKPOINTS);

    for (const route of routes) {
      for (const [key, vp] of viewports) {
        const { page, context } = await createTestPage(browser, { viewport: vp });
        try {
          await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
          const overflow = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const winWidth = window.innerWidth;
            return {
              docWidth,
              winWidth,
              hasOverflow: docWidth > winWidth,
            };
          });

          assert.strictEqual(
            overflow.hasOverflow,
            false,
            `Horizontal overflow detected on ${route} at ${vp.name}: scrollWidth (${overflow.docWidth}px) > innerWidth (${overflow.winWidth}px)`
          );
        } finally {
          await context.close();
        }
      }
    }
  });

  await t.test('Tier 1: Sticky header is sticky and visible across viewports', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      const headerPos = await page.evaluate(() => {
        const header = document.querySelector('header');
        if (!header) return null;
        const style = window.getComputedStyle(header);
        return {
          position: style.position,
          top: style.top,
          height: header.getBoundingClientRect().height,
        };
      });

      assert.ok(headerPos, 'Header element must exist');
      assert.strictEqual(headerPos.position, 'sticky', 'Header position must be sticky');
      assert.strictEqual(headerPos.top, '0px', 'Header top must be 0px');
      assert.ok(headerPos.height > 40, `Header height must be reasonable (got ${headerPos.height}px)`);

      // Scroll down and verify header remains visible at top: 0
      await page.evaluate(() => window.scrollTo(0, 600));
      const scrolledHeaderRect = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header ? header.getBoundingClientRect().top : null;
      });
      assert.strictEqual(scrolledHeaderRect, 0, 'Header must remain at top of viewport when scrolled');
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 2: Narrow mobile (320px) header collision & hitbox test', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobileSmall });
    try {
      // Test both EN and AM at 320px
      for (const route of ['/', '/am']) {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });

        const headerMetrics = await page.evaluate(() => {
          const toggle = document.getElementById('mobile-menu-toggle');
          const mobileCluster = toggle?.parentElement;
          const langSwitch = mobileCluster?.querySelector('a[hreflang]');
          if (!toggle || !langSwitch) return null;

          const toggleRect = toggle.getBoundingClientRect();
          const langRect = langSwitch.getBoundingClientRect();

          return {
            toggleWidth: toggleRect.width,
            toggleHeight: toggleRect.height,
            toggleRight: toggleRect.right,
            toggleLeft: toggleRect.left,
            langWidth: langRect.width,
            langHeight: langRect.height,
            langRight: langRect.right,
            langLeft: langRect.left,
            viewportWidth: window.innerWidth,
            // Check for overlap:
            isOverlapping: !(toggleRect.right <= langRect.left || langRect.right <= toggleRect.left),
          };
        });

        assert.ok(headerMetrics, `Header elements must exist on ${route} at 320px`);
        assert.ok(headerMetrics.toggleWidth >= 30, `Mobile toggle button width (${headerMetrics.toggleWidth}px) should not collapse at 320px on ${route}`);
        assert.ok(headerMetrics.langWidth >= 30, `Language switcher width (${headerMetrics.langWidth}px) should not collapse at 320px on ${route}`);
        assert.ok(headerMetrics.toggleRight <= headerMetrics.viewportWidth + 2, `Toggle button must not extend past right edge of 320px viewport on ${route}`);
        assert.strictEqual(headerMetrics.isOverlapping, false, `Mobile toggle and language switch must not overlap on ${route} at 320px`);
      }
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 2: Navigation controls toggle correctly at mobile (<768px) vs desktop (>=768px)', async () => {
    // 1. Mobile (375px)
    const { page: mobilePage, context: mobileCtx } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
    try {
      await mobilePage.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      const mobileStates = await mobilePage.evaluate(() => {
        const toggle = document.getElementById('mobile-menu-toggle');
        const desktopNav = document.querySelector('nav[aria-label="Main Navigation"]');
        const isVisible = (el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
        };
        return {
          toggleVisible: isVisible(toggle),
          desktopNavHidden: !isVisible(desktopNav),
        };
      });
      assert.strictEqual(mobileStates.toggleVisible, true, 'Mobile menu toggle should be visible on 375px mobile');
      assert.strictEqual(mobileStates.desktopNavHidden, true, 'Desktop nav should be hidden on 375px mobile');
    } finally {
      await mobileCtx.close();
    }

    // 2. Desktop (1024px)
    const { page: deskPage, context: deskCtx } = await createTestPage(browser, { viewport: BREAKPOINTS.desktop });
    try {
      await deskPage.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      const deskStates = await deskPage.evaluate(() => {
        const toggle = document.getElementById('mobile-menu-toggle');
        const desktopNav = document.querySelector('nav[aria-label="Main Navigation"]');
        const isVisible = (el) => {
          if (!el) return false;
          const rect = el.getBoundingClientRect();
          return rect.width > 0 && rect.height > 0 && window.getComputedStyle(el).visibility !== 'hidden';
        };
        return {
          toggleHidden: !isVisible(toggle),
          desktopNavVisible: isVisible(desktopNav),
        };
      });
      assert.strictEqual(deskStates.toggleHidden, true, 'Mobile menu toggle should be hidden on 1024px desktop');
      assert.strictEqual(deskStates.desktopNavVisible, true, 'Desktop nav should be visible on 1024px desktop');
    } finally {
      await deskCtx.close();
    }
  });

  await t.test('Tier 3: Grid and card components collapse to single column on mobile viewports', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Verify services cards do not render side-by-side on mobile
      const servicesStacked = await page.evaluate(() => {
        const cards = document.querySelectorAll('#services .rounded-2xl.border');
        if (cards.length < 2) return true;
        const rect1 = cards[0].getBoundingClientRect();
        const rect2 = cards[1].getBoundingClientRect();
        // Stacked vertically means card 2 top is below card 1 top
        return Math.abs(rect1.left - rect2.left) < 10 && rect2.top >= rect1.bottom - 10;
      });

      assert.strictEqual(servicesStacked, true, 'Services cards should stack vertically on mobile viewport');
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 4: Subpages (privacy & accessibility) render without overflow at 320px and 1440px', async () => {
    const subpages = ['/privacy', '/am/privacy', '/accessibility', '/am/accessibility'];
    for (const sub of subpages) {
      for (const vp of [BREAKPOINTS.mobileSmall, BREAKPOINTS.wideDesktop]) {
        const { page, context } = await createTestPage(browser, { viewport: vp });
        try {
          await page.goto(`${server.baseUrl}${sub}`, { waitUntil: 'domcontentloaded' });
          const hasOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
          assert.strictEqual(hasOverflow, false, `Subpage ${sub} must not have overflow at ${vp.name}`);
        } finally {
          await context.close();
        }
      }
    }
  });
});
