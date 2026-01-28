// 인증 상태 관리 Context (프로필 추가)

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

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

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      setIsLoading(false);
    }).catch((error) => {
      console.error("Session error:", error);
      setIsLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      
      // 로그아웃 이벤트 또는 세션 만료 시 localStorage 클리어
      if (event === 'SIGNED_OUT' || (!session && user)) {
        localStorage.clear();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = async () => {
    console.log("🔵 Google 로그인 시도 중...");
    console.log("🔵 현재 전체 URL:", window.location.href);
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.href, // 🔥 전체 URL 사용
      },
    });
    
    console.log("🔍 signInWithOAuth 응답:", { data, error });
    
    if (error) {
      console.error("🔴 Google 로그인 에러:", error);
      console.error("🔴 에러 메시지:", error.message);
      console.error("🔴 에러 상태:", error.status);
      throw error;
    }
    
    console.log("✅ Google OAuth 리다이렉트 URL:", data?.url);
    console.log("✅ 리다이렉트 실행 전...");
    
    // 🔥 수동 리다이렉트 (자동 리다이렉트가 안 될 경우 대비)
    if (data?.url) {
      console.log("🚀 리다이렉트 시작:", data.url);
      window.location.href = data.url;
    } else {
      console.error("❌ data.url이 없습니다!");
    }
  };

  const signInKakao = async () => {
    console.log("🔵 Kakao 로그인 시도 중...");
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: window.location.href, // 🔥 전체 URL 사용
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
        isAdmin: user?.email === "taeil710@naver.com",
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
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}