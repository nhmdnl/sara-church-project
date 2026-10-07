# Task Assignment: Remediate Adversarial Layout Defects (Challenger 1 Feedback)

## Identity
- Role: Layout Remediation Worker
- Archetype: teamwork_preview_worker
- Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_2
- Parent Orchestrator: 0f522afa-1e5f-4eef-bdae-ce56c032562e

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Write Ownership
You exclusively own and may edit:
- `src/components/About.astro`
- `src/components/Services.astro`
- `src/components/FindUs.astro`
- `src/components/Contact.astro`
- `src/components/Header.astro`
- `src/styles/global.css`

## Objectives
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_1/handoff.md
- /home/devnhm/Projects/Sara Church Project/test/challenger-layout-stress.test.js

Remediate the 3 layout defects identified by Challenger 1:
1. **Fix Sticky Header Anchor Obstruction**:
   - In `src/components/About.astro`, `Services.astro`, `FindUs.astro`, and `Contact.astro`, add `scroll-mt-24 sm:scroll-mt-28` to the root `<section id="...">` element so headings are never obscured by the sticky header when jumping to `#about`, `#services`, `#find-us`, and `#contact`.
2. **Fix Ethiopic Line-Height Collapse**:
   - In `src/styles/global.css`, enforce un-collapsed line heights for Ethiopic text elements so Tailwind utility classes (`text-sm`, `text-xs`) cannot reduce Amharic line height below 1.8:
     ```css
     :lang(am) p,
     :lang(am) li,
     :lang(am) address,
     :lang(am) dd,
     :lang(am) dt,
     :lang(am) td,
     :lang(am) span {
       line-height: 1.8 !important;
     }
     ```
3. **Fix 200% Font Scaling Reflow on Mobile (360px)**:
   - In `src/components/Header.astro`, add `min-w-0` to the brand home link container, ensure brand text wraps gracefully, and allow the header container to handle 200% font zoom without horizontal overflow.
   - In `src/components/Contact.astro`, add `min-w-0 flex-1` to the inner `.space-y-1` text containers (lines 45 and 68).

## Verification
- Run `pnpm build`
- Run `node --test test/challenger-layout-stress.test.js` to verify all 9 tests pass (pass 9, fail 0).
- Run `pnpm test:e2e` to verify all 7 master suites pass (76/76 checks passing).
- Run `node --test test/adversarial-challenger-2.test.js` to verify all 15 checks pass.
- Write your full handoff report to `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_2/handoff.md`.
- Send message to parent orchestrator when complete.

## 2026-10-07T00:09:00Z
You are the Layout Remediation Worker for Sara Church Project.
Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_2
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_1/handoff.md
- /home/devnhm/Projects/Sara Church Project/test/challenger-layout-stress.test.js
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_2/DISPATCH.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Exclusively owned files:
- src/components/About.astro
- src/components/Services.astro
- src/components/FindUs.astro
- src/components/Contact.astro
- src/components/Header.astro
- src/styles/global.css

Remediate the 3 layout defects identified by Challenger 1 (add scroll-mt-24 sm:scroll-mt-28 to sections, enforce line-height: 1.8 !important on Amharic text in global.css, fix 200% zoom reflow in Header and Contact).
Run `pnpm build`, `node --test test/challenger-layout-stress.test.js`, and `pnpm test:e2e` to verify all tests pass 100%.
Write your handoff report to /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_2/handoff.md.
Send message to parent (0f522afa-1e5f-4eef-bdae-ce56c032562e) when complete.
