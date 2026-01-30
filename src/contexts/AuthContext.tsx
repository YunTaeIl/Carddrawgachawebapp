// 인증 상태 관리 Context (프로필 추가)

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/utils/supabaseAuth";
import { projectId } from "@/utils/supabase/info";

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signInGoogle: () => Promise<void>;
  signInKakao: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // 🆕 유저 초기화 (DB에 없으면 생성) - 클라이언트에서 직접 처리
  const initializeUserIfNeeded = async (userId: string, userEmail: string | null, displayName?: string) => {
    try {
      console.log("🔥 initializeUserIfNeeded called for:", userId, userEmail);
      
      // 1. user_profiles 확인
      const { data: existingProfile, error: profileError } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", userId)
        .single();
      
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116 = not found
        console.error("❌ Error checking profile:", profileError);
        return;
      }
      
      if (!existingProfile) {
        console.log("📝 Creating user_profiles...");
        const { error: insertError } = await supabase
          .from("user_profiles")
          .insert({
            id: userId,
            username: displayName || userEmail?.split("@")[0] || `User_${userId.substring(0, 8)}`,
            display_name: displayName || null,
            email: userEmail,
            gold: 0,
            shards: 0,
            is_admin: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        
        if (insertError) {
          console.error("❌ Failed to create profile:", insertError);
          return;
        }
        console.log("✅ Profile created");
      } else {
        console.log("✅ Profile already exists");
      }
      
      // 2. user_inventory 확인 (스타터 덱 지급)
      const { data: existingInventory, error: invError } = await supabase
        .from("user_inventory")
        .select("*")
        .eq("user_id", userId)
        .limit(1);
      
      if (invError) {
        console.error("❌ Error checking inventory:", invError);
        return;
      }
      
      if (!existingInventory || existingInventory.length === 0) {
        console.log("🎁 Giving starter gold and shards...");
        // 스타터 골드 지급 (서버 없이는 트랜잭션이 어려우니 간단히 처리)
        const { error: updateError } = await supabase
          .from("user_profiles")
          .update({
            gold: 5000, // 스타터 골드
            shards: 100, // 스타터 샤드
            updated_at: new Date().toISOString()
          })
          .eq("id", userId);
        
        if (updateError) {
          console.error("❌ Failed to give starter items:", updateError);
        } else {
          console.log("✅ Starter items given!");
        }
      }
      
      console.log("✅ User initialization complete");
    } catch (error) {
      console.error("❌ initializeUserIfNeeded error:", error);
    }
  };

  // 🔐 user_profiles에서 is_admin 확인
  const checkAdminStatus = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_admin')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error("Admin status check error:", error);
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(data?.is_admin ?? false);
    } catch (error) {
      console.error("Admin check failed:", error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      
      // 유저가 있으면 초기화 및 admin 상태 체크
      if (session?.user?.id) {
        await initializeUserIfNeeded(
          session.user.id, 
          session.user.email, 
          session.user.user_metadata?.full_name || session.user.user_metadata?.name
        );
        checkAdminStatus(session.user.id);
      }
      
      setIsLoading(false);
    }).catch((error) => {
      console.error("Session error:", error);
      setIsLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("🔥 Auth state changed:", event);
      
      const newUser = session?.user ?? null;
      setUser(newUser);
      setAccessToken(session?.access_token ?? null);
      
      // 🆕 SIGNED_IN 이벤트 시 유저 초기화
      if (event === 'SIGNED_IN' && session?.user?.id) {
        console.log("🔥 SIGNED_IN event - initializing user...");
        await initializeUserIfNeeded(
          session.user.id,
          session.user.email,
          session.user.user_metadata?.full_name || session.user.user_metadata?.name
        );
      }
      
      // 유저가 있으면 admin 상태 체크
      if (session?.user?.id) {
        checkAdminStatus(session.user.id);
      } else {
        setIsAdmin(false);
      }
      
      // 로그아웃 이벤트 또는 세션 만료 시 localStorage 클리어
      if (event === 'SIGNED_OUT' || !session) {
        localStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signInGoogle = async () => {
    console.log("🔵🔵🔵 signInGoogle 함수 호출됨!");
    console.log("🔵 현재 URL:", window.location.href);
    
    try {
      console.log("🔵 signInWithOAuth 호출 직전...");
      
      const result = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin + "/",
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          }
        },
      });
      
      console.log("🔍🔍🔍 FULL RESULT:", JSON.stringify(result, null, 2));
      console.log("🔍 data:", result.data);
      console.log("🔍 data.url:", result.data?.url);
      console.log("🔍 error:", result.error);
      
      if (result.error) {
        console.error("🔴🔴🔴 Google 로그인 에러:", result.error);
        console.error("🔴 에러 메시지:", result.error.message);
        console.error("🔴 에러 코드:", result.error.status);
        alert(`Google OAuth 에러: ${result.error.message}`);
        throw result.error;
      }
      
      if (!result.data?.url) {
        console.error("❌❌❌ data.url이 없습니다!");
        alert("Google OAuth URL을 받지 못했습니다. Supabase 설정을 확인하세요.");
        throw new Error("No OAuth URL returned");
      }
      
      console.log("✅ OAuth URL 받음:", result.data.url);
      console.log("🚀🚀🚀 리다이렉트 시작...");
      
      // 명시적 리다이렉트
      window.location.href = result.data.url;
      
    } catch (err: any) {
      console.error("💥💥💥 예외 발생:", err);
      console.error("에러:", err);
      throw err;
    }
  };

  const signInKakao = async () => {
    console.log("🔵 Kakao 로그인 시도 중...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: "https://legendsmanager.com/", // 🔥 프로덕션 URL
      },
    });
    
    if (error) {
      console.error("🔴 Kakao 로그인 에러:", error);
      throw error;
    }
    
    console.log("✅ Kakao OAuth 리다이렉트 URL:", data?.url);
    
    // 🔥 수동 리다이렉트 (자동 리다이렉트가 안 될 경우 대비)
    if (data?.url) {
      window.location.href = data.url;
    }
  };

  const signOut = async () => {
    console.log("🚪 로그아웃 시작...");
    try {
      // 타임아웃 처리 (3초)
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("로그아웃 타임아웃")), 3000);
      });
      
      const signOutPromise = supabase.auth.signOut();
      
      console.log("🔄 Supabase signOut 호출 중...");
      
      try {
        await Promise.race([signOutPromise, timeoutPromise]);
        console.log("✅ Supabase 로그아웃 성공");
      } catch (error) {
        console.warn("⚠️ Supabase 로그아웃 타임아웃 또는 에러:", error);
        // 타임아웃이어도 계속 진행
      }
      
      // 상태 초기화 (Supabase 응답 여부와 관계없이)
      console.log("🧹 상태 초기화 중...");
      setUser(null);
      setAccessToken(null);
      setIsAdmin(false);
      
      // localStorage 완전히 삭제
      console.log("🗑️ localStorage 클리어 중...");
      localStorage.clear();
      
      console.log("✅ 로그아웃 완료 - 페이지 리다이렉트");
      
      // 홈으로 리다이렉트
      window.location.href = "/";
    } catch (error) {
      console.error("❌ 로그아웃 실패:", error);
      
      // 에러가 나도 강제 로그아웃
      setUser(null);
      setAccessToken(null);
      setIsAdmin(false);
      localStorage.clear();
      window.location.href = "/";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        isAdmin,
        signInGoogle,
        signInKakao,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}