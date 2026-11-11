# SMAX² P19 — 오프라인 매핑 재검증 및 파일 생성 실패 복구
**2026-11-11 KST | feature/prep-self-owner-mapping-p8 | RELEASE HOLD**

## 구현 및 결정
기존 P18은 고객의 CSV→매핑 JSON 저장만 지원했다. P19는 같은 브라우저에서 저장된 매핑 JSON을 다시 선택해 실제 현재 CSV의 물리 바이트 SHA256, 열 이름·역할, 기간, 스키마 버전, 승인 필드 부재를 확인한다. 전체 CSV 행/금액이나 회계 결과는 아직 검사하지 않으며 PREP/SELF 별도 실행이 필수다.
설계 A(로컬 서버·REST 추가)는 CSRF/인증/방화벽·운영 복잡도를 늘린다. 설계 B(기존 단일 HTML에서 strict 재검증)는 무료·서버 불필요·외부 전송 0이며 사용자가 직접 데이터를 통제한다. B 채택.

## 실제 GitHub 소스
- site/owner.html: 기존 CSV 선택/저장에 ⑥ 저장된 JSON 재검증 단계 추가, exact SHA·strict 4-key JSON·mapping 3개 다른 값·daily/monthly, 64 KiB·UTF8, 원본 변경·승인 필드·중복 매핑/기간 거부. CSP inline SHA 재계산. 실제 HTML Git blob cf56242d40dc748ab42ec17bb1bc674d5ce03327, 기능 commit 4eaaecb4c9ceeb3027050b98ef0025516e90f45d.
- tests/browser/self-owner-draft-reverify.py: 브라우저 회귀, exact tested blob eb0b962f9de21a043685ab1d96c96af9cc352cef, commit ba8afebc97e287806dcd1ccb86ceb15fd4200ded.
- preprocessing/self-owner-portal-cli.mjs: HTML/CSP 검증을 신규 파일 open 이전으로 이동. 불량 자산 시 빈 출력 생성 방지. blob de566e9fa14eb8b3aad7003082eea062b3195fa4, commit dabc5319529ae4f3e4c9f8116bf7d743086d4c1d.
- tests/self-owner-portal-csp-failclosed.test.mjs: 실제 Node 자식 프로세스 2건과 독립 임시 복사본의 불량 CSP 사용. blob 38d41d7d16f4891e19cbfe86dbfa95a6c9e4f24a, commit efacf96298ffc79d71bccfc785a9b59877f7fb24. package.json test:preprocessing 등록 c04ef56f11ca66385f9b748c6d4ccb3ac005e72d.

## 검증 — 범위 구분
- Native Node22 Linux: 기존 P18 exact-file unit 5건 + 기존 SHA 경계 53벡터를 포함한 테스트 1건 + 신규 P19 failclosed 2건 = 테스트 8 PASS / 0 FAIL / 0 SKIP. 모든 해당 파일은 실제 GitHub blob과 로컬 git hash-object 일치. 불량 CSP 실험은 임시로 복사한 별도 파일만 변경.
- Chromium 144.0.7559.96: 18 PASS / 0 FAIL. 실제 CSV 업로드, JSON 다운로드, 같은 SHA 재확인, 원본 SHA 오염/BOM 변경/파일 변경, 승인 필드, 역할 중복, 존재하지 않는 열, 미지원 기간, invalid UTF8, 64KiB 초과를 차단. 원본 거래행 UI 비표시, 외부 요청 0, JS 런타임 오류 0. 비동기 대기용 테스트 하네스 보정 후 최종 18/18 재검증.
- 별도 원본 PREP/SELF 알고리즘: V8 17/17, 정상 90.00, 오류·HOLD·위조 차단 확인. 실제 P9/P10/P11 원본 알고리즘 + 모의 인메모리 파일시스템을 이용한 패키지→재검증→변조 거부→HOLD 금액 숨김도 통과. 이는 전체 Native/실제 디스크 E2E가 아님. crypto/fs 일부는 시험용 구현.
- Chromium sandbox에서 file://와 localhost 직접 탐색은 ERR_BLOCKED_BY_ADMINISTRATOR. 동일 원본 HTML page.set_content로 테스트했으며 Windows Edge/Chrome 직접 파일 오픈을 성공으로 주장하지 않음.
- 전체 repo npm run test:preprocessing/npm test, P19 브라우저 JSON→P9/P12/P16 실제 Node 실파일 통합, 실제 SELF 고객 UI·Windows10/11·설치·상용 배포 모두 NOT_RUN.

## 상태 및 다음 작업
전체 최종상품 잠정 완성률 76%→79%(+3%p)는 새 고객 검증 단계와 실제 failclosed 복구 및 검증 범위 기준의 공학적 추정. 85% 목표까지 6%p. RELEASE HOLD. 원본 자료/고객정보·비밀·안정 브랜치·배포·결제·권한/비용 변경 없음. Git 이전 커밋으로 복구 가능.
다음 우선순위: 신뢰 가능한 비공개 full checkout에서 Node 전체 테스트와 P19 다운로드 JSON→P9→P12→P16 real file E2E, Windows Edge file:// 검수, SELF 제품 UI/설치/상용 권리와 안전성 점검. 검증 없이 85% 도달 또는 출시 가능 판정 금지.
