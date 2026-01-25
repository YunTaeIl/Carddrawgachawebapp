import React from "react";
import { ArrowLeft, Trophy, Code2, Rocket } from "lucide-react";

interface LeagueProgressPageProps {
  onBack: () => void;
  isAdmin: boolean;
}

export function LeagueProgressPage({ onBack, isAdmin }: LeagueProgressPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0B0F1A] via-[#141B3D] to-[#0B0F1A] text-white">
      {/* 헤더 */}
      <div className="sticky top-0 z-10 bg-[#0A0E27]/80 backdrop-blur-md border-b border-[#0047AB]/30">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-[#1A2347] rounded-lg transition-colors"
          >
            <ArrowLeft size={24} className="text-[#8B95B5]" />
          </button>
          <div className="flex items-center gap-3">
            <Trophy size={28} className="text-[#FFB81C]" />
            <div>
              <h1 className="text-xl font-display text-white">리그진행</h1>
              <p className="text-xs text-[#8B95B5]">League Management System</p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 환영 배너 */}
        <div className="mb-8 bg-gradient-to-r from-[#FFB81C]/20 to-[#C8102E]/20 border-2 border-[#FFB81C]/50 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-[#FFB81C]/30 flex items-center justify-center flex-shrink-0">
              <Trophy size={32} className="text-[#FFB81C]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-display text-white mb-2 flex items-center gap-2">
                🏆 리그 시스템에 오신 것을 환영합니다!
                <Rocket size={24} className="text-[#FFB81C]" />
              </h2>
              <p className="text-[#9AA6C3] mb-4">
                LCK 선수 카드로 팀을 구성하고, 리그에 도전하세요! 상금과 보상이 기다립니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[#8B95B5]">
                  <span className="w-2 h-2 rounded-full bg-[#FFB81C]"></span>
                  Bronze부터 Challenger까지 다양한 리그
                </div>
                <div className="flex items-center gap-2 text-[#8B95B5]">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  실시간 경기 시뮬레이션 & 플레이오프
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 주요 기능 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 리그 시뮬레이션 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-[#FFB81C]" />
              리그 시뮬레이션
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">주요 기능:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>스쿼드 기반 경기 시뮬레이션</li>
                  <li>선수 스탯 & 76개 시너지 계산</li>
                  <li>정규시즌 18라운드 일정</li>
                  <li>실시간 순위표 & 전적 기록</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 매치 엔진 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Rocket size={20} className="text-[#C8102E]" />
              고급 매치 엔진
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">구현 완료:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>25개 이벤트 타입 실시간 생성</li>
                  <li>감독 플랜 & 콜 시스템 (8종)</li>
                  <li>골드 차이 그래프 & 타임라인</li>
                  <li>BO3/BO5 시리즈 & 플레이오프</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 리그 관리 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-[#2B6CFF]" />
              리그 관리
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">향후 구현:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>시즌 생성 & 관리</li>
                  <li>플레이오프 시스템</li>
                  <li>시상식 & 통계</li>
                  <li>역대 챔피언 기록</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 테스트 & 디버그 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Code2 size={20} className="text-[#FFB81C]" />
              테스트 & 디버그
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">개발 도구:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>시뮬레이션 테스트 모드</li>
                  <li>밸런스 조정 툴</li>
                  <li>로그 뷰어</li>
                  <li>성능 모니터링</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 안내 */}
        <div className="mt-8 bg-[#0A0E27]/50 border border-[#0047AB]/20 rounded-xl p-6 text-center">
          <p className="text-sm text-[#8B95B5]">
            💡 이 영역에 실제 개발 중인 기능을 추가하세요.<br />
            일반 유저는 접근할 수 없으며, Admin만 테스트할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}