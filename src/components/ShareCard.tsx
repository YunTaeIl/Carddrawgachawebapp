// 스쿼드 공유 전용 캡처 컴포넌트

import React from "react";
import { UserCard, Position, POSITION_NAMES, GRADE_COLORS } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";

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
          background: '#0B0F1A',
          fontFamily: 'system-ui, sans-serif',
          color: '#FFFFFF',
          padding: '40px',
        }}
      >
        {/* 헤더 */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <div style={{
            fontSize: '48px',
            fontWeight: 'bold',
            color: '#2B6CFF',
            marginBottom: '8px',
          }}>
            MY LCK SQUAD
          </div>
          <div style={{ fontSize: '20px', color: '#9AA6C3' }}>
            {deployedCards.length}/5 Players • AVG OVR <span style={{ color: '#FFB81C', fontWeight: 'bold' }}>{stats.avgOVR}</span>
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
                  fontSize: '20px',
                  fontWeight: 'bold',
                  color: '#2B6CFF',
                  marginBottom: '8px',
                }}>
                  {position}
                </div>
                
                {card ? (
                  <div style={{
                    width: '150px',
                    height: '220px',
                    borderRadius: '12px',
                    background: '#141B3D',
                    border: `2px solid ${GRADE_COLORS[card.grade]}`,
                    padding: '12px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}>
                    {/* 등급 */}
                    <div style={{
                      fontSize: '16px',
                      fontWeight: 'bold',
                      color: GRADE_COLORS[card.grade],
                      textAlign: 'right',
                    }}>
                      {card.grade}
                    </div>
                    
                    {/* 선수 정보 */}
                    <div>
                      <div style={{
                        fontSize: '10px',
                        color: '#9AA6C3',
                        marginBottom: '2px',
                      }}>
                        {card.team}
                      </div>
                      <div style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#FFFFFF',
                        marginBottom: '8px',
                      }}>
                        {card.name}
                      </div>
                      <div style={{
                        fontSize: '24px',
                        fontWeight: 'bold',
                        color: GRADE_COLORS[card.grade],
                      }}>
                        {card.stats.ovr + card.upgradeLevel}
                      </div>
                      <div style={{
                        fontSize: '10px',
                        color: '#9AA6C3',
                      }}>
                        OVR
                      </div>
                      
                      {/* 스탯 */}
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4px',
                        marginTop: '8px',
                        fontSize: '10px',
                        color: '#9AA6C3',
                      }}>
                        <div>MEC {card.stats.mechanics}</div>
                        <div>LAN {card.stats.laning}</div>
                        <div>TF {card.stats.teamfight}</div>
                        <div>MAC {card.stats.macro}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{
                    width: '150px',
                    height: '220px',
                    borderRadius: '12px',
                    border: '2px dashed #2B6CFF',
                    background: '#12182A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9AA6C3',
                  }}>
                    Empty
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
          gap: '20px',
        }}>
          {/* 스탯 */}
          <div style={{
            background: '#12182A',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #2B6CFF',
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}>
              STATS
            </div>
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
                marginBottom: '8px',
                fontSize: '14px',
              }}>
                <span style={{ color: '#9AA6C3' }}>{stat.label}</span>
                <span style={{ fontWeight: 'bold' }}>{stat.value}</span>
              </div>
            ))}
          </div>

          {/* 시너지 */}
          <div style={{
            background: '#12182A',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid #9333EA',
          }}>
            <div style={{
              fontSize: '20px',
              fontWeight: 'bold',
              marginBottom: '16px',
            }}>
              SYNERGIES ({synergies.length})
            </div>
            <div style={{
              maxHeight: '140px',
              overflowY: 'auto',
            }}>
              {synergies.length === 0 ? (
                <div style={{ color: '#9AA6C3', fontSize: '14px' }}>No synergies</div>
              ) : (
                synergies.slice(0, 5).map((syn) => (
                  <div key={syn.synergy.synergy_id} style={{
                    background: 'rgba(147, 51, 234, 0.1)',
                    borderRadius: '6px',
                    padding: '8px',
                    marginBottom: '6px',
                    fontSize: '12px',
                  }}>
                    <div style={{ fontWeight: 'bold', marginBottom: '2px' }}>
                      {syn.synergy.name}
                      {syn.isPrime && (
                        <span style={{
                          marginLeft: '6px',
                          background: '#FFB81C',
                          color: '#0B0F1A',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontSize: '10px',
                        }}>
                          PRIME
                        </span>
                      )}
                    </div>
                    {syn.currentEffect && (
                      <div style={{ color: '#9AA6C3', fontSize: '10px' }}>
                        {Object.entries({
                          OVR: syn.currentEffect.ovr,
                          MEC: syn.currentEffect.mec,
                          LAN: syn.currentEffect.lan,
                          TF: syn.currentEffect.tf,
                          MAC: syn.currentEffect.mac,
                          CLU: syn.currentEffect.clu,
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
          marginTop: '20px',
          fontSize: '12px',
          color: '#9AA6C3',
        }}>
          LCK Gacha Squad Builder
        </div>
      </div>
    );
  }
);

ShareCard.displayName = "ShareCard";
