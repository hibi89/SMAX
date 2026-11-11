# SMAX² P5–P7 verified-scope handoff — 2026-11-10 KST

1. **목표·용도·확정 요구·기술:** 사용자 요청 **최종상품 50% 목표**, 이전 45%. SMAX² = SELF+PREP 로컬 우선 고객용 AX 제품. Node20+ built-in JS/명시 로컬 CSV/정형 JSON, 원본 읽기 전용·개별 고객 데이터 무단 로깅/전송 금지. 대회/해총 코드 외부 이동, 자동 승인/실행·결제 금지.
2. **완료 기능·설계 판단:** 두 설계(폴더 자동탐색/프론트 강제 병합 vs 명시 소유자 manifest/로컬 초안·독립 HTML)를 성능·비용·보안/유지보수로 비교, **명시 로컬 기능** 선택. P5 최대8 CSV의 SHA256 중복 차단·BigInt 집계·하나라도 HOLD면 부분 금액 미표시, P6 무JS/CSP/비공개 데이터 비노출 HTML, P7 한국어·영어 열 매핑 후보·동일 후보 충돌 보류·수식형/숨김문자 차단·자동 적용 불가. P3/P4 원래 기능 원본 불변. 새 테스트 17+15+18+10 = **60개 작성/체크인**, 기존 테스트/CLI 유지. P5 +2%p, P6 +1%p, P7 +2%p -> 전체 최종상품 **잠정 50%**.
3. **실행 명령·테스트 결과·미검증:** Native Node22.16 P7 **`node --test tests/self-column-suggest.test.mjs tests/self-column-suggest-cli.test.mjs` 28 PASS/0 FAIL/0 SKIP**, P7 소스+테스트 **4개 GitHub blob SHA 로컬 `git hash-object`와 동일**. 단 CLI 도메인 `site/csv-transform.mjs`·P4 파일리더는 **테스트 더블**, 전체 Native 원본 repo 실행 아님. P7 Github 원본 실제 parser+CLI V8 9/9. P5 원본 배치 함수 V8 17/17, P6 실제 HTML 렌더러 V8 14/14, P3 PREP Generic/SELF gate 원본 SHA-256 구현 포함 V8 14/14. P3→P4→P5 전체 실제 알고리즘+SHA256 V8 9 PASS/1 검증하네스 structuredClone 미실행, 합성 net 275.00. `npm run test:preprocessing`에 기존+60 새 P5/P6/P7 Node tests 등록, **전체 Native test NOT_RUN**. `preprocessing` Actions 0, Windows/실고객/실 UI E2E 미검증.
4. **완료·진행·대기·차단:** 신규 batch/safe HTML/mapping-self-onboarding 소스·테스트·예제/문서 GitHub 반영. 완성률 **50% 잠정 목표 도달** — 전체상품 기능 범위 자체 평가, 원격 Native 실행/고객 수용/상용 출시가 검증된 것은 아님. 실제 고객 출고/결제/권한/배포 **HOLD**.
5. **오류 근거·시도·실패 방식·대안:** Container에서 Private GitHub clone `Could not resolve host github.com`; 이전 이력과 같은 DNS 실패로 반복 시도하지 않음. GitHub 커넥터 소스 CRUD→격리 V8 진단 및 P7 소스 byte-identical Native Node 실행으로 전환. P7 첫 후보 엔진 V8 14 중 2 미달: (a) 테스트가 U+200D를 실제 숨김문자 대신 문자 리터럴로 넣은 하네스 문제, (b) 5자 이상 alias substring만 검사해 4자 `매출금액` compound header 놓침. 4자 기준으로 최소 수정 후 V8 14/14, Native 28/28. P3→P4→P5 10번째 테스트 하네스는 `structuredClone` 미제공으로 NOT_RUN (기능 결함으로 오인 금지). 같은 무효 테스트 반복·강제 배포 금지.
6. **저장소·브랜치·SHA·경로:** `hibi89/SMAX@preprocessing`, 최신 P7 기능+테스트 커밋 **`3190da505efcd55e7e83a1eabe994fbd8c9e5718`**. 이전 코드 브랜치 HEAD P4 `a9eb2e23626e8a4ce60998b2f6c2b9756ab9eb73`, P5 SHA `5ad2a7c698695f40c1e6163c0ae72f56a7bfb0cf`, P6 SHA `1e68e914e488abaf646d1c36adfe4728d6545d83`, P7 `3190da505efcd55e7e83a1eabe994fbd8c9e5718`. P5 `preprocessing/self-preview-batch.mjs`, P6 `preprocessing/self-preview-html.mjs`/`self-preview-html-cli.mjs`, P7 `preprocessing/self-column-suggest.mjs`/`self-column-suggest-cli.mjs`, `tests/self-preview-{batch,html}.test.mjs`, `tests/self-column-suggest{,-cli}.test.mjs`, `docs/PREP_SELF_{BATCH,HTML_REPORT,COLUMN_SUGGEST}_20261110.md`, `package.json`.
7. **Production/Vercel/실행 환경:** 로컬 Node22.16 P7 isolated Native test, Node20+ 제품 지원 목표. `npm run preview:self`, `preview:batch`, `preview:batch:html`, `preview:suggest`. Production URL/Vercel **미적용**, 기존 Static Cloudflare/Vercel 변경 없음, browser UI 런타임 E2E 미검증.
8. **원본 위치·백업·인증/수정 금지:** GitHub 커밋 이력으로 P4 이전 및 P5/P6 복구 가능. 고객 데이터·토큰/.env·가중치·실기업 레코드 GitHub 미업로드. `main`, `frontend`, `backend`, 외부 해커톤 KIC/PayPal/UGREEN·REA_Web 소스 변경 없음; 인증/도메인/유료/외부전송 수정 없음.
9. **다음 우선순위·완료 기준·승인:** `npm run test:preprocessing` 원본 전체 Native Node20+/22 체크아웃에서 실행→failures 최소수정 후 전체 회귀 증거 → Windows10/11 + Edge/Chrome 실사용 CSV/설정/HTML + SELF frontend 실제 승인 UI 통합. 고객 실자료는 민감성 검토/승인 후, 외부 API/유료 runner/권한 변경·상용 릴리스는 사전 승인. 사용자 직접 작업은 마지막 단계에서 묶어서 요청.
10. **갱신 일시·기준 SHA·검증 범위:** 2026-11-10 KST, 기능 소스 `3190da505efcd55e7e83a1eabe994fbd8c9e5718` 검증, Native exact P7 Node22 28/28 및 V8 범위 위와 같음. 후속 문서-only HEAD는 Push 후 다시 확인·해총 기록. 50%는 **잠정 제품 범위 추정**이고 Release HOLD·Native 전체/실브라우저/Windows 미검증.
 
---

> **P4 추가 Native CLI 검증(2026-11-10 KST):** 정확 SHA `8a59c0877655ff734251e131c162e6dbceb05fed` 일치하는 새 CLI 소스를 Node22.16 실제 자식 프로세스로 호출해 **3/3 PASS**: 정상 입력 exit0/JSON stdout, 미허용 `--approve` exit1/정적 stderr·stdout 없음, 미존재 입력 경로 exit1/경로 비노출. 기존 Node Native fd/UTF8/symlink smoke **11/11 PASS**와 합계 **Native 독립 14/14 합성 확인**. **중요:** 두 검사 모두 PREP Generic CSV와 SELF report는 **시험용 mock 모듈**을 사용, 실제 repo 전체 `npm run test:preprocessing` 및 신규 Native 통합 테스트 16개 **미실행**. SMAX² 45% 그대로, 최종상품률·판매 승인 미상향.

# SMAX² P4 handoff — Local PREP→SELF CLI, 2026-11-10 KST

1. **목표·용도·확정 요구·기술:** Private `hibi89/SMAX@preprocessing`에서 PREP Generic V1 → SELF 매출 초안의 소유자 입력형 로컬 실행을 제공. Node20+ 표준 내장 파일 I/O·UTF-8·CPU만 사용; 네트워크/모델/유료 API/고객 원본 변경 없음. 16종 크몽 상품에서 SMAX² 완성률 **45%** 잠정, 독립 상품 유지.
2. **기능·결정 근거:** A UI 브랜치 즉시 병합/자동 실행 vs B PREP 브랜치 메모리 소비형 CLI. 안전·성능·비용·회귀 위험으로 **B** 선택. `node preprocessing/self-preview-cli.mjs --input <local.csv> --config <local.json>`, 엄격 인수, config는 `{columns,mapping,period}`, 2MiB CSV/64KiB config/strict UTF8, 기존 경로 일반 파일 확인 및 원본 변경 확인, symlink/신규 출력/파일 쓰기·비허가 API 전부 거부. P3 gate는 PREP/SELF 검토 대상 HOLD/집계 초안만 반환. 원본 및 customer columns/rows 무출력. 종료 0 READY(승인 아님), 2 HOLD, 1 INVALID.
3. **테스트 명령·결과·미검증:** 실제 exact CLI SHA `8a59c0877655ff734251e131c162e6dbceb05fed` 로컬 git hash-object 일치, Node22.16 `node --check` **PASS**, 동일 파일+가짜 PREP/SELF 모듈 Native 파일 I/O smoke **11/11 PASS/0 FAIL**(UTF8 오류, 2MiB 제한, symlink, 파일 불변, parser flag, strict config 포함). `tests/self-preview-cli.test.mjs`에 **16 Native child-process 통합 테스트 작성/저장**했으나 실제 원본 PREP/SELF가 함께 있는 전체 Node `npm run test:preprocessing` **NOT_RUN**, 16/16 PASS 아님. 기존 P3 격리 V8 14/14 (SHA/UTF8 test doubles) 별개. 현재 GitHub Actions on `preprocessing` **0건**, 유료 runner 무단 변경 금지.
4. **완료/진행/대기·차단:** P3 메모리 계약과 P4 Native CLI 파일 게이트/README/docs/합성 fixture/테스트 16개 추가 GitHub 반영. 기존 45%에서 수치 상향 없음 — 통합 Node Native 소스 전체 tests 미검증, Windows Native·실 UI 간 병합/실고객 E2E/라이선스·상용판매 HOLD.
5. **실패 근거·원인·시도·대안:** Private GitHub 컨테이너 직접 네트워크 클론이 이전 세션에서 DNS 실패했고, 동일 무효 방식 반복 안 함. GitHub 앱으로 원본 정확 소스/Blob CRUD, Node Native 파일 I/O는 정확 새 CLI 자체만 로컬 구동. PREP/SELF 도메인 mock 대신 실제 소스 전체 통합 환경이 필요하다는 한계. 다음은 사용자 승인된 local checkout (또는 정책/비용 검토된 Actions)에서 전체 `npm run test:preprocessing` 수행; CI 0건이 장애/실패를 뜻하지는 않음.
6. **저장소·브랜치·SHA·경로:** `hibi89/SMAX@preprocessing` 기능+테스트 커밋 `9358eb0a383b2d89b2bb574a8ac88577542bf334`. 이전 P3 docs-only HEAD `101a9d3f9f82e1a285b2d1b2ea8cac1605ee9bea`로 복구. 신규 `preprocessing/self-preview-cli.mjs`, `tests/self-preview-cli.test.mjs`, `preprocessing/examples/synthetic-self-preview.{csv,config.json}`, `docs/PREP_SELF_PREVIEW_CLI_20261110.md`; `package.json` 추가 scripts. P3 기능 SHA `037576e74359e2961838dc8891b7f196c47ece03` 그대로.
7. **Production URL/Vercel·실행/환경:** 개인 로컬 Node CLI만; Vercel/Cloudflare Production URL **미적용**, 브라우저 프론트 UI 수정 없음. Native Node22.16 CLI 정확 파일 static + Stub IO smoke / 실제 GitHub repo Native suites 미검증.
8. **원본·백업·비밀·수정 금지:** 기존 branch SHA로 복구. 모듈은 source/config를 읽기만 하며 실고객자료·비밀·키/토큰/원본 Excel/CSV·브랜치(main/frontend/backend)·RAG/해커톤 다른 저장소 무수정. 고객 데이터는 GitHub/로그/외부 모델에 올리지 않음.
9. **다음 작업·완료 기준·승인:** 정확 repo checkout에서 `npm run test:preprocessing`와 `node --test tests/self-preview-cli.test.mjs` 실행, 예상 16건 원본 소스 통합 테스트; 오류 수정 후 검증 통과하면 **최종상품 완성률 재평가(45→?)**. 이어서 SELF UI 연결(브랜치 자동 merge 없이 계약 기반), Windows PC/실고객 설치/보안·가격 검증 일괄. CI runner 비용/권한/상용배포는 별도 사전 승인.
10. **갱신시점·범위·문서 SHA:** 2026-11-10 KST, GitHub 기능 SHA `9358eb0a383b2d89b2bb574a8ac88577542bf334` 및 new CLI blob sha + Native Node22 standalone tests만 증거. 문서-only SHA는 후속 push 후 실제 재조회할 것. CURRENT: 45% / 100%, Native full NOT_RUN, RELEASE HOLD.

---

# SMAX² PREP → SELF P3 verified-scope handoff — 2026-11-10 KST

1. **목표·요구·기술:** SMAX² 최종상품 SELF+PREP 기능을 안전하게 연결. Python/AI 대신 Node20+ 표준 JS, `hibi89/SMAX` 비공개 `preprocessing` 브랜치에서만 로컬 CSV 미리보기. 기존 PREP Generic V1 package/SELF `buildSalesReport` 그대로 재사용. 소유자 승인 없는 자동 처리 금지.
2. **완료 기능·결정 근거:** A 직접 브랜치 병합/자동 매출 집계 vs B 제한적 adapter. A는 frontend/prep/Main drift·상태승인·데이터유출 위험이 크고 권한 변경을 수반; **B** 선택. `buildSelfPreviewFromPrep(csv, package, {mapping,period})`는 원본부터 PREP V1 재계산하여 패키지 위조/변경 검출, 명시 정확 3열 검증, 2MiB/20k행 제한, PREP 검토 미완이면 `REVIEW_HOLD`, SELF 집계에서 제외 행 있어도 HOLD. 정상에도 `READY_FOR_OWNER_REVIEW`, `NOT_GRANTED`·`NOT_PERFORMED`. 집계 초안 요약만 반환, 원본행/고객 채널/파일 저장·외부전송 없음.
3. **테스트 명령·PASS/FAIL·검증 한계:** `node --test tests/self-preview-gate.test.mjs`, `npm run test:preprocessing`, `node --check preprocessing/self-preview-gate.mjs`. **격리 V8에서 실제 GitHub 기존 `site/csv-transform.mjs`, `preprocessing/generic-csv.mjs`, `site/sales-report.mjs` + 신규 모듈/14개 테스트 실행 결과 14 PASS/0 FAIL**. 해시와 UTF8 API는 test double이며 native Node 전체 검증이 아님. 별도 동형 작성 파일 Node22 `--check` 2개 PASS, 실제 GitHub 바이트 동일성 Node --check **미검증**. `preprocessing` GitHub Actions 조회 결과 이 시점 0건; Windows/고객 원본/로컬 네이티브 통합 미검증.
4. **완료/진행/차단:** 새 안전 접점 구현·격리 검증, GitHub 기능/테스트 반영. 두 브랜치 실제 UI 통합 E2E/전체 NPM/Windows/배포/상용권 대기. 최종상품 완성률 **45%(잠정, 미상향)**. 기술 제한을 누락해 46% 이상 인정 금지.
5. **오류·시도·재시도 금지·대안:** Private repo DNS 접근 불가 `git ls-remote`(Could not resolve host github.com)로 컨테이너 전체 native checkout 불가; GitHub 커넥터를 통해 원본 소스 조회·비공개 브랜치 안전 커밋으로 전환. GitHub native CI 0회 및 테스트 mock 범위 정직하게 표기. 동일 무증거 네트워크 반복·새 유료 CI/권한 변경 금지. 사용자 로컬 Windows Node 또는 접근 승인된 GitHub runner에서 추후 온전한 repo 테스트.
6. **저장소/브랜치/SHA/경로:** `hibi89/SMAX@preprocessing`, 기능 코드 검증범위 SHA `037576e74359e2961838dc8891b7f196c47ece03`; 원 이전 SHA `ff94d0cd971ab143eb4b8b7665f308f85fb6df97`로 복구 가능. `preprocessing/self-preview-gate.mjs`, `tests/self-preview-gate.test.mjs`, `package.json`, `preprocessing/README.md`, `docs/PREP_SELF_PREVIEW_GATE_20261110.md`.
7. **Production/Vercel·명령·실행환경:** 로컬 Node CLI 미리보기 함수만 추가; Vercel/Cloudflare Production 변경 **미적용**. 검증된 V8 임시 실행과 Node22 소스 구문, 실제 고객 Windows Node22 실기기 미실행. `npm run test:preprocessing` 아직 실행 증거 없음.
8. **원본/백업·인증/수정금지:** Private SMAX 원본 소스·실 고객파일/비밀·토큰·모델 사용하지 않음. 버전 복구는 이전 GitHub SHA. `main`, `frontend`, `backend`, RAG_STUDIO와 public 도구 수정 없음. 고객자료 GitHub·로그·무료 LLM 업로드 금지. 승인/결제/배포 정책 불변.
9. **다음 작업·완료 기준·승인:** 우선 전체 원본 checkout에서 `npm run test:preprocessing`와 실제 Node20+ 테스트, Native SHA 확인, 합성 CSV 원본 불변+개인정보 유출 없는 통합 E2E. 이후 명시 승인형 UI 연결·Windows 실기기/패키지 시험, 고객자료/공개 배포/비용/권한은 사전 소유자 승인. 사용자가 직접 해야 하는 Windows 검증은 마지막에 한 번에 모은다.
10. **갱신 KST·확인 범위·기준 커밋:** 2026-11-10 KST, GitHub 실제 Source/HEAD(기능 `037576e74359e2961838dc8891b7f196c47ece03`) 및 격리 테스트 14 PASS/0 FAIL만 확인. 후속 문서 커밋은 Push 후 HEAD 재조회. 45% 잠정, RELEASE HOLD.

---

# HANDOFF — 2026-10-25 KST

## 결정
1. 제품명 **SMAX** (Self-Made AX Platform) 확정 사용. **상표 사용 가능성/상표 등록은 미확인**이며 법적 등록은 보류.
2. 제품은 SaaS **셀프서비스 AX 표준화+제한된 자동화**. 무제한 개인별 맞춤 외주가 아님.
3. 고객은 자연어·허가된 데이터/문서를 넣고, AI는 회사 업무 절차·규칙·예외·의존성과 누락 질문을 추출해 **SMAX의 공통 스키마와 허용 모듈**에 맞춘 설계안을 만든다. 사람이 수정·승인한 뒤 dry-run / 제한된 실행.
4. 사용자가 구상한 '프로그램 내부의 제약된 사고 로직'은 단순 RAG 검색보다 넓은 **도메인 제약형 업무 추론+규칙 엔진+검증 파이프라인**이다. 모델의 비공개 내부 사고를 읽거나 영구적으로 제어한다고 주장하지 않는다.
5. 범용 플랫폼이 장기 비전, 초기 출시 지원 범위는 표준화 가능한 소수 업무 유형. 복잡한 ERP 완전 통합, 임의 코드 실행, 회사별 레거시 프로세스 완전 복제는 초기 제외.
6. Private GitHub `hibi89/SMAX`를 2026-10-25에 사용자가 생성. 별도 공개 마케팅 저장소는 실제 필요할 때 검토.
7. 사용자는 콜드콜, 출장, 기업별 맞춤 수주를 하지 않음. 자가 가입·데모·검색 유입·리셀러 파트너 중심.
8. 2026-10-25 하루는 해커톤 3개 업무를 쉬고 SMAX 사업 구상. 대회 법정/공식 마감 보존.
9. 상표·수십억 가치·엑싯은 **장기 가능성 시나리오**이며 현재 매출/가치 근거 없음. 제품-시장 적합성과 첫 99,000원 판매를 먼저 검증.

## 현 상태 / 증거
- 이 저장소: README 및 기획·보안·가격·재무·일정·인수인계 문서. 이 채팅이 원격 커밋·Private 여부를 확인한 후 최신본 재조회 예정.
- 과거 대화에서 생성한 `smax_private_starter_20261025.zip`: 로컬 P0 규칙 스키마/CLI/단위 테스트 초기 패키지. 원격 repo 반영 전. LLM 연동 없음, 실제 자연어 이해 없음, 결제 없음, 배포 없음.
- GitHub Actions Private 무료 할당량은 변경 가능하고 다른 저장소와 공유될 수 있음. **로컬 테스트 우선**, 사용 전 계정의 실제 무료 사용량 확인.
- 이번 원격 반영은 사업 문서 저장이며 외부 API/실 고객 자료/결제/배포 없음.

## 다음 최소 행동
A. 공개 외주 발주 30~50건 샘플을 합법적 수단으로 수집·분류해 수요의 초기사실 근거 만들기. 장기 목표 300건은 '계획'이지 완료가 아님.
B. 업무 3개를 '빈도/규칙 표준화/가격/온라인 온보딩/경쟁 대안/보안 리스크'로 점수화하고 **1개의 초기 타깃 업무**만 고르기.
C. 그 업무에 대한 10개 합성 프로세스 예제와 골드 스키마를 작성.
D. 로컬 P0 코드 안전성 검토, 승인된 범위 안에서 Private repo 코드 반영. 변경·테스트를 원격 문서에 사실대로 기록.
E. 자연어→후보업무모델 추론, 부족한 규칙 재질문, 승인·시뮬레이션까지 14일 **집중개발일** 기준 목표. 오늘로부터 자동 마감·완료 보장 아님.

## 사용자 승인 게이트
- 금전 지출, 도메인/유료 계정, 인증·결제 연동, 실제 업무 자료 외부 전송, Public 배포, 실제 고객 연락, 제휴 제안·가격 계약, 라이선스 변경은 각각 별도 승인.
- 현재 **승인된 지출액 0원**; 5만 원은 개발 단계 예산 **상한 제안**으로 결제 허가는 아님.

## 2026-10-25 KST 후속 사업 조사·인수인계 (이번 채팅)
1. **실행 결과:** private `hibi89/SMAX`/`main` 원격 확인. 별도 조사 문서 [docs/MARKET_WEDGE_SCAN_20261025.md](docs/MARKET_WEDGE_SCAN_20261025.md)를 새로 추가하고 `STATUS.md`에 기록. SMAX와 해커톤 3개 코드·배포 분리 유지.
2. **구매자 근거:** 위시켓 발주 공고 153189(2026-02-27; 비정형 발주→거래명세서, 예상예산 2,000만원) 및 151043(2025-12-01; 사방넷 주문→제조사 발주, 예상예산 900만원). 실제 계약금/구매의사·구독지불 증거 **없음**. 고객 발주 공고 30~50건 목표 중 이 시점에 직접 확인한 관련 발주 예는 **2건**; 판매자 서비스 설명을 고객 수요로 혼용 금지.
3. **3안 비교:** A 주문서 변환 / B 발주·입고·명세서 불일치 및 오류 검증 / C 고객 문의 분류. 사방넷·이카운트·채널톡·Tenet 등 실제 기능 보유. **B 우선 검증 권고**이나 **사용자 승인 전 첫 제품 확정 금지**.
4. **제품 초안:** CSV/XLSX `발주서 vs 거래명세서` 2-way부터, 이후 `입고` 포함 3-way. 필드 매핑을 승인받은 뒤 결정론적 비교, 불확실 시 `NEEDS_REVIEW`, 원본 행 근거 내보내기. 기존 ERP 쓰기/실결제/고객별 무제한 맞춤 작업 금지.
5. **아키텍처 2안:** ① 합성데이터 로컬 코어·읽기 전용 드라이런(초기비용/보안 장점), ② 서버 SaaS+로그인+과금(고객경험·확장 장점, 데이터/비용/보안 부담). 첫 검증은 ①, 이후 실제 구매의사/보안 게이트 통과 시 ② 권고. 개발 미착수.
6. **새 브랜드 위험:** `smax.ai`라는 AI 자동화 업체가 존재. 한국 상표권·서비스류·영역 중복 정도는 **미검증**; 내부 프로젝트명 유지, 공개 브랜드/도메인/로고 선집행 금지.
7. **다음 실행:** 추가 합법적 **구매자 원문** 수집 및 작업 유형 분류 → 첫 상품 범위 사용자 결정 → 합성 10세트의 오류/정답 명세 작성 → 로컬 P0 코드 검수/승인 뒤 GitHub private 반영. `ㄱ` 시 아직 승인 필요 없는 시장 조사와 합성 시나리오 작성만 가능.
8. **통제/미검증:** 비용·도메인·상표 출원·판매·고객 접촉/실자료 외부 전송·제품 범위/브랜드 확정은 별도 승인. 고객 테스트, 매출, 외부 API, CI, Vercel, Production은 없음. 원격 최신 SHA는 모든 문서 갱신 후 재조회.

## 2026-10-25 KST — 창업자 전략 보정 (후속 대화 우선)
1. **가장 최근 사용자 설명 우선:** SMAX는 AX 시대의 '디지털 짜장면/온라인 동네 단골집'처럼 **영세·소규모 사장님이 저렴한 연간 사용권으로 자기 기업의 AX 준비를 직접 경험하고 발전된 AI 활용 기반을 쌓는 셀프서비스**. 맞춤 고급 AX 구축/업체 방문/전화영업과 구별.
2. **구매자는 사장님:** 고가 외주 리스크 없이 낮은 금액으로 표준 업무·데이터·규칙·권한 정리와 준비도를 체험. 첫 구매에서 활용할 수 있는 보고/구조화 결과를 제공해야 미래 가치 주장에 의존하지 않음.
3. **온라인 로컬 브랜드:** 제한된 지역 서비스가 아니라 친숙한 온라인 단골 가게처럼 일관된 사용성·신뢰·추천·갱신을 목표. 기술 복제는 현실로 인정하며 독점보다 표준화 공급원가와 유통/평판 중요.
4. **연간 중심 수익 모델:** 소액 연간 사용권은 창업자 희망 방향, 정식 가격·지원 한도·환불·갱신·유료 사용 조건 **미확정**. 과거 Solo 99,000원 1회·Business 월 99,000원·Partner 연 990,000원은 이전 가격 가설이고 새 상품 요금표로 확정 금지. 추후 무료 합성 체험과 연간권의 실제 갱신가치 검증.
5. **이전 잘못 좁힌 가설 정정:** 2026-10-25 시장조사의 발주↔명세서 비교(B)는 시장/기술 **예시**이며 SMAX를 해당 업무 검증 SaaS로 만들자는 **총괄 제안은 미승인**. SMAX의 정체성은 업종을 가로지르는 AX 준비 인프라 표준화로 유지.
6. **장기 포트폴리오:** 첫 서비스에서 원가·반복매출·추천을 만들고 이후 연계 또는 별도 신규 사업을 탐색하되, 새 제품·지출·데이터 이동은 별도 승인. 초과이윤·기술 대중화 속도/고객 획득은 아직 검증 전.
7. **검증할 다음 항목:** 첫날 내보낼 실제 AX 준비 결과물, 연간 체험 가격 민감도, 연간 반복 사용 이유, 추천 경로, 기업당 AI+지원비 포함 공헌이익. 고객 접촉·실자료 API 전송·공개 배포/브랜드 등록은 사용자 승인 필요.
8. **이번 실행:** 비공개 GitHub 문서만 수정, 실제 제품·고객·결제·CI/Production 검증 없으며 이 채팅에서 외부 유료 지출 없음. 새 채팅 시작 시 최근 전략 보정 내용을 구형 시장 제안보다 우선해서 복원. 원격 최종 HEAD와 Private 여부 별도 재조회.

## 2026-10-25 최우선 복원: 로컬 상품과 개발 14일 제한
1. **최신 창업자 명시:** SMAX는 온라인에서 판매하지만 **고객 PC에서 로컬 실행**하며 고객 파일을 외부 서버/LLM에 상시 전송하지 않는다. 클라우드 SaaS 본체·Vercel 유료 플랜·서버별 작업공간·유료 AI 호출을 기본 전제로 삼지 않는다. 정적 웹사이트는 소개/체험/판매/다운로드 역할.
2. **예산:** 사용자 목표는 핵심 분류·표준화에 대해 **유료 LLM API 사용 0원**. 업무 카테고리/간단 문답, 고정 온톨로지·패턴 매핑, 엑셀/CSV 열 파악, 누락/충돌 질문, 정형 JSON·CSV·Markdown 내보내기 방식 권고. 임의 자연어/복잡 문서에 대한 고도 AI 이해는 현재 보장하지 않는다.
3. **최종 일정 상한:** 사용자가 '최대 2주, 2주 넘기면 작업 안 함'이라고 명시. 시작일 아직 미확정; 시작 후 **달력 14일 hard stop**, 집중개발일 14일/30~50일 유료판 일정은 폐기된 구형 가설. 해커톤 기한으로 집중 불가 시 착수일 조정; 무단 연장/범위 확대 금지.
4. **구현 비교 (개발 승인 전):** HTML/JS 오프라인 브라우저형은 가장 가볍지만 file://·파일 접근·브라우저 동작 제약; WebView/Tauri 등 패키징된 데스크톱형은 로컬 사용자 경험과 안정적 파일 취급 유리하지만 빌드/서명/Windows 호환/백신 오탐 위험. 사용자 승인 전 소스 구현·공개배포 금지.
5. **연간 판매/업데이트:** 고객 PC 오프라인 특성상 사용기간 만료·무단 복제 완전 강제 불가. 서버 없이 연간 이용권 판매 시 무엇을 제공하는지(갱신 업데이트·사용권·지원 범위), 사용기간, 환불, 무료 보수 범위를 정직하게 고지해야 함. 가격 미확정.
6. **검증/미착수:** 정형 스키마 로컬 P0 과거 ZIP 외 개발 코드 GitHub 없음. 현재는 **설계 문서 수정만**, 실제 실행·호환성·배포·보안·결제/상표/지불의사 확인 없음. 이후 `ㄱ` 명령으로 최신 문서와 권한/승인 조건 재확인, 초과 범위는 사용자에게 승인 요청.

## 2026-10-25 최우선 사업 홈페이지 기획 — AX Lab 쇼룸
1. 창업자 신규 아이디어: **SMAX = 기업이자 지속 연구·개발하는 AX Lab** 이미지로 런칭. 공식 사이트는 무료로 파일을 분석시키는 SaaS가 아닌 **동적·고품질 브랜드/영상 시연/기능 소개/미래 로드맵/한국 AX 접근성 확대 비전/사업 문의** 쇼룸. 실제 고객용 기능은 고객 PC에서 로컬로 실행.
2. 크몽 등 마켓에 실제 상품을 등록해 판매하고 공홈에서 정식 구매처 링크로 연결. 플랫폼 밖 결제 유도/우회 금지. 무료 사용자 실체험 없이 **진짜 로컬 작동 영상**으로 기능 설명하는 콘셉트. 상품 등록 전 실제 완성·검증·상품 정책 확인 필요.
3. 소기업과 사장님의 AX 자가진입을 지원한다는 목표는 보존. 향후 연구개발·추가 사업/연계 서비스는 계획으로만 표시하고 실제 출시·성과를 과장하지 않는다. '기업/연구소' 표현은 법인설립·공인 연구소 등록 주장 아님.
4. 코드 스타일 스킬 탐색: `frontend-design` `SKILL.md`, Vercel `web-design-guidelines`, `design.md` 유사 후보. 프리미엄 느낌의 대시보드 모션은 Motion for React/Aceternity UI 참고. 다만 링크/컴포넌트 이용약관과 성능·보안 검토.
5. **Vercel 사용상 제한 필독**: Hobby 무료는 2026-10-19 공식 이용약관상 개인/비상업 용도만 가능. 상품 구매 링크가 있는 마케팅 사이트는 영리 목적이므로 유료 Pro 승인 필요. 비용 0 상업 운영 대안은 Cloudflare Workers 정적 자산(무료 요청). Vercel에 코드를 종속시키지 않는 정적 프론트엔드 제작을 권고.
6. 제안 문서: `docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md`; 이전 제품의 개발 후 14달력일 하드리밋 유지. 온라인 영상·페이지까지 포함할 경우 1페이지 쇼룸으로 제한하고 영상은 실행 기능 검증 후 녹화. 추가 개발기간 자동 연장 금지.
7. 제약: 도메인·사업용 메일/개인 주소 공개·Vercel 유료화·사이트 공개·크몽 상품등록·고객 문의 전송·상표·회사 법적 지위 등은 **모두 사전 사용자 승인**. 현재는 문서 기록만, 코드/배포/고객/판매/실지출·프로덕션 검증 없음. `SMAX` 공식 코드명 유지('SMEX' 발언은 음성 인식 오차일 수 있어 변경 미확정).
8. 다음 단계: 실제 제품 유효기능 범위 → 홈 Hero·시연 스토리보드·로드맵 레이블 → 무료 상업 호스팅/유료 Vercel 선택 → 사용자 승인 뒤 구현/배포. 최종 main HEAD는 원격 재조회 기준.

## 2026-10-25 후속 확정 — SMAX 2브랜치·공동 총괄·Cloudflare
1. **권한·운영:** 사용자 최종 의사결정 및 프론트/브랜드 설계 주도, GPT-6 백엔드 코딩·테스트·검수 직접 책임과 프론트 협업. 전체 SMAX는 **공동 총괄**. KIC·PayPal·UGREEN은 별개 통합 감독 기능을 보존.
2. **실 GitHub 작업:** Private `hibi89/SMAX`에 기존 `main` 외 **`backend`·`frontend` 두 개 브랜치를 실제 생성·원격 조회 검증**. 처음 분기점 `main@6562f8e20594ee031a4b06bf6f55019abd57cfc2`. 추가 브랜치 불필요.
3. **기술 선택:** 고객 데이터 처리는 PC 로컬, 유료 LLM 호출 불필요한 규칙·질문·스키마 엔진. `backend`는 원격 서버가 아니라 로컬 코어. `frontend`는 사용자 주도 디자인의 로컬 UI와 AX Lab 공식 쇼룸. 핵심 소스 비공개, 공개 정적 사이트 산출물만 별도.
4. **Cloudflare 호스팅 채택:** 상업 홈페이지의 정적 자산은 Cloudflare 무료 범위 우선. 배포/계정 연결은 아직 안 됐고 공개·메일·도메인·개인정보·비용은 별도 승인. https://developers.cloudflare.com/workers/static-assets/billing-and-limitations/
5. **기간 답변:** 백엔드 **집중 4~6작업일**, 세 해커톤 동시에 수행하는 현실적인 달력 경과 **약 7~10일 가설**. 프로젝트 전체(로컬 앱+홈페이지) **실제 개발 착수 후 14달력일 넘기지 않는다**. 이번 브랜치·문서 준비는 제품 코드 개발 착수 아님.
6. **2개 기술안:** TypeScript/JS 로컬 순수 코어 vs Python 패키징. 전자는 UI 공용 코드·원가·일정에서 유리하므로 기술 추천(개발 착수 자체 승인과 구별). 복잡한 문장 자연어 의미분류는 유료 AI 없이 지원 범위 제한/질문 처리.
7. **운영 변경:** 세 해커톤과 SMAX를 매일 같은 날 병행할 계획. 해커톤 저장소/일정/다른 AI 채팅을 자동 실행한다고 주장하지 말 것.
8. **문서:** `docs/BRANCH_AND_BACKEND_PLAN_20261025.md` 우선 읽기 → `AGENTS.md`/`STATUS.md`/`HANDOFF.md` → 기능별 브랜치 코드. 원격 SHA는 본 문서 반영 후 재조회. 아직 코드·CI·Windows 실행·Cloudflare Production·고객 판매 전부 미검증.

## 2026-10-25 최우선 제품 확장 — 순위형 템플릿과 셀프/유료 설정
1. 사용자 최신 방향: **SMAX 로컬 범용 AX 설계 엔진을 중심으로 실제 구매자 수요 빈도/가치 순위를 조사, 업무 자동화 유형 템플릿을 1위부터 차근차근 확충**. 이메일 첨부 XLSX 자동 저장·내규 RAG는 예시이고 제품의 전체 목록 아님. 사용자의 자동화 목적 → 질문 → 구조화 산출물 + AI 구축 명령어·단계별 체크리스트.
2. **매출의 두 트랙:** 셀프형 프로그램 구매자(스스로 AI 명령 따라 구현)와 설정/실제 연동을 별도로 요구하는 고객(정해진 워크플로 1건만 유료 원격 구축/테스트·인수인계). **사용자는 맞춤 SI/무제한 유지보수로 복귀하지 않음**. 구성·가격·기간·사업자/계약/크몽 상품등록은 아직 제안 상태이고 실제 승인된 판매 건 없음.
3. **시장 조사 상태:** 크몽에 설계 45,000원 / 구축 270,000원 공개 사례와 99,000원 단일 자동화 예시 확인. 이는 **판매자가 제시한 호가**이지 수익·수요량의 확증이 아님. 대한상공회의소 2025 보고서와 KDI 정책 요약은 시장 배경. **검증된 자동화 인기 1~N위 데이터는 없음**; 최소 30~50개 중복 제거 구매자 원문을 수집해 우선순위 계측해야 함.
4. **제안 기술 목록:** 이메일 XLSX 변환→저장, 발주·재고 정리, 고객문의 분류·배분, 반복 보고서, 사내 내규 RAG 설계. **내부 검증 후보 순서**일 뿐 전국 수요 순위·확정 구현 목록 아님. 특히 RAG는 외부 LLM/임베딩·권한·운영비 가능성을 명확히 분리.
5. **유료 설치 관리:** 고객 계정에서 필요한 최소 권한만 고객 직접 승인, 인증정보·개인정보를 GitHub/채팅에 받지 않음. 실제 개인정보 수탁 시 위탁·접근/삭제 계약 검토. 크몽 유입 거래를 플랫폼 외 결제로 유도 금지. 제품 일반 버그 패치 무료 방향과 고객별 신규 워크플로 설정의 유료 범위를 구분.
6. 새 설계 문서: `docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md`. 코드 구현·외부 연락·비용·Cloudflare 공개 배포 **미실행**. `backend`/ `frontend` 분담, 비공개 저장소, 실제 제품 개발 착수 후 **14달력일 상한** 그대로 유지. 다음 작업은 조사-우선순위 검증 및 합성 시나리오·명세 설계. 이 기록이 자동 백그라운드 작업을 의미하지 않음.

## 2026-10-25 최신 환불 결정 — Setup 미완료 100% 환불
1. **사용자 신규 명시 결정:** 아직 고객별 자동화 구축 경험이 없어 실패할 수 있으므로 **약정한 구축 완료 기준을 달성하지 못하면 SMAX Setup 구축 지원비 100% 환불**. 기술 실패를 고객에게 전가하거나 실력·성공률을 과장하지 않는다.
2. 착수 전 요구 범위·지원 앱·필요 계정/승인·입출력·중복/예외·완료 검증 테스트·납기·변경 및 실패 기준을 **플랫폼 대화/견적에 기록**. 필요하면 사전 기술 점검 단계에서 수주 거절/취소.
3. 구축 실패 환불은 **설치/연동 지원 서비스료**의 문제이며 로컬 SMAX Self 프로그램의 별도 이용권 환불 정책과 구분. 타사 유료 모델/API/앱 비용은 고객이 직접 사전 승인하고 결제, 환불 여부는 해당 판매처 기준. 반드시 사전 고지. 고객 변심/범위 추가/자료·권한 미제공 등은 기술 실패와 별도 기준이지만 법정 권리/플랫폼 규정 준수.
4. 크몽에서 판매했다면 크몽 안의 취소·환불/분쟁 처리 경로를 이용. 객관적인 결과 증빙과 서면 합의를 유지. 보안·비밀정보 수령·무단 계정 접근 금지.
5. 참조: `docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md` 6절, 크몽 판매자 품질보장 안내 https://support.kmong.com/hc/ko/articles/50560780476953. 실제 고객·주문·구축·환불 처리 없음. 이번 기록은 제품 코드 개발/공개 배포 착수 아님; 기존 14달력일 상한 유지.

## 2026-10-25 최종 우선 상품 결정 — 5만원 셀프 + 5만원 텍스트 튜터
1. **최상위 최근 결정 (이전 Setup 환불 계획보다 우선):** 고객이 회사자료/업무규칙을 직접 SMAX 로컬앱에 입력·표준화·검증하고, SMAX AI 인계 파일로 외부 AI가 안내하는 구현 과정을 **사장님 스스로 수행**. 초기 SMAX는 기업 자료를 공급자가 받아 분석하거나 n8n·Google Sheets 등을 직접 설치/구축해 주지 않는다.
2. **희망 판매가격:** SMAX SELF 50,000원 + 선택형 SMAX GUIDE 50,000원 = 총 100,000원. SELF 라이선스 기간(연간/1회)·환불/갱신, GUIDE 기간/문의 건수/지원시간·상품분류/판매 등록은 아직 확정 아니며 실판매/고객/가격 게시 없음.
3. **GUIDE의 역할:** '선생님처럼' 비동기 문자 답변과 단계별 테스트 방법 안내, 익명화 캡처/가상 샘플 기반 오류 진단. **전화·영상통화·대면·PC 원격접속·암호/API키/실고객정보 수집·계정대리설정·무제한 응답·완료보장 배제**. 제안 범위: 한 설계 목표 1건, 최대 7일/질문 3건(후속 포함), 영업일 1~2일 답변 목표. 이 수치는 사용자 승인 전 총괄 제안.
4. **기존 100% 환불 방침의 적용정정:** 이전 '직접 설치/자동화 실구축을 납품하는 SMAX Setup' 상품을 판매할 경우 계약 약정실패 시 구축료 전액 환불이었던 것. **현재는 그 대행 상품을 보류**했으므로 GUIDE에 '최종 구현 실패 시 무조건 100% 환불'을 이식하지 않는다. 약정한 교육 지원을 제공하지 못한 경우 관련 법령·크몽 환불 규정대로 대응. 소프트웨어 기본 기능 자체 오류는 개별 코칭 구매 강요 없이 처리.
5. **사업 이유:** 초보 사장님에게 반복 업무를 혼자 자동화하는 능력을 남기는 게 목표; 공급자는 외주·콜센터·고객사 데이터분석을 하지 않음. 고객 인터랙션을 줄이면서도 신뢰/기여이익/재사용 템플릿을 유지.
6. **입력 안전 원칙:** GUIDE 고객이 로그·스크린샷 보낼 때 이름/전화번호/메일/실계좌·고객 행·토큰/API 키·인증값을 가리고 되도록 합성 테스트 케이스로 재현. 외부 AI에 회사 파일 첨부는 고객이 법적 권한과 서비스 정책을 확인하고 판단.
7. **참조 신규 기획:** `docs/SMAX_SELF_AND_GUIDE_MODEL_20261025.md` 및 `docs/BUSINESS_MODEL.md` 최신 섹션 우선, 이전 `docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md`의 Setup 제안은 **역사적 가설**. 3개 브랜치 유지, 14일 제품 코드 개발 상한 유지. 실제 개발·Cloudflare 배포·고객판매·가격 계약은 아직 없음.

## 2026-10-25 최신 공홈 변경 — Contact 없음, 크몽 링크만, Cloudflare 유지
1. **창업자 최근 지시 최우선:** 공식 AX Lab 브랜드/쇼룸 사이트에서 '비즈니스 문의(Contact)' 및 이메일을 빼고, **등록된 크몽 공식 상품 구매 링크만** 표시. 고객 판매·가이드 문의는 크몽 플랫폼 메시지 경로. '무료 데모/개인 회사자료 온라인 업로드'는 필수 아님.
2. **호스팅 결정:** Cloudflare 무료 정적 웹 호스팅 유지. Vercel은 애니메이션/영상·GitHub 배포·CDN·보안 기능이 이미 충분하므로 *상업용 Hobby 제한과 비용을 제외하면 Vercel로도 충분*하다. Cloudflare의 선택 이유는 상업용 정적 요청 무료/무제한, DNS/보안 및 향후 Workers/D1/R2 선택적 확장 가능성. 필수 서버 기능은 아님.
3. **미래 운영:** static `site/` 파일/디자인을 독립적으로 재활용해 다른 도메인·DNS나 다른 웹서비스 사이트에 재사용할 수 있음. 단, 새 업무 로직·DB/인증은 별도 구축 필요하고 브랜딩·계약/개인정보 고지/고유 구매 링크 정리 필요. Vercel Pro 등 타호스팅 이전 가능하게 독립 코드로 작성.
4. **거래 정책:** 자체 공홈 → 크몽 구매 URL만. 크몽 상품에서 개인 사이트로 고객을 보내 직접 결제시키지 않는다. 상품 설명에 외부 홈페이지 링크를 기재해도 되는지는 크몽 정책 심사 전에 단정 금지.
5. **보안·실제 진행 상태:** 이 대화에서는 비공개 기획 문서만 수정. Cloudflare 실배포/계정 연결, 크몽 상품 등록, 도메인 구매/비즈니스 이메일 개설, 실고객 연락/실자료/API·과금 없음. 실제 제품·웹 코드 미착수. 14달력일 개발 상한 유지.
6. 상세: `docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md` 7절 및 `STATUS.md` 최신 기록. 작업 전 `main` SHA/두 작업 브랜치·현재 문서를 재조회하고 우선순위 반영.

## 2026-10-25 최신 쇼룸 요구 — TOP 10 상세 시연
1. 창업자 요구: 주요 사장님 업무 자동화 사례 **TOP 10 모두를 SMAX 공식 홈페이지에 올려, 어떻게 AX 구축이 가능한지 실제 자료 예시·업무 단계·결과물과 함께 보여주기**. 이름만 10개 나열하지 말고 각 사례에 클릭/상세 흐름 제공.
2. **우선 읽기:** `docs/TOP10_AUTOMATION_SHOWCASE_PLAN_20261025.md` (각 10종 요청·합성 fixture·분류/표준화·외부 도구·테스트·한계·frontend 표시 구조).
3. 제품 경계: SMAX SELF는 고객 PC 로컬 자료 정리 → 구조화된 업무 설계 + AI 구축 명령 + 자가 검증표 생성, 고객이 외부 AI/n8n/Sheets/RAG를 직접 연동. 10개 외부 자동화가 이미 실행되거나 SMAX가 모두 대행한다는 오해 방지. 시연 상태: '합성 실증 완료' vs '설계만/계획'을 상세 표시하고, 실제 로컬 엔진 실증 영상은 구현·테스트 후에만.
4. `backend`는 10개 데이터 구동 템플릿 및 합성 입력/출력/테스트 코어. `frontend`는 사용자와 디자인 협의한 10개 카드·단계 패널·모션·검증된 영상. 가능하면 **1~2종 실제 재현 가능한 로컬 동작 증명**을 첫 출시 우선 순위로 두고, 지원 미완료는 로드맵으로 명시. 광범위한 Gmail/RAG 외부 계정 통합은 14일 MVP에서 제외.
5. 호스팅 Cloudflare 정적·크몽 구매 링크·문의 없음, 가격 SELF 5만원 + 추가 GUIDE 5만원 가설적 판매 설정, 실제 판매/사이트 오픈 미진행. 이전 14달력일 상한, Private 저장소, 허위 기능 시연 금지.
6. 작업 상태: 문서 기획만 업데이트, 코드·실 테스트·동영상·외부 마켓·배포 없음. 추후 `ㄱ` 시 프론트/백엔드 설계 계약·합성 fixture 등 승인된 작업을 안전하게 진행.

## 2026-10-25 최신 진행 요청 — P0-P10 실행표와 1000종 라이브러리
1. **창업자 업무 분담:** 본인은 사업·디자인/대시보드 구상을 담당하고 GPT-6는 SMAX 백엔드 설계/구현/테스트 담당. 작업 진행은 도구 실행 시에만 이뤄지고 백그라운드 자동 코딩 아님.
2. 상세 원장 **`docs/SMAX_V1_EXECUTION_PLAN_20261025.md`** 우선 확인. P0 기획은 진행됐으나 P1~P9 **실제 코드/테스트/사이트 배포 미착수**, P10 장기 계획.
3. v1.0 지원되는 업무 자동화 **설계/학습 템플릿 10종**, 추후 50/100/1000종 확장. 고객 본인이 자료를 로컬에서 표준화해 AI 인계 지침을 외부 AI에 붙여 직접 설정. **SMAX 자체는 LLM 호출 없는 규칙 엔진(전문가 시스템)**. '로직의 RAG화' 비유는 템플릿 검색·규칙 적용에 국한, 생성형 RAG 아님. 코드 TS/JS 우선, Python 필수 아님. 자유로운 자연어의 완전한 이해 불가능; 종류 선택/규칙 질문.
4. 작업 순서: P1 스키마·fixture → P2 분류/검증 → P3 10종 지식 템플릿 → P4 AI 빌드 프롬프트·결과물 → P5 안전·로컬 테스트 → P6 UI → P7 쇼룸 → P8 Windows QA → P9 사용자 별도 승인 후 판매·공개. 상태 진단 후 안전한 작업 단위마다 소스/테스트/원격 SHA 최신화.
5. 개발 **첫 제품 코드 착수 후 달력 14일** hard cap; 계획 문서만 기록한 현재 착수일은 미확정. 백엔드 골격 1~2일은 목표이며 기능 완성 보장 아님. 장기 50~1000 템플릿은 별도 업데이트 단계.
6. 제품 이용권 희망가격 SELF 5만원 + GUIDE 5만원 비동기 문자, 원격 실구축/고객자료 수신/전화·화상 제외. 홈페이지 Cloudflare 정적, 10종 카드와 테스트로 확인된 시연, 정식 크몽 상품 구매 링크만, 연락 폼 없음. 공개 배포·판매·유료계정 변경은 승인 전 금지.

## 2026-10-25 최신 승인: 템플릿 매칭 기반 AX 표준화/교육 엔진
- 사용자가 **템플릿을 하나씩 누적하고, 사장님의 업무 유형/자료와 매칭해 데이터 표준화를 수행하면서 시행 방법/AI 구축 단계를 동시에 제공**하는 설계를 명시적으로 긍정·채택. 엔진 구현 시 '자유롭게 아무 자료나 집어넣으면 완벽히 이해' 기능으로 오해/범위확대 금지.
- 공통 코어/업무 템플릿/고객 로컬 필드 매핑 세 층 분리: 유형 선택→후보 템플릿→필수 질문→원본 열·타입 후보매핑→수동 확인→정형 AX 파일+AI 구축 프롬프트/학습 절차. 모호/불일치면 NEEDS_REVIEW. 고객 실제 자료 외부 전송 없음.
- 상세 공식 문서 `docs/SMAX_V1_EXECUTION_PLAN_20261025.md` 8절 최우선. 백엔드 P1 계약에 반영하고 프론트 사용자 디자인 검토시 선택형 UX 반영. v1 10종, 이후 50/100/1000종 장기 목표. 자체 LLM/RAG/외부 자동화 대행은 아님.
- **상태는 아직 기획 문서만**. 최초 제품 코드 개발 착수일 기록되지 않았으며 14달력일 제한 유지.

## 2026-10-25 최종 홈페이지 정체성 — 고객 참여형 셀프 AX 교육·실습 플랫폼
- 창업자 최근 제품 정의: **SMAX = 고객 참여형 + AX 교육형 + 셀프 실습형 플랫폼**. 고객이 10종 자동화 템플릿에서 학습·로컬 자료 매핑·AI로 직접 구현하고, 필요한 새 템플릿을 **무료 제안**하여 검토/채택된 공통 자료를 모두와 공유하는 참여형 라이브러리. 이후 50→100→1000종 목표.
- 공식 AX Lab 홈페이지는 템플릿 탐색/분야·난도별 소개/실제 검증된 시연/교육자료/제안·개발상태 공개를 중심으로, 일반 사업 문의는 제외하고 구매는 크몽 공식 상품으로 연결.
- **접수는 무료지만 무조건 채택/언제까지 구현/고객별 커스터마이징을 보증하지 않음.** 고객이 올리는 원본 업무파일·개인정보·영업비밀/토큰을 요청/공개에 수집하지 않으며 추상화·합성 자료만 공동 템플릿으로 배포. 기여자 이름 기본 공개 안 함.
- **인기순**은 실제 측정치·기간·표본이 없으므로 초기에는 '우선 소개 10종'으로 표시. 무료 요청 폼은 정적 HTML만으로 실제 접수할 수 없으므로 Cloudflare Workers 저장/안전한 입력/스팸 대책 등 별도 구현·게시 승인 전 실제 사용 가능한 듯 안내 금지.
- 신규 원장: `docs/COMMUNITY_TEMPLATE_LIBRARY_20261025.md`. 현재 기획 문서만 저장, 코드/Cloudflare 배포/크몽 상품/고객요청·인기 통계 없음. 14일 실제 코드 착수 상한 유지.

## 2026-10-25 SMAX D1 실제 개발 착수
- 개발 시작일 2026-10-25, **마감 2026-11-07(포함)**. 14일 제한 고정.
- backend 핵심 파일 `site/templates.mjs` (10종 공통 업무 설명), `site/core.mjs` (오프라인 한글 규칙검색, CSV 해석, 필드 매핑 후보, NEEDS_REVIEW AX 설계·AI 인계 명령), `tests/core.test.mjs`, `package.json`.
- 코어는 외부 유료 LLM API 요청 없음. 검색 결과 정확도 미검증이고 빈/모호한 입력은 반드시 확인. 고객의 실제 파일은 서버에 전송하지 않는다.
- 다음: 로컬 UI `템플릿 패널`/`챗봇 패널` 구현, 예시 시연 및 테스트, 홈페이지/Windows 패키징 준비. 외부 판매·게시 전 사이트 검수 필요.

## 2026-10-25 D1 프론트+백엔드 첫 코드 통합 체크
- 실제 소스 `site/`에 CSS/HTML/ESM: 브라우저 기반 로컬 퍼스트 스튜디오 2패널, 10종 템플릿, 규칙형 한글 검색·질문, CSV 헤더 읽기와 수동 열 매핑, 초안 설계서 JSON / AI_BUILD_PROMPT Markdown 다운로드.
- `site/core.mjs`은 외부 API가 없는 규칙 엔진, `site/templates.mjs`에 10종 구조와 초기 가이드가 있으며 수정 시 테스트 점검. 현재 모든 템플릿은 `DESIGN_DRAFT` 수준(외부 자동화 검증 0).
- 프론트 기능/코어는 함수 단위 및 문자열 렌더 스모크 검사됨. 브라우저 실제 실행/Windows 호환/네트워크 차단은 후속. `npm test`와 시각 브라우저 검증을 다음 순서로 처리해야 함. 처음 발견된 챗봇 JS 문법 오류는 별도 수정 커밋으로 고침.
- `wrangler.jsonc`은 Cloudflare Worker Static Assets의 **배포 준비 설정만**. 실제 Cloudflare 계정과 접근/배포는 연결되지 않았고 공개 URL 없음. **크몽 계정 인증/상품 등록도 아직 없음**; 판매 페이지 초안은 `docs/KMONG_LISTING_DRAFT_20261025.md`. URL은 발급 이후에만 링크할 것.
- 이용자 요구: 제품/사이트 먼저 만들고 크몽에 올리며, 같은 홈페이지 URL의 콘텐츠만 계속 업데이트. 크몽 상품 내용에 외부사이트 URL을 삽입하는 것은 운영정책 심사 확인 전 금지. 개인정보/원본회사파일은 서버에 수신하지 않음.
- 시작 2026-10-25, **D14 종료 2026-11-07**. 사용자 승인 없는 일정 연장/미검증 상품 출시는 금지.

## 2026-10-25 최신 최우선 확정 — 1차 SELF + 2차 WEB (D1 시작 유지)
1. **사용자 최종 승인:** 초기 14일 개발은 SELF(로컬 규칙 기반 템플릿 10종·스마트 검색·템플릿/챗봇 패널·자료 표준화·외부 AI 구축 가이드) 중심, 추가 GUIDE 문자 교육 별도. 가능하면 로컬 변환/보고 1~2종 완성형 처리 검증. **유료 WEB 완성형 업무용 사이트는 훗날 2차**로 추가하고, 엔진·입출력 계약 재사용을 염두에 둔 구조만 처음부터 잡는다.
2. WEB 고객 경험: 템플릿별 웹 프로그램 미리 개발·검증 → 공식 구매/권한 등록 → 이메일 로그인 → 서버에서 `userId + templateId + expiry/status`를 검사 → 승인된 입력만 처리/다운로드. 프런트에서 잠금 화면만 띄우거나 주소를 숨기는 것으로 무단 공유 방지 불가. 계정/인증코드 공유 100% 방지 불가능. 서버 권한·데이터 저장·API 비용·개인정보 책임/환불·운영기간은 **WEB 착수 승인 후** 별도 결정.
3. **금지:** 지금 Cloudflare/Vercel 고객 로그인·DB·결제 서버·템플릿별 유료 API 개발, 유료 웹 상품 판매/권한 자동 발급, 미검증 외부 Gmail/ERP/RAG 통합. **P9 출시 전 `site/`의 실행 로직이 공개되어 유료 기능이 무료 노출되는지 감사**. 무료 페이지는 검증된 합성 시연·템플릿 미리보기/교육 위주, 유료 엔진은 별도 배포 아티팩트로 분리.
4. 최신 문서 `docs/SELF_WEB_ROADMAP_20261025.md`를 우선 읽고, `docs/ROADMAP.md`, `docs/PRODUCT_STRATEGY.md`, `docs/SMAX_V1_EXECUTION_PLAN_20261025.md` 마지막 갱신 단락을 기준으로 진행. 과거 SaaS 우선/Setup 실구축/착수일 미정 문구는 역사적 계획이며 **최신 사용자 결정으로 덮음**.
5. **2026-10-25 코드 개발 D1 / 2026-11-07 14일 상한**. 이번 메시지 처리 시 **전략/문서만 수정**. 현재 시제품 코드/기능/기초 스모크 검사 상태는 기존 `STATUS.md`의 최근 실제 개발 기록 참조. Private GitHub `main`/`backend`/`frontend` 유지. 사용자 사업·디자인 주도, GPT-6 백엔드/기술 검증 협업.

## 2026-10-25 최신 UX/브랜드 — 공식 마스코트 맥콩 + 목적별 광장
1. **사용자 선택/위임:** `스돌이·맥콩·셀리` 중 공식 마스코트를 **맥콩**으로 최종 결정. 형상은 사용자가 직접 첨부한 연보라/화이트 작은 3D 로봇: **초록 잎 두 장 새싹, 둥근 보라 귀패드, 청록 얼굴 테두리, 큰 보라빛 눈, 작은 웃는 입**. 기존 홈페이지 일러스트는 보존. 저장소에 원본 이미지가 없으므로 임의 이미지로 대체·게시 금지.
2. **제품명/의미:** `SMAX²` 표기, `SMAX Square / 스맥스스퀘어`; Square = 누구나 참여·공유하는 **광장**, ² = 자동화 지식·템플릿의 확산·가속. 등록상표 여부는 아직 미검증.
3. **초기 홈페이지 역할 선택:** `사장님용 → 사장님 광장`(현재 SELF 템플릿·실습), `학생/학부모용 → 배움의 광장`(후속 계획/준비 중). 두 선택 카드, 공통 맥콩 안내. 실제 교육 서비스가 없는 동안 학생 가입·구매 CTA를 만들지 않음. 사이트 초기 탐색에 계정 가입 불필요.
4. **미래 회원가입 개발 시** 목적별 콘텐츠 프로필(`business`/`learning`, 복수 선택 가능)을 검토하되 미성년자 개인정보·보호자 동의는 별도 법적 설계/검증 필요. 1차 14일 MVP에는 회원 DB/로그인/학생 커리큘럼/WEB 서버 구현 **추가하지 않음**.
5. 공식 문서 `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md` 최우선. 기존 `docs/SELF_WEB_ROADMAP_20261025.md`의 1차 SELF·2차 WEB 결정 유지. 개발 시계 2026-10-25~2026-11-07. **이번 작업은 브랜딩·기획 기록만**.

## 2026-10-25 최신 최우선 — 크몽 결제 분리 / 사장님 존 우선
1. 창업자 결정: “사이트결제되면 크몽차단 ... 훗날 디벨롭 ... 니가판단”. 1차는 **SMAX² Square 사장님 존**, 회원가입/자체결제/카드 입력/장바구니/외부 거래문의 없이 **무료 탐색·검증된 미리보기·이용 안내**, SELF 판매는 크몽에 실제 상품 등록·심사 후에만 정책에 맞게 안내.
2. 공식 크몽 정책은 외부 직접결제 **유도·실행 금지**: `docs/SITE_V1_KMONG_FUNNEL_AND_FUTURE_ZONES_20261025.md`의 근거 링크 확인. 독립 사이트 운영 자체가 자동 차단되는 것은 아님. **크몽 유입 고객을 외부 결제로 돌리거나 외부 대화로 거래 협의하는 행위 금지**. 크몽 상세 페이지에 SMAX² 사이트 주소 링크를 게시할 수 있는지 운영자 확인 전 삽입하지 않음.
3. `site/index.html` 브랜딩/메뉴/상품 소개문구 조정: 등록되지 않은 상품 가격 제거, 결제/로그인 불운영 표시, ‘템플릿/이용 방법/광장 소개/상품 안내’만 내비게이션. 판매 크몽 URL은 아직 없음.
4. **우선순위:** P1 사장님 존 SELF 유효 로컬 기능/테스트/유료 소스 분리 → P2 유료 WEB 별도 승인 → P3 학생 광장/커뮤니티/공백상권 추천 → P4 수주의뢰·굿즈. 실제 회원수/구매자 후기 등 수치 조작 금지. 맥콩 외형 레퍼런스 및 역할은 `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md` 참조.
5. 이번 변경은 정적 프로토타입 화면과 기획만; **Cloudflare 배포, Kmong 결제, 회원 로그인, 유료 WEB, 어린이 콘텐츠 미진행**. `site/` 소스 공개 시 코어 누출 위험으로 공개/유료 분리 게이트 우선. 14일 범위 및 2026-11-07 상한 그대로.

## 2026-10-25 최신 미션 — 저렴한 AX 대중화·창업자 운영 유지
1. 창업자 최종 전략: **저렴한 가격으로 AX의 진입장벽을 낮추고 AX 대중화를 가속**. SMAX² Square는 단일 프로그램에서 출발해 시민 참여·학습 광장으로 확장하되, 출시 범위는 1차 **사장님 존 SELF**에 집중.
2. 2~3년 기업가치 50억~100억은 목표 가설이지 산정 가치/예측이 아님. 사용자가 잠깐 말한 **엑싯 목표는 바로 철회**했고, 회사와 저가·교육·참여 철학을 우리가 유지하는 것이 우선. M&A/매각을 기본 로드맵에 편입하지 말 것.
3. 최상위 원칙 `docs/FOUNDER_MISSION_AND_OWNERSHIP_20261025.md`. 기존 상품 판매 정책 `docs/SITE_V1_KMONG_FUNNEL_AND_FUTURE_ZONES_20261025.md`, 캐릭터·브랜드 `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md`, 개발 범위 `docs/SELF_WEB_ROADMAP_20261025.md`와 같이 읽을 것.
4. 위 내용은 전략·문서 반영이지 실서비스 검증, 매출, 투자, 상표 출원이나 회사 설립이 진행되었다는 뜻 아님.

## 2026-10-25 최신 결정 — SMAX² 집중 14일
1. 창업자가 **11월 초까지 SMAX² 개발을 최우선**으로 확정. 사장님 존 SELF 개발·검증을 2026-10-25~11-07 안에 집중하고, 3개 해커톤(KIC/PayPal/UGREEN)은 보유 결과물 기반으로 각각 마감 직전에 개발·제출 마무리할 계획. 단, 해커톤별 필수 외부 승인/실장비/제출 규칙처럼 마지막에 회복 불가한 항목은 지금부터 리스크 확인.
2. 다음 실제 개발 우선순위: (a) CSV 열 정규화 등의 **실행 가능한 로컬 완성형 1종 + 합성 fixture 테스트** → (b) 사장님 UX 10종 템플릿 + 맥콩 브랜드 적용 → (c) 공개 데모/유료 코어 코드 분리 → (d) 로컬 패키징/크몽 상품 준비·실 QA → 가능하면 두 번째 보고 기능.
3. 학생 교육, 유료 WEB, 자체 회원/결제, 공백상권 추천, 수주의뢰/캐릭터 굿즈/정부 협력은 현재 14일 MVP 밖. 미검증 기능을 출시했다고 주장하지 말 것.
4. 상세 계획: `docs/SMAX_FOCUS_SPRINT_20261025_NOV07.md`. 기존 `docs/SELF_WEB_ROADMAP_20261025.md` 및 `docs/SITE_V1_KMONG_FUNNEL_AND_FUTURE_ZONES_20261025.md` 원칙 유지.
5. 이번 GitHub 변경은 **작업 우선순위 및 인수인계 문서**, Node/Windows 통합 테스트·Cloudflare 공개·크몽 실제 판매 미실시.

## 2026-10-25 최상위 신규 채팅 규약 — “너는 스총이다 레포지토리보고 작업이어가셈”
1. 사용자 명시 역할 분리: **스총 = SMAX² 전담 총괄**, **해총 = 독립 해커톤 통합총괄**. 구형 `CHAT_BOOTSTRAP.md`의 합동 역할/과거 '해커톤 쉬기 vs 동시진행' 의사결정은 역사 기록; 11/7까지 **SMAX SELF 개발 우선**·해커톤 제출 리스크는 해총 소관.
2. 새 채팅에 문구 **`너는 스총이다 레포지토리보고 작업이어가셈`**만 오면 Private `hibi89/SMAX` 접속 → `CHAT_BOOTSTRAP.md` → `docs/STECHONG_CANONICAL_CONTEXT_20261025.md` → 최신 `HANDOFF`/`STATUS`/코드/CI/테스트/스프린트 → 미완료 1개 **실제 개발·검증·커밋**. 해당 문서의 거부 게이트 준수.
3. 크몽 안전결제만 고려; 사이트 자체 결제·회원/WEB/학생 존은 후순위. 맥콩·광장/염가 대중화 정체성 보존. 공개 배포 전 무료/유료 코드 유출 검사.
4. 실코드 다음 우선 과제는 **결과 CSV를 실제 생성하는 로컬 변환 모듈 1개 + 골드 fixture/tests**. 기존 스모크 검증/소개페이지를 실사용 제품 완료로 오인하지 않는다.
5. 이 변경은 **문서 체계 정비**. 정식 배포·상품게시·테스트 완성·고객 매출/계정/지출 없음. 해총 Public repo에 스총 Private 소스·전략 상세를 전송하거나 복사하지 말 것.


## 2026-10-25 KST — 스총 실행 1 / backend CSV 코어 신규 구현 (최신 인수인계)
1. **목표/요구/기술**: SMAX² 사장님 SELF 제품에 실제 로컬 CSV 결과물 1종 우선. Node 20+/브라우저에서 사용할 순수 JS ESM 함수로 CSV를 정형 변환하되 네트워크 호출/파일 쓰기 없음. USER 승인한 `backend` 안전 개발 범위, 2026-11-07 14달력일 상한.
2. **완료 기능/변경 근거**: `site/csv-transform.mjs` 신설. `normalizeSpreadsheetCsv(source, {date,item,amount})`는 명시적 원본 열 매핑 후 거래일/상품명/금액/원본레코드/검토상태/검토사유 CSV를 **실제 생성**. 결측, 이상 날짜/금액, 중복행, 수식 시작 문구를 무단 폐기 없이 `NEEDS_REVIEW` 표기. 원본 데이터와 기존 UX/템플릿·검증 코어 유지. `tests/csv-transform.test.mjs`, `docs/CSV_TRANSFORM_CONTRACT_20261025.md` 추가.
3. **테스트 명령/결과/미검증**: 격리된 로컬 Node.js v22.16.0에서 `node --check site/csv-transform.mjs`, `node --check tests/csv-transform.test.mjs` PASS. `node --test tests/csv-transform.test.mjs`: **10 PASS / 0 FAIL**(합성 골드 입력 포함). Git blob 해시 2개 로컬/원격 일치. 전체 기존 `npm test`, 실제 Chromium/Windows, 고객 자료, Cloudflare/크몽, 앱 E2E는 **이번 작업 미검증**.
4. **완료/진행/대기/차단**: backend CSV 변환 함수와 회귀테스트 완료. 다음 frontend 연결(업로드→수동 매핑 승인→결과 미리보기→CSV 다운로드) 대기; 코어 공개/유료 분리 대기. 외부 고객·유료 호스팅·크몽 등록·브랜드 출원은 승인 필요.
5. **오류 근거/대응/피해야 할 반복**: 현재 기존 홈페이지의 업로드는 **CSV 헤더만 읽고 설계서만 생성**함. 새 함수를 연결한 사용자 결과다운로드 완료라고 말하지 말 것. 공개 `site/`에는 유료 기능이 있으므로 무단 배포 금지. 잘못된 헤더·행 구조·애매한 매핑은 명시적으로 거절; 무단 날짜 추정/행 삭제 금지.
6. **저장소/브랜치/SHA/경로**: Private `hibi89/SMAX`, 개발 `backend`. 소스 최초 SHA `4d5e100fe77c912fad9ebc84f72552d8fe9dc6b1`; 테스트 `ae5c78a88dc3cf6ddc4c99aa7749b6d25988693f`; 기술 계약 `74652a81febf5f4de0b87056e76165522326f79a`; STATUS 반영 `b42cd3bc02d523323bfa9e24dd3698c017688e3a`; 최종 HEAD는 이 문서 커밋 뒤 별도 조회. `main`/`frontend`는 이 실행에서 미수정.
7. **Production/실행/환경**: Production URL 없음, Vercel 미적용, Cloudflare 정적 사이트 미배포, 크몽 실제 상품 미등록. 로컬 테스트 Node.js v22.16.0. 브라우저 로컬 앱 실행용 배포 아티팩트 없음.
8. **원본/백업/보안/수정금지**: 원본 SHA는 시작 `main/backend/frontend = 989cec1497e530f5547346bc341e7e92373f9910`. Git 기존 main 스냅샷을 복구 기준으로 보존. 실제 고객 개인정보, 계정, 토큰 입력 없음; 전송하지 않음. 원본 사용자 파일 절대 덮어쓰지 않고 변환 결과 텍스트만 메모리 반환.
9. **다음 작업 우선순위·완료 기준·승인**: (P0) frontend UX에서 **현재 매핑 드롭다운과 신규 함수 연결**, 업로드 파일 내용을 안전하게 메모리 보관, 처리 버튼 클릭 시 검토행 수/사유 표시, 결과 CSV 다운로드, 상태 변경/템플릿 전환 때 원본 데이터 삭제와 재확인. 합성 브라우저 스모크/전체 테스트. (P1) 공개 소개/유료 코어 분리. (P1) Windows 실행/크몽 안내. **main 병합·Cloudflare 공개·크몽 상품 발행은 별도 사용자 승인.**
10. **갱신·검증 기준(KST)**: 2026-10-25 오후 작업. 확인 기준은 backend의 신규 2개 원격 Git blob과 격리된 Node 테스트 결과. 문서 최종 커밋과 원격 HEAD는 채팅 종료 전 조회해 보고. 성공 판정은 **CSV 로컬 코어 범위에 한정**.


## 2026-10-25 KST — backend CSV 코어 추가 하드닝 인수
1. 목표: CSV 정규화에서 연도 `0000`을 정상 승인하지 않고, 비가시적 Unicode 전치문자 뒤 위험한 수식 표시를 보호.
2. 구현: `site/csv-transform.mjs`의 dateISO 연도 최소 1 제한 및 excelSafe 방어 전치 문자 확대.
3. 증거: 실제 로컬 Node 22.16.0 / backend 동일 Git Blob source + 기존 12 및 독립 2 tests → 14 PASS / 0 FAIL. 단 전체 frontend Node/Windows Edge/Chrome은 미검증.
4. 커밋: `559e78af4c6269e0587fd3725d953b324c65426c` 코어, `6189215c7139cac8a3f3392f169b5988035e32d7` 기존 테스트, `de91bbefce46066e35cb679042f56669522dc622` hardening 테스트. core blob `2b004fb9474743a95294b42baf7f875602644a54`.
5. frontend 사용: 같은 코어 파일 blob으로 즉시 동기화 완료. frontend의 `tests/csv-transform.test.mjs`는 기존 10건 보존하고 `tests/csv-hardening.test.mjs`로 새 2건 분리.
6. 범위: 기존 3컬럼 수동 매핑/원본 행 보존/검토 태깅 유지. WEB API/유료 AI API/사용자 자료 접촉 없음.
7. 실 서비스: 미배포/미판매. 이 Node 회귀만으로 고객 제공 가능 판정 불가.
8. 복구: Git 파일 버전별 SHA 사용, 강제 머지 금지.
9. 다음: frontend 전체 실제 npm test + 오프라인 패키징 + Windows E2E; 최신 브랜드 정책과 안전 병합.
10. 2026-10-25 KST 검증 기준.

## 2026-10-25 KST — 스총 후속 / P2 매출 집계 로컬 모듈 (10항)
1. **목표·확정요구·기술:** 사장님 존 SELF의 가능한 두 번째 실사용 로컬 기능. 2026-11-07 상한, 기존 10종 설계 템플릿/CSV 정규화 보존. 사용자가 CSV 판매일·판매채널·판매금액 3열을 명시 매핑하고 일·월 집계 기간 선택, 실제 고객/서버 없이 Node `BigInt` 2자리 고정소수점 합산. 상품 출시·실회계 보장은 별도 검증/사용자 승인.
2. **기능·변경·설계 비교:** 원본값 직접 헤더 자동 추정/즉시 합산(A)은 위험. 기존 `normalizeSpreadsheetCsv` 검증·검토행 분리 후 유효해 보이는 행만 잠정 집계(B)를 채택. `site/sales-report.mjs` 신규: 기간/채널별 양수 합계·음수조정 절댓값·순액/건수, `reportCsv` 및 누락/오류/중복/수식/거액 제외행 `reviewCsv`를 UTF-8 BOM 문자열로 제공. 임의 데이터 삭제/외부 요청 없음. `tests/sales-report.test.mjs` 7건 및 `docs/SALES_REPORT_ENGINE_CONTRACT_20261025.md` 신규.
3. **명령·PASS/FAIL·미검증:** `node --test tests/sales-report.test.mjs` Node v22.16.0 **7 PASS / 0 FAIL**. 원격 blob과 로컬 파일 일치: 기존 `site/csv-transform.mjs` `2b004fb9474743a95294b42baf7f875602644a54`, 신규 engine `01050c8d3a3dd6a1f548d37484112aa7bd99b924`, test `4732565887cd2e3f007bb7b03a6e271e4520d159`. 전체 backend `npm test`, frontend 실제 제품·Playwright/Windows E2E는 **이번 수행 NOT_RUN**.
4. **완료/진행/대기/차단:** 엔진+정적 계약+격리 단위 검증 완료, 코어 `backend` Private 반영. 고객이 누를 `sales` 화면/실제 다운로드·`build-self` 오프라인 HTML 통합 미완. 크몽 심사·판매/Cloudflare Public 배포·최종 디자인 승인/Windows PC 검증 미진행.
5. **문제 근거/원인/시도/재시도 금지·대안:** 손실 위험(중복 합산, 결측값 합산, 숫자 float 오차) 방지 위해 제외행 별도 CSV·BigInt 채택. `READY_FOR_HUMAN_REVIEW`도 회계 승인 상태는 아님. 음수는 자동 환불로 해석하지 않고 `negativeAdjustment`로 표기. Windows QA는 Linux 검사로 대체 완료 판정하지 말 것. GitHub Actions 단계 없는 실패 반복 실행 금지.
6. **repo/branch/SHA/경로:** Private `hibi89/SMAX`, **backend 전용**. 신규 코어 커밋 `4c497d4f1a1c189692c83294f63124787c3d489b`, 테스트 `c2ffd622a8f2ec6b36c303076cd3f72ea8c586fa`, 계약 `8b8e1d6fb36f180951edc2a77f1561f9c59c7f1b`, 상태 업데이트 `cc6f2b26bc52097d91f1dc93dfd5a808a1338a1b`. 최종 backend HEAD는 HANDOFF 커밋 뒤 API 재조회. `main`/`frontend` 변경 없음.
7. **Production URL/Vercel/실행환경:** Production URL 없음. Cloudflare 정적 사이트 미배포, Vercel 미적용, 크몽 미등록. 개발 실행은 backend Node 20+ `node --test tests/sales-report.test.mjs`. `sales-report.mjs`의 소비자는 현재 함수 호출자만; 실제 사용자용 offline HTML에는 아직 포함되지 않음.
8. **원본 위치/백업/인증·금지:** `backend/site/csv-transform.mjs` 원본 blob 재사용·불변. 기존 Git history가 복원 기준, force push/임의 병합 없음. 합성 테스트만 사용, 고객 개인정보·API 토큰·결제 정보 없음. `site/` 유료 코어는 Private, `public-site/` 공개 후보만 유지.
9. **다음 우선·절차·완료기준·승인:** `frontend` 최신 SHA 먼저 확인 → sales 탭의 CSV 업로드·판매일/채널/금액 수동 매핑 → 일/월 주기와 검토 제외 건수 표시 → 보고/검토 두 CSV 다운로드 → 번들러 import 및 UI/Node/Chromium 회귀 → Linux/Windows 차이 별도 기록. 이후 main 안전 병합·Cloudflare/크몽 게시에는 창업자 사전 승인. WEB/학생/자체결제 확장 금지.
10. **기준 시각·원천:** 2026-10-25 KST. 원격 SHA 확인 및 로컬 Node 7개 실행 결과/계약 문서로 한정. 이 문서의 기준 HEAD는 업데이트 후 재조회; 상품 완성/상용 실행/Windows E2E 검증으로 확대 해석 금지.

## 2026-10-25 — serializer isolation after frontend inline integration
1. **Goal:** avoid declaration collision after private frontend bundles spreadsheet and sales modules into a single offline script.
2. **Changed:** `backend/site/sales-report.mjs`: rename internal `toCsv` to `toSalesReportCsv`, preserve `buildSalesReport` signature, rows, BOM, review behavior.
3. **Evidence:** actual Node v22.16.0 8/8 PASS on matched remote blob `17796cd0e44095512b61303045dffa582fe06162`; unchanged `site/csv-transform.mjs` blob `2b004fb9474743a95294b42baf7f875602644a54`.
4. **Frontend sync:** identical engine blob on `frontend`; UI/period sync work lives only there. `main` unchanged, no exports or deploys.
5. **Next:** full frontend Node release suite + exact SHA HTML + actual offline Chromium/Windows Edge. Tests on partial backend do not establish entire SELF release readiness. Source commit `6e57867f0b5f16f8a5422e436e5431568f1ceab1`.

## 2026-10-26 KST — 스총 인수: 오중복/매출 과소집계 보정 (10항)
1. **목표·요구·기술:** SELF CSV 표준화/매출 잠정 집계에서 서로 다른 `주문번호`가 달린 거래가 동일 날짜·금액·품목/채널이라는 이유로 오중복 처리되지 않도록 수정. 로컬 순수 JavaScript ESM, 입력·출력/원본행 보존, 유료 API/서버 없음.
2. **완료·설계 근거:** 기존 A(매핑 3열만 중복 키)는 주문 ID가 다른 실거래를 오중복 처리. B(표준화된 매핑값 + 나머지 모든 원본열)를 채택하여 원본 추가 열이 다르면 별개 거래로 분류. `site/csv-transform.mjs` 한 곳만 중복 키 수정; `site/sales-report.mjs` 기존 인터페이스/계산·전체 원본 기록 보존.
3. **테스트·증빙:** 수정 전 GitHub 실제 소스에서 두 주문 A/B는 오중복 1건 재현. 수정된 원격 실제 CSV/매출 JS 함수들을 V8에서 실행: **backend 5/5, frontend 7/7 PASS**(새 ID A/B/B→매출 2행/제외1/200.00; 기존 3열 동일 날짜 정규화 중복 동작 유지; frontend 기존 합성 CSV 4/2·매출 5/3·79.90 유지). 폴리필 TextEncoder를 사용한 격리 V8 테스트다. 새 Node 테스트 소스는 커밋했지만 전체 **Node `npm run qa:release`, 디스크 SHA/CSP, 실제 Chromium/Windows는 NOT_RUN**.
4. **상태:** 표준화·잠정집계의 이 결함 수정/집중검사 완료; 출고 검증·main 수동 통합·크몽/Cloudflare 공개는 대기. 상품 출시/판매/실사용 효과 증명 아님.
5. **오류·원인·시도·대안:** `duplicateKey=JSON.stringify(rawValues)`가 미선택 원본 주문번호를 무시함. 전 3열 관점 자동 중복판정을 강화하는 대신 전체 원본 열 보강. 주문 ID가 없는 거래는 여전히 동값 중복 의심이 발생하여 검토 행 CSV 확인이 필수; 실제로 유일한 거래인지 알고리즘만으로 확정 불가. 컨테이너 GitHub Private checkout DNS 실패로 Native 전체 QA 불가—이전 Actions 실패 반복 실행 금지, 가능한 로컬 Node 환경에서 원격 전체 최신 소스 받아 검증.
6. **저장소·브랜치·복구:** Private `hibi89/SMAX`, `backend` 및 `frontend` 동일 로직 수정(두 브랜치의 다른 `reviewCsv` 기능은 병합하지 않음). backend code `a50753c2f445c7c7b61f6e31707c5c8d579688aa`, tests `479bb8a80a3b99dbaa739c2f43d3033f37d678ba`/`66ff93fec4e7aef3489b903d464de13badda4ff7`; frontend code `dc0cc63b08c78152607d46049ec230dcc92b754f`, tests `7d0a47d908f049bfcba52417ea83556c4c9c557a`/`6d8e1c04451c03a5a407e7fe02b9f3c4c31cf596`. 이전 Git blob/커밋이 복구 기준, force push/합병 없음. backend 계약 `docs/CSV_TRANSFORM_CONTRACT_20261025.md` 갱신, frontend 고객 안내 `docs/SELF_CUSTOMER_QUICKSTART_20261025.md` 갱신. `STATUS.md` 위 섹션 참조.
7. **Production·환경:** Production URL 없음, Vercel 미적용, Cloudflare 공개 미실행, SELF 구매자·크몽 등록 없음. 로컬 Node≥20:`npm run qa:release` → Chromium `npm run qa:browser:node` → Windows `QA_SELF_WINDOWS.cmd /edge`.
8. **원본·보안:** 고객 CSV 미접촉, 테스트 합성 문자열과 Private 코드만 사용. 데이터/인증정보/토큰/Git 비공개 소스의 외부 전송 없음. `main`/외부 프로젝트 무수정. 원본 행 보존·검토 결과는 회계 승인 아님.
9. **다음 작업·완료 기준·승인:** 동일 최신 `frontend` checkout에서 전체 Node 테스트 0 FAIL와 `dist/SMAX_SELF_OFFLINE.html` 실제 SHA/CSP 검사 → 동일 아티팩트 Chromium `file://` E2E → Windows Edge 파일/다운로드/HTTP0 검증. 그다음 5개 양쪽 수정 경로+main 전용 변경을 수동 검토하고 **사용자 별도 승인** 후에만 통합. 공개 사이트/크몽 게시/가격·라이선스/결제/고객자료·비용은 별도 승인.
10. **시간·기준 SHA:** 2026-10-26 KST 최신 기능 점검. 실제 검증은 변경 뒤 재조회한 CSV 및 매출 함수 원문만. 본 HANDOFF 최종 커밋 뒤 `main`, `backend`, `frontend`의 HEAD를 다시 조회해서 보고. **2026-11-07 14일 개발 마감 상한** 유지.

## 2026-10-26 KST — 스총 최신 인수: 금액 표기 동등성 중복 교정
1. **목표/버그:** 오프라인 SELF 매출 CSV에서 같은 거래가 `100`, `100.00`, `0100` 등으로 들어오면 별개 거래로 이중 집계될 수 있던 실제 오류를 수정했다. 수정 전 GitHub 제품 함수에서 표기차 중복 누락 0건을 재현했다.
2. **설계/기능:** `site/csv-transform.mjs`에 중복 비교 전용 `duplicateAmountKey` 추가. 2자리 정확한 금액 문자열 정규화; `-0.00`과 `0` 동일, `100`과 `100.01` 구분, 서로 다른 주문번호/나머지 원본열 구분 유지. CSV 실제 출력 값·레코드 보존. 매출 코어 변경 없음.
3. **커밋:** backend code `c93e71eac0ca70fe860fb5803d4d613847a83cf9`, CSV tests `2058b03`, sales tests `cddef25`, backend-only test correction `6e6d4d6`; frontend code `73eb691e70f52a7575b3b28389ecec282c600d25`, CSV tests `50e23b8`, sales tests `a27aa4d`, UI test `63d24b3`. backend contract doc `54ceddda`, frontend customer quickstart `9f40357`; 각 브랜치 `STATUS.md` 최신 추가 기록.
4. **실제 확인:** 원격 실제 코어 제품 코드 대상으로 V8 CSV+매출 신설 테스트 함수 backend **4/4**, frontend **6/6**, frontend 신규 오프라인 UI 함수 실제 모의 DOM/Blob **1/1** PASS. 256개 결정적 속성 케이스, 기존 합성 SELF/SALES 2개 예제 보존. **전체 Native Node `npm run qa:release`/디스크 SHA·CSP/실 Chromium/Windows QA는 NOT_RUN**.
5. **테스트 결함 교정:** backend에는 `reviewCsv`가 없고 frontend에서만 추가된 계약이다. 첫 backend 신규 회귀 테스트가 이 속성을 잘못 요구해 V8 실패한 것을 발견하고, backend는 자체 `rows` 중복사유 카운트로 검증하도록 수정. backend 제품 반환 계약 변경 없음.
6. **남은 위험:** 추가 주문식별 열 없이 동일 날짜·채널·금액이 실제 서로 다른 거래인지 자동 확정 불가. 검토 CSV 원본 레코드/주문번호를 대조하는 사람의 최종 검토가 필수.
7. **환경/보안:** 현재 실행 컨테이너 Node22/Chromium 설치되어 있으나 Private GitHub 전체 checkout DNS 실패; Actions 성공 기록 없음. 고객 자료/자격증명·외부 클라우드 전송/요금·배포·판매·main 병합·force push 없음.
8. **다음 릴리스 게이트:** 동일 최신 `frontend` full checkout → `npm run qa:release` Node exit0·오프라인 HTML SHA/CSP → `npm run qa:browser:node` Chromium `file://` → Windows `QA_SELF_WINDOWS.cmd /edge`. 사용자 별도 승인 전 main 통합·공개/크몽 등록 금지.
9. **프로젝트:** Private `hibi89/SMAX`; SELF 2종 로컬 CSV 실행 + 가이드 전용 8종. RAG Studio/SMAX/SOVIA 장기 통합 기획은 main 문서 별도, 이번 판매 범위 불변. 개발 목표 **2026-11-07**.
10. **재개:** 다른 채팅 `[SMAX² 스총] GitHub hibi89/SMAX 최신 레포지토리 확인하고 총괄 작업 이어가셈` 또는 `ㄱ` → 실제 브랜치 HEAD 및 각 `STATUS.md`/`HANDOFF.md` 재조회 후 안전한 다음 P0 진행. 문서 마지막 커밋 뒤 HEAD 반드시 재확인.

## 2026-10-26 KST — 스총 인계: 금액 유효 자릿수 오류 수정 (10항)
1. **요약:** 자체 점검으로 실제 매출 누락 버그 발견. CSV `0000000000001`은 1원이지만 판매액 정수부의 전체 자릿수 제한 때문에 `AMOUNT_EXCEEDS_REPORT_LIMIT`로 제외. `1`은 포함되어 논리 불일치. 사용자의 Windows PC 시험 지시 없이 재현.
2. **제품 수정:** `site/sales-report.mjs` `parseCents`가 원문 정수부의 선행 0을 제거한 뒤 유효 길이 12자리 이내인지 검사. 기존 BigInt 센트 정확도와 - 부호/소수 최대 2자리, 진짜 1조 원 이상 제외 유지. backend commit `5be429c2f4e06771d2b3a7681292351d5565fc86`, frontend `f123a74f0b3d4b995304be505eb7843377618286`, 코드 blob `05578b300b2d7c2f0b653a485ac9c2c859ea055e` 동일.
3. **집계 계약:** 원본 금액 `0000000000001` 표기 그대로 출력·검토 파일 원본 행 보존. 중복 판정은 별도 `duplicateAmountKey`가 선행 0/화폐표기를 동등 비교하므로 동일 주문 `1`+패딩 `0000000000001` 중 하나만 잠정 반영. 서로 다른 주문번호는 각각 반영.
4. **테스트:** 양 브랜치 `tests/sales-report.test.mjs`에 6원본 유효3/제외3, `netAmount='0.20'`, upper max `999999999999.99` 포함, 실제 초과 제외 신규 테스트. backend `9672ea31932fe8454bd17d45bb66fa2efd9b92ce`, frontend `912fa18e9ca410f76514d7bc4e0bbf0081bb3b5c`.
5. **UI 테스트:** `frontend/tests/offline-ui-smoke.test.mjs`에 실제 로컬 앱 UI와 download blob의 금액/원본 번호/제외 사유 검사 추가 `0cdedf576cbb3e52c68d4467eb28ce56c02c2707`. frontend 고객 안내 `docs/SELF_CUSTOMER_QUICKSTART_20261025.md`에 원본 금액·실제 금액 상한 의미 설명 `01d7acece8b38087fb6c5bda5064559528981574`.
6. **실제 검증 범위:** 최신 backend/frontend 각 실제 production modules + checked-in 테스트 4함수 직접 독립 V8 실행 4/4 PASS 각각, frontend 합성 5모듈 fake DOM UI 테스트 본문 1/1 PASS. Native Node 전체, 신규 disk SHA/CSP, 실제 Chromium/Edge `file://` PASS와 동일시 금지.
7. **브랜치 상태:** Private `hibi89/SMAX`, 최신 frontend/backend 브랜치 HEAD 재조회 후 인수. `main` 원본 그대로, 배포·merge/force push 없음. 제품/테스트 두 브랜치 변경 확인, 모듈 blob 동일.
8. **현재 제품 경계:** SMAX² SELF 오프라인 CSV 실제 실행 2종 + 가이드 전용 8종. 잠정 매출은 세무/회계 확정 아님; 검토/제외 원본 번호와 이유는 화면 최대5건, 검토 CSV 전체 보존. 사용자 원본 파일, 결제, 업로드, 외부 에이전트 실행 없음.
9. **미완료 릴리스 검증:** 변경 후 Native Node `npm run qa:release`, SHA/CSP, Windows Edge E2E, 수동 Windows UX **NOT_RUN**, saleApproval **NOT_GRANTED**. 이전 사용자 Windows 86/86 PASS는 코드 변경 이전 버전에만 적용. 사용자가 반복 실PC 수동 작업을 원치 않으므로 개발자 자체 코드/격리 QA를 먼저 진행.
10. **다음 `ㄱ`:** 최신 GitHub 각 브랜치 HEAD·`STATUS.md`/`HANDOFF.md` 읽고 결함 수정/회귀 우선. 실기기 검증 없이 배포 PASS 주장 금지. 외부 발송/돈/유료 API/합병 승인 없음. 마감 **2026-11-07** 유지.

## 2026-10-26 KST — backend 스총 인수: Unicode 수식 보호 경계
1. **업무 목표:** SELF CSV 로컬 파서의 Unicode 숨김 접두어가 `=+@-` 수식 의심 표시를 우회하는 문제 대응. 현재 실행 2종+가이드 8종, 마감 2026-11-07.
2. **관측:** 생산 backend/프론트 변환기에서 U+200E/200F/202E/2066/2069/034F 등은 `FORMULA_PROTECTED` 미표시, CSV output apostrophe 미삽입. 해당 문자만으로 실제 Excel 수식 실행이 입증된 것은 아님.
3. **코드/설계:** `site/csv-transform.mjs` Regex에 Unicode Default_Ignorable 접두어 포함, 검토 apostrophe + 플래그 처리, 진짜 음수 금액/원본 번호/필드 값 보존. Backend `64e16ee`, frontend `8aed84d`; preexisting backend `reviewCsv` 반환 구조 차이는 무수정.
4. **테스트 성공/미검증:** 회귀 `csv-hardening` backend `2e805ce`, `sales-report` `1a23012`, frontend 대응 동등 테스트. 실제 production+checked-in `transform`, `hardening`, `sales` 29/29 PASS **각 브랜치** (V8 isolated adapter, Native Node 아님). Sales 정상1·의심2집계 분리 확인. Native 릴리스/실 Edge 수동 E2E 미실행.
5. **오류/재시도/대안:** 원인은 이전 excelSafe 시작 문자의 좁은 whitelist. Regex Unicode property escape는 현대 엔진에서 지원되지만 actual Windows Edge 검증되지 않음. 무단 스프레드시트 실행/외부 API/고객 파일 사용 금지.
6. **저장소/브랜치/경로:** Private `hibi89/SMAX`. Backend 제품 `site/csv-transform.mjs`; `tests/csv-hardening.test.mjs`, `tests/sales-report.test.mjs`; `STATUS.md`/`HANDOFF.md` 갱신. Frontend 대응 및 고객 퀵스타트 별도 반영. Main 불변, 병합 없음.
7. **런타임/출고:** 실제 `npm run qa:release` 및 Edge `QA_SELF_WINDOWS.cmd /edge` 아직 안 했음. Cloudflare/Vercel Production 미적용, Kmong 판매 미승인.
8. **민감정보/자산:** Synthetic CSV만 테스트, 실제 파일·토큰·키 없이 실행, GitHub SHA로 복원 가능. CSV 입력 원본 불변, 검토 플래그+기록 유지. 위험한 외부 쓰기 작업 별도 승인.
9. **다음 작업:** frontend HEAD 기준 총괄 이어가기. 전체 Native Node QA 및 Edge offline 브라우저 1회 최종 게이트 필요; 사용자에게 반복 PC 명령 요청하지 않음. 검증 전 판매 PASS 금지.
10. **일시/증거:** 2026-10-26 KST, private GitHub fetched source 및 V8 callback 검증 기준. 문서 작성 후 브랜치 최종 HEAD 별도 재확인.

## 2026-10-27 KST — backend 인수: 검토 CSV 출력 계약 누락 해소
1. **목표:** SMAX² SELF 오프라인 CSV 실제 실행 2종+가이드 8종. backend가 frontend의 reviewCsv 출력 계약을 누락해 검토 대상 별도 추출 불가, 안전한 후속 연동 위해 수정.
2. **재현/원인:** backend `normalizeSpreadsheetCsv`에서 3원본 행 중 2건 검토 필요라도 반환 키는 `csv,rows,summary,state,mapping`뿐. frontend은 `reviewCsv` 포함. 브랜치 코드 드리프트였음.
3. **구현:** backend `site/csv-transform.mjs`에 검토 전용 CSV 포함, 전체 CSV/원본 번호/표시 금액 불변. 코드 commit `3e6a2e0`→frontend와 byte-identical 정렬 `37b1f1b`; 파일 SHA 양 브랜치 **`43c26279c1bca9064d0d41df44abf837b11f3603`**.
4. **검증:** backend `tests/csv-transform.test.mjs`의 신규 flagged2/full4/headerOnly test `69e1344`; 실제 체크인 CSV/hardening/sales test callbacks V8 adapter **backend 30/30**, frontend **29/29 PASS**. Native Node 릴리스/실 Windows Edge/전체 E2E 수행 아님.
5. **상태/이슈:** 2026-11-07 마감 유지. 최신 Node `npm run qa:release`, Windows `QA_SELF_WINDOWS.cmd /edge`, 디스크 SHA/CSP/판매승인 **NOT_RUN/NOT_GRANTED**. 이전 역사적 Node 86/86 PASS는 현재 제품 출고근거로 사용 금지.
6. **브랜치/복원:** Private `hibi89/SMAX`, 이번 백엔드 코드/테스트/문서만. frontend 제품/ main 무변경, 배포·병합·force push 없음. GitHub SHA가 백업/재개 기준.
7. **보안·데이터:** 합성 CSV만 검증; 실고객 자료/자격증명/유료 API/외부전송 없음. 리뷰 출력에 원본 레코드 번호 포함, 처리 자동확정 없음.
8. **생산환경:** SMAX Cloudflare/Vercel Production 미적용; 상품 등록·실거래 시작 금지(명시 승인 필요). 사용자 Windows PC 반복 테스트 금지.
9. **다음 안전 작업:** 최신 frontend, backend GitHub HEAD 및 STATUS/HANDOFF 확인; 개발자 측 검증 가능한 실패부터 패치. 실제 Native 환경/Windows Edge의 최종 관문만 사용자 1회 도움 요청 가능.
10. **시점/근거:** 2026-10-27 KST private GH source 및 V8 adapter 테스트. 문서 반영 후 HEAD 재조회.

## 2026-10-27 KST — 스총 인계: CSV 숨김문자·호환동형 헤더 안전성
1. **목표·범위:** SMAX² SELF (사장님 존 로컬 CSV 실동작 2종 + 가이드 8종), 고객 수동 열 매핑을 안전하게 유지. 출고 전 안전성 회귀이며 별도 WEB/RAG/결제 기능 개발 아님.
2. **구현/근거:** `거래날짜,금액,금\u200B액,품목` 실제 입력을 기존 모듈이 수락해 잘못 선택된 `999`값을 변환하는 오류 재현. frontend/backend 각각 `site/core.mjs`, `site/csv-transform.mjs`에 숨김/제어문자 거부 및 NFKC로 시각 동일 열 중복 차단. 기존 row 내용 및 결과 CSV, 수동 승인 조건 변경 없음.
3. **테스트·성공/실패:** `node --test`, `npm run qa:release`, `npm run qa:browser:node`, Windows `QA_SELF_WINDOWS.cmd /edge`이 정식 검증 명령. 이번 실행은 GitHub 체크인 원본 모듈/테스트 콜백을 JS V8 격리 adapter로 실행한 범위에서 frontend 21/21, backend 23/23, 합계 **44/44 PASS / 0 FAIL**. 6/6 신규 사전 경계 케이스. **Native Node 전체/디스크·실 브라우저·Windows 미검증**.
4. **상태:** 수정 코드·회귀 GitHub 반영 완료, 출고 환경 통합 QA는 대기, 실제 Production·판매 미착수/미승인. 제품 2실행+8가이드 정확히 구분.
5. **오류·중단 이유:** 숨김문자와 NFKC 호환표기가 헤더 구조검사에서 누락됨. 구 시스템은 원문 열을 그대로 선택하도록 했지만 눈에 구분 불가능한 열을 허용. 검증 컨테이너에 Node 22 설치돼도 private GitHub DNS가 실패해 Native 전체 checkout 불가능; 똑같이 반복 다운로드 시도 금지, 조달 가능한 실제 로컬 checkout에서 한 차례 출고 QA.
6. **저장소·브랜치·코드 SHA:** Private `hibi89/SMAX` main 무변경. frontend core `3b817b8`, transform `da644bd`, 신규 regression `293f509`; backend core `7398e43`, transform `21cf2a4`, regression `125536c`. 정확한 branch 최종 HEAD는 최신 원격 조회 결과로 확인.
7. **환경/Production:** Node >=20, `npm run qa:release`와 `QA_SELF_WINDOWS.cmd /edge`. 라이브 Cloudflare/Vercel Production **없음/미적용**; URL/배포 SHA 해당 없음. 유료 API·대외 전송 없음.
8. **원본·백업·보안:** 사용자 CSV는 메모리 로컬 처리만, 원본 덮어쓰기/고객자료 전송 없음. GitHub 개별 코드 SHA가 복구 지점; force push/무단 병합 금지. Private SELF 코어를 공개 `public-site`에 복사 금지.
9. **다음 행동·완료 기준·승인:** Native 최신 전체 checkout→`npm run qa:release` PASS 및 disk SHA/CSP→Chromium file:// E2E→Windows Edge 한 차례 최종 QA→main/front/backend 충돌 검토·승인 후 안전 병합/출시 판정. 공개·판매·가격·계정/유료 서비스는 사용자 별도 승인 전 금지.
10. **갱신/기준:** 2026-10-27 KST. 확인은 현재 private GitHub branch 실제 파일·테스트 콜백 실행 범위이며, Node/실 PC 성공으로 확대하지 않는다. 문서 커밋 이후 최신 Git HEAD 재조회; 개발 hard stop 2026-11-07.

## 2026-10-27 — 전처리 전용 브랜치 인계

1. **사용자 지시:** 해커톤에 SMAX 전처리를 활용하기 위해 별도 브랜치 관리. Private `hibi89/SMAX`의 네 번째 `preprocessing` 브랜치를 backend SHA `5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868`에서 생성. 다른 브랜치는 그대로.
2. **책임/범위:** SMAX 결정론적 전처리 공통 API·Strict JSON 계약·원본 출처/오류검토 큐·해커톤별 adaptor. 다른 팀/해커톤 코드 자동 수정·브랜치 병합/공개 배포 금지.
3. **실행 코드:** `preprocessing/index.mjs` (`preprocessMappedCsv`, `validatePreprocessPackage`, `serializePreprocessPackage`) 및 `preprocessing/cli.mjs` (로컬 경로 입력/새 JSON, 2MiB, fatal UTF-8, overwrite 금지, source SHA). 기반 `site/csv-transform.mjs` 수정 없이 사용.
4. **검증:** `SMAX_PREPROCESS_CSV_V0.schema.json` strict cross-language contract, 합성 `preprocessing/examples/synthetic-orders.csv`, 신규 Node 테스트 5+3+2=10개, `npm run test:preprocessing` 명령. 기존 CSV 엔진과 신규 package 테스트의 **격리 V8 5/5 PASS** 및 SHA 참조 3/3 확인. **Native 전체 테스트 10개와 CLI E2E NOT_RUN**.
5. **복원:** `PREPROCESSING_HANDOFF.md`가 이 브랜치의 단독 운영 인계 정본. `preprocessing/README.md`·`docs/PREPROCESSING_BRANCH_PLAN_20261027.md`·`AGENTS.md` 상단 우선 읽기. 기존 3브랜치 한정 텍스트는 2026-10-27 사용자 신규 지시에 의해 4브랜치로 갱신됨.
6. **주의:** Public 대회 저장소로 소스/사업 전략/고객 정보 원문 복사 금지. 공개 가능한 스키마·합성 fixture·코드 패키지를 사용자 승인/대회 규정 점검 후 분리. 실제 대회 합격·점수 상승·고객 데이터 정제 보장 근거 없음.
7. **다음:** 최신 정확한 Private preprocessing checkout에서 `npm run test:preprocessing`/CLI 파일 생성 smoke, Generic CSV N필드 schema와 실 대회별 adapter. PDF/LLM/n8n/벡터는 향후. 병합·실고객 데이터·과금·외부 API 없음.
8. **기준:** 2026-10-27 KST, 연결된 GitHub Private 원격 코드와 격리 V8 근거. 사용자 질문 “SMAX preprocessing 브랜치 확인하고 작업이어가셈” → 이 문서 복원 후 다음 안전 단위 진행.

## 2026-10-27 KST — PREPROCESSING 범용 엔진 담당·우선순위 최종 결정
1. **현재 사용자 지시 최우선:** 스총/전처리 담당은 Private SMAX `preprocessing`의 **전처리 엔진 자체 완성만** 책임진다. 각 해커톤 총괄/해총이 필요한 엔진을 가져가 변형·연결한다. 해당 대회 코드는 전처리 담당이 관리하지 않는다. 이전 계획의 '해커톤별 adapter 작업'은 폐기.
2. **신규 소스:** `site/csv-transform.mjs`에 내부 규칙형 CSV tokenizer를 export `parseCsvRecords`; `preprocessing/generic-csv.mjs`의 `preprocessGenericCsv`, `validateGenericCsvPackage`, `serializeGenericCsvPackage` 1~64컬럼/5타입/원본 전체 행·열 보존/오류 분리/미승인 JSON 구현. 기존 `preprocessing/index.mjs`의 날짜/상품/금액 V0 및 backend/SELF 기능 변경 없음.
3. **계약과 테스트:** `preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json`은 cross-language JSON Schema Draft 2020-12, 실제 행·검토 상호검증은 JS 함수 담당. `tests/preprocessing-generic.test.mjs` 8개, `tests/preprocessing-generic-schema.test.mjs` 2개, `package.json`의 `test:preprocessing`에 5개 test 파일 등록.
4. **검증 실적:** GitHub 체크인 소스 콜백을 실제 V8로 실행하여 generic 8/8 + schema 2/2 PASS. JS `crypto`/Buffer 및 file read는 mock으로 연결한 제한된 실행이며 **Native `npm run test:preprocessing`과 전체 Node/npm, 디스크 E2E는 NOT_RUN**. 입력/출력 실제 바이트 SHA 출고 증거 없음. 모든 완료 주장은 범위 제한.
5. **엔진 한계:** UTF-8 CSV 최대 2MiB 및 명시 스키마/필드 매핑. XLSX/PDF/DOCX/HTML/ZIP/Local LLM/Pydantic/n8n/vector는 여전히 미구현. V1 JSON은 `source_cells`로 매핑 밖 원문도 보존하므로 개인/기밀정보 취급 주의. `approval: NOT_GRANTED` 불변.
6. **브랜치/복원:** Private hibi89/SMAX `preprocessing`, 다른 브랜치 main/frontend/backend 병합·수정 없음. 정본은 `AGENTS.md` 상단, `preprocessing/README.md`, `docs/PREPROCESSING_BRANCH_PLAN_20261027.md`, `PREPROCESSING_HANDOFF.md`. 신규 중요 코드 SHA: parser `e92b6b61`, generic `5f348da1`→검수 `90bf69be`, tests `b9e5e6da`·`45948ccd`. 코드 후속 문서 커밋 후 최신 HEAD 조회.
7. **다음 전처리만:** 전체 Native Node 회귀 확인, Generic N필드 CLI/사용성, 고급 정제·파일 검증/파싱·입출력 포맷 지원, 실패복구/데이터 민감도/품질 측정. 대회별 작업·커넥터/배포·승인 범위 제외.
8. **안전:** 타 저장소 Private IP 이동·Public 업로드·실고객 자료/비밀 입력·유료 API·외부 배포/결제·강제 merge/rebase 금지. SMAX SELF 진행 일정과 기존 대회 일정 변경하지 않음. 갱신 2026-10-27 KST.

## 2026-10-27 KST — 전처리 QA 최신 복원 및 Unicode 검토 수정
- **역할:** SMAX `preprocessing` 전용 범용 엔진만 담당. 타 브랜치·해커톤별 통합·대회 코드 변경 금지.
- **새 QA 사실:** 선행 커밋 `0cee79071f015ae473c5c53133fa84788c649b20`의 `docs/PREPROCESSING_NATIVE_QA_20261027.md`에서 GitHub 정본 17파일 일치·Native `npm run test:preprocessing` **59/59 PASS**, CSV CLI와 합성 XLSX 원본 검증 확인. 아래 예전 `NOT_RUN` 항목은 당시 이력일 뿐 baseline 현재 상태가 아님. 단, 전체 `npm test`, Windows, CI는 여전히 미검증.
- **이번 개선:** `preprocessing/xlsx-cells.mjs`와 `xlsx-package.mjs`에서 숨김 Unicode/bidi 접두어의 수식 의심 텍스트를 사람 검토로 분류하고 `-12.50` 음수 숫자 텍스트는 유지; `tests/xlsx-preflight.test.mjs`에 회귀 추가. 코드 커밋 순서 `817a9593` → `2c101fbf` → `75a406ed`. 기존 SELF/frontend/backend/main 무변경.
- **검증과 한계:** 변경된 3파일 JS 구문 3/3, V8 규칙·validator 각 6/6, Node 독립 정규식 7/7 통과. **최신 변경 포함 Native `npm run test:preprocessing`은 NOT_RUN**. 이전 59/59을 현재 신규 테스트까지 성공했다고 확대하지 않는다. 원본 XLSX 파일 사용 Node 통합도 최신 코드에 대해서는 검증 대기.
- **다음 `ㄱ`:** `PREPROCESSING_HANDOFF.md`, `STATUS.md`, `docs/PREPROCESSING_NATIVE_QA_20261027.md` 및 최신 원격 코드/commit 확인 → Private 소스 SHA 보장된 로컬 Node 재현으로 신규 Native 회귀(예상 총 60) → 추가 결함 최소 수정. 공개/판매/고객자료·유료 API·해커톤 소스 이동 승인 없음.

## 2026-10-27 KST — 스총 전처리 XLSX 혼합 입력 누락 수정 완료
- Private `hibi89/SMAX` `preprocessing`에서 원본값 중복/혼합 OOXML 셀 무음 누락을 fail-closed 수정. production `preprocessing/xlsx-cells.mjs` + `tests/xlsx-preflight.test.mjs` 1개 regression, 코드 commit **`9ca4c722bb74b0bfbf7e7f035b976370c9f852dd`**. force push/merge 없고 main/frontend/backend/해커톤 저장소 무변경.
- 최신 체크인 parser/validator 실제 본문의 V8 synthetic input **15/15 PASS**, 유효 패키지 approval 위조 **8/8 차단**, JS 3개 파일 구문 3/3 PASS. Node v22 별도 이전 Unicode predicate 회귀 **16/16 PASS**. 실제 ZIP 파일을 production 모듈로 전체 실행한 증거가 아닌 제한된 파서/validator 테스트.
- Native 전체 preprocessing 59/59은 이전 `d2f6f627` 기준선 이력. Unicode 신규 회귀와 이번 혼합 입력 회귀를 포함한 최신 약 61개 `npm run test:preprocessing`는 **NOT_RUN**. 전체 Windows/CI/Production·상용 출고 미검증, URL 해당 없음.
- 다음 `ㄱ`: `STATUS.md`/전용 `PREPROCESSING_HANDOFF.md`의 마지막 기록 → 최신 preprocessing SHA 확인 → 원격 정본 17파일 완전 복구 후 Native 전체·CSV/XLSX 합성 E2E 검증 → 공통 데이터 provenance 계층. Private 소스 Public 반출/유료 API/실고객 자료/배포·판매 무단 작업 금지.

## 2026-10-27 KST — preprocessing XLSX ruby phonetic correction
- Private `hibi89/SMAX` `preprocessing`에서 후리가나 `rPh/phoneticPr`가 raw visible text에 합쳐지던 정확성 결함을 수정. 원격 코드 commit `8cf9e0d897a20e1ad1c0601bbc3b64506cbe6e8e`; `preprocessing/xlsx-cells.mjs` + `tests/xlsx-preflight.test.mjs` 수정. 화면 표시 `東京` 추출 시 종전 `東京とうきょう` 오염 재현 후 새 가시 텍스트 helper로 해결.
- 원격 체크인 파일을 V8로 실제 실행해 synthetic XML 7/7 PASS, 코드/parser/test syntax 3/3 PASS. 전체 `npm run test:preprocessing` 현재 정적 62건 **NOT_RUN**, 과거 Native 59/59는 이전 commit 기준선만. ZIP E2E/Windows/CI/Production 미검증.
- 재개: `PREPROCESSING_HANDOFF.md` 최신 10항 인계 및 `STATUS.md` 최신 마지막 기록 확인, 정확한 preprocessing HEAD/SHA→ 인증 정본 전체 17파일 복원 → Node 22 Native 62건 → CSV/XLSX real ZIP synthetic parity QA. Private 코드 Public 반출, 타 브랜치 자동 merge, 대회별 코드 변형, 지출·배포 금지.

## 2026-10-27 KST — Generic CSV unmapped raw source formula risk fix
- `hibi89/SMAX` Private `preprocessing`: mapped 이외 source_cells의 `=HYPERLINK(1)`가 READY/검토 0으로 정상 통과하던 문제를 실제 tokenizer+Generic core에서 재현 후 수정. 새 코드 `UNMAPPED_FORMULA_RISK`에 원본 header를 field로 넣고 `NEEDS_REVIEW`·formula counter에 포함; 기존 원본 행과 mapped 계약 유지.
- 원격 core/test/schema 커밋 `ecf6cba8d22660180250cad3d5afb6b7014843d5` (core blob `3b6cedae4869b7d8d5ae587f8d565812b6d9e193`, test `3f99b78f416a36c08f299f6511a5f7f16c1215f3`, JSON Schema `ae5d2e8cbc40bc08ed586b7826c1bec5f5cead0d`). Actual V8 tokenizer/core regression **9/9 PASS**, digest 모의. 기존 62 → 신규 등록 총 63개 Native `npm run test:preprocessing` **NOT_RUN**. 기존 59/59 Native는 이전 코드 기준선.
- 이 신규 issue code 추가는 V1 enum 확장이므로 downstream 코드의 허용 enum 연동 호환성 확인 필요. source_cells 원문 자체는 수식 이스케이프되지 않은 불신 데이터; exporter에서 별도 처리할 것.
- 다음 `ㄱ`: PREPROCESSING_HANDOFF.md 마지막 10항목, STATUS.md 마지막 기록 → 최신 SHA 확인 → 17+파일 인증 checkout 정본 Node 전체 63건/실파일 CLI·XLSX ZIP E2E → 소비자 호환성/Windows QA. 타 branch/해커톤 수정·비용/배포 금지.

## 2026-10-27 KST — preprocessing XML 1.0 character hardening
- Private `preprocessing@72aef6f8605befe6a29958fc83b3394b3c40c2a2`에서 XML 1.0 금지 literal/codepoint 수용 재현, XLSX parser fail-closed 최소 변경 + 테스트 1건 추가. 실제 GitHub 원문 기반 V8 isolated 7/7 PASS이며 최신 전체 Native Node/ZIP/Windows/CI/Production NOT_RUN. 정확한 작업·테스트·복구/다음 작업은 `PREPROCESSING_HANDOFF.md` 마지막 10항 참조. 다른 브랜치 및 해커톤 저장소 무변경.

## 2026-10-27 KST — preprocessing CSV V0 local CLI safety
- Private `preprocessing` V0 CSV CLI TOCTOU 입력 경계 최소 수정 및 regression (`2902f2e37289356eb537c13a1c50c9d7b175e304`). GitHub 실제 코드로 V8 모의 파일 I/O 검사 4/4 PASS, 최신 Native 통합/Windows/CI/Production 미검증. 사용자 데이터/공개/배포/비용 없음, 타 브랜치·해커톤 무변경. 다음 작업과 검증 구분은 `PREPROCESSING_HANDOFF.md` 마지막 10항.

## 2026-10-27 KST — preprocessing MVP local XLSX output
- 기존 CSV CLI와 별도 `preprocessing/xlsx-cli.mjs` 추가, 합성 CLI 파일 회귀 3건 등록. Node 20+ / no dependency; strict JSON / original SHA parity / NOT_GRANTED / new output only. Native 최신 전체·Windows·실 Excel 고객 호환/Production NOT_RUN. 다음 작업은 실제 최신 Native 검증, 이후 최초설계 포맷 구현. 상세 10항 `PREPROCESSING_HANDOFF.md` 최신 참조.

## 2026-10-27 KST — XLSX CLI Native I/O smoke after MVP entrypoint
- GitHub commit `3cf9a5bf6ec5f50a8ce371a54da8a10b5f494cb9`, `preprocessing/xlsx-cli.mjs` blob `0b830360638baa1b6d7c33756a5d0271ad2fe299`와 동일한 `git hash-object`의 실제 파일을 로컬 Linux Node **v22.16.0**에서 `node --test smoke.mjs` 실행. **6/6 PASS, 0 FAIL**: 파일 생성·입력 SHA 보존, EEXIST 차단, 오류 시 출력 없음, 2MiB 초과 차단, symlink 차단, 잘못된 옵션 차단.
- **중요 제한:** CLI 자체는 실제 GitHub 파일이지만 테스트 실행 시 `xlsx-cells.mjs` 및 `xlsx-package.mjs`만 별도 **시험용 stub**으로 교체했다. 따라서 이것은 **Native XLSX CLI 파일 I/O 고립 검사**이며, 실제 OOXML/XLSX 추출·package validator를 통합한 E2E 및 최신 `npm run test:preprocessing` PASS 근거가 **아니다**. Stub 및 smoke 테스트는 GitHub 제품 코드로 푸시하지 않았다.
- 프로덕션·Windows/CI·고객 XLSX·상용출시는 미검증/미승인. 다음 1순위: 18+ 실제 원격 blob과 일치하는 Node 체크아웃에서 원본 extractor/validator와 함께 XLSX·CSV Native 통합 QA. Private 소스 공개·유료 CI·타 브랜치 수정 금지.

## 2026-10-27 KST — preprocessing initial unstructured TXT/MD
- 사용자 순서 MVP→최초설계 보강→마지막 보안/호환 검수. Private preprocessing에 TXT/MD → Strict JSON 문단/원문 SHA/lineage CLI 추가, `tests/plain-text.test.mjs` **Native Node 22 5/5 PASS** (3개 파일 Git blob parity). 기존 CSV/XLSX 전체 Native·Windows/CI·고객 파일 검증은 미실행. Markdown 문법 렌더링 없음, 승인 `NOT_GRANTED`; 업로드/비용/배포/타 브랜치 수정 없음. 상세 최신 `PREPROCESSING_HANDOFF.md`.

## 2026-10-27 KST — preprocessing limited HTML importer and schemas
- MVP 원설계 보강: TXT/HTML Draft202012 Strict JSON Schemas + `preprocessing/html.mjs`, `html-cli.mjs`, `tests/html.test.mjs`, `tests/document-schemas.test.mjs`. New modules only Node 22 Native **9/9 PASS**, independent Python Schema checks passed. All 6 new Git blobs match local tested files. Whole existing preprocessing test suite/Windows/CI/Production NOT_RUN. HTML subset, not full HTML5. See latest `PREPROCESSING_HANDOFF.md` 10-part handoff.

## 2026-10-27 KST — DOCX importer handoff
- Private preprocessing DOCX V0: strict 2MiB/8MiB ZIP+XML bounded paragraph/table text, SHA/lineage/review, local CLI wx output. Standalone Git SHA matched Native Node 22 **10/10 PASS** + python-docx synthetic CLI real-file PASS. Limited DOCX subset; hyperlinks, tracked changes, external relationships, macros/media rejected. Latest entire preprocessing suite, Windows, CI/Production not tested. Details latest PREPROCESSING_HANDOFF.md 10 points.


## 2026-11-11 KST — SMAX² P8–P12 70% provisional feature handoff (10 mandatory points)
1. Goal/requirements/tech: SMAX² SELF+PREP customer local source-preserving CSV mapping, owner review, verifiable reporting; Node20+ offline, no paid APIs, Private hibi89/SMAX. Target final-product engineering milestone 70%, not commercial release.
2. Implemented/rationale: P8 standalone HTML source-header-only mapping and manual JSON draft, P9 source SHA-bound PREP Generic/SELF aggregate preview, P10 single preview conversion into strict P5 batch receipt for P6 renderer, P11 exclusive three-file HTML/JSON/SHA verified package, P12 local one-command CLI. Chose manual mappings over silent auto-inference, no cloud endpoint, no rights escalation. Existing code/outputs preserved.
3. Test commands/results: exact new sources Native Linux Node22.16: node --test tests/self-owner-mapping.test.mjs tests/self-owner-preview.test.mjs tests/self-owner-delivery.test.mjs = 17 PASS, 0 FAIL/SKIP. Browser Chromium generated owner form JSON download PASS, request0/pageerror0, file:// blocked. GitHub actual existing PREP/SELF/CSV code in isolated V8 produced 2-row 90.00 draft (hash/Buffer are fake shims); existing P6 HTML accepted exact new P10 batch, tamper/HOLD checks PASS. P12 source V8 argument/receipt mock checks PASS. Full private repo npm tests, real nonstub CLI E2E, Windows, release QA NOT RUN.
4. Completion/status: engineering feature weight 50 + P8 5 + P9 5 + P10 5 + P11 5 = **70% PROVISIONAL**. P12 no separate credit. Real client approval/signed installer/rights/Native integration/out-of-scope formats PENDING. RELEASE HOLD.
5. Problems/causes/pivots: Initial repo module transfer generated one-byte whitespace Git blob mismatch; corrected to exact tested blob. P11 manifest verifier field count 8 vs true 9 initially failed; corrected and 7/7 Native PASS. Local Chromium file:// ERR_BLOCKED_BY_ADMINISTRATOR; resumed using in-memory document content rather than bypass. GitHub private full clone DNS previously blocked; no repeated blind clone, no unapproved paid Actions.
6. Repo/branch/SHA: private hibi89/SMAX feature/prep-self-owner-mapping-p8 based on preprocessing 3830cb276f560d58e8181ba384d9cbe64815737c; latest feature SHA must be re-fetched after this doc update. Key files preprocessing/self-owner-mapping.mjs, self-owner-preview.mjs, self-owner-cli.mjs, self-owner-delivery.mjs, self-owner-delivery-cli.mjs; three tests and package.json. Source blob checks c66acb2, 013051d8, 85215985; tests ad58384c, abac91d9, e88d29ff.
7. Runtime/deploy: node preprocessing/self-owner-cli.mjs --form /abs/source.csv /abs/new.html; --preview /abs/source.csv /abs/draft.json; node preprocessing/self-owner-delivery-cli.mjs --package /abs/source.csv /abs/draft.json /abs/new-package-directory. These commands are new source entrypoints, full real CLI execution pending. Vercel/Cloudflare Production N/A; no registered goods/customer launch.
8. Originals/backup/security: frontend/backend/main and stable preprocessing branches unchanged, Private core stays Private. Synthetic local fixtures only; no customer originals, keys, credentials, external upload, account/billing changes, or deployment. GitHub parent commit supports normal rollback; no force. HTML may include customer header names and must remain private.
9. Next priority & acceptance: authorized complete private checkout with exact-same SHA run full npm run test:preprocessing and npm test plus real P8 form→CSV/draft→P9 preview→P10/P6 HTML→P11/P12 bundle verify; Windows10/11 Edge direct file open, ZIP/installer and consumer UX, then safe integration into preprocessing. Real file rights/consent and monetization/production require explicit authorization. Do not treat scoped mocks as full acceptance.
10. KST checked 2026-11-11. Evidence: 17 Native scoped tests / direct Chromium set_content / isolated V8 actual GitHub source / remote Git Blob exact parity. Document baseline: docs/SMAX_PREP_SELF_P8_P12_70_20261111.md on current feature branch; code/test source SHA check; current HEAD re-query after final commit.


## 2026-11-11 KST — P9/P13/P14 independent verification handoff (70% retained)
1. **Goal/requirements/architecture:** SMAX² Private local-first SELF+PREP, human-selected exact CSV date/channel/amount mapping, read-only PREP→SELF aggregate draft, isolated HTML/receipt/SHA256 package. Chosen explicit local flow over inference/automatic approval. Final-product target 85%, 70% provisional retains RELEASE HOLD.
2. **Implemented/decision:** P9 strict allowed receipt+summary fields, row/period consistency and BigInt money proof; reject unknown row-bearing fields and forged aggregate output. P13 new independent read-only `--verify ABSOLUTE_PACKAGE_DIR` for existing manifest/receipt/report. P14 real-file native child-process acceptance source and package npm script registered. No approval, payment, upload, overwrite, auto cleanup, main/backend/frontend/preprocessing merge or API change.
3. **Tests/results:** Isolated V8 P13 valid=1, rejected invalid=3; P9 valid=1, rejected adversarial=5; these are NOT Node native tests. Existing earlier focused 17 PASS belongs to older feature source; do not count as current SHA pass. `npm run test:preprocessing`, `npm test`, P14 actual real CLI E2E, GitHub Actions, physical Windows/Edge, real SELF UI/customer: NOT_RUN/NOT_VERIFIED. Added test file is coverage only, not a successful execution.
4. **State:** P9/P13 implementation COMMITTED; P14 tests CHECKED IN but execution PENDING; customer entry/installer/Windows QA/actual frontend integration PENDING; commercial release HOLD. Completion 70%→70%, no fabricated 85%.
5. **Errors/attempts/alternatives:** Two pre-write low-level patch assembly attempts stopped (first test-double fixture pattern mismatch, second V8 `structuredClone` unsupported). Neither made remote changes. Pivoted to individually leased GitHub Contents API writes with a smaller V8 validation; succeeded. No further repeated low-level bulk patch attempt. Test runner blockage: full private checkout cannot be accessed by current sandbox/earlier Git DNS resolution failed; do not repeat unsuccessful clone. Alternative: approved native checkout or trustworthy on-repo CI with cost/quota verification; otherwise mark unverified.
6. **Repo/branch/evidence SHA:** `hibi89/SMAX@feature/prep-self-owner-mapping-p8`. Baseline `67fc66f9b8cab73ed877917165935cf1d5b5e027`; P13 feature `378c56e087c79d9e4de87d122c23cd2c47e603d9`, P13 test `d5614b1a5ff7d43dbe71bc21d36a81f4d6f93568`; E2E test `f3df2f8134445e167df877a4f41b7b3a358d9ccc`, npm registration `a6c781cee32e1c74c8b619b706cd3b4014d6e46e`; P9 tests `9b0db81b67bacab9bf3adc00d90e40d770666f8e`, P9 code `da8d4a5d691e5241ea1269ef6370016a0b4581a4`. Docs evidence `docs/SMAX_OWNER_PREVIEW_REVERIFY_P13_P14_20261111.md`. **Latest documentation HEAD**: check live branch after last update; do not treat code SHA as latest docs SHA.
7. **Production/environment:** Node >=20; `npm run test:preprocessing`; `npm test`; `node preprocessing/self-owner-cli.mjs --form SOURCE.csv NEW.html`; `--preview SOURCE.csv DRAFT.json`; `node preprocessing/self-owner-delivery-cli.mjs --package SOURCE.csv DRAFT.json NEW_DIR`; `--verify EXISTING_DIR`. No Production URL, no Vercel/Cloudflare deployment, no CI run verified for this SHA. Browser direct file:// not confirmed on Windows.
8. **Originals/backup/security:** History keeps original source commit and separate stable `preprocessing` branch `3830cb276f560d58e8181ba384d9cbe64815737c`; `main`/`backend`/`frontend` untouched. Synthetic fixtures only; no customer raw data or secrets in GitHub. Inputs read-only, package exclusive new local folder; no auto recovery/deletion. Git branch commit history is rollback. No credentials or authorization policy changes.
9. **Next/approval/acceptance:** First run complete Node22 native suite, exact P14 real-file E2E, fix failures and confirm provenance+HOLD+tamper+idempotency. Then actual Windows 10/11 Edge HTML open/save, local user selection and front-end integration, installer/upgrade, real customer-owned data rights, sale/production approvals. Significant permissions, paid runner, external release or actual customer data require explicit owner approval. Only after evidence reassess 85%. Hub progress synchronization on `hackathon-command-center-2026@kmong-productization` must preserve 16-active base and same 70% until validated.
10. **KST check scope:** 2026-11-11 KST, connected GitHub read/write, exact V8 isolated sanity and test source inspection; no full sandbox checkout or native run. This HANDOFF is a docs-level post-feature snapshot; recheck remote HEAD and central record before assuming completeness.

## 2026-11-11 KST — P15 BOM physical-source SHA correctness handoff (10-point delta)
1. **Goal:** PREP→SELF 로컬 소유자 CSV 파일의 정확한 물리 원본 바이트 SHA를 매핑/검토/패키지에서 유지. 초기 70→85% 목표 및 고객 통제, 무자동 승인 유지.
2. **Code and decision:** `preprocessing/self-preview-cli.mjs` decoder `ignoreBOM:true` 보강만 실행해 BOM-stripping 불일치 수정, CSV 실제 헤더 파서 및 레거시 원본 보존. 테스트 `tests/self-preview-cli.test.mjs` + `tests/self-owner-e2e.test.mjs` BOM 고정 SHA와 위조 거부 회귀 추가.
3. **Tests:** Node v22.16 Linux, GitHub production source의 `readBoundedRegularFile` 함수만 추출해 실 디스크/crypto Native **7 PASS/0 FAIL**. 전체 checked-in `npm run test:preprocessing`/`npm test`, P14/P15 E2E: **NOT_RUN**. 물리 Windows10/11/Edge: **NOT_VERIFIED**. 구형 P8-P12 17 PASS를 새 커밋의 native 검증으로 계산 금지.
4. **Status:** P15 코드/회귀 소스 CHECKED IN, isolated reader Native verified; full repo and consumer UI PENDING. 70→70% provisional unchanged; RELEASE HOLD.
5. **Failure/pivot:** BOM 문제는 Node22 TextDecoder 기본 동작 재현 및 원본 바이트 불일치 확인 후 `ignoreBOM:true`로 최소 수정. Private entire repo checkout/verified CI 부재로 네이티브 전체 검증 불가; 과거 실패한 git DNS clone 반복하지 않음. 대안: 비용·권한 확인된 trusted checkout/CI.
6. **Repo/branch/SHA:** Private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`. P15 functional `e0b765b38d318bd888744b2899c97b5fa6dbc078`; tests `f105004da9b3fe887178af72bc3b58e9b95cfc3d` and `ba95856172bd8d62f88ef08ccbeaad7b7298b450`; [P15 proof](docs/SMAX_P15_BOM_SOURCE_SHA_20261111.md). Final docs SHA live recheck after write.
7. **Runtime/deployment:** Node >=20 local CLI `self-owner-cli.mjs --form/--preview`, `self-owner-delivery-cli.mjs --package/--verify`; `npm run test:preprocessing` and `npm test`. Production URL/Vercel/Cloudflare/auto deployments N/A.
8. **Originals/security:** `preprocessing@3830cb276f560d58e8181ba384d9cbe64815737c` stable branch, `main/backend/frontend` untouched. Original CSV never modified; only synthetic fixtures, no secrets, new billing/permissions/data sharing. Rollback previous Git SHA.
9. **Next:** Full trusted checkout native tests and genuine P15 cross-module BOM E2E; fix failures, then Windows Edge HTML save/owner flow, SELF frontend integration/installer/customer rights; reassess 85% only after proof. New paid runner/public deployment/customer data needs approval. Hub central unchanged 70% and must sync docs.
10. **KST checkpoint:** 2026-11-11 KST; GitHub source/files and Node22 direct decoder/hash read test, not release test. Documentation basis this P15 entry plus prior P13/P14 handoff.

## 2026-11-11 KST — P16 FD-bound package verifier ten-point handoff
1. **Goal/requirements:** SMAX² local-only owner-chosen PREP→SELF CSV review; no automatic approval/import/transfer. Improve integrity verification against local path substitution while aiming 70→85% eventual product completeness.
2. **Implemented/decision:** Compared rechecking paths (insufficient pre-open race guarantee) versus fd-bound `openSync(O_NOFOLLOW/O_NONBLOCK as supported)`, `fstat`/path stat parity using bigint dev/ino/size/mtimeNs/ctimeNs, 256KiB bounded `readSync` and `finally close`. Selected latter in `self-owner-delivery.mjs`. Existing P10/P11 receipt/HTML/hash contract preserved, no output modification or authorization change.
3. **Test command/evidence:** Node22.16 Linux isolated `node --test tests/self-owner-delivery-p16.test.mjs` with exact GitHub production and test source blob contents, **7 PASS/0 FAIL/0 SKIP**. Test-only renderer and synthetic receipts. New real checked-in test `tests/self-owner-fd-race.test.mjs` identical blob SHA to test run. Full `npm run test:preprocessing`/`npm test`, P8→P16 authentic CLI, Windows10/11/Edge, customer SELF UI/installer: NOT_RUN.
4. **State:** P16 product code+regression saved, limited native file-level QA pass, whole product final **70% provisional retained**, 85% pending, RELEASE HOLD. No Production deployment.
5. **Failure/error/pivot:** Existing path-based `lstat/readFile/lstat` leaves link/file replacement window; fd-based implementation minimally removes pathname reread. Full private checkout remains unavailable through local sandbox (no DNS); prior clone retries unproductive. No paid/private Actions workflow initiated. Windows fallback and malicious directory replacement outside tested scope; report NOT VERIFIED.
6. **SHA/path:** Private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`; feature `5f2ccfa04c9fe0a04277f06135925249a4728470` (source blob `66bc6dcbde6d0858337d5bddf3fd080f7279b20a`); new test `f0e77a9138b415bbe7cfe8560b0c1f618ee06d1e` (blob `167928a8db2cdee069460184639854a12581a211`); npm registration `079d630b741710eb8c7d86d451738e56e466772a`. [Proof](docs/SMAX_P16_FD_BOUND_PACKAGE_VERIFY_20261111.md). Final documentation SHA recheck after commit.
7. **Production/environment:** no Vercel/Cloudflare deployment; Node>=20 target. `npm run test:preprocessing`, `npm test`, offline package `--package`/`--verify`. Windows physical testing pending.
8. **Originals/security/rollback:** No customer source, credentials, private code publication, permissions, billing, runner or release. Stable `preprocessing` branch, main/frontend/backend untouched. Git previous P15 commit can restore. Input CSV never edited; existing new-only output policy.
9. **Next:** approved full private checkout native regression, authentic multi-module P8→P16 E2E, Windows offline file flow/SELF front-end, installer/lifecycle/customer/rights validation, product readiness score; owner approvals for money/perms/release. Same-turn hub KMONG 16-item roster 70% sync required.
10. **KST verification:** 2026-11-11, product exact blob SHA parity, Node22 file-level 7 PASS, not CI/Windows/customer. Docs basis P16 evidence and GitHub commit.

## 2026-11-11 KST — P17 ten-part handoff / verified browser-to-native owner mapping
1. **Goal/tech/requirements:** SMAX² P8 owner-selected PREP/SELF local-only mapping, consent/approval never automatic, no customer row transfer. Raise evidence-backed whole product acceptance toward 85%.
2. **Implemented/decision:** Reused exact checked-in P8 HTML renderer and Node native mapping validator, plus opt-in `tests/browser/owner-form-e2e.py` Chromium acceptance script. Compared (A) unverified full `file://`/Windows route vs (B) real Chromium `set_content` + Node/JSON cross-validation; selected B within current sandbox, documented limitation. No app runtime dependency added.
3. **Tests/results:** P8 actual module `c66acb2a757e26d25058c81eaaad4dcfadea0913` + exact existing P8 test blob `ad58384c5c1130f5bd31136e3514e15321d7f987`: isolated `node --test tests/self-owner-mapping.test.mjs` **6 PASS/0 FAIL**. Chromium v144.0.7559.96 browser+Native JSON validator **9 PASS/0 FAIL**, test `d4dc9087fe0d0946a14e1da66ef3f6006ceebe19` byte-identical checked-in. Browser network requests 0, exceptions 0. Full `npm run test:preprocessing`/`npm test`, real P8→P16 CLI integration, Windows/Edge `file://`, actual customer SELF frontend/installer **NOT_RUN**.
4. **State:** Browser owner flow from actual rendered HTML to JSON download and native strict revalidation verified. Product 70→**72% provisional** (+2%p for real customer-facing interaction/test coverage, not just code), target85 pending **13%p**; RELEASE HOLD, no production deployment.
5. **Failure/evidence/pivot:** Direct Chromium file URL `file:///mnt/data/smax_p17/form.html` failed `net::ERR_BLOCKED_BY_ADMINISTRATOR` due browser environment restriction, not evidence of product defect. Pivoted once to browser `page.set_content(html)` with same genuine HTML/JS/CSP+download, PASS. Do not repeat blocked file profile or assert file:// success. Repo checkout full source still unavailable; no paid CI initiated.
6. **Repo/branch/SHAs:** Private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`. P17 checked-in test `eaae3c186d0800eeb04a7fb9dacefcd5d73f966d`, test SHA `d4dc9087fe0d0946a14e1da66ef3f6006ceebe19`; evidence doc `docs/SMAX_P17_CHROMIUM_OWNER_FORM_ACCEPTANCE_20261111.md` at `c868b574d8b47493af9e7a50cc714a2bb1d354d7`. Final docs HEAD verify after write.
7. **Environment/deployment:** Local Node >=20, Python Playwright optional QA, Chromium headless v144. Production URL/Vercel: not applicable; actual offline file open Windows/Edge not verified. Optional `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/owner-form-e2e.py`.
8. **Originals/backups/security:** Only synthetic CSV for tests, no source row in HTML, no network requests, no customer data, auth tokens, billing, access controls, CI runner, public release or stable main/frontend/backend/preprocessing changes. Git previous commit provides rollback.
9. **Next priority:** Get authorized full private GitHub checkout for actual native full `npm run test:preprocessing` and `npm test`, genuine P8/P9/P12/P16 end-to-end with BOM and HOLD, then Windows10/11 offline file open and customer acceptance UI, SELF frontend integration, packaging/licenses. Recalculate toward 85 only after proof; paid runner/perms/public deployment require prior approval.
10. **KST:** 2026-11-11, evidence limited to exact P8 GitHub module/native tests and real Chromium set_content→JSON→native P8 validator. Docs P17 and this Handoff are the product authority; HUB central kmong roster requires synchronized **72%**.

## 2026-11-11 KST — P18 single-file offline customer portal / mandatory 10-part handoff
1. **목표·확정 요구·기술:** 85% 목표 아래 고객 직접 UTF-8 CSV(<=2MiB) 선택→수동 3개 열·daily/monthly→물리 바이트 SHA 포함 JSON 초안 다운로드. 무유료 API·무외부전송/승인/파일 쓰기·원본 비노출. SMAX² SELF/PREP 기존 P8–P16 분리 유지.
2. **완료·결정:** 기존 P8은 CLI로 FORM HTML을 선행 생성해야 했음. A 로컬 HTTP 서버는 CSRF/인증·개인정보/방화벽 위험, B 단일 HTML 무서버는 경량·고객 자립이 가능해 B. WebCrypto는 secure context 요구해 테스트 환경에서 막혔고 browser+Node SHA byte parity를 검증한 pure JS SHA256로 전환. `site/owner.html`과 `site/index.html` 링크, Node static vetted asset reader/--output 안전 생성, 신규 Node+Chromium tests.
3. **검증:** 실제 P18 local file = GitHub exact SHA `b32e0a01c6e30bd8a73a6c468fdc0825a925bff4`, reader `1150276bb4dd2589bf22227398f86c8bd2faccff`, CLI `ffe2786f49b0d5add3d6201fa5beea7f4a222368`, unit `b4e01b8b44453bc08faac456c3ac5eb7913e1b3b`, browser `6e2795803f85c6f0a3dab5271860e129be5b87b0`. Node22/Linux **5 PASS/0 FAIL/0 SKIP**; Chromium144 Python Playwright **14 PASS/0 FAIL**; actual P8 Native validation of downloaded JSON PASS. No external requests. Entire repo native `npm run test:preprocessing`/`npm test`, full P9/P12/P16 E2E, Windows/Edge file://, customer SELF UI, installer NOT_RUN.
4. **완료/대기:** Static customer-facing CSV portal and product link, safe CLI and tests committed; P9/P12 downstream fully native customer chain and Windows UI pending. Whole product **76% provisional**, target85 pending **9%p**, RELEASE HOLD.
5. **실패·근거·재시도 금지:** Browser `page.set_content` insecure origin lacked `crypto.subtle`, resulting first prototype unable to SHA. Localhost `page.goto` and file:// were explicitly `ERR_BLOCKED_BY_ADMINISTRATOR` due sandbox policy. Stop/replan pure JS SHA, Chromium+Node exact digest and P8 validation 14/14; do not assert Windows file:// succeeded. No GitHub private full checkout available in sandbox; unverified is not failure.
6. **저장소·SHA/경로:** Private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`; P18 static source creation commits `697f4aac8a926c9fbe1f081bd7a4b640f7c1bf86`, `cc26d2651ad40310ae02d2564d2cdba8bdbb9a86` (final static blob exact). P18 wrapper `b932786add618c82e35cef996645919569791b55`, CLI `cd186b5b1b47b4660896011f13d441391fc60d44`, Node test `d5220324234ffeb27fc8ef87a86026af0d2f8de1`, browser test `3df8a9674f98dc8b6caeb23dee24ddbde37653b9`, site+script `3e3e4a0b8c240747188e798a971149eeb3e3b08e`, proof doc `01011f69f0680a3c54745adfe33a38b492978cd7`. Latest docs SHA after write recheck.
7. **Production/Vercel/실행 명령·환경:** Static site `site/index.html` links `site/owner.html`. `npm run owner:portal -- --output /absolute/unused.html` (Node20+), `node --test tests/self-owner-portal.test.mjs`; Chromium optional `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-portal-e2e.py`. No Vercel/Cloudflare Production, site not deployed, Cloudflare static unchanged.
8. **원본 위치·백업/보안:** Only synthetic source CSV; client file not uploaded, row values not rendered, validation after download requires P8 source SHA, strict CSP no connect, no paid services, tokens/credentials/permission or billing. Stable `preprocessing` HEAD `3830cb276f560d58e8181ba384d9cbe64815737c`, main/frontend/backend unchanged. Git prior commit rollback.
9. **다음 우선순위·완료 기준:** Acquire trusted authorized full private checkout for actual `npm run test:preprocessing`/`npm test`, authentic P18 browser JSON→P9→P12→P16 genuine CSV, Windows10/11 + Edge Chrome `file://` QA, SELF actual customer integration/installer/security/license. Confirm no secrets or unsupported automation. Escalate scope/paid/Production/perms only on approval.
10. **KST 갱신 및 근거:** 2026-11-11, product exact blobs/native isolated P18 module + real Chromium; non-verified full repo/windows explicitly retained. Documentation anchor `docs/SMAX_P18_BROWSER_SELF_OWNER_PORTAL_20261111.md`. Hub KMONG 16-product roster must reflect 76% after final SHA confirmation.

## 2026-11-11 KST P18 SHA-vector validation addendum
1. Goal: validate the browser's own SHA-256 matches physical customer CSV bytes at all padding and size boundaries, without relying on network/WebCrypto.
2. Implementation: `tests/self-owner-portal-hash.test.mjs` isolates exact embedded SHA function from checked-in static HTML and runs deterministic binary vectors against Node crypto. No production HTML edit, user original edit or behavior change.
3. Test: Linux Node v22.16.0 **53 PASS / 0 FAIL** across 0..2MiB, including SHA pad boundaries. Earlier P18 Node 5 PASS and Chromium14 PASS retain own scope; full `npm run test:preprocessing`/`npm test` NOT_RUN.
4. State: product 76% provisional unchanged, goal 85%, RELEASE HOLD, real Windows/customer not tested.
5. Failure/pivot: repeated same-name Chromium Blob downloads eventually throttled by automation/browser policy; do not call this a product defect. Native algorithm extraction passed.
6. Repo `hibi89/SMAX@feature/prep-self-owner-mapping-p8`, exact new test blob `faaa836ec7b745cb27e2675a13a7addfcab311c3`, test commit `bdefbee8ef8794f5f926544666eda5df79c31caa`, npm registration `74074304f3f2a32886337c7badccde5a62e46d72`.
7. Runtime: Node >=20 developer tests; Vercel/Cloudflare Production N/A.
8. Originals/security: only synthetic deterministic byte vectors; no business data, changes to perms, deploy, billing or secrets.
9. Next: full real Node repo suite and P18 JSON→P9→P12→P16 E2E plus Windows Edge file:// acceptance.
10. Checked 2026-11-11 KST: exact source blob + Node22 targeted vectors, no entire product/Windows/full CI validation.
## P19 2026-11-11 KST — 10-point owner SHA reverify and fail-closed handoff
1. **Goal/requirements:** 고객 직접 CSV 선택→수동 매핑 JSON→저장한 초안 재선택·물리 원본 SHA/역할/기간 검증. 자동 승인지급/외부전송·원본 변경 금지. 목표 85%, 현재 79%.
2. **Code/decision:** A 로컬 서버/API와 인증·방화벽 추가 vs B 기존 standalone HTML의 strict JSON 필터. B 선택(저비용, 개인정보 로컬, 유지 간단). `site/owner.html` ⑥ JSON 재검증과 race 거부, P18 CLI는 portal CSP/HTML 사전 검증 후 신규 파일 `O_EXCL` open.
3. **Actual tests:** GitHub exact blob 소스/테스트로 Node22 Linux Native **8 PASS/0 FAIL/0 SKIP**: P18 포털 5, 원본 SHA 경계 53개 입력 검증 1 test, P19 CSP failclosed 2. Chromium144 headless real UI **18 PASS/0 FAIL**, requests 0/JS errors 0. 별도로 실제 PREP/SELF/P9 6모듈 V8 알고리즘 17/17, P11 renderer/manifest+verifier 원본 결합은 virtual FS 및 SHA mock. **전체 `npm run test:preprocessing`/`npm test`와 실제 P18/P19→P9→P12→P16 Node 파일 E2E NOT_RUN**.
4. **Status:** P19 full feature/repro test source committed, **whole final 79% provisional**, 85% pending 6%p; RELEASE HOLD. Windows10/11/Edge file://, 실제 SELF 프론트·installer/고객 검증 pending.
5. **Failures and pivot:** sandbox browser `file://` and localhost direct navigation rejected by administrator, used exact HTML Chromium `set_content`; V8 package virtual FS initially lacked Node Buffer UTF8 behavior then harness corrected, successful. Local browser test change event async waiting initially raced; fixed Playwright expect and reran 18/18. Never claim these were real product runtime/Windows defects; don't repeat blocked paths.
6. **GitHub/SHA/path:** private `hibi89/SMAX@feature/prep-self-owner-mapping-p8`; P19 HTML code `4eaaecb4c9ceeb3027050b98ef0025516e90f45d`, blob `cf56242d40dc748ab42ec17bb1bc674d5ce03327`; browser test `ba8afebc97e287806dcd1ccb86ceb15fd4200ded` blob `eb0b962f9de21a043685ab1d96c96af9cc352cef`; Node CLI fix `dabc5319529ae4f3e4c9f8116bf7d743086d4c1d` blob `de566e9fa14eb8b3aad7003082eea062b3195fa4`; Native test `efacf96298ffc79d71bccfc785a9b59877f7fb24` blob `38d41d7d16f4891e19cbfe86dbfa95a6c9e4f24a`; suite `c04ef56f11ca66385f9b748c6d4ccb3ac005e72d`. P19 proof `docs/SMAX_P19_DRAFT_REVERIFY_AND_FAILCLOSED_20261111.md`. Final docs HEAD recheck.
7. **Environment/deployment:** local Node>=20 CLI `npm run owner:portal -- --output <absolute-new.html>`; tests `node --test tests/self-owner-portal.test.mjs tests/self-owner-portal-hash.test.mjs tests/self-owner-portal-csp-failclosed.test.mjs`; optional Python Playwright `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-draft-reverify.py`. Vercel/Production N/A; no deploy.
8. **Original/backup/security:** synthetic data only, physical original user CSV never uploaded, HTML no source rows and no network, no secrets/tokens/paid API/CI/branch merges. Stable `preprocessing` SHA `3830cb276f560d58e8181ba384d9cbe64815737c` remains untouched, main/frontend/backend unchanged. Git previous P18 commit rollback.
9. **Next priorities/acceptance:** trusted full private repo checkout & full Native suites + P19 JSON→P9→P12→P16 actual disk/crypto E2E; Windows10/11 Edge file://; full SELF frontend/installer/customer/legal/license validation; only then reassess to 85. Paid runner, public Production, permissions, customer data require explicit owner approval.
10. **Timestamp/provenance:** 2026-11-11 KST; source GitHub blobs, isolated Node Native 8 test, actual Chromium 18, V8 algorithms/virtual FS. Not whole production. Hub KMONG central 16-product roster to sync 79%.
