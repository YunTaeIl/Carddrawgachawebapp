// LCK 가챠 화면 (FIFA 스타일 S등급 연출 포함)

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { GACHA_CONFIG } from "@/types/lck";
import { ArrowLeft, Sparkles } from "lucide-react";
import { GachaResult } from "@/types/lck";
import { FIFAReveal } from "@/components/FIFAReveal";

interface LCKGachaProps {
  onBack: () => void;
}

export function LCKGacha({ onBack }: LCKGachaProps) {
  const { userData, pullSingleGacha, pullTenGacha } = useGame();
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentResults, setCurrentResults] = useState<GachaResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleSinglePull = async () => {
    const result = await pullSingleGacha();
    if (!result) return;

    setCurrentResults([result]);
    setCurrentIndex(0);
    setIsRevealing(true);
  };

  const handleTenPull = async () => {
    const results = await pullTenGacha();
    if (!results) return;

    setCurrentResults(results);
    setCurrentIndex(0);
    setIsRevealing(true);
  };

  const handleRevealComplete = () => {
    if (currentIndex < currentResults.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsRevealing(false);
      setCurrentResults([]);
      setCurrentIndex(0);
    }
  };

  const handleSkipAll = () => {
    setIsRevealing(false);
    setCurrentResults([]);
    setCurrentIndex(0);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      {/* 연출 중일 때 */}
      {isRevealing && currentResults.length > 0 && (
        <FIFAReveal
          result={currentResults[currentIndex]}
          onComplete={handleRevealComplete}
          onSkip={handleSkipAll}
          currentIndex={currentIndex + 1}
          totalCount={currentResults.length}
        />
      )}

      {/* 일반 가챠 화면 */}
      {!isRevealing && (
        <div className="max-w-4xl mx-auto">
          {/* 헤더 */}
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#EAF0FF] hover:text-[#2B6CFF]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold">카드팩 뽑기</h1>
          </div>

          {/* 확률 표시 */}
          <div className="bg-[#12182A] rounded-xl p-6 mb-8 border border-[#2B6CFF]/30">
            <h2 className="text-lg font-bold mb-4">등급별 확률</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#D4AF37]/50">
                <div className="text-2xl font-bold text-[#D4AF37] mb-1">S</div>
                <div className="text-sm text-[#9AA6C3]">{(GACHA_CONFIG.BASE_RATES.S * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#B7C2D6]/50">
                <div className="text-2xl font-bold text-[#B7C2D6] mb-1">A</div>
                <div className="text-sm text-[#9AA6C3]">{(GACHA_CONFIG.BASE_RATES.A * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#4E6E8E]/50">
                <div className="text-2xl font-bold text-[#4E6E8E] mb-1">B</div>
                <div className="text-sm text-[#9AA6C3]">{(GACHA_CONFIG.BASE_RATES.B * 100).toFixed(1)}%</div>
              </div>
              <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#5B5B5B]/50">
                <div className="text-2xl font-bold text-[#5B5B5B] mb-1">C</div>
                <div className="text-sm text-[#9AA6C3]">{(GACHA_CONFIG.BASE_RATES.C * 100).toFixed(1)}%</div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-[#2B6CFF]/10 rounded-lg border border-[#2B6CFF]/30">
              <p className="text-sm text-[#9AA6C3]">
                • S 천장: 60회 확정 (40회부터 확률 상승)<br />
                • A 천장: 10회 확정<br />
                • 10연차: A 이상 최소 1장 보장
              </p>
            </div>
          </div>

          {/* 가챠 버튼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 단일 뽑기 */}
            <div className="bg-gradient-to-br from-[#E4002B]/20 to-[#12182A] rounded-xl p-6 border-2 border-[#E4002B]/50">
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[#E4002B]" />
                <h3 className="text-xl font-bold">단일 뽑기</h3>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-[#E4002B] mb-2">
                  {GACHA_CONFIG.SINGLE_COST} RP
                </div>
                <div className="text-sm text-[#9AA6C3]">1장 획득</div>
              </div>
              <Button
                onClick={handleSinglePull}
                disabled={userData.currency < GACHA_CONFIG.SINGLE_COST}
                className="w-full bg-[#E4002B] hover:bg-[#E4002B]/80 text-white font-bold py-6 text-lg"
              >
                뽑기
              </Button>
            </div>

            {/* 10연차 */}
            <div className="bg-gradient-to-br from-[#2B6CFF]/20 to-[#12182A] rounded-xl p-6 border-2 border-[#2B6CFF]/50 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#0B0F1A] px-3 py-1 rounded-full text-xs font-bold">
                A+ 보장
              </div>
              <div className="flex items-center gap-3 mb-4">
                <Sparkles className="w-6 h-6 text-[#2B6CFF]" />
                <h3 className="text-xl font-bold">10연차</h3>
              </div>
              <div className="mb-6">
                <div className="text-3xl font-bold text-[#2B6CFF] mb-2">
                  {GACHA_CONFIG.TEN_COST} RP
                </div>
                <div className="text-sm text-[#9AA6C3]">
                  10장 획득 • {GACHA_CONFIG.SINGLE_COST * 10 - GACHA_CONFIG.TEN_COST}RP 할인
                </div>
              </div>
              <Button
                onClick={handleTenPull}
                disabled={userData.currency < GACHA_CONFIG.TEN_COST}
                className="w-full bg-[#2B6CFF] hover:bg-[#2B6CFF]/80 text-white font-bold py-6 text-lg"
              >
                10연차 뽑기
              </Button>
            </div>
          </div>

          {/* 현재 재화 */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#9AA6C3]">
              보유 RP: <span className="text-[#EAF0FF] font-bold">{userData.currency.toLocaleString()}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
