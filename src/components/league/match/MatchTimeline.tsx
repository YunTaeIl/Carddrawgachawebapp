// 경기 타임라인 컴포넌트 (골드 차이 그래프 + 이벤트 마커)

import React, { useMemo } from "react";
import { GameSimulation, GameEvent } from "@/types/advancedSimulation";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceDot
} from "recharts";
import {
  Skull,
  Shield,
  Eye,
  Zap,
  Swords,
  Star,
  Target
} from "lucide-react";

interface MatchTimelineProps {
  game: GameSimulation;
  onEventClick?: (eventIndex: number) => void;
}

// 이벤트 타입별 아이콘 매핑
const EVENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  KILL: Skull,
  MULTIKILL: Star,
  TOWER_DESTROYED: Shield,
  DRAGON_SECURED: Target,
  BARON_SECURED: Eye,
  ELDER_SECURED: Zap,
  TEAMFIGHT: Swords
};

// 이벤트 타입별 색상
const EVENT_COLORS: Record<string, string> = {
  KILL: "#ef4444",
  MULTIKILL: "#f59e0b",
  TOWER_DESTROYED: "#64748b",
  DRAGON_SECURED: "#10b981",
  BARON_SECURED: "#8b5cf6",
  ELDER_SECURED: "#ec4899",
  TEAMFIGHT: "#f97316"
};

// 골드 포맷 함수 (소수점 제거)
function formatGold(gold: number): string {
  if (gold >= 1000) {
    return `${Math.round(gold / 1000)}k`;
  }
  return gold.toString();
}

export function MatchTimeline({ game, onEventClick }: MatchTimelineProps) {
  // 타임라인 데이터 변환 (초 -> 분)
  const chartData = useMemo(() => {
    if (!game.timeline || game.timeline.length === 0) {
      console.log("MatchTimeline: 타임라인 데이터 없음");
      return [];
    }
    console.log(`MatchTimeline: ${game.timeline.length}개 포인트 로드됨`);
    return game.timeline.map(point => ({
      time: point.time / 60, // 분 단위
      goldDiff: point.goldDiff,
      homeGold: point.homeGold,
      awayGold: point.awayGold
    }));
  }, [game.timeline]);

  // 주요 이벤트만 마커로 표시
  const markerEvents = useMemo(() => {
    return game.events.filter(event => {
      const types = [
        "KILL",
        "MULTIKILL",
        "TOWER_DESTROYED",
        "DRAGON_SECURED",
        "BARON_SECURED",
        "ELDER_SECURED",
        "TEAMFIGHT"
      ];
      return types.includes(event.type);
    });
  }, [game.events]);

  // 골드 차이 범위 계산
  const goldRange = useMemo(() => {
    const diffs = chartData.map(d => Math.abs(d.goldDiff));
    const max = Math.max(...diffs, 5000);
    return Math.ceil(max / 1000) * 1000;
  }, [chartData]);

  // 커스텀 툴팁
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const minutes = Math.floor(data.time);
    const seconds = Math.floor((data.time % 1) * 60);

    return (
      <div className="bg-slate-900/95 border border-white/20 rounded-lg p-3">
        <div className="text-xs text-slate-400 mb-2">
          {minutes}:{seconds.toString().padStart(2, "0")}
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-blue-400">블루</span>
            <span className="text-sm font-bold text-blue-400">
              {formatGold(data.homeGold)}
            </span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-red-400">레드</span>
            <span className="text-sm font-bold text-red-400">
              {formatGold(data.awayGold)}
            </span>
          </div>
          <div className="border-t border-white/10 pt-1 mt-1">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-slate-400">차이</span>
              <span className={`text-sm font-bold ${data.goldDiff > 0 ? "text-blue-400" : data.goldDiff < 0 ? "text-red-400" : "text-slate-400"}`}>
                {data.goldDiff > 0 ? "+" : ""}{formatGold(Math.abs(data.goldDiff))}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 데이터가 없으면 표시하지 않음
  if (!chartData || chartData.length === 0) {
    return (
      <div className="bg-black/60 rounded-xl border border-white/10 p-3">
        <div className="text-center text-slate-500 text-sm py-4">
          경기 데이터를 수집하는 중...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-black/60 rounded-xl border border-white/10 p-3">
      {/* 타이틀 */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-300">골드 차이 타임라인</h3>
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-blue-500 rounded-sm" />
            <span className="text-slate-400">블루</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-sm" />
            <span className="text-slate-400">레드</span>
          </div>
        </div>
      </div>

      {/* 그래프 */}
      <div className="relative">
        <ResponsiveContainer width="100%" height={140}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="goldDiffPositive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="goldDiffNegative" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.3} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              fontSize={11}
              tickFormatter={(value) => `${Math.floor(value)}분`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              domain={[-goldRange, goldRange]}
              tickFormatter={(value) => `${Math.round(value / 1000)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={0} stroke="#ffffff20" strokeWidth={1.5} />
            
            {/* 골드 차이 영역 */}
            <Area
              type="monotone"
              dataKey="goldDiff"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#goldDiffPositive)"
              fillOpacity={1}
            />
          </AreaChart>
        </ResponsiveContainer>

        {/* 이벤트 마커 오버레이 */}
        <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none">
          <div className="relative w-full h-full">
            {markerEvents.map((event, idx) => {
              // X 좌표: 시간 기준 (왼쪽 여백 고려)
              const maxTime = Math.max(game.currentTime, 60);
              const timePercent = (event.time / maxTime) * 85 + 12; // 차트 영역에 맞게 조정 (12% 시작, 97% 끝)
              
              // Y 좌표: 골드 차이 기준
              const goldDiffAtTime = game.timeline.find(p => p.time >= event.time)?.goldDiff || 0;
              const normalizedDiff = Math.max(-1, Math.min(1, goldDiffAtTime / goldRange)); // -1 ~ 1 범위
              const yPercent = 50 - (normalizedDiff * 35); // 중앙(50%) 기준으로 상하 35% 이동
              
              const Icon = EVENT_ICONS[event.type];
              const color = EVENT_COLORS[event.type];
              
              if (!Icon) return null;

              return (
                <button
                  key={idx}
                  onClick={() => onEventClick?.(idx)}
                  className="absolute pointer-events-auto group z-10"
                  style={{
                    left: `${Math.min(95, Math.max(5, timePercent))}%`,
                    top: `${Math.min(85, Math.max(15, yPercent))}%`,
                    transform: "translate(-50%, -50%)"
                  }}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all group-hover:scale-150 shadow-lg"
                    style={{
                      backgroundColor: color + "60",
                      borderColor: color,
                      boxShadow: `0 0 8px ${color}80`
                    }}
                  >
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  
                  {/* 호버 툴팁 */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                    <div className="bg-slate-900/95 border border-white/20 rounded px-3 py-1.5 text-xs shadow-xl">
                      <div className="text-slate-400 mb-0.5">
                        {Math.floor(event.time / 60)}:{(event.time % 60).toString().padStart(2, "0")}
                      </div>
                      <div className="text-white font-bold">
                        {getEventTypeName(event.type)}
                      </div>
                      {event.goldSwing > 0 && (
                        <div className={`text-xs mt-0.5 font-bold ${event.side === "home" ? "text-blue-400" : "text-red-400"}`}>
                          +{formatGold(event.goldSwing)} 골드
                        </div>
                      )}
                    </div>
                    <div
                      className="w-2 h-2 bg-slate-900 border-r border-b border-white/20 absolute top-full left-1/2 -translate-x-1/2 -translate-y-1/2 rotate-45"
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 이벤트 범례 */}
      <div className="flex items-center gap-2 mt-2 flex-wrap">
        {Object.entries(EVENT_ICONS).map(([type, Icon]) => {
          const count = markerEvents.filter(e => e.type === type).length;
          if (count === 0) return null;

          return (
            <div
              key={type}
              className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded text-xs"
            >
              <Icon className="w-3 h-3" style={{ color: EVENT_COLORS[type] }} />
              <span className="text-slate-400">{getEventTypeName(type)}</span>
              <span className="text-white font-bold">{count}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getEventTypeName(type: string): string {
  const names: Record<string, string> = {
    KILL: "킬",
    MULTIKILL: "멀티킬",
    TOWER_DESTROYED: "타워",
    DRAGON_SECURED: "드래곤",
    BARON_SECURED: "바론",
    ELDER_SECURED: "장로",
    TEAMFIGHT: "한타"
  };
  return names[type] || type;
}
