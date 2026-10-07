import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHtmlPage, extractLinks } from './helpers/dom.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = path.join(rootDir, 'src', 'data');

test('R4: Ethiopic Typography & Localization Integrity Suite', async (t) => {
  await t.test('Tier 1: Self-hosted Ethiopic font assets exist and are preloaded', async () => {
    const requiredFonts = [
      'noto-sans-ethiopic-regular.woff2',
      'noto-sans-ethiopic-semibold.woff2',
      'noto-sans-latin-regular.woff2',
    ];

    for (const font of requiredFonts) {
      const publicPath = path.join(rootDir, 'public', 'fonts', font);
      const distPath = path.join(distDir, 'fonts', font);
      assert.ok(fs.existsSync(publicPath), `Font ${font} must exist in public/fonts/`);
      assert.ok(fs.existsSync(distPath), `Font ${font} must be copied to dist/fonts/`);
      const stat = fs.statSync(distPath);
      assert.ok(stat.size > 10000, `Font ${font} must have valid non-empty size (got ${stat.size} bytes)`);
    }

    // Verify font preload link in English and Amharic landing pages
    for (const pagePath of ['index.html', 'am/index.html']) {
      const { document } = loadHtmlPage(pagePath);
      const preload = document.querySelector('link[rel="preload"][href*="noto-sans-ethiopic-regular.woff2"]');
      assert.ok(preload, `Font preload link for noto-sans-ethiopic-regular.woff2 must exist on ${pagePath}`);
      assert.strictEqual(preload.getAttribute('as'), 'font', 'Preload as attribute must be "font"');
      assert.strictEqual(preload.getAttribute('type'), 'font/woff2', 'Preload type attribute must be "font/woff2"');
    }
  });

  await t.test('Tier 1: Ethiopic Unicode character coverage validates against font ranges', async () => {
    // Unicode ranges declared in global.css for Ethiopic:
    // U+030E, U+1200-1399, U+2D80-2DDE, U+AB01-AB2E, U+1E7E0-1E7FE
    function isEthiopicChar(code) {
      return (
        code === 0x030e ||
        (code >= 0x1200 && code <= 0x1399) ||
        (code >= 0x2d80 && code <= 0x2dde) ||
        (code >= 0xab01 && code <= 0xab2e) ||
        (code >= 0x1e7e0 && code <= 0x1e7fe)
      );
    }

    function isStandardPunctuationOrAscii(code) {
      // Latin font declared unicode-range: U+0000-00FF, plus common general punctuation U+2000-206F
      return code <= 0x00ff || (code >= 0x2000 && code <= 0x206f) || code === 0x00a0;
    }

    // Load data models
    const files = ['church.json', 'services.json', 'venue.json', 'notices.json', 'i18n.json'];
    const unsupportedChars = [];

    for (const file of files) {
      const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
      for (const char of content) {
        const code = char.codePointAt(0);
        if (code > 0x007f && !isStandardPunctuationOrAscii(code) && !isEthiopicChar(code)) {
          // Check if it's emoji or common non-latin
          if (code < 0x1f300 || code > 0x1f9ff) {
            unsupportedChars.push({ char, code: `U+${code.toString(16).toUpperCase()}`, file });
          }
        }
      }
    }

    assert.strictEqual(
      unsupportedChars.length,
      0,
      `Found ${unsupportedChars.length} characters in data layer outside Ethiopic font ranges: ${JSON.stringify(unsupportedChars)}`
    );
  });

  await t.test('Tier 2: i18n translation dictionary key symmetry (en vs am in i18n.json)', async () => {
    const i18nData = JSON.parse(fs.readFileSync(path.join(dataDir, 'i18n.json'), 'utf8'));
    assert.ok(i18nData.en && i18nData.am, 'i18n.json must define both en and am root objects');

    function getKeyPaths(obj, prefix = '') {
      let paths = [];
      for (const key of Object.keys(obj)) {
        const full = prefix ? `${prefix}.${key}` : key;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          paths = paths.concat(getKeyPaths(obj[key], full));
        } else {
          paths.push(full);
        }
      }
      return paths.sort();
    }

    const enPaths = getKeyPaths(i18nData.en);
    const amPaths = getKeyPaths(i18nData.am);

    const missingInAm = enPaths.filter((p) => !amPaths.includes(p));
    const missingInEn = amPaths.filter((p) => !enPaths.includes(p));

    assert.strictEqual(
      missingInAm.length,
      0,
      `Translation keys present in en but missing in am: ${missingInAm.join(', ')}`
    );
    assert.strictEqual(
      missingInEn.length,
      0,
      `Translation keys present in am but missing in en: ${missingInEn.join(', ')}`
    );
  });

  await t.test('Tier 3: Bilingual route switching preserving subpage context across all pages', async () => {
    const expectedRoutePairs = [
      { page: 'index.html', currentLang: 'en', targetLang: 'am', expectedSwitchHref: '/am' },
      { page: 'am/index.html', currentLang: 'am', targetLang: 'en', expectedSwitchHref: '/' },
      { page: 'privacy/index.html', currentLang: 'en', targetLang: 'am', expectedSwitchHref: '/am/privacy' },
      { page: 'am/privacy/index.html', currentLang: 'am', targetLang: 'en', expectedSwitchHref: '/privacy' },
      { page: 'accessibility/index.html', currentLang: 'en', targetLang: 'am', expectedSwitchHref: '/am/accessibility' },
      { page: 'am/accessibility/index.html', currentLang: 'am', targetLang: 'en', expectedSwitchHref: '/accessibility' },
    ];

    for (const pair of expectedRoutePairs) {
      const { document } = loadHtmlPage(pair.page);
      const switchers = Array.from(document.querySelectorAll(`a[hreflang="${pair.targetLang}"]`));

      assert.ok(
        switchers.length >= 1,
        `Page ${pair.page} must have at least one language switch link targeting ${pair.targetLang}`
      );

      for (const switcher of switchers) {
        const href = switcher.getAttribute('href');
        assert.strictEqual(
          href,
          pair.expectedSwitchHref,
          `Language switcher on ${pair.page} should preserve route and link to ${pair.expectedSwitchHref}, but got ${href}`
        );
      }
    }
  });

  await t.test('Tier 3: Canonical and alternate hreflang URL parity (detects /am/am corruption)', async () => {
    const siteUrl = 'https://felegegenet.org.uk';
    const expectedParity = [
      {
        page: 'index.html',
        canonical: `${siteUrl}/`,
        hreflangEn: `${siteUrl}/`,
        hreflangAm: `${siteUrl}/am`,
      },
      {
        page: 'am/index.html',
        canonical: `${siteUrl}/am`,
        hreflangEn: `${siteUrl}/`,
        hreflangAm: `${siteUrl}/am`,
      },
      {
        page: 'privacy/index.html',
        canonical: `${siteUrl}/privacy`,
        hreflangEn: `${siteUrl}/privacy`,
        hreflangAm: `${siteUrl}/am/privacy`,
      },
      {
        page: 'am/privacy/index.html',
        canonical: `${siteUrl}/am/privacy`,
        hreflangEn: `${siteUrl}/privacy`,
        hreflangAm: `${siteUrl}/am/privacy`,
      },
      {
        page: 'accessibility/index.html',
        canonical: `${siteUrl}/accessibility`,
        hreflangEn: `${siteUrl}/accessibility`,
        hreflangAm: `${siteUrl}/am/accessibility`,
      },
      {
        page: 'am/accessibility/index.html',
        canonical: `${siteUrl}/am/accessibility`,
        hreflangEn: `${siteUrl}/accessibility`,
        hreflangAm: `${siteUrl}/am/accessibility`,
      },
    ];

    for (const exp of expectedParity) {
      const { document } = loadHtmlPage(exp.page);

      const canonicalEl = document.querySelector('link[rel="canonical"]');
      assert.ok(canonicalEl, `Canonical link element must exist on ${exp.page}`);
      const canonicalHref = canonicalEl.getAttribute('href');

      assert.strictEqual(
        canonicalHref,
        exp.canonical,
        `Canonical URL on ${exp.page} must be strictly ${exp.canonical}, but got ${canonicalHref}`
      );

      const hreflangEnEl = document.querySelector('link[rel="alternate"][hreflang="en"]');
      assert.ok(hreflangEnEl, `Hreflang en element must exist on ${exp.page}`);
      const hreflangEnHref = hreflangEnEl.getAttribute('href');

      assert.strictEqual(
        hreflangEnHref,
        exp.hreflangEn,
        `Hreflang en on ${exp.page} must be strictly ${exp.hreflangEn}, but got ${hreflangEnHref}`
      );

      const hreflangAmEl = document.querySelector('link[rel="alternate"][hreflang="am"]');
      assert.ok(hreflangAmEl, `Hreflang am element must exist on ${exp.page}`);
      const hreflangAmHref = hreflangAmEl.getAttribute('href');

      assert.strictEqual(
        hreflangAmHref,
        exp.hreflangAm,
        `Hreflang am on ${exp.page} must be strictly ${exp.hreflangAm}, but got ${hreflangAmHref}`
      );
    }
  });

  await t.test('Tier 4: Untranslated English leftovers scanner on Amharic landing page', async () => {
    const { document } = loadHtmlPage('am/index.html');

    // Known defect: Services.astro:52 hardcodes `<span>UK Local Time</span>` instead of localized string
    const servicesSection = document.getElementById('services');
    assert.ok(servicesSection, 'Services section must exist on Amharic page');

    const textContent = servicesSection.textContent || '';
    const hasHardcodedUkTime = textContent.includes('UK Local Time');

    assert.strictEqual(
      hasHardcodedUkTime,
      false,
      'Amharic services section contains untranslated hardcoded English string: "UK Local Time" (should be "የለንደን ሰዓት")'
    );
  });
});
