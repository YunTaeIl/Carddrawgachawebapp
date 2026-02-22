// ============================================================
// AI 팀 로스터 생성 알고리즘
// 리그 시스템용 - 중복 방지 + 등급 필터 + 가중 랜덤
// ============================================================

import { LCKCard, Position, isLiveCard } from "@/types/lck";
import { Team, LeagueType } from "@/types/league";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

// ============================================================
// 1. 타입 정의
// ============================================================

type Grade = "S" | "A" | "B" | "C" | "D";

// ============================================================
// 2. 리그별 등급 가중치 설정
// ============================================================

/**
 * 리그 타입별 등급 선택 확률 가중치
 * - 각 포지션 pick 시 먼저 등급을 가중 랜덤으로 선택함
 * - 예: TIER3에서 B 40%, C 40%, A 20% 분포
 */
interface GradeWeights {
  weights: Record<Grade, number>;  // 등급별 가중치
  fallbackOrder: Grade[];          // 후보 부족 시 시도할 등급 순서
  minOvr?: number;                 // 최소 ovr 필터 (선택)
}

const LEAGUE_GRADE_WEIGHTS: Record<LeagueType, GradeWeights> = {
  masters: {
    weights: { S: 0.6, A: 0.4, B: 0, C: 0, D: 0 },
    fallbackOrder: ["S", "A", "B", "C", "D"],
    minOvr: 93,
  },
  tier3: {
    weights: { B: 0.4, C: 0.4, A: 0.2, S: 0, D: 0 },
    fallbackOrder: ["B", "C", "A", "D", "S"],
    minOvr: 60,
  },
  tier2: {
    weights: { A: 0.4, B: 0.4, S: 0.2, C: 0, D: 0 },
    fallbackOrder: ["A", "B", "S", "C", "D"],
    minOvr: 75,
  },
  tier1: {
    weights: { S: 0.4, A: 0.4, B: 0.2, C: 0, D: 0 },
    fallbackOrder: ["S", "A", "B", "C", "D"],
    minOvr: 85,
  },
  legend: {
    weights: { S: 0.5, A: 0.35, B: 0.15, C: 0, D: 0 },
    fallbackOrder: ["S", "A", "B", "C", "D"],
    minOvr: 90,
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

// 🏆 레전드 리그 전용 역대 명문팀 로스터 (실제 카드 ID 기반)
interface LegendTeamRoster {
  displayName: string;
  playerIds: [string, string, string, string, string]; // [TOP, JGL, MID, ADC, SUP]
}

const LEGEND_TEAMS_ROSTERS: LegendTeamRoster[] = [
  {
    displayName: "2013 SKT T1 K",
    playerIds: [
      "2013_SKTelecomT1K_Impact",
      "2013_SKTelecomT1K_Bengi",
      "2013_SKTelecomT1K_Faker",
      "2013_SKTelecomT1K_Piglet",
      "2013_SKTelecomT1K_PoohManDu"
    ]
  },
  {
    displayName: "2014 삼성화이트",
    playerIds: [
      "2014_SamsungWhite_Looper",
      "2014_SamsungWhite_DanDy",
      "2014_SamsungWhite_PawN",
      "2014_SamsungWhite_imp",
      "2014_SamsungWhite_Mata"
    ]
  },
  {
    displayName: "2015 SKT T1",
    playerIds: [
      "2015_SKTelecomT1_MaRin",
      "2015_SKTelecomT1_Bengi",
      "2015_SKTelecomT1_Faker",
      "2015_SKTelecomT1_Bang",
      "2015_SKTelecomT1_Wolf"
    ]
  },
  {
    displayName: "2016 SKT T1",
    playerIds: [
      "2016_SKTelecomT1_Duke",
      "2016_SKTelecomT1_Bengi",
      "2016_SKTelecomT1_Faker",
      "2016_SKTelecomT1_Bang",
      "2016_SKTelecomT1_Wolf"
    ]
  },
  {
    displayName: "2017 삼성갤럭시",
    playerIds: [
      "2017_SamsungGalaxy_CuVee",
      "2017_SamsungGalaxy_Ambition",
      "2017_SamsungGalaxy_Crown",
      "2017_SamsungGalaxy_Ruler",
      "2017_SamsungGalaxy_CoreJJ"
    ]
  },
  {
    displayName: "2020 담원",
    playerIds: [
      "2020_DAMWONGaming_Nuguri",
      "2020_DAMWONGaming_Canyon",
      "2020_DAMWONGaming_ShowMaker",
      "2020_DAMWONGaming_Ghost",
      "2020_DAMWONGaming_BeryL"
    ]
  },
  {
    displayName: "2022 DRX",
    playerIds: [
      "2022_DRX_Kingen",
      "2022_DRX_Pyosik",
      "2022_DRX_Zeka",
      "2022_DRX_Deft",
      "2022_DRX_BeryL"
    ]
  },
  {
    displayName: "2023 T1",
    playerIds: [
      "2023_T1_Zeus",
      "2023_T1_Oner",
      "2023_T1_Faker",
      "2023_T1_Gumayusi",
      "2023_T1_Keria"
    ]
  },
  {
    displayName: "2024 T1",
    playerIds: [
      "2024_T1_Zeus",
      "2024_T1_Oner",
      "2024_T1_Faker",
      "2024_T1_Gumayusi",
      "2024_T1_Keria"
    ]
  },
  {
    displayName: "2025 T1",
    playerIds: [
      "2025_T1_Doran",
      "2025_T1_Oner",
      "2025_T1_Faker",
      "2025_T1_Gumayusi",
      "2025_T1_Keria"
    ]
  },
  {
    displayName: "2020 GEN.G",
    playerIds: [
      "2020_GenG_Rascal",
      "2020_GenG_Clid",
      "2020_GenG_Bdd",
      "2020_GenG_Ruler",
      "2020_GenG_Life"
    ]
  },
  {
    displayName: "2021 GEN.G",
    playerIds: [
      "2021_GenG_Rascal",
      "2021_GenG_Clid",
      "2021_GenG_Bdd",
      "2021_GenG_Ruler",
      "2021_GenG_Life"
    ]
  },
  {
    displayName: "2025 GEN.G",
    playerIds: [
      "2025_GenG_Kiin",
      "2025_GenG_Canyon",
      "2025_GenG_Chovy",
      "2025_GenG_Ruler",
      "2025_GenG_Duro"
    ]
  },
  {
    displayName: "2019 그리핀",
    playerIds: [
      "2019_Griffin_Doran",
      "2019_Griffin_Tarzan",
      "2019_Griffin_Chovy",
      "2019_Griffin_Viper",
      "2019_Griffin_Lehends"
    ]
  },
  {
    displayName: "2021 담원",
    playerIds: [
      "2021_DWGKIA_Khan",
      "2021_DWGKIA_Canyon",
      "2021_DWGKIA_ShowMaker",
      "2021_DWGKIA_Ghost",
      "2021_DWGKIA_BeryL"
    ]
  },
  {
    displayName: "2017 KT",
    playerIds: [
      "2017_KTRolster_Smeb",
      "2017_KTRolster_Score",
      "2017_KTRolster_PawN",
      "2017_KTRolster_Deft",
      "2017_KTRolster_Mata"
    ]
  },
  {
    displayName: "2023 KT",
    playerIds: [
      "2023_KTRolster_Kiin",
      "2023_KTRolster_Cuzz",
      "2023_KTRolster_Bdd",
      "2023_KTRolster_Aiming",
      "2023_KTRolster_Lehends"
    ]
  },
  {
    displayName: "2025 KT",
    playerIds: [
      "2025_KTRolster_PerfecT",
      "2025_KTRolster_Cuzz",
      "2025_KTRolster_Bdd",
      "2025_KTRolster_deokdam",
      "2025_KTRolster_Peter"
    ]
  },
  {
    displayName: "2017 롱주게이밍",
    playerIds: [
      "2017_LongzhuGaming_Khan",
      "2017_LongzhuGaming_Cuzz",
      "2017_LongzhuGaming_Bdd",
      "2017_LongzhuGaming_PraY",
      "2017_LongzhuGaming_GorillA"
    ]
  },
  {
    displayName: "2016 락스타이거즈",
    playerIds: [
      "2016_ROXTigers_Smeb",
      "2016_ROXTigers_Peanut",
      "2016_ROXTigers_Kuro",
      "2016_ROXTigers_PraY",
      "2016_ROXTigers_GorillA"
    ]
  }
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
  // 🏆 레전드 리그는 역대 명문팀 중 랜덤 9팀 선택
  if (leagueType === "legend") {
    return generateLegendTeams(allCards);
  }
  
  // 🔥 마스터즈 리그는 레전드 리그와 동일하지만 +7 강화 적용
  if (leagueType === "masters") {
    const legendTeams = generateLegendTeams(allCards);
    return applyUpgradeToTeams(legendTeams, 7);
  }
  
  // 1) 리그별 후보 풀 구축함
  const candidatePool = buildCandidatePool(leagueType, allCards);
  
  // 2) 포지션별 + 등급별로 분리함
  const positionGradePools = splitByPositionAndGrade(candidatePool);
  
  // 3) 전역 사용 선수 이름 추적 집합 초기화함 (같은 선수의 다른 년도 카드 방지)
  const usedPlayerNames = new Set<string>();
  
  // 4) 등급별 선택 통계 (디버깅용)
  const gradePickStats: Record<Grade, number> = { S: 0, A: 0, B: 0, C: 0, D: 0 };
  
  // 5) AI 팀 생성 배열 초기화함
  const aiTeams: Team[] = [];
  
  // 6) 리그 설정 가져오기
  const leagueConfig = LEAGUE_GRADE_WEIGHTS[leagueType];
  
  // 7) 팀 생성 루프 (9회)
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
      // STEP 1: 등급을 가중 랜덤으로 선택함
      const selectedGrade = weightedPickGrade(leagueConfig.weights);
      
      // STEP 2: 해당 등급 + 포지션에서 미사용 선수 필터링
      let candidates = positionGradePools[position][selectedGrade]?.filter(
        card => !usedPlayerNames.has(card.name)
      ) || [];
      
      // STEP 3: 후보가 없으면 fallback 등급 시도
      if (candidates.length === 0) {
        for (const fallbackGrade of leagueConfig.fallbackOrder) {
          if (fallbackGrade === selectedGrade) continue;
          
          candidates = positionGradePools[position][fallbackGrade]?.filter(
            card => !usedPlayerNames.has(card.name)
          ) || [];
          
          if (candidates.length > 0) {
            console.warn(
              `[AI 로스터] ${position} ${selectedGrade}→${fallbackGrade} fallback (팀 ${i + 1})`
            );
            gradePickStats[fallbackGrade]++;
            break;
          }
        }
      } else {
        gradePickStats[selectedGrade]++;
      }
      
      // STEP 4: 여전히 후보가 없으면 에러 처리
      if (candidates.length === 0) {
        console.error(
          `[AI 로스터 생성 실패] ${position} 포지션 카드 부족 (팀 ${i + 1}/${leagueType})`
        );
        // 최후의 수단: 해당 포지션의 모든 등급에서 첫 번째 카드 선택
        for (const grade of ["S", "A", "B", "C", "D"] as Grade[]) {
          const anyCard = positionGradePools[position][grade]?.[0];
          if (anyCard) {
            squad[position] = anyCard;
            break;
          }
        }
        continue;
      }
      
      // STEP 5: 후보 중에서 OVR 기반 가중 랜덤 선택
      const selectedCard = weightedPick(candidates);
      
      squad[position] = selectedCard;
      usedPlayerNames.add(selectedCard.name);
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
  
  // 8) 생성 결과 검증
  validateRosterGeneration(aiTeams, usedPlayerNames, leagueType);
  
  return aiTeams;
}

// ============================================================
// 4. 헬퍼 함수: 후보 풀 구축
// ============================================================

/**
 * 리그 타입에 맞는 후보 카드 풀을 구축함
 * - 가중치에 포함된 모든 등급 + fallback 등급을 포함하는 넓은 풀 생성
 * - minOvr 필터 적용
 * - 🔥 LIVE 카드 제외 (AI 팀은 LIVE 카드 사용 불가)
 */
function buildCandidatePool(
  leagueType: LeagueType,
  allCards: LCKCard[]
): LCKCard[] {
  const config = LEAGUE_GRADE_WEIGHTS[leagueType];
  
  // 1) 가중치 > 0인 등급 추출
  const targetGrades: Grade[] = Object.entries(config.weights)
    .filter(([_, weight]) => weight > 0)
    .map(([grade, _]) => grade as Grade);
  
  // 2) fallback 등급 추가 (중복 제거)
  const allTargetGrades = new Set([...targetGrades, ...config.fallbackOrder]);
  
  // 3) 해당 등급들로 필터링 + 🔥 LIVE 카드 제외
  const pool = allCards.filter(card => 
    allTargetGrades.has(card.grade as Grade) &&
    (config.minOvr ? card.stats.ovr >= config.minOvr : true) &&
    !isLiveCard(card) // 🔥 LIVE 카드 제외
  );
  
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
// 5. 헬퍼 함수: 포지션 + 등급별 분리
// ============================================================

/**
 * 카드 풀을 포지션 + 등급별로 분리함
 * @returns positionGradePools[position][grade] = LCKCard[]
 */
function splitByPositionAndGrade(
  cards: LCKCard[]
): Record<Position, Record<Grade, LCKCard[]>> {
  const pools: Record<Position, Record<Grade, LCKCard[]>> = {
    TOP: { S: [], A: [], B: [], C: [], D: [] },
    JGL: { S: [], A: [], B: [], C: [], D: [] },
    MID: { S: [], A: [], B: [], C: [], D: [] },
    ADC: { S: [], A: [], B: [], C: [], D: [] },
    SUP: { S: [], A: [], B: [], C: [], D: [] },
  };
  
  for (const card of cards) {
    const grade = card.grade as Grade;
    pools[card.position][grade].push(card);
  }
  
  // 각 포지션+등급 풀을 ovr 기준 내림차순 정렬함
  for (const position of Object.keys(pools) as Position[]) {
    for (const grade of Object.keys(pools[position]) as Grade[]) {
      pools[position][grade].sort((a, b) => b.stats.ovr - a.stats.ovr);
    }
  }
  
  return pools;
}

// ============================================================
// 6. 헬퍼 함수: 가중 랜덤 선택
// ============================================================

/**
 * 등급 가중치 기반으로 등급을 랜덤 선택함
 * @param weights 등급별 가중치 맵
 * @returns 선택된 등급
 */
function weightedPickGrade(weights: Record<Grade, number>): Grade {
  // 1) 가중치 > 0인 등급만 추출
  const entries = Object.entries(weights).filter(([_, weight]) => weight > 0);
  
  if (entries.length === 0) {
    throw new Error("[등급 가중 랜덤] 가중치 없음");
  }
  
  // 2) 누적 가중치 계산
  const cumulativeWeights: { grade: Grade; cumulative: number }[] = [];
  let sum = 0;
  for (const [grade, weight] of entries) {
    sum += weight;
    cumulativeWeights.push({ grade: grade as Grade, cumulative: sum });
  }
  
  // 3) 랜덤 선택
  const random = Math.random() * sum;
  
  for (const { grade, cumulative } of cumulativeWeights) {
    if (random <= cumulative) {
      return grade;
    }
  }
  
  // Fallback
  return entries[entries.length - 1][0] as Grade;
}

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
 * 팀 스탯 계산 (시너지 포함)
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
  
  // 기본 스탯 합계
  const baseStats = {
    totalOVR: cards.reduce((sum, c) => sum + c.stats.ovr + (c.upgradeLevel || 0), 0),
    mechanics: cards.reduce((sum, c) => sum + c.stats.mechanics, 0),
    laning: cards.reduce((sum, c) => sum + c.stats.laning, 0),
    teamfight: cards.reduce((sum, c) => sum + c.stats.teamfight, 0),
    macro: cards.reduce((sum, c) => sum + c.stats.macro, 0),
    clutch: cards.reduce((sum, c) => sum + c.stats.clutch, 0)
  };
  
  // 시너지 보너스 계산
  const synergies = calculateSynergies(squad);
  const cardBonuses = calculateCardSynergyBonuses(squad, synergies);
  
  // 각 카드의 시너지 보너스 합산
  let totalSynergyBonus = 0;
  for (const card of cards) {
    const bonus = cardBonuses[card.id];
    if (bonus) {
      totalSynergyBonus += bonus.totalBonus || 0;
    }
  }
  
  // 시너지 보너스를 totalOVR에 추가
  baseStats.totalOVR += totalSynergyBonus;
  
  return baseStats;
}

// ============================================================
// 8. 헬퍼 함수: 생성 결과 검증
// ============================================================

/**
 * 로스터 생성 결과를 검증함
 * - 팀 수 확인
 * - 중복 선수 이름 확인
 * - 포지션 완전성 확인
 */
function validateRosterGeneration(
  teams: Team[],
  usedPlayerNames: Set<string>,
  leagueType: LeagueType
): void {
  // 1) 팀 수 확인
  if (teams.length !== 9) {
    console.warn(`[검증] 팀 수: ${teams.length}개 (예상: 9개)`);
  }
  
  // 2) 중복 선수 이름 확인
  const allPlayerNames = new Set<string>();
  let duplicateCount = 0;
  
  for (const team of teams) {
    for (const card of Object.values(team.squad)) {
      if (card && allPlayerNames.has(card.name)) {
        duplicateCount++;
        console.warn(`[검증] 선수 중복 발견: ${card.name} (${card.year}년 ${card.team})`);
      }
      if (card) {
        allPlayerNames.add(card.name);
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

// ============================================================
// 10. 레전드 리그 전용 팀 생성
// ============================================================

/**
 * 🏆 레전드 리그: 역대 명문팀 중 랜덤 9팀 선택
 * - 20개 명문팀 중 9개를 랜덤으로 선택
 * - 각 팀은 실제 카드 ID로 정확한 로스터 구성
 */
function generateLegendTeams(allCards: LCKCard[]): Team[] {
  console.log("🏆 레전드 팀 생성 시작...");
  console.log("전체 카드 수:", allCards.length);
  
  // 카드 ID → 카드 객체 맵 생성 (빠른 조회)
  const cardMap = new Map<string, LCKCard>();
  for (const card of allCards) {
    cardMap.set(card.id, card);
  }
  
  // 1) 20개 팀 중 랜덤 9개 선택
  const shuffled = [...LEGEND_TEAMS_ROSTERS].sort(() => Math.random() - 0.5);
  const selectedTeams = shuffled.slice(0, 9);
  
  // 2) 각 팀별 로스터 생성
  const aiTeams: Team[] = [];
  
  for (let i = 0; i < selectedTeams.length; i++) {
    const teamData = selectedTeams[i];
    const teamId = `legend_team_${i}`;
    
    console.log(`\n🔍 팀 ${i + 1}: ${teamData.displayName}`);
    
    // 포지션별 카드 ID로 직접 조회
    const [topId, jglId, midId, adcId, supId] = teamData.playerIds;
    
    const squad: Team["squad"] = {
      TOP: cardMap.get(topId) || null,
      JGL: cardMap.get(jglId) || null,
      MID: cardMap.get(midId) || null,
      ADC: cardMap.get(adcId) || null,
      SUP: cardMap.get(supId) || null
    };
    
    // 각 포지션 로그
    const positions: (keyof Team["squad"])[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
    const ids = [topId, jglId, midId, adcId, supId];
    
    for (let j = 0; j < positions.length; j++) {
      const position = positions[j];
      const cardId = ids[j];
      const card = squad[position];
      
      if (card) {
        console.log(`  ✅ ${position}: ${card.name} (${card.grade}급, OVR ${card.stats.ovr})`);
      } else {
        console.error(`  ❌ ${position}: 카드 ID "${cardId}" 찾을 수 없음!`);
      }
    }
    
    // 팀 전력 계산
    const stats = calculateTeamStats(squad);
    
    aiTeams.push({
      id: teamId,
      name: teamData.displayName,
      isPlayer: false,
      squad,
      stats
    });
  }
  
  console.log("\n✅ 레전드 팀 생성 완료:", aiTeams.length, "팀");
  
  return aiTeams;
}

// ============================================================
// 11. 팀에 강화 레벨 적용
// ============================================================

/**
 * 🔥 팀의 모든 선수에게 강화 레벨을 적용함
 * - 마스터즈 리그 전용
 * - AI 팀 선수들의 upgradeLevel을 설정하고 스탯 재계산
 */
function applyUpgradeToTeams(teams: Team[], upgradeLevel: number): Team[] {
  console.log(`🔥 마스터즈 리그: 모든 AI 선수에게 +${upgradeLevel} 강화 적용`);
  
  return teams.map(team => {
    // 각 선수에게 upgradeLevel 적용
    const upgradedSquad: Team["squad"] = {
      TOP: team.squad.TOP ? { ...team.squad.TOP, upgradeLevel } : null,
      JGL: team.squad.JGL ? { ...team.squad.JGL, upgradeLevel } : null,
      MID: team.squad.MID ? { ...team.squad.MID, upgradeLevel } : null,
      ADC: team.squad.ADC ? { ...team.squad.ADC, upgradeLevel } : null,
      SUP: team.squad.SUP ? { ...team.squad.SUP, upgradeLevel } : null,
    };
    
    // 스탯 재계산 (강화 레벨 포함)
    const stats = calculateTeamStats(upgradedSquad);
    
    console.log(`  ✅ ${team.name}: OVR ${team.stats.totalOVR} → ${stats.totalOVR} (+${stats.totalOVR - team.stats.totalOVR})`);
    
    return {
      ...team,
      squad: upgradedSquad,
      stats
    };
  });
}

