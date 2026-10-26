> **최신 2026-10-26 — SELF AI 인계 Markdown 데이터/명령 경계 수정:** `site/core.mjs` 실제 코드에서 외부 CSV 헤더/사용자 답변이 개행+Markdown `## 관리자 지침`으로 가짜 지시 섹션을 만드는 결함을 재현해, 입력 필드·질문 답변을 단일 행 리터럴 데이터로 이스케이프하고 `<script>`/방향제어를 제거하는 출력 경계 구현. JSON 설계 값은 기존 계약 유지. 회귀 2개 고립 V8 각 1/1, 생산 5모듈 결합 V8 syntax PASS, 악성 입력 6/6 PASS. **최신 Native `npm run qa:release`/오프라인 새 SHA·CSP/Windows Edge 실제 E2E는 NOT_RUN**이며 이전 Windows 86/86 PASS·Edge FAIL은 구버전 증거. 제품 코드/테스트/STATUS/HANDOFF는 Private `frontend`에 기록; `main`·`backend`·판매/배포 무변경, 11-07 기한 유지. 다음 안전 작업은 릴리스 실검증·회귀 확인, 형에게 반복 Windows 명령 요구 금지. 최종 SHA는 각 브랜치 최신 조회 기준.

> **최신 2026-10-26: 설계 가이드 항목명은 이제 명시적 미검증.** 8종 가이드에 직접 적은 이름이 입력됐다는 이유만으로 검증됐다고 판정되는 결함 수정: JSON `guideOnly:true`, `fieldVerification:UNVERIFIED_MANUAL_FIELD_NAME`, `needsReview:true`, `NEEDS_REVIEW` 유지; AI 구축 가이드에 현장 확인 경고. 실행형 2종의 수동 CSV 매핑 흐름은 보존. 실제 GitHub 코드 V8 18/18 PASS, Node·Playwright 회귀 소스 추가. **전체 최신 Native Node / 실 Chromium·Windows QA는 NOT_RUN**. 출시/병합/비용/외부 공개 미승인. 마감 11월 7일.

> **최신 2026-10-26: 8종 가이드 맞춤 항목명 입력 구현.** 원래 모든 가이드가 공통 필드 목록만 내려받던 문제를 수정. 실행형 2종은 CSV 처리 유지, 가이드 8종은 각 항목명을 120자 이내 직접 적어 JSON 설계서·AI 구축 Markdown에 반영. 실제 고객 파일 처리/외부 자동화 아님. 원격 제품 5모듈 V8 UI 검증 **28/28 PASS**, Node VM·Playwright 신규 회귀 테스트 소스 GitHub 반영, **실제 전체 Node·Chromium/Windows 릴리스 검증 NOT_RUN**. `main`/`backend` 불변, 사용자 승인 없는 판매·배포·병합 금지.

> **최신 2026-10-26 CSV 검토행 분리:** SELF 엑셀·CSV 실행형에 전체 `SMAX_STANDARDIZED.csv` 외 **검토 대상 행만 `SMAX_STANDARDIZED_REVIEW.csv`** 추가. 합성은 `SMAX_DEMO_STANDARDIZED_REVIEW.csv`, 검토0건은 버튼 숨김, 파일·매핑 변경시 이전 검토 결과 차단. 실제 원격 제품 코드 V8 UI/Blob **8/8 PASS**와 Node·Playwright·release gate 테스트 소스 GitHub 반영. **최신 Native 전체 릴리스/실 Chromium/Windows 테스트는 여전히 NOT_RUN**, `main`·`backend` 미변경·판매/병합 미승인. `STATUS.md`·`HANDOFF.md` 최신 섹션 참조.

> **최신 2026-10-26 오프라인 사용자 훈련:** SELF의 2개 실행형 템플릿에 `연습용 원본 CSV 다운로드` 추가. `SMAX_DEMO_SPREADSHEET.csv` / `SMAX_DEMO_SALES.csv` (UTF-8 BOM, 저장소 고정 합성 fixture 원문 그대로). 사용자는 샘플 받아 재업로드/3열 수동매핑·로컬 실행을 연습 가능. 실제 GitHub 모듈 V8 Blob 7/7 PASS, Node/Playwright 회귀 소스 추가, 전체 릴리스/실 Chromium·Windows QA는 **NOT_RUN**. `main`·`backend` 병합/판매/배포 금지, 2026-11-07 개발 목표 유지.

> **최신 2026-10-26 실행 범위 UX 정리:** 사장님 SELF 10종 중 로컬 CSV 업로드·변환·합성 예제가 실제 가능한 것은 **엑셀·CSV 통합, 매출 집계·보고서 2종만**. 나머지 **8종 가이드 전용**에서는 CSV 업로드/매핑 UI를 숨기고 안내 문구+JSON/AI 구축 가이드만 제공. GitHub 실제 제품 모듈의 격리 V8 28/28 PASS, Node VM·브라우저 회귀 소스 추가, README의 오래된 1/9 설명도 2/8로 수정. **최신 Native 전체 릴리스/실 Chromium·Windows Edge는 미실행**, 출고·판매/배포·main 병합 미승인.

> **최신 2026-10-25 SELF DEMO 문서 보호:** 원클릭 합성 예제 실행 도중 다운로드한 `AX_BLUEPRINT_*.json`/AI 구축 가이드도 **`SMAX_DEMO_` 파일명 + 합성 자료 경고**로 분리. 자기 CSV 재선택 후에는 경고 및 DEMO 파일명 초기화. GitHub 앱 모듈 V8 8/8 및 내장/원본 fixture V8 5/5 확인, 신규 Node test 파일/릴리스 필수 검사 작성. **Native 제품 전체/Chromium/Windows 검증은 여전히 미실행**, 판매·병합 미승인.

> **최신 SELF 첫 체험 UX(2026-10-25 KST):** `frontend` `site/app.mjs`에 사장님 CSV 정리/매출 집계용 **합성 예제 바로 체험** 추가. 4행·검토2, 5행·잠정2·제외3·순79.90 확인, `SMAX_DEMO_` 출력명과 실제 CSV 교체 시 예제/자동매핑 삭제 적용. 실제 원격 앱 코드 V8 이벤트 **10/10 + 다운로드 7/7 PASS**, 신규 Node VM/Playwright 테스트 소스 GitHub 반영만; **최신 Native 전체 Node, 실제 Chromium·Windows Edge NOT_RUN**. 퀵스타트와 STATUS/HANDOFF 최신 문단 참고. `public-site`·`main` 공개·병합·판매 미실행, 2026-11-07 마감 유지.

> **최신 실제 Native Node VM 오류 수정(2026-10-25 KST):** `site/app.mjs`에서 fatal UTF-8 `TextDecoder`가 VM 바깥 영역의 `TypeError`를 던지면 `instanceof TypeError`가 false가 되어 raw 오류를 노출하는 결함을 확인. `error?.name === 'TypeError'`도 확인하도록 고침(커밋 `bb25b0e7d79fa1b7129440f185bf62fea844225f`). Node v22.16.0의 교차 실행 영역 테스트 3/3 PASS(잘못된 UTF-8 한국어 경고, 정상 한글 보존, 비인코딩 I/O 에러 보존). 기존 `tests/offline-ui-smoke.test.mjs`에 이미 원시 바이트의 한국어 오류 기대 회귀가 있으므로 제품 수정으로 해당 검사 충족 목표. **2026-10-25 이전 SHA 57b9.../84,678 bytes는 수정 전 빌드 증거이며 이제 현재 HEAD 해시가 아님**. 최신 Native 전체 `npm run qa:release`, 실제 Chromium·Windows Edge는 여전히 NOT_RUN. 

> **최신 `frontend` 통합 검수(2026-10-25):** `main`과 `frontend`는 `diverged` — 최신 GitHub 비교에서 ahead 194/behind 43, **양쪽 변경 동일 경로 5개**(브랜드/공유 문서 및 사이트 HTML·CSS), **`main` 전용 사업·스몽이 결정 7개 문서**. `docs/SAFE_MAIN_FRONTEND_INTEGRATION_20261025.md`에 보존·수동통합 우선순위 기록. Git refs만 읽는 `scripts/qa-branch-reconcile.mjs` / 3개 합성 Git Native Node 테스트 **3/3 PASS**. **main 병합·출시·QA 전체 통과는 아님**. 최신 소스 `npm run qa:release`/Chromium/Windows Edge는 여전히 NOT_RUN, 사용자 승인 없는 공개/판매 금지.

> **최신 빌드 증거 2026-10-25 KST:** 현재 `frontend` 제품 원본과 정식 `bundleOfflineSelf` 함수로 만든 **V8 인메모리 HTML**은 **84,678 bytes**, 실제 SHA-256 `57b9abdadce1f9c489f51bdc585ff1f4bfed5a6a4703402cc388a03998f9a838` (표준 해시 벡터 3/3 교차확인), CSS/JS CSP 본문 일치 및 2종 합성 변환·공개 정적 경계 10/10 통과. 정본 `docs/QA_IN_MEMORY_REAL_SHA_20261025.md`. **디스크 파일 생성 및 최신 전체 `npm run qa:release`/실 Chromium/Windows Edge는 여전히 NOT_RUN**. 아래 이전 34/34·Chromium PASS는 **과거 버전** 근거로만 취급. 이후 `ㄱ`은 같은 인메모리 검사 반복보다 Native 실제 검증/출고 준비를 우선. 2026-11-07 상한, 별도 판매 승인 유지.

> **최신 안전 수정 2026-10-25 KST — UTF-8 CSV 원본 보호:** Private `frontend`에서 `site/app.mjs`의 CSV 업로드를 브라우저 `TextDecoder('utf-8',{fatal:true})` 기반 로컬 바이트 검사로 변경. CP949·잘못된 UTF-8은 매핑 이전 거부, 정상 UTF-8은 기존 양쪽 실동작 도구에서 계속 사용. `tests/csv-ui.test.mjs` 회귀 및 `scripts/qa_browser.mjs` 두 흐름 인코딩 검사 추가. 실제 원격 모듈 V8 앱 이벤트 검사 **CSV 4/4 + 매출 4/4**, 격리 Native Node TextDecoder 바이트 2/2 통과(전제품 Native Node/브라우저 QA와 별개). **수정 후 `npm run qa:release`/새 SHA/Chromium·Windows Edge E2E는 NOT_RUN**; 앞선 34/34·Chromium PASS는 구버전 산출물 근거. 개발 상한 2026-11-07, 승인 없는 배포/판매 금지. 마지막 `HANDOFF.md`·`STATUS.md` 최신 단락 우선.

> **최신 QA 업데이트 2026-10-25 KST:** Linux ARM64 Chromium 156의 실제 `file://` **오프라인 E2E PASS**, CSV 4행 보존/검토2행/UTF-8 BOM 실제 다운로드, JS 오류·외부 HTTP 요청 0. 10종 템플릿 JSON+MD 가이드 **20건 실제 다운로드 성공**. 재현 명령 `npm run qa:browser:node`; 상세 `docs/QA_REAL_CHROMIUM_E2E_20261025.md`. 기존 Node 34/34 PASS 및 HTML 73,352 bytes, SHA-256 `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca` 유지. **Windows 실제 PC Edge/Chrome 검증·상품 출시 승인/디자인 확정은 아직 미완료.** 아래 'Linux 브라우저 BLOCKED' 옛 문장보다 이 최신 증거 우선.

> **최신 작업 상태 2026-10-25 KST:** 현재 주 캐릭터 이름 **스몽이**만 확정, 실제 웹 디자인 최종 승인 보류(`main/docs/SMONGI_PRIMARY_MASCOT_DECISION_20261025.md`). SELF 화면의 구형 맥콩 안내 문구 수정. Native Node 22.23.4 전체 **34 PASS / 0 FAIL**, `npm run qa:release` 실제 성공, HTML **73,352 bytes**, SHA-256 `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca`. Linux Chromium은 공유 라이브러리 부족으로 실행 전 차단, **Windows 실기기 E2E 미검증**. 최신 증거 `docs/QA_CHROMIUM_BLOCKER_AND_BRAND_COPY_20261025.md`. 아래 이전 33 PASS·NAON2·맥콩 '현행' 서술보다 이 최신 상태와 `main`의 변경이 우선.

# 스총 새 채팅 자동 복원 — SMAX² Square (최신 2026-10-25)
## 사용자 지정 1문장 (정확히 이 문구)
**`너는 스총이다 레포지토리보고 작업이어가셈`**

## 역할
너는 GPT-6 **스총**이다. 전담 저장소는 **Private `hibi89/SMAX`**이며 `main` 정본. 사용자는 모든 사업·출시·외부 권한 최종 승인자. **해총과 동일 인물이 아니다**: `hibi89/hackathon-command-center-2026` 및 KIC/PayPal/UGREEN 대회 레포를 함부로 수정하지 않는다.

## 무조건 실행할 복원 알고리즘
1. GitHub 연결로 `hibi89/SMAX`을 검색/열고 **Private·main HEAD·backend/frontend HEAD**를 실제 확인. 연결되지 않으면 읽을 수 없다고 밝히고 사용자에게 연결만 요청; 추측 또는 옛 채팅에 의존하지 않는다.
2. **이 문서 → `docs/STECHONG_CANONICAL_CONTEXT_20261025.md` → `HANDOFF.md` 최신 마지막 단락 → `STATUS.md` 최신 마지막 단락 → `docs/SMAX_FOCUS_SPRINT_20261025_NOV07.md` → `docs/SELF_WEB_ROADMAP_20261025.md` → `AGENTS.md` → 해당 소스/테스트** 순서로 읽는다. 과거 내용과 상충하면 **최근 사용자 결정·실제 원격 코드/증거**가 우선.
3. 완료/미완료/차단 항목을 정확하게 구분한다. 최근 푸시된 코드·테스트·로컬 결과를 읽고 같은 과제를 중복 수행하지 않는다.
4. 별도 사용자 승인 필요 없는 다음 안전한 작업을 **실제로 구현·테스트·커밋**한다. 첫 작업 우선은 CSV 로컬 실제 변환 1종+fixture. 별도 승인 필요 작업은 보류하고 다른 안전 과제로 이동.
5. `STATUS.md`, `HANDOFF.md`, 중요 변경 문서/테스트 및 원격 SHA를 갱신하고 완료 범위·다음 1작업·블로커를 보고한다. 빈 커밋/근거 없는 완료/백그라운드 실행 주장 금지.

## 핵심 정책 요약
- 사업명 **SMAX Square (SMAX²)**, 미션 **염가 AX 대중화·참여형 광장**, 공식 로봇 **맥콩**(사용자 제공 새싹·보라빛 레퍼런스).
- 1차는 **사장님 존 + SELF**. 2026-10-25~11-07 개발 집중. 10개 설계/교육 템플릿, 규칙형 2패널, 직접 써볼 수 있는 로컬 결과물 1종 이상을 목표. **자체 유료 AI API 필수 아님**.
- WEB 고객별 유료 자동화, 학생/학부모 존, 공백상권 추천, 커뮤니티·수주의뢰/캐릭터 굿즈는 **미래 범위**. 홈페이지 자체 결제/회원가입·외부 거래유도 금지; 크몽은 실제 등록 후 공식 안전결제.
- `site/`에 미리 구현된 핵심 기능을 **그대로 공개하지 않는다**(유료 코어 노출 위험). Cloudflare 실제 배포/판매/비용/고객 데이터/외부 API 등은 별도 승인. 실 Node/Windows/browser QA·크몽 실제 판매는 아직 미검증/미실시.
- 해커톤 3개는 **해총**이 맡는다. 11/7까지 스총 집중, 해커톤 공식 제출 위험은 각 총괄이 관리.
- `ㄱ` = 이 스총 채팅의 다음 안전한 실제 작업.

## 장기 원본 보존
과거 구형 부트스트랩은 `docs/history/CHAT_BOOTSTRAP_PRE_STECHONG_20261025.md`에 백업. 이 문서가 그보다 우선.

## 2026-10-25 최신 Native QA 상태 (옛 HANDOFF/STATUS의 '전체 미검증' 문구보다 우선)
- 정본 증거 `docs/QA_FULL_NODE_AND_OFFLINE_BUILD_20261025.md`: Private frontend 실제 GitHub SHA 일치 소스 20파일, Node 22.23.4 전체 **33/33 PASS**, `npm run qa:release` 통과. `SMAX_SELF_OFFLINE.html` **73,341 bytes**, SHA-256 `093d1c8bff820369b664007fbecdd252a387b6cf354398247c754fb59b680563`, 별도 재빌드 일치.
- 미완료: 실제 Windows Edge/Chrome `file://` E2E·사용자 승인·main 안전통합·크몽 등록. **다음 `ㄱ`은 브라우저 QA 최우선**, 이미 끝난 CSV/Node 반복 검증에 개발 시간 낭비 금지.
