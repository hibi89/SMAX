# SMAX² P6 — static offline HTML review artifact (2026-11-10 KST)

## Goal

The P3/P4/P5 output is intentionally JSON-only, which is precise but inconvenient for nontechnical customers. P6 renders the same **strictly verified draft** as an accessible, static, local HTML document without adding an account, remote server, browser execution logic or customer data upload.

### Alternatives

- A. Build an immediate SPA/client upload-to-server dashboard; fast to click but introduces cross-branch UI, unsolved data retention/CSRF/permissions and service operation risks.
- B. **Zero-JavaScript static HTML generated from the already gated P5 receipt**; CSP disallows remote content and scripts. No source rows or paths are embedded. Chosen for privacy, no ongoing costs, explicit human review and easy offline handoff. A fully interactive SELF UI remains separate.

## API and command

`preprocessing/self-preview-html.mjs`: `renderSelfBatchHtml(report)` accepts only strict `SMAX_PREP_SELF_LOCAL_BATCH_V1` receipts. The method independently checks approval/action status, batch item count, source SHA256s, duplicate IDs/hashes, per-item row counts and total review count, and BigInt-cents financial equality. Any extra root/item keys, raw data fields, forged aggregate, approving state or malformed money fail closed.

`preprocessing/self-preview-html-cli.mjs`: `node preprocessing/self-preview-html-cli.mjs --manifest preprocessing/examples/synthetic-self-batch.manifest.json` (or `npm run preview:batch:html -- --manifest ...`) reads only the explicitly selected P5 JSON manifest and owner CSV/configs. It writes **only HTML to stdout**, no file by itself. To save a local HTML report, the owner deliberately redirects output using their terminal; report output is still confidential financial data, so do not upload it to public sites.

- Exit 0: `READY_FOR_OWNER_REVIEW` (not approved/executed).
- Exit 2: `REVIEW_HOLD`, all monetary totals hidden.
- Exit 1: sanitized static input error on stderr; no source paths, records, stack trace or CSV values.
- No unapproved execute, data mutation, webhook, network or remote content.
- HTML is standalone `<!doctype html>`, Korean-language with responsive read-only tables, text descriptions, source SHA256, clear state and owner-approval warning. Strict CSP meta: `default-src 'none'`, `script-src 'none'`, `img-src 'none'`, `form-action 'none'`, `base-uri 'none'`, only explicit inline CSS. No JavaScript, images, links, CDNs or external fonts.
- Status and exit code determined from validated structured receipt, not matching an HTML string.

## Exact evidence and limitation

- `preprocessing/self-preview-html.mjs` GitHub blob SHA `2ef99e93635b21a3ce8c3f6169be4e2acc86688b`. Actual source functions independently exercised in restricted V8 on 14 synthetic cases: **14 PASS/0 FAIL**, covering allowed READY, HOLD no totals, invalid recipient/approval, exec flags, bogus IDs/hashes, mismatched counts/amounts, additional fields and CSP protections.
- `tests/self-preview-html.test.mjs` includes **15 actual Node test cases**, including native `node:child_process` fixture-backed HTML CLI run, redirection-agnostic file preservation, no PII leak, restrictive CSP/invalid receipt and error exit codes. This test file was authored and committed, **not yet run on original GitHub repo checkout**.
- Browser HTML visual accessibility/PDF printing, owner Windows10/11, actual SELF frontend integration and full `npm run test:preprocessing` native whole-repo checks remain **UNVERIFIED/HOLD**. P3 14 V8 with real standard SHA256 verified at exact GitHub source, P5 V8 17 functions passed and 9 real-source P3→P4→P5 integration checks passed; remaining period test's synthetic harness lacked structuredClone, product bug not established. Do not promote mock tests to native tests.
- Private `hibi89/SMAX@preprocessing` only; no main/frontend/backend, GitHub CI Actions policy, Vercel/Cloudflare domain, credentials/paid API or customer original file modifications.

## Product assessment

This adds a user-facing report artifact and reduces manual spreadsheet merging. It is not yet a complete customer onboarding workflow or SELF frontend. **Whole SMAX² final-product completion continues to be provisional 45% until native original-code regression and actual front/UI integration are independently evidenced.** 50% is a target, not a claim based on number of new tests.
