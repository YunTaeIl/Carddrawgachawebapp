// 리그 일정 생성 및 순위 계산 로직

import { Team, Match, StandingEntry, MatchResult } from "@/types/league";
import { calculateSynergies, calculateCardSynergyBonuses } from "./synergyEngine";

/**
 * 더블 라운드 로빈 일정 생성 (플레이어 기준 18경기)
 */
export function generateSchedule(playerTeamId: string, aiTeamIds: string[]): Match[] {
  const matches: Match[] = [];
  let matchId = 0;
  let round = 1;
  
  // 각 AI 팀과 2경기씩 (홈/어웨이)
  for (const aiTeamId of aiTeamIds) {
    // 홈 경기
    matches.push({
      id: `match_${matchId++}`,
      round: round++,
      homeTeamId: playerTeamId,
      awayTeamId: aiTeamId,
      isCompleted: false
    });
    
    // 어웨이 경기
    matches.push({
      id: `match_${matchId++}`,
      round: round++,
      homeTeamId: aiTeamId,
      awayTeamId: playerTeamId,
      isCompleted: false
    });
  }
  
  // 일정 셔플 (랜덤 순서)
  return shuffleArray(matches).map((match, index) => ({
    ...match,
    round: index + 1
  }));
}

/**
 * 배열 셔플
 */
function shuffleArray<T>(array: T[]): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * 순위표 계산
 */
export function calculateStandings(teams: Team[], matches: Match[]): StandingEntry[] {
  // 각 팀의 시너지 적용된 OVR 계산
  const getTeamTotalOVR = (team: Team) => {
    const teamSynergies = calculateSynergies(team.squad);
    const teamCardBonuses = calculateCardSynergyBonuses(team.squad, teamSynergies);
    const synergyBonus = Object.values(teamCardBonuses).reduce((sum, bonus) => sum + (bonus?.ovr || 0), 0);
    return team.stats.totalOVR + synergyBonus;
  };

  const standings: StandingEntry[] = teams.map(team => ({
    teamId: team.id,
    teamName: team.name,
    wins: 0,
    losses: 0,
    scoreDiff: 0,
    totalOVR: getTeamTotalOVR(team), // 시너지 적용된 OVR
    isPlayer: team.isPlayer
  }));
  
  // 완료된 경기 결과 집계
  const completedMatches = matches.filter(m => m.isCompleted && m.result);
  
  for (const match of completedMatches) {
    const result = match.result!;
    const homeEntry = standings.find(s => s.teamId === result.homeTeamId);
    const awayEntry = standings.find(s => s.teamId === result.awayTeamId);
    
    if (!homeEntry || !awayEntry) continue;
    
    if (result.winnerId === result.homeTeamId) {
      homeEntry.wins++;
      awayEntry.losses++;
    } else {
      awayEntry.wins++;
      homeEntry.losses++;
    }
    
    homeEntry.scoreDiff += result.scoreDiff * (result.winnerId === result.homeTeamId ? 1 : -1);
    awayEntry.scoreDiff += result.scoreDiff * (result.winnerId === result.awayTeamId ? 1 : -1);
  }
  
  // 순위 정렬
  return sortStandings(standings, matches);
}

/**
 * 순위 정렬 (승수 → 상대전적 → 득실차 → OVR → 랜덤)
 */
function sortStandings(standings: StandingEntry[], matches: Match[]): StandingEntry[] {
  return standings.sort((a, b) => {
    // 1. 승수
    if (a.wins !== b.wins) return b.wins - a.wins;
    
    // 2. 상대전적 (H2H)
    const h2h = calculateHeadToHead(a.teamId, b.teamId, matches);
    if (h2h !== 0) return h2h;
    
    // 3. 득실차
    if (a.scoreDiff !== b.scoreDiff) return b.scoreDiff - a.scoreDiff;
    
    // 4. OVR
    if (a.totalOVR !== b.totalOVR) return b.totalOVR - a.totalOVR;
    
    // 5. 랜덤
    return Math.random() - 0.5;
  });
}

/**
 * 상대전적 계산 (양수 = team1 우세, 음수 = team2 우세, 0 = 동률)
 */
function calculateHeadToHead(team1Id: string, team2Id: string, matches: Match[]): number {
  const h2hMatches = matches.filter(m => 
    m.isCompleted &&
    m.result &&
    ((m.homeTeamId === team1Id && m.awayTeamId === team2Id) ||
     (m.homeTeamId === team2Id && m.awayTeamId === team1Id))
  );
  
  let team1Wins = 0;
  let team2Wins = 0;
  
  for (const match of h2hMatches) {
    if (match.result!.winnerId === team1Id) team1Wins++;
    if (match.result!.winnerId === team2Id) team2Wins++;
  }
  
  if (team1Wins > team2Wins) return 1;
  if (team2Wins > team1Wins) return -1;
  return 0;
}
