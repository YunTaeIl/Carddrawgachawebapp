// ⚡ 카드 테두리에 번개 내리치는 효과 (선수 이미지는 가리지 않음)

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
        boltCount: 2,
        color: "#60A5FA",
        glowColor: "#93C5FD",
        opacity: 0.6,
        interval: 4,
        flashIntensity: 0.3,
      };
    } else if (upgradeLevel < 6) {
      // +3~5: 약한 진한 파란색 번개
      return {
        boltCount: 3,
        color: "#3B82F6",
        glowColor: "#60A5FA",
        opacity: 0.7,
        interval: 3.5,
        flashIntensity: 0.5,
      };
    } else if (upgradeLevel < 9) {
      // +6~8: 중간 청록/시안 번개
      return {
        boltCount: 4,
        color: "#06B6D4",
        glowColor: "#22D3EE",
        opacity: 0.75,
        interval: 3,
        flashIntensity: 0.7,
      };
    } else if (upgradeLevel < 12) {
      // +9~11: 강한 보라색 번개
      return {
        boltCount: 5,
        color: "#A855F7",
        glowColor: "#C084FC",
        opacity: 0.8,
        interval: 2.5,
        flashIntensity: 0.85,
      };
    } else if (upgradeLevel < 15) {
      // +12~14: 매우 강한 분홍/마젠타 번개
      return {
        boltCount: 6,
        color: "#EC4899",
        glowColor: "#F472B6",
        opacity: 0.85,
        interval: 2,
        flashIntensity: 0.95,
      };
    } else {
      // +15: 최대 강화 금색 + 무지개 번개
      return {
        boltCount: 8,
        color: "#FFD700",
        glowColor: "#FFA500",
        opacity: 0.9,
        interval: 1.5,
        flashIntensity: 1.0,
      };
    }
  }, [upgradeLevel]);

  // 번개 경로 생성 (카드 테두리/가장자리만)
  const lightningBolts = useMemo(() => {
    const bolts = [];
    for (let i = 0; i < config.boltCount; i++) {
      const side = i % 4; // 0: 좌측, 1: 우측, 2: 상단, 3: 하단
      let startX, startY, endX, endY, points;
      
      if (side === 0) {
        // 좌측 번개
        startX = -5;
        startY = 10 + Math.random() * 30;
        endX = 5;
        endY = 60 + Math.random() * 30;
      } else if (side === 1) {
        // 우측 번개
        startX = 105;
        startY = 10 + Math.random() * 30;
        endX = 95;
        endY = 60 + Math.random() * 30;
      } else if (side === 2) {
        // 상단 번개 (좌)
        startX = 5 + Math.random() * 20;
        startY = -5;
        endX = 10 + Math.random() * 15;
        endY = 40;
      } else {
        // 상단 번개 (우)
        startX = 75 + Math.random() * 20;
        startY = -5;
        endX = 75 + Math.random() * 15;
        endY = 40;
      }
      
      // 중간점 생성 (지그재그)
      points = [{ x: startX, y: startY }];
      const segments = 5 + Math.floor(Math.random() * 3);
      let currentX = startX;
      let currentY = startY;
      const deltaX = (endX - startX) / segments;
      const deltaY = (endY - startY) / segments;
      
      for (let j = 1; j < segments; j++) {
        currentX += deltaX + (Math.random() - 0.5) * 8;
        currentY += deltaY + (Math.random() - 0.5) * 8;
        points.push({ x: currentX, y: currentY });
      }
      points.push({ x: endX, y: endY });
      
      bolts.push({
        id: i,
        points,
        delay: (i * config.interval) / config.boltCount,
      });
    }
    return bolts;
  }, [config.boltCount, config.interval, upgradeLevel]);

  // SVG 경로 생성
  const createBoltPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return "";
    let path = `M ${points[0].x} ${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      path += ` L ${points[i].x} ${points[i].y}`;
    }
    return path;
  };

  const rainbowColors = ['#FF0000', '#FF7F00', '#FFFF00', '#00FF00', '#0000FF', '#4B0082', '#9400D3'];

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible rounded-2xl">
      {/* 번개 내리칠 때 화면 플래시 (가장자리만) */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: upgradeLevel >= 15 
            ? 'radial-gradient(ellipse at center, transparent 40%, #FFD70030, #FF69B420, transparent)'
            : `radial-gradient(ellipse at center, transparent 40%, ${config.color}30, transparent)`,
          animation: `lightning-flash ${config.interval}s ease-out infinite`,
        }}
      />

      {/* +15 최대 강화 특별 무지개 오라 */}
      {upgradeLevel >= 15 && (
        <div
          className="absolute inset-0 rounded-2xl"
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
            opacity: 0,
            animation: `rainbow-flash ${config.interval}s ease-out infinite`,
            filter: 'blur(40px)',
            maskImage: 'radial-gradient(ellipse at center, transparent 50%, black 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse at center, transparent 50%, black 80%)',
          }}
        />
      )}

      {/* 번개 SVG */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ zIndex: 20, overflow: 'visible' }}
      >
        <defs>
          <filter id={`lightning-glow-${upgradeLevel}`}>
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 번개 브랜치 (가지) */}
          <g id={`lightning-branch-${upgradeLevel}`}>
            <line x1="0" y1="0" x2="-5" y2="3" strokeWidth="0.8" opacity="0.6" />
            <line x1="0" y1="0" x2="5" y2="3" strokeWidth="0.8" opacity="0.6" />
            <line x1="0" y1="0" x2="-3" y2="5" strokeWidth="0.6" opacity="0.4" />
          </g>
        </defs>

        {lightningBolts.map((bolt) => {
          const path = createBoltPath(bolt.points);
          const boltColor = upgradeLevel >= 15 ? rainbowColors[bolt.id % rainbowColors.length] : config.color;

          return (
            <g key={bolt.id}>
              {/* 번개 외부 글로우 */}
              <path
                d={path}
                stroke={config.glowColor}
                strokeWidth={4 + config.flashIntensity * 3}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                filter={`url(#lightning-glow-${upgradeLevel})`}
                style={{
                  animation: `lightning-strike ${config.interval}s ease-out infinite`,
                  animationDelay: `${bolt.delay}s`,
                }}
              />

              {/* 번개 중간 글로우 */}
              <path
                d={path}
                stroke={boltColor}
                strokeWidth={2 + config.flashIntensity * 1.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                filter={`url(#lightning-glow-${upgradeLevel})`}
                style={{
                  animation: `lightning-strike ${config.interval}s ease-out infinite`,
                  animationDelay: `${bolt.delay}s`,
                }}
              />

              {/* 번개 메인 (흰색 코어) */}
              <path
                d={path}
                stroke="#FFFFFF"
                strokeWidth={1 + config.flashIntensity * 0.5}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0"
                style={{
                  animation: `lightning-strike ${config.interval}s ease-out infinite`,
                  animationDelay: `${bolt.delay}s`,
                }}
              />

              {/* 번개 가지 효과 */}
              {bolt.points.map((point, idx) => {
                if (idx % 2 === 0 && idx > 0 && idx < bolt.points.length - 1) {
                  return (
                    <g
                      key={`branch-${idx}`}
                      transform={`translate(${point.x}, ${point.y})`}
                      stroke={boltColor}
                      opacity="0"
                      style={{
                        animation: `lightning-strike ${config.interval}s ease-out infinite`,
                        animationDelay: `${bolt.delay + 0.02}s`,
                      }}
                    >
                      <use href={`#lightning-branch-${upgradeLevel}`} />
                    </g>
                  );
                }
                return null;
              })}
            </g>
          );
        })}
      </svg>

      {/* 번개 타격 지점 폭발 효과 */}
      {lightningBolts.map((bolt) => {
        const lastPoint = bolt.points[bolt.points.length - 1];
        return (
          <div
            key={`impact-${bolt.id}`}
            className="absolute rounded-full"
            style={{
              left: `${lastPoint.x}%`,
              top: `${lastPoint.y}%`,
              width: '40px',
              height: '40px',
              transform: 'translate(-50%, -50%)',
              background: upgradeLevel >= 15
                ? `radial-gradient(circle, ${rainbowColors[bolt.id % rainbowColors.length]}dd, ${config.color}99, transparent)`
                : `radial-gradient(circle, #FFFFFFdd, ${config.color}99, transparent)`,
              opacity: 0,
              animation: `lightning-impact ${config.interval}s ease-out infinite`,
              animationDelay: `${bolt.delay + 0.12}s`,
            }}
          />
        );
      })}

      {/* 전기 스파크 (가장자리만) */}
      <div className="absolute inset-0">
        {[...Array(16)].map((_, i) => {
          // 가장자리 위치만
          const edge = i % 4;
          let x, y;
          if (edge === 0) {
            x = Math.random() * 15;
            y = Math.random() * 100;
          } else if (edge === 1) {
            x = 85 + Math.random() * 15;
            y = Math.random() * 100;
          } else if (edge === 2) {
            x = Math.random() * 100;
            y = Math.random() * 20;
          } else {
            x = Math.random() * 100;
            y = 80 + Math.random() * 20;
          }
          
          return (
            <div
              key={`spark-${i}`}
              className="absolute rounded-full"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                width: `${2 + Math.random() * 2}px`,
                height: `${2 + Math.random() * 2}px`,
                background: upgradeLevel >= 15 
                  ? rainbowColors[i % rainbowColors.length]
                  : config.color,
                boxShadow: `0 0 ${6 + config.flashIntensity * 8}px ${config.glowColor}`,
                opacity: 0,
                animation: `spark-burst ${config.interval}s ease-out infinite`,
                animationDelay: `${(i * config.interval) / 16}s`,
              }}
            />
          );
        })}
      </div>

      {/* CSS 애니메이션 */}
      <style>
        {`
          @keyframes lightning-strike {
            0% { 
              opacity: 0; 
              stroke-dasharray: 0 1000;
            }
            2% { 
              opacity: ${config.opacity}; 
              stroke-dasharray: 1000 0;
            }
            4% { opacity: ${config.opacity * 0.5}; }
            5% { opacity: ${config.opacity * 0.8}; }
            6% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes lightning-flash {
            0%, 100% { opacity: 0; }
            2% { opacity: ${config.flashIntensity * 0.5}; }
            4% { opacity: ${config.flashIntensity * 0.3}; }
            5% { opacity: ${config.flashIntensity * 0.6}; }
            6% { opacity: 0; }
          }

          @keyframes rainbow-flash {
            0%, 100% { opacity: 0; }
            2% { opacity: 0.2; }
            5% { opacity: 0.3; }
            6% { opacity: 0; }
          }

          @keyframes lightning-impact {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.3);
            }
            5% { 
              opacity: ${config.flashIntensity * 0.8}; 
              transform: translate(-50%, -50%) scale(1.2);
            }
            8% { 
              opacity: ${config.flashIntensity * 0.4}; 
              transform: translate(-50%, -50%) scale(1.8);
            }
            12% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(2.2);
            }
            100% { opacity: 0; }
          }

          @keyframes spark-burst {
            0%, 100% { 
              opacity: 0; 
              transform: scale(0) translate(0, 0);
            }
            4% { 
              opacity: ${config.opacity}; 
              transform: scale(1.5) translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px);
            }
            8% { 
              opacity: ${config.opacity * 0.5}; 
              transform: scale(1) translate(${Math.random() * 15 - 7.5}px, ${Math.random() * 15 - 7.5}px);
            }
            12% { 
              opacity: 0; 
              transform: scale(0.5) translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
            }
          }
        `}
      </style>
    </div>
  );
}
