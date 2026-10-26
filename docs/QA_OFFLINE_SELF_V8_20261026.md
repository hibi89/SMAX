# SMAX² SELF — private offline isolated QA evidence (2026-10-26 KST)

## Scope and source of truth
- Private repository `hibi89/SMAX`, **frontend** head before this evidence-only commit: `78699a7743a04ac7dedd33d410c131fa8c3712c3`.
- No user/customer data, paid API, deployment, publication, Chrome/Edge launches, login, or sale was involved.
- This is evidence from a **remote GitHub source retrieval executed inside a restricted V8 isolate**. It is **not** the native Node `npm run qa:release`, a filesystem build, a Windows test, nor a browser E2E.
- No changes to production or test logic were needed to conduct this check.

## 1. Exact checked-in test callback execution (isolated V8)
Retrieved the actual `frontend` production `site/templates.mjs`, `site/core.mjs`, `site/csv-transform.mjs`, `site/sales-report.mjs`, plus checked-in test bodies and `examples/SMAX_SALES_SAMPLE.csv`.
- `tests/core.test.mjs`: **12/12 PASS**.
- `tests/csv-transform.test.mjs`: **14/14 PASS**.
- `tests/sales-report.test.mjs`: **11/11 PASS**.
- **Total 37/37 callbacks passed**, 0 reported failures in the final corrected harness.
- Restrictions: stripped only Node `import` syntax for V8 evaluation, substituted minimal `node:test` and assertion adapters, replaced the source fixture `readFileSync` with the actual retrieved fixture text, and provided a UTF-8 **byte-length-only** `TextEncoder` stand-in. The assertion adapter's `deepEqual` compares JSON serializations rather than Node's strict deep equality. This does not prove native test-runner parity.
- The first harness run failed because the isolate lacks the native `TextEncoder`; correcting the harness, **without modifying product source**, produced the above final PASS. Those harness-only errors are not classified as SMAX product failures.

## 2. Reproduce the actual offline bundle in memory (not a disk artifact)
Retrieved the exact `scripts/build-self.mjs` `bundleOfflineSelf` body, site HTML/CSS, and the actual five production `.mjs` sources (`templates`, `core`, `csv-transform`, `sales-report`, `app`). Injected an independent synchronous pure-JS SHA-256 implementation in place of Node `createHash` for this restricted V8 evaluation.
- Independent SHA-256 implementation validated against **three known test vectors**: empty string, `abc`, and Korean `한글` — 3/3 correct hexadecimal hashes.
- The built one-file HTML **93,387 bytes (UTF-8)**.
- Complete in-memory HTML SHA-256: `b6b4adb72feeb3878b0f52e640c4b7d1d26963239e64f57c7196c21e04bc6f97`.
- HTML built from identical source with all LF vs simulated Git-for-Windows CRLF checked-out input was **byte-identical**.
- Built HTML had **zero CR characters**, exactly one inline script and one inline stylesheet.
- Each actual embedded script/style SHA-256 digest **matched its strict CSP `sha256-...` token**.
- `connect-src 'none'`, absence of CSP `unsafe-inline`, and lack of linked script/stylesheets confirmed.
- Separately, parsed the **actual inline bundled script** with V8 `new Function` — syntax PASS; five production module markers found, including latest `handoffLiteral`.
- This HTML only existed inside the isolate; there is **no** claimed `dist/SMAX_SELF_OFFLINE.html` file at this version, no Native Node `buildSelf` call, and no Windows/browser execution. Therefore the above SHA is a reproducible *memory-artifact identity*, **not an on-disk release artifact SHA**.

### Input GitHub blob fingerprints
| Source | Blob SHA |
|---|---|
| `scripts/build-self.mjs` | `ad3554152b876da131760b1b63305444618d4ca8` |
| `site/index.html` | `592a4087b0e8d25863adcc5790976cfc46829b82` |
| `site/styles.css` | `31fb02559283f26a40137800d1ddb77753d96baa` |
| `site/templates.mjs` | `4f57875f9aa22903b0fdf96c40a2a0542837f506` |
| `site/core.mjs` | `732e1f825499495068c3887e674bb0522a821568` |
| `site/csv-transform.mjs` | `d24a2f141317e5a6e9cc86dce6c60de6af4b7935` |
| `site/sales-report.mjs` | `05578b300b2d7c2f0b653a485ac9c2c859ea055e` |
| `site/app.mjs` | `dbafd9d7b5805d78ff0f56e935001511f3c70d2b` |
| `tests/core.test.mjs` | `1a436db4b687d885a8afd8906bdcc7162df45665` |
| `tests/csv-transform.test.mjs` | `356579e378d886ed544dd14dff201cec2f762bf0` |
| `tests/sales-report.test.mjs` | `85e86f4ba595152b119c841ccabde71d565c1268` |

## 3. Limits, unresolved launch gates, and next safe task
- Native Node `npm run qa:release`: **NOT_RUN** for latest SHA. The tool-host has Node 22 installed but **cannot resolve github.com / clone this private repository**; the authenticated GitHub connector does not mount the repository as a native checkout. Do not claim native pass based on the isolated results.
- Latest on-disk `dist` HTML, Node-issued real SHA/CSP release report: **NOT_RUN**.
- Real Edge/Chrome `file://` E2E, Windows UX/manual QA: **NOT_RUN**. Earlier 86/86 Windows Node PASS and Edge FAIL were for older code only.
- Cloudflare/Vercel Production: **NOT_APPLIED**; sale/hosting/merchant acceptance: **NOT_GRANTED**.
- Prioritize an authorized native checkout environment for the existing `npm run qa:release` and then exactly one final actual Windows Edge `QA_SELF_WINDOWS.cmd /edge` check. Do not ask the owner to repeat earlier failing manual tests or weaken strict CSP for test convenience.
- Preserve product boundary: **2 executable offline CSV workflows + 8 guidance-only workflows**. Other integrations, payments, public deployment, customers, and changes of commercial scope remain excluded pending approval.
- Hard product development deadline **2026-11-07** stays unchanged.

## Completion statement
This check **advanced verifiable release evidence** but **did not resolve the native Node/Windows Edge release gates**. It did not authorize deployment or a paid launch. GitHub commit of this report is the only intended write; branch HEAD and `STATUS.md` / `HANDOFF.md` will be reconciled after writing.
