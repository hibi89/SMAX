# SMAX² P15 — UTF-8 BOM exact-byte provenance correction (2026-11-11 KST)

## Confirmed functional defect
Before P15, `readBoundedRegularFile` used `new TextDecoder('utf-8', {fatal: true})`, which silently removed the leading UTF-8 BOM. The parsed CSV still worked, but `source_sha256` was computed from a BOM-stripped text string rather than the original physical CSV bytes. This violates the product's source-file-bound mapping/receipt contract for BOM-encoded inputs.

## Minimal fix
- Product source: `preprocessing/self-preview-cli.mjs`
- Feature commit: `e0b765b38d318bd888744b2899c97b5fa6dbc078`; product blob SHA `bfd26dc0ae759be9968da0f3375bee72b7928d6f`.
- Use `TextDecoder('utf-8', {fatal:true, ignoreBOM:true})` to retain U+FEFF in the source string. Existing `parseCsvRecords` removes the BOM only to interpret header columns, while SHA-256 of re-encoded source retains the exact original bytes. Byte limits, symlink preflight, and no-write semantics unchanged.
- Exact SHA regression test in existing `tests/self-preview-cli.test.mjs`, commit `ba95856172bd8d62f88ef08ccbeaad7b7298b450`.
- Owner form→preview→bundle→verify / stripped-draft reject native acceptance test added to `tests/self-owner-e2e.test.mjs`, commit `f105004da9b3fe887178af72bc3b58e9b95cfc3d`.

## Executed evidence
- Node 22.16.0 on Linux, **7 PASS / 0 FAIL**, using the exact `readBoundedRegularFile` function text read from the GitHub product blob, extracted into a standalone module with native filesystem and crypto dependencies.
- Scenarios: original BOM-inclusive physical SHA matches, BOM retained, unchanged file contents, non-BOM exact SHA matches, invalid UTF-8 rejected, >2 MiB refused, symlink refused.
- The user-facing code's full original module import graph was NOT loaded in that harness. This is a **focused Native Node unit exercise of the extracted function**, NOT the checked-in test suite, NOT `npm run test:preprocessing`, NOT an end-to-end P8→P15 run. Registered new P15 test cases remain **NOT_RUN**.
- Native Test runner `node --version` returned v22.16.0; `new TextDecoder('utf-8')` dropped BOM while `{ignoreBOM:true}` preserved BOM (verified as Buffer equality). GitHub Actions on feature branch: no workflow present; historical Actions failure at unrelated SHA must not be treated as verification.
- Windows/Edge file://, customer input, installer, SELF frontend integrated flow, whole-repo native regression/CI: **NOT_VERIFIED**.

## Product accounting and remaining work
- Final product completion **70% provisional → 70% retained**; no basis for +15%p target 85 from this source-hardening patch. Commercial RELEASE HOLD.
- No external data transfer, payments, permission changes, customer originals, stable-branch merges, Vercel or Cloudflare deployments.
- Next: exact branch source full Native `npm run test:preprocessing`, `npm test`, P14/P15 genuine multi-module file E2E; then Windows customer mapping/file-open/installer and SELF frontend integration. Avoid implying this targeted 7-test run is the whole suite.
