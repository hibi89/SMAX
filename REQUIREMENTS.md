# SMAX² PREP+SELF P5–P7 Verified-Scope Requirements — 2026-11-10 KST

**Goal:** self-serve, local-first data preparation and bounded sales summary with human control, no external data transfer or unapproved actions. Canonical branch `hibi89/SMAX@preprocessing`; do not automatically merge `frontend`/`main`/`backend`.

**Confirmed:** Local CSV UTF-8 <=2MiB, selected typed PREP Generic V1 fields, source SHA256 with original source re-derivation, review queue and formula/duplicate/missing/invalid HOLD. P3 owner-review-only SELF sales summary; P4 safe local single-file CLI; P5 manifest-selected <=8 source batch preview, duplicate hash/period/review HOLD, BigInt aggregation; P6 offline CSP no-script HTML reporting to stdout; P7 local lexical Korean/English header suggestions, never auto mapping/approval. Customer data preserved, no background network or writable output.

**Acceptance:** GitHub exact-source SHA evidence; PREP/SELF/P5/P6/P7 isolated function source tests; P7 Native 28 verified tests with stubs documented; native full `npm run test:preprocessing`, file I/O exact source with REAL parser, Windows10/11 browser/SELF frontend merge E2E, customer usability, permissions, packaging, owner approval and sales/legal gates remain **unverified**. All pending gates require independent evidence before release.

**Progress:** whole SMAX² final-product feature estimate **50% provisional** (P5 +2, P6 +1, P7 +2 from 45); Native release evidence incomplete, **RELEASE HOLD**. No autonomous online API/LLM or payment. No paid runner/permissions/external source transmission without consent.
