// 리그 선택 페이지 /league

import React from "react";
import { Button } from "@/app/components/ui/button";
import { LeagueType, LEAGUE_CONFIGS } from "@/types/league";
import { useLeague } from "@/contexts/LeagueContext";
import { Trophy, Zap, TrendingUp, Target, ArrowLeft } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

interface LeagueSelectPageProps {
  onBack: () => void;
  onLeagueStart: () => void;
}

export function LeagueSelectPage({ onBack, onLeagueStart }: LeagueSelectPageProps) {
  const { startNewLeague } = useLeague();

  const handleStartLeague = (leagueType: LeagueType) => {
    startNewLeague(leagueType);
    onLeagueStart();
  };

  const getLeagueIcon = (leagueType: LeagueType) => {
    switch (leagueType) {
      case "legend":
        return Trophy;
      case "tier1":
        return Zap;
      case "tier2":
        return TrendingUp;
      case "tier3":
        return Target;
    }
  };

  const getLeagueColor = (leagueType: LeagueType) => {
    switch (leagueType) {
      case "legend":
        return {
          bg: "from-[#FFB81C]/20 to-[#C8102E]/20",
          border: "border-[#FFB81C]",
          text: "text-[#FFB81C]",
          btnBg: "from-[#FFB81C] to-[#C8102E]",
          btnHover: "hover:from-[#FFB81C]/90 hover:to-[#C8102E]/90"
        };
      case "tier1":
        return {
          bg: "from-[#C8102E]/20 to-[#141B3D]",
          border: "border-[#C8102E]",
          text: "text-[#C8102E]",
          btnBg: "from-[#C8102E] to-[#A00D25]",
          btnHover: "hover:from-[#C8102E]/90 hover:to-[#A00D25]/90"
        };
      case "tier2":
        return {
          bg: "from-[#0047AB]/20 to-[#141B3D]",
          border: "border-[#0047AB]",
          text: "text-[#0047AB]",
          btnBg: "from-[#0047AB] to-[#003D8F]",
          btnHover: "hover:from-[#0047AB]/90 hover:to-[#003D8F]/90"
        };
      case "tier3":
        return {
          bg: "from-[#10B981]/20 to-[#141B3D]",
          border: "border-[#10B981]",
          text: "text-[#10B981]",
          btnBg: "from-[#10B981] to-[#059669]",
          btnHover: "hover:from-[#10B981]/90 hover:to-[#059669]/90"
        };
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20 sticky top-0 z-10">
        <div className="max-w-[1500px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-[#9AA6C3] hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                메인으로
              </Button>
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src="https://qpzfzemhljgzscojkxnj.supabase.co/storage/v1/object/public/team-logos/lck-logo-white.svg"
                  alt="LCK Logo"
                  className="w-12 h-12 object-contain"
                />
                <div>
                  <h1 className="text-3xl font-bold font-display tracking-wide">
                    리그 선택
                  </h1>
                  <p className="text-sm text-[#8B95B5]">시즌을 시작할 리그를 선택하세요</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(["legend", "tier1", "tier2", "tier3"] as LeagueType[]).map((leagueType) => {
            const config = LEAGUE_CONFIGS[leagueType];
            const Icon = getLeagueIcon(leagueType);
            const colors = getLeagueColor(leagueType);

            return (
              <div
                key={leagueType}
                className={`bg-gradient-to-br ${colors.bg} rounded-2xl p-8 border-2 ${colors.border} 
                           hover:scale-[1.02] transition-all duration-300 hover:shadow-2xl`}
              >
                {/* 리그 타이틀 */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-full ${colors.bg} border-2 ${colors.border} 
                                   flex items-center justify-center`}>
                    <Icon className={`w-8 h-8 ${colors.text}`} />
                  </div>
                  <div>
                    <h2 className={`text-3xl font-bold font-display ${colors.text}`}>
                      {config.name}
                    </h2>
                    <p className="text-sm text-[#8B95B5]">{config.description}</p>
                  </div>
                </div>

                {/* 난이도 */}
                <div className="mb-6">
                  <div className="text-xs text-[#8B95B5] mb-2">난이도</div>
                  <div className={`text-xl font-bold ${colors.text}`}>
                    {config.difficulty}
                  </div>
                </div>

                {/* 보상 정보 */}
                <div className="bg-[#0A0E27]/50 rounded-xl p-4 mb-6 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B95B5]">승리 보상</span>
                    <span className="text-lg font-display font-bold text-[#FFB81C]">
                      {config.winPoints.toLocaleString()} RP
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#8B95B5]">우승 보너스</span>
                    <span className="text-lg font-display font-bold text-[#C8102E]">
                      {config.championBonus.toLocaleString()} RP
                    </span>
                  </div>
                </div>

                {/* 시작 버튼 */}
                <Button
                  onClick={() => handleStartLeague(leagueType)}
                  className={`w-full bg-gradient-to-r ${colors.btnBg} ${colors.btnHover}
                             shadow-lg font-display text-lg py-6 rounded-xl transition-all duration-200
                             transform hover:scale-105`}
                >
                  시즌 시작
                </Button>
              </div>
            );
          })}
        </div>

        {/* 안내 문구 */}
        <div className="mt-8 bg-[#141B3D]/50 rounded-xl p-6 border border-[#0047AB]/30">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-[#FFB81C]" />
            리그 진행 방식
          </h3>
          <ul className="space-y-2 text-sm text-[#9AA6C3]">
            <li>• 정규시즌 18경기 (AI 9팀과 더블 라운드 로빈)</li>
            <li>• 정규시즌 5위 이상 플레이오프 진출</li>
            <li>• 플레이오프 구조: 와일드카드 (BO3) → 준플레이오프 (BO5) → 플레이오프 (BO5) → 결승 (BO5)</li>
            <li>• 우승 시 보너스 RP 지급</li>
            <li>• 탈락 시 획득한 RP만 유지</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
