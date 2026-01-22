// 경기 전 감독 플랜 선택 화면

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import {
  MatchSeries,
  CoachPlan,
  GamePlanType,
  PriorityLink
} from "@/types/advancedSimulation";
import { startNewSet } from "@/utils/simulationEngine";
import { getKoreanTeamName } from "@/utils/teamNames";
import { Target, TrendingUp, Swords, Clock, Route } from "lucide-react";

interface PreGamePlanningPhaseProps {
  series: MatchSeries;
  onPlanSelected: (homePlan: CoachPlan, awayPlan: CoachPlan) => void;
  setSeries: (series: MatchSeries) => void;
}

const GAME_PLAN_INFO: Record<GamePlanType, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  color: string;
}> = {
  EARLY: {
    icon: TrendingUp,
    label: "초반 집중",
    desc: "라인전과 초반 갱킹에 집중",
    color: "emerald"
  },
  OBJECTIVE: {
    icon: Target,
    label: "오브젝트 중심",
    desc: "용/전령/바론 우선 확보",
    color: "blue"
  },
  FIGHT: {
    icon: Swords,
    label: "한타 중심",
    desc: "한타 승리로 게임 운영",
    color: "red"
  },
  SCALING: {
    icon: Clock,
    label: "후반 운영",
    desc: "안정적인 파밍과 성장",
    color: "purple"
  },
  SIDE: {
    icon: Route,
    label: "사이드 운영",
    desc: "스플릿과 타워 철거",
    color: "amber"
  }
};

const PRIORITY_LINK_INFO: Record<PriorityLink, { label: string; desc: string }> = {
  TOP_JGL: { label: "탑-정글 연계", desc: "상단 중심 운영" },
  MID_JGL: { label: "미드-정글 연계", desc: "중앙 중심 운영" },
  BOT_SUP: { label: "원딜-서폿 연계", desc: "하단 중심 운영" }
};

export function PreGamePlanningPhase({
  series,
  setSeries
}: PreGamePlanningPhaseProps) {
  // 플레이어 팀 플랜 (플레이어가 홈팀이라고 가정)
  const [selectedPlans, setSelectedPlans] = useState<GamePlanType[]>([]);
  const [riskLevel, setRiskLevel] = useState<number>(50);
  const [priorityLink, setPriorityLink] = useState<PriorityLink>("MID_JGL");

  const handleStartGame = () => {
    // AI 팀 플랜 랜덤 생성
    const aiPlans: GamePlanType[] = [];
    const allPlans: GamePlanType[] = ["EARLY", "OBJECTIVE", "FIGHT", "SCALING", "SIDE"];
    aiPlans.push(allPlans[Math.floor(Math.random() * allPlans.length)]);
    if (Math.random() > 0.5) {
      const second = allPlans.filter(p => p !== aiPlans[0]);
      aiPlans.push(second[Math.floor(Math.random() * second.length)]);
    }

    const aiRisk = 30 + Math.random() * 40; // 30~70
    const aiLinks: PriorityLink[] = ["TOP_JGL", "MID_JGL", "BOT_SUP"];
    const aiLink = aiLinks[Math.floor(Math.random() * aiLinks.length)];

    const playerPlan: CoachPlan = {
      gamePlan: selectedPlans,
      riskLevel,
      priorityLink
    };

    const aiPlan: CoachPlan = {
      gamePlan: aiPlans,
      riskLevel: aiRisk,
      priorityLink: aiLink
    };

    // 플레이어가 홈팀인지 확인하고 올바르게 할당
    const homePlan = series.homeTeam.isPlayer ? playerPlan : aiPlan;
    const awayPlan = series.homeTeam.isPlayer ? aiPlan : playerPlan;

    // 시리즈에 새 세트 시작
    const newSeries = startNewSet(series, homePlan, awayPlan);
    setSeries(newSeries);
  };

  const togglePlan = (plan: GamePlanType) => {
    if (selectedPlans.includes(plan)) {
      setSelectedPlans(selectedPlans.filter(p => p !== plan));
    } else {
      if (selectedPlans.length < 2) {
        setSelectedPlans([...selectedPlans, plan]);
      }
    }
  };

  const canStart = selectedPlans.length >= 1;

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-4xl w-full bg-slate-900/90 rounded-2xl p-8 border border-white/10">
        {/* 타이틀 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold font-display mb-2">
            세트 {series.currentSetIndex + 1} - 감독 전략 설정
          </h2>
          <p className="text-slate-400">
            경기 운영 방향을 설정하세요 (최대 2개 선택)
          </p>
        </div>

        {/* 게임 플랜 선택 */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-white/90">게임 플랜</h3>
          <div className="grid grid-cols-5 gap-3">
            {(Object.keys(GAME_PLAN_INFO) as GamePlanType[]).map(plan => {
              const info = GAME_PLAN_INFO[plan];
              const Icon = info.icon;
              const selected = selectedPlans.includes(plan);
              
              // 색상 클래스 매핑
              const colorClasses = {
                emerald: selected ? 'bg-emerald-500/20 border-emerald-500' : '',
                blue: selected ? 'bg-blue-500/20 border-blue-500' : '',
                red: selected ? 'bg-red-500/20 border-red-500' : '',
                purple: selected ? 'bg-purple-500/20 border-purple-500' : '',
                amber: selected ? 'bg-amber-500/20 border-amber-500' : ''
              };
              
              const iconColorClasses = {
                emerald: selected ? 'text-emerald-400' : 'text-slate-500',
                blue: selected ? 'text-blue-400' : 'text-slate-500',
                red: selected ? 'text-red-400' : 'text-slate-500',
                purple: selected ? 'text-purple-400' : 'text-slate-500',
                amber: selected ? 'text-amber-400' : 'text-slate-500'
              };
              
              return (
                <button
                  key={plan}
                  onClick={() => togglePlan(plan)}
                  disabled={!selected && selectedPlans.length >= 2}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${selected 
                      ? colorClasses[info.color as keyof typeof colorClasses]
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                    ${!selected && selectedPlans.length >= 2 ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  <Icon className={`w-8 h-8 mx-auto mb-2 ${iconColorClasses[info.color as keyof typeof iconColorClasses]}`} />
                  <div className="text-sm font-bold mb-1">{info.label}</div>
                  <div className="text-xs text-slate-500">{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 리스크 레벨 */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-white/90 flex items-center justify-between">
            <span>리스크 레벨</span>
            <span className={`text-2xl ${riskLevel > 70 ? 'text-red-400' : riskLevel < 30 ? 'text-blue-400' : 'text-yellow-400'}`}>
              {riskLevel}
            </span>
          </h3>
          <div className="flex items-center gap-4">
            <span className="text-sm text-blue-400">안정</span>
            <input
              type="range"
              min="0"
              max="100"
              value={riskLevel}
              onChange={(e) => setRiskLevel(Number(e.target.value))}
              className="flex-1 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-sm text-red-400">공격</span>
          </div>
        </div>

        {/* 우선 연계 */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-white/90">우선 연계</h3>
          <div className="grid grid-cols-3 gap-3">
            {(Object.keys(PRIORITY_LINK_INFO) as PriorityLink[]).map(link => {
              const info = PRIORITY_LINK_INFO[link];
              const selected = priorityLink === link;
              
              return (
                <button
                  key={link}
                  onClick={() => setPriorityLink(link)}
                  className={`
                    p-4 rounded-xl border-2 transition-all
                    ${selected 
                      ? 'bg-cyan-500/20 border-cyan-500' 
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="text-sm font-bold mb-1">{info.label}</div>
                  <div className="text-xs text-slate-500">{info.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 시작 버튼 */}
        <Button
          onClick={handleStartGame}
          disabled={!canStart}
          className="w-full py-6 text-lg font-bold"
        >
          경기 시작
        </Button>

        {!canStart && (
          <p className="text-center text-red-400 text-sm mt-2">
            최소 1개의 게임 플랜을 선택해주세요
          </p>
        )}
      </div>
    </div>
  );
}
