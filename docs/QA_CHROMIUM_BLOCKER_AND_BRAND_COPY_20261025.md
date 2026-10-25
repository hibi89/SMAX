# SMAX² SELF — 실제 Chromium 환경 확인과 최신 브랜드 카피 검증

기준: 2026-10-25 KST / Private `hibi89/SMAX` / `frontend` / Linux ARM64 격리 검증 환경

## 실제 수행한 작업
- Private GitHub의 SELF 소스 파일을 Git blob 해시 확인 후 격리 Node.js 22.23.4 임시 폴더에서 복원. 기존 연결된 다른 프로젝트의 소스·설정은 수정하지 않음.
- `main`의 최신 디자인 정책 확인: `docs/DESIGN_APPROVAL_DEFERRED_WEB_FIRST_20261025.md`, `docs/SMONGI_PRIMARY_MASCOT_DECISION_20261025.md`. **현재 캐릭터 명칭은 스몽이**, 디자인 최종 승인·이미지/포즈/배치 보류, NAON2는 등장 여부 미정. 구형 맥콩 사용 안내 문구를 `frontend/site/index.html`에서 교체함. 디자인 확정·로고 벡터 제작은 하지 않음.
- `tests/offline-package.test.mjs`에 스몽이 명칭과 디자인 검토 중이라는 문구를 확인하는 회귀 테스트 추가.

## Node 전체 출고검사: 통과
- `npm run qa:release`: **종료 코드 0**, 내부 Node 테스트 **34 PASS / 0 FAIL / 0 SKIP**.
- 실제 `dist/SMAX_SELF_OFFLINE.html` 생성됨. **73,352 bytes**.
- 파일 SHA-256: `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca`.
- `dist/SELF_QA_REPORT.json`의 상태: `LOCAL_NODE_PASS_BROWSER_NOT_TESTED`; 실제 파일 크기 및 SHA 일치.
- 이전 33 PASS / 73,341-byte / SHA `093d1c8b...` 기록은 **이전 버전**에 대한 역사적 증거. 이 문서의 **34 PASS / 73,352-byte** 결과를 최신 판정으로 사용.

## Chromium 실제 환경 차단 — 제품 실패 판정 아님
- Playwright v1.64.1과 Chromium Headless Shell v1248(Chrome for Testing 156.0.8078.4, Linux ARM64)을 임시 브라우저 QA 환경에 준비하고 **실제 `chromium.launch()`를 호출**함.
- 브라우저 실행이 비정상 종료되었고, 로그에 `libglib-2.0.so.0: cannot open shared object file` 기록. `ldd`에서 `libglib`, `libgobject`, `libnss3`, `libX11` 등 **19개 공유 라이브러리 누락** 확인. 때문에 **HTML 페이지 로드·CSV 업로드·CSV 파일 다운로드 단계 자체를 시작하지 못했음**.
- 연결된 별도 프로젝트 VM에 시스템 패키지를 설치·변경하지 않도록 이 실행 환경에서 브라우저 검증 중단. `PASS`라고 기록하지 않고 **`BLOCKED_ENV_LIBRARY`**로 구분.
- **Windows Edge/Chrome `file://` E2E는 여전히 미실행**. Linux Chromium 실패를 Windows 환경의 호환성 불량 증거로 간주하지 않음.

## 다음 출고 관문
1. 실제 Windows 10/11 Edge/Chrome에서 생성 HTML을 로컬로 열고, `examples/SMAX_SELF_SAMPLE.csv` 4행을 날짜·품목·금액 매핑 후 실행하여 **결과 4행·검토 필요 2행**과 UTF-8 BOM 다운로드 확인.
2. `python scripts/qa_browser.py --channel msedge` 또는 동일 절차의 수동 QA. JS Console 오류·외부 HTTP(S) 요청 0건·다운로드 파일명 확인.
3. 브라우저 검증 완료 시 그때 사용한 HEAD/HTML SHA/브라우저 버전/테스트 결과를 기록. `main`의 디자인 보류와 브랜드 문서 충돌을 방지하는 비파괴 통합 검토.
4. 사용권·가격·지원·환불 확정 및 창업자의 최종 승인 후에만 크몽 등록. 공개 배포, 고객 정보·외부 계정 전송은 현재 0건. **2026-11-07은 마감 상한**.
