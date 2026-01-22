// 팀 상세 전력 모달
// 팀 로스터, 시너지, 최종 스탯 표시

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Users, Award, Zap } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Team } from "@/types/league";
import { LCKCard, UserCard, Position } from "@/types/lck";
import { 
  calculateActiveSynergies, 
  calculateSquadStats,
  Squad as SynergySquad
} from "@/utils/synergyCalculator";
import { getKoreanTeamName } from "@/utils/teamNames";

interface TeamDetailModalProps {
  team: Team;
  onClose: () => void;
}

// 포지션 아이콘 및 색상
const POSITION_CONFIG: Record<Position, { color: string; bg: string }> = {
  TOP: { color: "text-blue-400", bg: "bg-blue-500/20" },
  JGL: { color: "text-green-400", bg: "bg-green-500/20" },
  MID: { color: "text-purple-400", bg: "bg-purple-500/20" },
  ADC: { color: "text-red-400", bg: "bg-red-500/20" },
  SUP: { color: "text-yellow-400", bg: "bg-yellow-500/20" },
};

// 등급별 색상
const GRADE_COLORS: Record<string, string> = {
  S: "text-amber-400",
  A: "text-purple-400",
  B: "text-blue-400",
  C: "text-slate-400",
  D: "text-slate-500",
};

export function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [synergies, setSynergies] = useState<any[]>([]);
  const [squadStats, setSquadStats] = useState<any>(null);

  useEffect(() => {
    // 시너지 및 스탯 계산
    const calculateTeamDetails = () => {
      try {
        // LCKCard를 UserCard 형태로 변환 (시너지 계산 호환)
        const synergySquad: SynergySquad = {
          TOP: team.squad.TOP as UserCard | null,
          JGL: team.squad.JGL as UserCard | null,
          MID: team.squad.MID as UserCard | null,
          ADC: team.squad.ADC as UserCard | null,
          SUP: team.squad.SUP as UserCard | null,
        };

        const activeSynergies = calculateActiveSynergies(synergySquad);
        const stats = calculateSquadStats(synergySquad, activeSynergies);

        setSynergies(activeSynergies);
        setSquadStats(stats);
      } catch (error) {
        console.error("팀 상세 계산 오류:", error);
      } finally {
        setLoading(false);
      }
    };

    calculateTeamDetails();
  }, [team]);

  // ESC 키 닫기
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const koreanTeamName = getKoreanTeamName(team.name);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-[#0A0E27] border border-white/10 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-slate-900/50 to-slate-800/50 px-8 py-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold font-display text-white">
                {koreanTeamName}
              </h2>
              {!team.isPlayer && (
                <p className="text-sm text-slate-400 mt-1">AI 팀 전력 분석</p>
              )}
            </div>
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* 컨텐츠 */}
        <div className="overflow-y-auto max-h-[calc(90vh-100px)] p-8 space-y-8">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-amber-400"></div>
            </div>
          ) : (
            <>
              {/* 팀 로스터 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">팀 로스터</h3>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {(["TOP", "JGL", "MID", "ADC", "SUP"] as Position[]).map((position) => {
                    const card = team.squad[position];
                    if (!card) {
                      return (
                        <div
                          key={position}
                          className="bg-slate-900/30 border border-white/5 rounded-xl p-4 text-center text-slate-500"
                        >
                          {position} - 선수 없음
                        </div>
                      );
                    }

                    const posConfig = POSITION_CONFIG[position];
                    const gradeColor = GRADE_COLORS[card.grade] || "text-slate-400";

                    return (
                      <div
                        key={position}
                        className="bg-slate-900/30 border border-white/5 rounded-xl p-4 hover:bg-slate-800/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          {/* 포지션 + 선수 정보 */}
                          <div className="flex items-center gap-4">
                            <div className={`${posConfig.bg} ${posConfig.color} px-3 py-1.5 rounded-lg font-bold text-sm`}>
                              {position}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-white font-bold text-lg">{card.name}</span>
                                <span className={`${gradeColor} font-bold text-sm`}>
                                  [{card.grade}]
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 mt-0.5">
                                {card.team} • {card.year}
                              </div>
                            </div>
                          </div>

                          {/* 스탯 */}
                          <div className="flex items-center gap-6 text-sm">
                            <div className="text-center">
                              <div className="text-xs text-slate-500">OVR</div>
                              <div className="text-white font-bold text-lg">{card.stats.ovr}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                              <div className="text-slate-400">
                                <span className="text-slate-500">조작:</span> {card.stats.mechanics}
                              </div>
                              <div className="text-slate-400">
                                <span className="text-slate-500">라인:</span> {card.stats.laning}
                              </div>
                              <div className="text-slate-400">
                                <span className="text-slate-500">한타:</span> {card.stats.teamfight}
                              </div>
                              <div className="text-slate-400">
                                <span className="text-slate-500">운영:</span> {card.stats.macro}
                              </div>
                              <div className="text-slate-400 col-span-2">
                                <span className="text-slate-500">클러치:</span> {card.stats.clutch}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* 활성 시너지 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">활성 시너지</h3>
                </div>
                {synergies.length > 0 ? (
                  <div className="grid grid-cols-1 gap-3">
                    {synergies.map((synergy, index) => (
                      <div
                        key={index}
                        className="bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20 rounded-xl p-4"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-amber-400 font-bold text-lg">{synergy.name}</div>
                            <div className="text-slate-400 text-sm mt-1">{synergy.description}</div>
                          </div>
                          <div className="text-xs text-slate-500 bg-slate-900/50 px-3 py-1 rounded">
                            {synergy.bonus}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6 text-center text-slate-500">
                    활성 시너지 없음
                  </div>
                )}
              </section>

              {/* 최종 팀 스탯 */}
              <section>
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-amber-400" />
                  <h3 className="text-xl font-bold text-white">최종 팀 스탯</h3>
                </div>
                {squadStats && (
                  <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6">
                    <div className="grid grid-cols-3 gap-6">
                      {/* 총 OVR */}
                      <div className="text-center">
                        <div className="text-xs text-slate-500 uppercase tracking-wider mb-2">
                          총 OVR
                        </div>
                        <div className="text-4xl font-bold text-amber-400">
                          {squadStats.totalOVR}
                        </div>
                        <div className="text-sm text-slate-400 mt-1">
                          평균 {squadStats.avgOVR}
                        </div>
                      </div>

                      {/* 종합 전력 */}
                      <div className="col-span-2 grid grid-cols-2 gap-4">
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">조작력</div>
                          <div className="text-2xl font-bold text-blue-400">
                            {squadStats.totalMechanics}
                          </div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">라인전</div>
                          <div className="text-2xl font-bold text-green-400">
                            {squadStats.totalLaning}
                          </div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">한타력</div>
                          <div className="text-2xl font-bold text-purple-400">
                            {squadStats.totalTeamfight}
                          </div>
                        </div>
                        <div className="bg-slate-800/30 rounded-lg p-3">
                          <div className="text-xs text-slate-500 mb-1">운영력</div>
                          <div className="text-2xl font-bold text-yellow-400">
                            {squadStats.totalMacro}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* 클러치 */}
                    <div className="mt-4 bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-red-400" />
                          <span className="text-sm text-slate-300">클러치 능력</span>
                        </div>
                        <div className="text-2xl font-bold text-red-400">
                          {squadStats.totalClutch}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* 푸터 */}
        <div className="bg-slate-900/30 px-8 py-4 border-t border-white/10">
          <div className="flex justify-end">
            <Button onClick={onClose} className="bg-slate-700 hover:bg-slate-600">
              닫기
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
