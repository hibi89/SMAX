> **2026-11-11 KST FEATURE BRANCH 최신 요건/진행:** `feature/prep-self-owner-mapping-p8`는 P8~P12 매핑·PREP/SELF·오프라인 패키지에 이어 P9 엄격한 영수증 출력 필드/금액 검증, P13 기존 패키지 `--verify`(읽기 전용), P14 실파일 Native E2E 테스트 등록까지 진행. **최종 제품 70% 잠정(85% 목표), RELEASE HOLD**. 아래 50%는 `preprocessing` 안정 브랜치의 P5~P7 역사적 기준이다. 전체 `npm run test:preprocessing`·현재 P14 실파일 E2E·Windows/Edge/고객/SELF UI는 **미검증**. 증빙: `docs/SMAX_OWNER_PREVIEW_REVERIFY_P13_P14_20261111.md`.

# SMAX² PREP+SELF P5–P7 Verified-Scope Requirements — 2026-11-10 KST

**Goal:** self-serve, local-first data preparation and bounded sales summary with human control, no external data transfer or unapproved actions. Canonical branch `hibi89/SMAX@preprocessing`; do not automatically merge `frontend`/`main`/`backend`.

**Confirmed:** Local CSV UTF-8 <=2MiB, selected typed PREP Generic V1 fields, source SHA256 with original source re-derivation, review queue and formula/duplicate/missing/invalid HOLD. P3 owner-review-only SELF sales summary; P4 safe local single-file CLI; P5 manifest-selected <=8 source batch preview, duplicate hash/period/review HOLD, BigInt aggregation; P6 offline CSP no-script HTML reporting to stdout; P7 local lexical Korean/English header suggestions, never auto mapping/approval. Customer data preserved, no background network or writable output.

**Acceptance:** GitHub exact-source SHA evidence; PREP/SELF/P5/P6/P7 isolated function source tests; P7 Native 28 verified tests with stubs documented; native full `npm run test:preprocessing`, file I/O exact source with REAL parser, Windows10/11 browser/SELF frontend merge E2E, customer usability, permissions, packaging, owner approval and sales/legal gates remain **unverified**. All pending gates require independent evidence before release.

**Progress:** whole SMAX² final-product feature estimate **50% provisional** (P5 +2, P6 +1, P7 +2 from 45); Native release evidence incomplete, **RELEASE HOLD**. No autonomous online API/LLM or payment. No paid runner/permissions/external source transmission without consent.
