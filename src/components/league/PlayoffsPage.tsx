// 플레이오프 페이지

import React, { useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Series } from "@/types/league";
import { getKoreanTeamName } from "@/utils/teamNames";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

interface PlayoffsPageProps {
  onBack: () => void;
  onSeriesStart: (seriesType: Series["type"]) => void;
  onAllComplete?: () => void; // 모든 플레이오프 완료 시 콜백
}

export function PlayoffsPage({ onBack, onSeriesStart, onAllComplete }: PlayoffsPageProps) {
  const { currentLeague, getTeamById } = useLeague();

  if (!currentLeague || !currentLeague.playoffBracket) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-slate-400">플레이오프 정보가 없습니다</p>
      </div>
    );
  }

  const bracket = currentLeague.playoffBracket;

  // 모든 플레이오프 시리즈가 완료되었는지 확인
  useEffect(() => {
    if (!bracket) return;
    
    const allSeriesCompleted = 
      bracket.wildcard.isCompleted &&
      bracket.semifinals.isCompleted &&
      bracket.playoffs.isCompleted &&
      bracket.finals.isCompleted;
    
    if (allSeriesCompleted && onAllComplete) {
      // 약간의 지연 후 이동 (사용자가 결과를 볼 시간)
      setTimeout(() => {
        onAllComplete();
      }, 1000);
    }
  }, [bracket, onAllComplete]);

  const renderSeriesCard = (series: Series, title: string, description: string) => {
    const team1 = series.team1Id ? getTeamById(series.team1Id) : null;
    const team2 = series.team2Id ? getTeamById(series.team2Id) : null;
    const isPlayerInSeries = team1?.isPlayer || team2?.isPlayer;
    const canStart = team1 && team2 && !series.isCompleted;

    // 🔥 시너지 적용된 OVR 계산
    const getTeamOVRWithSynergy = (team: any) => {
      const synergies = calculateSynergies(team.squad);
      const cardBonuses = calculateCardSynergyBonuses(team.squad, synergies);
      const synergyBonus = Object.values(cardBonuses).reduce((sum: number, bonus: any) => sum + (bonus?.ovr || 0), 0);
      return team.stats.totalOVR + synergyBonus;
    };

    const team1OVR = team1 ? getTeamOVRWithSynergy(team1) : 0;
    const team2OVR = team2 ? getTeamOVRWithSynergy(team2) : 0;

    return (
      <div className={`rounded-2xl p-6 border min-w-[320px] ${
        isPlayerInSeries 
          ? 'bg-amber-500/10 border-amber-500/50' 
          : 'bg-slate-900/30 border-white/5'
      }`}>
        <div className="mb-4">
          <h3 className="text-xl font-bold mb-1">{title}</h3>
          <p className="text-sm text-slate-400">{description} · BO{series.bestOf}</p>
        </div>

        {team1 && team2 ? (
          <>
            <div className="bg-black/20 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3 gap-2">
                <div className="flex-1 min-w-0">
                  <div className={`font-bold flex items-center gap-2 whitespace-nowrap ${team1.isPlayer ? 'text-amber-400' : ''}`}>
                    <span className="truncate">{getKoreanTeamName(team1.name)}</span>
                    {series.isCompleted && series.winnerId === team1.id && (
                      <span className="text-emerald-400 text-sm flex-shrink-0">👑</span>
                    )}
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">OVR {team1OVR}</div>
                </div>
                <div className="text-xl font-bold text-slate-600 flex-shrink-0">VS</div>
                <div className="flex-1 text-right min-w-0">
                  <div className={`font-bold flex items-center gap-2 justify-end whitespace-nowrap ${team2.isPlayer ? 'text-amber-400' : ''}`}>
                    {series.isCompleted && series.winnerId === team2.id && (
                      <span className="text-emerald-400 text-sm flex-shrink-0">👑</span>
                    )}
                    <span className="truncate">{getKoreanTeamName(team2.name)}</span>
                  </div>
                  <div className="text-xs text-slate-500 whitespace-nowrap">OVR {team2OVR}</div>
                </div>
              </div>

              {series.isCompleted && (
                <div className="space-y-2">
                  <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                    <span className={series.winnerId === team1.id ? 'text-emerald-400' : 'text-slate-600'}>
                      {series.team1Wins}
                    </span>
                    <span className="text-slate-600">:</span>
                    <span className={series.winnerId === team2.id ? 'text-emerald-400' : 'text-slate-600'}>
                      {series.team2Wins}
                    </span>
                  </div>
                  <div className="text-center text-sm font-semibold">
                    <span className="text-emerald-400">
                      {series.winnerId === team1.id ? getKoreanTeamName(team1.name) : getKoreanTeamName(team2.name)}
                    </span>
                    <span className="text-slate-500"> 승리</span>
                  </div>
                </div>
              )}
            </div>

            {canStart ? (
              <Button
                onClick={() => onSeriesStart(series.type)}
                className={`w-full py-6 rounded-xl font-semibold ${
                  isPlayerInSeries 
                    ? 'bg-red-600 hover:bg-red-700' 
                    : 'bg-slate-600 hover:bg-slate-700'
                }`}
              >
                {isPlayerInSeries ? '시리즈 시작' : 'AI 경기 시뮬레이션'} 
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : series.isCompleted ? (
              <div className="text-center py-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
                <div className="text-emerald-400 font-bold">✓ 시리즈 완료</div>
                {!isPlayerInSeries && (
                  <div className="text-xs text-emerald-400/70 mt-1">AI 시뮬레이션으로 진행됨</div>
                )}
              </div>
            ) : (
              <div className="text-center py-3 bg-slate-800 rounded-xl text-slate-500">
                대기 중
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-slate-500">
            대진 대기 중
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 py-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-4xl font-bold font-display mb-2">플레이오프</h1>
          <p className="text-slate-400">Playoffs Bracket</p>
        </div>
      </div>

      {/* 브래킷 */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
          {renderSeriesCard(bracket.wildcard, "와일드카드", "4위 vs 5위")}
          {renderSeriesCard(bracket.semifinals, "준플레이오프", "3위 vs WC 승자")}
          {renderSeriesCard(bracket.playoffs, "플레이오프", "2위 vs 준플 승자")}
          {renderSeriesCard(bracket.finals, "결승", "1위 vs 플옵 승자")}
        </div>

        {/* 안내 */}
        <div className="bg-slate-900/30 rounded-xl p-6 border border-white/5 text-sm text-slate-400">
          <p className="mb-2">패배 시 즉시 탈락합니다</p>
          <p>와일드카드는 BO3, 이후 모든 라운드는 BO5로 진행됩니다</p>
        </div>
      </div>
    </div>
  );
}
