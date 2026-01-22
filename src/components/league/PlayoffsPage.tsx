// 플레이오프 페이지

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Series } from "@/types/league";
import { getKoreanTeamName } from "@/utils/teamNames";

interface PlayoffsPageProps {
  onBack: () => void;
  onSeriesStart: (seriesType: Series["type"]) => void;
}

export function PlayoffsPage({ onBack, onSeriesStart }: PlayoffsPageProps) {
  const { currentLeague, getTeamById } = useLeague();

  if (!currentLeague || !currentLeague.playoffBracket) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-slate-400">플레이오프 정보가 없습니다</p>
      </div>
    );
  }

  const bracket = currentLeague.playoffBracket;

  const renderSeriesCard = (series: Series, title: string, description: string) => {
    const team1 = series.team1Id ? getTeamById(series.team1Id) : null;
    const team2 = series.team2Id ? getTeamById(series.team2Id) : null;
    const isPlayerInSeries = team1?.isPlayer || team2?.isPlayer;
    const canStart = team1 && team2 && !series.isCompleted;

    return (
      <div className={`rounded-2xl p-6 border ${
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
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className={`font-bold ${team1.isPlayer ? 'text-amber-400' : ''}`}>
                    {getKoreanTeamName(team1.name)}
                  </div>
                  <div className="text-xs text-slate-500">OVR {team1.stats.totalOVR}</div>
                </div>
                <div className="text-2xl font-bold text-slate-600 mx-4">VS</div>
                <div className="flex-1 text-right">
                  <div className={`font-bold ${team2.isPlayer ? 'text-amber-400' : ''}`}>
                    {getKoreanTeamName(team2.name)}
                  </div>
                  <div className="text-xs text-slate-500">OVR {team2.stats.totalOVR}</div>
                </div>
              </div>

              {series.isCompleted && (
                <div className="flex items-center justify-center gap-4 text-2xl font-bold">
                  <span className={series.winnerId === team1.id ? 'text-emerald-400' : 'text-slate-600'}>
                    {series.team1Wins}
                  </span>
                  <span className="text-slate-600">:</span>
                  <span className={series.winnerId === team2.id ? 'text-emerald-400' : 'text-slate-600'}>
                    {series.team2Wins}
                  </span>
                </div>
              )}
            </div>

            {canStart ? (
              <Button
                onClick={() => onSeriesStart(series.type)}
                className="w-full bg-red-600 hover:bg-red-700 py-6 rounded-xl font-semibold"
              >
                시리즈 시작 <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            ) : series.isCompleted ? (
              <div className="text-center py-3 bg-emerald-500/20 rounded-xl text-emerald-400 font-bold">
                완료
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
        <div className="max-w-6xl mx-auto px-6 py-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-4xl font-bold font-display mb-2">플레이오프</h1>
          <p className="text-slate-400">Playoffs Bracket</p>
        </div>
      </div>

      {/* 브래킷 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
