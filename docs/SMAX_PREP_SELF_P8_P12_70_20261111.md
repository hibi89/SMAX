# SMAX² PREP+SELF P8–P12: 70% provisional engineering checkpoint
Checked 2026-11-11 KST. Private hibi89/SMAX, feature/prep-self-owner-mapping-p8, forked from preprocessing 3830cb276f560d58e8181ba384d9cbe64815737c.

## Functional changes
- P8: owner-editable offline column mapping HTML and downloaded draft JSON; source SHA-256 tied to exact local CSV. Date/channel/amount must be three distinct explicitly selected columns; no automatic approval, source rows or upload.
- P9: re-check original CSV digest and selected typed columns; connect to existing PREP Generic CSV and SELF draft aggregate gate via read-only CLI, with forged approval/modified source rejected.
- P10: convert owner-bound preview into pre-existing strict P5 single-source batch receipt so P6 CSP offline HTML renderer can present HOLD or sums without leaking rows.
- P11: new exclusive local folder containing receipt.json, report.html and final sha256 manifest.json, with independent hash and symlink/tamper/re-render checks. No original file overwritten.
- P12: one-command --package CLI connecting P9 -> P10/P6 -> P11, no separate percent credit.
Architecture compared: silent inferred mapping/automatic import (unsafe) versus explicit local browser-only mapping and verification (chosen: predictable, zero online/API cost and fewer permission risks).

## User flow (all local, review only)
node preprocessing/self-owner-cli.mjs --form /absolute/source.csv /absolute/new-form.html
[Open HTML, choose headers, save owner-mapping.json]
node preprocessing/self-owner-cli.mjs --preview /absolute/source.csv /absolute/owner-mapping.json
node preprocessing/self-owner-delivery-cli.mjs --package /absolute/source.csv /absolute/owner-mapping.json /absolute/new-report-dir
These commands are feature source entrypoints; full authentic CLI run has not been established by the focused tests below.

## Evidence
- Node v22.16 Linux targeted 17 PASS / 0 FAIL / 0 SKIP for tests/self-owner-mapping.test.mjs, self-owner-preview.test.mjs, self-owner-delivery.test.mjs. These test real standalone source; P9 service links are injected doubles, P11 HTML renderer is a test renderer.
- Local Chromium Playwright set_content form interaction: three actual selects and JSON download PASS; JS page errors 0 and outgoing requests 0. Direct file:// navigation blocked by ERR_BLOCKED_BY_ADMINISTRATOR and physical Windows not verified.
- Exact GitHub source/test blob SHA parity: owner-mapping c66acb2a7, owner-preview 013051d8, owner-delivery 85215985, corresponding tests ad58384c, abac91d9, e88d29ff.
- Additional isolated V8 checks using actual GitHub private source: existing CSV parser, Generic PREP, SELF sales and P9 calculated synthetic two-row 100.00 - 10.00 = 90.00. Crypto and Buffer/TextEncoder were stubs. Existing actual P6 renderer accepted P10 report, hid money on HOLD and rejected forged sums. P12 exact source accepted only safe arguments and matching proof with injected services.
- UNVERIFIED: full original Private repo native npm test/test:preprocessing, nonstub end-to-end P8->P12 real file/Windows Edge, trusted customer files/rights, real Self UI bundle, installer and seller QA. Do not expand scoped PASS to product release.

## Completion accounting, limits and rollback
SMAX² baseline final-product feature estimate 50% provisional. P8 user editing +5pp, P9 source-bound P3 preview bridge +5pp, P10 P5/P6 verified receipt handoff +5pp, P11 three-file integrity-checked local handoff +5pp = **70% provisional engineering scope**, NOT saleable or full test coverage. P12 is wiring and not double-counted.
RELEASE HOLD. No original customer files, secrets, external model calls, publishing, billing or account changes. Main/frontend/backend and stable preprocessing untouched, independent feature branch only; no force merge. Next: exact-SHA full Native suites, genuine input and CLI acceptance, physical Windows install/upgrade/file-open, customer rights, owner consent and PREP/SELF cross-branch integration. This is not production verification.
