// 시너지 계산 엔진

import { UserCard, Position } from "@/types/lck";
import { SynergyDefinition, ActiveSynergy, SynergyEffectStage } from "@/types/synergy";
import { SYNERGIES } from "@/data/synergyData";

/**
 * 스쿼드에서 활성화된 시너지 계산
 */
export function calculateSynergies(squad: {
  TOP: UserCard | null;
  JGL: UserCard | null;
  MID: UserCard | null;
  ADC: UserCard | null;
  SUP: UserCard | null;
}): ActiveSynergy[] {
  const activeSynergies: ActiveSynergy[] = [];
  const deployedCards = Object.values(squad).filter((card): card is UserCard => card !== null);
  
  if (deployedCards.length === 0) {
    return [];
  }
  
  // 모든 시너지 확인
  for (const synergy of SYNERGIES) {
    const result = checkSynergy(synergy, deployedCards);
    activeSynergies.push(result);
  }
  
  // 활성화된 것만 필터링 + 우선순위 정렬
  return activeSynergies
    .filter(s => s.isActive)
    .sort((a, b) => b.synergy.priority - a.synergy.priority);
}

/**
 * 개별 시너지 체크
 */
function checkSynergy(synergy: SynergyDefinition, deployedCards: UserCard[]): ActiveSynergy {
  // 선수 기반 시너지 (ROSTER)
  if (synergy.players.length > 0) {
    return checkPlayerSynergy(synergy, deployedCards);
  }
  
  // 테마 시너지 (THEME) - 팀/연도 조합
  if (synergy.type === "THEME" && synergy.min_count) {
    return checkThemeSynergy(synergy, deployedCards);
  }
  
  // 조건 없음
  return {
    synergy,
    isActive: false,
    isPrime: false,
    matchedCount: 0,
    matchedPlayers: [],
    missingRequirements: ["조건 불충분"]
  };
}

/**
 * 선수 기반 시너지 체크 (ROSTER)
 */
function checkPlayerSynergy(synergy: SynergyDefinition, deployedCards: UserCard[]): ActiveSynergy {
  const matchedPlayers: string[] = [];
  const missingRequirements: string[] = [];
  
  // 선수 이름 정규화
  const normalizeName = (name: string) => 
    name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "");
  
  // 각 필수 선수 확인
  for (const requiredPlayer of synergy.players) {
    const normalizedRequired = normalizeName(requiredPlayer);
    const found = deployedCards.find(card => 
      normalizeName(card.name) === normalizedRequired ||
      normalizeName(card.id) === normalizedRequired
    );
    
    if (found) {
      matchedPlayers.push(found.id);
    } else {
      missingRequirements.push(`${requiredPlayer} 필요`);
    }
  }
  
  // 모든 선수가 매칭되어야 발동
  const isActive = matchedPlayers.length === synergy.players.length;
  
  if (!isActive) {
    return {
      synergy,
      isActive: false,
      isPrime: false,
      matchedCount: matchedPlayers.length,
      matchedPlayers,
      missingRequirements
    };
  }
  
  // 연도 규칙 체크 (EXACT)
  let isPrime = false;
  if (synergy.year_rule === "EXACT" && synergy.year_value) {
    const allMatchYear = matchedPlayers.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && card.year === synergy.year_value;
    });
    
    if (!allMatchYear) {
      missingRequirements.push(`${synergy.year_value}년 카드 필요`);
      return {
        synergy,
        isActive: false,
        isPrime: false,
        matchedCount: matchedPlayers.length,
        matchedPlayers,
        missingRequirements
      };
    }
    
    isPrime = true; // EXACT + 연도 일치 = PRIME
  }
  
  // 팀 규칙 체크 (EXACT_TEAM)
  if (synergy.team_rule === "EXACT_TEAM" && synergy.team_values.length > 0) {
    const targetTeam = synergy.team_values[0];
    const allMatchTeam = matchedPlayers.every(playerId => {
      const card = deployedCards.find(c => c.id === playerId);
      return card && normalizeTeamName(card.team) === normalizeTeamName(targetTeam);
    });
    
    if (!allMatchTeam) {
      missingRequirements.push(`${targetTeam} 팀 카드 필요`);
      return {
        synergy,
        isActive: false,
        isPrime: false,
        matchedCount: matchedPlayers.length,
        matchedPlayers,
        missingRequirements
      };
    }
  }
  
  // 현재 적용 효과
  const currentEffect = findCurrentEffect(synergy.effects, matchedPlayers.length);
  
  return {
    synergy,
    isActive: true,
    isPrime,
    matchedCount: matchedPlayers.length,
    matchedPlayers,
    currentEffect
  };
}

/**
 * 테마 시너지 체크 (THEME)
 */
function checkThemeSynergy(synergy: SynergyDefinition, deployedCards: UserCard[]): ActiveSynergy {
  const minCount = synergy.min_count || 3;
  let matchedCards: UserCard[] = [];
  const missingRequirements: string[] = [];
  
  // 1. EXACT_TEAM + EXACT 년도 (예: 2020 담원 풀 로스터)
  if (synergy.team_rule === "EXACT_TEAM" && synergy.team_values.length > 0 && synergy.year_value) {
    const targetTeam = synergy.team_values[0];
    const targetYear = synergy.year_value;
    
    matchedCards = deployedCards.filter(card =>
      normalizeTeamName(card.team) === normalizeTeamName(targetTeam) &&
      card.year === targetYear
    );
    
    if (matchedCards.length < minCount) {
      missingRequirements.push(`${targetTeam} ${targetYear}년 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
  }
  
  // 2. IN_LIST (예: T1 왕조 - 여러 팀명 중 하나)
  else if (synergy.team_rule === "IN_LIST" && synergy.team_values.length > 0) {
    const normalizedTeamList = synergy.team_values.map(t => normalizeTeamName(t));
    
    matchedCards = deployedCards.filter(card =>
      normalizedTeamList.includes(normalizeTeamName(card.team))
    );
    
    if (matchedCards.length < minCount) {
      missingRequirements.push(`${synergy.team_values.join("/")} 소속 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
  }
  
  // 3. SAME 팀 + SAME 연도 (예: 단일팀·단일년도)
  else if (synergy.team_rule === "SAME" && synergy.year_rule === "SAME") {
    // 팀별, 연도별로 그룹화
    const teamYearGroups = new Map<string, UserCard[]>();
    
    for (const card of deployedCards) {
      const key = `${normalizeTeamName(card.team)}_${card.year}`;
      if (!teamYearGroups.has(key)) {
        teamYearGroups.set(key, []);
      }
      teamYearGroups.get(key)!.push(card);
    }
    
    // 가장 많이 매칭된 그룹 찾기
    let maxGroup: UserCard[] = [];
    for (const group of teamYearGroups.values()) {
      if (group.length > maxGroup.length) {
        maxGroup = group;
      }
    }
    
    matchedCards = maxGroup;
    
    if (matchedCards.length < minCount) {
      missingRequirements.push(`같은 팀 + 같은 연도 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
  }
  
  // 4. SAME 팀만 (예: 단일팀 - 연도무관)
  else if (synergy.team_rule === "SAME") {
    // 팀별로 그룹화
    const teamGroups = new Map<string, UserCard[]>();
    
    for (const card of deployedCards) {
      const key = normalizeTeamName(card.team);
      if (!teamGroups.has(key)) {
        teamGroups.set(key, []);
      }
      teamGroups.get(key)!.push(card);
    }
    
    // 가장 많이 매칭된 그룹 찾기
    let maxGroup: UserCard[] = [];
    for (const group of teamGroups.values()) {
      if (group.length > maxGroup.length) {
        maxGroup = group;
      }
    }
    
    matchedCards = maxGroup;
    
    if (matchedCards.length < minCount) {
      missingRequirements.push(`같은 팀 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
  }
  
  // 5. SAME 연도만 (예: 단일년도 - 팀무관)
  else if (synergy.year_rule === "SAME") {
    // 연도별로 그룹화
    const yearGroups = new Map<number, UserCard[]>();
    
    for (const card of deployedCards) {
      if (!yearGroups.has(card.year)) {
        yearGroups.set(card.year, []);
      }
      yearGroups.get(card.year)!.push(card);
    }
    
    // 가장 많이 매칭된 그룹 찾기
    let maxGroup: UserCard[] = [];
    for (const group of yearGroups.values()) {
      if (group.length > maxGroup.length) {
        maxGroup = group;
      }
    }
    
    matchedCards = maxGroup;
    
    if (matchedCards.length < minCount) {
      missingRequirements.push(`같은 연도 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
  }
  
  const isActive = matchedCards.length >= minCount;
  const matchedPlayers = matchedCards.map(c => c.id);
  const currentEffect = isActive ? findCurrentEffect(synergy.effects, matchedCards.length) : undefined;
  
  return {
    synergy,
    isActive,
    isPrime: isActive,
    matchedCount: matchedCards.length,
    matchedPlayers,
    currentEffect,
    missingRequirements: isActive ? [] : missingRequirements
  };
}

/**
 * 현재 적용 효과 찾기
 */
function findCurrentEffect(effects: SynergyEffectStage[], matchedCount: number): SynergyEffectStage | undefined {
  if (effects.length === 0) return undefined;
  
  // 매칭된 인원수 이하의 효과 중 가장 큰 것
  const validEffects = effects.filter(e => e.count <= matchedCount);
  
  if (validEffects.length === 0) return undefined;
  
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
 * 각 카드에 적용되는 시너지 보너스 계산
 * @returns 카드별 시너지 보너스 { [cardId]: { ovr, mec, lan, tf, mac, clu } }
 */
export function calculateCardSynergyBonuses(
  squad: {
    TOP: UserCard | null;
    JGL: UserCard | null;
    MID: UserCard | null;
    ADC: UserCard | null;
    SUP: UserCard | null;
  },
  synergies: ActiveSynergy[]
): Record<string, { ovr: number; mec: number; lan: number; tf: number; mac: number; clu: number }> {
  const cardBonuses: Record<string, { ovr: number; mec: number; lan: number; tf: number; mac: number; clu: number }> = {};
  
  // 배치된 모든 카드 초기화
  Object.values(squad).forEach(card => {
    if (card) {
      cardBonuses[card.id] = { ovr: 0, mec: 0, lan: 0, tf: 0, mac: 0, clu: 0 };
    }
  });
  
  // 중복 시너지 제거: 같은 카테고리의 시너지는 가장 높은 priority만 적용
  const deduplicatedSynergies = removeDuplicateSynergies(synergies);
  
  // 활성화된 시너지들을 순회하면서 각 시너지에 해당하는 카드에 보너스 적용
  for (const activeSynergy of deduplicatedSynergies) {
    if (!activeSynergy.isActive || !activeSynergy.currentEffect) {
      continue;
    }
    
    const effect = activeSynergy.currentEffect;
    
    // 이 시너지에 포함된 카드들에게만 보너스 적용
    for (const cardId of activeSynergy.matchedPlayers) {
      if (cardBonuses[cardId]) {
        cardBonuses[cardId].ovr += effect.ovr;
        cardBonuses[cardId].mec += effect.mec;
        cardBonuses[cardId].lan += effect.lan;
        cardBonuses[cardId].tf += effect.tf;
        cardBonuses[cardId].mac += effect.mac;
        cardBonuses[cardId].clu += effect.clu;
      }
    }
  }
  
  return cardBonuses;
}

/**
 * 중복 시너지 제거: 같은 카테고리의 시너지는 가장 높은 priority만 적용
 */
function removeDuplicateSynergies(synergies: ActiveSynergy[]): ActiveSynergy[] {
  // 시너지를 카테고리별로 그룹화
  const categoryMap = new Map<string, ActiveSynergy[]>();
  
  for (const synergy of synergies) {
    const category = getSynergyCategory(synergy.synergy);
    
    if (!categoryMap.has(category)) {
      categoryMap.set(category, []);
    }
    categoryMap.get(category)!.push(synergy);
  }
  
  // 각 카테고리에서 가장 높은 priority만 선택
  const result: ActiveSynergy[] = [];
  
  for (const categoryGroup of categoryMap.values()) {
    // priority 높은 순으로 정렬 후 첫 번째만 선택
    const sorted = categoryGroup.sort((a, b) => b.synergy.priority - a.synergy.priority);
    result.push(sorted[0]);
  }
  
  return result;
}

/**
 * 시너지 카테고리 결정
 * 같은 조건의 시너지는 같은 카테고리로 묶임
 */
function getSynergyCategory(synergy: SynergyDefinition): string {
  // 1. 선수 기반 시너지 (ROSTER, TRIO, DUO)
  if (synergy.players.length > 0) {
    // 각 선수 시너지는 고유 카테고리 (중복 불가)
    return `PLAYER_${synergy.synergy_id}`;
  }
  
  // 2. 특정 팀+연도 시너지 (월즈 우승, MSI 우승, LCK 우승 등)
  if (synergy.team_rule === "EXACT_TEAM" && synergy.year_value) {
    // 각 우승 시너지는 고유 카테고리
    return `EXACT_${synergy.synergy_id}`;
  }
  
  // 3. IN_LIST (팀 계보 시너지)
  if (synergy.team_rule === "IN_LIST") {
    // 팀 계보별로 그룹화 (예: T1 왕조 3인/5인은 하나만)
    const baseId = synergy.synergy_id.replace(/_3$|_5$/, "");
    return `LINEAGE_${baseId}`;
  }
  
  // 4. SAME 팀 + SAME 연도
  if (synergy.team_rule === "SAME" && synergy.year_rule === "SAME") {
    return "GEN_SAME_TEAM_YEAR";
  }
  
  // 5. SAME 팀만
  if (synergy.team_rule === "SAME") {
    return "GEN_SAME_TEAM";
  }
  
  // 6. SAME 연도만
  if (synergy.year_rule === "SAME") {
    return "GEN_SAME_YEAR";
  }
  
  // 기타
  return `OTHER_${synergy.synergy_id}`;
}