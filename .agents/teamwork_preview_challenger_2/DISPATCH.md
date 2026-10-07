# Task Assignment: Adversarial Interactive & Privacy Stress Testing (Challenger 2)

## Identity
- Role: Interactive & Privacy Adversarial Challenger
- Archetype: teamwork_preview_challenger
- Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_2
- Parent Orchestrator: 0f522afa-1e5f-4eef-bdae-ce56c032562e

## Mission
Perform empirical adversarial stress testing on interactive flows, privacy compliance, and localization routing.
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/TEST_READY.md

Conduct adversarial experiments:
1. **Zero-Tracker Map Privacy Stress**:
   - Verify network request logs on initial page load: strictly 0 third-party requests, 0 cookies set, 0 iframe network connections before explicit click on `#load-interactive-map-btn`.
   - Verify that clicking the button successfully mounts the map and triggers accessible announcements.
2. **Address Copy & Fallbacks**:
   - Stress test clipboard copy with navigator.clipboard denied/rejected, verifying off-screen textarea fallback execution and polite aria-live announcement.
3. **Contact Form Honeypot & Validation Attack**:
   - Test automated spam submission where `#honeypot-website` is populated: verify silent rejection and zero network dispatch.
   - Test edge-case inputs (XSS payloads, missing fields, invalid emails): verify form validation stops submission and applies `aria-invalid="true"`.
4. **Bilingual Subpage Routing Invariance**:
   - Test all language toggling cycles across root, `/privacy`, `/accessibility` to guarantee no route degradation or `/am/am` corruption occurs.
5. Issue a clear verdict: **APPROVE** or **REQUEST_CHANGES**.
6. Write your full report to `/home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_2/handoff.md`.

## 2026-10-06T23:54:28Z
You are Challenger 2 (Interactive & Privacy Adversarial Challenger) for Sara Church Project.
Working Directory: /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_2
Read:
- /home/devnhm/Projects/Sara Church Project/.agents/ORIGINAL_REQUEST.md
- /home/devnhm/Projects/Sara Church Project/TEST_READY.md
- /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_2/DISPATCH.md

Conduct empirical stress testing on interactive flows and privacy:
- Verify zero network requests / cookies prior to clicking on-demand map.
- Stress test address clipboard copy with navigator.clipboard denied to verify fallback.
- Stress test contact form honeypot bot trap and client validation states.
- Verify subpage language switching cycles without route corruption.
Issue a verdict: APPROVE or REQUEST_CHANGES.
Write your handoff report to /home/devnhm/Projects/Sara Church Project/.agents/teamwork_preview_challenger_2/handoff.md.
Send a message to parent (0f522afa-1e5f-4eef-bdae-ce56c032562e) when complete.
