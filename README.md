# LCK 선수 카드 가챠 + 스쿼드 빌더

리그오브레전드 LCK 선수 카드를 수집하고, 5인 스쿼드를 구성하여 시너지 보너스를 확인하는 가챠 게임입니다.

## 🎮 주요 기능

### 1. 가챠 시스템
- **단일 뽑기 / 10연차**: 200 RP / 1,800 RP (할인)
- **등급 확률**: S(2%) / A(10%) / B(28%) / C(60%)
- **천장 시스템 (FIFA 스타일)**:
  - S 천장: 60회 확정 (40회부터 확률 상승)
  - A 천장: 10회 확정
  - 10연차: A 이상 최소 1장 보장
- **S등급 연출**: FIFA 스타일 시퀀스 애니메이션 (연도 → 포지션 → 팀 → 카드)

### 2. 카드 시스템
- **등급**: S / A / B / C (346장 프로토타입)
- **포지션**: TOP / JNG / MID / ADC / SUP
- **스탯**: OVR + 5 서브스탯 (Mechanics, Laning, Teamfight, Macro, Clutch)
- **홀로그램 효과**: poke-holo.simey.me 스타일의 3D 틸트 + 빛 반사

### 3. 중복(샤드) 시스템
- 중복 카드 자동 분해 → 샤드 지급
  - S: 100 / A: 30 / B: 10 / C: 3
- **샤드 사용**:
  - 강화: 100 샤드당 +1 OVR (최대 +3)
  - 제작: A(300) / S(900)

### 4. 스쿼드 빌더
- 5인 로스터 (TOP/JNG/MID/ADC/SUP)
- 총 OVR / 서브스탯 합산
- **시너지 시스템**:
  - 풀 로스터 (+3% OVR, +2 Macro 전원)
  - 바텀 듀오 (같은 팀/연도)
  - 미드-정글 연계
  - 탑-정글 압박
  - 팀 코어 (3/5장)
  - 연도 시너지 (3/5장)

### 5. 컬렉션
- 필터: 등급 / 포지션
- 정렬: OVR 높은순 / 최신순
- 카드 상세 + 강화

## 🎨 디자인 시스템

- **테마**: 다크 e스포츠 (LCK 컨셉)
- **컬러**:
  - Background: `#0B0F1A` (딥 네이비)
  - Primary: `#E4002B` (LCK Red)
  - Secondary: `#2B6CFF` (Cool Blue)
  - S등급: `#D4AF37` (Gold)
  - A등급: `#B7C2D6` (Silver)
- **폰트**: Pretendard (한글) / Teko (숫자)
- **홀로그램**: 등급별 차별화된 효과

## 🛠 기술 스택

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Motion (Framer Motion)
- **State**: Context API
- **Storage**: LocalStorage (프로토타입)
- **UI Library**: Radix UI + shadcn/ui

## 📦 프로젝트 구조

```
/src
  /app
    /components
      /ui          # shadcn/ui 컴포넌트
    App.tsx        # 메인 앱
  /components
    LCKHome.tsx           # 홈 화면
    LCKGacha.tsx          # 가챠 화면
    LCKSquad.tsx          # 스쿼드 빌더
    LCKCollection.tsx     # 컬렉션
    LCKHoloCard.tsx       # 홀로그램 카드
    FIFAReveal.tsx        # S등급 연출
  /contexts
    GameContext.tsx       # 전역 상태
  /data
    sampleCards.ts        # 샘플 카드 데이터
  /types
    lck.ts                # 타입 정의
  /utils
    gachaEngine.ts        # 가챠 확률 엔진
    synergyCalculator.ts  # 시너지 계산
    localStorage.ts       # 로컬 저장
  /styles
    lck-custom.css        # 커스텀 스타일
```

## 🚀 실행 방법

```bash
# 패키지 설치 (이미 완료됨)
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build
```

## 🎯 게임 플레이

1. **홈 화면**: 재화 확인, 천장 게이지 확인
2. **바로 뽑기**: 단일/10연차 선택
3. **S등급 연출**: FIFA 스타일 애니메이션 감상
4. **컬렉션**: 보유 카드 확인, 강화, 샤드 제작
5. **스쿼드**: 5인 로스터 구성, 시너지 확인

## 📝 디버그 기능

- 홈 화면에서 "+1000 RP" 버튼으로 재화 추가 가능
- 게임 리셋: LocalStorage 초기화

## 🔮 향후 계획 (Supabase 연동)

현재는 LocalStorage로 동작하지만, 다음 기능을 위해 Supabase 연동 예정:

### Supabase 테이블 구조 (예정)
```sql
-- 선수 카드 마스터 데이터
CREATE TABLE cards (
  id TEXT PRIMARY KEY,
  year INT,
  team TEXT,
  name TEXT,
  position TEXT,
  grade TEXT,
  image_url TEXT,
  stats JSONB
);

-- 사용자 데이터
CREATE TABLE users (
  id UUID PRIMARY KEY,
  currency INT DEFAULT 5000,
  shards INT DEFAULT 0,
  gacha_state JSONB
);

-- 사용자 보유 카드
CREATE TABLE user_cards (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  card_id TEXT REFERENCES cards(id),
  instance_id TEXT UNIQUE,
  upgrade_level INT DEFAULT 0,
  obtained_at TIMESTAMP
);

-- 사용자 스쿼드
CREATE TABLE user_squads (
  user_id UUID PRIMARY KEY REFERENCES users(id),
  top_card UUID REFERENCES user_cards(id),
  jng_card UUID REFERENCES user_cards(id),
  mid_card UUID REFERENCES user_cards(id),
  adc_card UUID REFERENCES user_cards(id),
  sup_card UUID REFERENCES user_cards(id)
);
```

### 연동 시 추가 기능
- **클라우드 저장**: 디바이스 간 동기화
- **선수 이미지 업로드**: Supabase Storage 활용
- **리더보드**: 스쿼드 OVR 랭킹
- **카드 관리 대시보드**: Admin용 CRUD
- **실시간 업데이트**: 새 시즌 선수 자동 추가

## 💡 참고 사항

- 현재는 2020~2025 시즌의 샘플 데이터 30장으로 프로토타입 구동
- 전체 346장 데이터는 Supabase 연동 시 마이그레이션 예정
- 홀로그램 효과는 최신 브라우저에서 최적화됨 (Chrome/Edge 권장)

## 📄 라이선스

MIT License

---

Made with ❤️ for LCK fans
