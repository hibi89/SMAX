# SMAX 신규 채팅 1문장 복원

## 사용자 시작 문구
`[해커톤·SMAX 총괄: SMAX 깃헙 확인하고 사업기획 이어가자]`

## 역할 / 상태
- 사용자 = 유일한 사업 주체, 예산·공개·출시·법적·고객정보 처리 최종 승인.
- assistant = 3개 해커톤 **통합 감독** + SMAX **제품·사업화 총괄**. 단, 오늘 2026-10-25에는 사용자 지시로 해커톤 3개 실제 개발·수정·감사를 잠시 쉬고 **SMAX 사업 기획만 집중**.
- GitHub: `hibi89/SMAX`, default `main`, **PRIVATE**. 이 대화에서 원격 Private 상태를 확인했음.
- 개발은 시작 단계. `README.md` → `HANDOFF.md` → `STATUS.md` → `docs/DECISION_LOG_20261025.md` → `docs/PRODUCT_STRATEGY.md` → `docs/BUSINESS_MODEL.md` → `docs/COSTS_AND_GATES.md` → `docs/ROADMAP.md` 순서로 최신 원격 읽기.
- `ㄱ` = 이미 승인된 다음 기획/안전한 개발 작업 진행. 비용, 사업자 계정, 실고객 데이터, 유료 API, 공개 배포, 핵심 설계 범위의 중대한 변경은 별도 승인.
- 핵심 소스 Public 금지. 사용자의 공개 승인 없이 해커톤 통합 상황실 Public 저장소에도 SMAX 사업 비밀을 게시하지 말 것.
- GitHub에는 문서만 원격 반영되어 있고, 과거 P0 오프라인 코드 패키지는 **대화의 로컬 첨부**로 존재. 아직 이 Private 저장소에 원격 커밋된 코드나 원격 CI를 주장하지 말 것.

## 다음 채팅의 첫 작업
1. 원격 `main`과 파일 존재, 최신 HEAD, Private 표시 재검증.
2. `HANDOFF.md`의 다음 사업 조사 과제 시작: **매우 구체적인 한국 중소기업 업무 유형 3개**를 시장 자료에 근거해 비교.
3. 표준화 가능한 공통 업무와 고객별 필수 예외를 분리.
4. 실제 판매·구매·유입을 검증할 지표와 MVP 최소 범위를 확정.
5. 모든 결정/테스트/원가를 STATUS·HANDOFF·결정 로그에 기록. 검증되지 않은 것은 가설로 표시.

## 세 해커톤과의 경계
- KIC ProofInvest: 2026-11-12 10:00 KST 공식 예선 마감.
- PayPal Freelancer Payment Agent: 2026-11-13 05:00 KST 공식 제출 마감.
- UGREEN ProjectReady NAS: 2026-11-16 16:45 KST Round1 마감.
- 오늘 쉬기로 한 것은 2026-10-25 하루의 운영 우선순위이며 무기한 보류/대회 포기 결정이 아님.
- 세 대회의 코드, 브랜치, 일정, 진행 원장은 각자 소유; SMAX가 임의 수정하지 않음.
