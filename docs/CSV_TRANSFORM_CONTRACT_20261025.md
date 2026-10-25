# SELF CSV 실제 변환 코어 계약 — 2026-10-25 KST

## 범위
- 파일: `site/csv-transform.mjs` (`backend` 전용 비공개 소스)
- 공개 API: `normalizeSpreadsheetCsv(source, mapping)`, `SPREADSHEET_OUTPUT_COLUMNS`, `CsvTransformError`
- 지원 데이터: UTF-8 CSV 최대 2MiB, 날짜/상품명/금액 3개 원본 열을 **사람이 명시적으로 지정**한 경우만.
- 입력 `mapping`: `{ date: '원본 날짜 열', item: '원본 상품 열', amount: '원본 금액 열' }`
- 반환: `{ csv, rows, summary, state, mapping }`. `csv`는 UTF-8 BOM 포함, CRLF 구분의 결과 텍스트. 코드 자체가 파일을 쓰거나 서버에 전송하지 않음.
- 출력 고정 열: `거래일,상품명,금액,원본레코드,검토상태,검토사유`.
- 거래일: YYYY-MM-DD, YYYY/MM/DD, YYYY.MM.DD, YYYYMMDD 중 실제 달력 날짜만 ISO 표준형으로 변경. 인식 불가하면 원문 유지 및 INVALID_DATE.
- 금액: 정수/소수점 둘째 자리까지, 선택적 쉼표/원/₩ 지원. 인식 불가하면 원문 유지 및 INVALID_AMOUNT. KRW 소수점 처리·반품 부호는 고객 검토 대상.
- 빈 값, 중복 의심행, 위험 수식 시작 문자열은 건너뛰지 않고 `NEEDS_REVIEW`와 사유 표시.
- **2026-10-26 중복 판정 보정:** 사용자가 선택한 날짜·품목·금액 3열은 표준화 값을 비교하고, 선택되지 않은 모든 원본 열(예: 주문번호·거래 ID·메모)도 중복 식별 키에 포함한다. 세 필드가 같아도 주문번호가 다르면 다른 거래로 유지한다. 같은 파일에서 표준화된 3열과 나머지 원본 열까지 모두 일치하면 중복 검토를 요구한다. 이 판정은 사업상 거래 고유성에 대한 완전 보증이 아니다.
- 서식 오류/열 개수 불일치/중복 헤더/매핑 불명확/2MiB 초과는 **출력을 만들지 않고 예외**. 실제 파일을 덮어쓰지 않음.
- `READY_FOR_HUMAN_REVIEW`는 자동 업무 승인·회계 판단이 아닌 **사람의 최종 확인 필요** 상태.

## 검증 근거
- 작업용 로컬 Node.js v22.16.0에서 `node --check site/csv-transform.mjs`, `node --check tests/csv-transform.test.mjs`, `node --test tests/csv-transform.test.mjs` 수행.
- 합성 인라인 골드 픽스처·상태/오류 시나리오 **10 PASS / 0 FAIL**. 실제 고객 데이터·Windows·브라우저·전체 기존 테스트 스위트는 미검증.
- Git blob ID 대조(로컬 `git hash-object` = 원격 `fetch_file` blob):
  - `site/csv-transform.mjs`: `5b87530f0a394122a25b3a1a61f889b03bbdbeea`
  - `tests/csv-transform.test.mjs`: `5f2dda8d096c4e9ffd38797471f81ad267dbd0bf`
- 원격 코드 커밋: `4d5e100fe77c912fad9ebc84f72552d8fe9dc6b1`, 테스트 커밋: `ae5c78a88dc3cf6ddc4c99aa7749b6d25988693f`. 문서 커밋 이후 `backend` 최종 HEAD 별도 확인.

## 주의와 다음 작업
- **프론트 UI에는 아직 연결되지 않음**: 현재 기존 업로드는 헤더만 읽고 JSON/Markdown 설계서를 만든다. 실사용 전체 흐름이라고 표시 금지.
- 1차 후속: `frontend` 통합 전에 업로드→명시 매핑→변환 미리보기(중복·검토 사유)→다운로드 UI, 사용자가 임의로 기존 파일을 덮어쓰지 않는 안전한 다운로드 방식.
- 다른 9개 설계 템플릿이 완성형 자동화로 동작한다고 표기 금지.
- 공개 `site/`에는 유료 코어가 들어 있으므로 **공개 배포 금지**. Vercel/Cloudflare/크몽 상품 게시/유료 결제는 별도 승인.
- 1차 14달력일 제한: **2026-10-25~2026-11-07**. WEB/학생 서비스/회원가입/서버 API는 범위 밖.
