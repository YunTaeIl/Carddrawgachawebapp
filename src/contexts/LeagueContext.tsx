// 리그 상태 관리 Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LeagueInstance, LeagueType, Team, Match, MatchResult, SeasonState, PlayoffBracket, Series } from "@/types/league";
import { useGame } from "./GameContext";
import { generateAITeams, createPlayerTeam } from "@/utils/aiTeamGenerator";
import { generateSchedule, calculateStandings } from "@/utils/leagueScheduler";
import { LEAGUE_CONFIGS } from "@/types/league";

interface LeagueContextType {
  currentLeague: LeagueInstance | null;
  startNewLeague: (leagueType: LeagueType) => void;
  getCurrentMatch: () => Match | null;
  completeMatch: (result: MatchResult) => void;
  getTeamById: (teamId: string) => Team | null;
  advanceToPlayoffs: () => void;
  completeSeries: (seriesType: Series["type"], winnerId: string) => void;
  finishSeason: (isChampion: boolean) => void;
  deleteLeague: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const STORAGE_KEY = "lck_league_instance";

export function LeagueProvider({ children }: { children: ReactNode }) {
  const { userData, allCards } = useGame();
  const [currentLeague, setCurrentLeague] = useState<LeagueInstance | null>(null);

  // localStorage에서 리그 불러오기
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const league = JSON.parse(stored) as LeagueInstance;
        setCurrentLeague(league);
      } catch (error) {
        console.error("리그 데이터 로드 실패:", error);
      }
    }
  }, []);

  // 리그 상태 변경 시 localStorage 저장
  useEffect(() => {
    if (currentLeague) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLeague));
    }
  }, [currentLeague]);

  /**
   * 새 리그 시작
   */
  const startNewLeague = (leagueType: LeagueType) => {
    console.log("=== 새 리그 시작 ===", leagueType);
    
    // 플레이어 팀 생성
    const playerTeam = createPlayerTeam(userData.squad);
    
    // AI 팀 9개 생성
    const aiTeams = generateAITeams(allCards, leagueType, userData.squad);
    
    // 전체 팀 목록
    const allTeams = [playerTeam, ...aiTeams];
    
    // 일정 생성
    const aiTeamIds = aiTeams.map(t => t.id);
    const matches = generateSchedule(playerTeam.id, aiTeamIds);
    
    // 순위표 초기화
    const standings = calculateStandings(allTeams, []);
    
    const newLeague: LeagueInstance = {
      id: `league_${Date.now()}`,
      leagueType,
      seasonState: "regular",
      currentPoints: 0,
      teams: allTeams,
      playerTeamId: playerTeam.id,
      matches,
      currentMatchIndex: 0,
      standings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentLeague(newLeague);
    console.log("✅ 리그 생성 완료:", newLeague);
  };

  /**
   * 현재 경기 가져오기
   */
  const getCurrentMatch = (): Match | null => {
    if (!currentLeague) return null;
    
    // 정규시즌 완료 체크
    if (currentLeague.currentMatchIndex >= currentLeague.matches.length) {
      return null;
    }
    
    return currentLeague.matches[currentLeague.currentMatchIndex] || null;
  };

  /**
   * 경기 완료 처리
   */
  const completeMatch = (result: MatchResult) => {
    if (!currentLeague) return;
    
    console.log("=== 경기 완료 ===", result);
    
    const updatedMatches = [...currentLeague.matches];
    const currentMatch = updatedMatches[currentLeague.currentMatchIndex];
    
    if (!currentMatch) return;
    
    // 경기 결과 저장
    currentMatch.result = result;
    currentMatch.isCompleted = true;
    
    // 같은 라운드의 다른 AI 경기들도 자동 시뮬레이션
    const currentRound = currentMatch.round;
    // simulateRemainingMatches를 import할 수 없어서 직접 import
    const { simulateRemainingMatches } = require("@/utils/leagueScheduler");
    const simulatedMatches = simulateRemainingMatches(
      currentRound,
      currentLeague.teams,
      updatedMatches,
      currentLeague.playerTeamId
    );
    
    // 승리 포인트 지급
    let newPoints = currentLeague.currentPoints;
    if (result.winnerId === currentLeague.playerTeamId) {
      const config = LEAGUE_CONFIGS[currentLeague.leagueType];
      newPoints += config.winPoints;
    }
    
    // 순위표 재계산 (시뮬레이션된 경기 포함)
    const newStandings = calculateStandings(currentLeague.teams, simulatedMatches);
    
    // 정규시즌 종료 체크
    const nextMatchIndex = currentLeague.currentMatchIndex + 1;
    let newSeasonState = currentLeague.seasonState;
    
    if (nextMatchIndex >= currentLeague.matches.length && currentLeague.seasonState === "regular") {
      // 정규시즌 18경기 모두 완료
      console.log("✅ 정규시즌 종료!");
    }
    
    setCurrentLeague({
      ...currentLeague,
      matches: simulatedMatches,
      currentMatchIndex: nextMatchIndex,
      currentPoints: newPoints,
      standings: newStandings,
      seasonState: newSeasonState,
      updatedAt: new Date().toISOString()
    });
  };

  /**
   * 팀 ID로 팀 정보 가져오기
   */
  const getTeamById = (teamId: string): Team | null => {
    if (!currentLeague) return null;
    return currentLeague.teams.find(t => t.id === teamId) || null;
  };

  /**
   * 플레이오프 진출
   */
  const advanceToPlayoffs = () => {
    if (!currentLeague || currentLeague.seasonState !== "regular") return;
    
    console.log("=== 플레이오프 진출 ===");
    
    // 순위 1~5위 팀 가져오기
    const top5 = currentLeague.standings.slice(0, 5);
    
    if (top5.length < 5) {
      console.error("플레이오프 진출팀 부족");
      return;
    }
    
    // 플레이어가 5위 안에 있는지 확인
    const playerStanding = top5.find(s => s.isPlayer);
    if (!playerStanding) {
      console.log("플레이어 탈락 (6위 이하)");
      // 탈락 처리는 UI에서 수행
      return;
    }
    
    // 플레이오프 브래킷 생성
    const bracket: PlayoffBracket = {
      wildcard: {
        id: "wildcard",
        type: "wildcard",
        bestOf: 3,
        team1Id: top5[3].teamId, // 4위
        team2Id: top5[4].teamId, // 5위
        team1Wins: 0,
        team2Wins: 0,
        winnerId: null,
        isCompleted: false,
        matches: []
      },
      semifinals: {
        id: "semifinals",
        type: "semifinals",
        bestOf: 5,
        team1Id: top5[2].teamId, // 3위
        team2Id: null, // 와일드카드 승자
        team1Wins: 0,
        team2Wins: 0,
        winnerId: null,
        isCompleted: false,
        matches: []
      },
      playoffs: {
        id: "playoffs",
        type: "playoffs",
        bestOf: 5,
        team1Id: top5[1].teamId, // 2위
        team2Id: null, // 준플 승자
        team1Wins: 0,
        team2Wins: 0,
        winnerId: null,
        isCompleted: false,
        matches: []
      },
      finals: {
        id: "finals",
        type: "finals",
        bestOf: 5,
        team1Id: top5[0].teamId, // 1위
        team2Id: null, // 플옵 승자
        team1Wins: 0,
        team2Wins: 0,
        winnerId: null,
        isCompleted: false,
        matches: []
      }
    };
    
    setCurrentLeague({
      ...currentLeague,
      seasonState: "playoffs",
      playoffBracket: bracket,
      updatedAt: new Date().toISOString()
    });
  };

  /**
   * 시리즈 완료
   */
  const completeSeries = (seriesType: Series["type"], winnerId: string) => {
    if (!currentLeague || !currentLeague.playoffBracket) return;
    
    console.log("=== 시리즈 완료 ===", seriesType, winnerId);
    
    const bracket = { ...currentLeague.playoffBracket };
    
    // 해당 시리즈 완료 처리
    const series = bracket[seriesType];
    series.winnerId = winnerId;
    series.isCompleted = true;
    
    // 다음 라운드에 승자 진출
    if (seriesType === "wildcard") {
      bracket.semifinals.team2Id = winnerId;
    } else if (seriesType === "semifinals") {
      bracket.playoffs.team2Id = winnerId;
    } else if (seriesType === "playoffs") {
      bracket.finals.team2Id = winnerId;
    }
    
    setCurrentLeague({
      ...currentLeague,
      playoffBracket: bracket,
      updatedAt: new Date().toISOString()
    });
  };

  /**
   * 시즌 종료
   */
  const finishSeason = (isChampion: boolean) => {
    if (!currentLeague) return;
    
    console.log("=== 시즌 종료 ===", isChampion);
    
    let finalPoints = currentLeague.currentPoints;
    
    // 우승 시 보너스 지급
    if (isChampion) {
      const config = LEAGUE_CONFIGS[currentLeague.leagueType];
      finalPoints += config.championBonus;
    }
    
    setCurrentLeague({
      ...currentLeague,
      seasonState: "finished",
      currentPoints: finalPoints,
      championTeamId: isChampion ? currentLeague.playerTeamId : undefined,
      updatedAt: new Date().toISOString()
    });
  };

  /**
   * 리그 삭제
   */
  const deleteLeague = () => {
    setCurrentLeague(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <LeagueContext.Provider
      value={{
        currentLeague,
        startNewLeague,
        getCurrentMatch,
        completeMatch,
        getTeamById,
        advanceToPlayoffs,
        completeSeries,
        finishSeason,
        deleteLeague
      }}
    >
      {children}
    </LeagueContext.Provider>
  );
}

export function useLeague() {
  const context = useContext(LeagueContext);
  if (!context) {
    throw new Error("useLeague must be used within LeagueProvider");
  }
  return context;
}
