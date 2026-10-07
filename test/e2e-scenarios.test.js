import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage, BREAKPOINTS } from './helpers/browser.js';

test('Tier 4: Comprehensive Real-World E2E Scenarios Suite', async (t) => {
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

  await t.test('Scenario A: Established Parishioner Journey (EN & AM)', async () => {
    for (const route of ['/', '/am']) {
      const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.mobile });
      try {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'domcontentloaded' });

        // 1. Verify next service essentials in hero
        const nextService = await page.evaluate(() => {
          const hero = document.querySelector('section');
          return {
            hasServiceCard: !!hero?.querySelector('.rounded-2xl.border-2'),
            serviceText: hero?.textContent || '',
          };
        });
        assert.strictEqual(nextService.hasServiceCard, true, `Hero must feature next service card on ${route}`);

        // 2. Click hero quick CTA scrolling to services schedule
        await page.click('section a[href*="#services"]');
        const servicesSection = await page.evaluate(() => {
          const sec = document.getElementById('services');
          return !!sec;
        });
        assert.strictEqual(servicesSection, true, `Services section #services must exist on ${route}`);

        // 3. One-click copy address
        const copyBtn = await page.locator('#copy-address-btn');
        assert.ok(copyBtn, `Copy address button must exist on ${route}`);
        await copyBtn.click();

        await page.waitForFunction(() => {
          const btn = document.getElementById('copy-address-btn');
          return btn?.classList.contains('bg-emerald-100');
        }, { timeout: 3000 });

        const isFeedbackShown = await page.evaluate(() => {
          const btn = document.getElementById('copy-address-btn');
          return btn?.classList.contains('bg-emerald-100');
        });
        assert.strictEqual(isFeedbackShown, true, `Visual copy confirmation must appear on ${route}`);
      } finally {
        await context.close();
      }
    }
  });

  await t.test('Scenario B: First-Time Visitor Journey', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.desktop });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // 1. Click "Get Directions" in hero
      const directionsUrl = await page.getAttribute('section a[href*="maps/dir/?api=1"]', 'href');
      assert.ok(
        directionsUrl && directionsUrl.includes('51.4764'),
        'Directions link in hero must direct visitor to correct church venue'
      );

      // 2. Verify venue address
      const addressContent = await page.textContent('#venue-address-text');
      assert.ok(addressContent && addressContent.includes('SW8 4HB'), 'Venue address must show updated SW8 4HB postcode');

      // 3. Inspect public transport guidance
      const transportVisible = await page.evaluate(() => {
        const tflLink = document.querySelector('a[href*="tfl.gov.uk"]');
        return !!tflLink;
      });
      assert.strictEqual(transportVisible, true, 'TfL Journey Planner link must be accessible to first-time visitor');

      // 4. Submit contact form inquiry
      await page.fill('#contact-name', 'First Time Inquirer');
      await page.fill('#contact-email', 'visitor@example.com');
      await page.fill('#contact-message', 'I would like to attend Divine Liturgy this Sunday. Is English guidance available?');
      await page.click('#submit-form-btn');

      await page.waitForFunction(() => {
        const alert = document.getElementById('form-success-alert');
        return alert && !alert.classList.contains('hidden');
      }, { timeout: 3000 });

      const successVisible = await page.evaluate(() => {
        const succ = document.getElementById('form-success-alert');
        return succ ? !succ.classList.contains('hidden') : false;
      });
      assert.strictEqual(successVisible, true, 'Inquiry must submit successfully with feedback');
    } finally {
      await context.close();
    }
  });

  await t.test('Scenario C: Legal & Trust Governance Journey', async () => {
    const { page, context } = await createTestPage(browser, { viewport: BREAKPOINTS.desktop });
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // 1. Footer statutory charity disclosure (LEGAL-1)
      const charityStatement = await page.evaluate(() => {
        const footer = document.querySelector('footer');
        return footer?.textContent || '';
      });
      assert.ok(
        charityStatement.includes('1217660') || charityStatement.includes('Charities Act 2011'),
        'Footer must declare registered charity status per Charities Act 2011 with Charity Number 1217660'
      );

      // 2. Navigate to Privacy Notice
      await page.click('footer a[href*="/privacy"]');
      await page.waitForURL('**/privacy');

      const privacyHeading = await page.textContent('h1');
      assert.ok(privacyHeading?.includes('Privacy Notice'), 'Must successfully navigate to Privacy Notice page');

      // 3. Verify zero tracking cookies declaration
      const privacyContent = await page.textContent('body');
      assert.ok(
        privacyContent?.includes('Zero tracking cookies') || privacyContent?.includes('no non-essential cookies'),
        'Privacy page must declare zero-tracking cookie policy'
      );

      // 4. Return to Home via back link
      await page.click('a[href="/"]');
      await page.waitForURL(`${server.baseUrl}/`);
      assert.strictEqual(page.url(), `${server.baseUrl}/`, 'Back to Home link must return to /');
    } finally {
      await context.close();
    }
  });
});
