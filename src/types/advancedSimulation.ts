// 고급 경기 시뮬레이션 타입 정의

import { Team } from "./league";
import { LCKCard } from "./lck";

// ========== 시리즈 관련 ==========

export type SeriesType = "BO3" | "BO5";
export type SeriesState = "PRE_GAME" | "IN_GAME" | "POST_GAME" | "FINISHED";

export interface MatchSeries {
  id: string;
  seriesType: SeriesType;
  homeTeam: Team;
  awayTeam: Team;
  
  // 시리즈 진행 상태
  currentSetIndex: number;
  setWinsHome: number;
  setWinsAway: number;
  state: SeriesState;
  
  // 각 세트 데이터
  sets: GameSet[];
  
  // 시리즈 적응 누적
  seriesAdaptation: SeriesAdaptation;
  
  // 현재 진행 중인 게임
  currentGame: GameSimulation | null;
}

export interface GameSet {
  setNumber: number;
  winnerId: string | null;
  duration: number; // 초 단위
  timeline: TimelinePoint[];
  events: GameEvent[];
  finalState: GameFinalState;
}

// ========== 감독 시스템 ==========

export type GamePlanType = "EARLY" | "OBJECTIVE" | "FIGHT" | "SCALING" | "SIDE";
export type PriorityLink = "TOP_JGL" | "MID_JGL" | "BOT_SUP";

export interface CoachPlan {
  gamePlan: GamePlanType[];
  riskLevel: number; // 0~100
  priorityLink: PriorityLink;
}

export type CoachCallType = 
  | "SAFE_PLAY"
  | "DIVE_CALL"
  | "INVADE_CALL"
  | "VISION_CONTROL"
  | "FORCE_OBJECTIVE"
  | "AVOID_FIGHT"
  | "START_BARON"
  | "BARON_FAKE";

export interface CoachCall {
  id: string;
  type: CoachCallType;
  cpCost: number;
  startedAtGameTime: number; // 초 단위
  durationMinutes: number;
  modifiers: CallModifiers;
}

export interface CallModifiers {
  eventProbability?: Record<string, number>; // 이벤트별 확률 보정
  statBonus?: Record<string, number>; // 스탯 보너스
  riskMultiplier?: number;
}

export interface CommandPoints {
  current: number;
  max: number;
  regenPerMinute: number;
}

export type PostGameFeedback = "REVIEW_MACRO" | "MENTAL_CARE" | "LANE_FOCUS" | "TEAMFIGHT_REVIEW";

export interface SeriesAdaptation {
  home: TeamAdaptation;
  away: TeamAdaptation;
}

export interface TeamAdaptation {
  tendencyBonus: Partial<TeamTendencies>;
  confidenceBoost: number;
  reviewStacks: Record<PostGameFeedback, number>;
}

// ========== 팀 성향 ==========

export interface TeamTendencies {
  aggression: number; // 0~100
  objective: number;
  vision: number;
  split: number;
  teamfight: number;
}

// ========== 선수 폼/컨디션 ==========

export interface PlayerForm {
  playerId: string;
  condition: number; // 0~100 (몸상태)
  confidence: number; // 0~100 (자신감)
  fatigue: number; // 0~100 (피로도, 높을수록 나쁨)
}

export interface TeamForm {
  players: Record<string, PlayerForm>; // playerId -> form
}

// ========== 게임 시뮬레이션 ==========

export interface GameSimulation {
  setNumber: number;
  homeTeam: Team;
  awayTeam: Team;
  
  // 시간 진행
  currentTime: number; // 초 단위
  tickInterval: number; // 30 or 60초
  targetDuration: number; // 25~40분
  
  // 감독 시스템
  coachPlan: {
    home: CoachPlan;
    away: CoachPlan;
  };
  activeCalls: {
    home: CoachCall[];
    away: CoachCall[];
  };
  commandPoints: {
    home: CommandPoints;
    away: CommandPoints;
  };
  
  // 팀 상태
  tendencies: {
    home: TeamTendencies;
    away: TeamTendencies;
  };
  form: {
    home: TeamForm;
    away: TeamForm;
  };
  
  // 게임 상태
  gameState: GameState;
  
  // 타임라인/이벤트
  timeline: TimelinePoint[];
  events: GameEvent[];
  
  // 종료 여부
  isFinished: boolean;
  winnerId: string | null;
}

export interface GameState {
  // 골드
  goldHome: number;
  goldAway: number;
  goldDiff: number; // home - away
  
  // 오브젝트
  kills: { home: number; away: number };
  towers: { home: number; away: number };
  dragons: { home: number; away: number };
  barons: { home: number; away: number };
  heralds: { home: number; away: number };
  
  // 버프 상태
  baronBuffHome: boolean;
  baronBuffAway: boolean;
  elderBuffHome: boolean;
  elderBuffAway: boolean;
  
  // 우세/주도권
  winProbHome: number; // 0~100
  laneControl: {
    top: number; // -100(away) ~ 100(home)
    mid: number;
    bot: number;
  };
  visionControl: number; // -100(away) ~ 100(home)
  
  // 멘탈/모멘텀
  momentum: number; // -100(away) ~ 100(home)
  mentalHome: number; // 0~100
  mentalAway: number; // 0~100
}

export interface TimelinePoint {
  time: number; // 초
  goldHome: number;
  goldAway: number;
  goldDiff: number;
  winProbHome: number;
  objectiveState: {
    kills: { home: number; away: number };
    towers: { home: number; away: number };
    dragons: { home: number; away: number };
    barons: { home: number; away: number };
  };
  markers: string[]; // 주요 이벤트 마커
}

// ========== 이벤트 ==========

export type GameEventType =
  // 초반 (0~10분)
  | "FIRST_BLOOD_GANK"
  | "FIRST_BLOOD_SOLO"
  | "FIRST_BLOOD_DIVE"
  | "FIRST_DRAGON"
  | "HERALD_1"
  | "COUNTER_JUNGLE"
  | "TOWER_DIVE"
  | "BOT_SKIRMISH"
  | "MID_SKIRMISH"
  | "LANE_PHASE"
  // 중반 (10~20분)
  | "HERALD_2"
  | "TOWER_TAKEDOWN"
  | "DRAGON_FIGHT"
  | "PICK_OFF"
  | "TEAMFIGHT_SMALL"
  | "OBJECTIVE_TRADE"
  // 후반 (20분~)
  | "BARON_START"
  | "BARON_TAKE"
  | "BARON_STEAL"
  | "ELDER_DRAGON"
  | "ACE_TEAMFIGHT"
  | "BASE_SIEGE"
  | "BACKDOOR_ATTEMPT"
  | "NEXUS_END"
  // 기타
  | "GAME_START";

export interface GameEvent {
  time: number; // 초
  type: GameEventType;
  side: "home" | "away" | "neutral"; // 성공한 팀
  success: boolean;
  
  // 결과
  goldSwing: number;
  
  // 설명
  text: string;
  
  // 참여자 (선수 ID)
  participants?: string[];
  
  // 영향 태그
  impactTags: string[]; // ["kills:3", "tower", "momentum:high"]
}

export interface GameFinalState {
  winner: string; // team id
  duration: number;
  goldDiff: number;
  objectives: {
    kills: { home: number; away: number };
    towers: { home: number; away: number };
    dragons: { home: number; away: number };
    barons: { home: number; away: number };
  };
  mvpCandidates: string[]; // player ids
}

// ========== 이벤트 가중치 설정 ==========

export interface EventStatWeights {
  mechanics: number;
  laning: number;
  teamfight: number;
  macro: number;
  clutch: number;
}

export interface EventConfig {
  type: GameEventType;
  minTime: number; // 최소 발생 시간 (초)
  maxTime: number; // 최대 발생 시간 (초)
  baseChance: number; // 기본 발생 확률
  cooldown: number; // 재발생 쿨타임 (초)
  statWeights: EventStatWeights;
  goldSwingRange: [number, number]; // 골드 스윙 범위
  conditions?: string[]; // 발생 조건 (예: "herald_alive", "baron_alive")
}

// ========== 확률 계산용 ==========

export interface ProbabilityFactors {
  // 기본
  statDiff: number;
  
  // 상태
  goldDiff: number;
  momentum: number;
  laneControl: number;
  visionControl: number;
  mental: number;
  
  // 폼
  formBonus: number;
  fatiguepenalty: number;
  
  // 성향
  tendencyBonus: number;
  
  // 감독
  coachPlanBonus: number;
  activeCallBonus: number;
  
  // 랜덤
  noise: number;
}
