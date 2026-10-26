# SMAX² SELF — 릴리스 소스 잠금·브라우저 QA 인수인계 (2026-10-27 KST)

## 문제 및 선택

여러 AI 또는 로컬 작업자가 동일한 Private `frontend` 작업폴더를 갱신하는 동안 `npm run qa:release`의 `node --test`와 `scripts/build-self.mjs`가 실행되면, 테스트된 소스와 HTML을 묶을 때의 소스가 달라질 수 있었다. 이전 버전은 생성된 HTML 자체의 SHA/CSP는 확인하지만 **테스트 시작-릴리스 보고 직전 소스 동일성**은 검사하지 않았다. 이를 해결하기 위해 읽기 전용 SHA-256 소스 스냅샷을 적용했다.

## 구현 및 릴리스 계약

- `scripts/qa-source-snapshot.mjs`: `site/`, `scripts/`, `tests/`, `public-site/`, `examples/`, `package.json`, `wrangler.jsonc`, `QA_SELF_WINDOWS.cmd` 전 파일의 원시 바이트 SHA-256과 상대 경로를 합성해 하나의 snapshot SHA-256, 파일 수를 계산한다. 일반 파일/디렉터리 외의 파일형식 및 심볼릭 링크는 읽지 않고 실패시킨다. `dist/`, `node_modules/`, 고객자료는 읽지 않는다.
- `scripts/qa-release.mjs`: 전체 테스트 시작 전 snapshot A → 전체 Node 테스트 → SELF HTML 빌드/CSP/공개경계/합성 CSV 및 매출 검증 → 보고 직전 snapshot B. 내용·파일 수 변경 시 `RELEASE_QA_FAILED`와 실패 보고서 기록, `dist/SMAX_SELF_OFFLINE.html` 삭제. 정상 시 QA 보고서에 `sourceSnapshotSha256` 및 `sourceFileCount`를 기록한다. 필수 `*.test.mjs` 16개/실제 파일 16개 일치 검사 포함.
- `scripts/self-qa-integrity.mjs`: 브라우저 검증 전 보고서의 snapshot SHA가 소문자 64자리 16진수이고 파일 수가 양의 안전 정수인지 요구. 이전 보고서, 스냅샷 누락, 문자열/음수/소수 파일 수를 거부한다. 기존 실제 HTML SHA-256·바이트 수 확인도 유지.
- `scripts/VERIFY_SELF_WINDOWS.ps1`: Node QA 후 실제 파일 SHA 비교 전에 snapshot 증거를 확인한다. PowerShell JSON 정수는 환경에 따라 Int32/Int64일 수 있어 양쪽 형식을 허용하되 비정수 문자열은 허용하지 않는다. 이후 Edge 검사와 수동 사용성·판매 승인 분리는 그대로 유지한다.
- `tests/windows-qa-contract.test.mjs`: 신규 snapshot 함수를 필수 목록 검사 테스트의 격리 호출에도 전달해 기존 계약 테스트가 정확히 작동하도록 정정.

## 직접 실행 증거

- **실제 Node v22.16.0**의 독립 디스크 임시 fixture에서 신규 `tests/qa-source-snapshot.test.mjs` 5개와 기존 `tests/self-qa-integrity.test.mjs`에 2개를 추가한 테스트 10개를 묶어 **총 15/15 PASS, FAIL 0**. 여기에는 동일 입력 반복 해시, 작업 도중 기존 소스 변경, 새 파일 추가, symlink, 누락 입력, 잘못된/옛 QA 보고서가 포함된다.
- 위 실행은 체크인 변경과 동등한 모듈/테스트 소스만 임시 폴더로 구성한 **격리 Native Node 범위**이다. 저장소 전체 16개 테스트 파일, 실제 `npm run qa:release`, 브라우저/Windows Edge, 디스크 출고물 QA 성공이라고 주장하지 않는다.
- 최신 GitHub 원격 코드 검수: 필수 테스트 **16개**, 실제 파일 **16개**; snapshot A/B 호출·report 필드·브라우저 verifier·Windows 검사 연쇄 연결 확인. PS1 복구 검증 시 이전 원본 blob `3bc6e82535cc52df9d8b0d0b957aeed4129501e8`을 가져와 신규 검사 블록만 추가한 것과 나머지 모든 문자 **일치**하는지 비교했다.
- 작성 중 PowerShell 변경 도구의 문자열 치환 특성 때문에 파일이 중복되는 이상을 원격 재조회에서 발견하여 즉시 원본 blob을 이용해 복원하고, 코드 블록을 안전하게 재삽입한 최종 커밋 `809937d6a775b5d79f6d8f27f91009e93f548811`. **복구 이전 버전은 사용 금지**, 최신 frontend만 기준으로 삼는다.
- GitHub Private 전체 checkout이 현재 실행 환경에서 불가능한 문제는 해결되지 않았다. Native 전체 Node QA·실 디스크 SHA/CSP·실 Chromium/Edge `file://`·Windows 수동 QA = **NOT_RUN**. 테스트/유닛 실행은 출시 승인이 아니다.

## 복원과 다음 작업

- 새 helper: `30db3e8ee605afee24103bbb9d95d0b60a10bc9d`. 새 5개 테스트: `641464fc28a6a0acc2c18c9792f8c13929dce1e0`. 릴리스와 보고서: `ef96794110c83b8540dffb35bc2a8cfe5dd8d043`.
- 브라우저 검증기: `5f4352523ce6a642087ad77a08d6b0c19c17be03`; 검증 테스트 추가: `cac441885859097b9a4edcd44ed202203a64b45d`. Windows QA 복구 최종: `809937d6a775b5d79f6d8f27f91009e93f548811`. Windows 계약 최신화: `9cbadc174313884f8c91097b53e50bc59c7d6e53`.
- `main`/`backend` 미수정. `public-site/` 배포 경계, `site/` 비공개 제품, 고객 원본 미사용, GitHub Actions 무단 재실행/유료 비용/크몽 판매/Production 배포 없음.
- **다음 우선:** 정확한 최신 Private checkout을 가진 실제 개발기에서 `npm run qa:release`를 한 번 실행해 exit 0과 `dist/SELF_QA_REPORT.json`의 `sourceSnapshotSha256`/HTML SHA·크기를 확인. 그 정확한 아티팩트로 Chromium `file://`와 Windows `QA_SELF_WINDOWS.cmd /edge`, 수동 사용성 검증. 출시/통합/판매는 별도 승인. 2026-11-07 개발 마감 유지.

**주의:** SHA 스냅샷은 **빌드 입력 변경 감지 수단**이지 서명·공급망 인증이나 모든 외부 통신 차단을 보증하지 않는다. 다른 브랜치나 파일을 덮거나 삭제하지 않는다.
