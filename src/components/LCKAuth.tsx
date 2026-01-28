// LCK 로그인/회원가입 화면 (간단 버전)

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { DialogTitle } from "@/app/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface LCKAuthProps {
  onSuccess?: () => void;
}

export function LCKAuth({ onSuccess }: LCKAuthProps) {
  const { signInGoogle, signInKakao } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    console.log("🟢🟢🟢 handleGoogleLogin 호출됨!");
    setIsLoading(true);
    try {
      console.log("🟢 signInGoogle 호출 직전...");
      await signInGoogle();
      console.log("🟢 signInGoogle 호출 완료 (리다이렉트 대기)");
      // OAuth 리다이렉트 발생
    } catch (error: any) {
      console.error("❌❌❌ Google 로그인 실패:", error);
      console.error("에러 메시지:", error?.message);
      console.error("에러 상세:", JSON.stringify(error, null, 2));
      toast.error(`Google 로그인 실패: ${error?.message || "알 수 없는 오류"}`);
      setIsLoading(false);
    }
  };

  const handleKakaoLogin = async () => {
    setIsLoading(true);
    try {
      await signInKakao();
      // OAuth 리다이렉트 발생
    } catch (error: any) {
      console.error("❌ Kakao 로그인 실패:", error);
      console.error("에러 메시지:", error?.message);
      console.error("에러 상세:", JSON.stringify(error, null, 2));
      toast.error(`카카오 로그인 실패: ${error?.message || "알 수 없는 오류"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="p-2">
      <DialogTitle className="sr-only">로그인 / 회원가입</DialogTitle>
      
      <div className="text-center mb-6">
        <h2 className="text-3xl font-display font-bold text-[#C8102E] mb-2">
          Legends Manager
        </h2>
        <p className="text-sm text-[#9AA6C3]">
          로그인하여 데이터를 안전하게 보관하세요
        </p>
      </div>

      <div className="space-y-3">
        <Button
          type="button"
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
          Google로 로그인
        </Button>

        <Button
          type="button"
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
          카카오로 로그인
        </Button>
      </div>
    </div>
  );
}