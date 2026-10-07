# Task Assignment: E2E Testing Suite Creation (Dual Track)

## Identity
- Role: E2E Test Suite Creator
- Archetype: teamwork_preview_test_writer
- Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_test_writer_track_1
- Parent Orchestrator: 0f522afa-1e5f-4eef-bdae-ce56c032562e

## Mission
Design and implement the comprehensive opaque-box E2E test suite derived from user requirements and Phase 1 specifications.
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_orchestrator_1/PROJECT.md
- /home/devnhm/Projects/Sara Church Project/SRS.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_explorer_survey_2/handoff.md

Build the test infrastructure and test suites in `test/` following the 4-tier methodology:
1. **Tier 1 - Feature Coverage**: Test all features across R1–R5 (responsive layouts, accessibility basics, copy address, map on-demand, contact honeypot, Ethiopic fonts, language routing, legal footer).
2. **Tier 2 - Boundary & Corner Cases**: Test 320px narrow mobile, 375px, 768px, 1024px, 1440px viewports; honeypot bot trap; missing form fields; clipboard fallback; Amharic line wrapping; inactive notices.
3. **Tier 3 - Cross-Feature Interactions**: Test language switcher preserving subpages (`/privacy` ↔ `/am/privacy`, `/accessibility` ↔ `/am/accessibility`); canonical and alternate hreflang cluster consistency; mobile drawer focus + navigation.
4. **Tier 4 - Real-World Scenarios**: Complete parishioner and first-time visitor flows in English and Amharic.
5. **Axe-core / WCAG 2.2 AA audit integration**: Automated accessibility verification of color contrast, touch targets >= 44x44px, base text >= 18px, skip-link, labels.
6. **Production Build & Bundle Size Budget**: Verify bundle is strictly < 1MB.
7. **Schema.org PlaceOfWorship JSON-LD Validation**: Validate JSON-LD syntax and required schema.org fields.

Write `TEST_INFRA.md` at project root or working directory.
When tests pass, publish `/home/devnhm/Projects/Sara Church Project/TEST_READY.md`.
Run the test runner and verify execution.
Write your full report to `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_test_writer_track_1/handoff.md`.


## 2026-10-06T23:18:25Z
You are the E2E Test Suite Creator for Sara Church Project.
Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_test_writer_track_1
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_orchestrator_1/PROJECT.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_explorer_survey_2/handoff.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_test_writer_track_1/DISPATCH.md

Implement the comprehensive 4-tier E2E test suite in test/ covering all 5 user requirements (R1-R5).
Include tests for:
- R1: Responsive viewports (320px, 375px, 768px, 1024px, 1440px)
- R2: WCAG 2.2 AA (contrast >= 4.5:1, touch targets >= 44x44px, base text >= 18px, focus rings, skip link, dynamic ARIA)
- R3: Interactive flow & privacy (clipboard address copy, on-demand OSM map with zero initial trackers, directions links, honeypot spam protection & form validation)
- R4: Ethiopic typography (Noto Sans Ethiopic WOFF2, line height >= 1.75/1.8, no tofu/clipping) & bilingual route switching preserving subpages
- R5: Production build, bundle size strictly < 1MB, Open Graph & Twitter Cards, Schema.org PlaceOfWorship JSON-LD validity.

Write TEST_INFRA.md, run the tests to verify execution, and publish /home/devnhm/Projects/Sara Church Project/TEST_READY.md.
Write your full report to /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_test_writer_track_1/handoff.md.
Send a message to parent (0f522afa-1e5f-4eef-bdae-ce56c032562e) when complete.
