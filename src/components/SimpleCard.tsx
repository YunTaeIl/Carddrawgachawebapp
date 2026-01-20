// 캡처 전용 심플 카드 (홀로그램 효과 없음, 단색 앞면만)

import React from "react";
import { LCKCard, GRADE_COLORS, POSITION_NAMES } from "@/types/lck";
import { PlayerImage } from "@/components/PlayerImage";
import { getTeamLogoUrls } from "@/utils/teamLogos";

interface SimpleCardProps {
  card: LCKCard;
  size?: "small" | "medium";
  upgradeLevel?: number;
}

export function SimpleCard({ card, size = "small", upgradeLevel = 0 }: SimpleCardProps) {
  const [logoError, setLogoError] = React.useState(false);
  const [logoUrlIndex, setLogoUrlIndex] = React.useState(0);
  
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

  // 단순한 그라데이션 배경
  const cardStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, #0A0E27 0%, #141B3D 50%, #0A0E27 100%)`,
    border: `2px solid ${gradeColor}`,
    boxShadow: `0 4px 12px rgba(0, 0, 0, 0.5)`,
  };

  return (
    <div className={`${sizeClasses[size]} relative`}>
      <div 
        className="w-full h-full relative rounded-2xl overflow-hidden"
        style={cardStyle}
      >
        {/* 헤더 */}
        <div className="absolute top-0 left-0 right-0 p-3 flex justify-between items-start z-10">
          {/* 좌측: 연도 + 포지션 */}
          <div className="space-y-0.5">
            <div className={`${currentFontSize.yearPos} text-[#9AA6C3]`}>{card.year}</div>
            <div 
              className={`${currentFontSize.yearPos} font-bold px-2 py-0.5 rounded`}
              style={{ backgroundColor: gradeColor, color: '#0A0E27' }}
            >
              {card.position}
            </div>
          </div>

          {/* 우측: 등급 */}
          <div 
            className={`${currentFontSize.grade} font-bold px-3 py-1 rounded-lg`}
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
        <div className="absolute inset-x-0 top-[60px] bottom-[100px] flex items-center justify-center">
          <PlayerImage 
            playerName={card.name}
            year={card.year}
            team={card.team}
            className="w-full h-full object-contain"
          />
        </div>

        {/* 하단: 팀 로고 & 선수 정보 */}
        <div className="absolute bottom-0 left-0 right-0 p-3 space-y-2"
          style={{
            background: 'linear-gradient(to top, rgba(10, 14, 39, 0.95), transparent)'
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
                className={`${currentFontSize.logo} rounded-full flex items-center justify-center text-xs font-bold`}
                style={{ backgroundColor: gradeColor, color: '#0A0E27' }}
              >
                {card.team.substring(0, 2)}
              </div>
            )}
            <span className={`${currentFontSize.teamName} text-[#9AA6C3]`}>{card.team}</span>
          </div>

          {/* 선수명 */}
          <div className={`${currentFontSize.playerName} font-bold text-[#EAF0FF] truncate`}>
            {card.name}
          </div>

          {/* OVR */}
          <div className="flex items-baseline gap-2">
            <span className="text-xs text-[#9AA6C3]">OVR</span>
            <span 
              className={`${currentFontSize.ovr} font-bold`}
              style={{ color: gradeColor }}
            >
              {displayOVR}
            </span>
            {upgradeLevel > 0 && (
              <span className="text-xs text-[#D4AF37]">+{upgradeLevel}</span>
            )}
          </div>

          {/* 스탯 바 */}
          <div className="grid grid-cols-5 gap-1">
            {[
              { label: "메카닉", value: card.stats.mechanics, color: "#10B981" },
              { label: "라인전", value: card.stats.laning, color: "#3B82F6" },
              { label: "한타", value: card.stats.teamfight, color: "#8B5CF6" },
              { label: "운영", value: card.stats.macro, color: "#F59E0B" },
              { label: "클러치", value: card.stats.clutch, color: "#EF4444" },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-0.5">
                <div 
                  className="w-full h-1.5 rounded-full"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  }}
                >
                  <div 
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${(stat.value / 99) * 100}%`,
                      backgroundColor: stat.color,
                    }}
                  />
                </div>
                <span className={`${currentFontSize.stats} text-[#9AA6C3]`}>
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
