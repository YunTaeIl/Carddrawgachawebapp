// LCK 시너지 데이터베이스 (CSV 기반)

import { Synergy, SynergyEffect } from "@/types/lck";

// 효과 텍스트 파싱 헬퍼
function parseEffects(effectText: string): SynergyEffect[] {
  const effects: SynergyEffect[] = [];
  
  // "3인: OVR+6 / Mec+4 / Lan+3 / TF+8 / Mac+6 / Clu+8 | 4인: ..." 형식 파싱
  const stages = effectText.split('|').map(s => s.trim());
  
  for (const stage of stages) {
    const match = stage.match(/(\d+)인:\s*OVR\+(\d+)\s*\/\s*Mec\+(\d+)\s*\/\s*Lan\+(\d+)\s*\/\s*TF\+(\d+)\s*\/\s*Mac\+(\d+)\s*\/\s*Clu\+(\d+)/);
    
    if (match) {
      effects.push({
        count: parseInt(match[1]),
        ovr: parseInt(match[2]),
        mechanics: parseInt(match[3]),
        laning: parseInt(match[4]),
        teamfight: parseInt(match[5]),
        macro: parseInt(match[6]),
        clutch: parseInt(match[7])
      });
    } else {
      // 단일 효과 (인원수 명시 없음)
      const singleMatch = stage.match(/OVR\+(\d+)\s*\/\s*Mec\+(\d+)\s*\/\s*Lan\+(\d+)\s*\/\s*TF\+(\d+)\s*\/\s*Mac\+(\d+)\s*\/\s*Clu\+(\d+)/);
      if (singleMatch) {
        effects.push({
          count: 2, // 기본값
          ovr: parseInt(singleMatch[1]),
          mechanics: parseInt(singleMatch[2]),
          laning: parseInt(singleMatch[3]),
          teamfight: parseInt(singleMatch[4]),
          macro: parseInt(singleMatch[5]),
          clutch: parseInt(singleMatch[6])
        });
      }
    }
  }
  
  return effects;
}

export const SYNERGIES: Synergy[] = [
  // ==================== ROSTER (5인 완전체) ====================
  
  {
    id: "ROSTER_DK_2020",
    name: "담원 2020 완전체",
    type: "ROSTER",
    priority: 140,
    yearRule: "EXACT",
    yearValue: 2020,
    teamRule: "EXACT_TEAM",
    teamValues: ["DAMWON Gaming"],
    players: ["Nuguri", "Canyon", "ShowMaker", "Ghost", "BeryL"],
    positions: ["TOP", "JGL", "MID", "ADC", "SUP"],
    effects: parseEffects("5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10"),
    description: "2020 월즈 우승 로스터"
  },
  
  {
    id: "ROSTER_SKT_2015",
    name: "마벵페뱅울",
    type: "ROSTER",
    priority: 140,
    yearRule: "EXACT",
    yearValue: 2015,
    teamRule: "EXACT_TEAM",
    teamValues: ["SK Telecom T1"],
    players: ["MaRin", "Bengi", "Faker", "Bang", "Wolf"],
    positions: ["TOP", "JGL", "MID", "ADC", "SUP"],
    effects: parseEffects("5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10"),
    description: "2015 SKT 완전체"
  },
  
  {
    id: "ROSTER_SSW_2014",
    name: "삼성 화이트",
    type: "ROSTER",
    priority: 140,
    yearRule: "EXACT",
    yearValue: 2014,
    teamRule: "EXACT_TEAM",
    teamValues: ["Samsung White"],
    players: ["Looper", "DanDy", "PawN", "imp", "Mata"],
    positions: ["TOP", "JGL", "MID", "ADC", "SUP"],
    effects: parseEffects("5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10"),
    description: "2014 월즈 최강 로스터"
  },
  
  {
    id: "ROSTER_T1_2023",
    name: "제오페구케",
    type: "ROSTER",
    priority: 140,
    yearRule: "EXACT",
    yearValue: 2023,
    teamRule: "EXACT_TEAM",
    teamValues: ["T1"],
    players: ["Zeus", "Oner", "Faker", "Gumayusi", "Keria"],
    positions: ["TOP", "JGL", "MID", "ADC", "SUP"],
    effects: parseEffects("5인: OVR+10 / Mec+8 / Lan+8 / TF+10 / Mac+10 / Clu+10"),
    description: "2023 T1 완전체"
  },
  
  // ==================== TRIO (상체 3인) ====================
  
  {
    id: "TRIO_TOP_SKT",
    name: "마벵페",
    type: "TRIO",
    priority: 112,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["MaRin", "Bengi", "Faker"],
    positions: ["TOP", "JGL", "MID"],
    effects: parseEffects("3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4"),
    description: "SKT 왕조 상체"
  },
  
  {
    id: "TRIO_TOP_DK_2020",
    name: "너캐쇼",
    type: "TRIO",
    priority: 110,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Nuguri", "Canyon", "ShowMaker"],
    positions: ["TOP", "JGL", "MID"],
    effects: parseEffects("3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4"),
    description: "담원 상체 트리오"
  },
  
  {
    id: "TRIO_TOP_GENG",
    name: "기캐쵸",
    type: "TRIO",
    priority: 110,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Kiin", "Canyon", "Chovy"],
    positions: ["TOP", "JGL", "MID"],
    effects: parseEffects("3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4"),
    description: "압도적 상체 3인방"
  },
  
  {
    id: "TRIO_TOP_DK_KHAN",
    name: "칸캐쇼",
    type: "TRIO",
    priority: 105,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Khan", "Canyon", "ShowMaker"],
    positions: ["TOP", "JGL", "MID"],
    effects: parseEffects("3인: OVR+6 / Mec+6 / Lan+4 / TF+6 / Mac+6 / Clu+4"),
    description: "운영·한타 상체"
  },
  
  // ==================== DUO (2인) ====================
  
  {
    id: "DUO_MJ_FAKER_BENGI",
    name: "페벵",
    type: "DUO",
    priority: 98,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Faker", "Bengi"],
    positions: ["MID", "JGL"],
    effects: parseEffects("2인: OVR+4 / Mec+4 / Lan+2 / TF+4 / Mac+6 / Clu+4"),
    description: "운영의 교과서"
  },
  
  {
    id: "DUO_BOT_GUMA_KERIA",
    name: "구케",
    type: "DUO",
    priority: 97,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Gumayusi", "Keria"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "현대 T1 바텀"
  },
  
  {
    id: "DUO_MJ_CANYON_SHOWMAKER",
    name: "캐쇼",
    type: "DUO",
    priority: 97,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Canyon", "ShowMaker"],
    positions: ["JGL", "MID"],
    effects: parseEffects("2인: OVR+4 / Mec+4 / Lan+2 / TF+4 / Mac+6 / Clu+4"),
    description: "담원 왕조 미드정글"
  },
  
  {
    id: "DUO_TJ_KIIN_CANYON",
    name: "기캐",
    type: "DUO",
    priority: 96,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Kiin", "Canyon"],
    positions: ["TOP", "JGL"],
    effects: parseEffects("2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3"),
    description: "상체 주도권"
  },
  
  {
    id: "DUO_BOT_BANG_WOLF",
    name: "뱅울",
    type: "DUO",
    priority: 95,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Bang", "Wolf"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "SKT 왕조 바텀"
  },
  
  {
    id: "DUO_BOT_IMP_MATA",
    name: "임마타",
    type: "DUO",
    priority: 95,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["imp", "Mata"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "삼성 화이트 바텀 핵심"
  },
  
  {
    id: "DUO_TJ_NUGURI_CANYON",
    name: "너캐",
    type: "DUO",
    priority: 95,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Nuguri", "Canyon"],
    positions: ["TOP", "JGL"],
    effects: parseEffects("2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3"),
    description: "라인 파괴"
  },
  
  {
    id: "DUO_TJ_MARIN_BENGI",
    name: "마벵",
    type: "DUO",
    priority: 94,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["MaRin", "Bengi"],
    positions: ["TOP", "JGL"],
    effects: parseEffects("2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3"),
    description: "2015 상체 압박"
  },
  
  {
    id: "DUO_BOT_GHOST_BERYL",
    name: "고베",
    type: "DUO",
    priority: 93,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Ghost", "BeryL"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "2020 담원 월즈 바텀"
  },
  
  {
    id: "DUO_BOT_DEFT_MATA",
    name: "뎊마타",
    type: "DUO",
    priority: 92,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Deft", "Mata"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "삼성 블루 운영 바텀"
  },
  
  {
    id: "DUO_BOT_RULER_COREJJ",
    name: "룰코",
    type: "DUO",
    priority: 92,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Ruler", "CoreJJ"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "삼성/젠지 바텀 계보"
  },
  
  {
    id: "DUO_MJ_PEANUT_CHOVY",
    name: "넛쵸",
    type: "DUO",
    priority: 92,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Peanut", "Chovy"],
    positions: ["JGL", "MID"],
    effects: parseEffects("2인: OVR+3 / Mec+3 / Lan+2 / TF+3 / Mac+6 / Clu+3"),
    description: "젠지 운영 중심"
  },
  
  {
    id: "DUO_TJ_KHAN_CANYON",
    name: "칸캐",
    type: "DUO",
    priority: 92,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Khan", "Canyon"],
    positions: ["TOP", "JGL"],
    effects: parseEffects("2인: OVR+4 / Mec+5 / Lan+5 / TF+4 / Mac+3 / Clu+3"),
    description: "한타/운영 완성"
  },
  
  {
    id: "DUO_BOT_DEFT_KERIA",
    name: "뎊케",
    type: "DUO",
    priority: 90,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Deft", "Keria"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "최상급 공격형 바텀"
  },
  
  {
    id: "DUO_BOT_PRAY_GORILLA",
    name: "프릴라",
    type: "DUO",
    priority: 90,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["PraY", "GorillA"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+4 / Mec+2 / Lan+6 / TF+5 / Mac+3 / Clu+4"),
    description: "호랑이 바텀의 전설"
  },
  
  {
    id: "DUO_BOT_CPTJACK_MADLIFE",
    name: "캡매라",
    type: "DUO",
    priority: 88,
    yearRule: "OPTIONAL",
    teamRule: "SAME_TEAM",
    players: ["Cpt Jack", "MadLife"],
    positions: ["ADC", "SUP"],
    effects: parseEffects("2인: OVR+3 / Mec+2 / Lan+5 / TF+4 / Mac+2 / Clu+3"),
    description: "LCK 초창기 전설 바텀"
  },
  
  // ==================== THEME (테마 시너지) ====================
  
  {
    id: "GEN_SAME_TEAM_YEAR_5",
    name: "단일팀·단일년도(5인)",
    type: "THEME",
    priority: 90,
    yearRule: "SAME",
    teamRule: "SAME",
    minCount: 5,
    effects: parseEffects("3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2 | 4인: OVR+5 / Mec+4 / Lan+5 / TF+5 / Mac+5 / Clu+4 | 5인: OVR+7 / Mec+6 / Lan+7 / TF+7 / Mac+7 / Clu+6"),
    description: "같은 팀 + 같은 연도 풀 로스터"
  },
  
  {
    id: "LINEAGE_T1_DYNASTY_5",
    name: "T1 왕조(5인)",
    type: "THEME",
    priority: 85,
    yearRule: "ANY",
    teamRule: "IN_LIST",
    teamValues: ["SK Telecom T1 K", "SK Telecom T1 S", "SK Telecom T1", "T1"],
    minCount: 5,
    effects: parseEffects("5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6"),
    description: "T1_DYNASTY 소속 팀 카드 5장"
  },
  
  {
    id: "LINEAGE_SAMSUNG_GENG_DYNASTY_5",
    name: "삼성·젠지 왕조(5인)",
    type: "THEME",
    priority: 85,
    yearRule: "ANY",
    teamRule: "IN_LIST",
    teamValues: ["Samsung Blue", "Samsung White", "Samsung Galaxy", "Gen.G"],
    minCount: 5,
    effects: parseEffects("5인: OVR+7 / Mec+4 / Lan+4 / TF+7 / Mac+8 / Clu+6"),
    description: "SAMSUNG_GENG_DYNASTY 소속 팀 카드 5장"
  },
  
  {
    id: "GEN_SAME_TEAM_YEAR_4",
    name: "단일팀·단일년도(4인)",
    type: "THEME",
    priority: 75,
    yearRule: "SAME",
    teamRule: "SAME",
    minCount: 4,
    effects: parseEffects("3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2 | 4인: OVR+5 / Mec+4 / Lan+5 / TF+5 / Mac+5 / Clu+4"),
    description: "같은 팀 + 같은 연도 카드 4장"
  },
  
  {
    id: "LINEAGE_T1_DYNASTY_3",
    name: "T1 왕조(3인)",
    type: "THEME",
    priority: 70,
    yearRule: "ANY",
    teamRule: "IN_LIST",
    teamValues: ["SK Telecom T1 K", "SK Telecom T1 S", "SK Telecom T1", "T1"],
    minCount: 3,
    effects: parseEffects("3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4"),
    description: "T1_DYNASTY 소속 팀 카드 3장 이상"
  },
  
  {
    id: "LINEAGE_SAMSUNG_GENG_DYNASTY_3",
    name: "삼성·젠지 왕조(3인)",
    type: "THEME",
    priority: 70,
    yearRule: "ANY",
    teamRule: "IN_LIST",
    teamValues: ["Samsung Blue", "Samsung White", "Samsung Galaxy", "Gen.G"],
    minCount: 3,
    effects: parseEffects("3인: OVR+4 / Mec+2 / Lan+2 / TF+5 / Mac+6 / Clu+4"),
    description: "SAMSUNG_GENG_DYNASTY 소속 팀 카드 3장 이상"
  },
  
  {
    id: "GEN_SAME_TEAM_5",
    name: "단일팀(연도무관 5인)",
    type: "THEME",
    priority: 65,
    yearRule: "ANY",
    teamRule: "SAME",
    minCount: 5,
    effects: parseEffects("5인: OVR+6 / Mec+4 / Lan+4 / TF+6 / Mac+7 / Clu+5"),
    description: "팀만 동일한 카드 5장"
  },
  
  {
    id: "GEN_SAME_TEAM_YEAR_3",
    name: "단일팀·단일년도(3인)",
    type: "THEME",
    priority: 60,
    yearRule: "SAME",
    teamRule: "SAME",
    minCount: 3,
    effects: parseEffects("3인: OVR+3 / Mec+2 / Lan+3 / TF+3 / Mac+3 / Clu+2"),
    description: "같은 팀 + 같은 연도 카드 3장 이상"
  },
  
  {
    id: "GEN_SAME_YEAR_5",
    name: "단일년도(5인)",
    type: "THEME",
    priority: 55,
    yearRule: "SAME",
    teamRule: "ANY",
    minCount: 5,
    effects: parseEffects("5인: OVR+5 / Mec+4 / Lan+4 / TF+5 / Mac+6 / Clu+4"),
    description: "연도만 동일한 카드 5장"
  }
];
