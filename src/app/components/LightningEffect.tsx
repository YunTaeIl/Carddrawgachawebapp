// ⚡ 카드 전체에 번개 내리치는 효과 (드래곤볼 슈퍼사이어인 스타일)

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
        opacity: 0.7,
        interval: 4,
        flashIntensity: 0.3,
      };
    } else if (upgradeLevel < 6) {
      // +3~5: 약한 진한 파란색 번개
      return {
        boltCount: 3,
        color: "#3B82F6",
        glowColor: "#60A5FA",
        opacity: 0.8,
        interval: 3.5,
        flashIntensity: 0.5,
      };
    } else if (upgradeLevel < 9) {
      // +6~8: 중간 청록/시안 번개
      return {
        boltCount: 4,
        color: "#06B6D4",
        glowColor: "#22D3EE",
        opacity: 0.85,
        interval: 3,
        flashIntensity: 0.7,
      };
    } else if (upgradeLevel < 12) {
      // +9~11: 강한 보라색 번개
      return {
        boltCount: 5,
        color: "#A855F7",
        glowColor: "#C084FC",
        opacity: 0.9,
        interval: 2.5,
        flashIntensity: 0.85,
      };
    } else if (upgradeLevel < 15) {
      // +12~14: 매우 강한 분홍/마젠타 번개
      return {
        boltCount: 6,
        color: "#EC4899",
        glowColor: "#F472B6",
        opacity: 0.95,
        interval: 2,
        flashIntensity: 0.95,
      };
    } else {
      // +15: 최대 강화 금색 + 무지개 번개
      return {
        boltCount: 8,
        color: "#FFD700",
        glowColor: "#FFA500",
        opacity: 1.0,
        interval: 1.5,
        flashIntensity: 1.0,
      };
    }
  }, [upgradeLevel]);

  // 번개 경로 생성 (카드 전체를 가로지르는 큰 번개)
  const lightningBolts = useMemo(() => {
    const bolts = [];
    for (let i = 0; i < config.boltCount; i++) {
      // 시작점 (상단)
      const startX = 20 + Math.random() * 60;
      const startY = -10;
      
      // 중간점들 (지그재그 경로)
      const segments = 8 + Math.floor(Math.random() * 4);
      const points = [{ x: startX, y: startY }];
      
      let currentX = startX;
      let currentY = startY;
      
      for (let j = 0; j < segments; j++) {
        currentY += (110 / segments);
        currentX += (Math.random() - 0.5) * 30;
        currentX = Math.max(10, Math.min(90, currentX)); // 카드 범위 내 유지
        points.push({ x: currentX, y: currentY });
      }
      
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
    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
      {/* 번개 내리칠 때 화면 플래시 */}
      <div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: upgradeLevel >= 15 
            ? 'radial-gradient(ellipse at center, #FFD70050, #FF69B430, transparent)'
            : `radial-gradient(ellipse at center, ${config.color}40, transparent)`,
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
            filter: 'blur(30px)',
          }}
        />
      )}

      {/* 번개 SVG */}
      <svg 
        className="absolute inset-0 w-full h-full" 
        viewBox="0 0 100 100" 
        preserveAspectRatio="none"
        style={{ zIndex: 20 }}
      >
        <defs>
          <filter id={`lightning-glow-${upgradeLevel}`}>
            <feGaussianBlur stdDeviation="2" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* 번개 브랜치 (가지) */}
          <g id={`lightning-branch-${upgradeLevel}`}>
            <line x1="0" y1="0" x2="-8" y2="5" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="0" x2="8" y2="5" strokeWidth="1" opacity="0.7" />
            <line x1="0" y1="0" x2="-5" y2="8" strokeWidth="0.8" opacity="0.5" />
            <line x1="0" y1="0" x2="5" y2="8" strokeWidth="0.8" opacity="0.5" />
          </g>
        </defs>

        {lightningBolts.map((bolt) => {
          const path = createBoltPath(bolt.points);
          const boltColor = upgradeLevel >= 15 ? rainbowColors[bolt.id % rainbowColors.length] : config.color;

          return (
            <g key={bolt.id}>
              {/* 번개 외부 글로우 (가장 밝은) */}
              <path
                d={path}
                stroke={config.glowColor}
                strokeWidth={12 + config.flashIntensity * 8}
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
                strokeWidth={6 + config.flashIntensity * 4}
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
                strokeWidth={2 + config.flashIntensity}
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
              width: '60px',
              height: '60px',
              transform: 'translate(-50%, -50%)',
              background: upgradeLevel >= 15
                ? `radial-gradient(circle, ${rainbowColors[bolt.id % rainbowColors.length]}ff, ${config.color}dd, transparent)`
                : `radial-gradient(circle, #FFFFFFff, ${config.color}dd, transparent)`,
              opacity: 0,
              animation: `lightning-impact ${config.interval}s ease-out infinite`,
              animationDelay: `${bolt.delay + 0.15}s`,
            }}
          />
        );
      })}

      {/* 전기 스파크 (번개 내리칠 때) */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={`spark-${i}`}
            className="absolute rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 3}px`,
              height: `${2 + Math.random() * 3}px`,
              background: upgradeLevel >= 15 
                ? rainbowColors[i % rainbowColors.length]
                : config.color,
              boxShadow: `0 0 ${8 + config.flashIntensity * 12}px ${config.glowColor}`,
              opacity: 0,
              animation: `spark-burst ${config.interval}s ease-out infinite`,
              animationDelay: `${(i * config.interval) / 20}s`,
            }}
          />
        ))}
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
            4% { opacity: ${config.opacity * 0.6}; }
            5% { opacity: ${config.opacity}; }
            7% { opacity: ${config.opacity * 0.7}; }
            8% { opacity: 0; }
            100% { opacity: 0; }
          }

          @keyframes lightning-flash {
            0%, 100% { opacity: 0; }
            2% { opacity: ${config.flashIntensity * 0.8}; }
            4% { opacity: ${config.flashIntensity * 0.4}; }
            5% { opacity: ${config.flashIntensity}; }
            8% { opacity: 0; }
          }

          @keyframes rainbow-flash {
            0%, 100% { opacity: 0; }
            2% { opacity: 0.3; }
            5% { opacity: 0.5; }
            8% { opacity: 0; }
          }

          @keyframes lightning-impact {
            0% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(0.3);
            }
            5% { 
              opacity: ${config.flashIntensity}; 
              transform: translate(-50%, -50%) scale(1.5);
            }
            10% { 
              opacity: ${config.flashIntensity * 0.5}; 
              transform: translate(-50%, -50%) scale(2.5);
            }
            15% { 
              opacity: 0; 
              transform: translate(-50%, -50%) scale(3);
            }
            100% { opacity: 0; }
          }

          @keyframes spark-burst {
            0%, 100% { 
              opacity: 0; 
              transform: scale(0) translate(0, 0);
            }
            5% { 
              opacity: ${config.opacity}; 
              transform: scale(1.5) translate(${Math.random() * 20 - 10}px, ${Math.random() * 20 - 10}px);
            }
            10% { 
              opacity: ${config.opacity * 0.5}; 
              transform: scale(1) translate(${Math.random() * 40 - 20}px, ${Math.random() * 40 - 20}px);
            }
            15% { 
              opacity: 0; 
              transform: scale(0.5) translate(${Math.random() * 60 - 30}px, ${Math.random() * 60 - 30}px);
            }
          }
        `}
      </style>
    </div>
  );
}
