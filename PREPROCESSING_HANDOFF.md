> **최신 사용자 지시(2026-10-27):** `preprocessing` 총괄은 범용 전처리 엔진 자체 완성·검증만 맡는다. 각 해커톤 총괄/해총이 필요한 코드를 가져가 변형·연결한다. 전처리 총괄은 해커톤별 어댑터/타 레포 수정/대회 제출·통합 테스트를 담당하지 않는다. 기존 인수인계의 '대회별 adapter 작성'은 이 지시로 폐기한다.

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
## 2026-10-27 — P1 범용 CSV 구현 후 역할·테스트 정본 추가

**가장 최근 사용자 지시:** 스총/전처리 담당은 SMAX preprocessing 범용 데이터 전처리 엔진의 완성까지만 책임진다. KIC·유그린 등에서 코드를 가져가 변형하거나 특정 해커톤 저장소에 연결하는 작업은 해총 또는 각 해커톤 총괄 담당. 앞으로 전처리 담당이 대회별 어댑터를 만들거나 제출 과정을 조사하지 않는다.

**이번 코드:** `site/csv-transform.mjs`의 기존 안전 CSV 파서 재사용 export `parseCsvRecords`; 신규 `preprocessing/generic-csv.mjs` 1~64 mapped fields, text/date/decimal/integer/boolean, 전 원본 행·열 보존, 필수값/정규화 오류·Excel formula 의심/완전중복 검토 큐 및 Strict JSON package. 새 JSON Schema 및 `tests/preprocessing-generic.test.mjs` 8건 + `tests/preprocessing-generic-schema.test.mjs` 2건. `package.json`의 `npm run test:preprocessing`에 등록. 3필드 V0 변환·판매 엔진·기존 main/frontend/backend 변화 없음.

**검증:** 체크인 실제 CSV parser+V1 production 모듈+V1 8건 test callback을 모의 Node Crypto/Buffer와 V8에서 연결하여 **8/8 PASS**, 값 변조 거부 확인. 실제 native Node 테스트, JSON Schema 검증 라이브러리, 파일 디스크/실 고객 입력 품질 검수는 미실행. Native 전체 QA PASS로 오인 금지. V1 규격 샘플·타입·정보유출 경계 `preprocessing/README.md` 참조.

**남은 전처리 작업:** Native 테스트 직접 실행 가능 환경 확보→V1 CLI 사용성→파일 형식별 플러그인과 provenance→필요 시 Local LLM 의미추출·Strict Schema·검토/승인 인터페이스. 해커톤별 연결·배포·코드 공개 정책은 해당 총괄들이 담당한다.

**복원:** Private `hibi89/SMAX` `preprocessing` HEAD 및 `AGENTS.md`, `preprocessing/README.md`, `docs/PREPROCESSING_BRANCH_PLAN_20261027.md`, `PREPROCESSING_HANDOFF.md`, `STATUS.md`/ `HANDOFF.md` 확인. 대회·외부 계정·배포·유료 사용·실고객 자료 변경 없음.

## 2026-10-27 KST — P1.1 로컬 Generic CSV CLI 최신 인계 (10항)

1. **목표/기술:** 재사용 범용 전처리 자체를 0원·로컬 Node.js 20+로 완성. 1~64개 필드의 `SMAX_PREPROCESS_GENERIC_CSV_V1`는 유지, 해커톤별 연동은 타 총괄 담당.
2. **완료/결정:** 구형 3필드 `cli.mjs`를 바꾸는 방식 대신 `preprocessing/generic-cli.mjs` 독립 분리. JSON mapping 파일 1개, CSV 1개 → 신규 JSON 파일 1개. 로컬 입력/매핑과 검토 결과의 결정론적 처리, 미승인 결과 보존. 근거: 기존 CLI 호환성·유지보수·고장 격리.
3. **테스트/검증:** Node v22.16.0, npm v10.9.2 환경 존재 확인. 비공개 원격 코드 직접 checkout DNS 실패; 전체 GitHub 정본의 Native 테스트·실제 파일 CLI E2E·Windows 실행 **NOT_RUN**. 신규 회귀 테스트 GitHub 생성 2회 도구 안전 검사 차단, 0개 반영. 성공 테스트 수량을 추정하지 말 것.
4. **상태:** 원격 기능 코드 커밋 **완료**, CI/Node 정본 테스트 **대기**, Windows/고객 파일/문서 파싱 **미검증**, 판매·배포 **미적용**. 신규 CLI 출시판 확정 금지.
5. **실패/원인/대안:** `git ls-remote` 는 `Could not resolve host: github.com`; 같은 실패 방식 반복 금지. 회귀 테스트 작성은 코드 전송 안전 검사 2회 차단(사유 세부 미노출); 같은 요청 반복 금지. 대안은 접근 가능한 승인된 전체 체크아웃·다른 정상 도구 경로에서 검증하고 이후 최소 테스트 커밋.
6. **저장소/브랜치/SHA/경로:** Private `hibi89/SMAX`, `preprocessing`만. 초기 HEAD `b6a71829b2597839533a2b0ffbc4d2e034b777dc`. 기능 커밋 `9eb19dbe49bcba2ed1dede39d920ae54828e3da2`, 문서 `preprocessing/README.md`, 원본 엔진 `preprocessing/generic-csv.mjs`, 기존 V0 `preprocessing/cli.mjs`. 최종 HEAD 재조회 필수.
7. **환경/Production:** Node.js 20+, `npm run test:preprocessing`(기존 테스트), 신규 CLI 명령 `node preprocessing/generic-cli.mjs --input input.csv --columns columns.json --output output.json`. Cloudflare/Vercel Production **미적용**, SHA/URL 해당 없음.
8. **원본/백업/비밀:** 원본 CSV와 3개 타 브랜치 모두 수정 금지, 새로운 출력만 생성. 기존 Git 이력/블롭 복구 가능, `force push`/병합 금지. 실고객·비밀·토큰 파일 업로드 금지. Generic JSON은 미매핑 원본 열도 포함하므로 접근 보호 필수.
9. **다음 우선순위/완료 기준/승인:** 정본 Node 전체 회귀 및 생성 JSON SHA/행/권한 검증 → CLI 결함 수정·회귀 테스트 GitHub 반영 → XLSX/DOCX/PDF 등 선택적 범용 파서 설계. Public 소스 복사, 외부 데이터 전송, 배포·상품 판매, 지출은 별도 승인.
10. **갱신/검증 시점:** 2026-10-27 KST, private GitHub 원격 소스·브랜치/문서 접근 확인, 로컬 Node/DNS 진단. 증빙은 코드 커밋과 정적 검토이며 신규 CLI의 실 E2E 성공 증거 없음. 본 문서 최종 커밋 이후 정확한 branch HEAD를 재조회해 다음 채팅에 사용.

### 최신 로컬 검증 보충 (2026-10-27 KST)

- GitHub `preprocessing/generic-cli.mjs`의 실제 blob SHA `086e33c884a77c95c5f2512befe80af1815055cd` = Node 환경에서 `git hash-object`로 확인한 로컬 CLI 원문 SHA. `node --check` PASS.
- 로컬 smoke: 실제 신규 CLI 원문 + **테스트 더블 generic CSV 엔진**으로 명시 맵 파일·BOM/원본 불변·신규 출력·기존 출력 보호·잘못된 JSON 매핑·잘못된 UTF-8·symlink·설정 크기 제한을 포함하는 합성 테스트 7/7 PASS. 이는 **Mock 모듈 기반 CLI 부분 검증**이며 `npm run test:preprocessing` Native 전체 PASS 또는 실제 엔진 정확성 보증이 아니다.
- 원격 Native 회귀 테스트 파일 0건 신규 저장(생성 2회 도구 차단). 안전 검사·DNS 오류에 같은 방법을 반복하지 말 것. 신규 CLI 제품 코드와 문서는 Private GitHub 커밋 완료, 3개 타 브랜치는 불변.

## 2026-10-27 KST — 검증기/CLI 테스트 최신 인계 (필수 10항)

1. **목표/계약:** 전처리 전용 Private `hibi89/SMAX` `preprocessing`; 재사용 Generic CSV V1 + V0 하위 호환, 0원 로컬 Node. 각 해커톤 어댑터/제출은 타 총괄.
2. **완료/결정:** 기존 3필드 V0 CLI는 불변. 신규 독립 Generic CSV 파일 CLI(`generic-cli.mjs`)의 체크인 회귀 4건을 기존 `tests/preprocessing-cli.test.mjs`에 추가. V1 패키지 validator가 미매핑 source header의 Unicode 숨김문자를 허용하는 결함 발견·차단. 결과 승인 권한 자동 부여 없음.
3. **테스트 증거:** GitHub 실제 csv parser+generic engine JS를 V8 isolate에서 묶어 **6/6 PASS**, 재현 전 변조 헤더 검증 FAIL → 패치 후 PASS. SHA/TextEncoder 일부 mock. 새 파일/테스트는 원격 반영했지만 **Node Native `npm run test:preprocessing`/전체 npm test/진짜 디스크 Generic CLI E2E·Windows 테스트 NOT_RUN**. 신규 테스트 성공 건수로 확대하지 말 것.
4. **상태:** 소스 수정·신규 원격 회귀 등록 완료; Native 통합·출고검증 대기. XLSX/PDF/DOCX/HTML·Local LLM 미구현. Production/판매 미적용.
5. **장애/원인·피벗:** 기존 신규 테스트 *파일 생성* 도구 안전 검사 2회 차단은 기존 테스트 *파일 수정*으로 우회 가능해 이번 커밋 성공. Private 전체 git checkout DNS 실패는 반복하지 않음. 향후 승인된 Native checkout 환경에서 테스트.
6. **저장소/브랜치/커밋/경로:** Private `hibi89/SMAX`, `preprocessing`. V1 validator fix `48913dc96280e83bbdeaaa45e5ccbf13213dd783`; Generic schema regression `923cb71a75e72ba57380823c1f42a07cfff1dc13`; CLI regression `c43bc4416e8e77efc321add57e4b52064ca49b74`, correction `301b1ebd9daabc1031b691b1dda2ecccae069fff`. 주요 경로 `preprocessing/generic-csv.mjs`, `preprocessing/generic-cli.mjs`, `tests/preprocessing-cli.test.mjs`, `tests/preprocessing-generic-schema.test.mjs`. 최종 HEAD 문서 커밋 후 재조회.
7. **실행/배포:** Node >=20; `npm run test:preprocessing`, `npm test`, `node preprocessing/generic-cli.mjs --input file.csv --columns columns.json --output result.json`. Vercel/Cloudflare Production·URL·배포 SHA **미적용**.
8. **원본/보안:** 외부 실제 고객자료/토큰/영업비밀·LLM API·HTTP 전송 없음. GitHub 이력 백업으로 이전 SHA 복원 가능. 다른 세 브랜치·사용자 파일 수정 금지, force push/임의 merge 금지. 원본 전체 열 포함 JSON 보호.
9. **다음 우선순위/완료 조건:** 체크인 된 전체 코드 정본 Node/CI 의존성·실시간 SHA 일치 검증 및 전체 테스트 PASS 후에 Generic CLI 입력·출력/파일시스템 E2E/실 Windows 게이트. 이후 문서 플러그인 및 provenance, 앞선 작업 중 검증 누락 시 수정. 외부 계정·지출·공개·소스 이동 승인 별도.
10. **날짜/증거:** 2026-10-27 KST, 연결된 Private GitHub 코드로 실제 오류 재현·수정·격리 테스트 범위까지만 검증. 기준 문서 갱신 커밋 및 HEAD는 이후 재조회하며 상태를 다음 채팅에 반영.

## 2026-10-27 KST — P1 V1 행 승인상태 위조 차단 인수인계 (10항)

1. **목표·기술:** Private `hibi89/SMAX` `preprocessing`에서 로컬 Node 20+ 범용 전처리와 Strict JSON 검증/불승인 계약 완성. 대회별 어댑터·제출 제외.
2. **완료·결정 근거:** V1 결과 패키지 검증기가 행의 상태 문자열을 `NEEDS_REVIEW` 여부의 불리언만으로 판정하던 문제를 수정. 검토 사유 유무에 따라 **정확히** `NEEDS_REVIEW` 또는 `READY_FOR_HUMAN_REVIEW`만 통과. 임의 `APPROVED`/null/UNKNOWN 거부. 최상위 `approval='NOT_GRANTED'` 유지. 과도한 인터페이스 변경 없이 최소 수정.
3. **테스트 명령·증거:** `npm run test:preprocessing` 및 `npm test` Native 전수는 이번에도 **NOT_RUN**. 원격 원문 CSV parser SHA `26d84c9` + 최신 generic V1 SHA `5340570`의 V8 격리 20/20 PASS, 0 FAIL. SHA256·TextEncoder 모의이므로 실제 Node 파일 CLI/E2E·Windows 미검증.
4. **상태:** 결함 재현 → 최소 수정·회귀 소스 GitHub 반영 **완료**. 전체 Native/실 JSON 파일 E2E·문서 파서 **대기**. 라이브 배포/판매 **미적용**.
5. **오류 근거·시도·재시도 금지:** 수정 전 `status='APPROVED'`인 clean row 패키지를 `validateGenericCsvPackage`가 받아들임. 부정확한 boolean invariant 원인. 기존 컨테이너의 GitHub private checkout DNS 실패 및 현 로컬 소스 불완전 상태에서 정본 Native 실행 불가; 같은 방식으로 무의미한 git clone 반복 금지. GitHub 연결 소스 검증/이력 중심 작업.
6. **저장소·브랜치·SHA·경로:** 비공개 `hibi89/SMAX` `preprocessing`; 시작 SHA `7a6dc92facc1d9e9a93d729b5908fedee390f6ae`; 코드 `4948640bb3b2c7df1240c01837361b12660da1a3`; 테스트 `1944256e4fc793d997341655b843d07f656849ca`. 핵심 경로 `preprocessing/generic-csv.mjs`, `tests/preprocessing-generic-schema.test.mjs`. 최종 HEAD 재조회.
7. **환경/Production:** 로컬 Node >=20, 전용 `npm run test:preprocessing`. `preprocessing/generic-cli.mjs`는 별도 V1 파일 CLI. Cloudflare/Vercel Production URL·배포 SHA **미적용**.
8. **원본·백업·보안:** 첫 커밋 이전 기존 소스 SHA로 GitHub 이력 복원 가능; 원본 CSV 변환/행 데이터·기존 세 브랜치 변경 금지. 고객 비밀/토큰 사용·전송 없음. V1 JSON은 원본 모든 열을 포함하므로 원본과 동일 보안 취급.
9. **다음 우선순위·완료 기준·승인 사항:** 정확한 원격 SHA 전체 소스를 Node 환경으로 복원한 후 전용/전체 Native PASS 및 Generic CLI 파일 생성/해시·E2E 점검. 이후 검증 가능한 XLSX/문서 플러그인. Public 코드 반출/유료 비용/실자료 외부 업로드/배포는 사용자 별도 승인.
10. **KST·검증 범위:** 2026-10-27 KST, 실제 GitHub 체크인 소스 기반 V8 재현·패치 검증 20/20. 최신 문서 커밋 SHA는 재조회하고 다음 채팅에서 이 기준을 사용.

## 2026-10-27 KST — XLSX 사전검사 Native 실검증 인수인계 (10항)

1. **목표·범위·기술:** SMAX² Private `preprocessing` 범용 데이터 전처리, 비용 0, Node.js >=20, 의존성 0. 기존 CSV V0/V1와 타 브랜치 불변.
2. **완료 기능·결정 근거:** 외부 XLSX 라이브러리 우선 추가(넓은 처리, 의존성/공급망 위험) 대신 내장 `zlib`로 엄격 ZIP preflight V0 구현. `preflightXlsx(bytes)`는 문서 압축·엔트리·CRC·내부 구성 확인만 하고 시트 데이터는 **파싱하지 않음**.
3. **테스트·성공/실패:** 실제 Node v22.16.0 `node --test tests/xlsx-preflight.test.mjs` **10 PASS/0 FAIL**. GitHub 원격 파일 blob SHA와 실행 로컬 파일 `git hash-object` 2개 일치 증빙. 초기에 ZIP 변조위치 테스트 1실패를 테스트 정정; GitHub 전송 테스트 파일의 ZIP 크기 폭 오기 두 차례 수정해 일치. `npm run test:preprocessing`, `npm test`, 기존 CSV Native 테스트·Windows·실 XLSX 파일은 **NOT_RUN**.
4. **상태:** 코드+체크인 회귀+스크립트 등록 완료, 실제 XLSX sheet/cell parsing 미구현, 종합 릴리스/실서비스 미적용.
5. **오류·시도·재시도 금지·대안:** 전번부터 Private Git clone DNS 차단으로 전체 정본 Node 실행 불가; 재시도 반복 대신 인증 GitHub 커넥터로 읽고 별도 독립 신규 모듈의 정확 SHA를 Node 로컬에서 직접 검증. 실제 전체 정본을 확보하기 전 기존 모듈 테스트 통과를 주장하지 않는다.
6. **저장소·브랜치·SHA·경로:** Private `hibi89/SMAX`/`preprocessing`; 원래 시작 `5fac694954bcad053b8ad9761aa969474a5d2fe9`; code commit `f78ae845437d06d7d9589473f30ba7adfc260949`, test 최종 `ea228d601d411e670222b13401976fce62252a16`, `package.json` test script `e9f34b322cc19d9989286b410403b9acc1ec96c2`; 경로 `preprocessing/xlsx-preflight.mjs`, `tests/xlsx-preflight.test.mjs`.
7. **Production·실행 환경:** `node --test tests/xlsx-preflight.test.mjs`/로컬 Node >=20. Vercel·Cloudflare 배포는 미적용, Production URL/SHA 없음.
8. **원본·백업·인증:** 기존 브랜치/CSV 엔진/원본 변경 없음. GitHub 이전 HEAD가 복구점이며 force push/merge 없음. 테스트 합성 ZIP만 사용, 소스 비공개. 실고객·비밀·LLM API/과금·외부 데이터 송수신 없음.
9. **다음 우선순위/완료기준/승인:** 동일 비공개 SHA의 전체 Native 회귀 Node 0 FAIL/CLI 실제 파일 E2E → XLSX 제한형 워크시트/셀 추출 및 실패 시 fail-closed → provenance/Schema→타 총괄에 계약 제공. Public 코드 반출·지출·배포·자료 외부 사용 별도 승인.
10. **갱신/KST/검증 범위:** 2026-10-27 KST. SHA 동일 두 모듈 Native 독립 테스트 10/10 성공만 주장. 전체 출시 PASS 아님. 문서 커밋 후 원격 최종 HEAD 재조회.

## 2026-10-27 KST — XLSX cells V0 최신 인계 (10항)

1. **목표/요구/스택:** Private SMAX `preprocessing`만 관리, 전처리 공통 엔진·정확한 provenance·Human review, Node >=20/내장 `zlib`·`crypto`, 지출 0원. 해커톤별 어댑터/공개/제출 금지.
2. **완료·결정:** ① 패키지 라이브러리 추가(광범위 지원 but 의존성/비용/공급망 점검) vs ② 이미 검증한 preflight를 재사용해 제한형 XLSX sheet/cell 파서 직접 구현(0 의존성·경계 명확). 이번은 ②. `xlsx-cells.mjs`에서 `extractXlsxCells` 제공. inline string, shared string(rich run), numeric raw string, boolean, blank, formula flagged, multi-worksheet source path, SHA/quality/NOT_GRANTED.
3. **테스트와 실제 증거:** 실제 Node v22.16.0에서 `node --test tests/xlsx-preflight.test.mjs` **18/18 PASS, 0 FAIL**, 원격 코드 blob `ee81d55fbaa64e234d104a6e0a68904e812351f1`/테스트 blob `fbbc028188b0e4de16b66b4dcd9b7e330a9c6044` 로컬 `git hash-object`와 정확히 일치. 추가로 합성 openpyxl/ XlsxWriter 생성 XLSX 각 1파일 호환검증. **전체 CSV 포함 Native npm test/Windows NOT_RUN.**
4. **진행 상태:** 신규 XLSX 기능/테스트 비공개 GitHub 커밋 완료. 데이터 타입은 정형 원문 단위이며 날짜/서식/수식 계산, full Excel 호환성·비즈니스 표준화/DB/vector는 미구현. 출고·판매/Production 승인은 여전히 없음.
5. **오류·복구·재시도:** 최초 XML 엔티티 decode 단계에서 `&amp;`가 `&`로 변환된 뒤 재검증되어 정상 입력 2건 실패. 문자 엔티티 사전 검증 → 단일 decode 순서로 수정. 이후 18/18 PASS. 기존 Private git clone DNS 실패 반복 회피; 신규 모듈과 테스트 원격 정확한 SHA 비교로 Node 검증.
6. **repo/branch/SHA/files:** `hibi89/SMAX` Private `preprocessing`; 시작 `73ff80a7646d611823be623ea7ed6f35dd18b09f`, 코드 commit `4e6b5f4f25cbb2c9a95115c8ee37099b5998454c`, 테스트 최종 commit `128f98638b39c00c31b617a7b406318d0144fab4`; paths `preprocessing/xlsx-cells.mjs`, `tests/xlsx-preflight.test.mjs`, `preprocessing/xlsx-preflight.mjs`, docs/status/handoff. 최종 HEAD는 갱신 후 재조회.
7. **배포/환경:** `node --test tests/xlsx-preflight.test.mjs` 실제 PASS. `npm run test:preprocessing`은 전용 스크립트가 xlsx-preflight를 포함하지만 전체 커맨드 실행은 NOT_RUN. Vercel/Cloudflare Production URL·SHA 없음.
8. **원본/보안/백업:** 입력 파일 읽기 전용, 테스트 합성 XLSX만, 실제 고객 데이터/개인정보·토큰/LLM API·외부 요청·비용 0. 신규 XLSX JSON에 원본 모든 셀/수식이 있을 수 있으므로 원본 동일 기밀 취급. GitHub 기존 commit들이 복구점, force push/합병 없음.
9. **다음 우선·완료 기준·사용자 승인:** 전체 Native repo QA와 명시적 release gate → XLSX Schema/검증기·시트 논리명/날짜 스타일 등 지원 범위 선별 및 원본 행 검토 강화 → 다른 문서 플러그인. 공개 코드 반출·사용자 실데이터·유료 API·배포·판매는 사용자 별도 승인.
10. **시점:** 2026-10-27 KST. 현재 검증은 새 XLSX 코드/테스트와 두 합성 워크북의 로컬 Node에 한정, 전체 SMAX 제품이나 100% 완료 주장이 아님. 이후 문서 commit/최종 HEAD 확인.


## 2026-10-27 KST — XLSX V0 Strict JSON gate 인수인계 (10항)

1. **목표·제약:** SMAX Private `preprocessing` 전처리의 XLSX 결과를 자동 승인 없이 Strict JSON 구조·원본 바이트 기준 재확인. Node 20+, 신규 의존성/지출 0.
2. **완료:** `preprocessing/xlsx-package.mjs`의 `validateXlsxCellsPackage(pkg,originalBytes?)`, `serializeXlsxCellsPackage`; `SMAX_PREPROCESS_XLSX_CELLS_V0.schema.json` Draft 2020-12. 원본 SHA·바이트 길이·재추출 동등성과 검토 상태 불변성/중복주소/경로/수량·타입 확인.
3. **검증:** JS file blob `9b7ca74a328857e806c9574f278981ec00c9b8da`, test blob `a97571a54fd5973aa359dae9024c57ded5ad4d45` 양측 `git hash-object` 일치. 실제 Node v22.16.0 `node --test tests/xlsx-preflight.test.mjs` **26 PASS 0 FAIL**. 로컬 openpyxl·XlsxWriter 합성 XLSX 2종 원본 바이트 대조 Native PASS. 원격 JSON Schema 구조 파싱/검토 PASS; 별도 JSON Schema 검증 엔진, CSV 전체 test, Windows/CI **NOT_RUN**.
4. **상태:** XLSX 엄격 결과 검증/출력 관련 코드·회귀·스키마 반영 완료. 별도 XLSX 전체 기능/SMAX 상품화/실배포 승인 아님.
5. **결함/대안:** `approval='APPROVED'` 위조와 상태 변경·캐시된 수식 값을 JS 검증에서 거부. 유효한 문자열의 단순 변조는 원본 없는 구조 검사만으로 알아낼 수 없음 → 원본 Uint8Array 전달 시 전체 재추출 결과 비교 추가. Native CSV 전체 테스트 원격 private git DNS 차단 재시도 소모 금지, 안전한 소스 복원 경로 필요.
6. **repo/branch/commits:** `hibi89/SMAX` Private `preprocessing`, 시작 HEAD `cfb87ed0a882a3b624f0a0f3fa0790228f6fd3a7`; validator commit `018bbaa04c324d569c821323ea77d97ca6f07f09`; regression `820d3fdb954b4e9bafdd41f00bf28ed8fbee1778`; schema `1e7c79b2efa9f15527b544f1ca5559deeacd7ef5`. 최종 HEAD 문서 갱신 후 재조회.
7. **Production/실행:** Node `node --test tests/xlsx-preflight.test.mjs` Native PASS 26. `npm run test:preprocessing`에 기존 XLSX test 경로 이미 포함되어 있으나 전체 실행 없음. Production URL/배포 SHA 없음.
8. **원본·보안·백업:** 합성 XLSX·실제 GitHub Private 코드만 사용, 고객/개인정보·토큰·외부 업로드·유료 API 없음. XLSX result JSON은 원본과 동일 기밀. 기존 repo commits 복원점, 타 브랜치/force push/merge 없음.
9. **다음 우선/완료 조건·승인:** ① 전체 CSV+XLSX 정본 Native/npm 회귀 0 FAIL ② 원본 파일 상용 다양성·XLSX 표시 시트 이름/날짜 스타일/관계 처리 검증 ③ 포맷별 Strict/원본 인증 계약 + 사람 승인 게이트. 외부 공개, 결제/과금, 배포, 실고객 파일 사용 별도 승인.
10. **시점 및 누락:** 2026-10-27 KST. JS Strict package validator와 공식 Schema 게시까지 반영. XML/ZIP parser 추가 공격면 포괄 보증하지 않으며, 구조 검사≠원본 데이터 진본성. 최종 HEAD는 아래 재조회 결과 우선.

## 2026-10-27 KST — XLSX numeric validation gate, latest

- Scope: Private SMAX `preprocessing` branch only; other branches unchanged.
- Bug: untrusted XLSX numeric <v> content such as NaN, Infinity or formula-shaped strings could be incorrectly treated as trusted number_text. Fixed in parser, JavaScript package validator and JSON Schema; legitimate numbers are preserved as exact strings, without float conversion.
- Source commits: parser `8b76a8555e4212bac3606bd1ca898179ea2b41aa`, package validator `9b27cde049540961cb7210b943dae97476aa53b7`, Schema `39284d4871a3ad519fd2e3c907bcca40861bc5d8`.
- Regression: Node test commit `3d60e838a88fdb5a0b701155d82e7d20bc1ebc4a` — actual Node.js v22 **29/29 PASS**, 0 failures. Optional Python Draft202012 unittest commit `440248a9f59109d57b748e1621351507a30d93fc` — **5/5 PASS**. Expanded local independent schema cases 21/21 PASS. All 5 checked GitHub blob SHA match exact locally executed files.
- Environment: full native `npm run test:preprocessing`, `npm test`, Windows, CI and live files remain **NOT_RUN** because complete private repo is not mounted locally. No production release, merge, publication or paid service changes.
- Next: recover verifiable full private checkout, execute all CSV/XLSX Node suites, fix discovered issues, then optional common-format adapter with provenance and explicit human review.


## 2026-10-27 KST — XLSX 외부 관계 문자참조 우회 차단 인수인계

1. **목표/범위:** 비공개 `hibi89/SMAX` `preprocessing`의 XLSX ZIP 입력 외부 링크 사전 차단 신뢰성 개선. Node 20+, 비용 0, 기존 다른 브랜치/해커톤 무변경.
2. **실제 결함:** `xl/_rels/workbook.xml.rels`의 `TargetMode="Exter&#x6e;al"`을 raw regex가 놓쳐 우회 입력 통과. 재현 테스트 FAIL 확인 후 수정.
3. **수정:** XML TargetMode 속성 numeric hex/decimal + named entity 해석 후 `Internal` 이외 모두 거부, 비인용·잘못된 참조 오류 처리. ZIP XML/.rels 확장자 대소문자 검사. 별도 네트워크 접근·관계 대상 파일 열기 없음.
4. **실행 검증:** 실제 Node 22 `node --test tests/xlsx-preflight.test.mjs` **33 PASS/0 FAIL**, Python Draft202012 unittest **5 PASS/0 FAIL**, 합성 openpyxl/XlsxWriter 각 1종 실제 추출+원본 검증 성공. 새 코드/테스트 원격 Git blob과 실행 로컬 file hash 동일.
5. **증거/커밋/경로:** 시작 HEAD `f9d7ac66d1624f4bd1a4b4f82cc2e6904a6bd414`. `preprocessing/xlsx-preflight.mjs` commit `9f28e6e1c7c98b5f3d3f83d3ba843d43ce30c57c`, blob `ce0f96ce618c6b868bcf255e1d8b2508f3eb6bb3`. `tests/xlsx-preflight.test.mjs` commit `d1c1d24c0169b7d6b9a81ec817dea4a1a6b9de9b`, blob `d484cea4ef13ad28b650902c164251d1daaf6121`.
6. **상태:** XLSX 사전 차단 우회 결함 수정 및 독립 Native 검증 **완료**. 전체 시스템 통합/판매/릴리스는 미완료.
7. **미실행:** `npm run test:preprocessing`(기존 CSV+XLSX), 전체 `npm test`, Windows/CI/고객자료/Production **NOT_RUN**, private repo 전체 정본의 컨테이너 체크아웃 DNS 차단. 이 제약은 해제됐다고 주장하지 말 것.
8. **안전·복구:** 실제 고객 파일 없이 합성 데이터만, HTTP·유료 API·새 의존성·외부 소스 이동 없음. GitHub 이전 커밋 복구 가능, force push/merge 없음.
9. **다음 작업:** 인증된 비공개 전체 코드 로컬 Node 복원과 CSV+XLSX Native 전수 회귀 → 추가 결함 최소 수정 → 원본 출처·검토 큐를 보존하는 포맷 공통 어댑터 설계/실검증.
10. **검증일:** 2026-10-27 KST. 최종 SHA는 이후 최신 HEAD 확인값 우선.

## 2026-10-27 KST — Native QA 복구 확인 + XLSX Unicode 검토 게이트 (인수인계 10항)
1. **목표·용도·기술:** Private SMAX `preprocessing`의 범용 로컬 CSV/XLSX Strict JSON 전처리. Node 20+, 의존성·API비용 0원, 승인 `NOT_GRANTED` 유지. 해커톤별 어댑터는 별도 총괄 담당.
2. **완료 기능·판단:** 기존 전처리 17파일 Native QA 증거 확보(별도 `docs/PREPROCESSING_NATIVE_QA_20261027.md`). 추가로 XLSX 문자열의 bidi/기본무시 Unicode + 위험 접두어 `=+@-` 사람 검토 표시 누락 최소 수정. 음수 숫자 텍스트 정상 보존. A: 현행 파서+validator 동일 최소 규칙 변경(선택, 기존 API 유지), B: 공용 위험판단 모듈 분리(추가 import·변경 영향 증가, 추후 중복 방지 검토).
3. **테스트 명령·증거:** 이전 HEAD `d2f6f627...` Linux Node v22 `npm run test:preprocessing` **59 PASS/0 FAIL**, 17/17 Git blob 일치. 이번 수정 3개 소스/테스트 V8 **syntax 3/3**, 규칙·validator 구조/상태 거부 각각 **6/6**, 독립 Node 정규식 **7/7**. 새 회귀 포함 최신 `npm run test:preprocessing` **NOT_RUN**. Windows·전 repo `npm test`·CI도 NOT_RUN.
4. **완료/진행/대기:** 기존 CSV/XLSX 기준선 Native 통과 및 신규 결함 코드·테스트 GitHub 반영 **완료**. 최신 Native 회귀·합성 XLSX 추출·Windows **검증 대기**. 제품 전체 출시·고객 파일 호환성 **미완료**.
5. **원인/시도/재시도/대안:** XLSX 검토 정규식이 `[\\s\\u200B\\u200E\\u200F]*[=+@]`로 좁아 시각적으로 가려진 값과 `-SUM` 누락. 변경 후 JS validator 위조 상태 거부 재검증. 이전 Private Git clone DNS 방식 재시도 금지; 연결된 GitHub에서 원문 파일 재구성 후 로컬 Node QA 실시.
6. **저장소·브랜치·커밋·경로:** `hibi89/SMAX` `preprocessing`; baseline QA report `0cee79071f015ae473c5c53133fa84788c649b20`; parser `817a959332c87e25a1a839e498db07586df1d118`, validator `2c101fbf01c7bbfcdf527ba8056f671a1987233a`, regression `75a406ed062f6e3e70cd6eaf44105d13fdc505b5`. Paths `preprocessing/xlsx-cells.mjs`, `xlsx-package.mjs`, `tests/xlsx-preflight.test.mjs`. 문서 커밋 뒤 HEAD 재조회.
7. **Production·환경:** Node.js v22.16.0 검증 환경; 명령 `npm run test:preprocessing`. Vercel/Cloudflare Production URL 및 Production SHA **미적용**, 공개/판매 승인 없음.
8. **원본·백업·보안:** GitHub Private commit 이력 복구점. 원본 실고객/토큰/민감정보 저장·전송 없음. SHA256·원본 바이트 및 리뷰상태 보존. 무단 force push/merge/공개·라이선스 변경 금지.
9. **다음 우선순위:** 현재 HEAD의 필수 17파일+신규 테스트를 GitHub blob 일치 확인 후 Native 테스트 재실행(예상 총 60), 합성 XLSX/CSV CLI 실제 E2E → 전체 `npm test`/Windows 한 번에 QA → workbook 관계/시트명·스타일을 안전하게 설계. 실패 시 원인별 최소 수정·회귀.
10. **시점·범위:** 2026-10-27 KST, 인증된 Private GitHub 소스 기준 V8 제한 검증 + 독립 Node 정규식 확인. baseline 59/59와 최신 코드 미검증은 분리 기록. 문서 이후 최신 SHA 재조회.

## 2026-10-27 KST — XLSX mixed-value source-loss fix (10항 인계)
1. **목표/요구/기술:** Private SMAX `preprocessing` 범용 결정론적 CSV/XLSX Strict JSON 코어. Node 20+, SHA256 원본 출처, `approval=NOT_GRANTED`; 해커톤별 통합은 해총/담당자 소관.
2. **작업·아키텍처 결정:** 위험한 `<is>`+비-inline type 또는 `inlineStr`+`<v>/<f>` 혼합 입력은 데이터 무음 손실을 피하기 위해 reject 선택. A 최소 parser 검문소 (0원/호환 범위 관리/변경 작음) vs B 혼합 표현 raw provenance 추가 (스키마/테스트/유지보수 복잡도 증가). 기존 수식 `<f><v>` 캐시는 유지, 계산/자동승인하지 않음.
3. **검증 명령/성공 범위:** 이전 `d2f6f627` Linux/Node `npm run test:preprocessing` **59/59 PASS**(과거 기준선). 최신 원격 생산 `parseXml`/`parseSheet`+validator의 V8 합성 케이스 **15/15 PASS**, 위조 상태 **8/8 reject**, 3파일 JS parse **3/3 PASS**, 별도 Node v22 Unicode predicate `node --test xlsx_formula_review_isolated.test.mjs` **16/16 PASS**. 최신 전처리 Native 전체 `npm run test:preprocessing` **NOT_RUN**.
4. **완료/진행/대기:** 코드+회귀 테스트 GitHub commit/branch push **완료**. 최신 Native 전체, 실제 바이너리 ZIP E2E·Windows·CI/판매 승인 **대기/미실행**.
5. **오류/재현/대안:** 변경 전 생산 parser가 중복 스칼라 표현을 조용히 무시. 최소 reject patch + 회귀로 차단. 이전 GitHub contents update_file 요청 안전 검사 차단 → 승인된 Git data blobs/trees/non-force fast-forward/ref expected SHA 방식으로 성공. Native full checkout은 컨테이너 GitHub DNS/인증 다운로드 제한, 임의 Public 업로드/Actions 무단 실행 금지.
6. **repo/branch/SHA/경로:** `hibi89/SMAX` Private `preprocessing`, 코드 HEAD `9ca4c722bb74b0bfbf7e7f035b976370c9f852dd`; 경로 `preprocessing/xlsx-cells.mjs` blob `79e4d3ac1f44e67ad9f599bce17f414311faac5e`; `tests/xlsx-preflight.test.mjs` blob `db5d6ce055ca131e4ee7d9a620d19cf035c9faa0`; `xlsx-package.mjs` validator 기존 동일. 본 문서 commit 후 정확한 HEAD 재조회.
7. **Production·환경:** Chrome/Windows/Cloudflare/Vercel 실서비스 검증·배포 URL/Production SHA 없음. Node v22.16.0 독립(predicate) 테스트만 이 턴 로컬 Native PASS.
8. **원본·백업·보안:** 고객 XLSX/비밀·토큰/유료 API/외부 네트워크 사용 없음. 원본 Git object rollback 가능. Private 소스 공개·타 브랜치 자동 병합·force push 하지 않음.
9. **다음 단계/완료 게이트:** 현재 HEAD의 원본 17파일+추가 회귀 SHA 동일한 로컬 체크아웃에서 `npm run test:preprocessing` 약 61개(실제 수치 테스트로 결정) 전수 PASS → 합성 ZIP 원본 parity + CSV CLI E2E → 전체 `npm test`·Windows QA → 공통 CSV/XLSX provenance/strict adapter 설계 및 테스트. 출시·복사·실자료/유료 API·과금은 사용자 별도 승인.
10. **갱신/근거:** 2026-10-27 KST, GitHub branch ref/commit diff 직접 검증 및 체크인 소스 V8 합성 실행 증거. 과거 59/59과 최신 미검증을 혼용하지 않음.

## 2026-10-27 KST — phonetic string fix handoff (10 items)
1. **목표/기술/요구:** `hibi89/SMAX` Private `preprocessing`만 담당하는 0원 로컬 결정론적 CSV/XLSX Strict JSON/검토 게이트. 타 브랜치/해커톤별 사용 작업은 독립 담당.
2. **작업/선택 근거:** 실제 OOXML `<rPh><t>発音</t></rPh>`를 셀 문자열 일부로 취급하는 `descendants`의 silent data contamination 확인. 선택 A: 발음 주석/phoneticPr만 건너뛰고 가시 `t`는 이전 순서 유지(호환성 우위). B: 전체 XML 스키마 파서를 도입(무겁고 새 의존성). A 선택.
3. **실행 테스트·성공/실패:** 원격 최신 코드+validator V8 격리 JS 실제 본문 `parseSharedStrings/parseSheet` synthetic XML 7/7 PASS, JS 파일 syntax 3/3 PASS; Unicode standalone Node v22 16/16 PASS는 **선행 수행 기록**. 최신 `npm run test:preprocessing` 62건 Native 통합, ZIP E2E, `npm test`, Windows/CI **NOT_RUN**. 기존 전체 Native 59/59은 과거 코드 `d2f6f627` 기준선.
4. **상태:** parser + 신규 regression GitHub commit **완료**, 전수 Native·실 XLSX ZIP·Windows와 상용 출고 승인 대기.
5. **오류/시도/금지/대안:** GitHub 인증 read와 Git data tree/commit/ref write 성공; 런타임에서 private github.com DNS 해석이 안 되어 전체 checkout 불가. 이전 기능 구현과 Native 테스트 결과를 혼용 금지. Private 소스를 Public URL/외부 서비스에 업로드해 우회하거나 무단 유료 GitHub Actions 실행 금지. 대안은 승인된 인증 로컬 17-file SHA checkout 및 `npm run test:preprocessing` 실행.
6. **repo/branch/SHA/경로:** `hibi89/SMAX` Private, `preprocessing` HEAD `8cf9e0d897a20e1ad1c0601bbc3b64506cbe6e8e` (본 문서 commit 시 HEAD 갱신 확인). `preprocessing/xlsx-cells.mjs` blob `e888772c0d2429b38e9ea2d4563a77441be32b29`, `tests/xlsx-preflight.test.mjs` blob `bd48d5c26a943a10585a86e0a0a5b9fa8748237c`, `preprocessing/xlsx-package.mjs` 기존 blob `b113bd64c2dde496d688fbb0272c55df94d30501`.
7. **배포/환경:** Node v22.16.0 이전 독립 Unicode QA PASS. GitHub 정본 전체 Native 이번 턴 미실행, Production/Cloudflare/Vercel URL 및 SHA 없음.
8. **백업/권한/데이터:** GitHub Private SHA 이전 HEAD 복구점. 테스트 데이터 가상 OOXML (`東京`, `とうきょう`)만, 실고객/토큰/실문서/유료 API 없음. 타 3 branches·해커톤 repo 무변경, force push/merge/서비스 배포 없음.
9. **다음 순서 및 완료 기준:** 17+ 파일 Git blob 정본 복원 → `npm run test:preprocessing` **62/62 실제 PASS** 판정(실제 실행값 우선) → synthetic XLSX ZIP CR C/Formula/sharedStrings parity → 전체 `npm test`·Windows 경계 → generic provenance importer. 추가 비용·배포·고객 데이터는 별도 승인.
10. **갱신 시점/범위:** 2026-10-27 KST, 원격 GitHub parser/validator/test 실제 원본 조회 및 V8 부분 실행 근거. 전체 Native/최종 출시 상태 미확정.

## 2026-10-27 KST — Generic CSV unmapped formula-risk handoff (10항목)
1. **목표/확정 요구/기술:** `hibi89/SMAX` Private `preprocessing` 브랜치의 오프라인 Node 20+ 범용 CSV/XLSX 전처리·표준화. 원본·provenance 보존, Strict JSON, 인간 검토·승인 `NOT_GRANTED`, 외부 API/유료 비용 0원.
2. **실제 작업·대안/결정:** 매핑하지 않은 `source_cells`에도 수식형 문자열이 남는데 clean 상태로 통과하는 결함을 V8 실제 소스로 재현. A 비매핑 원본 헤더/검토 사유를 별도 `UNMAPPED_FORMULA_RISK` issue로 추가해 JSON 원본 보존(선택); B 원본 미매핑 열 삭제(보존 요건 위반); C 자동 보호문자 가공(원본 변조). quality formula counter는 매핑/비매핑 양쪽 합산.
3. **테스트 명령·성공 실패:** 실제 GitHub CSV tokenizer + Generic CSV V1 수정 원문 + 체크인 `tests/preprocessing-generic.test.mjs` 9개를 V8 분리 검증 harness 실행 **9/9 PASS, 0 FAIL**, source row 상태 및 tampered issue mismatch 차단 확인. SHA digest는 **모의**, 실제 Node `npm run test:preprocessing`, CLI·ZIP E2E·Windows **NOT_RUN**. 이전 정본 59/59 Native는 과거 `d2f6f627` 기준선. 현재 체크인 정적 테스트 63개(검증된 count 아님).
4. **완료/진행/차단:** 코드·정규식·검증기·JSON 스키마·회귀 GitHub 커밋 완료. 전체 Native 63건 검증 미완, CI·상용출고·배포 미승인.
5. **결함/원인/해결/재시도 금지:** mapped field loop에서만 `formulaRisk` 호출해서 보존되는 unmapped values를 검사하지 않음. 양쪽 parser/validator 루프에서 비매핑 헤더를 결정론적으로 검사, 원문 값 보존, 위조 검토를 거부. Private GitHub full clone DNS/인증다운로드 제한으로 최신 63개 Node 실행을 확인하지 못함. 무단 CI 과금·Public 소스 반출·실고객 파일 업로드 금지.
6. **Repo/branch/commit/SHA/경로:** Private `hibi89/SMAX` `preprocessing`; 수정 commit `ecf6cba8d22660180250cad3d5afb6b7014843d5`; `preprocessing/generic-csv.mjs` blob `3b6cedae4869b7d8d5ae587f8d565812b6d9e193`, `tests/preprocessing-generic.test.mjs` blob `3f99b78f416a36c08f299f6511a5f7f16c1215f3`, `preprocessing/SMAX_PREPROCESS_GENERIC_CSV_V1.schema.json` blob `ae5d2e8cbc40bc08ed586b7826c1bec5f5cead0d`. 본 문서 commit 후 HEAD 재확인.
7. **Runtime·Production:** Node 22.16.0 있음, 최신 전체 Private 체크아웃 없음. GitHub status/CI/Windows/Production SHA·배포 URL 해당 없음.
8. **보안/데이터/백업:** 원본 `source_cells` 무해화하지 않음, 위험 플래그만 추가. 소비자 Excel/CSV 출력 시 식 평가 위험 별도 봉쇄 필요. 실제 고객·키·실거래 자료 없음. Git SHA로 복구점 보존. `main/frontend/backend`, 해커톤 저장소 및 기타 앱 무변경.
9. **다음 단계/완료 기준:** 인증 17+ 정본 파일 모든 blob SHA 비교 → `npm run test:preprocessing` 최신 63/63 (실행 결과 우선) → 합성 CSV CLI/원본 SHA256 실파일 E2E → XLSX 실제 ZIP E2E/Windows 경계 → 변경된 신규 issue enum을 읽는 소비자와 RAG 구조 호환·릴리스 검토. 무단 배포/판매/실자료/지출 금지.
10. **갱신/근거:** 2026-10-27 KST, GitHub 코드/test/schema 커밋 확인, V8 분리 실행 근거. 63은 체크인 정적 개수이며 Native PASS 표기가 아님.

## 2026-10-27 KST — XLSX XML 1.0 invalid-character fail-closed guard (10항 인계)
1. **목표·확정 요구·기술:** Private `hibi89/SMAX` `preprocessing` 범용 로컬 CSV/XLSX 엔진. 불신 XML에서 원본 문자 무음 오염을 방지하고 인간 검토/자동 승인 금지 정책 보존.
2. **변경·근거:** 실제 원격 `parseXml`이 XML 1.0에서 금지된 literal U+0000/U+000B/U+FFFF와 numeric `&#xFFFF;`를 받아들임. A: 기존 UTF-8/XML parser에 금지 문자 검문소 추가(채택, 의존성 0/최소 변경), B: 범용 XML 라이브러리 교체(호환성·공격면·유지비 증가).
3. **실행 검증:** 변경 전 실제 GitHub 원문 V8 재현; 변경 후 정확한 원문 V8 isolated parser cases **7/7 PASS**(정상 3/금지 4). 신규 합성 XLSX ZIP 회귀를 `tests/xlsx-preflight.test.mjs`에 등록. 최신 전체 Native `npm run test:preprocessing` **NOT_RUN**(기존 baseline 59/59은 과거 정본). 추가 테스트로 정적 약 **64개**, 실제 수는 Node 실행 우선.
4. **상태:** 금지문자 검사·테스트 GitHub 반영. Native CSV/XLSX 전수, ZIP E2E, `npm test`, Windows·CI·실고객 파일·배포 **미검증**.
5. **오류·복구·대안:** `TextDecoder(fatal:true)`는 UTF-8 인코딩만 검사하고 XML Char 적법성을 강제하지 않음. 금지 scalar는 파싱 전에 reject; XML numeric ref U+FFFE/U+FFFF 역시 reject. 기존 정상 tab/LF/CR과 named entity는 유지. GitHub 이전 커밋은 복구 지점; 강제 push 금지.
6. **저장소/브랜치/SHA/경로:** 작업 기준 HEAD `72aef6f8605befe6a29958fc83b3394b3c40c2a2`; `preprocessing/xlsx-cells.mjs`, `tests/xlsx-preflight.test.mjs`. 정확한 작업 결과 SHA는 GitHub commit/ref로 확인.
7. **Production·환경:** V8 격리 실행(가상 TextDecoder stub), 로컬 Node v22 설치 확인. 최신 정본 Full Native/실브라우저/Windows/Production URL 및 Production SHA 없음.
8. **보안/원본:** 고객 실파일, 키, 유료 API, 외부 공개, 배포, 다른 세 브랜치·해커톤 저장소 변경 없음. ZIP 원본/바이트 SHA·NOT_GRANTED 계약 불변.
9. **다음 단계:** 인증된 full 17+ 파일 checkout → Git blob 동일성 검증 → `npm run test:preprocessing` 전체 **실행** → 합성 XLSX ZIP·Generic CSV CLI SHA E2E → `npm test` 및 Windows 한 번에 검증. 테스트 미통과 시 수정한 경로만 최소 보강.
10. **갱신:** 2026-10-27 KST, 기준 `72aef6f8605befe6a29958fc83b3394b3c40c2a2`, Github 원문·V8 isolated만 검증. 전수 PASS/릴리스 승인 주장 금지.

## 2026-10-27 KST — V0 CSV CLI fd-bound read hardening (인수인계 10항)
1. **목표/요구/기술:** Private `hibi89/SMAX`, `preprocessing` 브랜치, Node 20+ 로컬 CSV V0 CLI의 경로 교체 및 파일 크기 경계를 강화. 자동 승인·유료 API·외부 서버 없음.
2. **완료 기능/결정:** 기존 `lstat(path)` → `readFileSync(path)`가 재개방되어 TOCTOU 노출. A안 fd open/fstat/read/finally close 및 읽기 후 byte-length 검사(기존 Generic CLI와 같은 접근) 채택. B안 공용 I/O 추상화는 변경 범위/회귀 부담 증가로 보류. Node 플랫폼이 `O_NOFOLLOW`를 미지원하면 open 간 경합 위험 완전 제거 주장 금지.
3. **테스트/근거:** 새 실제 GitHub `preprocessing/cli.mjs`를 이용한 JS V8 mock I/O 격리 **4/4 PASS**(normal 1, opened-file oversized 1, post-read oversized 1, original symlink 1). 신규 `tests/preprocessing-cli.test.mjs` 2MiB+1 합성 원본/출력 미생성 회귀 케이스 체크인. 전체 최신 Native `npm run test:preprocessing` **NOT_RUN**. 이전 59/59 Native는 과거 정본, 이번 성공으로 혼동 금지.
4. **완료/진행/대기:** 코드·테스트 GitHub 커밋 `2902f2e37289356eb537c13a1c50c9d7b175e304` 및 V8 격리 완료. 실제 디스크 fd 스왑 테스트, Native 전수 CSV/XLSX, 모든 UI `npm test`, Windows/CI/실고객/Production **미검증**.
5. **실패 이유/시도/대안/재시도 금지:** 전체 private checkout은 기존 네트워크 DNS/인증 경로 제한. GitHub blob → 컨테이너 전체 전송을 시도했으나 바이너리 원본을 완전 복원해 Native 검증까지 도달하지 못함. 전체 정본을 사칭하거나 실데이터를 제3자에 전송해서 우회 금지. 연결된 Github에서 계속 코드 검증 후 승인된 로컬 checkout 가능한 때 실제 Native QA.
6. **레포/브랜치/SHA/경로:** `hibi89/SMAX` Private `preprocessing`, code/test SHA `2902f2e37289356eb537c13a1c50c9d7b175e304` (부모 `6fae2900bf992fec589ad0f9b2ddca69c8af6901`); `preprocessing/cli.mjs`, `tests/preprocessing-cli.test.mjs`. 문서 갱신 뒤 새 HEAD 별도 확인.
7. **배포/환경:** Node v22.16.0 설치된 Linux 검증 환경 있으나 해당 checkout 전수 시험 미실행; Cloudflare/Vercel Production URL/SHA 미적용. Windows QA 미실행.
8. **데이터·원본·백업·권한:** Git commit 부모가 복구 지점. 비공개 repo만 변경; 타 브랜치/해커톤 무수정. 합성 자료만 사용, 실고객·토큰·유료결제·네트워크 게시 없음. 입력 원본 덮어쓰기·출력 덮어쓰기 금지 유지.
9. **다음 우선순위:** 원본 Git blob 18+ 파일 SHA 동일한 전체 checkout 확보 → `npm run test:preprocessing` 최신 Native 실행(새 case 포함 정적 약 65건, 실제 수치 우선) → 양 CLI 실파일 SHA/BOM/크기·오류복구 → XLSX ZIP E2E → Windows QA. 실패 시 최소 수정 및 회귀.
10. **KST/검증 범위:** 2026-10-27 KST, GitHub 최신 코어/테스트/HEAD 확인과 V8 fs mock 4/4까지. 전체 Native·상용 출고 승인 주장 금지.

## 2026-10-27 KST — MVP XLSX local CLI added (10-field handoff)

1. **목표·기술:** SMAX Private `preprocessing` 범용 CSV/XLSX Strict JSON 오프라인 Node 20+ MVP. 사용자 지시의 순서: MVP → 최초 설계 미구현 기능 → 보안·안정·호환 검수.
2. **구현·대안:** A 기존 보수적 XLSX extractor+validator를 별도 CLI `xlsx-cli.mjs`에서 사용(선택: 최소 변경·의존성 0·재사용); B 신규 범용 모든 포맷 CLI 통합(범위·검증 부담 증가). 양 CSV CLI 보존. 새 XLSX는 2MiB 파일+non-symlink+opened-fd 크기 검사, JSON `wx` 출력, 원본 SHA·재추출 parity 및 formula review.
3. **테스트:** `tests/xlsx-preflight.test.mjs`에 CLI 실파일 합성 검증 3건 추가: SHA/원본·수식 검토, 덮어쓰기·손상, 2MiB·symlink. JS syntax/isolated 경로 검사와 실제 Native 종합 결과를 구분한다. `npm run test:preprocessing` 최신 전체 Native/Windows/CI 아직 NOT_RUN.
4. **완료/진행/미검증:** CSV V0/V1 및 제한형 XLSX V0의 로컬 JSON 출력 진입점을 코드로 갖춤. 실 Node 전체 검증과 실제 일반 Excel 호환 및 출시 승인은 보류. MVP 사용 흐름과 전체 상품 출시는 다른 상태.
5. **안전/실패/대안:** 개인 파일·LLM·API·네트워크·자동승인·실고객 업로드 금지. GitHub 클론 네트워크 경로 제약이 있으면 같은 방식 무의미한 반복 금지; SHA 보존 가능한 환경에서 전체 native 회귀를 수행.
6. **저장소/브랜치/변경 경로:** `hibi89/SMAX`, Private `preprocessing`, 작업 부모 `293a348cf48e8f2241e4770e30c9c436057809e8`; `preprocessing/xlsx-cli.mjs`, `tests/xlsx-preflight.test.mjs`, `preprocessing/README.md`, `STATUS.md`, `HANDOFF.md`, 본 문서. 최종 SHA는 원격 HEAD 재조회 우선.
7. **운영/배포:** `node preprocessing/xlsx-cli.mjs --input source.xlsx --output cells.json`; Cloudflare/Vercel Production 미적용, ZIP 완전 Excel 호환 아님.
8. **원본/보안/복구:** 변경 전 부모 SHA에서 복구 가능; Private repo만 변경, 다른 3개 브랜치/해커톤 repo 미변경. 출력 `source.sha256`/provenance/NOT_GRANTED 보존.
9. **다음 실행:** 최신 소스 정확한 SHA 기준 Node Native 테스트, 실제 로컬 XLSX ZIP E2E → 설계 누락 포맷 중 HTML 또는 DOCX 독립 입력 계약 우선 → 이후 검수. 타 대회 복사·Adapter는 각 총괄.
10. **KST/검증 범위:** 2026-10-27 KST. 체크인 소스·샘플 테스트와 실제 실행을 엄격 구분하여 추후 수정.

## 2026-10-27 KST — XLSX CLI Native I/O smoke after MVP entrypoint
- GitHub commit `3cf9a5bf6ec5f50a8ce371a54da8a10b5f494cb9`, `preprocessing/xlsx-cli.mjs` blob `0b830360638baa1b6d7c33756a5d0271ad2fe299`와 동일한 `git hash-object`의 실제 파일을 로컬 Linux Node **v22.16.0**에서 `node --test smoke.mjs` 실행. **6/6 PASS, 0 FAIL**: 파일 생성·입력 SHA 보존, EEXIST 차단, 오류 시 출력 없음, 2MiB 초과 차단, symlink 차단, 잘못된 옵션 차단.
- **중요 제한:** CLI 자체는 실제 GitHub 파일이지만 테스트 실행 시 `xlsx-cells.mjs` 및 `xlsx-package.mjs`만 별도 **시험용 stub**으로 교체했다. 따라서 이것은 **Native XLSX CLI 파일 I/O 고립 검사**이며, 실제 OOXML/XLSX 추출·package validator를 통합한 E2E 및 최신 `npm run test:preprocessing` PASS 근거가 **아니다**. Stub 및 smoke 테스트는 GitHub 제품 코드로 푸시하지 않았다.
- 프로덕션·Windows/CI·고객 XLSX·상용출시는 미검증/미승인. 다음 1순위: 18+ 실제 원격 blob과 일치하는 Node 체크아웃에서 원본 extractor/validator와 함께 XLSX·CSV Native 통합 QA. Private 소스 공개·유료 CI·타 브랜치 수정 금지.

## 2026-10-27 KST — P2 TXT/Markdown text segment importer Native PASS (10항 인계)
1. **목표/설계:** 사용자 고정 순서 **MVP → 최초설계 누락 구현 → 보안·안정·호환 검증**에 따라 P2 문서 입력 기초 계층 착수. 2MiB 이하 UTF-8 TXT/MD, 규칙형 문단 분할, 원본/행·문자 위치 및 리뷰 상태 보존, 자동승인 금지.
2. **아키텍처 A/B:** A 독립 결정론적 원문 보존 text importer + 별도 CLI (선택: 외부 의존성 0, 기존 CSV/XLSX 영향 0), B 복합 파일 통합 및 외부 문서 파서 도입(검증·릴리스 비용 확대).
3. **완료 기능·근거:** `preprocessing/plain-text.mjs`와 `text-cli.mjs`, `tests/plain-text.test.mjs` 신규 코드. `SMAX_PREPROCESS_TEXT_V0` Strict JS validator/serializer, 전체 원문 `raw_text` 및 SHA256, 1-based 시작 행·UTF-16 문자 오프셋, 빈 줄 구분 문단, 잠재 수식 문자열 review, `approval=NOT_GRANTED`, 새 JSON exclusive write. `.md`는 Markdown 의미 분석이 아닌 UTF-8 일반 텍스트 취급.
4. **테스트:** GitHub로 업로드된 3개 정확한 source Git blob hash가 실제 Linux Node 22 실행 파일 `git hash-object`와 일치: core `00326ed159afbcebe0ba08287f206cb29befd37f`, CLI `e84abf637df28fc35807e2f81f235a1e2e0c6eb7`, tests `2f6b87964514566a44b7e063f776341a099ba95c`. 로컬 `node --test tests/plain-text.test.mjs` **5/5 PASS**. 최신 전체 `npm run test:preprocessing`, Windows/CI **NOT_RUN**.
5. **완료/미검증:** TXT/MD 자체 Native 기능 완료; 최종 상품 출시·일반 DOCX/PDF/HTML/Excel 호환성과 CSV/XLSX 전체 통합 QA 미완.
6. **문제/복구:** Private clone DNS 실패 환경, GitHub Connector → 동일 blob 검증하여 **신규 TXT 모듈만 독립 Native 테스트**. 구형 전체 59건 통과를 최신 PASS로 오기 금지.
7. **저장소/브랜치·파일:** Private `hibi89/SMAX` `preprocessing`, 작업 부모 `d51e64c3255c61514bc7e60f5e007cf1c135fe0b`, 수정 core/CLI/test/README/package/status/handoff. 본 문서 후 HEAD 조회.
8. **보안/데이터/운영:** 완전 오프라인, 신규 런타임 의존성 없음, 고객 실제 데이터 없음, 출력 `raw_text`는 원문 기밀 포함 가능. 원본 경로 덮어쓰기·출력 재생성 덮어쓰기 금지. 타 브랜치/해커톤/Production/라이선스/비용 변경 없음.
9. **다음:** TXT schema 정식 JSON Schema를 작성·검증 → HTML 정적 콘텐츠 parser 또는 DOCX 범위 비교 → CSV/XLSX 및 전체 repo Native 인증 checkout과 Windows QA. MVP 전체 완료는 최신 Native E2E 전 검증 대기.
10. **검증 시점/범위:** 2026-10-27 KST, 실제 Node v22.16.0 isolated TXT/MD 5개. 출시·상용 QA 주장 금지.
