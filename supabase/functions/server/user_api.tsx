// 유저 데이터 관리 API
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// 유저 인증용 클라이언트 (ANON KEY 사용)
const supabaseAuth = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

// 유저 인증 확인
export async function getUserFromToken(authHeader: string | null) {
  console.log("🔐 getUserFromToken called, authHeader:", authHeader ? `Bearer ${authHeader.substring(7, 20)}...` : "NULL");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.error("❌ Invalid auth header format");
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log("🔑 Extracted token:", token.substring(0, 20) + "...");
  
  // ANON KEY 클라이언트로 사용자 확인
  const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
  
  if (error || !user) {
    console.error("❌ Auth error:", error);
    return null;
  }
  
  console.log("✅ User authenticated:", user.id);
  return user;
}

// 유저 프로필 조회
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (error) {
    console.error("Get profile error:", error);
    return null;
  }
  
  return data;
}

// 게임 데이터 조회
export async function getGameData(userId: string) {
  // user_game_data와 user_profiles를 조인하여 is_admin 가져오기
  const { data, error } = await supabase
    .from("user_game_data")
    .select(`
      *,
      user_profiles!inner (
        is_admin
      )
    `)
    .eq("user_id", userId)  // user_id를 키로 사용
    .single();
  
  if (error) {
    console.error("Get game data error:", error);
    return null;
  }
  
  // is_admin 값을 최상위로 추출
  const isAdmin = data?.user_profiles?.is_admin || false;
  
  return {
    ...data,
    is_admin: isAdmin
  };
}

// 게임 데이터 업데이트
export async function updateGameData(
  userId: string,
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
    .eq("user_id", userId)  // user_id를 키로 사용
    .select()
    .single();
  
  if (error) {
    console.error("Update game data error:", error);
    throw new Error(`Failed to update game data: ${error.message}`);
  }
  
  return data;
}

// 보유 카드 조회
export async function getUserCards(userId: string) {
  const { data, error } = await supabase
    .from("user_cards")
    .select("*")
    .eq("user_id", userId)
    .order("obtained_at", { ascending: false });
  
  if (error) {
    console.error("Get user cards error:", error);
    return [];
  }
  
  return data || [];
}

// 카드 추가
export async function addUserCard(
  userId: string,
  cardId: string,
  instanceId: string,
  upgradeLevel: number = 0
) {
  const { data, error } = await supabase
    .from("user_cards")
    .insert({
      user_id: userId,
      card_id: cardId,
      instance_id: instanceId,
      upgrade_level: upgradeLevel,
      obtained_at: new Date().toISOString()
    })
    .select()
    .single();
  
  if (error) {
    console.error("Add user card error:", error);
    throw new Error(`Failed to add card: ${error.message}`);
  }
  
  return data;
}

// 카드 강화
export async function upgradeUserCard(instanceId: string, newLevel: number) {
  const { data, error } = await supabase
    .from("user_cards")
    .update({ upgrade_level: newLevel })
    .eq("instance_id", instanceId)
    .select()
    .single();
  
  if (error) {
    console.error("Upgrade card error:", error);
    throw new Error(`Failed to upgrade card: ${error.message}`);
  }
  
  return data;
}

// 스쿼드 조회
export async function getUserSquad(userId: string) {
  const { data, error } = await supabase
    .from("user_squads")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) {
    console.error("Get squad error:", error);
    return null;
  }
  
  return data;
}

// 스쿼드 업데이트
export async function updateUserSquad(
  userId: string,
  squad: {
    top_card_instance_id?: string | null;
    jgl_card_instance_id?: string | null;
    mid_card_instance_id?: string | null;
    adc_card_instance_id?: string | null;
    sup_card_instance_id?: string | null;
  }
) {
  const { data, error } = await supabase
    .from("user_squads")
    .update({ ...squad, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
    .select()
    .single();
  
  if (error) {
    console.error("Update squad error:", error);
    throw new Error(`Failed to update squad: ${error.message}`);
  }
  
  return data;
}

// 출석 체크
export async function checkDailyAttendance(userId: string) {
  // 1. 현재 게임 데이터 조회
  const gameData = await getGameData(userId);
  if (!gameData) {
    throw new Error("Game data not found");
  }
  
  // 2. 마지막 출석 체크 시간 확인
  const lastCheckIn = gameData.last_check_in ? new Date(gameData.last_check_in) : null;
  const now = new Date();
  
  // 한국 시간 기준 자정 계산 (UTC+9)
  const koreaOffset = 9 * 60; // 9시간을 분으로
  const nowKorea = new Date(now.getTime() + koreaOffset * 60 * 1000);
  const todayKorea = new Date(nowKorea.getFullYear(), nowKorea.getMonth(), nowKorea.getDate());
  
  let lastCheckInKorea = null;
  if (lastCheckIn) {
    const lastCheckInKoreaTime = new Date(lastCheckIn.getTime() + koreaOffset * 60 * 1000);
    lastCheckInKorea = new Date(lastCheckInKoreaTime.getFullYear(), lastCheckInKoreaTime.getMonth(), lastCheckInKoreaTime.getDate());
  }
  
  // 3. 오늘 이미 출석했는지 확인
  if (lastCheckInKorea && lastCheckInKorea.getTime() === todayKorea.getTime()) {
    return {
      success: false,
      message: "이미 오늘 출석했습니다.",
      nextCheckIn: new Date(todayKorea.getTime() + 24 * 60 * 60 * 1000 - koreaOffset * 60 * 1000).toISOString()
    };
  }
  
  // 4. 출석 보상 지급 (5000 RP)
  const newCurrency = gameData.currency + 5000;
  
  const { data, error } = await supabase
    .from("user_game_data")
    .update({ 
      currency: newCurrency,
      last_check_in: now.toISOString(),
      updated_at: now.toISOString()
    })
    .eq("user_id", userId)  // user_id를 키로 사용
    .select()
    .single();
  
  if (error) {
    console.error("Check-in error:", error);
    throw new Error(`Failed to check in: ${error.message}`);
  }
  
  return {
    success: true,
    reward: 5000,
    newCurrency: newCurrency,
    message: "출석 완료! 5,000 RP를 받았습니다.",
    nextCheckIn: new Date(todayKorea.getTime() + 24 * 60 * 60 * 1000 - koreaOffset * 60 * 1000).toISOString()
  };
}