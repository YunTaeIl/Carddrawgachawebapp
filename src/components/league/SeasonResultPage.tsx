// 시즌 결과 페이지 /league/result

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { LEAGUE_CONFIGS } from "@/types/league";
import { Trophy, XCircle, Home, RotateCcw, Coins } from "lucide-react";

interface SeasonResultPageProps {
  onBackToMain: () => void;
  onNewSeason: () => void;
}

export function SeasonResultPage({ onBackToMain, onNewSeason }: SeasonResultPageProps) {
  const { currentLeague, deleteLeague } = useLeague();

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-[#9AA6C3]">시즌 정보가 없습니다</p>
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIGS[currentLeague.leagueType];
  const isChampion = !!currentLeague.championTeamId;
  const playerRank = currentLeague.standings.findIndex(s => s.isPlayer) + 1;

  const handleNewSeason = () => {
    deleteLeague();
    onNewSeason();
  };

  const handleBackToMain = () => {
    deleteLeague();
    onBackToMain();
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center p-6">
      <div className={`max-w-2xl w-full bg-gradient-to-br ${
        isChampion 
          ? 'from-[#FFB81C]/30 to-[#C8102E]/20' 
          : 'from-[#8B95B5]/20 to-[#141B3D]'
      } rounded-3xl p-8 md:p-12 border-4 ${
        isChampion ? 'border-[#FFB81C]' : 'border-[#8B95B5]'
      } text-center relative overflow-hidden`}>
        
        {/* 배경 효과 */}
        {isChampion && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#FFB81C]/10 to-transparent animate-pulse" />
        )}

        <div className="relative z-10">
          {/* 아이콘 */}
          {isChampion ? (
            <Trophy className="w-24 h-24 md:w-32 md:h-32 text-[#FFB81C] mx-auto mb-6 animate-bounce" />
          ) : (
            <XCircle className="w-24 h-24 md:w-32 md:h-32 text-[#8B95B5] mx-auto mb-6" />
          )}

          {/* 타이틀 */}
          <h1 className="text-4xl md:text-6xl font-bold font-display mb-4">
            {isChampion ? '우승!' : '시즌 종료'}
          </h1>

          {/* 서브 타이틀 */}
          <p className="text-xl md:text-2xl text-[#9AA6C3] mb-8">
            {isChampion 
              ? `${leagueConfig.name} 챔피언` 
              : `${leagueConfig.name} ${playerRank}위`}
          </p>

          {/* 보상 요약 */}
          <div className="bg-[#0A0E27]/50 rounded-2xl p-6 mb-8 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[#8B95B5]">최종 순위</span>
              <span className="text-2xl font-bold font-display">{playerRank}위</span>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-[#8B95B5]">전적</span>
              <span className="text-xl font-display">
                {currentLeague.standings.find(s => s.isPlayer)?.wins || 0}승{' '}
                {currentLeague.standings.find(s => s.isPlayer)?.losses || 0}패
              </span>
            </div>

            <div className="h-px bg-[#0047AB]/30 my-2" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-[#FFB81C]" />
                <span className="text-[#8B95B5]">획득 RP</span>
              </div>
              <span className="text-3xl font-bold font-display text-[#FFB81C]">
                {currentLeague.currentPoints.toLocaleString()}
              </span>
            </div>

            {isChampion && (
              <div className="bg-[#FFB81C]/20 rounded-xl p-4 border-2 border-[#FFB81C]">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#FFB81C]">우승 보너스</span>
                  <span className="text-2xl font-bold font-display text-[#FFB81C]">
                    +{leagueConfig.championBonus.toLocaleString()} RP
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* 코멘트 */}
          <div className="bg-[#141B3D]/50 rounded-xl p-4 mb-8 border border-[#0047AB]/30">
            <p className="text-sm text-[#9AA6C3]">
              {isChampion 
                ? '🎉 축하합니다! 완벽한 시즌을 보냈습니다. 이 스쿼드로 더 높은 리그에 도전해보세요!' 
                : playerRank <= 5
                ? '👍 플레이오프 진출까지 성공했습니다. 다음 시즌에는 더 좋은 결과를 만들어보세요!'
                : '😔 아쉬운 시즌이었습니다. 스쿼드를 강화하고 다시 도전해보세요!'}
            </p>
          </div>

          {/* 버튼 */}
          <div className="flex flex-col md:flex-row gap-4">
            <Button
              onClick={handleBackToMain}
              variant="outline"
              className="flex-1 border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB]/10 
                         font-display text-lg py-6 rounded-xl"
            >
              <Home className="w-5 h-5 mr-2" />
              메인으로
            </Button>
            
            <Button
              onClick={handleNewSeason}
              className="flex-1 bg-gradient-to-r from-[#C8102E] to-[#A00D25] 
                         hover:from-[#C8102E]/90 hover:to-[#A00D25]/90
                         shadow-lg font-display text-lg py-6 rounded-xl"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              새 시즌 시작
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
