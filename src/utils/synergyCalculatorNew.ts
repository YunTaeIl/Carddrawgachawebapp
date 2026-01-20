// 시너지 계산 엔진 (CSV 기반)

import { UserCard, Position, ActiveSynergy, Synergy, SynergyEffect } from "@/types/lck";
import { SYNERGIES } from "@/data/synergiesNew";

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
  // 선수 기반 시너지 (DUO, TRIO, ROSTER)
  if (synergy.players && synergy.players.length > 0) {
    return checkPlayerSynergy(synergy, deployedCards);
  }
  
  // 테마 시너지 (팀/연도 조합)
  if (synergy.type === "THEME") {
    return checkThemeSynergy(synergy, deployedCards);
  }
  
  // 조건 없음
  return {
    synergy,
    isActive: false,
    matchedCount: 0,
    matchedPlayers: []
  };
}

/**
 * 선수 기반 시너지 체크
 */
function checkPlayerSynergy(synergy: Synergy, deployedCards: UserCard[]): ActiveSynergy {
  const requiredPlayers = synergy.players || [];
  const matchedPlayers: string[] = [];
  
  // 선수 이름 정규화 (대소문자 무시, 공백 제거)
  const normalizeName = (str: string) => str.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  
  for (const requiredName of requiredPlayers) {
    const normalizedRequired = normalizeName(requiredName);
    const found = deployedCards.find(card => 
      normalizeName(card.name) === normalizedRequired ||
      normalizeName(card.id) === normalizedRequired
    );
    
    if (found) {
      matchedPlayers.push(found.id);
    } else {
      // 필수 선수가 없으면 시너지 미발동
      return {
        synergy,
        isActive: false,
        matchedCount: 0,
        matchedPlayers: []
      };
    }
  }
  
  // 모든 선수가 매칭됨
  const matchedCount = matchedPlayers.length;
  
  // 연도 규칙 체크
  if (!checkYearRule(synergy, deployedCards, matchedPlayers)) {
    return {
      synergy,
      isActive: false,
      matchedCount: 0,
      matchedPlayers: []
    };
  }
  
  // 팀 규칙 체크
  if (!checkTeamRule(synergy, deployedCards, matchedPlayers)) {
    return {
      synergy,
      isActive: false,
      matchedCount: 0,
      matchedPlayers: []
    };
  }
  
  // 현재 적용 효과 찾기
  const currentEffect = findCurrentEffect(synergy.effects, matchedCount);
  
  return {
    synergy,
    isActive: true,
    matchedCount,
    matchedPlayers,
    currentEffect
  };
}

/**
 * 테마 시너지 체크
 */
function checkThemeSynergy(synergy: Synergy, deployedCards: UserCard[]): ActiveSynergy {
  const minCount = synergy.minCount || 3;
  
  // 연도 규칙에 따라 그룹화
  if (synergy.yearRule === "SAME" && synergy.teamRule === "SAME") {
    // 같은 팀 + 같은 연도
    const groups = groupByTeamAndYear(deployedCards);
    
    for (const [key, cards] of groups.entries()) {
      if (cards.length >= minCount) {
        const matchedPlayers = cards.map(c => c.id);
        const currentEffect = findCurrentEffect(synergy.effects, cards.length);
        
        return {
          synergy,
          isActive: true,
          matchedCount: cards.length,
          matchedPlayers,
          currentEffect
        };
      }
    }
  }
  
  // 팀 리스트 체크 (T1 왕조, 삼성·젠지 왕조 등)
  if (synergy.teamRule === "IN_LIST" && synergy.teamValues) {
    const matchedCards = deployedCards.filter(card => 
      synergy.teamValues!.some(teamName => 
        normalizeTeamName(card.team) === normalizeTeamName(teamName)
      )
    );
    
    if (matchedCards.length >= minCount) {
      const matchedPlayers = matchedCards.map(c => c.id);
      const currentEffect = findCurrentEffect(synergy.effects, matchedCards.length);
      
      return {
        synergy,
        isActive: true,
        matchedCount: matchedCards.length,
        matchedPlayers,
        currentEffect
      };
    }
  }
  
  // 같은 팀 (연도 무관)
  if (synergy.teamRule === "SAME" && synergy.yearRule === "ANY") {
    const teamGroups = groupByTeam(deployedCards);
    
    for (const [team, cards] of teamGroups.entries()) {
      if (cards.length >= minCount) {
        const matchedPlayers = cards.map(c => c.id);
        const currentEffect = findCurrentEffect(synergy.effects, cards.length);
        
        return {
          synergy,
          isActive: true,
          matchedCount: cards.length,
          matchedPlayers,
          currentEffect
        };
      }
    }
  }
  
  // 같은 연도 (팀 무관)
  if (synergy.yearRule === "SAME" && synergy.teamRule === "ANY") {
    const yearGroups = groupByYear(deployedCards);
    
    for (const [year, cards] of yearGroups.entries()) {
      if (cards.length >= minCount) {
        const matchedPlayers = cards.map(c => c.id);
        const currentEffect = findCurrentEffect(synergy.effects, cards.length);
        
        return {
          synergy,
          isActive: true,
          matchedCount: cards.length,
          matchedPlayers,
          currentEffect
        };
      }
    }
  }
  
  return {
    synergy,
    isActive: false,
    matchedCount: 0,
    matchedPlayers: []
  };
}

/**
 * 연도 규칙 체크
 */
function checkYearRule(synergy: Synergy, deployedCards: UserCard[], matchedPlayerIds: string[]): boolean {
  if (synergy.yearRule === "EXACT" && synergy.yearValue) {
    // 모든 선수가 지정된 연도여야 함
    return matchedPlayerIds.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && card.year === synergy.yearValue;
    });
  }
  
  if (synergy.yearRule === "SAME") {
    // 모든 선수가 같은 연도여야 함
    const years = matchedPlayerIds.map(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card?.year;
    });
    
    return years.length > 0 && years.every(y => y === years[0]);
  }
  
  // OPTIONAL, ANY는 연도 무관
  return true;
}

/**
 * 팀 규칙 체크
 */
function checkTeamRule(synergy: Synergy, deployedCards: UserCard[], matchedPlayerIds: string[]): boolean {
  if (synergy.teamRule === "EXACT_TEAM" && synergy.teamValues && synergy.teamValues.length > 0) {
    // 모든 선수가 지정된 팀이어야 함
    const targetTeam = synergy.teamValues[0];
    return matchedPlayerIds.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && normalizeTeamName(card.team) === normalizeTeamName(targetTeam);
    });
  }
  
  if (synergy.teamRule === "SAME_TEAM" || synergy.teamRule === "SAME") {
    // 모든 선수가 같은 팀이어야 함
    const teams = matchedPlayerIds.map(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card?.team;
    });
    
    return teams.length > 0 && teams.every(t => normalizeTeamName(t || "") === normalizeTeamName(teams[0] || ""));
  }
  
  // ANY는 팀 무관
  return true;
}

/**
 * 현재 적용 효과 찾기
 */
function findCurrentEffect(effects: SynergyEffect[], matchedCount: number): SynergyEffect | undefined {
  // 매칭된 인원수 이하의 효과 중 가장 큰 것
  const validEffects = effects.filter(e => e.count <= matchedCount);
  
  if (validEffects.length === 0) {
    return undefined;
  }
  
  // count가 가장 큰 효과 반환
  return validEffects.reduce((prev, current) => 
    current.count > prev.count ? current : prev
  );
}

/**
 * 팀 이름 정규화
 */
function normalizeTeamName(teamName: string): string {
  return teamName
    .toLowerCase()
    .replace(/\s+/g, "")
    .replace(/\./g, "")
    .replace(/telecom/g, "")
    .trim();
}

/**
 * 팀+연도로 그룹화
 */
function groupByTeamAndYear(cards: UserCard[]): Map<string, UserCard[]> {
  const groups = new Map<string, UserCard[]>();
  
  for (const card of cards) {
    const key = `${normalizeTeamName(card.team)}_${card.year}`;
    const existing = groups.get(key);
    if (existing) {
      existing.push(card);
    } else {
      groups.set(key, [card]);
    }
  }
  
  return groups;
}

/**
 * 팀으로 그룹화
 */
function groupByTeam(cards: UserCard[]): Map<string, UserCard[]> {
  const groups = new Map<string, UserCard[]>();
  
  for (const card of cards) {
    const key = normalizeTeamName(card.team);
    const existing = groups.get(key);
    if (existing) {
      existing.push(card);
    } else {
      groups.set(key, [card]);
    }
  }
  
  return groups;
}

/**
 * 연도로 그룹화
 */
function groupByYear(cards: UserCard[]): Map<number, UserCard[]> {
  const groups = new Map<number, UserCard[]>();
  
  for (const card of cards) {
    const existing = groups.get(card.year);
    if (existing) {
      existing.push(card);
    } else {
      groups.set(card.year, [card]);
    }
  }
  
  return groups;
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
      synergyBonus: {
        ovr: 0,
        mechanics: 0,
        laning: 0,
        teamfight: 0,
        macro: 0,
        clutch: 0
      }
    };
  }
  
  // 기본 스탯 합계
  const baseOVR = deployedCards.reduce((sum, card) => sum + card.stats.ovr + card.upgradeLevel, 0);
  const baseMechanics = deployedCards.reduce((sum, card) => sum + card.stats.mechanics, 0);
  const baseLaning = deployedCards.reduce((sum, card) => sum + card.stats.laning, 0);
  const baseTeamfight = deployedCards.reduce((sum, card) => sum + card.stats.teamfight, 0);
  const baseMacro = deployedCards.reduce((sum, card) => sum + card.stats.macro, 0);
  const baseClutch = deployedCards.reduce((sum, card) => sum + card.stats.clutch, 0);
  
  // 시너지 보너스 합계
  const synergyBonus = {
    ovr: 0,
    mechanics: 0,
    laning: 0,
    teamfight: 0,
    macro: 0,
    clutch: 0
  };
  
  for (const active of activeSynergies) {
    if (active.currentEffect) {
      synergyBonus.ovr += active.currentEffect.ovr;
      synergyBonus.mechanics += active.currentEffect.mechanics;
      synergyBonus.laning += active.currentEffect.laning;
      synergyBonus.teamfight += active.currentEffect.teamfight;
      synergyBonus.macro += active.currentEffect.macro;
      synergyBonus.clutch += active.currentEffect.clutch;
    }
  }
  
  const totalOVR = baseOVR + synergyBonus.ovr;
  const avgOVR = Math.round(totalOVR / deployedCards.length);
  
  return {
    totalOVR,
    avgOVR,
    totalMechanics: baseMechanics + synergyBonus.mechanics,
    totalLaning: baseLaning + synergyBonus.laning,
    totalTeamfight: baseTeamfight + synergyBonus.teamfight,
    totalMacro: baseMacro + synergyBonus.macro,
    totalClutch: baseClutch + synergyBonus.clutch,
    synergyBonus
  };
}
