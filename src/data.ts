import { ReferenceItem } from "./types";

export const INITIAL_MOCK_DATA: ReferenceItem[] = [
  {
    id: "ref-1",
    imageUrl: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-10T14:32:00Z",
    location: "서울시 종로구 삼청동",
    lat: 37.5818,
    lng: 126.9815,
    memo: "한옥 갤러리 내부의 자연 광량 조절 방식. 천장의 한지와 어우러지는 미니멀한 조명 레일 처리가 무척 따뜻한 분위기를 연출함.",
    tags: ["인테리어", "조명", "한옥", "삼청동"],
    checklist: [
      { id: "chk-1-1", text: "개인 작업실 한지 무드등 레이아웃에 적용해보기", completed: false },
      { id: "chk-1-2", text: "따뜻한 색감의 3000K 전구 구매 리스트 확인", completed: true }
    ]
  },
  {
    id: "ref-2",
    imageUrl: "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-09T09:15:00Z",
    location: "성수동 카페거리 카페 피치",
    lat: 37.5446,
    lng: 127.0559,
    memo: "볼드한 기하학적인 그래픽 포스터 배치. 비대칭 구도에 대비감이 높은 컬러 베리에이션이 한 눈에 대비감을 주며 브랜딩 신선함을 더함.",
    tags: ["타이포그래피", "성수동", "포스터", "컬러칩"],
    checklist: [
      { id: "chk-2-1", text: "시즌 그래픽 디자인에 보라/오렌지 강렬한 배색 테스트", completed: false }
    ]
  },
  {
    id: "ref-3",
    imageUrl: "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-08T18:40:00Z",
    location: "한남동 플래그십 스토어",
    lat: 37.5348,
    lng: 127.0022,
    memo: "친환경 크라프트지를 활용한 오가닉 코스메틱 비누 패키징 레이아웃. 단순 타이포그래피 스티커만으로 완성도 높은 아이코닉 무드를 구현함.",
    tags: ["패키지디자인", "한남동", "친환경", "미니멀리즘"],
    checklist: [
      { id: "chk-3-1", text: "신규 브랜드 비누 샘플 재생 단상자 패키지 단가 의뢰", completed: false },
      { id: "chk-3-2", text: "원형 라벨 스티커 시안 서체 폰트 대조하기", completed: false }
    ]
  },
  {
    id: "ref-4",
    imageUrl: "https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-07T11:05:00Z",
    location: "을지로 가구 편집숍 디앤디",
    lat: 37.5661,
    lng: 126.9945,
    memo: "내추럴 빈티지 우드 소재와 모던 크롬 메탈 체어의 만남. 상반된 무드의 소재를 매칭하여 오묘한 오피스 시각적 무드를 이끌어 냄.",
    tags: ["인테리어", "을지로", "가구", "체어"],
    checklist: [
      { id: "chk-4-1", text: "내 작업실 우드 데스크와 어울리는 메탈릭 의자 알아보기", completed: true }
    ]
  },
  {
    id: "ref-5",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-05T15:20:00Z",
    location: "부산 영도 피아크 문화 공간",
    lat: 35.0912,
    lng: 129.0416,
    memo: "대형 노출 콘크리트 벽면에 걸려있던 강렬한 아크릴 페인팅 미술작품. 블루 계열의 아쿠아 질감이 더운 날씨에 청량한 공간적 대비감을 줌.",
    tags: ["전시", "영도", "컬러칩", "페인팅"],
    checklist: [
      { id: "chk-5-1", text: "블루-에메랄드 그라데이션 웹 메인 비주얼 적용해보기", completed: false }
    ]
  },
  {
    id: "ref-6",
    imageUrl: "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=800&q=80",
    createdAt: "2026-06-03T20:10:00Z",
    location: "강릉 강문해변 에어비앤비",
    lat: 37.7951,
    lng: 128.9181,
    memo: "에어비앤비 거실 구석에 놓인 스탠드형 구체 조명. 불을 끄고 조명만 켰을 때 벽면 유리 타일에 비춰지며 퍼지는 몽환적인 굴절 패턴이 탁월함.",
    tags: ["조명", "카페", "분위기", "건축"],
    checklist: [
      { id: "chk-6-1", text: "내 방 조명 굴절 연출용 글래스 블록 알아보기", completed: false }
    ]
  }
];

export const MOCK_CAMERA_OPTIONS = [
  {
    name: "미니멀 거실 인테리어",
    category: "인테리어",
    imageUrl: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=800&q=80",
    memo: "미니멀한 거실 벽면에 포인트가 되는 마티스 드로잉 포스터와 로우 테이블 우드 매칭 디자인."
  },
  {
    name: "빈티지 세리프 북커버 타이포",
    category: "타이포그래피",
    imageUrl: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=800&q=80",
    memo: "고전적이고 기품 있는 세리프 서체의 리듬감 있는 배치가 눈을 사로잡는 양장본 북 디자인."
  },
  {
    name: "블루 시그니처 글래스 화병 패키지",
    category: "패키지디자인",
    imageUrl: "https://images.unsplash.com/photo-1527018601619-a508a2be00cd?auto=format&fit=crop&w=800&q=80",
    memo: "투명함과 짙은 수면빛 블루 콜라보가 빚어낸 맑고 럭셔리한 오가닉 화병 디퓨저 패키징."
  },
  {
    name: "도쿄 하라주쿠 빈티지 숍 사인보드",
    category: "스트리트아트",
    imageUrl: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=800&q=80",
    memo: "밤거리에 은은하게 번쩍이는 네온 오렌지와 그린의 하이 콘트라스트 뉴트로 레트로 네온사인."
  },
  {
    name: "스위스 타이포그래피 전시 리플렛",
    category: "전시",
    imageUrl: "https://images.unsplash.com/photo-1561070791-26c113006238?auto=format&fit=crop&w=800&q=80",
    memo: "그리드에 정확히 정돈되어 엄청난 균형미를 선사하는 바우하우스 느낌의 오렌지-블랙 리플렛."
  }
];

export const POPULAR_TAGS = [
  "인테리어", "조명", "타이포그래피", "패키지디자인", "미니멀리즘", "컬러칩", "전시", "오피스", "카페"
];

export const POPULAR_LOCATIONS = [
  "서울시 종로구 삼청동",
  "성수동 카페거리",
  "한남동 플래그십 스토어",
  "을지로 가구 편집숍",
  "부산 영도 영도대교 인근",
  "안산시 단원구 고잔동",
  "제주 조천읍 카페"
];
