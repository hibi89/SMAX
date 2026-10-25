# SMAX² CSV 엔진 합성 데이터 속성 검증 — 2026-10-25 KST

## 수행/범위
- 최신 강화 CSV 코어 원격 blob `2b004fb9474743a95294b42baf7f875602644a54`와 동일한 로컬 파일을 Node.js v22.16.0에서 실제 실행.
- 별도 실제 fuzz 1,600개 합성 CSV: 문자열 쉼표·따옴표·복수 줄바꿈·이상 날짜·금액·수식형 입력을 조합. **1,600/1,600개에서 원본 레코드 수가 결과 행수와 일치**. 랜덤 fuzz는 별도 일회성 검사이며 CI에 넣지 않음.
- 이 가운데 재현 가능한 **256개 고정 시드 합성 CSV**를 `tests/csv-property.test.mjs`에 신규 작성: 행수 보존, 입력/출력 일치, UTF-8 BOM, 결과 재현성, 검토행 수 합계를 assertion.
- 신규 테스트 Git blob `2adecd598ae29da22c9d2f34ae8ec1c1d32e134c`는 frontend/backend 동일. 원본 CSV·개인정보·외부 요청 없음.

## 실제 Node 검사 증거
- frontend의 CSV 전용 테스트 (기존 10 + hidden-prefix 2 + property 1): **13 PASS/0 FAIL**.
- backend의 CSV 전용 테스트 (기존 12 + hidden-prefix 2 + property 1): **15 PASS/0 FAIL**.
- `scripts/qa-release.mjs` frontend 필수 검사 파일에 `csv-property.test.mjs` 추가.
- 실제 `frontend npm test` 전체, 실제 `npm run build:self` 및 `npm run qa:release`, Windows Edge/Chrome file:// QA는 아직 수행/통과 확인되지 않음. CSV 전용 통과를 제품 전체 PASS라고 표시 금지.

## 다음 1작업
최신 Private frontend를 승인된 Node 실행 환경에 확보한 뒤 `npm run qa:release` 전체 PASS/FAIL과 산출 HTML SHA 기록. 이어서 Windows Edge에서 csv 샘플(4행·검토 2행) 파일 업로드/다운로드, 네트워크/콘솔 오류 0 확인. 공개 배포/크몽 판매는 별도 사용자 승인 전 보류. 11월 7일은 최종 상한.
