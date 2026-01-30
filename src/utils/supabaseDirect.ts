// Supabase 직접 접근 (클라이언트용)
// 🔥 싱글톤 인스턴스 재사용 - 중복 생성 방지
import { supabase } from "@/utils/supabaseAuth";

// 게임 데이터 조회
export async function getGameDataDirect(accessToken: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  // user_game_data 조회
  const { data: gameData, error: gameError } = await supabase
    .from("user_game_data")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (gameError) {
    throw gameError;
  }
  
  // user_profiles에서 is_admin 조회
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();
  
  const isAdmin = profileData?.is_admin || false;
  
  return {
    ...gameData,
    is_admin: isAdmin
  };
}

// 보유 카드 조회
export async function getUserCardsDirect(accessToken: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  // 모든 카드 가져오기 (페이지네이션)
  let allCards: any[] = [];
  let page = 0;
  const pageSize = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from("user_cards")
      .select("*", { count: 'exact' })
      .eq("user_id", user.id)
      .order("obtained_at", { ascending: false })
      .range(page * pageSize, (page + 1) * pageSize - 1);
    
    if (error) {
      throw error;
    }
    
    if (!data || data.length === 0) {
      break;
    }
    
    allCards = [...allCards, ...data];
    
    if (data.length < pageSize) {
      break;
    }
    
    page++;
  }
  
  return allCards;
}

// 🔥 게임 데이터 업데이트 (팩별 천장 시스템)
export async function updateGameDataDirect(
  accessToken: string,
  updates: {
    currency?: number;
    shards?: number;
    pity_data?: any; // 🔥 JSONB
    pack_statistics?: any; // 🔥 JSONB
  }
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_game_data")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 카드 추가
export async function addUserCardDirect(
  accessToken: string,
  cardId: string,
  instanceId: string,
  upgradeLevel: number = 0
) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_cards")
    .insert({
      user_id: user.id,
      card_id: cardId,
      instance_id: instanceId,
      upgrade_level: upgradeLevel,
      obtained_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 카드 강화 (레벨만)
export async function upgradeUserCardDirect(
  accessToken: string,
  instanceId: string,
  newLevel: number
) {
  const { data, error } = await supabase
    .from("user_cards")
    .update({ upgrade_level: newLevel })
    .eq("instance_id", instanceId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 🔧 카드 강화 (레벨 + 스탯)
export async function updateUserCardStats(
  accessToken: string,
  instanceId: string,
  newLevel: number,
  stats: {
    ovr: number;
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  }
) {
  const { data, error } = await supabase
    .from("user_cards")
    .update({ 
      upgrade_level: newLevel,
      mechanics: stats.mechanics,
      laning: stats.laning,
      teamfight: stats.teamfight,
      macro: stats.macro,
      clutch: stats.clutch
    })
    .eq("instance_id", instanceId)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 🔧 카드 삭제 (파괴 시)
export async function deleteUserCard(
  accessToken: string,
  instanceId: string
) {
  const { error } = await supabase
    .from("user_cards")
    .delete()
    .eq("instance_id", instanceId);
  
  if (error) {
    throw error;
  }
}

// 스쿼드 저장
export async function saveUserSquadDirect(
  accessToken: string,
  squad: {
    top_card_instance_id?: string | null;
    jgl_card_instance_id?: string | null;
    mid_card_instance_id?: string | null;
    adc_card_instance_id?: string | null;
    sup_card_instance_id?: string | null;
  }
) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_squads")
    .upsert({
      user_id: user.id,
      ...squad,
      updated_at: new Date().toISOString()
    })
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}

// 스쿼드 불러오기
export async function getUserSquadDirect(accessToken: string) {
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_squads")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) {
    throw error;
  }
  
  return data;
}
