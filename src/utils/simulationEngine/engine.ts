// 고급 경기 시뮬레이션 엔진 - 핵심 로직

import { Team } from "@/types/league";
import {
  GameSimulation,
  GameState,
  GameEvent,
  TimelinePoint,
  CoachPlan,
  TeamTendencies,
  TeamForm,
  PlayerForm,
  CommandPoints,
  CoachCall,
  GameEventType,
  ProbabilityFactors,
  EventStatWeights
} from "@/types/advancedSimulation";
import {
  EVENT_CONFIGS,
  SIMULATION_CONSTANTS,
  EVENT_MESSAGES,
  GAME_PLAN_MODIFIERS
} from "./config";
import { getKoreanTeamName } from "@/utils/teamNames";
import { LCKCard } from "@/types/lck";

// ========== 초기화 ==========

/**
 * 게임 시뮬레이션 초기화
 */
export function initializeGame(
  setNumber: number,
  homeTeam: Team,
  awayTeam: Team,
  homePlan: CoachPlan,
  awayPlan: CoachPlan
): GameSimulation {
  return {
    setNumber,
    homeTeam,
    awayTeam,
    
    currentTime: 0,
    tickInterval: SIMULATION_CONSTANTS.TICK_INTERVAL,
    targetDuration: calculateTargetDuration(homeTeam, awayTeam),
    
    coachPlan: {
      home: homePlan,
      away: awayPlan
    },
    
    activeCalls: {
      home: [],
      away: []
    },
    
    commandPoints: {
      home: createInitialCP(),
      away: createInitialCP()
    },
    
    tendencies: {
      home: initializeTeamTendencies(homeTeam),
      away: initializeTeamTendencies(awayTeam)
    },
    
    form: {
      home: initializeTeamForm(homeTeam),
      away: initializeTeamForm(awayTeam)
    },
    
    gameState: initializeGameState(),
    
    timeline: [],
    events: [{
      time: 0,
      type: "GAME_START",
      side: "neutral",
      success: true,
      goldSwing: 0,
      text: "경기가 시작되었습니다!",
      impactTags: []
    }],
    
    isFinished: false,
    winnerId: null
  };
}

function createInitialCP(): CommandPoints {
  return {
    current: SIMULATION_CONSTANTS.CP_MAX,
    max: SIMULATION_CONSTANTS.CP_MAX,
    regenPerMinute: SIMULATION_CONSTANTS.CP_REGEN_PER_MINUTE
  };
}

function calculateTargetDuration(homeTeam: Team, awayTeam: Team): number {
  const powerDiff = Math.abs(homeTeam.stats.totalOVR - awayTeam.stats.totalOVR);
  const powerRatio = powerDiff / Math.max(homeTeam.stats.totalOVR, awayTeam.stats.totalOVR);
  
  // 전력 차이가 클수록 짧은 게임
  if (powerRatio > 0.2) {
    return 1500 + Math.random() * 300; // 25~30분
  } else if (powerRatio > 0.1) {
    return 1800 + Math.random() * 300; // 30~35분
  } else {
    return 2100 + Math.random() * 600; // 35~45분
  }
}

function initializeTeamTendencies(team: Team): TeamTendencies {
  // 팀 스탯 기반으로 성향 초기화
  const stats = team.stats;
  
  return {
    aggression: Math.min(100, 40 + stats.mechanics / 5),
    objective: Math.min(100, 40 + stats.macro / 5),
    vision: Math.min(100, 40 + stats.macro / 5),
    split: Math.min(100, 35 + stats.macro / 6),
    teamfight: Math.min(100, 40 + stats.teamfight / 5)
  };
}

function initializeTeamForm(team: Team): TeamForm {
  const players: Record<string, PlayerForm> = {};
  
  const positions: ("TOP" | "JGL" | "MID" | "ADC" | "SUP")[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
  
  positions.forEach(pos => {
    const card = team.squad[pos];
    if (card) {
      players[card.id] = {
        playerId: card.id,
        condition: 85 + Math.random() * 15, // 85~100
        confidence: 70 + Math.random() * 20, // 70~90
        fatigue: Math.random() * 10 // 0~10
      };
    }
  });
  
  return { players };
}

function initializeGameState(): GameState {
  return {
    goldHome: 0,
    goldAway: 0,
    goldDiff: 0,
    
    kills: { home: 0, away: 0 },
    towers: { home: 0, away: 0 },
    dragons: { home: 0, away: 0 },
    barons: { home: 0, away: 0 },
    heralds: { home: 0, away: 0 },
    
    baronBuffHome: false,
    baronBuffAway: false,
    elderBuffHome: false,
    elderBuffAway: false,
    
    winProbHome: 50,
    laneControl: { top: 0, mid: 0, bot: 0 },
    visionControl: 0,
    
    momentum: 0,
    mentalHome: 80,
    mentalAway: 80
  };
}

// ========== 틱 진행 ==========

/**
 * 시뮬레이션 한 틱 진행
 */
export function processGameTick(game: GameSimulation): GameSimulation {
  if (game.isFinished) return game;
  
  const newTime = game.currentTime + game.tickInterval;
  
  // 1. 기본 골드 증가 (파밍)
  const goldIncrease = (SIMULATION_CONSTANTS.BASE_GOLD_PER_MINUTE / 60) * game.tickInterval;
  game.gameState.goldHome += goldIncrease;
  game.gameState.goldAway += goldIncrease;
  
  // 2. CP 회복
  const cpRegen = (SIMULATION_CONSTANTS.CP_REGEN_PER_MINUTE / 60) * game.tickInterval;
  game.commandPoints.home.current = Math.min(
    game.commandPoints.home.max,
    game.commandPoints.home.current + cpRegen
  );
  game.commandPoints.away.current = Math.min(
    game.commandPoints.away.max,
    game.commandPoints.away.current + cpRegen
  );
  
  // 3. 라인 주도권 / 시야 / 멘탈 업데이트
  updateGameDynamics(game);
  
  // 4. 만료된 콜 정리
  cleanupExpiredCalls(game);
  
  // 5. 이벤트 생성 시도
  const newEvents = generateEvents(game, newTime);
  
  // 5. 이벤트 적용
  newEvents.forEach(event => {
    applyEventEffects(game, event);
    game.events.push(event);
  });
  
  // 6. 승률 계산
  game.gameState.winProbHome = calculateWinProbability(game, "home");
  
  // 7. 타임라인 포인트 기록
  game.timeline.push(createTimelinePoint(game, newTime));
  
  // 8. 게임 종료 체크
  checkGameEnd(game, newTime);
  
  game.currentTime = newTime;
  
  return game;
}

function updateGameDynamics(game: GameSimulation): void {
  const { homeTeam, awayTeam, gameState } = game;
  
  // 라인 주도권 (laning 스탯 기반)
  const topHome = homeTeam.squad.TOP;
  const topAway = awayTeam.squad.TOP;
  if (topHome && topAway) {
    const diff = topHome.stats.laning - topAway.stats.laning;
    gameState.laneControl.top = Math.max(-100, Math.min(100, gameState.laneControl.top + diff * 0.5));
  }
  
  // 시야 장악 (macro 스탯 기반)
  const visionDiff = homeTeam.stats.macro - awayTeam.stats.macro;
  gameState.visionControl = Math.max(-100, Math.min(100, visionDiff * 2));
  
  // 멘탈 (momentum 기반)
  if (gameState.momentum > 20) {
    gameState.mentalHome = Math.min(100, gameState.mentalHome + 1);
    gameState.mentalAway = Math.max(0, gameState.mentalAway - 1);
  } else if (gameState.momentum < -20) {
    gameState.mentalHome = Math.max(0, gameState.mentalHome - 1);
    gameState.mentalAway = Math.min(100, gameState.mentalAway + 1);
  }
}

function generateEvents(game: GameSimulation, currentTime: number): GameEvent[] {
  const events: GameEvent[] = [];
  
  // 이벤트 후보군 필터링
  const candidates = Object.values(EVENT_CONFIGS).filter(config => {
    // NEXUS_DESTROYED는 여기서 생성하지 않음 (게임 종료 체크에서만)
    if (config.type === "NEXUS_DESTROYED") return false;
    
    // FIRST_BLOOD 계열은 첫 킬이 발생하지 않았을 때만
    if (config.type.includes("FIRST_BLOOD")) {
      const totalKills = game.gameState.kills.home + game.gameState.kills.away;
      if (totalKills > 0) return false;
    }
    
    // 시간 범위 체크
    if (currentTime < config.minTime || currentTime > config.maxTime) return false;
    
    // 쿨타임 체크
    const lastOccurrence = game.events
      .filter(e => e.type === config.type)
      .sort((a, b) => b.time - a.time)[0];
    
    if (lastOccurrence && (currentTime - lastOccurrence.time) < config.cooldown) {
      return false;
    }
    
    // 조건 체크 (dragon_alive 등)
    if (config.conditions) {
      // 간단 구현: 조건은 나중에 확장 가능
      return true;
    }
    
    return true;
  });
  
  // 확률 기반 이벤트 샘플링 (0~2개)
  const numEvents = Math.random() < 0.4 ? 1 : (Math.random() < 0.1 ? 2 : 0);
  
  for (let i = 0; i < numEvents && candidates.length > 0; i++) {
    // 가중치 기반 샘플링
    const weights = candidates.map(c => c.baseChance);
    const selected = weightedRandom(candidates, weights);
    
    if (selected) {
      const event = executeEvent(game, selected.type, currentTime);
      events.push(event);
      
      // 같은 이벤트 중복 방지
      const idx = candidates.indexOf(selected);
      if (idx >= 0) candidates.splice(idx, 1);
    }
  }
  
  return events;
}

function weightedRandom<T>(items: T[], weights: number[]): T | null {
  const total = weights.reduce((sum, w) => sum + w, 0);
  if (total === 0) return null;
  
  let random = Math.random() * total;
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) return items[i];
  }
  
  return items[items.length - 1];
}

function executeEvent(game: GameSimulation, eventType: GameEventType, time: number): GameEvent {
  const config = EVENT_CONFIGS[eventType];
  
  // 승패 결정
  const winSide = decideEventWinner(game, eventType);
  const success = true; // 일단 모두 성공으로 (실패 로직은 확장 가능)
  
  // 골드 스윙
  const [minGold, maxGold] = config.goldSwingRange;
  const goldSwing = minGold + Math.random() * (maxGold - minGold);
  
  // 메시지
  const teamName = winSide === "home" 
    ? getKoreanTeamName(game.homeTeam.name)
    : getKoreanTeamName(game.awayTeam.name);
  
  const text = EVENT_MESSAGES[eventType]?.success(teamName) || `${teamName}이 이벤트에서 승리했습니다!`;
  
  // 영향 태그
  const impactTags: string[] = [];
  if (goldSwing > 1500) impactTags.push("huge_swing");
  if (goldSwing > 1000) impactTags.push("major");
  
  return {
    time,
    type: eventType,
    side: winSide,
    success,
    goldSwing,
    text,
    impactTags
  };
}

function decideEventWinner(game: GameSimulation, eventType: GameEventType): "home" | "away" {
  const config = EVENT_CONFIGS[eventType];
  
  // 확률 계산
  const factors = calculateProbabilityFactors(game, eventType);
  const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);
  
  // sigmoid 변환
  const homeWinProb = 1 / (1 + Math.exp(-totalScore / 50));
  
  return Math.random() < homeWinProb ? "home" : "away";
}

function calculateProbabilityFactors(
  game: GameSimulation,
  eventType: GameEventType
): ProbabilityFactors {
  const config = EVENT_CONFIGS[eventType];
  const weights = config.statWeights;
  
  // 기본 스탯 차이
  const statDiff = calculateWeightedStatDiff(game.homeTeam, game.awayTeam, weights);
  
  // 상태 보정
  const goldDiff = game.gameState.goldDiff;
  const momentum = game.gameState.momentum;
  const laneControl = (game.gameState.laneControl.top + game.gameState.laneControl.mid + game.gameState.laneControl.bot) / 3;
  const visionControl = game.gameState.visionControl;
  const mental = game.gameState.mentalHome - game.gameState.mentalAway;
  
  // 폼 보너스
  const formBonus = calculateFormBonus(game, "home") - calculateFormBonus(game, "away");
  const fatiguePenalty = calculateFatiguePenalty(game, "home") - calculateFatiguePenalty(game, "away");
  
  // 성향 보너스
  const tendencyBonus = calculateTendencyBonus(game, eventType, "home") 
    - calculateTendencyBonus(game, eventType, "away");
  
  // 감독 보너스
  const coachPlanBonus = calculateCoachPlanBonus(game, eventType, "home")
    - calculateCoachPlanBonus(game, eventType, "away");
  
  const activeCallBonus = calculateActiveCallBonus(game, eventType, "home")
    - calculateActiveCallBonus(game, eventType, "away");
  
  // 랜덤 노이즈
  const noise = (Math.random() - 0.5) * 20;
  
  return {
    statDiff,
    goldDiff: goldDiff * 0.01,
    momentum: momentum * 0.5,
    laneControl: laneControl * 0.3,
    visionControl: visionControl * 0.2,
    mental: mental * 0.3,
    formBonus,
    fatiguepenalty: fatiguePenalty,
    tendencyBonus,
    coachPlanBonus,
    activeCallBonus,
    noise
  };
}

function calculateWeightedStatDiff(
  teamA: Team,
  teamB: Team,
  weights: EventStatWeights
): number {
  const statsA = teamA.stats;
  const statsB = teamB.stats;
  
  return (
    (statsA.mechanics - statsB.mechanics) * weights.mechanics +
    (statsA.laning - statsB.laning) * weights.laning +
    (statsA.teamfight - statsB.teamfight) * weights.teamfight +
    (statsA.macro - statsB.macro) * weights.macro +
    (statsA.clutch - statsB.clutch) * weights.clutch
  );
}

function calculateFormBonus(game: GameSimulation, side: "home" | "away"): number {
  const form = side === "home" ? game.form.home : game.form.away;
  const players = Object.values(form.players);
  
  const avgCondition = players.reduce((sum, p) => sum + p.condition, 0) / players.length;
  const avgConfidence = players.reduce((sum, p) => sum + p.confidence, 0) / players.length;
  
  return (avgCondition - 85) * 0.5 + (avgConfidence - 80) * 0.3;
}

function calculateFatiguePenalty(game: GameSimulation, side: "home" | "away"): number {
  const form = side === "home" ? game.form.home : game.form.away;
  const players = Object.values(form.players);
  
  const avgFatigue = players.reduce((sum, p) => sum + p.fatigue, 0) / players.length;
  
  return -avgFatigue * 0.5;
}

function calculateTendencyBonus(
  game: GameSimulation,
  eventType: GameEventType,
  side: "home" | "away"
): number {
  const tendency = side === "home" ? game.tendencies.home : game.tendencies.away;
  
  // 이벤트별 성향 매핑
  const tendencyMap: Record<string, keyof TeamTendencies> = {
    "TOWER_DIVE": "aggression",
    "COUNTER_JUNGLE": "aggression",
    "DRAGON_FIGHT": "objective",
    "BARON_TAKE": "objective",
    "PICK_OFF": "vision",
    "BACKDOOR_ATTEMPT": "split",
    "ACE_TEAMFIGHT": "teamfight"
  };
  
  const relevantTendency = tendencyMap[eventType];
  if (!relevantTendency) return 0;
  
  return (tendency[relevantTendency] - 50) * 0.5;
}

function calculateCoachPlanBonus(
  game: GameSimulation,
  eventType: GameEventType,
  side: "home" | "away"
): number {
  const plan = side === "home" ? game.coachPlan.home : game.coachPlan.away;
  
  let bonus = 0;
  
  plan.gamePlan.forEach(planType => {
    const modifiers = GAME_PLAN_MODIFIERS[planType];
    if (modifiers.eventBonus[eventType]) {
      bonus += modifiers.eventBonus[eventType] * 20;
    }
  });
  
  return bonus;
}

function calculateActiveCallBonus(
  game: GameSimulation,
  eventType: GameEventType,
  side: "home" | "away"
): number {
  const calls = side === "home" ? game.activeCalls.home : game.activeCalls.away;
  
  let bonus = 0;
  
  calls.forEach(call => {
    if (call.modifiers.eventProbability && call.modifiers.eventProbability[eventType]) {
      bonus += call.modifiers.eventProbability[eventType] * 30;
    }
  });
  
  return bonus;
}

function applyEventEffects(game: GameSimulation, event: GameEvent): void {
  const state = game.gameState;
  
  // 골드 적용
  if (event.side === "home") {
    state.goldHome += event.goldSwing;
  } else if (event.side === "away") {
    state.goldAway += event.goldSwing;
  }
  state.goldDiff = state.goldHome - state.goldAway;
  
  // 이벤트별 효과
  switch (event.type) {
    case "FIRST_BLOOD_GANK":
    case "FIRST_BLOOD_SOLO":
    case "FIRST_BLOOD_DIVE":
      if (event.side !== "neutral") {
        state.kills[event.side]++;
        state.momentum += event.side === "home" ? 10 : -10;
      }
      break;
    
    case "DRAGON_FIGHT":
    case "FIRST_DRAGON":
      if (event.side !== "neutral") {
        state.dragons[event.side]++;
        state.momentum += event.side === "home" ? 5 : -5;
      }
      break;
    
    case "HERALD_1":
    case "HERALD_2":
      if (event.side !== "neutral") {
        state.heralds[event.side]++;
      }
      break;
    
    case "BARON_TAKE":
      if (event.side !== "neutral") {
        state.barons[event.side]++;
        if (event.side === "home") {
          state.baronBuffHome = true;
        } else {
          state.baronBuffAway = true;
        }
        state.momentum += event.side === "home" ? 20 : -20;
      }
      break;
    
    case "TOWER_TAKEDOWN":
      if (event.side !== "neutral") {
        state.towers[event.side]++;
      }
      break;
    
    case "ACE_TEAMFIGHT":
      if (event.side !== "neutral") {
        state.kills[event.side] += 4 + Math.floor(Math.random() * 2);
        state.momentum += event.side === "home" ? 15 : -15;
      }
      break;
  }
  
  // 모멘텀 제한
  state.momentum = Math.max(-100, Math.min(100, state.momentum));
}

function calculateWinProbability(game: GameSimulation, side: "home" | "away"): number {
  const state = game.gameState;
  const factors = SIMULATION_CONSTANTS.WIN_PROB_FACTORS;
  
  let score = 50; // 기본 50%
  
  const sign = side === "home" ? 1 : -1;
  
  score += state.goldDiff * factors.goldDiff * sign;
  score += (state.towers.home - state.towers.away) * factors.towers * 100 * sign;
  score += (state.dragons.home - state.dragons.away) * factors.dragons * 100 * sign;
  score += (state.barons.home - state.barons.away) * factors.barons * 100 * sign;
  score += state.momentum * factors.momentum * sign;
  
  return Math.max(0, Math.min(100, score));
}

function createTimelinePoint(game: GameSimulation, time: number): TimelinePoint {
  return {
    time,
    goldHome: game.gameState.goldHome,
    goldAway: game.gameState.goldAway,
    goldDiff: game.gameState.goldDiff,
    winProbHome: game.gameState.winProbHome,
    objectiveState: {
      kills: { ...game.gameState.kills },
      towers: { ...game.gameState.towers },
      dragons: { ...game.gameState.dragons },
      barons: { ...game.gameState.barons }
    },
    markers: []
  };
}

function checkGameEnd(game: GameSimulation, time: number): void {
  const state = game.gameState;
  
  // 최소 시간 이후, 조건 충족 시 종료
  if (time >= SIMULATION_CONSTANTS.MIN_GAME_DURATION) {
    // 타워 차이가 크거나, 바론/장로 보유 시 종료 확률 증가
    const towerDiff = Math.abs(state.towers.home - state.towers.away);
    const hasBaronBuff = state.baronBuffHome || state.baronBuffAway;
    const hasElderBuff = state.elderBuffHome || state.elderBuffAway;
    
    let endChance = 0.05; // 기본 5%
    
    if (towerDiff >= 3) endChance += 0.2;
    if (hasBaronBuff) endChance += 0.3;
    if (hasElderBuff) endChance += 0.4;
    if (time >= game.targetDuration) endChance += 0.5;
    
    if (Math.random() < endChance) {
      // 게임 종료
      const winner = state.goldDiff > 0 ? "home" : "away";
      const winnerId = winner === "home" ? game.homeTeam.id : game.awayTeam.id;
      
      const winnerTeamName = getKoreanTeamName(winner === "home" ? game.homeTeam.name : game.awayTeam.name);
      
      const endEvent: GameEvent = {
        time,
        type: "NEXUS_DESTROYED",
        side: winner,
        success: true,
        goldSwing: 0,
        text: `${winnerTeamName}이 넥서스를 파괴했습니다! 승리!`,
        impactTags: ["game_end"]
      };
      
      game.events.push(endEvent);
      game.isFinished = true;
      game.winnerId = winnerId;
    }
  }
}

// ========== 감독 콜 사용 ==========

/**
 * 감독 콜 사용
 */
export function useCoachCall(
  game: GameSimulation,
  side: "home" | "away",
  callType: CoachCallType
): { success: boolean; message: string } {
  const config = COACH_CALL_CONFIGS[callType];
  const cp = side === "home" ? game.commandPoints.home : game.commandPoints.away;
  
  // CP 부족 체크
  if (cp.current < config.cpCost) {
    return {
      success: false,
      message: `CP가 부족합니다 (필요: ${config.cpCost}, 현재: ${Math.floor(cp.current)})`
    };
  }
  
  // 같은 콜이 이미 활성화되어 있는지 체크
  const activeCalls = side === "home" ? game.activeCalls.home : game.activeCalls.away;
  const alreadyActive = activeCalls.some(call => call.type === callType);
  
  if (alreadyActive) {
    return {
      success: false,
      message: "이미 활성화된 콜입니다"
    };
  }
  
  // CP 소모
  cp.current -= config.cpCost;
  
  // 콜 활성화
  const newCall: CoachCall = {
    id: `${callType}-${Date.now()}`,
    type: callType,
    cpCost: config.cpCost,
    startedAtGameTime: game.currentTime,
    durationMinutes: config.duration,
    modifiers: config.modifiers
  };
  
  activeCalls.push(newCall);
  
  return {
    success: true,
    message: `${getCallDisplayName(callType)} 사용!`
  };
}

/**
 * 만료된 콜 제거
 */
export function cleanupExpiredCalls(game: GameSimulation): void {
  const cleanupSide = (side: "home" | "away") => {
    const activeCalls = side === "home" ? game.activeCalls.home : game.activeCalls.away;
    const currentTime = game.currentTime;
    
    // 만료된 콜 필터링
    const validCalls = activeCalls.filter(call => {
      const elapsed = currentTime - call.startedAtGameTime;
      const duration = call.durationMinutes * 60; // 분 -> 초
      return elapsed < duration;
    });
    
    if (side === "home") {
      game.activeCalls.home = validCalls;
    } else {
      game.activeCalls.away = validCalls;
    }
  };
  
  cleanupSide("home");
  cleanupSide("away");
}

function getCallDisplayName(callType: CoachCallType): string {
  const names: Record<CoachCallType, string> = {
    SAFE_PLAY: "안전 운영",
    DIVE_CALL: "타워다이브",
    INVADE_CALL: "적 정글 침투",
    VISION_CONTROL: "시야 장악",
    FORCE_OBJECTIVE: "오브젝트 강제",
    AVOID_FIGHT: "교전 회피",
    START_BARON: "바론 시작",
    BARON_FAKE: "바론 페이크"
  };
  return names[callType];
}
