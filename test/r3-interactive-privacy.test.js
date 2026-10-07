import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage, BREAKPOINTS } from './helpers/browser.js';
import { loadHtmlPage } from './helpers/dom.js';

test('R3: Interactive Flow & Privacy QA Suite', async (t) => {
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

  await t.test('Tier 1: Address copy button writes venue string to clipboard with visual feedback', async () => {
    const { page, context } = await createTestPage(browser);
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Retrieve expected venue address string from button data attribute
      const expectedAddress = await page.getAttribute('#copy-address-btn', 'data-address');
      assert.ok(expectedAddress && expectedAddress.length > 10, 'Expected venue address string must be present in data-address');

      const initialBtnText = await page.textContent('#copy-btn-text');

      // Click the Copy Address button
      await page.click('#copy-address-btn');

      // Wait for async clipboard Promise to resolve and update DOM
      await page.waitForFunction(
        (initial) => {
          const current = document.getElementById('copy-btn-text')?.textContent;
          return current && current !== initial;
        },
        initialBtnText,
        { timeout: 3000 }
      );

      // Check visual feedback: text changes and emerald background class added
      const copiedText = await page.textContent('#copy-btn-text');
      const hasCopiedClass = await page.evaluate(() => {
        const btn = document.getElementById('copy-address-btn');
        return btn?.classList.contains('bg-emerald-100');
      });

      assert.notStrictEqual(copiedText, initialBtnText, 'Button text must change upon copying');
      assert.strictEqual(hasCopiedClass, true, 'Button must apply visual confirmation styling (bg-emerald-100)');

      // Verify clipboard contents
      const clipboardContent = await page.evaluate(async () => {
        try {
          return await navigator.clipboard.readText();
        } catch {
          return null;
        }
      });

      if (clipboardContent !== null) {
        assert.strictEqual(
          clipboardContent.trim(),
          expectedAddress.trim(),
          'Clipboard text must match full venue address string exactly'
        );
      }
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 1: On-demand interactive map loads strictly upon click with ZERO initial network trackers', async () => {
    const { page, context } = await createTestPage(browser);
    const interceptedUrls = [];

    page.on('request', (req) => {
      interceptedUrls.push(req.url());
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'networkidle' });

      // Assert 0 third-party or openstreetmap requests on initial load
      const initialOsmRequests = interceptedUrls.filter((url) =>
        url.includes('openstreetmap.org') || url.includes('tile.openstreetmap') || url.includes('google.com/maps')
      );
      assert.strictEqual(
        initialOsmRequests.length,
        0,
        `Privacy violation: Found ${initialOsmRequests.length} third-party map requests on initial page load: ${initialOsmRequests.join(', ')}`
      );

      // Verify static map view is initially visible and iframe container is empty/hidden
      const initialMapDom = await page.evaluate(() => {
        const staticView = document.getElementById('static-map-view');
        const frame = document.getElementById('interactive-map-frame');
        return {
          staticVisible: staticView ? !staticView.classList.contains('hidden') : false,
          iframeCount: frame ? frame.querySelectorAll('iframe').length : 0,
        };
      });

      assert.strictEqual(initialMapDom.staticVisible, true, 'Static map fallback view must be visible initially');
      assert.strictEqual(initialMapDom.iframeCount, 0, 'Zero iframe elements must exist before user clicks load map');

      // Click "Load Interactive Map"
      await page.click('#load-interactive-map-btn');

      // Verify iframe is injected and static view is hidden
      const postClickMapDom = await page.evaluate(() => {
        const staticView = document.getElementById('static-map-view');
        const frame = document.getElementById('interactive-map-frame');
        const iframe = frame?.querySelector('iframe');
        return {
          staticHidden: staticView ? staticView.classList.contains('hidden') : false,
          frameVisible: frame ? !frame.classList.contains('hidden') : false,
          iframeSrc: iframe ? iframe.getAttribute('src') : null,
        };
      });

      assert.strictEqual(postClickMapDom.staticHidden, true, 'Static map view must be hidden after user click');
      assert.strictEqual(postClickMapDom.frameVisible, true, 'Interactive map frame must be visible after click');
      assert.ok(
        postClickMapDom.iframeSrc && postClickMapDom.iframeSrc.includes('openstreetmap.org'),
        `Interactive map iframe src must point to OpenStreetMap (got: ${postClickMapDom.iframeSrc})`
      );
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 2: Directions link coordinates match exact venue coordinates', async () => {
    const { document } = loadHtmlPage('index.html');
    const googleDirLink = document.querySelector('a[href*="maps/dir/?api=1"]');
    const appleDirLink = document.querySelector('a[href*="maps.apple.com"]');

    assert.ok(googleDirLink, 'Google Maps directions link must exist');
    assert.ok(appleDirLink, 'Apple Maps directions link must exist');

    const googleHref = googleDirLink.getAttribute('href');
    const appleHref = appleDirLink.getAttribute('href');

    // Expected coordinates: 51.4882, -0.1378
    assert.ok(
      googleHref.includes('51.4882') && googleHref.includes('-0.1378'),
      `Google Maps URL must contain venue latitude (51.4882) and longitude (-0.1378). Got: ${googleHref}`
    );
    assert.ok(
      appleHref.includes('51.4882') && appleHref.includes('-0.1378'),
      `Apple Maps URL must contain venue coordinates. Got: ${appleHref}`
    );
  });

  await t.test('Tier 2: Contact form client-side validation displays error for empty submission', async () => {
    const { page, context } = await createTestPage(browser);
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Submit form with all fields empty
      await page.click('#submit-form-btn');

      // Verify error alert is displayed and success alert is hidden
      const alertStates = await page.evaluate(() => {
        const err = document.getElementById('form-error-alert');
        const succ = document.getElementById('form-success-alert');
        return {
          errVisible: err ? !err.classList.contains('hidden') : false,
          succHidden: succ ? succ.classList.contains('hidden') : true,
        };
      });

      assert.strictEqual(alertStates.errVisible, true, 'Validation error alert must be visible on invalid submission');
      assert.strictEqual(alertStates.succHidden, true, 'Success alert must remain hidden on invalid submission');
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 2: Honeypot anti-spam trap silently ignores bot submissions', async () => {
    const { page, context } = await createTestPage(browser);
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Populate valid fields
      await page.fill('#contact-name', 'Spam Bot 3000');
      await page.fill('#contact-email', 'spambot@example.com');
      await page.fill('#contact-message', 'Buy cheap prescription sunglasses here!');

      // Populate hidden honeypot field directly (simulating bot autofill of invisible input)
      await page.evaluate(() => {
        const hp = document.getElementById('honeypot-website');
        if (hp) hp.value = 'http://cheapmeds-spam-site.com';
      });

      // Click submit
      await page.click('#submit-form-btn');

      // Wait 600ms (simulate delay)
      await page.waitForTimeout(600);

      // Verify neither success alert nor error alert was triggered (silent rejection)
      const alerts = await page.evaluate(() => {
        const succ = document.getElementById('form-success-alert');
        const err = document.getElementById('form-error-alert');
        return {
          succVisible: succ ? !succ.classList.contains('hidden') : false,
          errVisible: err ? !err.classList.contains('hidden') : false,
        };
      });

      assert.strictEqual(
        alerts.succVisible,
        false,
        'Honeypot trap must silently reject submission and NOT display success alert'
      );
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 3: Valid contact form submission displays success banner and resets fields', async () => {
    const { page, context } = await createTestPage(browser);
    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      await page.fill('#contact-name', 'Sara Church Parishioner');
      await page.fill('#contact-email', 'parishioner@example.org.uk');
      await page.fill('#contact-message', 'Inquiring about baptism and Sunday Divine Liturgy times.');

      // Ensure honeypot is empty
      await page.evaluate(() => {
        const hp = document.getElementById('honeypot-website');
        if (hp) hp.value = '';
      });

      // Submit form
      await page.click('#submit-form-btn');

      // Wait for success feedback timeout (500ms)
      await page.waitForFunction(() => {
        const succ = document.getElementById('form-success-alert');
        return succ && !succ.classList.contains('hidden');
      }, { timeout: 3000 });

      const formValues = await page.evaluate(() => {
        const name = (document.getElementById('contact-name'))?.value;
        const email = (document.getElementById('contact-email'))?.value;
        const msg = (document.getElementById('contact-message'))?.value;
        return { name, email, msg };
      });

      assert.strictEqual(formValues.name, '', 'Form inputs must reset after successful submission');
      assert.strictEqual(formValues.email, '', 'Email input must reset');
      assert.strictEqual(formValues.msg, '', 'Message input must reset');
    } finally {
      await context.close();
    }
  });

  await t.test('Tier 4: Zero third-party cookies or tracker scripts across all 6 pages (NFR-5)', async () => {
    const pages = ['/', '/am', '/privacy', '/am/privacy', '/accessibility', '/am/accessibility'];

    for (const route of pages) {
      const { page, context } = await createTestPage(browser);
      try {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'networkidle' });
        const cookies = await context.cookies();
        assert.strictEqual(
          cookies.length,
          0,
          `Privacy violation: Found ${cookies.length} cookie(s) set on ${route}: ${JSON.stringify(cookies)}`
        );
      } finally {
        await context.close();
      }
    }
  });
});
