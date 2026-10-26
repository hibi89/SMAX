# SMAX² SELF — 최신 오프라인 번들 인메모리 SHA/CSP 검증

기준일: 2026-10-27 KST. 인증된 private GitHub `hibi89/SMAX`의 **frontend** HEAD `37d160f285b8351f18e85318c47ee8a3b6728313`에서 파일 원문을 읽은 정적·메모리 실행 기록. 제품 출시 QA 증명이나 실제 디스크 파일 출고 확인서가 **아니다**.

## 1. 원본 스냅샷

| GitHub frontend 실제 파일 | Blob SHA |
|---|---|
| `scripts/build-self.mjs` | `cfc2d69f8ded5a51979440c7be9c23c5840e9514` |
| `site/index.html` | `592a4087b0e8d25863adcc5790976cfc46829b82` |
| `site/styles.css` | `31fb02559283f26a40137800d1ddb77753d96baa` |
| `site/templates.mjs` | `4f57875f9aa22903b0fdf96c40a2a0542837f506` |
| `site/core.mjs` | `ae502950971cf9daaf2908f4507f372d238ca43b` |
| `site/csv-transform.mjs` | `68b6e6778b1946319a2867a45fa273c84d34fca0` |
| `site/sales-report.mjs` | `05578b300b2d7c2f0b653a485ac9c2c859ea055e` |
| `site/app.mjs` | `2c606202417e68d7e2d8a7f352a4deede99f7fe0` |

## 2. 관측된 빌드 후보 (실제 `dist` 파일 아님)

- 대상 함수: 체크인된 `bundleOfflineSelf({html,css,modules})` 원문. 빌드 파일에 담긴 ESM import/export를 V8 함수 실행용으로 제거하고 Node `crypto.createHash` 의존성은 아래 검증된 순수 JS SHA-256 어댑터로 대체했다. `buildSelf()` 디스크 write는 실행하지 않았다.
- 실제 UTF-8 후보 HTML 길이: **95,861바이트** (JS UTF-16 `length` 83,370).
- HTML 후보의 SHA-256 (소스 개정 시 즉시 바뀜): **`ed95c36e846b8d853eb57eb42c1f787e60835ca3c32725aa4173af71aa838ff6`**.
- JavaScript CSP base64 SHA-256: `PwZ43b1XiQ6Q/QVD5wOVz1C4DgCCUW4HJpatRCZ3YSc=`.
- CSS CSP base64 SHA-256: `KK30p01xXNscqed6Cq2oi30/KVeAHi2/dAg7l4fvT8c=`.
- SHA-256 구현 검증: `abc`, 빈 문자열, `안녕하세요` UTF-8의 표준 SHA-256 참조값 **3/3 통과**. 이는 이전의 `fake-hash` 결과를 출고 해시처럼 재활용한 것이 아니다.
- 단일 inline `<script>`/ `<style>` 각각 1개, JS·CSS 본문 재계산 SHA와 실제 HTML CSP 값 **각각 일치**.
- 출력 `connect-src 'none'`, `form-action 'none'`, `default-src 'none'` 유지, 외부 script/link/iframe 참조 없음, 전체 HTML CR 없는 LF 정규화.
- 같은 함수·같은 입력 재실행 출력 일치. 소스 HTML/CSS/5모듈의 LF를 Windows checkout CRLF로 바꾼 입력도 **동일 출력** 확인.
- 번들 inline JavaScript를 V8 `new Function`으로 구문 검증해 PASS. 이것은 실제 DOM 및 Edge/Chrome JS 실행 증명이 아니다.

## 3. 실행 환경 차단과 의사결정

- 도구 컨테이너 Node.js **v22.16.0** 설치 확인. `git ls-remote https://github.com/hibi89/SMAX.git HEAD`는 `Could not resolve host: github.com`으로 실패. GitHub 연결 도구로 개별 private 파일은 읽을 수 있지만 전체 checkout을 이 컨테이너로 직접 복제할 수 없어 `npm run qa:release`·`node --test` 및 **실제 파일 쓰기 빌드**는 실행하지 않았다.
- 과거 원격 GitHub Actions `self-ci.yml` 실행 1회(2026-10-25 생성)는 **failure**. 관련 오래된 job log는 404 `BlobNotFound`. 실패 원인을 임의로 단정하거나 재실행하지 않았다. GitHub Actions 설정은 수동 `workflow_dispatch` 유지. 승인되지 않은 외부 runner·CI 과금 사용 없음.
- 이 SHA는 특정 8개 GitHub blob의 조합에 대한 **메모리 후보 해시**일 뿐, 현재 존재하는 사용자의 Windows HTML이나 GitHub artifact를 지칭하지 않는다. 이후 커밋에서 모듈 하나라도 바뀌면 다시 빌드하고 해시를 검증해야 한다.

## 4. 다음 출시 관문 (변경하지 않음)

1. 최신 frontend 전체 소스가 정상 확보된 **실제 디스크 환경**에서 `npm run qa:release` exit0와 `dist/SELF_QA_REPORT.json` 생성.
2. 디스크 `dist/SMAX_SELF_OFFLINE.html`의 실제 SHA256·byte length·CSP를 새 리포트와 비교. 위 메모리 SHA는 어디까지나 비교 참고이며, **출고 PASS 여부는 디스크 증거 우선**.
3. 동일 파일 `file://` 실 Chromium Playwright 및 Windows Edge `QA_SELF_WINDOWS.cmd /edge` 검사와 수동 사용자 UX 1회.
4. `main` 기획 원본·`backend` 계약을 보존하는 승인된 통합 검토. 실제 배포·크몽 판매·유료 API·민감한 고객 원본 사용은 별도 승인 전 금지.

**현재 상태:** 메모리 SHA/CSP/코드 구문/Windows EOL 동등 검증 통과, **Native 릴리스·실 Chromium/Edge·Windows 사용자 테스트 NOT_RUN**, 출시·판매 미승인. 2026-11-07 개발 마감 유지.
