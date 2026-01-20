// 시너지 계산 엔진

import { UserCard, Position, ActiveSynergy, Synergy } from "@/types/lck";
import { SYNERGIES } from "@/data/synergies";

/**
 * 스쿼드에서 활성화된 시너지 계산
 */
export function calculateActiveSynergies(squad: {
  TOP: UserCard | null;
  JGL: UserCard | null;
  MID: UserCard | null;
  ADC: UserCard | null;
  SUP: UserCard | null;
}): ActiveSynergy[] {
  const activeSynergies: ActiveSynergy[] = [];
  
  // 배치된 카드만 추출
  const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);
  
  if (deployedCards.length === 0) {
    return [];
  }
  
  // 모든 시너지 확인
  for (const synergy of SYNERGIES) {
    const result = checkSynergy(synergy, squad, deployedCards);
    if (result.isActive) {
      activeSynergies.push(result);
    }
  }
  
  // 우선순위로 정렬 (높은 순)
  activeSynergies.sort((a, b) => b.synergy.priority - a.synergy.priority);
  
  return activeSynergies;
}

/**
 * 개별 시너지 체크
 */
function checkSynergy(
  synergy: Synergy,
  squad: { [key in Position]: UserCard | null },
  deployedCards: UserCard[]
): ActiveSynergy {
  // THEME 시너지는 별도 처리
  if (synergy.type === "THEME") {
    return checkThemeSynergy(synergy, squad, deployedCards);
  }
  
  // 선수 기반 시너지 (DUO, TRIO, ROSTER)
  if (synergy.requiredPlayers && synergy.requiredPlayers.length > 0) {
    return checkPlayerSynergy(synergy, deployedCards);
  }
  
  // 포지션 기반 시너지
  if (synergy.requiredPositions && synergy.requiredPositions.length > 0) {
    return checkPositionSynergy(synergy, squad);
  }
  
  // 조건 없음
  return {
    synergy,
    isActive: false,
    isEnhanced: false,
    matchedPlayers: []
  };
}

/**
 * 선수 기반 시너지 체크
 */
function checkPlayerSynergy(synergy: Synergy, deployedCards: UserCard[]): ActiveSynergy {
  const requiredPlayers = synergy.requiredPlayers || [];
  const matchedPlayers: string[] = [];
  
  // 선수 ID 정규화 (소문자 + 공백 제거)
  const normalizeId = (str: string) => str.toLowerCase().replace(/\s+/g, "");
  
  for (const requiredId of requiredPlayers) {
    const normalizedRequired = normalizeId(requiredId);
    const found = deployedCards.find(card => 
      normalizeId(card.id) === normalizedRequired ||
      normalizeId(card.name) === normalizedRequired
    );
    
    if (found) {
      matchedPlayers.push(found.id);
    } else {
      // 필수 선수가 없으면 시너지 미발동
      return {
        synergy,
        isActive: false,
        isEnhanced: false,
        matchedPlayers: []
      };
    }
  }
  
  // 모든 선수가 매칭됨
  let isEnhanced = false;
  
  // EXACT 연도 규칙: 모든 선수가 지정된 연도여야 함
  if (synergy.yearRule === "EXACT" && synergy.year) {
    const allMatchYear = matchedPlayers.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && card.year === synergy.year;
    });
    
    if (!allMatchYear) {
      // EXACT인데 연도가 맞지 않으면 시너지 미발동
      return {
        synergy,
        isActive: false,
        isEnhanced: false,
        matchedPlayers: []
      };
    }
    
    isEnhanced = true; // EXACT이고 연도 일치하면 자동 강화
  }
  
  // OPTIONAL 연도 규칙: 연도 무관, 일치하면 강화
  if (synergy.yearRule === "OPTIONAL" && synergy.year) {
    const allMatchYear = matchedPlayers.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && card.year === synergy.year;
    });
    
    isEnhanced = allMatchYear;
  }
  
  return {
    synergy,
    isActive: true,
    isEnhanced,
    matchedPlayers
  };
}

/**
 * 포지션 기반 시너지 체크
 */
function checkPositionSynergy(
  synergy: Synergy,
  squad: { [key in Position]: UserCard | null }
): ActiveSynergy {
  const requiredPositions = synergy.requiredPositions || [];
  const matchedPlayers: string[] = [];
  
  for (const position of requiredPositions) {
    const card = squad[position];
    if (card) {
      matchedPlayers.push(card.id);
    } else {
      // 필수 포지션이 비어있으면 미발동
      return {
        synergy,
        isActive: false,
        isEnhanced: false,
        matchedPlayers: []
      };
    }
  }
  
  return {
    synergy,
    isActive: true,
    isEnhanced: false,
    matchedPlayers
  };
}

/**
 * 테마 시너지 체크
 */
function checkThemeSynergy(
  synergy: Synergy,
  squad: { [key in Position]: UserCard | null },
  deployedCards: UserCard[]
): ActiveSynergy {
  const matchedPlayers = deployedCards.map(c => c.id);
  
  // 풀 로스터
  if (synergy.id === "theme_fullroster") {
    const isFull = Object.values(squad).every(card => card !== null);
    return {
      synergy,
      isActive: isFull,
      isEnhanced: false,
      matchedPlayers: isFull ? matchedPlayers : []
    };
  }
  
  // 바텀 듀오
  if (synergy.id === "theme_botlane") {
    const hasBot = squad.ADC !== null && squad.SUP !== null;
    return {
      synergy,
      isActive: hasBot,
      isEnhanced: false,
      matchedPlayers: hasBot ? [squad.ADC!.id, squad.SUP!.id] : []
    };
  }
  
  // 팀 코어 (같은 팀 3명 이상)
  if (synergy.id === "theme_sameteam_exact") {
    const teamCounts = new Map<string, { count: number; year: number; players: string[] }>();
    
    for (const card of deployedCards) {
      const key = `${card.team}_${card.year}`;
      const existing = teamCounts.get(key);
      if (existing) {
        existing.count++;
        existing.players.push(card.id);
      } else {
        teamCounts.set(key, { count: 1, year: card.year, players: [card.id] });
      }
    }
    
    // 3명 이상인 팀이 있는지 확인
    for (const [key, data] of teamCounts.entries()) {
      if (data.count >= 3) {
        return {
          synergy,
          isActive: true,
          isEnhanced: true,
          matchedPlayers: data.players
        };
      }
    }
    
    return {
      synergy,
      isActive: false,
      isEnhanced: false,
      matchedPlayers: []
    };
  }
  
  return {
    synergy,
    isActive: false,
    isEnhanced: false,
    matchedPlayers: []
  };
}

/**
 * 스쿼드 스탯 계산 (총합 OVR, 평균 OVR 등)
 */
export function calculateSquadStats(
  squad: { [key in Position]: UserCard | null },
  activeSynergies: ActiveSynergy[]
) {
  const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);
  
  if (deployedCards.length === 0) {
    return {
      totalOVR: 0,
      avgOVR: 0,
      totalMechanics: 0,
      totalLaning: 0,
      totalTeamfight: 0,
      totalMacro: 0,
      totalClutch: 0,
      synergyBonus: 0
    };
  }
  
  const totalOVR = deployedCards.reduce((sum, card) => sum + card.stats.ovr + card.upgradeLevel, 0);
  const avgOVR = Math.round(totalOVR / deployedCards.length);
  
  const totalMechanics = deployedCards.reduce((sum, card) => sum + card.stats.mechanics, 0);
  const totalLaning = deployedCards.reduce((sum, card) => sum + card.stats.laning, 0);
  const totalTeamfight = deployedCards.reduce((sum, card) => sum + card.stats.teamfight, 0);
  const totalMacro = deployedCards.reduce((sum, card) => sum + card.stats.macro, 0);
  const totalClutch = deployedCards.reduce((sum, card) => sum + card.stats.clutch, 0);
  
  // 시너지 보너스 (우선순위 합계)
  const synergyBonus = activeSynergies.reduce((sum, active) => sum + active.synergy.priority, 0);
  
  return {
    totalOVR,
    avgOVR,
    totalMechanics,
    totalLaning,
    totalTeamfight,
    totalMacro,
    totalClutch,
    synergyBonus
  };
}