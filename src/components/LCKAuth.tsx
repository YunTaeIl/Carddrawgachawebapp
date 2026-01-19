// LCK 로그인/회원가입 화면

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { DialogTitle } from "@/app/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LCKAuthProps {
  onSuccess?: () => void;
}

export function LCKAuth({ onSuccess }: LCKAuthProps) {
  const { signInGoogle, signInKakao, isAuthenticated, hasProfile, createProfile, user } = useAuth();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [needsProfile, setNeedsProfile] = useState(false);

  // 로그인 후 프로필 확인
  useEffect(() => {
    if (isAuthenticated && !hasProfile) {
      setNeedsProfile(true);
    } else if (isAuthenticated && hasProfile) {
      toast.success("로그인 성공!");
      onSuccess?.();
    }
  }, [isAuthenticated, hasProfile]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signInGoogle();
      // OAuth 리다이렉트가 발생하므로 여기서는 성공 메시지 표시 안 함
    } catch (error) {
      console.error("Google 로그인 실패:", error);
      toast.error("Google 로그인에 실패했습니다");
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      await signInKakao();
      // OAuth 리다이렉트가 발생하므로 여기서는 성공 메시지 표시 안 함
    } catch (error) {
      console.error("Kakao 로그인 실패:", error);
      toast.error("카카오 로그인에 실패했습니다");
      setIsLoading(false);
    }
  };

  const handleCreateProfile = async () => {
    if (!username.trim() || username.length < 2 || username.length > 20) {
      toast.error("닉네임은 2~20자로 입력해주세요");
      return;
    }

    setIsLoading(true);
    try {
      await createProfile(username);
      toast.success("프로필이 생성되었습니다!");
      setNeedsProfile(false);
      onSuccess?.();
    } catch (error) {
      console.error("프로필 생성 실패:", error);
      toast.error("프로필 생성에 실패했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  // 프로필 생성 화면
  if (needsProfile) {
    return (
      <div className="p-2">
        <DialogTitle className="sr-only">프로필 생성</DialogTitle>
        
        <div className="text-center mb-6">
          <h2 className="text-3xl font-display font-bold text-[#C8102E] mb-2">
            프로필 생성
          </h2>
          <p className="text-sm text-[#9AA6C3]">
            사용할 닉네임을 입력해주세요
          </p>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-[#9AA6C3] mb-2">
            닉네임
          </label>
          <Input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="닉네임을 입력하세요"
            className="w-full"
            maxLength={20}
            disabled={isLoading}
          />
          <p className="text-xs text-[#9AA6C3] mt-1">
            2~20자, 한글/영문/숫자 가능
          </p>
        </div>

        <Button
          onClick={handleCreateProfile}
          disabled={isLoading || !username.trim()}
          className="w-full bg-[#C8102E] hover:bg-[#C8102E]/80 text-white font-bold py-6"
        >
          {isLoading ? "생성 중..." : "프로필 생성"}
        </Button>
      </div>
    );
  }

  // 로그인 화면
  return (
    <div className="p-2">
      {/* 제목 */}
      <DialogTitle className="sr-only">로그인 / 회원가입</DialogTitle>
      
      {/* LCK 로고 */}
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-[#C8102E] mb-2">
          LCK 계정
        </h2>
        <p className="text-sm text-[#9AA6C3]">
          로그인하여 데이터를 안전하게 보관하세요
        </p>
      </div>

      {/* 소셜 로그인 버튼 */}
      <div className="space-y-3">
        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-white hover:bg-gray-100 text-gray-800 font-bold py-6"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="currentColor"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="currentColor"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="currentColor"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google로 {mode === "login" ? "로그인" : "회원가입"}
        </Button>

        <Button
          onClick={handleKakaoLogin}
          disabled={isLoading}
          className="w-full bg-[#FEE500] hover:bg-[#FEE500]/80 text-[#000000] font-bold py-6"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="currentColor"
              d="M12 3C6.477 3 2 6.253 2 10.253c0 2.625 1.77 4.924 4.432 6.247-.184.682-.602 2.268-.693 2.633-.109.438.161.433.339.315.144-.096 2.299-1.548 3.124-2.1.579.079 1.17.12 1.798.12 5.523 0 10-3.253 10-7.253S17.523 3 12 3z"
            />
          </svg>
          카카오로 {mode === "login" ? "로그인" : "회원가입"}
        </Button>
      </div>

      {/* 모드 전환 */}
      <div className="mt-6 text-center">
        {mode === "login" ? (
          <p className="text-sm text-[#9AA6C3]">
            처음 방문하셨나요?{" "}
            <button
              onClick={() => setMode("signup")}
              className="text-[#2B6CFF] hover:underline font-bold"
            >
              회원가입
            </button>
          </p>
        ) : (
          <p className="text-sm text-[#9AA6C3]">
            이미 계정이 있으신가요?{" "}
            <button
              onClick={() => setMode("login")}
              className="text-[#2B6CFF] hover:underline font-bold"
            >
              로그인
            </button>
          </p>
        )}
      </div>
    </div>
  );
}