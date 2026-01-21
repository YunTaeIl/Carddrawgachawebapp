import React from "react";
import { Construction, Lock } from "lucide-react";

interface ComingSoonProps {
  title: string;
  description?: string;
  isAdminOnly?: boolean;
  isAdmin?: boolean;
}

export function ComingSoon({ 
  title, 
  description = "이 기능은 현재 개발 중입니다.", 
  isAdminOnly = false,
  isAdmin = false 
}: ComingSoonProps) {
  // 관리자 전용 기능인데 일반 유저가 접근한 경우
  if (isAdminOnly && !isAdmin) {
    return (
      <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#141B3D] border border-[#0047AB]/30 rounded-xl p-8 text-center">
          <div className="mb-6">
            <Lock size={48} className="mx-auto text-[#C8102E]" />
          </div>
          <h2 className="text-2xl font-display text-white mb-3">
            접근 제한
          </h2>
          <p className="text-[#8B95B5] mb-6">
            이 기능은 관리자 전용입니다.
          </p>
          <div className="bg-[#0A0E27] border border-[#0047AB]/20 rounded-lg p-4">
            <p className="text-sm text-[#8B95B5]">
              {title}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // 개발 중인 기능 (관리자는 접근 가능)
  return (
    <div className="min-h-screen bg-[#0B0F1A] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-[#141B3D] border border-[#0047AB]/30 rounded-xl p-8 text-center">
        <div className="mb-6">
          <Construction size={48} className="mx-auto text-[#FFB81C]" />
        </div>
        <h2 className="text-2xl font-display text-white mb-3">
          🚧 개발 중
        </h2>
        <p className="text-[#8B95B5] mb-6">
          {description}
        </p>
        <div className="bg-[#0A0E27] border border-[#0047AB]/20 rounded-lg p-4">
          <p className="text-sm text-[#8B95B5] font-medium mb-2">
            {title}
          </p>
          {isAdminOnly && (
            <p className="text-xs text-[#C8102E]">
              관리자 전용 기능
            </p>
          )}
        </div>
        {isAdmin && (
          <div className="mt-6 pt-6 border-t border-[#0047AB]/20">
            <p className="text-xs text-[#8B95B5]">
              💡 관리자 모드로 접근 중입니다
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
