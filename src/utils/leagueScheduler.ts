// 리그 일정 생성 및 순위 계산 로직

import { Team, Match, StandingEntry, MatchResult } from "@/types/league";
import { calculateSynergies, calculateCardSynergyBonuses } from "./synergyEngine";

/**
 * 더블 라운드 로빈 일정 생성 (전체 팀)
 */
export function generateSchedule(playerTeamId: string, aiTeamIds: string[]): Match[] {
  const allTeamIds = [playerTeamId, ...aiTeamIds];
  const matches: Match[] = [];
  let matchId = 0;
  
  // 더블 라운드 로빈: 모든 팀이 서로 2번씩 경기 (홈/어웨이)
  for (let i = 0; i < allTeamIds.length; i++) {
    for (let j = i + 1; j < allTeamIds.length; j++) {
      const teamA = allTeamIds[i];
      const teamB = allTeamIds[j];
      
      // 첫 번째 경기: A 홈
      matches.push({
        id: `match_${matchId++}`,
        round: 0, // 라운드는 나중에 할당
        homeTeamId: teamA,
        awayTeamId: teamB,
        isCompleted: false
      });
      
      // 두 번째 경기: B 홈
      matches.push({
        id: `match_${matchId++}`,
        round: 0, // 라운드는 나중에 할당
        homeTeamId: teamB,
        awayTeamId: teamA,
        isCompleted: false
      });
    }
  }
  
  // 라운드별 경기 배정 (라운드 로빈 알고리즘)
  const rounds = assignRounds(matches, allTeamIds.length);
  
  // 라운드 순으로 정렬
  matches.sort((a, b) => {
    if (a.round !== b.round) return a.round - b.round;
    return a.id.localeCompare(b.id);
  });
  
  console.log(`[SCHEDULE] Generated ${matches.length} matches in ${rounds} rounds`);
  console.log(`[SCHEDULE] Teams: ${allTeamIds.length}, Matches per round: ~${Math.floor(allTeamIds.length / 2)}`);
  
  // 각 팀의 경기 수 확인
  const teamMatchCount: Record<string, number> = {};
  allTeamIds.forEach(teamId => {
    teamMatchCount[teamId] = matches.filter(m => 
      m.homeTeamId === teamId || m.awayTeamId === teamId
    ).length;
  });
  
  console.log('[SCHEDULE] Matches per team:', teamMatchCount);
  console.log('[SCHEDULE] Expected matches per team:', (allTeamIds.length - 1) * 2); // 더블 라운드 로빈
  
  return matches;
}

/**
 * 라운드 배정 (각 라운드에서 한 팀은 최대 1경기만)
 */
function assignRounds(matches: Match[], teamCount: number): number {
  const matchesPerRound = Math.floor(teamCount / 2);
  let currentRound = 1;
  
  // 경기를 셔플하여 랜덤성 추가
  const shuffledMatches = shuffleArray(matches);
  
  while (shuffledMatches.some(m => m.round === 0)) {
    const usedTeams = new Set<string>();
    let roundMatchCount = 0;
    
    // 현재 라운드에 배정할 경기 선택
    for (const match of shuffledMatches) {
      if (match.round !== 0) continue;
      
      // 두 팀 모두 이번 라운드에 아직 배정되지 않았으면 추가
      if (!usedTeams.has(match.homeTeamId) && !usedTeams.has(match.awayTeamId)) {
        match.round = currentRound;
        usedTeams.add(match.homeTeamId);
        usedTeams.add(match.awayTeamId);
        roundMatchCount++;
      }
    }
    
    console.log(`[SCHEDULE] Round ${currentRound}: ${roundMatchCount} matches assigned`);
    
    // 이번 라운드에 경기가 하나도 배정되지 않았다면 문제가 있음
    if (roundMatchCount === 0 && shuffledMatches.some(m => m.round === 0)) {
      console.error("[SCHEDULE] No matches assigned in this round, forcing remaining matches");
      // 남은 경기 강제 배정
      shuffledMatches.filter(m => m.round === 0).forEach(m => {
        m.round = currentRound;
      });
      break;
    }
    
    currentRound++;
    
    // 무한 루프 방지 (최대 200라운드)
    if (currentRound > 200) {
      console.error("[SCHEDULE] Round assignment failed - infinite loop detected");
      break;
    }
  }
  
  return currentRound - 1;
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

/**
 * AI 팀 간 경기 자동 시뮬레이션 (BO3 기준)
 */
export function simulateAIMatch(homeTeam: Team, awayTeam: Team): MatchResult {
  // 팀 OVR 계산 (시너지 포함)
  const getTeamOVR = (team: Team) => {
    const teamSynergies = calculateSynergies(team.squad);
    const teamCardBonuses = calculateCardSynergyBonuses(team.squad, teamSynergies);
    const synergyBonus = Object.values(teamCardBonuses).reduce((sum, bonus) => sum + (bonus?.ovr || 0), 0);
    return team.stats.totalOVR + synergyBonus;
  };

  const homeOVR = getTeamOVR(homeTeam);
  const awayOVR = getTeamOVR(awayTeam);
  
  // 승률 계산 (OVR 차이 기반)
  const ovrDiff = homeOVR - awayOVR;
  const baseWinProb = 50 + (ovrDiff * 0.5); // OVR 1당 0.5% 승률 변화
  const homeWinProb = Math.max(20, Math.min(80, baseWinProb)); // 20~80% 제한
  
  // BO3 시뮬레이션
  let homeScore = 0;
  let awayScore = 0;
  const gamesToWin = 2;
  
  // 최대 3게임 진행
  while (homeScore < gamesToWin && awayScore < gamesToWin) {
    const random = Math.random() * 100;
    if (random < homeWinProb) {
      homeScore++;
    } else {
      awayScore++;
    }
  }
  
  const winnerId = homeScore > awayScore ? homeTeam.id : awayTeam.id;
  const scoreDiff = Math.abs(homeScore - awayScore);
  
  // 스탯 생성 (OVR 기반 추정)
  const avgOVR = (homeOVR + awayOVR) / 2;
  const gameDuration = 25 + Math.random() * 15; // 25~40분
  const totalGames = homeScore + awayScore;
  
  // 킬/타워/드래곤/바론 (경기 수와 OVR에 비례)
  const baseKills = Math.floor(8 + Math.random() * 8); // 게임당 8~16킬
  const baseTowers = Math.floor(5 + Math.random() * 6); // 게임당 5~11타워
  const baseDragons = Math.floor(1 + Math.random() * 3); // 게임당 1~4드래곤
  const baseBarons = Math.random() < 0.6 ? 1 : 0; // 게임당 60% 확률로 바론
  
  const homeKills = Math.floor(baseKills * totalGames * (homeScore / totalGames) * (1 + (homeOVR - avgOVR) / 1000));
  const awayKills = Math.floor(baseKills * totalGames * (awayScore / totalGames) * (1 + (awayOVR - avgOVR) / 1000));
  
  const homeTowers = Math.floor(baseTowers * homeScore);
  const awayTowers = Math.floor(baseTowers * awayScore);
  
  const homeDragons = Math.floor(baseDragons * homeScore);
  const awayDragons = Math.floor(baseDragons * awayScore);
  
  const homeBarons = homeScore >= 2 ? Math.floor(baseBarons * homeScore) : 0;
  const awayBarons = awayScore >= 2 ? Math.floor(baseBarons * awayScore) : 0;
  
  return {
    homeTeamId: homeTeam.id,
    awayTeamId: awayTeam.id,
    homeScore,
    awayScore,
    winnerId,
    scoreDiff,
    kills: { home: homeKills, away: awayKills },
    towers: { home: homeTowers, away: awayTowers },
    dragons: { home: homeDragons, away: awayDragons },
    barons: { home: homeBarons, away: awayBarons }
  };
}

/**
 * 플레이어 경기 완료 후 남은 라운드의 AI 경기들을 모두 시뮬레이션
 */
export function simulateRemainingMatches(
  currentRound: number,
  teams: Team[],
  matches: Match[],
  playerTeamId: string
): Match[] {
  const updatedMatches = [...matches];
  
  // 현재 라운드의 모든 경기 확인
  const allRoundMatches = updatedMatches.filter(m => m.round === currentRound);
  console.log(`[SIM] Round ${currentRound} total matches:`, allRoundMatches.length);
  console.log(`[SIM] Round ${currentRound} matches:`, allRoundMatches.map(m => ({
    home: m.homeTeamId,
    away: m.awayTeamId,
    completed: m.isCompleted
  })));
  
  // 현재 라운드의 다른 경기들만 시뮬레이션 (플레이어 경기 제외)
  const currentRoundMatches = updatedMatches.filter(
    m => m.round === currentRound && 
    !m.isCompleted && 
    m.homeTeamId !== playerTeamId && 
    m.awayTeamId !== playerTeamId
  );
  
  console.log(`[SIM] AI matches to simulate:`, currentRoundMatches.length);
  
  for (const match of currentRoundMatches) {
    const homeTeam = teams.find(t => t.id === match.homeTeamId);
    const awayTeam = teams.find(t => t.id === match.awayTeamId);
    
    if (!homeTeam || !awayTeam) continue;
    
    const result = simulateAIMatch(homeTeam, awayTeam);
    match.result = result;
    match.isCompleted = true;
  }
  
  return updatedMatches;
}
