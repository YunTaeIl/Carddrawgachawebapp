// ⚡ 카드 주변 전기 효과 컴포넌트 (드래곤볼 슈퍼사이어인 스타일)

import React, { useMemo } from "react";

interface LightningEffectProps {
  upgradeLevel: number;
  isActive: boolean;
}

export function LightningEffect({ upgradeLevel, isActive }: LightningEffectProps) {
  if (!isActive) return null;

  // 레벨에 따른 전기 설정 (5단계 세분화)
  const config = useMemo(() => {
    if (upgradeLevel < 3) {
      // +0~2: 매우 약한 연한 파란색 전기
      return {
        sparkCount: 8,
        arcCount: 3,
        color: "#60A5FA",
        glowColor: "#93C5FD",
        opacity: 0.5,
        speed: 1.8,
        intensity: 0.3,
      };
    } else if (upgradeLevel < 6) {
      // +3~5: 약한 진한 파란색 전기
      return {
        sparkCount: 12,
        arcCount: 5,
        color: "#3B82F6",
        glowColor: "#60A5FA",
        opacity: 0.65,
        speed: 1.4,
        intensity: 0.5,
      };
    } else if (upgradeLevel < 9) {
      // +6~8: 중간 청록/시안 전기
      return {
        sparkCount: 16,
        arcCount: 7,
        color: "#06B6D4",
        glowColor: "#22D3EE",
        opacity: 0.75,
        speed: 1.1,
        intensity: 0.7,
      };
    } else if (upgradeLevel < 12) {
      // +9~11: 강한 보라색 전기
      return {
        sparkCount: 20,
        arcCount: 10,
        color: "#A855F7",
        glowColor: "#C084FC",
        opacity: 0.85,
        speed: 0.9,
        intensity: 0.85,
      };
    } else if (upgradeLevel < 15) {
      // +12~14: 매우 강한 분홍/마젠타 전기
      return {
        sparkCount: 25,
        arcCount: 13,
        color: "#EC4899",
        glowColor: "#F472B6",
        opacity: 0.9,
        speed: 0.7,
        intensity: 0.95,
      };
    } else {
      // +15: 최대 강화 금색 + 무지개 효과
      return {
        sparkCount: 30,
        arcCount: 18,
        color: "#FFD700",
        glowColor: "#FFA500",
        opacity: 1.0,
        speed: 0.5,
        intensity: 1.0,
      };
    }
  }, [upgradeLevel]);

  // 카드 테두리를 따라 흐르는 전기 아크 생성
  const electricArcs = useMemo(() => {
    const arcs = [];
    for (let i = 0; i < config.arcCount; i++) {
      // 카드 테두리 위치 (상하좌우)
      const side = i % 4;
      let startX, startY, endX, endY;
      
      switch(side) {
        case 0: // 상단
          startX = Math.random() * 100;
          startY = 0;
          endX = startX + (Math.random() - 0.5) * 30;
          endY = 15 + Math.random() * 10;
          break;
        case 1: // 우측
          startX = 100;
          startY = Math.random() * 100;
          endX = 85 + Math.random() * 10;
          endY = startY + (Math.random() - 0.5) * 30;
          break;
        case 2: // 하단
          startX = Math.random() * 100;
          startY = 100;
          endX = startX + (Math.random() - 0.5) * 30;
          endY = 85 + Math.random() * 10;
          break;
        default: // 좌측
          startX = 0;
          startY = Math.random() * 100;
          endX = 15 + Math.random() * 10;
          endY = startY + (Math.random() - 0.5) * 30;
      }
      
      arcs.push({
        id: i,
        startX,
        startY,
        endX,
        endY,
        delay: Math.random() * config.speed,
      });
    }
    return arcs;
  }, [config.arcCount, config.speed, upgradeLevel]);

  // 스파크 위치 생성 (카드 테두리 근처)
  const sparks = useMemo(() => {
    const sparkPositions = [];
    for (let i = 0; i < config.sparkCount; i++) {
      const edge = Math.random();
      let x, y;
      
      if (edge < 0.25) {
        x = Math.random() * 100;
        y = Math.random() * 10; // 상단
      } else if (edge < 0.5) {
        x = 90 + Math.random() * 10;
        y = Math.random() * 100; // 우측
      } else if (edge < 0.75) {
        x = Math.random() * 100;
        y = 90 + Math.random() * 10; // 하단
      } else {
        x = Math.random() * 10;
        y = Math.random() * 100; // 좌측
      }
      
      sparkPositions.push({
        id: i,
        x,
        y,
        delay: Math.random() * config.speed,
        size: 1 + Math.random() * 2,
      });
    }
    return sparkPositions;
  }, [config.sparkCount, config.speed, upgradeLevel]);

  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* 전체 전기 오라 */}
      <div
        className="absolute inset-0"
        style={{
          background: upgradeLevel >= 15 
            ? `radial-gradient(ellipse at center, #FFD70030, #FF69B430, #00BFFF30, transparent 60%)`
            : `radial-gradient(ellipse at center, ${config.color}30, transparent 60%)`,
          animation: `electric-pulse ${config.speed}s ease-in-out infinite`,
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
            opacity: 0.15,
            animation: `rainbow-spin ${config.speed * 3}s linear infinite`,
            filter: 'blur(40px)',
          }}
        />
      )}

      {/* 전기 아크 SVG */}
      <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 10 }}>
        <defs>
          <filter id={`electric-glow-${upgradeLevel}`}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {electricArcs.map((arc) => {
          // 지그재그 전기 경로 생성
          const midX = (arc.startX + arc.endX) / 2 + (Math.random() - 0.5) * 15;
          const midY = (arc.startY + arc.endY) / 2 + (Math.random() - 0.5) * 15;
          const mid2X = (arc.startX + midX) / 2 + (Math.random() - 0.5) * 10;
          const mid2Y = (arc.startY + midY) / 2 + (Math.random() - 0.5) * 10;
          const mid3X = (midX + arc.endX) / 2 + (Math.random() - 0.5) * 10;
          const mid3Y = (midY + arc.endY) / 2 + (Math.random() - 0.5) * 10;

          const path = `M ${arc.startX} ${arc.startY} L ${mid2X} ${mid2Y} L ${midX} ${midY} L ${mid3X} ${mid3Y} L ${arc.endX} ${arc.endY}`;
          
          const arcColor = upgradeLevel >= 15 ? rainbowColors[arc.id % rainbowColors.length] : config.color;

          return (
            <g key={arc.id}>
              {/* 외부 글로우 */}
              <path
                d={path}
                stroke={config.glowColor}
                strokeWidth={3 + config.intensity * 2}
                fill="none"
                opacity={config.opacity * 0.3}
                filter={`url(#electric-glow-${upgradeLevel})`}
                style={{
                  animation: `electric-arc ${config.speed}s ease-in-out infinite`,
                  animationDelay: `${arc.delay}s`,
                }}
              />
              {/* 메인 전기 */}
              <path
                d={path}
                stroke={arcColor}
                strokeWidth={1.5 + config.intensity}
                fill="none"
                opacity={config.opacity}
                style={{
                  animation: `electric-arc ${config.speed}s ease-in-out infinite`,
                  animationDelay: `${arc.delay}s`,
                }}
              />
            </g>
          );
        })}
      </svg>

      {/* 전기 스파크 파티클 */}
      <div className="absolute inset-0">
        {sparks.map((spark) => (
          <div
            key={spark.id}
            className="absolute rounded-full"
            style={{
              left: `${spark.x}%`,
              top: `${spark.y}%`,
              width: `${spark.size}px`,
              height: `${spark.size}px`,
              background: upgradeLevel >= 15 
                ? rainbowColors[spark.id % rainbowColors.length]
                : config.color,
              boxShadow: `0 0 ${6 + config.intensity * 8}px ${
                upgradeLevel >= 15 ? '#FFD700' : config.glowColor
              }`,
              animation: `electric-spark ${0.4 + Math.random() * 0.4}s ease-in-out infinite`,
              animationDelay: `${spark.delay}s`,
            }}
          />
        ))}
      </div>

      {/* 치지직 거리는 테두리 */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          boxShadow: `
            inset 0 0 ${15 + config.intensity * 20}px ${config.color}80,
            0 0 ${20 + config.intensity * 30}px ${config.glowColor}60,
            inset 0 0 ${8 + config.intensity * 10}px ${config.color}40
          `,
          animation: `electric-border ${config.speed * 0.6}s ease-in-out infinite`,
        }}
      />

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes electric-arc {
            0%, 100% { 
              opacity: 0; 
              stroke-dasharray: 0 100;
            }
            10% { 
              opacity: ${config.opacity}; 
              stroke-dasharray: 100 0;
            }
            20% { opacity: 0; }
            35% { 
              opacity: ${config.opacity * 0.7}; 
              stroke-dasharray: 80 20;
            }
            45%, 90% { opacity: 0; }
            96% { 
              opacity: ${config.opacity * 0.9}; 
              stroke-dasharray: 100 0;
            }
          }

          @keyframes electric-pulse {
            0%, 100% { opacity: 0.4; transform: scale(1); }
            50% { opacity: 0.8; transform: scale(1.05); }
          }

          @keyframes electric-spark {
            0%, 100% { 
              opacity: 0; 
              transform: scale(0.3);
            }
            15% { 
              opacity: 1; 
              transform: scale(1.5);
            }
            30% { opacity: 0; }
            50% { 
              opacity: ${config.opacity * 0.8}; 
              transform: scale(1.2);
            }
            65% { opacity: 0; }
          }

          @keyframes electric-border {
            0%, 100% { opacity: 0.6; }
            15% { opacity: 1; }
            30% { opacity: 0.4; }
            50% { opacity: 0.9; }
            70% { opacity: 0.5; }
            85% { opacity: 1; }
          }

          @keyframes rainbow-spin {
            0% { transform: rotate(0deg) scale(1.1); }
            100% { transform: rotate(360deg) scale(1.1); }
          }
        `}
      </style>
    </div>
  );
}
