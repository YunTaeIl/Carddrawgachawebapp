// 순위표 페이지

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { ArrowLeft, Info } from "lucide-react";
import { getKoreanTeamName } from "@/utils/teamNames";
import { TeamDetailModal } from "./TeamDetailModal";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

interface StandingsPageProps {
  onBack: () => void;
}

export function StandingsPage({ onBack }: StandingsPageProps) {
  const { currentLeague, getTeamById } = useLeague();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <p className="text-slate-400">진행 중인 리그가 없습니다</p>
      </div>
    );
  }

  // 팀의 시너지 적용된 총 OVR 계산 헬퍼 함수
  const getTeamTotalOVR = (teamId: string) => {
    const team = getTeamById(teamId);
    if (!team) return 0;
    
    const teamSynergies = calculateSynergies(team.squad);
    const teamCardBonuses = calculateCardSynergyBonuses(team.squad, teamSynergies);
    const synergyBonus = Object.values(teamCardBonuses).reduce((sum, bonus) => sum + (bonus?.ovr || 0), 0);
    
    return team.stats.totalOVR + synergyBonus;
  };

  const selectedTeam = selectedTeamId ? getTeamById(selectedTeamId) : null;

  return (
    <>
      {selectedTeam && (
        <TeamDetailModal
          team={selectedTeam}
          onClose={() => setSelectedTeamId(null)}
        />
      )}
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            돌아가기
          </Button>
          <h1 className="text-3xl font-bold font-display">순위표</h1>
        </div>
      </div>

      {/* 순위표 */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="bg-slate-900/30 rounded-2xl border border-white/5 overflow-hidden">
          {/* 헤더 */}
          <div className="bg-black/30 px-6 py-4 grid grid-cols-12 gap-4 text-sm font-semibold text-slate-400 border-b border-white/5">
            <div className="col-span-1 text-center">순위</div>
            <div className="col-span-4">팀명</div>
            <div className="col-span-2 text-center">경기</div>
            <div className="col-span-2 text-center">전적</div>
            <div className="col-span-2 text-center">승률</div>
            <div className="col-span-1 text-center">상세</div>
          </div>

          {/* 순위 목록 */}
          <div className="divide-y divide-white/5">
            {currentLeague.standings.map((entry, index) => {
              const rank = index + 1;
              const isPlayoffZone = rank <= 5;
              const totalGames = entry.wins + entry.losses;
              const winRate = totalGames > 0 ? ((entry.wins / totalGames) * 100).toFixed(0) : '0';
              const koreanTeamName = getKoreanTeamName(entry.teamName);

              return (
                <div
                  key={entry.teamId}
                  className={`px-6 py-4 grid grid-cols-12 gap-4 items-center ${
                    entry.isPlayer ? 'bg-amber-500/10' : 'hover:bg-white/5'
                  } ${isPlayoffZone ? 'border-l-4 border-emerald-500/50' : ''}`}
                >
                  {/* 순위 */}
                  <div className="col-span-1 text-center">
                    <span className={`text-2xl font-bold ${
                      rank === 1 ? 'text-amber-400' : 
                      rank === 2 ? 'text-slate-300' :
                      rank === 3 ? 'text-amber-600' :
                      'text-slate-400'
                    }`}>
                      {rank}
                    </span>
                  </div>

                  {/* 팀명 */}
                  <div className="col-span-4">
                    <div className="flex items-center gap-2">
                      <span className={`font-bold ${entry.isPlayer ? 'text-amber-400' : ''}`}>
                        {koreanTeamName}
                      </span>
                      {entry.isPlayer && (
                        <span className="text-xs bg-amber-500 text-black px-2 py-0.5 rounded font-bold">
                          YOU
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">OVR {getTeamTotalOVR(entry.teamId)}</div>
                  </div>

                  {/* 경기수 */}
                  <div className="col-span-2 text-center text-slate-400">
                    {totalGames}
                  </div>

                  {/* 전적 */}
                  <div className="col-span-2 text-center">
                    <span className="text-emerald-400 font-bold">{entry.wins}</span>
                    <span className="text-slate-600 mx-1">-</span>
                    <span className="text-red-400 font-bold">{entry.losses}</span>
                  </div>

                  {/* 승률 */}
                  <div className="col-span-2 text-center font-bold">
                    {winRate}%
                  </div>

                  {/* 상세보기 버튼 */}
                  <div className="col-span-1 text-center">
                    <Button
                      onClick={() => setSelectedTeamId(entry.teamId)}
                      variant="ghost"
                      size="sm"
                      className="text-slate-400 hover:text-amber-400 p-1"
                    >
                      <Info className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 안내 */}
        <div className="mt-6 bg-slate-900/30 rounded-xl p-6 border border-white/5 text-sm text-slate-400">
          <p>상위 5팀이 플레이오프에 진출합니다</p>
          <p className="mt-2">동률 시 상대전적 → 득실차 → 총 OVR 순으로 순위가 결정됩니다</p>
        </div>
      </div>
    </div>
    </>
  );
}
