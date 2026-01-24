// 경기 중 시뮬레이션 화면

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { MatchSeries, CoachCallType } from "@/types/advancedSimulation";
import { processGameTick, useCoachCall } from "@/utils/simulationEngine";
import { finishCurrentSet } from "@/utils/simulationEngine";
import { getKoreanTeamName } from "@/utils/teamNames";
import { CoachCallPanel } from "./CoachCallPanel";
import { MatchTimeline } from "./MatchTimeline";
import { PlayerConditionCard } from "./PlayerConditionCard";
import { 
  Play, 
  Pause, 
  FastForward
} from "lucide-react";
import { projectId } from "/utils/supabase/info";

interface InGameSimulationPhaseProps {
  series: MatchSeries;
  setSeries: (series: MatchSeries) => void;
}

export function InGameSimulationPhase({
  series,
  setSeries
}: InGameSimulationPhaseProps) {
  const game = series.currentGame!;
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1); // 1x, 2x, 4x
  const [callMessage, setCallMessage] = useState<string | null>(null);
  const logEndRef = useRef<HTMLDivElement>(null);
  const eventRefs = useRef<(HTMLDivElement | null)[]>([]);

  // 자동 진행
  useEffect(() => {
    if (!isPlaying || game.isFinished) return;

    const interval = setInterval(() => {
      setSeries(prev => {
        if (!prev.currentGame || prev.currentGame.isFinished) return prev;
        
        const updatedGame = processGameTick(prev.currentGame);
        
        return {
          ...prev,
          currentGame: updatedGame
        };
      });
    }, 1000 / speed);

    return () => clearInterval(interval);
  }, [isPlaying, speed, game.isFinished]);

  // 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [game.events.length]);

  // 이벤트 refs 배열 크기 조정
  useEffect(() => {
    eventRefs.current = eventRefs.current.slice(0, game.events.length);
  }, [game.events.length]);

  // 게임 종료 시 자동으로 세트 완료 처리
  useEffect(() => {
    if (game.isFinished && isPlaying) {
      setIsPlaying(false);
      
      // 3초 후 자동으로 다음 단계로
      setTimeout(() => {
        const newSeries = finishCurrentSet(series);
        setSeries(newSeries);
      }, 3000);
    }
  }, [game.isFinished]);

  // 감독 콜 사용 핸들러
  const handleUseCall = (side: "home" | "away", callType: CoachCallType) => {
    setSeries(prev => {
      if (!prev.currentGame) return prev;
      
      const result = useCoachCall(prev.currentGame, side, callType);
      
      // 메시지 표시
      setCallMessage(result.message);
      setTimeout(() => setCallMessage(null), 3000);
      
      return {
        ...prev,
        currentGame: { ...prev.currentGame }
      };
    });
  };

  // 타임라인 이벤트 클릭 핸들러
  const handleEventClick = (eventIndex: number) => {
    const eventElement = eventRefs.current[eventIndex];
    if (eventElement) {
      eventElement.scrollIntoView({ behavior: "smooth", block: "center" });
      // 하이라이트 효과
      eventElement.classList.add("ring-2", "ring-yellow-400");
      setTimeout(() => {
        eventElement.classList.remove("ring-2", "ring-yellow-400");
      }, 2000);
    }
  };

  // 배경 이미지
  const bgImageUrl = `https://${projectId}.supabase.co/storage/v1/object/public/team-logo/summoners_rift.webp`;

  // 시간 포맷
  const formatTime = (seconds: number) => {
    if (seconds === undefined || seconds === null || isNaN(seconds)) {
      return "0:00";
    }
    const min = Math.floor(seconds / 60);
    const sec = Math.floor(seconds % 60);
    return `${min}:${sec.toString().padStart(2, '0')}`;
  };

  // 골드 포맷 (소수점 제거)
  const formatGold = (gold: number) => {
    if (gold === undefined || gold === null || isNaN(gold)) {
      return "0";
    }
    if (gold >= 1000) {
      return `${Math.round(gold / 1000)}k`;
    }
    return Math.round(gold).toString();
  };

  const homeTeam = game.homeTeam;
  const awayTeam = game.awayTeam;
  const state = game.gameState;

  return (
    <div className="w-full h-full relative">
      {/* 배경 */}
      <div 
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${bgImageUrl})` }}
      />
      
      <div className="relative w-full h-full flex">
        {/* 왼쪽: 홈팀 선수 */}
        <div className="w-72 bg-gradient-to-r from-blue-950/80 to-transparent p-4 space-y-3">
          <div className="text-center mb-4">
            <div className="text-sm text-blue-400 mb-1">BLUE SIDE</div>
            <div className="text-lg font-bold">{getKoreanTeamName(homeTeam.name)}</div>
          </div>
          
          {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
            const card = homeTeam?.squad?.[pos];
            if (!card) return null;
            
            const playerForm = game.form.home.players[card.id];
            
            return (
              <PlayerConditionCard
                key={pos}
                card={card}
                position={pos}
                playerForm={playerForm}
                side="home"
              />
            );
          })}
        </div>

        {/* 중앙: 메인 게임 뷰 */}
        <div className="flex-1 flex flex-col">
          {/* 상단 정보 바 */}
          <div className="h-24 bg-black/60 border-b border-white/10 flex items-center justify-between px-8">
            {/* 홈팀 스코어 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400">{state?.kills?.home || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">KILLS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{state?.towers?.home || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">TOWERS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{state?.dragons?.home || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">DRAGONS</div>
              </div>
            </div>

            {/* 중앙: 시간 + 골드 차이 */}
            <div className="text-center">
              <div className="text-3xl font-bold text-white mb-1">
                {formatTime(game?.currentTime || 0)}
              </div>
              <div className={`text-xl font-bold ${(state?.goldDiff || 0) > 0 ? 'text-blue-400' : (state?.goldDiff || 0) < 0 ? 'text-red-400' : 'text-slate-400'}`}>
                {(state?.goldDiff || 0) > 0 ? '+' : ''}{formatGold(Math.abs(state?.goldDiff || 0))}
              </div>
              <div className="text-xs text-slate-400 font-semibold">골드 차이</div>
            </div>

            {/* 어웨이팀 스코어 */}
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{state?.dragons?.away || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">DRAGONS</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-300">{state?.towers?.away || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">TOWERS</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-red-400">{state?.kills?.away || 0}</div>
                <div className="text-xs text-slate-400 font-semibold">KILLS</div>
              </div>
            </div>
          </div>

          {/* 승률 바 (양쪽 표시) */}
          <div className="h-8 bg-black/40 flex items-center px-8">
            <div className="flex-1 flex items-center gap-2">
              <span className="text-xs text-blue-400 w-12">{(state?.winProbHome || 50).toFixed(0)}%</span>
              <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                  style={{ width: `${state?.winProbHome || 50}%` }}
                />
                <div 
                  className="h-full bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                  style={{ width: `${100 - (state?.winProbHome || 50)}%` }}
                />
              </div>
              <span className="text-xs text-red-400 w-12 text-right">{(100 - (state?.winProbHome || 50)).toFixed(0)}%</span>
            </div>
          </div>

          {/* 타임라인 */}
          <div className="px-2 pt-2">
            <MatchTimeline game={game} onEventClick={handleEventClick} />
          </div>

          {/* 이벤트 로그 + 감독 콜 패널 */}
          <div className="flex-1 flex gap-2 p-2 min-h-0">
            {/* 왼쪽: 이벤트 로그 */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2 custom-scrollbar bg-black/20 rounded-lg max-h-full">
              {game?.events?.map((event, idx) => {
                if (!event) return null;
                return (
                  <div
                    key={idx}
                    ref={(el) => { eventRefs.current[idx] = el; }}
                    className={`
                      p-3 rounded-lg border-l-4 bg-black/30 transition-all
                      ${event.side === "home" ? "border-blue-500" : event.side === "away" ? "border-red-500" : "border-slate-600"}
                    `}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs text-slate-500">{formatTime(event.time)}</span>
                          {event.impactTags?.includes("huge_swing") && (
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                              대규모
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-white/90">{event.text || "이벤트 발생"}</p>
                      </div>
                      {event.goldSwing > 0 && (
                        <div className={`text-sm font-bold ml-4 ${event.side === "home" ? "text-blue-400" : "text-red-400"}`}>
                          +{formatGold(event.goldSwing)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={logEndRef} />
            </div>

            {/* 오른쪽: 감독 콜 패널 */}
            <div className="w-80 flex flex-col gap-2">
              {/* 콜 메시지 */}
              {callMessage && (
                <div className="bg-cyan-500/20 border border-cyan-500 rounded-lg p-3 text-center">
                  <p className="text-sm font-bold text-cyan-300">{callMessage}</p>
                </div>
              )}

              {/* 플레이어 팀 콜 패널 - 플레이어가 홈인지 어웨이인지 확인 */}
              <CoachCallPanel
                game={game}
                side={game.homeTeam.isPlayer ? "home" : "away"}
                onUseCall={(callType) => handleUseCall(game.homeTeam.isPlayer ? "home" : "away", callType)}
                disabled={!isPlaying || game.isFinished}
              />
            </div>
          </div>

          {/* 하단 컨트롤 */}
          <div className="h-20 bg-black/60 border-t border-white/10 flex items-center justify-center gap-4 px-8">
            <Button
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={game.isFinished}
              size="lg"
              className="px-8"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5 mr-2" />
                  일시정지
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  재생
                </>
              )}
            </Button>

            <div className="flex items-center gap-2 bg-black/40 px-4 py-2 rounded-lg">
              <FastForward className="w-4 h-4 text-slate-400" />
              {[1, 2, 4].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-3 py-1 rounded text-sm font-bold transition ${
                    speed === s 
                      ? "bg-blue-500 text-white" 
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>

            {game.isFinished && (
              <div className="ml-4 px-6 py-2 bg-green-500/20 border border-green-500 rounded-lg">
                <span className="text-green-400 font-bold">경기 종료!</span>
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 어웨이팀 선수 */}
        <div className="w-72 bg-gradient-to-l from-red-950/80 to-transparent p-4 space-y-3">
          <div className="text-center mb-4">
            <div className="text-sm text-red-400 mb-1">RED SIDE</div>
            <div className="text-lg font-bold">{getKoreanTeamName(awayTeam.name)}</div>
          </div>
          
          {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
            const card = awayTeam?.squad?.[pos];
            if (!card) return null;
            
            const playerForm = game.form.away.players[card.id];
            
            return (
              <PlayerConditionCard
                key={pos}
                card={card}
                position={pos}
                playerForm={playerForm}
                side="away"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
