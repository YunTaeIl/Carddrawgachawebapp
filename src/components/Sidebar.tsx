import React, { useState } from "react";
import { X, Menu, LayoutDashboard, Users, Shield, Zap, Target, Settings, ScrollText, LogIn, FileText, Trophy, Code2 } from "lucide-react";
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
  | "league-progress";

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
  inDevelopment?: boolean;  // 개발중 (일반 유저는 다이얼로그, Admin은 접근 가능)
}

const menuItems: MenuItem[] = [
  { id: "home", label: "메인화면", icon: <LayoutDashboard size={20} /> },
  { id: "collection", label: "선수관리", icon: <Users size={20} /> },
  { id: "squad", label: "팀관리", icon: <Shield size={20} /> },
  { id: "gacha", label: "선수뽑기", icon: <Zap size={20} /> },
  { id: "league-progress", label: "리그진행", icon: <Trophy size={20} />, inDevelopment: true },
];

export function Sidebar({ isOpen, onClose, onNavigate, currentPage, isAdmin, onShowAuth }: SidebarProps) {
  const { isAuthenticated } = useAuth();
  const [showDevDialog, setShowDevDialog] = useState(false);

  const handleMenuClick = (pageId: Page) => {
    // 개발중인 페이지인지 확인
    const menuItem = menuItems.find(item => item.id === pageId);
    
    if (menuItem?.inDevelopment) {
      if (isAdmin) {
        // Admin은 개발중인 페이지로 이동
        onNavigate(pageId);
        onClose();
      } else {
        // 일반 유저는 개발중 다이얼로그 표시
        setShowDevDialog(true);
      }
    } else {
      // 일반 페이지는 바로 이동
      onNavigate(pageId);
      onClose();
    }
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
                {item.inDevelopment && (
                  <span className="ml-auto text-xs text-[#FFB81C]">🔜</span>
                )}
              </button>
            );
          })}
        </nav>

        {/* 하단 영역 */}
        <div className="border-t border-[#0047AB]/30 p-4 space-y-2">
          {!isAuthenticated && onShowAuth && (
            <button
              onClick={() => {
                onShowAuth();
                onClose();
              }}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg
                         bg-[#2B6CFF] hover:bg-[#2B6CFF]/80 text-white
                         transition-all duration-150"
            >
              <LogIn size={18} />
              <span className="text-sm font-medium">로그인 / 회원가입</span>
            </button>
          )}
          
          <button
            onClick={() => handleMenuClick("terms")}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg
                       text-[#8B95B5] hover:bg-[#1A2347] hover:text-white
                       transition-all duration-150"
          >
            <FileText size={16} />
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

      {/* 개발중 다이얼로그 */}
      {showDevDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[60] transition-opacity duration-200"
            onClick={() => setShowDevDialog(false)}
          />
          <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md p-6">
            <div className="bg-gradient-to-br from-[#141B3D] to-[#0A0E27] border-2 border-[#FFB81C]/50 rounded-2xl p-8 shadow-2xl">
              <div className="text-center space-y-6">
                {/* 아이콘 */}
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#FFB81C]/20 flex items-center justify-center">
                    <Code2 size={40} className="text-[#FFB81C]" />
                  </div>
                </div>

                {/* 제목 */}
                <div>
                  <h3 className="text-2xl font-display text-white mb-2">
                    🚧 열심히 개발중입니다!
                  </h3>
                  <p className="text-[#8B95B5] text-sm">
                    개발자가 밤낮없이 코딩하고 있어요
                  </p>
                </div>

                {/* 메시지 */}
                <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/30">
                  <p className="text-[#9AA6C3] text-sm leading-relaxed">
                    <strong className="text-[#FFB81C]">리그진행</strong> 기능은 현재 개발 중입니다.<br />
                    조금만 기다려주시면 곧 만나볼 수 있어요! 💪
                  </p>
                </div>

                {/* 버튼 */}
                <button
                  onClick={() => setShowDevDialog(false)}
                  className="w-full py-3 bg-[#C8102E] hover:bg-[#C8102E]/80 text-white rounded-lg
                           font-medium transition-all duration-150 shadow-lg"
                >
                  알겠어요!
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}