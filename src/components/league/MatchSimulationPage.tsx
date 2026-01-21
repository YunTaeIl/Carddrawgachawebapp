// 경기 시뮬레이션 페이지 /league/match

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team, MatchSimulationState, LEAGUE_CONFIGS } from "@/types/league";
import { initializeMatch, processNextTurn, generateMatchResult } from "@/utils/matchSimulation";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { Play, Pause, FastForward, ArrowLeft, Trophy } from "lucide-react";

interface MatchSimulationPageProps {
  homeTeam: Team;
  awayTeam: Team;
  onMatchComplete: () => void;
  onBack: () => void;
}

export function MatchSimulationPage({ 
  homeTeam, 
  awayTeam, 
  onMatchComplete,
  onBack 
}: MatchSimulationPageProps) {
  const { completeMatch, currentLeague } = useLeague();
  const [simulation, setSimulation] = useState<MatchSimulationState>(() => 
    initializeMatch(homeTeam, awayTeam)
  );
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulation.events]);

  // 자동 재생
  useEffect(() => {
    if (isAutoPlay && !simulation.isFinished) {
      const timer = setTimeout(() => {
        handleNextTurn();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, simulation.currentTurn, simulation.isFinished]);

  // 경기 종료 처리
  useEffect(() => {
    if (simulation.isFinished && !showResult) {
      setIsAutoPlay(false);
      setTimeout(() => {
        setShowResult(true);
      }, 1000);
    }
  }, [simulation.isFinished]);

  const handleNextTurn = () => {
    if (simulation.isFinished) return;
    setSimulation(prev => processNextTurn(prev));
  };

  const handleAutoPlay = () => {
    setIsAutoPlay(!isAutoPlay);
  };

  const handleFastForward = () => {
    let current = simulation;
    while (!current.isFinished && current.currentTurn < 50) {
      current = processNextTurn(current);
    }
    setSimulation(current);
  };

  const handleFinish = () => {
    const result = generateMatchResult(simulation);
    completeMatch(result);
    onMatchComplete();
  };

  const isPlayerTeam = (teamId: string) => {
    return currentLeague?.playerTeamId === teamId;
  };

  const winner = simulation.winnerId === homeTeam.id ? homeTeam : awayTeam;
  const isPlayerWin = simulation.winnerId === currentLeague?.playerTeamId;

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white relative overflow-hidden">
      {/* 배경 - 소환사의 협곡 이미지 (옵션) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0E27]/50 to-[#0A0E27] z-0" />

      {/* 헤더 */}
      <div className="relative z-10 bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-[#9AA6C3] hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                돌아가기
              </Button>
              <div>
                <h1 className="text-2xl font-bold font-display">경기 진행 중</h1>
                <p className="text-sm text-[#8B95B5]">
                  Turn {simulation.currentTurn} / ~{simulation.targetTurns}
                </p>
              </div>
            </div>

            {/* 컨트롤 버튼 */}
            {!simulation.isFinished && (
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleNextTurn}
                  variant="outline"
                  size="sm"
                  className="border-[#0047AB] text-[#0047AB] hover:bg-[#0047AB]/10"
                  disabled={isAutoPlay}
                >
                  다음 턴
                </Button>
                <Button
                  onClick={handleAutoPlay}
                  variant="outline"
                  size="sm"
                  className={`border-[#FFB81C] ${
                    isAutoPlay ? 'bg-[#FFB81C]/20 text-[#FFB81C]' : 'text-[#FFB81C]'
                  }`}
                >
                  {isAutoPlay ? (
                    <><Pause className="w-4 h-4 mr-1" /> 일시정지</>
                  ) : (
                    <><Play className="w-4 h-4 mr-1" /> 자동</>
                  )}
                </Button>
                <Button
                  onClick={handleFastForward}
                  variant="outline"
                  size="sm"
                  className="border-[#C8102E] text-[#C8102E] hover:bg-[#C8102E]/10"
                >
                  <FastForward className="w-4 h-4 mr-1" /> 빠르게
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="relative z-10 max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 홈팀 카드 (데스크톱) */}
          <div className="hidden lg:block">
            <div className={`bg-gradient-to-br ${
              isPlayerTeam(homeTeam.id) 
                ? 'from-[#FFB81C]/20 to-[#141B3D] border-[#FFB81C]' 
                : 'from-[#141B3D]/50 to-[#0A0E27] border-[#0047AB]/30'
            } rounded-2xl p-4 border-2`}>
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold font-display">{homeTeam.name}</h3>
                <p className="text-sm text-[#8B95B5]">OVR {homeTeam.stats.totalOVR}</p>
              </div>
              <div className="space-y-2">
                {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                  const card = homeTeam.squad[pos];
                  return card ? (
                    <div key={pos} className="bg-[#0A0E27]/50 rounded-lg p-2 flex items-center gap-2">
                      <div className="text-xs font-bold text-[#FFB81C] w-8">{pos}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{card.name}</div>
                        <div className="text-xs text-[#8B95B5]">{card.team}</div>
                      </div>
                      <div className="text-sm font-bold">{card.stats.ovr}</div>
                    </div>
                  ) : null;
                })}
              </div>

              {/* 홈팀 스탯 */}
              <div className="mt-4 bg-[#0A0E27]/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">킬</span>
                  <span className="font-bold">{simulation.state.kills.home}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">타워</span>
                  <span className="font-bold">{simulation.state.towers.home}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">드래곤</span>
                  <span className="font-bold">{simulation.state.dragons.home}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">바론</span>
                  <span className="font-bold">{simulation.state.barons.home}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 중앙 - 이벤트 로그 */}
          <div className="lg:col-span-1">
            <div className="bg-[#141B3D]/50 rounded-2xl p-4 border border-[#0047AB]/30 h-[600px] flex flex-col">
              <h3 className="text-lg font-bold font-display mb-3 flex items-center justify-between">
                <span>경기 로그</span>
                <span className="text-sm text-[#8B95B5]">Turn {simulation.currentTurn}</span>
              </h3>

              <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-2">
                {simulation.events.map((event, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      event.type === "game_start" 
                        ? 'bg-[#0047AB]/20 border border-[#0047AB]/50' 
                        : event.type === "game_end"
                        ? 'bg-[#C8102E]/20 border border-[#C8102E]/50'
                        : event.team === "home"
                        ? 'bg-[#10B981]/10 border-l-2 border-[#10B981]'
                        : 'bg-[#EF4444]/10 border-l-2 border-[#EF4444]'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs text-[#8B95B5] font-mono min-w-[3rem]">
                        T{event.turn}
                      </span>
                      <span className="flex-1">{event.message}</span>
                    </div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* 어웨이팀 카드 (데스크톱) */}
          <div className="hidden lg:block">
            <div className={`bg-gradient-to-br ${
              isPlayerTeam(awayTeam.id) 
                ? 'from-[#FFB81C]/20 to-[#141B3D] border-[#FFB81C]' 
                : 'from-[#141B3D]/50 to-[#0A0E27] border-[#0047AB]/30'
            } rounded-2xl p-4 border-2`}>
              <div className="text-center mb-3">
                <h3 className="text-xl font-bold font-display">{awayTeam.name}</h3>
                <p className="text-sm text-[#8B95B5]">OVR {awayTeam.stats.totalOVR}</p>
              </div>
              <div className="space-y-2">
                {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                  const card = awayTeam.squad[pos];
                  return card ? (
                    <div key={pos} className="bg-[#0A0E27]/50 rounded-lg p-2 flex items-center gap-2">
                      <div className="text-xs font-bold text-[#FFB81C] w-8">{pos}</div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{card.name}</div>
                        <div className="text-xs text-[#8B95B5]">{card.team}</div>
                      </div>
                      <div className="text-sm font-bold">{card.stats.ovr}</div>
                    </div>
                  ) : null;
                })}
              </div>

              {/* 어웨이팀 스탯 */}
              <div className="mt-4 bg-[#0A0E27]/50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">킬</span>
                  <span className="font-bold">{simulation.state.kills.away}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">타워</span>
                  <span className="font-bold">{simulation.state.towers.away}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">드래곤</span>
                  <span className="font-bold">{simulation.state.dragons.away}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[#8B95B5]">바론</span>
                  <span className="font-bold">{simulation.state.barons.away}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 - 간단한 스코어보드 */}
        <div className="lg:hidden mt-6 grid grid-cols-2 gap-4">
          <div className={`bg-gradient-to-br ${
            isPlayerTeam(homeTeam.id) 
              ? 'from-[#FFB81C]/20 to-[#141B3D] border-[#FFB81C]' 
              : 'from-[#141B3D]/50 to-[#0A0E27] border-[#0047AB]/30'
          } rounded-xl p-4 border`}>
            <h3 className="font-bold mb-2">{homeTeam.name}</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8B95B5]">킬</span>
                <span>{simulation.state.kills.home}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B95B5]">타워</span>
                <span>{simulation.state.towers.home}</span>
              </div>
            </div>
          </div>

          <div className={`bg-gradient-to-br ${
            isPlayerTeam(awayTeam.id) 
              ? 'from-[#FFB81C]/20 to-[#141B3D] border-[#FFB81C]' 
              : 'from-[#141B3D]/50 to-[#0A0E27] border-[#0047AB]/30'
          } rounded-xl p-4 border`}>
            <h3 className="font-bold mb-2">{awayTeam.name}</h3>
            <div className="text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8B95B5]">킬</span>
                <span>{simulation.state.kills.away}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8B95B5]">타워</span>
                <span>{simulation.state.towers.away}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 오버레이 */}
      {showResult && simulation.isFinished && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`bg-gradient-to-br ${
            isPlayerWin 
              ? 'from-[#10B981]/30 to-[#141B3D]' 
              : 'from-[#EF4444]/30 to-[#141B3D]'
          } rounded-2xl p-8 border-2 ${
            isPlayerWin ? 'border-[#10B981]' : 'border-[#EF4444]'
          } max-w-md w-full text-center`}>
            <Trophy className={`w-20 h-20 mx-auto mb-4 ${
              isPlayerWin ? 'text-[#10B981]' : 'text-[#EF4444]'
            }`} />
            
            <h2 className="text-4xl font-bold font-display mb-2">
              {isPlayerWin ? 'VICTORY' : 'DEFEAT'}
            </h2>
            
            <div className="mb-6">
              <p className="text-xl text-[#9AA6C3] mb-2">{winner.name} 승리</p>
              <p className="text-sm text-[#8B95B5]">
                {simulation.currentTurn} 턴만에 경기 종료
              </p>
            </div>

            {isPlayerWin && currentLeague && (
              <div className="bg-[#0A0E27]/50 rounded-xl p-4 mb-6">
                <p className="text-sm text-[#8B95B5] mb-2">획득 보상</p>
                <p className="text-2xl font-bold font-display text-[#FFB81C]">
                  +{LEAGUE_CONFIGS[currentLeague.leagueType].winPoints.toLocaleString()} RP
                </p>
              </div>
            )}

            <Button
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-[#0047AB] to-[#003D8F] 
                         hover:from-[#0047AB]/90 hover:to-[#003D8F]/90
                         shadow-lg font-display text-lg py-6 rounded-xl"
            >
              리그로 돌아가기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}