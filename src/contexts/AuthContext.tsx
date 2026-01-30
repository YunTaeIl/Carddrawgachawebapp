// 인증 상태 관리 Context (프로필 추가)

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { supabase, projectId } from "@/utils/supabaseAuth";

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

  // 🆕 유저 초기화 (DB에 없으면 생성) - 실패해도 무시 (클라이언트에서 처리)
  const initializeUserIfNeeded = async (userId: string, accessToken: string) => {
    try {
      // 서버 호출을 제거하고 클라이언트에서 직접 처리하도록 함
      // GameContext에서 getGameDataDirect 호출 시 자동으로 초기화됨
      return;
    } catch (error) {
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
        setIsAdmin(false);
        return;
      }
      
      setIsAdmin(data?.is_admin ?? false);
    } catch (error) {
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
      setIsLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const newUser = session?.user ?? null;
      setUser(newUser);
      setAccessToken(session?.access_token ?? null);
      
      // 🆕 SIGNED_IN 이벤트 시 유저 초기화
      if (event === 'SIGNED_IN' && session?.user?.id && session?.access_token) {
        await initializeUserIfNeeded(session.user.id, session.access_token);
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
    try {
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
      
      if (result.error) {
        alert(`Google OAuth 에러: ${result.error.message}`);
        throw result.error;
      }
      
      if (!result.data?.url) {
        alert("Google OAuth URL을 받지 못했습니다. Supabase 설정을 확인하세요.");
        throw new Error("No OAuth URL returned");
      }
      
      // 명시적 리다이렉트
      window.location.href = result.data.url;
      
    } catch (err: any) {
      throw err;
    }
  };

  const signInKakao = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "kakao",
      options: {
        redirectTo: "https://legendsmanager.com/", // 🔥 프로덕션 URL
      },
    });
    
    if (error) {
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