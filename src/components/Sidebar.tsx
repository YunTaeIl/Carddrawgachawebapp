import React, { useState } from "react";
import { X, Menu, LayoutDashboard, Users, Shield, Zap, Target, Settings, ScrollText, LogIn, LogOut, FileText, Trophy, Code2, Lock, Eye, EyeOff, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export type Page = 
  | "home" 
  | "gacha" 
  | "squad" 
  | "collection" 
  | "test" 
  | "terms"
  | "dashboard"
  | "players"
  | "teams"
  | "simulation"
  | "tactics"
  | "league-settings"
  | "logs"
  | "league-progress"
  | "shared-squad";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
  isAdmin: boolean;
  onShowAuth?: () => void;
}

interface MenuItem {
  id: Page;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
  requiresAuth?: boolean;  // 로그인 필요
}

const menuItems: MenuItem[] = [
  { id: "home", label: "메인화면", icon: <LayoutDashboard size={20} /> },
  { id: "collection", label: "선수관리", icon: <Users size={20} /> },
  { id: "squad", label: "팀관리", icon: <Shield size={20} /> },
  { id: "gacha", label: "선수뽑기", icon: <Zap size={20} /> },
  { id: "league-progress", label: "리그진행", icon: <Trophy size={20} />, requiresAuth: true },
];

export function Sidebar({ isOpen, onClose, onNavigate, currentPage, isAdmin, onShowAuth }: SidebarProps) {
  const { isAuthenticated, signOut } = useAuth();

  const handleMenuClick = (pageId: Page) => {
    const menuItem = menuItems.find(item => item.id === pageId);
    
    // 로그인이 필요한 페이지인지 확인
    if (menuItem?.requiresAuth && !isAuthenticated) {
      // 로그인하지 않은 경우 로그인 요청
      onClose();
      onShowAuth();
      return;
    }
    
    // 바로 이동
    onNavigate(pageId);
    onClose();
  };

  return (
    <>
      {/* 오버레이 배경 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 transition-opacity duration-200"
          onClick={onClose}
        />
      )}

      {/* 사이드바 본체 */}
      <aside
        className={`
          fixed top-0 left-0 h-full w-64 bg-[#141B3D] border-r border-[#0047AB]/30
          z-50 transform transition-transform duration-200 ease-in-out flex flex-col
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-[#0047AB]/30">
          <div>
            <h2 className="text-lg font-display text-white">Legends Manager</h2>
            <p className="text-xs text-[#8B95B5]">FM System</p>
          </div>
          <button
            onClick={onClose}
            className="text-[#8B95B5] hover:text-white transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Admin Badge */}
        {isAdmin && (
          <div className="mx-4 mt-4 px-3 py-2 bg-[#C8102E]/10 border border-[#C8102E]/30 rounded">
            <p className="text-xs text-[#C8102E] font-medium">🔑 관리자 모드</p>
          </div>
        )}

        {/* 메뉴 리스트 */}
        <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = currentPage === item.id;
            const isDisabled = item.adminOnly && !isAdmin;

            return (
              <button
                key={item.id}
                onClick={() => !isDisabled && handleMenuClick(item.id)}
                disabled={isDisabled}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-lg
                  transition-all duration-150
                  ${isActive 
                    ? "bg-[#C8102E] text-white" 
                    : isDisabled
                      ? "text-[#8B95B5]/40 cursor-not-allowed"
                      : "text-[#8B95B5] hover:bg-[#1A2347] hover:text-white"
                  }
                `}
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
                {item.adminOnly && !isAdmin && (
                  <span className="ml-auto text-xs">🔒</span>
                )}
                {item.requiresAuth && !isAuthenticated && (
                  <span className="ml-auto text-xs text-[#FFB81C]">🔐</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 하단 영역 */}
        <div className="border-t border-[#0047AB]/30 p-4 space-y-3">
          {!isAuthenticated && onShowAuth && (
            <button
              onClick={() => {
                onShowAuth();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         bg-gradient-to-r from-[#2B6CFF] to-[#1E4FCC] 
                         hover:from-[#2B6CFF]/90 hover:to-[#1E4FCC]/90
                         text-white shadow-lg shadow-[#2B6CFF]/20
                         transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <LogIn size={16} />
              </div>
              <span className="text-sm font-medium flex-1 text-left">로그인 / 회원가입</span>
            </button>
          )}

          {isAuthenticated && (
            <button
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                         bg-gradient-to-r from-[#C8102E] to-[#A00D24]
                         hover:from-[#C8102E]/90 hover:to-[#A00D24]/90
                         text-white shadow-lg shadow-[#C8102E]/20
                         transition-all duration-200 transform hover:scale-[1.02]"
            >
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                <LogOut size={16} />
              </div>
              <span className="text-sm font-medium flex-1 text-left">로그아웃</span>
            </button>
          )}

          <a
            href="https://open.kakao.com/o/gpuXSFci"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
                       bg-gradient-to-r from-[#FFB81C] to-[#FFA500]
                       hover:from-[#FFB81C]/90 hover:to-[#FFA500]/90
                       text-[#141B3D] shadow-lg shadow-[#FFB81C]/30
                       transition-all duration-200 transform hover:scale-[1.02] font-medium"
          >
            <div className="w-8 h-8 rounded-full bg-[#141B3D]/10 flex items-center justify-center">
              <MessageCircle size={16} />
            </div>
            <span className="text-sm flex-1 text-left">오픈카톡 문의하기</span>
          </a>
          
          <button
            onClick={() => handleMenuClick("terms")}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg
                       text-[#8B95B5] hover:bg-[#1A2347] hover:text-white
                       transition-all duration-150 border border-transparent hover:border-[#0047AB]/20"
          >
            <FileText size={15} />
            <span className="text-xs">이용약관 및 면책조항</span>
          </button>
        </div>
      </aside>

      {/* 좌측 트리거 영역 (접힌 상태에서만) */}
      {!isOpen && (
        <button
          onClick={() => onNavigate(currentPage)}
          className="fixed top-1/2 left-0 -translate-y-1/2 z-30 w-8 h-16 
                     bg-[#141B3D]/80 hover:bg-[#141B3D] border-r border-[#0047AB]/30
                     flex items-center justify-center text-[#8B95B5] hover:text-white
                     transition-all duration-200 rounded-r"
          aria-label="사이드바 열기"
        >
          <Menu size={18} />
        </button>
      )}
    </>
  );
}