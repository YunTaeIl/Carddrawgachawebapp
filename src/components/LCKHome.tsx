// LCK 가챠 메인 홈 화면

import React from "react";
import { useGame } from "@/contexts/GameContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { GACHA_CONFIG } from "@/types/lck";
import { Coins, Sparkles, Users, Library, Zap, TrendingUp } from "lucide-react";
import { calculateActiveSynergies, calculateSquadStats } from "@/utils/synergyCalculator";

interface LCKHomeProps {
  onNavigate: (page: "home" | "gacha" | "squad" | "collection" | "test") => void;
}

export function LCKHome({ onNavigate }: LCKHomeProps) {
  const { userData, addCurrency } = useGame();

  const positions = ["TOP", "JNG", "MID", "ADC", "SUP"] as const;
  
  // 스쿼드 스탯 & 시너지 계산
  const synergies = calculateActiveSynergies(userData.squad);
  const stats = calculateSquadStats(userData.squad, synergies);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-[#C8102E]/10 to-transparent border-b border-[#C8102E]/30">
        <div className="max-w-[1500px] mx-auto px-6 py-8">{/* 메인과 동일한 너비 */}
          <div className="text-center mb-6">
            <h1 className="text-7xl font-bold mb-2 tracking-wider" style={{
              background: 'linear-gradient(135deg, #C8102E 0%, #0047AB 50%, #FFB81C 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 0 80px rgba(200, 16, 46, 0.5)'
            }}>
              LCK GACHA
            </h1>
            <p className="text-xl text-[#8B95B5] font-display tracking-wide">SQUAD BUILDER</p>
          </div>

          {/* 재화 & 천장 게이지 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* 재화 */}
            <div className="bg-[#141B3D]/80 backdrop-blur-sm rounded-xl p-4 border border-[#0047AB]/30">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#C8102E]/20 flex items-center justify-center">
                    <Coins className="w-5 h-5 text-[#C8102E]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8B95B5]">RP</div>
                    <div className="text-xl font-display font-bold">{userData.currency.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#FFB81C]/20 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-[#FFB81C]" />
                  </div>
                  <div>
                    <div className="text-xs text-[#8B95B5]">샤드</div>
                    <div className="text-xl font-display font-bold">{userData.shards.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* S 천장 게이지 */}
            <div className="bg-[#141B3D]/80 backdrop-blur-sm rounded-xl p-4 border border-[#C8102E]/30">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-[#FFB81C]" />
                  <span className="text-sm font-semibold">S 천장</span>
                </div>
                <span className="text-sm font-display text-[#FFB81C]">
                  {userData.gachaState.s_pity_stack} / {GACHA_CONFIG.S_PITY_HARD}
                </span>
              </div>
              <div className="h-2 bg-[#0A0E27] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C8102E] via-[#FFB81C] to-[#FFB81C] transition-all duration-300"
                  style={{
                    width: `${(userData.gachaState.s_pity_stack / GACHA_CONFIG.S_PITY_HARD) * 100}%`
                  }}
                />
              </div>
              {userData.gachaState.s_pity_stack >= GACHA_CONFIG.S_PITY_SOFT_START && (
                <p className="text-xs text-[#FFB81C] mt-1 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 확률 상승 구간
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">{/* 카드 5장 + 간격에 맞춘 최적 너비 */}
        {/* MY SQUAD 섹션 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold font-display tracking-wide">MY SQUAD</h2>
            <Button
              onClick={() => onNavigate("squad")}
              className="bg-[#0047AB] hover:bg-[#0047AB]/80 font-display"
            >
              <Users className="w-4 h-4 mr-2" />
              스쿼드 편집
            </Button>
          </div>

          {/* 스쿼드 카드 5장 가로 배치 */}
          <div className="bg-gradient-to-br from-[#141B3D]/50 via-[#141B3D]/80 to-[#141B3D]/50 rounded-2xl p-8 border border-[#0047AB]/30 backdrop-blur-sm mb-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pb-2">
              {positions.map((position) => {
                const card = userData.squad[position];
                return (
                  <div key={position} className="flex-shrink-0">
                    {card ? (
                      <div className="group relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8102E] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                          {position}
                        </div>
                        <LCKHoloCard card={card} size="medium" upgradeLevel={card.upgradeLevel} />
                      </div>
                    ) : (
                      <div className="w-60 h-[440px] bg-[#0A0E27]/50 rounded-2xl border-2 border-dashed border-[#0047AB]/30 flex flex-col items-center justify-center gap-3 hover:border-[#0047AB] transition-all cursor-pointer"
                        onClick={() => onNavigate("squad")}
                      >
                        <div className="text-4xl text-[#0047AB]/50">+</div>
                        <div className="text-sm text-[#8B95B5]">{position}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 스쿼드 스탯 & 시너지 요약 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* 총 스탯 */}
            <div className="bg-gradient-to-br from-[#C8102E]/10 to-[#141B3D]/50 rounded-xl p-4 border border-[#C8102E]/30">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-[#FFB81C]" />
                <h3 className="font-bold font-display">스쿼드 스탯</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-[#8B95B5]">총 OVR</div>
                  <div className="text-2xl font-display font-bold text-[#FFB81C]">{stats.totalOVR}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8B95B5]">평균 OVR</div>
                  <div className="text-2xl font-display font-bold text-[#0047AB]">{stats.avgOVR}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8B95B5]">메카닉</div>
                  <div className="text-lg font-display font-bold">{stats.totalMechanics}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8B95B5]">한타</div>
                  <div className="text-lg font-display font-bold">{stats.totalTeamfight}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8B95B5]">운영</div>
                  <div className="text-lg font-display font-bold">{stats.totalMacro}</div>
                </div>
                <div>
                  <div className="text-xs text-[#8B95B5]">클러치</div>
                  <div className="text-lg font-display font-bold">{stats.totalClutch}</div>
                </div>
              </div>
            </div>

            {/* 활성 시너지 */}
            <div className="bg-gradient-to-br from-[#0047AB]/10 to-[#141B3D]/50 rounded-xl p-4 border border-[#0047AB]/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#FFB81C]" />
                <h3 className="font-bold font-display">활성 시너지</h3>
              </div>
              {synergies.length > 0 ? (
                <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar">
                  {synergies.map((synergy) => (
                    <div key={synergy.id} className="bg-[#0A0E27]/50 p-2 rounded border border-[#FFB81C]/30">
                      <div className="text-xs font-bold text-[#FFB81C]">{synergy.name}</div>
                      <div className="text-[10px] text-[#8B95B5]">{synergy.bonus}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-[#8B95B5] py-8 text-sm">
                  시너지 없음<br />
                  <span className="text-xs">같은 팀/연도로 구성하세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 액션 버튼들 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* 바로 뽑기 */}
          <button
            onClick={() => onNavigate("gacha")}
            className="group relative bg-gradient-to-br from-[#C8102E]/20 to-[#141B3D] rounded-2xl p-8 border-2 border-[#C8102E]/50 hover:border-[#C8102E] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#C8102E]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#C8102E]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C8102E] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-2 font-display tracking-wide">GACHA</h3>
              <p className="text-sm text-[#8B95B5]">카드팩 오픈</p>
            </div>
          </button>

          {/* 컬렉션 */}
          <button
            onClick={() => onNavigate("collection")}
            className="group relative bg-gradient-to-br from-[#FFB81C]/20 to-[#141B3D] rounded-2xl p-8 border-2 border-[#FFB81C]/50 hover:border-[#FFB81C] transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-[#FFB81C]/50 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FFB81C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className="relative z-10">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFB81C] flex items-center justify-center group-hover:scale-110 transition-transform">
                <Library className="w-8 h-8 text-[#0A0E27]" />
              </div>
              <h3 className="text-2xl font-bold mb-2 font-display tracking-wide">COLLECTION</h3>
              <p className="text-sm text-[#8B95B5]">{userData.ownedCards.length}장 보유</p>
            </div>
          </button>

          {/* 통계 */}
          <div className="bg-gradient-to-br from-[#0047AB]/20 to-[#141B3D] rounded-2xl p-8 border-2 border-[#0047AB]/50">
            <h3 className="text-xl font-bold mb-4 font-display tracking-wide">STATS</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B95B5]">총 뽑기</span>
                <span className="text-xl font-display font-bold">{userData.gachaState.total_pulls}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B95B5]">S 등급</span>
                <span className="text-xl font-display font-bold text-[#FFB81C]">
                  {userData.ownedCards.filter(c => c.grade === "S").length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#8B95B5]">A 등급</span>
                <span className="text-xl font-display font-bold text-[#0047AB]">
                  {userData.ownedCards.filter(c => c.grade === "A").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 버튼들 */}
        <div className="flex items-center justify-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => addCurrency(1000)}
            className="font-display"
          >
            + 1000 RP
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("test")}
            className="text-[#9AA6C3] hover:text-[#EAF0FF] font-display"
          >
            🎬 테스트 모드
          </Button>
        </div>
      </div>
    </div>
  );
}