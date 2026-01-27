# 🔴 LIVE 카드 시스템 가이드

## 📋 개요

LIVE 카드 시스템은 매년 최신 시즌 선수들을 특별하게 관리하는 프리미엄 카드 시스템입니다.

## 🎯 핵심 개념

### 1. LIVE 카드란?
- **정의**: 현재 진행 중인 시즌의 선수 카드
- **현재 시즌**: 2026년 (상수로 관리)
- **등급 체계**: LIVE 내에서도 S/A/B/C 등급 구분
- **특별함**: 일반 카드팩에서 등장하지 않음

### 2. 시즌 전환 시스템
```
2026년 → LIVE 카드 (프리미엄)
2027년 출시 시 → 2026년 카드는 일반 카드로 전환
                → 2027년 카드가 새로운 LIVE 카드
```

## 🔧 기술 구현

### 1. 상수 관리 (`/src/types/lck.ts`)
```typescript
// 🔥 매년 이 값만 변경하면 전체 시스템 자동 업데이트
export const CURRENT_LIVE_SEASON = 2026;

// LIVE 카드 확인 헬퍼 함수
export function isLiveCard(card: { year: number }): boolean {
  return card.year === CURRENT_LIVE_SEASON;
}
```

### 2. 카드팩 시스템
```typescript
export type CardPackType = 
  | "standard"      // 일반 팩: LIVE 시즌 제외 (2013-2025)
  | "live_pack"     // 🔥 LIVE 전용 팩 (2026만)
  | "year_2013"     // 연도별 팩: LIVE 시즌 제외
  | ...
  | "position_TOP"  // 포지션별 팩: LIVE 시즌 제외
```

### 3. 가격 책정 (`GACHA_CONFIG`)
```typescript
PACK_COSTS: {
  standard: 200,       // 기본
  live_pack: 1000,     // 🔥 5배 프리미엄
  year_2013: 400,      // 2배
  position_TOP: 500    // 2.5배
}

TEN_COSTS: {
  standard: 2000,      
  live_pack: 9500,     // 🔥 약간 할인 (10,000 → 9,500)
  year_2013: 3500,
  position_TOP: 4500
}
```

### 4. 필터링 로직 (`/src/utils/gachaEngine.ts`)
```typescript
function filterCardPoolByPack(pool: LCKCard[], packType: CardPackType) {
  // 일반 팩: LIVE 시즌 제외
  if (packType === "standard") {
    return pool.filter(c => c.year < CURRENT_LIVE_SEASON);
  }
  
  // LIVE 팩: 현재 시즌만
  if (packType === "live_pack") {
    return pool.filter(c => c.year === CURRENT_LIVE_SEASON);
  }
  
  // 연도별 팩: LIVE 시즌 제외
  if (packType.startsWith("year_")) {
    const year = parseInt(packType.split("_")[1]);
    if (year >= CURRENT_LIVE_SEASON) return [];
    return pool.filter(c => c.year === year);
  }
  
  // 포지션별 팩: LIVE 시즌 제외
  if (packType.startsWith("position_")) {
    const position = packType.split("_")[1] as Position;
    return pool.filter(c => 
      c.position === position && c.year < CURRENT_LIVE_SEASON
    );
  }
}
```

## 🎨 UI 표시

### 1. LIVE 배지 (`/src/components/LCKHoloCard.tsx`)
- 위치: 카드 최상단 중앙
- 색상: 핑크 그라데이션 (`#FF1493` → `#C026D3`)
- 효과: `animate-pulse` (반짝임)
- 텍스트: "🔴 LIVE"

### 2. 카드팩 UI (`/src/components/LCKGacha.tsx`)
- LIVE 전용 탭: 핑크 테두리 + 반짝임
- 카드팩 미리보기: 핑크 그라데이션 배경
- 제목: "🔴 LIVE 2026"
- 부제: "현재 시즌"

## 📅 시즌 업데이트 가이드

### 2027년 시즌 전환 시:

**1단계: 상수 변경**
```typescript
// /src/types/lck.ts
export const CURRENT_LIVE_SEASON = 2027; // 2026 → 2027
```

**2단계: 자동 적용**
- ✅ 2027년 카드 → 자동으로 LIVE 카드
- ✅ 2026년 카드 → 자동으로 일반 카드로 전환
- ✅ LIVE 팩 → 2027년 카드만 등장
- ✅ 일반 팩 → 2013-2026년 카드 등장

**3단계: 확인사항**
- UI에서 LIVE 배지 정상 표시
- 가챠 풀 필터링 정상 작동
- 가격 책정 정상 적용

## 🎮 게임플레이

### 플레이어 관점
1. **일반 팩**: 과거 명선수들 수집 (저렴)
2. **LIVE 팩**: 현재 시즌 선수 수집 (비쌈)
3. **전략**: LIVE 카드는 희소성 높음 → 컬렉션 가치 상승

### 밸런스
- LIVE 카드 확률: 일반 S/A/B/C와 동일
- 가격: 5배 프리미엄으로 희소성 유지
- 차별화: LIVE 배지로 시각적 특별함

## 🔍 확인 방법

### 카드가 LIVE인지 확인
```typescript
import { isLiveCard } from "@/types/lck";

const card = { year: 2026, ... };
if (isLiveCard(card)) {
  console.log("이 카드는 LIVE 카드입니다!");
}
```

### LIVE 팩 카드 풀 확인
```typescript
// gachaEngine.ts에서
const liveCards = filterCardPoolByPack(allCards, "live_pack");
console.log("LIVE 카드 수:", liveCards.length);
console.log("모든 카드가 2026년:", liveCards.every(c => c.year === 2026));
```

## 🚨 주의사항

### ❌ 하지 말아야 할 것
1. **연도별 팩에 LIVE 추가 금지**: year_2026 팩 생성 X
2. **일반 팩에서 LIVE 등장 금지**: 필터링 로직 필수
3. **하드코딩 금지**: 2026을 직접 쓰지 말고 `CURRENT_LIVE_SEASON` 사용

### ✅ 해야 할 것
1. **상수 사용**: `CURRENT_LIVE_SEASON` 항상 사용
2. **헬퍼 함수 사용**: `isLiveCard()` 활용
3. **필터링 확인**: 카드 풀 필터링 로직 준수

## 📊 데이터 구조

### LCKCard (변경 없음)
```typescript
export interface LCKCard {
  id: string;
  year: number;        // 2026이면 LIVE
  grade: Grade;        // S/A/B/C (LIVE 내에서도 구분)
  position: Position;
  // ...
}
```

### 카드 예시
```typescript
// LIVE S등급 카드
{
  id: "faker_2026_live",
  year: 2026,          // ← LIVE 시즌
  grade: "S",          // ← S등급
  name: "Faker",
  team: "T1",
  position: "MID",
  // ...
}

// 일반 S등급 카드
{
  id: "faker_2025",
  year: 2025,          // ← 일반 카드
  grade: "S",          // ← S등급
  name: "Faker",
  team: "T1",
  position: "MID",
  // ...
}
```

## 🎯 장점

1. **유연성**: 상수 하나만 바꾸면 시즌 전환
2. **단순성**: 복잡한 플래그나 별도 등급 불필요
3. **확장성**: 미래 시즌 자동 대응
4. **명확성**: LIVE 개념이 코드에 명확히 드러남
5. **호환성**: 기존 시스템과 자연스럽게 통합

## 📈 향후 확장 가능성

### 옵션 1: LIVE+ 등급
```typescript
export const CURRENT_LIVE_SEASON = 2027;
export const CURRENT_LIVE_PLUS_SEASON = 2027; // 특별 이벤트

export function isLivePlusCard(card: LCKCard): boolean {
  return card.year === CURRENT_LIVE_PLUS_SEASON && card.team === "T1";
}
```

### 옵션 2: 과거 LIVE 아카이브
```typescript
export const LIVE_ARCHIVE_SEASONS = [2026, 2027, 2028];

export function isArchiveLiveCard(card: LCKCard): boolean {
  return LIVE_ARCHIVE_SEASONS.includes(card.year);
}
```

### 옵션 3: LIVE 시즌 중간 업데이트
```typescript
export const CURRENT_LIVE_SEASON = 2026;
export const LIVE_UPDATE_VERSION = 2; // 2026 시즌 2차 업데이트

export interface LCKCard {
  year: number;
  liveVersion?: number; // 1, 2, 3 (시즌 중간 업데이트)
  // ...
}
```

---

## 🎉 완료!

LIVE 카드 시스템이 성공적으로 구현되었습니다.

**변경된 파일:**
- `/src/types/lck.ts` - LIVE 상수 및 헬퍼 함수 추가
- `/src/utils/gachaEngine.ts` - LIVE 팩 필터링 로직
- `/src/components/LCKGacha.tsx` - LIVE 팩 UI
- `/src/components/LCKHoloCard.tsx` - LIVE 배지 표시

**다음 할 일:**
1. 2026년 선수 데이터 추가
2. LIVE 팩 가격 밸런스 테스트
3. UI/UX 피드백 수집
4. 시즌 전환 테스트 (2027년 대비)
