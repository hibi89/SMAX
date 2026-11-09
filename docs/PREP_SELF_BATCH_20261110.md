# SMAX² P5 — owner-selected local PREP→SELF batch preview (2026-11-10 KST)

## Problem, alternatives and decision

P3 validates a single PREP package and SELF report in memory. P4 reads a single owner-selected local CSV/config pair. Customers routinely have multiple monthly CSV sources, where naive repeated manual aggregation risks overlooking incomplete sources or counting duplicated exports twice.

- **A: implicit folder scanning/automatic report merging.** Less operator effort, but expands access to unselected customer files, is hard to audit, and may merge wrong periods or report incomplete totals.
- **B: strict local manifest of 1–8 explicit CSVs**, each reprocessed through P4/P3 read-only gate. Detect same-content SHA256 duplicate, stop on invalid/unauthorized files or mixed period, and produce no financial totals if even one source is `REVIEW_HOLD`. **Selected** for deterministic local CPU processing, safe provenance, zero model/API cost and no file writes.

## Explicit manifest

```json
{
  "version": 1,
  "sources": [
    {"id": "source_a", "input": "a.csv", "config": "a.json"},
    {"id": "source_b", "input": "b.csv", "config": "b.json"}
  ]
}
```

The manifest is JSON <=64KiB and explicitly supplied by the owner. Each listed CSV/config filename must be relative to the manifest directory (not absolute, not containing `..`, backslash, drive names or unapproved extensions); files are resolved with `realpathSync` and must remain in the same directory tree. The P4 reader separately checks regular files/symlinks and bounded read. Each `input` is a unique CSV path, duplicate SHA256 source bytes are rejected across files even with different filenames. IDs are 1–32-character normalized `^[a-z][a-z0-9_]*$`, unique per batch, and can appear in stdout; don't put personal identifiers into them.

Run a synthetic two-source example:

```bash
npm run preview:batch -- --manifest preprocessing/examples/synthetic-self-batch.manifest.json
# equivalent:
node preprocessing/self-preview-batch.mjs --manifest preprocessing/examples/synthetic-self-batch.manifest.json
```

Expected synthetic net: 90.00 (source A) +185.00 (source B) = **275.00**. Exit0 `READY_FOR_OWNER_REVIEW` means only an **unapproved draft**. Output returns only safe item IDs, SHA256 fingerprints, counts and collective monetary totals; never source paths/cell contents/individual customer channels/exports. Exit2 `REVIEW_HOLD` hides all monetary totals, including clean sources, and indicates which source IDs need review. Exit1 `INVALID_LOCAL_BATCH_INPUT` is static and does not include user-supplied file paths or data.

## Core security, precision and limitations

- All source/config data stay on owner device. Strict schema rejects arbitrary commands, execution flags, `--output`, unknown manifest keys, directory scanning, symlink/escape and unapproved money reports.
- Each source uses existing verified P3 `SMAX_PREP_SELF_SALES_PREVIEW_V1` receipt policy; class, approval, numeric summary and safe integer row bounds are checked again before inclusion.
- Monetary sums are performed with Node BigInt integer cents and fixed 2-decimal canonical outputs; no IEEE-754 float rounding. Positive and negative adjustments tracked separately; negative items remain labeled adjustments, not tax/refunds.
- Reject duplicated CSV content SHA256 regardless of filename, mismatched daily/monthly aggregation, forged/unbalanced summaries, noncanonical numeric strings, invalid UTF-8, 2MiB CSV and 64KiB config/manifest input limits.
- `REVIEW_HOLD` is not a dataset rejection or accounting conclusion; source review must be explicit. CSVs with different bytes but overlapping transaction IDs **are not deduplicated across sources** (no cross-dataset identity contract). Do not treat batch result as reconciled bookkeeping or completed payment.
- No real authorization, payment, data write, job execution, network, cloud, secrets, customer documents or external AI inference. All PREP/SELF and manifest inputs must be considered untrusted.

## Verification and release gate

1. Source and tests committed at exact GitHub SHA; `npm run test:preprocessing` registers **17 P5 test cases** and existing P3 14 + P4 16 tests. Full Native Node checkout test, Windows native test, production UI/auth/approval and real customer data **are not yet confirmed**.
2. Isolated V8 function-level tests exercise exact `self-preview-batch.mjs` with mocked local path resolution + injected trusted per-source runner to check fake receipt rejection and aggregate, but this does not replace Native Node/P3/P4 integration.
3. Existing P4 Node22 exact CLI file static and stubbed I/O tests, and P3 V8 product source tests, are reported separately in the P3/P4 docs. No test evidence is silently promoted to success at a different SHA.
4. Developer/operator must run `node --test tests/self-preview-batch.test.mjs` and `npm run test:preprocessing` on exact GitHub checkout before marking Native integration PASS. No paid runner/security setting changes without explicit owner approval.

**SMAX² whole-product completion stays provisional 45% while full native PREP/SELF tests and actual UI integration are unverified.** Progress will be re-evaluated after evidence; overall 16-product arithmetic mean is 61.875% at this snapshot, not a weighted readiness metric.
