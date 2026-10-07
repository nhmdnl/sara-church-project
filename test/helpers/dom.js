import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(__dirname, '../../dist');

export function loadHtmlPage(relativeSubpath) {
  const filePath = path.join(distDir, relativeSubpath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const html = fs.readFileSync(filePath, 'utf8');
  const dom = new JSDOM(html, {
    url: 'https://felegegenet.org.uk' + (relativeSubpath === 'index.html' ? '/' : '/' + relativeSubpath.replace(/\/index\.html$/, '')),
    runScripts: 'outside-only',
  });
  return {
    dom,
    window: dom.window,
    document: dom.window.document,
    html,
    filePath,
  };
}

export function parseJsonLd(document) {
  const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
  return scripts.map((s) => {
    try {
      return JSON.parse(s.textContent || '{}');
    } catch (e) {
      return { _parseError: e.message, raw: s.textContent };
    }
  });
}

export function extractMetaTags(document) {
  const metas = Array.from(document.querySelectorAll('meta'));
  const tags = {};
  for (const m of metas) {
    const key = m.getAttribute('name') || m.getAttribute('property');
    const content = m.getAttribute('content');
    if (key && content !== null) {
      tags[key] = content;
    }
  }
  return tags;
}

export function extractLinks(document) {
  const links = Array.from(document.querySelectorAll('link'));
  return links.map((l) => ({
    rel: l.getAttribute('rel'),
    href: l.getAttribute('href'),
    hreflang: l.getAttribute('hreflang'),
    as: l.getAttribute('as'),
    type: l.getAttribute('type'),
  }));
}

// WCAG relative luminance & contrast calculation
function sRGBtoLinear(c) {
  const v = c / 255;
  return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

function hexToRgb(hex) {
  const cleanHex = hex.replace('#', '').trim();
  if (cleanHex.length === 3) {
    return [
      parseInt(cleanHex[0] + cleanHex[0], 16),
      parseInt(cleanHex[1] + cleanHex[1], 16),
      parseInt(cleanHex[2] + cleanHex[2], 16),
    ];
  }
  return [
    parseInt(cleanHex.substring(0, 2), 16),
    parseInt(cleanHex.substring(2, 4), 16),
    parseInt(cleanHex.substring(4, 6), 16),
  ];
}

export function relativeLuminance(hex) {
  const [r, g, b] = hexToRgb(hex);
  return 0.2126 * sRGBtoLinear(r) + 0.7152 * sRGBtoLinear(g) + 0.0722 * sRGBtoLinear(b);
}

export function contrastRatio(hex1, hex2) {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}
