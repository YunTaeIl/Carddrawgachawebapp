// 세트 후 피드백 선택 화면

import React, { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { MatchSeries, PostGameFeedback } from "@/types/advancedSimulation";
import { applyPostGameFeedback } from "@/utils/simulationEngine";
import { getKoreanTeamName } from "@/utils/teamNames";
import { MapPin, Heart, Crosshair, Users } from "lucide-react";

interface PostGameFeedbackPhaseProps {
  series: MatchSeries;
  setSeries: (series: MatchSeries) => void;
}

const FEEDBACK_INFO: Record<PostGameFeedback, {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  desc: string;
  effect: string;
  color: string;
}> = {
  REVIEW_MACRO: {
    icon: MapPin,
    label: "매크로 리뷰",
    desc: "오브젝트 판단과 운영 개선",
    effect: "오브젝트 성향 +2, 자신감 +1",
    color: "blue"
  },
  MENTAL_CARE: {
    icon: Heart,
    label: "멘탈 케어",
    desc: "선수들의 심리 안정",
    effect: "클러치 +5, 자신감 +8, 피로 -15",
    color: "pink"
  },
  LANE_FOCUS: {
    icon: Crosshair,
    label: "라인전 집중",
    desc: "개인 기량 강화 훈련",
    effect: "라인전 능력 향상, 자신감 +2",
    color: "green"
  },
  TEAMFIGHT_REVIEW: {
    icon: Users,
    label: "한타 리뷰",
    desc: "팀파이트 개선 분석",
    effect: "한타 성향 +3, 자신감 +1",
    color: "purple"
  }
};

export function PostGameFeedbackPhase({
  series,
  setSeries
}: PostGameFeedbackPhaseProps) {
  const [homeFeedback, setHomeFeedback] = useState<PostGameFeedback>("MENTAL_CARE");
  const [awayFeedback, setAwayFeedback] = useState<PostGameFeedback>("MENTAL_CARE");

  const lastSet = series.sets[series.sets.length - 1];
  const homeWon = lastSet.winnerId === series.homeTeam.id;

  const handleContinue = () => {
    // AI 팀 피드백 랜덤 선택
    const feedbacks: PostGameFeedback[] = ["REVIEW_MACRO", "MENTAL_CARE", "LANE_FOCUS", "TEAMFIGHT_REVIEW"];
    const randomAwayFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

    const newSeries = applyPostGameFeedback(series, homeFeedback, randomAwayFeedback);
    setSeries(newSeries);
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-8">
      <div className="max-w-3xl w-full bg-slate-900/90 rounded-2xl p-8 border border-white/10">
        {/* 세트 결과 */}
        <div className="text-center mb-8">
          <div className={`text-6xl mb-4`}>
            {homeWon ? "🏆" : "😔"}
          </div>
          <h2 className="text-3xl font-bold font-display mb-2">
            세트 {lastSet.setNumber} - {homeWon ? "승리" : "패배"}
          </h2>
          <p className="text-slate-400">
            {getKoreanTeamName(homeWon ? series.homeTeam.name : series.awayTeam.name)}이 승리했습니다
          </p>
          <div className="mt-4 text-sm text-slate-500">
            경기 시간: {Math.floor(lastSet.duration / 60)}분 {lastSet.duration % 60}초
          </div>
        </div>

        {/* 현재 스코어 */}
        <div className="flex items-center justify-center gap-8 mb-8 p-6 bg-black/30 rounded-xl">
          <div className="text-center">
            <div className="text-sm text-blue-400 mb-1">{getKoreanTeamName(series.homeTeam.name)}</div>
            <div className="text-5xl font-bold">{series.setWinsHome}</div>
          </div>
          <div className="text-3xl text-slate-600">:</div>
          <div className="text-center">
            <div className="text-sm text-red-400 mb-1">{getKoreanTeamName(series.awayTeam.name)}</div>
            <div className="text-5xl font-bold">{series.setWinsAway}</div>
          </div>
        </div>

        {/* 피드백 선택 */}
        <div className="mb-8">
          <h3 className="text-lg font-bold mb-4 text-white/90">다음 세트 준비</h3>
          <p className="text-sm text-slate-400 mb-4">
            팀에게 어떤 피드백을 줄까요? (다음 세트에 영향을 줍니다)
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            {(Object.keys(FEEDBACK_INFO) as PostGameFeedback[]).map(feedback => {
              const info = FEEDBACK_INFO[feedback];
              const Icon = info.icon;
              const selected = homeFeedback === feedback;
              
              // 색상 클래스 매핑
              const colorClasses = {
                blue: selected ? 'bg-blue-500/20 border-blue-500' : '',
                pink: selected ? 'bg-pink-500/20 border-pink-500' : '',
                green: selected ? 'bg-green-500/20 border-green-500' : '',
                purple: selected ? 'bg-purple-500/20 border-purple-500' : ''
              };
              
              const iconColorClasses = {
                blue: selected ? 'text-blue-400' : 'text-slate-500',
                pink: selected ? 'text-pink-400' : 'text-slate-500',
                green: selected ? 'text-green-400' : 'text-slate-500',
                purple: selected ? 'text-purple-400' : 'text-slate-500'
              };
              
              return (
                <button
                  key={feedback}
                  onClick={() => setHomeFeedback(feedback)}
                  className={`
                    p-4 rounded-xl border-2 transition-all text-left
                    ${selected 
                      ? colorClasses[info.color as keyof typeof colorClasses]
                      : 'bg-slate-800/50 border-slate-700 hover:border-slate-600'
                    }
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Icon className={`w-6 h-6 mt-1 ${iconColorClasses[info.color as keyof typeof iconColorClasses]}`} />
                    <div className="flex-1">
                      <div className="text-sm font-bold mb-1">{info.label}</div>
                      <div className="text-xs text-slate-400 mb-2">{info.desc}</div>
                      <div className="text-xs text-slate-500">{info.effect}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <Button
          onClick={handleContinue}
          className="w-full py-6 text-lg font-bold"
        >
          다음 세트 준비
        </Button>
      </div>
    </div>
  );
}
