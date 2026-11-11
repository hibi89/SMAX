# SMAX² P9 hardening / P13 re-verification / P14 native acceptance coverage
Checked 2026-11-11 KST; branch `feature/prep-self-owner-mapping-p8`, private `hibi89/SMAX`.

## Changed real product behavior
1. P9 owner PREP→SELF handoff checks the **exact top-level preview fields**, required status/reason, review/eligible row consistency, the exact six summary fields, period, bounded group count, and BigInt-checked positive-minus-adjustment equality before writing a JSON preview to stdout. Unknown row-bearing fields and forged aggregates fail closed. No original CSV modification or approval.
2. P13 adds `node preprocessing/self-owner-delivery-cli.mjs --verify /ABSOLUTE/EXISTING_PACKAGE_DIR`. It calls the pre-existing local 3-file manifest + HTML rerender verifier. It needs no CSV access, does not repair, delete, overwrite or approve anything, and refuses invalid paths/altered receipt or report.
3. P14 adds `tests/self-owner-e2e.test.mjs`, registered in `npm run test:preprocessing`, to run real native child CLI from owner form creation through PREP/SELF preview, delivery, independent reverify, source immutability, stale SHA rejection, HOLD monetary hiding, duplicate-folder rejection and tamper failure. The checked-in acceptance test is **NOT a passed test** until a trusted complete private checkout executes it.
4. Existing `tests/self-owner-preview.test.mjs` mock receipt now matches the actual PREP/SELF v1 contract, plus negative injection/forgery cases. Existing delivery tests add P13 safe reverify and tampering assertions.

## Exact GitHub evidence / limits
- P13 feature commit: `378c56e087c79d9e4de87d122c23cd2c47e603d9`; P13 test commit `d5614b1a5ff7d43dbe71bc21d36a81f4d6f93568`.
- P14 new native E2E test file commit: `f3df2f8134445e167df877a4f41b7b3a358d9ccc`; npm script registration: `a6c781cee32e1c74c8b619b706cd3b4014d6e46e`.
- P9 test fixture + attack cases: `9b0db81b67bacab9bf3adc00d90e40d770666f8e`; real P9 validation: **`da8d4a5d691e5241ea1269ef6370016a0b4581a4`**.
- Developer-run isolated V8 tests (not Node Native): P13 verify mode 1 valid + 3 rejected invalid arguments; P9 corrected exact original source 1 valid + 5 forged receipts rejected.
- `npm run test:preprocessing`, `npm test`, no-double P8→P14 native file E2E, GitHub Actions, Chromium direct `file://`, Windows 10/11, actual SELF frontend and customer input: **NOT_RUN / NOT_VERIFIED** for these exact commits. No workflows are present on this feature branch; do not infer CI success.
- Original earlier P8–P12 17/17 focused Node tests were previously reported on older code and **are not evidence for this P9/P13/P14 commit**.

## Local reproduction
```sh
npm run test:preprocessing
npm test
node preprocessing/self-owner-cli.mjs --form /absolute/orders.csv /absolute/new-form.html
# Open HTML locally; choose date/channel/amount, save owner draft JSON.
node preprocessing/self-owner-cli.mjs --preview /absolute/orders.csv /absolute/owner.json
node preprocessing/self-owner-delivery-cli.mjs --package /absolute/orders.csv /absolute/owner.json /absolute/new-package
node preprocessing/self-owner-delivery-cli.mjs --verify /absolute/new-package
```
If native tests fail, identify the actual failure, make a minimal fix, then rerun. Never claim packaging/Windows UX success based solely on mocks.

## Product completion and release gate
Final-product completion stays **70% provisional** (previous checkpoint 70% → current 70%). Hardening and registered-but-unexecuted acceptance tests do not justify +15pp toward 85% yet. **RELEASE HOLD**. No paid API, new repository/project, public code, customer data, production deployment, checkout merge or external transfer. Existing `preprocessing`, `main`, `frontend`, `backend` branches untouched.

## Next
Priority: real private checkout on Node22 `npm run test:preprocessing`/full `npm test`; fix regressions; actual P8→P14 file E2E and independent HASH verification; native Windows Edge and customer CSV selection usability; SELF frontend bridge and installer; release QA and owner sales/legal approval. No percentage rise without evidence.
