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
  player_years?: string; // 새 필드: "Faker:2013|Chovy:2018|..."
  effect_text: string;
  description: string;
}): SynergyDefinition {
  // player_years 파싱 (예: "Faker:2013|Chovy:2018" → { Faker: "2013", Chovy: "2018" })
  let playerYearsMap: Record<string, string> | undefined;
  if (row.player_years) {
    playerYearsMap = {};
    const pairs = row.player_years.split("|");
    for (const pair of pairs) {
      const [name, year] = pair.split(":").map(s => s.trim());
      if (name && year) {
        playerYearsMap[name] = year;
      }
    }
  }
  
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
    player_years: playerYearsMap,
    effects: parseEffectText(row.effect_text),
    description: row.description
  };
}

// 시너지 데이터베이스
export const SYNERGIES: SynergyDefinition[] = [
  // ROSTER 시너지
  parseCsvRow({
    synergy_id: "ROSTER_DK_2020",
    synergy_name: "다시찾아온 LCK 영광",
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
    synergy_name: "무적함대(마벵페뱅울)",
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
    description: "2015 SKT 완전체 (MaRin, Bengi, Faker, Bang, Wolf)"
  }),
  
  parseCsvRow({
    synergy_id: "ROSTER_SSW_2014",
    synergy_name: "공포의 탈수기",
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
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2017_SamsungGalaxy",
    synergy_name: "월즈 우승 로스터(2017 Samsung Galaxy)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2017",
    team_rule: "EXACT_TEAM",
    team_values: "Samsung Galaxy",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2017 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2020_DAMWONGaming",
    synergy_name: "월즈 우승 로스터(2020 DAMWON Gaming)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2020",
    team_rule: "EXACT_TEAM",
    team_values: "DAMWON Gaming",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2020 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2022_DRX",
    synergy_name: "2022 DRX 롤드컵 우승",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2022",
    team_rule: "EXACT_TEAM",
    team_values: "DRX",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2022 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2023_T1",
    synergy_name: "월즈 우승 로스터(2023 T1)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2023",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2023 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2024_T1",
    synergy_name: "월즈 우승 로스터(2024 T1)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2024",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2024 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "WORLDS_CHAMP_2025_T1",
    synergy_name: "월즈 우승 로스터(2025 T1)",
    type: "THEME",
    priority: "120",
    year_rule: "EXACT",
    year_value: "2025",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: OVR+8 / Mec+5 / Lan+4 / TF+10 / Mac+7 / Clu+10 | 5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2025 월드 챔피언십 우승 팀 로스터 카드 3장 이상"
  }),
  
  // TRIO 시너지
  parseCsvRow({
    synergy_id: "TRIO_TOP_SKT",
    synergy_name: "마벵페",
    type: "TRIO",
    priority: "112",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "MaRin|Bengi|Faker",
    positions: "TOP|JGL|MID",
    effect_text: "3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4",
    description: "SKT 왕조 상체"
  }),
  
  // MSI 우승 로스터
  parseCsvRow({
    synergy_id: "MSI_CHAMP_2016_SKTelecomT1",
    synergy_name: "MSI 우승 로스터(2016 SK Telecom T1)",
    type: "THEME",
    priority: "110",
    year_rule: "EXACT",
    year_value: "2016",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+7 / Lan+4 / TF+7 / Mac+4 / Clu+6 | 4인: OVR+7 / Mec+9 / Lan+5 / TF+8 / Mac+5 / Clu+7 | 5인: OVR+9 / Mec+10 / Lan+6 / TF+9 / Mac+6 / Clu+8",
    description: "2016 MSI 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "MSI_CHAMP_2017_SKTelecomT1",
    synergy_name: "MSI 우승 로스터(2017 SK Telecom T1)",
    type: "THEME",
    priority: "110",
    year_rule: "EXACT",
    year_value: "2017",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+7 / Lan+4 / TF+7 / Mac+4 / Clu+6 | 4인: OVR+7 / Mec+9 / Lan+5 / TF+8 / Mac+5 / Clu+7 | 5인: OVR+9 / Mec+10 / Lan+6 / TF+9 / Mac+6 / Clu+8",
    description: "2017 MSI 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "MSI_CHAMP_2024_GenG",
    synergy_name: "MSI 우승 로스터(2024 Gen.G)",
    type: "THEME",
    priority: "110",
    year_rule: "EXACT",
    year_value: "2024",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+7 / Lan+4 / TF+7 / Mac+4 / Clu+6 | 4인: OVR+7 / Mec+9 / Lan+5 / TF+8 / Mac+5 / Clu+7 | 5인: OVR+9 / Mec+10 / Lan+6 / TF+9 / Mac+6 / Clu+8",
    description: "2024 MSI 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "MSI_CHAMP_2025_GenG",
    synergy_name: "MSI 우승 로스터(2025 Gen.G)",
    type: "THEME",
    priority: "110",
    year_rule: "EXACT",
    year_value: "2025",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+7 / Lan+4 / TF+7 / Mac+4 / Clu+6 | 4인: OVR+7 / Mec+9 / Lan+5 / TF+8 / Mac+5 / Clu+7 | 5인: OVR+9 / Mec+10 / Lan+6 / TF+9 / Mac+6 / Clu+8",
    description: "2025 MSI 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "TRIO_TOP_DK_2020",
    synergy_name: "너캐쇼",
    type: "TRIO",
    priority: "110",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Nuguri|Canyon|ShowMaker",
    positions: "TOP|JGL|MID",
    effect_text: "3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4",
    description: "담원 상체 트리오"
  }),
  
  parseCsvRow({
    synergy_id: "TRIO_TOP_GENG",
    synergy_name: "기캐쵸",
    type: "TRIO",
    priority: "110",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Kiin|Canyon|Chovy",
    positions: "TOP|JGL|MID",
    effect_text: "3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4",
    description: "압도적 상체 3인방"
  }),
  
  // LCK 우승 로스터
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2013_Summer_SKTelecomT1K",
    synergy_name: "LCK 우승 로스터(2013 Summer SK Telecom T1 K)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2013",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1 K",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2013 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2014_Spring_SamsungBlue",
    synergy_name: "LCK 우승 로스터(2014 Spring Samsung Blue)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2014",
    team_rule: "EXACT_TEAM",
    team_values: "Samsung Blue",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2014 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2014_Summer_KTRolsterArrows",
    synergy_name: "LCK 우승 로���터(2014 Summer KT Rolster Arrows)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2014",
    team_rule: "EXACT_TEAM",
    team_values: "KT Rolster Arrows",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2014 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2015_Spring_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2015 Spring SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2015",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2015 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2015_Summer_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2015 Summer SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2015",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2015 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2016_Spring_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2016 Spring SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2016",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2016 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2016_Summer_ROXTigers",
    synergy_name: "LCK 우승 로스터(2016 Summer ROX Tigers)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2016",
    team_rule: "EXACT_TEAM",
    team_values: "ROX Tigers",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2016 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2017_Spring_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2017 Spring SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2017",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2017 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2017_Summer_LongzhuGaming",
    synergy_name: "LCK 우승 로스터(2017 Summer Longzhu Gaming)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2017",
    team_rule: "EXACT_TEAM",
    team_values: "Longzhu Gaming",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2017 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2018_Spring_KingzoneDragonX",
    synergy_name: "LCK 우승 로스터(2018 Spring Kingzone DragonX)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2018",
    team_rule: "EXACT_TEAM",
    team_values: "Kingzone DragonX",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2018 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2018_Summer_KTRolster",
    synergy_name: "LCK 우승 로스터(2018 Summer KT Rolster)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2018",
    team_rule: "EXACT_TEAM",
    team_values: "KT Rolster",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2018 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2019_Spring_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2019 Spring SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2019",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2019 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2019_Summer_SKTelecomT1",
    synergy_name: "LCK 우승 로스터(2019 Summer SK Telecom T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2019",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2019 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2020_Spring_T1",
    synergy_name: "LCK 우승 로스터(2020 Spring T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2020",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2020 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2020_Summer_DAMWONGaming",
    synergy_name: "LCK 우승 로스터(2020 Summer DAMWON Gaming)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2020",
    team_rule: "EXACT_TEAM",
    team_values: "DAMWON Gaming",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2020 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2021_Spring_DWGKIA",
    synergy_name: "LCK 우승 로스터(2021 Spring DWG KIA)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2021",
    team_rule: "EXACT_TEAM",
    team_values: "DWG KIA",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2021 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2021_Summer_DWGKIA",
    synergy_name: "LCK 우승 로스터(2021 Summer DWG KIA)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2021",
    team_rule: "EXACT_TEAM",
    team_values: "DWG KIA",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2021 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2022_Spring_T1",
    synergy_name: "LCK 우승 로스터(2022 Spring T1)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2022",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2022 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2022_Summer_GenG",
    synergy_name: "LCK 우승 로스터(2022 Summer Gen.G)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2022",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2022 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2023_Spring_GenG",
    synergy_name: "LCK 우승 로스터(2023 Spring Gen.G)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2023",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2023 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2023_Summer_GenG",
    synergy_name: "LCK 우승 로스터(2023 Summer Gen.G)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2023",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2023 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2024_Spring_GenG",
    synergy_name: "LCK 우승 로스터(2024 Spring Gen.G)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2024",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2024 Spring LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2024_Summer_HanwhaLifeEsports",
    synergy_name: "LCK 우승 로스터(2024 Summer Hanwha Life Esports)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2024",
    team_rule: "EXACT_TEAM",
    team_values: "Hanwha Life Esports",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2024 Summer LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LCK_CHAMP_2025_Season_GenG",
    synergy_name: "LCK 우승 로스터(2025 Season Gen.G)",
    type: "THEME",
    priority: "105",
    year_rule: "EXACT",
    year_value: "2025",
    team_rule: "EXACT_TEAM",
    team_values: "Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+5 / Mec+4 / Lan+6 / TF+6 / Mac+7 / Clu+5 | 4인: OVR+7 / Mec+5 / Lan+7 / TF+7 / Mac+8 / Clu+6 | 5인: OVR+9 / Mec+6 / Lan+8 / TF+8 / Mac+10 / Clu+7",
    description: "2025 Season LCK 우승 팀 로스터 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "TRIO_TOP_DK_KHAN",
    synergy_name: "칸캐쇼",
    type: "TRIO",
    priority: "105",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Khan|Canyon|ShowMaker",
    positions: "TOP|JGL|MID",
    effect_text: "3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4",
    description: "운영·한타 상체"
  }),
  
  // DUO 시너지
  parseCsvRow({
    synergy_id: "DUO_BOT_GUMA_KERIA",
    synergy_name: "구케",
    type: "DUO",
    priority: "97",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Gumayusi|Keria",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "현대 T1 바텀"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_MJ_CANYON_SHOWMAKER",
    synergy_name: "캐쇼",
    type: "DUO",
    priority: "97",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Canyon|ShowMaker",
    positions: "JGL|MID",
    effect_text: "2인: OVR+4 / Mec+4 / Lan+2 / TF+4 / Mac+6 / Clu+4",
    description: "담원 왕조 미드정글"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_TJ_KIIN_CANYON",
    synergy_name: "기캐",
    type: "DUO",
    priority: "96",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Kiin|Canyon",
    positions: "TOP|JGL",
    effect_text: "2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3",
    description: "상체 주���권"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_BANG_WOLF",
    synergy_name: "뱅울",
    type: "DUO",
    priority: "95",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Bang|Wolf",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "SKT 왕조 바텀"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_IMP_MATA",
    synergy_name: "임마타",
    type: "DUO",
    priority: "95",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "imp|Mata",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "삼성 화이트 바텀 핵심"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_TJ_NUGURI_CANYON",
    synergy_name: "너캐",
    type: "DUO",
    priority: "95",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Nuguri|Canyon",
    positions: "TOP|JGL",
    effect_text: "2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3",
    description: "라인 파괴"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_TJ_MARIN_BENGI",
    synergy_name: "마벵",
    type: "DUO",
    priority: "94",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "MaRin|Bengi",
    positions: "TOP|JGL",
    effect_text: "2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3",
    description: "2015 상체 압박"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_GHOST_BERYL",
    synergy_name: "고베",
    type: "DUO",
    priority: "93",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Ghost|BeryL",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "2020 담원 월즈 바텀"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_DEFT_MATA",
    synergy_name: "뎊마타",
    type: "DUO",
    priority: "92",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Deft|Mata",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "삼성 블루 운영 바텀"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_RULER_COREJJ",
    synergy_name: "룰코",
    type: "DUO",
    priority: "92",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Ruler|CoreJJ",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "삼성/젠지 바텀 계보"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_MJ_PEANUT_CHOVY",
    synergy_name: "넛쵸",
    type: "DUO",
    priority: "92",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Peanut|Chovy",
    positions: "JGL|MID",
    effect_text: "2인: OVR+3 / Mec+3 / Lan+2 / TF+3 / Mac+6 / Clu+3",
    description: "젠지 운영 중심"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_TJ_KHAN_CANYON",
    synergy_name: "칸캐",
    type: "DUO",
    priority: "92",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Khan|Canyon",
    positions: "TOP|JGL",
    effect_text: "2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3",
    description: "한타/운영 완성"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_DEFT_KERIA",
    synergy_name: "뎊케",
    type: "DUO",
    priority: "90",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Deft|Keria",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "최상급 공격형 바텀"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_PRAY_GORILLA",
    synergy_name: "프릴라",
    type: "DUO",
    priority: "90",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "PraY|GorillA",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4",
    description: "호랑이 바텀의 전설"
  }),
  
  parseCsvRow({
    synergy_id: "DUO_BOT_CPTJACK_MADLIFE",
    synergy_name: "캡매라",
    type: "DUO",
    priority: "88",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "SAME_TEAM",
    team_values: "",
    min_count: "",
    players: "Cpt Jack|MadLife",
    positions: "ADC|SUP",
    effect_text: "2인: OVR+3 / Mec+2 / Lan+5 / TF+4 / Mac+2 / Clu+3",
    description: "LCK 초창기 전설 바텀"
  }),
  
  // 일반 시너지
  parseCsvRow({
    synergy_id: "GEN_SAME_TEAM_YEAR_5",
    synergy_name: "단일팀·단일년도(5인)",
    type: "THEME",
    priority: "90",
    year_rule: "SAME",
    year_value: "",
    team_rule: "SAME",
    team_values: "",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2 | 4인: OVR+5 / Mec+4 / Lan+5 / TF+5 / Mac+5 / Clu+4 | 5인: OVR+7 / Mec+6 / Lan+7 / TF+7 / Mac+7 / Clu+6",
    description: "같은 팀 + 같은 연도 풀 로스터"
  }),
  
  // LINEAGE 시너지 (5인)
  parseCsvRow({
    synergy_id: "LINEAGE_CJ_LEGACY_5",
    synergy_name: "CJ의 유산(5인)",
    type: "THEME",
    priority: "85",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "CJ Entus|CJ Entus Blaze|CJ Entus Frost",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6",
    description: "CJ_LEGACY 소속 팀 카드 5장"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_SAMSUNG_GENG_DYNASTY_5",
    synergy_name: "삼성·젠지 왕조(5인)",
    type: "THEME",
    priority: "85",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "Samsung Blue|Samsung White|Samsung Galaxy|Gen.G",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6",
    description: "SAMSUNG_GENG_DYNASTY 소속 팀 카드 5장"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_T1_DYNASTY_5",
    synergy_name: "T1 왕조(5인)",
    type: "THEME",
    priority: "85",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "SK Telecom T1 K|SK Telecom T1 S|SK Telecom T1|T1",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6",
    description: "T1_DYNASTY 소속 팀 카드 5장"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_TIGERS_HLE_LINEAGE_5",
    synergy_name: "호랑이의 계보(5인)",
    type: "THEME",
    priority: "85",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "KOO Tigers|ROX Tigers|Hanwha Life Esports",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6",
    description: "TIGERS_HLE_LINEAGE 소속 팀 카드 5장"
  }),
  
  parseCsvRow({
    synergy_id: "GEN_SAME_TEAM_YEAR_4",
    synergy_name: "단일팀·단일년도(4인)",
    type: "THEME",
    priority: "75",
    year_rule: "SAME",
    year_value: "",
    team_rule: "SAME",
    team_values: "",
    min_count: "4",
    players: "",
    positions: "",
    effect_text: "3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2 | 4인: OVR+5 / Mec+4 / Lan+5 / TF+5 / Mac+5 / Clu+4 | 5인: OVR+7 / Mec+6 / Lan+7 / TF+7 / Mac+7 / Clu+6",
    description: "같은 팀 + 같은 연도 카드 4장"
  }),
  
  // LINEAGE 시너지 (3인)
  parseCsvRow({
    synergy_id: "LINEAGE_CJ_LEGACY_3",
    synergy_name: "CJ의 유산(3인)",
    type: "THEME",
    priority: "70",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "CJ Entus|CJ Entus Blaze|CJ Entus Frost",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4",
    description: "CJ_LEGACY 소속 팀 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_SAMSUNG_GENG_DYNASTY_3",
    synergy_name: "삼성·젠지 왕조(3인)",
    type: "THEME",
    priority: "70",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "Samsung Blue|Samsung White|Samsung Galaxy|Gen.G",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4",
    description: "SAMSUNG_GENG_DYNASTY 소속 팀 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_T1_DYNASTY_3",
    synergy_name: "T1 왕조(3인)",
    type: "THEME",
    priority: "70",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "SK Telecom T1 K|SK Telecom T1 S|SK Telecom T1|T1",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4",
    description: "T1_DYNASTY 소속 팀 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "LINEAGE_TIGERS_HLE_LINEAGE_3",
    synergy_name: "호랑이의 계보(3인)",
    type: "THEME",
    priority: "70",
    year_rule: "ANY",
    year_value: "",
    team_rule: "IN_LIST",
    team_values: "KOO Tigers|ROX Tigers|Hanwha Life Esports",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4",
    description: "TIGERS_HLE_LINEAGE 소속 팀 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "GEN_SAME_TEAM_5",
    synergy_name: "단일팀(연도무관 5인)",
    type: "THEME",
    priority: "65",
    year_rule: "ANY",
    year_value: "",
    team_rule: "SAME",
    team_values: "",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+6 / Mec+4 / Lan+4 / TF+6 / Mac+7 / Clu+5",
    description: "팀만 동일한 카드 5장"
  }),
  
  parseCsvRow({
    synergy_id: "GEN_SAME_TEAM_YEAR_3",
    synergy_name: "단일팀·단일년도(3인)",
    type: "THEME",
    priority: "60",
    year_rule: "SAME",
    year_value: "",
    team_rule: "SAME",
    team_values: "",
    min_count: "3",
    players: "",
    positions: "",
    effect_text: "3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2 | 4인: OVR+5 / Mec+4 / Lan+5 / TF+5 / Mac+5 / Clu+4 | 5인: OVR+7 / Mec+6 / Lan+7 / TF+7 / Mac+7 / Clu+6",
    description: "같은 팀 + 같은 연도 카드 3장 이상"
  }),
  
  parseCsvRow({
    synergy_id: "GEN_SAME_YEAR_5",
    synergy_name: "단일년도(5인)",
    type: "THEME",
    priority: "55",
    year_rule: "SAME",
    year_value: "",
    team_rule: "ANY",
    team_values: "",
    min_count: "5",
    players: "",
    positions: "",
    effect_text: "5인: OVR+5 / Mec+4 / Lan+4 / TF+5 / Mac+6 / Clu+4",
    description: "연도만 동일한 카드 5장"
  }),
  
  // 반지원정대 (2019-2021 Gen.G) - ROSTER 시너지 (5인 완전체만 발동)
  parseCsvRow({
    synergy_id: "GENG_RING_EXPEDITION_2019_2021",
    synergy_name: "반지원정대",
    type: "ROSTER",
    priority: "130",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Rascal|Clid|Bdd|Ruler|Life",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+8 / Mec+6 / Lan+5 / TF+8 / Mac+10 / Clu+10",
    description: "2019-2021 Gen.G 반지원정대 로스터 5인 완전체 (Rascal, Clid, Bdd, Ruler, Life)"
  }),
  
  // KT 슈퍼팀 (2017-2018 KT) - ROSTER 시너지 (5인 완전체만 발동)
  parseCsvRow({
    synergy_id: "KT_SUPER_TEAM_2017_2018",
    synergy_name: "KT 슈퍼팀",
    type: "ROSTER",
    priority: "130",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Smeb|Score|PawN|Deft|Mata",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+10 / TF+8 / Mac+8 / Clu+8",
    description: "2017-2018 KT 슈퍼팀 로스터 5인 완전체 (Smeb, Score, PawN, Deft, Mata)"
  }),
  
  // 소년만화 (2022 DRX) - ROSTER 시너지 (5인 완전체만 발동)
  parseCsvRow({
    synergy_id: "DRX_2022_BOYHOOD",
    synergy_name: "소년만화, 중요한건 꺾이지 않는 마음",
    type: "ROSTER",
    priority: "130",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Kingen|Pyosik|Zeka|Deft|BeryL",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+6 / Lan+5 / TF+12 / Mac+8 / Clu+12",
    description: "2022 DRX 롤드컵 우승 로스터 5인 완전체 (Kingen, Pyosik, Zeka, Deft, BeryL)"
  }),
  
  // 씨맥의 아이들 - ROSTER 시너지 (연도 무관, 7명 중 3/4/5명)
  parseCsvRow({
    synergy_id: "CVMAX_CHILDREN",
    synergy_name: "씨맥의 아이들",
    type: "ROSTER",
    priority: "135",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Chovy|Tarzan|Viper|Lehends|Doran|Pyosik|Keria",
    positions: "",
    effect_text: "3인: OVR+0 / Mec+3 / Lan+3 / TF+0 / Mac+3 / Clu+0 | 4인: OVR+0 / Mec+4 / Lan+4 / TF+0 / Mac+4 / Clu+0 | 5인: OVR+8 / Mec+6 / Lan+6 / TF+6 / Mac+6 / Clu+6",
    description: "씨맥의 제자들 7명 중 3명 이상 (Chovy, Tarzan, Viper, Lehends, Doran, Pyosik, Keria)"
  }),
  
  // RISE (2017 Gen.G 롤드컵 우승) - ROSTER 시너지
  parseCsvRow({
    synergy_id: "RISE_SSG_2017",
    synergy_name: "RISE",
    type: "ROSTER",
    priority: "140",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "CuVee|Ambition|Crown|Ruler|CoreJG",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+7 / Lan+6 / TF+9 / Mac+8 / Clu+10",
    description: "2017 롤드컵 우승 로스터 (CuVee, Ambition, Crown, Ruler, CoreJJ)"
  }),

  // 2022 항저우 아시안게임 금메달 - ROSTER 시너지 (6명 중 3/4/5명)
  parseCsvRow({
    synergy_id: "ASIAN_GAMES_2022",
    synergy_name: "2022 아시안게임 금메달",
    type: "ROSTER",
    priority: "138",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Zeus|Chovy|Ruler|Faker|Keria|Kanavi",
    positions: "",
    effect_text: "3인: OVR+0 / Mec+2 / Lan+2 / TF+3 / Mac+2 / Clu+3 | 4인: OVR+0 / Mec+4 / Lan+3 / TF+5 / Mac+4 / Clu+5 | 5인: OVR+8 / Mec+6 / Lan+5 / TF+8 / Mac+6 / Clu+8",
    description: "2022 항저우 아시안게임 금메달 국가대표 6명 중 3명 이상 (Zeus, Chovy, Ruler, Faker, Keria, Kanavi)"
  }),

  // 슈퍼 루키 - ROSTER 시너지 (특정 년도 지정, 6명 중 3/4/5명)
  parseCsvRow({
    synergy_id: "SUPER_ROOKIE",
    synergy_name: "슈퍼 루키",
    type: "ROSTER",
    priority: "136",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "ANY",
    team_values: "",
    min_count: "",
    players: "Faker|Chovy|Calix|Keria|Peyz|Diable",
    positions: "",
    player_years: "Faker:2013|Chovy:2018|Calix:2025|Keria:2020|Peyz:2023|Diable:2025",
    effect_text: "3인: OVR+0 / Mec+4 / Lan+4 / TF+0 / Mac+3 / Clu+2 | 4인: OVR+0 / Mec+6 / Lan+5 / TF+0 / Mac+5 / Clu+4 | 5인: OVR+10 / Mec+8 / Lan+7 / TF+0 / Mac+7 / Clu+6",
    description: "역대 슈퍼 루키들의 데뷔 시즌 (2013 Faker, 2018 Chovy, 2020 Keria, 2023 Peyz/도련님, 2025 Calix/신세대 미드, 2025 Diable/신세대 원딜)"
  }),

  // 치지직 스트리머 - ROSTER 시너지 (7명 중 3/4/5명 이상)
  parseCsvRow({
    synergy_id: "CHZZK_STREAMERS",
    synergy_name: "치지직 스트리머즈",
    type: "ROSTER",
    priority: "135",
    year_rule: "OPTIONAL",
    year_value: "",
    team_rule: "OPTIONAL",
    team_values: "",
    min_count: "",
    players: "Ambition|Bang|Wolf|Untara|Flame|CuVee|Cpt Jack",
    positions: "",
    effect_text: "3인: OVR+0 / Mec+2 / Lan+2 / TF+2 / Mac+3 / Clu+4 | 4인: OVR+0 / Mec+3 / Lan+3 / TF+4 / Mac+5 / Clu+6 | 5인: OVR+8 / Mec+5 / Lan+5 / TF+6 / Mac+7 / Clu+8",
    description: "은퇴 후 치지직에서 활동 중인 레전드 스트리머들 (Ambition, Bang, Wolf, Untara, Flame, CuVee, Cpt Jack)"
  }),

  // 2023 KT 롤스터 "기커비에리 롤러코스터" - ROSTER 시너지 (3/4/5명)
  parseCsvRow({
    synergy_id: "ROSTER_KT_2023_ROLLERCOASTER",
    synergy_name: "기커비에리 롤러코스터",
    type: "ROSTER",
    priority: "134",
    year_rule: "EXACT",
    year_value: "2023",
    team_rule: "EXACT_TEAM",
    team_values: "KT Rolster",
    min_count: "",
    players: "Kiin|Cuzz|Bdd|Aiming|Lehends",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "3인: OVR+0 / Mec+3 / Lan+2 / TF+5 / Mac+2 / Clu+6 | 4인: OVR+0 / Mec+5 / Lan+3 / TF+7 / Mac+3 / Clu+8 | 5인: OVR+10 / Mec+7 / Lan+5 / TF+10 / Mac+5 / Clu+12",
    description: "2023 KT 롤스터 '기커비에리 롤러코스터' - 극적인 경기 운영과 클러치 플레이로 유명한 로스터 (Kiin, Cuzz, Bdd, Aiming, Lehends)"
  }),

  // 2025 KT 롤스터 "BDD의 통나무" - ROSTER 시너지 (3/4/5명)
  parseCsvRow({
    synergy_id: "ROSTER_KT_2025_BDD_LOG",
    synergy_name: "BDD의 통나무",
    type: "ROSTER",
    priority: "133",
    year_rule: "EXACT",
    year_value: "2025",
    team_rule: "EXACT_TEAM",
    team_values: "KT Rolster",
    min_count: "",
    players: "Perfect|Cuzz|Bdd|deokdam|Peter",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "3인: OVR+0 / Mec+4 / Lan+3 / TF+6 / Mac+5 / Clu+5 | 4인: OVR+0 / Mec+6 / Lan+4 / TF+8 / Mac+7 / Clu+7 | 5인: OVR+12 / Mec+8 / Lan+6 / TF+10 / Mac+9 / Clu+10",
    description: "2025 KT 롤스터 'BDD의 통나무' - BDD를 중심으로 한 탄탄한 팀워크와 노련한 운영력 (Perfect, Cuzz, Bdd, deokdam, Peter)"
  }),

  // 2013 SKT T1 K "전설의 시작" - ROSTER 시너지 (5인 완전체)
  parseCsvRow({
    synergy_id: "ROSTER_SKT_2013",
    synergy_name: "전설의 시작",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2013",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1 K",
    min_count: "",
    players: "Impact|Bengi|Faker|Piglet|PoohManDu",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2013 월즈 최초 우승의 시작, 전설이 된 로스터 (Impact, Bengi, Faker, Piglet, PoohManDu)"
  }),

  // 2016 SKT T1 "최초의 월즈 리핏" - ROSTER 시너지 (5인 완전체)
  parseCsvRow({
    synergy_id: "ROSTER_SKT_2016",
    synergy_name: "최초의 월즈 리핏",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2016",
    team_rule: "EXACT_TEAM",
    team_values: "SK Telecom T1",
    min_count: "",
    players: "Duke|Bengi|Faker|Bang|Wolf",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2016 월즈 우승, 최초의 리핏을 달성한 로스터 (Duke, Bengi, Faker, Bang, Wolf)"
  }),

  // 2024 T1 "증명의 리핏" - ROSTER 시너지 (5인 완전체)
  parseCsvRow({
    synergy_id: "ROSTER_T1_2024",
    synergy_name: "증명의 리핏",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2024",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "",
    players: "Zeus|Oner|Faker|Gumayusi|Keria",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10",
    description: "2024 월즈 우승, 리핏을 증명한 로스터 (Zeus, Oner, Faker, Gumayusi, Keria)"
  }),

  // 2025 T1 "역사적 쓰리핏" - ROSTER 시너지 (5인 완전체)
  parseCsvRow({
    synergy_id: "ROSTER_T1_2025",
    synergy_name: "역사적 쓰리핏",
    type: "ROSTER",
    priority: "140",
    year_rule: "EXACT",
    year_value: "2025",
    team_rule: "EXACT_TEAM",
    team_values: "T1",
    min_count: "",
    players: "Zeus|Oner|Faker|Gumayusi|Keria",
    positions: "TOP|JGL|MID|ADC|SUP",
    effect_text: "5인: OVR+12 / Mec+10 / Lan+10 / TF+12 / Mac+12 / Clu+12",
    description: "2025 월즈 우승, 역사적인 쓰리핏을 달성한 로스터 (Zeus, Oner, Faker, Gumayusi, Keria)"
  })
];