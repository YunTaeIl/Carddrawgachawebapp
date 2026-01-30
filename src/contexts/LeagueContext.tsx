// 리그 상태 관리 Context

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { LeagueInstance, LeagueType, Team, Match, MatchResult, SeasonState, PlayoffBracket, Series } from "@/types/league";
import { useGame } from "./GameContext";
import { useAuth } from "./AuthContext";
import { generateAITeams, createPlayerTeam } from "@/utils/aiTeamGenerator";
import { generateSchedule, calculateStandings, simulateRemainingMatches } from "@/utils/leagueScheduler";
import { LEAGUE_CONFIGS } from "@/types/league";
import { saveLeagueToDb, loadLeagueFromDb, deleteLeagueFromDb } from "@/utils/leagueStorage";

interface LeagueContextType {
  currentLeague: LeagueInstance | null;
  startNewLeague: (leagueType: LeagueType) => void;
  getCurrentMatch: () => Match | null;
  completeMatch: (result: MatchResult) => void;
  getTeamById: (teamId: string) => Team | null;
  advanceToPlayoffs: () => void;
  completeSeries: (seriesType: Series["type"], winnerId: string, team1Wins?: number, team2Wins?: number) => void;
  finishSeason: (isChampion: boolean, playoffResult?: "champion" | "runner-up" | "playoffs" | "semifinals" | "wildcard" | "eliminated") => void;
  deleteLeague: () => void;
}

const LeagueContext = createContext<LeagueContextType | undefined>(undefined);

const STORAGE_KEY = "lck_league_instance";

export function LeagueProvider({ children }: { children: ReactNode }) {
  const gameContext = useGame();
  const { user } = useAuth();
  const [currentLeague, setCurrentLeague] = useState<LeagueInstance | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // 🔥 GameContext가 로딩 중이면 대기
  if (!gameContext) {
    return <>{children}</>;
  }
  
  const { userData, allCards, addCurrency } = gameContext;

  // DB에서 리그 불러오기 (초기 로드)
  useEffect(() => {
    const loadLeague = async () => {
      if (!user?.id) {
        setIsLoading(false);
        return;
      }

      try {
        // 먼저 DB에서 시도
        const dbLeague = await loadLeagueFromDb(user.id);
        if (dbLeague) {
          setCurrentLeague(dbLeague);
          // localStorage에도 백업
          localStorage.setItem(STORAGE_KEY, JSON.stringify(dbLeague));
        } else {
          // DB에 없으면 localStorage 확인 (마이그레이션용)
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const league = JSON.parse(stored) as LeagueInstance;
            setCurrentLeague(league);
            // DB에 저장
            await saveLeagueToDb(user.id, league);
          }
        }
      } catch (error) {
        console.error("❌ 리그 로드 오류:", error);
        // 폴백: localStorage 사용
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          try {
            const league = JSON.parse(stored) as LeagueInstance;
            setCurrentLeague(league);
          } catch (parseError) {
            console.error("localStorage 파싱 실패:", parseError);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadLeague();
  }, [user?.id]);

  // 리그 상태 변경 시 DB & localStorage 동시 저장
  useEffect(() => {
    const saveLeague = async () => {
      if (!currentLeague) return;
      if (!user?.id) return;
      if (isLoading) return;

      try {
        // DB 저장 (비동기)
        await saveLeagueToDb(user.id, currentLeague);
        // localStorage 백업 (동기)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLeague));
      } catch (error) {
        console.error("❌ 리그 저장 오류:", error);
        // DB 저장 실패 시 최소한 localStorage에는 저장
        localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLeague));
      }
    };

    saveLeague();
  }, [currentLeague, user?.id, isLoading]);

  /**
   * 새 리그 시작
   */
  const startNewLeague = (leagueType: LeagueType) => {
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
      standings,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    setCurrentLeague(newLeague);
  };

  /**
   * 현재 경기 가져오기 (플레이어 팀 경기만)
   */
  const getCurrentMatch = (): Match | null => {
    if (!currentLeague) return null;
    
    // 플레이어 팀의 경기만 필터링
    const playerMatches = currentLeague.matches.filter(
      m => m.homeTeamId === currentLeague.playerTeamId || m.awayTeamId === currentLeague.playerTeamId
    );
    
    // 아직 완료되지 않은 첫 번째 플레이어 경기 찾기
    const nextPlayerMatch = playerMatches.find(m => !m.isCompleted);
    
    return nextPlayerMatch || null;
  };

  /**
   * 경기 완료 처리 (정규시즌 전용)
   */
  const completeMatch = (result: MatchResult) => {
    if (!currentLeague) return;
    
    // 플레이오프 경기는 completeSeries로 처리
    if (currentLeague.seasonState === "playoffs") {
      return;
    }
    
    const updatedMatches = [...currentLeague.matches];
    
    // 완료된 경기 찾기 (result의 팀 ID로 매칭)
    const completedMatch = updatedMatches.find(
      m => !m.isCompleted && 
      m.homeTeamId === result.homeTeamId && 
      m.awayTeamId === result.awayTeamId
    );
    
    if (!completedMatch) {
      console.error("[LEAGUE] 완료된 경기를 찾을 수 없습니다:", result);
      return;
    }
    
    // 경기 결과 저장
    completedMatch.result = result;
    completedMatch.isCompleted = true;
    
    // 같은 라운드의 다른 AI 경기들도 자동 시뮬레이션
    const currentRound = completedMatch.round;
    
    const simulatedMatches = simulateRemainingMatches(
      currentRound,
      currentLeague.teams,
      updatedMatches,
      currentLeague.playerTeamId
    );
    
    const aiMatchesCompleted = simulatedMatches.filter(
      m => m.round === currentRound && 
      m.isCompleted && 
      m.homeTeamId !== currentLeague.playerTeamId && 
      m.awayTeamId !== currentLeague.playerTeamId
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
    const playerMatches = simulatedMatches.filter(
      m => m.homeTeamId === currentLeague.playerTeamId || m.awayTeamId === currentLeague.playerTeamId
    );
    const allPlayerMatchesCompleted = playerMatches.every(m => m.isCompleted);
    
    let newSeasonState = currentLeague.seasonState;
    if (allPlayerMatchesCompleted && currentLeague.seasonState === "regular") {
      // 플레이어의 모든 경기 완료
    }
    
    const updatedLeague = {
      ...currentLeague,
      matches: simulatedMatches,
      currentPoints: newPoints,
      standings: newStandings,
      seasonState: newSeasonState,
      updatedAt: new Date().toISOString()
    };
    
    setCurrentLeague(updatedLeague);
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
    
    // 순위 1~5위 팀 가져오기
    const top5 = currentLeague.standings.slice(0, 5);
    
    if (top5.length < 5) {
      console.error("플레이오프 진출팀 부족");
      return;
    }
    
    // 플레이어가 5위 안에 있는지 확인
    const playerStanding = top5.find(s => s.isPlayer);
    if (!playerStanding) {
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
  const completeSeries = (seriesType: Series["type"], winnerId: string, team1Wins?: number, team2Wins?: number) => {
    if (!currentLeague || !currentLeague.playoffBracket) return;
    
    const bracket = { ...currentLeague.playoffBracket };
    
    // 해당 시리즈 완료 처리
    const series = bracket[seriesType];
    series.winnerId = winnerId;
    series.isCompleted = true;
    
    // 스코어 저장
    if (team1Wins !== undefined) series.team1Wins = team1Wins;
    if (team2Wins !== undefined) series.team2Wins = team2Wins;
    
    // 플레이어가 승리했으면 포인트 지급
    let newPoints = currentLeague.currentPoints;
    if (winnerId === currentLeague.playerTeamId) {
      const config = LEAGUE_CONFIGS[currentLeague.leagueType];
      newPoints += config.winPoints;
    }
    
    // 다음 라운드에 승자 진출
    if (seriesType === "wildcard") {
      bracket.semifinals.team2Id = winnerId;
    } else if (seriesType === "semifinals") {
      bracket.playoffs.team2Id = winnerId;
    } else if (seriesType === "playoffs") {
      bracket.finals.team2Id = winnerId;
    }
    
    // 🔥 결승전이 끝났는지 확인
    const isFinalsCompleted = bracket.finals.isCompleted;
    
    // 🔥 결승전이 끝났으면 시즌을 finished 상태로 변경 (단, finishSeason으로 처리되지 않은 경우만)
    if (isFinalsCompleted) {
      // 시즌 종료 상태로 변경 (포인트는 이미 finishSeason에서 지급됨)
      setCurrentLeague({
        ...currentLeague,
        seasonState: "finished",
        playoffBracket: bracket,
        currentPoints: newPoints,
        updatedAt: new Date().toISOString()
      });
    } else {
      setCurrentLeague({
        ...currentLeague,
        playoffBracket: bracket,
        currentPoints: newPoints,
        updatedAt: new Date().toISOString()
      });
    }
  };

  /**
   * 시즌 종료
   */
  const finishSeason = (isChampion: boolean, playoffResult?: "champion" | "runner-up" | "playoffs" | "semifinals" | "wildcard" | "eliminated") => {
    if (!currentLeague) return;
    
    let additionalPoints = 0;
    
    // 우승 시 보너스 지급
    if (isChampion) {
      const config = LEAGUE_CONFIGS[currentLeague.leagueType];
      additionalPoints = config.championBonus;
    }
    
    const finalPoints = currentLeague.currentPoints + additionalPoints;
    
    // 🔥 실제로 포인트 지급! (누적 포인트 전부)
    if (finalPoints > 0) {
      addCurrency(finalPoints);
    }
    
    setCurrentLeague({
      ...currentLeague,
      seasonState: "finished",
      currentPoints: finalPoints,
      championTeamId: isChampion ? currentLeague.playerTeamId : undefined,
      playoffResult: playoffResult || (isChampion ? "champion" : "eliminated"),
      updatedAt: new Date().toISOString()
    });
  };

  /**
   * 리그 삭제
   */
  const deleteLeague = async () => {
    if (!user?.id) return;

    try {
      // DB에서 삭제
      await deleteLeagueFromDb(user.id);
      console.log("✅ DB에서 리그 삭제 완료");
    } catch (error) {
      console.error("❌ DB 리그 삭제 오류:", error);
    } finally {
      // 로컬 상태 및 localStorage 삭제
      setCurrentLeague(null);
      localStorage.removeItem(STORAGE_KEY);
    }
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
