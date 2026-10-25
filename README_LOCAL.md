> **2026-10-25 최신 보안·QA 정정:** 최근 `frontend` 패치에서 비 UTF-8(CP949 등) CSV 파일을 브라우저 로컬 디코딩 단계에서 조기 거부하도록 강화했습니다. 잘못된 바이트를 자동 변환하거나 손상된 텍스트로 보고서를 만들지 않습니다. `tests/csv-ui.test.mjs`, `scripts/qa_browser.mjs` 검사 코드 업데이트. 변경 후 실제 전체 Node release QA / 신규 HTML SHA / 실 Chromium·Windows Edge는 **NOT_RUN**이므로 아래 기존 PASS 수치는 과거 빌드 한정입니다. 자세한 근거는 `STATUS.md`·`HANDOFF.md` 최신 섹션.

> **최신 검증 — 2026-10-25 KST:** 실제 Node 22.23.4 전체 `34/34 PASS`; `npm run qa:release` 성공. 최신 SELF HTML **73,352 bytes**, SHA-256 `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca`. 실제 **Linux ARM64 Chromium 156 오프라인 file:// 브라우저 E2E PASS**: 4행 CSV 변환/다운로드, 2행 검토, 모바일 컨트롤, 10종 설계서+가이드 **20개 다운로드**, JS 오류/HTTP 요청 0. **Windows 실기기 Edge/Chrome 테스트는 아직 미실행**이며, 크몽 판매/Cloudflare 공개/디자인 최종 승인은 보류. 근거 `docs/QA_REAL_CHROMIUM_E2E_20261025.md`.

## 실제 브라우저 QA 재현 (개발자 전용)
```bash
npm run qa:release
npm install --no-save --no-package-lock playwright
npx playwright install chromium
npm run qa:browser:node
```
Windows Edge 별도 검증: `npm run qa:browser:node -- --channel msedge` (Edge 설치 필요). 이 명령은 고객이 사용하는 SELF HTML에 Node/Playwright 설치를 요구하지 않음.

# SMAX D1 — local-first prototype

2026-10-25 첫 구현. 개발 상한: 2026-11-07.

## 지금 실제로 되는 일
- 10종 템플릿 카탈로그, 한국어 키워드/동의어/예시 기반 유사도 검색
- 템플릿 패널 / 규칙 기반 단계 질문(챗봇처럼 보이나 LLM 아님)
- CSV 파일 로컬 헤더 분석, 사용자 수동 표준 필드 매핑
- **엑셀·CSV 통합 템플릿** 선택 시에 한해 CSV 원문을 브라우저 메모리에 보관하여 거래일/상품명/금액 실제 변환 → 검토행 표시 → 최대 5행 미리보기 → `SMAX_STANDARDIZED.csv` 다운로드. XLSX는 여전히 미지원이며 다른 9종은 설계 가이드 초안.
- `AX_BLUEPRINT_*.json` 및 `AI_BUILD_PROMPT_*.md` 브라우저 내 생성/다운로드
- 저장소의 `tests/core.test.mjs` Node 20+ 회귀 검사

## 아직 안 되는 일
- XLSX 원본 파싱, 임의 업무 자연어 완전 이해, 외부 AI/메일/ERP/Gmail/n8n API 자동 연동, 실제 자동화 실행
- 고객 파일의 서버 업로드 (의도적으로 지원 안 함), 라이선스/판매/정산/크몽 실제 등록
- Windows 독립 실행 파일 패키징 및 실 Windows 호환 검증, 공개 Cloudflare 배포
- 무료 템플릿 요청 온라인 제출·통계 인기 순위 (준비 중)

## 로컬 실행
1. Node.js 20+ 환경에서 `npm test` (신규 CSV UI 테스트 포함). GitHub connector 작업에서는 Node 실제 실행이 아직 검증되지 않았으므로 사용 전 직접 실행해서 결과 확인.
2. Python 설치된 환경에서 저장소 루트에서 `python -m http.server 8788 -d site` 실행.
3. http://localhost:8788/ 를 브라우저에서 열기. ES modules 로드 때문에 file:// 직접 실행 권장하지 않음.
4. 실제 회사 정보 대신 테스트 데이터 사용. CSV는 2MB 이하, XLSX 미지원. `엑셀·CSV 통합` → `챗봇 패널` → CSV 파일 업로드 → 원본 열 3개(거래일/상품명/금액) **직접 선택** → `변환·미리보기` → 검토사유 확인 → 결과 다운로드. 기존 원본 파일을 덮어쓰지 않음. 매핑/파일 변경 또는 다른 템플릿 선택 시 이전 변환 결과 초기화.

## SELF 단일 HTML 패키지 빌드 — 개발자 전용 (2026-10-25)
1. 소스가 최신인지 확인하고 **Node.js 20+에서** `npm test` 전체 실행. 실 테스트 실패가 있다면 배포하지 말 것.
2. `npm run build:self` 실행 → `dist/SMAX_SELF_OFFLINE.html` 단일 파일 생성 예정. 원본 `site/` 수정 없음. `dist/`는 Git 추적 제외.
3. 생성된 파일 SHA-256·크기 확인 후 실제 Windows Edge/Chrome에서 파일을 직접 열어 CSV 업로드/매핑/미리보기/다운로드를 검증할 것. 출시 승인 전에는 고객에게 전달하지 말 것.
4. **고객은 위 파일을 받아 더블클릭 사용**(별도 Node/Python 미설치 목표). 이는 아직 실제 Windows QA로 입증되지 않았으므로 문서상 목표이며 확정 판매 기능 아님.
5. 합성 자료 `examples/SMAX_SELF_SAMPLE.csv`, 안내문 `docs/SELF_CUSTOMER_QUICKSTART_20261025.md`, 빌드 설명 `docs/OFFLINE_SELF_PACKAGE_20261025.md` 참고.
6. HTML 안에는 실행 JS가 그대로 포함된다. 저작권/사용권 통제나 무단복제 방지는 현재 구현되지 않음. 공개용 Cloudflare에 이 패키지/유료 `site/`를 올리지 말 것.

## 단일 명령 로컬 출고 점검 (Windows·macOS·Linux 개발자용)

- **`npm run qa:release`** 한 명령으로 Node 전체 테스트(`node --test`) → `dist/SMAX_SELF_OFFLINE.html` 오프라인 HTML 생성 → SHA-256 CSP·공개/유료 경계·합성 CSV 4행/검토 2행 확인.
- 결과물: `dist/SELF_QA_REPORT.json`. 검사 실패 시 `status: FAIL`로 기록하며 명령 종료 코드가 1이 된다. `LOCAL_NODE_PASS_BROWSER_NOT_TESTED` 상태도 **Windows·실브라우저 검증 및 판매 승인과는 별개**다.
- Windows 경로에 `/`을 강제하던 기존 문제를 고쳐 `dirname(out)`으로 검사한다. 전체 테스트도 Windows 셸 와일드카드에 의존하지 않고 `node --test` 자동 검색을 사용한다.
- 실제 고객 판매 전에는 추가로 `npm run qa:browser` 또는 Windows Edge `python scripts/qa_browser.py --channel msedge` 실검증 기록이 있어야 한다. 전산 정책이 브라우저 실행을 차단하면 `BLOCKED`로 처리하고 완료라고 표시하지 않는다.
- `dist/`는 비공개 개발 산출물로 GitHub와 Cloudflare 공개 위치에 올리지 않는다. 자동 검사 결과는 판매 승인·라이선스·고객 지원 조건을 대신하지 않는다.

## Windows에서 개발자 자체 검수 (더블클릭)

- PRIVATE `frontend` 저장소의 **`QA_SELF_WINDOWS.cmd`**를 더블클릭한다. 사용자에게 판매하는 프로그램이 아닌 **개발자 전용 검수 실행기**다.
- 내부적으로 `scripts/VERIFY_SELF_WINDOWS.ps1`이 Node 20+ / npm 유무를 확인하고 `npm run qa:release`를 실행한 뒤, `dist/SELF_QA_REPORT.json` 상태·HTML 파일의 SHA-256 및 실제 byte 크기를 대조한다.
- 성공하면 `dist/SMAX_SELF_OFFLINE.html` 경로와 해시를 표시한다. **성공도 브라우저 E2E/판매 승인까지 보증하지 않는다.** 실제 Edge/Chrome 검수는 아래 별도 절차로 진행한다.
- 실패하면 결과 화면에 `FAIL` 또는 `BLOCKED` 사유를 보여주며 제품을 배포하지 않는다. 실행 정책이 막는 경우 보안 정책을 무력화하지 말고 사용 가능한 승인된 개발 환경에서 검수한다.
- GitHub Actions 자동 실행은 이번 PRIVATE 저장소에서 실행 단계 로그 없이 종료 코드 실패가 관측되어 **수동 workflow_dispatch 전용**으로 보류했다. 원인은 아직 특정되지 않았으며 원격 CI PASS라는 주장 금지. 예외 없이 로컬 실제 결과가 출고 기준이다.

## 실제 Chromium/Edge 오프라인 E2E — 개발자 전용 검수

- 필수 선수조건: `npm test && npm run build:self`; 생성 산출물은 Private 로컬에서만 다룬다.
- Python Playwright 및 브라우저(별도 개발 QA 환경에서만) 설치:
  `python -m pip install playwright`
  `python -m playwright install chromium`
- Chromium: `python scripts/qa_browser.py` 또는 `npm run qa:browser`.
- Windows Microsoft Edge: `python scripts/qa_browser.py --channel msedge` (Edge 설치 환경).
- 합성 `examples/SMAX_SELF_SAMPLE.csv`로 `file://` 페이지 → 수동 3열 매핑 → 검토 미리보기 → UTF-8 BOM CSV 다운로드 → 4행 보존/검토 2행 → 변경 시 다운로드 폐기 → HTTP(S) 요청 0건을 확인. 개인·고객 데이터 사용 금지.
- 검수가 실패하면 `FAIL` 결과를 그대로 보존하고 배포하지 않는다. **현재 연결 실행환경에서는 Chromium 브라우저의 파일/localhost 탐색이 `net::ERR_BLOCKED_BY_ADMINISTRATOR`로 제한되어 이 환경에서 실제 브라우저 E2E를 통과했다고 주장할 수 없음.** 브라우저 자체의 접근정책에 의한 차단이지 SELF 제품 불량이라고 결론 내릴 수는 없다.
- Windows 현장 검증은 추가로 다운로드 위치, 로컬 파일 보안 경고, 한글·CSV 인코딩·모바일 표시 확인 필요. Playwright 설치·브라우저 설치는 **개발자 QA용**이며 일반 구매자에게 필요한 과정이 아니다.

## 공개 소개 페이지 / 유료 로컬 제품 분리 (2026-10-25)
- `public-site/index.html`: **고객에게 공개 가능한 내용만 담은 정적 쇼룸 후보**. 10종 소개, 실제 출시 전 표시. 별도 테스트·승인 전 공개하지 않음.
- `site/`: **PRIVATE SELF 제품 개발 파일**. CSV 실제 변환/설계서 실행 코드를 포함하므로 공개 정적 호스팅에 직접 올리지 않는다.
- `wrangler.jsonc`의 `assets.directory`는 안전한 `./public-site`만 지정. `tests/public-boundary.test.mjs`는 공개 자산·판매 문구를 회귀 검사. 이 설정을 `./site`로 되돌려 배포하지 말 것.
- `npm test`는 저장소 복사본의 **모든** 테스트를 실행하는 QA 명령. 이번 GitHub 커넥터 실행에서는 새로운 public-boundary 및 csv-ui 테스트의 실제 Node 실행이 아직 확인되지 않았다.
- 공개/유료 분리 전략과 승인 게이트: `docs/PUBLIC_PRIVATE_RELEASE_BOUNDARY_20261025.md`.

## Cloudflare 정적 배포 준비
- Private GitHub를 Cloudflare 계정에 연결하면 빌드 제공자에게 저장소 접근 권한이 부여되므로 **사용자 사전 승인** 후에만 수행한다.
- 공개될 정적 자산은 `./public-site`만이며, `site/`는 로컬 SELF 기능 코드로서 공개하지 않는다.
- 실제 Cloudflare 계정·Worker 프로젝트·URL은 아직 없고 상용 게시/도메인/크몽 상품 연결은 승인받지 않았다.
- Workers Static Assets의 정적 설정 후보는 `wrangler.jsonc`; 빌드·연동·게시 전 `npm test`, 실제 응답 헤더/브라우저/안전한 전달 경로 검증.
- 현재 크몽 상품 등록·심사 및 결제 없음. 구매 가능하다는 표현 금지.

## 개인정보와 마케팅
- 파일 변환 실행은 고객 PC 로컬을 전제로 하며 웹 공개 쇼룸은 실제 파일을 받지 않는다.
- 유료 모델/API 연결은 사용자가 사전 승인하지 않은 한 추가하지 않는다.
- 공개 페이지는 소개/검증된 일부 기능 사실만 표시한다. 10종을 모두 실제 자동화 완성형이라고 주장하지 않는다.
