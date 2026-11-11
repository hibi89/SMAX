> **2026-11-10 KST — SMAX² P5/P6/P7 기능 완성·검증 후 최종상품 잠정 **50%** 도달(기존 45→50, +5%p):** P5 `self-preview-batch.mjs` 로컬 최대8개 명시 CSV/설정파일의 PREP→SELF 검증·동일원본 SHA256 중복차단·BigInt 정확 집계/1개라도 HOLD면 전체 금액 미출력 **+2%p**; P6 `self-preview-html.mjs` 사용자용 무JavaScript·무원격리소스 CSP HTML 검토보고서(승인/실행 없음) **+1%p**; P7 `self-column-suggest.mjs` 한국어·영어 CSV 열 이름 후보 정렬·동음이의/숨김문자/수식형 보류·**매핑 자동적용 금지** **+2%p**. P7 실제 GitHub 소스·테스트 blob SHA와 Node22 로컬 파일 `git hash-object` 일치: **Native Node 총 28/28 PASS** = 원본 후보 엔진 실제 18/18 + CLI 프로세스 10/10(상위 CSV 파서/파일리더는 테스트 더블). P7 원본 GitHub parser+후보+CLI V8 9/9 PASS. P5 원본 배치 함수의 격리 17/17 PASS, P6 원본 HTML 렌더러의 격리 14/14 PASS, P3 원본 Generic CSV+SELF+gate SHA256 실제 알고리즘/V8 14/14 PASS. P3→P4→P5 실제 코드·SHA256·합성 CSV 2개 통합 **9 PASS/1 하네스 structuredClone 미실행**; 예상 원화 집계 300.00 −25.00 = **275.00** 확인. `tests/self-preview-batch.test.mjs` 17개, `tests/self-preview-html.test.mjs` 15개, `tests/self-column-suggest.test.mjs` 18개, `tests/self-column-suggest-cli.test.mjs` 10개 포함 `npm run test:preprocessing` 등록. **중요 검증 한계:** 전체 비공개 repo 실제 Native `npm run test:preprocessing` / GitHub Actions 0건 / Windows 원본 SELF UI·고객 E2E **미검증**, 실 판매·배포·자동 승인·결제 여전히 **RELEASE HOLD**. 50%는 고객 상품 전체 100% 기준의 개발 기능 진척 **잠정 평가**이지 Native CI 성공이나 출시 가능 판정이 아님. 기능 최종 GitHub SHA `3190da505efcd55e7e83a1eabe994fbd8c9e5718`. `main`, `frontend`, `backend`, 고객 원본·GitHub 권한/과금/Production 불변. [P5](docs/PREP_SELF_BATCH_20261110.md) · [P6](docs/PREP_SELF_HTML_REPORT_20261110.md) · [P7](docs/PREP_SELF_COLUMN_SUGGEST_20261110.md).

> **P4 추가 Native CLI 검증(2026-11-10 KST):** 정확 SHA `8a59c0877655ff734251e131c162e6dbceb05fed` 일치하는 새 CLI 소스를 Node22.16 실제 자식 프로세스로 호출해 **3/3 PASS**: 정상 입력 exit0/JSON stdout, 미허용 `--approve` exit1/정적 stderr·stdout 없음, 미존재 입력 경로 exit1/경로 비노출. 기존 Node Native fd/UTF8/symlink smoke **11/11 PASS**와 합계 **Native 독립 14/14 합성 확인**. **중요:** 두 검사 모두 PREP Generic CSV와 SELF report는 **시험용 mock 모듈**을 사용, 실제 repo 전체 `npm run test:preprocessing` 및 신규 Native 통합 테스트 16개 **미실행**. SMAX² 45% 그대로, 최종상품률·판매 승인 미상향.

> **2026-11-10 KST — SMAX² P4 오프라인 PREP→SELF CLI 기능 커밋 / 총 완성률 45% 유지:** `preprocessing/self-preview-cli.mjs` 신규. 소유자 직접 선택 `--input CSV --config JSON`에 대해 일반 파일·심볼릭 링크·파일 용량·UTF-8·ctime/mtime/ino/dev·원본 읽기 전후 크기를 확인한 뒤 PREP Generic V1→P3 SELF preview gate를 메모리에서 실행. 정상 초안 종료0, PREP/SELF 검토 보류2, 유효성 오류1(원본 경로·셀 값 포함하지 않는 정적 stderr), 원본/설정 파일 변경·외부 호출·승인/실행·`--output` 미지원. `tests/self-preview-cli.test.mjs` **Native 프로세스 통합 테스트 16개 체크인(실행 대기)**; `npm run test:preprocessing` 및 `npm run preview:self` 스크립트 갱신, 합성 예제 2종 추가. 정확 신규 CLI Git blob SHA **`8a59c0877655ff734251e131c162e6dbceb05fed`**와 동일한 로컬 파일 Node22.16 `--check` PASS; **Node22 CLI 독립 파일 I/O 테스트 11/11 PASS**, 단 PREP/SELF 도메인 모듈은 임시 스텁으로 대체됨. 앞 단계 격리 V8 PREP↔SELF 14/14 PASS(해시·UTF8 test double)와 구분. 실제 GitHub 소스 전체 Native Node 통합 회귀 및 새 16개 자동테스트 실행·Windows/고객 환경 **미검증**, PREP 브랜치 Actions 0건, 품질 근거 미충족으로 SMAX² 최종상품 **45% 잠정 유지/RELEASE HOLD**. 정확 기능 SHA `9358eb0a383b2d89b2bb574a8ac88577542bf334`, `main`/`frontend`/`backend` 및 원본 데이터·유료·권한·배포 변경 없음. [P4 범위·테스트 기록](docs/PREP_SELF_PREVIEW_CLI_20261110.md).

> **2026-11-10 KST — SMAX² PREP→SELF 로컬 미리보기 구현(완성률 45% 유지):** `preprocessing/self-preview-gate.mjs` 및 `tests/self-preview-gate.test.mjs` 신규. `SMAX_PREPROCESS_GENERIC_CSV_V1` 원본을 다시 읽어 전체 영수증 대조·명시 date/channel/amount 열 매핑/타입/기간 확인; PREP·SELF 검토 항목은 `REVIEW_HOLD`, 검토 없을 때에만 집계 초안을 `READY_FOR_OWNER_REVIEW`로 반환. 승인/쓰기/결제/외부연결/고객 행·원본 CSV 반환 없음. 전처리 자체 Native 전체 `npm run test:preprocessing`는 **미실행**; GitHub 실제 기존 모듈과 신규 소스·테스트의 **격리 V8 14/14 PASS (SHA256·UTF8 test double 사용, Native Node CI가 아님)**, 별도 작성한 동형 파일 Node22 `--check` 통과. 정확 기능코드 GitHub SHA `037576e74359e2961838dc8891b7f196c47ece03`. private 브랜치 `preprocessing`에만 코드·테스트·문서 추가; `main`, `frontend`, `backend`, 고객 원본, 권한/배포/과금 수정 없음. 완성률 **45% 잠정 유지**, Native Node 전체 회귀·Windows·브랜치간 SELF 통합/실고객 검증 미완, RELEASE HOLD. [기능 계약](docs/PREP_SELF_PREVIEW_GATE_20261110.md).

# STATUS — 2026-10-25 KST

| 항목 | 판정 | 비고 |
|---|---|---|
| SMAX 이름·사업 방향 | AGREED | 이름은 확정; 상표 권리 검증은 미완료 |
| GitHub `hibi89/SMAX` Private | VERIFIED | GitHub API visibility=private 재확인 |
| 기획·비용·인수인계 저장 | VERIFIED | 10개 파일 원격 트리 확인, 비공개 main |
| 개발용 P0 스켈레톤 | LOCAL_ONLY | 별도 로컬 ZIP의 오프라인 정형 규칙 검증기; GitHub에 업로드하지 않음 |
| 실제 AI 추론 엔진 | NOT_IMPLEMENTED | 텍스트/문서 의미 분석 없음 |
| 실제 자동화 실행 엔진 | NOT_IMPLEMENTED | 정형 계획 검증/드라이런만 로컬 초기안 |
| 고객 인증·권한·결제 | NOT_IMPLEMENTED | 고객 데이터 없음 |
| 고객 인터뷰·계약·매출 | ZERO_VERIFIED | 고객 유료 의사 검증 안 됨 |
| 오늘 신규 비용 | NO_SPEND_ACTION_TAKEN | 이 채팅에서 결제하지 않음; 외부 실지출 자료 조회 없음 |
| 공식 상표·도메인 | NOT_CHECKED | 유사상표 검색·출원·도메인 미진행 |
| 공개 출시 | NOT_STARTED | Private 소스만 |

## 이번 대화에서 원격 확인한 사항
- 저장소: `hibi89/SMAX` (GitHub 실제 표시명 SMAX).
- 초기 README: `886bb594a793bb74e1748e9ab9873326ef80ff07`.
- 사업·인계 9개 문서 일괄 반영: `10b37c5b9ca318aa647297affb5f3c76603a617e`.
- 이어서 GitHub API로 `visibility=private`, `main` HEAD 일치, 총 10개 파일, 트리 누락 없음 확인.
- 이 상태 문서는 마지막 확인 결과 기록용이며 향후 커밋으로 HEAD가 갱신될 수 있다.

## 운영 우선순위
2026-10-25 **오늘 하루는** 해커톤 3개 개발 작업을 쉬고 SMAX 사업 기획에 집중. 다음 채팅에서 기존 대회 마감과 우선순위를 다시 확인한다.

## 다음 작업
`HANDOFF.md`의 시장조사 30~50건 표본 검증과 첫 표준화 업무 1개 선택. 비용 집행 및 실제 고객자료 접근 금지.

## 2026-10-25 KST — 예비 시장·브랜드 조사 후속
- 시장 조사 원문: [docs/MARKET_WEDGE_SCAN_20261025.md](docs/MARKET_WEDGE_SCAN_20261025.md) (원격 신규 문서 검증 예정).
- 공개 **발주자** 공고 2건(위시켓 예상예산 2,000만 원 / 900만 원), 기타 판매자/경쟁사 페이지 조사. 공고는 계약/실매출 증거가 아님. 목표 구매자 공고 30~50건 수집은 **미완료**.
- 첫 진입 업무는 **발주↔명세서 불일치 검증(B), 우선 검증 제안**. 제품·가격·코드·출시 범위 **미확정/사용자 승인 대기**. 세 후보 비교는 연구 문서 참조.
- Smax AI라는 기존 AI 자동화 서비스 발견. **상표·도메인 확보/사용 가능성 미검증**. 'SMAX'는 내부 명칭 유지, 공개 브랜드 확정 보류.
- 실제 고객 접촉, API 호출, 유료 결제, 코드 개발/배포 **없음**. 이 변경은 사업 조사 문서 최신화만.

## 2026-10-25 KST — 창업자 사업 모델 재정의
- **전략 방향 기록:** AX 자동화 자체를 맞춤 개발하는 것이 아니라, 자금 부담이 큰 사장님에게 연간 저가 **셀프 AX 준비 기반**을 제공하는 온라인 반복 판매 사업. 전국 온라인이면서 친숙한 동네 단골집처럼 입소문·신뢰·재방문 지향.
- 특정 업무(B: 발주↔명세서 비교) 단일 상품화는 **총괄 제안일 뿐 사용자 승인된 SMAX 정체성이 아님**. 내부 실증 후보로만 취급. `docs/PRODUCT_STRATEGY.md`, `docs/DECISION_LOG_20261025.md`, `docs/BUSINESS_MODEL.md`에 보정 기록.
- **소액 연간 사용권 중심**이라는 방향 외 정확한 연액·무료 체험·한도·환불/갱신 정책은 미확정. 과거 가격표를 확정 요금제로 소개 금지.
- 시장의 초과이윤·사용자 추천·기술 범용성·AI 발전은 가설, 실제 유료 고객/리텐션/원가 데이터 없음. 제품 코드·배포·상표·판매·외부 연락·과금 변경 없음.

## 2026-10-25 사용자 로컬 우선·14일 하드리밋 확정
- 사용자는 **온라인 판매하되 프로그램 실행은 고객 PC 로컬**이라고 명확히 확인. 기존 SaaS/클라우드 추정은 현재 지시와 다름. 문서의 구형 클라우드 방식은 과거 가설로만 보존.
- 사용자는 **개발 실제 착수 후 최대 2주(달력 14일) 초과 시 작업하지 않음**을 명시. 기존 집중개발일 14일/30~50일 유료판 일정은 최신 지시에 부적합.
- **기본 실행의 유료 LLM/API 지출 0원**을 목표로 안내: 규칙·분류 문답/패턴·검증, 미확정 항목 사용자 확인. 로컬 LLM도 기기·속도·패키징 제약이 있어 초기 필수 아님.
- 로컬 정적 브라우저형 대 데스크톱 번들형 비교 후 결정. **코드/판매/공개 배포/패키징 미착수**, 신규 지출·유료 서비스 호출 없음. 출시일·전 기능·연간 라이선스 통제는 미검증.

## 2026-10-25 KST — 연구소형 공식 홈페이지 아이디어
- 신규 사용자 전략: **홈페이지 = 기업·독립 AX 연구소 브랜드 쇼룸 / 영상·애니메이션 기술 시연 / 비전·로드맵 / 전용 비즈니스 문의**, 기본 무료 온라인 도구 제공은 **불필요**. 로컬 실행 상품은 별도로 크몽 등 적격 마켓에서 판매.
- 제품 판매·인증·회사자료 처리는 공식 홈페이지 서버가 아닌 고객 PC/판매 플랫폼 경로로 분리. 임의 기업별 유지보수 대신 공통 제품 업데이트/연구 로드맵에 피드백 반영.
- 설계안 문서: [docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md](docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md). 실제 영상은 **구현 검증된 기능만** 시연. 미개발 로드맵은 '계획'으로 표시.
- 디자인 스킬 후보: `frontend-design` / `web-design-guidelines` / `design.md`, 애니메이션 Motion/Aceternity 참고. 교사에게 배운 정확한 이름은 미확인.
- Vercel Hobby는 개인·비상업용으로 공식 판매/마케팅 배포 불가. **Vercel Pro(유료, 미승인)** 혹은 **Cloudflare 무료 정적 사이트(상업용 가능성·이용약관 별도 점검)** 비교.
- `SMAX`가 GitHub 기준 이름. 사용자의 구술 `SMEX`는 브랜드 변경 확정으로 해석하지 않음. 현재 홈페이지/도메인/이메일/마켓/영상/공개 배포/결제 **모두 미구현**, 사용자 승인 대기.

## 2026-10-25 KST — 브랜치 2개 신설·Cloudflare 선택 확인
- **원격 GitHub에서 확인:** `main`(기존), `backend`(신설), `frontend`(신설). 생성 시 둘 다 `main@6562f8e20594ee031a4b06bf6f55019abd57cfc2`에서 출발했으며 각 헤드 조회 확인. Private.
- **분담 확정:** SMAX 사용자+GPT-6 공동 총괄. GPT-6가 백엔드 로컬 엔진 담당, 프론트/쇼룸은 사용자 디자인 주도+GPT-6 구현 협업.
- **Cloudflare 확정:** 공식 브랜드 쇼룸의 정적 호스팅으로 선택. 계정/프로젝트/실제 Production 생성·배포 **미실행**, 공개 승인·도메인·금전 집행 승인과는 구분.
- 백엔드 예상 **집중 4~6일**, 3개 해커톤과 같은 날 병행 시 **달력 7~10일 가설**. 테스트, API 비용, 데이터/고객, 출시, 라이선스는 미검증. **개발 코드 착수는 아직 하지 않았고 14일 제한 시작일 미확정**.
- 기획 상세: [docs/BRANCH_AND_BACKEND_PLAN_20261025.md](docs/BRANCH_AND_BACKEND_PLAN_20261025.md).

## 2026-10-25 KST — 수요 순위별 자동화 설계 라이브러리와 유료 설정 지원
- **새 창업자 제품 방향:** 특정 2개 업무가 끝이 아니라, **구매자 수요 조사로 우선순위를 검증**해 사장님들이 자주 요청하는 AX 자동화 유형을 하나씩 템플릿 라이브러리에 추가. 기존 '공통 AX 표준화 엔진'은 유지하고 각 자동화 유형별 분류 질문/자료 계약/예외/AI 구축 단계 명령/검증표를 제품화.
- **고객 2부류:** (1) SMAX만 구매해 외부 AI 지침에 따라 스스로 구축, (2) 설정이 어려워 사용자가 별도 **유료 원격 설치·연동·표준 자동화 1개 구현**을 요청. 후자는 가능성/상품 가설로, 가격·구축 기간·계약·실제 판매 승인/운영은 아직 없음.
- 초기 조사의 공개 근거: KDI/중소벤처기업연구원 단계별 디지털화 분야, 대한상공회의소 AX 인력 부족/단계별 지원, 크몽에서 공개된 '설계'와 '구축' 분리 가격 사례. **전국 자동화 수요 1위부터 N위 통계 아님**. 별도 구매자 원문 최소 30~50건 검증 필요.
- **사업 가드레일:** 기본 프로그램의 합의한 버그/공통 개선은 무료 지원 방향을 별도로 고지. 고객별 신규 세팅은 별도 명세·가격·횟수로 제한. 크몽 고객 외부 직접 결제 유도 금지, 고객 비밀번호/API 키 직접 입력, 민감정보 수신 금지, 개인정보 처리위탁 여부 별도 검토.
- 새 문서: [docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md](docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md). **오늘은 시장 예비조사+문서만**. 유료 구축·고객 접촉·실서버·실판매·기능 코드/테스트 없으며 14일 개발 상한 유지.

## 2026-10-25 KST — SMAX Setup 구축 실패 100% 환불 원칙
- 창업자 결정: 고객별 구축 경험이 없는 초기 상태의 실패 위험을 인정, **계약 시 정해진 성공 테스트를 달성하지 못한 유료 Setup 작업은 구축 지원비 전액 환불**. 판매 시도 전 성공/실패 기준·작업 범위·외부 도구 요금 분리·고객 검증 절차·플랫폼 환불 정책을 문서화.
- 단순 고객 변심·추가 요구사항·권한 미제공은 구축 기술 실패와 구분하되 법정 환불 권리·크몽 등 판매처 정책은 준수. 외부 AI/앱 구독료는 사전 동의 후 고객 직접 결제하므로 전액 환불 보장에 포함하지 않으며 안내 필수.
- 일괄 구현 보장/입증되지 않은 전문성 과장 금지. 먼저 소규모 샘플·합성데이터 테스트와 사전 기술 검토 후 수주 여부 결정.
- 근거 문서: [docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md](docs/AX_USE_CASE_RANKING_AND_SERVICE_TIERS_20261025.md#6-2026-10-25-창업자-확정-운영-원칙--구축-불가-시-환불). 실제 거래/고객/환불 처리/제품 코드 작업 없음.

## 2026-10-25 KST — 직접 구축 대행 중단, SELF+GUIDE 5만/5만
- **최신 창업자 의사 우선:** 회사 업무 설명/파일 정리·AX 표준화·AI 인계 및 외부 자동화 구축은 **사장님이 직접**. SMAX가 고객 데이터를 받아 회사별로 처리·실구축하면 셀프 AX 취지와 보안/소요시간이 무너지므로 초기 **구축 대행을 하지 않음**.
- 상품: SMAX SELF **희망판매가 50,000원**; 막힌 n8n/Google Sheets/AI 구축 단계별 교육·비동기 문자 코칭 SMAX GUIDE **추가 50,000원**, 합산 100,000원. 5만 원의 이용권 기간·갱신은 미정, 실제 거래/등록·매출 없음.
- GUIDE는 설계된 1개 작업의 **고객 스스로 해결하도록 안내하는 도움**으로, 전화/영상통화/현장·고객 PC 원격접속·원본 자료 수집·계정 로그인 대행·무제한 질의·최종 자동화 완성 보장 없음. 응답/질문 상한 예시 7일·3건·영업일 1~2일은 **총괄 제안(창업자 미확정)**.
- 직전 정책의 **'SMAX Setup 구축 실패 시 100% 환불'은 직접 구축 대행이 존재할 경우의 조건**이었고 현 제품 구성에서는 **비활성/보류**. 가이드 미제공·약정 불이행 환불은 현행 법령과 플랫폼 기준, 고객 본인의 구축 실패 자체를 가이드 공급자 무한책임으로 변경하지 않음.
- 기준 설계: [docs/SMAX_SELF_AND_GUIDE_MODEL_20261025.md](docs/SMAX_SELF_AND_GUIDE_MODEL_20261025.md). 14달력일 하드리밋, Private GitHub·고객 PC 로컬·Cloudflare 정적 쇼룸 유지. 이번에는 기획 문서만 변경, 고객/코드/실배포/외부 지출 없음.

## 2026-10-25 KST — 공식 웹 호스팅 비교 및 비즈니스 문의 제거
- **최신 지시:** 홈페이지의 비즈니스 문의 이메일/문의 폼은 초기 단계에서 제거. AX 연구소 소개·기능 시연·사용예·계획/비전 공개는 유지하고 **크몽 정식 구매 링크 하나로 판매 연결**. 구매 링크는 유효한 상품 생성 전 미생성.
- Cloudflare 정적 호스팅 채택 유지. Vercel도 동일한 디자인·모션·시연 기능을 구현할 수 있고 CDN/HTTPS/WAF가 있으므로 'Cloudflare에만 있는 필수 웹 디자인 기능' 주장은 금지. Cloudflare의 무료 상업용 정적 호스팅, DNS/보안·추후 Workers/D1/R2 확장성의 실용성에 근거.
- 향후 별도 도메인/DNS나 서비스에 홈페이지 디자인을 재사용할 수 있지만, DNS가 자체 서비스 기능을 생성하는 것은 아님. 정적 프론트만 공개, Private GitHub 내부 전략/고객 데이터 노출 방지.
- 비교/수정 사항: [docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md](docs/BRAND_LAB_SHOWROOM_PROPOSAL_20261025.md) 7절. **코드·Cloudflare 프로젝트·배포·등록/고객·지출 미실행**.

## 2026-10-25 KST — 자동화 사례 TOP10 실제 시연 쇼케이스 계획
- **창업자 신규 홈페이지 방향:** 기존 AX 사용 사례 **10가지를 공식 쇼룸의 클릭 가능한 카드로 모두 소개**, 실제 사장님 요청·입력자료·SMAX 표준화 산출물·외부 AI 구축 명령·단계별 테스트 방법과 실제 가능한 결과를 시연.
- 10개는 **전체 시장 수요 확정 순위가 아닌 이전 조사에 근거한 잠정 검증 후보**. 고품질 UI/모션은 프론트엔드 디자인 주도, 각 카드의 샘플 출력·검증 근거는 백엔드가 담당.
- **실제 구현 범위 구분:** 10개 자동화의 실제 외부 연동/실행이 완료됐다는 뜻은 아님. 10개 템플릿·가이드를 목표로 하고 **일부(처음 1~2종)는 실행·로그·합성 입력/출력으로 확인한 영상**을 만든 뒤만 '실제 작동' 표기. RAG는 아직 설계/인계에 국한.
- 새 상세 기획: [docs/TOP10_AUTOMATION_SHOWCASE_PLAN_20261025.md](docs/TOP10_AUTOMATION_SHOWCASE_PLAN_20261025.md). 고객 자료 업로드/무료 클라우드 시연/문의 폼/별도 서버 없음; Cloudflare 정적 쇼룸과 크몽 정식 구매 링크 정책 유지.
- 이번 작업은 **기획 문서만 추가**. 기능 구현/영상 녹화/Cloudflare 공개/크몽 상품 등록/신규 비용 없음. 실제 개발 시작일 미확정; 14일 한도 유지.

## 2026-10-25 KST — 백엔드 우선 P0-P10 작업 계획 수립
- **창업자/총괄 분담:** 사용자 사업기획·로컬 UI/대시보드/정적 쇼룸 디자인 구상; GPT-6 백엔드 스키마·규칙·10개 템플릿·로컬 테스트.
- 일정/작업표 P0 기획 → P1 스키마·계약 → P2 결정론적 규칙 엔진 → P3 10개 업무 템플릿 → P4 외부 AI 인계 프롬프트/단계별 학습 자료 → P5 CSV/XLSX/안전/회귀 검증 → P6 로컬 UI → P7 10개 카드 쇼룸 → P8 Windows 패키징/통합 → P9 출시 게이트 → P10 장기 버전 확대.
- 사용자 목표 v1.0 **검증된 안내 템플릿 10종**, 이후 50→100→1000종 추가. **실제 고객 자동화 10종을 SMAX가 실행한다는 뜻 아님.** 출시 후 v1.0.1/1.0.2로 작은 수정. 첫 1~2일은 골격 구현 목표일 뿐 판매 품질 완성 보장 아님.
- **아키텍처 재확인:** 별도 AI 안 쓰는 **고전적 전문가 시스템/규칙 엔진 + 템플릿 지식 라이브러리**. '로직의 RAG화'는 검색·선택·조립 비유이며 LLM 생성형 RAG는 아님. 모호한 자유문장은 반드시 추가 질문. Python 대신 JS/TS 로컬 코어 우선.
- 상세: [docs/SMAX_V1_EXECUTION_PLAN_20261025.md](docs/SMAX_V1_EXECUTION_PLAN_20261025.md). 첫 코드 착수일부터 14달력일 제한; 지금은 원격 **기획 문서** 작업만. 실코드/테스트/클라우드 배포/크몽 판매 없음.

## 2026-10-25 KST — 템플릿 매칭형 AX 데이터 표준화 확정
- **창업자 승인:** 무제한 자유입력 데이터 분석 대신 고객이 **업무 유형 선택/템플릿 매칭 → 로컬 CSV/XLSX 표준 필드 후보 매핑 → 규칙·빈칸 질문 → 사용자 확인 → 표준 AX 산출물과 외부 AI 구축/교육 지침**을 받는 구조. 백엔드는 공통 엔진·템플릿 지식·고객 로컬 매핑을 분리.
- v1.0은 10개 검증 템플릿과 학습 흐름, 이후 50→100→1000개 추가가 가능한 콘텐츠 구조. 외부 자동화 실제 계정 연동·만능 자연어 AI 이해를 뜻하지 않음. 미확인 정보/불명확 열은 NEEDS_REVIEW.
- 최신 정식 설계: `docs/SMAX_V1_EXECUTION_PLAN_20261025.md` 8절, `HANDOFF.md` 마지막. **현재 작업은 기획 문서 업데이트**이며 엔진 실행·테스트·배포/판매 미착수, 14일 개발 하드리밋 시작일 미지정.

## 2026-10-25 KST — 참여형 AX 교육·실습 플랫폼 사업 방향 확장
- 최신 창업자 방향: **고객 참여형 + 교육형 + 셀프 AX 실습형** 홈페이지/로컬제품. 10종 상세 자동화 안내·학습 사례 + 원하는 템플릿 **무료 요청** + 공통 채택 템플릿 **무료 추가/함께 사용** + 요청/제작/검증/출시 상태 및 실제 집계한 인기 지표.
- 고객 기업의 원본 데이터/내규/개인정보/인증키 수신하지 않고, **업무 패턴만 일반화한 지식 콘텐츠** 축적. 모든 요청 채택/개발기한/무제한 무료 구축 보장 금지.
- Cloudflare 정적 쇼룸에 실제 요청 접수를 하려면 Worker·안전한 저장/운영 등이 필요하므로 첫 14일 내 미구현이면 '예정'으로만 표시. 인기 순위는 실제 사용데이터 없으면 '우선 소개' 표현.
- 신규 기획: `docs/COMMUNITY_TEMPLATE_LIBRARY_20261025.md`. 제품·웹 실제 소스/요청 접수/고객/결제/배포/코드 착수 전부 아직 미실행.

## 2026-10-25 KST — AI API 없는 스마트 템플릿 검색 설계
- 사용자 구상: 대시보드에 대충 자연어로 검색해도 적합한 템플릿을 찾아주는 **스마트 검색**과 챗봇처럼 확인 질문을 주고받는 UX. AI 모델 없이 Python 또는 JS 로직을 미리 넣는 것이 간접 AI 사용인지 질문.
- 기술 설명: **AI로 개발한 규칙 검색 프로그램**은 런타임에 AI 추론하지 않음. v1.0은 **한글 동의어·키워드·오타/문장 유사도 + 후보 랭킹 + 구조화된 추가 질문 상태머신**. 상위 3개/매칭 불확실 시 고객 선택 또는 '무료 템플릿 요청'. 로컬 임베딩 의미 검색은 외부 유료 API 없이도 가능하지만 실제 모델 런타임·메모리/성능/라이선스가 필요하므로 후속 선택기능.
- 템플릿 검색 후 CSV/XLSX 필드 매핑과 AX 표준화/AI 구축 명령어 흐름으로 연결. 홈페이지 카탈로그 검색은 공개 메타데이터만 사용; 고객 PC 실자료 서버 송신 금지. 정확도나 검색 점수를 검증 없는 확률로 표기 금지.
- 기획 파일: `docs/SMART_TEMPLATE_SEARCH_DESIGN_20261025.md`. 실제 코딩·테스트·Cloudflare 게시·AI 호출 없음. 최초 코드 착수일 미지정, 14일 상한 유지.

## 2026-10-25 KST — 개발 착수 D1
- **개발 착수일 2026-10-25 / 14달력일 마지막 2026-11-07**. 사용자가 '일단 만들자, 크몽에 올리자'라고 실제 개발 시작 지시.
- 오프라인 템플릿/한글 유사표현 검색/CSV 해석/누락 질문 포함 로컬 규칙 엔진 초기 코드 착수. 동작 가능한 10종 템플릿 메타데이터, 합성 테스트 작성. 클라우드·크몽 등록 별도 과정.
- 실제 Windows 패키징·고객 검증·외부 연동·Cloudflare 실제 게시/크몽 판매는 미실행. 14일 한도 자동 연장 금지.

## 2026-10-25 KST — D1 프론트+코어 첫 코드 통합
- 코드 현황: `site/index.html`, `site/styles.css`, `site/app.mjs`, `site/templates.mjs`, `site/core.mjs`, `wrangler.jsonc`, `tests/core.test.mjs`, `README_LOCAL.md` 실제 작성. 대시보드 2패널, 10종 카탈로그, 규칙 검색, 질문선택, CSV(최대 2MB) 헤더 분석/수동 매핑, JSON 설계·Markdown AI 인계 가이드 다운로드 첫 구현.
- 실제 검증(연결된 GitHub 파일 텍스트에 대해 자체 V8 함수 호출): 핵심 검색/분류·CSV/누락 상태 9항, UI HTML 문자열 스모크 10항 통과. 초기 JS 파서 SyntaxError를 수정하고 **문법 통과 확인**. **Node의 `npm test` 직접 실행 및 Chromium/Windows 브라우저 시각 검증은 아직 미실행**.
- 상용 완제품 아님: XLSX·Windows 독립 설치·API 연결·실거래·Cloudflare 공개 URL·크몽 판매 전부 미완. 프론트에 현재 '설계 가이드 초안/상품 등록 준비 중' 안내와 실제 데이터 서버 업로드 금지 보안 설정 포함. 마케팅 소재는 `docs/KMONG_LISTING_DRAFT_20261025.md` 초안.
- **개발 시작 2026-10-25 / 개발 상한 2026-11-07**. 종료 게이트를 자동 연장하거나 정식 판매 가능 판정으로 바꾸지 않음.

## 2026-10-25 KST — 최상위 운영 결정: SELF 지금, WEB 나중
- 창업자 지시 **"이거 훗날 추가할까 처음 만들 때 같이 할 거니" → SELF 먼저·WEB 2차 제안 수락 후 "오키 그렇게 깃헙 수정 ㄱ"**. 확정: 1차 **SELF**(템플릿 10종 규칙형 데이터 표준화·스마트 검색·챗봇형 질문·AI 구축 가이드 + 테스트 가능한 로컬 완성형 1~2종 목표), 선택 **GUIDE** 텍스트 튜터. **2차 WEB**은 템플릿별 돈 내고 로그인해서 즉시 사용할 수 있는 완성형 웹 앱으로 별도 개발.
- 기술 준비: 공통 템플릿 ID·버전·입출력 스키마/검증 코어는 공유, 모듈 재사용 설계. **WEB 계정/권한·서버측 entitlement·결제/기간/동시접속·웹 처리 API/고객 DB는 이번 14일 1차 구현 범위에 포함하지 않음.** WEB 가격 및 유지비는 미정. Cloudflare/Vercel은 서비스 배포 수단일 뿐 주소 공유 방지 권한을 자동 제공하는 것은 아님.
- **최우선 무료/유료 공개 분리:** `site/` 안에 이미 코어 및 브라우저 CSV/AX 출력 실행 기능이 들어 있음. **그대로 공개하면 무료로 유료 기능을 이용/코드 복제할 수 있으므로 공개 배포 전 제품 코어와 데모 분리 및 실제 기술 검증 필수.** 현재 판매/Cloudflare 공개 미착수.
- 상표 후보 `SMAX Square`의 기존 유사 등록/사용 여부 미확인. 기존 PRIVATE `hibi89/SMAX` 3브랜치 유지.
- 기준 문서: `docs/SELF_WEB_ROADMAP_20261025.md`; 개발 시계는 **2026-10-25 시작/2026-11-07 포함 마감**, 연장 없음. **이번 변경은 기획·인수인계 문서만**; 실코드/웹 유료화/서버/결제/계정/크몽 상품 기능 변경하지 않음.

## 2026-10-25 KST — 맥콩 탄생 및 2개 광장 UX 방향 확정
- 창업자 확정 공식 마스코트명 **맥콩** (스돌이·맥콩·셀리 중 선택). **사용자가 올린 새싹·보라 헤드폰·하늘색 얼굴테두리의 연보라 3D 로봇 이미지**를 공식 디자인 기준으로 확정; 이전 다른 로봇 디자인/홈페이지 이미지 시안은 그대로 보존. 실제 제작용 원본 파일·권리 검증은 별도.
- SMAX² / SMAX Square의 **Square는 고객이 참여·공유하는 광장**, ²는 재사용과 확산·가속. 필수 영어 풀네임 Multiplied 아님.
- 홈페이지 진입은 **사장님 광장(현 1차 SELF, 템플릿 10종)** / **학생·학부모 배움의 광장(장기 교육 계획, 준비 중)** 으로 쉽게 선택하게 설계. 1차 가입 강제하지 않음. 향후 회원가입 개발 시 용도별 관심사 선택과 복수 이용 지원.
- 어린이 회원가입·교육 콘텐츠·로그인/DB·WEB 유료 실행은 **현재 14일 MVP 범위 밖**. 법정대리인 동의/연령대별 보호와 개인정보 등은 후속 운영 전 검토.
- 상세: `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md`. 이번에는 브랜드·디자인 문서 기록만, 실제 퍼블릭 사이트 수정/배포 또는 실고객 가입/판매 없음.

## 2026-10-25 KST — 1차 홈페이지 크몽 거래 분리 및 향후 기능 게이트
- 공식 정책 확인: 크몽은 **직접결제 유도/실행을 제재**하고, 크몽 고객을 개인 사이트로 보내 별도 거래 권유하는 사례를 금지. 독립 홈페이지 자체가 자동 제재 대상이라는 의미는 아님. 공식 근거/운영 정책 문서: `docs/SITE_V1_KMONG_FUNNEL_AND_FUTURE_ZONES_20261025.md`.
- 창업자 위임에 따라 **1차 사장님 존** 화면은 템플릿/이용법/광장 소개/상품 안내만 유지, 사이트 결제·회원가입·수주 플랫폼·학생 교육 실제 콘텐츠는 후속 단계. 현재 등록되지 않은 크몽 구매 URL은 생성하지 않음.
- `site/index.html`: SMAX² Square 브랜딩, 사장님 존 표기, ‘상품 안내’ 앵커 메뉴, 확정되지 않은 SELF/GUIDE 공개 예정가 제거, ‘크몽 상품 준비 중·현재 구매 불가’ 표기. 결제/가입 버튼 또는 플랫폼 외 직거래 채널 없음.
- **사이트의 CSV/설계서 생성 코어는 계속 PRIVATE 프로토타입 안에 있으며 공개 배포 금지:** 유료/무료 분리 전 `site/` 전체 Cloudflare 배포 불가. 맥콩 디자인 원본 자산 아직 미등록, 이미지 목업은 실제 서비스 UI 아님.
- 이번 작업은 **웹 코드의 정적 소개문구 + 기획문서** 수정으로, 기능 구현/크몽 판매/클라우드 배포가 아님. 1차 SELF 목표 마감 **2026-11-07** 유지.

## 2026-10-25 최신 미션 — 저렴한 AX 대중화·창업자 운영 유지
- 창업자 최신 결정: **SMAX² Square는 저렴하고 접근하기 쉬운 AX로 대중화를 가속하는 참여형 광장**. 단기 수익·회사가격보다 실용성, 접근성, 지속가능한 공급을 우선. 'Square'는 광장, ²는 확산·가속.
- 처음 언급한 2~3년 내 기업가치 50억~100억은 희망 목표일 뿐 검증된 평가가 아니고, **엑싯/M&A는 최신 운영 목표에서 제외**. 소유·서비스 철학을 지키며 육성하자는 창업자 최종 결정 반영.
- 근거·운영 원칙: `docs/FOUNDER_MISSION_AND_OWNERSHIP_20261025.md`. 1차 사장님 존 SELF, 크몽 거래 분리, 학생 존 등 후순위, 11-07 개발 마감은 변경 없음.

## 2026-10-25 — SMAX² 집중 스프린트 우선순위 동결
- **창업자 최신 결정:** 3개 해커톤 대비 **2026-11-07까지 SMAX² 사장님 존/SELF를 최우선 개발**. 해커톤들은 기존 코드·문서를 이용해 이후 각 대회 마감 직전 집중 완성하되, 외부 필수 자료/승인·제출요건 리스크는 사전 점검. 공식 마감·대회 약관은 해당 프로젝트 소스 기준 재확인.
- 완료 기준: ① 실제 로컬 업무 처리 기능 최소 1종 + 검증 테스트 ② 10종 설계/교육 템플릿을 설명하는 사장님 UX 및 맥콩 안내 ③ 공개 미리보기와 유료 SELF 코어/패키지 경계 ④ Node/브라우저/Windows 환경 가능한 검증 ⑤ 크몽 상품 준비 및 실제 판매 전 출시 게이트.
- 새 범위 추가 금지: WEB·학생 존·수주의뢰·고객 DB·웹 자체결제는 1차 개발에서 제외. 가용 기간은 **2026-10-25~11-07 달력 14일**, 자동 연장 없음.
- 구체적인 우선순위·일정: `docs/SMAX_FOCUS_SPRINT_20261025_NOV07.md`. 현재 GitHub 업데이트는 전략/우선순위 정리이지 기능 출시나 플랫폼 배포가 아님.

## 2026-10-25 KST — 스총/해총 역할 독립 + 한 문장 영구 복원
- 사용자가 **스총(이 저장소 전담 제품·기술·출시 총괄)**과 **해총(별도 해커톤 통합 상황실 감독)**으로 GPT-6 역할을 최종 분리. 스총은 해커톤 3개를 직접 감독하거나 수정하지 않는다.
- 정확한 새 채팅 문구 **`너는 스총이다 레포지토리보고 작업이어가셈`**. 최신 재개 문서 `CHAT_BOOTSTRAP.md` 및 목표/역사/범위/기술/현재 증거/다음 실제 작업 `docs/STECHONG_CANONICAL_CONTEXT_20261025.md`; 구형 부트스트랩 백업 `docs/history/CHAT_BOOTSTRAP_PRE_STECHONG_20261025.md`.
- 2026-11-07까지 사장님 존 SELF에 집중. 실제 CSV 변환 1종 검증 → 공개/유료 분리 → QA/패키징. 대외 출시/실판매는 아직 없음.
- 이번 커밋은 **역할·부트스트랩·인수인계만** 갱신. 실 제품 추가개발·Node/Windows 실테스트/외부 배포는 진행하지 않음.


## 2026-10-25 KST — 스총 실행 1: SELF 실제 CSV 변환 로컬 코어 (backend)
- 작업 브랜치: `backend`; 통합 `main`과 `frontend`는 **미수정**, 실제 공개 배포/크몽 게시 없음.
- 기능: `site/csv-transform.mjs` 신규. 사람 승인 원본 열(date/item/amount)만 처리해 **표준 CSV 문자열을 실제로 생성**, 입력 레코드를 제거하지 않음. 날짜/원화 금액 제한 정규화, 원본 레코드 순서·번호, 결측/중복/형식오류/수식 위험을 `NEEDS_REVIEW`로 보존 및 표시. 오류 CSV/동일 열 중복매핑/2MB 초과는 예외 처리.
- 검증: 로컬 Node.js v22.16.0 `node --check` 2개 구문 통과; `node --test tests/csv-transform.test.mjs` **10 PASS / 0 FAIL**(합성 골드 입력 및 예외). 원격 Git blob SHA가 로컬 `git hash-object`와 2파일 모두 일치: 코어 `5b87530f0a394122a25b3a1a61f889b03bbdbeea`, 테스트 `5f2dda8d096c4e9ffd38797471f81ad267dbd0bf`.
- GitHub 소스 커밋: `4d5e100fe77c912fad9ebc84f72552d8fe9dc6b1`; 테스트: `ae5c78a88dc3cf6ddc4c99aa7749b6d25988693f`; 계약 문서: `74652a81febf5f4de0b87056e76165522326f79a`. 최종 원격 HEAD는 문서 갱신 후 다시 조회.
- 경계: **프론트 업로드 UI와 변환·다운로드는 아직 미연결**. 기존 10종 검색/설계서 흐름·원본 데이터 불변. 기존 `tests/core.test.mjs`와 통합 `npm test` 재실행, 실제 브라우저/Windows/고객/보안 펜테스트 모두 **미검증**.
- 상세 계약: `docs/CSV_TRANSFORM_CONTRACT_20261025.md`. 다음 1작업: 고객이 확인한 매핑 → 변환 미리보기/검토 표시 → 로컬 결과 CSV 다운로드 UI. 공개 사이트와 유료 코어 분리 이전 Cloudflare 배포 금지. 14일 스프린트 **11월 7일 마감** 유지.


## 2026-10-25 KST — 스총 CSV 안전성 보강 (core)
- 실제 Local Node 22.16.0에서 추가 경계 사례 발견: 연도 `0000`이 잘못 정상 날짜 처리되고, 일부 zero-width/format 문자 뒤의 CSV 수식형 텍스트가 공식 검사 범위에서 빠졌음.
- `site/csv-transform.mjs`에서 `y < 1` 날짜 거부 및 앞단 형식 문자 `U+200B~200D/U+2060/U+FEFF/U+00AD` 안전 인용 처리 추가. 레코드 자동 삭제/병합/네트워크 동작 없음.
- `tests/csv-transform.test.mjs` 회귀 2건 추가(backend 자체 12 tests). `tests/csv-hardening.test.mjs` 독립 검수 2건 추가. 해시 동일 실제 로컬 Node `node --test tests/*.test.mjs` 14/14 PASS.
- Core Git blob `2b004fb9474743a95294b42baf7f875602644a54`, hardening tests `9756435b6cdb0b3b968bd86339e83b7e63743948`. 해당 변경을 frontend에도 동일 Blob으로 미러링. 전체 앱/npm test/실 Windows QA/크몽 판매까지 검증한 것은 아님.

## 2026-10-25 KST — CSV seed 기반 합성 데이터 속성검사 추가
- `tests/csv-property.test.mjs` 신규: 고정 seed(0x12AB34CD)로 생성한 CSV 256건 각각에 대해 원본 레코드 수 보존·출력 행수·검토행 합계·BOM·동일 입력 반복 결과 일치를 검사. 고객 실자료/외부 API 없음.
- 별도 변형 1,600건 fuzz 처리도 로컬 Node v22.16.0에서 행 손실 없이 완료. 단 이는 매번 자동 CI에 포함된 것은 아니며 새 고정 seed 256건만 상시 회귀 대상.
- 이번 실제 Node 테스트 `node --test tests/*.test.mjs` **15 PASS/0 FAIL**, 로컬 코어 blob `2b004fb9474743a95294b42baf7f875602644a54`, 새 테스트 blob `2adecd598ae29da22c9d2f34ae8ec1c1d32e134c` = GitHub 원격 동일.
- frontend의 제품 전체 테스트와 HTML 실제 빌드/Windows 브라우저 E2E는 여전히 미검증.

## 2026-10-25 KST — 스총 후속 작업 / 매출 일·월 집계 로컬 코어
- **실제 작업:** 기존 `site/csv-transform.mjs`의 검증/검토 판정을 이용한 `site/sales-report.mjs` 추가. 사용자가 판매일·판매채널·판매금액 열을 지정하고 집계 주기(`daily` 또는 `monthly`)를 선택. 원본 CSV 모든 행 유지; 이상/중복/결측/수식/과대금액은 **제외 이유가 담긴 별도 검토 CSV**로 내보내고 총계의 입력/반영/제외 건수 기록. 외부 송수신 0, 사람 검토 전 잠정 보고만 허용.
- **설계 비교:** 원본 헤더 자동 추론 집계(A)는 잘못된 열/금액 합산 위험. 검증된 기존 정규화+명시 매핑+review 분리(B)를 선택. 금액은 `BigInt` 고정 소수점(소수 두 자리)로 합산. 양수와 음수조정은 별도로 표기하며 음수를 임의 반품 처리하지 않음. 정수부 12자리를 넘는 금액은 검토 대상으로 분리.
- **실측 검증:** 실제 Node.js **v22.16.0**에서 원격과 동일 blob인 `site/csv-transform.mjs` `2b004fb9474743a95294b42baf7f875602644a54`, 신규 `site/sales-report.mjs` `01050c8d3a3dd6a1f548d37484112aa7bd99b924`, `tests/sales-report.test.mjs` `4732565887cd2e3f007bb7b03a6e271e4520d159` 로 `node --test tests/sales-report.test.mjs` **7 PASS / 0 FAIL** (일별/월별·고정소수점·중복/오류행 제외·12자리 상한·잘못된 열 매핑·인용 부호·재현성).
- **원격 코드:** `backend` 브랜치의 새 코어 `4c497d4f1a1c189692c83294f63124787c3d489b`; 회귀 테스트 `c2ffd622a8f2ec6b36c303076cd3f72ea8c586fa`; 계약 문서 `docs/SALES_REPORT_ENGINE_CONTRACT_20261025.md` 커밋 `8b8e1d6fb36f180951edc2a77f1561f9c59c7f1b`. 기존 CSV 변환/10종 검색·기존 frontend 기능 변경 없음.
- **제한/미검증:** 전체 backend 테스트/프런트 제품 전체 회귀는 이번 작업에서 NOT_RUN. `frontend`의 매출 집계 버튼/다운로드 연결 및 오프라인 HTML 패키징·Windows Edge/Chrome E2E는 미구현/미검증; **두 번째 고객용 완성 도구 출시 아님**. 세금/회계 신고·실사용 정확성 근거 아님.
- **다음 작업:** 판매 템플릿 UI에 일·월 주기/3열 수동 매핑/잠정 합계·제외행 두 CSV 내려받기, 변경 시 이전 결과 무효화 연결 → 번들러/테스트 업데이트 → 전체 Node/Chromium·가능한 Windows QA. `main`/공개 Cloudflare 배포·크몽 판매·실고객 데이터 접근 금지, 2026-11-07 마감 상한 유지.

## 2026-10-25 — CSV serializer namespace hardening
- Offline SELF builder concatenates modules into one JavaScript scope. Both spreadsheet and sales modules declared top-level `toCsv`, allowing silent shadowing. Renamed **only sales private serializer** to `toSalesReportCsv`; no public API/output/schema changes. Backend and frontend now share identical source blob `17796cd0e44095512b61303045dffa582fe06162`.
- Backend commit `6e57867f0b5f16f8a5422e436e5431568f1ceab1`; frontend matching commit `1c0368e88e2597a5e0c09b41119b5f9fda1f2998`. Local actual Node v22.16.0 `/mnt/data/smax_sales_work` `git hash-object site/sales-report.mjs` matched remote and `node --test tests/*.test.mjs` **8/8 PASS**.
- Latest frontend has now connected sales workflow; old handoff text describing sales UI as unimplemented is historical. Whole frontend `npm run qa:release` and real Chromium/Windows E2E remain **NOT_RUN**. No main merge/public launch.

## 2026-10-26 KST — 스총: 주문번호 다른 거래의 오중복·매출 과소집계 보정
- **실제 버그 재현:** 기존 `normalizeSpreadsheetCsv`가 날짜·품목/채널·금액 **선택된 3열만** 중복 키로 사용. 서로 다른 주문번호 `ORDER-001`/`ORDER-002`를 가진 2건도 `DUPLICATE`로 표시해, `buildSalesReport`에서 한 건이 제외될 수 있음을 원격 실제 코드 V8 실행으로 확인(수정 전 2건 중 1건 오중복).
- **안전한 최소 수정:** `site/csv-transform.mjs` 중복 키에 **매핑한 3열의 표준화 값 + 미선택 원본 열 전체**를 포함. 이미 지원하는 3열만의 동등일/금액 정규화 중복 판정 보존, 주문 ID가 다른 행은 별개 거래로 유지. 이전 결과 행 삭제/원본 수정/외부 전송 없음. `sales-report.mjs` 로직 불변.
- **변경 Git 커밋:** `backend` 코어 `a50753c2f445c7c7b61f6e31707c5c8d579688aa`, CSV 회귀 `479bb8a80a3b99dbaa739c2f43d3033f37d678ba`, 매출 회귀 `66ff93fec4e7aef3489b903d464de13badda4ff7`; `frontend` 코어 `dc0cc63b08c78152607d46049ec230dcc92b754f`, CSV 회귀 `7d0a47d908f049bfcba52417ea83556c4c9c557a`, 매출 회귀 `6d8e1c04451c03a5a407e7fe02b9f3c4c31cf596`. `backend` 중복 계약 `2478cf6ab83722685d60424f1983106a61c15d94`; `frontend` 고객 가이드 `448d2dc0209964d60166e02e6467e35f9477935a`.
- **검증 범위:** 변경 뒤 GitHub에서 다시 읽은 **실제 2개 코어 소스**로 V8 함수 평가하여 backend **5/5 PASS**, frontend **7/7 PASS**. 주문번호 A/B/B → 정리행 3 유지/중복 1, 매출 반영 2·제외 1·합계 200.00, 구형 3열 정규화 중복 유지, frontend 기존 4행/검토2 + 매출 5행/제외3/79.90 샘플 유지. 새 Node 테스트 코드를 커밋했지만 `node --test`나 최신 `npm run qa:release` 전체 실행 **NOT_RUN**. V8 검사용 TextEncoder 바이트 길이 폴리필 사용(2MiB 경계 시험 아님).
- **잔여 위험:** 주문 ID 등 고유 식별 열이 **없는** 동일 3열 거래는 여전히 중복 의심으로 분류/매출 잠정 집계 제외될 수 있음. 실제 중복 판정은 자동 회계 확정이 아니므로 review CSV로 고객 재검토 필수. 브라우저/Windows 최신 QA, 디스크 빌드 SHA/CSP, 배포·판매 전부 **미검증/미실행**.
- **보존·다음:** `main` 무수정. `backend`·`frontend` 기존 Git 이력 보존, 강제 병합/리셋·외부 API/고객자료·지출 없음. 다음 P0는 승인된 최신 소스 전체 checkout에서 `npm run qa:release` 실제 PASS 및 HTML SHA/CSP → Chromium `file://` → Windows Edge QA. 개발 마감 **2026-11-07** 변동 없음.

## 2026-10-26 KST — 스총: 금액 문자열 변형에 의한 중복 판정 누락 수정
- **재현/원인:** 동일 날짜·품목·금액 `100`/`100.00`/`0100`이 기존 원시 금액 문자열 기반 키에서 **서로 다른 거래로 판정**돼 잠정 매출 중복 반영 가능. 실제 원격 기존 `frontend` 변환기에서 중복 0건 재현.
- **수정:** 금액 표기만 중복 식별용으로 소수점 두 자리 문자열 정규화(`100`=`0100`=`100.00`=`₩100원`; `0`=`-0.00`). 부동소수점/BigInt 변환 사용 안 함. 출력 금액 원문 포맷과 모든 원본 레코드 보존. 기존 추가 원본열/주문번호 구분 로직 유지. `backend` 코드 `c93e71eac0ca70fe860fb5803d4d613847a83cf9`, `frontend` 코드 `73eb691e70f52a7575b3b28389ecec282c600d25`.
- **회귀 작성:** CSV: backend `2058b03`, frontend `50e23b8`; 매출: backend `cddef25`, frontend `a27aa4d`; frontend 오프라인 UI `63d24b3`. 테스트 도중 backend에 없는 `reviewCsv` 반환을 잘못 가정한 **테스트 자체 결함** 수정 `6e6d4d6`; backend 제품 API에 reviewCsv를 무리하게 추가하지 않음.
- **실행 검증:** GitHub 최신 실제 2개 코어를 독립 V8 실행: backend 신규 테스트 함수+256개 결정적 속성 케이스 **4/4 PASS**, frontend 동일 테스트+기존 2개 합성 예제 **6/6 PASS**. 최신 실제 5개 웹앱 모듈/모의 DOM·Blob로 신규 오프라인 매출 UI 테스트 본문 **1/1 PASS**: 4원본, 유효3, 제외1, 순합계300.01, 검토 원본행3, 다운로드 CSV 일치. 이는 **전체 Node 테스트/빌드 SHA/CSP/실제 Chromium 또는 Windows 출고 QA가 아니다**. GitHub Actions 성공 증거 없음.
- **문서:** backend `docs/CSV_TRANSFORM_CONTRACT_20261025.md` `54ceddda`; frontend `docs/SELF_CUSTOMER_QUICKSTART_20261025.md` `9f40357`. `main` 코드 변경/병합, 고객 원본/개인정보·외부 API·배포·판매·금전 지출 없음.
- **다음 P0:** 승인된 최신 전체 `frontend` checkout이 가능한 로컬 환경에서 `npm run qa:release` 실제 Node PASS → 생성 HTML hash/CSP → `npm run qa:browser:node` Chromium `file://` → `QA_SELF_WINDOWS.cmd /edge`. 컨테이너 GitHub Private DNS 차단으로 해당 출고 QA NOT_RUN. 마감 **2026-11-07** 유지.

## 2026-10-26 KST — 스총: 앞자리 0 금액의 실제 규모 기준 잠정 매출 집계
- **실제 결함 재현:** `site/sales-report.mjs`의 `parseCents`가 금액 원문 정수부에 `/^\\d{1,12}$/` 길이 제한을 적용해, **`0000000000001`(1원)** 등 앞자리 0이 12개 이상 포함된 정상 금액도 `AMOUNT_EXCEEDS_REPORT_LIMIT`로 잘못 제외. 실제 독립 V8 검증에서 `0000000000001`은 제외, `1`은 포함됨을 확인.
- **수정:** backend/frontend의 동일한 `site/sales-report.mjs`을 변경해, 통과된 화폐 문자열에서 부호·소수 부분을 분리한 다음 **앞자리 0만 제거한 정수부의 유효 자릿수(최대 12)**로 상한을 판단. 계산은 기존 BigInt 정수 센트 방식 그대로, 1조 원 이상의 실금액 제외 유지, 원본 CSV 금액 표기는 변경하지 않음. `backend` commit `5be429c2f4e06771d2b3a7681292351d5565fc86`, `frontend` commit `f123a74f0b3d4b995304be505eb7843377618286`; 두 코드 blob 동일 `05578b300b2d7c2f0b653a485ac9c2c859ea055e`.
- **회귀:** `tests/sales-report.test.mjs` 양 브랜치에 검증 추가: 6개 원본 중 앞자리 0이 긴 유효3건 포함, 동일 주문 표기 1건 DUPLICATE, 실제 초과2건 제외. 잠정 순합계 **0.20원**, upper padded `000999999999999.99` 허용, 초과는 제외. backend commit `9672ea31932fe8454bd17d45bb66fa2efd9b92ce`, frontend `912fa18e9ca410f76514d7bc4e0bbf0081bb3b5c`.
- **실행 검증 경계:** 각 브랜치 최신 실제 코어+테스트 함수 4종(기본 일별·실제 큰금액 차단·금액 표기별 동일 주문 중복·앞자리 0 신규 케이스)을 독립 V8 호출: **backend 4/4, frontend 4/4 PASS**. frontend 최신 오프라인 전체 5개 JS 모듈 + 모의 DOM/Blob에서 신규 UI 검사 본문 **1/1 PASS**: 포함3/제외3/합계0.20/제외 CSV 보존/보고서 다운로드 확인. UI 테스트 commit `0cdedf576cbb3e52c68d4467eb28ce56c02c2707`. Native Node 전체/실 Windows Edge/browser 출고 QA 통과 근거 아님.
- **영향·제한:** 매출 파서만 변경, `normalizeSpreadsheetCsv`·원본 행 보존·중복 기준·사용자 매핑/다운로드·보안 CSP 그대로. 다수의 leading zeros를 포함한 입력은 2MB 기존 제한 내에서만 허용. `main` 무변경; `frontend`·`backend` 코어 동기화. 외부 업로드/유료 API/판매/배포/branch merge 없음. 최신 Native Node 릴리스·실 Edge `file://`·Windows 수동 QA는 **NOT_RUN**, 판매 승인 **NOT_GRANTED**. 개발 마감 **2026-11-07**.

## 2026-10-26 KST — 스총: Unicode 숨김 접두어 CSV 수식 보호 보강
- **재현:** `site/csv-transform.mjs` 이전 정규식은 U+200E/200F/202E/2066/2069/034F/180E 등 일부 보이지 않는 문자 뒤에 `= + @ -`가 오는 CSV 셀을 공식 검토상태 없이 넘김. 이 유형이 실제 Excel 수식으로 실행되는지 실브라우저 시험은 하지 않았으나 데이터 검토 누락으로 판단.
- **소스 수정:** `excelSafe` 접두어 범위에 Unicode `\\p{Default_Ignorable_Code_Point}` 및 C0/C1 제어문자 추가 + `u` regex. 원본 문자열은 그대로 두고 수식 보호 apostrophe를 선행하며 `FORMULA_PROTECTED`와 원본번호를 남김. 정상 음수 `-123` 불변. Backend commit `64e16ee573e09e3454a6a1311ebc05bbf080a782`, frontend 동등 패치 `8aed84d40c1c9f440db7b66a4e0ac4e9485aea05`. Backend에만 없던 `reviewCsv` 형태 차이는 변경하지 않음.
- **회귀:** `tests/csv-hardening.test.mjs` backend `2e805ce60a7f02a8372b2f85afdddfcdc824b691`; `tests/sales-report.test.mjs` backend `1a230124a2970ba4b85c29c16a19b01116b482ea`. Checked-in transform/hardening/sales 실제 테스트 함수 V8 isolated adapter 실행 backend **29/29 PASS**, frontend **29/29 PASS**. Sales 3건 중 정상1건만 잠정 합계100원, 의심2건 `FORMULA_PROTECTED` 제외 후 검토 CSV에 보존. **Native Node 전체/Windows Edge 검증은 NOT_RUN**.
- **범위/다음:** Private `backend` 및 상응 `frontend` 코드+테스트만, `main`/배포/판매/외부 데이터/금전 지출 없음. 고객안내 frontend commit `41533df735dae771e4358744b36994ed7f87466b`. 남은 출고 관문 최신 `npm run qa:release`+실 Windows Edge `file://` E2E, 라이브 배포/판매는 승인 필요. 개발 하드마감 **2026-11-07**.

## 2026-10-27 KST — 스총: backend 검토 CSV 반환 계약 frontend 정렬
- **근거/문제:** 기존 backend `normalizeSpreadsheetCsv`는 `summary.reviewRows=2`여도 결과 키에 `reviewCsv`가 없어 검토 대상만 별도 다운로드/후속 처리를 할 수 없는 상태였다. 최신 frontend에는 `reviewCsv`가 있음.
- **수정:** backend `site/csv-transform.mjs`에 검토 대상만 `toCsv(... rows.filter(row=>row[4]==='NEEDS_REVIEW'))` 반환(원본 전체 `csv` 유지) commit `3e6a2e04a4e78cf30085a0c5d7aa953c20824739`, frontend 원문과 byte-identical 정렬 commit `37b1f1b17f3a695b612910d3d1282fc3d25d5a81`. 양 브랜치 최종 코드 blob SHA **`43c26279c1bca9064d0d41df44abf837b11f3603`**.
- **테스트:** backend `tests/csv-transform.test.mjs`에 검토 2/4행, 원본 번호, 정상 제외, 검토 0건은 헤더만 남는 회귀 추가 commit `69e1344f8bf64f15e938f5678ef2fe828575966a`. 체크인 소스/test callbacks를 V8 adapter로 실행: **backend 30/30 PASS**, frontend **29/29 PASS**. Native Node 전체, 최신 디스크 SHA/CSP, Windows Edge file:// E2E는 **NOT_RUN**. 이전 Windows 86/86은 구형 코드 근거.
- **제약:** 이번 차수 backend 코드/테스트만; frontend/main 제품 코드는 그대로, 병합·실고객 파일·외부 데이터 전송·배포·유료 호출/거래 없음. 판매 승인 미획득, SELF 2실행+8가이드 및 **2026-11-07** 마감 유지.

## 2026-10-27 KST — 스총: CSV 열 이름 시각적 혼동 차단 (직접 재현·패치·회귀)
- **실제 결함 재현:** `거래날짜,금액,금\u200B액,품목` 입력은 눈으로 확인하기 어려운 zero-width U+200B가 끼어 있으나 기존 `parseCsv`와 `normalizeSpreadsheetCsv`가 모두 수락; 잘못 선택한 두 번째 금액 열 `999`를 정상 변환한 사례 확인. 이 상태는 사용자가 열 선택을 직접 확인하도록 한 안전 설계를 저해함.
- **수정:** frontend `site/core.mjs`, frontend/backend `site/csv-transform.mjs`, backend `site/core.mjs`에 CSV 헤더의 제어문자·Unicode Default_Ignorable 코드포인트 fail-closed 차단과, NFKC+한국어 소문자 비교 시 같아지는 열 이름 중복 차단 추가. 사용자에게 원본 CSV 헤더 정정 오류를 표시하며 **원본 내용·유효 행·금액 변환·검토 CSV 구조를 변경하지 않음**.
- **커밋:** frontend core `3b817b8b3edca4ec1975c09f5cd48f24e0b71010`; frontend transform `da644bd4fc795b3d54715d251214d57b94c92d1c`; backend transform `21cf2a42b932ad08ba47bbbf4eb5282a874da6ff`; backend core `7398e437679d4e255074a9aa1c670a3a1955680b`.
- **회귀 소스:** 양쪽 브랜치에 `tests/csv-header-safety.test.mjs` 추가. frontend `293f5095fe0f6e7003bdaadf141afe9fb58bfc1e`; backend `125536c176a2e8fe26446632e51914cb580c0680`. 보이지 않는 U+200B/202E/2066/FEFF, 탭, NFKC 전각·조합 자모 충돌, 정상 BOM/한글·매출 리포트 보호 범위 확인.
- **실행 범위:** 최신 원격 실제 `site/core.mjs`+`csv-transform.mjs`+`sales-report.mjs`와 체크인된 원본 `csv-transform`·`csv-hardening`·신규 `csv-header-safety` 테스트 콜백을 V8 격리 adapter에서 실행: **frontend 21/21 PASS, backend 23/23 PASS (총 44/44)**. Node 내장 test/assert와 파일시스템을 사용한 Native 테스트 아님; 독립 adapter는 검증 편의를 위해 대체 구현. 6/6 신규 예비 경계 검사도 통과.
- **남은 관문:** 정확한 최신 소스 checkout의 `npm run qa:release`/실 디스크 HTML SHA·CSP/Chromium `file://`/Windows Edge 및 수동 UX **NOT_RUN**. Node v22.16.0 존재하지만 컨테이너 `github.com` DNS 실패로 private 전체 checkout 불가; 기존 실패 형태 반복·GitHub Actions 무단 재실행 금지.
- **보존/사업:** Private `hibi89/SMAX` frontend/backend만 수정, main 소스/분기 이력/기존 고객데이터/대외 배포/크몽 판매/유료 AI/비용 변경 없음. 1차 SELF 2종 로컬 실행+8종 설계 가이드, 출시 미승인, 2026-11-07 하드마감 유지.

## 2026-10-27 — PREPROCESSING 독립 브랜치 생성·V0 공통 엔진

- **사용자 신규 결정:** SMAX 전처리를 해커톤에서 재사용하기 위해 Private `hibi89/SMAX`에 **preprocessing** 브랜치를 신규 생성. 원본 backend commit `5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868`. main/frontend/backend 변경·병합/배포 없음.
- **구현 코드:** `preprocessing/index.mjs`의 규칙형 CSV 표준화→Strict JSON 패키지(원본 SHA256/바이트·원본행 번호·품질수치·review_queue·사람 승인 미부여); `preprocessing/cli.mjs`의 로컬 파일 CSV→JSON 실행. 각각 최초 커밋 `38120cf4`, `cd799cd6`. 기반 `site/csv-transform.mjs`은 원본 유지.
- **검증 계약/테스트:** `preprocessing/SMAX_PREPROCESS_CSV_V0.schema.json` 및 테스트 `tests/preprocessing-package.test.mjs` 5개, `tests/preprocessing-cli.test.mjs` 3개, `tests/preprocessing-schema.test.mjs` 2개. `package.json`에 전용 `npm run test:preprocessing` 추가. 합성 입력 `preprocessing/examples/synthetic-orders.csv`만 사용.
- **실행 증거:** 실제 authenticated GitHub 백엔드 CSV 생산 원문+신규 package 테스트 callbacks를 V8 격리 환경에서 연결해 **5/5 PASS**; SHA256 표준 벡터 3/3 PASS. 코드 구문 파싱 PASS, Node v22 TextDecoder UTF-8 fatal/BOM 동작 확인. **Native `npm run test:preprocessing` 전체 10건, 실제 CLI 파일 출력 E2E, 실제 해커톤 통합은 NOT_RUN**. 수치 10건은 작성된 테스트 건수일 뿐 통과 주장 아님.
- **전용 문서:** `preprocessing/README.md`, `docs/PREPROCESSING_BRANCH_PLAN_20261027.md`, `PREPROCESSING_HANDOFF.md`; `AGENTS.md` 상단 최신 브랜치 정책 추가. 해커톤 Public 저장소에 Private SMAX 소스 무단 복사·유료 리소스·개인정보 취급/출시 불허.
- **범위:** 현재 UTF-8 CSV 최대 2MiB·날짜/항목/금액 3필드 명시 매핑만 동작. PDF/DOCX/XLSX, FastAPI/Pydantic, Local LLM, n8n, 벡터/RAG는 **아직 설계 단계**. 차기 작업은 Native 10 테스트/CLI 스모크 후 Generic N필드 CSV→문서 입력 순서. 기존 SMAX SELF 2026-11-07 일정 무변경.

## 2026-10-27 KST — 최신 사용자 역할 분리 및 범용 N필드 CSV P1
- **역할 최종 결정:** 전처리 총괄은 오직 Private `hibi89/SMAX`의 `preprocessing` 브랜치에서 범용 엔진 완성·검증만 수행. KIC/UGREEN/기타 대회별 복사·변형·연결·어댑터·제출은 해총/해커톤별 총괄 담당. SMAX 전처리 총괄은 대회 레포를 수정하지 않음. `AGENTS.md`, `preprocessing/README.md`, `docs/PREPROCESSING_BRANCH_PLAN_20261027.md`, `PREPROCESSING_HANDOFF.md` 상단/최신 항목에 기록.
- **P1 구현:** 기존 CSV 파서를 `site/csv-transform.mjs`에서 `parseCsvRecords`로 export하여 그대로 재사용(코드 변경 외 기존 3필드 변환 동작 불변). 신규 `preprocessing/generic-csv.mjs`: UTF-8 CSV 2MiB 이하, 사람 지정 1~64필드, text/date/decimal/integer/boolean의 타입별 결정론적 정규화, 원본 전체 열·행 번호와 원문 SHA, 검토 이슈·정확히 같은 전체 원본 행 중복·수식 위험/결측/유효성 검사 및 Strict JSON 상호 검증. 자동 승인 불가(`NOT_GRANTED`). 추가 JSON Schema `SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json`, 8+2건 회귀. `npm run test:preprocessing`에 두 회귀 파일 등록. 기존 V0 코드·API 유지.
- **검증 증거:** 실제 GitHub 생산 코어+신규 검사 테스트 callback을 V8에서 실행: Generic 8/8 PASS, Schema 계약 2/2 PASS, 추가 조작된 정규화 결과 거부 1건 확인. SHA hash/Node fs는 이 격리 시험에서 Mock 사용. **전체 Native Node, 디스크 CLI, 실제 JSON Schema validator 라이브러리, 브라우저/Windows 테스트는 NOT_RUN**. PASS 범위를 확장 주장하지 않음.
- **시큐리티/정보 보호:** V1 출력은 매핑하지 않은 열도 `source_cells`로 보존한다. JSON 파일은 원본과 동일 수준의 민감 데이터이므로 타 레포/공개 API/LLM에 무단 전달 금지. 숫자·날짜는 추정하지 않고 검토 행 삭제 없음. 스키마의 교차 행 검증은 생산 JS 검사기가 담당.
- **커밋 근거:** 원본 CSV parser export `e92b6b61`; Generic 엔진 `5f348da1` + 원본/정규화 검증 강화 `90bf69be`; 테스트 `b9e5e6da`, Schema `c72928e6`, Schema 회귀 `45948ccd`, test script `508a4c54`. 인수인계/설계 문서 후속 최신화 참조.
- **다음 작업:** 범용 전처리 Native 전체 테스트 및 파일 CLI 확보→가변필드 고급 규칙·성능/한도→XLSX·문서 파서와 provenance→검증 가능한 선택적 Local LLM/스키마/검토 UI. **해커톤별 어댑터/대회 전송은 작업 대상 아님**. main/frontend/backend·대회 저장소·판매/배포·유료 API/고객자료 불변.

## 2026-10-27 KST — PREPROCESSING P1.1 범용 CSV 전용 CLI

- **최신 범위:** Private `hibi89/SMAX` `preprocessing`만, 단독 총괄 전처리 엔진 관리. KIC/PayPal/UGREEN별 연결·어댑터·제출 금지; `main/frontend/backend` 보존.
- **설계:** 기존 `cli.mjs`의 V0 옵션 확장보다 별도 `generic-cli.mjs` 선택(이전 API 보존, 의존성 0, 명시적 mapping JSON). `SMAX_PREPROCESS_GENERIC_CSV_V1` 출력으로 원본 전체 행·열/검토 큐/미승인 상태 보존.
- **코드:** `preprocessing/generic-cli.mjs` 생성 GitHub SHA `9eb19dbe49bcba2ed1dede39d920ae54828e3da2`; CSV 2MiB·매핑 JSON 64KiB, UTF-8 fatal, regular file/심볼릭링크 검사, 출력 신규파일 독점 생성. CLI 사용법은 `preprocessing/README.md`에 기록.
- **검증/장애:** 이 환경 Node v22.16.0/npm 10.9.2 확인. `git ls-remote https://github.com/hibi89/SMAX.git`는 DNS `Could not resolve host: github.com` 실패. 원격 테스트 파일 작성 2회는 도구 안전 검사 차단; 해당 테스트는 **미반영**. 원격 전체 의존성의 `npm run test:preprocessing`/실 파일 CLI E2E/Windows 검증은 **NOT_RUN**; PASS 주장 금지.
- **보존:** 외부 고객 데이터·API·DB·LLM·유료 지출·Cloudflare/Vercel 공개 배포·제품 출고 없음. 기초 `preprocessing` HEAD `b6a71829`; 새 코드 커밋 `9eb19dbe`; 최종 HEAD는 전체 문서 갱신 후 재조회.
- **다음 안전 작업:** 회귀 테스트 등록 경로 복구 후 최신 checkout에서 Node 전체 테스트·합성 CSV 실제 쓰기/해시/UTF-8·파일 권한/오류복구 E2E. 이어 CSV 고급 타입/대용량 한도와 문서 파싱 플러그인. 신규 출력이 민감 원문 전체를 포함한다는 보안 경계 유지.

### 2026-10-27 — 신규 CLI 실제 원격 블롭 일치 로컬 스모크 확인

- 새 CLI `preprocessing/generic-cli.mjs` 원격 blob SHA `086e33c884a77c95c5f2512befe80af1815055cd`와 로컬 검사용 소스의 `git hash-object`가 **완전 일치**. 해당 최신 소스에 Node 22 `node --check` **PASS**.
- 해당 **실제 신규 CLI 소스** + **모의 generic-csv 엔진** 조합으로 로컬 파일 I/O 스모크 7/7 PASS: 원본 불변·UTF-8 BOM/바이트 수·새 JSON 생성·기존 결과 덮어쓰기 차단·설정 구조 차단·잘못된 UTF-8 차단·symlink 차단·설정 크기 초과 차단. 7항목 중 일부 묶음 검사이며 정식 GitHub 회귀가 아님.
- 제한: `preprocessing/generic-csv.mjs`와 `site/csv-transform.mjs`는 해당 Node 시험에서 **mock/미포함**. 전체 원격 최신 Node `npm run test:preprocessing` 및 진짜 Generic 엔진 E2E는 **미검증**. 신규 테스트 파일 원격 반영 차단도 지속.

## 2026-10-27 KST — PREPROCESSING V1 검증기 헤더 안전성 수정 및 Generic CLI 회귀 추가

- **원격 정본:** 작업 기준 Private `hibi89/SMAX` `preprocessing@55003d707f65`; 다른 세 브랜치는 작업 대상 아님.
- **원인/실제 재현:** 기존 `preprocessing/generic-csv.mjs`의 `validateGenericCsvPackage`는 원본 CSV 파서가 거부하는 숨김 Unicode(예: unmapped header `비\\u200B고`)를 `source.headers`에서 단독 차단하지 않아, 매핑되지 않은 열 이름을 변조한 V1 패키지를 승인 전 검증 단계에서 통과시킬 수 있었다. 원격 실제 소스 V8 재현 테스트 FAIL로 확인.
- **코드 수정:** 패키지 검증 시 모든 `source.headers`에 대해 비어 있음/앞뒤 공백/Unicode Default Ignorable/C0·C1 제어문자 거부. 신규 `source.headers`에만 최소 수정, 규칙형 필드 변환/원본 행/기존 V0 API/원본 CSV 불변. GitHub 코드 커밋 `48913dc96280e83bbdeaaa45e5ccbf13213dd783`.
- **회귀 테스트:** 기존 `tests/preprocessing-generic-schema.test.mjs`에 unmapped header 보이지 않는 문자·앞공백·탭 변조 거부 테스트 추가 `923cb71a75e72ba57380823c1f42a07cfff1dc13`. 기존 `tests/preprocessing-cli.test.mjs`에 Generic CLI BOM 포함 바이트 SHA·원본 행·검토, 출력 덮어쓰기 방지, 매핑 초과키, UTF-8·설정 크기·symlink·경로 충돌 회귀 4건 추가 `c43bc4416e8e77efc321add57e4b52064ca49b74`→`301b1ebd9daabc1031b691b1dda2ecccae069fff`. 이번에는 기존 파일에 추가하는 경로로 성공(신규 파일 생성 차단 방식 재시도 안 함).
- **직접 검증:** 실제 최신 GitHub CSV 파서/Generic 엔진 본문을 JS V8에서 평가한 한정 테스트 **6/6 PASS**, 미매핑 헤더 위·변조 거부 포함; 이전 문제 재현 후 패치 결과 개선 확인. SHA crypto와 TextEncoder는 V8 stub(실 Node 아님). **Native `npm run test:preprocessing`, 전체 `npm test`, 실제 모듈 디스크 CLI E2E, Windows/CI 전부 NOT_RUN**. 새 Node 회귀는 GitHub 체크인됐으나 직접 Native 실행 PASS 주장 불가.
- **다음 작업:** 정확한 원격 정본으로 Native Node 전체 checkout과 CLI E2E 접근 경로 확보·실행 → 추가 결함 최소 수정/회귀 검수 → 승인된 범용 문서 형식 확장. 프론트/백엔드/메인, 다른 대회 레포, 배포/판매/유료 리소스 무변경.

## 2026-10-27 KST — PREPROCESSING 검토상태 승인 위조 취약 경계 수정

- **현재 기준:** 비공개 `hibi89/SMAX` `preprocessing` HEAD는 작업 시작 시 `7a6dc92facc1d9e9a93d729b5908fedee390f6ae`. 다른 세 브랜치 및 해커톤별 저장소 변경 없음.
- **재현 결함:** `validateGenericCsvPackage`가 행의 `status`를 검사할 때 `(status==='NEEDS_REVIEW') === (issues.length>0)` 동등 조건만 검사. 문제 없는 행의 `status='APPROVED'`나 임의 문자열도 통과 가능(실제 체크인 GitHub 코어 기반 V8 재현에서 accepted=true). 이는 승인 불가 계약의 행 단위 우회.
- **수정:** 유효 상태를 `issues.length ? 'NEEDS_REVIEW' : 'READY_FOR_HUMAN_REVIEW'`와 **완전 일치** 검증. 패키지 최상위 `approval='NOT_GRANTED'` 검증 기존 유지. 코드 커밋 `4948640bb3b2c7df1240c01837361b12660da1a3`, 해당 상태 위조/임의/null/빈 상태 회귀 `tests/preprocessing-generic-schema.test.mjs`에 커밋 `1944256e4fc793d997341655b843d07f656849ca`.
- **검증:** GitHub에서 새로 읽은 `site/csv-transform.mjs` blob `26d84c9a59216107ab492aedfcd91cd571e40c66`, 패치된 `preprocessing/generic-csv.mjs` blob `534057062a270d1bc80a78d721d3b3edba84db93` 실제 소스를 V8에서 실행. 정상/검토 행, 위조 승인/임의·null 상태, 날짜·중복, 숨김 헤더, 값/출처/검토 큐 변조, JSON 직렬화 총 **20/20 PASS, 0 FAIL**. SHA256·TextEncoder 어댑터를 모의한 격리 검증만 수행했으며 **Native Node/npm 전체·디스크 CLI 통합/Windows·CI NOT_RUN**. Native QA 성공으로 주장하지 않음.
- **장애/피벗:** 비공개 원격 전체 체크아웃의 컨테이너 DNS 차단 및 현 컨테이너에 전처리 코어 정본 파일이 없음. 기존 모의 CLI 검증 파일은 실제 엔진이 아니므로 Native 통합으로 오인 금지. 동일 차단 Git clone 반복 금지. 원격 검사·최소 코드/회귀 수정까지 수행, Native 테스트는 접근 가능한 정본 복원 경로가 필요.
- **보존/다음:** `main/frontend/backend` 무수정, 외부 고객 자료/유료 API/배포/판매 없음. 향후 실제 repo 정본 Node 테스트 전수 실행·CLI 실 입력 E2E → CSV 경계 안정성·문서 파서 우선순위 설계. 최종 HEAD 문서 커밋 후 재조회.

## 2026-10-27 KST — XLSX ZIP Preflight V0 (엄격 범용 문서 입력 검문소)

- **작업 범위:** Private `hibi89/SMAX` `preprocessing` 브랜치만. 기존 `main/frontend/backend`와 이전 V0/V1 CSV 원본 코드 보존; 해커톤별 연결·배포/유료 API 금지.
- **대안 비교 및 결정:** ① 외부 XLSX 파서 의존성 즉시 추가는 처리 범위 넓으나 의존성/라이선스/추가 공격면·공급망 점검 부담. ② Node 내장 zlib 기반 XLSX ZIP 사전검사를 먼저 만들면 셀 데이터는 아직 못 읽지만 비용 0·입력 안전 경계와 provenance 기반을 별도로 검증 가능. 사용자 범용 전처리/0원 계획에 따라 ② 수행.
- **구현:** `preprocessing/xlsx-preflight.mjs` (GitHub 코드 커밋 `f78ae845437d06d7d9589473f30ba7adfc260949`, blob `dfd838aaf357179bbe092affc959a65b1e149705`) — 2MiB ZIP, 8MiB 압축해제, 512엔트리 상한, EOCD/CD/local header·CRC·오프셋 검증, path traversal/symlink/ZIP64/암호/외부 링크·macro·DOCTYPE/ENTITY 차단. 데이터 추출/시트 셀 해석·필드 매핑/벡터는 **미구현**.
- **Native Node 단독 테스트:** 합성 ZIP 기반 `tests/xlsx-preflight.test.mjs` GitHub test blob `d54351e8644bbf1dce81d429a2084cfbcc91f547`, 테스트 파일 마지막 정정 커밋 `ea228d601d411e670222b13401976fce62252a16`. 로컬 `git hash-object`가 원격 코드+테스트 blob SHA 모두 일치. **Node 22.16.0 `node --test tests/xlsx-preflight.test.mjs` 10/10 PASS, 0 FAIL**. 초기 로컬 테스트 1건은 CRC 변조 위치가 잘못돼 실패했으나 정확히 데이터 영역으로 변경 후 통과. GitHub 복제 테스트의 ZIP 헤더 필드 폭 오기는 SHA 대조 발견 후 2회 정정, 최종 일치.
- **통합/미검증:** `package.json` `npm run test:preprocessing`에 신규 테스트 추가. 그러나 Private GitHub 전체 checkout DNS 차단으로 **기존 CSV 전체 Node 테스트 / 실제 XLSX 샘플 호환·데이터 추출 / Windows / CI·서비스·배포는 NOT_RUN**. 이 Native PASS는 새 독립 모듈만의 PASS.
- **원본/보안/비용:** 합성 텍스트 ZIP만 생성, 고객 원본/기밀·토큰 사용/외부 전송·돈 지출 없음. 로컬 temporary test code와 커밋된 비공개 GitHub 코드 외 장기 저장 자산 없음.
- **다음:** 전체 Native CSV 정본 테스트 경로 확보 → XLSX 파일 목록+CRC 검사에서 승인된 제한형 시트·셀 추출로 점진 확장 → source provenance·검토 큐 Strict JSON 설계 후 완료기준 검증. 최종 GitHub HEAD 문서 커밋 후 재조회.

## 2026-10-27 KST — PREPROCESSING XLSX 실제 워크시트/셀 추출 V0

- **저장소/범위:** Private `hibi89/SMAX`의 `preprocessing` 브랜치, 시작 HEAD `73ff80a7646d611823be623ea7ed6f35dd18b09f`. 기존 `main/frontend/backend`·해커톤 저장소 변경 금지.
- **구현:** `preprocessing/xlsx-cells.mjs`: 엄격한 XLSX ZIP preflight 뒤 실제 Node/zlib + 제한형 XML 파서를 통해 `xl/worksheets/sheetN.xml` 내 inline/shared string, 원문 숫자, 불리언, 빈 셀, 수식/오류 셀, 여러 시트의 원본 경로/행/셀 provenance를 읽어 `SMAX_PREPROCESS_XLSX_CELLS_V0` Strict 형태로 반환. 입력 SHA-256·품질 합계 및 `approval='NOT_GRANTED'`. 수식 자체는 계산하지 않고 검토 표시. 신규 코드 commit `4e6b5f4f25cbb2c9a95115c8ee37099b5998454c`, blob `ee81d55fbaa64e234d104a6e0a68904e812351f1`.
- **검증/테스트:** 기존 `tests/xlsx-preflight.test.mjs`에 실제 셀 추출 회귀 8개 추가. GitHub test `917e6bf44368ed3aa0ec515986328418da327702` 후 실제 로컬 원문과 byte-identical 정렬 commit `128f98638b39c00c31b617a7b406318d0144fab4`; 최종 test blob `fbbc028188b0e4de16b66b4dcd9b7e330a9c6044`. **Native Node v22.16.0 18/18 PASS/0 FAIL**(기존 preflight 10 + XLSX 셀 파싱 8). 최초 신규 테스트 2건의 XML 엔티티 처리 실패 재현 → 잘못된 이중 디코딩 순서 수정 → 전건 통과. `git hash-object`와 GitHub blob SHA가 모듈/테스트 각각 정확히 일치.
- **생성 파일 호환:** 별도로 로컬 생성한 합성 `openpyxl` XLSX(2행/7셀, 한글/소수/boolean/미실행 formula)와 `XlsxWriter` XLSX(3행/3셀, sharedString/formula) 실제 전처리 실행 성공. 고객/실무 Excel 호환·정확성 보장은 아니다.
- **지원 제한·보안:** 기존 ZIP 제한(2MiB 압축, 총 8MiB 해제, 512 entries) + 최대 64 시트, 1만 행, 10만 셀, XML 30만 노드/깊이 64. 숫자를 원문 문자열로만 제공, 날짜 스타일·표시 시트 이름/워크북 관계·수식 계산·상업적 승인 미지원. 비정형 전체 내용의 완전한 전처리 도구 출고 아님.
- **미검증/비용:** 기존 V0/V1 CSV 전용 Node/전체 `npm run test:preprocessing`·`npm test`는 Private 저장소 git DNS 차단으로 NOT_RUN. Windows/실고객 파일/실 API/배포/상업 실행도 NOT_RUN. 0원, 외부 자격증명·LLM/고객 자료 미접촉, repo 외 소스 전송·유료 API 없음.
- **다음 1순위:** 전체 Private 정본에서 Native CSV 포함 전수 테스트 경로 확보. 후속으로 구조 계약 JSON Schema·XLSX 파싱에서 스타일/날짜/시트 매핑 별도 설계 및 원본 손실/미지원 경계 회귀. 사용자의 2026-11-07 제품 일정·대회별 담당 분리 유지.


## 2026-10-27 KST — XLSX Strict JSON 계약 및 원본 대조 검증

- **범위:** `hibi89/SMAX` Private `preprocessing`만 변경, 진입 HEAD `cfb87ed0a882a3b624f0a0f3fa0790228f6fd3a7`. 타 브랜치/해커톤/배포/유료 API 무변경.
- **구현:** `preprocessing/xlsx-package.mjs`에서 `validateXlsxCellsPackage(pkg,originalBytes?)` 및 `serializeXlsxCellsPackage` 추가; 별도 `SMAX_PREPROCESS_XLSX_CELLS_V0.schema.json` JSON Schema Draft 2020-12를 비공개 repo에 게시. 엄격한 승인·원본 셀/행·시트 경로·숫자/불리언 타입·수식 검토 사유/상태·품질 합계/추가키 무허용 계약.
- **중요한 구분:** 구조 검사만으로 문자열 값 변조는 입증 불가(검증 테스트가 구조-only 통과를 명시적으로 보여줌). **원본 Uint8Array를 전달한 경우** SHA-256/바이트 길이 대조와 새로 전처리한 결과 JSON deep-equivalence(직렬화 비교) 실행, 부정확한 값이나 위조 상태를 거부. 인증·사람 승인 자동 부여는 하지 않음.
- **커밋/증거:** JS validator commit `018bbaa04c324d569c821323ea77d97ca6f07f09`, Git blob `9b7ca74a328857e806c9574f278981ec00c9b8da`는 로컬 Node 실행 파일 `git hash-object`와 정확히 일치. 테스트 commit `820d3fdb954b4e9bafdd41f00bf28ed8fbee1778`, blob `a97571a54fd5973aa359dae9024c57ded5ad4d45`는 로컬 26건 테스트와 byte-identical. 스키마 commit `1e7c79b2efa9f15527b544f1ca5559deeacd7ef5`, remote blob `73f299a9164876cc61391b82f72319af77a33b17`.
- **실행:** Node v22.16.0, `node --test tests/xlsx-preflight.test.mjs` **26/26 PASS, 0 FAIL**, 원본 동일성 검증에 완전한 합성 XLSX ZIP 기반 사례 사용. 로컬 생성 openpyxl/XlsxWriter 2종 패키지 원본 대비 별도 validator 통과. GitHub 파일 SHA와 실제 실행 코드/테스트 동일성 검사 완료. JSON Schema는 원격 fetch 후 JSON.parse/필수키/$defs/approval const 구조 확인; 독립 JSON Schema 엔진/Ajv 테스트는 NOT_RUN.
- **남은 게이트:** 비공개 CSV 정본 체크아웃 불가(DNS)로 `npm run test:preprocessing` 전체 및 `npm test`, Windows/실고객 파일/CI는 NOT_RUN. 문서·Schema 추가가 릴리스/판매 증거는 아님. 비용 0원.
- **다음 1순위:** 전체 원격 정본 Native QA 경로 복구 → XLSX 결과로부터 CSV·보고서로 표준화하는 명시적 어댑터 및 JSON Schema 독립 validator 검증 → XML 서식·시트 관계/날짜 해석 정확도. 해커톤 연결은 각 총괄 담당.

## 2026-10-27 KST — XLSX numeric-cell hardening

XLSX numeric cells previously accepted arbitrary text as number_text. Fixed in parser (8b76a855), JS validator (9b27cde0), and JSON Schema (39284d48). Repo-identical files tested locally: Node XLSX **29/29 PASS**; optional Python Draft202012 schema unittest **5/5 PASS**; extended local schema cases **21/21 PASS**. Numeric strings retain exact precision; NaN, Infinity and formula-like numeric data are rejected. Source/test/schema blobs matched GitHub. Private full checkout is not locally available: all CSV-inclusive npm suites, Windows, CI and production remain **NOT_RUN**. See PREPROCESSING_HANDOFF.md for exact commits and next steps.


## 2026-10-27 KST — XLSX 관계 TargetMode 문자참조 우회 차단

- **결함/원인:** XLSX 원본 ZIP의 `.rels` 관계 문서에서 `TargetMode="Exter&#x6e;al"`처럼 XML 문자참조를 사용하면 이전 사전검사가 `External` 원문에만 매칭하여 통과함. 합성 ZIP과 실제 Node로 실패 재현 후 파서·테스트 최소 수정.
- **수정:** `preprocessing/xlsx-preflight.mjs`의 대상모드 속성 XML numeric/named entity decode, 유효한 `Internal`만 허용(나머지는 fail-closed), `.rels/.xml` 확장자 대소문자 변형도 검사. 코드 커밋 `9f28e6e1c7c98b5f3d3f83d3ba843d43ce30c57c`, blob `ce0f96ce618c6b868bcf255e1d8b2508f3eb6bb3`; 회귀 커밋 `d1c1d24c0169b7d6b9a81ec817dea4a1a6b9de9b`, blob `d484cea4ef13ad28b650902c164251d1daaf6121`.
- **재검증:** 이전 29개 + 신규 외부 XML 인코딩·정상 Internal·대소문자 우회 4개 = 실제 Node.js v22.16.0 `node --test tests/xlsx-preflight.test.mjs` **33/33 PASS/0 FAIL**. 선택적 Python `jsonschema` 독립 unittest **5/5 PASS**. 합성 생성 openpyxl/XlsxWriter XLSX 2종 안전검사→셀 추출→원본 바이트 대조 검증 PASS. 신규 두 파일 로컬 Git blob == 원격 blob 일치.
- **변경 범위·미검증:** 비공개 `hibi89/SMAX` `preprocessing`만 수정. `main/frontend/backend`·제품 Production·공개 코드·비용/유료 API 무변경. CSV V0/V1 전체 Native test, `npm run test:preprocessing`, 전체 `npm test`, Windows·CI·고객자료/실서비스 테스트는 여전히 **NOT_RUN**. 기존 Private 저장소 전체 체크아웃 DNS 문제에 대해 같은 클론 방식의 재시도를 소모하지 않았음. 다음은 인증된 전체 소스 Node QA.

## 2026-10-27 KST — PREPROCESSING 전체 Native QA 정정 및 XLSX Unicode 검토 강화
- **선행 최신 검증 근거:** [docs/PREPROCESSING_NATIVE_QA_20261027.md](docs/PREPROCESSING_NATIVE_QA_20261027.md), baseline code HEAD `d2f6f627a9cff957abf481d24c2c28cc30a0afcf`, report commit `0cee79071f015ae473c5c53133fa84788c649b20`. 앞선 기록의 전처리 `npm run test:preprocessing NOT_RUN`은 **해당 baseline에서 해결**: 인증된 GitHub 소스·테스트·스키마·package 17/17 blob 일치, Linux/Node 22 실제 실행 **59/59 PASS (CSV 26, XLSX 33)**. CSV 2개 CLI 및 합성 XLSX 2개 원본 대조 실행 기록. `npm test` 전체 사이트/UI, Windows/CI는 미실행.
- **새 결함:** 기존 XLSX `FORMULA_LIKE_TEXT`는 일부 Unicode default-ignorable/bidi 접두어와 `-SUM(...)` 문자열을 검토 상태로 분류하지 못함. CSV 출력 보호 기준과 검토 우선 원칙에 맞춰 확장. 실제 Excel 수식 실행을 재현했다는 주장은 하지 않음.
- **수정:** `preprocessing/xlsx-cells.mjs` commit `817a959332c87e25a1a839e498db07586df1d118`, `preprocessing/xlsx-package.mjs` commit `2c101fbf01c7bbfcdf527ba8056f671a1987233a`. 제어·기본 무시 가능 Unicode 접두어 뒤 `= + @ -`를 검토 표시, 평범한 음수 숫자 텍스트(`-12.50`)는 정상 유지. 결과 검증기와 파서의 동일 판단·승인 위조 차단 유지.
- **회귀:** `tests/xlsx-preflight.test.mjs`에 숨김 접두어 3종+`-SUM`, 음수 숫자 예외, 원본/출처 검증·상태 위조 거부 테스트 1건 추가 commit `75a406ed062f6e3e70cd6eaf44105d13fdc505b5`.
- **직접 확인:** GitHub에서 갱신된 세 파일 재조회 후 JS V8 구문 파싱 **3/3 PASS**, 패치된 정규식 판단과 실제 `validateXlsxCellsPackage`의 구조 검사/거짓 상태 거부 **각 6/6 PASS**; Node v22.16.0 독립 정규식 예비 케이스 **7/7 PASS**. V8 테스트는 Node 모듈 전체 또는 XLSX ZIP 파일 파서 통합 실행이 아님.
- **최신 코드 변경 후 Native 상태:** 신규 회귀 추가로 예전 baseline **59/59 증거는 남지만 최신 코드는 재실행 NOT_RUN**. `npm run test:preprocessing`의 신규 총 테스트 예상값은 60; 통과 보장/릴리스 선언 금지. 정확한 최신 코드·SHA로 재구성하여 Native/실 파일 QA를 실행하는 것이 다음 1순위.
- **보존·권한:** Private `preprocessing`만 변경; main/frontend/backend 및 해커톤별 저장소 무수정·미병합. 고객자료·외부 API·LLM·결제·배포/크몽 판매 없음. 원본은 Git 커밋으로 복구 가능. Windows/CI/전체 UI/Production 미검증, 사용자 승인 없는 배포·반출 금지.

## 2026-10-27 KST — XLSX mixed-value data integrity fix (GitHub verified)
- **정본/시작:** Private `hibi89/SMAX` `preprocessing@674bf1aabcf6487551834d958382207c17b760ea`; 이전 실패한 `update_file` 대신 새 Git blob → base tree → commit → non-force update_ref(expected_sha)로 원자적 수정.
- **원인/재현:** 셀에 `<is>` 및 `<v>` 또는 `<f>`가 충돌해 함께 존재할 때 `extractXlsxCells`의 `parseSheet`는 일부 원본 내용을 조용히 버리고 유효한 단일값처럼 처리했음. 이전 턴 생산 코드 V8에서 잘못 수용되는 3개 synthetic 예제로 재현; 악성 파일의 실제 실행은 주장하지 않음.
- **패치:** `preprocessing/xlsx-cells.mjs`의 혼합 표현을 `XLSX_CELLS: conflicting cell payload` 오류로 fail-closed. 정당한 수식 `<f>` + 캐시 `<v>`는 기존대로 값 신뢰 없이 `FORMULA_UNEVALUATED` 검토 유지, 정상 scalar·inline string 불변.
- **회귀:** `tests/xlsx-preflight.test.mjs` 신규 1개 test에 충돌 셀 3종 reject, 정상 셀 3종의 원본 패키지 parity 통과 검사 등록. 코드/회귀 단일 커밋 `9ca4c722bb74b0bfbf7e7f035b976370c9f852dd` (code blob `79e4d3ac1f44e67ad9f599bce17f414311faac5e`, test blob `db5d6ce055ca131e4ee7d9a620d19cf035c9faa0`).
- **실검증:** 최신 원격 parser(내장 `parseXml`/`parseSheet`)와 package validator 본문을 JS V8으로 구동: synthetic 15케이스 15/15 PASS(오염 혼합 7 reject, 정상 8 accept), 유효 구조에서 status `APPROVED` 위조 8/8 reject. parser/validator/test 구문 3/3 PASS. 실제 Node 22 별도 정규식 회귀 `xlsx_formula_review_isolated.test.mjs` 16/16 PASS. **V8 분리 검증 ≠ Native ZIP/Node 전체 실행.**
- **미검증:** 선행 `d2f6f627` 코드 기준 Native `npm run test:preprocessing` 59/59 PASS는 기존 기록 그대로. 그 이후 Unicode 회귀 + 이번 혼합 payload 회귀가 추가되어 현재 약 61건 Native 통합 테스트는 **NOT_RUN**. ZIP 바이너리 E2E/전체 `npm test`/Windows/CI/Production 미실행. 비공개 저장소 전체를 현재 컨테이너로 복원하는 GitHub DNS/다운로드 경로 제한 지속; GitHub Actions 유료 가능성 때문에 무단 실행 없음.
- **안전/범위:** 오직 Private preprocessing 2개 코드/테스트와 본 문서만 변경; `main/frontend/backend`, 해커톤별 저장소, 고객 데이터·외부 API·판매·배포 무변경. 다음은 안전한 full source SHA-verified checkout → 전수 Native QA → 공통 provenance adapter 설계.

## 2026-10-27 KST — XLSX phonetic annotation visible-text fix
- **시작 HEAD**: `39c38d47919016ba4bcfca9146a12c4b71955e49`. `preprocessing/xlsx-cells.mjs`의 기존 `descendants(si,'t')` / inline descendant `t` 결합은 후리가나 `<rPh><t>...` 텍스트까지 셀 원문 값으로 오염시켰음. 실제 생산 파서 V8 재현: `東京` → 잘못된 `東京とうきょう`.
- **수정**: `visibleStringText` helper에서 OOXML 발음 주석 `rPh`, `phoneticPr`의 하위 노드를 제외하고 표시 텍스트 `t`만 순서대로 결합. Rich text, shared string, inline string 처리와 formula-like review 규칙을 유지. 고객 원문 수정·자동승인·외부 API 호출 없음.
- **코드 GitHub 커밋**: `8cf9e0d897a20e1ad1c0601bbc3b64506cbe6e8e`; parser blob `e888772c0d2429b38e9ea2d4563a77441be32b29`, 회귀 test blob `bd48d5c26a943a10585a86e0a0a5b9fa8748237c`. `tests/xlsx-preflight.test.mjs`에 shared/inline rich text+phonetic 원본 parity 검증 1개 등록.
- **재검증**: 커밋된 parser 및 validator GitHub 실제 원문으로 V8 합성 XML 케이스 **7/7 PASS**, 모듈 3개 구문검사 **3/3 PASS**. 정상 rich/single/inline, 발음 주석 속 수식형 문자열에 따른 거짓 검토 방지, 눈에 보이는 수식형 문자열의 `NEEDS_REVIEW` 유지를 확인함. source byte hash 및 ZIP 압축해제는 이 격리 검사 미포함.
- **Native 통합 현황**: 기존 `d2f6f627`의 `npm run test:preprocessing` **59/59 PASS** (기준선). 이후 Unicode 검토+XLSX 혼합값+phonetic 총 3개 회귀가 추가되어 현재 체크인 테스트는 **62개(정적 선언 개수 기준)**. 최신 `npm run test:preprocessing` **NOT_RUN**, 독립 Node Unicode predicate는 이전 16/16 PASS. 압축된 실제 XLSX E2E/전체 `npm test`/Windows/CI/Production 역시 NOT_RUN. 현 런타임에는 비공개 저장소 17파일 정본 체크아웃이 없고 GitHub DNS 접근 불가, GitHub Actions 자동 실행은 하지 않음.
- **범위/비용**: Private preprocessing 내 code+test 및 본 인계 파일만 수정. `main/frontend/backend`, 해커톤 레포, 고객·개인정보, 결제, 배포·공개 변경 없음.
- **다음**: 정본 SHA별 17파일 복원 가능한 인증 Node 실행 환경에서 `npm run test:preprocessing` 62건 실제 실행 및 synthetic XLSX ZIP parity E2E → 실무 Excel 파일의 지원/한계 점검 → 범용 텍스트/셀 provenance 보강.

## 2026-10-27 KST — Generic CSV V1 unmapped source-column formula review
- 실제 원격 V1 + CSV tokenizer에서 `Name,Note\nAlice,=HYPERLINK(1)`의 Name만 매핑하면 원본 `Note` 위험 문자열이 `source_cells`에 남는데도 `READY_FOR_HUMAN_REVIEW` / formula count 0, validator PASS가 됨을 재현. 고객/실데이터 미사용.
- **A 결정:** 원본 열을 전부 보존하며 비매핑 열의 수식 의심 셀도 별도 `{field:<원본헤더>,code:'UNMAPPED_FORMULA_RISK'}`를 issues/review_queue에 기입, `status=NEEDS_REVIEW`, `quality.formula_risk_cells`에 합산. 기존 mapped `FORMULA_RISK`와 다른 명시적 코드. B(미매핑 셀 제거)는 provenance 원칙 위반, C(보호문자만 자동 삽입)는 원문 변조 위험으로 선택하지 않음.
- **검증기/스키마:** 원문 `source_cells`에서 비매핑 위험을 다시 계산하고 검토 누락·상태 위조를 거부. JSON Schema `$defs.issue.properties.code.enum`에 새 코드 추가. 기존 V1 스키마 버전을 유지하되 issue code 허용 범위 확장이므로 소비자 enum 매핑 호환 확인 필요.
- **GitHub 코드·테스트·스키마 commit:** `ecf6cba8d22660180250cad3d5afb6b7014843d5`. blobs: core `3b6cedae4869b7d8d5ae587f8d565812b6d9e193`, regression `3f99b78f416a36c08f299f6511a5f7f16c1215f3`, schema `ae5d2e8cbc40bc08ed586b7826c1bec5f5cead0d`.
- **테스트 증거:** 인증된 최신 CSV tokenizer와 새 V1 원문/체크인 regression 9건을 V8 격리 harness에서 수행 **9/9 PASS**, 생성 패키지 검증+위조 거부 PASS. Hash는 stub; 실제 전체 Node CLI/파일/해시/ZIP test가 아님. 그 전까지 정적 선언 62개, 이번 +1로 **63개 (CSV 27/XLSX 36)**. Native `npm run test:preprocessing` 최신 전체 **NOT_RUN**, 과거 59/59 PASS는 구 commit 기준.
- **범위 및 남은 리스크:** 오직 Private `preprocessing`, 타 브랜치·해커톤·고객 데이터·지출·배포 무변경. 모든 `source_cells`는 여전히 신뢰할 수 없는 원본이므로, 이 검토 사유만으로 안전한 CSV/Excel 출력이 보장되지는 않음; 실제 exporter는 재검증·적절한 수식 이스케이프 필수.
- **다음 게이트:** SHA 동일 인증 checkout에서 Node `npm run test:preprocessing` 전체 63건 (실제 개수 우선), Generic CLI 파일 E2E/실해시와 ZIP XLSX synthetic parity, Windows QA → 별도 소비자 호환성 점검/출고 승인.

## 2026-10-27 KST — preprocessing XLSX XML invalid-character gate
- 기준 `preprocessing@72aef6f8605befe6a29958fc83b3394b3c40c2a2`; 원격 생산 XML parser가 금지 literal U+0000, U+000B, U+FFFF 및 numeric U+FFFF를 수용함을 V8 재현. 파서 최소 fail-closed 및 합성 ZIP 회귀 추가. 패치 parser V8 격리 7/7 PASS. 최신 Native 전수(정적 약 64개), `npm test`, Windows, 고객자료/CI/배포 NOT_RUN. `PREPROCESSING_HANDOFF.md` 최신 10항 참고. 오직 preprocessing 변경, 이전 Git commit 복구 가능.

## 2026-10-27 KST — preprocessing V0 CSV fd-read hardening
- `preprocessing` 코드·회귀 커밋 `2902f2e37289356eb537c13a1c50c9d7b175e304`. V0 CLI lstat/read pathname TOCTOU를 줄이도록 opened fd fstat/read/finally close + post-read 2MiB check 도입; 신규 >2MiB 테스트 1건. 최신 실제 코드 V8 mock I/O 4/4 PASS. 전체 Native/Windows/CI/고객 데이터/판매 NOT_RUN. 인수인계 `PREPROCESSING_HANDOFF.md` 최종 섹션 참조.

## 2026-10-27 KST — preprocessing MVP Excel CLI
- CSV V0/V1 기존 로컬 CLI 보존 + 제한형 XLSX V0 로컬 CLI `preprocessing/xlsx-cli.mjs` 신규 도입, 합성 파일 E2E 회귀 3건 등록. 기존 preflight/extractor/validator 재사용; SHA parity, review, NO_APPROVAL, 입력보호 및 exclusive output. 최신 Native 전체·Windows·시판 Excel 호환성 NOT_RUN. 사용자 지시: MVP→설계 대비 보강→검수. 별도 배포/비용/타브랜치 변경 없음.

## 2026-10-27 KST — XLSX CLI Native I/O smoke after MVP entrypoint
- GitHub commit `3cf9a5bf6ec5f50a8ce371a54da8a10b5f494cb9`, `preprocessing/xlsx-cli.mjs` blob `0b830360638baa1b6d7c33756a5d0271ad2fe299`와 동일한 `git hash-object`의 실제 파일을 로컬 Linux Node **v22.16.0**에서 `node --test smoke.mjs` 실행. **6/6 PASS, 0 FAIL**: 파일 생성·입력 SHA 보존, EEXIST 차단, 오류 시 출력 없음, 2MiB 초과 차단, symlink 차단, 잘못된 옵션 차단.
- **중요 제한:** CLI 자체는 실제 GitHub 파일이지만 테스트 실행 시 `xlsx-cells.mjs` 및 `xlsx-package.mjs`만 별도 **시험용 stub**으로 교체했다. 따라서 이것은 **Native XLSX CLI 파일 I/O 고립 검사**이며, 실제 OOXML/XLSX 추출·package validator를 통합한 E2E 및 최신 `npm run test:preprocessing` PASS 근거가 **아니다**. Stub 및 smoke 테스트는 GitHub 제품 코드로 푸시하지 않았다.
- 프로덕션·Windows/CI·고객 XLSX·상용출시는 미검증/미승인. 다음 1순위: 18+ 실제 원격 blob과 일치하는 Node 체크아웃에서 원본 extractor/validator와 함께 XLSX·CSV Native 통합 QA. Private 소스 공개·유료 CI·타 브랜치 수정 금지.

## 2026-10-27 KST — preprocessing P2 TXT/MD Native feature
- 신규 `preprocessing/plain-text.mjs`, `preprocessing/text-cli.mjs`, `tests/plain-text.test.mjs` 도입; core·CLI·test actual Node v22 test **5/5 PASS**, Git blob SHA 모두 local matched. 원문 SHA/줄·offset·paragraph review 및 exclusive output. 기존 CSV/XLSX 변경 없음. Markdown 의미분석과 PDF/DOCX/HTML 미구현. 전체 Native preprocessing 및 Windows/CI/Production NOT_RUN. 자세한 10항은 `PREPROCESSING_HANDOFF.md` 최신 참조.

## 2026-10-27 KST — preprocessing P2 HTML/TXT schema
- Code added: HTML UTF8 subset parser, local HTML CLI, strict TXT/HTML Draft 2020-12 JSON Schema, 9 newly checked Node tests. Local Native **9/9 PASS**, Git blob parity **6/6**; Python jsonschema normal/tamper checks pass. No external NPM/LLM/API or runtime cost. Whole latest `npm run test:preprocessing`/Windows/CI/real customer documents/Production NOT_RUN. User's MVP→design gap→security order maintained; no other branch touched.

## 2026-10-27 KST — P2 DOCX Strict JSON MVP
- New DOCX safe ZIP + basic Word XML paragraph/table text importer, CLI and Draft202012 contract. Native Node22 DOCX standalone 10/10 PASS; python-docx synthetic real file CLI PASS; independent JSON Schema valid/tamper PASS; 4 local-tested Git blobs exact SHA match. Entire preprocessing Native suite/Windows/CI/Production NOT_RUN. No paid service, public source, user data or other branch modifications.


## 2026-11-11 KST — SMAX² P8–P12 50→70% provisional engineering milestone
- Parent stable preprocessing HEAD before feature: 3830cb276f560d58e8181ba384d9cbe64815737c; work only in private feature/prep-self-owner-mapping-p8. New P8 owner HTML/source SHA-bound mapping (+5pp); P9 read-only P3 PREP/SELF selected mapping handoff (+5pp); P10 exact P5/P6 report bridge (+5pp); P11 exclusive HTML/JSON/SHA receipt + verifier (+5pp); P12 CLI orchestration not double-counted. **Product final engineering progress 70% provisional**, not customer release/real E2E acceptance.
- Node22.16 Linux source-exact local tests 17 PASS / 0 FAIL / 0 SKIP (P8 6, P9 4, P10/11 7). New six module/test blobs exactly match local tested bytes; local Chromium set_content owner form JSON download PASS with page-error0/outbound-request0, direct file:// blocked by administrator policy. Separate actual GitHub P3 PREP/SELF source isolated V8 composite calculated synthetic 100.00 - 10.00 = 90.00 using **fake cryptographic hash/Buffer shims**; actual GitHub P6 renderer validated P10 report/HOLD/tampering; P12 contract V8 with injected services. These are NOT full Native repo/CLI/Windows proofs.
- Full private npm test/test:preprocessing, real file-backed P8-P12 CLI with original dependencies, Windows PC/Edge, original SELF UI integration, customer rights, licenses, package installation and actual sale NOT VERIFIED. No paid CI, API, cloud, billing or production run. **RELEASE HOLD / no production URL**, approval NOT_GRANTED. Existing stable preprocessing/frontend/backend/main unchanged.
- Added package.json test:preprocessing registrations for 3 exact new Native test modules; whole inherited suite NOT RUN. Details in docs/SMAX_PREP_SELF_P8_P12_70_20261111.md. Next: non-stub complete checkout regression and Windows acceptance, then guarded integration with stable branch only after acceptance.


## 2026-11-11 KST — SMAX² P13/P14 reverify and P9 output boundary
- Repo `hibi89/SMAX` Private, branch `feature/prep-self-owner-mapping-p8`. Prior baseline feature HEAD `67fc66f9b8cab73ed877917165935cf1d5b5e027`; newest security/feature implementation `da8d4a5d691e5241ea1269ef6370016a0b4581a4` plus newer documentation.
- Product P13: local `self-owner-delivery-cli.mjs --verify ABSOLUTE_PACKAGE_DIR` independently verifies the existing three-file package, not an owner approval/repair command. Function SHA `378c56e087c79d9e4de87d122c23cd2c47e603d9`. P9 strict contract/output boundary `da8d4a5d691e5241ea1269ef6370016a0b4581a4`. Test additions include P13 tamper checks and P14 real CLI spawn/temp-file acceptance `tests/self-owner-e2e.test.mjs` registered in npm script.
- Developer-run limited V8 isolated positive/negative exercises: P13 1 valid + 3 bad arguments rejected; P9 1 valid + 5 forged previews rejected. **Not Native Node test evidence**. Actual `npm run test:preprocessing` and `npm test` on complete private checkout: **NOT_RUN**; P14 suite checked in but **NOT_RUN**; Windows 10/11, Edge `file://`, customer onboarding, SELF frontend product integration, installer, CI: **NOT_VERIFIED**.
- Completion: **70% provisional unchanged → 70%**. 85% goal pending substantive native/full integration/customer readiness evidence, RELEASE HOLD. No stable branch merge, customer original data, external transfers, public source, paid API, accounts, GitHub Actions, production/Cloudflare changes.
- New scope evidence: [P13/P14 verification notes](docs/SMAX_OWNER_PREVIEW_REVERIFY_P13_P14_20261111.md). Next task: exact-SHA full native `npm run test:preprocessing` and `npm test`, fix observed failures, Windows and authentic SELF entry flow, then reassess. Hub `kmong-productization` sync is a separate required action.

## 2026-11-11 KST — P15 BOM 원본 바이트 SHA 무결성 결함 수정
- 실제 제품 코드 `preprocessing/self-preview-cli.mjs`에서 UTF8 BOM 제거로 원본 파일 SHA256과 P8/P9 매핑 초안 SHA가 불일치할 수 있던 결함을 수정. `new TextDecoder('utf-8',{fatal:true,ignoreBOM:true})`로 읽기 결과에 BOM 유지, CSV 헤더 파서는 기존처럼 논리 헤더에서만 BOM 제거. 기능 커밋 `e0b765b38d318bd888744b2899c97b5fa6dbc078`, 테스트 커밋 `f105004da9b3fe887178af72bc3b58e9b95cfc3d` 및 `ba95856172bd8d62f88ef08ccbeaad7b7298b450`.
- Node 22.16 Linux에서 **원격 GitHub 소스에서 추출한 실제 파일 읽기 함수**를 Native 별도 테스트하였으며 BOM 포함/미포함 원본 SHA, 원본 불변성, 잘못된 UTF8/크기 초과/symlink 차단 **7 PASS/0 FAIL**. 전체 import graph 또는 전체 Native `npm run test:preprocessing` 실행 증거 아님. 체크인 P15/P14 E2E·전체 npm test·Windows Edge·고객/SELF UI **NOT_RUN**.
- 최종완성률 **70% 잠정 유지**, 목표 85%; RELEASE HOLD. `preprocessing` 안정/다른 제품 브랜치 원본 미변경. [P15 상세](docs/SMAX_P15_BOM_SOURCE_SHA_20261111.md).

## 2026-11-11 KST — P16 FD-bound local review-bundle verifier
- Product feature `5f2ccfa04c9fe0a04277f06135925249a4728470` / production blob `66bc6dcbde6d0858337d5bddf3fd080f7279b20a`: P11 `manifest.json`/`receipt.json`/`report.html` existing read-only verifier now opens guarded file descriptors with O_NOFOLLOW when supported, bounded reads, bigint pre-open/open/post-read pathname+fd identity checks, and guaranteed fd close. Protects symlink swap/path replacement races observed between old lstat/readFile/lstat, without modifying receipt schemas/output paths/approval.
- Regression test commit `f0e77a9138b415bbe7cfe8560b0c1f618ee06d1e` blob `167928a8db2cdee069460184639854a12581a211`; registered in `npm run test:preprocessing` by `079d630b741710eb8c7d86d451738e56e466772a`. Actual local source/test **exact GitHub blob parity**; Linux Node22.16 `node --test` isolated real production module **7 PASS / 0 FAIL / 0 SKIP** with test renderer/synthetic receipts, including forced pre-open/after-open symlink/file swaps, HOLD and tamper, originals unchanged. Not a full repo E2E.
- Full repo `npm run test:preprocessing`/`npm test` and P8–P16 cross-module native CLI/Windows Edge/customer frontend/installer: **NOT_RUN**. This is real, limited file-level QA; RELEASE HOLD and whole-product **70% provisional unchanged**, 85% not reached. No stable branch merges or paid runner. [P16 evidence](docs/SMAX_P16_FD_BOUND_PACKAGE_VERIFY_20261111.md).
