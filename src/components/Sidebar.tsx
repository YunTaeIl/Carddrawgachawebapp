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
  const { isAuthenticated, signOut } = useAuth();
  const [showDevDialog, setShowDevDialog] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleMenuClick = (pageId: Page) => {
    // 개발중인 페이지인지 확인
    const menuItem = menuItems.find(item => item.id === pageId);
    
    if (menuItem?.inDevelopment) {
      // 리그진행 페이지는 개발중 다이얼로그 먼저 표시
      setShowDevDialog(true);
    } else {
      // 일반 페이지는 바로 이동
      onNavigate(pageId);
      onClose();
    }
  };

  const handleUnlockClick = () => {
    // 자물쇠 버튼 클릭 -> 비밀번호 입력창으로 전환
    setShowDevDialog(false);
    setShowPasswordDialog(true);
    setPassword("");
    setPasswordError("");
  };

  const handlePasswordSubmit = () => {
    const correctPassword = "legends123!";
    
    if (password === correctPassword) {
      // 비밀번호 맞음 -> Admin 페이지로 이동
      setShowPasswordDialog(false);
      onNavigate("league-progress");
      onClose();
      setPassword("");
      setPasswordError("");
    } else {
      // 비밀번호 틀림 -> 에러 표시
      setPasswordError("비밀번호가 올바르지 않습니다");
    }
  };

  const handlePasswordKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handlePasswordSubmit();
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
                {/* 아이콘 (클릭하면 비밀번호 입력창으로 - 숨겨진 기능) */}
                <div className="flex justify-center">
                  <div 
                    onClick={handleUnlockClick}
                    className="w-20 h-20 rounded-full bg-[#FFB81C]/20 flex items-center justify-center cursor-pointer"
                  >
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

      {/* 비밀번호 입력 다이얼로그 */}
      {showPasswordDialog && (
        <>
          <div
            className="fixed inset-0 bg-black/70 z-[60] transition-opacity duration-200"
            onClick={() => setShowPasswordDialog(false)}
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
                    🔐 비밀번호 입력
                  </h3>
                  <p className="text-[#8B95B5] text-sm">
                    리그진행 페이지에 접근하려면 비밀번호를 입력하세요
                  </p>
                </div>

                {/* 비밀번호 입력 필드 */}
                <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/30">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyPress={handlePasswordKeyPress}
                    onPaste={(e) => {
                      // 기본 붙여넣기 동작 방지 (중복 방지)
                      e.preventDefault();
                      const pastedText = e.clipboardData.getData('text');
                      setPassword(pastedText);
                      setPasswordError("");
                    }}
                    className="w-full bg-transparent text-[#9AA6C3] text-sm leading-relaxed
                               focus:outline-none focus:ring-0"
                    placeholder="비밀번호 입력"
                    autoComplete="off"
                  />
                  {passwordError && (
                    <p className="text-red-500 text-xs mt-1">{passwordError}</p>
                  )}
                </div>

                {/* 비밀번호 표시 토글 */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[#8B95B5] hover:text-white transition-colors"
                  >
                    {showPassword ? "비밀번호 숨기기" : "비밀번호 표시"}
                  </button>
                </div>

                {/* 버튼 */}
                <button
                  onClick={handlePasswordSubmit}
                  className="w-full py-3 bg-[#C8102E] hover:bg-[#C8102E]/80 text-white rounded-lg
                           font-medium transition-all duration-150 shadow-lg"
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}