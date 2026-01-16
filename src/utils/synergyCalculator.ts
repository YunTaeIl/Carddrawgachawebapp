// LCK 스쿼드 시너지 계산기

import { UserCard, Synergy, CardStats } from "@/types/lck";

export interface Squad {
  TOP: UserCard | null;
  JNG: UserCard | null;
  MID: UserCard | null;
  ADC: UserCard | null;
  SUP: UserCard | null;
}

export interface SquadStats {
  totalOVR: number;
  avgOVR: number;
  totalMechanics: number;
  totalLaning: number;
  totalTeamfight: number;
  totalMacro: number;
  totalClutch: number;
}

export interface SynergyBonus {
  ovrBonus: number; // % 증가
  mechanicsBonus: number;
  laningBonus: number;
  teamfightBonus: number;
  macroBonus: number;
  clutchBonus: number;
}

/**
 * 스쿼드에서 활성화된 시너지 계산
 */
export function calculateActiveSynergies(squad: Squad): Synergy[] {
  const activeSynergies: Synergy[] = [];
  const cards = Object.values(squad).filter(c => c !== null) as UserCard[];
  
  if (cards.length === 0) return [];

  // 1. 풀 로스터 (5포지션 모두 채움)
  if (cards.length === 5) {
    activeSynergies.push({
      id: "full_roster",
      name: "풀 로스터",
      description: "TOP/JNG/MID/ADC/SUP 각 1명씩 총 5명 배치",
      isActive: true,
      bonus: "스쿼드 총 OVR +3%, 전원 Macro +2"
    });
  }

  // 2. 바텀 듀오 (ADC + SUP 같은 팀/연도)
  if (squad.ADC && squad.SUP) {
    if (squad.ADC.team === squad.SUP.team && squad.ADC.year === squad.SUP.year) {
      activeSynergies.push({
        id: "bot_duo",
        name: "바텀 듀오",
        description: `${squad.ADC.team} (${squad.ADC.year})`,
        isActive: true,
        bonus: "ADC/SUP Teamfight +4, Clutch +3"
      });
    }
  }

  // 3. 미드-정글 연계
  if (squad.MID && squad.JNG) {
    if (squad.MID.team === squad.JNG.team && squad.MID.year === squad.JNG.year) {
      activeSynergies.push({
        id: "mid_jungle",
        name: "미드-정글 연계",
        description: `${squad.MID.team} (${squad.MID.year})`,
        isActive: true,
        bonus: "MID/JNG Macro +4, Mechanics +3"
      });
    }
  }

  // 4. 탑-정글 압박
  if (squad.TOP && squad.JNG) {
    if (squad.TOP.team === squad.JNG.team && squad.TOP.year === squad.JNG.year) {
      activeSynergies.push({
        id: "top_jungle",
        name: "탑-정글 압박",
        description: `${squad.TOP.team} (${squad.TOP.year})`,
        isActive: true,
        bonus: "TOP Laning +3, JNG Macro +2"
      });
    }
  }

  // 5. 팀 코어 시너지
  const teamYearCount = getTeamYearCounts(cards);
  const maxTeamYearCount = Math.max(...Object.values(teamYearCount));
  
  if (maxTeamYearCount >= 5) {
    activeSynergies.push({
      id: "team_core_5",
      name: "팀 코어 (5)",
      description: "같은 팀/연도 5명",
      isActive: true,
      bonus: "전원 Clutch +5"
    });
  } else if (maxTeamYearCount >= 3) {
    activeSynergies.push({
      id: "team_core_3",
      name: "팀 코어 (3)",
      description: "같은 팀/연도 3명 이상",
      isActive: true,
      bonus: "전원 Teamfight +2, Macro +2"
    });
  }

  // 6. 연도 시너지
  const yearCount = getYearCounts(cards);
  const maxYearCount = Math.max(...Object.values(yearCount));
  
  if (maxYearCount >= 5) {
    activeSynergies.push({
      id: "era_stack_5",
      name: "연도 시너지 (5)",
      description: "같은 연도 5명",
      isActive: true,
      bonus: "전원 모든 서브스탯 +2"
    });
  } else if (maxYearCount >= 3) {
    activeSynergies.push({
      id: "era_stack_3",
      name: "연도 시너지 (3)",
      description: "같은 연도 3명 이상",
      isActive: true,
      bonus: "전원 모든 서브스탯 +1"
    });
  }

  return activeSynergies;
}

/**
 * 시너지 보너스 계산
 */
export function calculateSynergyBonus(squad: Squad, synergies: Synergy[]): SynergyBonus {
  const bonus: SynergyBonus = {
    ovrBonus: 0,
    mechanicsBonus: 0,
    laningBonus: 0,
    teamfightBonus: 0,
    macroBonus: 0,
    clutchBonus: 0
  };

  for (const synergy of synergies) {
    switch (synergy.id) {
      case "full_roster":
        bonus.ovrBonus += 3; // 3% OVR 증가
        bonus.macroBonus += 2; // 전원 +2
        break;
      
      case "bot_duo":
        // ADC/SUP만 적용
        break;
      
      case "mid_jungle":
        // MID/JNG만 적용
        break;
      
      case "top_jungle":
        // TOP/JNG만 적용
        break;
      
      case "team_core_3":
        bonus.teamfightBonus += 2;
        bonus.macroBonus += 2;
        break;
      
      case "team_core_5":
        bonus.clutchBonus += 5;
        break;
      
      case "era_stack_3":
        bonus.mechanicsBonus += 1;
        bonus.laningBonus += 1;
        bonus.teamfightBonus += 1;
        bonus.macroBonus += 1;
        bonus.clutchBonus += 1;
        break;
      
      case "era_stack_5":
        bonus.mechanicsBonus += 2;
        bonus.laningBonus += 2;
        bonus.teamfightBonus += 2;
        bonus.macroBonus += 2;
        bonus.clutchBonus += 2;
        break;
    }
  }

  return bonus;
}

/**
 * 개별 카드 스탯 (시너지 적용)
 */
export function getCardStatsWithSynergy(
  card: UserCard,
  squad: Squad,
  synergies: Synergy[]
): CardStats {
  const baseStats = { ...card.stats };
  const bonus = calculateSynergyBonus(squad, synergies);
  
  // 강화 레벨 적용 (+1 OVR per level)
  baseStats.ovr += card.upgradeLevel;

  // 전역 보너스
  baseStats.mechanics += bonus.mechanicsBonus;
  baseStats.laning += bonus.laningBonus;
  baseStats.teamfight += bonus.teamfightBonus;
  baseStats.macro += bonus.macroBonus;
  baseStats.clutch += bonus.clutchBonus;

  // 포지션별 특정 시너지
  for (const synergy of synergies) {
    if (synergy.id === "bot_duo" && (card.position === "ADC" || card.position === "SUP")) {
      baseStats.teamfight += 4;
      baseStats.clutch += 3;
    }
    
    if (synergy.id === "mid_jungle" && (card.position === "MID" || card.position === "JNG")) {
      baseStats.macro += 4;
      baseStats.mechanics += 3;
    }
    
    if (synergy.id === "top_jungle") {
      if (card.position === "TOP") {
        baseStats.laning += 3;
      }
      if (card.position === "JNG") {
        baseStats.macro += 2;
      }
    }
  }

  // OVR 보너스 (% 증가)
  if (bonus.ovrBonus > 0) {
    baseStats.ovr = Math.round(baseStats.ovr * (1 + bonus.ovrBonus / 100));
  }

  return baseStats;
}

/**
 * 스쿼드 총합 스탯 계산
 */
export function calculateSquadStats(squad: Squad, synergies: Synergy[]): SquadStats {
  const cards = Object.values(squad).filter(c => c !== null) as UserCard[];
  
  if (cards.length === 0) {
    return {
      totalOVR: 0,
      avgOVR: 0,
      totalMechanics: 0,
      totalLaning: 0,
      totalTeamfight: 0,
      totalMacro: 0,
      totalClutch: 0
    };
  }

  let totalOVR = 0;
  let totalMechanics = 0;
  let totalLaning = 0;
  let totalTeamfight = 0;
  let totalMacro = 0;
  let totalClutch = 0;

  for (const card of cards) {
    const stats = getCardStatsWithSynergy(card, squad, synergies);
    totalOVR += stats.ovr;
    totalMechanics += stats.mechanics;
    totalLaning += stats.laning;
    totalTeamfight += stats.teamfight;
    totalMacro += stats.macro;
    totalClutch += stats.clutch;
  }

  return {
    totalOVR,
    avgOVR: Math.round(totalOVR / cards.length),
    totalMechanics,
    totalLaning,
    totalTeamfight,
    totalMacro,
    totalClutch
  };
}

// Helper functions
function getTeamYearCounts(cards: UserCard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    const key = `${card.team}_${card.year}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function getYearCounts(cards: UserCard[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const card of cards) {
    counts[card.year] = (counts[card.year] || 0) + 1;
  }
  return counts;
}
