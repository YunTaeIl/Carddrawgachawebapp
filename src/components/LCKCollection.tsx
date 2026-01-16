// LCK 컬렉션 (인벤토리) 화면

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { ArrowLeft, Filter, Sparkles } from "lucide-react";
import { Grade, Position, UserCard, GACHA_CONFIG } from "@/types/lck";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/app/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/app/components/ui/select";

interface LCKCollectionProps {
  onBack: () => void;
}

export function LCKCollection({ onBack }: LCKCollectionProps) {
  const { userData, upgradeCard, craftCardWithShards } = useGame();
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [filterGrade, setFilterGrade] = useState<Grade | "all">("all");
  const [filterPosition, setFilterPosition] = useState<Position | "all">("all");
  const [sortBy, setSortBy] = useState<"ovr" | "recent">("ovr");

  // 필터링 & 정렬
  let filteredCards = [...userData.ownedCards];
  
  if (filterGrade !== "all") {
    filteredCards = filteredCards.filter(c => c.grade === filterGrade);
  }
  
  if (filterPosition !== "all") {
    filteredCards = filteredCards.filter(c => c.position === filterPosition);
  }
  
  if (sortBy === "ovr") {
    filteredCards.sort((a, b) => (b.stats.ovr + b.upgradeLevel) - (a.stats.ovr + a.upgradeLevel));
  } else {
    filteredCards.sort((a, b) => b.obtainedAt - a.obtainedAt);
  }

  const handleUpgrade = (cardInstanceId: string) => {
    const success = upgradeCard(cardInstanceId);
    if (success && selectedCard) {
      // 선택된 카드 업데이트
      const updated = userData.ownedCards.find(c => c.instanceId === cardInstanceId);
      if (updated) {
        setSelectedCard(updated);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#EAF0FF] hover:text-[#2B6CFF]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-3xl font-bold">컬렉션</h1>
          </div>
          
          <div className="text-sm text-[#9AA6C3]">
            보유: {userData.ownedCards.length}장
          </div>
        </div>

        {/* 샤드 제작 */}
        <div className="bg-[#12182A] rounded-xl p-6 mb-6 border border-[#D4AF37]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-bold">샤드 제작</h3>
            </div>
            <div className="text-sm text-[#9AA6C3]">
              보유: <span className="text-[#D4AF37] font-bold">{userData.shards}</span> 샤드
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#B7C2D6]/50">
              <div className="flex justify-between items-center mb-3">
                <div className="text-lg font-bold text-[#B7C2D6]">A 등급 제작</div>
                <div className="text-sm text-[#9AA6C3]">300 샤드</div>
              </div>
              <Button
                onClick={() => craftCardWithShards("A")}
                disabled={userData.shards < GACHA_CONFIG.CRAFT_COSTS.A}
                className="w-full bg-[#B7C2D6] hover:bg-[#B7C2D6]/80 text-[#0B0F1A]"
              >
                제작
              </Button>
            </div>
            
            <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#D4AF37]/50">
              <div className="flex justify-between items-center mb-3">
                <div className="text-lg font-bold text-[#D4AF37]">S 등급 제작</div>
                <div className="text-sm text-[#9AA6C3]">900 샤드</div>
              </div>
              <Button
                onClick={() => craftCardWithShards("S")}
                disabled={userData.shards < GACHA_CONFIG.CRAFT_COSTS.S}
                className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0B0F1A]"
              >
                제작
              </Button>
            </div>
          </div>
        </div>

        {/* 필터 & 정렬 */}
        <div className="bg-[#12182A] rounded-xl p-4 mb-6 border border-[#2B6CFF]/30">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#9AA6C3]" />
              <span className="text-sm text-[#9AA6C3]">필터:</span>
            </div>
            
            <Select value={filterGrade} onValueChange={(v) => setFilterGrade(v as Grade | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="등급" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPosition} onValueChange={(v) => setFilterPosition(v as Position | "all")}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="포지션" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="TOP">TOP</SelectItem>
                <SelectItem value="JNG">JNG</SelectItem>
                <SelectItem value="MID">MID</SelectItem>
                <SelectItem value="ADC">ADC</SelectItem>
                <SelectItem value="SUP">SUP</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex-1" />

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as "ovr" | "recent")}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="정렬" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ovr">OVR 높은순</SelectItem>
                <SelectItem value="recent">최신순</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 카드 그리드 */}
        {filteredCards.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {filteredCards.map((card) => (
              <div
                key={card.instanceId}
                onClick={() => setSelectedCard(card)}
                className="cursor-pointer hover:scale-105 transition-transform"
              >
                <LCKHoloCard card={card} size="medium" upgradeLevel={card.upgradeLevel} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-[#9AA6C3] py-20">
            <p className="text-lg mb-2">카드가 없습니다</p>
            <p className="text-sm">가챠를 통해 카드를 획득하세요!</p>
          </div>
        )}

        {/* 카드 상세 다이얼로그 */}
        <Dialog open={selectedCard !== null} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-2xl bg-[#12182A] text-[#EAF0FF]">
            {selectedCard && (
              <>
                <DialogHeader>
                  <DialogTitle>카드 상세</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                  {/* 카드 미리보기 */}
                  <div className="flex justify-center">
                    <LCKHoloCard card={selectedCard} size="large" upgradeLevel={selectedCard.upgradeLevel} />
                  </div>

                  {/* 상세 정보 */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold mb-2">{selectedCard.name}</h3>
                      <div className="text-sm text-[#9AA6C3] space-y-1">
                        <div>{selectedCard.team} ({selectedCard.year})</div>
                        <div>{selectedCard.position}</div>
                        <div>등급: {selectedCard.grade}</div>
                      </div>
                    </div>

                    {/* 스탯 */}
                    <div className="bg-[#0B0F1A] p-4 rounded-lg">
                      <h4 className="font-bold mb-3">스탯</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">OVR</span>
                          <span className="font-bold text-lg">
                            {selectedCard.stats.ovr + selectedCard.upgradeLevel}
                            {selectedCard.upgradeLevel > 0 && (
                              <span className="text-green-400 text-sm ml-1">+{selectedCard.upgradeLevel}</span>
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">기계</span>
                          <span>{selectedCard.stats.mechanics}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">라인</span>
                          <span>{selectedCard.stats.laning}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">한타</span>
                          <span>{selectedCard.stats.teamfight}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">운영</span>
                          <span>{selectedCard.stats.macro}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-[#9AA6C3]">클러치</span>
                          <span>{selectedCard.stats.clutch}</span>
                        </div>
                      </div>
                    </div>

                    {/* 강화 */}
                    <div className="bg-[#0B0F1A] p-4 rounded-lg">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold">강화</h4>
                        <div className="text-sm text-[#9AA6C3]">
                          {selectedCard.upgradeLevel} / {GACHA_CONFIG.MAX_UPGRADE}
                        </div>
                      </div>
                      <div className="text-xs text-[#9AA6C3] mb-3">
                        샤드 {GACHA_CONFIG.UPGRADE_COST}개당 +1 OVR
                      </div>
                      <Button
                        onClick={() => handleUpgrade(selectedCard.instanceId)}
                        disabled={
                          selectedCard.upgradeLevel >= GACHA_CONFIG.MAX_UPGRADE ||
                          userData.shards < GACHA_CONFIG.UPGRADE_COST
                        }
                        className="w-full bg-[#2B6CFF] hover:bg-[#2B6CFF]/80"
                      >
                        강화 ({GACHA_CONFIG.UPGRADE_COST} 샤드)
                      </Button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
