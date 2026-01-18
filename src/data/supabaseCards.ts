// Supabase 카드 데이터 레이어

import { LCKCard } from '@/types/lck';
import { fetchAllCards, fetchCardById } from '@/utils/supabaseApi';

// 모든 카드 가져오기
export async function getAllCards(): Promise<LCKCard[]> {
  try {
    const cards = await fetchAllCards();
    return cards;
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
    return await fetchCardById(id);
  } catch (error) {
    return null;
  }
}

// 카드 풀 전체 (가챠용)
export async function getCardPool(): Promise<LCKCard[]> {
  return getAllCards();
}