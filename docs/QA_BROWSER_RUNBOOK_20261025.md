# SELF 오프라인 브라우저 QA 실행·판정 기록 (2026-10-25 KST)

## 검사 범위
- 전제: 개발자 PC에서 `npm test && npm run build:self` 성공 후, 개발 중인 비공개 `dist/SMAX_SELF_OFFLINE.html`을 대상으로 검수.
- 커맨드: `python scripts/qa_browser.py` 또는 `npm run qa:browser`; Windows Edge 별도 `python scripts/qa_browser.py --channel msedge`.
- 개발자에게만 Python Playwright + 브라우저 설치가 필요. 제품 구매자는 HTML 단일 파일 실행을 목표로 하며 Playwright·Node 설치 대상 아님.
- 테스트 픽스처 `examples/SMAX_SELF_SAMPLE.csv`: 실제 고객정보 없는 합성 자료.
- 검증 단계: 브라우저 오프라인 모드에서 로컬 HTML 열기 → 엑셀·CSV 통합 템플릿 → CSV 파일 선택 → 날짜/상품/금액 원본 열 직접 매핑 → 변환·검토 사유 표시(중복 및 이상 날짜) → BOM CSV 다운로드 → 4행 보존 / 검토 2행 → 잘못된 중복 매핑으로 재설정 시 과거 다운로드 무효 → 모바일 너비 375px 확인 → JavaScript 페이지 오류 및 외부 HTTP(S) 요청 없음.
- 결과는 스크립트에서 JSON으로 출력. 종료코드 `0 = PASS`, `1 = 제품/테스트 실패`, `2 = 소스/파일 입력 미준비`, `3 = 브라우저 실행 파일 없음 또는 관리자 정책에 따른 탐색 차단`. `BLOCKED`를 QA 성공이나 제품 결함으로 분류하지 않는다.

## 이번 턴 실제 확인한 증거
- 코드: `scripts/qa_browser.py`를 Private `frontend`에 등록하고 `npm run qa:browser` 명령 추가.
- 원격 파일을 로컬 검증본과 대조: Git blob `eab5a40c5445113bbf874d36ae9a8cce7a32a445` **일치**. `python -m py_compile` PASS.
- 검증 스크립트 최소입력 실행: 존재하지 않는 HTML/CSV에서 종료코드 2로 안전 중지. 임시 가상 HTML/CSV 파일이 존재하는 조건에선 Playwright 브라우저가 설치되지 않아 **`BLOCKED` / 종료코드 3**으로 분류되는 것을 실행 확인. 가상 HTML은 실제 SMAX 산출물이 아니다.
- 시스템 `/usr/bin/chromium`을 명시한 별도 환경 확인: 테스트용 최소 HTML에서 `file://` **및** `http://127.0.0.1` 탐색 모두 `net::ERR_BLOCKED_BY_ADMINISTRATOR`였음. 이는 현재 실행환경의 브라우저 보안 정책에 의한 접근 차단 증거이며 SMAX 제품 실패 증거가 아님. 동일 우회 무한 반복 금지.
- Node v22.16.0에서 기존 백엔드 `site/csv-transform.mjs`과 테스트의 해시 일치본을 `node --test tests/csv-transform.test.mjs`로 재실행하여 **10 PASS / 0 FAIL**.
- 전체 최신 `frontend` 저장소의 `npm test`, 실제 `npm run build:self`, 실 Windows Edge/Chrome `file://` 테스트, 고객 전달은 **여전히 미실행/미검증**. 이 결과를 출시 게이트 통과로 오해하지 말 것.

## 다음 실행 순서 및 차단 대응
1. Private `frontend` 최신 코드를 승인된 로컬 개발 환경에 확보한 뒤 `npm test` 및 `npm run build:self`. 결과 HTML의 크기·SHA-256·HTML CSP/인라인 스크립트 구조 검증.
2. 표준 Windows Edge(또는 Chrome) 환경에서 `python scripts/qa_browser.py --channel msedge` 검수. `PASS`면 테스트 결과 JSON과 소스 HEAD/HTML SHA를 `STATUS.md`에 기록. 환경 정책에 따라 `BLOCKED`면 별도 테스트 환경으로 이동.
3. 샘플 파일에 대한 사람의 실제 사용성 검토: 파일 더블클릭, 명확한 열 매핑, 다운로드 경로, 오류 표시, 한글 인코딩, 좁은 화면.
4. 릴리스 전 구매자 사용권/복제·업데이트 정책 및 크몽 거래·환불·지원 안내를 검토. `main` 브랜드 변경을 보존하면서 사용자 승인 후 안전하게 통합. 공개 Cloudflare 배포·판매 게시·실고객 자료 업로드는 별도 승인.

최종 제한: 현재 11월 7일은 마감 상한이며 확인된 검증 통과 시 앞당긴다. 실제 브라우저와 Windows 검증을 완료하기 전 크몽 게시 또는 판매 완료 주장 금지.
