import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { loadHtmlPage, parseJsonLd, extractMetaTags } from './helpers/dom.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

function getDirectorySize(dirPath) {
  let total = 0;
  if (!fs.existsSync(dirPath)) return 0;
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      total += getDirectorySize(fullPath);
    } else if (entry.isFile()) {
      total += fs.statSync(fullPath).size;
    }
  }
  return total;
}

test('R5: Production Build & Discoverability Audit Suite', async (t) => {
  await t.test('Tier 1: Production build artifacts exist and are well-formed', async () => {
    assert.ok(fs.existsSync(distDir), 'dist/ directory must exist');

    const expectedPages = [
      'index.html',
      'am/index.html',
      'privacy/index.html',
      'am/privacy/index.html',
      'accessibility/index.html',
      'am/accessibility/index.html',
    ];

    for (const p of expectedPages) {
      const fullPath = path.join(distDir, p);
      assert.ok(fs.existsSync(fullPath), `Page artifact ${p} must exist in dist/`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 1000, `Page ${p} must have substantial HTML content (got ${stat.size} bytes)`);
    }

    assert.ok(fs.existsSync(path.join(distDir, 'robots.txt')), 'robots.txt must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'sitemap.xml')), 'sitemap.xml must exist');
    assert.ok(fs.existsSync(path.join(distDir, 'favicon.svg')), 'favicon.svg must exist');
  });

  await t.test('Tier 1: Production bundle size budget is strictly under 1MB (1,048,576 bytes)', async () => {
    const totalBytes = getDirectorySize(distDir);
    const ONE_MB = 1024 * 1024;
    const totalKB = (totalBytes / 1024).toFixed(2);

    console.log(`    Total production bundle size in dist/: ${totalKB} KB (${totalBytes} bytes)`);

    assert.ok(
      totalBytes < ONE_MB,
      `Bundle size budget violation: Total dist/ size (${totalKB} KB / ${totalBytes} bytes) exceeds 1MB limit (${ONE_MB} bytes)`
    );
  });

  await t.test('Tier 2: Schema.org PlaceOfWorship JSON-LD structured data validity', async () => {
    const pages = [
      { file: 'index.html', expectedUrl: 'https://felegegenet.org.uk/' },
      { file: 'am/index.html', expectedUrl: 'https://felegegenet.org.uk/am' },
    ];

    for (const { file, expectedUrl } of pages) {
      const { document } = loadHtmlPage(file);
      const jsonLdList = parseJsonLd(document);

      assert.ok(jsonLdList.length >= 1, `Page ${file} must contain at least one JSON-LD block`);

      const placeOfWorship = jsonLdList.find((item) => item['@type'] === 'PlaceOfWorship');
      assert.ok(placeOfWorship, `Page ${file} must contain a PlaceOfWorship JSON-LD schema`);

      // Verify required Schema.org properties
      assert.strictEqual(placeOfWorship['@context'], 'https://schema.org', 'Context must be https://schema.org');
      assert.ok(placeOfWorship.name && placeOfWorship.name.length > 5, 'PlaceOfWorship must have valid name');
      assert.ok(placeOfWorship.alternateName, 'PlaceOfWorship must have alternateName');
      assert.strictEqual(
        placeOfWorship.url,
        expectedUrl,
        `PlaceOfWorship URL on ${file} must match canonical URL ${expectedUrl}, but got ${placeOfWorship.url}`
      );

      // Verify PostalAddress
      const addr = placeOfWorship.address;
      assert.ok(addr && addr['@type'] === 'PostalAddress', 'Address must have @type PostalAddress');
      assert.ok(addr.streetAddress, 'Address must include streetAddress');
      assert.strictEqual(addr.postalCode, 'SW1V 3EN', 'Address postcode must be SW1V 3EN');
      assert.strictEqual(addr.addressCountry, 'GB', 'Country code must be GB');

      // Verify GeoCoordinates
      const geo = placeOfWorship.geo;
      assert.ok(geo && geo['@type'] === 'GeoCoordinates', 'Geo must have @type GeoCoordinates');
      assert.strictEqual(geo.latitude, 51.4882, 'Latitude must be 51.4882');
      assert.strictEqual(geo.longitude, -0.1378, 'Longitude must be -0.1378');

      // Verify opening hours
      assert.ok(
        Array.isArray(placeOfWorship.openingHoursSpecification) && placeOfWorship.openingHoursSpecification.length >= 2,
        'Must specify at least 2 opening hours specifications'
      );
    }
  });

  await t.test('Tier 2: Open Graph and Twitter Card social sharing metadata completeness', async () => {
    const pages = [
      { file: 'index.html', expectedLocale: 'en_GB' },
      { file: 'am/index.html', expectedLocale: 'am_ET' },
      { file: 'privacy/index.html', expectedLocale: 'en_GB' },
      { file: 'am/privacy/index.html', expectedLocale: 'am_ET' },
      { file: 'accessibility/index.html', expectedLocale: 'en_GB' },
      { file: 'am/accessibility/index.html', expectedLocale: 'am_ET' },
    ];

    for (const { file, expectedLocale } of pages) {
      const { document } = loadHtmlPage(file);
      const meta = extractMetaTags(document);

      // Open Graph
      assert.strictEqual(meta['og:type'], 'website', `og:type must be website on ${file}`);
      assert.ok(meta['og:title'] && meta['og:title'].length > 3, `og:title must be present on ${file}`);
      assert.ok(meta['og:description'] && meta['og:description'].length > 10, `og:description must be present on ${file}`);
      assert.ok(meta['og:url'] && meta['og:url'].startsWith('https://felegegenet.org.uk'), `og:url must be valid on ${file}`);
      assert.strictEqual(meta['og:locale'], expectedLocale, `og:locale on ${file} must be ${expectedLocale}`);

      // Twitter Cards
      assert.strictEqual(meta['twitter:card'], 'summary', `twitter:card must be summary on ${file}`);
      assert.ok(meta['twitter:title'], `twitter:title must be present on ${file}`);
      assert.ok(meta['twitter:description'], `twitter:description must be present on ${file}`);
    }
  });

  await t.test('Tier 3: Internal anchor link and subpage crawler integrity (zero dead links)', async () => {
    const pages = [
      'index.html',
      'am/index.html',
      'privacy/index.html',
      'am/privacy/index.html',
      'accessibility/index.html',
      'am/accessibility/index.html',
    ];

    for (const page of pages) {
      const { document } = loadHtmlPage(page);
      const links = Array.from(document.querySelectorAll('a[href]'));

      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href) continue;

        // 1. Same-page anchor links (e.g. href="#services")
        if (href.startsWith('#')) {
          const targetId = href.slice(1);
          if (targetId) {
            const targetEl = document.getElementById(targetId);
            assert.ok(targetEl, `Anchor link ${href} on ${page} points to non-existent ID #${targetId}`);
          }
        }

        // 2. Cross-section or subpage anchor links (e.g. href="/#services" or href="/am#services")
        if (href.startsWith('/#') || href.startsWith('/am#')) {
          const [route, targetId] = href.split('#');
          const targetHtml = route === '/' ? 'index.html' : 'am/index.html';
          const { document: targetDoc } = loadHtmlPage(targetHtml);
          const targetEl = targetDoc.getElementById(targetId);
          assert.ok(targetEl, `Cross-page anchor link ${href} on ${page} points to non-existent ID #${targetId} in ${targetHtml}`);
        }

        // 3. Relative internal routes (e.g. href="/privacy")
        if (href.startsWith('/') && !href.startsWith('//') && !href.includes('#')) {
          let targetPath = path.join(distDir, href);
          if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
            targetPath = path.join(targetPath, 'index.html');
          } else if (!fs.existsSync(targetPath)) {
            targetPath = `${targetPath}.html`;
          }
          assert.ok(
            fs.existsSync(targetPath),
            `Internal link href="${href}" on ${page} resolves to non-existent file: ${targetPath}`
          );
        }
      }
    }
  });

  await t.test('Tier 3: Sitemap and robots.txt completeness reconciliation', async () => {
    const robotsPath = path.join(distDir, 'robots.txt');
    const sitemapPath = path.join(distDir, 'sitemap.xml');

    const robotsContent = fs.readFileSync(robotsPath, 'utf8');
    const sitemapContent = fs.readFileSync(sitemapPath, 'utf8');

    assert.ok(
      robotsContent.includes('Sitemap: https://felegegenet.org.uk/sitemap.xml'),
      'robots.txt must reference the canonical sitemap.xml'
    );

    const expectedSitemapUrls = [
      'https://felegegenet.org.uk/',
      'https://felegegenet.org.uk/am',
      'https://felegegenet.org.uk/privacy',
      'https://felegegenet.org.uk/am/privacy',
      'https://felegegenet.org.uk/accessibility',
      'https://felegegenet.org.uk/am/accessibility',
    ];

    for (const url of expectedSitemapUrls) {
      assert.ok(
        sitemapContent.includes(`<loc>${url}</loc>`) || sitemapContent.includes(url),
        `sitemap.xml must include canonical route: ${url}`
      );
    }
  });
});
