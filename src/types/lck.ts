// LCK 카드 타입 정의

// 🔥 현재 LIVE 시즌 (매년 업데이트)
export const CURRENT_LIVE_SEASON = 2026;

export type Grade = "S" | "A" | "B" | "C";
export type Position = "TOP" | "JGL" | "MID" | "ADC" | "SUP";

// 카드가 LIVE 카드인지 확인하는 헬퍼 함수
export function isLiveCard(card: { year: number }): boolean {
  return card.year === CURRENT_LIVE_SEASON;
}

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
  ign?: string; // 게임 내 닉네임 (없으면 name 사용)
  grade: Grade;
  position: Position;
  image: string;
  stats: CardStats;
  // 강화 레벨 (사용자별로 다름)
  upgradeLevel?: number;
  ovr?: number; // OVR 계산값
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
  lastCheckIn?: string; // 마지막 출석 체크 시간
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
  // 기본 단일 뽑기 가격
  SINGLE_COST: 200,
  
  // 10연차 가격 (팩 타입별)
  TEN_COSTS: {
    standard: 2000,      // 기본팩: 단일 10회 (할인 없음)
    live_pack: 9500,     // 🔥 LIVE 팩: 울트라 프리미엄 (약간 할인)
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
  } as const,
  
  // 팩별 단일 뽑기 가격
  PACK_COSTS: {
    standard: 200,        // 기본팩
    live_pack: 1000,      // 🔥 LIVE 팩: 5배 프리미엄 (현재 시즌 선수만)
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
  } as const,
  
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

// 🔥 LIVE 카드 전용 색상 (등급과 별개)
export const LIVE_CARD_COLOR = "#FF1493"; // 핑크 (DeepPink)

export const POSITION_NAMES = {
  TOP: "탑",
  JGL: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서포터"
};