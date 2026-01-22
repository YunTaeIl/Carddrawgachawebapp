// 팀 상세 전력 모달
// 팀 로스터, 시너지, 최종 스탯 표시

import React, { useState, useEffect } from "react";
import { X, TrendingUp, Users, Award, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/app/components/ui/button";
import { Team } from "@/types/league";
import { LCKCard, UserCard, Position } from "@/types/lck";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { getKoreanTeamName } from "@/utils/teamNames";
import { PlayerImage } from "@/components/PlayerImage";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";

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

interface SquadStats {
  totalOVR: number;
  avgOVR: number;
  totalMechanics: number;
  totalLaning: number;
  totalTeamfight: number;
  totalMacro: number;
  totalClutch: number;
  synergyBonus: {
    ovr: number;
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
}

export function TeamDetailModal({ team, onClose }: TeamDetailModalProps) {
  const [loading, setLoading] = useState(true);
  const [synergies, setSynergies] = useState<any[]>([]);
  const [squadStats, setSquadStats] = useState<SquadStats | null>(null);
  const [expandedPosition, setExpandedPosition] = useState<Position | null>(null);
  const [cardBonusesState, setCardBonusesState] = useState<Record<Position, any>>({} as Record<Position, any>);

  useEffect(() => {
    // 시너지 및 스탯 계산 (최신 시너지 엔진 사용)
    const calculateTeamDetails = () => {
      try {
        // 로스터 검증: 5명이 모두 로드되었는지 확인
        const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
        const loadedCards = positions.filter(pos => team.squad[pos] !== null);
        
        if (loadedCards.length < 5) {
          console.warn(`팀 ${team.name}: 로스터 불완전 (${loadedCards.length}/5명 로드됨)`);
        }

        // 스탯 정규화: null/undefined/string 값을 숫자로 변환
        const normalizeCard = (card: LCKCard | null): UserCard | null => {
          if (!card) return null;
          
          return {
            ...card,
            instanceId: card.id, // LCKCard를 UserCard로 변환
            obtainedAt: Date.now(),
            stats: {
              ovr: Number(card.stats.ovr ?? 0) || 0,
              mechanics: Number(card.stats.mechanics ?? 0) || 0,
              laning: Number(card.stats.laning ?? 0) || 0,
              teamfight: Number(card.stats.teamfight ?? 0) || 0,
              macro: Number(card.stats.macro ?? 0) || 0,
              clutch: Number(card.stats.clutch ?? 0) || 0,
            },
            upgradeLevel: Number(card.upgradeLevel ?? 0) || 0,
          };
        };

        const normalizedSquad = {
          TOP: normalizeCard(team.squad.TOP),
          JGL: normalizeCard(team.squad.JGL),
          MID: normalizeCard(team.squad.MID),
          ADC: normalizeCard(team.squad.ADC),
          SUP: normalizeCard(team.squad.SUP),
        };

        // 최신 시너지 엔진 사용 (MySquad와 동일)
        const activeSynergies = calculateSynergies(normalizedSquad);
        const cardBonuses = calculateCardSynergyBonuses(normalizedSquad, activeSynergies);

        // 스쿼드 스탯 계산 (시너지 포함)
        const deployedCards = Object.values(normalizedSquad).filter((card): card is UserCard => card !== null);
        
        if (deployedCards.length === 0) {
          setSquadStats({
            totalOVR: 0,
            avgOVR: 0,
            totalMechanics: 0,
            totalLaning: 0,
            totalTeamfight: 0,
            totalMacro: 0,
            totalClutch: 0,
            synergyBonus: {
              ovr: 0,
              mechanics: 0,
              laning: 0,
              teamfight: 0,
              macro: 0,
              clutch: 0,
            },
          });
          setSynergies([]);
          setLoading(false);
          return;
        }

        let totalOVR = 0;
        let totalMechanics = 0;
        let totalLaning = 0;
        let totalTeamfight = 0;
        let totalMacro = 0;
        let totalClutch = 0;
        
        // 시너지 보너스 총합
        let synergyOVR = 0;
        let synergyMechanics = 0;
        let synergyLaning = 0;
        let synergyTeamfight = 0;
        let synergyMacro = 0;
        let synergyClutch = 0;

        // 포지션별로 시너지 보너스 계산
        positions.forEach(position => {
          const card = normalizedSquad[position];
          if (!card) return;
          
          const bonus = cardBonuses[position] || {
            ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0
          };
          
          const cardOVR = Number(card.stats.ovr ?? 0) || 0;
          const cardMechanics = Number(card.stats.mechanics ?? 0) || 0;
          const cardLaning = Number(card.stats.laning ?? 0) || 0;
          const cardTeamfight = Number(card.stats.teamfight ?? 0) || 0;
          const cardMacro = Number(card.stats.macro ?? 0) || 0;
          const cardClutch = Number(card.stats.clutch ?? 0) || 0;
          
          const bonusOVR = Number(bonus.ovr ?? 0) || 0;
          const bonusMechanics = Number(bonus.mec ?? 0) || 0;
          const bonusLaning = Number(bonus.lan ?? 0) || 0;
          const bonusTeamfight = Number(bonus.tf ?? 0) || 0;
          const bonusMacro = Number(bonus.mac ?? 0) || 0;
          const bonusClutch = Number(bonus.clu ?? 0) || 0;
          
          totalOVR += cardOVR + bonusOVR;
          totalMechanics += cardMechanics + bonusMechanics;
          totalLaning += cardLaning + bonusLaning;
          totalTeamfight += cardTeamfight + bonusTeamfight;
          totalMacro += cardMacro + bonusMacro;
          totalClutch += cardClutch + bonusClutch;
          
          // 시너지 보너스 누적
          synergyOVR += bonusOVR;
          synergyMechanics += bonusMechanics;
          synergyLaning += bonusLaning;
          synergyTeamfight += bonusTeamfight;
          synergyMacro += bonusMacro;
          synergyClutch += bonusClutch;
        });
        
        // cardBonuses를 state에 저장
        setCardBonusesState(cardBonuses);

        const stats: SquadStats = {
          totalOVR: Number.isFinite(totalOVR) ? totalOVR : 0,
          avgOVR: Number.isFinite(totalOVR) && deployedCards.length > 0 
            ? Math.round(totalOVR / deployedCards.length) 
            : 0,
          totalMechanics: Number.isFinite(totalMechanics) ? totalMechanics : 0,
          totalLaning: Number.isFinite(totalLaning) ? totalLaning : 0,
          totalTeamfight: Number.isFinite(totalTeamfight) ? totalTeamfight : 0,
          totalMacro: Number.isFinite(totalMacro) ? totalMacro : 0,
          totalClutch: Number.isFinite(totalClutch) ? totalClutch : 0,
          synergyBonus: {
            ovr: Number.isFinite(synergyOVR) ? synergyOVR : 0,
            mechanics: Number.isFinite(synergyMechanics) ? synergyMechanics : 0,
            laning: Number.isFinite(synergyLaning) ? synergyLaning : 0,
            teamfight: Number.isFinite(synergyTeamfight) ? synergyTeamfight : 0,
            macro: Number.isFinite(synergyMacro) ? synergyMacro : 0,
            clutch: Number.isFinite(synergyClutch) ? synergyClutch : 0,
          },
        };

        // NaN 방어: 최종 스탯 검증
        if (!Number.isFinite(stats.totalOVR)) {
          console.error(`팀 ${team.name}: 총 OVR이 NaN입니다. 로스터 데이터:`, normalizedSquad);
        }

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

                    const isExpanded = expandedPosition === position;
                    const synergyBonus = cardBonusesState[position] || {
                      ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0
                    };
                    
                    return (
                      <div
                        key={position}
                        className="bg-slate-900/30 border border-white/5 rounded-xl overflow-hidden"
                      >
                        {/* 선수 정보 (클릭 가능) */}
                        <div
                          onClick={() => setExpandedPosition(isExpanded ? null : position)}
                          className="p-4 hover:bg-slate-800/30 transition-colors cursor-pointer"
                        >
                          <div className="flex items-center justify-between gap-4">
                            {/* 선수 사진 + 포지션 + 선수 정보 */}
                            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                              {/* 선수 사진 */}
                              <div className="flex-shrink-0">
                                <PlayerImage
                                  imageFileName={card.image}
                                  playerName={card.name}
                                  position={position}
                                  gradeColor={gradeColor}
                                  className="w-12 h-12 md:w-14 md:h-14 rounded-lg object-cover border-2 border-white/10"
                                />
                              </div>
                              
                              <div className={`${posConfig.bg} ${posConfig.color} px-2.5 md:px-3 py-1.5 rounded-lg font-bold text-xs md:text-sm flex-shrink-0`}>
                                {position}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-white font-bold text-base md:text-lg truncate">{card.name}</span>
                                  <span className={`${gradeColor} font-bold text-sm flex-shrink-0`}>
                                    [{card.grade}]
                                  </span>
                                </div>
                                <div className="text-xs text-slate-500 mt-0.5 truncate">
                                  {card.team} • {card.year}
                                </div>
                              </div>
                            </div>

                            {/* 스탯 + 펼치기 버튼 */}
                            <div className="flex items-center gap-4 md:gap-6 text-sm flex-shrink-0">
                              <div className="text-center">
                                <div className="text-xs text-slate-500">OVR</div>
                                <div className="text-white font-bold text-lg">{card.stats.ovr}</div>
                              </div>
                              <div className="hidden md:grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
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
                              {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                              ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {/* 펼쳐진 카드 */}
                        {isExpanded && (
                          <div className="p-6 bg-slate-950/50 border-t border-white/5">
                            <div className="flex justify-center">
                              <LCKHoloCard
                                card={card}
                                size="medium"
                                synergyBonus={synergyBonus}
                                disableFlip={false}
                              />
                            </div>
                          </div>
                        )}
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
                    {synergies.map((synergy, index) => {
                      const effect = synergy.currentEffect;
                      const bonusText = effect 
                        ? [
                            effect.ovr > 0 && `OVR +${effect.ovr}`,
                            effect.mec > 0 && `조작 +${effect.mec}`,
                            effect.lan > 0 && `라인 +${effect.lan}`,
                            effect.tf > 0 && `한타 +${effect.tf}`,
                            effect.mac > 0 && `운영 +${effect.mac}`,
                            effect.clu > 0 && `클러치 +${effect.clu}`,
                          ].filter(Boolean).join(', ')
                        : '';
                      
                      return (
                        <div
                          key={index}
                          className={`rounded-xl p-4 ${
                            synergy.isPrime 
                              ? 'bg-gradient-to-r from-amber-500/20 to-purple-500/20 border-2 border-amber-500/40'
                              : 'bg-gradient-to-r from-amber-500/10 to-purple-500/10 border border-amber-500/20'
                          }`}
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <div className={`font-bold text-base md:text-lg ${synergy.isPrime ? 'text-amber-300' : 'text-amber-400'}`}>
                                  {synergy.synergy.synergy_name}
                                </div>
                                {synergy.isPrime && (
                                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                                    ⭐ 프라임
                                  </span>
                                )}
                              </div>
                              <div className="text-slate-400 text-sm mt-1">{synergy.synergy.description}</div>
                              {synergy.matchedPlayers.length > 0 && (
                                <div className="text-xs text-slate-500 mt-1">
                                  {synergy.matchedPlayers.join(', ')}
                                </div>
                              )}
                            </div>
                            {bonusText && (
                              <div className="text-xs text-slate-300 bg-slate-900/50 px-3 py-1.5 rounded whitespace-nowrap self-start">
                                {bonusText}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
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
                  <h3 className="text-xl font-bold text-white">최종 팀 스탯 (시너지 적용)</h3>
                </div>
                {squadStats && (
                  <div className="bg-slate-900/30 border border-white/5 rounded-xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {/* 왼쪽: 총 OVR 및 스탯 요약 */}
                      <div className="space-y-4">
                        {/* 총 OVR */}
                        <div className="bg-gradient-to-br from-amber-500/20 to-purple-500/20 border border-amber-500/30 rounded-xl p-6 text-center">
                          <div className="text-xs text-slate-400 uppercase tracking-wider mb-2">
                            총 OVR
                          </div>
                          <div className="text-5xl font-bold text-amber-400">
                            {Number.isFinite(squadStats.totalOVR) ? squadStats.totalOVR : 0}
                          </div>
                          <div className="text-sm text-slate-400 mt-2">
                            평균 {Number.isFinite(squadStats.avgOVR) ? squadStats.avgOVR : 0}
                          </div>
                          {squadStats.synergyBonus.ovr > 0 && (
                            <div className="text-sm text-amber-300 mt-2 font-semibold">
                              +{squadStats.synergyBonus.ovr} 시너지 보너스
                            </div>
                          )}
                        </div>

                        {/* 스탯 요약 */}
                        <div className="space-y-2">
                          <div className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-slate-400">조작력</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-blue-400">
                                {Number.isFinite(squadStats.totalMechanics) ? squadStats.totalMechanics : 0}
                              </span>
                              {squadStats.synergyBonus.mechanics > 0 && (
                                <span className="text-xs text-amber-300">
                                  +{squadStats.synergyBonus.mechanics}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-slate-400">라인전</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-green-400">
                                {Number.isFinite(squadStats.totalLaning) ? squadStats.totalLaning : 0}
                              </span>
                              {squadStats.synergyBonus.laning > 0 && (
                                <span className="text-xs text-amber-300">
                                  +{squadStats.synergyBonus.laning}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-slate-400">한타력</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-purple-400">
                                {Number.isFinite(squadStats.totalTeamfight) ? squadStats.totalTeamfight : 0}
                              </span>
                              {squadStats.synergyBonus.teamfight > 0 && (
                                <span className="text-xs text-amber-300">
                                  +{squadStats.synergyBonus.teamfight}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-slate-800/30 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-slate-400">운영력</span>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-yellow-400">
                                {Number.isFinite(squadStats.totalMacro) ? squadStats.totalMacro : 0}
                              </span>
                              {squadStats.synergyBonus.macro > 0 && (
                                <span className="text-xs text-amber-300">
                                  +{squadStats.synergyBonus.macro}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="bg-gradient-to-r from-red-500/20 to-orange-500/20 border border-red-500/30 rounded-lg p-3 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Award className="w-4 h-4 text-red-400" />
                              <span className="text-sm text-slate-300">클러치</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-lg font-bold text-red-400">
                                {Number.isFinite(squadStats.totalClutch) ? squadStats.totalClutch : 0}
                              </span>
                              {squadStats.synergyBonus.clutch > 0 && (
                                <span className="text-xs text-amber-300">
                                  +{squadStats.synergyBonus.clutch}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* 오른쪽: 5각형 레이더 차트 */}
                      <div className="flex items-center justify-center">
                        <div className="w-full h-80 md:h-96">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart
                              data={[
                                {
                                  stat: '조작',
                                  value: Number.isFinite(squadStats.totalMechanics) ? squadStats.totalMechanics : 0,
                                },
                                {
                                  stat: '라인',
                                  value: Number.isFinite(squadStats.totalLaning) ? squadStats.totalLaning : 0,
                                },
                                {
                                  stat: '한타',
                                  value: Number.isFinite(squadStats.totalTeamfight) ? squadStats.totalTeamfight : 0,
                                },
                                {
                                  stat: '운영',
                                  value: Number.isFinite(squadStats.totalMacro) ? squadStats.totalMacro : 0,
                                },
                                {
                                  stat: '클러치',
                                  value: Number.isFinite(squadStats.totalClutch) ? squadStats.totalClutch : 0,
                                },
                              ]}
                            >
                              <PolarGrid stroke="#ffffff20" />
                              <PolarAngleAxis 
                                dataKey="stat" 
                                tick={{ fill: '#94a3b8', fontSize: 14, fontWeight: 600 }}
                              />
                              <Radar
                                name="팀 스탯"
                                dataKey="value"
                                stroke="#fbbf24"
                                fill="#fbbf24"
                                fillOpacity={0.4}
                                strokeWidth={2}
                              />
                            </RadarChart>
                          </ResponsiveContainer>
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
