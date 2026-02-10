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

// 🆕 유저 초기화 (OAuth 로그인 후 자동 생성)
export async function initializeUser(userId: string, email: string, displayName?: string) {
  console.log("🔥 initializeUser called for:", userId, email);
  
  try {
    // 1. user_profiles 확인 및 생성
    const { data: existingProfile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (!existingProfile) {
      console.log("📝 Creating user_profiles...");
      
      // username 중복 처리 (윤태일 -> 윤태일1 -> 윤태일2 ...)
      let baseUsername = displayName || email.split("@")[0];
      let finalUsername = baseUsername;
      let suffix = 0;
      let usernameExists = true;
      
      while (usernameExists) {
        const { data: existingUser } = await supabase
          .from("user_profiles")
          .select("username")
          .eq("username", finalUsername)
          .single();
        
        if (!existingUser) {
          usernameExists = false;
        } else {
          suffix += 1;
          finalUsername = baseUsername + suffix;
        }
      }
      
      console.log(`📝 Final username: ${finalUsername}`);
      
      const { error: profileError } = await supabase
        .from("user_profiles")
        .insert({
          id: userId,
          username: finalUsername,  // 중복 처리된 username
          is_admin: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (profileError) {
        console.error("❌ Failed to create user_profiles:", profileError);
        throw profileError;
      }
      console.log("✅ user_profiles created");
    } else {
      console.log("✅ user_profiles already exists");
    }
    
    // 2. user_game_data 확인 및 생성
    const { data: existingGameData } = await supabase
      .from("user_game_data")
      .select("*")
      .eq("id", userId)
      .single();
    
    if (!existingGameData) {
      console.log("📝 Creating user_game_data...");
      const { error: gameDataError } = await supabase
        .from("user_game_data")
        .insert({
          id: userId,
          currency: 50000,
          shards: 0,
          s_pity_stack: 0,
          a_pity_stack: 0,
          total_pulls: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (gameDataError) {
        console.error("❌ Failed to create user_game_data:", gameDataError);
        throw gameDataError;
      }
      console.log("✅ user_game_data created");
    } else {
      console.log("✅ user_game_data already exists");
    }
    
    // 3. user_squads 확인 및 생성
    const { data: existingSquad } = await supabase
      .from("user_squads")
      .select("*")
      .eq("user_id", userId)
      .single();
    
    if (!existingSquad) {
      console.log("📝 Creating user_squads...");
      const { error: squadError } = await supabase
        .from("user_squads")
        .insert({
          user_id: userId,
          top_card_instance_id: null,
          jgl_card_instance_id: null,
          mid_card_instance_id: null,
          adc_card_instance_id: null,
          sup_card_instance_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
      
      if (squadError) {
        console.error("❌ Failed to create user_squads:", squadError);
        throw squadError;
      }
      console.log("✅ user_squads created");
    } else {
      console.log("✅ user_squads already exists");
    }
    
    return { success: true, message: "User initialized successfully" };
  } catch (error) {
    console.error("❌ initializeUser failed:", error);
    throw error;
  }
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
  // 먼저 game_data 조회
  const { data: gameData, error: gameError } = await supabase
    .from("user_game_data")
    .select("*")
    .eq("id", userId)
    .single();
  
  if (gameError) {
    console.error("Get game data error:", gameError);
    return null;
  }
  
  // 별도로 user_profiles에서 is_admin 조회
  const { data: profileData, error: profileError } = await supabase
    .from("user_profiles")
    .select("is_admin")
    .eq("id", userId)
    .single();
  
  const isAdmin = profileData?.is_admin || false;
  
  return {
    ...gameData,
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
    .eq("id", userId)  // id를 키로 사용
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
    .eq("id", userId)  // id를 키로 사용
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

// ==================== 도감 API ====================

// 도감에 카드 추가 (획득 기록)
export async function discoverCards(userId: string, cardKeys: string[]) {
  console.log(`🔍 Discovering cards for user ${userId}:`, cardKeys);
  
  // 기존 도감 가져오기
  const { data: existingData, error: fetchError } = await supabase
    .from("kv_store_ffd115c0")
    .select("value")
    .eq("key", `codex:${userId}`)
    .single();
  
  let discoveredSet = new Set<string>();
  
  if (existingData && existingData.value) {
    discoveredSet = new Set(existingData.value as string[]);
  }
  
  // 새로운 카드 추가
  cardKeys.forEach(key => discoveredSet.add(key));
  const discoveredArray = Array.from(discoveredSet);
  
  // 저장
  const { error: upsertError } = await supabase
    .from("kv_store_ffd115c0")
    .upsert({
      key: `codex:${userId}`,
      value: discoveredArray
    }, {
      onConflict: "key"
    });
  
  if (upsertError) {
    console.error("Error saving codex:", upsertError);
    throw new Error(`Failed to save codex: ${upsertError.message}`);
  }
  
  console.log(`✅ Codex updated. Total discovered: ${discoveredArray.length}`);
  return discoveredArray;
}

// 도감 조회
export async function getDiscoveredCards(userId: string) {
  const { data, error } = await supabase
    .from("kv_store_ffd115c0")
    .select("value")
    .eq("key", `codex:${userId}`)
    .single();
  
  if (error) {
    if (error.code === "PGRST116") {
      // 도감 데이터가 없으면 빈 배열 반환
      return [];
    }
    console.error("Error fetching codex:", error);
    throw new Error(`Failed to fetch codex: ${error.message}`);
  }
  
  return (data?.value as string[]) || [];
}