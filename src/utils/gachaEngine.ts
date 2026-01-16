// LCK 가챠 엔진: 확률 계산, 천장 시스템, 샤드 지급

import { LCKCard, GachaState, GachaResult, GACHA_CONFIG, Grade } from "@/types/lck";
import { getCardPool, getCardsByGrade } from "@/data/sampleCards";

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
export function pullSingle(gachaState: GachaState, ownedCardIds: string[]): GachaResult {
  const pool = getCardPool();
  let selectedCard: LCKCard;
  let isPity = false;

  // 하드 천장 체크
  if (gachaState.s_pity_stack >= GACHA_CONFIG.S_PITY_HARD) {
    // 무조건 S 등급
    const sCards = getCardsByGrade("S");
    selectedCard = sCards[Math.floor(Math.random() * sCards.length)];
    isPity = true;
  } else if (gachaState.a_pity_stack >= GACHA_CONFIG.A_PITY_HARD) {
    // A 이상 확정
    const aOrAbove = [...getCardsByGrade("S"), ...getCardsByGrade("A")];
    selectedCard = aOrAbove[Math.floor(Math.random() * aOrAbove.length)];
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
    
    const cardsOfGrade = getCardsByGrade(grade);
    selectedCard = cardsOfGrade[Math.floor(Math.random() * cardsOfGrade.length)];
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
export function pullTen(gachaState: GachaState, ownedCardIds: string[]): GachaResult[] {
  const results: GachaResult[] = [];
  let tempState = { ...gachaState };
  let tempOwnedIds = [...ownedCardIds];
  
  for (let i = 0; i < 10; i++) {
    const result = pullSingle(tempState, tempOwnedIds);
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
    const aCards = getCardsByGrade("A");
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
  const cards = getCardsByGrade(grade);
  return cards[Math.floor(Math.random() * cards.length)];
}
