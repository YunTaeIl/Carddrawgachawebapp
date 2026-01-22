// 고급 경기 시뮬레이션 엔진 - 통합 진입점

export * from "./config";
export * from "./engine";
export * from "./series";

// 편의 함수들
export { EVENT_CONFIGS, COACH_CALL_CONFIGS, SIMULATION_CONSTANTS } from "./config";
export { 
  initializeGame, 
  processGameTick, 
  useCoachCall,
  cleanupExpiredCalls
} from "./engine";
export {
  createMatchSeries,
  startNewSet,
  finishCurrentSet,
  applyPostGameFeedback,
  getSeriesResult
} from "./series";
