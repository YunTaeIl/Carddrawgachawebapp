// 스쿼드 공유 전용 캡처 컴포넌트

import React from "react";
import { UserCard, Position, POSITION_NAMES } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";
import { StaticCard } from "@/components/StaticCard";

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
          width: '1200px',
          background: 'linear-gradient(135deg, #0B0F1A 0%, #1A1F35 50%, #0B0F1A 100%)',
          fontFamily: 'Teko, system-ui, sans-serif',
          color: '#FFFFFF',
          padding: '40px',
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '56px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #2B6CFF 0%, #9333EA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px',
            letterSpacing: '2px',
          }}>
            내 LCK 스쿼드
          </div>
          <div style={{ fontSize: '20px', color: '#9AA6C3' }}>
            {deployedCards.length}/5 선수 • 평균 OVR <span style={{ color: '#FFB81C', fontWeight: 'bold' }}>{stats.avgOVR}</span>
          </div>
        </div>

        {/* 카드 5장 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '20px',
          marginBottom: '30px',
        }}>
          {positions.map((position) => {
            const card = squad[position];
            return (
              <div key={position} style={{ textAlign: 'center' }}>
                <div style={{
                  fontSize: '12px',
                  color: '#9AA6C3',
                  marginBottom: '4px',
                }}>
                  {POSITION_NAMES[position]}
                </div>
                <div style={{
                  fontSize: '22px',
                  fontWeight: 'bold',
                  color: '#2B6CFF',
                  marginBottom: '8px',
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
                    border: '2px dashed #2B6CFF',
                    background: '#12182A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9AA6C3',
                  }}>
                    빈 슬롯
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 스탯 & 시너지 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '24px',
        }}>
          {/* 스탯 */}
          <div style={{
            background: 'rgba(18, 24, 42, 0.8)',
            borderRadius: '12px',
            padding: '24px',
            border: '2px solid rgba(43, 108, 255, 0.3)',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              <div style={{
                width: '4px',
                height: '24px',
                background: '#FFB81C',
                borderRadius: '2px',
              }} />
              스쿼드 스탯
            </div>
            {[
              { label: "메카닉", value: stats.totalMechanics, color: "#10B981" },
              { label: "라이닝", value: stats.totalLaning, color: "#3B82F6" },
              { label: "한타", value: stats.totalTeamfight, color: "#8B5CF6" },
              { label: "마크로", value: stats.totalMacro, color: "#F59E0B" },
              { label: "클러치", value: stats.totalClutch, color: "#EF4444" },
            ].map((stat) => (
              <div key={stat.label} style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginBottom: '10px',
                fontSize: '16px',
              }}>
                <span style={{ color: '#9AA6C3' }}>{stat.label}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{
                    width: '100px',
                    height: '6px',
                    background: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: '3px',
                  }}>
                    <div style={{
                      width: `${Math.min((stat.value / 500) * 100, 100)}%`,
                      height: '100%',
                      background: stat.color,
                      borderRadius: '3px',
                    }} />
                  </div>
                  <span style={{ fontWeight: 'bold', minWidth: '40px', textAlign: 'right' }}>{stat.value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* 시너지 */}
          <div style={{
            background: 'rgba(18, 24, 42, 0.8)',
            borderRadius: '12px',
            padding: '24px',
            border: '2px solid rgba(147, 51, 234, 0.3)',
          }}>
            <div style={{
              fontSize: '24px',
              fontWeight: 'bold',
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '4px',
                  height: '24px',
                  background: '#9333EA',
                  borderRadius: '2px',
                }} />
                활성 시너지
              </div>
              <span style={{
                fontSize: '16px',
                color: '#9333EA',
                background: 'rgba(147, 51, 234, 0.2)',
                padding: '4px 10px',
                borderRadius: '6px',
              }}>
                {synergies.length}개
              </span>
            </div>
            <div style={{
              maxHeight: '180px',
              overflowY: 'auto',
            }}>
              {synergies.length === 0 ? (
                <div style={{ color: '#9AA6C3', fontSize: '14px', textAlign: 'center', paddingTop: '30px' }}>
                  활성화된 시너지 없음
                </div>
              ) : (
                synergies.slice(0, 4).map((syn) => (
                  <div key={syn.synergy.synergy_id} style={{
                    background: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '8px',
                    padding: '10px',
                    marginBottom: '8px',
                    fontSize: '13px',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {syn.synergy.name}
                      {syn.isPrime && (
                        <span style={{
                          background: '#FFB81C',
                          color: '#0B0F1A',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: 'bold',
                        }}>
                          PRIME
                        </span>
                      )}
                    </div>
                    {syn.currentEffect && (
                      <div style={{ color: '#9AA6C3', fontSize: '11px' }}>
                        {Object.entries({
                          OVR: syn.currentEffect.ovr,
                          메카닉: syn.currentEffect.mec,
                          라이닝: syn.currentEffect.lan,
                          한타: syn.currentEffect.tf,
                          마크로: syn.currentEffect.mac,
                          클러치: syn.currentEffect.clu,
                        })
                          .filter(([_, v]) => v > 0)
                          .map(([k, v]) => `${k} +${v}`)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 워터마크 */}
        <div style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '13px',
          color: '#9AA6C3',
        }}>
          LCK 가챠 스쿼드 빌더
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
