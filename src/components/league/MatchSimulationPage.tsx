// 경기 시뮬레이션 페이지

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team, MatchSimulationState, LEAGUE_CONFIGS } from "@/types/league";
import { initializeMatch, processNextTurn, generateMatchResult } from "@/utils/matchSimulation";
import { Play, Pause, FastForward, ArrowLeft } from "lucide-react";

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

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulation.events]);

  useEffect(() => {
    if (isAutoPlay && !simulation.isFinished) {
      const timer = setTimeout(() => {
        handleNextTurn();
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [isAutoPlay, simulation.currentTurn, simulation.isFinished]);

  useEffect(() => {
    if (simulation.isFinished && !showResult) {
      setIsAutoPlay(false);
      setTimeout(() => setShowResult(true), 1000);
    }
  }, [simulation.isFinished]);

  const handleNextTurn = () => {
    if (simulation.isFinished) return;
    setSimulation(prev => processNextTurn(prev));
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
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={onBack} variant="ghost" size="sm" className="text-slate-400">
                <ArrowLeft className="w-4 h-4 mr-2" />
                돌아가기
              </Button>
              <div>
                <h1 className="text-xl font-bold">경기 진행 중</h1>
                <p className="text-sm text-slate-400">Turn {simulation.currentTurn}</p>
              </div>
            </div>

            {!simulation.isFinished && (
              <div className="flex gap-2">
                <Button onClick={handleNextTurn} size="sm" variant="outline" disabled={isAutoPlay}>
                  다음
                </Button>
                <Button 
                  onClick={() => setIsAutoPlay(!isAutoPlay)} 
                  size="sm"
                  variant={isAutoPlay ? "default" : "outline"}
                >
                  {isAutoPlay ? <><Pause className="w-4 h-4 mr-1" /> 정지</> : <><Play className="w-4 h-4 mr-1" /> 자동</>}
                </Button>
                <Button onClick={handleFastForward} size="sm" variant="outline">
                  <FastForward className="w-4 h-4 mr-1" /> 빠르게
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 메인 */}
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* 홈팀 */}
          <div className={`rounded-2xl p-6 border ${
            isPlayerTeam(homeTeam.id) 
              ? 'bg-amber-500/10 border-amber-500/50' 
              : 'bg-slate-900/30 border-white/5'
          }`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{homeTeam.name}</h3>
              <div className="text-sm text-slate-400">OVR {homeTeam.stats.totalOVR}</div>
            </div>

            <div className="space-y-2 mb-4">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = homeTeam.squad[pos];
                return card ? (
                  <div key={pos} className="flex items-center gap-2 text-sm bg-black/20 rounded p-2">
                    <span className="text-xs text-slate-500 w-8">{pos}</span>
                    <span className="flex-1 truncate">{card.name}</span>
                    <span className="text-amber-400 font-bold">{card.stats.ovr}</span>
                  </div>
                ) : null;
              })}
            </div>

            <div className="bg-black/20 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">킬</span>
                <span className="font-bold">{simulation.state.kills.home}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">타워</span>
                <span className="font-bold">{simulation.state.towers.home}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">드래곤</span>
                <span className="font-bold">{simulation.state.dragons.home}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">바론</span>
                <span className="font-bold">{simulation.state.barons.home}</span>
              </div>
            </div>
          </div>

          {/* 로그 */}
          <div className="lg:col-span-1">
            <div className="bg-slate-900/30 rounded-2xl p-6 border border-white/5 h-[700px] flex flex-col">
              <h3 className="font-bold mb-4">경기 로그</h3>
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar">
                {simulation.events.map((event, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-sm ${
                      event.type === "game_start" ? 'bg-blue-500/20' :
                      event.type === "game_end" ? 'bg-red-500/20' :
                      event.team === "home" ? 'bg-emerald-500/10 border-l-2 border-emerald-500' :
                      'bg-red-500/10 border-l-2 border-red-500'
                    }`}
                  >
                    <div className="flex gap-2">
                      <span className="text-slate-500 font-mono text-xs">T{event.turn}</span>
                      <span>{event.message}</span>
                    </div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>

          {/* 어웨이팀 */}
          <div className={`rounded-2xl p-6 border ${
            isPlayerTeam(awayTeam.id) 
              ? 'bg-amber-500/10 border-amber-500/50' 
              : 'bg-slate-900/30 border-white/5'
          }`}>
            <div className="mb-4">
              <h3 className="text-xl font-bold mb-1">{awayTeam.name}</h3>
              <div className="text-sm text-slate-400">OVR {awayTeam.stats.totalOVR}</div>
            </div>

            <div className="space-y-2 mb-4">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = awayTeam.squad[pos];
                return card ? (
                  <div key={pos} className="flex items-center gap-2 text-sm bg-black/20 rounded p-2">
                    <span className="text-xs text-slate-500 w-8">{pos}</span>
                    <span className="flex-1 truncate">{card.name}</span>
                    <span className="text-amber-400 font-bold">{card.stats.ovr}</span>
                  </div>
                ) : null;
              })}
            </div>

            <div className="bg-black/20 rounded-lg p-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">킬</span>
                <span className="font-bold">{simulation.state.kills.away}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">타워</span>
                <span className="font-bold">{simulation.state.towers.away}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">드래곤</span>
                <span className="font-bold">{simulation.state.dragons.away}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">바론</span>
                <span className="font-bold">{simulation.state.barons.away}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 */}
      {showResult && simulation.isFinished && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`max-w-md w-full rounded-2xl p-8 border-2 text-center ${
            isPlayerWin 
              ? 'bg-emerald-500/20 border-emerald-500' 
              : 'bg-red-500/20 border-red-500'
          }`}>
            <div className="text-6xl mb-6">{isPlayerWin ? '🏆' : '💔'}</div>
            
            <h2 className="text-5xl font-bold font-display mb-4">
              {isPlayerWin ? 'VICTORY' : 'DEFEAT'}
            </h2>
            
            <p className="text-xl text-slate-300 mb-2">{winner.name} 승리</p>
            <p className="text-sm text-slate-400 mb-8">
              {simulation.currentTurn} 턴만에 경기 종료
            </p>

            {isPlayerWin && currentLeague && (
              <div className="bg-black/30 rounded-xl p-4 mb-8">
                <p className="text-sm text-slate-400 mb-1">획득 보상</p>
                <p className="text-3xl font-bold text-amber-400">
                  +{LEAGUE_CONFIGS[currentLeague.leagueType].winPoints.toLocaleString()}
                </p>
              </div>
            )}

            <Button onClick={handleFinish} className="w-full py-6 text-lg">
              리그로 돌아가기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
