// 인증 상태 관리 Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@supabase/supabase-js";
import { 
  supabase, 
  getCurrentUser, 
  signOut as supabaseSignOut,
  signInWithGoogle,
  signInWithKakao,
  createUserProfile,
  checkUserProfileExists,
  checkUsernameExists
} from "@/utils/supabaseAuth";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInGoogle: () => Promise<void>;
  signInKakao: () => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, provider: 'google' | 'kakao') => Promise<void>;
  checkUsername: (username: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 초기 세션 확인
    getCurrentUser().then(user => {
      setUser(user);
      setIsLoading(false);
    }).catch(() => {
      setUser(null);
      setIsLoading(false);
    });

    // 인증 상태 변경 리스너
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signInGoogle = async () => {
    await signInWithGoogle();
  };

  const signInKakao = async () => {
    await signInWithKakao();
  };

  const signOut = async () => {
    await supabaseSignOut();
    setUser(null);
  };

  const signUp = async (username: string, provider: 'google' | 'kakao') => {
    // 닉네임 중복 체크
    const exists = await checkUsernameExists(username);
    if (exists) {
      throw new Error("이미 사용 중인 닉네임입니다");
    }

    // OAuth 로그인 시작
    if (provider === 'google') {
      await signInWithGoogle();
    } else {
      await signInWithKakao();
    }

    // OAuth 콜백 후 프로필 생성은 별도 처리 필요
    // (리다이렉트 후 세션 확인 시점에 처리)
  };

  const checkUsername = async (username: string) => {
    return await checkUsernameExists(username);
  };

  // 신규 유저인 경우 프로필 생성 체크
  useEffect(() => {
    if (user) {
      checkUserProfileExists(user.id).then(exists => {
        if (!exists) {
          // 프로필이 없으면 회원가입 플로우로 안내
          // (별도 처리 필요)
        }
      });
    }
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        signInGoogle,
        signInKakao,
        signOut,
        signUp,
        checkUsername
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
