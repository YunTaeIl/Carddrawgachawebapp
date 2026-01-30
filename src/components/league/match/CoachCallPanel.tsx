// 감독 콜 패널 컴포넌트

import React from "react";
import { Button } from "@/app/components/ui/button";
import { GameSimulation, CoachCallType, CoachCall } from "@/types/advancedSimulation";
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

// 감독 콜 설정 (로컬 정의)
const COACH_CALL_CONFIGS: Record<CoachCallType, {
  cpCost: number;
  duration: number;
}> = {
  SAFE_PLAY: { cpCost: 15, duration: 3 },
  DIVE_CALL: { cpCost: 20, duration: 2 },
  INVADE_CALL: { cpCost: 18, duration: 2 },
  VISION_CONTROL: { cpCost: 12, duration: 4 },
  FORCE_OBJECTIVE: { cpCost: 25, duration: 2 },
  AVOID_FIGHT: { cpCost: 10, duration: 3 },
  START_BARON: { cpCost: 30, duration: 1 },
  BARON_FAKE: { cpCost: 15, duration: 1 }
};

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

// 모든 콜 타입 배열 (순서 보장)
const ALL_CALL_TYPES: CoachCallType[] = [
  "SAFE_PLAY",
  "DIVE_CALL",
  "INVADE_CALL",
  "VISION_CONTROL",
  "FORCE_OBJECTIVE",
  "AVOID_FIGHT",
  "START_BARON",
  "BARON_FAKE"
];

export function CoachCallPanel({
  game,
  side,
  onUseCall,
  disabled = false
}: CoachCallPanelProps) {
  const cp = side === "home" ? game.commandPoints.home : game.commandPoints.away;
  const activeCalls = side === "home" ? game.activeCalls.home : game.activeCalls.away;
  
  const cpPercentage = (cp.current / cp.max) * 100;

  // 🔥 감독 콜 사용 통계 불러오기
  const getCallStats = (): Record<CoachCallType, number> => {
    try {
      const saved = localStorage.getItem('coachCallStats');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('감독 콜 통계 불러오기 실패:', e);
    }
    return {} as Record<CoachCallType, number>;
  };

  const callStats = getCallStats();

  // 🔥 가장 많이 사용한 콜 3개 찾기
  const topCalls = Object.entries(callStats)
    .sort(([, a], [, b]) => (b as number) - (a as number))
    .slice(0, 3)
    .map(([call]) => call as CoachCallType);

  // 🔥 감독 콜 사용 시 통계 저장
  const handleCallWithStats = (callType: CoachCallType) => {
    onUseCall(callType);
    
    // 통계 업데이트
    try {
      const stats = getCallStats();
      stats[callType] = (stats[callType] || 0) + 1;
      localStorage.setItem('coachCallStats', JSON.stringify(stats));
    } catch (e) {
      console.error('감독 콜 통계 저장 실패:', e);
    }
  };

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
        {ALL_CALL_TYPES.map(callType => {
          const config = COACH_CALL_CONFIGS[callType];
          const Icon = CALL_ICONS[callType];
          const active = isCallActive(callType);
          const canAfford = canAffordCall(callType);
          const isDisabled = disabled || active || !canAfford;

          const isTopCall = topCalls.includes(callType);

          return (
            <button
              key={callType}
              onClick={() => !isDisabled && handleCallWithStats(callType)}
              disabled={isDisabled}
              className={`
                relative p-2 rounded-lg border transition-all text-left
                ${active
                  ? "bg-cyan-500/30 border-cyan-500 cursor-not-allowed"
                  : canAfford
                    ? isTopCall
                      ? "bg-slate-800/80 border-yellow-500/50 hover:border-yellow-400 hover:bg-slate-700 shadow-lg shadow-yellow-500/20"
                      : "bg-slate-800/80 border-slate-600 hover:border-cyan-500 hover:bg-slate-700"
                    : "bg-slate-900/50 border-slate-800 opacity-50 cursor-not-allowed"
                }
              `}
            >
              {/* 🔥 자주 사용하는 콜 표시 */}
              {isTopCall && !active && (
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                  <span className="text-[10px] font-bold text-slate-900">⭐</span>
                </div>
              )}
              
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${active ? "text-cyan-400" : canAfford ? isTopCall ? "text-yellow-400" : "text-slate-400" : "text-slate-600"}`} />
                <span className={`text-xs font-bold ${isTopCall && !active ? "text-yellow-400" : ""}`}>
                  {CALL_LABELS[callType]}
                </span>
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
      <div className="mt-3 space-y-1">
        <div className="text-xs text-slate-500 text-center">
          감독 콜은 일정 시간 동안 이벤트 확률을 변경합니다
        </div>
        {topCalls.length > 0 && (
          <div className="text-xs text-yellow-400/80 text-center flex items-center justify-center gap-1">
            <span>⭐</span>
            <span>자주 사용하는 콜</span>
          </div>
        )}
      </div>
    </div>
  );
}
