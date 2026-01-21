// ============================================================
// AI 팀 로스터 생성 알고리즘
// 리그 시스템용 - 중복 방지 + 등급 필터 + 가중 랜덤
// ============================================================

import { LCKCard, Position } from "@/types/lck";
import { Team, LeagueType } from "@/types/league";

// ============================================================
// 1. 타입 정의
// ============================================================

type Grade = "S" | "A" | "B" | "C" | "D";

interface GradeFilterConfig {
  primary: Grade[];        // 우선 등급
  fallback: Grade[];       // 부족 시 대체 등급
  minOvr?: number;         // 최소 ovr 필터 (선택)
}

// ============================================================
// 2. 리그별 등급 필터 설정
// ============================================================

const LEAGUE_GRADE_FILTERS: Record<LeagueType, GradeFilterConfig> = {
  legend: {
    primary: ["S"],
    fallback: ["A"],
    minOvr: 90,           // 레전드는 90+ 선수만 사용
  },
  tier1: {
    primary: ["S"],
    fallback: ["A"],
    minOvr: 85,
  },
  tier2: {
    primary: ["A"],
    fallback: ["B", "S"],
    minOvr: 75,
  },
  tier3: {
    primary: ["B", "C"],
    fallback: ["A"],
    minOvr: 60,
  },
};

const AI_TEAM_NAMES = [
  "Team Alpha",
  "Team Bravo",
  "Team Charlie",
  "Team Delta",
  "Team Echo",
  "Team Foxtrot",
  "Team Golf",
  "Team Hotel",
  "Team India",
];

// ============================================================
// 3. 핵심 함수: AI 로스터 생성
// ============================================================

/**
 * AI 9팀의 로스터를 생성함
 * @param allCards 전체 카드 풀
 * @param leagueType 리그 타입 (난이도)
 * @param playerSquad 플레이어 스쿼드 (중복 허용 대상)
 * @returns AI 팀 배열
 */
export function generateAITeams(
  allCards: LCKCard[],
  leagueType: LeagueType,
  playerSquad: Team["squad"]
): Team[] {
  // 1) 리그별 후보 풀 구축함
  const candidatePool = buildCandidatePool(leagueType, allCards);
  
  // 2) 포지션별로 분리함
  const positionPools = splitByPosition(candidatePool);
  
  // 3) 전역 사용 카드 추적 집합 초기화함
  const usedCardIds = new Set<string>();
  
  // 4) AI 팀 생성 배열 초기화함
  const aiTeams: Team[] = [];
  
  // 5) 팀 생성 루프 (9회)
  for (let i = 0; i < 9; i++) {
    const teamId = `ai_team_${i}`;
    const teamName = AI_TEAM_NAMES[i];
    
    // 각 포지션별 카드 선택함
    const squad: Team["squad"] = {
      TOP: null,
      JGL: null,
      MID: null,
      ADC: null,
      SUP: null
    };
    
    for (const position of ["TOP", "JGL", "MID", "ADC", "SUP"] as Position[]) {
      const availableCards = positionPools[position].filter(
        card => !usedCardIds.has(card.id)
      );
      
      // 카드 부족 시 에러 처리함
      if (availableCards.length === 0) {
        console.error(
          `[AI 로스터 생성 실패] ${position} 포지션 카드 부족 (팀 ${i + 1}/${leagueType})`
        );
        // Fallback: 이미 사용된 카드라도 선택 (최후의 수단)
        const fallbackCard = positionPools[position][0];
        if (fallbackCard) {
          squad[position] = fallbackCard;
        }
        continue;
      }
      
      // 가중 랜덤으로 카드 선택함
      const selectedCard = weightedPick(availableCards);
      
      squad[position] = selectedCard;
      usedCardIds.add(selectedCard.id);
    }
    
    // 전력 계산함
    const stats = calculateTeamStats(squad);
    
    aiTeams.push({
      id: teamId,
      name: teamName,
      isPlayer: false,
      squad,
      stats,
    });
  }
  
  // 6) 생성 결과 검증함
  validateRosterGeneration(aiTeams, usedCardIds, leagueType);
  
  return aiTeams;
}

// ============================================================
// 4. 헬퍼 함수: 후보 풀 구축
// ============================================================

/**
 * 리그 타입에 맞는 후보 카드 풀을 구축함
 * - primary 등급 우선 선택
 * - 부족 시 fallback 등급 추가
 */
function buildCandidatePool(
  leagueType: LeagueType,
  allCards: LCKCard[]
): LCKCard[] {
  const config = LEAGUE_GRADE_FILTERS[leagueType];
  
  // 1차: primary 등급으로 필터링함
  let pool = allCards.filter(card => 
    config.primary.includes(card.grade as Grade) &&
    (config.minOvr ? card.stats.ovr >= config.minOvr : true)
  );
  
  // 포지션별 최소 개수 확인함 (각 포지션당 최소 12장 필요: 9팀 + 여유분)
  const positionCounts = countByPosition(pool);
  const minRequired = 12;
  
  // 부족한 포지션이 있으면 fallback 추가함
  let needsFallback = false;
  for (const pos of ["TOP", "JGL", "MID", "ADC", "SUP"] as Position[]) {
    if (positionCounts[pos] < minRequired) {
      needsFallback = true;
      break;
    }
  }
  
  if (needsFallback) {
    console.warn(`[AI 로스터] ${leagueType} 후보 부족, fallback 등급 추가`);
    
    const fallbackCards = allCards.filter(card =>
      config.fallback.includes(card.grade as Grade) &&
      !pool.some(c => c.id === card.id) // 중복 제거
    );
    
    pool = [...pool, ...fallbackCards];
  }
  
  return pool;
}

/**
 * 포지션별 카드 개수를 카운트함
 */
function countByPosition(cards: LCKCard[]): Record<Position, number> {
  const counts: Record<Position, number> = {
    TOP: 0,
    JGL: 0,
    MID: 0,
    ADC: 0,
    SUP: 0,
  };
  
  for (const card of cards) {
    counts[card.position]++;
  }
  
  return counts;
}

// ============================================================
// 5. 헬퍼 함수: 포지션별 분리
// ============================================================

/**
 * 카드 풀을 포지션별로 분리함
 */
function splitByPosition(
  cards: LCKCard[]
): Record<Position, LCKCard[]> {
  const pools: Record<Position, LCKCard[]> = {
    TOP: [],
    JGL: [],
    MID: [],
    ADC: [],
    SUP: [],
  };
  
  for (const card of cards) {
    pools[card.position].push(card);
  }
  
  // 각 포지션 풀을 ovr 기준 내림차순 정렬함 (고성능 우선 배치)
  for (const position of Object.keys(pools) as Position[]) {
    pools[position].sort((a, b) => b.stats.ovr - a.stats.ovr);
  }
  
  return pools;
}

// ============================================================
// 6. 헬퍼 함수: 가중 랜덤 선택
// ============================================================

/**
 * OVR 기반 가중치로 카드를 랜덤 선택함
 * - 높은 ovr일수록 선택 확률 증가
 * - 하지만 완전 결정적이지 않음 (다양성 확보)
 */
function weightedPick(cards: LCKCard[]): LCKCard {
  if (cards.length === 0) {
    throw new Error("[가중 랜덤] 후보 카드 없음");
  }
  
  if (cards.length === 1) {
    return cards[0];
  }
  
  // 1) 각 카드의 가중치 계산함
  // 가중치 = ovr^2 (제곱으로 고성능 카드 확률 강화)
  const weights = cards.map(card => Math.pow(card.stats.ovr, 2));
  
  // 2) 누적 가중치 배열 생성함
  const cumulativeWeights: number[] = [];
  let sum = 0;
  for (const weight of weights) {
    sum += weight;
    cumulativeWeights.push(sum);
  }
  
  // 3) 랜덤 값 생성함 (0 ~ totalWeight)
  const random = Math.random() * sum;
  
  // 4) 이진 탐색으로 선택할 카드 인덱스 찾음
  for (let i = 0; i < cumulativeWeights.length; i++) {
    if (random <= cumulativeWeights[i]) {
      return cards[i];
    }
  }
  
  // Fallback (이론상 도달 불가)
  return cards[cards.length - 1];
}

// ============================================================
// 7. 헬퍼 함수: 팀 전력 계산
// ============================================================

/**
 * 팀 스탯 계산
 */
function calculateTeamStats(squad: Team["squad"]) {
  const cards = Object.values(squad).filter(c => c !== null) as LCKCard[];
  
  if (cards.length === 0) {
    return {
      totalOVR: 0,
      mechanics: 0,
      laning: 0,
      teamfight: 0,
      macro: 0,
      clutch: 0
    };
  }
  
  return {
    totalOVR: cards.reduce((sum, c) => sum + c.stats.ovr + (c.upgradeLevel || 0), 0),
    mechanics: cards.reduce((sum, c) => sum + c.stats.mechanics, 0),
    laning: cards.reduce((sum, c) => sum + c.stats.laning, 0),
    teamfight: cards.reduce((sum, c) => sum + c.stats.teamfight, 0),
    macro: cards.reduce((sum, c) => sum + c.stats.macro, 0),
    clutch: cards.reduce((sum, c) => sum + c.stats.clutch, 0)
  };
}

// ============================================================
// 8. 헬퍼 함수: 생성 결과 검증
// ============================================================

/**
 * 로스터 생성 결과를 검증함
 * - 팀 수 확인
 * - 중복 카드 확인
 * - 포지션 완전성 확인
 */
function validateRosterGeneration(
  teams: Team[],
  usedCardIds: Set<string>,
  leagueType: LeagueType
): void {
  // 1) 팀 수 확인
  if (teams.length !== 9) {
    console.warn(`[검증] 팀 수: ${teams.length}개 (예상: 9개)`);
  }
  
  // 2) 중복 카드 확인
  const allCardIds = new Set<string>();
  let duplicateCount = 0;
  
  for (const team of teams) {
    for (const card of Object.values(team.squad)) {
      if (card && allCardIds.has(card.id)) {
        duplicateCount++;
        console.warn(`[검증] 카드 중복 발견: ${card.name} (${card.id})`);
      }
      if (card) {
        allCardIds.add(card.id);
      }
    }
  }
  
  // 3) 포지션 완전성 확인
  let incompleteTeams = 0;
  for (const team of teams) {
    const positions = Object.values(team.squad).filter(c => c !== null);
    if (positions.length !== 5) {
      incompleteTeams++;
      console.warn(`[검증] ${team.name} 포지션 부족: ${positions.length}/5`);
    }
  }
  
  console.log(
    `[AI 로스터 생성 완료] ${leagueType.toUpperCase()} - ` +
    `9팀, ${usedCardIds.size}장 사용, ` +
    `중복 ${duplicateCount}건, 불완전 팀 ${incompleteTeams}개`
  );
}

// ============================================================
// 9. 플레이어 팀 생성
// ============================================================

/**
 * 플레이어 팀 생성
 */
export function createPlayerTeam(squad: Team["squad"]): Team {
  const stats = calculateTeamStats(squad);
  
  return {
    id: "player_team",
    name: "MY TEAM",
    isPlayer: true,
    squad,
    stats
  };
}
