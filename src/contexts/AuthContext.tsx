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

  // 🆕 유저 초기화 (DB에 없으면 생성)
  const initializeUserIfNeeded = async (userId: string, accessToken: string, retryCount = 0) => {
    try {
      console.log("🔥 initializeUserIfNeeded called for:", userId, "retry:", retryCount);
      console.log("🔑 Token (first 30 chars):", accessToken?.substring(0, 30) + "...");
      console.log("🔑 Token length:", accessToken?.length);
      
      // 토큰이 없으면 스킵
      if (!accessToken) {
        console.warn("⚠️ No access token available, skipping initialization");
        return;
      }
      
      // 🔥 401 재시도 시, 새로운 세션 토큰 가져오기
      let tokenToUse = accessToken;
      if (retryCount > 0) {
        console.log("🔄 Fetching fresh session token...");
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session?.access_token) {
          console.error("❌ Failed to get fresh session:", error);
          return;
        }
        tokenToUse = session.access_token;
        console.log("✅ Got fresh token (first 30 chars):", tokenToUse.substring(0, 30) + "...");
      }
      
      // 서버의 /init-user 호출
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0/user/init`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${tokenToUse}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      if (!response.ok) {
        let errorDetail = "";
        try {
          const errorJson = await response.json();
          errorDetail = JSON.stringify(errorJson);
          console.error("❌ Server error (JSON):", errorJson);
        } catch {
          errorDetail = await response.text().catch(() => "");
          console.error("❌ Server error (text):", errorDetail);
        }
        console.error("❌ Response status:", response.status);
        console.error("❌ Response headers:", Object.fromEntries(response.headers.entries()));
        
        // 401은 토큰 문제 - 최대 2번까지 재시도 (1.5초 후)
        if (response.status === 401 && retryCount < 2) {
          console.warn(`⚠️ 401 Unauthorized - Retrying with fresh token in 1.5s... (attempt ${retryCount + 1}/2)`);
          setTimeout(() => {
            initializeUserIfNeeded(userId, accessToken, retryCount + 1);
          }, 1500);
        }
        return;
      }
      
      const result = await response.json();
      console.log("✅ initializeUser result:", result);
      
      if (!result.success) {
        console.error("❌ Failed to initialize user:", result.error);
      } else {
        console.log("✅ User initialized successfully");
      }
    } catch (error) {
      console.error("❌ initializeUserIfNeeded error:", error);
      // 네트워크 에러는 무시 (서버가 아직 준비 안됐을 수 있음)
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
      if (session?.user?.id && session?.access_token) {
        await initializeUserIfNeeded(session.user.id, session.access_token);
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
      if (event === 'SIGNED_IN' && session?.user?.id && session?.access_token) {
        console.log("🔥 SIGNED_IN event - initializing user...");
        // 🔥 OAuth 로그인 직후에는 토큰이 즉시 준비되지 않을 수 있으므로 약간의 딜레이
        setTimeout(async () => {
          // 최신 세션 다시 가져오기
          const { data: { session: freshSession } } = await supabase.auth.getSession();
          if (freshSession?.access_token) {
            console.log("🔄 Using fresh session token for initialization");
            await initializeUserIfNeeded(session.user.id, freshSession.access_token);
          } else {
            console.warn("⚠️ No fresh session available, using original token");
            await initializeUserIfNeeded(session.user.id, session.access_token);
          }
        }, 500);
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
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    
    // 로그아웃 시 localStorage 완전히 삭제
    localStorage.clear();
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