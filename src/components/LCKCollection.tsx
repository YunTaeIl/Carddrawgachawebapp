// LCK 컬렉션 (인벤토리) 화면

import React, { useState, useMemo, useEffect } from "react";
import { useGame, CraftResult } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { ArrowLeft, Filter, Sparkles, ChevronLeft, ChevronRight, Hammer, Search, X, TrendingUp, Shield, Skull, HelpCircle } from "lucide-react";
import { Grade, Position, UserCard, LCKCard, GACHA_CONFIG, UPGRADE_RATES, UPGRADE_COSTS, calculateUpgradeStatBonus, getTotalUpgradeBonus, calculateEnhancedOVR, isLiveCard } from "@/types/lck";
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
  const gameContext = useGame();
  
  // 안전 가드
  if (!gameContext) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#0B0F1A] via-[#12182A] to-[#1A2332] flex items-center justify-center">
        <div className="text-[#EAF0FF] text-center">
          <div className="text-2xl mb-4">⚠️</div>
          <div>게임 데이터를 불러오는 중...</div>
        </div>
      </div>
    );
  }
  
  const { userData, allCards, upgradeCard, craftCardWithShards, craftLiveCardWithShards, craftSpecificCard, recoverBrokenCard, confirmCardBreak } = gameContext;
  const [activeTab, setActiveTab] = useState<"owned" | "craft">("owned");
  const [selectedCard, setSelectedCard] = useState<UserCard | null>(null);
  const [upgradeModalCard, setUpgradeModalCard] = useState<UserCard | null>(null); // 🔧 강화 모달용
  const [craftResult, setCraftResult] = useState<CraftResult | null>(null); // 🔥 제작 결과 모달용
  const [isUpgrading, setIsUpgrading] = useState(false); // ⬆️ 강화 중 애니메이션 상태
  const [showHelpModal, setShowHelpModal] = useState(false); // 💡 도움말 모달
  
  // 💾 localStorage에서 필터 불러오기
  const [filterGrade, setFilterGrade] = useState<Grade[]>(() => {
    const saved = localStorage.getItem("lck_filter_grade");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [filterPosition, setFilterPosition] = useState<Position[]>(() => {
    const saved = localStorage.getItem("lck_filter_position");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [filterTeam, setFilterTeam] = useState<string[]>(() => {
    const saved = localStorage.getItem("lck_filter_team");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [filterYear, setFilterYear] = useState<number[]>(() => {
    const saved = localStorage.getItem("lck_filter_year");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  });
  const [sortBy, setSortBy] = useState<"ovr" | "recent">(() => {
    const saved = localStorage.getItem("lck_filter_sortBy");
    return (saved as "ovr" | "recent") || "ovr";
  });
  const [searchText, setSearchText] = useState<string>(() => {
    return localStorage.getItem("lck_filter_search") || "";
  }); // 🔍 검색어
  const [currentPage, setCurrentPage] = useState(1);

  // 💾 필터 변경 시 localStorage에 저장
  useEffect(() => {
    localStorage.setItem("lck_filter_grade", JSON.stringify(filterGrade));
  }, [filterGrade]);

  useEffect(() => {
    localStorage.setItem("lck_filter_position", JSON.stringify(filterPosition));
  }, [filterPosition]);

  useEffect(() => {
    localStorage.setItem("lck_filter_team", JSON.stringify(filterTeam));
  }, [filterTeam]);

  useEffect(() => {
    localStorage.setItem("lck_filter_year", JSON.stringify(filterYear));
  }, [filterYear]);

  useEffect(() => {
    localStorage.setItem("lck_filter_sortBy", sortBy);
  }, [sortBy]);

  useEffect(() => {
    localStorage.setItem("lck_filter_search", searchText);
  }, [searchText]);

  // 🔥 upgradeModalCard 실시간 업데이트 (강화 후 자동 갱신)
  useEffect(() => {
    if (upgradeModalCard) {
      const updated = userData.ownedCards.find(c => c.instanceId === upgradeModalCard.instanceId);
      if (updated) {
        setUpgradeModalCard(updated);
      }
    }
  }, [userData.ownedCards]);

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
    
    if (filterGrade.length > 0) {
      cards = cards.filter(c => filterGrade.includes(c.grade));
    }
    
    if (filterPosition.length > 0) {
      cards = cards.filter(c => filterPosition.includes(c.position));
    }

    if (filterTeam.length > 0) {
      cards = cards.filter(c => filterTeam.includes(c.team));
    }

    if (filterYear.length > 0) {
      cards = cards.filter(c => filterYear.includes(c.year));
    }
    
    if (sortBy === "ovr") {
      cards.sort((a, b) => {
        const aOVR = calculateEnhancedOVR(a.stats, a.upgradeLevel, a.grade, a.position);
        const bOVR = calculateEnhancedOVR(b.stats, b.upgradeLevel, b.grade, b.position);
        return bOVR - aOVR;
      });
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
    
    if (filterGrade.length > 0) {
      cards = cards.filter(c => filterGrade.includes(c.grade));
    }
    
    if (filterPosition.length > 0) {
      cards = cards.filter(c => filterPosition.includes(c.position));
    }

    if (filterTeam.length > 0) {
      cards = cards.filter(c => filterTeam.includes(c.team));
    }

    if (filterYear.length > 0) {
      cards = cards.filter(c => filterYear.includes(c.year));
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

  const [upgradeResult, setUpgradeResult] = useState<{
    result: import("@/types/lck").UpgradeResult;
    card?: UserCard;
    beforeLevel: number;
    afterLevel: number;
    shardsCost: number;
    recoveryCost?: number;
    brokenCard?: UserCard;
    statChanges?: {
      mechanics: number;
      laning: number;
      teamfight: number;
      macro: number;
      clutch: number;
    };
  } | null>(null);

  const handleUpgrade = async (cardInstanceId: string) => {
    const card = userData.ownedCards.find(c => c.instanceId === cardInstanceId);
    if (!card) return;

    // ⬆️ 강화 애니메이션 시작
    setIsUpgrading(true);

    // 1초 대기 (애니메이션 효과)
    await new Promise(resolve => setTimeout(resolve, 1000));

    const beforeLevel = card.upgradeLevel;
    const result = await upgradeCard(cardInstanceId);
    
    // ⬆️ 애니메이션 종료
    setIsUpgrading(false);
    
    if (result) {
      // 결과 모달 표시
      setUpgradeResult({
        result: result.result,
        card: result.card,
        beforeLevel: beforeLevel,
        afterLevel: result.result === "SUCCESS" ? beforeLevel + 1 : beforeLevel,
        shardsCost: result.shardsCost,
        recoveryCost: result.recoveryCost,
        brokenCard: result.brokenCard,
        statChanges: result.statChanges
      });

      // 🔥 파괴 시 강화창은 복구/포기 선택 후에 닫음 (Dialog 충돌 방지)
      // setUpgradeModalCard를 여기서 닫으면 Radix Dialog 간 충돌로 결과 모달이 안 열림
      // 성공/유지 시에는 강화창 유지 (닫지 않음)
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
  const getCraftCost = (card: LCKCard): number => {
    // 🔥 LIVE 카드 체크
    const isLive = card.year === 2026;
    
    if (isLive) {
      // LIVE 카드는 등급에 따라 100배 비용
      if (card.grade === "S") return 10000000;  // 1000만
      if (card.grade === "A") return 7000000;   // 700만
      if (card.grade === "B") return 3500000;   // 350만
      if (card.grade === "C") return 400000;    // 40만
    }
    
    // 일반 카드
    const costs: Record<Grade, number> = {
      "C": 4000,
      "B": 35000,
      "A": 70000,
      "S": 100000
    };
    return costs[card.grade] || 0;
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
        <div className="flex gap-2 mb-6 flex-wrap">
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
            onClick={() => handleTabChange("craft")}
            className={activeTab === "craft" 
              ? "bg-[#D4AF37] text-[#0B0F1A] hover:bg-[#D4AF37]/90" 
              : "bg-[#12182A] text-[#9AA6C3] hover:bg-[#12182A]/80"
            }
          >
            <Hammer className="w-4 h-4 mr-2" />
            카드 상점
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
                      <Button
                        onClick={() => handleCraftCard("LIVE-A")}
                        disabled={userData.shards < GACHA_CONFIG.LIVE_CRAFT_COSTS.A}
                        className="w-full bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        제작
                      </Button>
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
                      <Button
                        onClick={() => handleCraftCard("LIVE-S")}
                        disabled={userData.shards < GACHA_CONFIG.LIVE_CRAFT_COSTS.S}
                        className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold shadow-lg shadow-pink-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        제작
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {/* 필터 & 정렬 - 모바일 최적화 */}
        <div className="bg-[#12182A] rounded-xl p-4 mb-6 border border-[#2B6CFF]/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#9AA6C3]" />
              <span className="text-sm text-[#9AA6C3]">필터 & 정렬</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setShowHelpModal(true)}
                variant="ghost"
                size="sm"
                className="text-xs text-[#FFD700] hover:text-[#FFF] hover:bg-[#FFD700]/20"
              >
                <HelpCircle className="w-3 h-3 mr-1" />
                강화 방법
              </Button>
              <Button
                onClick={() => {
                  setFilterGrade([]);
                  setFilterPosition([]);
                  setFilterTeam([]);
                  setFilterYear([]);
                  setSortBy("ovr");
                  setSearchText("");
                  setCurrentPage(1);
                  localStorage.removeItem("lck_filter_grade");
                  localStorage.removeItem("lck_filter_position");
                  localStorage.removeItem("lck_filter_team");
                  localStorage.removeItem("lck_filter_year");
                  localStorage.removeItem("lck_filter_sortBy");
                  localStorage.removeItem("lck_filter_search");
                }}
                variant="ghost"
                size="sm"
                className="text-xs text-[#9AA6C3] hover:text-[#EAF0FF] hover:bg-[#2B6CFF]/20"
              >
                <X className="w-3 h-3 mr-1" />
                초기화
              </Button>
            </div>
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
            {/* 등급 체크박스 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('grade-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] px-3 py-2 text-sm text-[#EAF0FF] hover:border-[#2B6CFF] transition-colors"
              >
                <span className={filterGrade.length === 0 ? "text-[#9AA6C3]" : ""}>
                  {filterGrade.length === 0 ? "등급" : `등급 (${filterGrade.length})`}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id="grade-dropdown"
                className="hidden absolute z-50 mt-1 w-full rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {(["S", "A", "B", "C"] as Grade[]).map(grade => (
                    <label
                      key={grade}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2B6CFF]/20 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterGrade.includes(grade)}
                        onChange={(e) => {
                          const newGrades = e.target.checked
                            ? [...filterGrade, grade]
                            : filterGrade.filter(g => g !== grade);
                          setFilterGrade(newGrades);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-[#2B6CFF]/30 bg-[#0B0F1A] text-[#2B6CFF] focus:ring-[#2B6CFF] focus:ring-offset-0"
                      />
                      <span className="text-sm text-[#EAF0FF]">{grade}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 포지션 체크박스 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('position-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] px-3 py-2 text-sm text-[#EAF0FF] hover:border-[#2B6CFF] transition-colors"
              >
                <span className={filterPosition.length === 0 ? "text-[#9AA6C3]" : ""}>
                  {filterPosition.length === 0 ? "포지션" : `포지션 (${filterPosition.length})`}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id="position-dropdown"
                className="hidden absolute z-50 mt-1 w-full rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {(["TOP", "JGL", "MID", "ADC", "SUP"] as Position[]).map(position => (
                    <label
                      key={position}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2B6CFF]/20 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterPosition.includes(position)}
                        onChange={(e) => {
                          const newPositions = e.target.checked
                            ? [...filterPosition, position]
                            : filterPosition.filter(p => p !== position);
                          setFilterPosition(newPositions);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-[#2B6CFF]/30 bg-[#0B0F1A] text-[#2B6CFF] focus:ring-[#2B6CFF] focus:ring-offset-0"
                      />
                      <span className="text-sm text-[#EAF0FF]">{position}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 팀 체크박스 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('team-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] px-3 py-2 text-sm text-[#EAF0FF] hover:border-[#2B6CFF] transition-colors"
              >
                <span className={filterTeam.length === 0 ? "text-[#9AA6C3]" : ""}>
                  {filterTeam.length === 0 ? "팀" : `팀 (${filterTeam.length})`}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id="team-dropdown"
                className="hidden absolute z-50 mt-1 w-full rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {(activeTab === "owned" ? uniqueTeams : allTeams).map(team => (
                    <label
                      key={team}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2B6CFF]/20 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterTeam.includes(team)}
                        onChange={(e) => {
                          const newTeams = e.target.checked
                            ? [...filterTeam, team]
                            : filterTeam.filter(t => t !== team);
                          setFilterTeam(newTeams);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-[#2B6CFF]/30 bg-[#0B0F1A] text-[#2B6CFF] focus:ring-[#2B6CFF] focus:ring-offset-0"
                      />
                      <span className="text-sm text-[#EAF0FF]">{team}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* 연도 체크박스 */}
            <div className="relative">
              <button
                onClick={() => {
                  const dropdown = document.getElementById('year-dropdown');
                  if (dropdown) dropdown.classList.toggle('hidden');
                }}
                className="w-full flex items-center justify-between rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] px-3 py-2 text-sm text-[#EAF0FF] hover:border-[#2B6CFF] transition-colors"
              >
                <span className={filterYear.length === 0 ? "text-[#9AA6C3]" : ""}>
                  {filterYear.length === 0 ? "연도" : `연도 (${filterYear.length})`}
                </span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                id="year-dropdown"
                className="hidden absolute z-50 mt-1 w-full rounded-md border border-[#2B6CFF]/30 bg-[#0B0F1A] shadow-lg max-h-60 overflow-y-auto"
              >
                <div className="p-2 space-y-1">
                  {allYears.map(year => (
                    <label
                      key={year}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-[#2B6CFF]/20 rounded cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filterYear.includes(year)}
                        onChange={(e) => {
                          const newYears = e.target.checked
                            ? [...filterYear, year]
                            : filterYear.filter(y => y !== year);
                          setFilterYear(newYears);
                          setCurrentPage(1);
                        }}
                        className="w-4 h-4 rounded border-[#2B6CFF]/30 bg-[#0B0F1A] text-[#2B6CFF] focus:ring-[#2B6CFF] focus:ring-offset-0"
                      />
                      <span className="text-sm text-[#EAF0FF]">{year}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {(activeTab === "owned") && (
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
                const craftCost = !isOwned ? getCraftCost(card) : 0;
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
                        onBackClick={isOwned ? () => setUpgradeModalCard(card as UserCard) : undefined}
                      />
                    </div>
                    
                    {/* 제작소 탭에서만 제작 버튼 표시 */}
                    {activeTab === "craft" && (
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
                        {(() => {
                          const upgradeBonus = selectedCard.upgradeLevel > 0
                            ? getTotalUpgradeBonus(selectedCard.grade, selectedCard.upgradeLevel, selectedCard.position)
                            : { mechanics: 0, laning: 0, teamfight: 0, macro: 0, clutch: 0 };
                          
                          return (
                            <>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">OVR</span>
                                <span className="font-bold text-lg">
                                  {calculateEnhancedOVR(selectedCard.stats, selectedCard.upgradeLevel, selectedCard.grade, selectedCard.position)}
                                  {selectedCard.upgradeLevel > 0 && (
                                    <span className="text-green-400 text-sm ml-1">
                                      +{calculateEnhancedOVR(selectedCard.stats, selectedCard.upgradeLevel, selectedCard.grade, selectedCard.position) - selectedCard.stats.ovr}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">메카닉</span>
                                <span>
                                  {selectedCard.stats.mechanics + upgradeBonus.mechanics}
                                  {upgradeBonus.mechanics > 0 && (
                                    <span className="text-green-400 text-sm ml-1">+{upgradeBonus.mechanics}</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">라인</span>
                                <span>
                                  {selectedCard.stats.laning + upgradeBonus.laning}
                                  {upgradeBonus.laning > 0 && (
                                    <span className="text-green-400 text-sm ml-1">+{upgradeBonus.laning}</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">한타</span>
                                <span>
                                  {selectedCard.stats.teamfight + upgradeBonus.teamfight}
                                  {upgradeBonus.teamfight > 0 && (
                                    <span className="text-green-400 text-sm ml-1">+{upgradeBonus.teamfight}</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">운영</span>
                                <span>
                                  {selectedCard.stats.macro + upgradeBonus.macro}
                                  {upgradeBonus.macro > 0 && (
                                    <span className="text-green-400 text-sm ml-1">+{upgradeBonus.macro}</span>
                                  )}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-[#9AA6C3]">클러치</span>
                                <span>
                                  {selectedCard.stats.clutch + upgradeBonus.clutch}
                                  {upgradeBonus.clutch > 0 && (
                                    <span className="text-green-400 text-sm ml-1">+{upgradeBonus.clutch}</span>
                                  )}
                                </span>
                              </div>
                            </>
                          );
                        })()}
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

        {/* 🎲 강화 결과 모달 */}
        <Dialog open={upgradeResult !== null} onOpenChange={(open) => {
          // BREAK 시에는 닫기 방지 (복구/포기 선택 필수)
          if (!open && upgradeResult?.result === "BREAK") return;
          if (!open) setUpgradeResult(null);
        }}>
          <DialogContent className={`max-w-md bg-[#12182A] text-[#EAF0FF] border-2 relative overflow-hidden ${
            upgradeResult?.result === "BREAK" ? "border-red-500/50" : "border-[#10B981]/50"
          }`} onPointerDownOutside={(e) => {
            if (upgradeResult?.result === "BREAK") e.preventDefault();
          }} onInteractOutside={(e) => {
            if (upgradeResult?.result === "BREAK") e.preventDefault();
          }} onEscapeKeyDown={(e) => {
            if (upgradeResult?.result === "BREAK") e.preventDefault();
          }}>
            {upgradeResult && (
              <>
                {/* ⬆️ 결과별 폭발 효과 */}
                <div 
                  className="absolute inset-0 pointer-events-none z-0"
                  style={{
                    background: upgradeResult.result === "SUCCESS" 
                      ? "radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.3), transparent 70%)"
                      : upgradeResult.result === "KEEP"
                      ? "radial-gradient(circle at 50% 50%, rgba(255, 184, 28, 0.3), transparent 70%)"
                      : "radial-gradient(circle at 50% 50%, rgba(239, 68, 68, 0.3), transparent 70%)",
                    animation: "pulse 1s ease-out"
                  }}
                />
                
                <DialogHeader className="relative z-10">
                  <DialogTitle className={`text-2xl text-center font-bold flex items-center justify-center gap-2 ${
                    upgradeResult.result === "SUCCESS" ? "text-[#10B981]" :
                    upgradeResult.result === "KEEP" ? "text-[#FFB81C]" :
                    "text-red-400"
                  }`}>
                    {upgradeResult.result === "SUCCESS" && <><TrendingUp className="w-6 h-6" /> 강화 성공!</>}
                    {upgradeResult.result === "KEEP" && <><Shield className="w-6 h-6" /> 강화 유지</>}
                    {upgradeResult.result === "BREAK" && <><Skull className="w-6 h-6" /> 카드 파괴...</>}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center gap-4 py-4">
                  {/* 결과 메시지 */}
                  {upgradeResult.result === "SUCCESS" && upgradeResult.card && (
                    <>
                      <div className="transform scale-90">
                        <LCKHoloCard card={upgradeResult.card} size="medium" upgradeLevel={upgradeResult.afterLevel} disableFlip={true} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">{upgradeResult.card.name}</h3>
                        <div className="text-lg font-bold text-[#10B981]">
                          +{upgradeResult.beforeLevel} → +{upgradeResult.afterLevel}
                        </div>
                        {upgradeResult.statChanges && (
                          <div className="bg-[#0B0F1A] p-3 rounded border border-[#10B981]/30">
                            <div className="text-sm text-[#9AA6C3] mb-2">획득한 스탯</div>
                            <div className="grid grid-cols-5 gap-2 text-xs">
                              {(Object.entries(upgradeResult.statChanges) as [keyof typeof upgradeResult.statChanges, number][]).map(([stat, value]) => {
                                const statNames = {
                                  mechanics: "메카닉",
                                  laning: "라인전",
                                  teamfight: "한타",
                                  macro: "운영",
                                  clutch: "클러치"
                                };
                                return value > 0 && (
                                  <div key={stat} className="text-center bg-[#10B981]/20 p-2 rounded">
                                    <div className="text-[10px] text-[#9AA6C3] mb-1">{statNames[stat]}</div>
                                    <div className="text-base font-bold text-[#10B981]">+{value}</div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  {upgradeResult.result === "KEEP" && upgradeResult.card && (
                    <>
                      <div className="transform scale-90">
                        <LCKHoloCard card={upgradeResult.card} size="medium" upgradeLevel={upgradeResult.beforeLevel} disableFlip={true} />
                      </div>
                      <div className="text-center space-y-2">
                        <h3 className="text-xl font-bold">{upgradeResult.card.name}</h3>
                        <div className="text-lg font-bold text-[#FFB81C]">
                          +{upgradeResult.beforeLevel} (유지됨)
                        </div>
                        <p className="text-sm text-[#9AA6C3]">
                          강화에 실패했지만 카드는 안전합니다!
                        </p>
                      </div>
                    </>
                  )}
                  {upgradeResult.result === "BREAK" && (
                    <div className="text-center space-y-4 py-6">
                      <div className="text-6xl">💥</div>
                      <h3 className="text-2xl font-bold text-red-400">카드가 파괴됩니다!</h3>
                      <p className="text-sm text-[#9AA6C3]">
                        강화 실패! 소모한 샤드: {upgradeResult.shardsCost.toLocaleString()}
                      </p>
                      
                      {/* 🔥 복구 옵션 */}
                      {upgradeResult.recoveryCost !== undefined && upgradeResult.brokenCard && (
                        <div className="bg-[#0A0E27] rounded-xl p-4 border border-[#FFB81C]/40 space-y-3 mt-2">
                          <div className="flex items-center justify-center gap-2 text-[#FFB81C]">
                            <Shield className="w-5 h-5" />
                            <span className="font-bold text-base">카드 복구 가능</span>
                          </div>
                          <p className="text-xs text-[#9AA6C3]">
                            샤드를 지불하면 카드를 복구할 수 있습니다.<br/>
                            <span className="text-[#FFB81C] font-bold">강화 레벨은 +0으로 초기화</span>됩니다.
                          </p>
                          <div className="flex items-center justify-center gap-2 bg-[#141B3D] rounded-lg py-2 px-4">
                            <Sparkles className="w-4 h-4 text-[#FFB81C]" />
                            <span className="text-lg font-bold text-[#FFB81C]">
                              {upgradeResult.recoveryCost.toLocaleString()}
                            </span>
                            <span className="text-xs text-[#8B95B5]">샤드</span>
                          </div>
                          <div className="text-[10px] text-[#8B95B5]">
                            보유 샤드: {userData.shards.toLocaleString()}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 버튼 */}
                  {upgradeResult.result === "BREAK" && upgradeResult.brokenCard ? (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={async () => {
                          const success = await recoverBrokenCard(upgradeResult.brokenCard!.instanceId);
                          if (success) {
                            setUpgradeResult(null);
                            setUpgradeModalCard(null); // 강화 모달도 닫기
                          }
                        }}
                        disabled={userData.shards < (upgradeResult.recoveryCost || 0)}
                        className="w-full font-bold bg-gradient-to-r from-[#FFB81C] to-[#F59E0B] hover:from-[#FFB81C]/90 hover:to-[#F59E0B]/90 text-[#0B0F1A] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <Shield className="w-4 h-4 mr-2" />
                        {userData.shards < (upgradeResult.recoveryCost || 0)
                          ? "샤드 부족"
                          : `복구하기 (${(upgradeResult.recoveryCost || 0).toLocaleString()} 샤드)`
                        }
                      </Button>
                      <Button
                        onClick={() => {
                          confirmCardBreak(upgradeResult.brokenCard!.instanceId);
                          setUpgradeResult(null);
                          setUpgradeModalCard(null); // 강화 모달도 닫기
                          if (selectedCard?.instanceId === upgradeResult.brokenCard!.instanceId) {
                            setSelectedCard(null);
                          }
                        }}
                        variant="ghost"
                        className="w-full font-bold text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/30"
                      >
                        <Skull className="w-4 h-4 mr-2" />
                        복구 포기 (카드 파괴)
                      </Button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => setUpgradeResult(null)}
                      className={`w-full font-bold ${
                        upgradeResult.result === "SUCCESS" ? "bg-[#10B981] hover:bg-[#10B981]/80" :
                        "bg-[#FFB81C] hover:bg-[#FFB81C]/80 text-[#0B0F1A]"
                      }`}
                    >
                      확인
                    </Button>
                  )}
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>

        {/* 🔧 강화 모달 (카드 뒷면 클릭 시) */}
        <Dialog open={upgradeModalCard !== null} onOpenChange={() => setUpgradeModalCard(null)}>
          <DialogContent className="max-w-sm bg-[#12182A] text-[#EAF0FF] border-2 border-[#10B981]/50 max-h-[90vh] overflow-y-auto">
            {upgradeModalCard && (() => {
              const targetLevel = upgradeModalCard.upgradeLevel + 1;
              const rates = UPGRADE_RATES[targetLevel];
              // 🔥 LIVE 카드는 강화 비용 100배
              const baseCost = UPGRADE_COSTS[upgradeModalCard.grade][targetLevel];
              const cost = isLiveCard(upgradeModalCard) ? baseCost * 100 : baseCost;
              const statBonus = calculateUpgradeStatBonus(upgradeModalCard.grade, targetLevel, upgradeModalCard.position);
              const canAfford = userData.shards >= cost;
              
              return (
                <>
                  <DialogHeader>
                    <DialogTitle className="text-lg text-center text-[#10B981] flex items-center justify-center gap-1.5">
                      ⬆️ 카드 강화
                    </DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-2 py-1">
                    {/* 카드 - 크기 키움 + ⬆️ 강화 애니메이션 */}
                    <div 
                      className="scale-90 -my-2 transition-all duration-300"
                      style={{
                        animation: isUpgrading ? "upgradeShake 0.5s ease-in-out infinite" : "none",
                        filter: isUpgrading ? "brightness(1.5) drop-shadow(0 0 20px rgba(255, 215, 0, 0.8))" : "none"
                      }}
                    >
                      <LCKHoloCard 
                        card={upgradeModalCard} 
                        size="small" 
                        upgradeLevel={upgradeModalCard.upgradeLevel}
                        disableFlip={true}
                      />
                      
                      {/* ⬆️ 강화 중 빛나는 효과 */}
                      {isUpgrading && (
                        <div 
                          className="absolute inset-0 rounded-2xl pointer-events-none"
                          style={{
                            background: "radial-gradient(circle, rgba(255, 215, 0, 0.3), transparent 70%)",
                            animation: "pulse 0.5s ease-in-out infinite"
                          }}
                        />
                      )}
                    </div>

                    {/* 카드 정보 */}
                    <div className="text-center -mt-2">
                      <h3 className="text-base font-bold">{upgradeModalCard.name}</h3>
                      <div className="text-xs text-[#9AA6C3]">
                        {upgradeModalCard.team} • {upgradeModalCard.year} • {upgradeModalCard.position}
                      </div>
                    </div>

                    {/* 강화 레벨 */}
                    <div className="w-full bg-[#0B0F1A] p-2 rounded border border-[#10B981]/30">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-[#9AA6C3]">강화 단계</span>
                        <span className="text-sm font-bold text-[#10B981]">
                          +{upgradeModalCard.upgradeLevel} → +{targetLevel}
                        </span>
                      </div>
                      <div className="w-full bg-[#12182A] rounded-full h-1.5">
                        <div 
                          className="bg-[#10B981] h-1.5 rounded-full transition-all"
                          style={{ width: `${(upgradeModalCard.upgradeLevel / GACHA_CONFIG.MAX_UPGRADE) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* 🎲 강화 확률 */}
                    <div className="w-full bg-[#0B0F1A] p-2 rounded border border-[#9AA6C3]/30">
                      <div className="text-xs text-[#9AA6C3] mb-1.5 text-center font-bold">강화 확률</div>
                      <div className="grid grid-cols-3 gap-1 text-xs">
                        <div className="bg-[#10B981]/20 border border-[#10B981]/50 rounded p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <TrendingUp className="w-3 h-3 text-[#10B981]" />
                            <span className="text-[#10B981] font-bold">성공</span>
                          </div>
                          <div className="text-base font-bold text-[#10B981]">{rates.success}%</div>
                        </div>
                        <div className="bg-[#FFB81C]/20 border border-[#FFB81C]/50 rounded p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Shield className="w-3 h-3 text-[#FFB81C]" />
                            <span className="text-[#FFB81C] font-bold">유지</span>
                          </div>
                          <div className="text-base font-bold text-[#FFB81C]">{rates.keep}%</div>
                        </div>
                        <div className="bg-red-500/20 border border-red-500/50 rounded p-1.5 text-center">
                          <div className="flex items-center justify-center gap-1 mb-0.5">
                            <Skull className="w-3 h-3 text-red-400" />
                            <span className="text-red-400 font-bold">파괴</span>
                          </div>
                          <div className="text-base font-bold text-red-400">{rates.break}%</div>
                        </div>
                      </div>
                      {rates.break > 0 && (
                        <div className="mt-2 text-xs text-red-400 text-center">
                          ⚠️ 파괴 시 복구 비용(샤드)을 지불하거나 카드를 잃게 됩니다!
                        </div>
                      )}
                    </div>

                    {/* 📊 성공 시 스탯 증가 */}
                    <div className="w-full bg-[#0B0F1A] p-2 rounded border border-[#10B981]/30">
                      <div className="text-xs text-[#9AA6C3] mb-1 text-center font-bold">성공 시 획득 스탯</div>
                      <div className="grid grid-cols-5 gap-1 text-xs">
                        {(["mechanics", "laning", "teamfight", "macro", "clutch"] as const).map((stat) => {
                          const statNames = {
                            mechanics: "메카닉",
                            laning: "라인전",
                            teamfight: "한타",
                            macro: "운영",
                            clutch: "클러치"
                          };
                          const bonus = statBonus[stat];
                          return (
                            <div key={stat} className={`text-center p-1 rounded ${bonus > 0 ? "bg-[#10B981]/20" : "bg-[#12182A]"}`}>
                              <div className="text-[10px] text-[#9AA6C3] mb-0.5 truncate">{statNames[stat]}</div>
                              <div className={`text-sm font-bold ${bonus > 0 ? "text-[#10B981]" : "text-gray-500"}`}>
                                {bonus > 0 ? `+${bonus}` : "-"}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* 비용 */}
                    <div className="w-full bg-[#0B0F1A] p-2 rounded border border-[#D4AF37]/30">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="text-[#9AA6C3]">강화 비용</span>
                        <span className="font-bold text-[#D4AF37]">
                          💎 {cost.toLocaleString()} 샤드
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[#9AA6C3]">보유 샤드</span>
                        <span className={`font-bold ${canAfford ? "text-[#10B981]" : "text-red-400"}`}>
                          💎 {userData.shards.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* 강화 버튼 */}
                    <Button
                      onClick={() => handleUpgrade(upgradeModalCard.instanceId)}
                      disabled={!canAfford || isUpgrading}
                      className="w-full bg-[#10B981] hover:bg-[#10B981]/80 text-white font-bold py-2 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isUpgrading 
                        ? "⚡ 강화 중..." 
                        : !canAfford 
                        ? "샤드 부족" 
                        : `⬆️ 강화하기 (${cost.toLocaleString()} 샤드)`
                      }
                    </Button>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>

        {/* 💡 강화 도움말 모달 */}
        <Dialog open={showHelpModal} onOpenChange={setShowHelpModal}>
          <DialogContent className="max-w-md bg-gradient-to-br from-[#0B0F1A] via-[#12182A] to-[#1A2332] text-[#EAF0FF] border-2 border-[#FFD700]/30 max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl text-center font-bold text-[#FFD700] flex items-center justify-center gap-2">
                <Hammer className="w-6 h-6" />
                카드 강화 시스템 안내
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              {/* 기본 설명 */}
              <div className="bg-[#12182A] p-4 rounded-lg border border-[#FFD700]/30">
                <h3 className="text-lg font-bold text-[#FFD700] mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" />
                  강화 방법
                </h3>
                <div className="space-y-2 text-sm text-[#9AA6C3]">
                  <p className="text-[#EAF0FF] font-semibold">
                    1️⃣ 선수 카드를 클릭하여 <span className="text-[#FFD700]">뒤집으세요!</span>
                  </p>
                  <p>2️⃣ 카드 뒷면에 <span className="text-[#10B981]">강화 버튼</span>이 나타납니다</p>
                  <p>3️⃣ 샤드를 소모하여 확률형 강화를 진행합니다</p>
                  <p>4️⃣ 최대 <span className="text-[#FFD700]">+15</span>까지 강화 가능합니다</p>
                </div>
              </div>

              {/* 강화 효과 */}
              <div className="bg-[#12182A] p-4 rounded-lg border border-[#10B981]/30">
                <h3 className="text-lg font-bold text-[#10B981] mb-2 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  강화 효과
                </h3>
                <div className="space-y-2 text-sm text-[#9AA6C3]">
                  <p>✅ 강화 성공 시 <span className="text-[#10B981]">모든 능력치 증가</span></p>
                  <p>✅ 강화 레벨이 높을수록 더 강력해집니다</p>
                </div>
              </div>

              {/* 강화 결과 */}
              <div className="bg-[#12182A] p-4 rounded-lg border border-[#9AA6C3]/30">
                <h3 className="text-lg font-bold text-[#EAF0FF] mb-2">📊 강화 결과</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#10B981]" />
                    <span className="text-[#10B981] font-bold">성공:</span>
                    <span className="text-[#9AA6C3]">강화 레벨 +1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#FFB81C]" />
                    <span className="text-[#FFB81C] font-bold">유지:</span>
                    <span className="text-[#9AA6C3]">강화 레벨 유지</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Skull className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 font-bold">파괴:</span>
                    <span className="text-[#9AA6C3]">카드 영구 삭제 ⚠️</span>
                  </div>
                </div>
              </div>

              {/* 팁 */}
              <div className="bg-gradient-to-r from-[#FFD700]/10 to-[#FFA500]/10 p-4 rounded-lg border border-[#FFD700]/30">
                <h3 className="text-base font-bold text-[#FFD700] mb-2">💡 팁</h3>
                <ul className="space-y-1 text-sm text-[#9AA6C3] list-disc list-inside">
                  <li>높은 등급일수록 강화 비용이 높습니다</li>
                  <li>강화 레벨이 높을수록 성공 확률이 낮아집니다</li>
                  <li>중요한 카드는 신중하게 강화하세요!</li>
                </ul>
              </div>
            </div>

            <Button
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-[#FFD700] hover:bg-[#FFD700]/80 text-[#0B0F1A] font-bold"
            >
              확인했습니다
            </Button>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
