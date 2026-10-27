# SMAX Preprocessing — Real Native QA Evidence (2026-10-27 KST)

## Scope and verdict
- Repository: **Private** `hibi89/SMAX`; branch: `preprocessing`; checked code HEAD before this report: `d2f6f627a9cff957abf481d24c2c28cc30a0afcf`.
- Environment: Node.js **v22.16.0**, Linux container; local isolated checkout directory created strictly for tests; no GitHub clone, no mock engine.
- Restored **all 17 required code, schema, test, and package files** using the authenticated GitHub connector. Every restored file's `git hash-object` was compared to its `mcp__GitHub__fetch_file(...,ref:'preprocessing').result.sha` and **17/17 MATCHED**, including test sources.
- Command run from reconstructed root: **`npm run test:preprocessing`**.
- Native TAP summary: **59 tests, 59 passed, 0 failed, 0 skipped**, duration approximately 2.4 seconds.
  - CSV V0 and generic V1 (engines, validators, strict schemas, local CLI): **26/26 PASS**.
  - XLSX ZIP safety, bounded cell extractor, package validator, malicious relationship/numeric regression: **33/33 PASS**.
- Distinct synthetic file E2E (not merely unit/mocks): V0 + generic CSV CLI each produced a new JSON file, preserved original file's full BOM-inclusive SHA-256, 2 rows with 1 review. Two local synthetic workbooks generated with openpyxl and XlsxWriter were extracted and validated against the original XLSX bytes, **2/2 PASS** (7+3 cells; 1 review cell each). No customer data.
- **Prior status `NOT_RUN` for `npm run test:preprocessing` has been resolved** for this exact checked branch code on Linux/Node 22. No product release approval implied.

## Exact local-to-GitHub blob SHA manifest
All entries checked as Git blob SHA, not just text similarity.

| Repository path | GitHub and local Git blob SHA |
|---|---|
| `site/csv-transform.mjs` | `26d84c9a59216107ab492aedfcd91cd571e40c66` |
| `preprocessing/index.mjs` | `d46483d6d9320799e80b515e24dc97483aa37199` |
| `preprocessing/cli.mjs` | `ce81faca56e42e2c62ad0f6afc0d0ede2429faf4` |
| `preprocessing/generic-csv.mjs` | `534057062a270d1bc80a78d721d3b3edba84db93` |
| `preprocessing/generic-cli.mjs` | `086e33c884a77c95c5f2512befe80af1815055cd` |
| `preprocessing/SMAX_PREPROCESS_CSV_V0.schema.json` | `95bac090daf6d7c9a3d41c4e90714e0cc540c956` |
| `preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json` | `f3731b0031bbd6c15072e279531038dfb6c4e0cb` |
| `preprocessing/xlsx-preflight.mjs` | `ce0f96ce618c6b868bcf255e1d8b2508f3eb6bb3` |
| `preprocessing/xlsx-cells.mjs` | `ba196d9ed9db5475fc1a1798d87efa46f62751e6` |
| `preprocessing/xlsx-package.mjs` | `26154bc092ffb10ff0079dfa31cf5062c59748fc` |
| `tests/preprocessing-package.test.mjs` | `d1a4d45adbc1874413c7429a74d04fa0e10ebcb2` |
| `tests/preprocessing-cli.test.mjs` | `4db573e6fc270554a28ba3b963dee21eb3c3a7f5` |
| `tests/preprocessing-schema.test.mjs` | `4a983f1b5d170c70c227b3b3672482e1aea4f63` |
| `tests/preprocessing-generic.test.mjs` | `5da273c22c3a67fa2e39d0de1422f1b8e7a646fd` |
| `tests/preprocessing-generic-schema.test.mjs` | `0a4839d552d458154bdcf4d12571e3a45da79567` |
| `tests/xlsx-preflight.test.mjs` | `d484cea4ef13ad28b650902c164251d1daaf6121` |
| `package.json` | `969a9ca3ff57e9ad871ea169907093b9aea2f8b2` |

## Remaining gates / truthfulness
- **Whole repository `npm test` (all site/UI/core tests): NOT_RUN.** This was a minimal checkout of the documented preprocessing dependency set, not a whole-repo clone.
- Windows native execution and GitHub Actions CI on this branch: **NOT_RUN**.
- Third-party real customer XLSX formats, office interoperability, scale/attack-surface audits, public release, deployment, sales: **NOT_VERIFIED/NOT_AUTHORIZED**.
- Changes to `main`, `frontend`, `backend`: none. No external API charges, credentials, publication, production deployment, force-push or merges.

## Reproduce
```sh
node --version  # v22.16.0 used in evidence
npm run test:preprocessing
# TAP: tests 59, pass 59, fail 0, skipped 0
```
For a second environment, use an authorized full private repository clone or an exact SHA-verified set of the 17 files above (including paths). To obtain comprehensive project quality gate, additionally run `npm test` in the full repo and Windows CI; do not mislabel this scoped PASS as full repo PASS.
