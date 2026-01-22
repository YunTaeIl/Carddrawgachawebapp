// 감독 콜 패널 컴포넌트

import React from "react";
import { Button } from "@/app/components/ui/button";
import { GameSimulation, CoachCallType, CoachCall } from "@/types/advancedSimulation";
import { COACH_CALL_CONFIGS } from "@/utils/simulationEngine";
import {
  Shield,
  Crosshair,
  Eye,
  Target,
  AlertTriangle,
  TrendingDown,
  Zap,
  Ghost
} from "lucide-react";

interface CoachCallPanelProps {
  game: GameSimulation;
  side: "home" | "away";
  onUseCall: (callType: CoachCallType) => void;
  disabled?: boolean;
}

const CALL_ICONS: Record<CoachCallType, React.ComponentType<{ className?: string }>> = {
  SAFE_PLAY: Shield,
  DIVE_CALL: Crosshair,
  INVADE_CALL: AlertTriangle,
  VISION_CONTROL: Eye,
  FORCE_OBJECTIVE: Target,
  AVOID_FIGHT: TrendingDown,
  START_BARON: Zap,
  BARON_FAKE: Ghost
};

const CALL_LABELS: Record<CoachCallType, string> = {
  SAFE_PLAY: "안전 운영",
  DIVE_CALL: "다이브",
  INVADE_CALL: "카정",
  VISION_CONTROL: "시야",
  FORCE_OBJECTIVE: "오브젝트",
  AVOID_FIGHT: "회피",
  START_BARON: "바론",
  BARON_FAKE: "페이크"
};

export function CoachCallPanel({
  game,
  side,
  onUseCall,
  disabled = false
}: CoachCallPanelProps) {
  const cp = side === "home" ? game.commandPoints.home : game.commandPoints.away;
  const activeCalls = side === "home" ? game.activeCalls.home : game.activeCalls.away;
  
  const cpPercentage = (cp.current / cp.max) * 100;

  const isCallActive = (callType: CoachCallType): boolean => {
    return activeCalls.some(call => call.type === callType);
  };

  const canAffordCall = (callType: CoachCallType): boolean => {
    const config = COACH_CALL_CONFIGS[callType];
    return cp.current >= config.cpCost;
  };

  const getCallRemainingTime = (callType: CoachCallType): number | null => {
    const activeCall = activeCalls.find(call => call.type === callType);
    if (!activeCall) return null;
    
    const elapsed = game.currentTime - activeCall.startedAtGameTime;
    const duration = activeCall.durationMinutes * 60;
    const remaining = duration - elapsed;
    
    return Math.max(0, remaining);
  };

  return (
    <div className="bg-black/60 rounded-xl p-4 border border-white/10">
      {/* CP 게이지 */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-slate-400 font-bold">COMMAND POINTS</span>
          <span className="text-sm font-bold text-cyan-400">
            {Math.floor(cp.current)} / {cp.max}
          </span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden border border-cyan-500/30">
          <div
            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-300"
            style={{ width: `${cpPercentage}%` }}
          />
        </div>
        <div className="text-xs text-slate-500 mt-1 text-right">
          +{cp.regenPerMinute.toFixed(1)}/분
        </div>
      </div>

      {/* 활성 콜 표시 */}
      {activeCalls.length > 0 && (
        <div className="mb-3 space-y-1">
          {activeCalls.map(call => {
            const remaining = getCallRemainingTime(call.type);
            const Icon = CALL_ICONS[call.type];
            
            return (
              <div
                key={call.id}
                className="flex items-center gap-2 bg-cyan-500/20 border border-cyan-500/40 rounded px-2 py-1"
              >
                <Icon className="w-3 h-3 text-cyan-400" />
                <span className="text-xs font-bold text-cyan-300 flex-1">
                  {CALL_LABELS[call.type]}
                </span>
                {remaining !== null && (
                  <span className="text-xs text-cyan-400">
                    {Math.floor(remaining)}초
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* 콜 버튼들 */}
      <div className="grid grid-cols-2 gap-2">
        {(Object.keys(COACH_CALL_CONFIGS) as CoachCallType[]).map(callType => {
          const config = COACH_CALL_CONFIGS[callType];
          const Icon = CALL_ICONS[callType];
          const active = isCallActive(callType);
          const canAfford = canAffordCall(callType);
          const isDisabled = disabled || active || !canAfford;

          return (
            <button
              key={callType}
              onClick={() => !isDisabled && onUseCall(callType)}
              disabled={isDisabled}
              className={`
                p-2 rounded-lg border transition-all text-left
                ${active
                  ? "bg-cyan-500/30 border-cyan-500 cursor-not-allowed"
                  : canAfford
                    ? "bg-slate-800/80 border-slate-600 hover:border-cyan-500 hover:bg-slate-700"
                    : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                }
              `}
            >
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : canAfford ? "text-slate-400" : "text-slate-600"}`} />
                <span className="text-xs font-bold">{CALL_LABELS[callType]}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs ${canAfford ? "text-cyan-400" : "text-red-400"}`}>
                  CP {config.cpCost}
                </span>
                <span className="text-xs text-slate-500">
                  {config.duration}분
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* 설명 */}
      <div className="mt-3 text-xs text-slate-500 text-center">
        감독 콜은 일정 시간 동안 이벤트 확률을 변경합니다
      </div>
    </div>
  );
}
