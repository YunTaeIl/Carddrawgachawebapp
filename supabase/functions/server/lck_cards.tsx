// LCK 카드 데이터 관리 (Supabase lck_cards 테이블 사용)

import { createClient } from 'jsr:@supabase/supabase-js@2';

export interface LCKCard {
  id: string;
  year: number;
  team: string;
  name: string;
  position: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
  grade: "S" | "A" | "B" | "C" | "LIVE";
  image: string;
  stats: {
    ovr: number;
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
}

// Supabase 클라이언트 생성
function getSupabaseClient() {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
}

// DB 로우를 LCKCard 형식으로 변환
function rowToCard(row: any): LCKCard {
  // 🔥 디버깅: DB 로우 확인
  console.log('🔥 DB Row:', {
    id: row.id,
    name: row.name,
    image: row.image,
    allKeys: Object.keys(row)
  });
  
  return {
    id: row.id,
    year: row.year,
    team: row.team,
    name: row.name,
    position: row.position,
    grade: row.grade,
    image: row.image || "",
    stats: {
      ovr: row.ovr,
      mechanics: row.mechanics,
      laning: row.laning,
      teamfight: row.teamfight,
      macro: row.macro,
      clutch: row.clutch
    }
  };
}

// LCKCard를 DB 로우 형식으로 변환
function cardToRow(card: LCKCard) {
  return {
    id: card.id,
    year: card.year,
    team: card.team,
    name: card.name,
    position: card.position,
    grade: card.grade,
    image: card.image || "",
    ovr: card.stats.ovr,
    mechanics: card.stats.mechanics,
    laning: card.stats.laning,
    teamfight: card.stats.teamfight,
    macro: card.stats.macro,
    clutch: card.stats.clutch
  };
}

// 모든 카드 가져오기
export async function getAllCards(): Promise<LCKCard[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('lck_cards')
    .select('*');
  
  if (error) {
    console.error('Error fetching cards:', error);
    return [];
  }
  
  return (data || []).map(rowToCard);
}

// 카드 ID로 가져오기
export async function getCardById(id: string): Promise<LCKCard | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('lck_cards')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error || !data) {
    return null;
  }
  
  return rowToCard(data);
}

// 여러 카드 한번에 가져오기
export async function getCardsByIds(ids: string[]): Promise<LCKCard[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from('lck_cards')
    .select('*')
    .in('id', ids);
  
  if (error) {
    console.error('Error fetching cards by IDs:', error);
    return [];
  }
  
  return (data || []).map(rowToCard);
}

// 카드 저장
export async function saveCard(card: LCKCard): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from('lck_cards')
    .upsert(cardToRow(card));
  
  if (error) {
    console.error('Error saving card:', error);
    throw error;
  }
}

// 여러 카드 한번에 저장
export async function saveCards(cards: LCKCard[]): Promise<void> {
  const supabase = getSupabaseClient();
  
  const rows = cards.map(cardToRow);
  
  const { error } = await supabase
    .from('lck_cards')
    .upsert(rows);
  
  if (error) {
    console.error('Error saving cards:', error);
    throw error;
  }
}