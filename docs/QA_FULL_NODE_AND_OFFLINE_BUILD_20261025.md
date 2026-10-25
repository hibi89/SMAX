# SMAX² SELF — 전체 Node 실검증 및 단일 HTML 생성 성공 (2026-10-25 KST)

## 판정
**LOCAL_NODE_PASS_BROWSER_NOT_TESTED** — Node 전체 회귀와 SELF 단일 HTML 실제 생성·검증 성공. Windows Edge/Chrome 파일 열기·CSV 다운로드 E2E, 실제 판매/사용자 출고 승인 **미완료**.

## 시험 준비 / 원본 확인
- Private GitHub `hibi89/SMAX`의 `frontend` 최신 개발 브랜치에서 `site/`, `tests/`, `scripts/`, `public-site/`, `package.json`, `wrangler.jsonc`, `examples/` 등 **총 20개 파일**을 GitHub connector로 읽음.
- 연결된 **격리 Node 22.23.4 VM**의 임시 디렉터리에만 복사하고 파일마다 Git blob SHA-1 (`sha1("blob "+byteLength+"\\0"+content)`)을 원격 GitHub SHA와 비교해 **20/20 동일** 확인. 원본 개발 브랜치나 연결된 다른 프로젝트 소스를 수정하지 않음. 실제 고객정보·비밀번호·API 키·서비스 환경변수 미사용.
- 테스트 대상 실행 명령: `node --test` 및 `npm run qa:release`, 마지막으로 `node scripts/build-self.mjs` 재실행.

## 실 실행 결과
| 검증 | 실제 결과 |
|---|---|
| `node --test` 전체 suite | **33 PASS, 0 FAIL, 0 SKIP**, exit code 0 |
| `npm run qa:release` | **exit code 0**; 내부 전체 `node --test`도 33/33 PASS |
| `node scripts/build-self.mjs` | `OFFLINE_SELF_BUILT`; 실제 단일 HTML 파일 생성 |
| HTML 용량 | **73,341 bytes** |
| HTML SHA-256 | `093d1c8bff820369b664007fbecdd252a387b6cf354398247c754fb59b680563` |
| QA JSON | `LOCAL_NODE_PASS_BROWSER_NOT_TESTED` |
| QA JSON과 실제 파일의 SHA·바이트 대조 | **동일** |
| 재빌드 비교 | 동일 입력에서 **73,341 bytes / SHA 완전 동일**, 결과 파일 바이트 일치 |
| CSV 합성 샘플 | 4행 입력/4행 출력, 검토 필요 2행 PASS |
| 인라인 JS/CSS CSP·네트워크 금지 | 검사 PASS |
| 공개 `public-site/` / 유료 `site/` 경계 | 검사 PASS |

테스트 33건 세부 내용: 10종 템플릿/한국어 검색/설계서 검토, 날짜·금액 정규화와 다중행 CSV/중복/수식 보호, 경계회귀 및 256개 seeded synthetic CSV, 프론트 CSV 매핑·다운로드·지연 로드 초기화, bundleOfflineSelf의 단일 HTML/CSP/반복 빌드, 인라인 SELF VM E2E 5건, 공개 경계 및 마케팅 고지 3건.

## 아직 미검증인 출시 게이트
1. Windows 10/11 실제 Edge 및 Chrome에서 `file://` 경로로 HTML 더블클릭 실행·화면 표시·버튼/파일 업로드·결과 다운로드 테스트.
2. 실제 사용성: 가짜 CSV 4행을 직접 매핑·변환/오류행 확인, UTF-8 BOM의 Excel 표시, 로컬 PC 보안 프로그램/다운로드 경로/한글·모바일 화면 여부.
3. 실제 브라우저 Network/Console 검사에서 HTTP(S) 요청 0 및 오류 0 입증.
4. 최신 `main`의 로고/기타 변화와 비파괴적 통합; `main`/ `backend` 수정하지 않음.
5. 크몽 상품가격·사용권·지원·환불 및 최종 출시 승인. 현재 파일은 *개발 검증 산출물*이고 판매 시작/배포 금지.

## 추후 재현 방법
Private `frontend`에서 Node 20+ 설치한 개발자 환경:
```bash
npm run qa:release
```
출력: `dist/SMAX_SELF_OFFLINE.html`, `dist/SELF_QA_REPORT.json`; 두 파일은 `.gitignore`에서 제외해 GitHub에 업로드 금지.
Windows 로컬 개발자 검사는 `QA_SELF_WINDOWS.cmd`, Edge 검사는 `python scripts/qa_browser.py --channel msedge` (Playwright는 개발자 전용; 소비자는 설치할 필요 없음).

이 문서의 실제 Node 22.23.4 검증은 **Linux 격리 VM**에서 실행했다. Windows OS 실검증 성적이 아니며, 날짜 2026-11-07은 최종 마감 상한으로 유지하고 조기 품질 검증 시 조기 완료를 목표로 한다.
