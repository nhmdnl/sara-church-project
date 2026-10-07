import { spawn } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');

const SUITES = [
  {
    id: 'SRS-SPEC',
    req: 'SRS v0.1 Baseline',
    tiers: 'T1, T2',
    name: 'SRS Specification & Data Integrity',
    file: 'test/srs-spec.test.js',
    useNodeTest: false,
  },
  {
    id: 'R1-RESPONSIVE',
    req: 'R1 (Responsive UI/UX)',
    tiers: 'T1, T2, T3, T4',
    name: 'Multi-Viewport & Responsive Layouts (320px–1440px)',
    file: 'test/r1-responsive.test.js',
    useNodeTest: true,
  },
  {
    id: 'R2-WCAG',
    req: 'R2 (WCAG 2.2 AA)',
    tiers: 'T1, T2, T3',
    name: 'Axe-core, Contrast, Touch Targets, Keyboard & ARIA',
    file: 'test/r2-wcag-a11y.test.js',
    useNodeTest: true,
  },
  {
    id: 'R3-INTERACTIVE',
    req: 'R3 (Interactive & Privacy)',
    tiers: 'T1, T2, T3, T4',
    name: 'Clipboard, On-Demand Map, Form Validation & Honeypot',
    file: 'test/r3-interactive-privacy.test.js',
    useNodeTest: true,
  },
  {
    id: 'R4-I18N',
    req: 'R4 (Ethiopic & i18n)',
    tiers: 'T1, T2, T3, T4',
    name: 'Font Coverage, Line Height, Subpage Routing & Parity',
    file: 'test/r4-ethiopic-i18n.test.js',
    useNodeTest: true,
  },
  {
    id: 'R5-PROD-SEO',
    req: 'R5 (Production & SEO)',
    tiers: 'T1, T2, T3',
    name: 'Bundle Budget (<1MB), PlaceOfWorship JSON-LD & OG Meta',
    file: 'test/r5-production-seo.test.js',
    useNodeTest: true,
  },
  {
    id: 'E2E-SCENARIOS',
    req: 'Tier 4 User Journeys',
    tiers: 'T4',
    name: 'Parishioner, First-Time Visitor & Legal Trust Flows',
    file: 'test/e2e-scenarios.test.js',
    useNodeTest: true,
  },
];

function runSuite(suite) {
  return new Promise((resolve) => {
    const startTime = Date.now();
    const args = suite.useNodeTest ? ['--test', suite.file] : [suite.file];
    const proc = spawn('node', args, { cwd: rootDir, stdio: ['pipe', 'pipe', 'pipe'] });

    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d.toString();
    });

    proc.stderr.on('data', (d) => {
      stderr += d.toString();
    });

    proc.on('close', (code) => {
      const duration = Date.now() - startTime;
      const combinedOutput = stdout + stderr;

      // Extract pass/fail counts
      let passed = 0;
      let failed = 0;

      if (suite.useNodeTest) {
        const passMatch = combinedOutput.match(/ℹ pass (\d+)/);
        const failMatch = combinedOutput.match(/ℹ fail (\d+)/);
        passed = passMatch ? parseInt(passMatch[1], 10) : 0;
        failed = failMatch ? parseInt(failMatch[1], 10) : 0;
      } else {
        const passMatches = (combinedOutput.match(/✓ PASS/g) || []).length;
        const failMatches = (combinedOutput.match(/✗ FAIL/g) || []).length;
        passed = passMatches;
        failed = failMatches;
      }

      resolve({
        ...suite,
        exitCode: code,
        passed,
        failed,
        total: passed + failed,
        duration,
        output: combinedOutput,
      });
    });
  });
}

console.log('================================================================================');
console.log('  FELEGE GENET CHURCH — COMPREHENSIVE 4-TIER E2E VERIFICATION TEST RUNNER       ');
console.log('  Covering Requirements R1–R5, WCAG 2.2 AA, Ethiopic i18n & User Journeys       ');
console.log('================================================================================\n');

async function main() {
  const results = [];

  for (const suite of SUITES) {
    process.stdout.write(`⏳ Running [${suite.id}] ${suite.name}... `);
    const res = await runSuite(suite);
    results.push(res);

    if (res.exitCode === 0) {
      console.log(`\x1b[32m✔ PASS\x1b[0m (${res.passed}/${res.total} tests in ${(res.duration / 1000).toFixed(2)}s)`);
    } else {
      console.log(`\x1b[31m✖ DEFECTS\x1b[0m (${res.passed}/${res.total} passed, ${res.failed} failed in ${(res.duration / 1000).toFixed(2)}s)`);
    }
  }

  console.log('\n================================================================================');
  console.log('                             TEST EXECUTION SUMMARY                             ');
  console.log('================================================================================');
  console.log(
    'ID'.padEnd(16) +
    'REQUIREMENT'.padEnd(24) +
    'TIERS'.padEnd(14) +
    'RESULTS'.padEnd(14) +
    'STATUS'
  );
  console.log('-'.repeat(80));

  let totalPassed = 0;
  let totalFailed = 0;
  let suitesPassed = 0;
  let suitesFailed = 0;

  for (const r of results) {
    totalPassed += r.passed;
    totalFailed += r.failed;
    if (r.exitCode === 0) suitesPassed++;
    else suitesFailed++;

    const statusBadge = r.exitCode === 0 ? '\x1b[32mPASS\x1b[0m' : '\x1b[31mDEFECTS\x1b[0m';
    console.log(
      r.id.padEnd(16) +
      r.req.padEnd(24) +
      r.tiers.padEnd(14) +
      `${r.passed}/${r.total}`.padEnd(14) +
      statusBadge
    );
  }

  console.log('='.repeat(80));
  console.log(`Total Test Suites: ${results.length} | Passed: ${suitesPassed} | With Defects: ${suitesFailed}`);
  console.log(`Total Checks:      ${totalPassed + totalFailed} | Passed: ${totalPassed} | Failed: ${totalFailed}`);
  console.log('='.repeat(80));

  if (suitesFailed > 0) {
    console.log('\n🔍 DETECTED IMPLEMENTATION DEFECTS TO ESCALATE:');
    console.log('--------------------------------------------------------------------------------');

    for (const r of results) {
      if (r.exitCode !== 0) {
        console.log(`\n▶ Suite [${r.id}] — ${r.name}:`);
        const lines = r.output.split('\n');
        const failingSection = lines
          .filter((l) => l.includes('AssertionError') || l.includes('✖') || l.includes('[SERIOUS]') || l.includes('[CRITICAL]'))
          .slice(0, 8)
          .join('\n   ');
        console.log(`   ${failingSection}`);
      }
    }
    console.log('\n--------------------------------------------------------------------------------');
    console.log('NOTE: As Test Writer, implementation bugs are cataloged above for escalation.');
    console.log('--------------------------------------------------------------------------------\n');
  } else {
    console.log('\n\x1b[32m✔ 100% OF TESTS PASSED CLEANLY! ALL REQUIREMENTS SATISFIED!\x1b[0m\n');
  }

  // Write machine-readable test summary to working directory
  const summaryJson = {
    timestamp: new Date().toISOString(),
    totalSuites: results.length,
    suitesPassed,
    suitesFailed,
    totalChecks: totalPassed + totalFailed,
    totalPassed,
    totalFailed,
    suites: results.map((r) => ({
      id: r.id,
      requirement: r.req,
      tiers: r.tiers,
      passed: r.passed,
      failed: r.failed,
      total: r.total,
      durationMs: r.duration,
      status: r.exitCode === 0 ? 'PASS' : 'FAIL',
    })),
  };

  const fs = await import('node:fs');
  fs.writeFileSync(
    path.join(__dirname, 'test-results.json'),
    JSON.stringify(summaryJson, null, 2)
  );

  process.exit(suitesFailed === 0 ? 0 : 1);
}

main().catch((err) => {
  console.error('Test runner fatal error:', err);
  process.exit(1);
});
