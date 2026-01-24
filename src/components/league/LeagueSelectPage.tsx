import React from "react";
import { Button } from "@/app/components/ui/button";
import { LeagueType, LEAGUE_CONFIGS } from "@/types/league";
import { useLeague } from "@/contexts/LeagueContext";
import { useGame } from "@/contexts/GameContext";
import { ArrowLeft, AlertTriangle } from "lucide-react";

interface LeagueSelectPageProps {
  onBack: () => void;
  onLeagueStart: () => void;
}

export function LeagueSelectPage({ onBack, onLeagueStart }: LeagueSelectPageProps) {
  const { startNewLeague } = useLeague();
  const { userData } = useGame();

  // 스쿼드 검증 - 5개 포지션 모두 채워져 있는지 확인
  const isSquadComplete = () => {
    const { squad } = userData;
    return squad.TOP !== null && 
           squad.JGL !== null && 
           squad.MID !== null && 
           squad.ADC !== null && 
           squad.SUP !== null;
  };

  const handleStartLeague = (leagueType: LeagueType) => {
    if (!isSquadComplete()) {
      return; // 버튼이 이미 비활성화되어 있으므로 여기까지 오지 않음
    }
    startNewLeague(leagueType);
    onLeagueStart();
  };

  const getLeagueColor = (leagueType: LeagueType) => {
    switch (leagueType) {
      case "legend":
        return "from-amber-500/10 to-red-600/10 border-amber-500/50";
      case "tier1":
        return "from-red-600/10 to-slate-900/10 border-red-600/50";
      case "tier2":
        return "from-blue-600/10 to-slate-900/10 border-blue-600/50";
      case "tier3":
        return "from-emerald-500/10 to-slate-900/10 border-emerald-500/50";
    }
  };

  const getLeagueAccent = (leagueType: LeagueType) => {
    switch (leagueType) {
      case "legend": return "text-amber-400";
      case "tier1": return "text-red-500";
      case "tier2": return "text-blue-500";
      case "tier3": return "text-emerald-400";
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인으로
          </Button>
          <h1 className="text-4xl font-bold font-display mb-2">리그 선택</h1>
          <p className="text-slate-400">시즌을 시작할 리그를 선택하세요</p>
        </div>
      </div>

      {/* 리그 카드 그리드 */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* 스쿼드 미완성 경고 */}
        {!isSquadComplete() && (
          <div className="mb-8 bg-red-500/10 border border-red-500/50 rounded-xl p-6 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-red-400 mb-2">스쿼드를 먼저 구성해주세요</h3>
              <p className="text-sm text-slate-300 mb-3">
                리그를 시작하려면 5개 포지션(TOP, JGL, MID, ADC, SUP)에 모두 선수를 배치해야 합니다.
              </p>
              <Button
                onClick={onBack}
                variant="outline"
                size="sm"
                className="border-red-500/50 text-red-400 hover:bg-red-500/20"
              >
                팀관리로 이동
              </Button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(["legend", "tier1", "tier2", "tier3"] as LeagueType[]).map((leagueType) => {
            const config = LEAGUE_CONFIGS[leagueType];
            const colorClass = getLeagueColor(leagueType);
            const accentClass = getLeagueAccent(leagueType);
            const squadComplete = isSquadComplete();
            const isLegendLeague = leagueType === "legend";
            const isDisabled = !squadComplete || isLegendLeague;

            return (
              <button
                key={leagueType}
                onClick={() => !isLegendLeague && handleStartLeague(leagueType)}
                className={`bg-gradient-to-br ${colorClass} rounded-2xl p-8 border 
                           transition-all duration-300 text-left relative
                           ${!isDisabled 
                             ? 'hover:scale-[1.02] hover:shadow-2xl hover:shadow-white/5 cursor-pointer' 
                             : 'opacity-40 cursor-not-allowed'
                           } group`}
                disabled={isDisabled}
              >
                {/* 레전즈 리그 추후 공개 배지 */}
                {isLegendLeague && (
                  <div className="absolute top-4 right-4 bg-amber-500/20 border-2 border-amber-500/80 rounded-full px-4 py-2 z-10">
                    <span className="text-xs font-bold text-amber-300 uppercase tracking-wider flex items-center gap-2">
                      🔒 추후 공개
                    </span>
                  </div>
                )}

                {/* 리그 타이틀 */}
                <div className="mb-6">
                  <h2 className={`text-3xl font-bold font-display mb-2 ${accentClass}`}>
                    {config.name}
                  </h2>
                  <p className="text-slate-400 text-sm">{config.description}</p>
                </div>

                {/* 난이도 */}
                <div className="mb-6">
                  <span className="text-xs text-slate-500 uppercase tracking-wider">난이도</span>
                  <div className={`text-lg font-semibold mt-1 ${accentClass}`}>
                    {config.difficulty}
                  </div>
                </div>

                {/* 보상 */}
                <div className="space-y-3 bg-black/20 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">승리당</span>
                    <span className="text-xl font-bold text-amber-400">
                      {config.winPoints.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm text-slate-400">우승 보너스</span>
                    <span className="text-2xl font-bold text-amber-400">
                      {config.championBonus.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* 버튼 힌트 */}
                <div className={`text-center py-3 rounded-lg transition-colors ${
                  isLegendLeague
                    ? 'bg-amber-500/20 border border-amber-500/50'
                    : squadComplete 
                      ? 'bg-white/5 group-hover:bg-white/10' 
                      : 'bg-red-500/20'
                }`}>
                  <span className="text-sm font-semibold">
                    {isLegendLeague 
                      ? '🔜 Coming Soon' 
                      : squadComplete 
                        ? '시즌 시작' 
                        : '스쿼드 필요'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* 안내 */}
        <div className="mt-12 bg-slate-900/30 rounded-xl p-6 border border-white/5">
          <h3 className="font-bold mb-4">리그 시스템</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-400">
            <div>정규시즌 18경기 (더블 라운드 로빈)</div>
            <div>5위 이상 플레이오프 진출</div>
            <div>플레이오프 단계별 BO3/BO5</div>
            <div>우승 시 보너스 RP 지급</div>
          </div>
        </div>
      </div>
    </div>
  );
}