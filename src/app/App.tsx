import React, { useState, useEffect } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { GameProvider } from "@/contexts/GameContext";
import { LCKHome } from "@/components/LCKHome";
import { LCKGacha } from "@/components/LCKGacha";
import { LCKSquad } from "@/components/LCKSquad";
import { LCKCollection } from "@/components/LCKCollection";
import { LCKTestMode } from "@/components/LCKTestMode";
import { LCKTerms } from "@/components/LCKTerms";
import { Toaster } from "@/app/components/ui/sonner";
import { initializeCardPool } from "@/utils/gachaEngine";
import "@/styles/holo-effects.css";

type Page = "home" | "gacha" | "squad" | "collection" | "test" | "terms";

// LCK 가챠 메인 앱
function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isInitialized, setIsInitialized] = useState(false);

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

  // 모바일 주소창 자동 숨김
  useEffect(() => {
    // 페이지 로드 후 약간 스크롤해서 주소창 숨김
    const hideAddressBar = () => {
      setTimeout(() => {
        window.scrollTo(0, 1);
      }, 100);
    };

    hideAddressBar();
    window.addEventListener('orientationchange', hideAddressBar);
    window.addEventListener('resize', hideAddressBar);

    return () => {
      window.removeEventListener('orientationchange', hideAddressBar);
      window.removeEventListener('resize', hideAddressBar);
    };
  }, []);

  return (
    <AuthProvider>
      <GameProvider>
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
            <>
              {currentPage === "home" && <LCKHome onNavigate={setCurrentPage} />}
              {currentPage === "gacha" && <LCKGacha onBack={() => setCurrentPage("home")} />}
              {currentPage === "squad" && <LCKSquad onBack={() => setCurrentPage("home")} />}
              {currentPage === "collection" && <LCKCollection onBack={() => setCurrentPage("home")} />}
              {currentPage === "test" && <LCKTestMode onBack={() => setCurrentPage("home")} />}
              {currentPage === "terms" && <LCKTerms onBack={() => setCurrentPage("home")} />}
            </>
          )}
          
          <Toaster />
        </div>
      </GameProvider>
    </AuthProvider>
  );
}

export default App;