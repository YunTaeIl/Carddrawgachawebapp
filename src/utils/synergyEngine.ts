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
  
  // 팀 + 연도 일치하는 카드 찾기
  if (synergy.team_rule === "EXACT_TEAM" && synergy.team_values.length > 0 && synergy.year_value) {
    const targetTeam = synergy.team_values[0];
    const targetYear = synergy.year_value;
    
    const matchedCards = deployedCards.filter(card =>
      normalizeTeamName(card.team) === normalizeTeamName(targetTeam) &&
      card.year === targetYear
    );
    
    const isActive = matchedCards.length >= minCount;
    const matchedPlayers = matchedCards.map(c => c.id);
    const currentEffect = isActive ? findCurrentEffect(synergy.effects, matchedCards.length) : undefined;
    
    const missingRequirements: string[] = [];
    if (!isActive) {
      missingRequirements.push(`${targetTeam} ${targetYear}년 카드 ${minCount}장 필요 (현재 ${matchedCards.length}장)`);
    }
    
    return {
      synergy,
      isActive,
      isPrime: isActive, // THEME + EXACT는 모두 PRIME
      matchedCount: matchedCards.length,
      matchedPlayers,
      currentEffect,
      missingRequirements
    };
  }
  
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
