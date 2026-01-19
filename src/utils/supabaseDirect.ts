// Supabase 직접 접근 (클라이언트용)
import { createClient, User } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";
import { UserCard } from "@/types/lck";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

// 게임 데이터 업데이트
export async function updateGameDataDirect(
  user: User,
  updates: {
    currency?: number;
    shards?: number;
    s_pity_stack?: number;
    a_pity_stack?: number;
    total_pulls?: number;
  }
) {
  const { data, error } = await supabase
    .from("user_game_data")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", user.id)
    .select()
    .single();
  
  if (error) {
    console.error("게임 데이터 업데이트 실패:", error);
    throw error;
  }
  
  return data;
}

// 카드 추가
export async function addUserCardDirect(
  user: User,
  cardId: string,
  instanceId: string,
  upgradeLevel: number = 0
) {
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
    console.error("카드 추가 실패:", error);
    throw error;
  }
  
  return data;
}

// 카드 강화
export async function upgradeUserCardDirect(
  user: User,
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
    console.error("카드 강화 실패:", error);
    throw error;
  }
  
  return data;
}

// 보유 카드 조회
export async function getUserCardsDirect(userId: string) {
  const { data, error } = await supabase
    .from("user_cards")
    .select("*")
    .eq("user_id", userId)
    .order("obtained_at", { ascending: false });
  
  if (error) {
    console.error("카드 조회 실패:", error);
    throw error;
  }
  
  return data || [];
}

// 게임 데이터 조회
export async function getGameDataDirect(userId: string) {
  const { data, error } = await supabase
    .from("user_game_data")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) {
    console.error("게임 데이터 조회 실패:", error);
    throw error;
  }
  
  return data;
}