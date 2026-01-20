// 캡처 전용 카드 - LCKHoloCard 앞면 구조 그대로, 홀로그램 효과만 제거

import React, { useState } from "react";
import { LCKCard, GRADE_COLORS } from "@/types/lck";
import { PlayerImage } from "@/components/PlayerImage";
import { getTeamLogoUrls } from "@/utils/teamLogos";

interface StaticCardProps {
  card: LCKCard;
  size?: "small" | "medium";
  upgradeLevel?: number;
}

export function StaticCard({ card, size = "small", upgradeLevel = 0 }: StaticCardProps) {
  const [logoError, setLogoError] = useState(false);
  const [logoUrlIndex, setLogoUrlIndex] = useState(0);
  
  const teamLogoUrls = getTeamLogoUrls(card.year, card.team);
  const currentLogoUrl = teamLogoUrls[logoUrlIndex];
  
  const handleLogoError = () => {
    if (logoUrlIndex < teamLogoUrls.length - 1) {
      setLogoUrlIndex(logoUrlIndex + 1);
    } else {
      setLogoError(true);
    }
  };

  const sizeClasses = {
    small: "w-40 h-[293px]",
    medium: "w-60 h-[440px]",
  };
  
  const fontSizes = {
    small: {
      grade: "text-base",
      yearPos: "text-xs",
      logo: "w-6 h-6",
      teamName: "text-xs",
      playerName: "text-sm",
      ovr: "text-lg",
      stats: "text-[8px]"
    },
    medium: {
      grade: "text-2xl",
      yearPos: "text-lg",
      logo: "w-10 h-10",
      teamName: "text-sm",
      playerName: "text-xl",
      ovr: "text-3xl",
      stats: "text-[10px]"
    }
  };
  
  const currentFontSize = fontSizes[size];
  const gradeColor = GRADE_COLORS[card.grade];
  const displayOVR = card.stats.ovr + (upgradeLevel || 0);

  const getBorderStyle = () => {
    switch (card.grade) {
      case "S":
        return {
          border: `2px solid ${gradeColor}`,
          boxShadow: `0 0 20px ${gradeColor}99, 0 8px 40px rgba(0, 0, 0, 0.6)`
        };
      case "A":
        return {
          border: `2px solid ${gradeColor}`,
          boxShadow: `0 0 15px ${gradeColor}88, 0 8px 32px rgba(0, 0, 0, 0.5)`
        };
      default:
        return {
          border: `1px solid ${gradeColor}`,
          boxShadow: `0 8px 24px rgba(0, 0, 0, 0.4)`
        };
    }
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="w-full h-full relative">
        {/* 앞면만 */}
        <div className="absolute inset-0">
          {/* 카드 본체 */}
          <div 
            className="w-full h-full relative rounded-2xl overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${gradeColor}33 0%, #0A0E27 20%, #141B3D 50%, #0A0E27 80%, ${gradeColor}22 100%)`,
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

            {/* 헤더 */}
            <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
              {/* 좌측: 연도 + 포지션 */}
              <div className="space-y-1">
                <div className={`${currentFontSize.yearPos} text-[#9AA6C3] font-display`}>{card.year}</div>
                <div 
                  className={`${currentFontSize.yearPos} font-bold px-2 py-0.5 rounded font-display`}
                  style={{ backgroundColor: gradeColor, color: '#0A0E27' }}
                >
                  {card.position}
                </div>
              </div>

              {/* 우측: 등급 */}
              <div 
                className={`${currentFontSize.grade} font-bold px-3 py-1 rounded-lg font-display`}
                style={{ 
                  backgroundColor: gradeColor,
                  color: '#0A0E27',
                  boxShadow: `0 0 10px ${gradeColor}`
                }}
              >
                {card.grade}
              </div>
            </div>

            {/* 선수 이미지 */}
            <div className="absolute inset-x-0 top-[55px] bottom-[95px] flex items-center justify-center">
              <PlayerImage 
                playerName={card.name}
                year={card.year}
                team={card.team}
                className="w-full h-full object-contain"
              />
            </div>

            {/* 하단 정보 */}
            <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2"
              style={{
                background: 'linear-gradient(to top, rgba(10, 14, 39, 0.95), rgba(10, 14, 39, 0.7), transparent)'
              }}
            >
              {/* 팀 로고 & 이름 */}
              <div className="flex items-center gap-2">
                {!logoError && currentLogoUrl ? (
                  <img 
                    src={currentLogoUrl}
                    alt={card.team}
                    className={`${currentFontSize.logo} object-contain`}
                    onError={handleLogoError}
                  />
                ) : (
                  <div 
                    className={`${currentFontSize.logo} rounded-full flex items-center justify-center text-xs font-bold font-display`}
                    style={{ backgroundColor: gradeColor, color: '#0A0E27' }}
                  >
                    {card.team.substring(0, 2)}
                  </div>
                )}
                <span className={`${currentFontSize.teamName} text-[#9AA6C3] font-display`}>{card.team}</span>
              </div>

              {/* 선수명 */}
              <div className={`${currentFontSize.playerName} font-bold text-[#EAF0FF] truncate font-display`}>
                {card.name}
              </div>

              {/* OVR */}
              <div className="flex items-baseline gap-2">
                <span className="text-xs text-[#9AA6C3] font-display">OVR</span>
                <span 
                  className={`${currentFontSize.ovr} font-bold font-display`}
                  style={{ color: gradeColor }}
                >
                  {displayOVR}
                </span>
                {upgradeLevel > 0 && (
                  <span className="text-xs text-[#D4AF37] font-display">+{upgradeLevel}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}