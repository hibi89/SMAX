# SMAX² P16 — File-descriptor-bound offline package verification
**Checked:** 2026-11-11 KST. **Private:** `hibi89/SMAX@feature/prep-self-owner-mapping-p8`. RELEASE HOLD.

## Problem and design choice
Previous P11 package verification used `lstatSync(path) → readFileSync(path) → lstatSync(path)`. Between the first check and opening the file, a local actor could replace the verified path with a symbolic link or another file. This risk is relevant to owner-review `manifest.json`, `receipt.json`, and `report.html`. No customer file was used or read.

Two options evaluated:
- **A:** retain path-based `readFileSync` and add extra before/after checks. Lower change size but still resolves the pathname afresh, leaving a pre-open race.
- **B (chosen):** open a bounded read-only file descriptor with `O_NOFOLLOW` where supported and `O_NONBLOCK` when available; compare the initial pathname `lstat`, opened descriptor `fstat`, post-read descriptor `fstat`, and final pathname `lstat` with bigint dev/inode/size/mtimeNs/ctimeNs. Read only from that descriptor, length bounded to 256 KiB plus one. Close descriptor in `finally`.

Approach B adds minimal local syscall overhead for each of only three files, zero external/API cost and no change to the established receipt, HTML, manifest, approval, or output contracts. Windows support for `O_NOFOLLOW` must be verified separately; this code uses the existing-platform fallback plus inode/path comparisons, not a blanket OS guarantee. Concurrent malicious directory replacement beyond the available Node pathname APIs remains outside proven protection.

## Implementation and evidence
- Product feature commit: `5f2ccfa04c9fe0a04277f06135925249a4728470`. Exact source blob: `66bc6dcbde6d0858337d5bddf3fd080f7279b20a` (`preprocessing/self-owner-delivery.mjs`).
- Regression file commit: `f0e77a9138b415bbe7cfe8560b0c1f618ee06d1e`. Exact test blob: `167928a8db2cdee069460184639854a12581a211` (`tests/self-owner-fd-race.test.mjs`).
- Native test registration commit: `079d630b741710eb8c7d86d451738e56e466772a`.
- The baseline original downloaded through the connected GitHub repository had blob `85215985ef50c124fb3a8aa738d093aabfded23d`; its exact local `git hash-object` matched before editing. After editing, the local source and test blob hashes both matched the newly checked-in GitHub blobs.
- **Actually executed:** Linux Node **v22.16.0**, `node --test tests/self-owner-delivery-p16.test.mjs` in an isolated folder with the complete actual production `self-owner-delivery.mjs` file and matching checked-in test content. **7 PASS / 0 FAIL / 0 SKIP**: P10/P11 receipt contract and exclusive package, HOLD suppression, tampered manifest/receipt/report rejection, preexisting symlink rejection, a forced symlink exchange immediately before open, an exchange after a valid fd was opened, and directory symlink/unexpected file refusal.
- The isolated local test file's name differed from the checked-in `tests/self-owner-fd-race.test.mjs`, but the contents had the exact same Git blob SHA `167928a8db2cdee069460184639854a12581a211`. No test double for the production P11 module; synthetic receipt and test-only renderer remained.
- **NOT RUN:** entire repository `npm run test:preprocessing` and `npm test`, P8–P15 fully real-service end-to-end CLI, Windows10/11 / Edge `file://`, actual SELF frontend, installer, customer data/rights, CI for current feature HEAD. The new 7 PASS must not be called full-product acceptance.

## Reproduction
```sh
npm run test:preprocessing
node --test tests/self-owner-fd-race.test.mjs
npm test
```
The first and third commands are not proven to pass on the exact feature SHA yet. In a complete trusted local checkout, confirm all tests and do not edit other branches.

## Product status, operational boundaries
**Whole final product 70% provisional → 70% retained**. 85% target remains 15%p away; hardening an existing file-safety guarantee does not by itself establish new customer-ready product scope. RELEASE HOLD. Only `feature/prep-self-owner-mapping-p8` changed; no source CSV modified, no user originals, secrets, paid runner, new workflow, cross-repo private source disclosure, permissions, deployment, sales, or account change.

## Next highest priority
Run complete native suite using approved full private checkout; fix actual failures and rerun. Then P8→P16 real CLI E2E, Windows offline mapping/file/open/save and SELF customer workflow; installer/license/seller QA. Treat Windows-specific path/flag behavior as NOT VERIFIED until actually tested.
