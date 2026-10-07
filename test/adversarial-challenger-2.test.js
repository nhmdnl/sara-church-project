import test from 'node:test';
import assert from 'node:assert/strict';
import { startStaticServer } from './helpers/static-server.js';
import { launchBrowser, createTestPage, BREAKPOINTS } from './helpers/browser.js';
import { loadHtmlPage } from './helpers/dom.js';

test('ADVERSARIAL STRESS TEST: Challenger 2 (Interactive & Privacy)', async (suite) => {
  let server;
  let browser;

  suite.before(async () => {
    server = await startStaticServer();
    browser = await launchBrowser();
  });

  suite.after(async () => {
    if (browser) await browser.close();
    if (server) await server.close();
  });

  // ============================================================================
  // FOCUS AREA 1: Zero Network Requests & Cookies Prior to On-Demand Map
  // ============================================================================
  await suite.test('Focus 1: Absolute Zero external requests and cookies across all 6 routes before map tap', async () => {
    const routes = ['/', '/am', '/privacy', '/am/privacy', '/accessibility', '/am/accessibility'];

    for (const route of routes) {
      const { page, context } = await createTestPage(browser);
      const networkRequests = [];

      page.on('request', (req) => {
        networkRequests.push({
          url: req.url(),
          method: req.method(),
          resourceType: req.resourceType(),
        });
      });

      try {
        await page.goto(`${server.baseUrl}${route}`, { waitUntil: 'networkidle' });

        // 1. Verify zero cookies
        const cookies = await context.cookies();
        assert.strictEqual(
          cookies.length,
          0,
          `Privacy leak: Route ${route} set ${cookies.length} cookie(s): ${JSON.stringify(cookies)}`
        );

        // 2. Verify all network requests are strictly local to our static server
        const externalRequests = networkRequests.filter(
          (req) => !req.url.startsWith(server.baseUrl)
        );
        assert.strictEqual(
          externalRequests.length,
          0,
          `Privacy leak: Route ${route} dispatched ${externalRequests.length} external request(s): ${JSON.stringify(externalRequests)}`
        );

        // 3. Verify zero iframes in initial DOM
        const iframeCount = await page.evaluate(() => document.querySelectorAll('iframe').length);
        assert.strictEqual(
          iframeCount,
          0,
          `Privacy leak: Route ${route} rendered ${iframeCount} iframe(s) before explicit consent!`
        );
      } finally {
        await context.close();
      }
    }
  });

  await suite.test('Focus 1: Map container scroll & hover does not pre-fetch tiles or OSM iframe', async () => {
    const { page, context } = await createTestPage(browser);
    const requests = [];

    page.on('request', (req) => requests.push(req.url()));

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'networkidle' });

      // Scroll to #find-us and hover over map preview
      await page.locator('#find-us').scrollIntoViewIfNeeded();
      await page.hover('#static-map-view');
      await page.focus('#load-interactive-map-btn');
      await page.waitForTimeout(300);

      // Verify still zero OSM or external requests
      const osmRequests = requests.filter((u) => u.includes('openstreetmap.org'));
      assert.strictEqual(osmRequests.length, 0, 'Hovering or focusing map button must NOT pre-fetch OSM requests');

      // Now explicitly click the button
      await page.click('#load-interactive-map-btn');

      // Verify iframe is injected now
      await page.waitForSelector('#interactive-map-frame iframe', { timeout: 3000 });

      const mapFrameState = await page.evaluate(() => {
        const frame = document.getElementById('interactive-map-frame');
        const staticView = document.getElementById('static-map-view');
        const liveRegion = document.getElementById('map-status-live');
        const btn = document.getElementById('load-interactive-map-btn');
        const iframe = frame?.querySelector('iframe');
        return {
          frameHidden: frame?.classList.contains('hidden'),
          staticHidden: staticView?.classList.contains('hidden'),
          ariaExpanded: btn?.getAttribute('aria-expanded'),
          liveAnnouncement: liveRegion?.textContent,
          iframeSrc: iframe?.getAttribute('src'),
          iframeCount: frame?.querySelectorAll('iframe').length,
        };
      });

      assert.strictEqual(mapFrameState.frameHidden, false, 'Interactive frame must be unhidden after click');
      assert.strictEqual(mapFrameState.staticHidden, true, 'Static view must be hidden after click');
      assert.strictEqual(mapFrameState.ariaExpanded, 'true', 'Button aria-expanded must be set to "true"');
      assert.ok(
        mapFrameState.liveAnnouncement && mapFrameState.liveAnnouncement.length > 0,
        'Polite live region must announce map loading'
      );
      assert.ok(
        mapFrameState.iframeSrc && mapFrameState.iframeSrc.includes('openstreetmap.org'),
        `Iframe must load OpenStreetMap (got ${mapFrameState.iframeSrc})`
      );
      assert.strictEqual(mapFrameState.iframeCount, 1, 'Exactly 1 iframe must be injected on initial click');
    } finally {
      await context.close();
    }
  });

  // ============================================================================
  // FOCUS AREA 2: Address Clipboard Copy & Hostile Fallbacks
  // ============================================================================
  await suite.test('Focus 2: Clipboard copy fallback when navigator.clipboard.writeText is REJECTED (Permission Denied)', async () => {
    const { page, context } = await createTestPage(browser, {
      permissions: [], // No clipboard permissions granted
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Mock navigator.clipboard.writeText to simulate NotAllowedError / Permission Denied
      await page.evaluate(() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText = () => {
            return Promise.reject(new DOMException('Permission denied by user', 'NotAllowedError'));
          };
        }
      });

      // Hook document.execCommand to verify fallback execution
      await page.evaluate(() => {
        window.__execCommandCalls = [];
        const originalExec = document.execCommand.bind(document);
        document.execCommand = (command, showUI, value) => {
          window.__execCommandCalls.push({ command, showUI, value });
          try {
            return originalExec(command, showUI, value);
          } catch (e) {
            return false;
          }
        };
      });

      const initialBtnText = await page.textContent('#copy-btn-text');
      const expectedCopiedText = await page.getAttribute('#copy-address-btn', 'data-copied-text');
      const expectedLiveText = await page.getAttribute('#copy-address-btn', 'data-live-copied');

      // Trigger copy
      await page.click('#copy-address-btn');

      // Wait for feedback state to activate
      await page.waitForFunction((initial) => {
        const btn = document.getElementById('copy-btn-text');
        return btn?.textContent !== initial;
      }, initialBtnText, { timeout: 2000 });

      // Assert document.execCommand('copy') was called as fallback
      const execCalls = await page.evaluate(() => window.__execCommandCalls);
      assert.ok(
        execCalls && execCalls.length > 0 && execCalls.some((c) => c.command === 'copy'),
        'document.execCommand("copy") fallback MUST be invoked when navigator.clipboard.writeText rejects'
      );

      // Verify visual and accessible feedback
      const feedback = await page.evaluate(() => {
        const btn = document.getElementById('copy-address-btn');
        const text = document.getElementById('copy-btn-text')?.textContent;
        const live = document.getElementById('copy-status-live')?.textContent;
        const ariaLabel = btn?.getAttribute('aria-label');
        const isEmerald = btn?.classList.contains('bg-emerald-100');
        return { text, live, ariaLabel, isEmerald };
      });

      assert.strictEqual(feedback.text, expectedCopiedText, `Button text must display "${expectedCopiedText}" under fallback`);
      assert.strictEqual(feedback.isEmerald, true, 'Button must show green success styling under fallback');
      assert.strictEqual(feedback.ariaLabel, expectedCopiedText, 'Button aria-label must reflect copied state');
      assert.strictEqual(feedback.live, expectedLiveText, 'Live region must announce copy to screen readers');

      // Wait 3200ms to verify state reverts to original
      await page.waitForTimeout(3200);

      const reverted = await page.evaluate(() => {
        const btn = document.getElementById('copy-address-btn');
        const text = document.getElementById('copy-btn-text')?.textContent;
        const live = document.getElementById('copy-status-live')?.textContent;
        const ariaLabel = btn?.getAttribute('aria-label');
        const isEmerald = btn?.classList.contains('bg-emerald-100');
        return { text, live, ariaLabel, isEmerald };
      });

      assert.strictEqual(reverted.text, initialBtnText, 'Button text must revert to initial after 3 seconds');
      assert.strictEqual(reverted.isEmerald, false, 'Emerald style must be removed after 3 seconds');
      assert.strictEqual(reverted.live, '', 'Live region must be cleared after 3 seconds');
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 2: Clipboard copy fallback when navigator.clipboard is COMPLETELY UNDEFINED (Insecure Context)', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      // Inject script before page scripts run to delete navigator.clipboard
      await page.addInitScript(() => {
        Object.defineProperty(navigator, 'clipboard', {
          value: undefined,
          configurable: true,
          writable: true,
        });
        window.__pageErrors = [];
        window.addEventListener('error', (e) => window.__pageErrors.push(e.message));
      });

      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Verify navigator.clipboard is undefined
      const isClipboardUndefined = await page.evaluate(() => typeof navigator.clipboard === 'undefined');
      assert.strictEqual(isClipboardUndefined, true, 'navigator.clipboard must be undefined for this stress test');

      const expectedCopiedText = await page.getAttribute('#copy-address-btn', 'data-copied-text');

      // Click copy button
      await page.click('#copy-address-btn');

      // Verify it does not throw uncaught error and transitions to copied state
      await page.waitForFunction((targetText) => {
        return document.getElementById('copy-btn-text')?.textContent === targetText;
      }, expectedCopiedText, { timeout: 3000 });

      const pageErrors = await page.evaluate(() => window.__pageErrors);
      assert.strictEqual(
        pageErrors.length,
        0,
        `Unexpected unhandled window error when navigator.clipboard is undefined: ${JSON.stringify(pageErrors)}`
      );

      const btnText = await page.textContent('#copy-btn-text');
      assert.strictEqual(btnText, expectedCopiedText, 'Button successfully fell back to execCommand without crashing');
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 2: Amharic address copy and Amharic live announcements under fallback', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.addInitScript(() => {
        if (navigator.clipboard) {
          navigator.clipboard.writeText = () => Promise.reject(new Error('Permission denied'));
        }
      });

      await page.goto(`${server.baseUrl}/am`, { waitUntil: 'domcontentloaded' });

      const initialAmText = await page.textContent('#copy-btn-text');
      assert.strictEqual(initialAmText, 'አድራሻ ቅዳ', 'Amharic button initial text must be "አድራሻ ቅዳ"');

      await page.click('#copy-address-btn');

      await page.waitForFunction(() => {
        return document.getElementById('copy-btn-text')?.textContent !== 'አድራሻ ቅዳ';
      }, { timeout: 2000 });

      const amCopied = await page.evaluate(() => {
        const text = document.getElementById('copy-btn-text')?.textContent;
        const live = document.getElementById('copy-status-live')?.textContent;
        return { text, live };
      });

      assert.strictEqual(amCopied.text, 'አድራሻው ተቀድቷል!', 'Amharic copied text must be "አድራሻው ተቀድቷል!"');
      assert.strictEqual(amCopied.live, 'አድራሻው ተቀድቷል', 'Amharic live announcement must be "አድራሻው ተቀድቷል"');
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 2: Rapid consecutive clicks on copy button do not leave DOM in corrupt state', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });
      const expectedCopiedText = await page.getAttribute('#copy-address-btn', 'data-copied-text');

      // Click rapidly 5 times
      for (let i = 0; i < 5; i++) {
        await page.click('#copy-address-btn');
        await page.waitForTimeout(50);
      }

      // Check state
      const text = await page.textContent('#copy-btn-text');
      assert.strictEqual(text, expectedCopiedText, `Rapid clicks must leave button in Copied state ("${expectedCopiedText}")`);

      // Wait 3500ms
      await page.waitForTimeout(3500);
      const revertedText = await page.textContent('#copy-btn-text');
      assert.strictEqual(revertedText, 'Copy Address', 'Button must revert cleanly after timeouts clear');
    } finally {
      await context.close();
    }
  });

  // ============================================================================
  // FOCUS AREA 3: Contact Form Honeypot Bot Trap & Client Validation States
  // ============================================================================
  await suite.test('Focus 3: Honeypot bot trap silently rejects spam with zero network requests or alerts', async () => {
    const { page, context } = await createTestPage(browser);
    const networkRequests = [];

    page.on('request', (req) => networkRequests.push(req.url()));

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Fill legitimate fields
      await page.fill('#contact-name', 'Automated Marketing Bot');
      await page.fill('#contact-email', 'bot@cheapleads.ai');
      await page.fill('#contact-message', 'We can rank your church #1 on Google with backlinks!');

      // Bot fills hidden honeypot field
      await page.evaluate(() => {
        const hp = document.getElementById('honeypot-website');
        if (hp) hp.value = 'http://spam-backlinks-service.com';
      });

      // Track network requests starting from submit
      const postSubmitRequests = [];
      page.on('request', (req) => postSubmitRequests.push(req.url()));

      await page.click('#submit-form-btn');
      await page.waitForTimeout(800);

      // Verify zero network dispatches to /api/contact or anywhere
      const apiRequests = postSubmitRequests.filter((u) => u.includes('/api/contact'));
      assert.strictEqual(
        apiRequests.length,
        0,
        `Bot submission MUST NOT dispatch to server API. Dispatched: ${apiRequests.join(', ')}`
      );

      // Verify silent rejection: NO success alert, NO error alert displayed
      const alerts = await page.evaluate(() => {
        const succ = document.getElementById('form-success-alert');
        const err = document.getElementById('form-error-alert');
        return {
          succVisible: succ ? !succ.classList.contains('hidden') : false,
          errVisible: err ? !err.classList.contains('hidden') : false,
        };
      });

      assert.strictEqual(alerts.succVisible, false, 'Honeypot trap must NOT show success banner');
      assert.strictEqual(alerts.errVisible, false, 'Honeypot trap must NOT show error banner (silent drop)');

      // Verify form fields were NOT reset (bot gets no feedback or state change)
      const nameVal = await page.inputValue('#contact-name');
      assert.strictEqual(nameVal, 'Automated Marketing Bot', 'Form values must not reset on honeypot drop');
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 3: Contact form client validation handles empty fields, malformed emails & aria-invalid', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Step 1: Submit with all fields completely empty
      await page.click('#submit-form-btn');

      const invalidStatesEmpty = await page.evaluate(() => {
        const nameInput = document.getElementById('contact-name');
        const emailInput = document.getElementById('contact-email');
        const msgInput = document.getElementById('contact-message');
        const nameErr = document.getElementById('contact-name-error');
        const emailErr = document.getElementById('contact-email-error');
        const msgErr = document.getElementById('contact-message-error');
        const formErrAlert = document.getElementById('form-error-alert');
        const activeElementId = document.activeElement?.id;

        return {
          nameInvalid: nameInput?.getAttribute('aria-invalid'),
          nameDescribedBy: nameInput?.getAttribute('aria-describedby'),
          nameErrVisible: nameErr ? !nameErr.classList.contains('hidden') : false,

          emailInvalid: emailInput?.getAttribute('aria-invalid'),
          emailDescribedBy: emailInput?.getAttribute('aria-describedby'),
          emailErrVisible: emailErr ? !emailErr.classList.contains('hidden') : false,

          msgInvalid: msgInput?.getAttribute('aria-invalid'),
          msgDescribedBy: msgInput?.getAttribute('aria-describedby'),
          msgErrVisible: msgErr ? !msgErr.classList.contains('hidden') : false,

          formErrAlertVisible: formErrAlert ? !formErrAlert.classList.contains('hidden') : false,
          focusedField: activeElementId,
        };
      });

      assert.strictEqual(invalidStatesEmpty.nameInvalid, 'true', 'Empty name must have aria-invalid="true"');
      assert.strictEqual(invalidStatesEmpty.nameDescribedBy, 'contact-name-error', 'Name must have aria-describedby pointing to error');
      assert.strictEqual(invalidStatesEmpty.nameErrVisible, true, 'Name error text must be visible');

      assert.strictEqual(invalidStatesEmpty.emailInvalid, 'true', 'Empty email must have aria-invalid="true"');
      assert.strictEqual(invalidStatesEmpty.emailDescribedBy, 'contact-email-error', 'Email must have aria-describedby');
      assert.strictEqual(invalidStatesEmpty.emailErrVisible, true, 'Email error text must be visible');

      assert.strictEqual(invalidStatesEmpty.msgInvalid, 'true', 'Empty message must have aria-invalid="true"');
      assert.strictEqual(invalidStatesEmpty.msgDescribedBy, 'contact-message-error', 'Message must have aria-describedby');
      assert.strictEqual(invalidStatesEmpty.msgErrVisible, true, 'Message error text must be visible');

      assert.strictEqual(invalidStatesEmpty.formErrAlertVisible, true, 'Global form error banner must be visible');
      assert.strictEqual(invalidStatesEmpty.focusedField, 'contact-name', 'First invalid field (contact-name) must receive focus');

      // Step 2: Now type valid name, test that input listener immediately clears aria-invalid on name
      await page.fill('#contact-name', 'Deacon Dawit');
      const nameAfterFill = await page.evaluate(() => {
        const input = document.getElementById('contact-name');
        const err = document.getElementById('contact-name-error');
        return {
          invalid: input?.getAttribute('aria-invalid'),
          describedBy: input?.getAttribute('aria-describedby'),
          errHidden: err?.classList.contains('hidden'),
        };
      });

      assert.strictEqual(nameAfterFill.invalid, null, 'Valid name must remove aria-invalid attribute dynamically');
      assert.strictEqual(nameAfterFill.describedBy, null, 'Valid name must remove aria-describedby dynamically');
      assert.strictEqual(nameAfterFill.errHidden, true, 'Name error message must be hidden upon valid input');

      // Step 3: Test genuinely malformed email strings per HTML5 spec
      const strictlyInvalidEmails = ['invalid-email', '@missinguser.com', 'user with spaces@domain.com', 'user@'];
      for (const badEmail of strictlyInvalidEmails) {
        await page.fill('#contact-email', badEmail);
        await page.click('#submit-form-btn');

        const emailInvalid = await page.getAttribute('#contact-email', 'aria-invalid');
        const emailErrVisible = await page.evaluate(() => {
          const el = document.getElementById('contact-email-error');
          return el ? !el.classList.contains('hidden') : false;
        });

        assert.strictEqual(
          emailInvalid,
          'true',
          `Malformed email "${badEmail}" must trigger aria-invalid="true"`
        );
        assert.strictEqual(
          emailErrVisible,
          true,
          `Malformed email "${badEmail}" must display contact-email-error`
        );
      }
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 3: Contact form XSS injection payloads do not execute and submit cleanly', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.addInitScript(() => {
        window.__xssScriptExecuted = false;
        window.__xssImgExecuted = false;
      });

      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Hostile XSS payloads
      await page.fill('#contact-name', '<script>window.__xssScriptExecuted=true;</script>John Doe');
      await page.fill('#contact-email', 'test+xss@example.org.uk');
      await page.fill('#contact-message', '<img src="invalid-image-url.jpg" onerror="window.__xssImgExecuted=true"> Hello parish!');

      await page.click('#submit-form-btn');

      // Wait for success submission
      await page.waitForFunction(() => {
        const succ = document.getElementById('form-success-alert');
        return succ && !succ.classList.contains('hidden');
      }, { timeout: 3000 });

      // Verify no XSS execution took place in browser context
      const xssResults = await page.evaluate(() => ({
        scriptExecuted: window.__xssScriptExecuted,
        imgExecuted: window.__xssImgExecuted,
      }));

      assert.strictEqual(xssResults.scriptExecuted, false, 'Injected script must NOT execute');
      assert.strictEqual(xssResults.imgExecuted, false, 'Injected img onerror must NOT execute');

      // Verify inputs reset after submission
      const nameVal = await page.inputValue('#contact-name');
      assert.strictEqual(nameVal, '', 'Inputs must reset cleanly after successful submission');
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 3: Submit button is throttled during submission to prevent double-submits', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      await page.fill('#contact-name', 'Berhanu');
      await page.fill('#contact-email', 'berhanu@example.org.uk');
      await page.fill('#contact-message', 'Inquiry regarding Saturday evening prayers.');

      // Submit form and immediately check disabled state
      await page.click('#submit-form-btn');

      const isDisabledDuringSubmit = await page.evaluate(() => {
        const btn = document.getElementById('submit-form-btn');
        return btn?.hasAttribute('disabled') && btn?.classList.contains('opacity-75');
      });

      assert.strictEqual(
        isDisabledDuringSubmit,
        true,
        'Submit button must be disabled and have opacity-75 during delivery simulation'
      );

      // Wait for completion (500ms + buffer)
      await page.waitForFunction(() => {
        const btn = document.getElementById('submit-form-btn');
        return btn && !btn.hasAttribute('disabled');
      }, { timeout: 3000 });

      const isReEnabled = await page.evaluate(() => {
        const btn = document.getElementById('submit-form-btn');
        return !btn?.hasAttribute('disabled') && !btn?.classList.contains('opacity-75');
      });

      assert.strictEqual(isReEnabled, true, 'Submit button must re-enable after submission completes');
    } finally {
      await context.close();
    }
  });

  // ============================================================================
  // FOCUS AREA 4: Bilingual Subpage Language Switching Cycles & Routing Invariance
  // ============================================================================
  await suite.test('Focus 4: Multi-cycle language switching on landing page (/ <-> /am)', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // Cycle back and forth 4 times (8 total navigations)
      for (let cycle = 1; cycle <= 4; cycle++) {
        // Current: English -> click Amharic switcher
        const amSwitchLink = await page.getAttribute('header a[hreflang="am"]', 'href');
        assert.strictEqual(amSwitchLink, '/am', `Cycle ${cycle} EN->AM switch href must be strictly /am`);

        await page.click('header a[hreflang="am"]');
        await page.waitForURL(`${server.baseUrl}/am`, { timeout: 3000 });

        const currentAmUrl = new URL(page.url()).pathname;
        assert.strictEqual(currentAmUrl, '/am', `Cycle ${cycle} Landed URL must be /am`);
        assert.ok(!currentAmUrl.includes('/am/am'), `Cycle ${cycle} Must not contain /am/am corruption`);

        // Current: Amharic -> click English switcher
        const enSwitchLink = await page.getAttribute('header a[hreflang="en"]', 'href');
        assert.strictEqual(enSwitchLink, '/', `Cycle ${cycle} AM->EN switch href must be strictly /`);

        await page.click('header a[hreflang="en"]');
        await page.waitForURL(`${server.baseUrl}/`, { timeout: 3000 });

        const currentEnUrl = new URL(page.url()).pathname;
        assert.strictEqual(currentEnUrl, '/', `Cycle ${cycle} Landed URL must be /`);
      }
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 4: Multi-cycle language switching on /privacy subpage (/privacy <-> /am/privacy)', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/privacy`, { waitUntil: 'domcontentloaded' });

      // Cycle back and forth 4 times
      for (let cycle = 1; cycle <= 4; cycle++) {
        // EN Privacy -> click AM
        const amSwitchHref = await page.getAttribute('header a[hreflang="am"]', 'href');
        assert.strictEqual(amSwitchHref, '/am/privacy', `Cycle ${cycle} Privacy EN->AM href must be /am/privacy`);

        await page.click('header a[hreflang="am"]');
        await page.waitForURL(`${server.baseUrl}/am/privacy`, { timeout: 3000 });

        const amUrl = new URL(page.url()).pathname;
        assert.strictEqual(amUrl, '/am/privacy', `Cycle ${cycle} Landed URL must be /am/privacy`);
        assert.ok(!amUrl.includes('/am/am'), `Cycle ${cycle} Must not contain /am/am corruption`);

        // AM Privacy -> click EN
        const enSwitchHref = await page.getAttribute('header a[hreflang="en"]', 'href');
        assert.strictEqual(enSwitchHref, '/privacy', `Cycle ${cycle} Privacy AM->EN href must be /privacy`);

        await page.click('header a[hreflang="en"]');
        await page.waitForURL(`${server.baseUrl}/privacy`, { timeout: 3000 });

        const enUrl = new URL(page.url()).pathname;
        assert.strictEqual(enUrl, '/privacy', `Cycle ${cycle} Landed URL must be /privacy`);
      }
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 4: Multi-cycle language switching on /accessibility subpage (/accessibility <-> /am/accessibility)', async () => {
    const { page, context } = await createTestPage(browser);

    try {
      await page.goto(`${server.baseUrl}/accessibility`, { waitUntil: 'domcontentloaded' });

      // Cycle back and forth 4 times
      for (let cycle = 1; cycle <= 4; cycle++) {
        // EN A11y -> click AM
        const amSwitchHref = await page.getAttribute('header a[hreflang="am"]', 'href');
        assert.strictEqual(amSwitchHref, '/am/accessibility', `Cycle ${cycle} A11y EN->AM href must be /am/accessibility`);

        await page.click('header a[hreflang="am"]');
        await page.waitForURL(`${server.baseUrl}/am/accessibility`, { timeout: 3000 });

        const amUrl = new URL(page.url()).pathname;
        assert.strictEqual(amUrl, '/am/accessibility', `Cycle ${cycle} Landed URL must be /am/accessibility`);
        assert.ok(!amUrl.includes('/am/am'), `Cycle ${cycle} Must not contain /am/am corruption`);

        // AM A11y -> click EN
        const enSwitchHref = await page.getAttribute('header a[hreflang="en"]', 'href');
        assert.strictEqual(enSwitchHref, '/accessibility', `Cycle ${cycle} A11y AM->EN href must be /accessibility`);

        await page.click('header a[hreflang="en"]');
        await page.waitForURL(`${server.baseUrl}/accessibility`, { timeout: 3000 });

        const enUrl = new URL(page.url()).pathname;
        assert.strictEqual(enUrl, '/accessibility', `Cycle ${cycle} Landed URL must be /accessibility`);
      }
    } finally {
      await context.close();
    }
  });

  await suite.test('Focus 4: Mobile viewport (375px) language switcher and drawer integrity', async () => {
    const { page, context } = await createTestPage(browser, {
      viewport: BREAKPOINTS.mobile,
    });

    try {
      await page.goto(`${server.baseUrl}/`, { waitUntil: 'domcontentloaded' });

      // In mobile viewport, desktop nav is hidden, mobile header switcher is visible
      const mobileSwitchHref = await page.locator('.md\\:hidden a[hreflang="am"]').getAttribute('href');
      assert.strictEqual(mobileSwitchHref, '/am', 'Mobile header switcher href must be /am');

      // Click mobile switcher to switch to Amharic
      await page.click('.md\\:hidden a[hreflang="am"]');
      await page.waitForURL(`${server.baseUrl}/am`, { timeout: 3000 });

      // On Amharic page, open mobile drawer
      await page.click('#mobile-menu-toggle');
      const isDrawerOpen = await page.evaluate(() => {
        const menu = document.getElementById('mobile-nav-menu');
        const btn = document.getElementById('mobile-menu-toggle');
        return {
          menuVisible: menu ? !menu.classList.contains('hidden') : false,
          expanded: btn?.getAttribute('aria-expanded'),
        };
      });

      assert.strictEqual(isDrawerOpen.menuVisible, true, 'Mobile drawer must open when toggled');
      assert.strictEqual(isDrawerOpen.expanded, 'true', 'Toggle button aria-expanded must be true');

      // Verify all links inside mobile drawer have localized paths (/am#about, etc.)
      const drawerLinks = await page.evaluate(() => {
        const links = document.querySelectorAll('#mobile-nav-menu a.mobile-nav-link');
        return Array.from(links).map((a) => a.getAttribute('href'));
      });

      assert.ok(drawerLinks.length >= 4, 'Must have at least 4 navigation links in mobile menu');
      for (const link of drawerLinks) {
        assert.ok(
          link.startsWith('/am#'),
          `Amharic mobile menu links must start with /am# (got: ${link})`
        );
      }

      // Close drawer with Escape
      await page.keyboard.press('Escape');
      const isDrawerClosed = await page.evaluate(() => {
        const menu = document.getElementById('mobile-nav-menu');
        const btn = document.getElementById('mobile-menu-toggle');
        return {
          menuHidden: menu?.classList.contains('hidden'),
          expanded: btn?.getAttribute('aria-expanded'),
          focusedId: document.activeElement?.id,
        };
      });

      assert.strictEqual(isDrawerClosed.menuHidden, true, 'Mobile drawer must close on Escape key');
      assert.strictEqual(isDrawerClosed.expanded, 'false', 'Button aria-expanded must be false');
      assert.strictEqual(isDrawerClosed.focusedId, 'mobile-menu-toggle', 'Focus must restore to mobile menu button');
    } finally {
      await context.close();
    }
  });
});
