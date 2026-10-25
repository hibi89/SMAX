# SMAX² SELF — 실제 오프라인 Chromium 브라우저 E2E 통과

검증일: 2026-10-25 KST · Private `hibi89/SMAX` / `frontend` · **Linux ARM64 Chromium 156.0.8078.4**.

## 실제 검증 성적
- 검증 파일: `dist/SMAX_SELF_OFFLINE.html` (격리 Node.js 22.23.4 빌드에서 생성된 정확한 SELF 오프라인 HTML).
- **SHA-256:** `94af78b4eaade494264b25e04f7516f493b405a7020643ff8f7756718a091cca`
- **73,352 bytes.** 최신 스몽이 카피를 포함한 버전.
- Playwright Chromium 실 브라우저에서 `file://` 직접 열기 성공. **오프라인 브라우저 컨텍스트** (`setOffline(true)`) 사용.
- CSV 합성 샘플 `examples/SMAX_SELF_SAMPLE.csv` 직접 업로드 → 열 3종 수동 선택 → 중복/날짜 오류 `NEEDS_REVIEW` 2행 및 원본 4행 보존 확인.
- 브라우저 다운로드 이벤트로 `SMAX_STANDARDIZED.csv` 파일을 실제 수신하여 **UTF-8 BOM**, 다운로드 파일명, 결과 헤더+4행, 검토 2행 확인.
- 중복 열 재매핑 시 다운로드 버튼 소멸/실행 불가. 375px 모바일 너비에서 CSV 업로드 컨트롤 유지.
- **브라우저 JavaScript·콘솔 오류 0건, 외부 HTTP(S) 요청 0건** 관측.
- **가이드 10종 각각** 별도 오프라인 브라우저 컨텍스트에서 JSON 설계서와 Markdown AI 구축 가이드를 다운로드. **총 20건 다운로드 성공**, 파일명·해당 templateId·`NEEDS_REVIEW`·개인정보/검증 문구 확인. 1개 컨텍스트에서 연속 자동 다운로드 10회 후에는 Chromium 자체 연속 다운로드 제한을 관측해 각 템플릿 별도 컨텍스트로 검증했음.
- 같은 절차를 재현하는 새 `scripts/qa_browser.mjs` 원본 Git SHA를 검증한 뒤 **`node scripts/qa_browser.mjs` 실제 실행, 종료 코드 0, 7개 확인 항목 PASS**.

## 환경 차단 해결
기존 Chromium v1248 실행 실패는 Linux ARM64 격리 컨테이너의 GLib/NSS/X11 등 시스템 공유 라이브러리 및 Fontconfig 렌더링 구성 부족 때문. Debian 패키지 71개를 **임시 `/tmp`에만 다운로드·추출**, `LD_LIBRARY_PATH` / `FONTCONFIG_PATH` 지정해 Chromium 실행. 프로젝트 원본 디렉터리·서비스 런타임 패키지/계정은 수정하지 않음. Firefox 및 Windows Chrome/Edge에서 결과가 동일하다고 추론하지 말 것.

## 개발자 재현
```bash
npm run qa:release
npm install --no-save --no-package-lock playwright
npx playwright install chromium
npm run qa:browser:node
```
Windows Edge 설치 환경에서는 `npm run qa:browser:node -- --channel msedge`로 별도 검증. 기존 Python 기반 `scripts/qa_browser.py`는 그대로 제공.

## 정확한 출시 판정
- **Linux Chromium 오프라인 브라우저 E2E: PASS**, Node 전체 QA: 34/34 PASS.
- **Windows 실제 PC의 Edge/Chrome 호환성: NOT_RUN**. Windows 더블클릭/보안 정책·다운로드 경고/한글 Excel 표시도 아직 확인되지 않음.
- 로고/마스코트 세부 디자인은 최신 창업자 결정에 따라 잠정 시안, UI/상품 설명 승인 보류. **크몽 등록·판매/공개 Cloudflare 배포·비용 지출 없음.**
- 최종 개발 상한: 2026-11-07. 목표: 2026-10-27 1차 완제품 후보.
