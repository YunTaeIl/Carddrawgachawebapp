// 고급 경기 시뮬레이션 페이지 - BO3/BO5 지원

import React, { useState, useEffect } from "react";
import { Button } from "@/app/components/ui/button";
import { useLeague } from "@/contexts/LeagueContext";
import { Team } from "@/types/league";
import {
  MatchSeries,
  SeriesType,
  CoachPlan,
  PostGameFeedback
} from "@/types/advancedSimulation";
import { createMatchSeries } from "@/utils/simulationEngine";
import { X } from "lucide-react";
import { getKoreanTeamName } from "@/utils/teamNames";
import { PreGamePlanningPhase } from "./match/PreGamePlanningPhase";
import { InGameSimulationPhase } from "./match/InGameSimulationPhase";
import { PostGameFeedbackPhase } from "./match/PostGameFeedbackPhase";
import { SeriesFinishedPhase } from "./match/SeriesFinishedPhase";

interface AdvancedMatchPageProps {
  homeTeam: Team;
  awayTeam: Team;
  seriesType: SeriesType;
  onMatchComplete: () => void;
  onBack: () => void;
}

export function AdvancedMatchPage({
  homeTeam,
  awayTeam,
  seriesType,
  onMatchComplete,
  onBack
}: AdvancedMatchPageProps) {
  const { completeMatch } = useLeague();
  
  // 시리즈 상태
  const [series, setSeries] = useState<MatchSeries>(() =>
    createMatchSeries(
      `${homeTeam.id}-vs-${awayTeam.id}-${Date.now()}`,
      seriesType,
      homeTeam,
      awayTeam
    )
  );

  // 현재 단계 렌더링
  const renderCurrentPhase = () => {
    switch (series.state) {
      case "PRE_GAME":
        return (
          <PreGamePlanningPhase
            series={series}
            onPlanSelected={(homePlan, awayPlan) => {
              // 다음 단계로 이동 (InGame 컴포넌트에서 처리)
            }}
            setSeries={setSeries}
          />
        );
      
      case "IN_GAME":
        return (
          <InGameSimulationPhase
            series={series}
            setSeries={setSeries}
          />
        );
      
      case "POST_GAME":
        return (
          <PostGameFeedbackPhase
            series={series}
            setSeries={setSeries}
          />
        );
      
      case "FINISHED":
        return (
          <SeriesFinishedPhase
            series={series}
            onComplete={() => {
              // 시리즈 결과를 MatchResult로 변환
              const homeWins = series.setWinsHome;
              const awayWins = series.setWinsAway;
              const winnerId = homeWins > awayWins ? homeTeam.id : awayTeam.id;
              
              // 모든 세트의 통계 합산
              const totalKills = series.sets.reduce((acc, set) => ({
                home: acc.home + (set.finalState.objectives.kills.home || 0),
                away: acc.away + (set.finalState.objectives.kills.away || 0)
              }), { home: 0, away: 0 });
              
              const totalTowers = series.sets.reduce((acc, set) => ({
                home: acc.home + (set.finalState.objectives.towers.home || 0),
                away: acc.away + (set.finalState.objectives.towers.away || 0)
              }), { home: 0, away: 0 });
              
              const totalDragons = series.sets.reduce((acc, set) => ({
                home: acc.home + (set.finalState.objectives.dragons.home || 0),
                away: acc.away + (set.finalState.objectives.dragons.away || 0)
              }), { home: 0, away: 0 });
              
              const totalBarons = series.sets.reduce((acc, set) => ({
                home: acc.home + (set.finalState.objectives.barons.home || 0),
                away: acc.away + (set.finalState.objectives.barons.away || 0)
              }), { home: 0, away: 0 });
              
              const matchResult = {
                homeTeamId: homeTeam.id,
                awayTeamId: awayTeam.id,
                homeScore: homeWins,
                awayScore: awayWins,
                winnerId,
                scoreDiff: Math.abs(homeWins - awayWins),
                kills: totalKills,
                towers: totalTowers,
                dragons: totalDragons,
                barons: totalBarons
              };
              
              // 리그 컨텍스트에 경기 완료 알림
              completeMatch(matchResult);
              
              // 화면 전환
              onMatchComplete();
            }}
          />
        );
      
      default:
        return <div>알 수 없는 상태</div>;
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-hidden">
      {/* 상단 헤더 */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-black/80 to-transparent z-10 flex items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white/70 hover:text-white"
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="text-white font-bold text-lg">
            {getKoreanTeamName(homeTeam.name)} vs {getKoreanTeamName(awayTeam.name)}
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {/* 시리즈 스코어 */}
          <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg border border-white/10">
            <span className="text-blue-400 font-bold text-xl">{series.setWinsHome}</span>
            <span className="text-white/50 text-sm">{seriesType}</span>
            <span className="text-red-400 font-bold text-xl">{series.setWinsAway}</span>
          </div>
          
          {/* 현재 세트 */}
          <div className="text-white/70 text-sm">
            세트 {series.currentSetIndex + 1}
          </div>
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="w-full h-full pt-16">
        {renderCurrentPhase()}
      </div>
    </div>
  );
}
