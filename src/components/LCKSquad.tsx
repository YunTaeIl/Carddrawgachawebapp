// LCK 스쿼드 빌더 화면

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { ArrowLeft, Users, TrendingUp } from "lucide-react";
import { Position, POSITION_NAMES, UserCard } from "@/types/lck";
import { calculateActiveSynergies, calculateSquadStats } from "@/utils/synergyCalculator";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";

interface LCKSquadProps {
  onBack: () => void;
}

export function LCKSquad({ onBack }: LCKSquadProps) {
  const { userData, setSquadCard } = useGame();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
  const synergies = calculateActiveSynergies(userData.squad);
  const stats = calculateSquadStats(userData.squad, synergies);

  const positions: Position[] = ["TOP", "JNG", "MID", "ADC", "SUP"];

  const handleSlotClick = (position: Position) => {
    setSelectedPosition(position);
  };

  const handleCardSelect = (card: UserCard) => {
    if (selectedPosition) {
      setSquadCard(selectedPosition, card);
      setSelectedPosition(null);
    }
  };

  const handleRemoveCard = (position: Position) => {
    setSquadCard(position, null);
  };

  // 해당 포지션의 카드들 필터링
  const getAvailableCards = (position: Position): UserCard[] => {
    return userData.ownedCards.filter(c => c.position === position);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-[#EAF0FF] hover:text-[#2B6CFF]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">스쿼드 빌더</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 좌측: 스쿼드 배치 */}
          <div className="lg:col-span-2">
            <div className="bg-[#12182A] rounded-xl p-6 border border-[#2B6CFF]/30">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                스쿼드 배치
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {positions.map((position) => {
                  const card = userData.squad[position];
                  return (
                    <div
                      key={position}
                      className="bg-[#0B0F1A] rounded-lg p-4 border-2 border-[#2B6CFF]/30 hover:border-[#2B6CFF] transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        {/* 포지션 라벨 */}
                        <div className="flex-shrink-0 w-20 text-center">
                          <div className="text-sm text-[#9AA6C3]">{POSITION_NAMES[position]}</div>
                          <div className="text-2xl font-bold text-[#2B6CFF]">{position}</div>
                        </div>

                        {/* 카드 또는 빈 슬롯 */}
                        {card ? (
                          <div className="flex-1 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex-shrink-0">
                                <LCKHoloCard card={card} size="small" upgradeLevel={card.upgradeLevel} />
                              </div>
                              <div>
                                <div className="text-sm text-[#9AA6C3]">{card.team} ({card.year})</div>
                                <div className="text-lg font-bold">{card.name}</div>
                                <div className="text-sm text-[#9AA6C3]">
                                  OVR {card.stats.ovr + card.upgradeLevel}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleSlotClick(position)}
                              >
                                변경
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveCard(position)}
                              >
                                제거
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex-1">
                            <Button
                              variant="outline"
                              className="w-full h-24 border-dashed border-2"
                              onClick={() => handleSlotClick(position)}
                            >
                              + 카드 배치
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 우측: 스탯 & 시너지 */}
          <div className="space-y-6">
            {/* 총합 스탯 */}
            <div className="bg-[#12182A] rounded-xl p-6 border border-[#E4002B]/30">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                스쿼드 스탯
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[#9AA6C3]">총 OVR</span>
                  <span className="text-3xl font-bold text-[#D4AF37]">{stats.totalOVR}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#9AA6C3]">평균 OVR</span>
                  <span className="text-2xl font-bold text-[#2B6CFF]">{stats.avgOVR}</span>
                </div>
                
                <div className="pt-3 border-t border-[#2B6CFF]/30 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[#9AA6C3]">기계 (Mechanics)</span>
                    <span className="font-bold">{stats.totalMechanics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA6C3]">라인 (Laning)</span>
                    <span className="font-bold">{stats.totalLaning}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA6C3]">한타 (Teamfight)</span>
                    <span className="font-bold">{stats.totalTeamfight}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA6C3]">운영 (Macro)</span>
                    <span className="font-bold">{stats.totalMacro}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#9AA6C3]">클러치 (Clutch)</span>
                    <span className="font-bold">{stats.totalClutch}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 시너지 */}
            <div className="bg-[#12182A] rounded-xl p-6 border border-[#D4AF37]/30">
              <h3 className="text-lg font-bold mb-4">활성 시너지</h3>
              {synergies.length > 0 ? (
                <div className="space-y-3">
                  {synergies.map((synergy) => (
                    <div
                      key={synergy.id}
                      className="bg-[#0B0F1A] p-3 rounded-lg border border-[#D4AF37]/50"
                    >
                      <div className="flex items-start gap-2">
                        <div className="flex-shrink-0 w-2 h-2 rounded-full bg-[#D4AF37] mt-1.5" />
                        <div className="flex-1">
                          <div className="font-bold text-[#D4AF37]">{synergy.name}</div>
                          <div className="text-xs text-[#9AA6C3] mt-1">{synergy.description}</div>
                          <div className="text-xs text-[#2B6CFF] mt-1">{synergy.bonus}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#9AA6C3] py-8">
                  시너지 없음<br />
                  <span className="text-xs">같은 팀/연도 카드를 배치하세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 카드 선택 다이얼로그 */}
        <Dialog open={selectedPosition !== null} onOpenChange={() => setSelectedPosition(null)}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-[#12182A] text-[#EAF0FF]">
            <DialogHeader>
              <DialogTitle>
                {selectedPosition && `${POSITION_NAMES[selectedPosition]} 선택`}
              </DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
              {selectedPosition &&
                getAvailableCards(selectedPosition).map((card) => (
                  <div
                    key={card.instanceId}
                    onClick={() => handleCardSelect(card)}
                    className="cursor-pointer hover:scale-105 transition-transform"
                  >
                    <LCKHoloCard card={card} size="medium" upgradeLevel={card.upgradeLevel} />
                  </div>
                ))}
              {selectedPosition && getAvailableCards(selectedPosition).length === 0 && (
                <div className="col-span-3 text-center text-[#9AA6C3] py-12">
                  해당 포지션의 카드가 없습니다.<br />
                  <span className="text-xs">가챠를 통해 카드를 획득하세요!</span>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
