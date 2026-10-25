# SMAX² SELF — 고객 PC 단일 HTML 패키징 / 검증 게이트 (2026-10-25 KST)

## 의도 / 제약
- 제품: 1차 사장님 SELF 로컬형. 외부 AI API·클라우드·로그인·Node/Python 설치를 **구매자에게 요구하지 않도록** 오프라인 단일 HTML 출력을 준비한다.
- 입력 원본: Private 저장소 `site/index.html`, `site/styles.css`, `site/templates.mjs`, `site/core.mjs`, `site/csv-transform.mjs`, `site/app.mjs`. 원본을 직접 덮어쓰지 않는다.
- 제작 명령: 저장소 루트에서 **개발자**가 Node.js 20+로 `npm test && npm run build:self`. 산출 예상 경로 `dist/SMAX_SELF_OFFLINE.html`. `.gitignore`에서 `dist/`을 제외해 원격 PRIVATE에도 고객 제공물을 무심코 올리지 않는다.
- 고객은 검증 후 HTML 파일을 PC로 받아 Microsoft Edge/Chrome 등 브라우저에서 더블클릭으로 연다. 로컬에서 처리하며 브라우저 간/Windows 파일 프로토콜 동작은 **실제 검증 전 가정**. 사용상 보안 환경에 따라 브라우저가 로컬 파일/다운로드를 제한하면 오류/대안 안내가 필요하다.

## 설계 2안 및 현재 선택
1. **선택: 단일 HTML + 임베디드 스타일·스크립트**. 브라우저 코어 기능 재사용, 설치/서버 비용 0, 14일 개발 상한에 맞음. 단점: 브라우저 호환·PC 환경, 사용권 통제/무단 복제 방지 한계.
2. **보류: Tauri/WebView 패키지**. Windows 설치 UX와 네이티브 파일 처리 개선 가능. 단점: 런타임/서명/보안 패치/백신 경고, 제작·검수 부담. 실제 단일 HTML이 실패하거나 고객 사용성이 떨어질 때 검토. 범위·기간 연장 자동 승인 아님.

## 빌드 계약 및 안전
- `scripts/build-self.mjs`는 기존 모듈 4개를 지정된 순서로 연결해 `<script>`에 넣고 DOMContentLoaded 후 실행. 동적 네트워크 `fetch/XMLHttpRequest/sendBeacon` 또는 미등록 imports/새로운 export 계약은 빌드 실패로 처리.
- 원본 HTML의 외부 `app.mjs`·CSS 링크를 삭제하고 해당 내용만 내부 삽입. 파일 내부의 `</script`/`</style` 삽입을 차단해 HTML 태그 파손 방지.
- 인라인 JS와 CSS에 SHA-256 CSP 해시를 계산해 삽입, `connect-src 'none'`, `form-action 'none'`, `object-src 'none'` 등 적용. HTML을 수동 수정하면 해시 불일치로 실행이 막힐 수 있으므로 반드시 원본→빌드 재생성. 테스트는 `tests/offline-package.test.mjs` 4개.
- **코드 보호 한계:** 로컬 HTML 안의 자바스크립트 코드는 구매자가 열람·복사할 수 있다. 단일 파일로는 라이선스 기간/사용자 1명/재배포 차단을 강제할 수 없음. 정직한 사용권·업데이트·지원 정책을 결정해야 함. 개인정보·실고객 파일·키를 소스나 빌드 산출물에 포함하지 않는다.
- **공개 배포 금지:** `dist/`와 `site/`는 SELF 제품이고, Cloudflare는 `public-site/`만 허용. 크몽 상품 등록/고객 전달/Cloudflare 공개 전에 사용자 승인을 받는다.

## 현재 직접 확인한 검증
- GitHub 원격 `frontend` ESM 소스 4개를 같은 순서로 합쳐 실제 V8에서 구문 검사, DOMContentLoaded 핸들러 실행 및 첫 화면 렌더링: **8/8 정적·기초 실행 점검 통과**.
- 다시 V8 가짜 DOM에서 CSV 업로드 → 3열 명시 매핑 → 중복/오류 표시 → CSV BOM 다운로드 → 템플릿 전환 시 출력 초기화: **6/6 통과**. 이는 패키징 코드와 동일한 JS 연결 순서의 인메모리 시뮬레이션일 뿐 실제 브라우저가 아님.
- **실 Node 전체 `npm test`, 실제 `npm run build:self` 산출물 생성, Edge/Chrome file:// 로드 및 CSV 다운로드, Windows GUI·사용자 환경에서의 작업, 공개 호스팅/크몽은 현재 미검증**. 외부 비용 0원, 고객 실데이터 전송 없음.

## 다음 우선순위
1. 안전한 권한을 가진 실행 환경에서 `npm test` 전체 결과(PASS/FAIL 숫자) 기록 후 `npm run build:self`로 산출물 생성. 파일 SHA-256·크기와 구성/CSP·가이드 검증.
2. 실제 Edge/Chrome에서 이 HTML을 직접 열어 '템플릿 → 챗봇 패널 → CSV 선택 → 원본 열 매핑 → 변환 → 검토 → 다운로드' 수행, CSV 결과 내용/한글 BOM·중복·결측 확인. 오류 발생 시 브라우저 Console/Network 증거로 대응.
3. 고객용 짧은 README·합성 CSV 예제 및 안전/사용권·업데이트 안내. 확정된 브랜드 최신 로고/마스코트 원본 자산 검증.
4. 충분한 검증을 거친 뒤 `main` 비파괴적 통합 및 크몽 상품 조건/상품 게시 별도 승인. **2026-11-07은 최종 상한이며 목표 소요시간을 채울 필요 없음.**
