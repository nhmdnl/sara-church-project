# Dispatch — teamwork_preview_worker_fix_3

## 2026-10-07T02:13:00Z

### Mission
Fix the 200% root font scaling reflow defect in `Header.astro` / `BaseLayout.astro` (and any related layout components) so that `node test/challenger-layout-stress.test.js` passes all 9/9 tests with 0 failures, while preserving 100% pass rate in `node test/run-all-tests.js` (76/76 checks), `pnpm test` (28/28 checks), and `node test/adversarial-challenger-2.test.js` (15/15 checks).

### Working Directory
`/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_worker_fix_3`

### Authoritative Reference Files
- User Request: `/home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md` (MUST read first)
- Challenger 1 Handoff: `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_1/handoff.md`
- Master Project Doc: `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_orchestrator_1/PROJECT.md`
- Gate Status: `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_orchestrator_1/GATE_STATUS.md`

### Write Ownership
You exclusively own:
- `src/components/Header.astro`
- `src/layouts/BaseLayout.astro`
- `src/styles/global.css`
- `src/components/Contact.astro`
- And any layout component needed to resolve 200% root font scaling overflow.

### Key Problem Context
In `test/challenger-layout-stress.test.js`, Suite 3 tests:
`Reflow: 200% root font scaling without horizontal overflow or header collision`
When root font size is set to 36px (200% of 18px base) on a 360px viewport:
1. In `Header.astro`, the brand container and the mobile button cluster (`shrink-0`, language switcher, menu button) expand with large font size, causing the elements to push past 360px (reaching up to 584px width, excess 224px).
2. Look at how the brand title, logo, and mobile button cluster interact under 200% font scaling: ensure flex wrapping, `min-w-0`, responsive text sizing (e.g. `clamp` or `max-w-full`, or allowing title to wrap/shrink without overflowing the screen), while ensuring tap targets remain at least 44x44px and brand title remains legible.
3. Also verify if there is any other route or element that overflows under 200% root font scaling on 360px viewport.

### Verification Commands
Run and confirm all pass:
1. `node test/challenger-layout-stress.test.js` (MUST pass 9/9)
2. `node test/run-all-tests.js` (MUST pass 76/76)
3. `pnpm test` (MUST pass 28/28)
4. `node test/adversarial-challenger-2.test.js` (MUST pass 15/15)

### Mandatory Standing Instructions
1. Run `hub brief` first before planning or editing anything.
2. DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.
3. Write your findings, diff summary, build/test outputs, and verification details in `handoff.md` in your working directory.
4. When finished, send a message to orchestrator with your verdict and handoff path.
