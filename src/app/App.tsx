import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { LCKHome } from "@/components/LCKHome";
import { LCKGacha } from "@/components/LCKGacha";
import { LCKSquad } from "@/components/LCKSquad";
import { LCKCollection } from "@/components/LCKCollection";
import { LCKTestMode } from "@/components/LCKTestMode";
import { LCKTerms } from "@/components/LCKTerms";
import { LCKAuth } from "@/components/LCKAuth";
import { Sidebar, Page } from "@/components/Sidebar";
import { SimulationPage } from "@/components/SimulationPage";
import { ComingSoon } from "@/components/ComingSoon";
import { LeagueProgressPage } from "@/components/LeagueProgressPage";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { Toaster } from "@/app/components/ui/sonner";
import { initializeCardPool } from "@/utils/gachaEngine";
import "@/styles/holo-effects.css";

// 메인 앱 콘텐츠 (Sidebar 내부)
function AppContent() {
  const { isAdmin } = useAuth();
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  // 카드 풀 초기화
  useEffect(() => {
    const init = async () => {
      try {
        await initializeCardPool();
        setIsInitialized(true);
      } catch (error) {
        console.error("초기화 에러:", error);
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  // ESC 키로 사이드바 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [sidebarOpen]);

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
    setSidebarOpen(false);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LCKHome onNavigate={handleNavigate} />;
      case "gacha":
        return <LCKGacha onBack={() => handleNavigate("home")} />;
      case "squad":
        return <LCKSquad onBack={() => handleNavigate("home")} />;
      case "collection":
        return <LCKCollection onBack={() => handleNavigate("home")} />;
      case "test":
        return <LCKTestMode onBack={() => handleNavigate("home")} />;
      case "terms":
        return <LCKTerms onBack={() => handleNavigate("home")} />;
      case "simulation":
        return <SimulationPage onBack={() => handleNavigate("home")} isAdmin={isAdmin} />;
      case "league-progress":
        return <LeagueProgressPage onBack={() => handleNavigate("home")} isAdmin={isAdmin} />;
      case "players":
        return <ComingSoon title="선수 관리" isAdminOnly isAdmin={isAdmin} />;
      case "teams":
        return <ComingSoon title="팀 관리" isAdminOnly isAdmin={isAdmin} />;
      case "tactics":
        return <ComingSoon title="전술 시스템" isAdminOnly isAdmin={isAdmin} />;
      case "league-settings":
        return <ComingSoon title="리그 설정" isAdminOnly isAdmin={isAdmin} />;
      case "logs":
        return <ComingSoon title="로그 / 히스토리" isAdminOnly isAdmin={isAdmin} />;
      default:
        return <LCKHome onNavigate={handleNavigate} />;
    }
  };

  return (
    <>
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onNavigate={handleNavigate}
        currentPage={currentPage}
        isAdmin={isAdmin}
        onShowAuth={() => setShowAuthDialog(true)}
      />

      <div className="min-h-screen bg-[#0B0F1A]">
        {!isInitialized ? (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="text-2xl font-display text-[#FFB81C] mb-4">
                선수 카드 불러오는 중...
              </div>
              <div className="text-[#9AA6C3]">
                LCK 선수 카드 데이터를 로딩하고 있습니다
              </div>
            </div>
          </div>
        ) : (
          renderPage()
        )}
        
        <Toaster />
      </div>

      {/* 사이드바 트리거 버튼 (접힌 상태일 때) */}
      {!sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(true)}
          className="fixed top-1/2 left-0 -translate-y-1/2 z-30 w-8 h-16 
                     bg-[#C8102E]/90 hover:bg-[#C8102E] border-r border-[#FFB81C]/50
                     flex items-center justify-center text-white hover:text-[#FFB81C]
                     transition-all duration-200 rounded-r shadow-lg"
          aria-label="사이드바 열기"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      )}

      {/* 로그인/회원가입 다이얼로그 */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-[#0A0E27] text-white border-[#2B6CFF]/30">
          <LCKAuth onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
    </>
  );
}

// LCK 가챠 메인 앱
function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppContent />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;