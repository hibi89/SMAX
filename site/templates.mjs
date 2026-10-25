export const templates = [
  {
    "id": "spreadsheet",
    "title": "엑셀·CSV 통합",
    "category": "데이터",
    "summary": "서로 다른 양식의 열을 비교하고 표준 필드 매핑 설계",
    "tags": [
      "엑셀",
      "시트",
      "csv",
      "데이터",
      "합치",
      "통합",
      "정리",
      "표준화",
      "열"
    ],
    "examples": [
      "거래처마다 다른 엑셀 양식을 합치고 싶어",
      "엑셀 파일 여러 개 정리하고 싶어"
    ],
    "fields": [
      {
        "key": "date",
        "label": "거래일",
        "aliases": [
          "거래날짜",
          "날짜",
          "일자"
        ],
        "required": true
      },
      {
        "key": "item",
        "label": "상품명",
        "aliases": [
          "제품명",
          "품목",
          "상품"
        ],
        "required": true
      },
      {
        "key": "amount",
        "label": "금액",
        "aliases": [
          "매출",
          "금액원",
          "가격"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "destination",
        "prompt": "표준화된 자료를 어디에 저장하나요?",
        "options": [
          "로컬 CSV",
          "엑셀 파일",
          "Google Sheets (직접 설정)"
        ]
      },
      {
        "key": "duplication",
        "prompt": "같은 행이 중복되면 어떻게 하나요?",
        "options": [
          "검토 대상으로 표시",
          "식별 키를 확인 후 병합",
          "원본 보존"
        ]
      }
    ],
    "steps": [
      "파일별 헤더 확인",
      "표준 열 후보 제안",
      "모호한 매핑 질문",
      "변환 예시 검토",
      "출력·오류 검증"
    ],
    "tools": [
      "Excel",
      "CSV",
      "Google Sheets (선택)"
    ],
    "cautions": [
      "날짜/금액의 표기 단위 확인",
      "실제 파일 덮어쓰기 전 원본 보존"
    ],
    "outputHint": "표준 열 매핑과 변환 계획",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "inventory",
    "title": "주문·발주·재고",
    "category": "운영",
    "summary": "주문과 재고를 비교해 부족 수량 및 승인 흐름 설계",
    "tags": [
      "재고",
      "주문",
      "발주",
      "수량",
      "입고",
      "부족",
      "창고"
    ],
    "examples": [
      "주문 들어오면 재고랑 대조하고 발주 목록 만들어줘"
    ],
    "fields": [
      {
        "key": "sku",
        "label": "상품코드",
        "aliases": [
          "SKU",
          "상품번호",
          "코드"
        ],
        "required": true
      },
      {
        "key": "ordered",
        "label": "주문수량",
        "aliases": [
          "주문량",
          "판매수량"
        ],
        "required": true
      },
      {
        "key": "stock",
        "label": "현재재고",
        "aliases": [
          "재고량",
          "재고수량"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "threshold",
        "prompt": "재주문 기준은 무엇인가요?",
        "options": [
          "안전재고 기준",
          "주문량 기준",
          "직접 입력"
        ]
      },
      {
        "key": "approval",
        "prompt": "발주는 누가 승인하나요?",
        "options": [
          "대표 직접 승인",
          "관리자 승인",
          "설계만 하고 전송 안 함"
        ]
      }
    ],
    "steps": [
      "품목 식별",
      "주문량과 재고 비교",
      "부족 물량 표시",
      "승인 단계를 포함한 발주 흐름 설계"
    ],
    "tools": [
      "Excel",
      "Google Sheets",
      "n8n (선택)"
    ],
    "cautions": [
      "외부 ERP 수정·자동 발주 발송은 포함되지 않음"
    ],
    "outputHint": "재고 부족 후보와 발주 승인 설계",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "faq",
    "title": "고객 문의·FAQ",
    "category": "고객",
    "summary": "반복 문의를 분류하고 답변 초안을 만드는 설계",
    "tags": [
      "고객",
      "문의",
      "질문",
      "상담",
      "FAQ",
      "답변",
      "반복"
    ],
    "examples": [
      "손님 질문 매일 똑같아서 귀찮아",
      "고객 문의를 유형별로 분류하고 싶어"
    ],
    "fields": [
      {
        "key": "question",
        "label": "문의내용",
        "aliases": [
          "질문",
          "고객질문",
          "메시지"
        ],
        "required": true
      },
      {
        "key": "category",
        "label": "문의유형",
        "aliases": [
          "분류",
          "종류",
          "카테고리"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "channel",
        "prompt": "문의가 들어오는 경로는?",
        "options": [
          "이메일",
          "채팅",
          "게시판",
          "기타"
        ]
      },
      {
        "key": "humanCheck",
        "prompt": "답변 전 사람이 확인하나요?",
        "options": [
          "항상 확인",
          "일부 유형만 확인"
        ]
      }
    ],
    "steps": [
      "문의 항목 분류",
      "빈번한 질문 묶기",
      "답변 초안 명세",
      "인간 확인 경로 설계"
    ],
    "tools": [
      "Google Sheets",
      "외부 AI (선택)"
    ],
    "cautions": [
      "고객 개인정보 외부 전달에 주의",
      "자동 응답 발송은 포함되지 않음"
    ],
    "outputHint": "FAQ 분류 규칙과 답변 승인 절차",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "sales",
    "title": "매출 집계·보고서",
    "category": "데이터",
    "summary": "매출 데이터의 기준과 기간별 보고서 절차 설계",
    "tags": [
      "매출",
      "보고서",
      "집계",
      "정산",
      "리포트",
      "월간",
      "일일"
    ],
    "examples": [
      "하루 매출 모아서 보고서 만들고 싶어"
    ],
    "fields": [
      {
        "key": "date",
        "label": "판매일",
        "aliases": [
          "거래일",
          "일자",
          "날짜"
        ],
        "required": true
      },
      {
        "key": "amount",
        "label": "판매금액",
        "aliases": [
          "매출액",
          "금액",
          "매출"
        ],
        "required": true
      },
      {
        "key": "channel",
        "label": "판매채널",
        "aliases": [
          "채널",
          "판매처",
          "플랫폼"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "period",
        "prompt": "집계 주기는?",
        "options": [
          "일별",
          "주별",
          "월별"
        ]
      },
      {
        "key": "returns",
        "prompt": "반품·취소 금액 처리는?",
        "options": [
          "별도 표기",
          "차감",
          "미정"
        ]
      }
    ],
    "steps": [
      "금액·날짜 형식 확인",
      "집계 기준 검증",
      "기간별 그룹 규칙 정리",
      "보고 검증표 구성"
    ],
    "tools": [
      "Excel",
      "CSV",
      "Google Sheets"
    ],
    "cautions": [
      "세무·회계 신고의 정확성을 보증하지 않음"
    ],
    "outputHint": "기간별 매출 보고 설계",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "email",
    "title": "이메일 첨부파일 정리",
    "category": "운영",
    "summary": "조건별 메일 첨부를 분류·저장하는 외부 자동화 구축 가이드",
    "tags": [
      "메일",
      "이메일",
      "첨부",
      "엑셀",
      "저장",
      "받은편지",
      "폴더"
    ],
    "examples": [
      "메일로 엑셀 오면 알아서 폴더에 저장",
      "이메일 첨부파일 자동 분류"
    ],
    "fields": [
      {
        "key": "sender",
        "label": "발신자 조건",
        "aliases": [
          "보낸사람",
          "발신자",
          "이메일주소"
        ],
        "required": true
      },
      {
        "key": "filename",
        "label": "첨부파일명",
        "aliases": [
          "파일명",
          "첨부",
          "이름"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "format",
        "prompt": "어떤 첨부 형식을 처리하나요?",
        "options": [
          "엑셀·CSV",
          "PDF",
          "이미지",
          "다양한 형식"
        ]
      },
      {
        "key": "destination",
        "prompt": "파일 저장 위치는?",
        "options": [
          "로컬 PC",
          "Google Drive (직접 설정)",
          "기타"
        ]
      }
    ],
    "steps": [
      "메일 트리거 정의",
      "첨부파일 유형·발신자 조건",
      "저장 폴더 매핑",
      "중복 처리·오류 알림 설계"
    ],
    "tools": [
      "n8n (선택)",
      "Gmail/Outlook (직접 승인)"
    ],
    "cautions": [
      "고객 메일 계정 연결은 고객이 직접 수행",
      "메일 접근 권한 최소화 필요"
    ],
    "outputHint": "이메일 첨부 처리 워크플로 가이드",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "rag",
    "title": "사내 문서 검색·RAG 설계",
    "category": "지식",
    "summary": "사내 문서를 검색하고 출처를 제시하는 RAG 구축 계획",
    "tags": [
      "사내",
      "규정",
      "문서",
      "검색",
      "찾기",
      "질문",
      "RAG",
      "내규"
    ],
    "examples": [
      "회사 규정 물어보면 답하게 하고 싶어",
      "사내 문서를 AI로 검색하고 싶어"
    ],
    "fields": [
      {
        "key": "document",
        "label": "문서명",
        "aliases": [
          "자료명",
          "규정명",
          "파일명"
        ],
        "required": true
      },
      {
        "key": "version",
        "label": "문서 버전",
        "aliases": [
          "개정일",
          "버전",
          "적용일"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "access",
        "prompt": "누가 문서를 볼 수 있나요?",
        "options": [
          "전직원",
          "팀별 권한",
          "승인된 관리자"
        ]
      },
      {
        "key": "sources",
        "prompt": "답변에 출처를 표시할까요?",
        "options": [
          "항상 표시",
          "사람이 검토"
        ]
      }
    ],
    "steps": [
      "문서 범위 정리",
      "파일 권한/버전 설계",
      "인덱싱·검색 절차 설계",
      "답변 출처·검증 정의"
    ],
    "tools": [
      "외부 RAG 도구 (별도 구축)",
      "LLM (선택)"
    ],
    "cautions": [
      "SMAX 자체에 문서 검색 답변 AI는 없음",
      "기밀문서 외부 전송 전 권한 확인"
    ],
    "outputHint": "RAG 시스템 요구사항과 구축 명령",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "quote",
    "title": "견적서·문서 작성",
    "category": "운영",
    "summary": "상품표와 거래 조건으로 견적 문서 작성 흐름 설계",
    "tags": [
      "견적",
      "가격표",
      "서류",
      "문서",
      "계약",
      "청구"
    ],
    "examples": [
      "상품 가격표로 견적서를 자동으로 만들고 싶어"
    ],
    "fields": [
      {
        "key": "item",
        "label": "품목",
        "aliases": [
          "상품명",
          "제품명"
        ],
        "required": true
      },
      {
        "key": "unitPrice",
        "label": "단가",
        "aliases": [
          "가격",
          "판매가"
        ],
        "required": true
      },
      {
        "key": "quantity",
        "label": "수량",
        "aliases": [
          "개수",
          "주문수량"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "approval",
        "prompt": "견적서를 발송 전에 검토하나요?",
        "options": [
          "항상 승인",
          "초안만 생성"
        ]
      },
      {
        "key": "tax",
        "prompt": "부가세 표기 방식은?",
        "options": [
          "별도",
          "포함",
          "미정"
        ]
      }
    ],
    "steps": [
      "품목·단가·수량 검증",
      "문서 서식 매핑",
      "승인 단계 정의",
      "합계·세액 계산 확인"
    ],
    "tools": [
      "Excel",
      "문서 편집기",
      "n8n (선택)"
    ],
    "cautions": [
      "세액·계약조건은 최종 사람이 확인"
    ],
    "outputHint": "견적 문서 입력/출력·승인 구조",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "booking",
    "title": "예약·알림",
    "category": "고객",
    "summary": "예약 중복 확인·알림 자동화 과정 설계",
    "tags": [
      "예약",
      "스케줄",
      "일정",
      "문자",
      "알림",
      "리마인드"
    ],
    "examples": [
      "예약 확인 문자 보내고 싶어",
      "방문 예약이 겹치지 않게 하고 싶어"
    ],
    "fields": [
      {
        "key": "date",
        "label": "예약일시",
        "aliases": [
          "예약날짜",
          "시간",
          "방문일"
        ],
        "required": true
      },
      {
        "key": "reference",
        "label": "예약번호",
        "aliases": [
          "예약ID",
          "신청번호"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "timezone",
        "prompt": "운영 시간대는?",
        "options": [
          "한국 시간",
          "기타"
        ]
      },
      {
        "key": "channel",
        "prompt": "알림 채널은?",
        "options": [
          "이메일",
          "문자(요금 별도)",
          "없음"
        ]
      }
    ],
    "steps": [
      "예약 입력 정의",
      "중복 검사 규칙",
      "알림 시점 설정",
      "실패·취소 시나리오 검증"
    ],
    "tools": [
      "Google Calendar (선택)",
      "메시지 API (별도)"
    ],
    "cautions": [
      "외부 메시지 전송에는 고객 동의·별도 요금 필요"
    ],
    "outputHint": "예약 확인·알림 운영 설계",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "web",
    "title": "공개 웹자료 변화 감지",
    "category": "데이터",
    "summary": "공개적으로 이용 가능한 자료의 변동 기록과 알림 설계",
    "tags": [
      "웹",
      "가격",
      "모니터링",
      "수집",
      "비교",
      "변경",
      "경쟁사"
    ],
    "examples": [
      "웹사이트 가격이 바뀌면 알려줘"
    ],
    "fields": [
      {
        "key": "url",
        "label": "대상 주소",
        "aliases": [
          "링크",
          "웹주소"
        ],
        "required": true
      },
      {
        "key": "value",
        "label": "비교할 값",
        "aliases": [
          "가격",
          "금액",
          "가격표"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "frequency",
        "prompt": "얼마나 자주 확인할까요?",
        "options": [
          "매일",
          "매주",
          "수동"
        ]
      },
      {
        "key": "notice",
        "prompt": "변화를 어떻게 알까요?",
        "options": [
          "보고서",
          "이메일 (별도 설정)"
        ]
      }
    ],
    "steps": [
      "수집 가능 여부 확인",
      "비교 필드 명세",
      "이전값과 차이 검증",
      "정상·실패 알림 설계"
    ],
    "tools": [
      "n8n (선택)",
      "CSV"
    ],
    "cautions": [
      "robots·약관·접근 권한·요청 제한 확인",
      "웹 수집기를 내장한 완제품은 아님"
    ],
    "outputHint": "가격 등 공개 정보 변화 감지 계획",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  },
  {
    "id": "reviews",
    "title": "리뷰·마케팅 초안",
    "category": "고객",
    "summary": "리뷰를 유형별로 분류하고 대응 초안 작성 절차 설계",
    "tags": [
      "리뷰",
      "후기",
      "평점",
      "마케팅",
      "반응",
      "답글",
      "광고"
    ],
    "examples": [
      "고객 리뷰 모아서 유형별로 보고 싶어",
      "리뷰 답글 초안을 만들고 싶어"
    ],
    "fields": [
      {
        "key": "review",
        "label": "리뷰본문",
        "aliases": [
          "후기",
          "댓글",
          "내용"
        ],
        "required": true
      },
      {
        "key": "rating",
        "label": "평점",
        "aliases": [
          "별점",
          "점수"
        ],
        "required": true
      }
    ],
    "questions": [
      {
        "key": "tone",
        "prompt": "원하는 답변 말투는?",
        "options": [
          "공손하게",
          "간결하게",
          "친근하게"
        ]
      },
      {
        "key": "publish",
        "prompt": "게시 전 사람이 검토하나요?",
        "options": [
          "항상 검토",
          "초안만 보관"
        ]
      }
    ],
    "steps": [
      "리뷰 유형 분류",
      "부정 의견 검토",
      "답변 초안용 프롬프트",
      "게시 전 검토 체크리스트"
    ],
    "tools": [
      "CSV",
      "외부 AI (선택)"
    ],
    "cautions": [
      "외부 사이트 자동 게시 기능은 없음"
    ],
    "outputHint": "리뷰 분류와 답변 초안 생성 지침",
    "templateVersion": "0.1.0",
    "status": "DESIGN_DRAFT"
  }
];
