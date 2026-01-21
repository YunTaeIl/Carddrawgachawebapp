import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { useGame } from "@/contexts/GameContext";
import { LEAGUE_CONFIGS } from "@/types/league";
import { ArrowLeft, ChevronRight, Sparkles } from "lucide-react";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";
import { LCKHoloCard } from "@/components/LCKHoloCard";

interface LeagueProgressPageProps {
  onBack: () => void;
  onMatchStart: () => void;
  onViewStandings: () => void;
  onStartPlayoffs: () => void;
  onViewResult: () => void;
}

export function LeagueProgressPage({ 
  onBack, 
  onMatchStart, 
  onViewStandings,
  onStartPlayoffs,
  onViewResult
}: LeagueProgressPageProps) {
  const { currentLeague, getCurrentMatch, getTeamById } = useLeague();
  const { userData } = useGame();

  if (!currentLeague) {
    return (
      <div className="min-h-screen bg-[#0A0E27] text-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-slate-400 mb-4">진행 중인 리그가 없습니다</p>
          <Button onClick={onBack}>메인으로</Button>
        </div>
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIGS[currentLeague.leagueType];
  const currentMatch = getCurrentMatch();
  const playerTeam = getTeamById(currentLeague.playerTeamId);
  
  const isRegularSeasonComplete = currentLeague.currentMatchIndex >= currentLeague.matches.length;
  const playerRank = currentLeague.standings.findIndex(s => s.isPlayer) + 1;
  const isPlayoffQualified = playerRank <= 5 && isRegularSeasonComplete;
  const isEliminated = playerRank > 5 && isRegularSeasonComplete;

  const synergies = playerTeam ? calculateSynergies(playerTeam.squad) : [];
  const activeSynergies = synergies.filter(s => s.isActive);

  // 각 카드별 시너지 보너스 계산
  const cardBonuses = playerTeam ? calculateCardSynergyBonuses(playerTeam.squad, synergies) : {};

  // 각 카드가 시너지에 포함되는지 확인
  const isCardInSynergy = (cardId: string) => {
    return activeSynergies.some(s => s.cardIds.includes(cardId));
  };

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="border-b border-white/5 bg-[#0A0E27]/95 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white mb-3"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            메인으로
          </Button>
          
          <div className="flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold font-display">{leagueConfig.name}</h1>
              <p className="text-sm text-slate-400 mt-1">
                {currentLeague.seasonState === "regular" && "정규시즌"}
                {currentLeague.seasonState === "playoffs" && "플레이오프"}
                {currentLeague.seasonState === "finished" && "시즌 종료"}
              </p>
            </div>

            <div className="text-right">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">포인트</div>
              <div className="text-2xl font-bold text-amber-400">
                {currentLeague.currentPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-6">
        {/* 내 팀 */}
        {playerTeam && (
          <div className="bg-slate-900/30 rounded-2xl p-8 border border-white/5">
            <div className="flex items-baseline justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold font-display">MY TEAM</h2>
                <p className="text-sm text-slate-400 mt-1">현재 순위 {playerRank}위</p>
              </div>
              <div className="text-right">
                <div className="text-xs text-slate-500 mb-1">총 OVR</div>
                <div className="text-3xl font-bold text-amber-400">{playerTeam.stats.totalOVR}</div>
              </div>
            </div>

            {/* 선수 카드 목록 - 메인 화면과 동일한 디자인 */}
            <div className="bg-gradient-to-br from-[#141B3D]/50 via-[#141B3D]/80 to-[#141B3D]/50 rounded-2xl p-8 border border-[#0047AB]/30 backdrop-blur-sm mb-4">
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 pb-2">
                {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map((pos) => {
                  const card = playerTeam.squad[pos];
                  const hasSynergy = card && isCardInSynergy(card.id);
                  const cardBonus = card ? cardBonuses[card.id] : null;
                  
                  return (
                    <div key={pos} className="flex-shrink-0">
                      {card ? (
                        <div className="group relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#C8102E] text-white px-3 py-1 rounded-full text-xs font-bold z-10">
                            {pos}
                          </div>
                          {/* 시너지 글로우 효과 */}
                          {hasSynergy && (
                            <>
                              <div className="absolute inset-0 rounded-2xl bg-[#FFB81C]/20 blur-xl animate-pulse z-0" />
                              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FFB81C] text-[#0B0F1A] px-2 py-0.5 rounded-full text-[9px] font-bold z-10 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                시너지
                              </div>
                            </>
                          )}
                          <LCKHoloCard 
                            card={card} 
                            size="medium" 
                            upgradeLevel={card.upgradeLevel}
                            synergyBonus={cardBonus || undefined}
                          />
                        </div>
                      ) : (
                        <div className="w-60 h-[440px] bg-[#0A0E27]/50 rounded-2xl border-2 border-dashed border-[#0047AB]/30 flex flex-col items-center justify-center gap-3">
                          <div className="text-4xl text-[#0047AB]/50">+</div>
                          <div className="text-sm text-[#8B95B5]">{pos}</div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 시너지 태그 */}
            {activeSynergies.length > 0 && (
              <div className="bg-gradient-to-br from-[#0047AB]/10 to-[#141B3D]/50 rounded-xl p-5 border border-[#0047AB]/30">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-4 h-4 text-[#FFB81C]" />
                  <h3 className="font-bold font-display">활성 시너지</h3>
                  <span className="ml-auto bg-[#FFB81C] text-[#0B0F1A] px-2.5 py-0.5 rounded-full text-xs font-bold">
                    {activeSynergies.length}개
                  </span>
                </div>
                <div className="flex gap-2.5 flex-wrap">
                  {activeSynergies.map(s => (
                    <div 
                      key={s.synergy.synergy_id}
                      className="inline-flex items-center gap-1.5 bg-gradient-to-r from-[#0047AB]/30 to-[#0047AB]/20 border-2 border-[#0047AB]/50 px-4 py-2 rounded-full hover:border-[#FFB81C]/70 transition-all group/tag"
                    >
                      <Sparkles className="w-3 h-3 text-[#FFB81C] group-hover/tag:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-white">
                        {s.synergy.synergy_name}
                      </span>
                      {s.isPrime && (
                        <span className="text-xs font-bold text-[#C8102E] bg-[#C8102E]/20 px-1.5 py-0.5 rounded">
                          PRIME
                        </span>
                      )}
                      <span className="text-xs text-[#8B95B5] ml-0.5">
                        {s.synergy.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 정규시즌 진행 중 */}
        {currentLeague.seasonState === "regular" && !isRegularSeasonComplete && currentMatch && (
          <>
            {/* 다음 경기 */}
            <div className="bg-gradient-to-br from-red-600/10 to-slate-900/10 rounded-2xl p-8 border border-red-600/30">
              <div className="text-center mb-6">
                <div className="text-sm text-slate-400 mb-2">
                  ROUND {currentMatch.round} / 18
                </div>
                <h2 className="text-3xl font-bold font-display">NEXT MATCH</h2>
              </div>

              <div className="flex items-center justify-center gap-8 mb-8">
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold mb-2">
                    {getTeamById(currentMatch.homeTeamId)?.name}
                  </div>
                  <div className="text-slate-400">
                    {getTeamById(currentMatch.homeTeamId)?.stats.totalOVR}
                  </div>
                </div>
                
                <div className="text-4xl font-bold text-amber-400">VS</div>
                
                <div className="text-center flex-1">
                  <div className="text-2xl font-bold mb-2">
                    {getTeamById(currentMatch.awayTeamId)?.name}
                  </div>
                  <div className="text-slate-400">
                    {getTeamById(currentMatch.awayTeamId)?.stats.totalOVR}
                  </div>
                </div>
              </div>

              <Button
                onClick={onMatchStart}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-6 rounded-xl text-lg font-semibold"
              >
                경기 시작 <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </div>

            {/* 일정 & 순위 */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* 일정 */}
              <div className="bg-slate-900/30 rounded-2xl p-6 border border-white/5">
                <h3 className="text-lg font-bold mb-4">일정</h3>
                <div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar">
                  {currentLeague.matches.map((match, index) => {
                    const homeTeam = getTeamById(match.homeTeamId);
                    const awayTeam = getTeamById(match.awayTeamId);
                    const isCurrent = index === currentLeague.currentMatchIndex;

                    return (
                      <div
                        key={match.id}
                        className={`flex items-center gap-3 p-3 rounded-lg text-sm ${
                          isCurrent ? 'bg-red-600/20 border border-red-600/50' : 'bg-black/20'
                        }`}
                      >
                        <div className="w-8 text-center text-slate-500">{match.round}</div>
                        <div className="flex-1 flex items-center justify-between">
                          <span className="truncate">{homeTeam?.name}</span>
                          {match.isCompleted && match.result ? (
                            <span className="text-amber-400 font-mono text-xs mx-2">
                              {match.result.homeScore}:{match.result.awayScore}
                            </span>
                          ) : (
                            <span className="text-slate-600 mx-2">vs</span>
                          )}
                          <span className="truncate">{awayTeam?.name}</span>
                        </div>
                        {match.isCompleted && match.result && (
                          <div className={`text-xs font-bold ${
                            match.result.winnerId === currentLeague.playerTeamId 
                              ? 'text-emerald-400' 
                              : 'text-red-400'
                          }`}>
                            {match.result.winnerId === currentLeague.playerTeamId ? 'W' : 'L'}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 순위 */}
              <div className="bg-slate-900/30 rounded-2xl p-6 border border-white/5">
                <div className="flex items-baseline justify-between mb-4">
                  <h3 className="text-lg font-bold">순위표</h3>
                  <Button
                    onClick={onViewStandings}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-300 text-sm"
                  >
                    전체보기
                  </Button>
                </div>
                <div className="space-y-2">
                  {currentLeague.standings.slice(0, 10).map((entry, index) => (
                    <div
                      key={entry.teamId}
                      className={`flex items-center gap-3 p-2 rounded-lg ${
                        entry.isPlayer ? 'bg-amber-500/20' : 'bg-black/20'
                      } ${index < 5 ? 'border-l-2 border-emerald-500/50' : ''}`}
                    >
                      <div className={`w-6 text-center font-bold ${
                        index === 0 ? 'text-amber-400' : 'text-slate-400'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 truncate text-sm">
                        {entry.teamName}
                      </div>
                      <div className="text-sm">
                        <span className="text-emerald-400">{entry.wins}</span>
                        <span className="text-slate-600 mx-1">-</span>
                        <span className="text-red-400">{entry.losses}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* 플레이오프 진출 */}
        {isRegularSeasonComplete && isPlayoffQualified && currentLeague.seasonState === "regular" && (
          <div className="bg-gradient-to-br from-amber-500/20 to-slate-900/20 rounded-2xl p-12 border border-amber-500/50 text-center">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-4xl font-bold font-display mb-3">정규시즌 {playerRank}위</h2>
            <p className="text-slate-300 mb-8 text-lg">플레이오프에 진출했습니다</p>
            
            <Button
              onClick={onStartPlayoffs}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-6 px-12 rounded-xl text-lg"
            >
              플레이오프 시작
            </Button>
          </div>
        )}

        {/* 탈락 */}
        {isRegularSeasonComplete && isEliminated && (
          <div className="bg-slate-900/50 rounded-2xl p-12 border border-white/5 text-center">
            <div className="text-6xl mb-4">😔</div>
            <h2 className="text-3xl font-bold font-display mb-3">정규시즌 {playerRank}위</h2>
            <p className="text-slate-400 mb-8">플레이오프 진출에 실패했습니다</p>
            
            <Button
              onClick={onViewResult}
              className="bg-slate-700 hover:bg-slate-600 py-6 px-12 rounded-xl"
            >
              시즌 결과 확인
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}