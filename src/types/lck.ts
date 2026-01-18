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

export interface Synergy {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  bonus: string;
}

export const GACHA_CONFIG = {
  SINGLE_COST: 200,
  TEN_COST: 1800,
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

export const POSITION_NAMES = {
  TOP: "탑",
  JGL: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서포터"
};