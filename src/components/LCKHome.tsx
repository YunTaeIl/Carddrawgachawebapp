// LCK 가챠 메인 홈 화면

import React, { useState, useRef } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { LCKAuth } from "@/components/LCKAuth";
import { SynergyPanel } from "@/components/SynergyPanelV2";
import { ShareCard } from "@/components/ShareCard";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { GACHA_CONFIG } from "@/types/lck";
import { Coins, Sparkles, Users, Library, Zap, TrendingUp, LogIn, LogOut, Share2 } from "lucide-react";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { toast } from "sonner";
import * as htmlToImage from "html-to-image";

interface LCKHomeProps {
  onNavigate: (page: "home" | "gacha" | "squad" | "collection" | "test" | "terms") => void;
}

export function LCKHome({ onNavigate }: LCKHomeProps) {
  const { userData } = useGame();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const squadRef = useRef<HTMLDivElement>(null);

  const positions = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;
  
  // 스쿼드 스탯 & 시너지 계산
  const synergies = calculateSynergies(userData.squad);
  
  // 각 카드별 시너지 보너스 계산
  const cardBonuses = calculateCardSynergyBonuses(userData.squad, synergies);
  
  // 스탯 계산 (각 카드에 시너지 보너스 적용)
  const stats = (() => {
    const deployedCards = Object.values(userData.squad).filter(c => c !== null);
    if (deployedCards.length === 0) {
      return { 
        baseOVR: 0, totalOVR: 0, avgOVR: 0,
        baseMechanics: 0, totalMechanics: 0,
        baseLaning: 0, totalLaning: 0,
        baseTeamfight: 0, totalTeamfight: 0,
        baseMacro: 0, totalMacro: 0,
        baseClutch: 0, totalClutch: 0
      };
    }
    
    // 각 카드의 기본 스탯 + 시너지 보너스를 합산
    let totalOVR = 0;
    let totalMechanics = 0;
    let totalLaning = 0;
    let totalTeamfight = 0;
    let totalMacro = 0;
    let totalClutch = 0;
    
    for (const card of deployedCards) {
      if (!card) continue;
      
      const bonus = cardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
      
      totalOVR += card.stats.ovr + card.upgradeLevel + bonus.ovr;
      totalMechanics += card.stats.mechanics + bonus.mec;
      totalLaning += card.stats.laning + bonus.lan;
      totalTeamfight += card.stats.teamfight + bonus.tf;
      totalMacro += card.stats.macro + bonus.mac;
      totalClutch += card.stats.clutch + bonus.clu;
    }
    
    const baseOVR = deployedCards.reduce((sum, card) => sum + card!.stats.ovr + card!.upgradeLevel, 0);
    const baseMechanics = deployedCards.reduce((sum, card) => sum + card!.stats.mechanics, 0);
    const baseLaning = deployedCards.reduce((sum, card) => sum + card!.stats.laning, 0);
    const baseTeamfight = deployedCards.reduce((sum, card) => sum + card!.stats.teamfight, 0);
    const baseMacro = deployedCards.reduce((sum, card) => sum + card!.stats.macro, 0);
    const baseClutch = deployedCards.reduce((sum, card) => sum + card!.stats.clutch, 0);
    
    return {
      baseOVR,
      totalOVR,
      avgOVR: Math.round(totalOVR / deployedCards.length),
      baseMechanics,
      totalMechanics,
      baseLaning,
      totalLaning,
      baseTeamfight,
      totalTeamfight,
      baseMacro,
      totalMacro,
      baseClutch,
      totalClutch
    };
  })();
  
  // 각 카드가 시너지에 포함되는지 확인
  const isCardInSynergy = (cardId: string) => {
    return synergies.some(s => s.isActive && s.matchedPlayers.includes(cardId));
  };
  
  // 각 카드의 시너지 보너스 합계 계산
  const getCardTotalBonus = (cardId: string) => {
    const bonus = cardBonuses[cardId];
    if (!bonus) return 0;
    return bonus.ovr + bonus.mec + bonus.lan + bonus.tf + bonus.mac + bonus.clu;
  };

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("로그아웃되었습니다");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      toast.error("로그아웃에 실패했습니다");
    }
  };

  // 모바일 감지
  const isMobile = () => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (window.innerWidth <= 768);
  };

  const handleShareSquad = async () => {
    if (!squadRef.current) {
      toast.error("스쿼드 정보를 찾을 수 없습니다.");
      return;
    }
    
    try {
      toast.info("이미지 생성 중...");
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const blob = await htmlToImage.toBlob(squadRef.current, {
        quality: 0.95,
        pixelRatio: 1.5,
        backgroundColor: '#0B0F1A',
        cacheBust: true,
      });
      
      if (!blob) {
        throw new Error('이미지 생성 실패');
      }
      
      // 모바일 감지
      const mobile = isMobile();
      console.log('모바일 여부:', mobile);
      console.log('navigator.share 존재:', !!navigator.share);
      
      // 모바일에서 네이티브 공유 시도
      if (mobile && navigator.share) {
        try {
          const file = new File([blob], `lck_squad_${Date.now()}.png`, { type: 'image/png' });
          
          // canShare 체크
          const canShareFiles = navigator.canShare && navigator.canShare({ files: [file] });
          console.log('파일 공유 가능:', canShareFiles);
          
          if (canShareFiles) {
            await navigator.share({
              files: [file],
              title: 'LCK 스쿼드',
              text: `내 LCK 스쿼드 (평균 OVR ${stats.avgOVR})`,
            });
            toast.success("공유 완료!");
            return;
          }
        } catch (shareError: any) {
          console.error('네이티브 공유 실패:', shareError);
          if (shareError.name !== 'AbortError') {
            // 취소가 아닌 실패인 경우만 다운로드로 폴백
            downloadImage(blob);
          }
          return;
        }
      }
      
      // PC 또는 공유 불가능한 경우 다운로드
      downloadImage(blob);
      
    } catch (error) {
      console.error('이미지 생성 실패:', error);
      toast.error('이미지 생성에 실패했습니다.');
    }
  };
  
  const downloadImage = (blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `lck_squad_${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("스쿼드 이미지가 다운로드되었습니다!");
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-gradient-to-b from-[#C8102E]/10 to-transparent border-b border-[#C8102E]/30">
        <div className="max-w-[1500px] mx-auto px-6 py-8">
          {/* 로그인/회원가입 버튼 - 우측 상단 */}
          <div className="flex justify-end mb-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                <span className="text-sm text-[#9AA6C3]">{user?.email}</span>
                <Button
                  onClick={handleLogout}
                  variant="ghost"
                  size="sm"
                  className="text-[#E4002B] hover:text-[#E4002B] hover:bg-[#E4002B]/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  로그아웃
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setShowAuthDialog(true)}
                className="bg-[#2B6CFF] hover:bg-[#2B6CFF]/80"
              >
                <LogIn className="w-4 h-4 mr-2" />
                로그인 / 회원가입
              </Button>
            )}
          </div>

          <div className="text-center mb-6">
            <h1 className="flex items-center justify-center gap-4 mb-2">
              <ImageWithFallback
                src="https://qpzfzemhljgzscojkxnj.supabase.co/storage/v1/object/public/team-logos/lck-logo-white.svg"
                alt="LCK Logo"
                className="w-20 h-20 object-contain"
              />
              <span className="text-7xl font-bold tracking-wider text-white" style={{
                textShadow: '0 0 40px rgba(255, 255, 255, 0.5), 0 0 80px rgba(200, 16, 46, 0.3)'
              }}>
                LCK GACHA
              </span>
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
        <div className="mb-12" ref={squadRef}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-4xl font-bold font-display tracking-wide">MY SQUAD</h2>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => onNavigate("squad")}
                className="bg-[#0047AB] hover:bg-[#0047AB]/80 font-display"
              >
                <Users className="w-4 h-4 mr-2" />
                스쿼드 편집
              </Button>
              <Button
                onClick={handleShareSquad}
                className="bg-[#9333EA] hover:bg-[#9333EA]/80 font-display"
              >
                <Share2 className="w-4 h-4 mr-2" />
                공유
              </Button>
            </div>
          </div>

          {/* 스쿼드 카드 5장 가로 배치 */}
          <div className="bg-gradient-to-br from-[#141B3D]/50 via-[#141B3D]/80 to-[#141B3D]/50 rounded-2xl p-8 border border-[#0047AB]/30 backdrop-blur-sm mb-4">
            <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pb-2">
              {positions.map((position) => {
                const card = userData.squad[position];
                const hasSynergy = card && isCardInSynergy(card.id);
                const cardBonus = card ? cardBonuses[card.id] : null;
                
                return (
                  <div key={position} className="flex-shrink-0">
                    {card ? (
                      <div className="group relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8102E] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                          {position}
                        </div>
                        {/* 시너지 글로우 효과 */}
                        {hasSynergy && (
                          <>
                            <div className="absolute inset-0 rounded-2xl bg-[#FFB81C]/20 blur-xl animate-pulse z-0" />
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FFB81C] text-[#0B0F1A] px-2 py-0.5 rounded-full text-[9px] font-bold z-10 flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              시너지
                            </div>
                          </>
                        )}
                        <LCKHoloCard 
                          card={card} 
                          size="medium" 
                          upgradeLevel={card.upgradeLevel}
                          synergyBonus={cardBonus || undefined}
                        />
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
                {synergies.some(s => s.isActive) && (
                  <span className="ml-auto text-[9px] text-[#10B981] font-bold">시너지 적용 중</span>
                )}
              </div>
              <div className="space-y-3">
                {/* 총 OVR & 평균 OVR */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">총 OVR</div>
                    <div className="flex flex-col items-center">
                      <div className="text-2xl font-display font-bold text-[#FFB81C]">{stats.totalOVR}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[10px] text-[#10B981] font-bold">+{stats.totalOVR - stats.baseOVR}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">평균 OVR</div>
                    <div className="text-2xl font-display font-bold text-[#0047AB]">{stats.avgOVR}</div>
                  </div>
                </div>
                
                {/* 5개 스탯 */}
                <div className="grid grid-cols-5 gap-2">
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">메카닉</div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-display font-bold">{stats.totalMechanics}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[9px] text-[#10B981]">+{stats.totalMechanics - stats.baseMechanics}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">라인전</div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-display font-bold">{stats.totalLaning}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[9px] text-[#10B981]">+{stats.totalLaning - stats.baseLaning}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">한타</div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-display font-bold">{stats.totalTeamfight}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[9px] text-[#10B981]">+{stats.totalTeamfight - stats.baseTeamfight}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">운영</div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-display font-bold">{stats.totalMacro}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[9px] text-[#10B981]">+{stats.totalMacro - stats.baseMacro}</div>
                      )}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-[#8B95B5] mb-1">클러치</div>
                    <div className="flex flex-col items-center">
                      <div className="text-lg font-display font-bold">{stats.totalClutch}</div>
                      {synergies.some(s => s.isActive) && (
                        <div className="text-[9px] text-[#10B981]">+{stats.totalClutch - stats.baseClutch}</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 활성 시너지 */}
            <div className="bg-gradient-to-br from-[#0047AB]/10 to-[#141B3D]/50 rounded-xl p-4 border border-[#0047AB]/30">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-[#FFB81C]" />
                <h3 className="font-bold font-display">활성 시너지</h3>
                {synergies.filter(s => s.isActive).length > 0 && (
                  <span className="ml-auto bg-[#FFB81C] text-[#0B0F1A] px-2 py-0.5 rounded-full text-xs font-bold">
                    {synergies.filter(s => s.isActive).length}개
                  </span>
                )}
              </div>
              {synergies.filter(s => s.isActive).length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                  {synergies.filter(s => s.isActive).map((synergy) => (
                    <div key={synergy.synergy.synergy_id} className="bg-[#0A0E27]/50 p-3 rounded-lg border border-[#FFB81C]/30">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-sm font-bold text-[#FFB81C]">{synergy.synergy.synergy_name}</div>
                        {synergy.isPrime && (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-[#C8102E] text-white">
                            PRIME
                          </span>
                        )}
                        <span className="ml-auto px-2 py-0.5 rounded text-[9px] font-bold bg-[#0A0E27] text-[#9AA6C3]">
                          {synergy.synergy.type}
                        </span>
                      </div>
                      <div className="text-[10px] text-[#8B95B5] mb-2">
                        {synergy.synergy.description}
                      </div>
                      {synergy.currentEffect && (
                        <div className="flex items-center gap-1 flex-wrap text-[9px]">
                          <div className="bg-[#0B0F1A] px-2 py-1 rounded text-[#10B981] font-bold">
                            OVR +{synergy.currentEffect.ovr}
                          </div>
                          {synergy.currentEffect.mec > 0 && (
                            <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                              메카닉 +{synergy.currentEffect.mec}
                            </span>
                          )}
                          {synergy.currentEffect.lan > 0 && (
                            <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                              라인 +{synergy.currentEffect.lan}
                            </span>
                          )}
                          {synergy.currentEffect.tf > 0 && (
                            <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                              한타 +{synergy.currentEffect.tf}
                            </span>
                          )}
                          {synergy.currentEffect.mac > 0 && (
                            <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                              운영 +{synergy.currentEffect.mac}
                            </span>
                          )}
                          {synergy.currentEffect.clu > 0 && (
                            <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                              클러치 +{synergy.currentEffect.clu}
                            </span>
                          )}
                        </div>
                      )}
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
            variant="ghost"
            size="sm"
            onClick={() => onNavigate("terms")}
            className="text-[#8B95B5] hover:text-white text-xs"
          >
            이용약관 및 면책조항
          </Button>
        </div>
      </div>

      {/* 로그인/회원가입 다이얼로그 */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="bg-[#0A0E27] text-white border-[#2B6CFF]/30">
          <LCKAuth onSuccess={() => setShowAuthDialog(false)} />
        </DialogContent>
      </Dialog>
      
      {/* 숨겨진 스쿼드 공유 이미지 */}
      <div className="fixed -left-[9999px] top-0">
        <ShareCard
          ref={squadRef}
          squad={userData.squad}
          synergies={synergies}
          stats={stats}
          cardBonuses={cardBonuses}
        />
      </div>
    </div>
  );
}