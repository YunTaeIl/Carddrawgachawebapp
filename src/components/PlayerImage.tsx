// 선수 이미지 컴포넌트 (Supabase Storage 연동)

import React, { useState } from 'react';
import { getPlayerImageUrl } from '@/utils/imageUrls';
import { Position, POSITION_NAMES } from '@/types/lck';
import { projectId } from '/utils/supabase/info';

interface PlayerImageProps {
  imageFileName: string | null | undefined; // DB의 image 컬럼 값
  playerName: string;
  position: Position;
  gradeColor: string;
  className?: string;
  alt?: string;
}

/**
 * 선수 이미지 컴포넌트
 * Supabase Storage에서 이미지 로드, 실패 시 포지션 표시
 */
export function PlayerImage({
  imageFileName,
  playerName,
  position,
  gradeColor,
  className,
  alt
}: PlayerImageProps) {
  const [imageError, setImageError] = useState(false);
  
  // Supabase Storage URL 생성
  const imageUrl = getPlayerImageUrl(imageFileName);
  
  // 이미지 로드 실패 핸들러
  const handleError = () => {
    setImageError(true);
  };
  
  // 이미지 URL이 없거나 로드 실패 시 포지션 표시
  if (!imageUrl || imageError) {
    return (
      <div className={`${className} flex flex-col items-center justify-center relative`}>
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              radial-gradient(circle at 30% 30%, ${gradeColor}66 0%, transparent 50%),
              radial-gradient(circle at 70% 70%, ${gradeColor}44 0%, transparent 50%)
            `
          }}
        />
        <div 
          className="text-6xl font-display font-bold opacity-40"
          style={{ color: gradeColor }}
        >
          {position}
        </div>
      </div>
    );
  }

  return (
    <img
      src={imageUrl}
      alt={alt || playerName}
      className={className}
      onError={handleError}
    />
  );
}