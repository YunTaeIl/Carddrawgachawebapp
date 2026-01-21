// 플레이오프 페이지 /league/playoffs

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, Trophy, ChevronRight } from "lucide-react";
import { Series } from "@/types/league";

interface PlayoffsPageProps {
  onBack: () => void;
  onSeriesStart: (seriesType: Series["type"]) => void;
}

export function PlayoffsPage({ onBack, onSeriesStart }: PlayoffsPageProps) {
  const { currentLeague, getTeamById } = useLeague();

  if (!currentLeague || !currentLeague.playoffBracket) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-[#9AA6C3]">플레이오프 정보가 없습니다</p>
      </div>
    );
  }

  const bracket = currentLeague.playoffBracket;

  const renderSeriesCard = (series: Series, title: string) => {
    const team1 = series.team1Id ? getTeamById(series.team1Id) : null;
    const team2 = series.team2Id ? getTeamById(series.team2Id) : null;
    const isPlayerInSeries = team1?.isPlayer || team2?.isPlayer;
    const canStart = team1 && team2 && !series.isCompleted;

    return (
      <div className={`bg-gradient-to-br ${
        isPlayerInSeries 
          ? 'from-[#FFB81C]/20 to-[#141B3D] border-[#FFB81C]' 
          : 'from-[#141B3D]/50 to-[#0A0E27] border-[#0047AB]/30'
      } rounded-2xl p-6 border-2`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold font-display">{title}</h3>
          <span className="text-sm text-[#8B95B5]">BO{series.bestOf}</span>
        </div>

        {team1 && team2 ? (
          <>
            {/* 매치업 */}
            <div className="bg-[#0A0E27]/50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex-1">
                  <div className={`font-bold ${team1.isPlayer ? 'text-[#FFB81C]' : ''}`}>
                    {team1.name}
                  </div>
                  <div className="text-xs text-[#8B95B5]">OVR {team1.stats.totalOVR}</div>
                </div>
                <div className="text-2xl font-bold text-[#FFB81C] mx-4">VS</div>
                <div className="flex-1 text-right">
                  <div className={`font-bold ${team2.isPlayer ? 'text-[#FFB81C]' : ''}`}>
                    {team2.name}
                  </div>
                  <div className="text-xs text-[#8B95B5]">OVR {team2.stats.totalOVR}</div>
                </div>
              </div>

              {series.isCompleted && (
                <div className="flex items-center justify-center gap-4 text-lg font-bold">
                  <span className={series.winnerId === team1.id ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {series.team1Wins}
                  </span>
                  <span className="text-[#8B95B5]">:</span>
                  <span className={series.winnerId === team2.id ? 'text-[#10B981]' : 'text-[#EF4444]'}>
                    {series.team2Wins}
                  </span>
                </div>
              )}
            </div>

            {/* 버튼 */}
            {canStart ? (
              <Button
                onClick={() => onSeriesStart(series.type)}
                className="w-full bg-gradient-to-r from-[#C8102E] to-[#A00D25] 
                           hover:from-[#C8102E]/90 hover:to-[#A00D25]/90
                           shadow-lg font-display py-6 rounded-xl"
              >
                <ChevronRight className="w-5 h-5 mr-2" />
                시리즈 시작
              </Button>
            ) : series.isCompleted ? (
              <div className="text-center py-3 bg-[#10B981]/20 rounded-xl text-[#10B981] font-bold">
                시리즈 완료
              </div>
            ) : (
              <div className="text-center py-3 bg-[#8B95B5]/20 rounded-xl text-[#8B95B5]">
                대기 중...
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-[#8B95B5]">
            {!team1 && !team2 ? '대진 대기 중' : '상대 결정 대기 중'}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20 sticky top-0 z-10">
        <div className="max-w-[1500px] mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              onClick={onBack}
              variant="ghost"
              size="sm"
              className="text-[#9AA6C3] hover:text-white"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              돌아가기
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-display tracking-wide flex items-center gap-2">
                <Trophy className="w-8 h-8 text-[#FFB81C]" />
                플레이오프
              </h1>
              <p className="text-sm text-[#8B95B5]">Playoffs Bracket</p>
            </div>
          </div>
        </div>
      </div>

      {/* 브래킷 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 와일드카드 */}
          {renderSeriesCard(bracket.wildcard, "와일드카드")}

          {/* 준플레이오프 */}
          {renderSeriesCard(bracket.semifinals, "준플레이오프")}

          {/* 플레이오프 */}
          {renderSeriesCard(bracket.playoffs, "플레이오프")}

          {/* 결승 */}
          {renderSeriesCard(bracket.finals, "결승")}
        </div>

        {/* 안내 */}
        <div className="mt-8 bg-[#141B3D]/30 rounded-xl p-6 border border-[#0047AB]/20">
          <h3 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-[#FFB81C]" />
            플레이오프 진행 방식
          </h3>
          <ul className="space-y-2 text-sm text-[#9AA6C3]">
            <li>• <span className="font-bold text-white">와일드카드 (BO3)</span>: 4위 vs 5위</li>
            <li>• <span className="font-bold text-white">준플레이오프 (BO5)</span>: 3위 vs 와일드카드 승자</li>
            <li>• <span className="font-bold text-white">플레이오프 (BO5)</span>: 2위 vs 준플 승자</li>
            <li>• <span className="font-bold text-white">결승 (BO5)</span>: 1위 vs 플옵 승자</li>
            <li className="text-[#EF4444]">• 패배 시 즉시 탈락합니다</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
