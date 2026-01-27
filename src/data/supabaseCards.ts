// Supabase 카드 데이터 레이어

import { LCKCard, isLiveCard } from '@/types/lck';
import { fetchAllCards, fetchCardById } from '@/utils/supabaseApi';

// 🔥 LIVE 카드 스탯 보정 (+10 보너스)
function applyLiveBonus(card: LCKCard): LCKCard {
  if (!isLiveCard(card)) return card;
  
  return {
    ...card,
    stats: {
      ovr: card.stats.ovr + 10,
      mechanics: card.stats.mechanics + 10,
      laning: card.stats.laning + 10,
      teamfight: card.stats.teamfight + 10,
      macro: card.stats.macro + 10,
      clutch: card.stats.clutch + 10
    }
  };
}

// 모든 카드 가져오기
export async function getAllCards(): Promise<LCKCard[]> {
  try {
    const cards = await fetchAllCards();
    // 🔥 LIVE 카드에 보너스 적용
    return cards.map(applyLiveBonus);
  } catch (error) {
    return [];
  }
}

// 등급별 카드 가져오기
export async function getCardsByGrade(grade: "S" | "A" | "B" | "C"): Promise<LCKCard[]> {
  try {
    const allCards = await getAllCards();
    return allCards.filter(card => card.grade === grade);
  } catch (error) {
    return [];
  }
}

// 카드 ID로 가져오기
export async function getCardByIdFromDB(id: string): Promise<LCKCard | null> {
  try {
    const card = await fetchCardById(id);
    // 🔥 LIVE 카드에 보너스 적용
    return card ? applyLiveBonus(card) : null;
  } catch (error) {
    return null;
  }
}

// 카드 풀 전체 (가챠용)
export async function getCardPool(): Promise<LCKCard[]> {
  return getAllCards();
}