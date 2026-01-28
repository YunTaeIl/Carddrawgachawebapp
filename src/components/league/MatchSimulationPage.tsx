// 경기 시뮬레이션 페이지 - 롤 대회 밴픽 스타일 (개선 버전)

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team, MatchSimulationState, LEAGUE_CONFIGS } from "@/types/league";
import { initializeMatch, processNextTurn, generateMatchResult } from "@/utils/matchSimulation";
import { X, Trophy, Skull, Target, Flame } from "lucide-react";
import { getKoreanTeamName } from "@/utils/teamNames";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { PlayerImage } from "@/components/PlayerImage";
import { GRADE_COLORS } from "@/types/lck";
import { projectId } from "/utils/supabase/info";

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
  const [gameEnded, setGameEnded] = useState(false); // 경기 종료 화면
  const [showRewardModal, setShowRewardModal] = useState(false); // 포인트 보상 모달
  const [gameTime, setGameTime] = useState(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  // 시너지 계산
  const homeSynergies = calculateSynergies(homeTeam.squad);
  const awaySynergies = calculateSynergies(awayTeam.squad);
  const homeCardBonuses = calculateCardSynergyBonuses(homeTeam.squad, homeSynergies);
  const awayCardBonuses = calculateCardSynergyBonuses(awayTeam.squad, awaySynergies);

  // 배경 이미지 URL (team-logo 버킷에서 로드)
  const bgImageUrl = `https://${projectId}.supabase.co/storage/v1/object/public/team-logo/summoners_rift.webp`;

  // 자동 스크롤
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [simulation.events]);

  // 자동 진행 (진입 시 자동 시작)
  useEffect(() => {
    if (!simulation.isFinished) {
      const timer = setTimeout(() => {
        handleNextTurn();
      }, 1000);
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

  // 경기 종료 처리 - 결과 화면만 표시
  useEffect(() => {
    if (simulation.isFinished && !gameEnded) {
      setTimeout(() => setGameEnded(true), 1500);
    }
  }, [simulation.isFinished]);

  const handleNextTurn = () => {
    if (simulation.isFinished) return;
    setSimulation(prev => processNextTurn(prev));
  };

  // 결과 확인 버튼 클릭 -> 포인트 즉시 지급 + 보상 모달 표시
  const handleConfirmResult = () => {
    const result = generateMatchResult(simulation);
    completeMatch(result); // 포인트 즉시 지급
    setShowRewardModal(true); // 보상 모달 표시
  };

  // 리그로 돌아가기
  const handleFinish = () => {
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
  
  // 대역전승 판정: 골드가 뒤졌는데 승리한 경우
  const goldLead = simulation.state.goldLead;
  const isHomeWin = simulation.winnerId === homeTeam.id;
  const isComebackVictory = (isHomeWin && goldLead < -3) || (!isHomeWin && goldLead > 3);

  // 팀 로고 fallback
  const getTeamLogo = (teamName: string) => {
    return null; // TODO: 실제 팀 로고 매핑
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E27] to-[#050818] text-white overflow-x-hidden">
      {/* 최상위 컨테이너: max-width로 폭 제한 + 중앙 정렬 */}
      <div className="max-w-[1400px] mx-auto px-6">
        {/* 상단 헤더 - 밴픽 스타일 */}
        <div className="sticky top-0 z-20 border-b border-white/10 bg-gradient-to-b from-[#0A0E27] via-[#0A0E27] to-[#0A0E27]/95 backdrop-blur-md -mx-6 px-6">
          <div className="py-5">
            {/* 우측 상단 닫기 버튼 (작고 심플하게) */}
            <div className="absolute right-6 top-5">
              <button 
                onClick={onBack}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 flex items-center justify-center transition-all"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* 메인 헤더: 팀 로고 + 팀명 + 스코어 */}
            <div className="flex items-center justify-center gap-12">
              {/* 블루팀 (홈) */}
              <div className={`flex items-center gap-5 px-8 py-4 rounded-2xl transition-all ${
                isPlayerTeam(homeTeam.id) 
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                  : 'bg-gradient-to-br from-blue-500/15 to-blue-600/5 border border-blue-500/30'
              }`}>
                {/* 팀 로고 */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-blue-400/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                  {getTeamLogo(homeTeam.name) ? (
                    <img src={getTeamLogo(homeTeam.name)!} alt={homeTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-bold text-blue-400">
                      {getKoreanTeamName(homeTeam.name).substring(0, 1)}
                    </div>
                  )}
                </div>
                
                {/* 팀명 + OVR */}
                <div className="text-right">
                  <div className="text-2xl font-bold text-white mb-1 tracking-tight">
                    {getKoreanTeamName(homeTeam.name)}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    TEAM OVR {getTeamTotalOVR(homeTeam)}
                  </div>
                </div>
              </div>

              {/* 중앙 스코어 */}
              <div className="flex flex-col items-center gap-3">
                {/* 리그 정보 */}
                <div className="text-xs text-slate-500 font-bold tracking-widest uppercase">
                  {currentLeague && LEAGUE_CONFIGS[currentLeague.leagueType].name}
                </div>
                
                {/* 스코어 */}
                <div className="flex items-center gap-8 px-10 py-4 bg-black/50 rounded-2xl border border-white/10 shadow-2xl">
                  <div className="text-6xl font-bold text-blue-400 tabular-nums min-w-[4rem] text-center">
                    {homeScore}
                  </div>
                  <div className="text-4xl text-slate-700 font-bold">:</div>
                  <div className="text-6xl font-bold text-red-400 tabular-nums min-w-[4rem] text-center">
                    {awayScore}
                  </div>
                </div>
                
                {/* 게임 타임 */}
                <div className="text-sm text-slate-400 font-mono tracking-wider">
                  {formatGameTime(gameTime)}
                </div>
              </div>

              {/* 레드팀 (어웨이) */}
              <div className={`flex items-center gap-5 px-8 py-4 rounded-2xl transition-all ${
                isPlayerTeam(awayTeam.id) 
                  ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-2 border-amber-500/50 shadow-lg shadow-amber-500/20' 
                  : 'bg-gradient-to-br from-red-500/15 to-red-600/5 border border-red-500/30'
              }`}>
                {/* 팀명 + OVR */}
                <div className="text-left">
                  <div className="text-2xl font-bold text-white mb-1 tracking-tight">
                    {getKoreanTeamName(awayTeam.name)}
                  </div>
                  <div className="text-xs text-slate-400 font-medium">
                    TEAM OVR {getTeamTotalOVR(awayTeam)}
                  </div>
                </div>
                
                {/* 팀 로고 */}
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 border-2 border-red-400/60 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-lg">
                  {getTeamLogo(awayTeam.name) ? (
                    <img src={getTeamLogo(awayTeam.name)!} alt={awayTeam.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="text-2xl font-bold text-red-400">
                      {getKoreanTeamName(awayTeam.name).substring(0, 1)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 메인 영역: 그리드 레이아웃 (4-4-4 비율로 선수 패널 확대) */}
        <div className="grid grid-cols-12 gap-6 py-6 min-h-[calc(100vh-200px)]">
          {/* 좌측 패널 - 블루팀 선수 (4컬럼으로 확대) */}
          <div className="col-span-4 bg-gradient-to-b from-blue-500/5 to-transparent rounded-2xl border border-blue-500/10 overflow-y-auto hidden xl:block">
            <div className="p-5">
              {/* 사이드 라벨 */}
              <div className="mb-5 pb-3 border-b border-blue-500/20">
                <div className="text-sm font-bold text-blue-400 tracking-widest">BLUE SIDE</div>
              </div>

              {/* 선수 리스트 - 오른쪽 정렬 (블루팀) */}
              <div className="space-y-3">
                {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                  const card = homeTeam.squad[pos];
                  if (!card) return null;
                  
                  const bonus = homeCardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
                  const finalOvr = card.stats.ovr + bonus.ovr;
                  
                  return (
                    <div 
                      key={pos} 
                      className="flex flex-row-reverse items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all"
                    >
                      {/* 선수 썸네일 (오른쪽) */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-blue-500/40 shadow-lg">
                        <PlayerImage
                          imageFileName={card.image}
                          playerName={card.name}
                          position={card.position}
                          gradeColor={GRADE_COLORS[card.grade].from}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* 선수 정보 (오른쪽 정렬) */}
                      <div className="flex-1 min-w-0 text-right">
                        {/* 포지션 */}
                        <div className="text-[11px] text-blue-400 font-bold mb-1 tracking-widest">
                          {pos}
                        </div>
                        {/* 닉네임 */}
                        <div className="text-base font-bold text-white truncate mb-1">
                          {card.name}
                        </div>
                        {/* OVR + 등급 */}
                        <div className="flex items-center justify-end gap-2">
                          <div className="text-[11px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 font-medium">
                            {card.grade}
                          </div>
                          {bonus.ovr > 0 && (
                            <div className="text-[11px] font-bold text-green-400">
                              +{bonus.ovr}
                            </div>
                          )}
                          <div className="text-xl font-bold text-amber-400">
                            {finalOvr}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 팀 오브젝트 */}
              <div className="mt-8 pt-5 border-t border-blue-500/20">
                <div className="text-xs font-bold text-slate-400 mb-4 tracking-wider">OBJECTIVES</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Kills</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.kills.home}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Towers</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.towers.home}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Dragons</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.dragons.home}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Barons</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.barons.home}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 중앙 영역 - 메인 디스플레이 (4컬럼) */}
          <div className="col-span-12 xl:col-span-4 relative overflow-hidden rounded-2xl border border-white/10">
            {/* 배경 이미지 (team-logo 버킷에서 로드) */}
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${bgImageUrl})`,
                opacity: 0.14,
                filter: 'blur(1.5px)'
              }}
              onError={(e) => {
                console.error('배경 이미지 로드 실패:', bgImageUrl);
                // fallback: 그라데이션 배경
                e.currentTarget.style.backgroundImage = 'linear-gradient(135deg, #0A0E27 0%, #1a1f3a 50%, #0A0E27 100%)';
                e.currentTarget.style.opacity = '0.3';
              }}
            />
            
            {/* 그라디언트 오버레이 */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0E27]/60 to-[#0A0E27]/95" />
            
            {/* 중앙 콘텐츠 */}
            <div className="relative h-full flex flex-col">
              {/* 상단 여백 (밴픽 스타일 연출용) */}
              <div className="flex-1" />
              
              {/* 경기 로그 영역 - 하단 */}
              <div className="h-[420px] p-5">
                <div className="h-full flex flex-col bg-black/50 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-5">
                  <div className="text-sm font-bold text-slate-400 mb-4 tracking-wider uppercase">Match Log</div>
                  
                  <div className="flex-1 overflow-y-auto space-y-2.5 custom-scrollbar pr-2">
                    {simulation.events.slice(-14).map((event, index) => (
                      <div 
                        key={index}
                        className={`p-3 rounded-lg text-sm transition-all duration-300 ${
                          event.type === "game_start" ? 'bg-blue-500/30 border border-blue-500/50 font-semibold' :
                          event.type === "game_end" ? 'bg-purple-500/30 border border-purple-500/50 font-semibold' :
                          event.type === "first_blood" || event.type === "clutch_moment" ? 
                            'bg-red-500/30 border border-red-500/50 font-semibold' :
                          event.type === "dragon_fight" || event.type === "baron_fight" ?
                            'bg-orange-500/30 border border-orange-500/50' :
                          event.team === "home" ? 
                            'bg-blue-500/15 border-l-3 border-blue-500' :
                            'bg-red-500/15 border-l-3 border-red-500'
                        }`}
                      >
                        <div className="flex gap-2.5 items-start">
                          <span className="text-slate-500 font-mono text-[11px] mt-0.5 flex-shrink-0">
                            {formatGameTime(event.turn * 2)}
                          </span>
                          <span className="flex-1 leading-relaxed">{event.message}</span>
                        </div>
                      </div>
                    ))}
                    <div ref={logEndRef} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 우측 패널 - 레드팀 선수 (4컬럼으로 확대) */}
          <div className="col-span-4 bg-gradient-to-b from-red-500/5 to-transparent rounded-2xl border border-red-500/10 overflow-y-auto hidden xl:block">
            <div className="p-5">
              {/* 사이드 라벨 */}
              <div className="mb-5 pb-3 border-b border-red-500/20">
                <div className="text-sm font-bold text-red-400 tracking-widest">RED SIDE</div>
              </div>

              {/* 선수 리스트 - 왼쪽 정렬 (레드팀) */}
              <div className="space-y-3">
                {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map(pos => {
                  const card = awayTeam.squad[pos];
                  if (!card) return null;
                  
                  const bonus = awayCardBonuses[card.id] || { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
                  const finalOvr = card.stats.ovr + bonus.ovr;
                  
                  return (
                    <div 
                      key={pos} 
                      className="flex items-center gap-4 p-3 rounded-xl bg-black/20 border border-white/5 hover:border-red-500/30 hover:bg-red-500/5 transition-all"
                    >
                      {/* 선수 썸네일 (왼쪽) */}
                      <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 border-red-500/40 shadow-lg">
                        <PlayerImage
                          imageFileName={card.image}
                          playerName={card.name}
                          position={card.position}
                          gradeColor={GRADE_COLORS[card.grade].from}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      {/* 선수 정보 (왼쪽 정렬) */}
                      <div className="flex-1 min-w-0 text-left">
                        {/* 포지션 */}
                        <div className="text-[11px] text-red-400 font-bold mb-1 tracking-widest">
                          {pos}
                        </div>
                        {/* 닉네임 */}
                        <div className="text-base font-bold text-white truncate mb-1">
                          {card.name}
                        </div>
                        {/* OVR + 등급 */}
                        <div className="flex items-center gap-2">
                          <div className="text-xl font-bold text-amber-400">
                            {finalOvr}
                          </div>
                          {bonus.ovr > 0 && (
                            <div className="text-[11px] font-bold text-green-400">
                              +{bonus.ovr}
                            </div>
                          )}
                          <div className="text-[11px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-400 font-medium">
                            {card.grade}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 팀 오브젝트 */}
              <div className="mt-8 pt-5 border-t border-red-500/20">
                <div className="text-xs font-bold text-slate-400 mb-4 tracking-wider">OBJECTIVES</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Skull className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Kills</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.kills.away}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-slate-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Towers</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.towers.away}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Dragons</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.dragons.away}</div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-black/30 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-purple-500" />
                      <div className="flex-1">
                        <div className="text-[10px] text-slate-500 uppercase tracking-wide">Barons</div>
                        <div className="text-2xl font-bold text-white">{simulation.state.barons.away}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 모바일 하단 요약 (xl 미만에서만 표시) */}
        <div className="xl:hidden border-t border-white/5 bg-[#0A0E27]/95 p-4 -mx-6">
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
      </div>

      {/* 경기 종료 오버레이 - 결과 확인 */}
      {gameEnded && !showRewardModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-6">
          <div className={`max-w-2xl w-full rounded-3xl p-10 border-2 text-center ${
            isPlayerWin 
              ? 'bg-gradient-to-b from-emerald-500/30 to-emerald-600/20 border-emerald-500' 
              : 'bg-gradient-to-b from-red-500/30 to-red-600/20 border-red-500'
          }`}>
            <div className="text-7xl mb-6">{isPlayerWin ? '🏆' : '💔'}</div>
            
            <h2 className="text-6xl font-bold font-display mb-6">
              {isPlayerWin ? 'VICTORY' : 'DEFEAT'}
            </h2>
            
            {/* 대역전승 메시지 */}
            {isComebackVictory && isPlayerWin && (
              <div className="mb-4 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-2 border-purple-400 rounded-xl px-6 py-3 animate-pulse">
                <p className="text-2xl font-bold text-purple-300">⚡ 대역전승! ⚡</p>
              </div>
            )}
            
            <p className="text-2xl text-white font-bold mb-2">{getKoreanTeamName(winner.name)} 승리</p>
            <p className="text-base text-slate-300 mb-8">
              게임 시간: {formatGameTime(gameTime)}
            </p>

            {/* 경기 통계 */}
            <div className="grid grid-cols-2 gap-4 mb-8 bg-black/30 rounded-2xl p-6">
              <div className="text-center border-r border-white/10">
                <div className="text-sm text-slate-400 mb-2">
                  {getKoreanTeamName(homeTeam.name)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">킬</span>
                    <span className="text-lg font-bold text-blue-400">{simulation.state.kills.home}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">타워</span>
                    <span className="text-lg font-bold text-blue-400">{simulation.state.towers.home}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">드래곤</span>
                    <span className="text-lg font-bold text-blue-400">{simulation.state.dragons.home}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">바론</span>
                    <span className="text-lg font-bold text-blue-400">{simulation.state.barons.home}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">골드</span>
                    <span className="text-lg font-bold text-amber-400">
                      {goldLead > 0 ? `+${goldLead.toFixed(1)}k` : goldLead < 0 ? `${goldLead.toFixed(1)}k` : '0.0k'}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-slate-400 mb-2">
                  {getKoreanTeamName(awayTeam.name)}
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">킬</span>
                    <span className="text-lg font-bold text-red-400">{simulation.state.kills.away}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">타워</span>
                    <span className="text-lg font-bold text-red-400">{simulation.state.towers.away}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">드래곤</span>
                    <span className="text-lg font-bold text-red-400">{simulation.state.dragons.away}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">바론</span>
                    <span className="text-lg font-bold text-red-400">{simulation.state.barons.away}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-slate-500">골드</span>
                    <span className="text-lg font-bold text-amber-400">
                      {goldLead < 0 ? `+${Math.abs(goldLead).toFixed(1)}k` : goldLead > 0 ? `-${goldLead.toFixed(1)}k` : '0.0k'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <Button onClick={handleConfirmResult} className="w-full py-6 text-lg font-bold">
              결과 확인하고 계속하기
            </Button>
          </div>
        </div>
      )}

      {/* 포인트 보상 모달 */}
      {showRewardModal && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-6">
          <div className={`max-w-md w-full rounded-2xl p-8 border-2 text-center ${
            isPlayerWin 
              ? 'bg-emerald-500/20 border-emerald-500' 
              : 'bg-slate-700/20 border-slate-600'
          }`}>
            {isPlayerWin ? (
              <>
                <div className="text-6xl mb-6">💰</div>
                
                <h2 className="text-4xl font-bold font-display mb-4">
                  포인트 획득!
                </h2>
                
                {currentLeague && (
                  <div className="bg-black/30 rounded-xl p-6 mb-8">
                    <p className="text-sm text-slate-400 mb-2">승리 보상</p>
                    <p className="text-5xl font-bold text-amber-400 mb-1">
                      +{LEAGUE_CONFIGS[currentLeague.leagueType].winPoints.toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500">포인트가 지급되었습니다</p>
                  </div>
                )}

                <Button onClick={handleFinish} className="w-full py-6 text-lg">
                  리그로 돌아가기
                </Button>
              </>
            ) : (
              <>
                <div className="text-6xl mb-6">😔</div>
                
                <h2 className="text-4xl font-bold font-display mb-4">
                  아쉽지만...
                </h2>
                
                <p className="text-slate-400 mb-8">
                  다음 경기에서 승리하세요!
                </p>

                <Button onClick={handleFinish} className="w-full py-6 text-lg">
                  리그로 돌아가기
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
