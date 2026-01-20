// 스쿼드 공유용 캡처 카드

import React from "react";
import { UserCard, Position, POSITION_NAMES } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { TrendingUp, Award } from "lucide-react";

interface SquadShareCardProps {
  squad: {
    TOP: UserCard | null;
    JGL: UserCard | null;
    MID: UserCard | null;
    ADC: UserCard | null;
    SUP: UserCard | null;
  };
  synergies: ActiveSynergy[];
  stats: {
    avgOVR: number;
    totalMechanics: number;
    totalLaning: number;
    totalTeamfight: number;
    totalMacro: number;
    totalClutch: number;
  };
}

export const SquadShareCard = React.forwardRef<HTMLDivElement, SquadShareCardProps>(
  ({ squad, synergies, stats }, ref) => {
    const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
    const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);
    
    return (
      <div
        ref={ref}
        className="w-[1200px] p-12"
        style={{
          fontFamily: "Teko, system-ui, sans-serif",
          background: "linear-gradient(135deg, #0B0F1A 0%, #12182A 50%, #0B0F1A 100%)"
        }}
      >
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-2" style={{ fontFamily: "Teko", color: "#FFFFFF" }}>
            MY LCK SQUAD
          </h1>
          <div className="text-xl" style={{ color: "#9AA6C3" }}>
            {deployedCards.length}/5 선수 배치 • AVG OVR {stats.avgOVR}
          </div>
        </div>

        {/* 선수 카드 5장 */}
        <div className="flex justify-center gap-6 mb-8">
          {positions.map((position) => {
            const card = squad[position];
            return (
              <div key={position} className="flex flex-col items-center gap-3">
                <div className="text-center">
                  <div className="text-sm" style={{ color: "#9AA6C3" }}>{POSITION_NAMES[position]}</div>
                  <div className="text-2xl font-bold" style={{ color: "#2B6CFF" }}>{position}</div>
                </div>
                {card ? (
                  <div className="flex flex-col items-center gap-2">
                    <LCKHoloCard card={card} size="small" upgradeLevel={card.upgradeLevel} />
                    <div className="text-center">
                      <div className="text-xs" style={{ color: "#9AA6C3" }}>{card.team}</div>
                      <div className="text-sm font-bold" style={{ color: "#FFFFFF" }}>{card.name}</div>
                    </div>
                  </div>
                ) : (
                  <div 
                    className="w-[160px] h-[240px] rounded-xl flex items-center justify-center"
                    style={{ 
                      border: "2px dashed rgba(43, 108, 255, 0.3)", 
                      background: "rgba(18, 24, 42, 0.5)" 
                    }}
                  >
                    <div className="text-sm" style={{ color: "#9AA6C3" }}>Empty</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단: 스탯 & 시너지 */}
        <div className="grid grid-cols-2 gap-6">
          {/* 스쿼드 스탯 */}
          <div 
            className="rounded-xl p-6"
            style={{ 
              background: "rgba(18, 24, 42, 0.8)", 
              border: "1px solid rgba(43, 108, 255, 0.3)" 
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" style={{ color: "#FFB81C" }} />
              <h3 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>스쿼드 스탯</h3>
            </div>
            <div className="space-y-2">
              {[
                { label: "메카닉", value: stats.totalMechanics, color: "#10B981" },
                { label: "라이닝", value: stats.totalLaning, color: "#3B82F6" },
                { label: "한타", value: stats.totalTeamfight, color: "#8B5CF6" },
                { label: "마크로", value: stats.totalMacro, color: "#F59E0B" },
                { label: "클러치", value: stats.totalClutch, color: "#EF4444" },
              ].map((stat) => (
                <div key={stat.label} className="flex justify-between items-center">
                  <div className="text-base" style={{ color: "#9AA6C3" }}>{stat.label}</div>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${Math.min(stat.value / 5, 100)}px`,
                        backgroundColor: stat.color,
                      }}
                    />
                    <div className="text-lg font-bold w-12 text-right" style={{ color: "#FFFFFF" }}>
                      {stat.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 활성 시너지 */}
          <div 
            className="rounded-xl p-6"
            style={{ 
              background: "rgba(18, 24, 42, 0.8)", 
              border: "1px solid rgba(147, 51, 234, 0.3)" 
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5" style={{ color: "#9333EA" }} />
              <h3 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>활성 시너지</h3>
              <span className="ml-auto text-sm font-bold" style={{ color: "#9333EA" }}>
                {synergies.length}개
              </span>
            </div>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {synergies.length === 0 ? (
                <div className="text-center py-8 text-sm" style={{ color: "#9AA6C3" }}>
                  시너지 없음
                </div>
              ) : (
                synergies.map((activeSynergy) => (
                  <div
                    key={activeSynergy.synergy.synergy_id}
                    className="rounded-lg p-3"
                    style={{ 
                      background: "rgba(147, 51, 234, 0.1)", 
                      border: "1px solid rgba(147, 51, 234, 0.3)" 
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-bold flex items-center gap-2" style={{ color: "#FFFFFF" }}>
                          {activeSynergy.synergy.name}
                          {activeSynergy.isPrime && (
                            <span 
                              className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                              style={{ background: "#FFB81C", color: "#0B0F1A" }}
                            >
                              PRIME
                            </span>
                          )}
                        </div>
                        {activeSynergy.currentEffect && (
                          <div className="text-xs mt-1" style={{ color: "#9AA6C3" }}>
                            {Object.entries({
                              OVR: activeSynergy.currentEffect.ovr,
                              메카닉: activeSynergy.currentEffect.mec,
                              라이닝: activeSynergy.currentEffect.lan,
                              한타: activeSynergy.currentEffect.tf,
                              마크로: activeSynergy.currentEffect.mac,
                              클러치: activeSynergy.currentEffect.clu,
                            })
                              .filter(([_, value]) => value > 0)
                              .map(([key, value]) => `${key} +${value}`)
                              .join(", ")}
                          </div>
                        )}
                      </div>
                      <div className="text-xs font-bold whitespace-nowrap" style={{ color: "#9333EA" }}>
                        {activeSynergy.matchedCount}명
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 워터마크 */}
        <div className="text-center mt-8 text-sm" style={{ color: "#9AA6C3" }}>
          LCK Gacha Squad Builder • lck-gacha.figma.app
        </div>
      </div>
    );
  }
);

SquadShareCard.displayName = "SquadShareCard";