// 경기 시뮬레이션 페이지 - 롤 대회 밴픽 스타일

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team, MatchSimulationState, LEAGUE_CONFIGS } from "@/types/league";
import { initializeMatch, processNextTurn, generateMatchResult } from "@/utils/matchSimulation";
import { ArrowLeft, Trophy, Skull, Target, Flame } from "lucide-react";
import { getKoreanTeamName } from "@/utils/teamNames";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { PlayerImage } from "@/components/PlayerImage";
import { GRADE_COLORS } from "@/types/lck";
import banpickBg from "figma:asset/84d25d704c0f83501dcee13067e3c15b13156a1e.png";

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

  // 시너지 계산
  const homeSynergies = calculateSynergies(homeTeam.squad);
  const awaySynergies = calculateSynergies(awayTeam.squad);
  const homeCardBonuses = calculateCardSynergyBonuses(homeTeam.squad, homeSynergies);
  const awayCardBonuses = calculateCardSynergyBonuses(awayTeam.squad, awaySynergies);

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

  const homeScore = simulation.state.kills.home;
  const awayScore = simulation.state.kills.away;
  
  const winner = simulation.winnerId === homeTeam.id ? homeTeam : awayTeam;
  const isPlayerWin = simulation.winnerId === currentLeague?.playerTeamId;

  // 팀 로고 fallback
  const getTeamLogo = (teamName: string) => {
    // TODO: 실제 팀 로고 매핑 로직 (현재는 placeholder)
    return null;
  };

  return (
    <div className="h-screen bg-[#0A0E27] text-white flex flex-col overflow-hidden">
      {/* 상단 헤더 - 밴픽 스타일 */}
      <div className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-b from-[#0A0E27] via-[#0A0E27] to-[#0A0E27]/95 backdrop-blur">
        <div className="px-6 py-4">
          {/* 뒤로가기 버튼 */}
          <div className="absolute left-4 top-4">
            <Button 
              onClick={onBack} 
              variant="ghost" 
              size="sm" 
              className="text-slate-400 hover:text-white"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              리그로
            </Button>
          </div>

          {/* 메인 헤더: 팀 로고 + 팀명 + 스코어 */}
          <div className="flex items-center justify-center gap-8">
            {/* 블루팀 (홈) */}
            <div className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all ${
              isPlayerTeam(homeTeam.id) 
                ? 'bg-amber-500/15 border border-amber-500/40' 
                : 'bg-blue-500/10 border border-blue-500/30'
            }`}>
              {/* 팀 로고 */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-blue-400/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {getTeamLogo(homeTeam.name) ? (
                  <img src={getTeamLogo(homeTeam.name)!} alt={homeTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xl font-bold text-blue-400">
                    {getKoreanTeamName(homeTeam.name).substring(0, 1)}
                  </div>
                )}
              </div>
              
              {/* 팀명 + OVR */}
              <div className="text-right">
                <div className="text-xl font-bold text-white mb-0.5">
                  {getKoreanTeamName(homeTeam.name)}
                </div>
                <div className="text-xs text-slate-400">
                  OVR {getTeamTotalOVR(homeTeam)}
                </div>
              </div>
            </div>

            {/* 중앙 스코어 */}
            <div className="flex flex-col items-center gap-2">
              {/* 리그 정보 */}
              <div className="text-xs text-slate-500 font-medium tracking-wider">
                {currentLeague && LEAGUE_CONFIGS[currentLeague.leagueType].name.toUpperCase()}
              </div>
              
              {/* 스코어 */}
              <div className="flex items-center gap-6 px-8 py-3 bg-black/40 rounded-xl border border-white/10">
                <div className="text-5xl font-bold text-blue-400 tabular-nums min-w-[3rem] text-center">
                  {homeScore}
                </div>
                <div className="text-3xl text-slate-700 font-bold">:</div>
                <div className="text-5xl font-bold text-red-400 tabular-nums min-w-[3rem] text-center">
                  {awayScore}
                </div>
              </div>
              
              {/* 게임 타임 */}
              <div className="text-xs text-slate-400 font-mono">
                {formatGameTime(gameTime)}
              </div>
            </div>

            {/* 레드팀 (어웨이) */}
            <div className={`flex items-center gap-4 px-6 py-3 rounded-xl transition-all ${
              isPlayerTeam(awayTeam.id) 
                ? 'bg-amber-500/15 border border-amber-500/40' 
                : 'bg-red-500/10 border border-red-500/30'
            }`}>
              {/* 팀명 + OVR */}
              <div className="text-left">
                <div className="text-xl font-bold text-white mb-0.5">
                  {getKoreanTeamName(awayTeam.name)}
                </div>
                <div className="text-xs text-slate-400">
                  OVR {getTeamTotalOVR(awayTeam)}
                </div>
              </div>
              
              {/* 팀 로고 */}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border-2 border-red-400/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                {getTeamLogo(awayTeam.name) ? (
                  <img src={getTeamLogo(awayTeam.name)!} alt={awayTeam.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-xl font-bold text-red-400">
                    {getKoreanTeamName(awayTeam.name).substring(0, 1)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 영역: 12컬럼 그리드 */}
      <div className="flex-1 grid grid-cols-12 overflow-hidden">
        {/* 좌측 패널 - 블루팀 선수 (3컬럼) */}
        <div className="col-span-3 border-r border-white/5 bg-gradient-to-b from-blue-500/5 to-transparent overflow-y-auto hidden xl:block">
          <div className="p-4">
            {/* 사이드 라벨 */}
            <div className="mb-4 pb-2 border-b border-blue-500/20">
              <div className="text-xs font-bold text-blue-400 tracking-widest">BLUE SIDE</div>
            </div>

            {/* 선수 리스트 - 밴픽 스타일 */}
            <div className="space-y-2">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = homeTeam.squad[pos];
                if (!card) return null;
                
                const bonus = homeCardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
                const finalOvr = card.stats.ovr + bonus.ovr;
                
                return (
                  <div 
                    key={pos} 
                    className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5 hover:border-blue-500/30 transition-all"
                  >
                    {/* 선수 썸네일 */}
                    <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border border-blue-500/30">
                      <PlayerImage
                        imageFileName={card.image}
                        playerName={card.name}
                        position={card.position}
                        gradeColor={GRADE_COLORS[card.grade].from}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 선수 정보 */}
                    <div className="flex-1 min-w-0">
                      {/* 포지션 */}
                      <div className="text-[10px] text-blue-400 font-bold mb-0.5 tracking-wider">
                        {pos}
                      </div>
                      {/* 닉네임 */}
                      <div className="text-sm font-bold text-white truncate mb-0.5">
                        {card.name}
                      </div>
                      {/* OVR */}
                      <div className="flex items-center gap-1.5">
                        <div className="text-base font-bold text-amber-400">
                          {finalOvr}
                        </div>
                        {bonus.ovr > 0 && (
                          <div className="text-[10px] font-bold text-green-400">
                            +{bonus.ovr}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {card.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 팀 오브젝트 */}
            <div className="mt-6 pt-4 border-t border-blue-500/20">
              <div className="text-xs font-bold text-slate-400 mb-3 tracking-wider">OBJECTIVES</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">KILLS</div>
                      <div className="text-lg font-bold">{simulation.state.kills.home}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">TOWERS</div>
                      <div className="text-lg font-bold">{simulation.state.towers.home}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">DRAGONS</div>
                      <div className="text-lg font-bold">{simulation.state.dragons.home}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">BARONS</div>
                      <div className="text-lg font-bold">{simulation.state.barons.home}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 중앙 영역 - 메인 디스플레이 (6컬럼) */}
        <div className="col-span-12 xl:col-span-6 relative overflow-hidden">
          {/* 배경 이미지 */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url(https://pqoqubbqakfxrwhximxb.supabase.co/storage/v1/object/public/ui_resources/summoners_rift.webp)`,
              opacity: 0.12,
              filter: 'blur(2px)'
            }}
          />
          
          {/* 그라디언트 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E27]/70 to-[#0A0E27]/90" />
          
          {/* 중앙 콘텐츠 */}
          <div className="relative h-full flex flex-col">
            {/* 상단 여백 (밴픽 스타일 연출용) */}
            <div className="flex-1" />
            
            {/* 경기 로그 영역 - 하단 */}
            <div className="h-80 p-6 overflow-hidden">
              <div className="h-full flex flex-col bg-black/40 backdrop-blur-md rounded-xl border border-white/10 p-4">
                <div className="text-xs font-bold text-slate-400 mb-3 tracking-wider">MATCH LOG</div>
                
                <div className="flex-1 overflow-y-auto space-y-2 custom-scrollbar pr-2">
                  {simulation.events.slice(-12).map((event, index) => (
                    <div 
                      key={index}
                      className={`p-2.5 rounded-lg text-xs transition-all duration-300 ${
                        event.type === "game_start" ? 'bg-blue-500/30 border border-blue-500/50' :
                        event.type === "game_end" ? 'bg-purple-500/30 border border-purple-500/50' :
                        event.type === "first_blood" || event.type === "clutch_moment" ? 
                          'bg-red-500/30 border border-red-500/50 font-semibold' :
                        event.type === "dragon_fight" || event.type === "baron_fight" ?
                          'bg-orange-500/30 border border-orange-500/50' :
                        event.team === "home" ? 
                          'bg-blue-500/20 border-l-2 border-blue-500' :
                          'bg-red-500/20 border-l-2 border-red-500'
                      }`}
                    >
                      <div className="flex gap-2 items-start">
                        <span className="text-slate-500 font-mono text-[10px] mt-0.5 flex-shrink-0">
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
        </div>

        {/* 우측 패널 - 레드팀 선수 (3컬럼) */}
        <div className="col-span-3 border-l border-white/5 bg-gradient-to-b from-red-500/5 to-transparent overflow-y-auto hidden xl:block">
          <div className="p-4">
            {/* 사이드 라벨 */}
            <div className="mb-4 pb-2 border-b border-red-500/20">
              <div className="text-xs font-bold text-red-400 tracking-widest">RED SIDE</div>
            </div>

            {/* 선수 리스트 - 밴픽 스타일 */}
            <div className="space-y-2">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                const card = awayTeam.squad[pos];
                if (!card) return null;
                
                const bonus = awayCardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
                const finalOvr = card.stats.ovr + bonus.ovr;
                
                return (
                  <div 
                    key={pos} 
                    className="flex items-center gap-3 p-2 rounded-lg bg-black/20 border border-white/5 hover:border-red-500/30 transition-all"
                  >
                    {/* 선수 썸네일 */}
                    <div className="w-14 h-14 rounded-md overflow-hidden flex-shrink-0 border border-red-500/30">
                      <PlayerImage
                        imageFileName={card.image}
                        playerName={card.name}
                        position={card.position}
                        gradeColor={GRADE_COLORS[card.grade].from}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* 선수 정보 */}
                    <div className="flex-1 min-w-0">
                      {/* 포지션 */}
                      <div className="text-[10px] text-red-400 font-bold mb-0.5 tracking-wider">
                        {pos}
                      </div>
                      {/* 닉네임 */}
                      <div className="text-sm font-bold text-white truncate mb-0.5">
                        {card.name}
                      </div>
                      {/* OVR */}
                      <div className="flex items-center gap-1.5">
                        <div className="text-base font-bold text-amber-400">
                          {finalOvr}
                        </div>
                        {bonus.ovr > 0 && (
                          <div className="text-[10px] font-bold text-green-400">
                            +{bonus.ovr}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500">
                          {card.grade}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 팀 오브젝트 */}
            <div className="mt-6 pt-4 border-t border-red-500/20">
              <div className="text-xs font-bold text-slate-400 mb-3 tracking-wider">OBJECTIVES</div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Skull className="w-3.5 h-3.5 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">KILLS</div>
                      <div className="text-lg font-bold">{simulation.state.kills.away}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5 text-slate-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">TOWERS</div>
                      <div className="text-lg font-bold">{simulation.state.towers.away}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-orange-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">DRAGONS</div>
                      <div className="text-lg font-bold">{simulation.state.dragons.away}</div>
                    </div>
                  </div>
                </div>
                <div className="bg-black/30 rounded-lg p-2 border border-white/5">
                  <div className="flex items-center gap-1.5">
                    <Trophy className="w-3.5 h-3.5 text-purple-500" />
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500">BARONS</div>
                      <div className="text-lg font-bold">{simulation.state.barons.away}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 모바일 하단 요약 (xl 미만에서만 표시) */}
      <div className="xl:hidden border-t border-white/5 bg-[#0A0E27]/95 p-3">
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
