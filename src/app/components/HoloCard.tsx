import { useState, useRef, MouseEvent, TouchEvent } from 'react';
import { Card, Rarity, rarityConfigs } from '../../types/card';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface HoloCardProps {
  card: Card;
  size?: 'small' | 'medium' | 'large';
  showBack?: boolean;
  enableTilt?: boolean;
  className?: string;
  isRevealing?: boolean;
}

export function HoloCard({ 
  card, 
  size = 'medium', 
  showBack = false,
  enableTilt = true,
  className = '',
  isRevealing = false
}: HoloCardProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
  const cardRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    small: 'w-32 h-44',
    medium: 'w-64 h-96',
    large: 'w-80 h-[480px]'
  };

  const config = rarityConfigs[card.rarity];
  const rarityConfig = getRarityConfig(card.rarity);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!enableTilt || isRevealing || !cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -rarityConfig.tiltAngle;
    const rotateY = ((x - centerX) / centerX) * rarityConfig.tiltAngle;
    
    setRotation({ x: rotateX, y: rotateY });
    setGlarePosition({ 
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  const handleMouseLeave = () => {
    if (!enableTilt || isRevealing) return;
    setRotation({ x: 0, y: 0 });
    setGlarePosition({ x: 50, y: 50 });
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!enableTilt || isRevealing || !cardRef.current || e.touches.length === 0) return;

    const rect = cardRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -rarityConfig.tiltAngle;
    const rotateY = ((x - centerX) / centerX) * rarityConfig.tiltAngle;
    
    setRotation({ x: rotateX, y: rotateY });
    setGlarePosition({ 
      x: (x / rect.width) * 100,
      y: (y / rect.height) * 100
    });
  };

  if (showBack) {
    return (
      <div
        ref={cardRef}
        className={`${sizeClasses[size]} ${className} relative rounded-2xl overflow-hidden transition-transform duration-200 ease-out`}
        style={{
          transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
          transformStyle: 'preserve-3d'
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseLeave}
      >
        <div 
          className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black"
          style={{
            backgroundImage: `
              repeating-linear-gradient(
                45deg,
                transparent,
                transparent 10px,
                rgba(255,255,255,0.03) 10px,
                rgba(255,255,255,0.03) 20px
              )
            `
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-6xl font-bold text-white/20">?</div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={cardRef}
      className={`${sizeClasses[size]} ${className} relative rounded-2xl overflow-hidden transition-transform duration-200 ease-out`}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transformStyle: 'preserve-3d'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
    >
      {/* Base Card - Background Image */}
      <ImageWithFallback
        src={card.image}
        alt={card.name}
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Dark overlay for better text/effect visibility */}
      <div className="absolute inset-0 bg-black/15" />

      {/* Foil Pattern Layer - Holographic texture */}
      {rarityConfig.foilIntensity > 0 && (
        <FoilPattern 
          rarity={card.rarity} 
          intensity={rarityConfig.foilIntensity}
          glarePosition={glarePosition}
        />
      )}
      
      {/* Gloss Layer - Soft overall sheen */}
      <GlossLayer />
      
      {/* Shine Sweep - Diagonal moving highlight */}
      <ShineSweep 
        glarePosition={glarePosition}
        rarity={card.rarity}
      />
      
      {/* Glare - Circular bright spot */}
      <Glare 
        position={glarePosition}
        intensity={rarityConfig.glareIntensity}
      />
      
      {/* Edge Glow */}
      {rarityConfig.edgeGlow > 0 && (
        <EdgeGlow 
          color={config.glowColor}
          width={rarityConfig.edgeGlow}
        />
      )}
      
      {/* Border */}
      <div 
        className="absolute inset-0 rounded-2xl border-4"
        style={{ borderColor: config.borderColor }}
      />
      
      {/* Card Info - Text overlay */}
      <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none">
        <div>
          <div className="text-white font-bold text-lg drop-shadow-lg">{card.name}</div>
          <div 
            className="text-xs font-semibold mt-1 px-2 py-1 rounded inline-block"
            style={{ backgroundColor: config.color }}
          >
            {card.rarity}
          </div>
        </div>
        
        <div>
          <div className="text-white/80 text-xs">{card.setName}</div>
        </div>
      </div>
    </div>
  );
}

// Rarity configuration for holographic effects
function getRarityConfig(rarity: Rarity) {
  const configs = {
    Common: {
      tiltAngle: 4,
      foilIntensity: 0,
      glareIntensity: 0.12,
      edgeGlow: 0,
      shineCount: 1,
      shineDuration: 0.5,
      particleCount: 0,
      revealDuration: 0.7
    },
    Uncommon: {
      tiltAngle: 6,
      foilIntensity: 0.2,
      glareIntensity: 0.2,
      edgeGlow: 0,
      shineCount: 2,
      shineDuration: 0.4,
      particleCount: 7,
      revealDuration: 0.9
    },
    Rare: {
      tiltAngle: 8,
      foilIntensity: 0.33,
      glareIntensity: 0.3,
      edgeGlow: 2,
      shineCount: 2,
      shineDuration: 0.8,
      particleCount: 20,
      revealDuration: 1.1
    },
    Epic: {
      tiltAngle: 10,
      foilIntensity: 0.48,
      glareIntensity: 0.43,
      edgeGlow: 3,
      shineCount: 2,
      shineDuration: 1.2,
      particleCount: 50,
      revealDuration: 1.6
    },
    Legendary: {
      tiltAngle: 12,
      foilIntensity: 0.63,
      glareIntensity: 0.5,
      edgeGlow: 4,
      shineCount: 3,
      shineDuration: 1.5,
      particleCount: 100,
      revealDuration: 2.2
    },
    Mythic: {
      tiltAngle: 14,
      foilIntensity: 0.78,
      glareIntensity: 0.6,
      edgeGlow: 5,
      shineCount: 3,
      shineDuration: 2.0,
      particleCount: 200,
      revealDuration: 2.8
    }
  };
  
  return configs[rarity];
}

// Foil Pattern - Holographic texture that changes by rarity
function FoilPattern({ rarity, intensity, glarePosition }: { rarity: Rarity; intensity: number; glarePosition: { x: number; y: number } }) {
  const angle = glarePosition.x * 3.6;

  // Common doesn't have foil
  if (rarity === 'Common') return null;

  // Uncommon - Subtle linear rainbow
  if (rarity === 'Uncommon') {
    return (
      <div 
        className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
        style={{
          opacity: intensity,
          background: `
            linear-gradient(
              ${angle}deg,
              rgba(16, 185, 129, 0.4),
              rgba(59, 130, 246, 0.4),
              rgba(16, 185, 129, 0.4)
            )
          `
        }}
      />
    );
  }

  // Rare - Prism pattern
  if (rarity === 'Rare') {
    return (
      <div 
        className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
        style={{
          opacity: intensity,
          backgroundImage: `
            radial-gradient(circle, rgba(255,255,255,0.3) 1px, transparent 1px),
            conic-gradient(
              from ${angle}deg at ${glarePosition.x}% ${glarePosition.y}%,
              rgba(59, 130, 246, 0.5),
              rgba(147, 197, 253, 0.5),
              rgba(59, 130, 246, 0.5)
            )
          `,
          backgroundSize: '30px 30px, 100% 100%',
          backgroundPosition: '0 0, 0 0'
        }}
      />
    );
  }

  // Epic - Prism + noise pattern
  if (rarity === 'Epic') {
    return (
      <>
        <div 
          className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
          style={{
            opacity: intensity * 0.8,
            background: `
              conic-gradient(
                from ${angle}deg at ${glarePosition.x}% ${glarePosition.y}%,
                rgba(168, 85, 247, 0.6),
                rgba(236, 72, 153, 0.6),
                rgba(59, 130, 246, 0.6),
                rgba(52, 211, 153, 0.6),
                rgba(168, 85, 247, 0.6)
              )
            `
          }}
        />
        <div 
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{
            opacity: intensity * 0.4,
            backgroundImage: `
              repeating-linear-gradient(
                ${angle}deg,
                transparent,
                transparent 8px,
                rgba(255, 255, 255, 0.1) 8px,
                rgba(255, 255, 255, 0.1) 16px
              )
            `
          }}
        />
      </>
    );
  }

  // Legendary - Gold + prism
  if (rarity === 'Legendary') {
    return (
      <>
        <div 
          className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
          style={{
            opacity: intensity * 0.85,
            background: `
              conic-gradient(
                from ${angle}deg at ${glarePosition.x}% ${glarePosition.y}%,
                rgba(245, 158, 11, 0.7),
                rgba(251, 191, 36, 0.7),
                rgba(252, 211, 77, 0.7),
                rgba(253, 224, 71, 0.7),
                rgba(251, 191, 36, 0.7),
                rgba(245, 158, 11, 0.7)
              )
            `
          }}
        />
        <div 
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{
            opacity: intensity * 0.3,
            backgroundImage: `
              radial-gradient(circle, rgba(255, 255, 200, 0.4) 2px, transparent 2px)
            `,
            backgroundSize: '40px 40px',
            backgroundPosition: `${glarePosition.x}% ${glarePosition.y}%`
          }}
        />
      </>
    );
  }

  // Mythic - Aurora/Galaxy
  if (rarity === 'Mythic') {
    return (
      <>
        <div 
          className="absolute inset-0 mix-blend-color-dodge pointer-events-none"
          style={{
            opacity: intensity * 0.9,
            background: `
              conic-gradient(
                from ${angle}deg at ${glarePosition.x}% ${glarePosition.y}%,
                rgba(239, 68, 68, 0.8),
                rgba(236, 72, 153, 0.8),
                rgba(168, 85, 247, 0.8),
                rgba(59, 130, 246, 0.8),
                rgba(52, 211, 153, 0.8),
                rgba(251, 191, 36, 0.8),
                rgba(239, 68, 68, 0.8)
              )
            `
          }}
        />
        <div 
          className="absolute inset-0 mix-blend-screen pointer-events-none"
          style={{
            opacity: intensity * 0.5,
            backgroundImage: `
              radial-gradient(circle, rgba(255, 255, 255, 0.6) 1px, transparent 1px),
              radial-gradient(circle, rgba(168, 85, 247, 0.4) 2px, transparent 2px)
            `,
            backgroundSize: '60px 60px, 90px 90px',
            backgroundPosition: `${glarePosition.x}% ${glarePosition.y}%, ${100 - glarePosition.x}% ${100 - glarePosition.y}%`
          }}
        />
        <div 
          className="absolute inset-0 mix-blend-overlay pointer-events-none"
          style={{
            opacity: intensity * 0.3,
            background: `
              repeating-linear-gradient(
                ${angle}deg,
                transparent,
                transparent 4px,
                rgba(255, 255, 255, 0.15) 4px,
                rgba(255, 255, 255, 0.15) 5px
              )
            `
          }}
        />
      </>
    );
  }

  return null;
}

// Gloss Layer - Soft overall sheen
function GlossLayer() {
  return (
    <div 
      className="absolute inset-0 pointer-events-none mix-blend-soft-light"
      style={{
        opacity: 0.15,
        background: `
          linear-gradient(
            125deg,
            rgba(255, 255, 255, 0.3) 0%,
            rgba(255, 255, 255, 0.1) 50%,
            rgba(255, 255, 255, 0.3) 100%
          )
        `
      }}
    />
  );
}

// Shine Sweep - Diagonal moving highlight
function ShineSweep({ glarePosition, rarity }: { glarePosition: { x: number; y: number }; rarity: Rarity }) {
  const angle = 45 + (glarePosition.x - 50) * 0.5;
  
  return (
    <div 
      className="absolute inset-0 pointer-events-none mix-blend-overlay transition-all duration-300"
      style={{
        opacity: 0.4,
        backgroundImage: `
          linear-gradient(
            ${angle}deg,
            transparent 0%,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.8) 50%,
            rgba(255, 255, 255, 0) 60%,
            transparent 100%
          )
        `,
        backgroundSize: '200% 200%',
        backgroundPosition: `${glarePosition.x}% ${glarePosition.y}%`
      }}
    />
  );
}

// Glare - Circular bright spot following mouse
function Glare({ position, intensity }: { position: { x: number; y: number }; intensity: number }) {
  return (
    <div 
      className="absolute inset-0 pointer-events-none mix-blend-overlay transition-all duration-200"
      style={{
        opacity: intensity,
        background: `
          radial-gradient(
            circle at ${position.x}% ${position.y}%,
            rgba(255, 255, 255, 1) 0%,
            rgba(255, 255, 255, 0.6) 10%,
            rgba(255, 255, 255, 0.2) 20%,
            transparent 40%
          )
        `
      }}
    />
  );
}

// Edge Glow - Colored border glow
function EdgeGlow({ color, width }: { color: string; width: number }) {
  return (
    <div 
      className="absolute inset-0 rounded-2xl pointer-events-none"
      style={{
        boxShadow: `
          inset 0 0 ${width * 2}px ${width / 2}px ${color},
          0 0 ${width * 3}px ${width}px ${color}
        `
      }}
    />
  );
}

export { getRarityConfig };