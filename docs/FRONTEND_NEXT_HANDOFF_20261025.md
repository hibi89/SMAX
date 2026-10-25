# SMAX² frontend — 2026-10-25 최신 작업 인수인계

## 변경·원격 기준
- PRIVATE GitHub `hibi89/SMAX`, `frontend` 전용. 오늘 추가: `tests/offline-ui-smoke.test.mjs` 통합 테스트 1건으로 10개 가이드 템플릿의 JSON Blueprint·Markdown AI 구축 가이드 총 20개 출력을 확인한다. commit `e0c52fdc54b48325e9ce2109dce833d3a8a1adbf`; 파일 blob `260e9eaaf7aa011149a8b90afd65d6cd484900cc`.
- `STATUS.md` 최신 실행 10에 테스트/제약을 상세 기록. 기존 `HANDOFF.md`의 과거 기록은 유지한다. 기존 `main`, `backend`는 변경하지 않음.

## 검증
- GitHub 원격 모듈 8개를 정확한 소스 텍스트로 로드해 V8 모의 Node/브라우저로 묶은 HTML 5개 회귀 **5/5 통과**: CSV 처리/다운로드, 매핑 무효화, 업로드 race, 수식 보호, 10종 가이드 다운로드.
- 모든 테스트는 **V8 모의 환경**이다. 최신 HEAD의 native Node 전체 `npm test`, 실제 HTML 생성 `npm run build:self`, Windows Edge/Chrome `file://` E2E는 **미검증**. 이전 CSV 엔진 부분 테스트의 Node PASS와 합산하여 전체 테스트 PASS라고 표현하지 말 것.

## 현재 차단과 다음 작업
- 이 컨테이너는 GitHub Private 저장소를 직접 clone할 수 없음(DNS 오류). 별도 원격 파일 복원 시도도 Git blob 일치 증거를 확보하지 못하여 실패 처리. GitHub Actions는 과거 1회 작업이 단계 로그 없이 실패했고 자동 실행을 중단함.
- 우선순위 1: 최신 `frontend`를 승인된 Node 20+ 개발 환경에 내려받아 `QA_SELF_WINDOWS.cmd` 또는 `npm run qa:release` **실제로 실행**해 전체 테스트 0 FAIL 및 `dist/SMAX_SELF_OFFLINE.html` SHA-256/크기 기록.
- 우선순위 2: Windows Edge의 `file://` 모드로 합성 샘플 입력4행/검토2행/다운로드 BOM 확인 및 외부 요청 0을 테스트.
- 출시·Cloudflare 공개·크몽 등록·판매는 QA 통과 및 사용자 승인 전 금지. 2026-11-07 마감 상한 유지. 10종 템플릿은 실제 자동화 실행 10개가 아니라 규칙형 교육/설계 가이드임.

## **최신 2026-10-25 KST 갱신 — Native Node 실 QA 관문 통과**
- 이전 본문에서 ‘전체 Node 미검증’이라고 적힌 내용은 **과거 상태**. 실제 GitHub frontend 소스 20개 파일 각각 SHA 확인 후 격리 Linux Node 22.23.4 임시 VM에서 `node --test` **33/33 PASS, 0 FAIL**, `npm run qa:release` **exit 0** 확인.
- 실제 오프라인 단일 HTML `dist/SMAX_SELF_OFFLINE.html`: **73,341 bytes**, SHA-256 `093d1c8bff820369b664007fbecdd252a387b6cf354398247c754fb59b680563`; report와 byte/hash 일치, 별도 재빌드도 byte-identical.
- 1차 증거 정본: `docs/QA_FULL_NODE_AND_OFFLINE_BUILD_20261025.md` (commit `95f72393dd0be0eee77c539e69bc868ea2ed4257`). **실 Windows Edge/Chrome file:// 동작 및 CSV 다운로드는 여전히 미검증**. Node 33 PASS를 판매 QA PASS와 혼동 금지.
- 다음 `ㄱ`: Windows 실기기 Edge/Chrome 검수와 증거 확보, 최신 main 브랜드 변경 안전 병합 검토, 크몽 상품 조건/최종 사용자 승인. Cloudflare 공개·상용 판매 미실행.
