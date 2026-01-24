// 시즌 결과 페이지

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { LEAGUE_CONFIGS } from "@/types/league";
import { Home, RotateCcw } from "lucide-react";

interface SeasonResultPageProps {
  onBackToMain: () => void;
  onNewSeason: () => void;
}

export function SeasonResultPage({ onBackToMain, onNewSeason }: SeasonResultPageProps) {
  const { currentLeague, deleteLeague } = useLeague();

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-slate-400">시즌 정보가 없습니다</p>
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIGS[currentLeague.leagueType];
  const isChampion = !!currentLeague.championTeamId;
  const playerRank = currentLeague.standings.findIndex(s => s.isPlayer) + 1;
  const playerRecord = currentLeague.standings.find(s => s.isPlayer);

  const handleNewSeason = () => {
    deleteLeague();
    onNewSeason();
  };

  const handleBackToMain = () => {
    deleteLeague();
    onBackToMain();
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-start justify-center p-6 overflow-y-auto">
      <div className={`max-w-xl w-full rounded-3xl p-8 md:p-12 my-auto border-2 text-center ${
        isChampion 
          ? 'bg-gradient-to-br from-amber-500/20 to-slate-900/20 border-amber-500' 
          : 'bg-gradient-to-br from-slate-800/20 to-slate-900/20 border-slate-700'
      }`}>
        
        {/* 이모지 */}
        <div className="text-6xl md:text-8xl mb-6 md:mb-8">
          {isChampion ? '🏆' : playerRank <= 5 ? '😌' : '😔'}
        </div>

        {/* 타이틀 */}
        <h1 className="text-4xl md:text-5xl font-bold font-display mb-3">
          {isChampion ? '우승!' : '시즌 종료'}
        </h1>

        <p className="text-xl md:text-2xl text-slate-300 mb-8 md:mb-12">
          {isChampion 
            ? `${leagueConfig.name} 챔피언` 
            : `${leagueConfig.name} ${playerRank}위`}
        </p>

        {/* 통계 */}
        <div className="bg-black/30 rounded-2xl p-6 mb-8 space-y-4">
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400">최종 순위</span>
            <span className="text-2xl md:text-3xl font-bold">{playerRank}위</span>
          </div>
          
          <div className="flex justify-between items-baseline">
            <span className="text-slate-400">시즌 전적</span>
            <span className="text-xl">
              {playerRecord?.wins || 0}승 {playerRecord?.losses || 0}패
            </span>
          </div>

          <div className="h-px bg-white/10 my-4" />

          <div className="flex justify-between items-baseline">
            <span className="text-slate-400">획득 RP</span>
            <span className="text-3xl md:text-4xl font-bold text-amber-400">
              {currentLeague.currentPoints.toLocaleString()}
            </span>
          </div>

          {isChampion && (
            <div className="bg-amber-500/20 rounded-xl p-4 border border-amber-500/50 mt-4">
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-amber-400">우승 보너스</span>
                <span className="text-xl md:text-2xl font-bold text-amber-400">
                  +{leagueConfig.championBonus.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* 코멘트 */}
        <div className="bg-slate-900/50 rounded-xl p-4 mb-8 text-sm text-slate-400">
          {isChampion 
            ? '🎉 축하합니다! 완벽한 시즌이었습니다.' 
            : playerRank <= 5
            ? '👍 플레이오프 진출! 다음엔 더 잘할 수 있습니다.'
            : '아쉬운 시즌이었습니다. 스쿼드를 강화하고 다시 도전하세요!'}
        </div>

        {/* 버튼 */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={handleBackToMain}
            variant="outline"
            className="flex-1 py-6 text-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            메인으로
          </Button>
          
          <Button
            onClick={handleNewSeason}
            className="flex-1 bg-red-600 hover:bg-red-700 py-6 text-lg"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            새 시즌
          </Button>
        </div>
      </div>
    </div>
  );
}
