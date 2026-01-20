// LCK 시너지 시스템 타입 정의 (CSV 기반)

export type SynergyType = "ROSTER" | "TRIO" | "DUO" | "THEME";
export type YearRule = "EXACT" | "OPTIONAL";
export type TeamRule = "EXACT_TEAM" | "SAME_TEAM" | "ORG_LINEAGE" | "ANY";

// 효과 단계 (3인, 4인, 5인 등)
export interface SynergyEffectStage {
  count: number;
  ovr: number;
  mec: number;
  lan: number;
  tf: number;
  mac: number;
  clu: number;
}

// 시너지 정의
export interface SynergyDefinition {
  synergy_id: string;
  synergy_name: string;
  type: SynergyType;
  priority: number;
  year_rule: YearRule;
  year_value?: number;
  team_rule: TeamRule;
  team_values: string[];
  min_count?: number;
  players: string[];
  positions: string[];
  effects: SynergyEffectStage[];
  description: string;
}

// 활성화된 시너지
export interface ActiveSynergy {
  synergy: SynergyDefinition;
  isActive: boolean;
  isPrime: boolean; // EXACT + 연도 일치 OR OPTIONAL + 연도 일치
  matchedCount: number;
  matchedPlayers: string[];
  currentEffect?: SynergyEffectStage;
  missingRequirements?: string[]; // 부족한 조건
}
