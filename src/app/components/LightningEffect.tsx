// ⚡ 번개 효과 컴포넌트 (드래곤볼 슈퍼사이어인 스타일)

import React, { useMemo } from "react";

interface LightningEffectProps {
  upgradeLevel: number;
  isActive: boolean;
}

export function LightningEffect({ upgradeLevel, isActive }: LightningEffectProps) {
  if (!isActive) return null;

  // 레벨에 따른 번개 설정 (5단계 세분화)
  const config = useMemo(() => {
    if (upgradeLevel < 3) {
      // +0~2: 매우 약한 연한 파란색 번개
      return {
        count: 2,
        color: "#60A5FA", // 연한 파란색
        glowColor: "#93C5FD",
        opacity: 0.5,
        speed: 1.8,
        thickness: 1.5,
        intensity: "약함",
      };
    } else if (upgradeLevel < 6) {
      // +3~5: 약한 진한 파란색 번개
      return {
        count: 4,
        color: "#3B82F6", // 진한 파란색
        glowColor: "#60A5FA",
        opacity: 0.65,
        speed: 1.4,
        thickness: 2,
        intensity: "보통",
      };
    } else if (upgradeLevel < 9) {
      // +6~8: 중간 청록/시안 번개
      return {
        count: 6,
        color: "#06B6D4", // 청록색
        glowColor: "#22D3EE",
        opacity: 0.75,
        speed: 1.1,
        thickness: 2.5,
        intensity: "중간",
      };
    } else if (upgradeLevel < 12) {
      // +9~11: 강한 보라색 번개
      return {
        count: 9,
        color: "#A855F7", // 보라색
        glowColor: "#C084FC",
        opacity: 0.85,
        speed: 0.9,
        thickness: 3,
        intensity: "강함",
      };
    } else if (upgradeLevel < 15) {
      // +12~14: 매우 강한 분홍/마젠타 번개
      return {
        count: 12,
        color: "#EC4899", // 분홍색
        glowColor: "#F472B6",
        opacity: 0.9,
        speed: 0.7,
        thickness: 3.5,
        intensity: "매우강함",
      };
    } else {
      // +15: 최대 강화 금색 + 무지개 효과
      return {
        count: 15,
        color: "#FFD700", // 금색
        glowColor: "#FFA500",
        opacity: 1.0,
        speed: 0.5,
        thickness: 4,
        intensity: "MAX",
      };
    }
  }, [upgradeLevel]);

  // 랜덤 번개 경로 생성
  const lightningBolts = useMemo(() => {
    const bolts = [];
    for (let i = 0; i < config.count; i++) {
      const startX = Math.random() * 100;
      const segments = 8 + Math.floor(Math.random() * 4);
      const delay = Math.random() * config.speed;
      
      bolts.push({
        id: i,
        startX,
        segments,
        delay,
      });
    }
    return bolts;
  }, [config.count, config.speed, upgradeLevel]); // upgradeLevel 추가로 강화 시마다 새로운 번개

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* 전체 발광 효과 */}
      <div
        className="absolute inset-0"
        style={{
          background: upgradeLevel >= 15 
            ? `radial-gradient(circle at 50% 50%, #FFD70040, #FF69B440, #00BFFF40, transparent 70%)`
            : `radial-gradient(circle at 50% 50%, ${config.color}20, transparent 70%)`,
          animation: `lightning-pulse ${config.speed}s ease-in-out infinite`,
        }}
      />

      {/* +15 최대 강화 특별 무지개 오라 */}
      {upgradeLevel >= 15 && (
        <div
          className="absolute inset-0"
          style={{
            background: `conic-gradient(
              from 0deg,
              #FF0000,
              #FF7F00,
              #FFFF00,
              #00FF00,
              #0000FF,
              #4B0082,
              #9400D3,
              #FF0000
            )`,
            opacity: 0.2,
            animation: `rainbow-spin ${config.speed * 2}s linear infinite`,
            filter: 'blur(30px)',
          }}
        />
      )}

      {/* 번개 SVG들 */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
        <defs>
          {/* 번개 Glow 필터 */}
          <filter id={`lightning-glow-${upgradeLevel}`}>
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {lightningBolts.map((bolt) => {
          // 번개 경로 생성
          let path = `M ${bolt.startX} 0`;
          let currentX = bolt.startX;
          let currentY = 0;

          for (let j = 0; j < bolt.segments; j++) {
            const nextY = currentY + (100 / bolt.segments);
            const nextX = currentX + (Math.random() - 0.5) * 20;
            path += ` L ${nextX} ${nextY}`;
            currentX = nextX;
            currentY = nextY;
          }

          // +15 최대 강화일 때 무지개 색상 랜덤 적용
          const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];
          const boltColor = upgradeLevel >= 15 ? rainbowColors[bolt.id % rainbowColors.length] : config.color;
          const boltGlow = upgradeLevel >= 15 ? '#FFD700' : config.glowColor;

          return (
            <g key={bolt.id}>
              {/* 메인 번개 */}
              <path
                d={path}
                stroke={boltColor}
                strokeWidth={config.thickness}
                fill="none"
                opacity={config.opacity}
                filter={`url(#lightning-glow-${upgradeLevel})`}
                style={{
                  animation: `lightning-strike ${config.speed}s ease-in-out infinite`,
                  animationDelay: `${bolt.delay}s`,
                }}
              />
              
              {/* 외곽 Glow */}
              <path
                d={path}
                stroke={boltGlow}
                strokeWidth={config.thickness + 2}
                fill="none"
                opacity={config.opacity * 0.4}
                style={{
                  animation: `lightning-strike ${config.speed}s ease-in-out infinite`,
                  animationDelay: `${bolt.delay}s`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* 전기 파티클 효과 */}
      <div className="absolute inset-0">
        {[...Array(config.count * 2)].map((_, i) => (
          <div
            key={`particle-${i}`}
            className="absolute w-1 h-1 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: config.color,
              boxShadow: `0 0 ${4 + upgradeLevel / 2}px ${config.glowColor}`,
              animation: `spark ${0.3 + Math.random() * 0.5}s ease-in-out infinite`,
              animationDelay: `${Math.random() * config.speed}s`,
            }}
          />
        ))}
      </div>

      {/* 치지직 거리는 테두리 */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: `inset 0 0 ${10 + upgradeLevel}px ${config.color}, 0 0 ${
            20 + upgradeLevel * 2
          }px ${config.glowColor}`,
          animation: `electric-border ${config.speed * 0.5}s ease-in-out infinite`,
        }}
      />

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes lightning-strike {
            0%, 100% { opacity: 0; }
            10% { opacity: ${config.opacity}; }
            20% { opacity: 0; }
            30% { opacity: ${config.opacity * 0.8}; }
            40%, 90% { opacity: 0; }
            95% { opacity: ${config.opacity}; }
          }

          @keyframes lightning-pulse {
            0%, 100% { opacity: 0.3; }
            50% { opacity: 0.7; }
          }

          @keyframes spark {
            0%, 100% { 
              opacity: 0; 
              transform: scale(0.5);
            }
            50% { 
              opacity: 1; 
              transform: scale(1.5);
            }
          }

          @keyframes electric-border {
            0%, 100% { opacity: 0.5; }
            25% { opacity: 1; }
            50% { opacity: 0.3; }
            75% { opacity: 0.8; }
          }

          @keyframes rainbow-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}
