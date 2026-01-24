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
  const { currentLeague, getCurrentMatch, getTeamById, advanceToPlayoffs, completeSeries, finishSeason } = useLeague();
  const [currentRoute, setCurrentRoute] = useState<LeagueRoute>(() => {
    // 초기 라우트 결정
    if (!currentLeague) return "select";
    if (currentLeague.seasonState === "finished") return "result";
    if (currentLeague.seasonState === "playoffs") return "playoffs";
    return "progress";
  });
  
  const [currentSeriesType, setCurrentSeriesType] = useState<Series["type"] | null>(null);
  const [currentSeriesGameIndex, setCurrentSeriesGameIndex] = useState(0);

  // 리그 선택 → 진행 페이지
  const handleLeagueStart = () => {
    setCurrentRoute("progress");
  };

  // 경기 시작
  const handleMatchStart = () => {
    setCurrentRoute("match");
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
      console.log(`[PLAYOFF] Auto-simulating series: ${seriesType}`);
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
    
    // 팀 OVR 기반 승률 계산
    const team1OVR = team1.stats.totalOVR;
    const team2OVR = team2.stats.totalOVR;
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
    
    console.log(`[PLAYOFF] Auto-sim result: ${team1.name} ${team1Wins} - ${team2Wins} ${team2.name}`);
    
    // 시리즈 완료 처리
    completeSeries(seriesType, winnerId!);
    
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
      completeSeries(currentSeriesType, series.team1Id!);
      
      // 플레이어가 졌으면 탈락
      if (series.team2Id === currentLeague.playerTeamId) {
        finishSeason(false);
        setCurrentRoute("result");
        return;
      }
      
      // 결승 우승이면 우승 처리
      if (currentSeriesType === "finals") {
        finishSeason(true);
        setCurrentRoute("result");
        return;
      }
      
      setCurrentRoute("playoffs");
    } else if (team2Wins >= winThreshold) {
      completeSeries(currentSeriesType, series.team2Id!);
      
      // 플레이어가 졌으면 탈락
      if (series.team1Id === currentLeague.playerTeamId) {
        finishSeason(false);
        setCurrentRoute("result");
        return;
      }
      
      // 결승 우승이면 우승 처리
      if (currentSeriesType === "finals") {
        finishSeason(true);
        setCurrentRoute("result");
        return;
      }
      
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
