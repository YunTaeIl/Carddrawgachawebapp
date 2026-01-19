// 유저 데이터 관리 API
import { createClient } from "jsr:@supabase/supabase-js@2.49.8";

// 관리용 클라이언트 (SERVICE_ROLE_KEY)
const supabaseAdmin = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

// 인증용 클라이언트 (ANON_KEY)
const supabaseAuth = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!,
);

// 유저 인증 확인
export async function getUserFromToken(authHeader: string | null) {
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("❌ Authorization 헤더 없음 또는 형식 오류");
    return null;
  }
  
  const token = authHeader.substring(7);
  console.log("🔑 토큰 검증 시작, 토큰 길이:", token.length);
  
  try {
    // ANON_KEY로 생성한 클라이언트로 토큰 검증
    const { data: { user }, error } = await supabaseAuth.auth.getUser(token);
    
    if (error) {
      console.error("❌ 토큰 검증 실패 (supabaseAuth):", error.message);
      
      // 대안: supabaseAdmin으로 시도
      const { data: { user: adminUser }, error: adminError } = await supabaseAdmin.auth.getUser(token);
      
      if (adminError || !adminUser) {
        console.error("❌ 토큰 검증 실패 (supabaseAdmin):", adminError?.message);
        return null;
      }
      
      console.log("✅ 인증 성공 (admin 클라이언트):", adminUser.id);
      return adminUser;
    }
    
    if (!user) {
      console.error("❌ 토큰은 유효하지만 사용자 정보 없음");
      return null;
    }
    
    console.log("✅ 인증 성공 (auth 클라이언트):", user.id);
    return user;
  } catch (err) {
    console.error("❌ 예외 발생:", err);
    return null;
  }
}

// 유저 프로필 생성
export async function createUserProfile(userId: string, username: string) {
  // 1. 프로필 생성
  const { data: profile, error: profileError } = await supabaseAdmin
    .from("user_profiles")
    .insert({ id: userId, username })
    .select()
    .single();
  
  if (profileError) {
    console.error("Profile creation error:", profileError);
    throw new Error(`Failed to create profile: ${profileError.message}`);
  }
  
  // 2. 게임 데이터 초기화
  const { error: gameDataError } = await supabaseAdmin
    .from("user_game_data")
    .insert({
      user_id: userId,
      currency: 10000, // 초기 RP
      shards: 0,
      s_pity_stack: 0,
      a_pity_stack: 0,
      total_pulls: 0
    });
  
  if (gameDataError) {
    console.error("Game data initialization error:", gameDataError);
    throw new Error(`Failed to initialize game data: ${gameDataError.message}`);
  }
  
  // 3. 스쿼드 초기화
  const { error: squadError } = await supabaseAdmin
    .from("user_squads")
    .insert({
      user_id: userId,
      top_card_instance_id: null,
      jgl_card_instance_id: null,
      mid_card_instance_id: null,
      adc_card_instance_id: null,
      sup_card_instance_id: null
    });
  
  if (squadError) {
    console.error("Squad initialization error:", squadError);
    throw new Error(`Failed to initialize squad: ${squadError.message}`);
  }
  
  return profile;
}

// 유저 프로필 조회
export async function getUserProfile(userId: string) {
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
    .from("user_game_data")
    .select("*")
    .eq("user_id", userId)
    .single();
  
  if (error) {
    console.error("Get game data error:", error);
    return null;
  }
  
  return data;
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
  const { data, error } = await supabaseAdmin
    .from("user_game_data")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("user_id", userId)
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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
  const { data, error } = await supabaseAdmin
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