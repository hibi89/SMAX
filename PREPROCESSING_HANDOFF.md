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

1. **목표/요구/스택:** Private SMAX \`preprocessing\`만 관리, 전처리 공통 엔진·정확한 provenance·Human review, Node >=20/내장 \`zlib\`·\`crypto\`, 지출 0원. 해커톤별 어댑터/공개/제출 금지.
2. **완료·결정:** ① 패키지 라이브러리 추가(광범위 지원 but 의존성/비용/공급망 점검) vs ② 이미 검증한 preflight를 재사용해 제한형 XLSX sheet/cell 파서 직접 구현(0 의존성·경계 명확). 이번은 ②. \`xlsx-cells.mjs\`에서 \`extractXlsxCells\` 제공. inline string, shared string(rich run), numeric raw string, boolean, blank, formula flagged, multi-worksheet source path, SHA/quality/NOT_GRANTED.
3. **테스트와 실제 증거:** 실제 Node v22.16.0에서 \`node --test tests/xlsx-preflight.test.mjs\` **18/18 PASS, 0 FAIL**, 원격 코드 blob \`ee81d55fbaa64e234d104a6e0a68904e812351f1\`/테스트 blob \`fbbc028188b0e4de16b66b4dcd9b7e330a9c6044\` 로컬 \`git hash-object\`와 정확히 일치. 추가로 합성 openpyxl/ XlsxWriter 생성 XLSX 각 1파일 호환검증. **전체 CSV 포함 Native npm test/Windows NOT_RUN.**
4. **진행 상태:** 신규 XLSX 기능/테스트 비공개 GitHub 커밋 완료. 데이터 타입은 정형 원문 단위이며 날짜/서식/수식 계산, full Excel 호환성·비즈니스 표준화/DB/vector는 미구현. 출고·판매/Production 승인은 여전히 없음.
5. **오류·복구·재시도:** 최초 XML 엔티티 decode 단계에서 \`&amp;\`가 \`&\`로 변환된 뒤 재검증되어 정상 입력 2건 실패. 문자 엔티티 사전 검증 → 단일 decode 순서로 수정. 이후 18/18 PASS. 기존 Private git clone DNS 실패 반복 회피; 신규 모듈과 테스트 원격 정확한 SHA 비교로 Node 검증.
6. **repo/branch/SHA/files:** \`hibi89/SMAX\` Private \`preprocessing\`; 시작 \`73ff80a7646d611823be623ea7ed6f35dd18b09f\`, 코드 commit \`4e6b5f4f25cbb2c9a95115c8ee37099b5998454c\`, 테스트 최종 commit \`128f98638b39c00c31b617a7b406318d0144fab4\`; paths \`preprocessing/xlsx-cells.mjs\`, \`tests/xlsx-preflight.test.mjs\`, \`preprocessing/xlsx-preflight.mjs\`, docs/status/handoff. 최종 HEAD는 갱신 후 재조회.
7. **배포/환경:** \`node --test tests/xlsx-preflight.test.mjs\` 실제 PASS. \`npm run test:preprocessing\`은 전용 스크립트가 xlsx-preflight를 포함하지만 전체 커맨드 실행은 NOT_RUN. Vercel/Cloudflare Production URL·SHA 없음.
8. **원본/보안/백업:** 입력 파일 읽기 전용, 테스트 합성 XLSX만, 실제 고객 데이터/개인정보·토큰/LLM API·외부 요청·비용 0. 신규 XLSX JSON에 원본 모든 셀/수식이 있을 수 있으므로 원본 동일 기밀 취급. GitHub 기존 commit들이 복구점, force push/합병 없음.
9. **다음 우선·완료 기준·사용자 승인:** 전체 Native repo QA와 명시적 release gate → XLSX Schema/검증기·시트 논리명/날짜 스타일 등 지원 범위 선별 및 원본 행 검토 강화 → 다른 문서 플러그인. 공개 코드 반출·사용자 실데이터·유료 API·배포·판매는 사용자 별도 승인.
10. **시점:** 2026-10-27 KST. 현재 검증은 새 XLSX 코드/테스트와 두 합성 워크북의 로컬 Node에 한정, 전체 SMAX 제품이나 100% 완료 주장이 아님. 이후 문서 commit/최종 HEAD 확인.
