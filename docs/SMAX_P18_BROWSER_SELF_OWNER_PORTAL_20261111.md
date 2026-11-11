# SMAX² P18 — 고객 직접 CSV 선택형 오프라인 매핑 시작 화면 (2026-11-11 KST)

## 목표·현장 문제
P17까지의 P8 사용 흐름은 소유자가 CLI에서 CSV를 먼저 지정하여 HTML을 생성한 후 브라우저에서 매핑 JSON을 다운로드해야 했다. 비개발자 고객에게는 CLI 선수행이 진입 장벽이다. P18은 SMAX² Square 정적 제품 화면에서 바로 진입하는 **CSV 선택→열 매핑→로컬 JSON 초안 다운로드**를 구현한다. 실제 매출/회계 확정, 사용자 승인, 외부 전송·API, 원본 파일 수정은 여전히 금지한다.

## 설계 비교 및 결정
- **A — Node 로컬 서버/REST UI:** CSV 분석·패키지까지 서버 경유 가능하지만 인증/CSRF·루프백 접근·서버 실행·Windows 방화벽·배포 유지비가 추가된다.
- **B — 단일 HTML 정적 로컬 진입(선택):** 파일 선택·UTF8 헤더 전용 읽기·SHA256·명시 3열 선택·JSON 저장만 브라우저에서 수행. 별도 서버/가입/외부 모델/유료 API/계정·권한 변경 필요 없음. PREP/SELF P9/P12 검증기가 이후 동일한 물리 CSV 파일을 다시 엄격하게 확인한다.
- WebCrypto는 안전한 브라우저 컨텍스트에서만 사용 가능하고 이 테스트 프로필의 set_content에는 `crypto.subtle`이 없어 첫 재현이 실패했다. 로컬 HTTP도 브라우저 정책으로 차단됐다. 재시도 대신 Node 표준 sha256과 실제 Chromium 다운로드를 비교하는 **순수 JS SHA-256 바이트 해시**로 전환했다. 이는 WebCrypto, 서버, 네트워크가 없어도 계산 가능하지만 브라우저별 `file://` 실행은 따로 검증해야 한다.

## GitHub 제품 변경
- `site/owner.html` 단일 파일: Git blob SHA **`b32e0a01c6e30bd8a73a6c468fdc0825a925bff4`**. 기존 정적 `site/index.html` 제품 섹션에 제한된 오프라인 매핑 시작 링크.
- `preprocessing/self-owner-portal.mjs` — HTML 한 파일을 정본으로 읽고 실제 inline JS CSP SHA와 no-network CSP 규칙을 사전 검증하는 재사용 래퍼, blob **`1150276bb4dd2589bf22227398f86c8bd2faccff`**.
- `preprocessing/self-owner-portal-cli.mjs` — 명시 절대 신규 파일 경로 `--output`으로만 안전 생성(`O_EXCL`), 외부 데이터 없음, blob **`ffe2786f49b0d5add3d6201fa5beea7f4a222368`**.
- `tests/self-owner-portal.test.mjs` — 테스트 blob **`b4e01b8b44453bc08faac456c3ac5eb7913e1b3b`**, `npm run test:preprocessing`에 등록.
- `tests/browser/self-owner-portal-e2e.py` — 실제 Chromium14건 재실행 경로, test blob **`6e2795803f85c6f0a3dab5271860e129be5b87b0`**. Python Playwright는 개발 QA 용도로만 사용하며 구매자 실행 필요 없음.
- `package.json`에 `npm run owner:portal` CLI 추가. 기존 `preprocessing`, `main`, `frontend`, `backend` 안정 브랜치와 기존 SELF/PREP 코드 무변경.

## 실제 수행한 검증, 범위 한정
- **Node v22.16.0/Linux — 5 PASS, 0 FAIL, 0 SKIP**: 사이트 정적 HTML과 source reader의 동일성, inline CSP 스크립트 SHA, 고객 데이터 미포함/네트워크 금지, 신규 파일만 독점 생성, 경로·심볼릭 링크·옵션 거부, 실제 자식 Node CLI 호출 및 경로 미노출.
- **실제 Chromium 144.0.7559.96 + Python Playwright — 14 PASS, 0 FAIL**: 고객 CSV 파일 선택, empty/duplicate mappings 차단, 실제 Blob JSON 저장, 정확한 Node SHA256 동일 물리 CSV bytes, 다운로드한 JSON의 기존 P8 `validateOwnerDraft` 원본 모듈 수용, BOM 포함 SHA 별도 일치, 공격형 HTML 헤더가 단순 옵션 텍스트로만 표시, NFKC 중복/숨김문자/수식형/invalid UTF8/>2MiB 파일 거절, 원본 행 비표시, browser network requests **0**, JS runtime errors **0**.
- 사용자 실제 자료를 업로드하거나 외부로 보낸 적 없음. 모든 데이터는 합성 샘플.
- 원격 GitHub의 **정확한 5개 P18 기능/검증 파일 SHA가 위 로컬 테스트에 사용한 파일과 일치** 확인. 이 기록은 `npm run test:preprocessing` 전체 실행 결과가 아니다.

## 검증되지 않은 사항 / 품질 제한
- 이 sandbox Chromium 프로필에서 **`file://` 직접 이동과 `http://127.0.0.1` 이동이 모두 `ERR_BLOCKED_BY_ADMINISTRATOR`**. 브라우저 UI 검증은 `page.set_content(html)`의 실제 Chromium JS/CSP/Blob 파일 다운로드이며 **Windows 10/11 + Edge/Chrome 직접 파일 열기 성공을 증명하지 않는다**.
- 브라우저의 P18 HTML은 **CSV 헤더만 해석**한다. 전체 행 데이터/금액/회계 로직을 검증하는 제품이 아니며 PREP/SELF P9/P12 Native 게이트가 그 역할을 한다. 고객에게 “파일 검토 완료”라고 허위 표기하지 않는다.
- 전체 저장소 `npm run test:preprocessing`, `npm test`, 실제 원본 P8→P9→P12→P16 전체 CLI 실파일 E2E, 통합 SELF 제품, Windows 고객 실사용/설치/코드 서명/라이선스·가격 검증은 **NOT_RUN**.
- 부분 Native + 브라우저 합격이 곧 상용 판매·Production 정상 작동은 아니다. **RELEASE HOLD**, Production URL 미적용.

## 실행법
1. GitHub 제품 저장소의 `site/owner.html`을 브라우저에서 열거나, 기존 SMAX² Square 제품 화면의 링크로 진입한다(직접 `file://` 고객 검증은 미완).
2. CSV 2MiB 이내 파일을 선택하고 날짜·판매채널·금액을 다르게 지정해 `smax-owner-mapping.json` 검토 초안을 다운로드한다. 승인/집계가 아닌 안전한 초안이다.
3. 기존 검증기에서 동일 원본 CSV + 다운로드한 JSON 사용: `node preprocessing/self-owner-delivery-cli.mjs --package /absolute/source.csv /absolute/smax-owner-mapping.json /absolute/new-bundle-dir`. **이 실제 전체 통합 실행은 이 시점에 미검증**.
4. HTML을 따로 독점 생성할 필요가 있을 때만 `npm run owner:portal -- --output /absolute/new-owner.html`.
5. QA: `node --test tests/self-owner-portal.test.mjs`; 기존 전체 테스트 `npm run test:preprocessing`; 브라우저는 Python Playwright/Chromium 준비 후 `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-portal-e2e.py`.

## 범위 평가·다음 작업
- P18은 기존 P8의 **CLI로 HTML 생성해야 하는 온보딩 장벽을 제거**하고 사이트에서 실제 사용자 동작까지 연결한 새 기능이다. 최종상품 공학적 잠정률 **72%→76% (+4%p)**를 보수적으로 인정하며, **85%까지 9%p 남는다**. %는 통과 테스트의 비율이 아니라 고객 납품 기능 범위 평가다.
- 다음 우선순위: 승인된 전체 원본 private checkout에서 Native 전체 테스트·P18 다운로드 JSON→P9/P12/P16 통합 real file/리뷰 HOLD 검증 → Windows Edge `file://` 및 customer UX/설치 → SELF 실제 제품 연계 → 85% 증거 기반 재평가.
- GitHub 이전 기능 SHA로 복구 가능, 원본 CSV 무변경, 인증/환경변수/민감정보/배포/결제·지출 없음.

**Updated 2026-11-11 KST.** Latest feature branch docs commit and central hub sync SHA must be checked after writing.
