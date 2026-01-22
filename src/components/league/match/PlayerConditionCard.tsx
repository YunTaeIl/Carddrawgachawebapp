// 선수 컨디션 카드 컴포넌트

import React from "react";
import { LCKCard, GRADE_COLORS } from "@/types/lck";
import { PlayerForm } from "@/types/advancedSimulation";
import { PlayerImage } from "@/components/PlayerImage";

interface PlayerConditionCardProps {
  card: LCKCard;
  position: "TOP" | "JGL" | "MID" | "ADC" | "SUP";
  playerForm?: PlayerForm;
  side: "home" | "away";
}

export function PlayerConditionCard({ card, position, playerForm, side }: PlayerConditionCardProps) {
  const baseOVR = card?.stats?.ovr || 0;
  const condition = playerForm?.condition || 70;
  const confidence = playerForm?.confidence || 70;
  const fatigue = playerForm?.fatigue || 30;
  
  // 컨디션 색상
  const getConditionColor = (value: number) => {
    if (value >= 70) return "text-green-400";
    if (value >= 50) return "text-yellow-400";
    return "text-red-400";
  };
  
  const borderColor = side === "home" ? "border-blue-500/30 hover:border-blue-500/60" : "border-red-500/30 hover:border-red-500/60";
  const tooltipBorder = side === "home" ? "border-blue-500/50" : "border-red-500/50";
  const tooltipPosition = side === "home" ? "left-full ml-2" : "right-full mr-2";
  
  return (
    <div 
      className={`bg-black/40 rounded-lg p-2 border ${borderColor} transition group relative`}
    >
      <div className="flex items-center gap-2">
        <div className="w-12 h-12 rounded-lg overflow-hidden border-2" style={{ borderColor: GRADE_COLORS[card.grade] }}>
          <PlayerImage
            imageFileName={card.image}
            playerName={card.name}
            position={position}
            gradeColor={GRADE_COLORS[card.grade]}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-400">{position}</div>
          <div className="text-sm font-bold truncate">{card.ign || card.name}</div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500">OVR {Math.round(baseOVR)}</div>
            <div className={`text-xs font-bold ${getConditionColor(condition)}`}>
              ⚡{Math.round(condition)}
            </div>
          </div>
        </div>
      </div>
      
      {/* 호버시 상세 컨디션 */}
      <div className={`absolute ${tooltipPosition} top-0 z-50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap`}>
        <div className={`bg-slate-900/95 border ${tooltipBorder} rounded-lg p-3 shadow-xl`}>
          <div className="text-xs font-bold text-slate-300 mb-2">{card.ign || card.name}</div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">컨디션</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${condition >= 70 ? 'bg-green-500' : condition >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${condition}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${getConditionColor(condition)}`}>
                  {Math.round(condition)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">자신감</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${confidence >= 70 ? 'bg-green-500' : confidence >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${confidence}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${getConditionColor(confidence)}`}>
                  {Math.round(confidence)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">피로도</span>
              <div className="flex items-center gap-2">
                <div className="w-16 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${fatigue >= 70 ? 'bg-red-500' : fatigue >= 50 ? 'bg-yellow-500' : 'bg-green-500'}`}
                    style={{ width: `${fatigue}%` }}
                  />
                </div>
                <span className={`text-xs font-bold ${fatigue >= 70 ? 'text-red-400' : fatigue >= 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                  {Math.round(fatigue)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="text-xs text-slate-500">
              {condition >= 70 && confidence >= 70 && "✅ 최상의 컨디션!"}
              {condition >= 50 && condition < 70 && "⚠️ 안정적인 플레이 필요"}
              {condition < 50 && "🔻 주의 필요 - 멘탈 케어 권장"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
