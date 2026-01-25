// 공유된 스쿼드 읽기 전용 페이지

import React, { useState, useEffect } from "react";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { Sparkles, TrendingUp, AlertCircle } from "lucide-react";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { decryptSquadRoster, SquadRoster } from "@/utils/squadEncryption";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { getCardById } from "@/utils/gachaEngine";
import { LCKCard } from "@/types/lck";

interface SharedSquadData {
  TOP: LCKCard | null;
  JGL: LCKCard | null;
  MID: LCKCard | null;
  ADC: LCKCard | null;
  SUP: LCKCard | null;
}

export function SharedSquadPage() {
  const [squad, setSquad] = useState<SharedSquadData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadSharedSquad = async () => {
      try {
        // URL에서 roster 파라미터 추출
        const urlParams = new URLSearchParams(window.location.search);
        const encryptedRoster = urlParams.get('roster');

        if (!encryptedRoster) {
          setError('공유 링크가 올바르지 않습니다.');
          setLoading(false);
          return;
        }

        // 복호화
        const roster: SquadRoster = decryptSquadRoster(encryptedRoster);

        // 카드 데이터 로드
        const loadedSquad: SharedSquadData = {
          TOP: null,
          JGL: null,
          MID: null,
          ADC: null,
          SUP: null,
        };

        const positions: (keyof SharedSquadData)[] = ['TOP', 'JGL', 'MID', 'ADC', 'SUP'];
        const rosterKeys: (keyof SquadRoster)[] = ['top', 'jgl', 'mid', 'adc', 'sup'];

        for (let i = 0; i < positions.length; i++) {
          const position = positions[i];
          const rosterKey = rosterKeys[i];
          const cardId = roster[rosterKey];

          if (cardId) {
            const card = await getCardById(cardId);
            if (card) {
              loadedSquad[position] = card;
            } else {
              console.warn(`⚠️ 카드 ID ${cardId}를 찾을 수 없습니다 (${position})`);
            }
          }
        }

        setSquad(loadedSquad);
        setLoading(false);

      } catch (err: any) {
        console.error('❌ 스쿼드 로드 실패:', err);
        setError(err.message || '잘못된 공유 링크입니다.');
        setLoading(false);
      }
    };

    loadSharedSquad();
  }, []);

  // 로딩 상태
  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-display text-[#FFB81C] mb-4 animate-pulse">
            스쿼드 불러오는 중...
          </div>
          <div className="text-[#9AA6C3]">
            공유된 스쿼드를 로딩하고 있습니다
          </div>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error || !squad) {
    return (
      <div className="min-h-screen bg-[#0A0E27] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-6">
          <AlertCircle className="w-16 h-16 text-[#C8102E] mx-auto mb-4" />
          <div className="text-2xl font-display text-white mb-4">
            {error || '스쿼드를 불러올 수 없습니다'}
          </div>
          <div className="text-[#9AA6C3] mb-6">
            링크가 올바른지 확인해주세요
          </div>
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-[#C8102E] to-[#A00D25] 
                       text-white px-6 py-3 rounded-xl font-display hover:opacity-90 transition-opacity"
          >
            메인으로 돌아가기
          </a>
        </div>
      </div>
    );
  }

  // 시너지 계산
  const synergies = calculateSynergies(squad);
  const cardBonuses = calculateCardSynergyBonuses(squad, synergies);

  // 스탯 계산
  const positions = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;
  const stats = (() => {
    const deployedCards = Object.values(squad).filter(c => c !== null);
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

    let totalOVR = 0;
    let totalMechanics = 0;
    let totalLaning = 0;
    let totalTeamfight = 0;
    let totalMacro = 0;
    let totalClutch = 0;

    for (const card of deployedCards) {
      if (!card) continue;

      const bonus = cardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };

      totalOVR += card.stats.ovr + (card.upgradeLevel || 0) + bonus.ovr;
      totalMechanics += card.stats.mechanics + bonus.mec;
      totalLaning += card.stats.laning + bonus.lan;
      totalTeamfight += card.stats.teamfight + bonus.tf;
      totalMacro += card.stats.macro + bonus.mac;
      totalClutch += card.stats.clutch + bonus.clu;
    }

    const baseOVR = deployedCards.reduce((sum, card) => sum + card!.stats.ovr + (card!.upgradeLevel || 0), 0);
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

  // 카드가 시너지에 포함되는지 확인
  const isCardInSynergy = (cardId: string) => {
    return synergies.some(s => s.isActive && s.matchedPlayers.includes(cardId));
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20">
        <div className="max-w-[1500px] mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
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
                <p className="hidden md:block text-sm text-[#8B95B5] font-display tracking-wide">SHARED SQUAD</p>
              </div>
            </div>

            {/* 홈으로 버튼 */}
            <a
              href="/"
              className="bg-gradient-to-r from-[#0047AB] to-[#003D8F] hover:from-[#0047AB]/90 hover:to-[#003D8F]/90
                         shadow-lg shadow-[#0047AB]/30 font-display px-4 py-2 md:px-6 md:py-3 
                         rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-sm md:text-base"
            >
              메인으로
            </a>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8">
        {/* 공유된 스쿼드 타이틀 */}
        <div className="mb-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-display tracking-wide mb-2">
            공유된 스쿼드
          </h2>
          <p className="text-[#9AA6C3] text-sm md:text-base">
            이 스쿼드를 참고하여 나만의 팀을 만들어보세요!
          </p>
        </div>

        {/* 스쿼드 카드 5장 가로 배치 */}
        <div className="bg-gradient-to-br from-[#141B3D]/50 via-[#141B3D]/80 to-[#141B3D]/50 rounded-2xl p-8 border border-[#0047AB]/30 backdrop-blur-sm mb-4">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pb-2">
            {positions.map((position) => {
              const card = squad[position];
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
                        upgradeLevel={card.upgradeLevel || 0}
                        synergyBonus={cardBonus || undefined}
                      />
                    </div>
                  ) : (
                    <div className="w-60 h-[440px] bg-[#0A0E27]/50 rounded-2xl border-2 border-dashed border-[#0047AB]/30 flex flex-col items-center justify-center gap-3">
                      <div className="text-sm text-[#8B95B5]">{position}</div>
                      <div className="text-xs text-[#8B95B5]/50">비어있음</div>
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

        {/* CTA 버튼 */}
        <div className="mt-8 text-center">
          <a
            href="/"
            className="inline-block bg-gradient-to-r from-[#C8102E] to-[#A00D25] 
                       hover:from-[#C8102E]/90 hover:to-[#A00D25]/90
                       shadow-lg shadow-[#C8102E]/30 font-display px-8 py-4 
                       rounded-xl transition-all duration-200 transform hover:scale-[1.02] text-lg"
          >
            나도 스쿼드 만들러 가기
          </a>
        </div>
      </div>
    </div>
  );
}
