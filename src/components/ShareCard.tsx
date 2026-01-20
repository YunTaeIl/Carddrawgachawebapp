// 스쿼드 공유 전용 캡처 컴포넌트 - 메인 화면 스타일

import React from "react";
import { UserCard, Position, POSITION_NAMES } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";
import { StaticCard } from "@/components/StaticCard";
import { TrendingUp, Sparkles } from "lucide-react";

interface ShareCardProps {
  squad: {
    TOP: UserCard | null;
    JGL: UserCard | null;
    MID: UserCard | null;
    ADC: UserCard | null;
    SUP: UserCard | null;
  };
  synergies: ActiveSynergy[];
  stats: {
    avgOVR: number;
    totalMechanics: number;
    totalLaning: number;
    totalTeamfight: number;
    totalMacro: number;
    totalClutch: number;
  };
}

export const ShareCard = React.forwardRef<HTMLDivElement, ShareCardProps>(
  ({ squad, synergies, stats }, ref) => {
    const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
    const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);

    return (
      <div 
        ref={ref} 
        style={{
          width: '1400px',
          background: '#0A0E27',
          fontFamily: 'Teko, system-ui, sans-serif',
          color: '#FFFFFF',
          padding: '48px',
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            color: '#FFFFFF',
            marginBottom: '8px',
            letterSpacing: '4px',
            textShadow: '0 0 40px rgba(255, 255, 255, 0.3)',
          }}>
            MY SQUAD
          </div>
          <div style={{ fontSize: '24px', color: '#8B95B5' }}>
            {deployedCards.length}/5 선수 배치 • 평균 OVR <span style={{ color: '#FFB81C', fontWeight: 'bold' }}>{stats.avgOVR}</span>
          </div>
        </div>

        {/* 카드 5장 */}
        <div style={{
          background: 'linear-gradient(to bottom right, rgba(20, 27, 61, 0.5) 0%, rgba(20, 27, 61, 0.8) 50%, rgba(20, 27, 61, 0.5) 100%)',
          borderRadius: '16px',
          padding: '32px',
          border: '1px solid rgba(0, 71, 171, 0.3)',
          marginBottom: '32px',
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
          }}>
            {positions.map((position) => {
              const card = squad[position];
              return (
                <div key={position} style={{ flexShrink: 0, position: 'relative' }}>
                  {/* 포지션 뱃지 */}
                  <div style={{
                    position: 'absolute',
                    top: '-12px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: '#C8102E',
                    color: 'white',
                    padding: '4px 12px',
                    borderRadius: '9999px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    zIndex: 10,
                  }}>
                    {position}
                  </div>
                  
                  {card ? (
                    <StaticCard 
                      card={card} 
                      size="small"
                      upgradeLevel={card.upgradeLevel}
                    />
                  ) : (
                    <div style={{
                      width: '160px',
                      height: '293px',
                      borderRadius: '12px',
                      border: '2px dashed rgba(0, 71, 171, 0.3)',
                      background: 'rgba(10, 14, 39, 0.5)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8B95B5',
                      fontSize: '14px',
                    }}>
                      빈 슬롯
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 스탯 & 시너지 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          {/* 스쿼드 스탯 */}
          <div style={{
            background: 'linear-gradient(to bottom right, rgba(200, 16, 46, 0.1) 0%, rgba(20, 27, 61, 0.5) 100%)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(200, 16, 46, 0.3)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '20px',
            }}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#FFB81C' }} />
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>스쿼드 스탯</span>
            </div>
            
            {/* 총 OVR & 평균 OVR */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginBottom: '20px',
              paddingBottom: '20px',
              borderBottom: '1px solid rgba(255, 184, 28, 0.2)',
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#8B95B5', marginBottom: '4px' }}>총 OVR</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#FFB81C' }}>
                  {stats.avgOVR * deployedCards.length}
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '12px', color: '#8B95B5', marginBottom: '4px' }}>평균 OVR</div>
                <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0047AB' }}>
                  {stats.avgOVR}
                </div>
              </div>
            </div>
            
            {/* 5개 스탯 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '12px' }}>
              {[
                { label: "메카닉", value: stats.totalMechanics },
                { label: "라인전", value: stats.totalLaning },
                { label: "한타", value: stats.totalTeamfight },
                { label: "운영", value: stats.totalMacro },
                { label: "클러치", value: stats.totalClutch },
              ].map((stat) => (
                <div key={stat.label} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', color: '#8B95B5', marginBottom: '4px' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '22px', fontWeight: 'bold' }}>
                    {stat.value}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 활성 시너지 */}
          <div style={{
            background: 'linear-gradient(to bottom right, rgba(0, 71, 171, 0.1) 0%, rgba(20, 27, 61, 0.5) 100%)',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid rgba(0, 71, 171, 0.3)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '20px', height: '20px', color: '#FFB81C' }} />
                <span style={{ fontSize: '24px', fontWeight: 'bold' }}>활성 시너지</span>
              </div>
              {synergies.filter(s => s.isActive).length > 0 && (
                <span style={{
                  background: '#FFB81C',
                  color: '#0B0F1A',
                  padding: '4px 12px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 'bold',
                }}>
                  {synergies.filter(s => s.isActive).length}개
                </span>
              )}
            </div>
            
            <div style={{
              maxHeight: '280px',
              overflowY: 'auto',
            }}>
              {synergies.filter(s => s.isActive).length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {synergies.filter(s => s.isActive).slice(0, 4).map((synergy) => (
                    <div 
                      key={synergy.synergy.synergy_id}
                      style={{
                        background: 'rgba(10, 14, 39, 0.5)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 184, 28, 0.3)',
                      }}
                    >
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '8px',
                      }}>
                        <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#FFB81C' }}>
                          {synergy.synergy.synergy_name}
                        </div>
                        {synergy.isPrime && (
                          <span style={{
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontSize: '10px',
                            fontWeight: 'bold',
                            background: '#C8102E',
                            color: 'white',
                          }}>
                            PRIME
                          </span>
                        )}
                        <span style={{
                          marginLeft: 'auto',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                          background: '#0A0E27',
                          color: '#9AA6C3',
                        }}>
                          {synergy.synergy.type}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '11px',
                        color: '#8B95B5',
                        marginBottom: '8px',
                      }}>
                        {synergy.synergy.description}
                      </div>
                      {synergy.currentEffect && (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: '4px',
                        }}>
                          <span style={{
                            background: '#0B0F1A',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            color: '#10B981',
                            fontSize: '11px',
                            fontWeight: 'bold',
                          }}>
                            OVR +{synergy.currentEffect.ovr}
                          </span>
                          {synergy.currentEffect.mec > 0 && (
                            <span style={{
                              background: '#0B0F1A',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#9AA6C3',
                              fontSize: '10px',
                            }}>
                              메카닉 +{synergy.currentEffect.mec}
                            </span>
                          )}
                          {synergy.currentEffect.lan > 0 && (
                            <span style={{
                              background: '#0B0F1A',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#9AA6C3',
                              fontSize: '10px',
                            }}>
                              라인 +{synergy.currentEffect.lan}
                            </span>
                          )}
                          {synergy.currentEffect.tf > 0 && (
                            <span style={{
                              background: '#0B0F1A',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#9AA6C3',
                              fontSize: '10px',
                            }}>
                              한타 +{synergy.currentEffect.tf}
                            </span>
                          )}
                          {synergy.currentEffect.mac > 0 && (
                            <span style={{
                              background: '#0B0F1A',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#9AA6C3',
                              fontSize: '10px',
                            }}>
                              운영 +{synergy.currentEffect.mac}
                            </span>
                          )}
                          {synergy.currentEffect.clu > 0 && (
                            <span style={{
                              background: '#0B0F1A',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              color: '#9AA6C3',
                              fontSize: '10px',
                            }}>
                              클러치 +{synergy.currentEffect.clu}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '60px 0',
                  color: '#8B95B5',
                  fontSize: '14px',
                }}>
                  시너지 없음<br />
                  <span style={{ fontSize: '12px' }}>같은 팀/연도로 구성하세요</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 워터마크 */}
        <div style={{
          textAlign: 'center',
          marginTop: '32px',
          fontSize: '14px',
          color: '#8B95B5',
        }}>
          LCK GACHA SQUAD BUILDER
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
