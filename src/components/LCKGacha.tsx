// LCK 가챠 화면 (FIFA 스타일 S등급 연출 포함)

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { GACHA_CONFIG } from "@/types/lck";
import { ArrowLeft, Sparkles, Calendar, Users } from "lucide-react";
import { GachaResult } from "@/types/lck";
import { FIFAReveal } from "@/components/FIFAReveal";
import { CardPackType } from "@/utils/gachaEngine";

interface LCKGachaProps {
  onBack: () => void;
}

// 카드팩 스타일 정의
const PACK_STYLES = {
  standard: {
    bg: "from-[#1E3A8A] via-[#3B82F6] to-[#1E3A8A]",
    border: "border-[#3B82F6]",
    glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]",
    title: "LCK 2013-2025",
    subtitle: "전체 시즌",
    accentColor: "#3B82F6"
  },
  year_2013: { bg: "from-[#581C87] via-[#7C3AED] to-[#581C87]", border: "border-[#7C3AED]", glow: "shadow-[0_0_30px_rgba(124,58,237,0.5)]", title: "LCK 2013", subtitle: "전설의 시작", accentColor: "#7C3AED" },
  year_2014: { bg: "from-[#831843] via-[#BE185D] to-[#831843]", border: "border-[#BE185D]", glow: "shadow-[0_0_30px_rgba(190,24,93,0.5)]", title: "LCK 2014", subtitle: "격전의 시대", accentColor: "#BE185D" },
  year_2015: { bg: "from-[#B91C1C] via-[#EF4444] to-[#B91C1C]", border: "border-[#EF4444]", glow: "shadow-[0_0_30px_rgba(239,68,68,0.5)]", title: "LCK 2015", subtitle: "SKT 황금기", accentColor: "#EF4444" },
  year_2016: { bg: "from-[#C2410C] via-[#F97316] to-[#C2410C]", border: "border-[#F97316]", glow: "shadow-[0_0_30px_rgba(249,115,22,0.5)]", title: "LCK 2016", subtitle: "ROX 타이거즈", accentColor: "#F97316" },
  year_2017: { bg: "from-[#A16207] via-[#EAB308] to-[#A16207]", border: "border-[#EAB308]", glow: "shadow-[0_0_30px_rgba(234,179,8,0.5)]", title: "LCK 2017", subtitle: "SSG 우승", accentColor: "#EAB308" },
  year_2018: { bg: "from-[#15803D] via-[#22C55E] to-[#15803D]", border: "border-[#22C55E]", glow: "shadow-[0_0_30px_rgba(34,197,94,0.5)]", title: "LCK 2018", subtitle: "KT 롤스터", accentColor: "#22C55E" },
  year_2019: { bg: "from-[#0F766E] via-[#14B8A6] to-[#0F766E]", border: "border-[#14B8A6]", glow: "shadow-[0_0_30px_rgba(20,184,166,0.5)]", title: "LCK 2019", subtitle: "Griffin 무패", accentColor: "#14B8A6" },
  year_2020: { bg: "from-[#0E7490] via-[#06B6D4] to-[#0E7490]", border: "border-[#06B6D4]", glow: "shadow-[0_0_30px_rgba(6,182,212,0.5)]", title: "LCK 2020", subtitle: "DWG 우승", accentColor: "#06B6D4" },
  year_2021: { bg: "from-[#1E40AF] via-[#3B82F6] to-[#1E40AF]", border: "border-[#3B82F6]", glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]", title: "LCK 2021", subtitle: "EDG 우승", accentColor: "#3B82F6" },
  year_2022: { bg: "from-[#5B21B6] via-[#8B5CF6] to-[#5B21B6]", border: "border-[#8B5CF6]", glow: "shadow-[0_0_30px_rgba(139,92,246,0.5)]", title: "LCK 2022", subtitle: "DRX 기적", accentColor: "#8B5CF6" },
  year_2023: { bg: "from-[#86198F] via-[#C026D3] to-[#86198F]", border: "border-[#C026D3]", glow: "shadow-[0_0_30px_rgba(192,38,211,0.5)]", title: "LCK 2023", subtitle: "T1 황금 로스터", accentColor: "#C026D3" },
  year_2024: { bg: "from-[#9F1239] via-[#E11D48] to-[#9F1239]", border: "border-[#E11D48]", glow: "shadow-[0_0_30px_rgba(225,29,72,0.5)]", title: "LCK 2024", subtitle: "Gen.G MSI", accentColor: "#E11D48" },
  year_2025: { bg: "from-[#BE123C] via-[#F43F5E] to-[#BE123C]", border: "border-[#F43F5E]", glow: "shadow-[0_0_30px_rgba(244,63,94,0.5)]", title: "LCK 2025", subtitle: "최신 시즌", accentColor: "#F43F5E" },
  position_TOP: { bg: "from-[#1E3A8A] via-[#3B82F6] to-[#1E3A8A]", border: "border-[#3B82F6]", glow: "shadow-[0_0_30px_rgba(59,130,246,0.5)]", title: "탑 라이너", subtitle: "TOP LANE", accentColor: "#3B82F6" },
  position_JGL: { bg: "from-[#15803D] via-[#22C55E] to-[#15803D]", border: "border-[#22C55E]", glow: "shadow-[0_0_30px_rgba(34,197,94,0.5)]", title: "정글러", subtitle: "JUNGLE", accentColor: "#22C55E" },
  position_MID: { bg: "from-[#B91C1C] via-[#EF4444] to-[#B91C1C]", border: "border-[#EF4444]", glow: "shadow-[0_0_30px_rgba(239,68,68,0.5)]", title: "미드 라이너", subtitle: "MID LANE", accentColor: "#EF4444" },
  position_ADC: { bg: "from-[#A16207] via-[#EAB308] to-[#A16207]", border: "border-[#EAB308]", glow: "shadow-[0_0_30px_rgba(234,179,8,0.5)]", title: "원딜", subtitle: "ADC", accentColor: "#EAB308" },
  position_SUP: { bg: "from-[#581C87] via-[#7C3AED] to-[#581C87]", border: "border-[#7C3AED]", glow: "shadow-[0_0_30px_rgba(124,58,237,0.5)]", title: "서포터", subtitle: "SUPPORT", accentColor: "#7C3AED" }
};

export function LCKGacha({ onBack }: LCKGachaProps) {
  const { userData, pullSingleGacha, pullTenGacha } = useGame();
  const [isRevealing, setIsRevealing] = useState(false);
  const [currentResults, setCurrentResults] = useState<GachaResult[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showBlackScreen, setShowBlackScreen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<CardPackType>("standard");
  const [packCategory, setPackCategory] = useState<"standard" | "year" | "position">("standard");

  const currentPackStyle = PACK_STYLES[selectedPack];

  const handleSinglePull = async () => {
    const result = await pullSingleGacha(selectedPack);
    if (!result) return;

    setCurrentResults([result]);
    setCurrentIndex(0);
    
    // S등급이면 검은 화면 먼저
    if (result.card.grade === "S") {
      setShowBlackScreen(true);
      setTimeout(() => {
        setShowBlackScreen(false);
        setIsRevealing(true);
      }, 1500);
    } else {
      setIsRevealing(true);
    }
  };

  const handleTenPull = async () => {
    const results = await pullTenGacha(selectedPack);
    if (!results) return;

    setCurrentResults(results);
    setCurrentIndex(0);
    
    // 첫 번째 카드가 S등급이면 검은 화면 먼저
    if (results[0].card.grade === "S") {
      setShowBlackScreen(true);
      setTimeout(() => {
        setShowBlackScreen(false);
        setIsRevealing(true);
      }, 1500);
    } else {
      setIsRevealing(true);
    }
  };

  const handleRevealComplete = () => {
    if (currentIndex < currentResults.length - 1) {
      const nextCard = currentResults[currentIndex + 1];
      
      // 다음 카드가 S등급이면 검은 화면 먼저
      if (nextCard.card.grade === "S") {
        setIsRevealing(false);
        setShowBlackScreen(true);
        setTimeout(() => {
          setCurrentIndex(currentIndex + 1);
          setShowBlackScreen(false);
          setIsRevealing(true);
        }, 1500);
      } else {
        setCurrentIndex(currentIndex + 1);
      }
    } else {
      setIsRevealing(false);
      setCurrentResults([]);
      setCurrentIndex(0);
    }
  };

  const handleSkipAll = () => {
    // 현재 인덱스 이후에 S등급이 있는지 확인
    const nextSIndex = currentResults.findIndex((r, idx) => idx > currentIndex && r.card.grade === "S");
    
    if (nextSIndex !== -1) {
      // 다음 S등급으로 이동
      const nextCard = currentResults[nextSIndex];
      setIsRevealing(false);
      setShowBlackScreen(true);
      setTimeout(() => {
        setCurrentIndex(nextSIndex);
        setShowBlackScreen(false);
        setIsRevealing(true);
      }, 1500);
    } else {
      // S등급이 더 없으면 완전히 종료
      setIsRevealing(false);
      setShowBlackScreen(false);
      setCurrentResults([]);
      setCurrentIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      {/* S등급 준비 중 검은 화면 */}
      {showBlackScreen && (
        <div className="fixed inset-0 z-50 bg-[#0A0E27]" />
      )}

      {/* 연출 중일 때 */}
      {isRevealing && currentResults.length > 0 && (
        <FIFAReveal
          key={`reveal-${currentIndex}`}
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

          {/* 카드팩 선택 */}
          <div className="bg-[#12182A] rounded-xl p-6 mb-6 border border-[#FFB81C]/30">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#FFB81C]" />
              카드팩 선택
            </h2>
            
            {/* 카테고리 탭 */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={packCategory === "standard" ? "default" : "ghost"}
                onClick={() => {
                  setPackCategory("standard");
                  setSelectedPack("standard");
                }}
                className={packCategory === "standard" ? "bg-[#FFB81C] text-[#0B0F1A]" : ""}
              >
                일반
              </Button>
              <Button
                variant={packCategory === "year" ? "default" : "ghost"}
                onClick={() => {
                  setPackCategory("year");
                  setSelectedPack("year_2025");
                }}
                className={packCategory === "year" ? "bg-[#FFB81C] text-[#0B0F1A]" : ""}
              >
                <Calendar className="w-4 h-4 mr-2" />
                연도별
              </Button>
              <Button
                variant={packCategory === "position" ? "default" : "ghost"}
                onClick={() => {
                  setPackCategory("position");
                  setSelectedPack("position_MID");
                }}
                className={packCategory === "position" ? "bg-[#FFB81C] text-[#0B0F1A]" : ""}
              >
                <Users className="w-4 h-4 mr-2" />
                포지션별
              </Button>
            </div>

            {/* 연도별 카드팩 */}
            {packCategory === "year" && (
              <div className="grid grid-cols-3 md:grid-cols-7 gap-2">
                {[2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025].map(year => (
                  <Button
                    key={year}
                    variant={selectedPack === `year_${year}` ? "default" : "outline"}
                    onClick={() => setSelectedPack(`year_${year}` as CardPackType)}
                    className={selectedPack === `year_${year}` 
                      ? "bg-[#2B6CFF] text-white" 
                      : "border-[#2B6CFF]/50 hover:bg-[#2B6CFF]/20"}
                  >
                    {year}
                  </Button>
                ))}
              </div>
            )}

            {/* 포지션별 카드팩 */}
            {packCategory === "position" && (
              <div className="grid grid-cols-5 gap-2">
                {[
                  { pos: "TOP", label: "탑" },
                  { pos: "JGL", label: "정글" },
                  { pos: "MID", label: "미드" },
                  { pos: "ADC", label: "원딜" },
                  { pos: "SUP", label: "서포터" }
                ].map(({ pos, label }) => (
                  <Button
                    key={pos}
                    variant={selectedPack === `position_${pos}` ? "default" : "outline"}
                    onClick={() => setSelectedPack(`position_${pos}` as CardPackType)}
                    className={selectedPack === `position_${pos}` 
                      ? "bg-[#2B6CFF] text-white" 
                      : "border-[#2B6CFF]/50 hover:bg-[#2B6CFF]/20"}
                  >
                    {label}
                  </Button>
                ))}
              </div>
            )}

            {/* 일반 카드팩 */}
            {packCategory === "standard" && (
              <div className="text-sm text-[#9AA6C3] text-center py-4">
                모든 선수 카드가 포함된 일반 카드팩입니다
              </div>
            )}
          </div>

          {/* 가챠 버튼 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* 단일 뽑기 */}
            <div className="bg-gradient-to-br from-[#E4002B]/20 to-[#12182A] rounded-lg p-4 border-2 border-[#E4002B]/50">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#E4002B]" />
                <h3 className="text-lg font-bold">단일 뽑기</h3>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-[#E4002B] mb-1">
                  {GACHA_CONFIG.SINGLE_COST} RP
                </div>
                <div className="text-xs text-[#9AA6C3]">1장 획득</div>
              </div>
              <Button
                onClick={handleSinglePull}
                disabled={userData.currency < GACHA_CONFIG.SINGLE_COST}
                className="w-full bg-[#E4002B] hover:bg-[#E4002B]/80 text-white font-bold py-3"
              >
                뽑기
              </Button>
            </div>

            {/* 10연차 */}
            <div className="bg-gradient-to-br from-[#2B6CFF]/20 to-[#12182A] rounded-lg p-4 border-2 border-[#2B6CFF]/50 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-[#D4AF37] text-[#0B0F1A] px-2 py-0.5 rounded-full text-xs font-bold">
                A+ 보장
              </div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#2B6CFF]" />
                <h3 className="text-lg font-bold">10연차</h3>
              </div>
              <div className="mb-3">
                <div className="text-2xl font-bold text-[#2B6CFF] mb-1">
                  {GACHA_CONFIG.TEN_COST} RP
                </div>
                <div className="text-xs text-[#9AA6C3]">
                  10장 획득 • {GACHA_CONFIG.SINGLE_COST * 10 - GACHA_CONFIG.TEN_COST}RP 할인
                </div>
              </div>
              <Button
                onClick={handleTenPull}
                disabled={userData.currency < GACHA_CONFIG.TEN_COST}
                className="w-full bg-[#2B6CFF] hover:bg-[#2B6CFF]/80 text-white font-bold py-3"
              >
                10연차 뽑기
              </Button>
            </div>
          </div>

          {/* 현재 재화 */}
          <div className="mb-6 text-center">
            <p className="text-sm text-[#9AA6C3]">
              보유 RP: <span className="text-[#EAF0FF] font-bold">{userData.currency.toLocaleString()}</span>
            </p>
          </div>

          {/* 카드팩 미리보기 */}
          <div className="mb-8 flex justify-center">
            <div className={`relative w-64 h-96 rounded-2xl bg-gradient-to-br ${currentPackStyle.bg} ${currentPackStyle.border} border-4 ${currentPackStyle.glow} transform hover:scale-105 transition-transform duration-300`}>
              {/* 카드팩 상단 광택 */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-transparent rounded-xl" />
              
              {/* LCK 로고 (상단) */}
              <div className="absolute top-6 left-0 right-0 flex justify-center">
                <div className="text-4xl font-display font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  LCK
                </div>
              </div>

              {/* 카드팩 제목 (중앙) */}
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 text-center px-4">
                <div className="text-3xl font-display font-black text-white drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)] mb-2">
                  {currentPackStyle.title}
                </div>
                <div className="text-lg font-bold text-white/90 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {currentPackStyle.subtitle}
                </div>
              </div>

              {/* 장식 라인 */}
              <div className="absolute bottom-20 left-8 right-8">
                <div className="h-1 bg-gradient-to-r from-transparent via-white/60 to-transparent rounded-full" />
              </div>

              {/* 카드 개수 표시 */}
              <div className="absolute bottom-8 left-0 right-0 text-center">
                <div className="text-sm font-bold text-white/80 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                  PLAYER CARDS
                </div>
              </div>

              {/* 홀로그램 효과 */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent rounded-xl animate-pulse" />
            </div>
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
        </div>
      )}
    </div>
  );
}