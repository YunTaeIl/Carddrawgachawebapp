// 이용약관 및 면책조항

import React from "react";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Info, AlertCircle } from "lucide-react";

interface LCKTermsProps {
  onBack: () => void;
}

export function LCKTerms({ onBack }: LCKTermsProps) {
  return (
    <div className="min-h-screen bg-[#0B0F1A] text-[#EAF0FF] p-6">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onBack}
            className="text-[#EAF0FF] hover:text-[#2B6CFF]"
          >
            <ArrowLeft className="w-6 h-6" />
          </Button>
          <h1 className="text-3xl font-bold">이용약관 및 면책조항</h1>
        </div>

        {/* 내용 */}
        <div className="bg-[#12182A] rounded-xl p-8 border border-[#2B6CFF]/30 space-y-8">
          {/* 소개 */}
          <section>
            <div className="flex items-center gap-2 mb-4">
              <Info className="w-5 h-5 text-[#FFB81C]" />
              <h2 className="text-xl font-bold text-[#FFB81C]">서비스 소개</h2>
            </div>
            <p className="text-[#9AA6C3] leading-relaxed">
              본 웹사이트는 <strong className="text-white">LCK(LoL Champions Korea) 팬들을 위한 비공식 팬 프로젝트</strong>로,
              선수 카드 수집 및 스쿼드 구성을 시뮬레이션할 수 있는 가상의 가챠 시스템을 제공합니다.
            </p>
          </section>

          {/* 저작권 */}
          <section>
            <h2 className="text-xl font-bold text-[#FFB81C] mb-4">저작권 및 이미지 출처</h2>
            <div className="space-y-3 text-[#9AA6C3]">
              <p>
                • 본 사이트에서 사용된 <strong className="text-white">선수 이미지 및 팀 로고</strong>는
                <a href="https://lol.fandom.com" target="_blank" rel="noopener noreferrer" className="text-[#0047AB] hover:underline ml-1">
                  Leaguepedia (lol.fandom.com)
                </a>에서 수집되었습니다.
              </p>
              <p>
                • 모든 이미지 및 브랜드 자산의 <strong className="text-white">저작권은 원 소유자에게 있으며</strong>,
                본 사이트는 해당 자산에 대한 권리를 주장하지 않습니다.
              </p>
              <p>
                • LCK, 팀 로고, 선수 이미지 등 모든 지적 재산은 <strong className="text-white">Riot Games, LCK 및 각 팀</strong>에 귀속됩니다.
              </p>
            </div>
          </section>

          {/* 비영리 */}
          <section>
            <h2 className="text-xl font-bold text-[#FFB81C] mb-4">비영리 목적</h2>
            <div className="space-y-3 text-[#9AA6C3]">
              <p>
                • 본 웹사이트는 <strong className="text-white">순수 팬 프로젝트</strong>로, 어떠한 영리 목적도 취하지 않습니다.
              </p>
              <p>
                • 사이트 내 <strong className="text-white">가상 화폐(RP), 샤드 등은 실제 금전적 가치가 없으며</strong>,
                현금 거래나 환전이 불가능합니다.
              </p>
              <p>
                • 본 서비스는 <strong className="text-white">무료로 제공</strong>되며, 어떠한 형태의 과금도 존재하지 않습니다.
              </p>
            </div>
          </section>

          {/* 데이터 */}
          <section>
            <h2 className="text-xl font-bold text-[#FFB81C] mb-4">데이터 및 개인정보</h2>
            <div className="space-y-3 text-[#9AA6C3]">
              <p>
                • 사용자의 게임 데이터는 <strong className="text-white">브라우저의 로컬 스토리지에 저장</strong>되며,
                서버로 전송되지 않습니다.
              </p>
              <p>
                • 선수 카드 데이터는 <strong className="text-white">공개 데이터베이스(Supabase)</strong>에서 불러오며,
                개인 식별 정보는 포함되지 않습니다.
              </p>
            </div>
          </section>

          {/* ⚠️ 비로그인 경고 (추가) */}
          <section className="bg-[#E4002B]/10 border-2 border-[#E4002B]/50 rounded-lg p-6">
            <div className="flex items-start gap-3 mb-4">
              <AlertCircle className="w-6 h-6 text-[#E4002B] flex-shrink-0 mt-1" />
              <div>
                <h2 className="text-xl font-bold text-[#E4002B] mb-2">⚠️ 비로그인 사용자 주의사항</h2>
                <div className="space-y-3 text-[#E4002B] text-sm">
                  <p>
                    <strong className="text-white">로그인하지 않은 상태</strong>에서 게임을 플레이할 경우,
                    수집한 카드와 모든 게임 데이터가 <strong className="text-white">브라우저 로컬 스토리지에만 저장</strong>됩니다.
                  </p>
                  <p>
                    다음과 같은 경우 <strong className="text-white">모든 데이터가 영구적으로 삭제</strong>됩니다:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>브라우저 쿠키 및 사이트 데이터 삭제</li>
                    <li>브라우저 캐시 비우기</li>
                    <li>시크릿/프라이빗 모드 사용</li>
                    <li>다른 브라우저나 기기에서 접속</li>
                    <li>브라우저 재설치 또는 OS 초기화</li>
                  </ul>
                  <p className="font-bold mt-4">
                    💡 <strong className="text-white">로그인</strong>하여 데이터를 안전하게 보관하세요!
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* 면책조항 */}
          <section>
            <h2 className="text-xl font-bold text-[#FFB81C] mb-4">면책조항</h2>
            <div className="space-y-3 text-[#9AA6C3]">
              <p>
                • 본 사이트는 <strong className="text-white">Riot Games, LCK 또는 어떠한 공식 조직과도 제휴 관계가 없습니다</strong>.
              </p>
              <p>
                • 선수 능력치 및 등급은 <strong className="text-white">임의로 설정된 가상의 값</strong>이며,
                실제 선수의 능력과 무관합니다.
              </p>
              <p>
                • 본 사이트의 사용으로 인해 발생하는 <strong className="text-white">어떠한 직간접적 손해에 대해서도 책임을 지지 않습니다</strong>.
              </p>
              <p>
                • 저작권자의 요청이 있을 경우, <strong className="text-white">즉시 해당 콘텐츠를 삭제</strong>할 것을 약속드립니다.
              </p>
            </div>
          </section>

          {/* 연락처 */}
          <section className="bg-[#0047AB]/10 p-6 rounded-lg border border-[#0047AB]/30">
            <h2 className="text-xl font-bold text-[#FFB81C] mb-4">문의 및 저작권 신고</h2>
            <p className="text-[#9AA6C3]">
              저작권 관련 문의나 콘텐츠 삭제 요청이 있으신 경우,
              <a 
                href="mailto:actorcloset123@gmail.com" 
                className="text-[#0047AB] hover:text-[#FFB81C] hover:underline ml-1 font-semibold transition-colors"
              >
                actorcloset123@gmail.com
              </a>
              으로 연락 주시기 바랍니다.
            </p>
          </section>

          {/* 업데이트 */}
          <section className="text-center text-sm text-[#8B95B5] pt-4 border-t border-[#2B6CFF]/20">
            <p>최종 업데이트: 2025년 1월</p>
            <p className="mt-2">본 약관은 예고 없이 변경될 수 있습니다.</p>
          </section>
        </div>

        {/* 돌아가기 버튼 */}
        <div className="mt-8 text-center">
          <Button
            onClick={onBack}
            size="lg"
            className="bg-[#C8102E] hover:bg-[#C8102E]/80 text-white font-bold px-12"
          >
            홈으로 돌아가기
          </Button>
        </div>
      </div>
    </div>
  );
}