import React, { useState } from "react";
import { GameProvider } from "@/contexts/GameContext";
import { LCKHome } from "@/components/LCKHome";
import { LCKGacha } from "@/components/LCKGacha";
import { LCKSquad } from "@/components/LCKSquad";
import { LCKCollection } from "@/components/LCKCollection";
import { LCKTestMode } from "@/components/LCKTestMode";
import { Toaster } from "@/app/components/ui/sonner";

type Page = "home" | "gacha" | "squad" | "collection" | "test";

function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");

  return (
    <GameProvider>
      <div className="min-h-screen bg-[#0B0F1A]">
        {currentPage === "home" && <LCKHome onNavigate={setCurrentPage} />}
        {currentPage === "gacha" && <LCKGacha onBack={() => setCurrentPage("home")} />}
        {currentPage === "squad" && <LCKSquad onBack={() => setCurrentPage("home")} />}
        {currentPage === "collection" && <LCKCollection onBack={() => setCurrentPage("home")} />}
        {currentPage === "test" && <LCKTestMode onBack={() => setCurrentPage("home")} />}
        
        <Toaster />
      </div>
    </GameProvider>
  );
}

export default App;