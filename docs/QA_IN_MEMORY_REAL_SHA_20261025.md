# SMAX² SELF — 최신 원격 소스 인메모리 빌드·SHA-256·합성 fixture QA
검사 기준: 2026-10-25 KST · Private `hibi89/SMAX` `frontend` HEAD `16372add1edc289424dd7b348d38d111b8d760ad`.

> **정확한 판정: `ISOLATED_BUILD_PASS` · Native `npm run qa:release` 및 브라우저·Windows 제품 QA는 `NOT_RUN`.**  
> 결과 해시는 GitHub에서 받아 현재 세션의 V8 메모리 안에서 생성한 **HTML 문자열**의 SHA-256이며, 사용자가 다운로드할 디스크 산출물의 검증된 해시가 아니다. 모의 CSP 해시가 아니라 실제 SHA-256 알고리즘을 계산했지만 로컬 Node 디스크 빌드로 교차 검증하지 못했다.

## 1. 실제 구현으로 계산한 출고 후보
- 단일 HTML UTF-8 바이트: **84,678**
- 해당 HTML SHA-256(hex): `57b9abdadce1f9c489f51bdc585ff1f4bfed5a6a4703402cc388a03998f9a838`
- 빌더: **GitHub 원본 `scripts/build-self.mjs`의 `bundleOfflineSelf` 함수 그대로** V8에서 평가. 개발자 Node 모듈 의존 `createHash`는 같은 SHA-256 결과를 내는 별도 pure-JS 구현으로 주입; UI/CSS/CSV 코드는 GitHub 최신 원본 그대로 입력함. 표준 테스트 벡터 3건(hex)이 모두 Python `hashlib.sha256` 기준과 일치:
  - `abc`: `ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad`
  - `한글 CSV 테스트`: `5a008d81d9eea878d9bc0af43290e1155a61d45209994f658cde55e268281f01`
  - `SMAX² Square`: `febe85068e5f788d2d49ffa6a9135d8ac8b1c17a1b80b0b1bdb639edb399e961`
- 번들 구조 검사: inline `<script>` 1개/`<style>` 1개, 각 SHA-256 CSP에 실제 본문 해시 포함, `connect-src 'none'` + `form-action 'none'`, 외부 스크립트/스타일/iframe 링크 0, 인라인 JS 구문검사 PASS. HTML에는 10종 템플릿 라이브러리의 UI 및 브랜드 표시 확인.
- 이 보고서는 **실제 디스크 파일을 생성하지 않았고 다운로드용 HTML을 보존하지 않았다**. 재구성 가능한 SHA 계산 증거만 기록한다.

## 2. 같은 브랜치의 실행 엔진·공개 경계 검사 (격리 V8)
- `examples/SMAX_SELF_SAMPLE.csv`: 원본 4행/변환 4행/검토 2행, 결과 UTF-8 BOM.
- `examples/SMAX_SALES_SAMPLE.csv`: 원본 5행, 잠정 반영 2/제외·검토 3, 일별과 월별 순합계 모두 정확한 **79.90** (BigInt 기반), 중복/잘못된 날짜/수식 위험 사유 보존, 보고서와 검토 CSV 양쪽 BOM.
- `wrangler.jsonc` 공개 정적 위치 `./public-site` 고정, 해당 공개 `index.html`에 스크립트·파일입력·폼 및 유료 로컬 엔진 호출 없음.
- 위 합성 CSV/공개 경계 **10/10 PASS**. 이것은 실제 Node 테스트러너의 `npm test` exit 0 또는 실제 Chromium HTTP/파일 프로토콜 검증이 아니라, GitHub 원문 엔진을 동일 입력에서 V8 실행해 조건을 비교한 결과다.

## 3. 출처 GitHub blob (검사 시점)
| 경로 | Git blob SHA |
|---|---|
| `site/index.html` | `592a4087b0e8d25863adcc5790976cfc46829b82` |
| `site/styles.css` | `31fb02559283f26a40137800d1ddb77753d96baa` |
| `site/templates.mjs` | `4f57875f9aa22903b0fdf96c40a2a0542837f506` |
| `site/core.mjs` | `999657d4a5b05c060402ea71ce833cc592513392` |
| `site/csv-transform.mjs` | `2b004fb9474743a95294b42baf7f875602644a54` |
| `site/sales-report.mjs` | `17796cd0e44095512b61303045dffa582fe06162` |
| `site/app.mjs` | `196da9c89bf192a1a6d391ddf1d4257ed925ea51` |
| `scripts/build-self.mjs` | `5eb5cf11f558d01f840165638abab0d95a5e4679` |
| `examples/SMAX_SELF_SAMPLE.csv` | `ca20e22dd5ff3d54cf1aaa87fe2f68bad236257a` |
| `examples/SMAX_SALES_SAMPLE.csv` | `0bb5bbf5cefbcd9f9cab1f3081f2fa0d8f92ab28` |
| `wrangler.jsonc` | `a92352e21a495a0e61ffb5d8c1c2ad5296bc05c6` |
| `public-site/index.html` | `9d31d8461b7401b583f3f96e909ee0f7a54a7013` |

## 4. 절대 누락하면 안 되는 다음 출고 게이트
1. Private `frontend` 최신 HEAD 전체 로컬 checkout 가능 Node≥20 환경에서 **`npm run qa:release` 직접 실행**. exit0의 `dist/SELF_QA_REPORT.json`, `dist/SMAX_SELF_OFFLINE.html`의 **실제 디스크 SHA256/bytes** 기록. 동일 소스 HEAD라면 위 인메모리 SHA/byte와 대조해야 하며 차이가 나면 출고 중단·원인 분석. 이 보고서 값을 디스크 해시로 그대로 복사해 PASS라 하지 않는다.
2. 그 **동일 디스크 파일**로 `npm run qa:browser:node` 실제 Chromium `file://` 10종 E2E(새 인코딩 거부 테스트 포함), HTTP(S) 요청 0, JS 오류 0.
3. Windows 실기기 Edge/Chrome `QA_SELF_WINDOWS.cmd /edge` 수행. Node 없이 일반 구매자가 HTML 파일만 열 수 있는지 사용성/다운로드 위치 확인.
4. 위 1~3·라이선스/업데이트/환불·상품 정체성/브랜드 검수 후 사용자 **별도 출시 승인**. 사용자가 승인하지 않은 Cloudflare 공개, 크몽 등록/판매/고객 데이터 업로드/외부 유료 호출은 금지.

실제 지금 회전은 **코드 변경 없는 릴리스 신뢰성 증거 확보**이다. 이전 V8 모의 SHA 기록은 이 기준과 혼동 금지. 2026-11-07 개발 상한 유지.
