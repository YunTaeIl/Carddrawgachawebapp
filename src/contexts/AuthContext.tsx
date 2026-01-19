// 인증 상태 관리 Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { createClient } from "@supabase/supabase-js";
import { projectId, publicAnonKey } from "@/utils/supabase/info";
import { getUserProfile, createUserProfile as apiCreateUserProfile } from "@/utils/userApi";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  hasProfile: boolean;
  signInGoogle: () => Promise<void>;
  signInKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  createProfile: (username: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [hasProfile, setHasProfile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 프로필 존재 여부 확인
  const checkProfile = async (token: string) => {
    try {
      const result = await getUserProfile(token);
      setHasProfile(!!result.profile);
      return !!result.profile;
    } catch (error: any) {
      // 404는 정상 (프로필 없음)
      if (error.message?.includes("404") || error.message?.includes("not found")) {
        console.log("프로필이 아직 생성되지 않았습니다");
        setHasProfile(false);
        return false;
      }
      
      // 401은 인증 문제 - 일단 프로필 없음으로 처리하고 계속 진행
      if (error.message?.includes("401") || error.message?.includes("Unauthorized")) {
        console.warn("⚠️ 프로필 확인 API 인증 실패 (서버 배포 대기 중일 수 있음). 프로필 생성 화면으로 이동합니다.");
        setHasProfile(false);
        return false;
      }
      
      console.error("프로필 확인 중 알 수 없는 에러:", error);
      // 에러가 나도 일단 프로필 없음으로 처리해서 앱은 사용 가능하게
      setHasProfile(false);
      return false;
    }
  };

  useEffect(() => {
    // 초기 세션 확인
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      
      if (session?.access_token) {
        checkProfile(session.access_token);
      }
      
      setIsLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      setAccessToken(session?.access_token ?? null);
      
      if (session?.access_token) {
        await checkProfile(session.access_token);
      } else {
        setHasProfile(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signInKakao = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: `${window.location.origin}`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    setHasProfile(false);
  };

  const createProfile = async (username: string) => {
    if (!accessToken) {
      throw new Error("로그인이 필요합니다");
    }
    
    try {
      await apiCreateUserProfile(accessToken, username);
      setHasProfile(true);
    } catch (error) {
      console.error("프로필 생성 실패:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        isLoading,
        isAuthenticated: !!user,
        hasProfile,
        signInGoogle,
        signInKakao,
        signOut,
        createProfile,
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