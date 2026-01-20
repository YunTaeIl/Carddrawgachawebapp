// 시너지 패널 UI (새 버전)

import React from "react";
import { ActiveSynergy, SynergyType } from "@/types/lck";
import { Sparkles, Users, Crown, Zap, TrendingUp } from "lucide-react";

interface SynergyPanelProps {
  activeSynergies: ActiveSynergy[];
}

export function SynergyPanel({ activeSynergies }: SynergyPanelProps) {
  if (activeSynergies.length === 0) {
    return (
      <div className="bg-[#12182A] rounded-xl p-6 border border-[#2B6CFF]/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#9AA6C3]" />
          <h3 className="text-lg font-bold text-[#EAF0FF]">활성 시너지</h3>
        </div>
        <p className="text-sm text-[#9AA6C3] text-center py-4">
          선수를 배치하면 시너지가 표시됩니다
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#12182A] rounded-xl p-6 border border-[#2B6CFF]/30">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#FFB81C]" />
        <h3 className="text-lg font-bold text-[#EAF0FF]">활성 시너지</h3>
        <span className="ml-auto bg-[#FFB81C] text-[#0B0F1A] px-2 py-0.5 rounded-full text-xs font-bold">
          {activeSynergies.length}개
        </span>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activeSynergies.map((active) => (
          <SynergyCard key={active.synergy.id} active={active} />
        ))}
      </div>
    </div>
  );
}

function SynergyCard({ active }: { active: ActiveSynergy }) {
  const { synergy, currentEffect, matchedCount } = active;
  
  // 타입별 아이콘
  const getTypeIcon = (type: SynergyType) => {
    switch (type) {
      case "DUO":
        return <Users className="w-4 h-4" />;
      case "TRIO":
        return <Users className="w-4 h-4" />;
      case "ROSTER":
        return <Crown className="w-4 h-4" />;
      case "THEME":
        return <Zap className="w-4 h-4" />;
    }
  };

  // 타입별 색상
  const getTypeColor = (type: SynergyType) => {
    switch (type) {
      case "DUO":
        return "text-[#10B981] border-[#10B981]/30 bg-[#10B981]/10";
      case "TRIO":
        return "text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10";
      case "ROSTER":
        return "text-[#FFD700] border-[#FFD700]/30 bg-[#FFD700]/10";
      case "THEME":
        return "text-[#A78BFA] border-[#A78BFA]/30 bg-[#A78BFA]/10";
    }
  };

  // 연도/팀 배지
  const getBadges = () => {
    const badges = [];
    
    if (synergy.yearRule === "EXACT" && synergy.yearValue) {
      badges.push(
        <span key="year" className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8102E] text-white">
          {synergy.yearValue} PRIME
        </span>
      );
    }
    
    if (synergy.type === "ROSTER" || synergy.priority >= 100) {
      badges.push(
        <span key="priority" className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#D4AF37] text-[#0B0F1A]">
          ★ LEGEND
        </span>
      );
    }
    
    return badges;
  };

  const typeColor = getTypeColor(synergy.type);

  return (
    <div
      className={`p-3 rounded-lg border ${typeColor} transition-all hover:scale-[1.02]`}
    >
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`shrink-0 ${synergy.type === "ROSTER" ? "text-[#FFD700]" : ""}`}>
          {getTypeIcon(synergy.type)}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-sm text-[#EAF0FF]">{synergy.name}</h4>
            {getBadges()}
            <span className="text-[10px] text-[#9AA6C3]">
              ({matchedCount}명)
            </span>
          </div>
          
          <p className="text-xs text-[#9AA6C3] leading-relaxed mb-2">
            {synergy.description}
          </p>
          
          {/* 효과 표시 */}
          {currentEffect && (
            <div className="flex items-center gap-2 flex-wrap text-[10px] mt-2">
              <div className="flex items-center gap-1 bg-[#0B0F1A] px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3 text-[#10B981]" />
                <span className="text-[#10B981] font-bold">OVR +{currentEffect.ovr}</span>
              </div>
              {currentEffect.mechanics > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  메카닉 +{currentEffect.mechanics}
                </span>
              )}
              {currentEffect.laning > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  라인 +{currentEffect.laning}
                </span>
              )}
              {currentEffect.teamfight > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  한타 +{currentEffect.teamfight}
                </span>
              )}
              {currentEffect.macro > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  운영 +{currentEffect.macro}
                </span>
              )}
              {currentEffect.clutch > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  클러치 +{currentEffect.clutch}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
