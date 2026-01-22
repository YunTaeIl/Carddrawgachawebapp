// 경기 시뮬레이션 페이지 - LCK 중계 스타일

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team, MatchSimulationState, LEAGUE_CONFIGS } from "@/types/league";
import { initializeMatch, processNextTurn, generateMatchResult } from "@/utils/matchSimulation";
import { ArrowLeft, Trophy, Skull, Target, Flame } from "lucide-react";
import { getKoreanTeamName } from "@/utils/teamNames";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

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
  const [showResult, setShowResult] = useState(false);
  const [gameTime, setGameTime] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulation.events]);

  // 자동 진행 (진입 시 자동 시작)
  useEffect(() => {
    if (!simulation.isFinished) {
      const timer = setTimeout(() => {
        handleNextTurn();
      }, 1000); // 1초 간격으로 진행
      return () => clearTimeout(timer);
    }
  }, [simulation.currentTurn, simulation.isFinished]);

  // 게임 타이머
  useEffect(() => {
    if (!simulation.isFinished) {
      const timer = setInterval(() => {
        setGameTime(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [simulation.isFinished]);

  // 경기 종료 처리
  useEffect(() => {
    if (simulation.isFinished && !showResult) {
      setTimeout(() => setShowResult(true), 1500);
    }
  }, [simulation.isFinished]);

  const handleNextTurn = () => {
    if (simulation.isFinished) return;
    setSimulation(prev => processNextTurn(prev));
  };

  const handleFinish = () => {
    const result = generateMatchResult(simulation);
    completeMatch(result);
    onMatchComplete();
  };

  const isPlayerTeam = (teamId: string) => {
    return currentLeague?.playerTeamId === teamId;
  };

  // 팀의 시너지 적용된 총 OVR 계산
  const getTeamTotalOVR = (team: Team) => {
    const teamSynergies = calculateSynergies(team.squad);
    const teamCardBonuses = calculateCardSynergyBonuses(team.squad, teamSynergies);
    const synergyBonus = Object.values(teamCardBonuses).reduce((sum, bonus) => sum + (bonus?.ovr || 0), 0);
    return team.stats.totalOVR + synergyBonus;
  };

  // 게임 타이머 포맷 (mm:ss)
  const formatGameTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 유리함 바 계산 (0-100, 50이 중립)
  const calculateAdvantage = () => {
    const goldWeight = 0.6;
    const momentumWeight = 0.4;
    
    // goldLead를 -5000~5000 범위로 클램프하고 정규화
    const normalizedGold = Math.max(-5000, Math.min(5000, simulation.state.goldLead)) / 5000 * 50;
    // momentum을 -100~100 범위로 클램프하고 정규화
    const normalizedMomentum = Math.max(-100, Math.min(100, simulation.state.momentum)) / 100 * 50;
    
    const advantage = 50 + (normalizedGold * goldWeight + normalizedMomentum * momentumWeight);
    return Math.max(0, Math.min(100, advantage));
  };

  const advantage = calculateAdvantage();
  const homeScore = simulation.state.kills.home;
  const awayScore = simulation.state.kills.away;
  
  const winner = simulation.winnerId === homeTeam.id ? homeTeam : awayTeam;
  const isPlayerWin = simulation.winnerId === currentLeague?.playerTeamId;

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      {/* 상단 스코어보드 */}
      <div className="border-b border-white/10 bg-[#0A0E27]/95 backdrop-blur">
        <div className="px-4 py-3">
          {/* 매치 정보 + 돌아가기 */}
          <div className="flex items-center justify-between mb-3">
            <Button 
              onClick={onBack} 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white -ml-2"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              리그로
            </Button>
            
            <div className="text-center">
              <div className="text-xs text-slate-500">
                {currentLeague && LEAGUE_CONFIGS[currentLeague.leagueType].name}
              </div>
              <div className="text-xs text-slate-400 font-mono">
                {formatGameTime(gameTime)}
              </div>
            </div>
            
            <div className="w-20" /> {/* 균형 맞추기 */}
          </div>

          {/* 메인 스코어보드 */}
          <div className="flex items-center justify-center gap-6 mb-3">
            {/* 홈팀 */}
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${
              isPlayerTeam(homeTeam.id) 
                ? 'bg-amber-500/15 border border-amber-500/30' 
                : 'bg-blue-500/10 border border-blue-500/20'
            }`}>
              <div className="text-right">
                <div className="text-lg font-bold">{getKoreanTeamName(homeTeam.name)}</div>
                <div className="text-xs text-slate-400">OVR {getTeamTotalOVR(homeTeam)}</div>
              </div>
            </div>

            {/* 스코어 */}
            <div className="flex items-center gap-4 px-8 py-4 bg-black/30 rounded-xl border border-white/10">
              <div className="text-4xl font-bold text-blue-400">{homeScore}</div>
              <div className="text-2xl text-slate-600">:</div>
              <div className="text-4xl font-bold text-red-400">{awayScore}</div>
            </div>

            {/* 어웨이팀 */}
            <div className={`flex items-center gap-3 px-6 py-3 rounded-xl ${
              isPlayerTeam(awayTeam.id) 
                ? 'bg-amber-500/15 border border-amber-500/30' 
                : 'bg-red-500/10 border border-red-500/20'
            }`}>
              <div className="text-left">
                <div className="text-lg font-bold">{getKoreanTeamName(awayTeam.name)}</div>
                <div className="text-xs text-slate-400">OVR {getTeamTotalOVR(awayTeam)}</div>
              </div>
            </div>
          </div>

          {/* 유리함 바 */}
          <div className="max-w-2xl mx-auto">
            <div className="h-2 bg-black/30 rounded-full overflow-hidden relative">
              {/* 중앙 기준선 */}
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/20 z-10" />
              
              {/* 블루 사이드 (advantage > 50일 때 왼쪽에서 50% 이상 채움) */}
              <div 
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-500"
                style={{ width: `${advantage}%` }}
              />
              
              {/* 레드 사이드 (advantage < 50일 때 오른쪽에서 채움) */}
              <div 
                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-red-500 to-red-400 transition-all duration-500"
                style={{ width: `${100 - advantage}%` }}
              />
            </div>
            
            {/* 우세 표시 */}
            <div className="flex justify-center mt-1">
              {Math.abs(50 - advantage) > 5 && (
                <div className={`text-xs font-semibold ${
                  advantage > 50 ? 'text-blue-400' : 'text-red-400'
                }`}>
                  {advantage > 50 ? '블루 우세' : '레드 우세'} +{Math.abs(Math.round(advantage - 50))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 메인 영역 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 좌측 패널 - 홈팀 (블루) */}
        <div className={`w-80 border-r border-white/5 flex flex-col ${
          isPlayerTeam(homeTeam.id) ? 'bg-amber-500/5' : 'bg-blue-500/5'
        } hidden lg:flex`}>
          <div className="p-4 border-b border-white/5">
            <div className="text-sm font-bold text-slate-400 mb-3">BLUE SIDE</div>
            
            {/* 선수 리스트 */}
            <div className="space-y-3">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = homeTeam.squad[pos];
                if (!card) return null;
                
                // 디버깅: 이미지 URL 확인
                console.log(`[BLUE ${pos}] Name: ${card.name}, Image: ${card.image}`);
                
                return (
                  <div 
                    key={pos} 
                    className="flex items-center gap-4 bg-black/30 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all"
                  >
                    {/* 선수 사진 - 왼쪽 */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border-2 border-blue-500/30">
                      <ImageWithFallback
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 오른쪽: 닉네임 + OVR (2줄) */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      {/* 닉네임 + 포지션 */}
                      <div className="flex items-center gap-2">
                        <div className="text-base font-bold text-white">{card.name}</div>
                        <div className="px-2 py-0.5 text-xs font-bold text-blue-400 bg-blue-500/20 rounded">
                          {pos}
                        </div>
                      </div>
                      
                      {/* OVR */}
                      <div className="text-2xl font-bold text-amber-400">
                        {card.stats.ovr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 팀 지표 */}
          <div className="p-4 mt-auto">
            <div className="text-xs font-bold text-slate-400 mb-2">OBJECTIVES</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">킬</div>
                    <div className="text-xl font-bold">{simulation.state.kills.home}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">타워</div>
                    <div className="text-xl font-bold">{simulation.state.towers.home}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">드래곤</div>
                    <div className="text-xl font-bold">{simulation.state.dragons.home}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">바론</div>
                    <div className="text-xl font-bold">{simulation.state.barons.home}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 영역 - 배경 + 로그 */}
        <div className="flex-1 relative overflow-hidden">
          {/* 배경 이미지 */}
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-15"
            style={{
              backgroundImage: `url(https://pqoqubbqakfxrwhximxb.supabase.co/storage/v1/object/public/ui_resources/summoners_rift.webp)`,
              filter: 'blur(1px)'
            }}
          />
          
          {/* 로그 영역 */}
          <div className="relative h-full flex flex-col p-6">
            <div className="flex-1 overflow-hidden flex flex-col">
              <div className="text-sm font-bold text-slate-400 mb-3">MATCH LOG</div>
              
              <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                {simulation.events.map((event, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg text-sm backdrop-blur-sm transition-all duration-300 ${
                      event.type === "game_start" ? 'bg-blue-500/30 border border-blue-500/50' :
                      event.type === "game_end" ? 'bg-purple-500/30 border border-purple-500/50' :
                      event.type === "first_blood" || event.type === "clutch_moment" ? 
                        'bg-red-500/30 border border-red-500/50 font-semibold' :
                      event.type === "dragon_fight" || event.type === "baron_fight" ?
                        'bg-orange-500/30 border border-orange-500/50' :
                      event.team === "home" ? 
                        'bg-blue-500/20 border-l-4 border-blue-500' :
                        'bg-red-500/20 border-l-4 border-red-500'
                    }`}
                  >
                    <div className="flex gap-2 items-start">
                      <span className="text-slate-500 font-mono text-xs mt-0.5 flex-shrink-0">
                        {formatGameTime(event.turn * 2)}
                      </span>
                      <span className="flex-1">{event.message}</span>
                    </div>
                  </div>
                ))}
                <div ref={logEndRef} />
              </div>
            </div>
          </div>
        </div>

        {/* 우측 패널 - 어웨이팀 (레드) */}
        <div className={`w-80 border-l border-white/5 flex flex-col ${
          isPlayerTeam(awayTeam.id) ? 'bg-amber-500/5' : 'bg-red-500/5'
        } hidden lg:flex`}>
          <div className="p-4 border-b border-white/5">
            <div className="text-sm font-bold text-slate-400 mb-3">RED SIDE</div>
            
            {/* 선수 리스트 */}
            <div className="space-y-3">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = awayTeam.squad[pos];
                if (!card) return null;
                
                // 디버깅: 이미지 URL 확인
                console.log(`[RED ${pos}] Name: ${card.name}, Image: ${card.image}`);
                
                return (
                  <div 
                    key={pos} 
                    className="flex items-center gap-4 bg-black/30 rounded-xl p-4 border border-white/10 hover:border-red-500/30 transition-all"
                  >
                    {/* 선수 사진 - 왼쪽 */}
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-800 flex-shrink-0 border-2 border-red-500/30">
                      <ImageWithFallback
                        src={card.image}
                        alt={card.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 오른쪽: 닉네임 + OVR (2줄) */}
                    <div className="flex-1 flex flex-col justify-center gap-1.5">
                      {/* 닉네임 + 포지션 */}
                      <div className="flex items-center gap-2">
                        <div className="text-base font-bold text-white">{card.name}</div>
                        <div className="px-2 py-0.5 text-xs font-bold text-red-400 bg-red-500/20 rounded">
                          {pos}
                        </div>
                      </div>
                      
                      {/* OVR */}
                      <div className="text-2xl font-bold text-amber-400">
                        {card.stats.ovr}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 팀 지표 */}
          <div className="p-4 mt-auto">
            <div className="text-xs font-bold text-slate-400 mb-2">OBJECTIVES</div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Skull className="w-4 h-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">킬</div>
                    <div className="text-xl font-bold">{simulation.state.kills.away}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-slate-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">타워</div>
                    <div className="text-xl font-bold">{simulation.state.towers.away}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">드래곤</div>
                    <div className="text-xl font-bold">{simulation.state.dragons.away}</div>
                  </div>
                </div>
              </div>
              <div className="bg-black/20 rounded-lg p-2 border border-white/5">
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-purple-500" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500">바론</div>
                    <div className="text-xl font-bold">{simulation.state.barons.away}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 요약 (lg 미만에서만 표시) */}
      <div className="lg:hidden border-t border-white/5 bg-[#0A0E27]/95 p-3">
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <div className="font-bold text-blue-400">BLUE SIDE</div>
            <div className="flex gap-3">
              <span>킬 {simulation.state.kills.home}</span>
              <span>타워 {simulation.state.towers.home}</span>
              <span>용 {simulation.state.dragons.home}</span>
              <span>바론 {simulation.state.barons.home}</span>
            </div>
          </div>
          <div className="space-y-1">
            <div className="font-bold text-red-400">RED SIDE</div>
            <div className="flex gap-3">
              <span>킬 {simulation.state.kills.away}</span>
              <span>타워 {simulation.state.towers.away}</span>
              <span>용 {simulation.state.dragons.away}</span>
              <span>바론 {simulation.state.barons.away}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 결과 모달 */}
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
            
            <p className="text-xl text-slate-300 mb-2">{getKoreanTeamName(winner.name)} 승리</p>
            <p className="text-sm text-slate-400 mb-8">
              게임 시간: {formatGameTime(gameTime)}
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
