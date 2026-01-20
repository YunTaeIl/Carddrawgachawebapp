// 스쿼드 공유용 캡처 카드

import React from "react";
import { UserCard, Position, POSITION_NAMES } from "@/types/lck";
import { ActiveSynergy } from "@/types/synergy";
import { TrendingUp, Award } from "lucide-react";

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
    
    const containerStyle: React.CSSProperties = {
      width: '1200px',
      padding: '48px',
      background: 'linear-gradient(135deg, #0B0F1A 0%, #12182A 50%, #0B0F1A 100%)',
      fontFamily: 'Teko, system-ui, sans-serif',
      color: '#FFFFFF'
    };

    const headerStyle: React.CSSProperties = {
      textAlign: 'center',
      marginBottom: '32px'
    };

    const titleStyle: React.CSSProperties = {
      fontSize: '48px',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: '#FFFFFF'
    };

    const subtitleStyle: React.CSSProperties = {
      fontSize: '20px',
      color: '#9AA6C3'
    };

    const cardsContainerStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'center',
      gap: '24px',
      marginBottom: '32px'
    };

    const cardSlotStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '12px'
    };

    const positionLabelStyle: React.CSSProperties = {
      textAlign: 'center'
    };

    const positionNameStyle: React.CSSProperties = {
      fontSize: '14px',
      color: '#9AA6C3'
    };

    const positionCodeStyle: React.CSSProperties = {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2B6CFF'
    };

    const cardBoxStyle: React.CSSProperties = {
      width: '160px',
      height: '240px',
      borderRadius: '12px',
      background: 'rgba(18, 24, 42, 0.8)',
      border: '2px solid rgba(43, 108, 255, 0.5)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      gap: '8px'
    };

    const emptySlotStyle: React.CSSProperties = {
      ...cardBoxStyle,
      border: '2px dashed rgba(43, 108, 255, 0.3)',
      background: 'rgba(18, 24, 42, 0.5)'
    };

    const cardInfoStyle: React.CSSProperties = {
      textAlign: 'center',
      width: '100%'
    };

    const gradeStyle = (grade: string): React.CSSProperties => ({
      fontSize: '32px',
      fontWeight: 'bold',
      color: grade === 'S' ? '#FFB81C' : grade === 'A' ? '#C084FC' : '#60A5FA',
      marginBottom: '8px'
    });

    const playerNameStyle: React.CSSProperties = {
      fontSize: '16px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '4px',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap'
    };

    const teamNameStyle: React.CSSProperties = {
      fontSize: '12px',
      color: '#9AA6C3',
      marginBottom: '8px'
    };

    const ovrStyle: React.CSSProperties = {
      fontSize: '20px',
      fontWeight: 'bold',
      color: '#FFB81C'
    };

    const gridStyle: React.CSSProperties = {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '24px'
    };

    const panelStyle: React.CSSProperties = {
      borderRadius: '12px',
      padding: '24px',
      background: 'rgba(18, 24, 42, 0.8)',
      border: '1px solid rgba(43, 108, 255, 0.3)'
    };

    const synergyPanelStyle: React.CSSProperties = {
      ...panelStyle,
      border: '1px solid rgba(147, 51, 234, 0.3)'
    };

    const panelHeaderStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '16px'
    };

    const panelTitleStyle: React.CSSProperties = {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#FFFFFF'
    };

    const statRowStyle: React.CSSProperties = {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '8px'
    };

    const statLabelStyle: React.CSSProperties = {
      fontSize: '16px',
      color: '#9AA6C3'
    };

    const statValueContainerStyle: React.CSSProperties = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    };

    const statBarStyle = (value: number, color: string): React.CSSProperties => ({
      width: `${Math.min(value / 5, 100)}px`,
      height: '8px',
      borderRadius: '4px',
      backgroundColor: color
    });

    const statValueStyle: React.CSSProperties = {
      fontSize: '18px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      width: '48px',
      textAlign: 'right'
    };

    const synergyListStyle: React.CSSProperties = {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxHeight: '200px',
      overflowY: 'auto'
    };

    const synergyItemStyle: React.CSSProperties = {
      borderRadius: '8px',
      padding: '12px',
      background: 'rgba(147, 51, 234, 0.1)',
      border: '1px solid rgba(147, 51, 234, 0.3)'
    };

    const synergyNameStyle: React.CSSProperties = {
      fontSize: '14px',
      fontWeight: 'bold',
      color: '#FFFFFF',
      marginBottom: '4px'
    };

    const synergyEffectStyle: React.CSSProperties = {
      fontSize: '12px',
      color: '#9AA6C3'
    };

    const watermarkStyle: React.CSSProperties = {
      textAlign: 'center',
      marginTop: '32px',
      fontSize: '14px',
      color: '#9AA6C3'
    };

    return (
      <div ref={ref} style={containerStyle}>
        {/* 헤더 */}
        <div style={headerStyle}>
          <div style={titleStyle}>MY LCK SQUAD</div>
          <div style={subtitleStyle}>
            {deployedCards.length}/5 선수 배치 • AVG OVR {stats.avgOVR}
          </div>
        </div>

        {/* 선수 카드 5장 */}
        <div style={cardsContainerStyle}>
          {positions.map((position) => {
            const card = squad[position];
            return (
              <div key={position} style={cardSlotStyle}>
                <div style={positionLabelStyle}>
                  <div style={positionNameStyle}>{POSITION_NAMES[position]}</div>
                  <div style={positionCodeStyle}>{position}</div>
                </div>
                {card ? (
                  <div style={cardBoxStyle}>
                    <div style={cardInfoStyle}>
                      <div style={gradeStyle(card.grade)}>{card.grade}</div>
                      <div style={playerNameStyle}>{card.name}</div>
                      <div style={teamNameStyle}>{card.team}</div>
                      <div style={teamNameStyle}>{card.year}</div>
                      <div style={ovrStyle}>OVR {card.stats.ovr + card.upgradeLevel}</div>
                    </div>
                  </div>
                ) : (
                  <div style={emptySlotStyle}>
                    <div style={{ fontSize: '14px', color: '#9AA6C3' }}>Empty</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 하단: 스탯 & 시너지 */}
        <div style={gridStyle}>
          {/* 스쿼드 스탯 */}
          <div style={panelStyle}>
            <div style={panelHeaderStyle}>
              <TrendingUp style={{ width: '20px', height: '20px', color: '#FFB81C' }} />
              <div style={panelTitleStyle}>스쿼드 스탯</div>
            </div>
            <div>
              {[
                { label: "메카닉", value: stats.totalMechanics, color: "#10B981" },
                { label: "라이닝", value: stats.totalLaning, color: "#3B82F6" },
                { label: "한타", value: stats.totalTeamfight, color: "#8B5CF6" },
                { label: "마크로", value: stats.totalMacro, color: "#F59E0B" },
                { label: "클러치", value: stats.totalClutch, color: "#EF4444" },
              ].map((stat) => (
                <div key={stat.label} style={statRowStyle}>
                  <div style={statLabelStyle}>{stat.label}</div>
                  <div style={statValueContainerStyle}>
                    <div style={statBarStyle(stat.value, stat.color)} />
                    <div style={statValueStyle}>{stat.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 활성 시너지 */}
          <div style={synergyPanelStyle}>
            <div style={panelHeaderStyle}>
              <Award style={{ width: '20px', height: '20px', color: '#9333EA' }} />
              <div style={panelTitleStyle}>활성 시너지</div>
              <div style={{ marginLeft: 'auto', fontSize: '14px', fontWeight: 'bold', color: '#9333EA' }}>
                {synergies.length}개
              </div>
            </div>
            <div style={synergyListStyle}>
              {synergies.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px 0', fontSize: '14px', color: '#9AA6C3' }}>
                  시너지 없음
                </div>
              ) : (
                synergies.map((activeSynergy) => (
                  <div key={activeSynergy.synergy.synergy_id} style={synergyItemStyle}>
                    <div style={synergyNameStyle}>
                      {activeSynergy.synergy.name}
                      {activeSynergy.isPrime && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: '#FFB81C',
                          color: '#0B0F1A',
                          fontWeight: 'bold'
                        }}>
                          PRIME
                        </span>
                      )}
                    </div>
                    {activeSynergy.currentEffect && (
                      <div style={synergyEffectStyle}>
                        {Object.entries({
                          OVR: activeSynergy.currentEffect.ovr,
                          메카닉: activeSynergy.currentEffect.mec,
                          라이닝: activeSynergy.currentEffect.lan,
                          한타: activeSynergy.currentEffect.tf,
                          마크로: activeSynergy.currentEffect.mac,
                          클러치: activeSynergy.currentEffect.clu,
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
        <div style={watermarkStyle}>
          LCK Gacha Squad Builder • lck-gacha.figma.app
        </div>
      </div>
    );
  }
);

SquadShareCard.displayName = "SquadShareCard";