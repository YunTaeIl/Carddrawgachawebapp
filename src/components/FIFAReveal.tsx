// FIFA 스타일 S등급 카드 리빌 애니메이션

import React, { useState, useEffect } from "react";
import { GachaResult, GRADE_COLORS, POSITION_NAMES } from "@/types/lck";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { motion, AnimatePresence } from "motion/react";
import { Sparkles, X } from "lucide-react";
import { getTeamLogoUrls } from "@/utils/teamLogos";

interface FIFARevealProps {
  result: GachaResult;
  onComplete: () => void;
  onSkip: () => void;
  currentIndex: number;
  totalCount: number;
}

export function FIFAReveal({ result, onComplete, onSkip, currentIndex, totalCount }: FIFARevealProps) {
  const [stage, setStage] = useState(0); // 0부터 시작
  const card = result.card;
  const isS = card.grade === "S";
  const [logoError, setLogoError] = useState(false);  // 🔥 로고 로드 실패 상태
  const [logoUrlIndex, setLogoUrlIndex] = useState(0);  // 🔥 현재 시도 중인 URL 인덱스
  
  // 팀 로고 경로 (폴백 URL 배열)
  const teamLogoUrls = getTeamLogoUrls(card.year, card.team);
  const currentLogoUrl = teamLogoUrls[logoUrlIndex];
  
  // 로고 로드 실패 시 다음 URL 시도
  const handleLogoError = () => {
    if (logoUrlIndex < teamLogoUrls.length - 1) {
      setLogoUrlIndex(logoUrlIndex + 1);
    } else {
      setLogoError(true);  // 모든 URL 실패
    }
  };

  useEffect(() => {
    // S등급이 아니면 바로 카드 표시
    if (!isS) {
      setStage(4);
      return;
    }

    // S등급: 연출 시작 (로고는 2.5초로 더 길게)
    const timers = [
      setTimeout(() => setStage(1), 0),     // 바로 연도
      setTimeout(() => setStage(2), 1500),  // 포지션 (1.5초 후)
      setTimeout(() => setStage(3), 3000),  // 팀 로고 (1.5초 후)
      setTimeout(() => setStage(4), 5500),  // 카드 등장 (2.5초 후) ← 로고 표시 시간 연장!
    ];

    return () => timers.forEach(clearTimeout);
  }, [isS]);

  const handleContinue = () => {
    onComplete();
  };

  // stage -1일 때는 완전히 검은 화면만 (아무것도 안 보임)
  if (stage === -1) {
    return (
      <div className="fixed inset-0 z-50 bg-[#0A0E27]" />
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0A0E27]">
      {/* Skip 버튼 */}
      {totalCount > 1 && stage > 0 && (
        <div className="absolute top-4 right-4 z-[60]">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-[#9AA6C3] hover:text-[#EAF0FF] pointer-events-auto"
          >
            <X className="w-4 h-4 mr-2" />
            전체 스킵
          </Button>
        </div>
      )}

      {/* 진행 표시 */}
      {totalCount > 1 && stage > 0 && (
        <div className="absolute top-4 left-4 z-[60] text-[#9AA6C3] text-sm">
          {currentIndex} / {totalCount}
        </div>
      )}

      {/* S등급 FIFA 스타일 연출 */}
      {isS && stage < 4 && (
        <div className="absolute inset-0 flex items-center justify-center bg-[#0A0E27]">
          {/* 배경 입자 효과 */}
          <div className="absolute inset-0">
            {[...Array(50)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-[#D4AF37] rounded-full"
                initial={{
                  x: "50vw",
                  y: "50vh",
                  opacity: 0
                }}
                animate={{
                  x: `${Math.random() * 100}vw`,
                  y: `${Math.random() * 100}vh`,
                  opacity: [0, 1, 0]
                }}
                transition={{
                  duration: 2,
                  delay: Math.random() * 0.5,
                  repeat: Infinity,
                  repeatDelay: Math.random() * 2
                }}
              />
            ))}
          </div>

          {/* 스포트라이트 */}
          <div className="absolute inset-0 bg-gradient-radial from-transparent via-transparent to-[#0B0F1A]" />

          {/* Stage 1: 연도 */}
          <AnimatePresence>
            {stage === 1 && (
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[12rem] font-display font-bold text-[#FFB81C]" style={{ textShadow: "0 0 60px #FFB81C" }}>
                  {card.year}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 2: 포지션 */}
          <AnimatePresence>
            {stage === 2 && (
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-[10rem] font-display font-bold text-[#C8102E]" style={{ textShadow: "0 0 50px #C8102E" }}>
                  {card.position}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stage 3: 팀 로고 */}
          <AnimatePresence>
            {stage === 3 && (
              <motion.div
                className="absolute"
                initial={{ opacity: 0, scale: 0.3 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.3 }}
                transition={{ duration: 0.5 }}
              >
                {currentLogoUrl && !logoError ? (
                  <div className="relative">
                    {/* 로고 글로우 효과 */}
                    <div 
                      className="absolute inset-0 blur-3xl opacity-70"
                      style={{
                        background: `radial-gradient(circle, #0047AB, transparent 70%)`
                      }}
                    />
                    {/* 팀 로고 */}
                    <img 
                      src={currentLogoUrl}
                      alt={card.team}
                      className="relative w-[500px] h-[500px] object-contain"
                      style={{
                        filter: "drop-shadow(0 0 40px #0047AB)"
                      }}
                      onError={handleLogoError}  // 🔥 로고 로드 실패 시 에러 처리
                    />
                  </div>
                ) : (
                  // 로고가 없거나 로드 실패 시 팀 이름 표시
                  <div className="text-center">
                    <div className="text-[9rem] font-display font-bold text-[#0047AB]" style={{ textShadow: "0 0 50px #0047AB" }}>
                      {card.team}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Stage 4: 카드 등장 */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center bg-[#0A0E27]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            {/* 등급 배지 */}
            <motion.div
              className="mb-6"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: isS ? 0.3 : 0, duration: 0.5 }}
            >
              <div
                className="px-8 py-3 rounded-full text-3xl font-bold shadow-2xl"
                style={{
                  background: GRADE_COLORS[card.grade],
                  color: card.grade === "S" || card.grade === "A" ? "#0A0E27" : "#FFFFFF",
                  boxShadow: `0 0 40px ${GRADE_COLORS[card.grade]}`
                }}
              >
                {card.grade} 등급
              </div>
            </motion.div>

            {/* 카드 */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: isS ? 0.5 : 0.2, duration: 0.5 }}
            >
              <LCKHoloCard card={card} size="large" />
            </motion.div>

            {/* 중복 표시 */}
            {result.isDupe && (
              <motion.div
                className="mt-6 bg-[#0047AB]/20 px-6 py-3 rounded-lg border border-[#0047AB]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: isS ? 0.7 : 0.4 }}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#0047AB]" />
                  <span className="text-white">
                    중복 카드! +{result.shardsGained} 샤드 획득
                  </span>
                </div>
              </motion.div>
            )}

            {/* 계속 버튼 */}
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: isS ? 1 : 0.6 }}
            >
              <Button
                onClick={handleContinue}
                size="lg"
                className="bg-[#C8102E] hover:bg-[#C8102E]/80 text-white font-bold px-12 py-6 text-lg pointer-events-auto"
              >
                {currentIndex < totalCount ? "다음 카드" : "확인"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* A/B/C 등급 간단 연출 배경 */}
      {!isS && stage === 4 && (
        <div className="absolute inset-0 bg-gradient-radial from-transparent to-[#0B0F1A] pointer-events-none" />
      )}
    </div>
  );
}