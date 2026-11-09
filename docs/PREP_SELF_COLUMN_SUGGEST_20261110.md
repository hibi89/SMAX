# SMAX² P7 — deterministic local CSV column suggestions (2026-11-10 KST)

## User problem and architecture decision

PREP and SELF use strict owner-selected `date/channel/amount` mappings. This is correct for security but difficult for nontechnical customers whose CSV headers vary. We add only **a candidate suggestion and human-review stage**, not automatic mapping.

- **A: LLM/embedding-based automatic column selection.** Flexible but may infer unsupported semantics, incur API/model costs, and leak customer headers or values; approval/false confidence concerns.
- **B: explicit local lexical header aliases, normalized Unicode and ambiguity gate.** Simple, free and deterministic. Returns ranked candidate headers and explanations, never applies a mapping or executes actions. **Chosen**.

## CLI

```bash
npm run preview:suggest -- --input preprocessing/examples/synthetic-self-preview.csv
node preprocessing/self-column-suggest-cli.mjs --input path/to/selected.csv
```

- The owner explicitly selects one local regular UTF-8 CSV file <=2MiB; existing `readBoundedRegularFile` enforces no symlink/binary/oversize/mutation. Existing `parseCsvRecords` reads headers and row count, preserving CSV quoting rules. Source record/cell values are **not printed**, only original header labels, their 0-based column index, reason (`EXACT_LABEL` or `PARTIAL_LABEL`) and simple fixed descriptive scores.
- `suggestSelfSalesColumns(headers)`: 3–64 nonempty unique (after Unicode NFKC/whitespace/_/- normalization) headers, length <=80, reject default ignorable Unicode and control characters, formula-leading headers. Korean/English curated labels for **date**, **channel**, **amount**. Exact aliases score 100, longer compound partial alias score 60; top 3 per role. Missing/ambiguous matches receive `AMBIGUOUS_MAPPING_REVIEW`; otherwise `CANDIDATES_FOR_OWNER_REVIEW`, **but both require explicit owner selection**.
- Returned `owner_approval:'NOT_GRANTED'`, `mapping_applied:false`, `execution:'NOT_PERFORMED'`, `outbound_transfer:false`, `source_modified:false`. No key/column mapping can be silently reused as a financial fact.
- CLI always exits 2 for owner review and 1 on invalid file/contract (sanitized error on stderr). It does not produce a full P4 configuration, execute reports or create a report file.
- Header names themselves may contain private metadata; the owner must avoid pasting stdout to a public log. No online API or credential management.

## Verification and acceptance

- **Exact source SHA** `842264614544a0651edc9abc82a8201e229e591c`, copied byte-for-byte from GitHub to native Node22.16 staging, `git hash-object` identical; `node --check` PASS.
- **Native isolated Node22 unit tests:** `tests/self-column-suggest.test.mjs` exact source and test SHA `fdc2e3814e417d17b38d8ab142537bfa2476a9a0` match container files. `node --test` **18/18 PASS, 0 FAIL, 0 SKIP**. Korean/English, Unicode NFKC, invisible controls, formula/duplicate/oversize, deterministic and no auto approval were checked.
- **V8 prior regression:** initial source candidate filter 5-character partial rule missed 4-character Korean "매출금액"; fixed to 4, re-executed 14/14 PASS. An apparent invisible Unicode test failure in first V8 harness was caused by escaped characters rather than actual U+200D; native test used actual U+200D and passed. No evidence of actual data-source defect.
- **New `tests/self-column-suggest-cli.test.mjs`:** 10 real Node child-process integration test cases checked into GitHub and registered in `npm run test:preprocessing`, but **not yet executed against full GitHub checkout**. Requires actual P4 reader and CSV parser; native source code has not been rebuilt into full repo in test container.
- **Remaining:** overall native `npm run test:preprocessing`, full PREP→SELF P3/P4/P5/P6/P7 integration, browser/Windows10/11 and real customer E2E, user approval/packaging/sales gates **UNVERIFIED**.

This feature improves customer onboarding, but it does not close the end-to-end native UI gap. Do not claim product readiness or arbitrary percentage growth solely from test counts.
