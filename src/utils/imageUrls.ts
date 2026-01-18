// Supabase Storage 이미지 URL 생성

import { projectId } from "/utils/supabase/info";

// Supabase Storage 공개 URL 베이스
const STORAGE_BASE = `https://${projectId}.supabase.co/storage/v1/object/public`;

/**
 * DB에 저장된 이미지 파일명을 Supabase Storage URL로 변환
 * 
 * @param imageFileName DB의 image 컬럼 값 (예: "2024_T1_Faker_Summer.png" 또는 전체 URL)
 * @returns Supabase Storage 전체 URL 또는 null
 */
export function getPlayerImageUrl(imageFileName: string | null | undefined): string | null {
  if (!imageFileName) return null;
  
  // 이미 전체 URL인 경우 그대로 반환
  if (imageFileName.startsWith('http://') || imageFileName.startsWith('https://')) {
    return imageFileName;
  }
  
  // 파일명만 있는 경우 Supabase Storage URL 생성
  // TODO: 실제 버킷 이름으로 변경 필요! (현재: lck-player-images)
  return `${STORAGE_BASE}/lck-player-images/${imageFileName}`;
}

/**
 * 팀 로고 파일명을 Supabase Storage URL로 변환
 * 
 * @param logoFileName 로고 파일명 (예: "2024_T1_logo.png")
 * @returns Supabase Storage 전체 URL 또는 null
 */
export function getTeamLogoUrl(logoFileName: string | null | undefined): string | null {
  if (!logoFileName) return null;
  
  // 이미 전체 URL인 경우 그대로 반환
  if (logoFileName.startsWith('http://') || logoFileName.startsWith('https://')) {
    return logoFileName;
  }
  
  // 파일명만 있는 경우 Supabase Storage URL 생성
  return `${STORAGE_BASE}/team-logos/${logoFileName}`;
}