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

// 🔥 팩별 천장 시스템
export interface PackPityState {
  s_pity_stack: number; // S 천장 누적
  a_pity_stack: number; // A 천장 누적
}

// 🔥 팩별 통계
export interface PackStatistics {
  pulls: number; // 뽑은 횟수
  rp_spent: number; // 소모한 RP
}

// 🔥 카드팩 타입
export type CardPackType = 
  | "standard"
  | "live_pack"
  | "year_2013" | "year_2014" | "year_2015" | "year_2016" | "year_2017"
  | "year_2018" | "year_2019" | "year_2020" | "year_2021" | "year_2022"
  | "year_2023" | "year_2024" | "year_2025"
  | "position_TOP" | "position_JGL" | "position_MID" | "position_ADC" | "position_SUP";

// 🔥 구버전 호환용 (deprecated)
export interface GachaState {
  s_pity_stack: number;
  a_pity_stack: number;
  total_pulls: number;
}

export interface UserData {
  currency: number; // RP (가챠 재화)
  shards: number; // 샤드 (중복 분해)
  ownedCards: UserCard[];
  gachaState: GachaState; // 🔥 deprecated - 하위 호환용
  pityData: Record<CardPackType, PackPityState>; // 🔥 팩별 천장 데이터
  packStatistics: Record<CardPackType, PackStatistics>; // 🔥 팩별 통계
  squad: {
    TOP: UserCard | null;
    JGL: UserCard | null;
    MID: UserCard | null;
    ADC: UserCard | null;
    SUP: UserCard | null;
  };
  lastCheckIn?: string; // 마지막 출석 체크 시간
  isAdmin?: boolean; // 관리자 여부
}

export interface GachaResult {
  card: LCKCard;
  isDupe: boolean;
  shardsGained: number;
  isPity: boolean; // 천장으로 뽑았는지
}

// 🔧 강화 시스템 타입
export type UpgradeResult = "SUCCESS" | "KEEP" | "BREAK";

export interface UpgradeAttempt {
  result: UpgradeResult;
  beforeLevel: number;
  afterLevel: number;
  shardsCost: number;
  timestamp: number;
  statChanges?: {
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
}

export interface UpgradeResultData {
  result: UpgradeResult;
  card?: UserCard; // SUCCESS/KEEP 시 업데이트된 카드
  shardsCost: number;
  statChanges?: {
    mechanics: number;
    laning: number;
    teamfight: number;
    macro: number;
    clutch: number;
  };
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
    live_pack: 190000,   // 🔥 LIVE 팩: 울트라 프리미엄 (5% 할인)
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
    live_pack: 20000,     // 🔥 LIVE 팩: 울트라 프리미엄 (100배!)
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
  MAX_UPGRADE: 15, // 🔧 최대 강화 단계
  CRAFT_COSTS: {
    A: 300,
    S: 900
  },
  // 🔥 LIVE 카드 전용
  LIVE_CRAFT_COSTS: {
    A: 30000,    // 30,000 (3만 샤드)
    S: 90000     // 90,000 (9만 샤드)
  },
  LIVE_SHARD_VALUES: {
    S: 10000,
    A: 3000,
    B: 1000,
    C: 300
  } as const
};

export const GRADE_COLORS = {
  S: "#FFD700", // 밝은 골드 (더 눈에 띄게)
  A: "#E0E0E0", // 밝은 실버 (배경과 대비)
  B: "#CD7F32", // 브론즈
  C: "#808080"  // 다크 그레이
};

// 🔥 LIVE 카드 전용 색상 (등급과 별개)
export const LIVE_CARD_COLOR = "#FF1493"; // 핑크 (DeepPink)

// 🔧 강화 확률 테이블 (목표 단계별)
export const UPGRADE_RATES: Record<number, { success: number; keep: number; break: number }> = {
  1: { success: 95, keep: 5, break: 0 },
  2: { success: 90, keep: 10, break: 0 },
  3: { success: 85, keep: 15, break: 0 },
  4: { success: 75, keep: 20, break: 5 },
  5: { success: 65, keep: 25, break: 10 },
  6: { success: 55, keep: 25, break: 20 },
  7: { success: 45, keep: 25, break: 30 },
  8: { success: 35, keep: 25, break: 40 },
  9: { success: 25, keep: 25, break: 50 },
  10: { success: 15, keep: 25, break: 60 },
  11: { success: 12, keep: 23, break: 65 },
  12: { success: 10, keep: 20, break: 70 },
  13: { success: 8, keep: 17, break: 75 },
  14: { success: 6, keep: 14, break: 80 },
  15: { success: 5, keep: 10, break: 85 }
};

// 🔧 강화 비용 테이블 (등급별, 목표 단계별)
export const UPGRADE_COSTS: Record<Grade, Record<number, number>> = {
  C: {
    1: 50, 2: 80, 3: 120, 4: 180, 5: 260, 6: 360, 7: 480, 8: 650, 9: 850, 10: 1100,
    11: 1400, 12: 1800, 13: 2300, 14: 3000, 15: 4000
  },
  B: {
    1: 80, 2: 130, 3: 200, 4: 300, 5: 450, 6: 650, 7: 900, 8: 1200, 9: 1600, 10: 2000,
    11: 2600, 12: 3400, 13: 4500, 14: 6000, 15: 8000
  },
  A: {
    1: 150, 2: 250, 3: 400, 4: 600, 5: 900, 6: 1300, 7: 1800, 8: 2500, 9: 3300, 10: 4200,
    11: 5500, 12: 7200, 13: 9500, 14: 12500, 15: 16000
  },
  S: {
    1: 300, 2: 500, 3: 800, 4: 1200, 5: 1800, 6: 2600, 7: 3600, 8: 4800, 9: 6200, 10: 8000,
    11: 10500, 12: 13800, 13: 18000, 14: 23500, 15: 30000
  }
};

// 🔧 포지션별 주스탯 정의
export const POSITION_MAIN_STATS: Record<Position, (keyof CardStats)[]> = {
  TOP: ["mechanics", "teamfight"],
  JGL: ["macro", "mechanics"],
  MID: ["mechanics", "laning"],
  ADC: ["mechanics", "clutch"],
  SUP: ["macro", "teamfight"]
};

export const POSITION_NAMES = {
  TOP: "탑",
  JGL: "정글",
  MID: "미드",
  ADC: "원딜",
  SUP: "서포터"
};

// 🔧 강화 성공 시 스탯 증가량 계산
export function calculateUpgradeStatBonus(
  grade: Grade,
  targetLevel: number,
  position: Position
): { mechanics: number; laning: number; teamfight: number; macro: number; clutch: number } {
  const mainStats = POSITION_MAIN_STATS[position];
  const allStats: (keyof CardStats)[] = ["mechanics", "laning", "teamfight", "macro", "clutch"];
  
  const bonus = {
    mechanics: 0,
    laning: 0,
    teamfight: 0,
    macro: 0,
    clutch: 0
  };

  // 🔥 모든 등급 동일한 증감량
  // +1~+7: 주스탯만, +8 이후: 전체 스탯
  if (targetLevel <= 2) {
    // +1~+2: 주스탯 +1
    mainStats.forEach(stat => {
      bonus[stat] = 1;
    });
  } else if (targetLevel <= 4) {
    // +3~+4: 주스탯 +2
    mainStats.forEach(stat => {
      bonus[stat] = 2;
    });
  } else if (targetLevel <= 6) {
    // +5~+6: 주스탯 +3
    mainStats.forEach(stat => {
      bonus[stat] = 3;
    });
  } else if (targetLevel === 7) {
    // +7: 주스탯 +4
    mainStats.forEach(stat => {
      bonus[stat] = 4;
    });
  } else if (targetLevel <= 9) {
    // +8~+9: 전체 +4
    allStats.forEach(stat => {
      bonus[stat] = 4;
    });
  } else if (targetLevel <= 12) {
    // +10~+12: 전체 +5
    allStats.forEach(stat => {
      bonus[stat] = 5;
    });
  } else if (targetLevel <= 14) {
    // +13~+14: 전체 +6
    allStats.forEach(stat => {
      bonus[stat] = 6;
    });
  } else {
    // +15: 전체 +7
    allStats.forEach(stat => {
      bonus[stat] = 7;
    });
  }

  return bonus;
}

// 🔥 강화 레벨 1부터 currentLevel까지의 누적 스탯 보너스 계산
export function getTotalUpgradeBonus(
  grade: Grade,
  currentLevel: number,
  position: Position
): { mechanics: number; laning: number; teamfight: number; macro: number; clutch: number } {
  const total = {
    mechanics: 0,
    laning: 0,
    teamfight: 0,
    macro: 0,
    clutch: 0
  };

  // 레벨 1부터 currentLevel까지 누적
  for (let level = 1; level <= currentLevel; level++) {
    const bonus = calculateUpgradeStatBonus(grade, level, position);
    total.mechanics += bonus.mechanics;
    total.laning += bonus.laning;
    total.teamfight += bonus.teamfight;
    total.macro += bonus.macro;
    total.clutch += bonus.clutch;
  }

  return total;
}

// 🔥 강화된 카드의 실제 OVR 계산 (5개 스탯 평균)
export function calculateEnhancedOVR(
  baseStats: { mechanics: number; laning: number; teamfight: number; macro: number; clutch: number },
  upgradeLevel: number,
  grade: Grade,
  position: Position
): number {
  if (upgradeLevel === 0) {
    return Math.round((baseStats.mechanics + baseStats.laning + baseStats.teamfight + baseStats.macro + baseStats.clutch) / 5);
  }
  
  const upgradeBonus = getTotalUpgradeBonus(grade, upgradeLevel, position);
  
  const enhancedMechanics = baseStats.mechanics + upgradeBonus.mechanics;
  const enhancedLaning = baseStats.laning + upgradeBonus.laning;
  const enhancedTeamfight = baseStats.teamfight + upgradeBonus.teamfight;
  const enhancedMacro = baseStats.macro + upgradeBonus.macro;
  const enhancedClutch = baseStats.clutch + upgradeBonus.clutch;
  
  return Math.round((enhancedMechanics + enhancedLaning + enhancedTeamfight + enhancedMacro + enhancedClutch) / 5);
}