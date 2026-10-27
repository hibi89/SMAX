# SMAX PDF V0 native-tested local MVP staging — 2026-10-27 KST

**Status:** Local PDF parser/CLI/schema/tests implemented and tested; **source files not yet integrated or committed to GitHub**. Avoid claiming PDF is complete in the checked-in preprocessing branch.

## Development goal and branch rules
Private `hibi89/SMAX` / `preprocessing` only. User development sequence: MVP → first-design gaps → final security/stability/Windows compatibility. No automatic approval, real customer data, public source disclosure, paid services, CI triggers, or other branch/hackathon edits.

## Completed outside repository
- Standalone `preprocessing/pdf.mjs`, `pdf-cli.mjs`, `SMAX_PREPROCESS_PDF_V0.schema.json`, `tests/pdf.test.mjs` and local README were authored in isolated Linux Node 22 workspace. No new runtime dependencies.
- PDF 1.x (single traditional xref) limited born-digital text extraction: Type1 WinAnsi fonts, basic Tj/TJ and line operators, raw/Flate/ASCII85+Flate page streams, page order/line numbering. Source SHA256 and review status; `approval=NOT_GRANTED`.
- Strict fail-closed unsupported cases: CID/ToUnicode/Unicode mappings, scanned/OCR PDFs, encryption/incremental/xref-stream files, embedded script/graphics, form XObjects, annotations and rich content. 2MiB input, 8MiB decoded limit, 64 pages, 10k lines.
- Local **`node --test tests/pdf.test.mjs` 10/10 PASS**. ReportLab generated 2-page compressed and uncompressed PDF text and independent PyMuPDF outputs agree. Local PDF file CLI creates JSON; Python jsonschema Draft202012 valid output PASS and APPROVED spoof rejected.
- Local source Git hashes (not remotely committed): `pdf.mjs f74d160816c44f9e5f38aecdec8233ddbf60d93b` (after extra no-Differences hardening); `pdf-cli.mjs dd7d2f1cce6e1e6393e0992ce642269f8a998841`; `SMAX_PREPROCESS_PDF_V0.schema.json f27f6964e1c969d159142b29e391be613eedd663`; `pdf.test.mjs 92a850851cb03a6ebc8a7dbeea8b78bee5b170d2`.
- Local ZIP bundle checksum SHA256: `7e771b69c73e22d05e1f7b92756ed8340e351636649eff3a6ce3f16766a56689`. ZIP produced as a conversation artifact, **not checked into repo**.

## Blocker and next gate
The private GitHub connector runs separately from the local filesystem. No verified path was available to transfer all original local files without risky manual transcription. A partial scratch Git blob from an abandoned staged transfer is *not referenced by the branch*. Do not substitute a truncated source or silently treat this document as completed code integration.

Gate to close: transfer SHA-matched source/test/schema into `preprocessing` branch, add `tests/pdf.test.mjs` to `test:preprocessing`, run repository-wide Node Native tests and then Windows/security/compatibility QA. Full preprocessing/Windows/production release **NOT_RUN**.
