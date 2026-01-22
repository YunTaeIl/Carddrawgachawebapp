// 고급 경기 시뮬레이션 엔진 - 시리즈 관리

import { Team } from "@/types/league";
import {
  MatchSeries,
  SeriesType,
  GameSet,
  CoachPlan,
  PostGameFeedback,
  SeriesAdaptation,
  GameSimulation
} from "@/types/advancedSimulation";
import { initializeGame } from "./engine";

// ========== 시리즈 초기화 ==========

/**
 * 새 시리즈 생성
 */
export function createMatchSeries(
  id: string,
  seriesType: SeriesType,
  homeTeam: Team,
  awayTeam: Team
): MatchSeries {
  return {
    id,
    seriesType,
    homeTeam,
    awayTeam,
    
    currentSetIndex: 0,
    setWinsHome: 0,
    setWinsAway: 0,
    state: "PRE_GAME",
    
    sets: [],
    
    seriesAdaptation: {
      home: {
        tendencyBonus: {},
        confidenceBoost: 0,
        reviewStacks: {
          REVIEW_MACRO: 0,
          MENTAL_CARE: 0,
          LANE_FOCUS: 0,
          TEAMFIGHT_REVIEW: 0
        }
      },
      away: {
        tendencyBonus: {},
        confidenceBoost: 0,
        reviewStacks: {
          REVIEW_MACRO: 0,
          MENTAL_CARE: 0,
          LANE_FOCUS: 0,
          TEAMFIGHT_REVIEW: 0
        }
      }
    },
    
    currentGame: null
  };
}

// ========== 세트 시작 ==========

/**
 * 새 세트 시작
 * 홀수 세트(1, 3, 5): 원래대로
 * 짝수 세트(2, 4): 홈/어웨이 교체
 */
export function startNewSet(
  series: MatchSeries,
  homePlan: CoachPlan,
  awayPlan: CoachPlan
): MatchSeries {
  const setNumber = series.currentSetIndex + 1;
  
  // 짝수 세트는 팀 교체
  const shouldSwap = setNumber % 2 === 0;
  
  const game = initializeGame(
    setNumber,
    shouldSwap ? series.awayTeam : series.homeTeam,
    shouldSwap ? series.homeTeam : series.awayTeam,
    shouldSwap ? awayPlan : homePlan,
    shouldSwap ? homePlan : awayPlan
  );
  
  // 시리즈 적응 효과 적용 (교체 고려)
  if (shouldSwap) {
    applySeriesAdaptation(game, {
      home: series.seriesAdaptation.away,
      away: series.seriesAdaptation.home
    });
  } else {
    applySeriesAdaptation(game, series.seriesAdaptation);
  }
  
  return {
    ...series,
    state: "IN_GAME",
    currentGame: game
  };
}

function applySeriesAdaptation(game: GameSimulation, adaptation: SeriesAdaptation): void {
  // 홈팀 적응
  const homeBonus = adaptation.home;
  Object.entries(homeBonus.tendencyBonus).forEach(([key, value]) => {
    if (value) {
      (game.tendencies.home as any)[key] = Math.min(100, (game.tendencies.home as any)[key] + value);
    }
  });
  
  Object.values(game.form.home.players).forEach(player => {
    player.confidence = Math.min(100, player.confidence + homeBonus.confidenceBoost);
  });
  
  // 어웨이팀 적응
  const awayBonus = adaptation.away;
  Object.entries(awayBonus.tendencyBonus).forEach(([key, value]) => {
    if (value) {
      (game.tendencies.away as any)[key] = Math.min(100, (game.tendencies.away as any)[key] + value);
    }
  });
  
  Object.values(game.form.away.players).forEach(player => {
    player.confidence = Math.min(100, player.confidence + awayBonus.confidenceBoost);
  });
}

// ========== 세트 종료 ==========

/**
 * 현재 세트 종료 처리
 */
export function finishCurrentSet(series: MatchSeries): MatchSeries {
  if (!series.currentGame || !series.currentGame.isFinished) {
    throw new Error("현재 게임이 종료되지 않았습니다.");
  }
  
  const game = series.currentGame;
  const winnerId = game.winnerId!;
  
  // 세트 데이터 생성
  const gameSet: GameSet = {
    setNumber: game.setNumber,
    winnerId,
    duration: game.currentTime,
    timeline: game.timeline,
    events: game.events,
    finalState: {
      winner: winnerId,
      duration: game.currentTime,
      goldDiff: game.gameState.goldDiff,
      objectives: {
        kills: { ...game.gameState.kills },
        towers: { ...game.gameState.towers },
        dragons: { ...game.gameState.dragons },
        barons: { ...game.gameState.barons }
      },
      mvpCandidates: [] // TODO: MVP 계산
    }
  };
  
  // 세트 승수 업데이트
  let newSetWinsHome = series.setWinsHome;
  let newSetWinsAway = series.setWinsAway;
  
  if (winnerId === series.homeTeam.id) {
    newSetWinsHome++;
  } else {
    newSetWinsAway++;
  }
  
  // 시리즈 종료 체크
  const requiredWins = series.seriesType === "BO3" ? 2 : 3;
  const isSeriesFinished = newSetWinsHome >= requiredWins || newSetWinsAway >= requiredWins;
  
  return {
    ...series,
    sets: [...series.sets, gameSet],
    setWinsHome: newSetWinsHome,
    setWinsAway: newSetWinsAway,
    currentSetIndex: series.currentSetIndex + 1,
    state: isSeriesFinished ? "FINISHED" : "POST_GAME",
    currentGame: null
  };
}

// ========== 세트 후 피드백 적용 ==========

/**
 * 세트 종료 후 피드백 적용
 */
export function applyPostGameFeedback(
  series: MatchSeries,
  homeFeedback: PostGameFeedback,
  awayFeedback: PostGameFeedback
): MatchSeries {
  const newAdaptation = { ...series.seriesAdaptation };
  
  // 홈팀 피드백 적용
  applyFeedbackToTeam(newAdaptation.home, homeFeedback);
  
  // 어웨이팀 피드백 적용
  applyFeedbackToTeam(newAdaptation.away, awayFeedback);
  
  return {
    ...series,
    seriesAdaptation: newAdaptation,
    state: "PRE_GAME" // 다음 세트 준비
  };
}

function applyFeedbackToTeam(
  adaptation: SeriesAdaptation["home"],
  feedback: PostGameFeedback
): void {
  // 피드백 스택 증가
  adaptation.reviewStacks[feedback]++;
  
  // 효과 적용 (간단 구현)
  switch (feedback) {
    case "REVIEW_MACRO":
      adaptation.tendencyBonus.objective = (adaptation.tendencyBonus.objective || 0) + 2;
      adaptation.confidenceBoost += 1;
      break;
    
    case "MENTAL_CARE":
      adaptation.confidenceBoost += 5;
      break;
    
    case "LANE_FOCUS":
      // laning은 tendency가 아니므로 별도 처리 필요 (생략)
      adaptation.confidenceBoost += 2;
      break;
    
    case "TEAMFIGHT_REVIEW":
      adaptation.tendencyBonus.teamfight = (adaptation.tendencyBonus.teamfight || 0) + 3;
      adaptation.confidenceBoost += 1;
      break;
  }
}

// ========== 시리즈 결과 ==========

/**
 * 시리즈 최종 결과 반환
 */
export function getSeriesResult(series: MatchSeries): {
  winnerId: string;
  winnerScore: number;
  loserScore: number;
  sets: GameSet[];
} {
  if (series.state !== "FINISHED") {
    throw new Error("시리즈가 아직 종료되지 않았습니다.");
  }
  
  const winnerId = series.setWinsHome > series.setWinsAway 
    ? series.homeTeam.id 
    : series.awayTeam.id;
  
  return {
    winnerId,
    winnerScore: Math.max(series.setWinsHome, series.setWinsAway),
    loserScore: Math.min(series.setWinsHome, series.setWinsAway),
    sets: series.sets
  };
}
