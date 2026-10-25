# SMAX² SELF — `main`·`frontend` 안전 통합 검수 (비병합)

날짜: 2026-10-25 KST. **작업 상태: `REVIEW_REQUIRED`, 합병·출시 승인 아님.** GitHub Private `hibi89/SMAX`; 실제 API 비교/공통 조상·Git blob 트리를 읽어 작성했다.

## 1. 실제 브랜치 차이
- 현재 기준: `main` HEAD `952bc586c132066d84e5a29e5b10254120b35f14`, `frontend`는 코드/검사 갱신 중(실제 최신 HEAD 매 작업 재조회), 공통 조상 `989cec1497e530f5547346bc341e7e92373f9910`.
- GitHub `compare/main...frontend` 읽기 전용 조회: `diverged`, **frontend ahead 194 commits / behind 43 commits** (검사 스크립트와 QA 등록까지 커밋된 뒤 관측). 이 숫자는 "완료율"이나 실제 Git 충돌 개수가 아니다.
- 공통 조상과 각 브랜치의 Git tree를 **blob SHA**로 비교한 결과(검사 도구 신규 커밋 전 기준): `main` 변경 12개, `frontend` 변경 49개, **양쪽 서로 다른 변경 5개**, `main` 전용 7개, `frontend` 전용 44개. 신규 `frontend` 전용 테스트/스크립트/QA 등록 3개 커밋으로 전체 `frontend` 파일 개수는 증가했지만 아래 양쪽 교집합 5개는 그대로. 파일이 양쪽에서 변경됐다는 사실은 자동 병합 충돌 확정과 다르다.

## 2. 사람 검토가 필요한 동일 경로 5개

| 경로 | 보존·검토할 내용 |
|---|---|
| `CHAT_BOOTSTRAP.md` | `main`의 **사업성·수요검증·스몽이 최신 결정**과 `frontend`의 **실제 테스트/배포 경계/인수인계** 양쪽 보존. 한쪽으로 덮어쓰지 않기 |
| `HANDOFF.md` | `main` 사업 검증 및 사용자 결정 + `frontend` 실행 테스트/제품 운영 상태 모두 살리되 이전 버전 중복은 **근거 비교 후** 정리 |
| `STATUS.md` | 사업 실적 `ZERO_VERIFIED`와 기술 QA `NOT_RUN` 등을 사실에 맞게 병기. V8 계산을 실제 Node/Windows E2E로 오표기 금지 |
| `site/index.html` | `main`의 최신 브랜드 결정(스몽이 **이름만 확정, 상세 디자인 보류**)과 `frontend`에서 만든 로컬 SELF 작업 화면/정확한 기능 표시 공존 |
| `site/styles.css` | 양쪽의 UI 개선을 실제 PC·모바일 화면으로 비교, 무작정 덮거나 디자인 완료 판정하지 않기 |

동일 파일의 비슷한 내용이라도 `main` 쪽 문서 변경과 `frontend` 쪽 구현·안전 개선은 **서로 다른 승인/검증 맥락**을 가진다.

## 3. `main` 전용 수정 7개 (보존 필수)
- `docs/BRAND_MACCONG_AND_AUDIENCE_ENTRY_20261025.md`
- `docs/BUSINESS_VIABILITY_LIMITATIONS_AND_VALIDATION_20261025.md`
- `docs/DESIGN_APPROVAL_DEFERRED_WEB_FIRST_20261025.md`
- `docs/LOGO_LOCKUP_20261025.md`
- `docs/NAON2_DUAL_FORM_AND_LOGO_DESIGN_DECISION_20261025.md`
- `docs/SMONGI_PRIMARY_MASCOT_DECISION_20261025.md`
- `docs/STECHONG_CANONICAL_CONTEXT_20261025.md`

일부 파일은 **이전 시안의 역사 기록**이다. 정확한 최신 사용자 결정은 `main/docs/SMONGI_PRIMARY_MASCOT_DECISION_20261025.md`의 *이름만 확정·고양이 귀 로봇 참고·상세 디자인 보류*와 사업 검증 제한을 우선한다. 문서 보존이 시안 구현/판매 승인을 의미하지 않는다.

## 4. 읽기 전용 재현 도구
- Private `frontend/scripts/qa-branch-reconcile.mjs`는 로컬 Git refs만 읽어, 공통 조상/파일별 blob SHA 기준의 `mainOnly`, `frontendOnly`, `sharedChanges`, `sameChanges` JSON과 명시적 `releaseApproved:false`·`mergePerformed:false`를 보고한다.
- **Git ref를 fetch/checkout/merge/push/rebase하지 않는다.** 기존 Git repo와 브랜치가 준비된 개발자 환경에서 사용자/작업자가 **먼저** read-only fetch 등으로 ref를 최신화하고 다음 실행:
```powershell
git fetch origin main frontend
node scripts/qa-branch-reconcile.mjs --main origin/main --frontend origin/frontend
```
- **exit 2 / `REVIEW_REQUIRED`** = 동일 파일 경로의 양쪽 변경 발견; 사람이 내용을 비교해야 한다는 뜻이지 자동 병합이 이미 실패했다는 뜻 아님. **exit 0 / `NO_SHARED_CHANGE_REVIEW`** = 같은 경로에서 서로 다른 blob 변경이 없다는 뜻일 뿐 병합·출시 승인 아님. **exit 3 / `BLOCKED`** = Git ref가 없거나 지정된 SHA가 달라 신뢰할 수 없음.
- SHA 드리프트 방어용: `--expect-main <실제 GitHub HEAD>` 및 `--expect-frontend <실제 GitHub HEAD>` 사용 가능. 이전 채팅에 저장된 SHA를 고정 재활용하지 않는다.
- QA 출고 단계 `npm run qa:release`의 검사 목록에 신규 `tests/qa-branch-reconcile.test.mjs`를 추가(읽기 전용 검사기의 합성 Git 기록 동작만 검사, 실제 저장소 merge 실행하지 않음).
- 실제 실행 근거: **Node.js v22.16.0 `node --test tests/qa-branch-reconcile.test.mjs`: 3 PASS, 0 FAIL** (임시 Git repo 3경로: 겹친 파일/독립 문서 보존, 서로 겹치지 않는 변경, 기대 SHA 불일치). 로컬 `git hash-object`와 Private GitHub blob **1:1 일치**: 스크립트 `8f1cd8428881118d93b6bd55685efbb83654b8ad`, 테스트 `0379a92e3e30dcbcf1f6c6fe1ed2845e1b24092b`. 이 테스트 3개를 *제품 전체 Node QA 통과*로 착각하지 않는다.

## 5. 권한 게이트 및 다음 순서
1. **우선 현재 `frontend` 제품 자체를 실제 `npm run qa:release` exit0로 검증**, 새 디스크 HTML SHA·CSP/합성 CSV·매출 증거 확인. 현재 프라이빗 소스 checkout이 연결 컨테이너 DNS에서 차단되어 실제 전체 최신 Node 테스트 **NOT_RUN**.
2. 동일 디스크 HTML로 Chromium `file://` E2E 및 Windows Edge 실기기 검수. 현재 최신 출고 버전 **NOT_RUN**.
3. 1~2단계가 통과한 **후에만**, `main` 기반 별도 검토 브랜치를 만들어 `frontend` 내용을 보존하며 5개 공유 경로를 사람 검토 후 통합. 실제 push/merge를 스총이 임의 수행하지 않으며 사용자 승인 여부를 확인한다.
4. 판매·공개 Cloudflare/`public-site`·크몽 상품 등록/라이선스·지원/환불 조건은 사용자 별도 승인. 유료 `site/` 및 `dist/`를 public로 내보내지 않는다. **2026-11-07 개발 상한** 유지.

**결론:** 지금 상태는 **`REVIEW_REQUIRED`**, 병합/출시 검증 전이다. `main`을 `frontend` 전체로 덮어쓰거나 `frontend`를 `main`으로 단순 리셋하지 않는다.
