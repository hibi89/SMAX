# SMAX² SELF — 매출 집계 코어 v0.1 (출시 전)

작성: 2026-10-25 KST · 브랜치: `backend` · 상태: **로컬 처리 코어만 구현·검증 / UI 및 Windows E2E 미통합**

## 선택 설계
- A: 원본 CSV를 헤더 자동 추정하여 즉시 합산 — 잘못된 열 인식·중복/이상값 섞임 위험이 큼.
- B: 사용자가 판매일·판매채널·판매금액 3개 열을 직접 지정하고 기존 `normalizeSpreadsheetCsv`의 검토 플래그를 활용한 다음 유효해 보이는 행만 잠정 집계. 원본 행을 버리지 않고 제외 보고서를 따로 작성. **B 채택.** 외부 API/DB/요금 0.
- 날짜 주기는 필수 선택 `daily` 또는 `monthly`; 세무 기준/환불 정책을 임의 선택하지 않음.

## 함수 계약
```js
import {buildSalesReport} from './site/sales-report.mjs';
const result = buildSalesReport(csvText, {
  date:'판매일', channel:'판매처', amount:'판매액'
}, {period:'monthly'});
// result.reportCsv, result.reviewCsv, result.summary
```

- 원본 CSV: UTF-8 문자열, 최대 2MiB. 입력에서 읽어 오기/다운로드 담당 UI는 **아직 연결하지 않음**. XLSX/CP949 자동 디코딩 미지원.
- 기존 정규화의 날짜·금액 형식/중복행/결측/수식 방어를 재사용. 명시한 열을 중복 사용하면 오류.
- `READY_FOR_HUMAN_REVIEW` 행만 잠정 집계, `NEEDS_REVIEW` 행은 모두 별도 `reviewCsv`에 원본 레코드 번호 및 사유로 보존. 이는 *승인*된 매출이 아니며 사람이 확인해야 함.
- 금액 계산은 부동소수점 대신 BigInt의 1/100원 단위. 입력 금액 정수부가 12자리를 초과하면 `AMOUNT_EXCEEDS_REPORT_LIMIT`로 검토 대기. 음수는 **음수 조정액**으로 별도 표시하며 실제 반품 여부는 추정하지 않음.
- 결과: 기간·채널별 양수금액 합계/음수 조정액 절댓값/순합계 CSV (UTF-8 BOM), 제외행 별도 CSV, 전체/집계/제외 행수. 데이터 외부 전송·원본 파일 덮어쓰기 없음.
- 자동화 실행·송금·세금/회계 신고 등에 **사용 금지**. 실수익/환불 근거로 자동 의사결정하지 않음.

## 실제 검증·미검증
- 해시 일치 원본 `site/csv-transform.mjs` (blob `2b004fb9474743a95294b42baf7f875602644a54`)과 신규 매출 코어(blob `01050c8d3a3dd6a1f548d37484112aa7bd99b924`), 테스트(blob `4732565887cd2e3f007bb7b03a6e271e4520d159`)에서 Node.js v22.16.0 `node --test tests/sales-report.test.mjs` **7 PASS / 0 FAIL**.
- 일별·월별·정확한 소수 계산·중복/결측/이상 날짜/수식 제외·거액 상한·잘못된 열 선택·따옴표 CSV 검증.
- **미검증:** 전체 기존 backend suite 재실행, frontend 반영, 오프라인 SELF HTML 통합, Windows Edge/Chrome·실제 고객 데이터·거래 규정/회계 기준. 크몽 등록/Cloudflare 배포/실매출 없음.

## 다음 통합 전 체크
1. frontend의 sales 템플릿에 CSV 업로드·판매일/채널/금액 **수동** 매핑 및 일/월 선택 컨트롤.
2. result.reportCsv·reviewCsv 두 파일 내려받기, 제외 건수 명확히 표시, 초기 상태와 이전 업로드/템플릿 변경 시 결과 폐기.
3. 파일만으로 처리되는 오프라인 번들러의 import 계약에 안전하게 포함시키고 Node·브라우저 회귀 및 공개/비공개 경계 검사.
4. 기존 `spreadsheet` 템플릿 CSV 기능/10종 가이드 변동 없음을 확인. Windows 실기기 검증과 출시 승인 별도.
