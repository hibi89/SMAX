# SMAX² 3브랜치 통합·패키징 사전 검수 (읽기 전용)

기준: 2026-10-27 KST. 본 문서는 소스/브랜치 상태 증거이지 Git 병합·실기기 출시·판매 완료 기록이 아니다.

## 1. 검증한 원격 커밋과 공통 조상

- Private `hibi89/SMAX` 확인.
- `main`: `3ec3698551686b0ddee8e4e5ac217517a6b1f7ed`.
- `frontend`: `3f70f430877bae250fb8111d4ffa9179281dfc2e` (이 문서 작성 직전의 감사기능/회귀 커밋 스냅샷; 문서 기록 이후 HEAD는 별도 재조회).
- `backend`: `5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868`.
- 셋의 공통 merge-base: `989cec1497e530f5547346bc341e7e92373f9910`.
- GitHub REST read-only Git tree `?recursive=1` 조회: base 36, main 42, frontend 79, backend 45개의 blob(소스+문서)이며 응답 `truncated=false`. 실제 Git blob SHA 기반 분류.

## 2. 분기점 이후 경로별 변경 범위

| 분류 | 변경 경로 수 | 조치 |
|---|---:|---|
| main 전용 | **8** | 사업·디자인·RAG 전략 원본 누락 없이 보존 |
| frontend 전용 | **42** | 로컬 SELF·QA·공개/비공개 분리 기능 유지 |
| backend 전용 | **2** | 엔진 계약 문서 보존 |
| main+frontend | **2** | `site/index.html`, `site/styles.css` 시각/UX 양쪽 검토 |
| main+backend | **0** | 해당 범주의 중복 변경 없음 |
| frontend+backend | **8** | 5개 동일 SHA, 3개 서로 다름 |
| 3브랜치 모두 | **3** | `CHAT_BOOTSTRAP.md`, `HANDOFF.md`, `STATUS.md` 모두 보존·재정리 필요 |

**주의:** 서로 다르게 수정된 경로가 있다는 사실은 Git이 실제 충돌을 냈다는 뜻이 아니다. 실제 merge/충돌 재현은 하지 않았다. 이 단계의 상태는 `REVIEW_REQUIRED`.

### SHA가 동일한 공통 경로 5개
- `site/csv-transform.mjs` (frontend/backend Git blob `68b6e6778b1946319a2867a45fa273c84d34fca0`)
- `site/sales-report.mjs` (blob `05578b300b2d7c2f0b653a485ac9c2c859ea055e`)
- `tests/csv-hardening.test.mjs`
- `tests/csv-header-safety.test.mjs`
- `tests/csv-property.test.mjs`

### 한쪽 것으로 덮어쓰면 안 되는 경로 8개
- 3브랜치 동시 변경: `CHAT_BOOTSTRAP.md`, `HANDOFF.md`, `STATUS.md`.
- main/frontend 변경: `site/index.html`, `site/styles.css`.
- frontend/backend 변경: `site/core.mjs`, `tests/csv-transform.test.mjs`, `tests/sales-report.test.mjs`.

`frontend/site/core.mjs`는 가이드 검토상태/CSV preflight 등 확장된 UI 처리 계약을 포함하지만 `backend/site/core.mjs`는 보다 이른 파서를 기반으로 하므로 본문 복제·역방향 병합하지 않는다. 공통 CSV 변환/매출 실제 함수 두 개는 이미 동일한 blob으로 정렬되어 있다.

### main 전용 문서 8개 (보존 필수)
1. `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md`
2. `docs/BUSINESS_VIABILITY_LIMITATIONS_AND_VALIDATION_20261025.md`
3. `docs/DESIGN_APPROVAL_DEFERRED_WEB_FIRST_20261025.md`
4. `docs/LOGO_LOCKUP_20261025.md`
5. `docs/NAON2_DUAL_FORM_AND_LOGO_DESIGN_DECISION_20261025.md`
6. `docs/RAG_STUDIO_AX_EDITION_MASTERPLAN_20261026.md` (**이전 7개 목록에서 누락됐던 신규 8번째 원본**)
7. `docs/SMONGI_PRIMARY_MASCOT_DECISION_20261025.md`
8. `docs/STECHONG_CANONICAL_CONTEXT_20261025.md`

## 3. 패키징 경계 정적 검토 결과

- `frontend/wrangler.jsonc`: 공개 Cloudflare assets 경로 `./public-site` 확인. `site/`/ `dist/`로 변경하지 않았다.
- `frontend/public-site/index.html`: 실제 원격 파일에 `<script>`, `<input>`, HTTP(S) URL이 없음을 문자열 점검. 공개 미리보기 정적 자산만으로 현재 유료 로컬 코어를 실행할 수 없도록 하는 경계 설계를 유지. **실제 배포 미실행, HTTP 응답·실 브라우저 검증은 미확인**.
- `frontend/.gitignore`: `/dist/`, `/node_modules/`, `/.env` 및 하위 환경파일 무시 규칙 존재.
- `frontend/scripts/build-self.mjs`: private 5모듈을 오프라인 HTML로 조립, CSP script/style SHA256 삽입 및 `connect-src 'none'`. 디스크로 실제 빌드/실 Windows 해시 검증한 것은 아님.
- `frontend/scripts/qa-release.mjs`: 현재 테스트 파일 15개와 필수 manifest 15개 일치·불일치 시 fail-closed, JS/CSS CSP 확인·합성 2기능 예제 계약·실패 시 옛 산출물 삭제 로직. 테스트가 작성되어 있다는 사실과 최신 전체 실행 PASS는 구별.
- `.github/workflows/self-ci.yml`: `workflow_dispatch` 수동 트리거, private 소스 읽기 전용, Node 22 전체 QA. 최신 Actions 성공 기록은 없음. 승인 없는 재실행/비용 부담 금지.

## 4. 구현·검증한 read-only 3브랜치 검사 도구

- 기존 `scripts/qa-branch-reconcile.mjs`의 `reconcile()` 2브랜치 API·CLI 기본값 보존.
- 신규 `reconcileThreeWay()`와 `--backend`·`--expect-backend` 선택 옵션. 세 쌍의 merge-base가 다르거나 기대 SHA가 변했으면 차단. 실제 Git 리포지토리를 fetch/checkout/merge/rebase/push하지 않음.
- V8 fake-Git 호출 테스트에서 `mainOnly`, `mainFrontend`, `frontendBackend`, 동일 SHA, SHA drift, read-only 명령 검증.
- GitHub 실제 네 Git tree의 원본 blob SHA를 mock `git ls-tree` 결과로 주입해 동일 검사 함수 재실행: 위 **8/42/2/2/0/8/3 경로 분류**, **동일 5/서로 다른 8**, `REVIEW_REQUIRED`, `mergePerformed:false`, `releaseApproved:false` 재현. **GitHub 원격 나무의 정확한 소스 해시는 확인했지만 이 실행은 실제 Native Git/Node CLI 실행이 아님**.
- `tests/qa-branch-reconcile.test.mjs`: 임시 Git 레포 기반 3브랜치 분류·SHA drift·기존 API 호환성 회귀 테스트 코드를 추가. 최신 Node 테스트 전체 PASS는 미검증.

## 5. 2안 비교 및 다음 절차

| 선택 | 장점 | 위험·비용 | 판정 |
|---|---|---|---|
| A. frontend SELF를 우선 단독 출고 QA, 이후 승인된 통합 브랜치에서 main 전략 원본을 선택 병합 | 실제 판매 가능 제품 검증 속도·기존 사업 원본 보존, 추가 과금 0원 | 장기간 분기 차이 관리 필요 | **추천** |
| B. 지금 main에 frontend/backend를 일괄 병합 | 브랜치 정리 빠름 | 8개 다른 경로 및 main-only 8개 원본 누락·제품 회귀 가능, Native QA 근거 없음 | **현재 금지** |

추천 검증 순서: 최신 Private frontend checkout의 `npm run qa:release` → 생성된 HTML SHA·CSP 기록 → 동일 아티팩트 Chromium `file://` → Windows Edge/수동 UX 1회 → `main` 전용 8문서 및 8차이 경로 개별 검토 → 사용자 승인된 격리 통합 PR → 1차 출시 판정. 2026-11-07 14달력일 상한, 미승인 유료 API/고객자료 전송/마켓 판매·사이트 공개 금지.

재현용 읽기 전용 명령(개발자 로컬에 **이미** GitHub Private 접근과 적법한 최신 fetch 권한이 있는 경우):

```powershell
node scripts/qa-branch-reconcile.mjs --main origin/main --frontend origin/frontend --backend origin/backend --expect-main 3ec3698551686b0ddee8e4e5ac217517a6b1f7ed --expect-frontend <호출 시점의 실제 frontend HEAD> --expect-backend 5ec4a526b8d1ca90f7e2e4f846cee8cab6a7c868
```

위 예의 frontend 기대 SHA는 **실행 시 재확인**해야 한다. 이 검사는 머지·배포·판매를 수행하지 않는다.
