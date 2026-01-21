// 리그 진행 메인 페이지 /league/progress

import React from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { useGame } from "@/contexts/GameContext";
import { LEAGUE_CONFIGS } from "@/types/league";
import { 
  ArrowLeft, Trophy, Target, Calendar, TrendingUp, 
  Users, Zap, ChevronRight, Award, XCircle 
} from "lucide-react";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

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
          <p className="text-[#9AA6C3] mb-4">진행 중인 리그가 없습니다</p>
          <Button onClick={onBack}>메인으로</Button>
        </div>
      </div>
    );
  }

  const leagueConfig = LEAGUE_CONFIGS[currentLeague.leagueType];
  const currentMatch = getCurrentMatch();
  const playerTeam = getTeamById(currentLeague.playerTeamId);
  
  // 정규시즌 완료 여부
  const isRegularSeasonComplete = currentLeague.currentMatchIndex >= currentLeague.matches.length;
  
  // 플레이어 순위
  const playerRank = currentLeague.standings.findIndex(s => s.isPlayer) + 1;
  const isPlayoffQualified = playerRank <= 5 && isRegularSeasonComplete;
  const isEliminated = playerRank > 5 && isRegularSeasonComplete;

  // 스쿼드 시너지 계산
  const synergies = playerTeam ? calculateSynergies(playerTeam.squad) : [];
  const activeSynergies = synergies.filter(s => s.isActive);

  return (
    <div className="min-h-screen bg-[#0A0E27] text-white">
      {/* 헤더 */}
      <div className="bg-[#0A0E27]/95 backdrop-blur-md border-b border-[#2B6CFF]/20 sticky top-0 z-10">
        <div className="max-w-[1500px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-4">
              <Button
                onClick={onBack}
                variant="ghost"
                size="sm"
                className="text-[#9AA6C3] hover:text-white"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                메인으로
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold font-display tracking-wide">
                  {leagueConfig.name}
                </h1>
                <p className="text-sm text-[#8B95B5]">
                  {currentLeague.seasonState === "regular" && "정규시즌"}
                  {currentLeague.seasonState === "playoffs" && "플레이오프"}
                  {currentLeague.seasonState === "finished" && "시즌 종료"}
                </p>
              </div>
            </div>

            {/* 현재 포인트 */}
            <div className="bg-[#141B3D]/80 rounded-xl px-4 py-2 border border-[#FFB81C]/30">
              <div className="text-xs text-[#8B95B5] mb-1">획득 RP</div>
              <div className="text-xl md:text-2xl font-display font-bold text-[#FFB81C]">
                {currentLeague.currentPoints.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="max-w-[1500px] mx-auto px-6 py-8 space-y-6">
        {/* 내 팀 요약 */}
        {playerTeam && (
          <div className="bg-gradient-to-br from-[#141B3D]/50 to-[#0A0E27] rounded-2xl p-6 border border-[#0047AB]/30">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-[#FFB81C]" />
              <h2 className="text-xl font-bold font-display">MY TEAM</h2>
              <div className="ml-auto text-sm text-[#9AA6C3]">
                순위: <span className="text-[#FFB81C] font-bold">{playerRank}위</span>
              </div>
            </div>

            {/* 데스크톱: 카드 썸네일 */}
            <div className="hidden md:flex gap-4 mb-4">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map((pos) => {
                const card = playerTeam.squad[pos];
                return (
                  <div key={pos} className="flex-1">
                    {card ? (
                      <LCKHoloCard card={card} size="small" />
                    ) : (
                      <div className="w-full h-48 bg-[#0A0E27]/50 rounded-lg border border-dashed border-[#0047AB]/30 
                                      flex items-center justify-center text-[#8B95B5] text-xs">
                        {pos}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 모바일: 선수명 텍스트 */}
            <div className="md:hidden space-y-2 mb-4">
              {(["TOP", "JGL", "MID", "ADC", "SUP"] as const).map((pos) => {
                const card = playerTeam.squad[pos];
                return (
                  <div key={pos} className="flex items-center gap-3 bg-[#0A0E27]/50 rounded-lg p-3">
                    <div className="w-12 text-center">
                      <span className="text-xs font-bold text-[#FFB81C]">{pos}</span>
                    </div>
                    <div className="flex-1">
                      {card ? (
                        <div>
                          <div className="font-bold">{card.name}</div>
                          <div className="text-xs text-[#8B95B5]">{card.team} | {card.year}</div>
                        </div>
                      ) : (
                        <div className="text-[#8B95B5] text-sm">빈 슬롯</div>
                      )}
                    </div>
                    {card && (
                      <div className="text-right">
                        <div className="text-sm font-bold">{card.stats.ovr + (card.upgradeLevel || 0)}</div>
                        <div className="text-xs text-[#8B95B5]">OVR</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* 팀 스탯 요약 */}
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3 bg-[#0A0E27]/50 rounded-xl p-4">
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">총 OVR</div>
                <div className="text-lg font-display font-bold text-[#FFB81C]">
                  {playerTeam.stats.totalOVR}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">메카닉</div>
                <div className="text-lg font-display font-bold">{playerTeam.stats.mechanics}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">라인전</div>
                <div className="text-lg font-display font-bold">{playerTeam.stats.laning}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">한타</div>
                <div className="text-lg font-display font-bold">{playerTeam.stats.teamfight}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">운영</div>
                <div className="text-lg font-display font-bold">{playerTeam.stats.macro}</div>
              </div>
              <div className="text-center">
                <div className="text-xs text-[#8B95B5] mb-1">클러치</div>
                <div className="text-lg font-display font-bold">{playerTeam.stats.clutch}</div>
              </div>
            </div>

            {/* 시너지 요약 */}
            {activeSynergies.length > 0 && (
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <Zap className="w-4 h-4 text-[#FFB81C]" />
                <span className="text-xs text-[#8B95B5]">활성 시너지:</span>
                {activeSynergies.slice(0, 3).map(s => (
                  <span 
                    key={s.synergy.synergy_id}
                    className="text-xs bg-[#FFB81C]/20 text-[#FFB81C] px-2 py-1 rounded"
                  >
                    {s.synergy.synergy_name}
                  </span>
                ))}
                {activeSynergies.length > 3 && (
                  <span className="text-xs text-[#8B95B5]">+{activeSynergies.length - 3}</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* 정규시즌 진행 중 */}
        {currentLeague.seasonState === "regular" && !isRegularSeasonComplete && currentMatch && (
          <>
            {/* 다음 경기 CTA */}
            <div className="bg-gradient-to-br from-[#C8102E]/20 to-[#141B3D] rounded-2xl p-6 border-2 border-[#C8102E]">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-[#C8102E]" />
                <h2 className="text-2xl font-bold font-display">다음 경기</h2>
              </div>

              <div className="bg-[#0A0E27]/50 rounded-xl p-6 mb-4">
                <div className="text-center mb-4">
                  <div className="text-sm text-[#8B95B5] mb-1">
                    Round {currentMatch.round} / 18
                  </div>
                  <div className="text-xs text-[#9AA6C3]">정규시즌</div>
                </div>

                {/* 매치업 */}
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold">
                      {getTeamById(currentMatch.homeTeamId)?.name || ""}
                    </div>
                    <div className="text-sm text-[#8B95B5]">
                      OVR {getTeamById(currentMatch.homeTeamId)?.stats.totalOVR || 0}
                    </div>
                  </div>
                  
                  <div className="text-3xl font-bold text-[#FFB81C]">VS</div>
                  
                  <div className="flex-1 text-center">
                    <div className="text-lg font-bold">
                      {getTeamById(currentMatch.awayTeamId)?.name || ""}
                    </div>
                    <div className="text-sm text-[#8B95B5]">
                      OVR {getTeamById(currentMatch.awayTeamId)?.stats.totalOVR || 0}
                    </div>
                  </div>
                </div>
              </div>

              <Button
                onClick={onMatchStart}
                className="w-full bg-gradient-to-r from-[#C8102E] to-[#A00D25] 
                           hover:from-[#C8102E]/90 hover:to-[#A00D25]/90
                           shadow-lg font-display text-lg py-6 rounded-xl transition-all duration-200
                           transform hover:scale-[1.02]"
              >
                <ChevronRight className="w-6 h-6 mr-2" />
                경기 시작
              </Button>
            </div>

            {/* 일정/결과 리스트 */}
            <div className="bg-[#141B3D]/50 rounded-2xl p-6 border border-[#0047AB]/30">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-[#0047AB]" />
                <h3 className="text-xl font-bold font-display">경기 일정</h3>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                {currentLeague.matches.map((match, index) => {
                  const homeTeam = getTeamById(match.homeTeamId);
                  const awayTeam = getTeamById(match.awayTeamId);
                  const isCurrent = index === currentLeague.currentMatchIndex;

                  return (
                    <div
                      key={match.id}
                      className={`bg-[#0A0E27]/50 rounded-lg p-3 border 
                                 ${isCurrent ? 'border-[#C8102E] bg-[#C8102E]/10' : 'border-[#0047AB]/30'}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="w-12 text-center">
                          <span className="text-xs text-[#8B95B5]">R{match.round}</span>
                        </div>
                        
                        <div className="flex-1 flex items-center justify-between text-sm">
                          <span>{homeTeam?.name}</span>
                          {match.isCompleted && match.result ? (
                            <span className="text-[#FFB81C] font-bold">
                              {match.result.homeScore} : {match.result.awayScore}
                            </span>
                          ) : (
                            <span className="text-[#8B95B5]">vs</span>
                          )}
                          <span>{awayTeam?.name}</span>
                        </div>

                        <div className="w-16 text-right">
                          {match.isCompleted && match.result ? (
                            <span className={`text-xs font-bold ${
                              match.result.winnerId === currentLeague.playerTeamId 
                                ? 'text-[#10B981]' 
                                : 'text-[#EF4444]'
                            }`}>
                              {match.result.winnerId === currentLeague.playerTeamId ? 'WIN' : 'LOSS'}
                            </span>
                          ) : isCurrent ? (
                            <span className="text-xs text-[#C8102E] font-bold">NEXT</span>
                          ) : (
                            <span className="text-xs text-[#8B95B5]">예정</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* 정규시즌 완료 - 플레이오프 진출 */}
        {isRegularSeasonComplete && isPlayoffQualified && currentLeague.seasonState === "regular" && (
          <div className="bg-gradient-to-br from-[#FFB81C]/20 to-[#141B3D] rounded-2xl p-8 border-2 border-[#FFB81C] text-center">
            <Trophy className="w-16 h-16 text-[#FFB81C] mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-display mb-2">정규시즌 {playerRank}위!</h2>
            <p className="text-[#9AA6C3] mb-6">플레이오프에 진출했습니다</p>
            
            <Button
              onClick={onStartPlayoffs}
              className="bg-gradient-to-r from-[#FFB81C] to-[#C8102E] 
                         hover:from-[#FFB81C]/90 hover:to-[#C8102E]/90
                         shadow-lg font-display text-lg py-6 px-8 rounded-xl"
            >
              <Award className="w-6 h-6 mr-2" />
              플레이오프 시작
            </Button>
          </div>
        )}

        {/* 정규시즌 완료 - 탈락 */}
        {isRegularSeasonComplete && isEliminated && (
          <div className="bg-gradient-to-br from-[#EF4444]/20 to-[#141B3D] rounded-2xl p-8 border-2 border-[#EF4444] text-center">
            <XCircle className="w-16 h-16 text-[#EF4444] mx-auto mb-4" />
            <h2 className="text-3xl font-bold font-display mb-2">정규시즌 {playerRank}위</h2>
            <p className="text-[#9AA6C3] mb-6">플레이오프 진출에 실패했습니다</p>
            
            <Button
              onClick={onViewResult}
              className="bg-gradient-to-r from-[#8B95B5] to-[#6B7280] 
                         hover:from-[#8B95B5]/90 hover:to-[#6B7280]/90
                         shadow-lg font-display text-lg py-6 px-8 rounded-xl"
            >
              시즌 결과 확인
            </Button>
          </div>
        )}

        {/* 순위표 미리보기 */}
        <div className="bg-[#141B3D]/50 rounded-2xl p-6 border border-[#0047AB]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#FFB81C]" />
              <h3 className="text-xl font-bold font-display">순위표</h3>
            </div>
            <Button
              onClick={onViewStandings}
              variant="ghost"
              size="sm"
              className="text-[#0047AB] hover:text-[#0047AB]/80"
            >
              전체 보기 <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="space-y-2">
            {currentLeague.standings.slice(0, 5).map((entry, index) => (
              <div
                key={entry.teamId}
                className={`flex items-center gap-3 p-3 rounded-lg ${
                  entry.isPlayer 
                    ? 'bg-[#FFB81C]/20 border border-[#FFB81C]/50' 
                    : 'bg-[#0A0E27]/50'
                }`}
              >
                <div className="w-8 text-center">
                  <span className={`font-bold ${
                    index === 0 ? 'text-[#FFB81C]' : 'text-[#9AA6C3]'
                  }`}>
                    {index + 1}
                  </span>
                </div>
                <div className="flex-1">
                  <span className={entry.isPlayer ? 'font-bold text-[#FFB81C]' : ''}>
                    {entry.teamName}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-[#10B981]">{entry.wins}승</span>
                  {' '}
                  <span className="text-[#EF4444]">{entry.losses}패</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
