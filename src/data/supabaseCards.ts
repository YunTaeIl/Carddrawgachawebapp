// Supabase KV Store에서 LCK 카드 데이터 가져오기

import { LCKCard } from '@/types/lck';
import { fetchAllCards, fetchCardById } from '@/utils/supabaseApi';

// 모든 카드 가져오기
export async function getAllCards(): Promise<LCKCard[]> {
  try {
    const cards = await fetchAllCards();
    return cards;
  } catch (error) {
    console.error('카드 데이터 로드 실패:', error);
    return [];
  }
}

// 등급별 카드 가져오기
export async function getCardsByGrade(grade: 'S' | 'A' | 'B' | 'C'): Promise<LCKCard[]> {
  try {
    const allCards = await fetchAllCards();
    return allCards.filter(card => card.grade === grade);
  } catch (error) {
    console.error('등급별 카드 데이터 로드 실패:', error);
    return [];
  }
}

// ID로 카드 가져오기
export async function getCardById(id: string): Promise<LCKCard | null> {
  try {
    return await fetchCardById(id);
  } catch (error) {
    console.error('카드 ID 조회 실패:', error);
    return null;
  }
}

// 카드 풀 전체 (가챠용)
export async function getCardPool(): Promise<LCKCard[]> {
  return getAllCards();
}
