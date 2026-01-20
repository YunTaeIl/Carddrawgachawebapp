// LCK 시너지 데이터베이스 (CSV 기반)

import { SynergyDefinition, SynergyEffectStage } from "@/types/synergy";

/**
 * effect_text 파싱
 * 예: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10"
 */
function parseEffectText(effectText: string): SynergyEffectStage[] {
  const stages: SynergyEffectStage[] = [];
  
  if (!effectText || effectText.trim() === "") {
    return stages;
  }
  
  // "|"로 단계 구분
  const stageTexts = effectText.split("|").map(s => s.trim());
  
  for (const stageText of stageTexts) {
    // "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8"
    const match = stageText.match(/(\d+)인:\s*OVR\+(\d+)\s*\/\s*Mec\+(\d+)\s*\/\s*Lan\+(\d+)\s*\/\s*TF\+(\d+)\s*\/\s*Mac\+(\d+)\s*\/\s*Clu\+(\d+)/);
    
    if (match) {
      stages.push({
        count: parseInt(match[1]),
        ovr: parseInt(match[2]),
        mec: parseInt(match[3]),
        lan: parseInt(match[4]),
        tf: parseInt(match[5]),
        mac: parseInt(match[6]),
        clu: parseInt(match[7])
      });
    }
  }
  
  return stages;
}

/**
 * CSV 데이터를 SynergyDefinition으로 변환
 */
function parseCsvRow(row: {
  synergy_id: string;
  synergy_name: string;
  type: string;
  priority: string;
  year_rule: string;
  year_value: string;
  team_rule: string;
  team_values: string;
  min_count: string;
  players: string;
  positions: string;
  effect_text: string;
  description: string;
}): SynergyDefinition {
  return {
    synergy_id: row.synergy_id,
    synergy_name: row.synergy_name,
    type: row.type as any,
    priority: parseInt(row.priority),
    year_rule: row.year_rule as any,
    year_value: row.year_value ? parseInt(row.year_value) : undefined,
    team_rule: row.team_rule as any,
    team_values: row.team_values ? row.team_values.split("|").map(t => t.trim()) : [],
    min_count: row.min_count ? parseInt(row.min_count) : undefined,
    players: row.players ? row.players.split("|").map(p => p.trim()) : [],
    positions: row.positions ? row.positions.split("|").map(p => p.trim()) : [],
    effects: parseEffectText(row.effect_text),
    description: row.description
  };
}

// 시너지 데이터베이스
export const SYNERGIES: SynergyDefinition[] = [
  // ROSTER 시너지
  parseCsvRow({
    synergy_id: "ROSTER_DK_2020",
    synergy_name: "담원 2020 완전체",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2020",
    team_rule: "EXACT_TEAM",
    team_values: "DAMWON Gaming",
    min_count: "",
    players: "Nuguri|Canyon|ShowMaker|Ghost|BeryL",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2020 월즈 우승 로스터"
  }),
  
  parseCsvRow({
    synergy_id: "ROSTER_SKT_2015",
    synergy_name: "마벵페뱅울",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2015",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "",
    players: "MaRin|Bengi|Faker|Bang|Wolf",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2015 SKT 완전체"
  }),
  
  parseCsvRow({
    synergy_id: "ROSTER_SSW_2014",
    synergy_name: "삼성 화이트",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2014",
    team_rule: "EXACT_TEAM",
    team_values: "Samsung White",
    min_count: "",
    players: "Looper|DanDy|PawN|imp|Mata",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2014 월즈 최강 로스터"
  }),
  
  parseCsvRow({
    synergy_id: "ROSTER_T1_2023",
    synergy_name: "제오페구케",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2023",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "",
    players: "Zeus|Oner|Faker|Gumayusi|Keria",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2023 T1 완전체"
  }),
  
  // THEME 시너지 (월즈 우승)
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2013_SKTelecomT1K",
    synergy_name: "월즈 우승 로스터(2013 SK Telecom T1 K)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2013",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1 K",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2013 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2014_SamsungWhite",
    synergy_name: "월즈 우승 로스터(2014 Samsung White)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2014",
    team_rule: "EXACT_TEAM",
    team_values: "Samsung White",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2014 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2015_SKTelecomT1",
    synergy_name: "월즈 우승 로스터(2015 SK Telecom T1)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2015",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2015 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2016_SKTelecomT1",
    synergy_name: "월즈 우승 로스터(2016 SK Telecom T1)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2016",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2016 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  })
];
