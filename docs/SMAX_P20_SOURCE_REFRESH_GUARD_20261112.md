# SMAX² P20 — Browser source refresh guard (2026-11-12 KST)

**Product:** private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`  
**Target:** provisional 85%; product remains **RELEASE HOLD**, no Production URL.

## Problem and design choice
P19 bound owner-selected CSV to a SHA256 at initial file inspection and allowed a locally stored mapping draft to be downloaded/reverified. There was a remaining time-of-check/time-of-use UX gap: after the first read, the browser could still display a valid status or export the earlier hash even if the selected file was no longer readable or the file contents changed. The later PREP/SELF backend would reject it, but a non-developer user would see an apparently valid draft before discovering the mismatch.

Two options compared:
- **A — trust initial File snapshot and let P9/P12 fail on later execution:** no further browser work and minimum CPU; confusing customer workflow and weaker freshness evidence.
- **B — selected:** at both save and saved-JSON recheck, re-read the selected File bytes, compare byte size and SHA256 to the initial physical-source digest; after each async read verify the same File object, active source state, selected roles and period. On mismatch fail closed and require CSV re-selection. Max input 2MiB; CPU local-only, no network/API/permissions/paid costs. This is still not a guarantee that disk bytes cannot change *after* a check; P9/P12 must independently revalidate.

## Source and tests checked into GitHub
- `site/owner.html` existing P19 source modified in place; exact native+browser-tested **Git blob `cf050c4d40047cb49f5bde7d4ff8a87f1f67b4b8`**, commit `497acbfbaebbec3ddd1fb54dab0f04782f39fd34`. No changes to approval policy or customer JSON schema; inline script CSP digest recomputed to match.
- `tests/self-owner-refresh.test.mjs` actual Node v22.16.0 native test source exact blob **`562a063a871a937bdd24a646520cfb089b2864b8`**, commit `bfd2fa882af4b52960e3afaace7b2ae09221ddda`. Added to existing `npm run test:preprocessing` by `425bf53500874c1fea53a80c81fa239ee136c0c3`.
- `tests/browser/self-owner-refresh-e2e.py` actual Chromium test source exact blob **`9f04c00931e6ab2ad857447f127067f5a276397f`**, commit `e0e692d4711ca24de06c36f8e7567b64f9f8d76f`.
- Reused exactly checked-in P8 Node validator `preprocessing/self-owner-mapping.mjs` blob `c66acb2a757e26d25058c81eaaad4dcfadea0913`. Existing P18 portal wrapper and CLI exact blobs `1150276bb4dd2589bf22227398f86c8bd2faccff` and `de566e9fa14eb8b3aad7003082eea062b3195fa4` respectively. All reconstructed local JS sources were byte-for-byte verified with `git hash-object` against GitHub. The source was accessed through the connected private GitHub connector; no external deployment/provider was given private source.

## Executed verification (exact tested files)
- **Linux Node v22.16.0: 4 PASS / 0 FAIL / 0 SKIP**, `node --test tests/self-owner-refresh.test.mjs`: CSP SHA and no-network policy, 14 native SHA vectors including 2MiB exact boundary, genuine exclusive-output CLI and duplicate refusal, isolated CSP tamper blocks output file creation. This is not the complete `npm test` or `npm run test:preprocessing`.
- **Chromium 144.0.7559.96 / Python Playwright: 25 checks PASS / 0 FAIL**, `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-refresh-e2e.py`: original CSV→valid downloaded JSON→exact P8 Native validator; physical BOM-inclusive SHA→valid P8; JSON reverify success, synthetic same-file changed-bytes injection into browser File API blocks subsequent reverify and export; reselect recovers; delayed SHA check plus changed period refuses stale save. Prior invalid/stale SHA, injected approval, unknown role, invalid period, invalid UTF8, 64KiB JSON upper limit, unsafe formula/hidden header rejected; browser network requests **0**, JS runtime errors **0**, original synthetic row not displayed.
- The file-content-change injection was **a test-controlled monkey-patch of the browser File object's arrayBuffer()**. It demonstrates UI fail-closed behavior against changed returned bytes; it is **not** a physical concurrent disk mutation test or full browser filesystem TOCTOU proof.
- Direct `file://` and localhost browsing remain **blocked by Chromium profile administrator policy (`ERR_BLOCKED_BY_ADMINISTRATOR`)**. The 25 checks use actual Chromium's File API, CSP, Blob download and Node validation with the exact HTML loaded via `page.set_content`; physical Windows/Edge offline file opening is **NOT VERIFIED**.

## Product assessment and remaining acceptance gates
This P20 work closes source freshness at the user-facing mapping step and prevents stale JSON download/reverify due to later File bytes/selection changes. It is **not** a new full PREP/SELF financial calculation or proof of the whole installer. Whole-product provisional completion **79% → 80% (+1%p)** for this verified reliability improvement; **85% remains 5%p away**. No claim of customer-ready release or production success.

Still **NOT RUN**: whole private repo `npm run test:preprocessing` and `npm test`; actual P20 browser JSON→P9→P12→P16 **Native real disk and crypto E2E**; Windows10/11 Edge `file://` local app behavior, actual SELF frontend integration, installer/seller/security/license/customer acceptance. The pre-existing P14 E2E tests remain checked into GitHub, but they are not evidence of execution in the current product SHA. No new paid CI/permissions/exported private source/public deployment.

## Reproduction and rollback
In a complete trusted private checkout:
```sh
node --test tests/self-owner-refresh.test.mjs
npm run test:preprocessing
npm test
SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-refresh-e2e.py
```
Only the first and last commands were successfully executed in an isolated exact-source checkout as described above. Previous product source commit `2c8077dd33568240b89eb4000e51f5cdbcd0cbd5` can be used for rollback. Customer originals, stable `main/frontend/backend/preprocessing` branches, tokens, billing and deployment untouched.

**KST evidence checkpoint: 2026-11-12.** The product/docs latest HEAD and central kmong branch SHA should be verified after docs sync.
