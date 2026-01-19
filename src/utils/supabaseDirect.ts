// Supabase 직접 접근 (클라이언트용)
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

// 게임 데이터 조회
export async function getGameDataDirect(accessToken: string) {
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_game_data")
    .select("*")
    .eq("user_id", user.id)
    .single();
  
  if (error) {
    console.error("게임 데이터 조회 실패:", error);
    throw error;
  }
  
  return data;
}

// 보유 카드 조회
export async function getUserCardsDirect(accessToken: string) {
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  const { data, error } = await supabase
    .from("user_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("obtained_at", { ascending: false });
  
  if (error) {
    console.error("카드 조회 실패:", error);
    throw error;
  }
  
  return data || [];
}

// 게임 데이터 업데이트
export async function updateGameDataDirect(
  accessToken: string,
  updates: {
    currency?: number;
    shards?: number;
    s_pity_stack?: number;
    a_pity_stack?: number;
    total_pulls?: number;
  }
) {
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
  
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
    console.error("게임 데이터 업데이트 실패:", error);
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
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
  
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
    console.error("카드 추가 실패:", error);
    throw error;
  }
  
  return data;
}

// 카드 강화
export async function upgradeUserCardDirect(
  accessToken: string,
  instanceId: string,
  newLevel: number
) {
  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    }
  );
  
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