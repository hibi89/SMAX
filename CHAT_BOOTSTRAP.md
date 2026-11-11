> **2026-11-11 KST P19 feature branch latest:** `hibi89/SMAX@feature/prep-self-owner-mapping-p8` CSV→원본 SHA 매핑 JSON 생성에 이어 브라우저 내 저장 JSON ⑥ 재검증 추가. 실제 Chromium 18/18, Node exact source 8/8 PASS; original PREP/SELF V8 17/17 (OS fs/crypto 모의). Windows Edge file://·full real npm/CLI P9/P12/P16 E2E 아직 NOT_RUN. **최종상품 79% 잠정, 85% 목표, RELEASE HOLD**, 기타 stable branches untouched. [P19 보고서](docs/SMAX_P19_DRAFT_REVERIFY_AND_FAILCLOSED_20261111.md). 아래 50% 기록은 안정 branch 과거 상태.

> **2026-11-11 KST P18 제품 최신 기능 브랜치:** `hibi89/SMAX@feature/prep-self-owner-mapping-p8` 제품 SELF 고객 `site/owner.html`에서 CSV 파일 선택/헤더 매핑/물리 SHA-256 JSON 저장을 CLI 없이 지원, 사이트 링크·Node 독점 생성 CLI·Native Node 5/5·Chromium144 14/14 검증(실제 P8 매핑 수용). 정확 원격 HTML blob `b32e0a01c6e30bd8a73a6c468fdc0825a925bff4`. **전체 제품 76% 잠정, 85% 미달, RELEASE HOLD**. `file://`/localhost 탐색은 샌드박스 browser admin 차단으로 Windows 운영성 미검증, 실제 P9/P12/P16 전체 P18 real file integration 및 full npm 미실행. [P18 상세](docs/SMAX_P18_BROWSER_SELF_OWNER_PORTAL_20261111.md). 아래 과거 preprocessing 브랜치 50%와 구분.

> **2026-11-11 P15 최종 기능 분기 상태:** 최신 `hibi89/SMAX@feature/prep-self-owner-mapping-p8` P15 BOM 포함 원본 SHA 문제 패치, 회귀 파일 체크인; Node22 7/7는 파일 리더 함수만의 Native 부분 검증, 전체 native/E2E·Windows 고객 흐름 미검증. [P15](docs/SMAX_P15_BOM_SOURCE_SHA_20261111.md) 먼저 확인하고 이전 P13/P14 후속 진행. **완성률 70% 유지, 85% 미달, RELEASE HOLD**. 아래 안정 preprocessing 인수인계의 50%는 별도 과거 브랜치 기록.

> **2026-11-11 KST 최신 스총 복귀 명령 (현 기능 브랜치):** 사용자가 SMAX² P8~P14 / 70→85%를 지정하면 Private `hibi89/SMAX@feature/prep-self-owner-mapping-p8` 최신 HEAD와 `docs/SMAX_OWNER_PREVIEW_REVERIFY_P13_P14_20261111.md` → `PREPROCESSING_HANDOFF.md` → `HANDOFF.md` → `STATUS.md` → `AGENTS.md` → `REQUIREMENTS.md` → 실제 소스/테스트 순으로 확인한다. 50% 구형 안정 `preprocessing` 기록을 현재 70% 기능 진행과 혼동하지 않는다. 실 전체 Native/Windows/SELF 통합 미검증이며 RELEASE HOLD. 아래 과거 부트스트랩은 안정 브랜치와 예전 역할의 기록이다.

> **최신 2026-10-27 KST — 스총 새 채팅 복원 우선순위 (preprocessing 브랜치 전용):** 사용자가 새 채팅에서 **"스총"**, **"너는 스총이다 레포지토리보고 작업이어가셈"**, 또는 **"[SMAX preprocessing 브랜치 확인하고 작업이어가셈]"**이라고 부르면 **Private `hibi89/SMAX`의 `preprocessing` 브랜치 HEAD부터 확인**한다. 현재 우선 업무는 **범용 전처리 엔진 자체 개발·검증·완성**이며, 1~64필드 Generic CSV V1 구현 이후 **Native 전체 테스트/로컬 파일 CLI 검증 → 문서 파서·스키마·오류처리 등 후속 공통 기능**을 이어간다. **해커톤별 연결·어댑터·제출은 해총/대회별 총괄이 담당**하므로 이 브랜치 작업자 범위에서 제외. 다른 세 브랜치·대회 레포를 자동 수정·병합하지 않는다. 정확한 인계는 `PREPROCESSING_HANDOFF.md` → `preprocessing/README.md` → `docs/PREPROCESSING_BRANCH_PLAN_20261027.md` → `STATUS.md`/`HANDOFF.md` 최근 항목 → 실제 소스·테스트 순서. 과거 3브랜치/SELF 우선순위 메모보다 이 신규 사용자 지시가 우선. 최신 정확한 HEAD와 실 테스트 결과를 새로 확인하고 근거 없는 완료 주장은 금지한다.

> **2026-10-27 KST — 스총 SELF frontend/backend CSV reviewCsv 계약 정렬:** 최신 `backend` CSV 변환기에서 검토 대상 2건을 발견해도 `reviewCsv` 반환이 **없던 상태**를 실제 backend 원문으로 재현. backend `site/csv-transform.mjs`에 별도 검토 CSV를 반환하고 frontend 파일과 완전 동일하게 정렬(코드 backend 커밋 `3e6a2e0`→`37b1f1b`; 양쪽 blob SHA **`43c26279c1bca9064d0d41df44abf837b11f3603`**). 검토 2건/전체 4건·원본번호·검토0건 헤더-only backend 회귀 테스트 `69e1344`. 실제 checked-in tests+production 코어 V8 격리: frontend **29/29 PASS**, backend **30/30 PASS**; **Native `npm run qa:release`/실 Windows Edge file:// E2E/온디스크 SHA+CSP·출시 승인 미수행**. 이번은 backend 소스/테스트만 수정, frontend/main 제품 코드 무변경; Cloudflare/Vercel/크몽 판매/고객정보/비용 없음. 최신 `STATUS.md`·`HANDOFF.md` 항목에 자세한 근거; 2026-11-07 마감 유지, 형에게 Windows 반복 명령 요구하지 말 것.

> **최신 2026-10-26 — 스총 CSV Unicode 숨김 접두어 수식 검토:** 실제 `site/csv-transform.mjs`의 `excelSafe`가 U+200E/200F/202E/2066/2069/034F/180E 등의 보이지 않는 문자 뒤 수식 시작 `= + @ -`를 `FORMULA_PROTECTED` 없이 통과시키는 것을 재현. 기존 whitespace/0-width 일부만 감지했으므로 `\\p{Default_Ignorable_Code_Point}` Unicode regex 추가, 검토 상태+apostrophe 보호, 정상 음수 금액·원본 행 보존. Private `frontend` production commit `8aed84d`, `backend` `64e16ee`; 양쪽 hardening 테스트 frontend `a1cf7f4`/backend `2e805ce`, sales 회귀 frontend `77663c1`/backend `1a23012`. 양 브랜치 체크인 CSV+매출 테스트 각각 **V8 격리 29/29 PASS** 및 Sales 3건 중 1건 잠정 반영, 의심 2건 검토 CSV 확인. **Native Node `npm run qa:release`/최신 실 디스크 SHA·CSP/실 Windows Edge `file://` E2E·Windows 사용성은 여전히 NOT_RUN**, 판매승인 미획득. `main` 불변, 무료 로컬 SELF 실행 2종+가이드 8종, 비밀 자료 전송·배포·돈 지출 없음. `STATUS.md`·`HANDOFF.md` 최신 추가 항목 참조, 다음 `ㄱ`은 최신 HEAD에서 계속. **2026-11-07 마감**, 사용자 반복 Windows 명령 금지.

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
