import React, { useState, useEffect } from "react";
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

// LCK 가챠 메인 앱 (GameProvider로 전체 감싸기)
function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [isInitialized, setIsInitialized] = useState(false);

  // 카드 풀 초기화
  useEffect(() => {
    const init = async () => {
      try {
        console.log("카드 데이터 로딩 중...");
        await initializeCardPool();
        console.log("카드 풀 로딩 완료!");
        setIsInitialized(true);
      } catch (error) {
        console.error("카드 풀 로딩 실패:", error);
        // 실패해도 계속 진행 (로컬 데이터 사용)
        setIsInitialized(true);
      }
    };
    init();
  }, []);

  return (
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
  );
}

export default App;