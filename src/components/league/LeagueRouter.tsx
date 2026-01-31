// 리그 라우터 - 리그 관련 모든 페이지 통합

import React, { useState } from "react";
import { useLeague } from "@/contexts/LeagueContext";
import { LeagueSelectPage } from "./LeagueSelectPage";
import { LeagueProgressPage } from "./LeagueProgressPage";
import { AdvancedMatchPage } from "./AdvancedMatchPage";
import { StandingsPage } from "./StandingsPage";
import { PlayoffsPage } from "./PlayoffsPage";
import { SeasonResultPage } from "./SeasonResultPage";
import { Series } from "@/types/league";
import { SeriesType } from "@/types/advancedSimulation";
import { calculateSynergies, calculateCardSynergyBonuses } from "@/utils/synergyEngine";

type LeagueRoute = 
  | "select"
  | "progress"
  | "match"
  | "standings"
  | "playoffs"
  | "series"
  | "result";

interface LeagueRouterProps {
  onBackToMain: () => void;
}

export function LeagueRouter({ onBackToMain }: LeagueRouterProps) {
  const { currentLeague, getCurrentMatch, getTeamById, advanceToPlayoffs, completeSeries, finishSeason, deleteLeague } = useLeague();
  const [currentRoute, setCurrentRoute] = useState<LeagueRoute>(() => {
    // 초기 라우트 결정
    if (!currentLeague) return "select";
    if (currentLeague.seasonState === "finished") return "result";
    if (currentLeague.seasonState === "playoffs") return "playoffs";
    return "progress";
  });
  
  const [currentSeriesType, setCurrentSeriesType] = useState<Series["type"] | null>(null);
  const [currentSeriesGameIndex, setCurrentSeriesGameIndex] = useState(0);

  // 🔥 시즌이 종료되면 자동으로 결과 페이지로 이동
  React.useEffect(() => {
    if (currentLeague?.seasonState === "finished" && currentRoute !== "result") {
      setTimeout(() => {
        setCurrentRoute("result");
      }, 500);
    }
  }, [currentLeague?.seasonState, currentRoute]);

  // 리그 선택 → 진행 페이지
  const handleLeagueStart = () => {
    setCurrentRoute("progress");
  };

  // 경기 시작 (정규시즌 또는 플레이오프)
  const handleMatchStart = () => {
    if (!currentLeague) return;
    
    // 플레이오프 진행 중이면 플레이어의 다음 시리즈 찾기
    if (currentLeague.seasonState === "playoffs" && currentLeague.playoffBracket) {
      const bracket = currentLeague.playoffBracket;
      const playerTeamId = currentLeague.playerTeamId;
      
      // 각 시리즈를 순서대로 확인
      const seriesOrder: Array<Series["type"]> = ["wildcard", "semifinals", "playoffs", "finals"];
      
      for (const seriesType of seriesOrder) {
        const series = bracket[seriesType];
        
        // 플레이어가 참여하는 시리즈인지 확인
        const isPlayerInSeries = series.team1Id === playerTeamId || series.team2Id === playerTeamId;
        
        // 아직 완료되지 않았고 두 팀이 모두 정해진 시리즈
        if (isPlayerInSeries && !series.isCompleted && series.team1Id && series.team2Id) {
          handleSeriesStart(seriesType);
          return;
        }
      }
      
      // 플레이어가 참여할 시리즈가 없으면 플레이오프 페이지로
      setCurrentRoute("playoffs");
    } else {
      // 정규시즌
      setCurrentRoute("match");
    }
  };

  // 경기 완료
  const handleMatchComplete = () => {
    setCurrentRoute("progress");
  };

  // 순위표 보기
  const handleViewStandings = () => {
    setCurrentRoute("standings");
  };

  // 플레이오프 시작
  const handleStartPlayoffs = () => {
    advanceToPlayoffs();
    setCurrentRoute("playoffs");
  };

  // 시리즈 시작
  const handleSeriesStart = (seriesType: Series["type"]) => {
    if (!currentLeague || !currentLeague.playoffBracket) return;
    
    const series = currentLeague.playoffBracket[seriesType];
    const isPlayerInSeries = 
      series.team1Id === currentLeague.playerTeamId || 
      series.team2Id === currentLeague.playerTeamId;
    
    // 플레이어가 참여하지 않는 경기는 자동 시뮬레이션
    if (!isPlayerInSeries && series.team1Id && series.team2Id) {
      autoSimulateSeries(seriesType);
      return;
    }
    
    // 플레이어가 참여하는 경기만 실제 진행
    setCurrentSeriesType(seriesType);
    setCurrentSeriesGameIndex(0);
    setCurrentRoute("series");
  };
  
  // 자동 시리즈 시뮬레이션 (플레이어 불참 경기)
  const autoSimulateSeries = (seriesType: Series["type"]) => {
    if (!currentLeague || !currentLeague.playoffBracket) return;
    
    const series = currentLeague.playoffBracket[seriesType];
    if (!series.team1Id || !series.team2Id) return;
    
    const team1 = getTeamById(series.team1Id);
    const team2 = getTeamById(series.team2Id);
    if (!team1 || !team2) return;
    
    // 🔥 시너지 적용된 팀 OVR 기반 승률 계산
    
    const team1Synergies = calculateSynergies(team1.squad);
    const team1CardBonuses = calculateCardSynergyBonuses(team1.squad, team1Synergies);
    const team1SynergyBonus = Object.values(team1CardBonuses).reduce((sum, bonus: any) => sum + (bonus?.ovr || 0), 0);
    const team1OVR = team1.stats.totalOVR + team1SynergyBonus;
    
    const team2Synergies = calculateSynergies(team2.squad);
    const team2CardBonuses = calculateCardSynergyBonuses(team2.squad, team2Synergies);
    const team2SynergyBonus = Object.values(team2CardBonuses).reduce((sum, bonus: any) => sum + (bonus?.ovr || 0), 0);
    const team2OVR = team2.stats.totalOVR + team2SynergyBonus;
    
    const totalOVR = team1OVR + team2OVR;
    const team1WinProb = team1OVR / totalOVR;
    
    const winThreshold = Math.ceil(series.bestOf / 2);
    let team1Wins = 0;
    let team2Wins = 0;
    
    // 시리즈 시뮬레이션
    while (team1Wins < winThreshold && team2Wins < winThreshold) {
      if (Math.random() < team1WinProb) {
        team1Wins++;
      } else {
        team2Wins++;
      }
    }
    
    const winnerId = team1Wins >= winThreshold ? series.team1Id : series.team2Id;
    
    // 시리즈 완료 처리 (스코어 포함)
    completeSeries(seriesType, winnerId!, team1Wins, team2Wins);
    
    // 플레이오프 페이지로 복귀 (결과 표시)
    setCurrentRoute("playoffs");
  };

  // 시리즈 경기 완료
  const handleSeriesGameComplete = (winnerId: string) => {
    if (!currentLeague || !currentLeague.playoffBracket || !currentSeriesType) return;

    const series = currentLeague.playoffBracket[currentSeriesType];
    const winThreshold = Math.ceil(series.bestOf / 2);
    
    // 승수 업데이트
    let team1Wins = series.team1Wins;
    let team2Wins = series.team2Wins;
    
    if (winnerId === series.team1Id) {
      team1Wins++;
    } else {
      team2Wins++;
    }

    // 시리즈 승자 결정
    if (team1Wins >= winThreshold) {
      completeSeries(currentSeriesType, series.team1Id!, team1Wins, team2Wins);
      
      const isPlayerTeam1 = series.team1Id === currentLeague.playerTeamId;
      const isPlayerTeam2 = series.team2Id === currentLeague.playerTeamId;
      
      // 결승 완료
      if (currentSeriesType === "finals") {
        if (isPlayerTeam1) {
          finishSeason(true, "champion");
        } else if (isPlayerTeam2) {
          finishSeason(false, "runner-up");
        } else {
          finishSeason(false, "eliminated");
        }
        setCurrentRoute("result");
        return;
      }
      
      // 플레이어가 졌으면 탈락
      if (isPlayerTeam2) {
        finishSeason(false, currentSeriesType);
        setCurrentRoute("result");
        return;
      }
      
      // 플레이어가 이겼거나 불참 - 플레이오프 계속
      setCurrentRoute("playoffs");
    } else if (team2Wins >= winThreshold) {
      completeSeries(currentSeriesType, series.team2Id!, team1Wins, team2Wins);
      
      const isPlayerTeam1 = series.team1Id === currentLeague.playerTeamId;
      const isPlayerTeam2 = series.team2Id === currentLeague.playerTeamId;
      
      // 결승 완료
      if (currentSeriesType === "finals") {
        if (isPlayerTeam2) {
          finishSeason(true, "champion");
        } else if (isPlayerTeam1) {
          finishSeason(false, "runner-up");
        } else {
          finishSeason(false, "eliminated");
        }
        setCurrentRoute("result");
        return;
      }
      
      // 플레이어가 졌으면 탈락
      if (isPlayerTeam1) {
        finishSeason(false, currentSeriesType);
        setCurrentRoute("result");
        return;
      }
      
      // 플레이어가 이겼거나 불참 - 플레이오프 계속
      setCurrentRoute("playoffs");
    } else {
      // 시리즈 계속
      setCurrentSeriesGameIndex(prev => prev + 1);
      setCurrentRoute("series");
    }
  };

  // 결과 페이지에서 새 시즌
  const handleNewSeason = () => {
    setCurrentRoute("select");
  };

  // 진행 페이지로 복귀
  const handleBackToProgress = () => {
    setCurrentRoute("progress");
  };

  // 플레이오프로 복귀
  const handleBackToPlayoffs = () => {
    setCurrentRoute("playoffs");
  };

  // 시즌 종료 페이지로
  const handleViewResult = () => {
    finishSeason(false);
    setCurrentRoute("result");
  };

  // 리그 포기
  const handleAbandonLeague = () => {
    deleteLeague();
    setCurrentRoute("select");
  };

  // 플레이오프 모두 완료 시
  const handleAllPlayoffsComplete = () => {
    if (!currentLeague || !currentLeague.playoffBracket) return;
    
    const bracket = currentLeague.playoffBracket;
    const playerTeamId = currentLeague.playerTeamId;
    
    // 결승 승자 확인
    const finalsWinnerId = bracket.finals.winnerId;
    
    if (finalsWinnerId === playerTeamId) {
      // 플레이어 우승
      finishSeason(true, "champion");
    } else if (bracket.finals.team1Id === playerTeamId || bracket.finals.team2Id === playerTeamId) {
      // 플레이어 준우승
      finishSeason(false, "runner-up");
    } else if (bracket.playoffs.team1Id === playerTeamId || bracket.playoffs.team2Id === playerTeamId) {
      // 플레이오프 진출
      finishSeason(false, "playoffs");
    } else if (bracket.semifinals.team1Id === playerTeamId || bracket.semifinals.team2Id === playerTeamId) {
      // 준플레이오프 진출
      finishSeason(false, "semifinals");
    } else {
      // 와일드카드 탈락
      finishSeason(false, "wildcard");
    }
    
    setCurrentRoute("result");
  };

  // 라우트별 렌더링
  switch (currentRoute) {
    case "select":
      return (
        <LeagueSelectPage
          onBack={onBackToMain}
          onLeagueStart={handleLeagueStart}
        />
      );

    case "progress":
      return (
        <LeagueProgressPage
          onBack={onBackToMain}
          onMatchStart={handleMatchStart}
          onViewStandings={handleViewStandings}
          onStartPlayoffs={handleStartPlayoffs}
          onViewResult={handleViewResult}
          onAbandonLeague={handleAbandonLeague}
        />
      );

    case "match": {
      const match = getCurrentMatch();
      if (!match) {
        setCurrentRoute("progress");
        return null;
      }
      const homeTeam = getTeamById(match.homeTeamId);
      const awayTeam = getTeamById(match.awayTeamId);
      if (!homeTeam || !awayTeam) {
        setCurrentRoute("progress");
        return null;
      }
      // 정규리그는 BO3
      const seriesType: SeriesType = "BO3";
      return (
        <AdvancedMatchPage
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          seriesType={seriesType}
          onMatchComplete={handleMatchComplete}
          onBack={handleBackToProgress}
        />
      );
    }

    case "standings":
      return (
        <StandingsPage onBack={handleBackToProgress} />
      );

    case "playoffs":
      return (
        <PlayoffsPage
          onBack={handleBackToProgress}
          onSeriesStart={handleSeriesStart}
          onAllComplete={handleAllPlayoffsComplete}
        />
      );

    case "series": {
      if (!currentLeague || !currentLeague.playoffBracket || !currentSeriesType) {
        setCurrentRoute("playoffs");
        return null;
      }
      const series = currentLeague.playoffBracket[currentSeriesType];
      const homeTeam = getTeamById(series.team1Id!);
      const awayTeam = getTeamById(series.team2Id!);
      if (!homeTeam || !awayTeam) {
        setCurrentRoute("playoffs");
        return null;
      }
      // 플레이오프는 BO5
      const advancedSeriesType: SeriesType = "BO5";
      return (
        <AdvancedMatchPage
          homeTeam={homeTeam}
          awayTeam={awayTeam}
          seriesType={advancedSeriesType}
          playoffSeriesType={currentSeriesType}
          onMatchComplete={handleMatchComplete}
          onBack={handleBackToPlayoffs}
        />
      );
    }

    case "result":
      return (
        <SeasonResultPage
          onBackToMain={onBackToMain}
          onNewSeason={handleNewSeason}
        />
      );

    default:
      return null;
  }
}
