// LCK 컬렉션 (인벤토리) 화면

import React, { useState, useMemo } from "react";
import { useGame, CraftResult } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { ArrowLeft, Filter, Sparkles, ChevronLeft, ChevronRight, Hammer, Search, X } from "lucide-react";
import { Grade, Position, UserCard, LCKCard, GACHA_CONFIG } from "@/types/lck";
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

const CARDS_PER_PAGE = 20; // 한 페이지당 카드 수

export function LCKCollection({ onBack }: LCKCollectionProps) {
  const { userData, allCards, upgradeCard, craftCardWithShards, craftLiveCardWithShards, craftSpecificCard } = useGame();
  const [activeTab, setActiveTab] = useState<"owned" | "craft">("owned");
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [craftResult, setCraftResult] = useState<CraftResult | null>(null); // 🔥 제작 결과 모달용
  const [filterGrade, setFilterGrade] = useState<Grade | "all">("all");
  const [filterPosition, setFilterPosition] = useState<Position | "all">("all");
  const [filterTeam, setFilterTeam] = useState<string>("all");
  const [filterYear, setFilterYear] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"ovr" | "recent">("ovr");
  const [searchText, setSearchText] = useState<string>(""); // 🔍 검색어
  const [currentPage, setCurrentPage] = useState(1);

  // 고유 팀/연도 목록 추출 (보유 카드 기준)
  const uniqueTeams = useMemo(() => {
    const teams = new Set(userData.ownedCards.map(c => c.team));
    return Array.from(teams).sort();
  }, [userData.ownedCards]);

  // 전체 카드 기준 팀/연도
  const allTeams = useMemo(() => {
    const teams = new Set(allCards.map(c => c.team));
    return Array.from(teams).sort();
  }, [allCards]);

  // 모든 연도 (2013~2026)
  const allYears = Array.from({ length: 14 }, (_, i) => 2026 - i); // [2026, 2025, 2024, ..., 2013]

  // 🎯 미보유 카드만 필터링
  const unownedCards = useMemo(() => {
    const ownedIds = new Set(userData.ownedCards.map(c => c.id));
    return allCards.filter(c => !ownedIds.has(c.id));
  }, [allCards, userData.ownedCards]);

  // 필터링 & 정렬 (보유 카드)
  const filteredOwnedCards = useMemo(() => {
    let cards = [...userData.ownedCards];
    
    // 🔍 검색 필터
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      cards = cards.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.team.toLowerCase().includes(search)
      );
    }
    
    if (filterGrade !== "all") {
      cards = cards.filter(c => c.grade === filterGrade);
    }
    
    if (filterPosition !== "all") {
      cards = cards.filter(c => c.position === filterPosition);
    }

    if (filterTeam !== "all") {
      cards = cards.filter(c => c.team === filterTeam);
    }

    if (filterYear !== "all") {
      cards = cards.filter(c => c.year === parseInt(filterYear));
    }
    
    if (sortBy === "ovr") {
      cards.sort((a, b) => (b.stats.ovr + b.upgradeLevel) - (a.stats.ovr + a.upgradeLevel));
    } else {
      cards.sort((a, b) => b.obtainedAt - a.obtainedAt);
    }

    return cards;
  }, [userData.ownedCards, searchText, filterGrade, filterPosition, filterTeam, filterYear, sortBy]);

  // 필터링 & 정렬 (미보유 카드)
  const filteredUnownedCards = useMemo(() => {
    let cards = [...unownedCards];
    
    // 🔍 검색 필터
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      cards = cards.filter(c => 
        c.name.toLowerCase().includes(search) || 
        c.team.toLowerCase().includes(search)
      );
    }
    
    if (filterGrade !== "all") {
      cards = cards.filter(c => c.grade === filterGrade);
    }
    
    if (filterPosition !== "all") {
      cards = cards.filter(c => c.position === filterPosition);
    }

    if (filterTeam !== "all") {
      cards = cards.filter(c => c.team === filterTeam);
    }

    if (filterYear !== "all") {
      cards = cards.filter(c => c.year === parseInt(filterYear));
    }
    
    // 미보유는 OVR 순서만
    cards.sort((a, b) => b.stats.ovr - a.stats.ovr);

    return cards;
  }, [unownedCards, searchText, filterGrade, filterPosition, filterTeam, filterYear]);

  // 현재 탭에 따른 카드 목록
  const currentCards = activeTab === "owned" ? filteredOwnedCards : filteredUnownedCards;

  // 페이지네이션
  const totalPages = Math.ceil(currentCards.length / CARDS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const start = (currentPage - 1) * CARDS_PER_PAGE;
    const end = start + CARDS_PER_PAGE;
    return currentCards.slice(start, end);
  }, [currentCards, currentPage]);

  // 필터 변경 시 첫 페이지로
  const handleFilterChange = (setter: (v: any) => void) => (value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  // 탭 변경 시 첫 페이지로
  const handleTabChange = (tab: "owned" | "craft") => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

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
  
  // 🔥 샤드로 랜덤 카드 제작 핸들러
  const handleCraftCard = async (grade: "A" | "S" | "LIVE-A" | "LIVE-S") => {
    let result;
    
    if (grade === "LIVE-A") {
      result = await craftLiveCardWithShards("A");
    } else if (grade === "LIVE-S") {
      result = await craftLiveCardWithShards("S");
    } else {
      result = await craftCardWithShards(grade);
    }
    
    if (result) {
      setCraftResult(result); // 모달 열기
    }
  };

  // 🎯 지정 카드 제작 핸들러
  const handleCraftSpecific = async (cardId: string) => {
    const result = await craftSpecificCard(cardId);
    if (result) {
      setCraftResult(result);
    }
  };

  // 🎯 등급별 제작 비용 계산
  const getCraftCost = (grade: Grade): number => {
    const costs: Record<Grade, number> = {
      "C": 4000,
      "B": 35000,
      "A": 70000,
      "S": 100000,
      "LIVE": 10000000
    };
    return costs[grade];
  };

  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 - 모바일 최적화 */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-[#EAF0FF] hover:text-[#2B6CFF]"
            >
              <ArrowLeft className="w-6 h-6" />
            </Button>
            <h1 className="text-2xl sm:text-3xl font-bold">컬렉션</h1>
          </div>
          
          <div className="text-sm text-[#9AA6C3] sm:text-right space-y-1">
            <div>보유: <span className="font-bold">{userData.ownedCards.length}</span>장 / {allCards.length}장</div>
            <div>샤드: <span className="text-[#D4AF37] font-bold">{userData.shards.toLocaleString()}</span></div>
          </div>
        </div>

        {/* 탭 */}
        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => handleTabChange("owned")}
            className={activeTab === "owned" 
              ? "bg-[#2B6CFF] text-white hover:bg-[#2B6CFF]/90" 
              : "bg-[#12182A] text-[#9AA6C3] hover:bg-[#12182A]/80"
            }
          >
            <Filter className="w-4 h-4 mr-2" />
            보유 카드
          </Button>
          <Button
            onClick={() => userData.isAdmin && handleTabChange("craft")}
            disabled={!userData.isAdmin}
            className={activeTab === "craft" 
              ? "bg-[#D4AF37] text-[#0B0F1A] hover:bg-[#D4AF37]/90" 
              : userData.isAdmin
              ? "bg-[#12182A] text-[#9AA6C3] hover:bg-[#12182A]/80"
              : "bg-[#12182A] text-gray-600 cursor-not-allowed opacity-50"
            }
          >
            {userData.isAdmin ? <Hammer className="w-4 h-4 mr-2" /> : <span className="mr-2">🔒</span>}
            카드 제작소
            {userData.isAdmin && (
              <span className="ml-2 text-xs px-2 py-0.5 bg-red-500/30 text-red-300 rounded-full border border-red-400/50">
                ADMIN
              </span>
            )}
          </Button>
        </div>

        {/* 🔥 보유 카드 탭 */}
        {activeTab === "owned" && (
          <>
            {/* 샤드 랜덤 제작 - 모바일 최적화 */}
            <div className="bg-[#12182A] rounded-xl p-4 sm:p-6 mb-6 border border-[#D4AF37]/30">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-lg font-bold">랜덤 샤드 제작</h3>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#B7C2D6]/50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-base sm:text-lg font-bold text-[#B7C2D6]">A 등급 제작</div>
                    <div className="text-sm text-[#9AA6C3]">300 샤드</div>
                  </div>
                  <Button
                    onClick={() => handleCraftCard("A")}
                    disabled={userData.shards < GACHA_CONFIG.CRAFT_COSTS.A}
                    className="w-full bg-[#B7C2D6] hover:bg-[#B7C2D6]/80 text-[#0B0F1A]"
                  >
                    제작
                  </Button>
                </div>
                
                <div className="bg-[#0B0F1A] p-4 rounded-lg border border-[#D4AF37]/50">
                  <div className="flex justify-between items-center mb-3">
                    <div className="text-base sm:text-lg font-bold text-[#D4AF37]">S 등급 제작</div>
                    <div className="text-sm text-[#9AA6C3]">900 샤드</div>
                  </div>
                  <Button
                    onClick={() => handleCraftCard("S")}
                    disabled={userData.shards < GACHA_CONFIG.CRAFT_COSTS.S}
                    className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0B0F1A]"
                  >
                    제작
                  </Button>
                </div>
              </div>

              {/* LIVE 등급 제작 (프리미엄) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs px-3 py-1 bg-gradient-to-r from-pink-500/30 to-purple-500/30 text-pink-300 rounded-full border border-pink-400/50 font-bold">
                    🔥 2026 LIVE SEASON
                  </span>
                  {userData.isAdmin && (
                    <span className="text-xs px-2 py-1 bg-gradient-to-r from-red-500/30 to-orange-500/30 text-red-300 rounded-full border border-red-400/50 font-bold">
                      👑 ADMIN
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {/* LIVE A 등급 */}
                  <div className="bg-gradient-to-br from-pink-500/15 to-purple-500/15 p-4 rounded-lg border-2 border-pink-400/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 via-purple-500/5 to-pink-500/5 animate-pulse" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">
                          LIVE A 등급
                        </div>
                        <div className="text-sm text-pink-300 font-bold">{GACHA_CONFIG.LIVE_CRAFT_COSTS.A.toLocaleString()} 샤드</div>
                      </div>
                      {!userData.isAdmin ? (
                        <div className="w-full py-2 text-center text-gray-500 text-sm border-2 border-gray-700 rounded-lg bg-gray-800/50">
                          🔒 관리자 전용
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleCraftCard("LIVE-A")}
                          disabled={userData.shards < GACHA_CONFIG.LIVE_CRAFT_COSTS.A}
                          className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold"
                        >
                          제작
                        </Button>
                      )}
                    </div>
                  </div>

                  {/* LIVE S 등급 */}
                  <div className="bg-gradient-to-br from-pink-500/20 to-purple-500/20 p-4 rounded-lg border-2 border-pink-500/60 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-pink-500/10 animate-pulse" />
                    <div className="relative">
                      <div className="flex justify-between items-center mb-3">
                        <div className="text-base sm:text-lg font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                          LIVE S 등급
                        </div>
                        <div className="text-sm text-pink-300 font-bold">{GACHA_CONFIG.LIVE_CRAFT_COSTS.S.toLocaleString()} 샤드</div>
                      </div>
                      {!userData.isAdmin ? (
                        <div className="w-full py-2 text-center text-gray-500 text-sm border-2 border-gray-700 rounded-lg bg-gray-800/50">
                          🔒 관리자 전용
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleCraftCard("LIVE-S")}
                          disabled={userData.shards < GACHA_CONFIG.LIVE_CRAFT_COSTS.S}
                          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg shadow-pink-500/30"
                        >
                          제작
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 필터 & 정렬 - 모바일 최적화 */}
        <div className="bg-[#12182A] rounded-xl p-4 mb-6 border border-[#2B6CFF]/30">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="w-4 h-4 text-[#9AA6C3]" />
            <span className="text-sm text-[#9AA6C3]">필터 & 정렬</span>
          </div>
          
          {/* 🔍 검색창 */}
          <div className="mb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9AA6C3]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="선수 이름 또는 팀 검색..."
                className="w-full bg-[#0B0F1A] text-[#EAF0FF] pl-10 pr-10 py-2.5 rounded-lg border border-[#2B6CFF]/30 focus:border-[#2B6CFF] focus:outline-none placeholder:text-[#9AA6C3]/50 transition-colors"
              />
              {searchText && (
                <button
                  onClick={() => {
                    setSearchText("");
                    setCurrentPage(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9AA6C3] hover:text-[#EAF0FF] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            <Select value={filterGrade} onValueChange={handleFilterChange(setFilterGrade)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="등급" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="LIVE">LIVE</SelectItem>
                <SelectItem value="S">S</SelectItem>
                <SelectItem value="A">A</SelectItem>
                <SelectItem value="B">B</SelectItem>
                <SelectItem value="C">C</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPosition} onValueChange={handleFilterChange(setFilterPosition)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="포지션" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                <SelectItem value="TOP">TOP</SelectItem>
                <SelectItem value="JGL">JGL</SelectItem>
                <SelectItem value="MID">MID</SelectItem>
                <SelectItem value="ADC">ADC</SelectItem>
                <SelectItem value="SUP">SUP</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterTeam} onValueChange={handleFilterChange(setFilterTeam)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="팀" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {(activeTab === "owned" ? uniqueTeams : allTeams).map(team => (
                  <SelectItem key={team} value={team}>{team}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterYear} onValueChange={handleFilterChange(setFilterYear)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="연도" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">전체</SelectItem>
                {allYears.map(year => (
                  <SelectItem key={year} value={String(year)}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeTab === "owned" && (
              <Select value={sortBy} onValueChange={handleFilterChange(setSortBy)}>
                <SelectTrigger className="w-full sm:col-span-2 lg:col-span-2">
                  <SelectValue placeholder="정렬" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ovr">OVR 높은순</SelectItem>
                  <SelectItem value="recent">최신순</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {/* 카드 그리드 - 모바일 최적화 */}
        {currentCards.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-8">
              {paginatedCards.map((card) => {
                const isOwned = activeTab === "owned";
                const craftCost = isOwned ? 0 : getCraftCost(card.grade);
                const canCraft = userData.shards >= craftCost;

                return (
                  <div
                    key={isOwned ? (card as UserCard).instanceId : card.id}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="hover:scale-105 transition-transform">
                      <LCKHoloCard 
                        card={card} 
                        size="medium" 
                        upgradeLevel={isOwned ? (card as UserCard).upgradeLevel : 0} 
                      />
                    </div>
                    
                    {/* 제작소 탭에서만 제작 버튼 표시 */}
                    {activeTab === "craft" && userData.isAdmin && (
                      <Button
                        onClick={() => handleCraftSpecific(card.id)}
                        disabled={!canCraft}
                        className={`w-full text-xs py-1 ${
                          card.grade === "LIVE" 
                            ? "bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white" 
                            : card.grade === "S"
                            ? "bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0B0F1A]"
                            : card.grade === "A"
                            ? "bg-[#B7C2D6] hover:bg-[#B7C2D6]/80 text-[#0B0F1A]"
                            : "bg-[#9AA6C3] hover:bg-[#9AA6C3]/80 text-[#0B0F1A]"
                        }`}
                      >
                        💎 {craftCost.toLocaleString()}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 페이지네이션 - 모바일 최적화 */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 bg-[#12182A] rounded-xl p-4 border border-[#2B6CFF]/30">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="text-[#EAF0FF] hover:text-[#2B6CFF] disabled:opacity-30"
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 text-center">
                  <span className="text-sm text-[#9AA6C3]">
                    페이지 <span className="text-[#2B6CFF] font-bold">{currentPage}</span> / {totalPages}
                  </span>
                  <span className="text-xs text-[#9AA6C3]">
                    ({currentCards.length}장 중 {(currentPage - 1) * CARDS_PER_PAGE + 1}-{Math.min(currentPage * CARDS_PER_PAGE, currentCards.length)})
                  </span>
                </div>
                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="text-[#EAF0FF] hover:text-[#2B6CFF] disabled:opacity-30"
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-[#9AA6C3] py-20">
            {activeTab === "owned" ? (
              <>
                <p className="text-lg mb-2">카드가 없습니다</p>
                <p className="text-sm">가챠를 통해 카드를 획득하세요!</p>
              </>
            ) : !userData.isAdmin ? (
              <>
                <p className="text-4xl mb-4">🔒</p>
                <p className="text-xl mb-2 font-bold text-red-400">관리자 전용 기능</p>
                <p className="text-sm">카드 지정 제작은 관리자만 사용할 수 있습니다.</p>
              </>
            ) : (
              <>
                <p className="text-lg mb-2">🎉 모든 카드를 수집했습니다!</p>
                <p className="text-sm">축하합니다!</p>
              </>
            )}
          </div>
        )}

        {/* 카드 상세 다이얼로그 - 모바일 최적화 */}
        <Dialog open={selectedCard !== null} onOpenChange={() => setSelectedCard(null)}>
          <DialogContent className="max-w-4xl bg-[#12182A] text-[#EAF0FF] max-h-[90vh] overflow-y-auto">
            {selectedCard && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-xl sm:text-2xl">카드 상세</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col md:flex-row gap-4 sm:gap-6 mt-4">
                  {/* 카드 미리보기 */}
                  <div className="flex justify-center md:justify-start shrink-0">
                    <LCKHoloCard card={selectedCard} size="large" upgradeLevel={selectedCard.upgradeLevel} />
                  </div>

                  {/* 상세 정보 */}
                  <div className="space-y-4 flex-1 min-w-0">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold mb-2">{selectedCard.name}</h3>
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
                          <span className="text-[#9AA6C3]">메카닉</span>
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

        {/* 🔥 제작 결과 모달 */}
        <Dialog open={craftResult !== null} onOpenChange={() => setCraftResult(null)}>
          <DialogContent className="max-w-2xl bg-[#12182A] text-[#EAF0FF] border-2 border-[#D4AF37]/50">
            {craftResult && (
              <>
                <DialogHeader>
                  <DialogTitle className="text-2xl text-center text-[#D4AF37] flex items-center justify-center gap-2">
                    <Sparkles className="w-6 h-6" />
                    {craftResult.isDupe ? "중복 카드 획득!" : `${craftResult.card.grade}등급 카드 제작 완료!`}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-6 py-4">
                  {/* 카드 */}
                  <div className="transform scale-110">
                    <LCKHoloCard card={craftResult.card} size="large" upgradeLevel={0} />
                  </div>

                  {/* 카드 정보 */}
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold">{craftResult.card.name}</h3>
                    <div className="text-[#9AA6C3]">
                      {craftResult.card.team} ({craftResult.card.year}) - {craftResult.card.position}
                    </div>
                    <div className="text-lg font-bold">OVR {craftResult.card.stats.ovr}</div>
                    
                    {/* 중복 메시지 */}
                    {craftResult.isDupe && (
                      <div className="mt-4 px-4 py-3 bg-[#0047AB]/20 border border-[#0047AB]/50 rounded-lg">
                        <div className="flex items-center justify-center gap-2 text-[#0047AB]">
                          <Sparkles className="w-5 h-5" />
                          <span className="font-bold">
                            이미 보유한 카드! +{craftResult.shardsGained} 샤드 획득
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 확인 버튼 */}
                  <Button
                    onClick={() => setCraftResult(null)}
                    className="w-full bg-[#D4AF37] hover:bg-[#D4AF37]/80 text-[#0B0F1A] font-bold"
                  >
                    확인
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
