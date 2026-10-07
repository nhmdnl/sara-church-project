import fs from 'node:fs';
import { chromium } from 'playwright-core';
import axe from 'axe-core';

export const BREAKPOINTS = {
  mobileSmall: { width: 320, height: 568, name: '320px (Mobile Small)' },
  mobile: { width: 375, height: 667, name: '375px (Mobile Standard)' },
  tablet: { width: 768, height: 1024, name: '768px (Tablet)' },
  desktop: { width: 1024, height: 768, name: '1024px (Desktop)' },
  wideDesktop: { width: 1440, height: 900, name: '1440px (Wide Desktop)' },
};

function getExecutablePath() {
  if (process.env.CHROME_BIN && fs.existsSync(process.env.CHROME_BIN)) {
    return process.env.CHROME_BIN;
  }
  const candidates = [
    '/usr/bin/chromium',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium-browser',
  ];
  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  throw new Error('No chromium binary found in system.');
}

export async function launchBrowser(options = {}) {
  const executablePath = getExecutablePath();
  const browser = await chromium.launch({
    executablePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    ...options,
  });
  return browser;
}

export async function createTestPage(browser, options = {}) {
  const context = await browser.newContext({
    viewport: options.viewport || BREAKPOINTS.wideDesktop,
    permissions: options.permissions || ['clipboard-read', 'clipboard-write'],
    ...options.contextOptions,
  });
  const page = await context.newPage();
  return { page, context };
}

export async function injectAxe(page) {
  await page.evaluate(axe.source);
}

export async function runAxeAudit(page, options = {}) {
  await injectAxe(page);
  return await page.evaluate(async (opts) => {
    return await window.axe.run(opts.context || document, {
      runOnly: {
        type: 'tag',
        values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'],
      },
      ...opts.config,
    });
  }, options);
}
