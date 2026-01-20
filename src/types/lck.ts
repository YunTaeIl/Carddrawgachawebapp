// LCK 카드 타입 정의

export type Grade = "S" | "A" | "B" | "C";
export type Position = "TOP" | "JGL" | "MID" | "ADC" | "SUP";

export interface CardStats {
  ovr: number;
  mechanics: number;  // 메카닉
  laning: number;     // 라인전
  teamfight: number;  // 한타
  macro: number;      // 운영
  clutch: number;     // 클러치
}

export interface LCKCard {
  id: string;
  year: number;
  team: string;
  name: string;
  grade: Grade;
  position: Position;
  image: string;
  stats: CardStats;
  // 강화 레벨 (사용자별로 다름)
  upgradeLevel?: number;
}

export interface UserCard extends LCKCard {
  instanceId: string; // 중복 카드 구분용
  obtainedAt: number;
  upgradeLevel: number;
}

export interface GachaState {
  s_pity_stack: number; // S 천장 누적
  a_pity_stack: number; // A 천장 누적
  total_pulls: number;
}

export interface UserData {
  currency: number; // RP (가챠 재화)
  shards: number; // 샤드 (중복 분해)
  ownedCards: UserCard[];
  gachaState: GachaState;
  squad: {
    TOP: UserCard | null;
    JGL: UserCard | null;
    MID: UserCard | null;
    ADC: UserCard | null;
    SUP: UserCard | null;
  };
}

export interface GachaResult {
  card: LCKCard;
  isDupe: boolean;
  shardsGained: number;
  isPity: boolean; // 천장으로 뽑았는지
}

export const POSITION_NAMES = {
  TOP: "탑",
  JGL: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서포터"
};

// 시너지 타입
export type SynergyType = "DUO" | "TRIO" | "ROSTER" | "THEME";

// 연도 규칙
export type YearRule = "EXACT" | "OPTIONAL" | "SAME" | "ANY";

// 팀 규칙
export type TeamRule = "EXACT_TEAM" | "SAME_TEAM" | "SAME" | "ANY" | "IN_LIST";

// 시너지 효과 단계별
export interface SynergyEffect {
  count: number; // 인원수
  ovr: number;
  mechanics: number;
  laning: number;
  teamfight: number;
  macro: number;
  clutch: number;
}

// 시너지 정의
export interface Synergy {
  id: string;
  name: string;
  type: SynergyType;
  priority: number;
  yearRule: YearRule;
  yearValue?: number;
  teamRule: TeamRule;
  teamValues?: string[]; // 팀 이름 배열
  minCount?: number; // 최소 인원수
  players?: string[]; // 선수 이름 배열
  positions?: Position[]; // 포지션 배열
  effects: SynergyEffect[]; // 단계별 효과
  description: string;
}

// 시너지 활성화 상태
export interface ActiveSynergy {
  synergy: Synergy;
  isActive: boolean;
  matchedCount: number; // 매칭된 인원수
  matchedPlayers: string[]; // 매칭된 선수 ID들
  currentEffect?: SynergyEffect; // 현재 적용 중인 효과
}

export const GACHA_CONFIG = {
  // 기본 단일 뽑기 가격
  SINGLE_COST: 200,
  
  // 10연차 가격 (팩 타입별)
  TEN_COSTS: {
    standard: 2000,      // 기본팩: 단일 10회 (할인 없음)
    year_2013: 3500,     // 연도별 팩: 프리미엄 가격
    year_2014: 3500,
    year_2015: 3500,
    year_2016: 3500,
    year_2017: 3500,
    year_2018: 3500,
    year_2019: 3500,
    year_2020: 3500,
    year_2021: 3500,
    year_2022: 3500,
    year_2023: 3500,
    year_2024: 3500,
    year_2025: 3500,
    position_TOP: 4500,   // 포지션별 팩: 울트라 프리미엄
    position_JGL: 4500,
    position_MID: 4500,
    position_ADC: 4500,
    position_SUP: 4500
  },
  
  // 팩별 단일 뽑기 가격
  PACK_COSTS: {
    standard: 200,        // 기본팩
    year_2013: 400,       // 연도별 팩: 2배
    year_2014: 400,
    year_2015: 400,
    year_2016: 400,
    year_2017: 400,
    year_2018: 400,
    year_2019: 400,
    year_2020: 400,
    year_2021: 400,
    year_2022: 400,
    year_2023: 400,
    year_2024: 400,
    year_2025: 400,
    position_TOP: 500,    // 포지션별 팩: 2.5배 (희소성)
    position_JGL: 500,
    position_MID: 500,
    position_ADC: 500,
    position_SUP: 500
  },
  
  BASE_RATES: {
    S: 0.02,
    A: 0.10,
    B: 0.28,
    C: 0.60
  },
  S_PITY_HARD: 60,
  S_PITY_SOFT_START: 40,
  S_PITY_SOFT_BONUS: 0.005,
  A_PITY_HARD: 10,
  SHARD_VALUES: {
    S: 100,
    A: 30,
    B: 10,
    C: 3
  },
  UPGRADE_COST: 100,
  MAX_UPGRADE: 3,
  CRAFT_COSTS: {
    A: 300,
    S: 900
  }
};

export const GRADE_COLORS = {
  S: "#FFD700", // 밝은 골드 (더 눈에 띄게)
  A: "#E0E0E0", // 밝은 실버 (배경과 대비)
  B: "#CD7F32", // 브론즈
  C: "#808080"  // 다크 그레이
};