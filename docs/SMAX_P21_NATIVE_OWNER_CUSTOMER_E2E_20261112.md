# SMAX² P21 — Real Chromium owner CSV → Native PREP/SELF → offline review package acceptance

**Date:** 2026-11-12 KST  
**Repository:** private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`  
**Product assessment:** **80% → 85% provisional** (+5 percentage points of the full delivery scope; **NOT** test success percentage); **RELEASE HOLD** (no deployment, no real customer purchase).

## Decision and value
Previous P14 and P16 native tests existed in GitHub but had not been run together with the P20 browser customer source. Previous P19 source integration used V8/virtual filesystem test doubles, not real Node disk/crypto. That gap prevented validation of the customer's actual local workflow.

Compared **A** (add another feature or mock/virtual-FS verification: low implementation cost, poor delivery evidence) against **B** (recreate the exact GitHub modules locally and perform real Node child process + physical file E2E after real Chromium JSON download: higher initial inspection cost, zero API/runners and stronger acceptance evidence). **Selected B.** Only synthetic customer-like CSV; no external file upload, network, paid runner, database, permissions or public deployment.

## Latest implementation/evidence checked into product GitHub
- New repeatable integration: `tests/browser/self-owner-browser-to-native-e2e.py` — **actual tested Git blob `8aa8a2643c202b778353de797b1eeba989d6bc27`**, feature commit `c9091d8964406189098dc4d87141cc42c94c8cd2`.
- The test launches **real Chromium 144.0.7559.96**, loads the exact P20 static `site/owner.html`, selects physical synthetic CSV headers and creates the actual `smax-owner-mapping.json` via browser Blob download. It saves that file on disk, then executes the **real Node v22.16.0** `preprocessing/self-owner-delivery-cli.mjs --package` and `--verify` as subprocesses. All PREP/SELF, receipt, manifest, renderer and verifier imports are real checked-in modules, no filesystem/cryptography service doubles.
- Source parity: locally reconstructed and executed **20 files** with individual `git hash-object` = their existing GitHub private branch blob SHA, including `site/owner.html`, `site/csv-transform.mjs`, `site/sales-report.mjs`, `preprocessing/generic-csv.mjs`, `self-preview-gate.mjs`, `self-owner-mapping.mjs`, `self-owner-preview.mjs`, `self-owner-cli.mjs`, `self-preview-cli.mjs`, `self-preview-batch.mjs`, `self-preview-html.mjs`, `self-owner-delivery.mjs`, `self-owner-delivery-cli.mjs` and six exact original P8/P9/P12/P14/P16/P20 targeted test files. All **20/20 blobs matched**, **0 mismatches**. The 21st new P21 test SHA matched the uploaded GitHub blob.
- Existing production modules, site, static HTML, permissions, scripts, stable branches, source data and exports unchanged in P21; test+documentation only.

## Actually executed tests (Linux, isolated exact-source modules)
| Execution | Result | Scope |
| --- | --- | --- |
| `node --test tests/self-owner-mapping.test.mjs tests/self-owner-preview.test.mjs tests/self-owner-delivery.test.mjs tests/self-owner-fd-race.test.mjs tests/self-owner-e2e.test.mjs tests/self-owner-refresh.test.mjs` | **34 PASS / 0 FAIL / 0 SKIP** | Actual real Node crypto/fs, actual file E2E, P8/P9/P10/P11/P13/P14/P15/P16/P20. Includes 4 P14/P15 disk E2E and 7 P16 symlink/path-swap security tests. |
| `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-browser-to-native-e2e.py` | **27/27 checks PASS, 0 FAIL** | Browser File→JSON download→Node actual CSV file PREP/SELF package→manifest, receipt, report → verify; HOLD and BOM flows; SHA tamper, symlink, extra file, duplicate output, source-rows private; no browser requests/JS exceptions. |
| `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-refresh-e2e.py` | **25/25 checks PASS, 0 FAIL** | Existing P20 customer page safety, byte refresh, SHA match, Node P8 accept. |

Main P21 verified paths:
1. Valid two-row CSV → Korean owner column choice → browser JSON matches SHA of actual disk bytes → Node P9/P12 physical package **three exact files** and read-only native recheck success; **net 90.00**.
2. **Original bytes unchanged**, no private individual rows/channel values in HTML/stdout, `owner_approval=NOT_GRANTED`, no external transfers.
3. Existing target overwrite denied; modified `report.html`, `receipt.json`, `manifest.json`, unexpected extra file, symlinked report all rejected in actual OS filesystem.
4. Invalid calendar date → `REVIEW_HOLD`, `summary=null`, source monetary values absent, review-only package rechecks successfully.
5. Changed CSV content with stale owner JSON denied **before any output directory**; original BOM-inclusive SHA accepted through entire package; non-BOM draft for BOM original rejected.
6. Targeted existing SHA and file-race tests preserve pre-existing P16 defenses.

The original P16 test was manually restored into the isolated test folder and **initially failed to parse due a missing closing brace introduced during local copy**. We compared the local Git blob to the exact GitHub test blob, fixed only the scratch copy to match `167928a8db2cdee069460184639854a12581a211`, then ran the true checked-in source **7/7 PASS**. No repository defect or GitHub code change was caused by the scratch copy error.

## What has NOT been verified
- This is an **exact-source critical-module reconstruction**, not a complete private repository checkout. **Full `npm run test:preprocessing` / `npm test`, all XLSX/DOCX/HTML/other 10-template paths, packaging installers remain NOT_RUN.** Do not label those CI commands PASS or claim full deployment.
- The Chromium profile refuses direct `file://` and localhost navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; browser HTML was loaded through Playwright `page.set_content`. **Windows10/11 Edge/Chrome customer double-click / physical `file://` launch NOT_VERIFIED**, no Windows real-user or installer acceptance.
- No real customer data, no integrations, payment, purchase, commercial license or 10-template fully automated operation verified. **85% is a provisional overall delivery engineering judgment, NOT release-ready.**
- Existing package directory creation is documented as **not crash-atomic**; an OS/process failure during write can leave a partial newly-created directory. Native re-verification detects incompleteness but does not auto-repair. Remaining product hardening priority.

## Scoring and next actions
- **+3 percentage points** from 80% for replacing formerly unexecuted native P14/P15/P16 authentic disk/crypto integration with actual **34/34 targeted Node** evidence; no user source mutation or unknown approvals.
- **+2 percentage points** for first real **P20 customer browser JSON → Node P9/P12/P16 on-disk package → tamper-resistant read-only recheck 27/27**, including HOLD/BOM and source protection. Do not double-count P20 25 as separate completion.
- Whole-product final completion **85% provisional**, target reached as an engineering milestone, **RELEASE HOLD**. Remaining 15% includes whole repo regression/CI, Windows local file and customer usability, SELF frontend integration, installer/distribution, licensing, package failure recovery and product/sales acceptance.
- Next priority: full checked-out private source all suites, Windows10/11 Edge local `file://` and actual buyer process, installer/packaging, recoverable atomic output, optional pricing/licensing/security QA. Paid CI or public deployment/permission changes require explicit owner approval.

## Commands
```bash
node --test tests/self-owner-mapping.test.mjs tests/self-owner-preview.test.mjs tests/self-owner-delivery.test.mjs tests/self-owner-fd-race.test.mjs tests/self-owner-e2e.test.mjs tests/self-owner-refresh.test.mjs
SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-browser-to-native-e2e.py
SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-refresh-e2e.py
# Not executed in this checkpoint (complete private checkout needed):
npm run test:preprocessing
npm test
```

**Environment:** Linux Node 22.16.0, Chromium 144.0.7559.96, Python 3.13/Playwright. Synthetic demo review files were created and independently reverified offline; the demo ZIP lives in the ChatGPT working container, **not** committed to GitHub and is not a commercial installer.

**Rollback:** P21 adds the browser test and docs only; previous product source HEAD `587456ff0b1d19c332397cb8b174b3103a5be89c`; earlier P20 HTML/source original unchanged. Release/Production status **HOLD**. Final docs and hub SHAs must be rechecked after sync.  
