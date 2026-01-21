// 경기 시뮬레이션 로직

import { Team, MatchSimulationState, MatchEvent, MatchResult, EventType } from "@/types/league";

/**
 * 팀 전력 차이 계산
 */
function calculatePowerGap(team1: Team, team2: Team): number {
  const gap = team1.stats.totalOVR - team2.stats.totalOVR;
  const gapRatio = gap / team1.stats.totalOVR;
  return gapRatio;
}

/**
 * 전력 차이에 따른 목표 턴 수 결정
 */
function calculateTargetTurns(powerGap: number): number {
  const absGap = Math.abs(powerGap);
  
  if (absGap < 0.1) {
    // 접전 (전력 차이 10% 이내)
    return 28 + Math.floor(Math.random() * 7); // 28~34턴
  } else if (absGap < 0.2) {
    // 우세 (10~20%)
    return 22 + Math.floor(Math.random() * 7); // 22~28턴
  } else {
    // 압살 (20% 이상)
    return 16 + Math.floor(Math.random() * 7); // 16~22턴
  }
}

/**
 * 이벤트 타입별 가중치 스탯 계산
 */
function getStatWeightForEvent(team: Team, eventType: EventType): number {
  switch (eventType) {
    case "lane_phase":
    case "first_blood":
      return team.stats.laning * 0.6 + team.stats.mechanics * 0.4;
    case "dragon_fight":
    case "baron_fight":
    case "objective_trade":
      return team.stats.macro * 0.5 + team.stats.teamfight * 0.3 + team.stats.mechanics * 0.2;
    case "teamfight":
      return team.stats.teamfight * 0.6 + team.stats.mechanics * 0.4;
    case "clutch_moment":
      return team.stats.clutch * 0.7 + team.stats.mechanics * 0.3;
    default:
      return team.stats.totalOVR / 5;
  }
}

/**
 * 이벤트 성공 팀 결정 (확률 기반)
 */
function decideEventWinner(
  homeTeam: Team,
  awayTeam: Team,
  eventType: EventType,
  currentState: MatchSimulationState["state"]
): "home" | "away" {
  let homeWeight = getStatWeightForEvent(homeTeam, eventType);
  let awayWeight = getStatWeightForEvent(awayTeam, eventType);
  
  // 모멘텀 보정 (최대 ±15%)
  const momentumBonus = currentState.momentum * 0.15;
  homeWeight *= (1 + momentumBonus);
  awayWeight *= (1 - momentumBonus);
  
  // 골드 리드 보정 (최대 ±10%)
  const goldBonus = (currentState.goldLead / 10) * 0.1;
  homeWeight *= (1 + goldBonus);
  awayWeight *= (1 - goldBonus);
  
  const total = homeWeight + awayWeight;
  const homeChance = homeWeight / total;
  
  return Math.random() < homeChance ? "home" : "away";
}

/**
 * 이벤트 생성
 */
function generateEvent(
  turn: number,
  homeTeam: Team,
  awayTeam: Team,
  state: MatchSimulationState["state"],
  minTurnForEnd: number
): MatchEvent {
  // 종료 가능 턴 이후: 마무리 이벤트 확률 증가
  if (turn >= minTurnForEnd && Math.random() < 0.3) {
    const winner = decideEventWinner(homeTeam, awayTeam, "clutch_moment", state);
    const winnerName = winner === "home" ? homeTeam.name : awayTeam.name;
    
    return {
      turn,
      type: "game_end",
      message: `${winnerName}이(가) 넥서스를 파괴했습니다!`,
      team: winner,
      impact: {
        momentum: winner === "home" ? 5 : -5
      }
    };
  }
  
  // 일반 이벤트
  const eventTypes: EventType[] = [
    "lane_phase",
    "teamfight",
    "dragon_fight",
    "baron_fight",
    "objective_trade"
  ];
  
  // 턴에 따른 이벤트 타입 선택
  let type: EventType;
  if (turn < 5) {
    type = Math.random() < 0.7 ? "lane_phase" : "first_blood";
  } else if (turn < 15) {
    type = eventTypes[Math.floor(Math.random() * 3)]; // lane/teamfight/dragon
  } else {
    type = eventTypes[Math.floor(Math.random() * eventTypes.length)];
  }
  
  const winner = decideEventWinner(homeTeam, awayTeam, type, state);
  const winnerName = winner === "home" ? homeTeam.name : awayTeam.name;
  const loserName = winner === "home" ? awayTeam.name : homeTeam.name;
  
  // 이벤트별 임팩트 및 메시지
  const event: MatchEvent = {
    turn,
    type,
    team: winner,
    message: "",
    impact: {}
  };
  
  switch (type) {
    case "first_blood":
      event.message = `${winnerName}이(가) 퍼스트 블러드를 획득했습니다!`;
      event.impact = { kills: 1, goldLead: 1, momentum: 1 };
      break;
    case "lane_phase":
      event.message = `${winnerName}이(가) 라인전에서 우위를 점했습니다`;
      event.impact = { kills: Math.random() < 0.5 ? 1 : 0, goldLead: 1 };
      break;
    case "teamfight":
      const kills = 2 + Math.floor(Math.random() * 3);
      event.message = `${winnerName}이(가) 한타에서 승리! ${kills}킬 획득`;
      event.impact = { kills, goldLead: 2, momentum: 1 };
      break;
    case "dragon_fight":
      event.message = `${winnerName}이(가) 드래곤을 획득했습니다`;
      event.impact = { dragons: 1, goldLead: 1 };
      break;
    case "baron_fight":
      event.message = `${winnerName}이(가) 바론을 획득했습니다!`;
      event.impact = { barons: 1, goldLead: 3, momentum: 2 };
      break;
    case "objective_trade":
      event.message = `${winnerName}이(가) 오브젝트 트레이드에서 이득을 봤습니다`;
      event.impact = { towers: 1, goldLead: 1 };
      break;
    case "first_tower":
      event.message = `${winnerName}이(가) 첫 타워를 파괴했습니다`;
      event.impact = { towers: 1, goldLead: 1 };
      break;
    case "clutch_moment":
      event.message = `${winnerName}의 클러치 플레이!`;
      event.impact = { kills: 2, momentum: 2 };
      break;
  }
  
  return event;
}

/**
 * 경기 시뮬레이션 초기화
 */
export function initializeMatch(homeTeam: Team, awayTeam: Team): MatchSimulationState {
  const powerGap = calculatePowerGap(homeTeam, awayTeam);
  const targetTurns = calculateTargetTurns(powerGap);
  
  const startEvent: MatchEvent = {
    turn: 0,
    type: "game_start",
    message: `경기 시작! ${homeTeam.name} vs ${awayTeam.name}`,
    impact: {}
  };
  
  return {
    homeTeam,
    awayTeam,
    currentTurn: 0,
    targetTurns,
    events: [startEvent],
    state: {
      kills: { home: 0, away: 0 },
      towers: { home: 0, away: 0 },
      dragons: { home: 0, away: 0 },
      barons: { home: 0, away: 0 },
      goldLead: 0,
      momentum: 0
    },
    isFinished: false,
    winnerId: null
  };
}

/**
 * 다음 턴 진행
 */
export function processNextTurn(simulation: MatchSimulationState): MatchSimulationState {
  if (simulation.isFinished) return simulation;
  
  const newTurn = simulation.currentTurn + 1;
  const minTurnForEnd = simulation.targetTurns;
  
  const event = generateEvent(
    newTurn,
    simulation.homeTeam,
    simulation.awayTeam,
    simulation.state,
    minTurnForEnd
  );
  
  // 상태 업데이트
  const newState = { ...simulation.state };
  const impact = event.impact;
  
  if (impact.kills) {
    if (event.team === "home") {
      newState.kills.home += impact.kills;
    } else {
      newState.kills.away += impact.kills;
    }
  }
  
  if (impact.towers) {
    if (event.team === "home") {
      newState.towers.home += impact.towers;
    } else {
      newState.towers.away += impact.towers;
    }
  }
  
  if (impact.dragons) {
    if (event.team === "home") {
      newState.dragons.home += impact.dragons;
    } else {
      newState.dragons.away += impact.dragons;
    }
  }
  
  if (impact.barons) {
    if (event.team === "home") {
      newState.barons.home += impact.barons;
    } else {
      newState.barons.away += impact.barons;
    }
  }
  
  if (impact.goldLead) {
    newState.goldLead += event.team === "home" ? impact.goldLead : -impact.goldLead;
  }
  
  if (impact.momentum) {
    newState.momentum += event.team === "home" ? impact.momentum : -impact.momentum;
    // 모멘텀은 -10 ~ +10 범위로 제한
    newState.momentum = Math.max(-10, Math.min(10, newState.momentum));
  }
  
  // 경기 종료 체크
  let isFinished = false;
  let winnerId = null;
  
  if (event.type === "game_end") {
    isFinished = true;
    winnerId = event.team === "home" ? simulation.homeTeam.id : simulation.awayTeam.id;
  }
  
  return {
    ...simulation,
    currentTurn: newTurn,
    events: [...simulation.events, event],
    state: newState,
    isFinished,
    winnerId
  };
}

/**
 * 최종 스코어 계산
 */
function calculateScore(state: MatchSimulationState["state"], team: "home" | "away"): number {
  const kills = team === "home" ? state.kills.home : state.kills.away;
  const towers = team === "home" ? state.towers.home : state.towers.away;
  const dragons = team === "home" ? state.dragons.home : state.dragons.away;
  const barons = team === "home" ? state.barons.home : state.barons.away;
  const goldLead = team === "home" ? Math.max(0, state.goldLead) : Math.max(0, -state.goldLead);
  const momentum = team === "home" ? Math.max(0, state.momentum) : Math.max(0, -state.momentum);
  
  return (
    kills * 1 +
    towers * 3 +
    dragons * 2 +
    barons * 5 +
    goldLead * 0.5 +
    momentum * 0.5
  );
}

/**
 * 경기 결과 생성
 */
export function generateMatchResult(simulation: MatchSimulationState): MatchResult {
  const homeScore = calculateScore(simulation.state, "home");
  const awayScore = calculateScore(simulation.state, "away");
  
  const winnerId = simulation.winnerId || (homeScore > awayScore ? simulation.homeTeam.id : simulation.awayTeam.id);
  
  return {
    homeTeamId: simulation.homeTeam.id,
    awayTeamId: simulation.awayTeam.id,
    homeScore: Math.round(homeScore),
    awayScore: Math.round(awayScore),
    winnerId,
    scoreDiff: Math.abs(Math.round(homeScore - awayScore)),
    kills: simulation.state.kills,
    towers: simulation.state.towers,
    dragons: simulation.state.dragons,
    barons: simulation.state.barons
  };
}
