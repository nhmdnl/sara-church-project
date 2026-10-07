import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage } from './helpers/browser.js';

// Challenger 1: Adversarial Viewport Matrix
const ADVERSARIAL_VIEWPORTS = [
  { width: 320, height: 568, name: '320px (Mobile Min / iPhone SE 1st gen)' },
  { width: 360, height: 640, name: '360px (Compact Android / Samsung Galaxy / Moto G)' },
  { width: 375, height: 667, name: '375px (Mobile Standard / iPhone 6/7/8/SE2/X)' },
  { width: 768, height: 1024, name: '768px (Tablet Portrait / iPad Breakpoint)' },
  { width: 1024, height: 768, name: '1024px (Desktop Standard / iPad Pro landscape)' },
  { width: 1440, height: 900, name: '1440px (Wide Desktop / Laptop)' },
  { width: 1920, height: 1080, name: '1920px (Full HD 1080p Desktop)' },
];

const ALL_ROUTES = [
  '/',
  '/am',
  '/privacy',
  '/am/privacy',
  '/accessibility',
  '/am/accessibility',
];

test('Challenger 1: Layout Adversarial Stress Testing Suite', async (t) => {
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

  // =========================================================================
  // SUITE 1: Extreme Viewport Boundary Matrix (7 Viewports × 6 Routes = 42 cases)
  // =========================================================================
  await t.test('Matrix: No horizontal overflow across all 7 viewports and 6 routes', async () => {
    const failures = [];

    for (const route of ALL_ROUTES) {
      for (const vp of ADVERSARIAL_VIEWPORTS) {
        const { page, context } = await createTestPage(browser, { viewport: vp });
        try {
          await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });

          const metrics = await page.evaluate(() => {
            const docWidth = document.documentElement.scrollWidth;
            const bodyWidth = document.body.scrollWidth;
            const winWidth = window.innerWidth;
            
            // Check if any element exceeds window width (adversarial element scanner)
            const overflowingElements = [];
            const allElements = Array.from(document.body.querySelectorAll('*'));
            
            for (const el of allElements) {
              const style = window.getComputedStyle(el);
              if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') continue;
              // Ignore skip-link positioned offscreen
              if (el.classList.contains('skip-link') || el.closest('.skip-link')) continue;
              // Ignore mobile menu when closed
              if (el.closest('#mobile-nav-menu') && el.closest('#mobile-nav-menu').classList.contains('hidden')) continue;
              // Ignore sr-only / live regions
              if (style.position === 'absolute' && (style.clip === 'rect(0px, 0px, 0px, 0px)' || el.classList.contains('sr-only'))) continue;

              const rect = el.getBoundingClientRect();
              if (rect.width > 0 && rect.height > 0) {
                // Allow a small subpixel threshold of 1.5px
                if (rect.right > winWidth + 1.5) {
                  overflowingElements.push({
                    tag: el.tagName.toLowerCase(),
                    id: el.id || '',
                    class: (el.className || '').toString().slice(0, 50),
                    right: Math.round(rect.right),
                    winWidth,
                    excess: Math.round(rect.right - winWidth),
                  });
                }
              }
            }

            // Attempt horizontal scroll
            window.scrollTo(100, 0);
            const scrollX = window.scrollX || window.pageXOffset || 0;

            return {
              docWidth,
              bodyWidth,
              winWidth,
              scrollX,
              overflowingElements: overflowingElements.slice(0, 5),
            };
          });

          if (metrics.docWidth > metrics.winWidth) {
            failures.push(`[${route} @ ${vp.name}] Document scrollWidth (${metrics.docWidth}px) > innerWidth (${metrics.winWidth}px)`);
          }
          if (metrics.bodyWidth > metrics.winWidth) {
            failures.push(`[${route} @ ${vp.name}] Body scrollWidth (${metrics.bodyWidth}px) > innerWidth (${metrics.winWidth}px)`);
          }
          if (metrics.scrollX > 0) {
            failures.push(`[${route} @ ${vp.name}] Horizontal scroll triggered: scrollX = ${metrics.scrollX}px`);
          }
          if (metrics.overflowingElements.length > 0) {
            failures.push(`[${route} @ ${vp.name}] Overflowing DOM elements detected: ${JSON.stringify(metrics.overflowingElements)}`);
          }
        } finally {
          await context.close();
        }
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `Adversarial Viewport Matrix detected ${failures.length} layout overflow failures:\n${failures.join('\n')}`
    );
  });

  // =========================================================================
  // SUITE 2: WCAG SC 1.4.10 Reflow (320px baseline & 640px zoom equivalent)
  // =========================================================================
  await t.test('Reflow: WCAG 1.4.10 320px and 640px viewport reflow without 2D scrolling', async () => {
    const reflowBreakpoints = [
      { width: 320, height: 568, name: '320px (WCAG 1.4.10 Reflow standard)' },
      { width: 640, height: 800, name: '640px (1280px at 200% desktop zoom)' },
    ];
    const failures = [];

    for (const route of ALL_ROUTES) {
      for (const vp of reflowBreakpoints) {
        const { page, context } = await createTestPage(browser, { viewport: vp });
        try {
          await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });
          const hasOverflow = await page.evaluate(() => {
            return document.documentElement.scrollWidth > window.innerWidth;
          });
          if (hasOverflow) {
            failures.push(`[${route} @ ${vp.name}] Reflow overflow detected`);
          }
        } finally {
          await context.close();
        }
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `WCAG 1.4.10 Reflow failures detected:\n${failures.join('\n')}`
    );
  });

  // =========================================================================
  // SUITE 3: WCAG SC 1.4.4 Resize Text (200% Font Scaling on Mobile Viewports)
  // =========================================================================
  await t.test('Reflow: 200% root font scaling without horizontal overflow or header collision', async () => {
    // WCAG 1.4.4: text resized up to 200% without loss of content or functionality.
    // Base font size is 18px -> 200% is 36px.
    const { page, context } = await createTestPage(browser, {
      viewport: { width: 360, height: 640 },
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Apply 200% root font size
      await page.evaluate(() => {
        document.documentElement.style.fontSize = '36px';
      });

      const checks = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;

        const culprits = Array.from(document.querySelectorAll('*'))
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              tag: el.tagName.toLowerCase(),
              id: el.id,
              class: (el.className || '').toString().slice(0, 40),
              right: Math.round(r.right),
              excess: Math.round(r.right - winWidth),
            };
          })
          .filter((el) => el.right > winWidth + 2)
          .sort((a, b) => b.right - a.right)
          .slice(0, 5);

        return {
          overflow: docWidth > winWidth + 1,
          docWidth,
          winWidth,
          culprits,
        };
      });

      assert.strictEqual(
        checks.overflow,
        false,
        `200% font scaling caused horizontal overflow: ${checks.docWidth}px > ${checks.winWidth}px. Culprits: ${JSON.stringify(checks.culprits)}`
      );
    } finally {
      await context.close();
    }
  });

  // =========================================================================
  // SUITE 4: Amharic Typography, Line Height & Long Word Wrapping Stress
  // =========================================================================
  await t.test('Typography: Computed line heights on Amharic pages meet Ethiopic standards', async () => {
    const amharicRoutes = ['/am', '/am/privacy', '/am/accessibility'];
    const failures = [];

    for (const route of amharicRoutes) {
      const { page, context } = await createTestPage(browser, {
        viewport: { width: 375, height: 667 },
      });

      try {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });

        const typographyReport = await page.evaluate(() => {
          const results = [];
          const textElements = Array.from(document.querySelectorAll('h1, h2, h3, p, li, address, td'));

          for (const el of textElements) {
            const style = window.getComputedStyle(el);
            const fontSize = parseFloat(style.fontSize);
            let lineHeight = parseFloat(style.lineHeight);

            if (isNaN(lineHeight)) {
              lineHeight = fontSize * 1.2;
            }

            const ratio = lineHeight / fontSize;
            const tag = el.tagName.toLowerCase();
            const textSample = (el.textContent || '').trim().slice(0, 30);

            // Ethiopic body text standards: ratio >= 1.6 (target >= 1.75/1.80 per SRS R4)
            if (['p', 'li', 'address'].includes(tag) && textSample.length > 10) {
              if (ratio < 1.6) {
                results.push({ tag, textSample, fontSize, lineHeight, ratio: Number(ratio.toFixed(2)) });
              }
            } else if (['h1', 'h2', 'h3'].includes(tag)) {
              if (ratio < 1.15) {
                results.push({ tag, textSample, fontSize, lineHeight, ratio: Number(ratio.toFixed(2)) });
              }
            }
          }

          return results;
        });

        if (typographyReport.length > 0) {
          failures.push(`[${route}] Low line-height detected on Amharic elements: ${JSON.stringify(typographyReport)}`);
        }
      } finally {
        await context.close();
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `Amharic line-height standards check failed:\n${failures.join('\n')}`
    );
  });

  await t.test('Typography: Long compound Amharic word wrapping stress test at 320px', async () => {
    const { page, context } = await createTestPage(browser, {
      viewport: { width: 320, height: 568 },
    });

    try {
      await page.goto(`${server.baseUrl}/am`, { waitUntil: 'domcontentloaded' });

      // Natural text wrapping check
      const naturalWrapCheck = await page.evaluate(() => {
        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;
        return { docWidth, winWidth, overflow: docWidth > winWidth };
      });
      assert.strictEqual(naturalWrapCheck.overflow, false, 'Amharic page must not overflow naturally at 320px');

      // Inject adversarial compound Ethiopic word into layout
      const adversarialWord = 'የኢትዮጵያኦርቶዶክስተዋሕዶቤተክርስቲያንቅዱስጊዮርጊስፍልገገነትሰማዕቱ'; // 47 Amharic chars without space
      const injectionResult = await page.evaluate((word) => {
        const aboutP = document.querySelector('#about p');
        if (!aboutP) return null;
        
        const testContainer = document.createElement('p');
        testContainer.id = 'adversarial-amharic-test';
        testContainer.textContent = word;
        aboutP.parentElement.appendChild(testContainer);

        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;

        return {
          docWidth,
          winWidth,
          overflows: docWidth > winWidth,
        };
      }, adversarialWord);

      assert.ok(injectionResult, 'Injection test element should be created');
      assert.strictEqual(
        injectionResult.overflows,
        false,
        `Adversarial 47-char Amharic word caused container overflow: scrollWidth (${injectionResult.docWidth}px) > innerWidth (${injectionResult.winWidth}px)`
      );
    } finally {
      await context.close();
    }
  });

  // =========================================================================
  // SUITE 5: Sticky Header Stability & Anchor Jump Content Obstruction
  // =========================================================================
  await t.test('Sticky Header: Preserves visibility and does not obstruct anchor targets', async () => {
    const viewportsToTest = [
      { width: 320, height: 568, name: '320px' },
      { width: 1024, height: 768, name: '1024px' },
    ];
    const failures = [];

    for (const vp of viewportsToTest) {
      const { page, context } = await createTestPage(browser, { viewport: vp });
      try {
        await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

        // Disable smooth scroll to inspect instantaneous anchor jump position
        await page.evaluate(() => {
          document.documentElement.style.scrollBehavior = 'auto';
        });

        const anchors = ['about', 'services', 'find-us', 'contact'];
        for (const id of anchors) {
          await page.evaluate((targetId) => {
            const el = document.getElementById(targetId);
            if (el) el.scrollIntoView();
          }, id);

          const metrics = await page.evaluate((targetId) => {
            const header = document.querySelector('header');
            const headerRect = header ? header.getBoundingClientRect() : { bottom: 0, height: 0 };
            const section = document.getElementById(targetId);
            if (!section) return null;

            const heading = section.querySelector('h2') || section;
            const headingRect = heading.getBoundingClientRect();

            return {
              headerBottom: headerRect.bottom,
              headingTop: headingRect.top,
              diff: headingRect.top - headerRect.bottom,
              isObstructed: headingRect.top < headerRect.bottom - 1,
            };
          }, id);

          if (!metrics) {
            failures.push(`[${vp.name}] Section #${id} not found`);
          } else if (metrics.isObstructed) {
            failures.push(`[${vp.name}] Section #${id} heading is obstructed by sticky header! Heading top (${Math.round(metrics.headingTop)}px) is below header bottom (${Math.round(metrics.headerBottom)}px) by ${Math.round(Math.abs(metrics.diff))}px`);
          }
        }
      } finally {
        await context.close();
      }
    }

    assert.strictEqual(
      failures.length,
      0,
      `Sticky header anchor obstruction detected:\n${failures.join('\n')}`
    );
  });

  await t.test('Sticky Header: Mobile navigation drawer fits 320px viewport without clipping', async () => {
    const { page, context } = await createTestPage(browser, {
      viewport: { width: 320, height: 568 },
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Click to open mobile menu
      await page.click('#mobile-menu-toggle');

      const drawerState = await page.evaluate(() => {
        const menu = document.getElementById('mobile-nav-menu');
        const toggle = document.getElementById('mobile-menu-toggle');
        const isHidden = menu?.classList.contains('hidden');
        const isExpanded = toggle?.getAttribute('aria-expanded') === 'true';

        const docWidth = document.documentElement.scrollWidth;
        const winWidth = window.innerWidth;

        const links = Array.from(menu?.querySelectorAll('a') || []);
        const linksVisible = links.every((a) => {
          const rect = a.getBoundingClientRect();
          return rect.width > 0 && rect.height >= 40 && rect.right <= winWidth + 1;
        });

        return {
          isOpen: !isHidden && isExpanded,
          overflow: docWidth > winWidth,
          docWidth,
          winWidth,
          linksCount: links.length,
          linksVisible,
        };
      });

      assert.strictEqual(drawerState.isOpen, true, 'Mobile drawer should open on toggle click');
      assert.strictEqual(drawerState.overflow, false, `Mobile drawer caused overflow: ${drawerState.docWidth}px > ${drawerState.winWidth}px`);
      assert.ok(drawerState.linksCount >= 4, `Drawer must have navigation links (found ${drawerState.linksCount})`);
      assert.strictEqual(drawerState.linksVisible, true, 'All drawer links must fit within 320px viewport');
    } finally {
      await context.close();
    }
  });

  // =========================================================================
  // SUITE 6: Interactive Hitboxes & Collision at 320px Boundary
  // =========================================================================
  await t.test('Hitboxes: All interactive buttons and links maintain >=44px touch target at 320px', async () => {
    const { page, context } = await createTestPage(browser, {
      viewport: { width: 320, height: 568 },
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      const interactiveElements = await page.evaluate(() => {
        const controls = Array.from(document.querySelectorAll('button, input, select, textarea, header a, .touch-target'));
        const undersized = [];

        for (const el of controls) {
          const style = window.getComputedStyle(el);
          if (style.display === 'none' || style.visibility === 'hidden') continue;
          if (el.id === 'honeypot-website' || el.classList.contains('skip-link')) continue;
          if (el.closest('#mobile-nav-menu') && el.closest('#mobile-nav-menu').classList.contains('hidden')) continue;

          const rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.width < 43 || rect.height < 43) {
              undersized.push({
                tag: el.tagName.toLowerCase(),
                id: el.id || '',
                class: (el.className || '').toString().slice(0, 40),
                width: Math.round(rect.width),
                height: Math.round(rect.height),
              });
            }
          }
        }

        return undersized;
      });

      assert.strictEqual(
        interactiveElements.length,
        0,
        `Found undersized interactive controls at 320px: ${JSON.stringify(interactiveElements)}`
      );
    } finally {
      await context.close();
    }
  });
});
