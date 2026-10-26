# SMAX PREPROCESSING 총괄 인수인계 — 2026-10-27 KST

## 1. 사용자 결정과 책임

사용자가 “SMAX에 전처리 브랜치를 만들어서 따로 관리하자. 해커톤에서 사용해야 할 것 같다”고 승인했다. GitHub Private hibi89/SMAX 에 preprocessing 브랜치 생성. 원본은 backend SHA 5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868. main/frontend/backend 수정·병합 없음. 해커톤 3개 기존 담당자/일정은 그대로.

## 2. 최초 구현 산출물

- preprocessing/index.mjs: 기존 site/csv-transform.mjs 재사용, preprocessMappedCsv / validatePreprocessPackage / serializePreprocessPackage.
- preprocessing/cli.mjs: UTF-8(잘못된 바이트 거부) CSV → 신규 JSON 경로로 로컬 전처리, 경로 확장자·파일 크기·심볼릭 링크·기존 출력 덮어쓰기 방지. 생성 파일 권한 제한 시도(운영체제 지원 범위).
- preprocessing/SMAX_PREPROCESS_CSV_V0.schema.json: JSON Schema Draft 2020-12 기반 문서형 필드 계약. 행 개수 및 큐의 교차 검증은 JS validatePreprocessPackage에서 추가로 처리.
- preprocessing/examples/synthetic-orders.csv: 합성 거래 데이터만.
- tests/preprocessing-package.test.mjs 5건, tests/preprocessing-cli.test.mjs 3건, tests/preprocessing-schema.test.mjs 2건.
- package.json: npm run test:preprocessing 명령(10건)을 추가. 기존 npm test 명령 보존.
- preprocessing/README.md: 실사용 로컬 예제·한계·해커톤 코드 공개 조건.
- docs/PREPROCESSING_BRANCH_PLAN_20261027.md: 로드맵과 branch 운영 정본.
- AGENTS.md: 기존 3브랜치 운영 규칙에 2026-10-27 preprocessing 네 번째 브랜치 예외 추가.

## 3. 정형화 결과 계약

schema_version SMAX_PREPROCESS_CSV_V0, source SHA256/bytes/source_rows, human mapping(date/item/amount), rows(source_record/date/item/amount/status/reasons), review_queue, quality, processing_mode DETERMINISTIC_LOCAL, approval NOT_GRANTED.
현재 2MiB 이하 UTF-8 CSV + 명시 3필드 매핑만 실행 가능. 모든 행 보존, 원본 번호·중복/결측/날짜·금액/Formula 안전 검사. 원본 미선택 추가 열은 JSON 객체로 복사하지 않는다. 확정 승인·세금 판단·저장/전송은 절대 자동 실행하지 않음.

## 4. 검증과 한계

- 실제 GitHub preprocessing 최신 모듈과 기존 CSV 엔진 원문을 V8 함수로 결합하고, 저장소에 체크인한 package 테스트의 콜백 5건을 실행: 5/5 PASS, 순수 JS SHA256 표준 벡터 3/3 PASS. 본 실행의 Node 의존성은 adapter/mock으로 연결했으며 **Native Node 테스트는 아니다**.
- 코드·테스트 5개 파일 구문 검사 PASS. 로컬 Node TextDecoder fatal UTF-8/BOM 옵션에 대한 별도 동작 확인. 
- 전체 저장소 npm test, 전용 npm run test:preprocessing, 실제 CLI JSON 파일 쓰기 E2E 및 해커톤 통합은 아직 NOT_RUN. 특히 CLI 회귀 3건, schema 회귀 2건은 체크인됐지만 native 실행 증거가 없다. 
- 제품 기능 완성률, 해커톤 점수 상승, 정형 데이터 실사용 품질을 과장하지 않는다.

## 5. Next — 다음 안전 작업

1. 정확한 preprocessing 브랜치 checkout이 가능한 Node 환경에서 npm run test:preprocessing 및 필요시 npm test 실행. 합성 CSV CLI 실제 파일 생성/해시·권한/오류 복구 점검.
2. 데이터 유형별 요구사항 확인 후 Generic CSV N필드 확장과 공통 source provenance/quality adapter 구현.
3. 문서 파서 플러그인(선택) 및 Schema Enforcer(추가 검증)와 사람 검토 이벤트 스키마 작성.
4. 공개 저장소로 필요한 모듈을 이동하기 전에 대회 제출·라이선스/사업 IP 공개 범위 확인 및 사용자 명시 승인. 현재 Private SMAX의 전체 소스나 개인정보를 Public 해커톤 repo로 복사 금지.
5. 특정 해커톤에 실제 연결되는 adapter는 해당 데이터·대회 브랜치의 현황 조회 후 별도 구현. 사용자의 기존 KIC/UGREEN 원본 파일과 진행률 임의 변경 금지.

## 6. 개발 운영 신호

사용자가 다음 채팅에서 “[SMAX preprocessing 브랜치 확인하고 작업이어가셈]” 혹은 “전처리 총괄 ㄱ”으로 호출하면, hibi89/SMAX preprocessing 최신 HEAD·이 문서·preprocessing/README.md·docs/PREPROCESSING_BRANCH_PLAN_20261027.md·해당 소스·테스트 먼저 확인하고 안전한 다음 작업을 실제로 진행한다. 매 완료 단위에 STATUS/HANDOFF 및 이 정본을 최신화. 다른 브랜치는 자동 병합/배포/판매 금지.
