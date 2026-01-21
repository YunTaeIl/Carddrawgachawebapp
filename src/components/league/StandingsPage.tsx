// 순위표 페이지 /league/standings

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, Trophy, TrendingUp, TrendingDown } from "lucide-react";

interface StandingsPageProps {
  onBack: () => void;
}

export function StandingsPage({ onBack }: StandingsPageProps) {
  const { currentLeague } = useLeague();

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-[#9AA6C3]">진행 중인 리그가 없습니다</p>
      </div>
    );
  }

  const playoffLine = 5;

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20 sticky top-0 z-10">
        <div className="max-w-[1200px] mx-auto px-6 py-4">
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
              <h1 className="text-3xl font-bold font-display tracking-wide">순위표</h1>
              <p className="text-sm text-[#8B95B5]">정규시즌 순위</p>
            </div>
          </div>
        </div>
      </div>

      {/* 순위표 */}
      <div className="max-w-[1200px] mx-auto px-6 py-8">
        <div className="bg-[#141B3D]/50 rounded-2xl border border-[#0047AB]/30 overflow-hidden">
          {/* 테이블 헤더 */}
          <div className="bg-[#0A0E27]/80 px-6 py-4 grid grid-cols-12 gap-4 text-sm font-bold text-[#8B95B5] border-b border-[#0047AB]/30">
            <div className="col-span-1 text-center">순위</div>
            <div className="col-span-4">팀명</div>
            <div className="col-span-2 text-center">경기수</div>
            <div className="col-span-1 text-center">승</div>
            <div className="col-span-1 text-center">패</div>
            <div className="col-span-2 text-center">승률</div>
            <div className="col-span-1 text-center">득실차</div>
          </div>

          {/* 순위 목록 */}
          <div className="divide-y divide-[#0047AB]/20">
            {currentLeague.standings.map((entry, index) => {
              const rank = index + 1;
              const isPlayoffZone = rank <= playoffLine;
              const totalGames = entry.wins + entry.losses;
              const winRate = totalGames > 0 ? (entry.wins / totalGames * 100).toFixed(1) : '0.0';

              return (
                <div
                  key={entry.teamId}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 items-center transition-colors ${
                    entry.isPlayer
                      ? 'bg-[#FFB81C]/10 border-l-4 border-[#FFB81C]'
                      : 'hover:bg-[#141B3D]/30'
                  } ${
                    isPlayoffZone && !entry.isPlayer
                      ? 'border-l-4 border-[#10B981]/50'
                      : ''
                  }`}
                >
                  {/* 순위 */}
                  <div className="col-span-1 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className={`text-lg font-bold font-display ${
                        rank === 1 ? 'text-[#FFB81C]' : 
                        rank === 2 ? 'text-[#C0C0C0]' :
                        rank === 3 ? 'text-[#CD7F32]' :
                        'text-white'
                      }`}>
                        {rank}
                      </span>
                      {rank === 1 && <Trophy className="w-4 h-4 text-[#FFB81C]" />}
                    </div>
                  </div>

                  {/* 팀명 */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${
                        entry.isPlayer ? 'text-[#FFB81C]' : ''
                      }`}>
                        {entry.teamName}
                      </span>
                      {entry.isPlayer && (
                        <span className="text-xs bg-[#FFB81C] text-[#0A0E27] px-2 py-0.5 rounded font-bold">
                          YOU
                        </span>
                      )}
                      {isPlayoffZone && (
                        <span className="text-xs bg-[#10B981]/20 text-[#10B981] px-2 py-0.5 rounded">
                          플레이오프
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-[#8B95B5] mt-1">
                      OVR {entry.totalOVR}
                    </div>
                  </div>

                  {/* 경기수 */}
                  <div className="col-span-2 text-center text-[#9AA6C3]">
                    {totalGames}
                  </div>

                  {/* 승 */}
                  <div className="col-span-1 text-center">
                    <span className="text-[#10B981] font-bold">{entry.wins}</span>
                  </div>

                  {/* 패 */}
                  <div className="col-span-1 text-center">
                    <span className="text-[#EF4444] font-bold">{entry.losses}</span>
                  </div>

                  {/* 승률 */}
                  <div className="col-span-2 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className="font-bold">{winRate}%</span>
                      {parseFloat(winRate) >= 60 && <TrendingUp className="w-3 h-3 text-[#10B981]" />}
                      {parseFloat(winRate) < 40 && <TrendingDown className="w-3 h-3 text-[#EF4444]" />}
                    </div>
                  </div>

                  {/* 득실차 */}
                  <div className="col-span-1 text-center">
                    <span className={`font-bold ${
                      entry.scoreDiff > 0 ? 'text-[#10B981]' :
                      entry.scoreDiff < 0 ? 'text-[#EF4444]' :
                      'text-[#9AA6C3]'
                    }`}>
                      {entry.scoreDiff > 0 ? '+' : ''}{entry.scoreDiff}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-[#141B3D]/30 rounded-xl p-4 border border-[#0047AB]/20">
          <div className="flex items-start gap-3">
            <Trophy className="w-5 h-5 text-[#10B981] flex-shrink-0 mt-0.5" />
            <div className="text-sm text-[#9AA6C3]">
              <p>정규시즌 5위 이상 팀은 플레이오프에 진출합니다.</p>
              <p className="mt-1">동률일 경우 상대전적 → 득실차 → 총 OVR 순으로 순위가 결정됩니다.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
