// AI 팀 생성 로직

import { LCKCard, Position } from "@/types/lck";
import { Team, LeagueType } from "@/types/league";

const AI_TEAM_NAMES = [
  "Team Alpha",
  "Team Bravo", 
  "Team Charlie",
  "Team Delta",
  "Team Echo",
  "Team Foxtrot",
  "Team Golf",
  "Team Hotel",
  "Team India"
];

/**
 * 카드 풀에서 등급별 필터링
 */
function filterCardsByGrade(cards: LCKCard[], leagueType: LeagueType): LCKCard[] {
  switch (leagueType) {
    case "legend":
      // 레전드: S등급만
      return cards.filter(c => c.grade === "S");
    case "tier1":
      // 1군: S, A등급
      return cards.filter(c => c.grade === "S" || c.grade === "A");
    case "tier2":
      // 2군: A, B등급
      return cards.filter(c => c.grade === "A" || c.grade === "B");
    case "tier3":
      // 3군: B, C등급
      return cards.filter(c => c.grade === "B" || c.grade === "C");
    default:
      return cards;
  }
}

/**
 * 포지션별 카드 선택 (중복 방지)
 */
function selectCardForPosition(
  position: Position,
  availableCards: LCKCard[],
  usedCardIds: Set<string>
): LCKCard | null {
  const positionCards = availableCards.filter(
    c => c.position === position && !usedCardIds.has(c.id)
  );
  
  if (positionCards.length === 0) return null;
  
  const randomIndex = Math.floor(Math.random() * positionCards.length);
  return positionCards[randomIndex];
}

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

/**
 * AI 팀 9개 생성 (선수 중복 없음)
 */
export function generateAITeams(
  allCards: LCKCard[],
  leagueType: LeagueType,
  playerSquad: Team["squad"]
): Team[] {
  const filteredCards = filterCardsByGrade(allCards, leagueType);
  const usedCardIds = new Set<string>();
  
  // 플레이어 스쿼드는 AI 풀에서 제외하지 않음 (중복 허용)
  // 하지만 AI 팀 간에는 중복 금지
  
  const aiTeams: Team[] = [];
  
  for (let i = 0; i < 9; i++) {
    const teamId = `ai_team_${i}`;
    const teamName = AI_TEAM_NAMES[i];
    
    const positions: Position[] = ["TOP", "JGL", "MID", "ADC", "SUP"];
    const squad: Team["squad"] = {
      TOP: null,
      JGL: null,
      MID: null,
      ADC: null,
      SUP: null
    };
    
    // 각 포지션별 카드 선택
    for (const pos of positions) {
      const card = selectCardForPosition(pos, filteredCards, usedCardIds);
      if (card) {
        squad[pos] = card;
        usedCardIds.add(card.id);
      }
    }
    
    const stats = calculateTeamStats(squad);
    
    aiTeams.push({
      id: teamId,
      name: teamName,
      isPlayer: false,
      squad,
      stats
    });
  }
  
  return aiTeams;
}

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
