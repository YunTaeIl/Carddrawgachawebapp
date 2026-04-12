// Supabase 인증 유틸리티

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey, authStorageKey } from '@/utils/supabase/info';

const supabaseUrl = `https://${projectId}.supabase.co`;

// 🔥 프로젝트 정보 re-export (다른 파일에서 사용 가능)
export { projectId, publicAnonKey };

// 🔥 싱글톤 Supabase 클라이언트 (중복 생성 방지)
export const supabase = createClient(supabaseUrl, publicAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: authStorageKey,
    flowType: 'pkce'
  }
});

/**
 * Google OAuth 로그인
 */
export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.origin
    }
  });
  
  if (error) throw error;
  return data;
}

/**
 * Kakao OAuth 로그인
 */
export async function signInWithKakao() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'kakao',
    options: {
      redirectTo: window.location.origin
    }
  });
  
  if (error) throw error;
  return data;
}

/**
 * 로그아웃
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * 현재 세션 가져오기
 */
export async function getSession() {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
}

/**
 * 현재 유저 가져오기
 */
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

/**
 * 회원가입 후 프로필 생성
 */
export async function createUserProfile(userId: string, username: string) {
  // 1. 프로필 생성
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: userId,
      username: username
    });
  
  if (profileError) throw profileError;

  // 2. 게임 데이터 초기화
  const { error: gameDataError } = await supabase
    .from('user_game_data')
    .insert({
      id: userId,
      currency: 10000,
      shards: 0,
      s_pity_stack: 0,
      a_pity_stack: 0,
      total_pulls: 0
    });
  
  if (gameDataError) throw gameDataError;

  // 3. 스쿼드 슬롯 초기화
  const positions = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];
  const squadSlots = positions.map(pos => ({
    user_id: userId,
    position: pos,
    card_instance_id: null
  }));

  const { error: squadError } = await supabase
    .from('user_squads')
    .insert(squadSlots);
  
  if (squadError) throw squadError;
}

/**
 * 유저 프로필 존재 여부 확인
 */
export async function checkUserProfileExists(userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('id', userId)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
  return !!data;
}

/**
 * 닉네임 중복 체크
 */
export async function checkUsernameExists(username: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('username', username)
    .single();
  
  if (error && error.code !== 'PGRST116') throw error;
  return !!data;
}
