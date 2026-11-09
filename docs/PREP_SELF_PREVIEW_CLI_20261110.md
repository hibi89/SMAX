# SMAX² P4 — local-only PREP→SELF sales-preview CLI (2026-11-10 KST)

## Why CLI first

**Alternative A:** auto-merge frontend/preprocessing and expose a UI endpoint immediately. Easy demo but branch divergence, browser/client data boundaries, stale approval state, and unverified native/Windows integration create serious risks.

**Alternative B (chosen):** add a **read-only local Node20+ CLI** on `preprocessing` only. Consume explicitly selected CSV and JSON mapping; use the already built P3 PREP→SELF gate to produce a non-executable summary. Cost: no new NPM packages, service, API, model, deployment or network calls. Future SELF UI can consume the same strict response after native compatibility testing.

## Real user workflow (local shell, no file writes)

```bash
npm run preview:self -- --input preprocessing/examples/synthetic-self-preview.csv --config preprocessing/examples/synthetic-self-preview.config.json
# or:
node preprocessing/self-preview-cli.mjs --input preprocessing/examples/synthetic-self-preview.csv --config preprocessing/examples/synthetic-self-preview.config.json
```

Expected example is a `READY_FOR_OWNER_REVIEW` draft with 2 input rows, positive 100.00, negative adjustment 10.00 and net 90.00; **not approved or executed**. The fixture contains only fictional data and does not prove real customer requirements.

The JSON config has *exactly* `columns`, `mapping` and `period` fields. Columns follow `SMAX_PREPROCESS_GENERIC_CSV_V1` 1–64-field contracts and explicitly include required date/text/decimal(or integer) fields. Mapping must provide exactly `date`, `channel`, `amount` to mutually distinct, existing source columns. Period is `daily` or `monthly`; there is no auto-detection, SQL, script or approval flag.

### Exit codes and privacy boundary

- Exit **0**: `READY_FOR_OWNER_REVIEW`, still `owner_approval:'NOT_GRANTED'` and `execution:'NOT_PERFORMED'`.
- Exit **2**: `REVIEW_HOLD` from PREP/SELF problems, no partial totals or auto fixes.
- Exit **1**: input/permission/format/read/contract error. stdout empty; sanitized static error on stderr without source paths, cell values or exception trace.
- Input CSV <=2MiB, config JSON <=64KiB, **strict UTF-8 decode**; ordinary local files only, no symlinks, pre/post `lstat/fstat` identity, ctime, mtime and exact size checks, bounded fd read (max file size +1 byte). No `--output`, writes, remote uploads, credentials, background process, app permissions or terminal logging of raw rows.
- Customer privacy: stdout contains only aggregate numbers, non-secret statuses, file SHA and counts. This is still customer-derived information and should not be redirected to public logs.
- Because the data are local, a user can explicitly choose absolute Windows paths; the CLI does not traverse folders automatically. Source text is re-derived through the P3 gate and the independent SELF report; no pre-existing JSON receipt is automatically trusted.

## Evidence and next mandatory tests

1. Exact new CLI GitHub blob SHA must match native checked source. Local Node **v22.16.0** `node --check` of byte-identical `self-preview-cli.mjs`: **PASS**, `git hash-object` matched **`8a59c0877655ff734251e131c162e6dbceb05fed`**.
2. Native Node isolated file-I/O smoke: **11/11 PASS**, including regular file bytes, no edits, strict flags/config, symlink, oversize, invalid UTF-8. **P3 Generic PREP / SELF reporting modules were replaced with explicitly marked lightweight test doubles**, so this is NOT native source-integrated P3/P4 behavior.
3. Prior P3 exact-source V8 with SHA/UTF-8 test doubles: 14/14 PASS. New repository `tests/self-preview-cli.test.mjs` contains **16** native child-process integrated test cases for clean/hold/fail, source and config security, formula/duplicate, privacy, no writes, BOM and cli statuses; `package.json` registers these in `npm run test:preprocessing`. **These 16 tests have not yet been run against the full actual GitHub repo**; no claim of 16/16 PASS until native checkout/evidence.
4. Execute `npm run test:preprocessing` and `node --test tests/self-preview-cli.test.mjs` on an exact repository checkout, obtain actual numbers and fix failures. Then Windows10/11 Native CLI/edge cases, SELF UI real integration, ownership/approval and delivery/sales gates.
5. Current GitHub private `preprocessing` branch had 0 historical Actions runs; do not enable paid private runner or modify workflow permissions without owner approval.

**SMAX² final product completion remains provisional 45%; commercial RELEASE HOLD.** Separate 16-product command center average is simple arithmetic, not a sales-ready or weighted product completion assessment.
