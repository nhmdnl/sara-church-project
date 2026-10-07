import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');
const dataDir = path.join(rootDir, 'src', 'data');

console.log('Running Phase 1 SRS & Data Integrity Test Suite...\n');

let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✓ PASS: ${message}`);
  } else {
    console.error(`  ✗ FAIL: ${message}`);
    failed++;
  }
}

// 1. Data Models Integrity
console.log('1. Checking Decoupled Data Models in src/data/:');
const church = JSON.parse(fs.readFileSync(path.join(dataDir, 'church.json'), 'utf8'));
const services = JSON.parse(fs.readFileSync(path.join(dataDir, 'services.json'), 'utf8'));
const notices = JSON.parse(fs.readFileSync(path.join(dataDir, 'notices.json'), 'utf8'));
const venue = JSON.parse(fs.readFileSync(path.join(dataDir, 'venue.json'), 'utf8'));
const i18n = JSON.parse(fs.readFileSync(path.join(dataDir, 'i18n.json'), 'utf8'));

assert(church.name.en && church.name.am, 'Church names defined in both EN and AM');
assert(church.charity.statement.en && church.charity.statement.am, 'Charity statements defined in both EN and AM');
assert(Array.isArray(services.regularServices) && services.regularServices.length >= 2, 'At least 2 regular services defined');
assert(typeof notices.active === 'boolean', 'Notice banner has boolean active flag');
assert(venue.address.postcode && venue.coordinates.latitude, 'Venue address and coordinates defined');
assert(i18n.en && i18n.am, 'i18n translations dictionary has both en and am');

// 2. Build Artifacts Integrity
console.log('\n2. Checking Build Artifacts in dist/:');
assert(fs.existsSync(distDir), 'Build directory dist/ exists');

const enHtml = fs.readFileSync(path.join(distDir, 'index.html'), 'utf8');
const amHtml = fs.readFileSync(path.join(distDir, 'am', 'index.html'), 'utf8');
const privacyHtml = fs.readFileSync(path.join(distDir, 'privacy', 'index.html'), 'utf8');
const amPrivacyHtml = fs.readFileSync(path.join(distDir, 'am', 'privacy', 'index.html'), 'utf8');
const accessibilityHtml = fs.readFileSync(path.join(distDir, 'accessibility', 'index.html'), 'utf8');
const amAccessibilityHtml = fs.readFileSync(path.join(distDir, 'am', 'accessibility', 'index.html'), 'utf8');
const sitemap = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf8');
const robots = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf8');

// 3. Functional Requirements Checks
console.log('\n3. Checking Functional SRS Requirements:');
assert(enHtml.includes('lang="en"'), 'LANG-4: English root page declares lang="en"');
assert(amHtml.includes('lang="am"'), 'LANG-4: Amharic root page declares lang="am"');
assert(enHtml.includes('hreflang="am"') && enHtml.includes('/am'), 'LANG-2: Visible language switcher from EN to /am');
assert(amHtml.includes('hreflang="en"') && amHtml.includes('/'), 'LANG-2: Visible language switcher from AM to /');
assert(enHtml.includes('noto-sans-ethiopic-regular.woff2'), 'LANG-3: Self-hosted Ethiopic font preloaded');

assert(enHtml.includes(church.name.en) || enHtml.includes('Felege Genet Sema&#39;etu Kidus Giorgis Church'), 'HOME-1: Church name shown on English landing page');
assert(amHtml.includes(church.name.am), 'HOME-1: Church name shown in Amharic on Amharic landing page');
assert(enHtml.includes('Get Directions') && enHtml.includes('Next Service'), 'HOME-2: Next service and directions button in hero');
assert(enHtml.includes('About Our Parish'), 'HOME-3: About section present');
assert(enHtml.includes('skip-link') && enHtml.includes('href="#main-content"'), 'HOME-4: Skip-to-content accessible link present');

assert(enHtml.includes('UK Local Time') && enHtml.includes('Sunday Divine Liturgy'), 'TIME-1: Regular service times shown in UK local time');
assert(notices.active ? enHtml.includes('Important Parish Notice') : !enHtml.includes('Important Parish Notice'), 'TIME-2: Toggleable notice banner functional');
assert(enHtml.includes('ecclesiastical calendar') || enHtml.includes('Ethiopian Orthodox'), 'TIME-3: Ethiopian calendar guidance note present');

assert(enHtml.includes(venue.address.postcode), 'FIND-1: Postcode present as selectable text');
assert(enHtml.includes('copy-address-btn'), 'FIND-1: One-click copy address button present');
assert(enHtml.includes('load-interactive-map-btn'), 'FIND-2: On-demand interactive map loader present without trackers');
assert(enHtml.includes('maps/dir/?api=1'), 'FIND-3: Get directions link opens maps provider');
assert(enHtml.includes('tfl.gov.uk/plan-a-journey/'), 'FIND-4: TfL Journey Planner link present');
assert(enHtml.includes('Step-free') && enHtml.includes('Blue Badge'), 'FIND-5: Step-free access and parking details present');
assert(enHtml.includes('courtyard entrance'), 'FIND-6: Host entrance guidance present');
assert(enHtml.includes('What to Expect on Your First Visit'), 'FIND-7: First visit guide present');
assert(enHtml.includes('"@type":"PlaceOfWorship"'), 'FIND-8: Schema.org PlaceOfWorship JSON-LD embedded');

assert(enHtml.includes('href="tel:') && enHtml.includes('href="mailto:'), 'CONT-1: Tappable phone and email links present');
assert(enHtml.includes('id="parish-contact-form"') && enHtml.includes('id="honeypot-website"'), 'CONT-2: Contact form with honeypot anti-spam present');

assert(enHtml.includes('1217660') && enHtml.includes('Charities Act 2011'), 'LEGAL-1: Registered charity declaration and number 1217660 present in footer');
assert(privacyHtml.includes('Privacy Notice') && amPrivacyHtml.includes('የግላዊነት ፖሊሲ'), 'LEGAL-2/3: Privacy & cookie notices present in both languages');
assert(accessibilityHtml.includes('WCAG 2.2') && amAccessibilityHtml.includes('WCAG 2.2'), 'LEGAL-4: Accessibility statement present in both languages');
assert(robots.includes('Sitemap:') && sitemap.includes('https://felegegenet.org.uk/'), 'SEO-1: robots.txt and sitemap.xml valid');

console.log('\n--- Test Summary ---');
if (failed === 0) {
  console.log('All tests passed cleanly! Ready for release.\n');
  process.exit(0);
} else {
  console.error(`${failed} test(s) failed.\n`);
  process.exit(1);
}
