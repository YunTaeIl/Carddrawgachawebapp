import React, { useState, useMemo, useEffect } from "react";
import { UserCard, LCKCard } from "@/types/lck";
import { Book, Lock, CheckCircle2 } from "lucide-react";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { SYNERGIES } from "@/data/synergyData";
import { projectId, publicAnonKey } from "/utils/supabase/info";
import { useAuth } from "@/contexts/AuthContext";

interface CardCollectionProps {
  ownedCards: UserCard[];
  allCards: LCKCard[]; // 전체 카드 데이터 (unique by id+year+team)
}

type YearTab = "all" | number;

type SortBy = "default" | "team" | "grade" | "position";

export function CardCollection({ ownedCards, allCards }: CardCollectionProps) {
  const { accessToken, user } = useAuth();
  const [selectedYear, setSelectedYear] = useState<YearTab>("all");
  const [selectedTab, setSelectedTab] = useState<"collection" | "synergy">("collection");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [discoveredCards, setDiscoveredCards] = useState<string[]>([]);
  const [selectedCard, setSelectedCard] = useState<LCKCard | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const CARDS_PER_PAGE = 50;

  // 도감 데이터 로드 + 자동 동기화
  useEffect(() => {
    const loadCodexAndSync = async () => {
      try {
        if (!user?.id || !accessToken) {
          console.log("❌ No user or access token found");
          return;
        }

        console.log("📚 Loading codex and syncing...");
        console.log(`📦 Owned cards count: ${ownedCards.length}`);
        console.log(`🃏 All cards count: ${allCards.length}`);

        // 1. 도감 데이터 로드
        const response = await fetch(
          `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0/codex/${user.id}`,
          {
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${publicAnonKey}`,
            },
          }
        );

        if (!response.ok) {
          console.error("❌ Failed to load codex:", response.status);
          const errorText = await response.text();
          console.error("Error response:", errorText);
          return;
        }

        const data = await response.json();
        const currentDiscovered = data.discoveredCards || [];
        console.log(`📖 Currently discovered: ${currentDiscovered.length} cards`);
        setDiscoveredCards(currentDiscovered);

        // 2. 자동 동기화: 보유 중인 카드 중 도감에 없는 카드 찾기
        const ownedCardKeysSet = new Set<string>();
        
        ownedCards.forEach(uc => {
          // UserCard는 이미 full card 정보를 가지고 있음
          const key = `${uc.id}_${uc.year}_${uc.team}`;
          ownedCardKeysSet.add(key);
        });

        const ownedCardKeys = Array.from(ownedCardKeysSet);
        console.log(`🔑 Unique owned card keys: ${ownedCardKeys.length}`);
        console.log("Sample keys:", ownedCardKeys.slice(0, 5));

        const discoveredSet = new Set(currentDiscovered);
        const cardsToDiscover = ownedCardKeys.filter(
          key => !discoveredSet.has(key)
        );

        console.log(`🆕 Cards to discover: ${cardsToDiscover.length}`);
        if (cardsToDiscover.length > 0) {
          console.log("Sample cards to discover:", cardsToDiscover.slice(0, 5));
        }

        // 3. 누락된 카드가 있으면 도감에 추가
        if (cardsToDiscover.length > 0) {
          console.log(`🔄 Auto-syncing ${cardsToDiscover.length} cards to codex...`);
            
          const discoverResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0/codex/discover/${user.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${publicAnonKey}`,
              },
              body: JSON.stringify({ cardKeys: cardsToDiscover }),
            }
          );

          if (!discoverResponse.ok) {
            console.error("❌ Failed to discover cards:", discoverResponse.status);
            const errorText = await discoverResponse.text();
            console.error("Error:", errorText);
            return;
          }

          console.log("✅ Cards discovered successfully!");

          // 4. 도감 데이터 다시 로드
          const updatedResponse = await fetch(
            `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0/codex/${user.id}`,
            {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${publicAnonKey}`,
              },
            }
          );

          if (updatedResponse.ok) {
            const updatedData = await updatedResponse.json();
            setDiscoveredCards(updatedData.discoveredCards || []);
            console.log(`✅ Codex auto-sync completed! New total: ${updatedData.discoveredCards?.length || 0}`);
          }
        } else {
          console.log("✅ All owned cards already in codex!");
        }
      } catch (error) {
        console.error("❌ Failed to load/sync codex:", error);
      }
    };

    if (ownedCards.length > 0 && allCards.length > 0 && user?.id && accessToken) {
      loadCodexAndSync();
    }
  }, [ownedCards, allCards, user, accessToken]);

  // 연도 목록 추출 (2013~2026)
  const years = useMemo(() => {
    const yearSet = new Set<number>();
    allCards.forEach(card => yearSet.add(card.year));
    return Array.from(yearSet).sort((a, b) => a - b);
  }, [allCards]);

  // 고유 카드 목록 (id+year+team 기준으로 중복 제거)
  const uniqueCards = useMemo(() => {
    const cardMap = new Map<string, LCKCard>();
    allCards.forEach(card => {
      const key = `${card.id}_${card.year}_${card.team}`;
      if (!cardMap.has(key)) {
        cardMap.set(key, card);
      }
    });
    return Array.from(cardMap.values());
  }, [allCards]);

  // 필터링 및 정렬된 카드 목록
  const filteredAndSortedCards = useMemo(() => {
    let cards = selectedYear === "all" 
      ? uniqueCards 
      : uniqueCards.filter(card => card.year === selectedYear);
    
    // 정렬 적용
    if (sortBy === "team") {
      cards = [...cards].sort((a, b) => a.team.localeCompare(b.team));
    } else if (sortBy === "grade") {
      const gradeOrder = { S: 0, A: 1, B: 2, C: 3, LIVE: -1 };
      cards = [...cards].sort((a, b) => (gradeOrder[a.grade] || 10) - (gradeOrder[b.grade] || 10));
    } else if (sortBy === "position") {
      const positionOrder = { TOP: 0, JGL: 1, MID: 2, ADC: 3, SUP: 4 };
      cards = [...cards].sort((a, b) => (positionOrder[a.position] || 10) - (positionOrder[b.position] || 10));
    }
    
    return cards;
  }, [uniqueCards, selectedYear, sortBy]);

  // 카드들을 그룹별로 나누기
  const groupedCards = useMemo(() => {
    if (sortBy === "default") {
      return [{ label: "전체", cards: filteredAndSortedCards }];
    }
    
    const groups: { [key: string]: LCKCard[] } = {};
    
    filteredAndSortedCards.forEach(card => {
      let key = "";
      if (sortBy === "team") {
        key = card.team;
      } else if (sortBy === "grade") {
        key = card.grade;
      } else if (sortBy === "position") {
        key = card.position;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
    });
    
    return Object.entries(groups).map(([label, cards]) => ({ label, cards }));
  }, [filteredAndSortedCards, sortBy]);

  // 페이징 처리
  const totalPages = Math.ceil(filteredAndSortedCards.length / CARDS_PER_PAGE);
  const paginatedCards = useMemo(() => {
    const startIndex = (currentPage - 1) * CARDS_PER_PAGE;
    const endIndex = startIndex + CARDS_PER_PAGE;
    const slicedCards = filteredAndSortedCards.slice(startIndex, endIndex);
    
    if (sortBy === "default") {
      return [{ label: "전체", cards: slicedCards }];
    }
    
    const groups: { [key: string]: LCKCard[] } = {};
    slicedCards.forEach(card => {
      let key = "";
      if (sortBy === "team") {
        key = card.team;
      } else if (sortBy === "grade") {
        key = card.grade;
      } else if (sortBy === "position") {
        key = card.position;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(card);
    });
    
    return Object.entries(groups).map(([label, cards]) => ({ label, cards }));
  }, [filteredAndSortedCards, sortBy, currentPage, CARDS_PER_PAGE]);

  // 페이지 변경 시 스크롤 상단 이동
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 필터/정렬 변경 시 페이지 1로 리셋
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, sortBy]);

  // 카드 상태 확인
  const getCardStatus = (card: LCKCard) => {
    const cardKey = `${card.id}_${card.year}_${card.team}`;
    const isOwned = ownedCards.some(
      owned => owned.id === card.id && owned.year === card.year && owned.team === card.team
    );
    const isDiscovered = discoveredCards.includes(cardKey);
    
    return {
      isOwned,
      isDiscovered,
      cardKey
    };
  };

  // 보유/발견 카드 수
  const ownedCount = filteredAndSortedCards.filter(card => {
    const { isOwned } = getCardStatus(card);
    return isOwned;
  }).length;
  
  const discoveredCount = filteredAndSortedCards.filter(card => {
    const { isDiscovered } = getCardStatus(card);
    return isDiscovered;
  }).length;
  
  const totalCount = filteredAndSortedCards.length;

  // 등급별 색상
  const gradeColors: Record<string, string> = {
    S: "from-yellow-400 to-orange-500",
    A: "from-purple-400 to-pink-500",
    B: "from-blue-400 to-cyan-500",
    C: "from-gray-400 to-gray-500",
    LIVE: "from-pink-400 to-fuchsia-500",
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F2C] via-[#141B3D] to-[#0A0F2C] p-4 md:p-6">
      {/* 헤더 */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#2B6CFF] to-[#1E4FCC] flex items-center justify-center">
            <Book className="text-white" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-display text-white">도감 및 시너지</h1>
            <p className="text-sm text-[#8B95B5]">
              발견: <span className="text-[#2B6CFF] font-bold">{discoveredCount}</span> / {totalCount}
              <span className="mx-2">•</span>
              보유: <span className="text-[#FFB81C] font-bold">{ownedCount}</span> / {totalCount}
              <span className="ml-2 text-[#2B6CFF]">
                ({totalCount > 0 ? Math.round((discoveredCount / totalCount) * 100) : 0}%)
              </span>
            </p>
          </div>
        </div>

        {/* 탭 전환 */}
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setSelectedTab("collection")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedTab === "collection"
                ? "bg-gradient-to-r from-[#2B6CFF] to-[#1E4FCC] text-white shadow-lg"
                : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
            }`}
          >
            카드 도감
          </button>
          <button
            onClick={() => setSelectedTab("synergy")}
            className={`px-6 py-3 rounded-lg font-medium transition-all ${
              selectedTab === "synergy"
                ? "bg-gradient-to-r from-[#2B6CFF] to-[#1E4FCC] text-white shadow-lg"
                : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
            }`}
          >
            시너지 목록
          </button>
        </div>

        {/* 카드 도감 탭 */}
        {selectedTab === "collection" && (
          <>
            {/* 연도 필터 */}
            <div className="flex flex-wrap gap-2 mb-3">
              <button
                onClick={() => setSelectedYear("all")}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedYear === "all"
                    ? "bg-[#C8102E] text-white"
                    : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                }`}
              >
                전체
              </button>
              {years.map(year => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    selectedYear === year
                      ? "bg-[#C8102E] text-white"
                      : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* 정렬 버튼 */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[#8B95B5] text-sm font-medium">정렬:</span>
              <button
                onClick={() => setSortBy("default")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "default"
                    ? "bg-[#2B6CFF] text-white"
                    : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                }`}
              >
                기본
              </button>
              <button
                onClick={() => setSortBy("team")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "team"
                    ? "bg-[#2B6CFF] text-white"
                    : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                }`}
              >
                팀별
              </button>
              <button
                onClick={() => setSortBy("grade")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "grade"
                    ? "bg-[#2B6CFF] text-white"
                    : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                }`}
              >
                등급별
              </button>
              <button
                onClick={() => setSortBy("position")}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  sortBy === "position"
                    ? "bg-[#2B6CFF] text-white"
                    : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
                }`}
              >
                포지션별
              </button>
            </div>
          </>
        )}
      </div>

      {/* 카드 그리드 */}
      {selectedTab === "collection" && (
        <div className="max-w-7xl mx-auto space-y-8">
          {paginatedCards.map((group, groupIndex) => (
            <div key={groupIndex}>
              {/* 그룹 헤더 (기본 정렬이 아닐 때만 표시) */}
              {sortBy !== "default" && (
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <div className={`w-1 h-6 rounded ${
                      sortBy === "grade" 
                        ? `bg-gradient-to-b ${gradeColors[group.label] || gradeColors.C}`
                        : "bg-[#2B6CFF]"
                    }`} />
                    {sortBy === "team" && group.label}
                    {sortBy === "grade" && `${group.label} 등급`}
                    {sortBy === "position" && group.label}
                    <span className="text-sm text-[#8B95B5] font-normal ml-2">
                      ({group.cards.length}장)
                    </span>
                  </h3>
                </div>
              )}
              
              {/* 카드 그리드 */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {group.cards.map((card) => {
                  const { isOwned, isDiscovered, cardKey } = getCardStatus(card);

                  return (
                    <div
                      key={cardKey}
                      className={`relative ${
                        isDiscovered
                          ? "hover:scale-105 cursor-pointer"
                          : ""
                      } transition-all duration-200`}
                      onClick={() => isDiscovered ? setSelectedCard(card) : null}
                    >
                      {/* 상태 표시 */}
                      {isDiscovered && (
                        <div className="absolute -top-2 -right-2 z-10">
                          {isOwned ? (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FFB81C] to-[#FF8C00] flex items-center justify-center shadow-lg">
                              <CheckCircle2 size={16} className="text-white" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#2B6CFF] to-[#1E4FCC] flex items-center justify-center shadow-lg">
                              <Book size={12} className="text-white" />
                            </div>
                          )}
                        </div>
                      )}

                      {/* 카드 */}
                      {isDiscovered ? (
                        <div className={isOwned ? "" : "opacity-60"}>
                          <LCKHoloCard 
                            card={card} 
                            size="small"
                            disableFlip={true}
                            forceStatic={true}
                          />
                        </div>
                      ) : (
                        // 미발견 카드
                        <div className="aspect-[2/3] bg-gradient-to-br from-[#1A2347] to-[#0A0F2C] rounded-xl border border-[#2A3A67]/50 flex flex-col items-center justify-center p-4 opacity-40">
                          <Lock className="text-[#8B95B5]/30 mb-2" size={32} />
                          <p className="text-[#8B95B5]/50 text-xs font-bold text-center">
                            ???
                          </p>
                          <p className="text-[#8B95B5]/30 text-xs mt-1">
                            미발견
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8 pb-8">
              {/* 이전 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === 1
                    ? "bg-[#1A2347]/50 text-[#8B95B5]/50 cursor-not-allowed"
                    : "bg-[#1A2347] text-white hover:bg-[#2B6CFF]"
                }`}
              >
                이전
              </button>

              {/* 페이지 번호 */}
              <div className="flex gap-1">
                {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                  let pageNum: number;
                  
                  // 7페이지 이하면 전부 표시
                  if (totalPages <= 7) {
                    pageNum = i + 1;
                  } else {
                    // 현재 페이지 기준으로 앞뒤 3페이지씩 표시
                    if (currentPage <= 4) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 3) {
                      pageNum = totalPages - 6 + i;
                    } else {
                      pageNum = currentPage - 3 + i;
                    }
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        currentPage === pageNum
                          ? "bg-gradient-to-r from-[#2B6CFF] to-[#1E4FCC] text-white shadow-lg"
                          : "bg-[#1A2347] text-[#8B95B5] hover:text-white hover:bg-[#2A3A67]"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              {/* 다음 페이지 */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentPage === totalPages
                    ? "bg-[#1A2347]/50 text-[#8B95B5]/50 cursor-not-allowed"
                    : "bg-[#1A2347] text-white hover:bg-[#2B6CFF]"
                }`}
              >
                다음
              </button>

              {/* 페이지 정보 */}
              <div className="ml-4 text-[#8B95B5] text-sm">
                {currentPage} / {totalPages}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 시너지 목록 탭 */}
      {selectedTab === "synergy" && (
        <div className="max-w-7xl mx-auto">
          <SynergyListView />
        </div>
      )}

      {/* 카드 상세 모달 */}
      {selectedCard && (
        <div 
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedCard(null)}
        >
          <div className="max-w-md" onClick={(e) => e.stopPropagation()}>
            <LCKHoloCard 
              card={selectedCard} 
              size="large"
              disableFlip={false}
            />
            <button
              onClick={() => setSelectedCard(null)}
              className="mt-4 w-full px-6 py-3 bg-[#1A2347] hover:bg-[#2A3A67] text-white rounded-lg font-medium transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// 시너지 목록 뷰
function SynergyListView() {
  const [selectedType, setSelectedType] = useState<"all" | "ROSTER" | "TRIO" | "DUO" | "THEME">("all");

  const filteredSynergies = selectedType === "all" 
    ? SYNERGIES 
    : SYNERGIES.filter((s: any) => s.type === selectedType);

  // 타입별 색상
  const typeColors: Record<string, string> = {
    ROSTER: "from-yellow-400 to-orange-500",
    TRIO: "from-purple-400 to-pink-500",
    DUO: "from-blue-400 to-cyan-500",
    THEME: "from-green-400 to-teal-500",
  };

  return (
    <div>
      {/* 타입 필터 */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "all"
              ? "bg-[#C8102E] text-white"
              : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
          }`}
        >
          전체 ({SYNERGIES.length})
        </button>
        <button
          onClick={() => setSelectedType("ROSTER")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "ROSTER"
              ? "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
              : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
          }`}
        >
          ROSTER
        </button>
        <button
          onClick={() => setSelectedType("TRIO")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "TRIO"
              ? "bg-gradient-to-r from-purple-400 to-pink-500 text-white"
              : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
          }`}
        >
          TRIO
        </button>
        <button
          onClick={() => setSelectedType("DUO")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "DUO"
              ? "bg-gradient-to-r from-blue-400 to-cyan-500 text-white"
              : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
          }`}
        >
          DUO
        </button>
        <button
          onClick={() => setSelectedType("THEME")}
          className={`px-4 py-2 rounded-lg font-medium transition-all ${
            selectedType === "THEME"
              ? "bg-gradient-to-r from-green-400 to-teal-500 text-white"
              : "bg-[#1A2347] text-[#8B95B5] hover:text-white"
          }`}
        >
          THEME
        </button>
      </div>

      {/* 시너지 카드들 */}
      <div className="space-y-4">
        {filteredSynergies.map((synergy: any) => (
          <div
            key={synergy.synergy_id}
            className="bg-[#1A2347] rounded-xl p-4 border border-[#0047AB]/30 hover:border-[#2B6CFF]/50 transition-all"
          >
            {/* 헤더 */}
            <div className="flex items-start gap-3 mb-3">
              <div
                className={`px-3 py-1 rounded-lg bg-gradient-to-r ${
                  typeColors[synergy.type] || typeColors.THEME
                } text-white text-xs font-bold`}
              >
                {synergy.type}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg">{synergy.synergy_name}</h3>
                <p className="text-[#8B95B5] text-sm mt-1">{synergy.description}</p>
              </div>
            </div>

            {/* 조건 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              {/* 선수 조건 */}
              {synergy.players && synergy.players.length > 0 && (
                <div className="bg-[#141B3D] rounded-lg p-3">
                  <p className="text-[#FFB81C] text-xs font-bold mb-2">필수 선수</p>
                  <div className="flex flex-wrap gap-1">
                    {synergy.players.map((player: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-[#0047AB]/20 text-white text-xs rounded"
                      >
                        {player}
                        {synergy.player_years?.[player] && (
                          <span className="text-[#FFB81C] ml-1">({synergy.player_years[player]})</span>
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 팀/연도 조건 */}
              {(synergy.team_values?.length > 0 || synergy.year_value) && (
                <div className="bg-[#141B3D] rounded-lg p-3">
                  <p className="text-[#2B6CFF] text-xs font-bold mb-2">팀/연도 조건</p>
                  <div className="space-y-1 text-white text-xs">
                    {synergy.team_values?.length > 0 && (
                      <p>팀: {synergy.team_values.join(", ")}</p>
                    )}
                    {synergy.year_value && <p>연도: {synergy.year_value}</p>}
                    {synergy.min_count && <p>최소 인원: {synergy.min_count}명</p>}
                  </div>
                </div>
              )}
            </div>

            {/* 효과 */}
            <div className="bg-gradient-to-r from-[#C8102E]/10 to-[#C8102E]/5 rounded-lg p-3 border border-[#C8102E]/20">
              <p className="text-[#C8102E] text-xs font-bold mb-2">효과</p>
              <div className="space-y-1">
                {synergy.effects.map((effect: any, idx: number) => (
                  <div key={idx} className="text-white text-xs">
                    <span className="text-[#FFB81C] font-bold">{effect.count}인:</span>
                    <span className="ml-2">
                      {effect.ovr > 0 && `OVR+${effect.ovr} `}
                      {effect.mec > 0 && `Mec+${effect.mec} `}
                      {effect.lan > 0 && `Lan+${effect.lan} `}
                      {effect.tf > 0 && `TF+${effect.tf} `}
                      {effect.mac > 0 && `Mac+${effect.mac} `}
                      {effect.clu > 0 && `Clu+${effect.clu}`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
