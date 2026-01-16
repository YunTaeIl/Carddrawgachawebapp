import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, Rarity, rarityConfigs } from '../../types/card';
import { HoloCard, getRarityConfig } from './HoloCard';
import { SkipForward } from 'lucide-react';

interface PackOpeningProps {
  cards: Card[];
  onComplete: () => void;
  reduceMotion: boolean;
}

export function PackOpening({ cards, onComplete, reduceMotion }: PackOpeningProps) {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [stage, setStage] = useState<'idle' | 'anticipation' | 'flip' | 'display'>('idle');

  const currentCard = cards[currentCardIndex];
  const config = rarityConfigs[currentCard.rarity];
  const rarityConfig = getRarityConfig(currentCard.rarity);

  // Auto-start animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setStage('anticipation');
    }, 300);
    return () => clearTimeout(timer);
  }, [currentCardIndex]);

  // Anticipation → Flip (Epic+ only)
  useEffect(() => {
    if (stage === 'anticipation') {
      const hasAnticipation = currentCard.rarity === 'Epic' || currentCard.rarity === 'Legendary' || currentCard.rarity === 'Mythic';
      const anticipationDuration = hasAnticipation ? 300 : 0;
      
      const timer = setTimeout(() => {
        setStage('flip');
      }, anticipationDuration);
      return () => clearTimeout(timer);
    }
  }, [stage, currentCard.rarity]);

  // Flip → Display
  useEffect(() => {
    if (stage === 'flip') {
      const flipDuration = reduceMotion ? 500 : getFlipDuration(currentCard.rarity);
      
      const timer = setTimeout(() => {
        setStage('display');
      }, flipDuration);
      return () => clearTimeout(timer);
    }
  }, [stage, currentCard.rarity, reduceMotion]);

  const handleNext = () => {
    if (currentCardIndex < cards.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      setStage('idle');
    } else {
      onComplete();
    }
  };

  const handleSkip = () => {
    onComplete();
  };

  const flipDuration = reduceMotion ? 0.5 : getFlipDuration(currentCard.rarity) / 1000;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-purple-950 to-gray-950 flex items-center justify-center overflow-hidden">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="absolute top-6 right-6 z-50 flex items-center gap-2 px-4 py-2 bg-gray-800/80 hover:bg-gray-700 text-white rounded-xl transition-all transform hover:scale-105 active:scale-95"
      >
        <SkipForward className="w-4 h-4" />
        Skip All
      </button>

      {/* Progress */}
      <div className="absolute top-6 left-6 text-white/60 font-semibold z-50">
        {currentCardIndex + 1} / {cards.length}
      </div>

      {/* Background Effects */}
      {!reduceMotion && (
        <RarityBackground 
          rarity={currentCard.rarity} 
          stage={stage}
        />
      )}

      {/* Main Animation */}
      <div className="relative z-10">
        <AnimatePresence mode="wait">
          {/* Anticipation - Subtle zoom (Epic+) */}
          {stage === 'anticipation' && (currentCard.rarity === 'Epic' || currentCard.rarity === 'Legendary' || currentCard.rarity === 'Mythic') && (
            <motion.div
              key="anticipation"
              initial={{ scale: 1 }}
              animate={{ scale: 0.95 }}
              exit={{ scale: 1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <HoloCard card={currentCard} size="large" showBack={true} />
            </motion.div>
          )}

          {/* Flip Animation */}
          {(stage === 'flip' || (stage === 'anticipation' && currentCard.rarity !== 'Epic' && currentCard.rarity !== 'Legendary' && currentCard.rarity !== 'Mythic')) && (
            <motion.div
              key="flip"
              initial={{ rotateY: 180, scale: 1 }}
              animate={{ rotateY: 0, scale: 1 }}
              transition={{ 
                duration: flipDuration,
                ease: currentCard.rarity === 'Legendary' || currentCard.rarity === 'Mythic' ? 'easeInOut' : 'easeOut'
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <HoloCard card={currentCard} size="large" isRevealing={true} />
            </motion.div>
          )}

          {/* Display - Final reveal with particles and effects */}
          {stage === 'display' && (
            <motion.div
              key="display"
              initial={{ scale: 1 }}
              animate={{ scale: 1 }}
              className="relative"
            >
              {/* Shockwave Ring (Rare+) */}
              {!reduceMotion && (currentCard.rarity === 'Rare' || currentCard.rarity === 'Mythic') && (
                <ShockwaveRing color={config.glowColor} intensity={currentCard.rarity === 'Mythic' ? 2 : 1} />
              )}

              {/* Card */}
              <HoloCard card={currentCard} size="large" />
              
              {/* Rarity announcement */}
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.8 }}
                animate={{ opacity: 1, y: -100, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="absolute -top-24 left-1/2 -translate-x-1/2 text-center whitespace-nowrap"
              >
                <div 
                  className="text-5xl font-bold drop-shadow-lg px-8 py-3 rounded-2xl backdrop-blur-sm"
                  style={{ 
                    color: config.color,
                    textShadow: `0 0 30px ${config.glowColor}, 0 0 60px ${config.glowColor}`,
                    background: `radial-gradient(ellipse, ${config.glowColor}33, transparent)`
                  }}
                >
                  {currentCard.rarity}!
                </div>
              </motion.div>

              {/* Particles */}
              {!reduceMotion && rarityConfig.particleCount > 0 && (
                <RarityParticles 
                  rarity={currentCard.rarity} 
                  count={rarityConfig.particleCount}
                  color={config.glowColor}
                />
              )}

              {/* Shine Sweeps */}
              {!reduceMotion && (
                <ShineSweeps 
                  count={rarityConfig.shineCount}
                  duration={rarityConfig.shineDuration}
                  color={config.color}
                />
              )}

              {/* Next button */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="absolute -bottom-32 left-1/2 -translate-x-1/2"
              >
                <button
                  onClick={handleNext}
                  className="px-10 py-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-bold rounded-2xl transition-all transform hover:scale-105 active:scale-95 shadow-xl text-lg"
                >
                  {currentCardIndex < cards.length - 1 ? 'Next Card →' : 'View Collection'}
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function getFlipDuration(rarity: Rarity): number {
  const config = getRarityConfig(rarity);
  
  // Flip duration based on rarity (in milliseconds)
  if (rarity === 'Legendary' || rarity === 'Mythic') {
    return config.shineDuration * 0.7 * 1000; // Slower, more dramatic
  }
  
  return config.shineDuration * 0.6 * 1000;
}

// Background effects based on rarity
function RarityBackground({ rarity, stage }: { rarity: Rarity; stage: string }) {
  const config = rarityConfigs[rarity];
  
  if (stage === 'idle') return null;

  // Legendary - Spotlight + subtle zoom
  if (rarity === 'Legendary') {
    return (
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Spotlight */}
        <motion.div
          className="absolute inset-0"
          animate={{
            background: [
              `radial-gradient(ellipse 40% 50% at 50% 50%, ${config.glowColor}40, transparent 60%)`,
              `radial-gradient(ellipse 50% 60% at 50% 50%, ${config.glowColor}50, transparent 70%)`,
              `radial-gradient(ellipse 45% 55% at 50% 50%, ${config.glowColor}45, transparent 65%)`
            ]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        />
        
        {/* Rotating rays */}
        <motion.div
          className="absolute inset-0"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          style={{
            background: `conic-gradient(from 0deg, transparent 0deg, ${config.glowColor}15 30deg, transparent 60deg, transparent 180deg, ${config.glowColor}15 210deg, transparent 240deg, transparent)`
          }}
        />
      </motion.div>
    );
  }

  // Mythic - Aurora wave
  if (rarity === 'Mythic') {
    return (
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Aurora wave */}
        <motion.div
          className="absolute inset-0"
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
          }}
          transition={{ duration: 8, repeat: Infinity }}
          style={{
            background: `
              linear-gradient(
                135deg,
                rgba(239, 68, 68, 0.2),
                rgba(236, 72, 153, 0.2),
                rgba(168, 85, 247, 0.2),
                rgba(59, 130, 246, 0.2),
                rgba(52, 211, 153, 0.2),
                rgba(239, 68, 68, 0.2)
              )
            `,
            backgroundSize: '200% 200%'
          }}
        />
        
        {/* Cosmic stars */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1]
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>
      </motion.div>
    );
  }

  // Other rarities - Simple glow
  return (
    <motion.div
      className="absolute inset-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      style={{
        background: `radial-gradient(circle at center, ${config.glowColor}50, transparent 70%)`
      }}
    />
  );
}

// Shockwave ring effect
function ShockwaveRing({ color, intensity }: { color: string; intensity: number }) {
  return (
    <>
      {[...Array(intensity)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-4"
          style={{
            borderColor: color,
            width: '80px',
            height: '80px'
          }}
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 8, opacity: 0 }}
          transition={{ 
            duration: 1.2, 
            ease: 'easeOut',
            delay: i * 0.2
          }}
        />
      ))}
    </>
  );
}

// Particle burst effect
function RarityParticles({ rarity, count, color }: { rarity: Rarity; count: number; color: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible">
      {[...Array(count)].map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        const distance = 200 + Math.random() * 200;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const size = 2 + Math.random() * 4;
        
        return (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              backgroundColor: color,
              width: `${size}px`,
              height: `${size}px`,
              left: '50%',
              top: '50%',
              boxShadow: `0 0 ${size * 2}px ${color}`
            }}
            initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
            animate={{
              scale: [0, 1.5, 0.5, 0],
              x: x,
              y: y,
              opacity: [1, 1, 0.5, 0],
            }}
            transition={{
              duration: 1.5 + Math.random() * 0.5,
              delay: Math.random() * 0.3,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
}

// Shine sweep effects
function ShineSweeps({ count, duration, color }: { count: number; duration: number; color: string }) {
  return (
    <>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.6, 0] }}
          transition={{ 
            duration: duration / count,
            delay: (i * duration) / count,
            ease: 'easeInOut'
          }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ x: '-100%', rotate: -45 }}
            animate={{ x: '200%', rotate: -45 }}
            transition={{ 
              duration: duration / count,
              delay: (i * duration) / count,
              ease: 'easeInOut'
            }}
            style={{
              background: `linear-gradient(90deg, transparent, ${color}80, rgba(255,255,255,0.9), ${color}80, transparent)`,
              width: '30%',
              height: '200%',
              filter: 'blur(10px)'
            }}
          />
        </motion.div>
      ))}
    </>
  );
}
