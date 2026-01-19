// LCK 스쿼드 빌더 화면

import React, { useState, useMemo } from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { ArrowLeft, Users, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Position, POSITION_NAMES, UserCard } from "@/types/lck";
import { calculateActiveSynergies, calculateSquadStats } from "@/utils/synergyCalculator";
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
import { Input } from "@/app/components/ui/input";

interface LCKSquadProps {
  onBack: () => void;
}

const CARDS_PER_PAGE = 15; // 한 페이지당 카드 수

export function LCKSquad({ onBack }: LCKSquadProps) {
  const { userData, setSquadCard } = useGame();
  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  
  // 검색 & 필터 상태
  const [searchQuery, setSearchQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [teamFilter, setTeamFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  const synergies = calculateActiveSynergies(userData.squad);
  const stats = calculateSquadStats(userData.squad, synergies);

  const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];

  // 모든 연도 (2013~2025)
  const allYears = Array.from({ length: 13 }, (_, i) => 2025 - i); // [2025, 2024, ..., 2013]

  const handleSlotClick = (position: Position) => {
    setSelectedPosition(position);
    // 다이얼로그 열 때 필터 초기화
    setSearchQuery("");
    setGradeFilter("all");
    setYearFilter("all");
    setTeamFilter("all");
    setCurrentPage(1);
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

  // 해당 포지션의 카드들 필터링 + 검색 + 필터 적용
  const getAvailableCards = (position: Position): UserCard[] => {
    let cards = userData.ownedCards.filter(c => c.position === position);
    
    // 검색어 필터
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      cards = cards.filter(c => 
        c.name.toLowerCase().includes(query) ||
        c.team.toLowerCase().includes(query)
      );
    }
    
    // 등급 필터
    if (gradeFilter !== "all") {
      cards = cards.filter(c => c.grade === gradeFilter);
    }
    
    // 연도 필터
    if (yearFilter !== "all") {
      cards = cards.filter(c => c.year === parseInt(yearFilter));
    }
    
    // 팀 필터
    if (teamFilter !== "all") {
      cards = cards.filter(c => c.team === teamFilter);
    }
    
    // OVR 내림차순 정렬
    return cards.sort((a, b) => (b.stats.ovr + b.upgradeLevel) - (a.stats.ovr + a.upgradeLevel));
  };

  // 페이징 처리된 카드 목록
  const getPaginatedCards = (position: Position) => {
    const allCards = getAvailableCards(position);
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    return {
      cards: allCards.slice(start, end),
      total: allCards.length,
      totalPages: Math.ceil(allCards.length / CARDS_PER_PAGE)
    };
  };
  
  // 팀 목록 추출 (중복 제거)
  const getUniqueTeams = (): string[] => {
    const teams = new Set(userData.ownedCards.map(c => c.team));
    return Array.from(teams).sort();
  };

  // 필터 변경 시 1페이지로 리셋
  const handleFilterChange = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      <div className="max-w-[1800px] mx-auto">
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

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-6">
          {/* 좌측: 스쿼드 배치 */}
          <div className="lg:col-span-5">
            <div className="bg-[#12182A] rounded-xl p-8 border border-[#2B6CFF]/30 overflow-x-auto">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Users className="w-5 h-5" />
                스쿼드 배치
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {positions.map((position) => {
                  const card = userData.squad[position];
                  return (
                    <div
                      key={position}
                      className="bg-[#0B0F1A] rounded-lg p-3 border-2 border-[#2B6CFF]/30 hover:border-[#2B6CFF] transition-colors"
                    >
                      <div className="flex flex-col items-center gap-3">
                        {/* 포지션 라벨 */}
                        <div className="text-center">
                          <div className="text-xs text-[#9AA6C3]">{POSITION_NAMES[position]}</div>
                          <div className="text-xl font-bold text-[#2B6CFF]">{position}</div>
                        </div>

                        {/* 카드 또는 빈 슬롯 */}
                        {card ? (
                          <div className="flex flex-col items-center gap-2 w-full">
                            <div className="flex-shrink-0">
                              <LCKHoloCard card={card} size="small" upgradeLevel={card.upgradeLevel} />
                            </div>
                            <div className="text-center w-full">
                              <div className="text-xs text-[#9AA6C3] truncate">{card.team}</div>
                              <div className="text-sm font-bold truncate">{card.name}</div>
                              <div className="text-xs text-[#9AA6C3]">
                                OVR {card.stats.ovr + card.upgradeLevel}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1 w-full">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => handleSlotClick(position)}
                              >
                                변경
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-xs"
                                onClick={() => handleRemoveCard(position)}
                              >
                                제거
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full">
                            <Button
                              variant="outline"
                              className="w-full h-[293px] border-dashed border-2 text-sm"
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
          <DialogContent 
            className="!max-w-none bg-[#12182A] text-[#EAF0FF]"
            style={{ width: '95vw', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <DialogHeader>
              <DialogTitle className="text-xl md:text-2xl">
                {selectedPosition && `${POSITION_NAMES[selectedPosition]} 카드 선택`}
              </DialogTitle>
            </DialogHeader>
            
            {/* 검색 & 필터 - 모바일 최적화 */}
            <div className="space-y-3">
              {/* 검색 */}
              <Input
                placeholder="카드 이름 또는 팀 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
              />
              
              {/* 필터들 - 모바일: 세로 / 데스크톱: 가로 */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <Select
                  value={gradeFilter}
                  onValueChange={handleFilterChange(setGradeFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="등급">
                      {gradeFilter === "all" ? "모든 등급" : gradeFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 등급</SelectItem>
                    <SelectItem value="S">S</SelectItem>
                    <SelectItem value="A">A</SelectItem>
                    <SelectItem value="B">B</SelectItem>
                    <SelectItem value="C">C</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select
                  value={yearFilter}
                  onValueChange={handleFilterChange(setYearFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="연도">
                      {yearFilter === "all" ? "모든 연도" : yearFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 연도</SelectItem>
                    {allYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select
                  value={teamFilter}
                  onValueChange={handleFilterChange(setTeamFilter)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="팀">
                      {teamFilter === "all" ? "모든 팀" : teamFilter}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">모든 팀</SelectItem>
                    {getUniqueTeams().map(team => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* 카드 그리드 - 모바일 최적화 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 lg:gap-8 mt-4 p-2 sm:p-4 lg:p-6">
              {selectedPosition &&
                getPaginatedCards(selectedPosition).cards.map((card) => (
                  <div
                    key={card.instanceId}
                    className="flex justify-center"
                  >
                    <LCKHoloCard 
                      card={card} 
                      size="medium" 
                      upgradeLevel={card.upgradeLevel}
                      onClick={() => handleCardSelect(card)}
                      disableFlip={true}
                    />
                  </div>
                ))}
              {selectedPosition && getPaginatedCards(selectedPosition).cards.length === 0 && (
                <div className="col-span-full text-center text-[#9AA6C3] py-12">
                  해당 포지션의 카드가 없습니다.<br />
                  <span className="text-xs">가챠를 통해 카드를 획득하세요!</span>
                </div>
              )}
            </div>
            
            {/* 페이지네이션 */}
            {selectedPosition && getPaginatedCards(selectedPosition).total > CARDS_PER_PAGE && (
              <div className="flex justify-center items-center gap-2 mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm text-[#9AA6C3] px-2">
                  {currentPage} / {getPaginatedCards(selectedPosition).totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === getPaginatedCards(selectedPosition).totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}