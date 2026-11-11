> **SMAX² 2026-11-10 P5–P7 진척(잠정 최종상품 50%):** 로컬 배치 `npm run preview:batch -- --manifest preprocessing/examples/synthetic-self-batch.manifest.json`(8개까지, 중복 SHA/검토시 부분 금액 봉쇄), 정적 HTML `npm run preview:batch:html -- --manifest <manifest.json>`(무JS/CSP·승인 전 검토), 사용자 열 후보 `npm run preview:suggest -- --input <selected.csv>`(한국어/영어 별칭·모호하면 보류/절대 자동적용 없음). P7 GitHub 코드/테스트 원본 SHA가 같은 Native Node22 **28/28 PASS**(CLI는 parser/reader test double), P5 V8 함수 17/17, P6 HTML V8 14/14, P3/P4/P5 원본 V8 경계 통과. **전체 `npm run test:preprocessing` Native 원본 repo/실 Windows/실고객/SELF frontend/상용 릴리스 미검증**. 상세 [P5](../docs/PREP_SELF_BATCH_20261110.md), [P6](../docs/PREP_SELF_HTML_REPORT_20261110.md), [P7](../docs/PREP_SELF_COLUMN_SUGGEST_20261110.md). GitHub 기능 SHA `3190da505efcd55e7e83a1eabe994fbd8c9e5718`(후속 docs-only SHA는 별도), RELEASE HOLD.

> **SMAX² P4 로컬 CLI — 2026-11-10:** 이제 정확한 CSV+설정 JSON을 소유자가 선택해 `node preprocessing/self-preview-cli.mjs --input preprocessing/examples/synthetic-self-preview.csv --config preprocessing/examples/synthetic-self-preview.config.json`으로 PREP→SELF 집계 초안 또는 `REVIEW_HOLD`를 출력할 수 있는 CLI 코드가 추가됨. Node22에서 CLI 파일 SHA 일치 `node --check` PASS 및 도메인 mock **Native 파일 I/O 11/11 PASS**, 실제 Native 통합 테스트 16건은 `tests/self-preview-cli.test.mjs`에 기록했으나 `npm run test:preprocessing` 실행 검증은 **미완**. stdout은 집계·해시·승인 전 상태만; 고객 원본 행·CSV 무출력/미수정. 전체 SMAX² 최종완성률 **45%(잠정 유지)**, Windows/real PREP+SELF 전부 실제 Node 통합 검증·판매는 HOLD. [P4 계약](../docs/PREP_SELF_PREVIEW_CLI_20261110.md).

> **2026-11-10 P3 PREP → SELF 로컬 집계 미리보기 게이트:** `preprocessing/self-preview-gate.mjs` / `tests/self-preview-gate.test.mjs` 추가. PREP `SMAX_PREPROCESS_GENERIC_CSV_V1`를 원본 CSV에서 다시 계산하고, 명시 매핑·필수 타입/승인상태 검증 후에만 기존 SELF 매출 엔진의 **집계 초안**을 읽기 전용으로 제공. PREP/SELF 검토 사유가 있으면 `REVIEW_HOLD`하고 자동 승인·고객 원본/파일 변경·외부 전송을 금지. [계약과 검증 제한](../docs/PREP_SELF_PREVIEW_GATE_20261110.md). 격리 V8 합성 14/14 PASS(crypto·UTF8 test double) 기록이며 **Native Node 전체 `npm run test:preprocessing` 및 Windows/정확 SHA GitHub Actions 미검증, 상용 HOLD**. frontend/main 자동 병합 없음.

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

## 2026-10-27 — 제한형 XLSX 시트/셀 추출 V0 (사전검사 뒤 실행)

`preprocessing/xlsx-cells.mjs`의 `extractXlsxCells(Uint8Array)`는 동일 브랜치 `xlsx-preflight.mjs`의 ZIP 사전검사를 **먼저 실행**한 뒤, 지원되는 워크시트 XML에서 원본 셀 값을 읽는다. 아래 기능은 직전 '사전검사만 구현' 기록보다 최신이다.

- **지원:** `xl/worksheets/sheetN.xml` 복수 시트(파일 경로/행 번호/셀 주소 보존), inline string, sharedStrings 및 rich-text 결합, 정확한 원문 숫자 문자열, boolean, 공백, 오류 셀, 수식 검토 큐 성격의 `NEEDS_REVIEW` 표시.
- **출력:** `SMAX_PREPROCESS_XLSX_CELLS_V0`; `source.sha256`/bytes/worksheet_paths, `sheets[].rows[].cells[]`, quality(sheets/rows/cells/review_cells), `processing_mode=DETERMINISTIC_LOCAL`, `approval=NOT_GRANTED`.
- **수식 미실행:** `<f>`를 발견하면 계산하지 않고 `value:null`/`formula:원문`/`status:NEEDS_REVIEW`로 출력한다. 오류 셀·일부 수식형 문자열도 검토 대상. **날짜 서식·Excel 스타일 해석, 수식 결과/캐시 신뢰, 표시 형식/행위 및 사업 의미 추론 없음.** 숫자 타입은 손실 없는 `number_text` 문자열.
- **제한:** ZIP ≤2MiB, 합계 해제 ≤8MiB, 엔트리 ≤512, 시트 ≤64, 추출 행 ≤10,000, 셀 ≤100,000, XML 노드 ≤300,000(문서별), XML 깊이 ≤64. 제한 초과/불명 형식은 fail-closed. 파일 시스템 쓰기·HTTP·LLM 호출 없음.
- **현재 계약 범위:** 실제 Excel의 모든 기능 지원이 아니다. 표시용 시트 이름/논리 순서·관계 매핑, 날짜 포맷/수식 계산, 하이퍼링크·그림, 병합 셀의 의미·차트/피벗/매크로는 미구현/비해석. 반환되는 `source_path`는 원본 ZIP 내부 경로이며 사용자 표시 시트 이름과 다를 수 있다. 속성/셀 형식 중 미지원 내용이 있을 수 있으므로 실 고객 데이터 처리·납품 승인은 아직 금지.

```js
import {readFileSync} from 'node:fs';
import {extractXlsxCells} from './preprocessing/xlsx-cells.mjs';
const pkg = extractXlsxCells(readFileSync('local.xlsx'));
console.log(pkg.quality, pkg.sheets[0]?.rows[0]);
```

**증거:** 실제 Node v22.16.0에서 `node --test tests/xlsx-preflight.test.mjs` **18/18 PASS**(기존 안전검사 10 + 신규 시트/셀 8). 실제 로컬에서 합성 생성한 `openpyxl` 및 `XlsxWriter` XLSX 2종에서 셀 추출·수식 검토 분리 성공. 두 생산 파일과 테스트에 고객 정보 없음. 원격 GitHub production 모듈 blob `ee81d55fbaa64e234d104a6e0a68904e812351f1`와 로컬 실행 소스 blob 동일, 원격 test blob `fbbc028188b0e4de16b66b4dcd9b7e330a9c6044`와 로컬 테스트 원문 동일. 기존 CSV 포함 **전체 Native `npm run test:preprocessing`·`npm test` 및 Windows는 아직 NOT_RUN**.


## 2026-10-27 — XLSX Strict JSON 검증기 및 스키마 V0

- 독립 계약 파일: `preprocessing/SMAX_PREPROCESS_XLSX_CELLS_V0.schema.json` (Draft 2020-12, 속성 추가 금지, 버전·타입·크기·승인 불가 구조).
- 의미·무결성 검증기: `preprocessing/xlsx-package.mjs` — `validateXlsxCellsPackage(pkg, originalBytes?)`, `serializeXlsxCellsPackage(pkg, originalBytes?)`.
- **구조 검증**: 변조된 행·셀 주소 및 중복, 허용되지 않은 상태 문자열·수식 결과, 품질 집계/행 개수·시트 경로 불일치, 최상위·하위 임의 속성 거부. 셀 상태는 수식/오류/수식형 텍스트 여부에 따라 필수 검토 상태와 일치해야 함.
- **원본 인증 검증(선택, 강력 권고):** 두 번째 인수로 원본 XLSX 바이트를 전달하면 SHA-256·바이트 길이 확인 **및 같은 바이트로 재추출한 전체 결과 비교**. 원본 미전달 시 구조만 검증하므로 수정된 문자열이 유효 타입이면 통과할 수 있음. 구조 검증만으로 데이터 진본 여부를 주장하지 말 것.
- 사용 예:
```js
import {readFileSync} from 'node:fs';
import {extractXlsxCells} from './preprocessing/xlsx-cells.mjs';
import {validateXlsxCellsPackage,serializeXlsxCellsPackage} from './preprocessing/xlsx-package.mjs';
const original=readFileSync('input.xlsx');
const pkg=extractXlsxCells(original);
validateXlsxCellsPackage(pkg,original);
const json=serializeXlsxCellsPackage(pkg,original); // 사람이 승인한 파일이 아님
```
- **검증 출처:** 이전 XLSX 실제 코드 및 이번 검증기/회귀가 GitHub 원격 blob SHA와 로컬 실행 파일 일치; Node 22.16.0 `node --test tests/xlsx-preflight.test.mjs` **26/26 PASS** (이전 18 + 신규 보안/원본 동등성 8). 스키마 JSON 자체는 원격 파싱/필드·`$defs`/승인 const 확인. 독립 Native schema 엔진(Ajv 등)을 사용한 JSON Schema 적합성 테스트 및 **CSV 포함 전체 npm test/Windows는 미실행**.


## 2026-10-27 — XLSX 숫자형 위장 데이터 거부 및 독립 스키마 QA

- **결함:** 앞선 제한형 `xlsx-cells.mjs`는 Excel의 `t=n` 숫자 셀 안에 `NaN`, `Infinity`, `=SUM(1)`, 임의 문자열이 들어와도 `number_text`로 신뢰하는 문제가 있었다. `xlsx-package.mjs`도 타입이 문자열인지 여부만 확인했다.
- **수정:** 파서, JS 패키지 검증기, JSON Schema 3곳에 동일한 숫자 문자열 lexical grammar를 강제한다. 유효한 `-12.50`, `+.5`, `1.`, `1e-13`, 긴 정밀도 숫자는 **문자열로 보존**; `NaN`·`Infinity`·`=SUM(1)`·`+cmd`·`1,234`·공백만 있는 값은 fail-closed. Excel 날짜 스타일을 숫자에서 추론하거나 `Number()`로 반올림하지 않는다.
- **검증:** Native Node v22.16.0 `node --test tests/xlsx-preflight.test.mjs` **29/29 PASS**(이전 26 + 숫자형 3). 외부 오픈소스 `jsonschema` Draft202012Validator로 원격 Schema 동일 blob `ff25c696a64ebb1e71439f163e748b7a9857bbf1`를 독립 검사한 로컬 케이스 **21/21 PASS**(정상 원본 2, 변조/문법 19). 재실행 가능한 새 `tests/test_xlsx_schema_contract.py`를 추가했으며 `python -m unittest discover -s tests -p 'test_xlsx_schema_contract.py'` **5/5 PASS**. Python jsonschema는 개발자 선택 검사 도구이며 SMAX 사용자 런타임 설치 필수 아님(없으면 unittest skip).
- **정본 증거:** 변경된 XLSX 코드/검증기/Schema/Node 테스트/Python 테스트 5개 파일 각각의 `git hash-object`가 Private GitHub blob SHA와 동일. `preprocessing`만 수정.
- **미검증:** 기존 CSV V0/V1 전체 `npm run test:preprocessing`, 전체 `npm test`, Windows 및 실고객 XLSX 파일은 **NOT_RUN**. 이번의 29/29와 5/5는 신규 XLSX 테스트 범위만이다. CSV와 XLSX가 통합된 전처리 시스템 출시 승인 아님.


## 2026-10-27 — XML 문자참조 External 관계 우회 차단

- **재현:** XLSX ZIP 내부 `xl/_rels/workbook.xml.rels`에 `TargetMode="Exter&#x6e;al"`이 포함돼도 기존 `preflightXlsx()`는 원문 `External` 비교만 하므로 사전검사를 통과. 사용자 파일은 사용하지 않고 합성 ZIP으로 실제 Node에서 재현했으며, 수정 전 해당 새 테스트가 FAIL했다.
- **수정:** `preprocessing/xlsx-preflight.mjs`에서 `TargetMode` 속성을 찾은 다음 XML numeric character reference(16진수·10진수)와 표준 named references를 디코드해 `Internal`만 허용. 누락된 인용부호/부정확한 참조 등은 실패 종료. 검사 파일 확장자 `.rels/.xml`은 대소문자와 관계없이 확인.
- **회귀:** 외부 모드 문자참조·잘못된 모드, 정상 `Inte&#114;nal`, 대문자 `.RELS`의 외부 모드 총 4개 Node 테스트 추가. 최신 `node --test tests/xlsx-preflight.test.mjs`: **33/33 PASS, 0 FAIL**. 실제 생성한 합성 openpyxl/XlsxWriter XLSX 2종의 preflight/extract/원본 대조도 PASS. Python Schema unittest **5/5 PASS**.
- **검증 근거:** 변경한 전처리 모듈 Git blob `ce0f96ce618c6b868bcf255e1d8b2508f3eb6bb3`; 회귀 테스트 blob `d484cea4ef13ad28b650902c164251d1daaf6121`; 각 파일 로컬 `git hash-object`와 GitHub SHA가 정확히 일치함. 전체 CSV 포함 `npm run test:preprocessing`, Windows, CI, 사용자 파일 호환·릴리스는 **NOT_RUN**.

## 2026-10-27 — Generic CSV V1: 비매핑 원본 열 수식 위험 검토
- `source_cells`는 선택하지 않은 원본 CSV 열까지 **가공하지 않고** 보존한다. 선택되지 않은 원본 열에도 `=HYPERLINK(1)` 등의 수식 의심 문자열이 있으면, 해당 행은 `NEEDS_REVIEW`, `issues[].code=UNMAPPED_FORMULA_RISK`, `issues[].field=<원본 CSV 헤더>`로 표시한다. 매핑된 열은 기존 `FORMULA_RISK`와 `issues[].field=<출력 매핑 key>` 계약을 그대로 쓴다.
- `quality.formula_risk_cells`는 두 위험 유형의 셀 수를 합산한다. 원본 손실·자동 엑셀 이스케이프·자동 승인/실행은 하지 않는다. 소비자가 원문 `source_cells`를 Excel/CSV로 내보낸다면 **반드시 별도 셀 수식 위험 차단**이 필요하다.
- 변경 SHA: core `3b6cedae4869b7d8d5ae587f8d565812b6d9e193`, schema `ae5d2e8cbc40bc08ed586b7826c1bec5f5cead0d`, regression `3f99b78f416a36c08f299f6511a5f7f16c1215f3`, commit `ecf6cba8d22660180250cad3d5afb6b7014843d5`.
- V8 격리 실행 9/9 PASS (hash stub), 최신 전체 Native 63건·실파일/Windows·CI/출고 **NOT_RUN**.

## 2026-10-27 — CSV/XLSX 로컬 전처리 MVP 실행 경로

동일한 Private `preprocessing` 브랜치에서 CSV V0/V1 및 XLSX V0 모두 새 JSON 파일로 직접 출력한다.

```bash
node preprocessing/cli.mjs --input preprocessing/examples/synthetic-orders.csv --output v0.json --date 거래날짜 --item 품목 --amount 결제금액
node preprocessing/generic-cli.mjs --input input.csv --columns columns.json --output v1.json
node preprocessing/xlsx-cli.mjs --input source.xlsx --output cells.json
npm run test:preprocessing
```

XLSX 경로는 ZIP preflight → 보수적인 시트/셀 추출 → 원본 바이트 SHA 검증/재추출 parity → `SMAX_PREPROCESS_XLSX_CELLS_V0` Strict JSON 생성 순서이며 원본을 수정하지 않는다. 새 결과 경로를 요구하며 이미 파일이 있으면 중단한다. 시트 구조를 거부할 수 있는 **제한형 MVP**이고 서식·날짜 의미 추론, 모든 Excel 포맷 호환, 공식 배포 또는 사용자의 승인 없이 외부 전송하는 기능은 없다. 모든 결과의 `approval=NOT_GRANTED`; 검토는 사용자 책임이다.

**검증 상태:** XLSX CLI의 정상 파일·수식·해시, 오류 파일, 기존 출력 보호, 크기 제한·symlink 거부 합성 회귀 테스트 3개 등록. 이 항목들은 Native Node에서 실행 후 실제 통과 여부를 확정해야 한다. 전체 Native/Windows QA 및 판매/릴리스는 미검증. Private 코드의 타 저장소 전송·Public 공개는 별도 승인.

## 2026-10-27 — TXT/Markdown 문단 전처리 P2 (Native 5/5)

- `preprocessing/plain-text.mjs`: `preprocessPlainText(Uint8Array)`, `validatePlainTextPackage(pkg,originalBytes?)`, `serializePlainTextPackage(pkg,originalBytes?)`.
- `preprocessing/text-cli.mjs`: `node preprocessing/text-cli.mjs --input local.txt --output new-result.json`; 확장자 `.txt`·`.md`. **Markdown 문법 구조 분석이 아닌 원문 문단 분리**.
- 출력 `SMAX_PREPROCESS_TEXT_V0`: `source.raw_text`, SHA256, 1-based 첫 행, UTF-16 오프셋, 문단/수식형 검토, `approval=NOT_GRANTED`; 빈 줄 구분 문단이므로 원본 표시는 raw_text를 사용. 소스 JSON에도 실고객 원문 전체가 포함되므로 동일하게 보호.
- 최대 2MiB/10,000 segments, UTF-8 fatal decode; 새 JSON exclusive 생성, input 손상 금지. 외부 NPM/LLM/HTTP 사용 안함.
- 실제 원격 commit 대상 3파일과 `git hash-object` 일치하는 Linux Node 22 로컬 Native `node --test tests/plain-text.test.mjs` **5/5 PASS**. 전체 CSV/XLSX 통합 `npm run test:preprocessing`, Windows/CI/실고객 문서/Production 미검증.

## 2026-10-27 — Strict TXT/HTML JSON Schema + limited HTML importer

- `preprocessing/SMAX_PREPROCESS_TEXT_V0.schema.json`, `preprocessing/SMAX_PREPROCESS_HTML_V0.schema.json`: Draft 2020-12 strict structural wire contracts. Approval always `NOT_GRANTED`. JSON Schema does **not** verify cross-field provenance; use JS validators and original bytes for source SHA parity.
- `preprocessing/html.mjs`: `preprocessHtml(bytes)`, `validateHtmlPackage(pkg,originalBytes?)`, `serializeHtmlPackage(pkg,originalBytes?)`. Read-only UTF-8 HTML subset, visible paragraphs with line/UTF-16 offset, exact original HTML + SHA256, review flags. Rejects scripts, iframes, style/unknown tags, event handlers, malformed entities and unbalanced tags. **Not a general browser-grade HTML parser; no CSS semantics/DOM/HTML5 error recovery**. Only selected common markup; unsupported HTML is rejected.
- `preprocessing/html-cli.mjs`: `node preprocessing/html-cli.mjs --input local.html --output new.json`. Supports .html/.htm; input ≤2MiB, no symlink, new output exclusive write, local only.
- Tests: `tests/html.test.mjs` and `tests/document-schemas.test.mjs`, included in `npm run test:preprocessing`. The **newly added HTML + schema files only** were checked as exact Git blob SHA against local Node 22 files; `node --test tests/html.test.mjs tests/document-schemas.test.mjs` **9/9 PASS**. Independent Python `jsonschema` Draft 2020-12 compared valid and 3 tampering cases for each new schema. Latest **whole-repo** Native regression, Windows, CI, actual customer HTML and release are still NOT_RUN.
- Document source and outputs may contain customer text/HTML. Do not render raw HTML or export formula-like text to spreadsheets without separate encoding; no remote sharing, publish, billing or auto approval.

## 2026-10-27 — P2 DOCX basic text importer (Native smoke verified)
- 구현: `preprocessing/docx.mjs` = `preprocessDocx(Uint8Array)`, `validateDocxPackage(pkg,originalBytes?)`, `serializeDocxPackage(pkg,originalBytes?)`; `preprocessing/docx-cli.mjs`; Draft 2020-12 `preprocessing/SMAX_PREPROCESS_DOCX_V0.schema.json`.
- 실행: `node preprocessing/docx-cli.mjs --input source.docx --output new-result.json`. 외부 NPM/네트워크/LLM 비용 0원, 기존 소스 덮어쓰기 금지, 기존 결과 경로 `wx` 거부.
- 범위: DOCX ZIP ≤2 MiB/압축해제 총량 ≤8 MiB/최대 512 entry. ZIP CRC32/로컬-중앙 헤더·경로·중복·압축해제 한도 검사. `word/document.xml`의 기본 문단·표 안 문단·탭·줄바꿈/개행 및 정규 XML 엔터티만 추출. 원본 byte SHA256·part path·실제 w:p 문단 서수·검토 상태·`approval=NOT_GRANTED` 보존. 모든 실제 DOCX 구조의 안전한 완전 복원은 **미지원**.
- 거부/한계: 매크로·ActiveX·이미지/첨부/외부 관계, 메모·머리글·바닥글·각주, 변경추적·필드 코드·하이퍼링크·임베디드/미지원 구조는 실패 종료. Word 페이지 번호·셀 좌표·서식/표 구조의 완전한 복원, PDF·LLM은 포함하지 않는다. 빈 문단은 결과에 포함하지 않지만 문단 index 공백은 보존한다.
- 검증: 실제 로컬 Linux Node 22.16.0 `node --test tests/docx.test.mjs` **10/10 PASS** (1회 empty paragraph FAIL 후 수정하여 재실행), 이와 별도로 `python-docx`로 생성한 실제 합성 DOCX 파일→로컬 CLI→Strict JSON→SHA/문단/기본 표 추출 PASS. Python `jsonschema` Draft 2020-12 스키마 정상 승인/APPROVED 변조 거부 PASS. 4개 Git Blob이 로컬 Native 시험 원본 `git hash-object`와 전부 일치.
- 기존 CSV/XLSX/TXT/HTML을 합한 최신 `npm run test:preprocessing`, Windows, CI, 실제 고객 문서, Production/상용 출시 **NOT_RUN/미승인**. 다음은 전체 정본 Native 회귀와 PDF 최소 입력 범위 정의 및 설계 대비 gap 우선.

## P13/P14: package re-verification and native acceptance (2026-11-11)

After producing an owner-review bundle with the P12 `--package` command, owners can run:

```sh
node preprocessing/self-owner-delivery-cli.mjs --verify /absolute/previously-created-bundle
npm run test:preprocessing
```

The `--verify` command reads the existing exclusive `manifest.json`, `receipt.json`, and `report.html`, verifies SHA-256 and deterministic report integrity, and returns a review-only JSON status. It does **not** read the original customer CSV, grant approval, execute a workflow, repair files, or transmit data. This proves the saved package is internally consistent, not that its source was independently authenticated by a third party. Native real-file P8→P12 coverage is checked into `tests/self-owner-e2e.test.mjs`, but has **not yet been run or passed** on a full checkout. Product status stays 70% provisional, RELEASE HOLD. [Evidence](../docs/SMAX_OWNER_PREVIEW_REVERIFY_P13_P14_20261111.md).

## P17 — optional live Chromium P8 owner mapping acceptance (2026-11-11)
The customer-facing P8 header mapping HTML can be tested end-to-end through an **actual Chromium browser** (CSP, JS, dropdowns, download) and the **actual Node `validateOwnerDraft`** module, with strictly synthetic CSV, no external network or customer source rows:
```sh
node --test tests/self-owner-mapping.test.mjs
# Only if Python Playwright + Chromium are already installed:
SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/owner-form-e2e.py
```
P17 evidence: 6/6 isolated exact-source Native Node + 9/9 real Chromium-to-Node cross-validation. The test uses Playwright `page.set_content`; **not** a Windows/Edge or `file://` acceptance, which this sandbox browser profile blocks. Optional QA dependencies do not ship with product and are not installed automatically. The full `npm run test:preprocessing`, entire CSV→P9→P12→P16 run, Windows usage and actual SELF app remain NOT_RUN. Whole final product **72% provisional**, RELEASE HOLD. [P17 report](../docs/SMAX_P17_CHROMIUM_OWNER_FORM_ACCEPTANCE_20261111.md).

## P18 — CSV 선택부터 매핑 JSON 다운로드까지: 단일 오프라인 HTML (2026-11-11)
- [site/owner.html](../site/owner.html)은 외부 JavaScript·CDN 없이 실행하도록 구성된 한 파일짜리 사용자 시작 화면이다. 기존 SMAX Square [제품 화면](../site/index.html)에도 **검토용 CSV 열 매핑 시작** 링크를 추가했다. **아직 배포/판매하지 않음.**
- 사용자는 해당 HTML을 브라우저에서 열어 **UTF-8 CSV (최대 2MiB)**를 직접 선택하고 날짜·판매처·금액 열, 일/월별 집계 기간을 명시적으로 지정한 후 **smax-owner-mapping.json** 초안을 다운로드한다. 원본 행이나 파일명을 HTML/JSON에 삽입하지 않으며 CSV 데이터 전송·영업 자동화·승인·금액 집계는 하지 않는다.
- 브라우저에서 원본 파일 **물리 바이트 SHA-256**을 오프라인 pure JS로 계산한다. WebCrypto secure-context, 외부 네트워크, 파일 서버가 필요 없는 구조다. MIME/파일 용량, UTF8, 헤더 3~64개/모호한 NFKC/숨김·수식·중복 열을 차단하며 실제 **백엔드 PREP/SELF**는 이후 별도 실행 시 전체 CSV를 엄격 재검증한다. 초기 HTML은 CSV의 전체 행/금액 검증 도구가 아니다.
- 편의 기능: `npm run owner:portal -- --output /absolute/new-owner.html` — 신규 파일만 독점 생성; 기존 파일 덮어쓰기·상대 경로/심볼릭 링크 부모·기밀/경로 stdout 미출력. 사용자는 원래 있는 `site/owner.html`을 그대로 열 수도 있다. Node20+ / Python 패키지 추가 의존성 0.
- **검증:** 정확한 프로덕션 정적 HTML blob `b32e0a01c6e30bd8a73a6c468fdc0825a925bff4`; 동일 로컬 소스/test의 `node --test tests/self-owner-portal.test.mjs` **5 PASS/0 FAIL**, Chromium 144.0.7559.96 Playwright **14/14 PASS**: 원본 SHA 및 BOM 해시 검증, JSON 다운로드 후 실제 P8 Node `validateOwnerDraft` 수용, 중복·숨김·수식·invalid UTF8·>2MiB 거절, 불신 헤더 DOM 무해, 요청/JS 오류 0. 재현: `SMAX_CHROMIUM_PATH=/usr/bin/chromium python tests/browser/self-owner-portal-e2e.py` (Python Playwright+Chrome 설치가 사전 필요); Python은 개발 QA에만 사용.
- 테스트 프로필에서 `file://`와 `localhost` URL 탐색은 **ERR_BLOCKED_BY_ADMINISTRATOR**, Playwright `page.set_content`로 실제 Chromium UI/다운로드를 검증했으나 Windows10/11/Edge에서 파일을 더블클릭하는 **file:// 경로는 미검증**. `npm run test:preprocessing` 전체·P8→P16 실파일 CLI 체인·통합 SELF 프론트 고객 QA도 미검증. 상품 RELEASE HOLD. [P18 증빙](../docs/SMAX_P18_BROWSER_SELF_OWNER_PORTAL_20261111.md).
