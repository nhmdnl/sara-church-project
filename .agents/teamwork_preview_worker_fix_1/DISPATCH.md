# Task Assignment: Fix E2E Test Suite Escalated Defects

## Identity
- Role: Implementation Worker
- Archetype: teamwork_preview_worker
- Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_1
- Parent Orchestrator: 0f522afa-1e5f-4eef-bdae-ce56c032562e

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own:
- `src/pages/privacy.astro`
- `src/pages/am/privacy.astro`
- `src/pages/accessibility.astro`
- `src/pages/am/accessibility.astro`
- `src/components/Header.astro`
- `src/styles/global.css`

## Objectives
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/TEST_READY.md
- /home/devnhm/Projects/Sara Church Project/TEST_INFRA.md

Fix the 3 escalated defects from `TEST_READY.md`:
1. **DEFECT-R1.1: Subpage Horizontal Overflow at 320px Viewport**:
   - In `src/pages/privacy.astro`, `src/pages/am/privacy.astro`, `src/pages/accessibility.astro`, `src/pages/am/accessibility.astro`, ensure unbroken email addresses (`info@felegegenet.org.uk`) and code/links wrap cleanly without horizontal overflow at 320px viewport (add `break-words` or `break-all` class to email links/prose).
2. **DEFECT-R2.1: WCAG SC 2.5.3 (Label in Name Mismatch)**:
   - In `src/components/Header.astro`, on the brand home link (`<a href={homeUrl} ...>`), fix the accessible name mismatch flagged by axe-core. Ensure visible text matches the accessible name or remove the discordant `aria-label` override so screen readers and speech recognition users see matching visible and accessible labels.
3. **DEFECT-R2.2: WCAG SC 1.4.11 (Non-Text Focus Contrast Ratio)**:
   - In `src/styles/global.css`, ensure focus indicators (`:focus-visible`) maintain a contrast ratio of $\ge 3.0:1$ against all backgrounds, including burgundy (`#661622`). Adjust the focus outline color (e.g. high-visibility `#ffffff` or light gold `#c98e26` / `#d4a038` with clear outline-offset) so it passes the WCAG SC 1.4.11 contrast calculation against both light cream and dark burgundy backgrounds.

## Verification
- Run `pnpm build`
- Run `pnpm test:e2e` (or `node test/run-all-tests.js`) to verify that all 7 test suites pass 100% (76/76 checks passing, 0 failures).
- Write your handoff report to `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_1/handoff.md`.

## 2026-10-06T23:38:11Z
You are the Implementation Worker resolving E2E test suite defects for Sara Church Project.
Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_1
Fix DEFECT-R1.1, DEFECT-R2.1, and DEFECT-R2.2.
Verify 100% pass (76/76 checks).
Write handoff.md and send message to parent.

## 2026-10-06T23:50:25Z
**Context**: E2E defect remediation status.
**Content**: Checking in on your progress fixing DEFECT-R1.1, DEFECT-R2.1, DEFECT-R2.2, and pnpm test:e2e results.
**Action**: Please update progress.md and let me know your current status.
