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
              <p className="text-xs text-[#8B95B5]">Admin Development Area</p>
            </div>
          </div>
          <div className="ml-auto px-3 py-1 bg-[#C8102E]/20 border border-[#C8102E]/50 rounded-full">
            <span className="text-xs text-[#C8102E] font-medium">🔑 관리자 전용</span>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 개발중 배너 */}
        <div className="mb-8 bg-gradient-to-r from-[#FFB81C]/20 to-[#C8102E]/20 border-2 border-[#FFB81C]/50 rounded-2xl p-8">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-full bg-[#FFB81C]/30 flex items-center justify-center flex-shrink-0">
              <Code2 size={32} className="text-[#FFB81C]" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-display text-white mb-2 flex items-center gap-2">
                🚧 Admin 개발 영역
                <Rocket size={24} className="text-[#FFB81C]" />
              </h2>
              <p className="text-[#9AA6C3] mb-4">
                이 페이지는 실서버에 배포된 상태에서 개발을 진행하기 위한 Admin 전용 공간입니다.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-[#8B95B5]">
                  <span className="w-2 h-2 rounded-full bg-[#FFB81C]"></span>
                  일반 유저에게는 "개발중" 다이얼로그 표시
                </div>
                <div className="flex items-center gap-2 text-[#8B95B5]">
                  <span className="w-2 h-2 rounded-full bg-[#C8102E]"></span>
                  Admin만 개발중인 기능에 접근 가능
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 개발 영역 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 리그 시뮬레이션 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-[#FFB81C]" />
              리그 시뮬레이션
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">계획된 기능:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>스쿼드 기반 경기 시뮬레이션</li>
                  <li>선수 스탯 & 시너지 계산</li>
                  <li>리그 일정 관리</li>
                  <li>순위표 & 전적 기록</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 매치 엔진 */}
          <div className="bg-[#141B3D]/50 border border-[#0047AB]/30 rounded-xl p-6">
            <h3 className="text-lg font-display text-white mb-4 flex items-center gap-2">
              <Rocket size={20} className="text-[#C8102E]" />
              매치 엔진
            </h3>
            <div className="space-y-3">
              <div className="bg-[#0B0F1A]/50 rounded-lg p-4 border border-[#0047AB]/20">
                <p className="text-sm text-[#8B95B5] mb-2">개발 예정:</p>
                <ul className="text-sm text-[#9AA6C3] space-y-1 list-disc list-inside">
                  <li>실시간 경기 결과 생성</li>
                  <li>이벤트 로그 시스템</li>
                  <li>MVP & 주요 플레이어 분석</li>
                  <li>경기 하이라이트</li>
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