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

## Cloudflare 정적 배포 준비
- 이 저장소는 **Private**이다. 실제 Cloudflare 계정의 GitHub 저장소 접근 권한과 Cloudflare 생성/배포 승인이 필요.
- `wrangler.jsonc`는 Workers Static Assets 구성이며 빌드 없이 `./site`를 제공한다.
- Cloudflare 대시보드 Workers & Pages → Create → GitHub 저장소 연결 → 루트 `wrangler.jsonc` 읽기 → 배포.
- 배포 시 생기는 `<worker>.<account>.workers.dev` URL은 프로젝트 이름·주소를 유지하는 동안 콘텐츠를 업데이트해도 같은 주소로 접근 가능. 공개 도메인 연결은 별도 결정.
- 실제 크몽 상품 링크가 등록되기 전 홈페이지에는 구매 버튼 대신 준비 중 표시가 유지된다.

## 개인정보와 마케팅
- 브라우저에서 읽은 CSV는 브라우저 메모리에서만 처리. 외부 서버로 전송하는 fetch/XMLHttpRequest 코드가 없고 CSP connect-src 'none'이다.
- API 0원은 **SMAX 자체 필수 AI API 호출**에 대한 설명이며, 고객이 선택한 외부 AI·도구 비용은 별도.
- 무료 요청 기능은 실제 수신·저장 구현 전 '준비 중'으로 표시.
- 홈페이지 내용은 기획/검증 상태에 맞게 유지. 템플릿 10종이 모두 실제 자동화 실행까지 검증되었다고 홍보하면 안 됨.
