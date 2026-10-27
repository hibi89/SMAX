> **2026-10-27 사용자 최신 역할 변경:** `preprocessing` 총괄은 **범용 전처리 기능과 테스트 완성까지만** 담당한다. 각 해커톤별 모듈 복사·변형·연동·어댑터·제출은 **해커톤별 총괄 또는 해총이 독립적으로 처리**한다. 아래 P5의 '해커톤별 adapter'는 전처리 총괄 과제에서 제외되며, 공통 엔진의 사용 설명서/계약만 유지한다. 다른 해커톤 저장소를 임의 조사·수정하지 않는다.

# SMAX² 전처리 전용 브랜치 및 해커톤 재사용 마스터플랜

기준: 2026-10-27 KST. 사용자 승인: SMAX 전처리를 별도 브랜치에서 개발하고 해커톤에 재사용.

## 브랜치 구성

| 브랜치 | 담당 |
|---|---|
| main | 사업·기획 통합 기준 |
| frontend | SELF UI·브라우저/Windows QA·정적 쇼룸 |
| backend | 규칙형 로컬 CSV/매출 엔진 |
| preprocessing | 해커톤용 재사용 전처리 API·검증·문서 |

preprocessing은 기존 Private backend 커밋 5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868에서 분기했다. 기존 세 브랜치 코드·전략·진행률은 불변. 임의 merge/rebase/deploy 하지 않는다.

## 설계 원칙

1. 불신 파일 입력: UTF-8 구조·2MiB 제한·헤더·원본 바이트 SHA 검증.
2. 원본 유지: 변환은 새 객체/파일로만. 표준화와 원본 행 번호 분리.
3. 결정론적 정제 우선: 매핑·날짜·금액·중복·결측·수식 위험. LLM이 숫자·날짜를 임의로 확정하지 않음.
4. Strict JSON: SMAX_PREPROCESS_CSV_V0; schema_version, source, mapping, rows, review_queue, quality, processing_mode, approval. 미등록 필드와 자동 APPROVED 등 거부.
5. Human review: NEEDS_REVIEW는 검토 큐, READY_FOR_HUMAN_REVIEW도 사람 최종 판단 필수.
6. 결과 소비: 로컬 JSON/메모리 API. DB와 벡터 인덱스는 별도 소비자 또는 후속 단계 담당.

## 구현 완료/검증 현황

- 실제 파일: preprocessing/index.mjs, preprocessing/cli.mjs, tests/preprocessing-package.test.mjs, tests/preprocessing-cli.test.mjs.
- 기존 site/csv-transform.mjs를 그대로 재사용. 5개 체크인 package 테스트의 원본 콜백을 최신 실제 GitHub CSV 엔진/전처리 모듈에 연결한 격리 V8 검사 5/5 PASS. SHA256 구현 참조 벡터 3/3 PASS.
- 이것은 실제 Node CLI/전체 원격 저장소 Native QA가 아님. CLI 입출력/Windows/실 해커톤 데이터 및 배포 상태는 NOT_RUN.
- 비용: 외부 LLM/서버/API 0원. Private 저장소에서만 개발. 실고객 데이터 사용/대외 배포/소스 공개/판매 없음.

## 차기 단계 (아직 구현되지 않음)

P1: Generic CSV N필드 스키마와 입력 계약/합성 데이터셋, CSV 원본 전체 보존과 품질 보고서.
P2: XLSX/PDF/DOCX/HTML 파서 플러그인, 파일 해시와 페이지/표/셀 provenance, 손상 파일/ZIP 폭탄 차단.
P3: 규칙 기반으로 확정할 수 없는 자유 텍스트에 한해 선택적 Local LLM 의미 분석 → 엄격 필드·출처 검증 → 인간 검토 요청.
P4: 선택형 n8n/Webhook 승인 어댑터, 정형 SQLite/분석 DB 및 문서 청킹·벡터 인덱스; 기존 RAG Studio AX_DATA_PACKAGE_V0와 호환 계약 테스트.
P5: 공개 가능한 별도 추출물의 라이선스/권리 검증, 해커톤별 adapter와 E2E/대회 규정 확인.

## 해커톤 사용 경계

- KIC/유그린/기타 대회 데이터가 날짜·항목·금액 구조일 때만 현재 V0 직접 사용. 아니면 N필드 어댑터가 먼저 필요하다.
- 해커톤 코드 저장소가 Public이면 SMAX 비공개 소스 전체나 사용자 사업 전략을 복제하지 않는다. 데이터 계약과 합성 fixture만 공유하는 방안과, 사용자 승인 후 공개 가능한 최소 코드 추출안을 구분한다.
- 다른 저장소에 실제 소스 반영/브랜치 병합/CI 배포/대회 제출은 이 브랜치 생성만으로 승인된 게 아니다.
- 과장 금지: 어떤 현장 데이터도 완벽 처리하거나 Pydantic/Vector/n8n이 현재 동작한다고 말하지 않는다. LLM 자가 confidence_score는 검증된 정확도 보증 아님.
- 기존 SMAX SELF 2026-11-07 검증과 다른 프로젝트 기한을 이 작업으로 지연하거나 자동 조정하지 않는다.

## 복원 절차

다음 채팅에서 “SMAX preprocessing 브랜치 확인하고 작업이어가셈” 요청 시 repo hibi89/SMAX Private preprocessing의 최신 HEAD, preprocessing/README.md, 이 문서, preprocessing/index.mjs, cli.mjs, 해당 tests, STATUS/HANDOFF 최신 부분을 읽고 안전한 다음 구현/테스트를 수행한다.
## 2026-10-27 범용 CSV P1 착수 결과 및 전처리-only 운영

- 사용자 최종 역할: 이 브랜치는 전처리 기술 개발·안정화·테스트만 담당. **대회별 적용은 각 해커톤 총괄이 자체 수행**. P5의 어댑터/타 레포 전송은 전처리 개발 계획에서 제외.
- **실제 신규 구현:** 기존 `site/csv-transform.mjs` 정본 CSV parser를 `parseCsvRecords`로 export, `preprocessing/generic-csv.mjs`에 1~64개 타입 명시 필드 표준화·원본 전체 열+행 추적·정확히 같은 원본 행의 중복 검토·결측·형식·Excel 수식 위험 판정·품질 수치·불변 승인 제한 추가. 3필드 V0는 그대로 유지.
- **공용 규격:** `SMAX_PREPROCESS_GENERIC_CSV_V1`, `preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json`; 필드 타입 text/date/decimal/integer/boolean; 원본 SHA256·바이트·헤더·행 보존; issues/review_queue/approval.
- **검증:** 실제 GitHub 코드 원문/체크인 테스트 8건 V8 격리 8/8 PASS; 일부 tampering 거부 별도 확인. 새 회귀 2건과 기존 테스트를 포함하는 전용 `npm run test:preprocessing` 변경. 전체 Native Node 실행과 실 사용자 파일 검증은 **NOT_RUN**.
- **위험:** V1은 데이터 원문을 포함한 JSON 반환이므로 기밀·개인정보가 그대로 복제될 수 있다. 로컬 메모리/권한 있는 경로만 사용. JSON Schema는 구조 계약이며 실 규칙·행별 출처 상호 검증은 JS 검증기를 사용. 아직 Generic CSV CLI·PDF/XLSX/DOCX·LLM·Vector 없음.
- **다음 엔진 작업:** 모든 V0/V1 자동 테스트 실제 Node 실행 → Generic CSV 전용 로컬 CLI/오류 복구 → 파일 provenance 검증·성능/한도 → 문서 입력 플러그인. 기존 다른 브랜치/대회별 브랜치 자동 변경 금지.

## 2026-10-27 — P1.1 Generic CSV 파일 CLI 추가 (부분 완료)

- 기존 3컬럼 V0 CLI에 옵션을 혼합하는 설계보다 V1 전용 `preprocessing/generic-cli.mjs`를 별도 작성했다. 하위 호환성·분리 테스트·오류 범위 면에서 유리하고 외부 종속성은 0개다.
- 원격 코드 커밋: `9eb19dbe49bcba2ed1dede39d920ae54828e3da2`. 명시 `--input .csv --columns .json --output .json`, 최대 CSV 2MiB/매핑 64KiB, fatal UTF-8, regular file 확인, 파일 심볼릭링크 차단, exclusive new output, V1 스키마 및 SHA 반환.
- 원격 회귀 테스트 파일을 생성하려던 시도 2회는 도구 안전 검사에서 차단. **새 테스트 GitHub 미반영**. 원격 전체 checkout은 `github.com` DNS 오류로 불가; 실제 신규 CLI의 Native Node/E2E 실행 **NOT_RUN**. 작은 범위의 재구성본 문법 검사와 제품 회귀 QA를 구분해야 한다.
- 기존 `npm run test:preprocessing`과 다른 브랜치, 프로덕션, 대회 저장소에는 변경 없음. 실제 변환과 실패복구 검증 후 CLI 출고 승인 여부 판정.
- 다음 작업: GitHub 새 테스트 추가 가능 경로를 확보 → 최신 SHA 기준 전체 Native Node 회귀·CLI 파일 E2E → 파일 크기/UTF-8/BOM/중복·오류/출력 권한 측정 → 그 후 확장 포맷 플러그인 설계.

## 2026-10-27 — Strict V1 validator + Generic CLI regression

- V1 validator가 **원본 parser만큼 엄격하게 매핑하지 않은 header도 검사**하도록 보강했다. 실제 원격 모듈에서 unmapped Unicode invisible header 허용을 재현하고 코드+회귀를 커밋했다.
- 신규 별도 test 파일 GitHub 생성 실패 2회를 반복하지 않고 기존 전용 테스트 파일의 추가 사례로 전환해 CLI 검증 4건, Generic schema 검증 1건을 체크인했다.
- 실제 원격 CSV 코어+V1 엔진(crypto/TextEncoder stub) V8 테스트 6/6 PASS. 전체 Native Node, 실 CLI E2E, Windows, schema 라이브러리 검증 전까지 릴리스 승인 금지.
- 다음 순서: Native QA 출처 확립 → 파일 CLI 불변성/실해시/오류복구 → 데이터 provenance 및 문서 포맷별 importer. 대회별 코드는 해총/해커톤 담당만.

## 2026-10-27 — P1 strict approval state invariant

- 발견: 정상/검토 전처리 행의 임의 `APPROVED` 문자열이 기존 V1 JS validator에서 통과 가능. `approval='NOT_GRANTED'` 최상위 검사는 있어도 row.status 경계를 엄격히 검사해야 함.
- 수정: 코드 `4948640b`, 회귀 `1944256e`; `issues.length`에 따라 허용 상태 정확히 2개만, 검토 누락/위조 실패.
- 현 시점 실제 체크인 원본 CSV+V1을 사용한 V8 격리 시나리오 20/20 PASS. SHA256·TextEncoder 모의이고 Native npm/CLI E2E/Windows는 미실행.
- 다음: Native 전용 및 전체 Node 회귀(동일 원격 소스) 확보 → 로컬 파일 SHA/출력 검증 → 독립 문서 파서 provenance 및 한도·오류 복구. 타 브랜치/대회별 연결·배포/비용 변경 없음.

## 2026-10-27 — XLSX ZIP preflight V0 검증 완료, parsing 이후 단계

- 독립 `preprocessing/xlsx-preflight.mjs`·`tests/xlsx-preflight.test.mjs` 체크인. 실제 Node 22 로컬 ZIP 합성 시험 10/10 PASS, 두 파일 Git blob SHA 교차 확인.
- 압축 한도(2MiB → 최대 8MiB/512 entry), CRC/헤더/경로/매크로/외부링크/DTD 검증·승인 미부여만 구현. 아직 셀 데이터 추출/자동 CSV 변환/실무 호환성 없음.
- `package.json` 기존 테스트 스크립트에 케이스 등록. 전체 CSV Native 회귀·실제 XLSX/Windows·브라우저/Production QA는 미실행.
- 개발 순서: 전체 정본 QA 장애 해결 → 제한형 XLSX 시트/셀 parser 설계 및 provenance 연결 → PDF/DOCX plugin 선택/허용 포맷 안전 기준 검증. 해커톤별 연동 책임은 각 해커톤 총괄.

## 2026-10-27 — 실제 XLSX cell extractor V0 도달

- 전용 `preprocessing/xlsx-cells.mjs` 및 기존 테스트 8건 증설. ZIP preflight를 통과한 입력에서 시트 XML 기반 셀/수식·원본 경로/행/주소를 수집한다. inline/shared strings, 정밀 숫자 문자열, bool, 오류/수식 검토. 자동 승인·수식 실행 금지.
- Node 22 Native 테스트 `tests/xlsx-preflight.test.mjs` **18/18 PASS**, 원격/로컬 blob SHA 2개 완전 일치. 합성 openpyxl/XlsxWriter XLSX 2종 해석 통과. 전체 Private CSV 회귀는 환경 제약으로 미실행.
- 제한형 파서 계약 우선. XML 깊이/노드 및 행·셀 상한, 원본 파일 2MiB/8MiB 압축해제, unsupported structures는 거부하거나 아직 의미 해석 불가. 표시 시트 이름, 날짜/서식·스타일, 전체 워크북 관계, formula evaluation, schema/validator는 차기 별도 단계.
- 이번 개발 이후 우선순위: 정본 전체 Node/npm 검증 통로 → XLSX 구조 Schema·오류 검토 계약 → CSV와 공통 provenance 도출 → 다음 형식(DOCX/HTML/PDF) 선택. 각 해커톤 연동·복사/변형/제출은 별도 총괄.
