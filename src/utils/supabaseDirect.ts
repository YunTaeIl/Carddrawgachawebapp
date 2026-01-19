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
  console.log("🔍 getUserCardsDirect 시작, accessToken:", accessToken.substring(0, 30) + "...");
  
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
  
  console.log("🔐 인증 사용자 확인 중...");
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError) {
    console.error("❌ 인증 에러:", authError);
    throw authError;
  }
  
  if (!user) {
    console.error("❌ 사용자 없음");
    throw new Error("인증되지 않은 사용자입니다.");
  }
  
  console.log("✅ 인증된 사용자 ID:", user.id);
  console.log("📊 user_cards 테이블 조회 중... WHERE user_id =", user.id);
  
  const { data, error } = await supabase
    .from("user_cards")
    .select("*")
    .eq("user_id", user.id)
    .order("obtained_at", { ascending: false });
  
  if (error) {
    console.error("❌ 카드 조회 에러:", error);
    console.error("에러 상세:", JSON.stringify(error, null, 2));
    throw error;
  }
  
  console.log("✅ user_cards 조회 결과:", data);
  console.log(`📦 총 ${data?.length || 0}개 카드 발견`);
  
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