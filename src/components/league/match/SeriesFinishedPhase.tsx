// 시리즈 종료 화면

import React from "react";
import { Button } from "@/app/components/ui/button";
import { MatchSeries } from "@/types/advancedSimulation";
import { getSeriesResult } from "@/utils/simulationEngine";
import { getKoreanTeamName } from "@/utils/teamNames";
import { Trophy, TrendingUp } from "lucide-react";
import { useLeague } from "@/contexts/LeagueContext";

interface SeriesFinishedPhaseProps {
  series: MatchSeries;
  onComplete: () => void;
}

export function SeriesFinishedPhase({
  series,
  onComplete
}: SeriesFinishedPhaseProps) {
  const { currentLeague } = useLeague();
  const result = getSeriesResult(series);
  
  // 플레이어 팀이 승리했는지 확인 (playerTeamId 기준)
  const playerWon = currentLeague?.playerTeamId === result.winnerId;
  
  const winnerName = getKoreanTeamName(
    result.winnerId === series.homeTeam.id 
      ? series.homeTeam.name 
      : series.awayTeam.name
  );

  // 골드 포맷 함수
  const formatGold = (gold: number) => {
    if (gold >= 1000) {
      return `${Math.round(gold / 1000)}k`;
    }
    return Math.round(gold).toString();
  };

  return (
    <div className="w-full h-full overflow-y-auto flex items-center justify-center p-4 md:p-8">
      <div className="max-w-4xl w-full bg-slate-900/90 rounded-2xl p-6 md:p-8 border border-white/10 my-auto">
        {/* 승리 아이콘 */}
        <div className="text-center mb-6">
          <div className="text-6xl md:text-7xl mb-4">
            {playerWon ? "🏆" : "💔"}
          </div>
          
          <h1 className={`text-4xl md:text-5xl font-bold font-display mb-3 ${playerWon ? 'text-yellow-400' : 'text-slate-400'}`}>
            {playerWon ? "VICTORY" : "DEFEAT"}
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-2">
            {winnerName} 승리!
          </p>
          
          <div className="text-lg md:text-xl text-slate-500">
            {series.seriesType} - {result.winnerScore}:{result.loserScore}
          </div>
        </div>

        {/* 세트별 결과 */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-3 text-center text-white/90">세트별 결과</h3>
          <div className="space-y-2">
            {series.sets.map((set, idx) => {
              const setHomeWon = set.winnerId === series.homeTeam.id;
              const isPlayerTeamHome = currentLeague?.playerTeamId === series.homeTeam.id;
              const setPlayerWon = isPlayerTeamHome ? setHomeWon : !setHomeWon;
              
              return (
                <div
                  key={idx}
                  className={`
                    p-3 md:p-4 rounded-lg border-l-4
                    ${setPlayerWon 
                      ? 'bg-blue-500/10 border-blue-500' 
                      : 'bg-red-500/10 border-red-500'
                    }
                  `}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                      <div className="text-base md:text-lg font-bold text-white/70">
                        세트 {set.setNumber}
                      </div>
                      <div className={`text-sm font-bold ${setPlayerWon ? 'text-blue-400' : 'text-red-400'}`}>
                        {getKoreanTeamName(setHomeWon ? series.homeTeam.name : series.awayTeam.name)} 승리
                      </div>
                    </div>
                    <div className="text-sm text-slate-500">
                      {Math.floor(set.duration / 60)}:{(set.duration % 60).toString().padStart(2, '0')}
                    </div>
                  </div>
                  
                  <div className="mt-2 flex gap-4 md:gap-6 text-xs text-slate-400 flex-wrap">
                    <span>킬: {set.finalState.objectives.kills.home} - {set.finalState.objectives.kills.away}</span>
                    <span>타워: {set.finalState.objectives.towers.home} - {set.finalState.objectives.towers.away}</span>
                    <span>드래곤: {set.finalState.objectives.dragons.home} - {set.finalState.objectives.dragons.away}</span>
                    <span>골드차: {set.finalState.goldDiff > 0 ? '+' : ''}{formatGold(Math.abs(set.finalState.goldDiff))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 보상 (승리 시) */}
        {playerWon && (
          <div className="mb-6 p-4 md:p-5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <div className="flex items-center justify-center gap-3 mb-2">
              <Trophy className="w-5 h-5 md:w-6 md:h-6 text-yellow-400" />
              <h3 className="text-lg md:text-xl font-bold text-yellow-400">승리 보상</h3>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-yellow-400 mb-1">
                +500
              </div>
              <div className="text-sm text-slate-400">포인트 획득</div>
            </div>
          </div>
        )}

        {/* 완료 버튼 */}
        <Button
          onClick={onComplete}
          className="w-full py-4 md:py-5 text-base md:text-lg font-bold"
        >
          리그로 돌아가기
        </Button>
      </div>
    </div>
  );
}
