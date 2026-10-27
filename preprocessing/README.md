# SMAX² PREPROCESSING — Private reusable data layer 

## 최신 작업 분담 (2026-10-27)

**전처리 총괄 책임은 범용 엔진 자체를 완성하는 것뿐이다.** 타 프로젝트가 이 저장소의 코드를 가져가 수정·연동하는 행위는 해당 해커톤 총괄/해총의 업무다. 전처리 총괄은 대회별 어댑터, 공모전 제출, 타 레포 연동을 담당하지 않는다. Public 제출용 소스 추출 시 사용자는 공개 범위·권리·대회 규칙을 별도로 판단한다.

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

npm run test:preprocessing

위 예제는 합성 데이터만 포함한다. 실고객 파일은 사전 허가된 로컬 위치에서만 사용한다. CLI는 입력을 수정하지 않으며 출력 JSON이 이미 있으면 실패한다. 자동 파일 업로드나 HTTP 요청은 없다.

## 역할·미지원

본 V0은 현재 구현된 3개 필드 CSV 전처리만 지원한다. PDF, DOCX, XLSX, HTML, ZIP, n8n, FastAPI, Pydantic, LLM 의미 분석, 벡터 저장은 아직 미구현이다. 범용 N필드 스키마·문서 파싱·선택적 Local LLM·RAG 연동은 별도 단계에서 구축한다.

해커톤 Public 저장소에 SMAX Private 소스·사업 문서·고객 자료를 직접 복사하지 않는다. 공개 가능한 최소 모듈/계약을 분리할지 사용자 승인 후 결정한다. 별도 대회 코드는 스키마 어댑터와 합성 데이터 검증부터 시작한다.

상세 분업과 다음 단계: docs/PREPROCESSING_BRANCH_PLAN_20261027.md
## 2026-10-27 — 공통 N필드 CSV 엔진 추가

전처리 담당자가 관리하는 새 범용 엔진:

- `preprocessing/generic-csv.mjs`: `preprocessGenericCsv(source,{columns})`, `validateGenericCsvPackage(pkg)`, `serializeGenericCsvPackage(pkg)`
- `preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json`: 언어 간 공통 구조 확인용 JSON Schema Draft 2020-12
- `tests/preprocessing-generic.test.mjs`, `tests/preprocessing-generic-schema.test.mjs`: 8+2개 신규 테스트
- 내부 CSV 파서는 `site/csv-transform.mjs`에서 `parseCsvRecords`를 새로 export하여 기존 검증을 그대로 재사용. 기존 3필드 정제/매출 결과는 변경하지 않음.

**사용법 예시 (메모리 API, 대회별 연동 아님)**

```js
import {preprocessGenericCsv} from './preprocessing/generic-csv.mjs';
const csv='제목,수량,메모\n예제,20,정상';
const result=preprocessGenericCsv(csv,{columns:[
  {key:'title',source:'제목',type:'text',required:true},
  {key:'quantity',source:'수량',type:'integer',required:true},
  {key:'note',source:'메모',type:'text',required:false}
]});
```

명시적으로 1~64개 필드를 매핑한다. 타입은 `text`, `integer`, `decimal`, `date`, `boolean`. 원본의 **모든 열 값과 원본 행 번호**를 JSON 안에 포함하므로 개인정보/기밀 자료 처리 시 결과물도 원본과 동일하게 보호해야 한다. 원본 중복은 모든 열이 정확히 일치할 때만 표시하고 원본 행을 삭제하지 않는다. 데이터 검토는 자동 승인하지 않는다. 자유 텍스트·문서·LLM·벡터·범용 파일 CLI는 아직 미구현이다.

**실행 명령**: `npm run test:preprocessing` (기존 V0 테스트 + 신규 V1 10건).
현 도구에서 V8로 기존 CSV 파서+실제 체크인된 Generic 테스트 콜백 **8/8 PASS**, 변조된 필드값 검사 1건 별도 PASS. SHA는 해당 런에서 **모의 구현**. *전체 Native Node, JSON Schema의 독립 검증 라이브러리 구동, 실제 브라우저·Windows는 미실행*.

**역할:** 전처리 총괄은 공통 전처리 엔진만 완성한다. 해커톤별 코드 가져오기·변형·연동·제출 및 각 레포의 공개/비공개 판단은 해커톤 총괄/해총이 담당한다.

## 2026-10-27 — Generic CSV V1 파일 CLI (신규 코드, 출고 검증 대기)

기존 3필드 `cli.mjs`는 그대로 보존하고, 별도로 `generic-cli.mjs`를 추가했다. 1~64개 필드가 들어 있는 JSON 설정 파일을 명시적으로 제공하며, 자동 열 추론/업로드/자동 승인 기능은 없다.

```json
{"columns":[
  {"key":"order_id","source":"주문번호","type":"text","required":true},
  {"key":"price","source":"가격","type":"decimal","required":true}
]}
```

위 내용을 로컬 `columns.json`으로 저장하고 컬럼명이 일치하는 UTF-8 CSV에 대해 실행한다.

```bash
node preprocessing/generic-cli.mjs --input input.csv --columns columns.json --output new-result.json
```

- CSV 원본 최대 2 MiB, JSON 설정 최대 64 KiB. 올바르지 않은 UTF-8과 심볼릭 링크 파일 거부, 출력 경로 기존 파일 덮어쓰기 거부(`wx`).
- 출력은 `SMAX_PREPROCESS_GENERIC_CSV_V1`, 파일 바이트 SHA-256, 전체 행·열 보존, 오류/검토 목록, `approval=NOT_GRANTED`를 포함한다. 출력 JSON도 기밀 원본과 동일한 보안 등급으로 취급한다.
- 현재 환경은 Node 22가 설치돼 있으나 Private GitHub 전체 클론 DNS 실패. 전용 CLI 원격 커밋 반영은 확인했지만 **실제 원격 의존 모듈을 포함한 Native 통합/파일 CLI E2E는 아직 미검증**. 테스트 소스의 원격 추가 시도는 안전 검사에서 2회 차단돼 중단했다. 결제·배포·고객 파일 사용 없음.

## 2026-10-27 — XLSX ZIP 사전검사 V0 (Native 단독검증 완료, 표 추출 미구현)

- 파일: `preprocessing/xlsx-preflight.mjs`; `preflightXlsx(Uint8Array)` 로컬 메모리 API. Node.js 20+ 내장 `zlib`만 사용, 추가 NPM/외부 API/업로드 0개.
- 역할: XLSX를 ZIP으로 검사하고 정상 파일의 압축 메타데이터·무결성·기본 필수 파트 존재만 확인. **XLSX 셀/시트 데이터 파서가 아니며 CSV/Strict JSON 변환을 구현했다는 뜻이 아니다.**
- 제한: 입력 ZIP ≤2MiB, 압축 해제 총량 ≤8MiB, 파일항목 ≤512. ZIP64/다중디스크/암호화/데이터 디스크립터/임베딩/외부 링크/매크로/심볼릭 링크/중복 경로/경로순회/DTD 및 외부 Relationship을 거부. CRC32·헤더/압축 크기·오프셋 일치 검증. XML 파싱·안전 확정 및 Excel 호환성 전체 보장은 하지 않는다. 제한 밖 유효 XLSX도 거부할 수 있다.
- 테스트: `node --test tests/xlsx-preflight.test.mjs` — 로컬 실제 Node 22.16.0과 **GitHub 두 파일 blob SHA가 일치하는 소스**로 합성 ZIP 10/10 PASS, 0 FAIL. 실제 고객 XLSX 및 Windows 실행·전체 기존 CSV npm 회귀는 미검증.
- 기존 `npm run test:preprocessing`에 이 전용 테스트 파일을 포함시켰으나 **전체 npm 명령 Native PASS는 주장하지 않는다**. 다음에는 별도 CSV 정본 Node QA 확보 후 XLSX 시트/셀 파싱 단계 설계를 검토한다.
