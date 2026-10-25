# SMAX² SELF — 사장님용 매출 보고서 UI 통합 (2026-10-25 KST)

## 결정 및 기능 범위
- 현재 브랜치: **frontend**. backend의 검증된 `site/sales-report.mjs` 동일 Git blob `01050c8d3a3dd6a1f548d37484112aa7bd99b924`를 복사해 별도 브랜치에 안전하게 통합. `main` 변경/병합 없음.
- `site/app.mjs`: 판매 템플릿 선택 → 채팅 패널 → 사용자 CSV 업로드 → `date/channel/amount` **3개 필드 개별 수동 매핑** → `daily/monthly` 주기 → `run-sales` → 기간·채널별 잠정 보고서 + 검토에서 제외된 행 CSV 각 다운로드.
- 결과 파일: `SMAX_SALES_REPORT.csv`(양수/음수조정 절댓값/순액·집계행수), `SMAX_SALES_REVIEW_ROWS.csv`(원본레코드 번호·입력값·제외 사유). 둘 다 UTF-8 BOM. 회계/세무 신고 용도가 아니고 `REQUIRES_HUMAN_REVIEW` 상태.
- 재매핑·주기 변경·CSV 파일 변경·템플릿 선택 변경 시 이전 계산 결과 무효화. 비동기 업로드의 generation guard는 기존 코드를 재사용. 검토 대상 자료는 자동 삭제되지 않고 별도 CSV에 표시됨.
- 카드/챗봇 문구에서 설계 템플릿 8종과 실제 로컬 CSV 처리 2종을 구분. 제품 스몽이 기본 이름 유지, 그래픽 최종 승인 유보.

## 패키징 및 안전 경계
- `scripts/build-self.mjs` 계약 4→5 모듈. 허용 모듈은 `templates,core,csv-transform,sales-report,app`. 새 sale 모듈은 기존 `csv-transform`만 명시적으로 import할 수 있고, app의 새 `buildSalesReport` import만 whitelist에 추가. 외부 네트워크 API/리소스/CSP 안전 정책은 동일. `public-site/`에 실행 코어를 배포하지 않으며 `tests/public-boundary.test.mjs`에서 sales 코드 누출을 금지.
- `tests/offline-package.test.mjs`, `tests/offline-ui-smoke.test.mjs`은 5-모듈 계약에 맞게 수정. smoke에 매출 UI 보고서 2파일·BOM·부적격 행·재매핑/주기변경 무효화 2건 추가. `tests/sales-report.test.mjs`에 기존 백엔드 동일 blob의 매출 7개 회귀 테스트 포함. `scripts/qa-release.mjs`이 새 매출 회귀 파일을 필수로 검사.
- 고객 안내 초안 `docs/SELF_CUSTOMER_QUICKSTART_20261025.md`에 매출 집계 절차·주의사항 추가.

## 실행 증거와 검증 한계 (과장 금지)
- **실제 Node v22.16.0**: 동일 Git blob 기존 `csv-transform.mjs` + 매출 `sales-report.mjs` + `sales-report.test.mjs` 재실행 **7 PASS / 0 FAIL**. `git hash-object` 결과가 Private backend/frontend 원격과 일치.
- **실제 V8 isolated simulation**: Private GitHub 최신 frontend 5개 JS 모듈 텍스트에서 import/export만 제거하고 합성 DOM으로 모의 실행. JS 컴파일·판매일/채널/금액 매핑·5행 중 2행 잠정 집계/3행 별도 제외·순합계 79.90원·보고서/검토 CSV BOM·기간/맵 변경 결과 무효화·다른 템플릿 선택 검증 완료. 테스트 코드 3개 정적 JS 파싱 PASS.
- **NOT_RUN**: 이번 HEAD 전체 `npm test`, 실 `npm run qa:release`·새 단일 HTML 파일 생성과 CSP 해시, Linux Chromium 변경 후 재E2E, Windows Edge/Chrome 실제 PC. 기존 34/34 Node 및 Chromium 7 항목 합격은 **이전 제품 SHA 기준**이며 현재 HEAD 전체 PASS가 아니다.
- GitHub Actions 과거 단계 로그 없는 실패를 무단 재실행하지 않음. 원격 repo 직접 clone의 DNS 차단은 기존 알려진 환경 제약. 실제 고객/민감정보/계정/결제/지출/Cloudflare 공개/크몽 판매 없음.

## 다음 절차와 출고 차단
1. frontend 전체 파일이 내려받아진 Node 20+ 실제 환경에서 `npm run qa:release` 실행. 2개 UI smoke 추가 테스트·매출 7개 테스트 포함 모든 회귀 PASS 및 새 HTML SHA 확인.
2. **같은 SHA** 단일 HTML로 Chromium `file://` 오프라인 E2E. 기존 CSV 정리와 신규 판매 집계(일/월·2파일·검토 행수·외부 요청0) 실동작 확인. 이후 Windows Edge/Chrome 실 PC에서 동일 파일로 수동 검사.
3. 무료 public-site와 유료 SELF 코드 경계 최종 감사, 상세 초보자 UX/설명서·지원/환불/가격·스몽이 그래픽 검토, `main` 통합 후보 검수.
4. 대외 배포·크몽 등록/심사·판매는 **창업자 명시 승인 전 진행하지 않음**. 2026-11-07 마감 상한 유지; 조기 검증 가능하면 앞당기되 미검증을 완료로 간주하지 않음.
