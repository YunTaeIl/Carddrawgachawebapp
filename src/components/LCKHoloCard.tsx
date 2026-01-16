// LCK 홀로그램 카드 (화려하면서 레이아웃 완벽 버전)

import React, { useRef, useState } from "react";
import { LCKCard, GRADE_COLORS, POSITION_NAMES } from "@/types/lck";

interface LCKHoloCardProps {
  card: LCKCard;
  size?: "small" | "medium" | "large";
  onClick?: () => void;
  upgradeLevel?: number;
}

export function LCKHoloCard({ card, size = "medium", onClick, upgradeLevel = 0 }: LCKHoloCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateY = ((x - centerX) / centerX) * 20;
    const rotateX = ((centerY - y) / centerY) * 20;
    
    setRotation({ x: rotateX, y: rotateY });
    setGlarePosition({ x: (x / rect.width) * 100, y: (y / rect.height) * 100 });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  const sizeClasses = {
    small: "w-40 h-[340px]",
    medium: "w-60 h-[440px]",
    large: "w-72 h-[520px]"
  };

  const gradeColor = GRADE_COLORS[card.grade];
  
  const displayOVR = card.stats.ovr + (upgradeLevel || 0);

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
      ref={cardRef}
      className={`${sizeClasses[size]} relative cursor-pointer perspective-1000`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        transform: `perspective(1200px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: "transform 0.15s ease-out"
      }}
    >
      {/* 외부 글로우 효과 */}
      <div 
        className="absolute inset-0 rounded-2xl blur-xl opacity-60 -z-10"
        style={{
          background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, ${gradeColor}66, transparent 70%)`
        }}
      />

      {/* 카드 본체 */}
      <div 
        className="w-full h-full relative rounded-2xl overflow-hidden transform-3d"
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

        {/* 홀로그램 레이어 */}
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

        {/* 레인보우 리플렉션 (S등급 전용) */}
        {card.grade === "S" && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(
                  ${Math.atan2(glarePosition.y - 50, glarePosition.x - 50)}rad,
                  rgba(255, 0, 0, 0.3),
                  rgba(255, 165, 0, 0.3),
                  rgba(255, 255, 0, 0.3),
                  rgba(0, 255, 0, 0.3),
                  rgba(0, 0, 255, 0.3),
                  rgba(75, 0, 130, 0.3),
                  rgba(238, 130, 238, 0.3)
                )
              `,
              mixBlendMode: "overlay",
              opacity: 0.4
            }}
          />
        )}

        {/* 반짝이는 파티클 효과 */}
        {(card.grade === "S" || card.grade === "A") && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 2}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: Math.random() * 0.6 + 0.2
                }}
              />
            ))}
          </div>
        )}

        {/* 카드 컨텐츠 - 정확한 레이아웃 */}
        <div className="relative z-10 h-full flex flex-col p-3">
          {/* 상단 헤더 - 고정 높이 */}
          <div className="flex-shrink-0 mb-2">
            <div className="flex items-start justify-between gap-2">
              {/* 등급 배지 */}
              <div
                className="relative px-2 py-1 rounded-lg font-bold text-xs shadow-lg flex-shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${gradeColor} 0%, ${gradeColor}CC 100%)`,
                  color: card.grade === "S" || card.grade === "A" ? "#0A0E27" : "#FFFFFF",
                  boxShadow: `0 2px 8px ${gradeColor}88, inset 0 1px 1px rgba(255,255,255,0.3)`
                }}
              >
                <div className="absolute inset-0 rounded-lg opacity-50"
                  style={{
                    background: `linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)`
                  }}
                />
                <span className="relative font-display tracking-wide">{card.grade}</span>
              </div>
              
              {/* 연도/포지션 */}
              <div className="text-right bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/20 flex-shrink-0">
                <div className="text-[10px] text-[#FFB81C] font-display font-bold leading-tight">{card.year}</div>
                <div className="text-[10px] font-bold text-white leading-tight">{POSITION_NAMES[card.position]}</div>
              </div>
            </div>
          </div>

          {/* 중앙: 이미지 영역 - flex-1로 남은 공간 차지 */}
          <div className="flex-1 relative mb-2 min-h-0">
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

              {card.image ? (
                <img 
                  src={card.image} 
                  alt={card.name} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center relative">
                  <div 
                    className="absolute inset-0 opacity-20"
                    style={{
                      backgroundImage: `
                        radial-gradient(circle at 30% 30%, ${gradeColor}66 0%, transparent 50%),
                        radial-gradient(circle at 70% 70%, ${gradeColor}44 0%, transparent 50%)
                      `
                    }}
                  />
                  <div 
                    className="text-5xl font-display font-bold opacity-40 relative z-10"
                    style={{ 
                      color: gradeColor,
                      textShadow: `0 0 15px ${gradeColor}88`
                    }}
                  >
                    {card.position}
                  </div>
                </div>
              )}
              
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
                  {displayOVR}
                  {upgradeLevel > 0 && (
                    <span className="text-xs text-green-300">+{upgradeLevel}</span>
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
                  className="text-xs font-display font-bold px-1 py-0.5 rounded"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                    color: gradeColor,
                    boxShadow: `inset 0 1px 1px ${gradeColor}44`
                  }}
                >
                  {card.stats.mechanics}
                </div>
              </div>
              <div className="text-center overflow-hidden">
                <div className="text-[8px] text-[#8B95B5] font-bold mb-0.5 truncate">한타</div>
                <div 
                  className="text-xs font-display font-bold px-1 py-0.5 rounded"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                    color: gradeColor,
                    boxShadow: `inset 0 1px 1px ${gradeColor}44`
                  }}
                >
                  {card.stats.teamfight}
                </div>
              </div>
              <div className="text-center overflow-hidden">
                <div className="text-[8px] text-[#8B95B5] font-bold mb-0.5 truncate">클러치</div>
                <div 
                  className="text-xs font-display font-bold px-1 py-0.5 rounded"
                  style={{
                    background: `linear-gradient(135deg, ${gradeColor}33 0%, ${gradeColor}11 100%)`,
                    color: gradeColor,
                    boxShadow: `inset 0 1px 1px ${gradeColor}44`
                  }}
                >
                  {card.stats.clutch}
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
  );
}