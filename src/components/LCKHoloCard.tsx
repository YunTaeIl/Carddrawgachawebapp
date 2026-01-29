// LCK 홀로그램 카드 (앞/뒷면 플립 + 5각형 레이더 차트)

import React, { useRef, useState, useEffect } from "react";
import { LCKCard, GRADE_COLORS, POSITION_NAMES, isLiveCard, LIVE_CARD_COLOR } from "@/types/lck";
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from "recharts";
import { PlayerImage } from "@/components/PlayerImage";
import { getTeamLogoUrls } from "@/utils/teamLogos";

interface LCKHoloCardProps {
  card: LCKCard;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  onBackClick?: () => void; // 뒷면 클릭 시 콜백
  upgradeLevel?: number;
  disableFlip?: boolean;
  forceStatic?: boolean; // 캡처용 정적 렌더링
  synergyBonus?: {
    ovr: number;
    mec: number;
    lan: number;
    tf: number;
    mac: number;
    clu: number;
  };
}

export function LCKHoloCard({ card, size = "medium", onClick, onBackClick, upgradeLevel = 0, disableFlip = false, forceStatic = false, synergyBonus }: LCKHoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const [isFlipped, setIsFlipped] = useState(false);
  const [showUpgradeButton, setShowUpgradeButton] = useState(false); // 🔧 강화 버튼 표시 상태
  const [logoError, setLogoError] = useState(false);
  const [logoUrlIndex, setLogoUrlIndex] = useState(0);
  
  // 팀 로고 URL
  const teamLogoUrls = getTeamLogoUrls(card.year, card.team);
  const currentLogoUrl = teamLogoUrls[logoUrlIndex];
  
  const handleLogoError = () => {
    if (logoUrlIndex < teamLogoUrls.length - 1) {
      setLogoUrlIndex(logoUrlIndex + 1);
    } else {
      setLogoError(true);
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || forceStatic) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;
    
    // requestAnimationFrame으로 부드럽게
    requestAnimationFrame(() => {
      setRotation({ x: rotateX, y: rotateY });
      setGlarePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
    });
  };

  const handleMouseLeave = () => {
    if (forceStatic) return;
    requestAnimationFrame(() => {
      setRotation({ x: 0, y: 0 });
      setGlarePosition({ x: 50, y: 50 });
    });
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (disableFlip || forceStatic) {
      if (onClick) onClick();
      return;
    }
    
    // 앞면 → 뒷면
    if (!isFlipped) {
      setIsFlipped(true);
      setShowUpgradeButton(false);
      if (onClick) onClick();
    }
    // 뒷면 → 강화 버튼 표시
    else if (isFlipped && !showUpgradeButton && onBackClick) {
      setShowUpgradeButton(true);
    }
    // 강화 버튼 표시 중 → 앞면으로 (버튼이 아닌 곳 클릭)
    else if (showUpgradeButton) {
      setIsFlipped(false);
      setShowUpgradeButton(false);
    }
  };
  
  // 강화 버튼 클릭
  const handleUpgradeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onBackClick) {
      onBackClick();
      // 모달 열린 후 상태 리셋
      setIsFlipped(false);
      setShowUpgradeButton(false);
    }
  };

  // 🔧 외부 클릭 시 앞면으로 복귀
  useEffect(() => {
    if (!showUpgradeButton || forceStatic) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(event.target as Node)) {
        setIsFlipped(false);
        setShowUpgradeButton(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUpgradeButton, forceStatic]);

  const sizeClasses = {
    small: "w-40 h-[293px]",
    medium: "w-60 h-[440px]",
    large: "w-72 h-[528px]"
  };
  
  // 🔥 사이즈별 폰트 크기
  const fontSizes = {
    small: {
      grade: "text-base",      // 등급
      yearPos: "text-xs",      // 연도/포지션
      logo: "w-6 h-6",         // 로고
      teamName: "text-xs",     // 팀명
      playerName: "text-sm",   // 선수명
      ovr: "text-lg",          // OVR
      stats: "text-[8px]"      // 스탯 라벨
    },
    medium: {
      grade: "text-2xl",
      yearPos: "text-lg",
      logo: "w-10 h-10",
      teamName: "text-sm",
      playerName: "text-xl",
      ovr: "text-3xl",
      stats: "text-[10px]"
    },
    large: {
      grade: "text-3xl",
      yearPos: "text-xl",
      logo: "w-12 h-12",
      teamName: "text-base",
      playerName: "text-2xl",
      ovr: "text-4xl",
      stats: "text-xs"
    }
  };
  
  const currentFontSize = fontSizes[size];

  const gradeColor = GRADE_COLORS[card.grade];
  const isLive = isLiveCard(card); // 🔥 LIVE 카드 체크
  
  const displayOVR = card.stats.ovr + (upgradeLevel || 0) + (synergyBonus?.ovr || 0);

  // ⬆️ 강화 등급별 오라 색상
  const getUpgradeAura = () => {
    if (!upgradeLevel || upgradeLevel === 0) return null;
    
    if (upgradeLevel >= 13) {
      return {
        color: "#FF0000",
        intensity: "extreme",
        glow: "0 0 60px #FF000099, 0 0 120px #FFD70066, 0 0 180px #FF000044",
        pulseColor: "#FFD700"
      };
    } else if (upgradeLevel >= 10) {
      return {
        color: "#FF8C00",
        intensity: "very-high",
        glow: "0 0 50px #FF8C0099, 0 0 100px #FF8C0066, 0 0 150px #FF8C0044",
        pulseColor: "#FFA500"
      };
    } else if (upgradeLevel >= 7) {
      return {
        color: "#FFD700",
        intensity: "high",
        glow: "0 0 40px #FFD70099, 0 0 80px #FFD70066, 0 0 120px #FFD70044",
        pulseColor: "#FFED4E"
      };
    } else if (upgradeLevel >= 4) {
      return {
        color: "#9D4EDD",
        intensity: "medium",
        glow: "0 0 30px #9D4EDD99, 0 0 60px #9D4EDD66, 0 0 90px #9D4EDD44",
        pulseColor: "#C77DFF"
      };
    } else {
      return {
        color: "#00D9FF",
        intensity: "low",
        glow: "0 0 20px #00D9FF99, 0 0 40px #00D9FF66, 0 0 60px #00D9FF44",
        pulseColor: "#7DF9FF"
      };
    }
  };

  const upgradeAura = getUpgradeAura();

  // 5각형 레이더 차트 데이터
  const radarData = [
    { stat: "메카닉", value: card.stats.mechanics + (synergyBonus?.mec || 0), base: card.stats.mechanics },
    { stat: "라인전", value: card.stats.laning + (synergyBonus?.lan || 0), base: card.stats.laning },
    { stat: "한타", value: card.stats.teamfight + (synergyBonus?.tf || 0), base: card.stats.teamfight },
    { stat: "운영", value: card.stats.macro + (synergyBonus?.mac || 0), base: card.stats.macro },
    { stat: "클러치", value: card.stats.clutch + (synergyBonus?.clu || 0), base: card.stats.clutch },
  ];

  // 등급별 테두리 스타일
  const getBorderStyle = () => {
    switch (card.grade) {
      case "S":
        return {
          border: `2px solid ${gradeColor}`,
          boxShadow: `
            0 0 30px ${gradeColor}99,
            0 0 60px ${gradeColor}66,
            inset 0 0 30px ${gradeColor}33,
            0 8px 40px rgba(0, 0, 0, 0.6)
          `
        };
      case "A":
        return {
          border: `2px solid ${gradeColor}`,
          boxShadow: `
            0 0 20px ${gradeColor}88,
            0 0 40px ${gradeColor}44,
            inset 0 0 20px ${gradeColor}22,
            0 8px 32px rgba(0, 0, 0, 0.5)
          `
        };
      default:
        return {
          border: `1px solid ${gradeColor}`,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`
        };
    }
  };

  return (
    <div
      className={`${sizeClasses[size]} relative cursor-pointer`}
      style={{ perspective: "1200px" }}
    >
      <div
        ref={cardRef}
        className="w-full h-full relative"
        style={{
          transformStyle: "preserve-3d",
          transform: isFlipped 
            ? "rotateY(180deg)" 
            : `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transition: isFlipped ? "transform 0.6s" : "none",
          willChange: "transform"
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleCardClick}
      >
        {/* 앞면 */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden"
          }}
        >
          {/* 외부 글로우 효과 */}
          <div 
            className="absolute inset-0 rounded-2xl blur-xl opacity-60 -z-10"
            style={{
              background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${gradeColor}66, transparent 70%)`
            }}
          />
          
          {/* ⬆️ 강화 오라 효과 */}
          {upgradeAura && (
            <>
              {/* 펄싱 오라 링 1 (가장 안쪽) */}
              <div 
                className="absolute -inset-1 rounded-2xl -z-10"
                style={{
                  boxShadow: upgradeAura.glow,
                  opacity: 0.9,
                  animation: "upgradePulse1 2s ease-in-out infinite"
                }}
              />
              
              {/* 펄싱 오라 링 2 (중간) */}
              <div 
                className="absolute -inset-3 rounded-2xl -z-10"
                style={{
                  boxShadow: `0 0 40px ${upgradeAura.color}88, 0 0 80px ${upgradeAura.pulseColor}66`,
                  opacity: 0.7,
                  animation: "upgradePulse2 2s ease-in-out infinite 0.5s"
                }}
              />
              
              {/* 펄싱 오라 링 3 (바깥) */}
              <div 
                className="absolute -inset-5 rounded-2xl -z-10"
                style={{
                  boxShadow: `0 0 60px ${upgradeAura.pulseColor}66, 0 0 120px ${upgradeAura.color}44`,
                  opacity: 0.5,
                  animation: "upgradePulse3 2s ease-in-out infinite 1s"
                }}
              />
              
              {/* 빛나는 파티클들 */}
              <div className="absolute -inset-4 -z-10 pointer-events-none">
                {[...Array(12)].map((_, i) => {
                  const angle = (i * 30);
                  const radius = 105;
                  const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
                  const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
                  
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${x}%`,
                        top: `${y}%`,
                        width: "8px",
                        height: "8px",
                        background: `radial-gradient(circle, ${upgradeAura.pulseColor}, ${upgradeAura.color})`,
                        boxShadow: `0 0 12px ${upgradeAura.color}, 0 0 24px ${upgradeAura.pulseColor}`,
                        animation: `upgradeParticle 2s ease-in-out infinite ${i * 0.15}s`,
                        transform: "translate(-50%, -50%)"
                      }}
                    />
                  );
                })}
              </div>
            </>
          )}

          {/* 카드 본체 */}
          <div 
            className="w-full h-full relative rounded-2xl overflow-hidden transform-3d"
            style={{
              background: `
                linear-gradient(135deg, 
                  ${gradeColor}33 0%, 
                  #0A0E27 20%,
                  #141B3D 50%,
                  #0A0E27 80%,
                  ${gradeColor}22 100%
                )
              `,
              ...getBorderStyle()
            }}
          >
            {/* 다이아몬드 패턴 배경 */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, ${gradeColor}33 0, ${gradeColor}33 2px, transparent 2px, transparent 10px),
                  repeating-linear-gradient(-45deg, ${gradeColor}33 0, ${gradeColor}33 2px, transparent 2px, transparent 10px)
                `
              }}
            />

            {/* 🔥 LIVE 카드 전용 효과 */}
            {isLive ? (
              <>
                {/* LIVE 핑크/마젠타 홀로그램 */}
                <div
                  className="absolute inset-0 pointer-events-none animate-pulse"
                  style={{
                    background: `
                      radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, 
                        rgba(255, 20, 147, 0.9) 0%, 
                        rgba(192, 38, 211, 0.7) 20%,
                        rgba(147, 51, 234, 0.5) 40%,
                        transparent 70%
                      )
                    `,
                    mixBlendMode: "screen",
                    opacity: 0.95
                  }}
                />

                {/* 움직이는 핑크 그라데이션 */}
                <div className="absolute inset-0 pointer-events-none">
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{
                      background: `
                        conic-gradient(
                          from 0deg,
                          rgba(255, 20, 147, 0.6),
                          rgba(192, 38, 211, 0.5),
                          rgba(147, 51, 234, 0.6),
                          rgba(236, 72, 153, 0.5),
                          rgba(255, 20, 147, 0.6)
                        )
                      `,
                      mixBlendMode: "overlay",
                      opacity: 0.7,
                      animationDuration: "8s"
                    }}
                  />
                </div>

                {/* 다이아몬드 파티클 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(40)].map((_, i) => {
                    const x = (i * 19) % 100;
                    const y = (i * 27) % 100;
                    return (
                      <div
                        key={i}
                        className="absolute animate-pulse"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          width: "3px",
                          height: "3px",
                          background: "radial-gradient(circle, rgba(255, 255, 255, 0.9), rgba(255, 20, 147, 0.6), transparent)",
                          boxShadow: "0 0 8px rgba(255, 20, 147, 0.9), 0 0 16px rgba(192, 38, 211, 0.6)",
                          borderRadius: "50%",
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: `${2 + (i % 3)}s`
                        }}
                      />
                    );
                  })}
                </div>

                {/* 빛나는 레이어 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 8px,
                        rgba(255, 20, 147, 0.15) 8px,
                        rgba(255, 20, 147, 0.15) 10px,
                        transparent 10px,
                        transparent 16px,
                        rgba(192, 38, 211, 0.15) 16px,
                        rgba(192, 38, 211, 0.15) 18px
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />

                {/* 펄스 링 효과 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(
                        circle at ${glarePosition.x}% ${glarePosition.y}%,
                        transparent 30%,
                        rgba(255, 20, 147, 0.4) 35%,
                        rgba(255, 20, 147, 0.6) 37%,
                        rgba(255, 20, 147, 0.4) 39%,
                        transparent 45%
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />

                {/* 스타더스트 효과 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(20)].map((_, i) => (
                    <div
                      key={`star-${i}`}
                      className="absolute rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${4 + Math.random() * 6}px`,
                        height: `${4 + Math.random() * 6}px`,
                        background: `radial-gradient(circle, 
                          rgba(255, 255, 255, ${0.6 + Math.random() * 0.4}), 
                          rgba(255, 20, 147, 0.8),
                          transparent
                        )`,
                        boxShadow: `
                          0 0 ${8 + Math.random() * 12}px rgba(255, 20, 147, 0.9),
                          0 0 ${16 + Math.random() * 24}px rgba(192, 38, 211, 0.6)
                        `,
                        opacity: 0.7
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* 홀로그램 레이어 - 기본 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, 
                        ${gradeColor}dd 0%, 
                        ${gradeColor}88 20%,
                        ${gradeColor}44 40%,
                        transparent 60%
                      ),
                      repeating-conic-gradient(
                        from 0deg at ${glarePosition.x}% ${glarePosition.y}%,
                        ${gradeColor}44 0deg,
                        transparent 30deg,
                        ${gradeColor}22 60deg,
                        transparent 90deg
                      )
                    `,
                    mixBlendMode: "screen",
                    opacity: card.grade === "S" ? 0.9 : card.grade === "A" ? 0.7 : 0.4
                  }}
                />

                {/* S등급: Galaxy Cosmos 효과 */}
                {card.grade === "S" && (
              <>
                {/* 정적 성운 효과 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      radial-gradient(ellipse at ${glarePosition.x}% ${glarePosition.y}%, 
                        rgba(138, 43, 226, 0.4),
                        rgba(75, 0, 130, 0.3),
                        rgba(25, 25, 112, 0.2),
                        transparent 70%
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />
                
                {/* 정적 무지개 스펙트럼 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(
                        ${Math.atan2(glarePosition.y - 50, glarePosition.x - 50)}rad,
                        rgba(255, 0, 127, 0.4),
                        rgba(255, 127, 0, 0.4),
                        rgba(255, 255, 0, 0.3),
                        rgba(0, 255, 127, 0.4),
                        rgba(0, 127, 255, 0.4),
                        rgba(127, 0, 255, 0.4)
                      )
                    `,
                    mixBlendMode: "overlay"
                  }}
                />

                {/* 별빛 파티클 (정적) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(30)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        width: `${2 + Math.random() * 3}px`,
                        height: `${2 + Math.random() * 3}px`,
                        background: `radial-gradient(circle, 
                          rgba(255, 255, 255, ${0.4 + Math.random() * 0.3}), 
                          transparent
                        )`,
                        boxShadow: `0 0 ${4 + Math.random() * 8}px rgba(255, 255, 255, 0.6)`,
                        opacity: 0.5
                      }}
                    />
                  ))}
                </div>
              </>
            )}

            {/* A등급: Diagonal Stripe Holo 효과 (정적) */}
            {card.grade === "A" && (
              <>
                {/* 대각선 줄무늬 (정적) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        45deg,
                        transparent,
                        transparent 10px,
                        rgba(255, 0, 127, 0.2) 10px,
                        rgba(255, 0, 127, 0.2) 12px,
                        transparent 12px,
                        transparent 20px,
                        rgba(255, 127, 0, 0.2) 20px,
                        rgba(255, 127, 0, 0.2) 22px,
                        transparent 22px,
                        transparent 30px,
                        rgba(0, 127, 255, 0.2) 30px,
                        rgba(0, 127, 255, 0.2) 32px,
                        transparent 32px,
                        transparent 40px
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />

                {/* 무지개 라인 (마우스 추적만) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(
                        135deg,
                        transparent 0%,
                        transparent ${glarePosition.x - 10}%,
                        rgba(255, 0, 127, 0.4) ${glarePosition.x - 5}%,
                        rgba(255, 127, 0, 0.4) ${glarePosition.x}%,
                        rgba(255, 255, 0, 0.3) ${glarePosition.x + 2}%,
                        rgba(0, 255, 127, 0.4) ${glarePosition.x + 4}%,
                        rgba(0, 127, 255, 0.4) ${glarePosition.x + 6}%,
                        rgba(127, 0, 255, 0.4) ${glarePosition.x + 8}%,
                        transparent ${glarePosition.x + 12}%,
                        transparent 100%
                      )
                    `,
                    mixBlendMode: "overlay",
                    transition: "background 0.3s ease"
                  }}
                />

                {/* 보조 대각선 줄무늬 (정적) */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      repeating-linear-gradient(
                        -45deg,
                        transparent,
                        transparent 15px,
                        ${gradeColor}11 15px,
                        ${gradeColor}22 17px,
                        ${gradeColor}11 19px,
                        transparent 19px,
                        transparent 30px
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />

                {/* 정적 반짝임 포인트 */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(15)].map((_, i) => {
                    const x = (i * 17) % 100;
                    const y = (i * 23) % 100;
                    return (
                      <div
                        key={i}
                        className="absolute w-1 h-1 rounded-full"
                        style={{
                          left: `${x}%`,
                          top: `${y}%`,
                          background: `radial-gradient(circle, 
                            rgba(255, 255, 255, 0.5), 
                            ${gradeColor}33,
                            transparent
                          )`,
                          boxShadow: `0 0 4px ${gradeColor}`,
                          opacity: 0.6
                        }}
                      />
                    );
                  })}
                </div>
              </>
            )}

            {/* B등급: Sparkle Holo 효과 (정적) */}
            {card.grade === "B" && (
              <>
                {/* 정적 홀로그램 */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    background: `
                      linear-gradient(
                        120deg,
                        transparent 0%,
                        ${gradeColor}22 45%,
                        ${gradeColor}44 50%,
                        ${gradeColor}22 55%,
                        transparent 100%
                      )
                    `,
                    mixBlendMode: "screen"
                  }}
                />

                {/* 작은 반짝임들 (정적) */}
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  {[...Array(12)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute w-1 h-1 rounded-full"
                      style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                        background: `${gradeColor}`,
                        boxShadow: `0 0 3px ${gradeColor}`,
                        opacity: 0.4
                      }}
                    />
                  ))}
                </div>
              </>
            )}

                {/* C등급: Reverse Holo 효과 (정적) */}
                {card.grade === "C" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background: `
                        linear-gradient(
                          90deg,
                          transparent 0%,
                          ${gradeColor}11 25%,
                          ${gradeColor}22 50%,
                          ${gradeColor}11 75%,
                          transparent 100%
                        )
                      `,
                      mixBlendMode: "soft-light"
                    }}
                  />
                )}
              </>
            )}

            {/* 카드 컨텐츠 - 정확한 레이아웃 */}
            <div className="relative z-10 h-full flex flex-col p-3">
              {/* 🔥 LIVE 배지 (카드 최상단) */}
              {isLive && (
                <div 
                  className="absolute -top-1 left-1/2 -translate-x-1/2 z-20 px-3 py-1 rounded-full font-bold text-xs animate-pulse"
                  style={{
                    background: `linear-gradient(135deg, ${LIVE_CARD_COLOR}, #C026D3)`,
                    boxShadow: `0 0 20px ${LIVE_CARD_COLOR}88, 0 4px 12px rgba(0,0,0,0.8)`,
                    color: "white"
                  }}
                >
                  🔴 LIVE
                </div>
              )}
              
              {/* 상단 헤더 - 한 줄로! */}
              <div className="flex-shrink-0 mb-3 pb-2 border-b" style={{ borderColor: `${gradeColor}33` }}>
                <div className="flex items-center justify-between gap-3">
                  {/* 등급 배지 - 박스 제거 */}
                  <div
                    className={`${currentFontSize.grade} font-display font-bold flex-shrink-0`}
                    style={{
                      color: gradeColor,
                      textShadow: `0 0 20px ${gradeColor}AA, 0 2px 4px rgba(0,0,0,0.8)`
                    }}
                  >
                    {card.grade}
                  </div>
                  
                  {/* 연도 */}
                  <div className={`${currentFontSize.yearPos} text-[#FFB81C] font-display font-bold`} style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    {card.year}
                  </div>
                  
                  {/* 포지션 */}
                  <div className={`${currentFontSize.yearPos} font-bold text-white`} style={{ textShadow: "0 2px 4px rgba(0,0,0,0.8)" }}>
                    {POSITION_NAMES[card.position]}
                  </div>
                  
                  {/* 팀 로고 - 박스 제거 */}
                  <div className={`relative ${currentFontSize.logo} flex-shrink-0`}>
                    {currentLogoUrl && !logoError ? (
                      <img
                        src={currentLogoUrl}
                        alt={card.team}
                        className="w-full h-full object-contain"
                        style={{
                          filter: `drop-shadow(0 2px 6px rgba(0,0,0,0.6)) drop-shadow(0 0 10px ${gradeColor}66)`
                        }}
                        onError={handleLogoError}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold" 
                        style={{ 
                          color: gradeColor,
                          textShadow: `0 0 10px ${gradeColor}AA, 0 2px 4px rgba(0,0,0,0.8)`
                        }}
                      >
                        {card.team.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 중앙: 이미지 영역 */}
              <div className="flex-1 relative mb-2 min-h-0">{/* 이미지 영역 */}
                <div 
                  className="w-full h-full rounded-lg overflow-hidden relative"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, #1A2347 0%, #0A0E27 100%)`,
                    border: `2px solid ${gradeColor}`,
                    boxShadow: `inset 0 0 20px ${gradeColor}44, 0 2px 12px rgba(0, 0, 0, 0.5)`
                  }}
                >
                  {/* 이미지 프레임 내부 장식 */}
                  <div className="absolute inset-0 border-2 border-double rounded"
                    style={{ borderColor: `${gradeColor}33` }}
                  />

                  {/* ⬆️ 강화 레벨 표시 (이미지 칸 우상단) */}
                  {upgradeLevel > 0 && upgradeAura && (
                    <div 
                      className="absolute top-1 right-1 z-20 px-2.5 py-1 rounded-full font-bold text-sm animate-pulse"
                      style={{
                        background: `linear-gradient(135deg, ${upgradeAura.color}, ${upgradeAura.pulseColor})`,
                        boxShadow: `${upgradeAura.glow}, 0 4px 12px rgba(0,0,0,0.8)`,
                        color: "white",
                        textShadow: "0 2px 4px rgba(0,0,0,0.8)"
                      }}
                    >
                      +{upgradeLevel}
                    </div>
                  )}

                  <PlayerImage
                    imageFileName={card.image}
                    playerName={card.name}
                    position={card.position}
                    gradeColor={gradeColor}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* OVR 배지 */}
                  <div 
                    className="absolute bottom-1.5 right-1.5 px-2 py-1 rounded-lg backdrop-blur-sm"
                    style={{
                      background: `linear-gradient(135deg, ${gradeColor}EE 0%, ${gradeColor}CC 100%)`,
                      color: card.grade === "S" || card.grade === "A" ? "#0A0E27" : "#FFFFFF",
                      boxShadow: `0 2px 8px ${gradeColor}AA, inset 0 1px 1px rgba(255,255,255,0.5)`,
                      border: `1px solid rgba(255, 255, 255, 0.3)`
                    }}
                  >
                    <div className="text-[8px] font-bold tracking-wide leading-none">OVR</div>
                    <div className="text-xl font-display font-bold leading-none flex items-baseline gap-0.5 mt-0.5">
                      <span style={{ color: synergyBonus && synergyBonus.ovr > 0 ? "#9333EA" : undefined }}>
                        {displayOVR}
                      </span>
                      {synergyBonus && synergyBonus.ovr > 0 && (
                        <span className="text-xs font-black" style={{ color: "#9333EA" }}>(+{synergyBonus.ovr})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 하단: 선수 정보 - 고정 높이 */}
              <div className="flex-shrink-0 space-y-1.5">
                {/* 팀명 */}
                <div 
                  className="text-[10px] text-[#FFB81C] font-bold truncate px-2 py-0.5 rounded overflow-hidden"
                  style={{
                    background: `linear-gradient(90deg, ${gradeColor}22 0%, transparent 100%)`
                  }}
                >
                  {card.team}
                </div>
                
                {/* 선수명 */}
                <div className="relative overflow-hidden">
                  <div 
                    className="text-base font-bold text-white truncate leading-tight px-2 py-0.5 rounded overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)`,
                      textShadow: `0 1px 4px rgba(0, 0, 0, 0.8), 0 0 12px ${gradeColor}66`
                    }}
                  >
                    {card.name}
                  </div>
                </div>

                {/* 스탯 바 */}
                <div 
                  className="grid grid-cols-3 gap-1 pt-1.5 border-t rounded overflow-hidden"
                  style={{
                    borderColor: `${gradeColor}66`,
                    background: `linear-gradient(to bottom, ${gradeColor}11, transparent)`
                  }}
                >
                  <div className="text-center overflow-hidden">
                    <div className="text-[8px] text-[#8B95B5] font-bold mb-0.5 truncate">메카닉</div>
                    <div 
                      className="text-xs font-display font-bold px-1 py-0.5 rounded flex items-center justify-center gap-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                        color: synergyBonus && synergyBonus.mec > 0 ? "#9333EA" : gradeColor,
                        boxShadow: `inset 0 1px 1px ${gradeColor}44`
                      }}
                    >
                      <span>{card.stats.mechanics + (synergyBonus?.mec || 0)}</span>
                      {synergyBonus && synergyBonus.mec > 0 && (
                        <span className="text-[9px] font-black">(+{synergyBonus.mec})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center overflow-hidden">
                    <div className="text-[8px] text-[#8B95B5] font-bold mb-0.5 truncate">한타</div>
                    <div 
                      className="text-xs font-display font-bold px-1 py-0.5 rounded flex items-center justify-center gap-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                        color: synergyBonus && synergyBonus.tf > 0 ? "#9333EA" : gradeColor,
                        boxShadow: `inset 0 1px 1px ${gradeColor}44`
                      }}
                    >
                      <span>{card.stats.teamfight + (synergyBonus?.tf || 0)}</span>
                      {synergyBonus && synergyBonus.tf > 0 && (
                        <span className="text-[9px] font-black">(+{synergyBonus.tf})</span>
                      )}
                    </div>
                  </div>
                  <div className="text-center overflow-hidden">
                    <div className="text-[8px] text-[#8B95B5] font-bold mb-0.5 truncate">클러치</div>
                    <div 
                      className="text-xs font-display font-bold px-1 py-0.5 rounded flex items-center justify-center gap-0.5"
                      style={{
                        background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                        color: synergyBonus && synergyBonus.clu > 0 ? "#9333EA" : gradeColor,
                        boxShadow: `inset 0 1px 1px ${gradeColor}44`
                      }}
                    >
                      <span>{card.stats.clutch + (synergyBonus?.clu || 0)}</span>
                      {synergyBonus && synergyBonus.clu > 0 && (
                        <span className="text-[9px] font-black">(+{synergyBonus.clu})</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Highlight */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)`
              }}
            />
          </div>
        </div>

        {/* 뒷면 (5각형 레이더 차트) */}
        <div
          className="absolute inset-0"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)"
          }}
        >
          <div 
            className="w-full h-full relative rounded-2xl overflow-hidden"
            style={{
              background: `
                linear-gradient(135deg, 
                  ${gradeColor}22 0%, 
                  #0A0E27 30%,
                  #141B3D 70%,
                  ${gradeColor}11 100%
                )
              `,
              ...getBorderStyle()
            }}
          >
            {/* 다이아몬드 패턴 배경 */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: `
                  repeating-linear-gradient(45deg, ${gradeColor}33 0, ${gradeColor}33 2px, transparent 2px, transparent 10px),
                  repeating-linear-gradient(-45deg, ${gradeColor}33 0, ${gradeColor}33 2px, transparent 2px, transparent 10px)
                `
              }}
            />

            {/* 뒷면 콘텐츠 */}
            <div className="relative z-10 h-full flex flex-col p-4">
              {/* 상단: 선수 정보 */}
              <div className="text-center mb-3">
                <div className="text-xl font-bold">{card.name}</div>
                <div className="text-sm text-[#9AA6C3]">{card.team} • {card.year}</div>
                <div
                  className="inline-block px-3 py-1 rounded-full text-xs font-bold mt-2"
                  style={{
                    background: gradeColor,
                    color: card.grade === "S" || card.grade === "A" ? "#0A0E27" : "#FFFFFF"
                  }}
                >
                  {card.grade} • {POSITION_NAMES[card.position]}
                </div>
              </div>

              {/* OVR 표시 */}
              <div className="text-center mb-2">
                <div className="text-sm text-[#9AA6C3]">OVERALL</div>
                <div className="text-4xl font-display font-bold flex items-baseline justify-center gap-1" style={{ color: synergyBonus && synergyBonus.ovr > 0 ? "#9333EA" : gradeColor }}>
                  <span>{displayOVR}</span>
                  {synergyBonus && synergyBonus.ovr > 0 && (
                    <span className="text-2xl font-black">(+{synergyBonus.ovr})</span>
                  )}
                </div>
              </div>

              {/* 5각형 레이더 차트 */}
              <div className="flex-1 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData} margin={{ top: 10, right: 25, bottom: 10, left: 25 }}>
                    <PolarGrid stroke="#2B6CFF" strokeOpacity={0.3} />
                    <PolarAngleAxis 
                      dataKey="stat" 
                      tick={{ fill: "#9AA6C3", fontSize: 11, fontWeight: "bold" }}
                    />
                    {/* 최대값 100으로 고정 - 넘치는 값은 밖으로 표시 */}
                    <defs>
                      <linearGradient id={`radarGradient-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={gradeColor} stopOpacity={0.8} />
                        <stop offset="100%" stopColor={gradeColor} stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <Radar
                      name="Stats"
                      dataKey="value"
                      stroke={gradeColor}
                      fill={`url(#radarGradient-${card.id})`}
                      fillOpacity={0.6}
                      strokeWidth={3}
                      dot={{ 
                        fill: gradeColor, 
                        strokeWidth: 2, 
                        stroke: "#FFFFFF",
                        r: 4 
                      }}
                    />
                    {/* 기준선 100 표시 */}
                    <Radar
                      dataKey={() => 100}
                      stroke="#FFB81C"
                      fill="transparent"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      strokeOpacity={0.3}
                      dot={false}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* 하단: 스탯 숫자 */}
              <div className="grid grid-cols-5 gap-1 text-xs mt-2">
                {radarData.map((stat, idx) => {
                  const bonus = stat.value - stat.base;
                  return (
                    <div key={idx} className="text-center bg-black/40 rounded p-1.5">
                      <div className="text-[#9AA6C3] text-[10px] mb-0.5 whitespace-nowrap">{stat.stat}</div>
                      <div className="font-bold text-sm flex flex-col items-center" style={{ color: bonus > 0 ? "#9333EA" : gradeColor }}>
                        <span>{stat.value}</span>
                        {bonus > 0 && (
                          <span className="text-[10px] font-black">(+{bonus})</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 🔧 강화 버튼 (카드 중앙 오버레이) */}
            {showUpgradeButton && onBackClick && (
              <div className="absolute inset-0 flex items-center justify-center z-20 animate-fadeIn">
                {/* 반투명 배경 */}
                <div className="absolute inset-0 bg-black/70 backdrop-blur-sm rounded-2xl" />
                
                {/* 강화 버튼 */}
                <button
                  onClick={handleUpgradeClick}
                  className="relative z-30 py-3 px-6 rounded-lg font-bold text-base transition-all hover:scale-105 active:scale-95 shadow-2xl"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColor} 0%, ${gradeColor}DD 50%, ${gradeColor} 100%)`,
                    color: card.grade === "S" || card.grade === "A" ? "#0A0E27" : "#FFFFFF",
                    boxShadow: `0 8px 32px ${gradeColor}99, 0 0 60px ${gradeColor}66, inset 0 2px 4px rgba(255,255,255,0.4), inset 0 -2px 4px rgba(0,0,0,0.4)`
                  }}
                >
                  강화하기
                </button>
              </div>
            )}

            {/* Edge Highlight */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl"
              style={{
                boxShadow: `inset 0 1px 2px rgba(255, 255, 255, 0.3), inset 0 -1px 2px rgba(0, 0, 0, 0.3)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}