# SELF 오프라인 브라우저 QA 실행·판정 기록 (2026-10-25 KST)

## 검사 범위
- 전제: 개발자 PC에서 `npm test && npm run build:self` 성공 후, 개발 중인 비공개 `dist/SMAX_SELF_OFFLINE.html`을 대상으로 검수.
- 커맨드: `python scripts/qa_browser.py` 또는 `npm run qa:browser`; Windows Edge 별도 `python scripts/qa_browser.py --channel msedge`.
- 개발자에게만 Python Playwright + 브라우저 설치가 필요. 제품 구매자는 HTML 단일 파일 실행을 목표로 하며 Playwright·Node 설치 대상 아님.
- 테스트 픽스처 `examples/SMAX_SELF_SAMPLE.csv`: 실제 고객정보 없는 합성 자료.
- 검증 단계: 브라우저 오프라인 모드에서 로컬 HTML 열기 → 엑셀·CSV 통합 템플릿 → CSV 파일 선택 → 날짜/상품/금액 원본 열 직접 매핑 → 변환·검토 사유 표시(중복 및 이상 날짜) → BOM CSV 다운로드 → 4행 보존 / 검토 2행 → 잘못된 중복 매핑으로 재설정 시 과거 다운로드 무효 → 모바일 너비 375px 확인 → JavaScript 페이지 오류 및 외부 HTTP(S) 요청 없음.
- 결과는 스크립트에서 JSON으로 출력. 종료코드 `0 = PASS`, `1 = 제품/테스트 실패`, `2 = 소스/파일 입력 미준비`, `3 = 브라우저 실행 파일 없음 또는 관리자 정책에 따른 탐색 차단`. `BLOCKED`를 QA 성공이나 제품 결함으로 분류하지 않는다.

## 이번 턴 실제 확인한 증거
- 코드: `scripts/qa_browser.py`를 Private `frontend`에 등록하고 `npm run qa:browser` 명령 추가.
- 원격 파일을 로컬 검증본과 대조: Git blob `eab5a40c5445113bbf874d36ae9a8cce7a32a445` **일치**. `python -m py_compile` PASS.
- 검증 스크립트 최소입력 실행: 존재하지 않는 HTML/CSV에서 종료코드 2로 안전 중지. 임시 가상 HTML/CSV 파일이 존재하는 조건에선 Playwright 브라우저가 설치되지 않아 **`BLOCKED` / 종료코드 3**으로 분류되는 것을 실행 확인. 가상 HTML은 실제 SMAX 산출물이 아니다.
- 시스템 `/usr/bin/chromium`을 명시한 별도 환경 확인: 테스트용 최소 HTML에서 `file://` **및** `http://127.0.0.1` 탐색 모두 `net::ERR_BLOCKED_BY_ADMINISTRATOR`였음. 이는 현재 실행환경의 브라우저 보안 정책에 의한 접근 차단 증거이며 SMAX 제품 실패 증거가 아님. 동일 우회 무한 반복 금지.
- Node v22.16.0에서 기존 백엔드 `site/csv-transform.mjs`과 테스트의 해시 일치본을 `node --test tests/csv-transform.test.mjs`로 재실행하여 **10 PASS / 0 FAIL**.
- 전체 최신 `frontend` 저장소의 `npm test`, 실제 `npm run build:self`, 실 Windows Edge/Chrome `file://` 테스트, 고객 전달은 **여전히 미실행/미검증**. 이 결과를 출시 게이트 통과로 오해하지 말 것.

## 다음 실행 순서 및 차단 대응
1. Private `frontend` 최신 코드를 승인된 로컬 개발 환경에 확보한 뒤 `npm test` 및 `npm run build:self`. 결과 HTML의 크기·SHA-256·HTML CSP/인라인 스크립트 구조 검증.
2. 표준 Windows Edge(또는 Chrome) 환경에서 `python scripts/qa_browser.py --channel msedge` 검수. `PASS`면 테스트 결과 JSON과 소스 HEAD/HTML SHA를 `STATUS.md`에 기록. 환경 정책에 따라 `BLOCKED`면 별도 테스트 환경으로 이동.
3. 샘플 파일에 대한 사람의 실제 사용성 검토: 파일 더블클릭, 명확한 열 매핑, 다운로드 경로, 오류 표시, 한글 인코딩, 좁은 화면.
4. 릴리스 전 구매자 사용권/복제·업데이트 정책 및 크몽 거래·환불·지원 안내를 검토. `main` 브랜드 변경을 보존하면서 사용자 승인 후 안전하게 통합. 공개 Cloudflare 배포·판매 게시·실고객 자료 업로드는 별도 승인.

최종 제한: 현재 11월 7일은 마감 상한이며 확인된 검증 통과 시 앞당긴다. 실제 브라우저와 Windows 검증을 완료하기 전 크몽 게시 또는 판매 완료 주장 금지.

## 최신 우선 적용: 매출 집계 포함 Node Playwright E2E (스총 후속 2026-10-25)
- 이전의 Python 스크립트 진단/환경 BLOCKED 기록은 **과거 기준**. 현 검증기 `scripts/qa_browser.mjs`는 먼저 `dist/SELF_QA_REPORT.json`의 Node 통과·보안·SHA-256/bytes와 대상 HTML 동일성을 검사해 **불일치 시 Playwright 시작 전 중단**한다.
- **올바른 실행 순서 (frontend 전체 최신 소스 필요)**:
  1. `npm run qa:release` — 전체 Node 회귀, 단일 SELF HTML 빌드, 정적 공개/비공개 경계, 인라인 CSP 해시, QA JSON 생성.
  2. 개발자 환경에 Playwright 및 테스트 브라우저가 준비된 경우 `npm run qa:browser:node` (Chromium) 또는 `npm run qa:browser:node -- --channel msedge` (Windows Edge). 개발자 전용 의존성, 구매자는 별도 설치할 필요가 없도록 단일 HTML 제공 목표.
  3. **브라우저 출고 기준:** 브라우저 결과 `releaseQaArtifactMatch=PASS`, `htmlSha256`가 로컬 `SELF_QA_REPORT.json` 일치, 종료 0, 외부 HTTP(S) 0, 브라우저 오류 0.
- Node 브라우저 검사 시나리오 **총 10개**:
  - 기존 7개: 로컬 `file://` + 템플릿 10종, CSV 4행/검토2행, UTF-8 BOM 변환 다운로드, 잘못된 재매핑 결과 차단, 모바일 너비, 10종 JSON+MD(20개) 다운로드, JS 에러 0/HTTP 0.
  - 신규 3개: (i) 합성 매출 CSV 5행 중 **잠정 2행/검토 3행/순액 79.90원** (ii) 매출 보고서/별도 검토 CSV **2개를 실제 다운로드**하고 각각 BOM·합계/제외 사유 `DUPLICATE`/`INVALID_DATE`/`FORMULA_PROTECTED` 검증 (iii) 월별 변경 시 보고서 무효화·재집계, 같은 열에 중복 매핑 시 실행·다운로드 차단.
- 스크립트 `scripts/qa_browser.mjs`의 신규 브라우저 검사 코드 GitHub 원격 blob `40e46d79f05b01dcc87a01724565dcefb76dbaf3`. **V8 정적 구문 검사 PASS**, 기존 `site/sales-report.mjs`·`tests/sales-report.test.mjs` 원격 일치 로컬 **Node 7 PASS**, `scripts/self-qa-integrity.mjs`·해당 테스트 원격 일치 **Node 6 PASS**.
- **미검증:** 이 최신 E2E 스크립트로 **실 Chromium/Edge를 돌려 10/10 PASS를 얻은 기록은 없음**. 최신 frontend 전체 `npm run qa:release`도 NOT_RUN. Chromium 구버전 7개 검사 통과와 Node 34개 검사 통과는 전 버전 HTML 증거이며 현 버전 완료를 의미하지 않는다. Windows 실기기 역시 별도 검수 필요.
- 민감 데이터·상용 API·유료 계정·네트워크 사용·자동 배포 없음. 실제 판매/크몽 승인 없음. 마감 2026-11-07 유지.

## 2026-10-25 후속: 두 CSV 실행 도구를 묶은 fail-closed 릴리스 증빙
- `scripts/qa-release.mjs`는 **실제 최신 버전의 릴리스 명령이 실행될 때** 기존 `syntheticCsv4Rows2Review=PASS`와 더불어 `syntheticSales5Rows3Review=PASS`를 JSON 보고서에 남긴다. 신규 매출 블록은 합성 5행(정상 2/검토 3), 정확한 합계 79.90원, 원본 검토 사유 `DUPLICATE/INVALID_DATE/FORMULA_PROTECTED`, 보고서/검토 CSV의 BOM, 월별 재집계까지 필수로 통과해야 한다.
- `scripts/self-qa-integrity.mjs` 브라우저 선행 게이트는 두 항목이 **모두 PASS**가 아니면 출고 보고서를 유효하다고 인정하지 않는다. 예전 SHA가 일치하더라도 매출 테스트 증거가 없는 QA JSON이면 거부한다. 기존 JSON과의 호환성 단절은 의도된 판매 안전장치.
- `tests/self-qa-integrity.test.mjs`에 **증빙 누락 거부 2건** 추가, 로컬 Node v22.16.0 실제 실행 **8 PASS / 0 FAIL**, 테스트/헬퍼 local Git hash-object = 원격 Git blob: `5e1f1112718e9753c2f3cb692a9b7e6d71f53001` / `804f744dc866e916fc8f86d43f972d1923e2b92e`.
- 최신 `scripts/qa-release.mjs` Git blob `c8286e09da327876fcb34d84d310d585c4522517`, **V8 정적 문법 검사 PASS**. 최신 릴리스 매출 검증 블록을 원격 동일 `site/csv-transform.mjs`/ `site/sales-report.mjs`와 합성해 **V8 격리 실행 PASS**(2 포함/3 제외, 79.90원, CSV 2개 BOM, 3가지 오류 사유, 월별 합계). **V8 모의 실행은 전체 Node 릴리스 명령 실행 증거가 아님**.
- 기존 매출 모듈 실제 Node v22.16.0 단위 테스트도 `7 PASS / 0 FAIL` 재확인. 변경 후 전체 최신 `npm run qa:release`와 실제 Chromium/Windows 실행은 **NOT_RUN**. 이 문서의 8/8 + 7/7은 각각 **격리 단위 테스트**이고 완성/판매 승인이 아님.
