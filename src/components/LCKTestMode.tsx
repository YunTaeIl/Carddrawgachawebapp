// 테스트 모드: 각 등급별 연출 확인

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { FIFAReveal } from "@/components/FIFAReveal";
import { GachaResult, LCKCard } from "@/types/lck";
import { ArrowLeft } from "lucide-react";
import { useGame } from "@/contexts/GameContext";

interface LCKTestModeProps {
  onBack: () => void;
}

export function LCKTestMode({ onBack }: LCKTestModeProps) {
  const { cardPool } = useGame();
  const [testResult, setTestResult] = useState<GachaResult | null>(null);

  const testGrade = (grade: "S" | "A" | "B" | "C") => {
    // cardPool에서 해당 등급 필터링
    const cards = cardPool.filter(card => card.grade === grade);
    if (cards.length === 0) return;

    const randomCard = cards[Math.floor(Math.random() * cards.length)];
    
    setTestResult({
      card: randomCard,
      isDupe: Math.random() > 0.5,
      shardsGained: Math.random() > 0.5 ? (grade === "S" ? 100 : grade === "A" ? 30 : grade === "B" ? 10 : 3) : 0,
      isPity: false
    });
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      {testResult ? (
        <FIFAReveal
          result={testResult}
          onComplete={() => setTestResult(null)}
          onSkip={() => setTestResult(null)}
          currentIndex={1}
          totalCount={1}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#EAF0FF] hover:text-[#2B6CFF]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold">테스트 모드</h1>
          </div>

          <div className="bg-[#12182A] rounded-xl p-8 border border-[#2B6CFF]/30">
            <h2 className="text-xl font-bold mb-6">등급별 연출 테스트</h2>
            <p className="text-sm text-[#9AA6C3] mb-8">
              각 등급별 카드 획득 연출을 테스트할 수 있습니다.<br />
              S등급은 FIFA 스타일 시퀀스 애니메이션이 재생됩니다.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <button
                onClick={() => testGrade("S")}
                className="group bg-gradient-to-br from-[#D4AF37]/20 to-[#0B0F1A] rounded-xl p-8 border-2 border-[#D4AF37]/50 hover:border-[#D4AF37] transition-all hover:scale-105"
              >
                <div className="text-6xl font-bold text-[#D4AF37] mb-2">S</div>
                <div className="text-sm text-[#9AA6C3]">FIFA 연출</div>
              </button>

              <button
                onClick={() => testGrade("A")}
                className="group bg-gradient-to-br from-[#B7C2D6]/20 to-[#0B0F1A] rounded-xl p-8 border-2 border-[#B7C2D6]/50 hover:border-[#B7C2D6] transition-all hover:scale-105"
              >
                <div className="text-6xl font-bold text-[#B7C2D6] mb-2">A</div>
                <div className="text-sm text-[#9AA6C3]">간단 연출</div>
              </button>

              <button
                onClick={() => testGrade("B")}
                className="group bg-gradient-to-br from-[#4E6E8E]/20 to-[#0B0F1A] rounded-xl p-8 border-2 border-[#4E6E8E]/50 hover:border-[#4E6E8E] transition-all hover:scale-105"
              >
                <div className="text-6xl font-bold text-[#4E6E8E] mb-2">B</div>
                <div className="text-sm text-[#9AA6C3]">간단 연출</div>
              </button>

              <button
                onClick={() => testGrade("C")}
                className="group bg-gradient-to-br from-[#5B5B5B]/20 to-[#0B0F1A] rounded-xl p-8 border-2 border-[#5B5B5B]/50 hover:border-[#5B5B5B] transition-all hover:scale-105"
              >
                <div className="text-6xl font-bold text-[#5B5B5B] mb-2">C</div>
                <div className="text-sm text-[#9AA6C3]">간단 연출</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}