# SMAX² PREPROCESSING — Private reusable data layer

이 디렉터리는 SMAX 기존 CSV 엔진을 해커톤과 후속 프로젝트에서 재사용하는 별도 계층이다. GitHub 비공개 preprocessing 브랜치에서 관리한다. 기존 main / frontend / backend 브랜치는 건드리지 않는다.

## 현재 구현 범위 (V0)

- Node.js 20 이상, npm 추가 의존성 0개, 오프라인·규칙형 처리
- preprocessing/index.mjs: preprocessMappedCsv(source, {mapping}), validatePreprocessPackage(pkg), serializePreprocessPackage(pkg)
- preprocessing/cli.mjs: 로컬 UTF-8 CSV 파일을 읽어 신규 Strict JSON 파일 저장 (기존 파일 덮어쓰기 거부)
- 지원: CSV 2MiB 이하, 날짜·항목·금액 3개 필드 직접 매핑
- 결과: SMAX_PREPROCESS_CSV_V0, source SHA-256·원본 레코드 번호·검토 사유·품질 건수·review_queue
- NEEDS_REVIEW 대상 자동 승인 금지. READY_FOR_HUMAN_REVIEW 역시 확정 승인 상태가 아님.
- JSON에는 매핑되지 않은 열은 포함하지 않지만, 매핑된 개인정보가 존재할 수 있으니 보호해야 한다.

## 기본 실행법

node preprocessing/cli.mjs --input preprocessing/examples/synthetic-orders.csv --output result.json --date 거래날짜 --item 품목 --amount 결제금액

node --test tests/preprocessing-package.test.mjs tests/preprocessing-cli.test.mjs

위 예제는 합성 데이터만 포함한다. 실고객 파일은 사전 허가된 로컬 위치에서만 사용한다. CLI는 입력을 수정하지 않으며 출력 JSON이 이미 있으면 실패한다. 자동 파일 업로드나 HTTP 요청은 없다.

## 역할·미지원

본 V0은 현재 구현된 3개 필드 CSV 전처리만 지원한다. PDF, DOCX, XLSX, HTML, ZIP, n8n, FastAPI, Pydantic, LLM 의미 분석, 벡터 저장은 아직 미구현이다. 범용 N필드 스키마·문서 파싱·선택적 Local LLM·RAG 연동은 별도 단계에서 구축한다.

해커톤 Public 저장소에 SMAX Private 소스·사업 문서·고객 자료를 직접 복사하지 않는다. 공개 가능한 최소 모듈/계약을 분리할지 사용자 승인 후 결정한다. 별도 대회 코드는 스키마 어댑터와 합성 데이터 검증부터 시작한다.

상세 분업과 다음 단계: docs/PREPROCESSING_BRANCH_PLAN_20261027.md
