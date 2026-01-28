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
  EVENT_KILL_COUNTS,
  GAME_PLAN_MODIFIERS,
  COACH_CALL_CONFIGS
} from "./config";
import { getKoreanTeamName } from "@/utils/teamNames";
import { LCKCard } from "@/types/lck";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

// ========== 초기화 ==========

/**
 * 카드 스탯 구조 정규화 (stats가 없으면 생성)
 */
function normalizeCardStats(card: LCKCard): LCKCard {
  if (!card.stats) {
    return {
      ...card,
      stats: {
        ovr: (card as any).ovr ?? 0,
        mechanics: (card as any).mechanics ?? 0,
        laning: (card as any).laning ?? 0,
        teamfight: (card as any).teamfight ?? 0,
        macro: (card as any).macro ?? 0,
        clutch: (card as any).clutch ?? 0,
      }
    };
  }
  return card;
}

/**
 * 팀에 시너지 적용
 */
function applyTeamSynergies(team: Team): Team {
  try {
    // 시너지 계산
    const synergies = calculateSynergies(team.squad);
    const cardBonuses = calculateCardSynergyBonuses(team.squad, synergies);
    
    // 🔥 [1] 시너지 보너스 키 매칭 검증 로그
    const deployedCards = Object.values(team.squad).filter(c => c !== null);
    console.log(`[SYNERGY] 팀: ${team.name}`);
    console.log("[SYNERGY] SQUAD IDS:", deployedCards.map(c => c!.id));
    console.log("[SYNERGY] BONUS KEYS:", Object.keys(cardBonuses));
    
    // 시너지로 인한 스탯 보너스 계산
    let synergyOVRBonus = 0;
    let synergyMechanicsBonus = 0;
    let synergyLaningBonus = 0;
    let synergyTeamfightBonus = 0;
    let synergyMacroBonus = 0;
    let synergyClutchBonus = 0;
    
    deployedCards.forEach(card => {
      if (!card) return;
      const bonus = cardBonuses[card.id];
      console.log(`[SYNERGY] MATCH? ${card.id} =>`, bonus ? `✅ OVR+${bonus.ovr}` : "❌ undefined");
      if (bonus) {
        synergyOVRBonus += bonus.ovr || 0;
        synergyMechanicsBonus += bonus.mechanics || 0;
        synergyLaningBonus += bonus.laning || 0;
        synergyTeamfightBonus += bonus.teamfight || 0;
        synergyMacroBonus += bonus.macro || 0;
        synergyClutchBonus += bonus.clutch || 0;
      }
    });
    
    console.log(`[SYNERGY] 총 시너지 보너스 OVR: ${synergyOVRBonus}`);
    
    // 각 카드에 시너지 적용
    const updatedSquad = { ...team.squad };
    (["TOP", "JGL", "MID", "ADC", "SUP"] as const).forEach(pos => {
      const card = updatedSquad[pos];
      if (card) {
        const normalizedCard = normalizeCardStats(card);
        const bonus = cardBonuses[card.id];
        if (bonus) {
          updatedSquad[pos] = {
            ...normalizedCard,
            stats: {
              ...normalizedCard.stats,
              ovr: (normalizedCard.stats.ovr || 0) + (bonus.ovr || 0),
              mechanics: (normalizedCard.stats.mechanics || 0) + (bonus.mec || 0),
              laning: (normalizedCard.stats.laning || 0) + (bonus.lan || 0),
              teamfight: (normalizedCard.stats.teamfight || 0) + (bonus.tf || 0),
              macro: (normalizedCard.stats.macro || 0) + (bonus.mac || 0),
              clutch: (normalizedCard.stats.clutch || 0) + (bonus.clu || 0)
            }
          };
        } else {
          updatedSquad[pos] = normalizedCard;
        }
      }
    });
    
    // 🔥 updatedSquad 기준으로 team.stats 재계산
    let totalOVR = 0;
    let totalMechanics = 0;
    let totalLaning = 0;
    let totalTeamfight = 0;
    let totalMacro = 0;
    let totalClutch = 0;
    const positions = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;
    
    positions.forEach(pos => {
      const card = updatedSquad[pos];
      if (card?.stats) {
        totalOVR += card.stats.ovr || 0;
        totalMechanics += card.stats.mechanics || 0;
        totalLaning += card.stats.laning || 0;
        totalTeamfight += card.stats.teamfight || 0;
        totalMacro += card.stats.macro || 0;
        totalClutch += card.stats.clutch || 0;
      }
    });
    
    // 🔥 NaN/undefined 검증 로그
    console.log(`[SYNERGY] 재계산된 팀 스탯:`, {
      totalOVR,
      mechanics: totalMechanics,
      laning: totalLaning,
      teamfight: totalTeamfight,
      macro: totalMacro,
      clutch: totalClutch
    });
    
    if (!Number.isFinite(totalOVR)) {
      console.error(`[SYNERGY] ⚠️ NaN 발견! totalOVR=${totalOVR}, 원본=${team.stats.totalOVR}`);
      totalOVR = (team.stats.totalOVR || 0) + synergyOVRBonus;
    }
    
    // 시너지가 적용된 팀 스탯 + 개별 카드 스탯 반환
    const result = {
      ...team,
      squad: updatedSquad,
      stats: {
        totalOVR: totalOVR,
        mechanics: totalMechanics,
        laning: totalLaning,
        teamfight: totalTeamfight,
        macro: totalMacro,
        clutch: totalClutch
      }
    };
    
    console.log(`[SYNERGY] ✅ ${team.name} 최종 스탯 (시너지 적용 완료):`, {
      totalOVR,
      mechanics: totalMechanics,
      laning: totalLaning,
      teamfight: totalTeamfight,
      macro: totalMacro,
      clutch: totalClutch
    });
    
    return result;
  } catch (error) {
    console.error("팀 시너지 적용 오류:", error);
    return team; // 오류 시 원본 팀 반환
  }
}

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
  // 시너지 적용된 팀 스탯 계산
  console.log(`\n========== 세트 ${setNumber} 시뮬레이션 시작 ==========`);
  console.log(`홈: ${homeTeam.name} (기본 OVR: ${homeTeam.stats.totalOVR})`);
  console.log(`원정: ${awayTeam.name} (기본 OVR: ${awayTeam.stats.totalOVR})`);
  
  const homeTeamWithSynergy = applyTeamSynergies(homeTeam);
  const awayTeamWithSynergy = applyTeamSynergies(awayTeam);
  
  console.log(`\n✅ 시너지 적용 완료:`);
  console.log(`홈: ${homeTeamWithSynergy.name} - 최종 OVR: ${homeTeamWithSynergy.stats.totalOVR} (${homeTeamWithSynergy.stats.totalOVR > homeTeam.stats.totalOVR ? '+' : ''}${homeTeamWithSynergy.stats.totalOVR - homeTeam.stats.totalOVR})`);
  console.log(`원정: ${awayTeamWithSynergy.name} - 최종 OVR: ${awayTeamWithSynergy.stats.totalOVR} (${awayTeamWithSynergy.stats.totalOVR > awayTeam.stats.totalOVR ? '+' : ''}${awayTeamWithSynergy.stats.totalOVR - awayTeam.stats.totalOVR})`);
  console.log(`OVR 차이: ${Math.abs(homeTeamWithSynergy.stats.totalOVR - awayTeamWithSynergy.stats.totalOVR)} (${homeTeamWithSynergy.stats.totalOVR > awayTeamWithSynergy.stats.totalOVR ? '홈 우세' : '원정 우세'})\n`);
  
  return {
    setNumber,
    homeTeam: homeTeamWithSynergy,
    awayTeam: awayTeamWithSynergy,
    
    currentTime: 0,
    tickInterval: SIMULATION_CONSTANTS.TICK_INTERVAL,
    targetDuration: calculateTargetDuration(homeTeamWithSynergy, awayTeamWithSynergy),
    
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
      home: initializeTeamTendencies(homeTeamWithSynergy),
      away: initializeTeamTendencies(awayTeamWithSynergy)
    },
    
    form: {
      home: initializeTeamForm(homeTeamWithSynergy),
      away: initializeTeamForm(awayTeamWithSynergy)
    },
    
    gameState: initializeGameState(),
    
    timeline: [{
      time: 0,
      goldHome: 0,
      goldAway: 0,
      goldDiff: 0,
      winProbHome: 50,
      objectiveState: {
        kills: { home: 0, away: 0 },
        towers: { home: 0, away: 0 },
        dragons: { home: 0, away: 0 },
        barons: { home: 0, away: 0 }
      },
      markers: []
    }],
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
    baronBuffHomeExpiry: 0,
    baronBuffAwayExpiry: 0,
    elderBuffHome: false,
    elderBuffAway: false,
    elderBuffHomeExpiry: 0,
    elderBuffAwayExpiry: 0,
    
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
  game.gameState.goldDiff = game.gameState.goldHome - game.gameState.goldAway;
  
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
  
  // 5. 게임 종료 체크 (이벤트 생성 전에 체크)
  checkGameEnd(game, newTime);
  
  // 게임이 종료되었으면 더 이상 이벤트 생성하지 않음
  if (game.isFinished) {
    game.currentTime = newTime;
    return game;
  }
  
  // 6. 이벤트 생성 시도
  const newEvents = generateEvents(game, newTime);
  
  // 7. 이벤트 적용
  newEvents.forEach(event => {
    applyEventEffects(game, event);
  });
  // 이벤트 추가 (불변성 유지!)
  if (newEvents.length > 0) {
    game.events = [...game.events, ...newEvents];
  }
  
  // 8. 승률 계산
  game.gameState.winProbHome = calculateWinProbability(game, "home");
  
  // 9. 타임라인 포인트 기록 (불변성 유지!)
  const timelinePoint = createTimelinePoint(game, newTime);
  game.timeline = [...game.timeline, timelinePoint];
  
  game.currentTime = newTime;
  
  return game;
}

function updateGameDynamics(game: GameSimulation): void {
  const { homeTeam, awayTeam, gameState } = game;
  
  // 버프 만료 체크
  if (gameState.baronBuffHome && game.currentTime >= gameState.baronBuffHomeExpiry) {
    gameState.baronBuffHome = false;
    gameState.baronBuffHomeExpiry = 0;
  }
  if (gameState.baronBuffAway && game.currentTime >= gameState.baronBuffAwayExpiry) {
    gameState.baronBuffAway = false;
    gameState.baronBuffAwayExpiry = 0;
  }
  if (gameState.elderBuffHome && game.currentTime >= gameState.elderBuffHomeExpiry) {
    gameState.elderBuffHome = false;
    gameState.elderBuffHomeExpiry = 0;
  }
  if (gameState.elderBuffAway && game.currentTime >= gameState.elderBuffAwayExpiry) {
    gameState.elderBuffAway = false;
    gameState.elderBuffAwayExpiry = 0;
  }
  
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
    
    // 조건 체크
    if (config.conditions) {
      for (const condition of config.conditions) {
        if (condition === "baron_alive") {
          // 바론이 살아있는지 = 둘 다 바론 버프가 없는 상태
          if (game.gameState.baronBuffHome || game.gameState.baronBuffAway) {
            return false;
          }
        }
        if (condition === "dragon_alive") {
          // 드래곤 관련 조건
          const totalDragons = game.gameState.dragons.home + game.gameState.dragons.away;
          if (totalDragons >= 4) return false; // 4마리 이상 잡혔으면 소울 획득
        }
      }
    }
    
    // BARON_TAKE/STEAL은 최근에 BARON_START가 있었을 때만
    if (config.type === "BARON_TAKE" || config.type === "BARON_STEAL") {
      const recentBaronStart = game.events
        .filter(e => e.type === "BARON_START")
        .sort((a, b) => b.time - a.time)[0];
      
      // 바론 시작 후 30초~2분 이내에만 바론 획득 가능
      if (!recentBaronStart || 
          (currentTime - recentBaronStart.time) < 30 || 
          (currentTime - recentBaronStart.time) > 120) {
        return false;
      }
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
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`⏱️  시간: ${Math.floor(time / 60)}분 ${time % 60}초`);
  
  // 승패 결정
  const winSide = decideEventWinner(game, eventType);
  const success = true; // 일단 모두 성공으로 (실패 로직은 확장 가능)
  
  // 골드 스윙
  const [minGold, maxGold] = config.goldSwingRange;
  const goldSwing = minGold + Math.random() * (maxGold - minGold);
  
  // 🔥 킬 수 증가
  // 🔥 [4] executeEvent는 상태 변경하지 않음 - 킬 카운트는 applyEventEffects에서 처리
  const killCount = EVENT_KILL_COUNTS[eventType] || 0;
  
  // 메시지
  const teamName = winSide === "home" 
    ? getKoreanTeamName(game.homeTeam.name)
    : getKoreanTeamName(game.awayTeam.name);
  
  const text = EVENT_MESSAGES[eventType]?.success(teamName) || `${teamName}가 이벤트에서 승리했습니다!`;
  
  // 영향 태그
  const impactTags: string[] = [];
  if (goldSwing > 1500) impactTags.push("huge_swing");
  if (goldSwing > 1000) impactTags.push("major");
  if (killCount && killCount >= 3) impactTags.push("multi_kill");
  
  console.log(`💰 골드 스윙: ${goldSwing.toFixed(0)}G`);
  console.log(`💀 킬 수: ${killCount}`);
  console.log(`📢 ${text}`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
  
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
  
  console.log(`\n🎲 [EVENT] ${eventType} 승자 결정 중...`);
  console.log(`⚔️ ${game.homeTeam.name} (OVR: ${game.homeTeam.stats.totalOVR}) vs ${game.awayTeam.name} (OVR: ${game.awayTeam.stats.totalOVR})`);
  
  // 확률 계산
  const factors = calculateProbabilityFactors(game, eventType);
  const totalScore = Object.values(factors).reduce((sum, val) => sum + val, 0);
  
  console.log(`📊 확률 요소:`, factors);
  console.log(`📈 Total Score: ${totalScore.toFixed(2)}`);
  
  // sigmoid 변환
  const homeWinProb = 1 / (1 + Math.exp(-totalScore / 50));
  
  // 🔥 NaN 방어
  const safeProb = Number.isFinite(homeWinProb) ? homeWinProb : 0.5;
  
  if (!Number.isFinite(homeWinProb)) {
    console.warn(`[PROB] ⚠️ NaN 발견! totalScore=${totalScore}, factors=`, factors);
  }
  
  console.log(`🎯 홈 승률: ${(safeProb * 100).toFixed(1)}%`);
  
  const roll = Math.random();
  const winner = roll < safeProb ? "home" : "away";
  
  console.log(`🎲 주사위: ${(roll * 100).toFixed(1)}% → ${winner === "home" ? "✅ 홈 승리!" : "✅ 원정 승리!"}`);
  console.log(`🏆 승자: ${winner === "home" ? game.homeTeam.name : game.awayTeam.name}\n`);
  
  return winner;
}

function calculateProbabilityFactors(
  game: GameSimulation,
  eventType: GameEventType
): ProbabilityFactors {
  const config = EVENT_CONFIGS[eventType];
  const weights = config.statWeights;
  
  console.log(`\n🧮 확률 계산 시작 (${eventType})`);
  
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
  
  console.log(`🎮 [STATE] 게임 상태:`, {
    goldDiff: goldDiff.toFixed(0),
    momentum: momentum.toFixed(0),
    laneControl: laneControl.toFixed(1),
    visionControl: visionControl.toFixed(1),
    mental: mental.toFixed(1)
  });
  
  console.log(`🔥 [BONUS] 추가 보너스:`, {
    form: formBonus.toFixed(1),
    fatigue: fatiguePenalty.toFixed(1),
    tendency: tendencyBonus.toFixed(1),
    coachPlan: coachPlanBonus.toFixed(1),
    activeCall: activeCallBonus.toFixed(1),
    noise: noise.toFixed(1)
  });
  
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
  
  console.log(`💪 [STAT] ${teamA.name} 스탯 (확률 계산용):`, {
    ovr: statsA.totalOVR,
    mec: statsA.mechanics,
    lan: statsA.laning,
    tf: statsA.teamfight,
    mac: statsA.macro,
    clu: statsA.clutch
  });
  console.log(`💪 [STAT] ${teamB.name} 스탯 (확률 계산용):`, {
    ovr: statsB.totalOVR,
    mec: statsB.mechanics,
    lan: statsB.laning,
    tf: statsB.teamfight,
    mac: statsB.macro,
    clu: statsB.clutch
  });
  
  // 🔥 디버그: 혹시 원본 팀 스탯과 다른지 확인
  if (statsA.mechanics !== teamA.stats.mechanics) {
    console.error(`❌ [BUG] ${teamA.name} 스탯 불일치 감지!`);
    console.error(`teamA.stats.mechanics: ${teamA.stats.mechanics}`);
    console.error(`statsA.mechanics: ${statsA.mechanics}`);
  }
  console.log(`⚖️ [WEIGHT] 이벤트 가중치:`, weights);
  
  const mecDiff = ((statsA.mechanics || 0) - (statsB.mechanics || 0)) * (weights.mechanics ?? 0);
  const lanDiff = ((statsA.laning || 0) - (statsB.laning || 0)) * (weights.laning ?? 0);
  const tfDiff = ((statsA.teamfight || 0) - (statsB.teamfight || 0)) * (weights.teamfight ?? 0);
  const macDiff = ((statsA.macro || 0) - (statsB.macro || 0)) * (weights.macro ?? 0);
  const cluDiff = ((statsA.clutch || 0) - (statsB.clutch || 0)) * (weights.clutch ?? 0);
  
  const total = mecDiff + lanDiff + tfDiff + macDiff + cluDiff;
  
  console.log(`📐 [CALC] 스탯 차이 계산:`, {
    mechanics: `${mecDiff.toFixed(1)}`,
    laning: `${lanDiff.toFixed(1)}`,
    teamfight: `${tfDiff.toFixed(1)}`,
    macro: `${macDiff.toFixed(1)}`,
    clutch: `${cluDiff.toFixed(1)}`,
    total: `${total.toFixed(1)}`
  });
  
  // 🔥 안전 처리: 모든 스탯과 가중치에 기본값
  return total;
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
    case "BARON_STEAL":
      if (event.side !== "neutral") {
        state.barons[event.side]++;
        const baronBuffDuration = 180; // 3분
        if (event.side === "home") {
          state.baronBuffHome = true;
          state.baronBuffHomeExpiry = game.currentTime + baronBuffDuration;
        } else {
          state.baronBuffAway = true;
          state.baronBuffAwayExpiry = game.currentTime + baronBuffDuration;
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
      // 게임 종료 (🔥 [5] winProbHome 기준으로 승자 결정)
      const winner = state.winProbHome > 50 ? "home" : "away";
      
      game.isFinished = true;
      game.winnerId = winner === "home" ? game.homeTeam.id : game.awayTeam.id;
      
      // NEXUS_DESTROYED 이벤트 생성
      const nexusEvent: GameEvent = {
        time,
        type: "NEXUS_DESTROYED",
        side: winner,
        success: true,
        goldSwing: 0,
        text: `${winner === "home" ? getKoreanTeamName(game.homeTeam.name) : getKoreanTeamName(game.awayTeam.name)}가 승리했습니다!`,
        impactTags: ["game_end"]
      };
      
      game.events = [...game.events, nexusEvent];
    }
  }
}

// ========== 감독 개입 ==========

/**
 * 감독 콜 사용
 */
export function useCoachCall(
  game: GameSimulation,
  side: "home" | "away",
  callType: string
): GameSimulation {
  const callConfig = COACH_CALL_CONFIGS[callType];
  if (!callConfig) {
    console.error(`Unknown coach call: ${callType}`);
    return game;
  }
  
  const cp = side === "home" ? game.commandPoints.home : game.commandPoints.away;
  
  if (cp.current < callConfig.cpCost) {
    console.warn(`Not enough CP for ${callType}`);
    return game;
  }
  
  // CP 소모
  cp.current -= callConfig.cpCost;
  
  // 콜 활성화
  const newCall: CoachCall = {
    type: callType,
    name: callConfig.name,
    activatedAt: game.currentTime,
    duration: callConfig.duration,
    modifiers: callConfig.modifiers
  };
  
  if (side === "home") {
    game.activeCalls.home = [...game.activeCalls.home, newCall];
  } else {
    game.activeCalls.away = [...game.activeCalls.away, newCall];
  }
  
  console.log(`[COACH CALL] ${side} used ${callConfig.name}`);
  
  return game;
}

/**
 * 만료된 콜 정리
 */
export function cleanupExpiredCalls(game: GameSimulation): void {
  const currentTime = game.currentTime;
  
  game.activeCalls.home = game.activeCalls.home.filter(
    call => (currentTime - call.activatedAt) < call.duration
  );
  
  game.activeCalls.away = game.activeCalls.away.filter(
    call => (currentTime - call.activatedAt) < call.duration
  );
}
