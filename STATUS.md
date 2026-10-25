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


## 2026-10-25 KST — 스총 실행 2: 사장님 SELF 로컬 CSV 변환 UI 연결 (frontend)
- 브랜치 `frontend`. `backend`의 검증된 `site/csv-transform.mjs` / `tests/csv-transform.test.mjs`를 **Git blob 동일**하게 복사하여 프론트 통합. 기존 `site/app.mjs`, `site/styles.css`만 최소 변경; `tests/csv-ui.test.mjs` Node ESM 회귀 테스트 신규 작성.
- 화면 흐름: 사장님 `엑셀·CSV 통합` 템플릿 선택 → 챗봇 패널 → **로컬 CSV 파일** 선택 → 날짜/상품/금액의 원본 열 3개 직접 지정 → `변환·미리보기` 클릭 → 처음 최대 5행과 검토/중복 개수 확인 → `SMAX_STANDARDIZED.csv` 다운로드. CSV 결과는 **변환 성공 시에만** 다운로드 버튼이 나타남. 다른 9종은 설계 가이드 초안 지위 유지.
- 안전/복구: 2MB 제한, CSV 확장자 검사, 이스케이프된 데이터 미리보기, 매핑 변경 시 과거 결과 폐기, 파일 교체/템플릿 전환/초기화 시 CSV 원문·결과 메모리 해제. 비동기 파일 읽기 중 사용자 전환 시 `csvGeneration` 검증으로 오래된 파일 결과 반영 방지. 사용자가 원본 파일을 덮어쓰지 않음, 서버 호출 없음.
- 실제 시험: V8에서 **실 GitHub `site/app.mjs`/`site/core.mjs`/`site/templates.mjs`/`site/csv-transform.mjs` 소스를 읽어 스텁 DOM 이벤트로 실행한 17 시나리오 모두 PASS(실제 변환, 오류 2행, CSV 다운로드, stale state, 파일 확장자, HTML escaping). 본 검증은 **가상 DOM**이며 실 Chromium/Safari/Android/Windows E2E가 아님.
- 영구 회귀 `tests/csv-ui.test.mjs` 작성; `npm test` 실제 Node 실행은 **미검증**(현재 GitHub connector로 소스 검수 및 V8 모의 DOM 검사만 수행). 기존 코어 테스트의 과거 10 PASS는 `backend` 별도 실행 기록이며 이번 통합 테스트 결과와 합산해 Node 전체 PASS라 표시 금지.
- Code SHA: `site/app.mjs` 최종 업로드 `b746d5de0691e950c42e9b714f4455ec219d3d84`, CSS `2148bc8020571d0ba960a119b54edb16be837bb6`, UI 테스트 최종 `14aa8e0a3d9b17bf0c64683d6653867fa13908b4`. 최종 frontend HEAD는 문서 반영 후 실제 재조회.
- `main`에 별도 로고 관련 최신 커밋이 있어서 (`91549b01323c6d8f6a1d277c5bde2302c003f949` 관측), `main`을 덮어쓰거나 merge하지 않음. 병합 전 로고 CSS/HTML 최신 변경과 신규 CSV UI CSS를 충돌 없이 조정 필요.
- 진행/차단: **코드 통합과 V8 UI 시뮬레이션 완료**; 실제 브라우저·Windows·`npm test`, 사용성, 공개/유료 코드 분리, 패키징·크몽 판매 품질은 **미검증/미완**. Cloudflare 공개/크몽 상품 게시/유료 서비스/개인정보 수신 없음.
- 다음 작업 우선: 안전한 정적 웹 쇼룸과 유료 SELF 코어/로컬 전달물 분리의 2안 비교 및 구현 계획 → **Node 전체 테스트/실 브라우저 QA** → Windows 로컬 패키징 및 크몽 상품 설명·등록 심사 준비. 2026-11-07은 **최종 상한이지 목표 소요시간이 아니며**, 일찍 검증 통과하면 즉시 완료 판단.


## 2026-10-25 KST — 스총 실행 3: 실제 Node 코어 재검증 / 공개·유료 배포 코드 분리
- 사용자 지시: 11월 7일은 **완료 마감 상한**이며 일찍 끝나면 조기 완료. 범위 확대·외부 공개·비용은 승인되지 않음.
- 실 테스트: 이번 턴 컨테이너 Node **v22.16.0**, 이전 코어의 원격 Git blob과 일치한 로컬 `site/csv-transform.mjs` (`5b87530f...`), `tests/csv-transform.test.mjs` (`5f2dda8d...`) 실행. `node --check` 2건 PASS; `node --test tests/csv-transform.test.mjs` **10 PASS / 0 FAIL**. 프론트 전체 `npm test`/실 Chromium/Windows는 **실행하지 못해 미검증**.
- 배포 선택 A: `public-site/index.html`은 읽기 전용 공개 쇼룸(템플릿 10종·판매 전 안내, JS/유료 코어/파일 업로드/자체 결제 없음); `site/` SELF 내부 코드 보존. `wrangler.jsonc` 기본 `assets.directory="./public-site"`로 안전 수정. 기존 `./site` 그대로 배포하면 유료 기능이 노출될 위험을 줄임.
- 검사: GitHub 원격 `public-site/index.html` 및 `wrangler.jsonc` 실제 재조회 후 공개 코드 경계/브랜드/허위 판매/앵커 등 정적 **11 PASS / 0 FAIL**(V8 기반 원격 콘텐츠 검사). 이를 위한 `tests/public-boundary.test.mjs`의 Node 실행은 **별도 미검증**, 브라우저 렌더링도 미검증.
- `main`의 최신 공식 로고 `SMAX² / SMAX SQUARE / 함께 만드는 AX광장`를 `frontend site/index.html`에 동일 Git blob으로 반영했고 `site/styles.css`에 대응 CSS 규칙 추가. 기존 CSV 스타일 유지. 공개용 쇼룸도 동일 로고 텍스트 사용.
- QA·설계 문서 `docs/PUBLIC_PRIVATE_RELEASE_BOUNDARY_20261025.md`, `README_LOCAL.md` 공개/SELF 경계 수정. GitHub 외부 공개/Cloudflare 계정 연결/크몽 상품 등록/현금 결제 **0회**.
- 다음 안전 순서: 실제 `frontend` 전체 `npm test`와 Chromium/Windows 파일 업로드→매핑→실변환→다운로드 검증, 로컬 SELF 패키징 후 샘플 다운로드/사용 가이드, `main` 최신 로고 커밋을 존중한 비강제 통합 계획. 실제 Cloudflare 배포/크몽 등록은 별도 승인 필요.
- 실제 브랜치/HEAD는 이번 STATUS 및 HANDOFF 문서 커밋이 끝나면 원격 재확인. 2026-11-07 마감 변경 없음.


## 2026-10-25 KST — 스총 실행 4: SELF 오프라인 단일 HTML 패키징 빌드 추가
- 최신 사용자 `ㄱ`에 따라 **실사용 전 준비 작업**: 기존 `site/` ESM 4개와 스타일/HTML을 Node 개발자용 빌드 명령 `npm run build:self`으로 **단일 `dist/SMAX_SELF_OFFLINE.html`**로 묶는 `scripts/build-self.mjs` 구현. 기존 파일은 덮어쓰지 않고 생성물 `dist/`는 `.gitignore` 처리. `package.json`에 script 등록. 고객에게 Node/Python 설치를 요구하지 않는 방식 목표.
- 설계와 안전: 고정 모듈 순서, import/export 계약 변경 감지 시 실패, 네트워크 API 호출 및 `</script>`/`</style>` 위험 차단, DOMContentLoaded 후 초기화, 인라인 JS/CSS SHA-256 CSP + `connect-src 'none'`. **소스 열람/재배포를 원천 방지하지 못하므로 사용권 강제 구현했다고 주장 금지.**
- 신규 `tests/offline-package.test.mjs` 4개 Node 테스트 작성(아직 실제 Node `npm test` 실행 검증 전); 합성 예제 `examples/SMAX_SELF_SAMPLE.csv`, 고객 안내 `docs/SELF_CUSTOMER_QUICKSTART_20261025.md`, 상세 계약 `docs/OFFLINE_SELF_PACKAGE_20261025.md`; `README_LOCAL.md` 업데이트.
- 직접 검증: GitHub 원격 모듈 텍스트를 메모리 내 같은 순서로 연결한 V8 합성 UI 검사 **6/6 통과**(업로드→매핑→검토 2행→UTF-8 BOM CSV 출력→전환 초기화). 실제 `scripts/build-self.mjs` 소스를 V8에서 Node 의존성 모사 후 빌드 함수 실행, 모듈 삽입/CSP 교체/최종 구문 검증 **7/7 PASS**. 앞선 원격 ESM 순서·기초 렌더 **8/8 PASS**. 이들은 **Node 파일 출력이나 실브라우저 검증이 아닌 V8 모의 검사**.
- 실패/제약: 이 컨테이너에서 비공개 GitHub 저장소 직접 Git clone은 DNS 장애(`Could not resolve host: github.com`)로 불가능. GitHub 커넥터로는 파일 읽기·커밋 검증 가능하나 컨테이너로 저장소 전체를 안전하게 장착하지 못해 **실 `npm test` 및 `npm run build:self`/실 Windows Edge·Chrome file:// QA는 미검증**. 추측으로 PASS 처리 금지.
- 별도 유료/공개 사업·로컬 고객 파일 전송·실결제·크몽 등록·Cloudflare 배포 **모두 미실시**. `main`/`backend` 미변경. 최종 frontend 원격 HEAD는 문서 커밋 완료 후 재조회.
- 다음: 전체 Node 단위·통합 테스트와 출력 HTML SHA·크기 재현성 확인 → Windows Chrome/Edge CSV E2E/Console/Network 확인 → 사용권/지원/환불·크몽 설명 검수 → 명시 승인 후 안전한 main 통합·정식 등록 여부 결정. 2026-11-07 최종 상한(가능하면 조기 완료) 유지.


## 2026-10-25 KST — 스총 실행 5: 브라우저 통합 QA 자동화 추가·환경 차단 분류
- Private `frontend` 최신 HEAD에서 시작해 `scripts/qa_browser.py` Chromium/Edge 오프라인 E2E 스크립트 작성·커밋. `package.json` 명령 `qa:browser` 추가. 표준 합성 `examples/SMAX_SELF_SAMPLE.csv` 입력으로 파일 로드/3열 매핑/오류·중복 검토 2행/결과 4행 CSV·BOM 다운로드/잘못된 매핑 차단/375px/외부 요청·JS 오류 0을 검사하도록 구성.
- QA 스크립트 구문: **로컬 Python `python -m py_compile` PASS**, 원격 `scripts/qa_browser.py` Git blob SHA `eab5a40c5445113bbf874d36ae9a8cce7a32a445`와 로컬 `git hash-object` 일치 확인.
- 예외 상태 계약: `0=PASS`, `1=FAIL`, `2=INPUT_MISSING`, `3=BLOCKED`(브라우저 executable 또는 관리자 보안정책). 로컬 프로그램 미준비에서 exit 2, 가상 최소 HTML+CSV 조건에서는 Chromium Playwright bundled 실행파일 없음 → JSON `BLOCKED`, exit 3 실제 확인.
- 실 브라우저 환경 확인: 시스템 Chromium을 별도 지정하여 최소한의 **비제품** HTML을 `file://`과 localhost에서 열었으나 양쪽 모두 `ERR_BLOCKED_BY_ADMINISTRATOR`. 본 환경 정책 차단이므로 SELF 제품 결함 증거가 아니며 **실 제품 브라우저 QA PASS가 아님**. 동일 시도 반복하지 않고 별도 허가된 Windows Edge/Chrome 환경에서 재검증 필요.
- 기존 Node v22.16.0 로컬 백엔드 해시 일치 파일 `node --test tests/csv-transform.test.mjs` 10 PASS / 0 FAIL 이번 턴 다시 확인. 현재 `frontend` 전체 `npm test`, 실제 `npm run build:self` 산출물 생성, 실 `file://` SELF E2E, Windows GUI는 **미검증**. 크몽 판매/Cloudflare 배포/개인정보 외부 전송 0건.
- 실행 문서 `docs/QA_BROWSER_RUNBOOK_20261025.md`, `README_LOCAL.md` 업데이트. `main`, `backend` 그대로 보존. 다음 안전 최우선: 승인된 실행환경에서 전체 Node 및 단일 HTML 빌드 테스트 → Windows Edge E2E 증거 → 제품 전달·크몽 등록 승인 게이트. 11월 7일은 상한이며 조기 완성 지향.


## 2026-10-25 KST — 스총 실행 6: Windows 패키징 오류 교정·원클릭 QA 게이트·크몽 초안
- **확인된 Windows 이식성 결함 수정:** `scripts/build-self.mjs`의 `join(root,'dist')+'/'` POSIX 구분자 비교는 Windows `C:\\...\\dist\\...` 경로에서 정상 빌드를 거절할 수 있음. OS별 `dirname(out) === join(root,'dist')` 검사 및 `mkdirSync(dirname(out))`로 변경. 빌더 수정 커밋 `ec17fec9d6bb6d2275e58c904c1e07dd73cfa39b`.
- **테스트 명령 Windows 호환:** `package.json`에서 `node --test tests/*.test.mjs`(CMD.exe 와일드카드 확장 의존)를 `node --test`(Node 자동 탐색)로 변경. 실제 Node v22.16.0 로컬 백엔드 디렉터리에서 `node --test` 10/10 PASS. 관련 수정 `7f460449fe51a9beb65732a9e6b78a18892800c5`.
- `tests/offline-package.test.mjs`에 `node:path.win32`의 Windows 경로 동작 회귀 1건 추가 (기존 4→5개 검사). 별도 로컬 Node에서 동일 `win32.join/dirname` 표현 정상 검증. 최신 전체 테스트 스위트의 Node 실행은 아직 미검증.
- **개발자 원클릭 QA** `npm run qa:release` 추가 → 5개 지정 테스트 파일 존재확인 → `node --test` → `scripts/build-self.mjs` → HTML의 JS/CSS SHA-256 CSP 및 외부 스크립트 부재 → Cloudflare 공개 폴더/파일 안전경계 → 합성 CSV 4행/검토 2행 검사 → `dist/SELF_QA_REPORT.json` 기록. 고객 파일/외부 서비스/배포 0건. 성공 표시 `LOCAL_NODE_PASS_BROWSER_NOT_TESTED`; Windows·실 브라우저 및 판매 승인과 별개.
- QA 게이트 실행 로직은 GitHub 원격 소스 기반 V8 가상 런타임에서 **정상/단위 테스트 실패/CSP 오류/필수 테스트 누락 4/4 예상 판정**. 이것은 실제 `npm run qa:release` 실행 통과가 아님. 실제 장착된 로컬 코드에서 Node 22 백엔드 코어 10/10 재실행 완료.
- 문서: `README_LOCAL.md`에 명령/판정/주의 추가. `docs/KMONG_SELF_LISTING_DRAFT_20261025.md`에 크몽용 실제 제공범위·미검증 사실을 구분한 상품 문구 초안과 가격/지원/환불 승인 게이트 작성. 상품 등록·결제·Cloudflare 배포는 **미진행**.
- 차단/다음 작업: 최신 Private frontend 소스를 전부 실제 Node 실행환경에 확보해 `npm run qa:release` 전체 테스트/HTML 생성/SHA 기록. 이후 Windows Edge/Chrome 실제 로컬 HTML file:// UI/다운로드 검증 및 적합성 확인. 실패하면 수정 후 재실행. 배포 승인 전 `main`/브랜드 안전 통합 검토. 개발 최종 상한은 **2026-11-07**, 가능한 조기 완료 지향.
- 소스 변경은 `frontend` 브랜치 한정, `main`/`backend`는 미수정. 최종 원격 커밋 SHA는 HANDOFF 반영 이후 실제 확인.


## 2026-10-25 KST — 스총 실행 7: GitHub 실 CI 시도 + Windows 개발자 QA / 실패시 출고 차단
- 기존 전체 Node 테스트/HTML 패키징 실제 검증을 추진하기 위해 Private `frontend`에 `.github/workflows/self-ci.yml`을 생성하여 최초 **GitHub Actions 실제 실행** 요청. run id `40182096760`, head `54279a7d4aa4626d52943e5ef683b22dfe5acd8a`, 최종 상태 **failure**. 작업 `local-qa`의 단계 목록이 `null` 또는 `[]`이고 다운로드 로그는 blob 404로 반환되어 **Node 전체 테스트가 실행되었거나 테스트 실패했는지 판정 불가**. 원인 (액션 사용 제한/runner 문제 등) 확정할 근거 없음. 비용·실패 재발을 막기 위해 `cfc5f373d0b58f7f3891086024e858cd83137cf8`에서 workflow `push` 제거하고 `workflow_dispatch`만 남김. default branch에 동일 workflow가 없으면 GitHub UI에서 수동 실행 가능한지도 별도 확인 필요.
- **Windows 개발자 QA 진입점 추가:** `QA_SELF_WINDOWS.cmd`(더블클릭 개발자 검사기) → `scripts/VERIFY_SELF_WINDOWS.ps1` → Node >=20 확인 → `npm run qa:release` → QA JSON 상태·HTML SHA-256·파일 실제 byte 수 확인. 임의 보안 정책 무력화 없이 PowerShell RemoteSigned; 실패/미검증이면 판매·배포 금지. 고객에게 Node/PowerShell 요구하는 상품 기능이 아님.
- **릴리스 실패 시 과거 산출물 오판매 방지:** `scripts/qa-release.mjs` 실패 핸들러에서 이전 `dist/SMAX_SELF_OFFLINE.html`을 삭제하고 `SELF_QA_REPORT.json` FAIL을 새로 기록하도록 개선(커밋 `884d054ccf1075151de77770bdebb845a8935b71`). GitHub 최신 소스 V8 모의 Node/파일시스템 4조건(정상/Node 테스트 실패/CSP 실패/테스트 누락) **4/4 기대 결과**; 실제 전체 Node QA는 아직 미검증.
- 이번 턴 **실제 컨테이너 Node v22.16.0** `/mnt/data/smax_backend_work`의 원격 Git blob 동일 파일로 `node --test tests/csv-transform.test.mjs` 실행: **10 pass/0 fail**. 원격 blob: `site/csv-transform.mjs` `5b87530f0a394122a25b3a1a61f889b03bbdbeea`, `tests/csv-transform.test.mjs` `5f2dda8d096c4e9ffd38797471f81ad267dbd0bf`. 이 단위 결과를 전체 suite PASS라고 표시하지 않음.
- `README_LOCAL.md`에 Windows 개발자용 더블클릭 절차 및 CI runner 불확실성 기록. 다음 작업: 최신 Private frontend 전체 소스가 접근 가능한 Windows/Node 실행 환경에서 `QA_SELF_WINDOWS.cmd` 또는 `npm run qa:release` 실제 실행 → HTML SHA·JSON `LOCAL_NODE_PASS_BROWSER_NOT_TESTED` → Edge/Chrome `file://` UI/다운로드 실제 검증(`scripts/qa_browser.py`) → 그 후 사용자 승인에 따라 브랜치 안전 병합·크몽 심사 준비. 외부 배포/크몽 등록 미실시, 2026-11-07 개발 상한 유지.


## 2026-10-25 KST — 스총 실행 8: CSV 연도/비가시적 수식 입력 하드닝 실 테스트
- 사용자 `ㄱ` 후 실제 로컬 Node 22.16.0 검증: 원격 GitHub 파일과 blob 해시가 정확히 일치하는 `site/csv-transform.mjs`(`2b004fb9474743a95294b42baf7f875602644a54`), `tests/csv-transform.test.mjs`(`5f2dda8d096c4e9ffd38797471f81ad267dbd0bf`), `tests/csv-hardening.test.mjs`(`9756435b6cdb0b3b968bd86339e83b7e63743948`)를 Node `--test`로 실행해 **12/12 PASS**.
- `backend`는 동일 코어에 기존 테스트 2건 추가, 별도 hardening 2건 추가로 **14/14 PASS**(원격 변경 해시 대응 로컬 복사본). 전체 `frontend npm test`의 실행 증거가 아님.
- 확인된 오류 및 수정: 입력 `0000-01-01`을 정상 거래일로 통과시키던 문제 → `INVALID_DATE`와 `NEEDS_REVIEW` 유지. 비가시적 문자가 수식형 문자열 앞에 있을 경우 보호 접두부가 누락될 수 있는 문제 → 작은 따옴표를 붙이고 `FORMULA_PROTECTED`로 기록. 원본 행을 삭제하지 않음.
- 변경 `frontend` `site/csv-transform.mjs`를 `backend`와 동일 Git blob로 동기화; `tests/csv-hardening.test.mjs` 별도 생성, `scripts/qa-release.mjs` 필수 테스트 파일 검사 명단에도 추가. `main` 미변경.
- Private Github을 로컬 컨테이너에서 직접 clone하는 것은 DNS 실패로 막혀 있음. 따라서 전체 UI/패키징 Node suite, 단일 HTML 실제 빌드, Windows 브라우저 E2E는 **여전히 미검증**. 기존 GitHub Actions 1회는 단계 로그 없는 failure이며 재시도하지 않음.
- 앞으로 테스트에 사용하는 코드가 원격 소스 SHA와 일치하는지 확인 후 실패/성공 근거를 기록하고, 안전한 Windows QA 환경에서 `QA_SELF_WINDOWS.cmd` 및 Edge 실기기 점검 진행. 상용 판매/Cloudflare 공개/고객 데이터 수신/비용 지출 없음. 11월 7일 개발 상한 유지.

## 2026-10-25 KST — CSV 합성 데이터 속성 테스트 영구 회귀화
- `tests/csv-property.test.mjs`를 backend와 동일 Git blob으로 추가. 256개 deterministic 합성 CSV를 매 실행에 생성하고 원본 행수/검토상태/UTF-8 BOM/같은 입력 결과 일치를 확인.
- 로컬 Node v22.16.0 실제 `node --test tests/*.test.mjs` **CSV 한정 13/13 PASS** (원격 해시 동일 4개 파일: site/csv-transform.mjs, tests/csv-transform.test.mjs, csv-hardening.test.mjs, csv-property.test.mjs). 별도 랜덤 입력 1,600건도 누락 행 0건.
- `scripts/qa-release.mjs`의 필수 테스트 목록에 `csv-property.test.mjs` 추가. 실제 전체 `frontend npm run qa:release`, 단일 HTML 생성, Windows Chrome/Edge E2E 및 사용자 판매 승인 미완. 로컬 사용자 권한/환경 제약 우회나 제품 외부 공개 없음.


## 2026-10-25 KST — 스총 실행 9: 오프라인 HTML 자체 통합 스모크 4종 추가
- 사용자 `ㄱ`: 사장님 SELF 실제 전체 검증 조기 완료 우선. 최신 `frontend` 기준으로 `tests/offline-ui-smoke.test.mjs`를 추가, `scripts/qa-release.mjs` 필수 테스트 목록에 포함. `main`, `backend` 수정 없음.
- 테스트는 `bundleOfflineSelf()`로 실제 `site/index.html`+CSS+템플릿+코어+CSV 엔진+app을 **단일 HTML 인라인 JS로 생성**한 다음 Node `vm.runInNewContext()`의 synthetic browser DOM에서 실행하도록 설계. 검사 4개: ① CSV 업로드/3열 명시 매핑/원본 3행 보존/오류 2행/UTF-8 BOM 다운로드 ② 잘못된 매핑·다른 템플릿 이동 시 과거 결과 폐기 ③ 비동기 파일 읽기 중 템플릿 변경 시 오염 방지 ④ 보이지 않는 문자로 시작하는 수식형 입력 `FORMULA_PROTECTED` 처리/출력.
- GitHub 실제 소스 기준의 V8 코드 실행에서 초기 테스트 1건은 테스트 모의 브라우저 `window` 누락으로 FAIL 발생. 제품 코드가 아니라 fixture 누락으로 확인하고 `window:{}` 추가(`55299c41623e68e9c81215b7aee1302bc263770b`). 이어 테스트 2건 더 확장해 **가상 Node API 환경에서 4/4 PASS**. GitHub 최신 테스트 blob `0289beb9f77d2ae8416cdda7f4a6226317cbe69e`.
- 실제 현 컨테이너 Node 22.16.0에서 GitHub 블롭 동일 `smax_frontend_csv_verified` 4파일을 `node --test tests/*.test.mjs`로 재실행하여 **CSV 부분 13/13 PASS**. 오프라인 패키지 내의 JS가 V8에서 합성·파싱되고 테스트 4건 모의 실행을 통과했으나 **실제 전체 `npm test`, Node `vm` 테스트 파일 실실행, `npm run build:self` 실제 파일 생성, Windows 브라우저 E2E는 아직 미검증**. 이 4건을 native Node test PASS라고 주장 금지.
- Private Repo 환경: GitHub Actions 첫 실행은 단계 로그 없이 failure, 수동 전용 전환. 직접 Private repo clone은 외부 DNS 접근 차단. 실행 가능한 승인된 Windows 개발 환경에서 `QA_SELF_WINDOWS.cmd` → `npm run qa:release` → SHA 결과 및 Edge E2E를 확인해야 출시 승인 후보.
- 공개/판매/외부 API 호출, 고객 개인자료 전송·유료 지출 0건. 기한 2026-11-07 상한 유지, 조기완료 허용.


## 2026-10-25 KST — 스총 실행 10: 실 테스트 환경 병목 확인 + 10종 가이드 출력 통합 검증
- 목표: 이전 실행부터 지연 중인 **전체 `npm test`와 단일 HTML 실생성**. 최신 Private `frontend` HEAD를 확인하고 컨테이너 Node v22.16.0/네트워크 상태 및 로컬 폴더를 점검. 기존 `/mnt/data/smax_full_checkout`에는 복원 도구만 있고 최신 저장소 소스 전체는 미존재. 컨테이너에서 `git ls-remote https://github.com/hibi89/SMAX.git`는 DNS `Could not resolve host: github.com`, GitHub connector의 원격 파일을 별도로 복원하려던 인코딩 전송은 검사 실패 → **원격 전체 소스를 해시 일치하게 로컬 설치하지 못함**. 따라서 `npm test`, `npm run build:self`를 현재 HEAD 대상으로 실행했다고 주장할 수 없음.
- 별도 성과: `tests/offline-ui-smoke.test.mjs`에 실제 출시 가치가 있는 10종 교육/설계 템플릿 모두에서 `AX_BLUEPRINT_<id>.json`(해당 ID, `NEEDS_REVIEW`, 미구축 상태 표시) 및 `AI_BUILD_PROMPT_<id>.md`(개인정보·외부 전송 주의/검증 체크리스트) 다운로드를 검증하는 통합 회귀 1건 추가. 구현 코드 변경 없이 제품 출력 검증 확대. 커밋 `e0c52fdc54b48325e9ce2109dce833d3a8a1adbf`, 최종 테스트 파일 blob `260e9eaaf7aa011149a8b90afd65d6cd484900cc`.
- GitHub 원격 `site/` 6파일 및 빌드 코드/신규 테스트 내용을 V8 모의 Node/브라우저 환경에서 재구성해 실행한 통합 **5/5 모의 검사 PASS**: 실제 CSV 입력·다운로드, 리맵/템플릿 변경 초기화, 지연 CSV 파일 읽기 차단, hidden-prefix formula 보호, 10종 JSON+MD 출력. 모두 **V8 모의 검사이고 실제 Node `vm` / Chromium E2E가 아님**.
- `main`과 `backend` 미수정. Cloudflare 실배포/크몽 실등록/고객 파일·유료 API 사용·지출 없음. 장기 병목은 승인된 Windows/Node 실행 환경에서 Private frontend 전체 다운로드 후 `QA_SELF_WINDOWS.cmd` 또는 `npm run qa:release`를 실제 실행해 0 FAIL·SHA·크기 증거 확보하는 것. 이후 Windows Edge `file://` 다운로드 검증. 2026-11-07 마감 상한 유지.

## 2026-10-25 KST — 실행 12: Native 34/34 PASS
- 최신 스몽이 카피 수정 및 회귀 테스트 1건 추가. 실제 Node 22.23.4 전체 34 PASS/0 FAIL, qa:release exit 0. SELF HTML 73,352 bytes, SHA-256 94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca.
- Linux ARM64 Chromium 실행은 시스템 공유 라이브러리 부족으로 시작 전에 차단. Windows 실기기 QA 미완. 상세 기록: docs/QA_CHROMIUM_BLOCKER_AND_BRAND_COPY_20261025.md. 배포·크몽 등록 미진행.

## 2026-10-25 KST — 스총 실행 13 / 실제 Chromium 오프라인 E2E PASS
- 최신 `frontend` 실빌드 HTML 73,352 bytes / SHA-256 `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca`를 Linux ARM64 실제 Chromium 156으로 `file://` 오프라인 상태에서 실행하여 CSV 4행/검토 2행, 결과 다운로드 UTF-8 BOM, 잘못된 매핑 차단, 모바일 입력 기능, HTTP 요청 0/JS 오류 0 확인.
- JSON/AI 가이드 10종 각 2개, 총 **20개 파일의 실제 브라우저 다운로드 PASS**. 자동 다운로드 세션 제한을 회피하려 템플릿별 격리 브라우저 컨텍스트를 사용. `scripts/qa_browser.mjs`에 이를 재실행 가능한 독립 Node+Playwright QA로 작성하고, **원격과 동일 Git blob** 기준 실제 Node `node scripts/qa_browser.mjs` **exit 0 / 7 E2E checks PASS**. `npm run qa:browser:node` 명령 추가. 기존 Python QA 유지.
- 이전 Chromium 환경 차단은 `/tmp`에만 Debian 공유 라이브러리·Fontconfig를 추출하여 해결(연결 프로젝트 소스·서비스 설정 변경 없음). **Windows 실기기 Edge/Chrome E2E는 미검증**. 상세 증거 `docs/QA_REAL_CHROMIUM_E2E_20261025.md`. 개발자 전용 Node 모듈, 환경변수, 검사 보고서 등이 실수로 푸시되지 않도록 `.gitignore` 확대. Cloudflare 공개/크몽 등록/실판매 미진행. 다음 최우선 Windows 실제 PC 검증 및 UI/브랜드 승인 준비.

## 2026-10-25 KST — 스총 실행 14 / 브라우저 E2E의 릴리스 파일 무결성 게이트 추가
- **목표:** Linux Chromium 브라우저 E2E는 이미 PASS. Windows QA 전 브라우저 검증기가 오래된/변조된 HTML을 실제 릴리스 출고 결과로 오인할 위험을 제거. 변경은 Private `frontend`의 개발자 QA만; `main`/`backend`와 공개 사이트 변경 없음.
- **2안 비교:** (A) 브라우저 QA 실행 후 HTML SHA만 보고 — 테스트 간 불일치 탐지/차단 불가. (B) Playwright 시작 전에 `dist/SELF_QA_REPORT.json`의 Node PASS·빌드/보안 체크·SHA-256·byte 일치 확인 — 추가 비용/외부 호출 0, 유지관리 단순. **B 적용**; 본 검사는 서명 또는 제품 라이선스 보호 기능이 아님.
- **실제 코드:** `scripts/self-qa-integrity.mjs` 신규 `verifySelfQaArtifact`; `scripts/qa_browser.mjs`가 브라우저 실행 전 검증하고 PASS 보고서에 `releaseQaArtifactMatch: PASS` 표시. `--report` 옵션 지원. `tests/self-qa-integrity.test.mjs` 회귀 6건 및 `scripts/qa-release.mjs` 필수 테스트 목록 추가.
- **테스트:** Node v22.16.0에서 신규 **6/6 PASS / 0 FAIL** (`node --test tests/self-qa-integrity.test.mjs`). 정상/변조/잘못된 byte/FAIL QA/필수 검사 누락/보고서 누락·손상 케이스. 로컬 파일 `git hash-object`와 원격 GitHub blob 일치: helper `4fde214c3d6d66171323e04206733a8aefbdd097`, tests `9ce0106bdf484e547e16b59feb0e14c69a014140`. 브라우저 스크립트 blob `4fb9932d290838c079cbffd70f16fa09cc036a94`, release gate blob `6f7b5f945b207cccf236aae05986411e2e7c52b4` 원격 조회 확인.
- **검증 경계:** 변경 후 전체 `frontend npm test`, `npm run qa:release`, `npm run qa:browser:node` 및 Windows 실제 PC E2E는 **이번 실행에서 NOT_RUN**. 기존 34/34 Node 및 Linux Chromium 7항 PASS는 변경 전 별도 증거; 신규 브라우저 변경의 전체 회귀 PASS 주장 금지.
- **오류·복원:** 이번 신규 테스트 실패 0건. 전체 소스의 컨테이너 git clone은 github.com DNS 차단으로 재구성/전체 테스트가 불가. GitHub 기록으로 변경 전으로 되돌릴 수 있고 강제 push 불필요. GitHub Actions 선행 실패 재실행 금지. 고객 CSV/토큰/외부 API/Cloudflare/크몽 조작 없음.
- **다음 1순위:** 승인된 실제 Windows PC의 Private `frontend` 최신본에서 `npm run qa:release` → `npm run qa:browser:node -- --channel msedge` 실행, 실제 SHA 연계/CSV UTF-8 BOM/기능·외부 요청 0을 확인. 가능하면 로컬 Node 전체 회귀를 병행. 실패하면 증거로 정확히 보완. 그 뒤 유료 코어 분리/출고 설명·브랜드 승인을 검토. **2026-11-07 상한** 유지.
- **출시 상태:** NOT_RELEASED. 디자인 최종 승인/Windows 실기기/크몽 상품등록·판매/Cloudflare 공개는 미완·별도 승인 게이트.

## 2026-10-25 KST — 스총 후속: 매출 보고서 UI + 오프라인 번들 통합
- **이번 완료:** 이미 검증된 `backend/site/sales-report.mjs`와 동일 Git blob `01050c8d3a3dd6a1f548d37484112aa7bd99b924`를 Private `frontend/site/sales-report.mjs`로 반영. `site/app.mjs`에 매출 템플릿의 실제 CSV 업로드/판매일·채널·금액 매핑/일·월 선택/잠정 합계/보고서·제외행 **2개의 UTF-8 BOM CSV 다운로드**를 구현. CSV 원본·변경 전 결과는 보존하지 않고 매핑/기간/템플릿/파일이 달라지면 이전 결과 무효화. 합성 이상행은 잠정 합계에서 제외하되 원본 번호·검토 사유를 파일로 내려받음.
- **오프라인 빌드:** `scripts/build-self.mjs`의 명시 모듈 4→5, sale→csv-transform import/앱 import 화이트리스트만 보강. `tests/offline-package.test.mjs`/ `tests/offline-ui-smoke.test.mjs` fixture 갱신, smoke에 매출 정상·이상행/다운로드 및 변경 무효화 2개 케이스 추가, `tests/sales-report.test.mjs` 7개 엔진 회귀 테스트 동기화. `scripts/qa-release.mjs` 필수 테스트에 추가. `tests/public-boundary.test.mjs`에서 공개사이트의 매출 실행코어 노출 감지 추가. 화면 안내·CSS·고객 퀵스타트 보강.
- **실제 실행 증거:** Node.js v22.16.0 `node --test tests/sales-report.test.mjs` **7 PASS/0 FAIL**, 원격 frontend/backend 코어·테스트·정규화 원본과 로컬 `git hash-object` 일치. Private repo 5개 최신 JS 모듈을 V8 합성 DOM으로 실제 평가한 **모의 UI 흐름 PASS**: 판매 5행 → 잠정 2행/제외 3행, 순합계 79.90원, 2개 파일 다운로드와 UTF-8 BOM, 기간 변경/재매핑 시 이전 결과 무효화, 기존 spreadsheet 템플릿 복귀. 새/수정 테스트 3파일은 V8 정적 파싱 성공. `V8 모의 PASS`는 **실제 Node 전체 제품 테스트나 Chromium/Windows PASS가 아님**.
- **NOT_RUN/차단:** 변경된 `frontend` 전체 `npm test` / `npm run qa:release` / 생성된 SELF HTML의 변경 후 실 Chrome 재E2E / Windows Edge·Chrome 실PC 검증 모두 이번 작업 미실행. 이전 34/34 Node·Chromium 7항 PASS는 **이전 HTML 파일 버전**에만 해당. 완성/출고 PASS·실고객 금융/세무 사용 가능·크몽 등록/Cloudflare Public 배포·매출 발생 주장 금지.
- **원격 커밋:** sale 코어 동기화 `70ab14ff2b2768a9b0e85b6cc55f4aa2418ef406`; UI 통합 `3f000a4da861db3b648bab9783dd2e60d7400af3`; 번들러 `970bbaa5a8b39367ce28d34cd380d08e6af2c0bf`; 매출 엔진 테스트 `354db20b8d0738eccd0281d3d28b5db7b7ab91cd`; 브라우저 smoke `af1b2fa94ec49bfa2e7751b93e02d7e410491b64`; QA gate `c7fc52d27628191bcf2004c7f293e985e4358d88`; 공개 경계 `31695782c32fae30470b7896948b54c26d0ae41a`; UI/고객 안내·계약 `docs/SALES_REPORT_FRONTEND_INTEGRATION_20261025.md` 커밋 `faf75ceb816873f6c58ea63f8a0ac0e343c2f278`. `main`/`backend` 미수정.
- **다음 1순위:** 기존 34건 및 신규 매출 9건이 포함된 실제 전체 frontend Node release QA → 새 오프라인 HTML 해시와 CSP 검증 → 실제 Chromium·가능한 Windows Edge 실기기 CSV/매출 다운로드/네트워크0 검사. 그 뒤 고객 UX·상품 조건 검수, 승인 전 공표/판매 금지. 11월 7일 상한 유지.

## 2026-10-25 KST — 스총 실행: 매출 통합 검증 확대 / Node Chromium 브라우저 E2E
- **목표/범위:** 이미 `frontend`에 반영된 실제 매출 집계의 **브라우저 사용 흐름**을 기존 오프라인 제품 출고 QA에 추가. 유료 배포/고객/운영/다른 저장소 변경 없음.
- **이번 구현:** `scripts/qa_browser.mjs`의 HTML+QA report 선행 SHA/bytes 검사와 기존 spreadsheet/20가이드 자동 다운로드/외부 요청 탐지를 보존하면서, 새 격리 Chromium 컨텍스트에서 `sales` CSV **합성 5행** 업로드/3열 수동 매핑/집계 2행·검토 제외 3행·순액 **79.90원** 검증, 보고서·제외행 CSV **두 파일의 실제 download·UTF-8 BOM·정확한 수치·DUPLICATE/INVALID_DATE/FORMULA_PROTECTED 사유** 검사, 월별 주기 변경 후 다운로드 무효화와 재집계, 잘못된 중복 매핑 차단을 추가. 기존 7항목에서 총 **10항목 검사 예정**. 결과 JSON에 `salesCsvDownloads:2` 표시. `docs/QA_BROWSER_RUNBOOK_20261025.md` 최신 절차/경계를 추가.
- **실제로 실행한 검사:** 현 격리 컨테이너 **Node v22.16.0** 사용. `/mnt/data/smax_sales_work`의 GitHub 원격 동일 blob인 `site/csv-transform.mjs` `2b004fb9474743a95294b42baf7f875602644a54`, `site/sales-report.mjs` `01050c8d3a3dd6a1f548d37484112aa7bd99b924`, `tests/sales-report.test.mjs` `4732565887cd2e3f007bb7b03a6e271e4520d159`에서 `node --test tests/*.test.mjs` **7 PASS/0 FAIL** 재확인. `/mnt/data/smax_qa_patch`의 helper `4fde214c3d6d66171323e04206733a8aefbdd097` + 테스트 `9ce0106bdf484e547e16b59feb0e14c69a014140` 동일 blob으로 Node **6 PASS/0 FAIL** 재확인. `scripts/qa_browser.mjs` 최신 원격 코드는 V8 **정적 JS 구문 검사 PASS**(Node/브라우저 실행 아님).
- **미검증:** 현재 `frontend` 최신 HEAD 전체 소스의 `npm run qa:release`/단일 HTML 재빌드 및 실제 Playwright Chromium/Edge 10항 검사 **NOT_RUN**. 원격 Private 저장소 직접 다운로드는 현 컨테이너의 github.com DNS 차단으로 전체 복원이 되지 않음. 앞선 34/34 Node·Chromium 7항목은 이전 빌드 버전에 대한 로그만 있으며 최신 10항 기능의 실제 브라우저 PASS로 표시할 수 없음.
- **원격 반영:** Node browser 신규 sales 3항 검사 코드 커밋 `8ef8eeb654b3174ea82559a00720d02bf5772054`, 2파일 표시 `5cad135f108fb9a35aa27fc7e02c93f06b82f477`, 최신 브라우저 스크립트 Git blob `40e46d79f05b01dcc87a01724565dcefb76dbaf3`. QA runbook 업데이트 `23851e737e29d9a8a0b05a1571f8e00c1f290eae`. `main`·`backend` 그대로.
- **다음 P0:** 개발자 최신 `frontend` 전체 체크아웃에서 `npm run qa:release` (Node 모든 회귀 + CSP SHA + 공개 경계) → **같은** 빌드의 `npm run qa:browser:node` (Linux Chromium) → Windows Edge/Chrome에서 실 `file://` + 두 매출 CSV 다운로드. 실패 원인에 한정하여 고치고 해당 로그/SHA 기록. 이후 브랜드·판매 조건·출고 승인. 11월 7일 상한 준수, 승인 없는 출시·크몽 게시·Cloudflare 배포 금지.

## 2026-10-25 KST — 스총 다음 순환: 매출 증빙 없는 출고/브라우저 PASS 차단
- **실제 위험/이유:** `frontend` 제품에 매출 집계 기능을 연결했지만 기존 `scripts/qa-release.mjs`는 CSV 변환(4행/검토 2행)만 합성 런타임 확인해 **매출 집계가 잘못된 빌드도 PASS 가능**했음. 브라우저 QA 증빙 무결성은 HTML/기존 Node 확인만 요구해 신기능 출고 증빙 부족.
- **반영:** `scripts/qa-release.mjs`에 `buildSalesReport` 직접 import·합성 5행/정상2·검토3·순액79.90원·BOM 양쪽/중복·날짜·수식 방어·월별 재집계 확인을 fail-closed로 추가. 모두 성공할 때만 JSON `verification.syntheticSales5Rows3Review='PASS'` 기록. `scripts/self-qa-integrity.mjs`는 **기존 CSV + 신규 매출 합성 양쪽 PASS** 없으면 브라우저 QA 사전 진입 불허. `tests/self-qa-integrity.test.mjs`에 오래된 리포트에서 각 검사 누락 시 거부하는 2건 추가. `docs/QA_BROWSER_RUNBOOK_20261025.md` 재실행 절차 기록.
- **실제 Node 검증 (격리):** 기존 `/mnt/data/smax_sales_work`에 저장된 원격 동일 Git blob 기준 Node v22.16.0 `node --test tests/*.test.mjs` **매출 7 PASS/0 FAIL** 재확인. `/mnt/data/smax_qa_patch`에서는 변경 후 QA helper/test를 원격과 동일 SHA로 갱신하여 `node --test tests/self-qa-integrity.test.mjs` **8 PASS/0 FAIL** 직접 실행; `git hash-object` helper `804f744dc866e916fc8f86d43f972d1923e2b92e`, test `5e1f1112718e9753c2f3cb692a9b7e6d71f53001` = Github.
- **V8 검증:** 최신 `scripts/qa-release.mjs` 구문검사 PASS. 원격 원본에서 추출한 매출 합성 출고검사 블록을 `site/csv-transform.mjs`/ `site/sales-report.mjs`와 격리 V8에서 실행: 5행 중 2 포함/3 제외, 순합계79.90, BOM 및 거부 사유, 월별 재집계 **PASS**. 이것은 **실제 Node 전체 릴리스 실행도, 브라우저 E2E도 아님**.
- **원격 변경:** release QA 추가 `7c4a41209dfe8392b310c7297ae21db58ddd6d06` 및 문자열 이스케이프 수정 `084e211dbffdd1c89571faf3e008701013483fdc` → release QA blob `c8286e09da327876fcb34d84d310d585c4522517`. integrity helper 커밋 `93cc01ea55fdb0ebcebc3b10fae058f5de419f4e`; 2 추가 회귀 커밋 `f2d6435758925c726ed9436b778d28ca573984ee`; QA 설명서 `08d1600ea2e491f774b87aa87bf64ed5fed8318d`. `main/backend` 미수정.
- **BLOCKED/NOT_RUN:** 실제 최신 frontend 전체 `npm run qa:release`, 새 단일 HTML 생성·CSP/파일 SHA 판정, 실제 Chromium/Edge 브라우저 자동화, Windows 실PC, 실고객, 크몽/Cloudflare 출시 **모두 이번 작업 미실행**. Private GitHub git clone의 DNS 차단 상태; 기존 job 실패 강제 재실행 금지.
- **다음 P0:** 전체 HEAD가 실행 가능한 환경에 체크아웃되면 `npm run qa:release`(양쪽 합성 검사 PASS) → **그 출력 HTML 동일 SHA**에서 `npm run qa:browser:node`(기존 CSV + 판매 + 10종 템플릿 + 네트워크 0) → Windows 실기기 검증 → 고객용 상품 조건 검토. 2026-11-07 상한, 출시 별도 승인.

## 2026-10-25 KST — 스총 후속 / 1개 합성 매출 CSV로 전체 QA 입력 표준화
- **목표·현황:** 직전 매출 집계 UI 통합과 양쪽(CSV/매출) fail-closed 게이트 추가 후, 매출 검사가 브라우저 스크립트의 하드코딩 입력과 릴리스 스크립트의 별도 입력으로 유지되는 품질 위험 발견. 개발자/Windows 합성 예제 1개를 모든 자동검사에서 재사용하도록 수정. `main/backend` 변경 없음.
- **코드:** `examples/SMAX_SALES_SAMPLE.csv` 신규 합성 5행: 정상 2/검토 3(중복·잘못된 날짜·수식 위험), 순합계79.90. 파일 Git blob `0bb5bbf5cefbcd9f9cab1f3081f2fa0d8f92ab28`. `scripts/qa-release.mjs`·`scripts/qa_browser.mjs`에서 해당 파일을 readFileSync; 브라우저 runner 파일 누락 시 사전 차단. `tests/sales-report.test.mjs`에 동일 예제의 일별/월별 수치·검토 사유·BOM 회귀 1건 추가(7→8).
- **실제 실행:** 로컬 Node.js v22.16.0, `/mnt/data/smax_sales_work`에 원격 동일 blob `site/csv-transform.mjs` `2b004fb9474743a95294b42baf7f875602644a54`, `site/sales-report.mjs` `01050c8d3a3dd6a1f548d37484112aa7bd99b924`, 최신 `tests/sales-report.test.mjs` `c78effcfb7d272d7f0aa7afca0e88c85f5f5e8eb`, fixture `0bb5bbf5cefbcd9f9cab1f3081f2fa0d8f92ab28` 검증한 뒤 `node --test tests/*.test.mjs` **8 PASS/0 FAIL, exit 0**. 이전 QA helper/test도 `/mnt/data/smax_qa_patch`에서 독립 `node --test tests/*.test.mjs` **8 PASS/0 FAIL, exit 0** 재확인. 완성된 16개 *개별 단위 검사*를 전체 frontend QA 16/16과 혼동 금지.
- **제한:** 최신 Private GitHub checkout 전체를 로컬 컨테이너에 안전 복원하지 못함(직접 clone DNS 차단). **현 frontend HEAD의 `npm run qa:release`, 새 오프라인 HTML 빌드·실 Chromium/Windows Edge 실행은 이번 순환 NOT_RUN**. 원격 테스트·코드 파일 수정만으로 출시 검수 PASS 아님. 공개 Cloudflare·크몽 게시·고객 데이터·결제·비용·main 병합/해커톤 저장소 변경 없음.
- **커밋:** synthetic fixture `8f3ba3f17150f8ff8162a65843e54cdeac717cad`; release QA shared fixture `b51c2501e3ee9812bed5e5529a92a72094de4465`; browser shared fixture `f01e498afb3b5dfc4364bc3175541931eff06c7e`; new test `3688df8e2a8dc2c36af8209563d3e3c4d8f82462`; QA runbook `53dfa752af21a9fbba4b541c0cb8d7da501d79b8`.
- **다음 P0:** 최신 전체 frontend 소스에서 실제 Node `npm run qa:release` → 보고서 SHA/두 fixture 체크 확인 → **같은 HTML** `npm run qa:browser:node` (기존 정규화+매출 두 CSV+10종 가이드, 0 HTTP/JS오류) → Windows Edge 실PC. 가능한 한 사전 검증/문서 개발은 스총이 진행. 11월 7일 상한, 출시 사용자의 명시 승인 필요.

## 2026-10-25 KST — 스총 / Windows 출고 검증 실행 경로 보강
- **목표/실제 작업:** Private `frontend`의 최신 매출·CSV 이중 출고 증빙을 **Windows 실기기 검수**에서도 검사하도록 연결. 기본 배치 파일에서 Node QA + HTML SHA/byte만 확인하던 공백을 해소하고 선택적 실제 Edge E2E 경로 추가. `main/backend` 미수정.
- **코드:** `scripts/VERIFY_SELF_WINDOWS.ps1`에 Node report의 `allNodeTests/offlineBuild/cssAndScriptCsp/publicPrivateBoundary/syntheticCsv4Rows2Review/syntheticSales5Rows3Review` 각각 `PASS` 필수, `saleApproval=NOT_GRANTED`, sha256/byte 기존 검증 유지. PowerShell `-EdgeE2E` 지정 시 `npm.cmd run qa:browser:node -- --channel msedge` 실행하고 **브라우저 exit 0인 경우에만** 성공. 검수 성공 플래그 `$ok`를 Edge 검사 이후로 이동해 실패 시 성공 처리 방지. `QA_SELF_WINDOWS.cmd`에 사용자 **명시 `/edge`** 인수만 Edge QA 실행, 기본은 Node QA만 수행, 그 외 인수 거부.
- **추가 회귀:** `tests/windows-qa-contract.test.mjs` 크로스 플랫폼 계약 3건(두 도구의 증빙 필수/Edge fail-closed/실행 플래그와 외부 배포 명령 금지) 신규. `scripts/qa-release.mjs` 필수 테스트 명세에 추가. `docs/QA_BROWSER_RUNBOOK_20261025.md` 개발자 명령·결과 분리·의존성을 추가.
- **실제 실행 근거:** 격리 Node.js **v22.16.0**, `node --test tests/windows-qa-contract.test.mjs` = **3 PASS/0 FAIL/exit0**. `git hash-object` 3개 코드 및 테스트 파일의 해시가 Private GitHub 원격과 일치: PowerShell `3bc6e82535cc52df9d8b0d0b957aeed4129501e8`, CMD `6597ca75300008be1d2ea94346ee02d5d14da39f`, 테스트 `3fbbc861933663ae32aa6330e5db15803d759215`.
- **검증 한계:** 크로스 플랫폼 **정적 계약 테스트**는 실제 Windows PowerShell/Edge 실행이 아님. 최신 `frontend` 전체 소스를 이 컨테이너에 복원하지 못함(github.com DNS/직접 clone 차단), 따라서 최신 전체 `npm run qa:release`, 변경 후 HTML 생성 및 Chromium/Windows 실 브라우저 QA는 **NOT_RUN**. 이전 매출 Node 8/8·무결성 Node 8/8은 별도 독립 모듈에서 원격 해시 일치 기준 기록.
- **원격 커밋:** Windows QA `fbc16597e06221a99153d13fd5daf454ecfe6217`; CMD /edge `7321263844a7f7016eaaa6469af260a0803b0514`; Windows 실패 플래그 수정 `a3d8487e8ac6506dacef1548c8106946b757bb03`; 새 테스트 `27a15d9c6935e9efc0419131bba315e668dd7b4c`, 안전 문구 고침 `8873897b9e74b3fb4286d2a7803b11495c93789b`; 필수 QA 목록 `a312c5624f01ea09f470feafee11b99c31563fb5`; Runbook `49ed0760de797d8a4b6bb7aee9e9503a3455589d`.
- **다음 P0:** 가능해지는 즉시 실제 최신 frontend `npm run qa:release` 전제품 Node+출고 증거 → 동일 SHA의 `npm run qa:browser:node` (Chromium) → 명시적 Windows 개발자 `QA_SELF_WINDOWS.cmd /edge` 자동 Edge E2E. 마지막으로 디자인/상품 약관/크몽 정책·메인 안전 통합 검수 및 사용자 별도 출시 승인. **2026-11-07 상한** 유지. 고객자료·결제·외부 API·Cloudflare/크몽 배포, 판매, GitHub Actions 무단 재실행/지출 없음.

## 2026-10-25 KST — 스총: 최신 오프라인 번들 V8 통합 재검증 + 잘못된 회귀 기대값 수정
- **실제 코드 기준:** Private `frontend` 최신 5모듈 `templates/core/csv-transform/sales-report/app`, `site/index.html`/CSS/실제 `scripts/build-self.mjs`를 GitHub에서 각각 최신 blob으로 직접 읽음. 네트워크 사용 불가 컨테이너에 실제 전체 파일 체크아웃은 못 했지만, 커넥터의 **원본 빌더 함수 `bundleOfflineSelf`를 V8 isolate에서 실행**해 1개 inline CSS/JS, `connect-src 'none'`, JS 구문 컴파일, 판매 화면 포함을 확인. 단 **SHA-256은 V8에서 모의 해시 함수를 사용**했으므로 실제 빌드 파일 크기·암호학적 SHA/CSP 통과 근거가 아니며, Native Node `npm run qa:release`는 NOT_RUN.
- **중요 실제 QA 발견:** 기존 `tests/offline-ui-smoke.test.mjs`의 신규 판매 보고서 테스트가 **보고서 CSV 안에 전체 순합계 `79.90` 행이 존재한다고 잘못 기대**함. 코어 계약상 reportCsv는 기간/채널별 별도 행 `100.00`, `-20.10`으로 구성되고 **전체 `79.90`은 UI 요약에 표시**. GitHub 원본 test 파일을 실제 V8 isolate/모의 Node DOM 런너로 돌려 **8 PASS / 1 FAIL** 실현. 프로덕트의 합계 오류가 아닌 잘못 작성한 테스트 기대값으로 판단.
- **수정:** 테스트의 `assert.match(report,/79\\.90/)`를 CSV 계약에 맞는 그룹별 `100.00` / `-20.10` 검사로 교정. HTML UI 전체 잠정 순합계 `79.90` 검사는 유지. 신규 테스트 구현 2건: 단일 HTML에서 spreadsheet↔sales 전환해 이전 CSV 산출물 누출 차단/2가지 다운로드, sale의 XLSX·2MB 초과 업로드 차단. 신규 test 작성 커밋 `431920c4aad1fd7ac6b04f83afd6202c1322c44e`, 잘못된 회귀 기대값 수정 `c1eb982c770d5026dc28c428c5b9ccc5ae6bab3c`. 최종 smoke test Git blob `d9220bfd5204a0ca405212032a309743fa7f2122`.
- **재검증:** 바로 위 원격 최신 smoke test의 모든 **9개 테스트 콜백을 실제 GitHub 빌더와 5개 제품 모듈 조합/합성 DOM+파일 API로 실행**한 V8 모의 환경에서 **9 PASS/0 FAIL**. 이건 Native Node 모듈/Playwright Edge 검증과 같지 않음. 로컬 격리 Node v22.16.0 별도 원격 동일 blob에서 `sales-report.test.mjs` **8 PASS**, `self-qa-integrity.test.mjs` **8 PASS**, `windows-qa-contract.test.mjs` **3 PASS** 재확인. **이 19건은 3개의 독립 Native Node 부분검사**이지 전체 frontend Node 테스트가 아님.
- **현재 출고 기준:** 현재 최신 Frontend HEAD `npm run qa:release`, 새 `SMAX_SELF_OFFLINE.html` 실제 file 생성/진짜 SHA256·CSP, 최신 Linux Chromium 10항과 Windows Edge 실브라우저 **NOT_RUN**. GitHub Actions 1회 실패는 작업 로그 없이 종료돼 반복 실행 안 함. **실배포/크몽 판매/Cloudflare/요금/고객 데이터·비밀/메인 병합 전무.**
- **다음 P0:** 최신 전체 frontend source를 Node 환경에 마련해 `npm run qa:release` 0 FAIL와 실제 SHA 증거 확보, 이후 그 동일한 빌드의 Chromium `file://`/Windows Edge 10항 검증. 현재 버전 QA 정적 증거를 릴리스 승인에 사용 금지, 2026-11-07 기한 유지.

## 2026-10-25 — bundled module collision and sales period regression fixed
- **Root cause 1:** `csv-transform.mjs` and `sales-report.mjs` both declared top-level `toCsv` and standalone builder concatenates their sources. Changed sales-only private function to `toSalesReportCsv` in **both backend and frontend** (matching blob `17796cd0e44095512b61303045dffa582fe06162`). New `tests/offline-package.test.mjs` tests explicitly check separate names and **43 top-level bindings unique across 5 modules**, preventing silent shadowing.
- **Root cause 2:** sales template offered `주별` though local report supports daily/monthly only, and `forgetCsv()` reset selected monthly after upload. Removed unsupported weekly choice; chat answer and editor daily/monthly dropdown now synchronize, and CSV replacement keeps selected period while clearing prior output. The guide answer about returns does **not** affect actual calculations; explicit UI notice added.
- **Actual QA:** local Node v22.16.0 sale engine `node --test tests/*.test.mjs` **8 PASS/0 FAIL**, source `git hash-object` remote verified. Actual latest GitHub build function + 5 real modules (stub hash) executed with V8 simulated Node test harness `offline-ui-smoke` **10 PASS/0 FAIL** after fixing real period reset regression (initial 9/10). Top-level definitions **43, duplicates 0**, latest test code syntax PASS. V8 mock ≠ real browser/actual SHA.
- **Key commits:** frontend engine `1c0368e88e2597a5e0c09b41119b5f9fda1f2998`, collision regression `4f1fa6dc5f016a10ee6b0a46ba24f6dbc0314531` plus generic namespace regression `7215fe7c437aed65b215bd0cee752464e873a215`, sales week removed `54b8eb6519473e78d7725e47c002a01e9ac2ff23`, UI sync `57b56388090e7fd42d553fe55dd07d949d0126f8` + upload reset fix `3d502358345b3efb49dd6143af8bdd8728d603c3`, smoke test `1d42ae9aa8067e6144d0539ddadb1145f51a6bc0`, customer quickstart `3cdd5b0d59bb546cbb79f3efdfc5b6b5a2548dc2`.
- **NOT_RUN:** latest full `npm run qa:release`, actual CSS/JS CSP SHA-256 build, actual Chromium browser E2E, Windows Edge/Chrome. Private repo direct clone via container network blocked; GH Actions older run failed before recorded steps/logs, not blindly rerun. Main merge, sale, Cloudflare/Kmong publication NOT_AUTHORIZED. Deadline 2026-11-07.

## 2026-10-25 KST — 스총 재개: CSV 업로드 사전검사와 실행 엔진의 구조 일치
- **근거:** 기존 `site/core.mjs`의 `parseCsv`는 따옴표 중간 삽입, 중복 헤더, 열 개수 부족 및 빈 원본 레코드 일부를 사전검사에서 통과·생략. 실제 `site/csv-transform.mjs`의 `normalizeSpreadsheetCsv`는 해당 입력을 거부하거나 빈 레코드를 검토행으로 보존. 따라서 고객 업로드가 정상처럼 보였다가 변환 단계에서 실패하거나 원본 행수 인식이 달라질 수 있었음.
- **수정:** `frontend/site/core.mjs` CSV 업로드용 구조 파서를 실제 실행 엔진과 동등한 기준(인용부호, BOM/CRLF, 중복·공백 헤더, 레코드 열 개수, 빈 필드 레코드 보존)으로 강화. 유효한 원본 자료/매핑/실행 코어/다운로드 계약 및 10종 템플릿은 변경하지 않음. 실패 시 이미 존재하는 UI의 `해석 실패` 흐름을 이용하며 외부 전송 없음. 손실을 묵인하는 A안보다 기존 변환기와 동등한 fail-closed B안을 선택.
- **회귀:** `tests/core.test.mjs`에 잘못된 CSV 업로드 조기 거부와 BOM·CRLF·인용·빈값 레코드 보존 **Node 테스트 2건 추가**. GitHub 원격 코드 실문자열을 실행한 격리 V8 논리 검사: 초기 8/8 통과, 최종 `parseCsv` ↔ 실제 `normalizeSpreadsheetCsv` 입력 11종 수용/거부·행수 **11/11 일치**. **신규 2건 Native Node는 NOT_RUN**이며, `npm test` / `npm run qa:release` / 브라우저·Windows E2E 모두 이 순환에서 NOT_RUN.
- **GitHub 커밋:** 코어 `cfb109ea2a971d741c8464abaff7517ad9cb8286`, 테스트 `13eb963b96e833b1675ab9a098c9508c1efd42a1`. 수정 전 HEAD `1e0f7ba632f83b264a7123e7add7c11b3c06a343`, 코드/테스트 갱신 HEAD `13eb963b96e833b1675ab9a098c9508c1efd42a1`. `main`·`backend` 미수정; 최신 문서 커밋 이후 최종 SHA는 원격 재조회.
- **다음 P0:** 전체 최신 `frontend` checkout을 Node≥20 개발환경에서 확보하여 `npm run qa:release` 실제 실행, 단일 HTML SHA/두 합성 CSV 증거 → 동일 산출물 `npm run qa:browser:node` 10항 → Windows `QA_SELF_WINDOWS.cmd /edge` 실QA. 기존 GitHub Actions 과거 1회 실패 무의미한 재실행 금지. 외부 배포/상품게시/결제/고객 데이터/금전 집행은 사전 승인 게이트 유지. D14 2026-11-07 유지.

## 2026-10-25 KST — 스총: 헤더 전용 CSV 조기 거부·파서 패리티 회귀 차단
- **실패/환경 점검:** 최신 Private `frontend`의 실제 Native Node 릴리스 QA를 우선 시도했으나 현재 컨테이너 `git ls-remote https://github.com/hibi89/SMAX.git HEAD` 는 `Could not resolve host: github.com`으로 차단되어 전체 checkout 불가. 이전 GitHub Actions job `121135102487` steps 빈 목록, 로그 요청 404 `BlobNotFound`; 실패 원인은 **미확정**, 워크플로 재실행/유료 변경 금지.
- **결함 수정:** 구조 검사에서 헤더만 있는 CSV가 매핑 화면으로 진행되지만 실제 엔진은 "헤더만 있고 처리할 데이터가 없습니다"로 실패하는 UX 불일치를 `site/core.mjs`에서 조기 거부. `tests/core.test.mjs` 1개 새 테스트, 기존 `tests/csv-ui.test.mjs` 업로드 회귀 케이스 추가. 테스트 입력의 `\\n` 이스케이프 초안 오류를 발견해 실제 `\n` 값으로 바로 정정함.
- **파서 안전성 회귀:** `tests/csv-preflight-parity.test.mjs` 신규 2개 Node 테스트(고정 엣지 14·seed 기반 변형 256), `scripts/qa-release.mjs` 필수 검사 목록에 명시. 실제 `site/core.mjs`/`site/csv-transform.mjs` 원격 텍스트로 V8 검증 **270/270 합성 입력 수용/거부 및 행수 판정 일치**. 실제 5모듈 앱 업로드 이벤트 V8 검증 **3/3 통과**(헤더 전용·잘못된 인용·정상 1행). 이 결과는 **Native Node 및 실 Chromium PASS가 아님**.
- **원격 커밋:** 조기 거부 `38d3e7dee1cc85bb753ca7c5920d64a8219b7220`; core 테스트 `ea65c0cb608e87088aa4127fc45332987467a5f1`→입력 수정 `00fb45e15c742b64725656b957ff9636f34b215d`; UI 회귀 `c17f6fca18eceb2c4527446e5bcf74e40253511b`→입력 수정 `6ad83df6e97b98869e911280055b5fd7ddf831b8`; 파서 parity `8375887c8e2c51f6f54d09327678bbdf3f44101a`; QA 목록 `97414aa6db53702eb8fe363d24ff365dcb946ca6`. 업데이트 직전 HEAD `97414aa6db53702eb8fe363d24ff365dcb946ca6`. `main`/`backend` 변경 없음.
- **남은 게이트:** 정확한 `frontend` 전체 Node v20+ `npm run qa:release` 실제 PASS+새 단일 HTML SHA256/bytes/CSP → 같은 파일 `npm run qa:browser:node` Playwright 오프라인 10항 → Windows `QA_SELF_WINDOWS.cmd /edge` 실기기 확인; 기존 CI 실패 진상은 읽기 전용 분석만. 출고/크몽 등록·Cloudflare 공개 및 비용은 승인 전 금지, 마감 2026-11-07 유지.

## 2026-10-25 KST — 스총: UTF-8 입력 안전성 보강·원격 복원 한계 재확인
- **목표·위험:** 로컬 CSV 업무 자동화 2종은 한글 사장님 데이터를 입력받음. 기존 `file.text()`는 UTF-8이 아닌 CP949/EUC-KR 등의 바이트를 대체 문자로 바꾸어 자료 매핑/CSV 결과까지 보낼 위험이 있었음. 인코딩 자동 추정(A: 사용성 높지만 오판 시 원본 손상 위험) 대신 **사전 UTF-8 엄격 검사 후 안내·거부(B: 구현 간결, 손상 방지)** 채택.
- **실제 소스:** `site/app.mjs`에 `readUtf8Csv(file)` 추가. 브라우저 `File.arrayBuffer()` + `TextDecoder('utf-8',{fatal:true})`로 바이트 검증, 형식 오류는 'CSV UTF-8으로 다시 저장'을 안내. 테스트용 `file.text()` 경로에서도 U+FFFD 데이터 거부. 파일·주기/매핑 변경 시 기존 결과 무효화, 원본 서버 전송 없음. CP949 자동 변환·XLSX는 여전히 미지원.
- **테스트 갱신:** 기존 `tests/csv-ui.test.mjs`에 CP949 바이트 거부, 대체문자 거부, 정상 한글 UTF-8 바이트 통과 회귀 세 경로 추가. `scripts/qa_browser.mjs`의 CSV·매출 양 흐름에 악성/구형 바이트 업로드 거부 확인을 추가(실 Chromium 실행은 NOT_RUN). `docs/SELF_CUSTOMER_QUICKSTART_20261025.md`에 Excel 'CSV UTF-8' 저장 절차 안내.
- **직접 확인한 범위:** 원격 Private `frontend`의 실제 템플릿/코어/CSV 변환/매출/앱 5개 소스를 V8에서 조합해 **CSV 4/4**, **매출 4/4** 이벤트 흐름 통과(조기 거부·정상 열매핑·다운로드). 별도 로컬 Node.js v22.16.0 `TextDecoder('utf-8',{fatal:true})`의 올바른 한글/잘못된 바이트 **2/2 PASS**. 이 2건은 전체 제품 Native Node test가 아님. 새 GitHub 테스트 코드의 Native 실행, 전체 `npm run qa:release`, 새 HTML 실제 SHA256/CSP 및 Chromium·Windows Edge E2E는 모두 **NOT_RUN**.
- **검증 차단:** 현재 Node 컨테이너의 `git ls-remote https://github.com/hibi89/SMAX.git HEAD` 는 `Could not resolve host: github.com`으로 실패하여 Private 전체 소스의 동일 커밋 checkout 불가. 과거 GitHub Actions 실패에는 유효한 단계 로그가 없어 재실행하지 않음. 환경 제한을 제품 오류로 오분류하지 않고 V8/standalone Node 경계검증으로 전환.
- **반영 커밋:** 앱 `59cb3254e3736ad7490c7d5558543082b6b8be72`; UI 회귀 `4d3b7f3fe80df68a6894e256ae49ade5ce4375c6`; 브라우저 QA `43a2b59c0cd34d95f3b5439fc08dbd47981d3890`; 퀵스타트 `a4967a1107286ecf3918103e1878371d08dc53ac`; 빠른 복원 `acd2aece0318eec31b70012b6ebc30dd3949217f`; 로컬 안내 `f7fa854fa9922c0c531b37c478933ee650187242`. 작업 전 frontend `2ed9e153f1bcc84c5f5db657f6c395d949156c38`, `main`/`backend` 변경 없음.
- **후속/승인:** 최신 `frontend` 전체 Node `npm run qa:release` 실제 PASS 및 새 HTML SHA→동일 파일 Chromium 10항→Windows `QA_SELF_WINDOWS.cmd /edge` 검수. 이후 사용성/상품조건·고객 안내 확정, 사용자 별도 출시 승인. 공개 Cloudflare 배포·크몽 판매·유료 작업 없음. 최종 개발 기한 **2026-11-07** 유지.
