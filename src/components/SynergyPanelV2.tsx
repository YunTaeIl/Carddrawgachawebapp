// 시너지 패널 UI 컴포넌트

import React from "react";
import { ActiveSynergy } from "@/types/synergy";
import { Sparkles, Crown, Zap, TrendingUp, AlertCircle } from "lucide-react";

interface SynergyPanelProps {
  activeSynergies: ActiveSynergy[];
}

export function SynergyPanel({ activeSynergies }: SynergyPanelProps) {
  // 활성화된 시너지와 거의 활성화될 시너지 분리
  const activeOnes = activeSynergies.filter(s => s.isActive);
  const almostOnes = activeSynergies.filter(s => !s.isActive && s.matchedCount > 0);
  
  if (activeSynergies.length === 0) {
    return (
      <div className="bg-[#12182A] rounded-xl p-6 border border-[#2B6CFF]/30">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[#9AA6C3]" />
          <h3 className="text-lg font-bold text-[#EAF0FF]">시너지</h3>
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
        <h3 className="text-lg font-bold text-[#EAF0FF]">시너지</h3>
      </div>

      <div className="space-y-4">
        {/* 활성 시너지 */}
        {activeOnes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#10B981]" />
              <span className="text-xs font-bold text-[#10B981]">발동 중 ({activeOnes.length})</span>
            </div>
            <div className="space-y-2">
              {activeOnes.map((active) => (
                <SynergyCard key={active.synergy.synergy_id} active={active} />
              ))}
            </div>
          </div>
        )}
        
        {/* 거의 활성화 */}
        {almostOnes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-[#FFB81C]" />
              <span className="text-xs font-bold text-[#FFB81C]">발동 가능 ({almostOnes.length})</span>
            </div>
            <div className="space-y-2">
              {almostOnes.slice(0, 3).map((active) => (
                <SynergyCard key={active.synergy.synergy_id} active={active} isAlmost />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SynergyCard({ active, isAlmost = false }: { active: ActiveSynergy; isAlmost?: boolean }) {
  const { synergy, isPrime, currentEffect, missingRequirements } = active;
  
  // 타입별 아이콘
  const getTypeIcon = () => {
    switch (synergy.type) {
      case "ROSTER":
        return <Crown className="w-4 h-4" />;
      case "TRIO":
      case "DUO":
        return <Zap className="w-4 h-4" />;
      case "THEME":
        return <Sparkles className="w-4 h-4" />;
    }
  };
  
  // 타입별 색상
  const getTypeColor = () => {
    if (isAlmost) {
      return "bg-[#FFB81C]/10 border-[#FFB81C]/30";
    }
    
    switch (synergy.type) {
      case "ROSTER":
        return "bg-[#D4AF37]/10 border-[#D4AF37]/50";
      case "TRIO":
      case "DUO":
        return "bg-[#3B82F6]/10 border-[#3B82F6]/30";
      case "THEME":
        return "bg-[#A78BFA]/10 border-[#A78BFA]/30";
    }
  };
  
  return (
    <div className={`p-3 rounded-lg border ${getTypeColor()} ${!isAlmost && isPrime ? "ring-2 ring-[#C8102E]" : ""}`}>
      <div className="flex items-start gap-3">
        {/* 아이콘 */}
        <div className={`shrink-0 ${synergy.type === "ROSTER" ? "text-[#D4AF37]" : "text-[#9AA6C3]"}`}>
          {getTypeIcon()}
        </div>

        {/* 내용 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <h4 className="font-bold text-sm text-[#EAF0FF]">{synergy.synergy_name}</h4>
            
            {/* PRIME/LEGACY 배지 */}
            {!isAlmost && isPrime && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#C8102E] text-white">
                PRIME
              </span>
            )}
            
            {!isAlmost && !isPrime && synergy.year_value && (
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#8B95B5] text-white">
                LEGACY
              </span>
            )}
            
            {/* 타입 배지 */}
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#0A0E27] text-[#9AA6C3]">
              {synergy.type}
            </span>
          </div>
          
          <p className="text-xs text-[#9AA6C3] leading-relaxed mb-2">
            {synergy.description}
          </p>
          
          {/* 부족한 조건 (거의 활성화) */}
          {isAlmost && missingRequirements && missingRequirements.length > 0 && (
            <div className="flex items-start gap-1 text-[10px] text-[#FFB81C] mb-2">
              <AlertCircle className="w-3 h-3 flex-shrink-0 mt-0.5" />
              <span>{missingRequirements.join(", ")}</span>
            </div>
          )}
          
          {/* 효과 표시 (활성화된 것만) */}
          {!isAlmost && currentEffect && (
            <div className="flex items-center gap-2 flex-wrap text-[10px] mt-2">
              <div className="flex items-center gap-1 bg-[#0B0F1A] px-2 py-1 rounded">
                <TrendingUp className="w-3 h-3 text-[#10B981]" />
                <span className="text-[#10B981] font-bold">OVR +{currentEffect.ovr}</span>
              </div>
              {currentEffect.mec > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  메카닉 +{currentEffect.mec}
                </span>
              )}
              {currentEffect.lan > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  라인 +{currentEffect.lan}
                </span>
              )}
              {currentEffect.tf > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  한타 +{currentEffect.tf}
                </span>
              )}
              {currentEffect.mac > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  운영 +{currentEffect.mac}
                </span>
              )}
              {currentEffect.clu > 0 && (
                <span className="bg-[#0B0F1A] px-2 py-1 rounded text-[#9AA6C3]">
                  클러치 +{currentEffect.clu}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
