# SMAX² P3 — PREP → SELF local sales preview gate (2026-11-10 KST)

## 목표와 구현 범위

본 단계는 별도 브랜치 `frontend`와 `preprocessing`을 병합하지 않고, **PREP 정규화 결과를 기존 SELF 매출 보고 엔진의 안전한 로컬 초안**으로 연결하는 첫 경계이다. 소유자가 명시한 `date/channel/amount` 매핑과 daily/monthly 주기만 허용한다. Python/LLM/API/데이터베이스/결제/저장·로그인·외부전송을 수행하지 않는다.

### 설계 비교

| 대안 | 성능·비용 | 유지보수·검증 위험 | 결정 |
|---|---|---|---|
| A. PREP 브랜치를 frontend/main에 즉시 병합 후 자동 실행 | 신규 코드가 적을 수 있지만 병합 충돌·원본/릴리스 훼손·허가 없는 자동 처리 위험. 전체 통합 QA/Windows 불충분 | 높음 | 보류 |
| B. PREP 내부에 순수 메모리 **검증/미리보기 게이트** 추가 | Node 20+ stdlib, O(2MiB 이하 CSV) 재계산; 고객 원본 쓰기·비공개 코드 외부전송 없음 | 낮음. 남은 전체 브랜치 통합 E2E는 명시적 대기 | **선택** |

## 계약

- 모듈: `preprocessing/self-preview-gate.mjs`, 함수 `buildSelfPreviewFromPrep(sourceCsv, genericPackage, {mapping,period})`.
- `genericPackage`는 **`SMAX_PREPROCESS_GENERIC_CSV_V1`**, `approval:'NOT_GRANTED'`. 원본 CSV를 다시 `preprocessGenericCsv`로 파싱해 **모든 결과 객체를 재비교**하고 SHA-256/행/매핑/검토 사유 변조를 거부한다. 단순 JSON 영수증만을 신뢰하지 않는다.
- 입력은 명시적인 같은 로컬 CSV 문자열 <=2MiB, 패키지 행 <=20,000, mapping 정확히 date/channel/amount만, 각기 다른 원본 열, PREP required=true, 호환 타입 `date` / `text` / `decimal|integer`. 기간은 `daily` 또는 `monthly`.
- PREP `review_rows>0`이면 **`REVIEW_HOLD`** 후 SELF 집계를 실행하지 않는다. PREP가 깨끗하더라도 SELF 특유의 날짜 정규화 중복, 금액 범위 등으로 `excludedRows>0`이면 별도 **`REVIEW_HOLD`**한다.
- 나머지는 SELF 기존 `buildSalesReport`를 원본 + 명시 매핑으로 호출해 **집계 초안 요약값만** `READY_FOR_OWNER_REVIEW`로 반환한다. 고객별 채널 이름·원본 셀·레코드·CSV 다운로드는 반환하지 않는다.
- 모든 결과는 `owner_approval:'NOT_GRANTED'`, `preprocessing_approval:'NOT_GRANTED'`, `execution:'NOT_PERFORMED'`, `outbound_transfer:false`. 이 상태는 **승인/실행/회계 확정이 아니다**. 집계된 금액도 외부 제출·판매 홍보에 무단 사용하지 않는다.

## 실행·검증

```bash
npm run test:preprocessing
node --test tests/self-preview-gate.test.mjs
node --check preprocessing/self-preview-gate.mjs
node --check tests/self-preview-gate.test.mjs
```

- 개발 단계 사전 확인: 격리 V8에서 GitHub 실제 `site/csv-transform.mjs`, `preprocessing/generic-csv.mjs`, `site/sales-report.mjs`와 새 기능 소스/테스트 파일을 직접 결합해 **14/14 테스트 통과**. 단, SHA-256 및 UTF-8 런타임 API는 테스트 더블; 이것은 실제 Node 기반 Native 전체 회귀 PASS가 아니다. 새 코드에 상응하는 별도 로컬 Node22 `--check` 구문 확인 (GitHub 파일 byte-identical 검사 아님).
- 현재 브랜치에 GitHub Actions 등록 실행 이력 **0건**. 비용/권한/계정 설정을 바꿔 자동 CI를 강제하지 않는다.
- 앞으로 같은 브랜치의 정확한 SHA로 **Native Node20+/22 전체 npm run test:preprocessing**, Windows 10/11, 실제 SELF frontend 런타임, 이중 원본·승인 E2E를 각각 검증해야 최종상품 완성률 추가 상승을 인정한다. 실제 고객 데이터·문서·유료 API·공개 배포 금지.
- `preprocessing`에서만 기능·테스트·문서를 수정하고 `frontend`/`main`/`backend`와 외부 Public 프로젝트의 코드는 변경하지 않는다.

## 후속 우선순위

1. PREP 패키지 원본 SHA와 로컬 파일 바이트를 확인하는 정확한 Native Node 소스 검증.
2. SELF UI가 `NOT_GRANTED` gate를 표시하고 소유자 승인 단계를 거쳐도 원본을 보존하는 통합 E2E (실행 기능은 별도 권한 게이트).
3. 안전한 샘플 CSV/XLSX/TXT/DOCX 전처리 결과의 통합 품질·보안/형식 검증.
4. Windows native/고객 샘플/판매 패키징은 마지막에 사용자 개입을 모아서 검증.

**현재 SMAX² 최종상품 완성률: 45%(잠정, 상승 보류).** 코드 구현+격리 검증은 일부 진전이지만 별도 브랜치 Native 통합 QA를 통과하지 않았으므로 46%라고 주장하지 않는다.
