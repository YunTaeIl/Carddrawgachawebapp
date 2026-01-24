// 리그 시스템 타입 정의

import { LCKCard } from "./lck";

// 리그 타입
export type LeagueType = "legend" | "tier1" | "tier2" | "tier3";

// 리그 설정
export interface LeagueConfig {
  id: LeagueType;
  name: string;
  difficulty: string;
  winPoints: number;
  championBonus: number;
  description: string;
}

// 리그 설정 상수
export const LEAGUE_CONFIGS: Record<LeagueType, LeagueConfig> = {
  legend: {
    id: "legend",
    name: "레전드 리그",
    difficulty: "최고 난이도",
    winPoints: 5000,
    championBonus: 50000,
    description: "역대 최강 선수들과의 대결"
  },
  tier1: {
    id: "tier1",
    name: "1군 리그",
    difficulty: "S급 위주",
    winPoints: 2000,
    championBonus: 20000,
    description: "현역 최강 선수들의 리그"
  },
  tier2: {
    id: "tier2",
    name: "2군 리그",
    difficulty: "A급 위주",
    winPoints: 1000,
    championBonus: 10000,
    description: "신예 선수들의 각축전"
  },
  tier3: {
    id: "tier3",
    name: "3군 리그",
    difficulty: "B~C급 위주",
    winPoints: 500,
    championBonus: 5000,
    description: "입문자를 위한 리그"
  }
};

// 시즌 상태
export type SeasonState = "regular" | "playoffs" | "finished";

// 팀
export interface Team {
  id: string;
  name: string;
  isPlayer: boolean;
  squad: {
    TOP: LCKCard | null;
    JGL: LCKCard | null;
    MID: LCKCard | null;
    ADC: LCKCard | null;
    SUP: LCKCard | null;
  };
  stats: {
    totalOVR: number;
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
}

// 경기 결과
export interface MatchResult {
  homeTeamId: string;
  awayTeamId: string;
  homeScore: number;
  awayScore: number;
  winnerId: string;
  scoreDiff: number;
  kills: { home: number; away: number };
  towers: { home: number; away: number };
  dragons: { home: number; away: number };
  barons: { home: number; away: number };
}

// 경기 일정
export interface Match {
  id: string;
  round: number;
  homeTeamId: string;
  awayTeamId: string;
  result?: MatchResult;
  isCompleted: boolean;
}

// 순위표 엔트리
export interface StandingEntry {
  teamId: string;
  teamName: string;
  wins: number;
  losses: number;
  scoreDiff: number;
  totalOVR: number;
  isPlayer: boolean;
}

// 플레이오프 시리즈
export type SeriesType = "wildcard" | "semifinals" | "playoffs" | "finals";

export interface Series {
  id: string;
  type: SeriesType;
  bestOf: number;
  team1Id: string | null;
  team2Id: string | null;
  team1Wins: number;
  team2Wins: number;
  winnerId: string | null;
  isCompleted: boolean;
  matches: MatchResult[];
}

// 플레이오프 브래킷
export interface PlayoffBracket {
  wildcard: Series;
  semifinals: Series;
  playoffs: Series;
  finals: Series;
}

// 리그 인스턴스
export interface LeagueInstance {
  id: string;
  leagueType: LeagueType;
  seasonState: SeasonState;
  currentPoints: number;
  teams: Team[];
  playerTeamId: string;
  matches: Match[];
  standings: StandingEntry[];
  playoffBracket?: PlayoffBracket;
  championTeamId?: string;
  playoffResult?: "champion" | "runner-up" | "playoffs" | "semifinals" | "wildcard" | "eliminated"; // 플레이오프 결과
  createdAt: string;
  updatedAt: string;
}

// 경기 이벤트 타입
export type EventType = 
  | "game_start"
  | "early_game"
  | "first_blood"
  | "lane_phase"
  | "first_tower"
  | "dragon_fight"
  | "baron_fight"
  | "teamfight"
  | "objective_trade"
  | "clutch_moment"
  | "game_end";

// 경기 이벤트
export interface MatchEvent {
  turn: number;
  type: EventType;
  message: string;
  team?: "home" | "away";
  impact: {
    kills?: number;
    towers?: number;
    dragons?: number;
    barons?: number;
    goldLead?: number;
    momentum?: number;
  };
}

// 경기 시뮬레이션 상태
export interface MatchSimulationState {
  homeTeam: Team;
  awayTeam: Team;
  currentTurn: number;
  targetTurns: number;
  events: MatchEvent[];
  state: {
    kills: { home: number; away: number };
    towers: { home: number; away: number };
    dragons: { home: number; away: number };
    barons: { home: number; away: number };
    goldLead: number; // positive = home leading
    momentum: number; // positive = home momentum
  };
  isFinished: boolean;
  winnerId: string | null;
}
