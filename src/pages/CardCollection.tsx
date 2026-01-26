import React, { useState, useMemo } from "react";
import { UserCard, LCKCard } from "@/types/lck";
import { Book, Lock } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { SYNERGIES } from "@/data/synergyData";
import { getPlayerImageUrl } from "@/utils/imageUrls";

interface CardCollectionProps {
  ownedCards: UserCard[];
  allCards: LCKCard[]; // 전체 카드 데이터 (unique by id+year+team)
}

type YearTab = "all" | number;

type SortBy = "default" | "team" | "grade" | "position";

export function CardCollection({ ownedCards, allCards }: CardCollectionProps) {
  const [selectedYear, setSelectedYear] = useState<YearTab>("all");
  const [selectedTab, setSelectedTab] = useState<"collection" | "synergy">("collection");
  const [sortBy, setSortBy] = useState<SortBy>("default");

  // 연도 목록 추출 (2013~2025)
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
      const gradeOrder = { S: 0, A: 1, B: 2, C: 3 };
      cards = [...cards].sort((a, b) => gradeOrder[a.grade] - gradeOrder[b.grade]);
    } else if (sortBy === "position") {
      const positionOrder = { TOP: 0, JGL: 1, MID: 2, ADC: 3, SUP: 4 };
      cards = [...cards].sort((a, b) => positionOrder[a.position] - positionOrder[b.position]);
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

  // 보유 여부 확인
  const isOwned = (card: LCKCard) => {
    return ownedCards.some(
      owned => owned.id === card.id && owned.year === card.year && owned.team === card.team
    );
  };

  // 보유 카드 수
  const ownedCount = filteredAndSortedCards.filter(card => isOwned(card)).length;
  const totalCount = filteredAndSortedCards.length;

  // 등급별 색상
  const gradeColors: Record<string, string> = {
    S: "from-yellow-400 to-orange-500",
    A: "from-purple-400 to-pink-500",
    B: "from-blue-400 to-cyan-500",
    C: "from-gray-400 to-gray-500",
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
              수집 진행도: <span className="text-[#FFB81C] font-bold">{ownedCount}</span> / {totalCount}
              <span className="ml-2 text-[#2B6CFF]">
                ({totalCount > 0 ? Math.round((ownedCount / totalCount) * 100) : 0}%)
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
          {groupedCards.map((group, groupIndex) => (
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
                  const owned = isOwned(card);
                  const cardKey = `${card.id}_${card.year}_${card.team}`;
                  const imageUrl = getPlayerImageUrl(card.image);

                  return (
                    <div
                      key={cardKey}
                      className={`relative rounded-xl overflow-hidden transition-all duration-200 ${
                        owned
                          ? "hover:scale-105 cursor-pointer"
                          : "opacity-50"
                      }`}
                    >
                      {/* 카드 배경 */}
                      <div
                        className={`aspect-[2/3] bg-gradient-to-br ${
                          gradeColors[card.grade] || gradeColors.C
                        } p-0.5`}
                      >
                        <div className="w-full h-full bg-[#141B3D] rounded-lg overflow-hidden">
                          {owned ? (
                            // 보유 카드: 실제 이미지
                            <div className="relative w-full h-full">
                              <ImageWithFallback
                                src={imageUrl || ""}
                                alt={card.name || "Unknown Player"}
                                className="w-full h-full object-cover"
                              />
                              {/* 등급 배지 */}
                              <div
                                className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-gradient-to-br ${
                                  gradeColors[card.grade]
                                } flex items-center justify-center font-bold text-white text-sm shadow-lg`}
                              >
                                {card.grade}
                              </div>
                              {/* 하단 정보 */}
                              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                                <p className="text-white text-xs font-bold truncate">{card.name}</p>
                                <p className="text-[#8B95B5] text-xs">
                                  {card.year} · {card.team}
                                </p>
                              </div>
                            </div>
                          ) : (
                            // 미보유 카드: 빈 카드 + 이름만
                            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0A0F2C]/50 backdrop-blur-sm">
                              <Lock className="text-[#8B95B5]/30 mb-2" size={32} />
                              <p className="text-white text-xs font-bold text-center px-2 truncate w-full">
                                {card.name}
                              </p>
                              <p className="text-[#8B95B5]/70 text-xs mt-1">
                                {card.year} · {card.grade}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 시너지 목록 탭 */}
      {selectedTab === "synergy" && (
        <div className="max-w-7xl mx-auto">
          <SynergyListView />
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
