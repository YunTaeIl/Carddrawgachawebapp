// 스쿼드 공유용 캡처 카드 (완전 새 디자인)

import React from "react";
import { UserCard, Position, POSITION_NAMES } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";
import { CaptureCard } from "@/components/CaptureCard";

interface SquadShareCardProps {
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

export const SquadShareCard = React.forwardRef<HTMLDivElement, SquadShareCardProps>(
  ({ squad, synergies, stats }, ref) => {
    const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
    const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);

    return (
      <div 
        ref={ref} 
        style={{
          width: '1400px',
          background: 'linear-gradient(135deg, #0B0F1A 0%, #1A1F35 50%, #0B0F1A 100%)',
          fontFamily: 'Teko, system-ui, sans-serif',
          color: '#FFFFFF',
          padding: '60px',
          position: 'relative',
        }}
      >
        {/* 배경 패턴 */}
        <div style={{
          position: 'absolute',
          inset: '0',
          opacity: '0.03',
          backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 20px, #2B6CFF 20px, #2B6CFF 21px)`,
        }} />

        {/* 헤더 */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px',
          position: 'relative',
          zIndex: 1,
        }}>
          <div style={{
            fontSize: '64px',
            fontWeight: 'bold',
            background: 'linear-gradient(90deg, #2B6CFF 0%, #9333EA 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '12px',
            letterSpacing: '2px',
          }}>
            MY LCK SQUAD
          </div>
          <div style={{
            fontSize: '24px',
            color: '#9AA6C3',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}>
            <span>{deployedCards.length}/5 Players</span>
            <span style={{ color: '#2B6CFF' }}>•</span>
            <span style={{ 
              color: '#D4AF37',
              fontWeight: 'bold',
              fontSize: '28px',
            }}>
              AVG {stats.avgOVR}
            </span>
          </div>
        </div>

        {/* 메인 카드 그리드 */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '28px',
          marginBottom: '48px',
          position: 'relative',
          zIndex: 1,
        }}>
          {positions.map((position) => {
            const card = squad[position];
            return (
              <div 
                key={position} 
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                {/* 포지션 뱃지 */}
                <div style={{
                  background: 'linear-gradient(135deg, #2B6CFF 0%, #1E4FCC 100%)',
                  borderRadius: '12px',
                  padding: '8px 20px',
                  boxShadow: '0 4px 12px rgba(43, 108, 255, 0.3)',
                }}>
                  <div style={{
                    fontSize: '12px',
                    color: '#9AA6C3',
                    textAlign: 'center',
                  }}>
                    {POSITION_NAMES[position]}
                  </div>
                  <div style={{
                    fontSize: '28px',
                    fontWeight: 'bold',
                    color: '#FFFFFF',
                    textAlign: 'center',
                    lineHeight: '1',
                  }}>
                    {position}
                  </div>
                </div>

                {/* 카드 */}
                {card ? (
                  <CaptureCard 
                    card={card} 
                    upgradeLevel={card.upgradeLevel}
                  />
                ) : (
                  <div style={{
                    width: '160px',
                    height: '240px',
                    borderRadius: '12px',
                    border: '3px dashed rgba(43, 108, 255, 0.3)',
                    background: 'rgba(18, 24, 42, 0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '16px',
                    color: '#9AA6C3',
                  }}>
                    EMPTY
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단 스탯 & 시너지 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '32px',
          position: 'relative',
          zIndex: 1,
        }}>
          {/* 스쿼드 스탯 */}
          <div style={{
            background: 'rgba(18, 24, 42, 0.8)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(43, 108, 255, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}>
              <div style={{
                width: '6px',
                height: '28px',
                background: 'linear-gradient(180deg, #FFB81C 0%, #FF6B00 100%)',
                borderRadius: '3px',
              }} />
              SQUAD STATS
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: "Mechanics", value: stats.totalMechanics, color: "#10B981" },
                { label: "Laning", value: stats.totalLaning, color: "#3B82F6" },
                { label: "Teamfight", value: stats.totalTeamfight, color: "#8B5CF6" },
                { label: "Macro", value: stats.totalMacro, color: "#F59E0B" },
                { label: "Clutch", value: stats.totalClutch, color: "#EF4444" },
              ].map((stat) => (
                <div key={stat.label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: '18px', color: '#9AA6C3' }}>{stat.label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '120px',
                      height: '8px',
                      background: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: '4px',
                      overflow: 'hidden',
                    }}>
                      <div style={{
                        width: `${Math.min((stat.value / 500) * 100, 100)}%`,
                        height: '100%',
                        background: stat.color,
                        borderRadius: '4px',
                      }} />
                    </div>
                    <span style={{
                      fontSize: '22px',
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      minWidth: '50px',
                      textAlign: 'right',
                    }}>
                      {stat.value}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 활성 시너지 */}
          <div style={{
            background: 'rgba(18, 24, 42, 0.8)',
            borderRadius: '16px',
            padding: '28px',
            border: '2px solid rgba(147, 51, 234, 0.3)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
          }}>
            <div style={{
              fontSize: '28px',
              fontWeight: 'bold',
              color: '#FFFFFF',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '6px',
                  height: '28px',
                  background: 'linear-gradient(180deg, #9333EA 0%, #6B21A8 100%)',
                  borderRadius: '3px',
                }} />
                SYNERGIES
              </div>
              <span style={{
                fontSize: '18px',
                color: '#9333EA',
                background: 'rgba(147, 51, 234, 0.2)',
                padding: '4px 12px',
                borderRadius: '8px',
              }}>
                {synergies.length}
              </span>
            </div>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              maxHeight: '220px',
              overflowY: 'auto',
            }}>
              {synergies.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 0',
                  fontSize: '16px',
                  color: '#9AA6C3',
                }}>
                  No active synergies
                </div>
              ) : (
                synergies.map((activeSynergy) => (
                  <div 
                    key={activeSynergy.synergy.synergy_id} 
                    style={{
                      background: 'rgba(147, 51, 234, 0.1)',
                      borderRadius: '10px',
                      padding: '14px',
                      border: '1px solid rgba(147, 51, 234, 0.3)',
                    }}
                  >
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: '#FFFFFF',
                      marginBottom: '6px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}>
                      {activeSynergy.synergy.name}
                      {activeSynergy.isPrime && (
                        <span style={{
                          fontSize: '11px',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#FFB81C',
                          color: '#0B0F1A',
                          fontWeight: 'bold',
                        }}>
                          PRIME
                        </span>
                      )}
                    </div>
                    {activeSynergy.currentEffect && (
                      <div style={{
                        fontSize: '13px',
                        color: '#9AA6C3',
                      }}>
                        {Object.entries({
                          OVR: activeSynergy.currentEffect.ovr,
                          MEC: activeSynergy.currentEffect.mec,
                          LAN: activeSynergy.currentEffect.lan,
                          TF: activeSynergy.currentEffect.tf,
                          MAC: activeSynergy.currentEffect.mac,
                          CLU: activeSynergy.currentEffect.clu,
                        })
                          .filter(([_, value]) => value > 0)
                          .map(([key, value]) => `${key} +${value}`)
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
          marginTop: '40px',
          fontSize: '16px',
          color: '#9AA6C3',
          position: 'relative',
          zIndex: 1,
        }}>
          LCK Gacha Squad Builder • figma.com/community
        </div>
      </div>
    );
  }
);

SquadShareCard.displayName = "SquadShareCard";
