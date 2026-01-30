// 캡처 전용 카드 (transform 없음, 단순 렌더링만)

import React from "react";
import { LCKCard, GRADE_COLORS, calculateEnhancedOVR } from "@/types/lck";

interface CaptureCardProps {
  card: LCKCard;
  upgradeLevel?: number;
}

export function CaptureCard({ card, upgradeLevel = 0 }: CaptureCardProps) {
  const gradeColor = GRADE_COLORS[card.grade];
  const displayOVR = calculateEnhancedOVR(card.stats, upgradeLevel, card.grade, card.position);

  return (
    <div 
      style={{
        width: '160px',
        height: '240px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #0A0E27 100%)',
        border: `2px solid ${gradeColor}`,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: 'Teko, system-ui, sans-serif',
      }}
    >
      {/* 헤더 */}
      <div style={{
        position: 'absolute',
        top: '8px',
        left: '8px',
        right: '8px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        zIndex: 10,
      }}>
        {/* 좌측: 연도 + 포지션 */}
        <div>
          <div style={{ fontSize: '10px', color: '#9AA6C3' }}>{card.year}</div>
          <div style={{
            fontSize: '10px',
            fontWeight: 'bold',
            padding: '2px 6px',
            borderRadius: '4px',
            backgroundColor: gradeColor,
            color: '#0A0E27',
            marginTop: '2px',
          }}>
            {card.position}
          </div>
        </div>

        {/* 우측: 등급 */}
        <div style={{
          fontSize: '16px',
          fontWeight: 'bold',
          padding: '4px 10px',
          borderRadius: '8px',
          backgroundColor: gradeColor,
          color: '#0A0E27',
        }}>
          {card.grade}
        </div>
      </div>

      {/* 하단 정보 */}
      <div style={{
        position: 'absolute',
        bottom: '0',
        left: '0',
        right: '0',
        padding: '8px',
        background: 'linear-gradient(to top, rgba(10, 14, 39, 0.95), transparent)',
      }}>
        {/* 팀 이름 */}
        <div style={{ fontSize: '10px', color: '#9AA6C3', marginBottom: '4px' }}>
          {card.team}
        </div>

        {/* 선수명 */}
        <div style={{
          fontSize: '14px',
          fontWeight: 'bold',
          color: '#EAF0FF',
          marginBottom: '4px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {card.name}
        </div>

        {/* OVR */}
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', color: '#9AA6C3' }}>OVR</span>
          <span style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: gradeColor,
          }}>
            {displayOVR}
          </span>
          {upgradeLevel > 0 && (
            <span style={{ fontSize: '10px', color: '#D4AF37' }}>+{upgradeLevel}</span>
          )}
        </div>

        {/* 스탯 바 */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '2px',
        }}>
          {[
            { value: card.stats.mechanics, color: "#10B981" },
            { value: card.stats.laning, color: "#3B82F6" },
            { value: card.stats.teamfight, color: "#8B5CF6" },
            { value: card.stats.macro, color: "#F59E0B" },
            { value: card.stats.clutch, color: "#EF4444" },
          ].map((stat, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
              <div style={{
                width: '100%',
                height: '4px',
                borderRadius: '2px',
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{
                  width: `${(stat.value / 99) * 100}%`,
                  height: '100%',
                  borderRadius: '2px',
                  backgroundColor: stat.color,
                }} />
              </div>
              <span style={{
                fontSize: '8px',
                color: '#9AA6C3',
              }}>
                {stat.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
