// LCK 가챠 메인 홈 화면

import React, { useRef, useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { GACHA_CONFIG } from "@/types/lck";
import { Coins, Sparkles, Users, Library, Zap, TrendingUp, LogOut, Share2, Calendar, Copy, Check } from "lucide-react";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { toast } from "sonner";
import { projectId, publicAnonKey } from '/utils/supabase/info';
import { createClient } from "@supabase/supabase-js";
import { generateShareURL } from "@/utils/squadEncryption";
import { Page } from "@/components/Sidebar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/app/components/ui/dialog";

const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

interface LCKHomeProps {
  onNavigate: (page: Page) => void;
}

export function LCKHome({ onNavigate }: LCKHomeProps) {
  const { userData } = useGame();
  const { user, isAuthenticated, signOut, accessToken } = useAuth();

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

  const handleCheckIn = async () => {
    if (!isAuthenticated || !user) {
      toast.error("로그인이 필요합니다");
      return;
    }

    console.log("✅ 출석 체크 시작");

    try {
      // 1. 현재 게임 데이터 조회
      const { data: gameData, error: fetchError } = await supabase
        .from('user_game_data')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError || !gameData) {
        console.error("게임 데이터 조회 실패:", fetchError);
        toast.error("데이터를 불러올 수 없습니다");
        return;
      }

      // 2. 오늘 이미 출석했는지 확인
      const now = new Date();
      const lastCheckIn = gameData.last_check_in ? new Date(gameData.last_check_in) : null;

      if (lastCheckIn) {
        // 한국 시간 기준으로 날짜 비교
        const koreaOffset = 9 * 60 * 60 * 1000;
        const nowKorea = new Date(now.getTime() + koreaOffset);
        const lastCheckInKorea = new Date(lastCheckIn.getTime() + koreaOffset);

        const todayDate = nowKorea.toISOString().split('T')[0];
        const lastCheckDate = lastCheckInKorea.toISOString().split('T')[0];

        if (todayDate === lastCheckDate) {
          toast.info("이미 오늘 출석했습니다!");
          return;
        }
      }

      // 3. 출석 보상 지급 (5000 RP)
      const newCurrency = gameData.currency + 5000;

      const { error: updateError } = await supabase
        .from('user_game_data')
        .update({
          currency: newCurrency,
          last_check_in: now.toISOString(),
          updated_at: now.toISOString()
        })
        .eq('user_id', user.id);

      if (updateError) {
        console.error("업데이트 실패:", updateError);
        toast.error("출석 체크에 실패했습니다");
        return;
      }

      toast.success("출석 완료! 5,000 RP를 받았습니다!");
      window.location.reload();

    } catch (error) {
      console.error("출석 체크 실패:", error);
      toast.error("출석 체크에 실패했습니다");
    }
  };

  const handleShareSquad = async () => {
    console.log('=== 스쿼드 공유 시작 ===');
    
    // 현재 스쿼드의 카드 ID 수집
    const roster = {
      top: userData.squad.TOP?.id || null,
      jgl: userData.squad.JGL?.id || null,
      mid: userData.squad.MID?.id || null,
      adc: userData.squad.ADC?.id || null,
      sup: userData.squad.SUP?.id || null,
    };
    
    // 스쿼드가 비어있는지 확인
    const hasAnyCard = Object.values(roster).some(id => id !== null);
    if (!hasAnyCard) {
      toast.error("공유할 스쿼드가 없습니다.");
      return;
    }
    
    // 공유 URL 생성
    const url = generateShareURL(roster);
    console.log('✅ 공유 URL 생성:', url);
    
    // 바로 클립보드에 복사
    try {
      await navigator.clipboard.writeText(url);
      toast.success("공유 링크가 복사되었습니다!");
    } catch (error) {
      // Clipboard API가 차단된 경우 수동 복사
      const textArea = document.createElement('textarea');
      textArea.value = url;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        toast.success("공유 링크가 복사되었습니다!");
      } catch (err) {
        // 수동 복사도 실패하면 다이얼로그 표시
        console.log('수동 복사 실패, 다이얼로그 표시');
        setShareURL(url);
        setShowShareDialog(true);
        return;
      }
      document.body.removeChild(textArea);
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

  const [showShareDialog, setShowShareDialog] = useState(false);
  const [shareURL, setShareURL] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopyURL = () => {
    navigator.clipboard.writeText(shareURL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('복사 실패:', err);
      toast.error("복사에 실패했습니다");
    });
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 새 헤더 - 모바일은 작게, 데스크톱은 크게 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20">
        <div className="max-w-[1500px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between mb-3">
            {/* 로고 + 타이틀 */}
            <div className="flex items-center gap-2 md:gap-4">
              <ImageWithFallback
                src="https://qpzfzemhljgzscojkxnj.supabase.co/storage/v1/object/public/team-logos/lck-logo-white.svg"
                alt="LCK Logo"
                className="w-8 h-8 md:w-16 md:h-16 object-contain"
              />
              <div>
                <h1 className="text-xl md:text-5xl font-bold tracking-wider text-white" style={{
                  textShadow: '0 0 40px rgba(255, 255, 255, 0.5), 0 0 80px rgba(200, 16, 46, 0.3)'
                }}>
                  Legends Manager
                </h1>
                <p className="hidden md:block text-sm text-[#8B95B5] font-display tracking-wide">SQUAD BUILDER</p>
              </div>
            </div>

            {/* 로그인/로그아웃 버튼 */}
            <div className="flex items-center">
              {isAuthenticated && (
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="hidden md:inline text-sm text-[#9AA6C3]">{user?.email}</span>
                  <Button
                    onClick={handleLogout}
                    variant="ghost"
                    size="sm"
                    className="text-[#E4002B] hover:text-[#E4002B] hover:bg-[#E4002B]/10 text-xs md:text-sm px-2 md:px-4"
                  >
                    <LogOut className="w-3 h-3 md:w-4 md:h-4 md:mr-2" />
                    <span className="hidden md:inline">로그아웃</span>
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* 재화 & 천장 게이지 & 출석 */}
          <div className="grid grid-cols-3 gap-2 md:gap-4">
            {/* 재화 */}
            <div className="bg-[#141B3D]/80 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-[#0047AB]/30">
              <div className="flex md:grid md:grid-cols-2 gap-3 md:gap-4 items-center justify-between md:justify-start">
                <div className="flex items-center gap-1 md:gap-3">
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-[#C8102E]/20 items-center justify-center flex-shrink-0">
                    <Coins className="w-5 h-5 text-[#C8102E]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] md:text-xs text-[#8B95B5]">RP</div>
                    <div className="text-xs md:text-xl font-display font-bold truncate">{userData.currency.toLocaleString()}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-1 md:gap-3">
                  <div className="hidden md:flex w-10 h-10 rounded-full bg-[#FFB81C]/20 items-center justify-center flex-shrink-0">
                    <Sparkles className="w-5 h-5 text-[#FFB81C]" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[9px] md:text-xs text-[#8B95B5]">샤드</div>
                    <div className="text-xs md:text-xl font-display font-bold truncate">{userData.shards.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* 출석 체크 */}
            {isAuthenticated && (
              <div className="bg-[#141B3D]/80 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-[#10B981]/30">
                <Button
                  onClick={handleCheckIn}
                  className="w-full h-full bg-gradient-to-br from-[#10B981]/20 to-transparent hover:from-[#10B981]/30 border border-[#10B981] text-white font-display text-[9px] md:text-sm py-1 md:py-2 px-1 md:px-3"
                >
                  <Calendar className="w-3 h-3 md:w-6 md:h-6 md:mr-2 flex-shrink-0" />
                  <div className="text-left min-w-0">
                    <div className="text-[8px] md:text-xs text-[#9AA6C3] truncate">매일 출석하고</div>
                    <div className="text-[10px] md:text-lg font-bold truncate">5,000 RP</div>
                  </div>
                </Button>
              </div>
            )}

            {/* S 천장 게이지 */}
            <div className="bg-[#141B3D]/80 backdrop-blur-sm rounded-lg md:rounded-xl p-2 md:p-4 border border-[#C8102E]/30">
              <div className="flex items-center justify-between mb-1 md:mb-2">
                <div className="flex items-center gap-1 md:gap-2">
                  <Zap className="w-2.5 h-2.5 md:w-4 md:h-4 text-[#FFB81C] flex-shrink-0" />
                  <span className="text-[9px] md:text-sm font-semibold truncate">S 천장</span>
                </div>
                <span className="text-[9px] md:text-sm font-display text-[#FFB81C] flex-shrink-0">
                  {userData.gachaState.s_pity_stack}/{GACHA_CONFIG.S_PITY_HARD}
                </span>
              </div>
              <div className="h-1 md:h-2 bg-[#0A0E27] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#C8102E] via-[#FFB81C] to-[#FFB81C] transition-all duration-300"
                  style={{
                    width: `${(userData.gachaState.s_pity_stack / GACHA_CONFIG.S_PITY_HARD) * 100}%`
                  }}
                />
              </div>
              {userData.gachaState.s_pity_stack >= GACHA_CONFIG.S_PITY_SOFT_START && (
                <p className="text-[8px] md:text-xs text-[#FFB81C] mt-1 flex items-center gap-1">
                  <Zap className="w-2 h-2 md:w-3 md:h-3 flex-shrink-0" /> <span className="truncate">확률 상승</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        {/* MY SQUAD 섹션 */}
        <div className="mb-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide">MY SQUAD</h2>
            <div className="flex items-center gap-2 md:gap-3">
              <Button
                onClick={() => onNavigate("squad")}
                className="bg-gradient-to-r from-[#0047AB] to-[#003D8F] hover:from-[#0047AB]/90 hover:to-[#003D8F]/90
                           shadow-lg shadow-[#0047AB]/30 font-display flex-1 md:flex-none py-2.5 md:py-3 
                           flex items-center justify-center rounded-xl transition-all duration-200 
                           transform hover:scale-[1.02]"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/10 flex items-center justify-center mr-1.5 md:mr-2">
                  <Users className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
                팀 관리
              </Button>
              <Button
                onClick={handleShareSquad}
                className="bg-gradient-to-r from-[#C8102E] to-[#A00D25] hover:from-[#C8102E]/90 hover:to-[#A00D25]/90
                           shadow-lg shadow-[#C8102E]/30 font-display flex-1 md:flex-none py-2.5 md:py-3 
                           flex items-center justify-center rounded-xl transition-all duration-200 
                           transform hover:scale-[1.02]"
              >
                <div className="w-6 h-6 md:w-7 md:h-7 rounded-full bg-white/10 flex items-center justify-center mr-1.5 md:mr-2">
                  <Share2 className="w-3.5 h-3.5 md:w-4 md:h-4" />
                </div>
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
              <h3 className="text-2xl font-bold mb-2 font-display tracking-wide">선수 뽑기</h3>
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
              <h3 className="text-2xl font-bold mb-2 font-display tracking-wide">선수 관리</h3>
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

      {/* 공유 다이얼로그 */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent className="bg-[#0A0E27] text-white border-[#2B6CFF]/30 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl font-display text-[#FFB81C]">스쿼드 공유</DialogTitle>
            <DialogDescription className="text-[#9AA6C3]">
              아래 링크를 복사하여 친구들과 공유하세요!
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {/* URL 표시 */}
            <div className="bg-[#141B3D]/50 p-3 rounded-lg border border-[#0047AB]/30">
              <div className="text-xs text-[#8B95B5] mb-2">공유 링크</div>
              <div className="text-sm text-white break-all">{shareURL}</div>
            </div>
            
            {/* 복사 버튼 */}
            <Button
              onClick={handleCopyURL}
              className="w-full bg-gradient-to-r from-[#C8102E] to-[#A00D25] hover:from-[#C8102E]/90 hover:to-[#A00D25]/90 shadow-lg shadow-[#C8102E]/30 font-display py-3 rounded-xl transition-all duration-200 transform hover:scale-[1.02]"
            >
              {copied ? (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  복사 완료!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  링크 복사하기
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}