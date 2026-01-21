// LCK 가챠 엔진: 확률 계산, 천장 시스템, 샤드 지급

import { LCKCard, GachaState, GachaResult, GACHA_CONFIG, Grade, Position } from "@/types/lck";
import { getCardPool, getCardsByGrade } from "@/data/supabaseCards";
import { SAMPLE_CARDS } from "@/data/sampleCards";

// 카드팩 타입
export type CardPackType = 
  | "standard"
  | "year_2013"
  | "year_2014"
  | "year_2015"
  | "year_2016"
  | "year_2017"
  | "year_2018"
  | "year_2019"
  | "year_2020"
  | "year_2021"
  | "year_2022"
  | "year_2023"
  | "year_2024"
  | "year_2025"
  | "position_TOP"
  | "position_JGL"
  | "position_MID"
  | "position_ADC"
  | "position_SUP";

// 카드 풀 캐싱
let cachedCardPool: LCKCard[] | null = null;
let cachedGradeMap: Map<Grade, LCKCard[]> = new Map();

// 카드팩별 필터링된 풀 캐싱
let cachedPackPools: Map<CardPackType, Map<Grade, LCKCard[]>> = new Map();

// 카드 풀 초기화 (앱 시작 시 한번만)
export async function initializeCardPool() {
  if (cachedCardPool && cachedCardPool.length > 0) {
    return cachedCardPool;
  }
  
  try {
    cachedCardPool = await getCardPool();
    
    // 카드가 없으면 샘플 데이터 사용
    if (!cachedCardPool || cachedCardPool.length === 0) {
      cachedCardPool = SAMPLE_CARDS;
    }
  } catch (error) {
    cachedCardPool = SAMPLE_CARDS;
  }
  
  // 등급별로 분류
  cachedGradeMap.set("S", cachedCardPool.filter(c => c.grade === "S"));
  cachedGradeMap.set("A", cachedCardPool.filter(c => c.grade === "A"));
  cachedGradeMap.set("B", cachedCardPool.filter(c => c.grade === "B"));
  cachedGradeMap.set("C", cachedCardPool.filter(c => c.grade === "C"));
  
  // 🔥 카드팩별 캐시도 초기화
  initializePackPools();
  
  return cachedCardPool;
}

// ID로 카드 가져오기
export async function getCardById(cardId: string): Promise<LCKCard | null> {
  // 카드 풀이 초기화되지 않았으면 초기화
  if (!cachedCardPool || cachedCardPool.length === 0) {
    await initializeCardPool();
  }
  
  return cachedCardPool?.find(card => card.id === cardId) || null;
}

// 카드팩별 풀 초기화
function initializePackPools() {
  if (!cachedCardPool) return;
  
  const packTypes: CardPackType[] = [
    "year_2013", "year_2014", "year_2015", "year_2016", "year_2017", 
    "year_2018", "year_2019", "year_2020", "year_2021", "year_2022", 
    "year_2023", "year_2024", "year_2025",
    "position_TOP", "position_JGL", "position_MID", "position_ADC", "position_SUP"
  ];
  
  for (const packType of packTypes) {
    const filteredPool = filterCardPoolByPack(cachedCardPool, packType);
    const gradeMap = new Map<Grade, LCKCard[]>();
    
    gradeMap.set("S", filteredPool.filter(c => c.grade === "S"));
    gradeMap.set("A", filteredPool.filter(c => c.grade === "A"));
    gradeMap.set("B", filteredPool.filter(c => c.grade === "B"));
    gradeMap.set("C", filteredPool.filter(c => c.grade === "C"));
    
    cachedPackPools.set(packType, gradeMap);
  }
}

// 카드팩별 필터링
function filterCardPoolByPack(pool: LCKCard[], packType: CardPackType): LCKCard[] {
  if (packType === "standard") return pool;
  
  // 연도별 필터
  if (packType.startsWith("year_")) {
    const year = parseInt(packType.split("_")[1]);
    return pool.filter(c => c.year === year);
  }
  
  // 포지션별 필터
  if (packType.startsWith("position_")) {
    const position = packType.split("_")[1] as Position;
    return pool.filter(c => c.position === position);
  }
  
  return pool;
}

// 등급별 카드 가져오기 (카드팩별 캐시 사용)
function getCardsByGradeCached(grade: Grade, packType: CardPackType = "standard"): LCKCard[] {
  if (packType === "standard") {
    return cachedGradeMap.get(grade) || [];
  }
  
  const packPool = cachedPackPools.get(packType);
  return packPool?.get(grade) || [];
}

/**
 * S 등급 확률 계산 (소프트 천장 포함)
 */
export function calculateSRate(s_pity_stack: number): number {
  const baseRate = GACHA_CONFIG.BASE_RATES.S;
  
  if (s_pity_stack < GACHA_CONFIG.S_PITY_SOFT_START) {
    return baseRate;
  }
  
  // 소프트 천장: 40 이상부터 매 뽑기마다 +0.5%p
  const softBonus = (s_pity_stack - GACHA_CONFIG.S_PITY_SOFT_START) * GACHA_CONFIG.S_PITY_SOFT_BONUS;
  return Math.min(baseRate + softBonus, 1.0);
}

/**
 * 단일 가챠 뽑기
 */
export function pullSingle(gachaState: GachaState, ownedCardIds: string[], packType: CardPackType = "standard"): GachaResult {
  // 카드 풀이 초기화되지 않았으면 에러
  if (!cachedCardPool || cachedCardPool.length === 0) {
    throw new Error("카드 풀이 초기화되지 않았습니다. initializeCardPool()을 먼저 호출하세요.");
  }

  let selectedCard: LCKCard | undefined;
  let isPity = false;

  // 하드 천장 체크
  if (gachaState.s_pity_stack >= GACHA_CONFIG.S_PITY_HARD) {
    // 무조건 S 등급
    const sCards = getCardsByGradeCached("S", packType);
    if (sCards.length === 0) {
      // 해당 팩에 S등급이 없으면 표준 풀에서 선택
      const standardSCards = getCardsByGradeCached("S", "standard");
      selectedCard = standardSCards[Math.floor(Math.random() * standardSCards.length)];
    } else {
      selectedCard = sCards[Math.floor(Math.random() * sCards.length)];
    }
    isPity = true;
  } else if (gachaState.a_pity_stack >= GACHA_CONFIG.A_PITY_HARD) {
    // A 이상 확정
    const aOrAbove = [...getCardsByGradeCached("S", packType), ...getCardsByGradeCached("A", packType)];
    if (aOrAbove.length === 0) {
      // 해당 팩에 A+가 없으면 표준 풀에서 선택
      const standardAOrAbove = [...getCardsByGradeCached("S", "standard"), ...getCardsByGradeCached("A", "standard")];
      selectedCard = standardAOrAbove[Math.floor(Math.random() * standardAOrAbove.length)];
    } else {
      selectedCard = aOrAbove[Math.floor(Math.random() * aOrAbove.length)];
    }
    isPity = true;
  } else {
    // 일반 확률
    const sRate = calculateSRate(gachaState.s_pity_stack);
    const rand = Math.random();
    
    let grade: Grade;
    if (rand < sRate) {
      grade = "S";
    } else if (rand < sRate + GACHA_CONFIG.BASE_RATES.A) {
      grade = "A";
    } else if (rand < sRate + GACHA_CONFIG.BASE_RATES.A + GACHA_CONFIG.BASE_RATES.B) {
      grade = "B";
    } else {
      grade = "C";
    }
    
    const cardsOfGrade = getCardsByGradeCached(grade, packType);
    if (cardsOfGrade.length === 0) {
      // 해당 팩에 해당 등급이 없으면 표준 풀에서 선택
      const standardCards = getCardsByGradeCached(grade, "standard");
      selectedCard = standardCards[Math.floor(Math.random() * standardCards.length)];
    } else {
      selectedCard = cardsOfGrade[Math.floor(Math.random() * cardsOfGrade.length)];
    }
  }

  // selectedCard가 여전히 undefined면 에러
  if (!selectedCard) {
    throw new Error("카드를 선택할 수 없습니다. 카드 풀이 비어있거나 초기화되지 않았습니다.");
  }

  // 중복 체크
  const isDupe = ownedCardIds.includes(selectedCard.id);
  const shardsGained = isDupe ? GACHA_CONFIG.SHARD_VALUES[selectedCard.grade] : 0;

  return {
    card: selectedCard,
    isDupe,
    shardsGained,
    isPity
  };
}

/**
 * 10연차
 */
export function pullTen(gachaState: GachaState, ownedCardIds: string[], packType: CardPackType = "standard"): GachaResult[] {
  const results: GachaResult[] = [];
  let tempState = { ...gachaState };
  let tempOwnedIds = [...ownedCardIds];
  
  for (let i = 0; i < 10; i++) {
    const result = pullSingle(tempState, tempOwnedIds, packType);
    results.push(result);
    
    // 임시로 보유 카드에 추가 (중복 방지용)
    if (!result.isDupe) {
      tempOwnedIds.push(result.card.id);
    }
    
    // 천장 업데이트
    if (result.card.grade === "S") {
      tempState.s_pity_stack = 0;
      tempState.a_pity_stack = 0;
    } else if (result.card.grade === "A") {
      tempState.s_pity_stack++;
      tempState.a_pity_stack = 0;
    } else {
      tempState.s_pity_stack++;
      tempState.a_pity_stack++;
    }
    tempState.total_pulls++;
  }
  
  // 10연차 보장: A 이상 최소 1장
  const hasAOrAbove = results.some(r => r.card.grade === "S" || r.card.grade === "A");
  if (!hasAOrAbove) {
    // 마지막 카드를 A로 변경
    let aCards = getCardsByGradeCached("A", packType);
    if (aCards.length === 0) {
      // 해당 팩에 A등급이 없으면 표준 풀에서 선택
      aCards = getCardsByGradeCached("A", "standard");
    }
    const replacementCard = aCards[Math.floor(Math.random() * aCards.length)];
    const isDupe = tempOwnedIds.includes(replacementCard.id);
    
    results[9] = {
      card: replacementCard,
      isDupe,
      shardsGained: isDupe ? GACHA_CONFIG.SHARD_VALUES.A : 0,
      isPity: true
    };
  }
  
  return results;
}

/**
 * 가챠 상태 업데이트
 */
export function updateGachaState(
  currentState: GachaState,
  results: GachaResult[]
): GachaState {
  let newState = { ...currentState };
  
  for (const result of results) {
    if (result.card.grade === "S") {
      newState.s_pity_stack = 0;
      newState.a_pity_stack = 0;
    } else if (result.card.grade === "A") {
      newState.s_pity_stack++;
      newState.a_pity_stack = 0;
    } else {
      newState.s_pity_stack++;
      newState.a_pity_stack++;
    }
    newState.total_pulls++;
  }
  
  return newState;
}

/**
 * 샤드로 카드 제작
 */
export function craftCard(grade: "A" | "S"): LCKCard {
  const cards = getCardsByGradeCached(grade);
  return cards[Math.floor(Math.random() * cards.length)];
}