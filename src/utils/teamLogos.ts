// LCK 팀 로고 경로 매핑 (Supabase Storage 사용)

import { projectId } from "/utils/supabase/info";

const STORAGE_BASE = `https://${projectId}.supabase.co/storage/v1/object/public/team-logos`;

/**
 * 팀명을 파일명 형식으로 변환 (실제 Supabase 파일명과 일치)
 */
function getTeamFileName(teamName: string): string {
  const mapping: Record<string, string> = {
    // 메이저 팀 (여러 연도)
    "T1": "T1",
    "SK Telecom T1": "SKT",  // 2019년 이전
    "Gen.G": "Gen.G",  // 일부는 Gen.G, 일부는 GEN
    "Hanwha Life Esports": "Hanwha_Life_Esports",
    "Dplus KIA": "Dplus_Kia",
    "Dplus Kia": "Dplus_Kia",
    "KT Rolster": "KT_Rolster",
    "DRX": "DRX",
    "Nongshim RedForce": "NS",  // NS는 square만 있음
    "Kwangdong Freecs": "Kwangdong_Freecs",
    "DN Freecs": "DN_Freecs",
    
    // 2024
    "BNK FEARX": "FOX",  // 2024_FOX_logo_square.png
    
    // 구단명 변경
    "Fredit BRION": "Fredit_BRION",
    "OKSavingsBank BRION": "Fredit_BRION",  // BRION으로 통합
    
    // 샌드박스
    "SANDBOX": "SB",
    "Sandbox Gaming": "SB",
    "Liiv SANDBOX": "Liiv_SANDBOX",
    
    // 다음
    "DAMWON Gaming": "DAMWON_Gaming",
    "DWG KIA": "DWG_KIA",
    
    // 프릭스
    "Afreeca Freecs": "Afreeca_Freecs",
    
    // Griffin (2018-2020)
    "Griffin": "griffin",
    
    // ROX Tigers
    "ROX Tigers": "ROX_Tigers",
    "KOO Tigers": "KOO_Tigers",
    
    // 옛날 팀들
    "Jin Air Green Wings": "Jin_Air_Green_Wings",
    "bbq Olivers": "bbq_Olivers",
    "Kingzone DragonX": "Kingzone_DragonX",
    "Longzhu Gaming": "Longzhu_Gaming",
    "MVP": "MVP",
    "ESC Ever": "ESC_Ever",
    "Ever8 Winners": "Ever8_Winners",
    "CJ Entus": "CJ_Entus",
    "NaJin e-mFire": "NaJin_e-mFire",
    "Incredible Miracle": "Incredible_Miracle"
  };
  
  return mapping[teamName] || teamName.replace(/\s+/g, '_').replace(/\./g, '');
}

/**
 * 약어 매핑 (square 파일용)
 */
function getTeamShortName(teamName: string): string {
  const shortMapping: Record<string, string> = {
    "T1": "T1",
    "SK Telecom T1": "SKT",  // 2019년 이전 약어
    "Gen.G": "GEN",
    "Hanwha Life Esports": "HLE",
    "Dplus KIA": "DK",
    "Dplus Kia": "DK",
    "KT Rolster": "KT",
    "DRX": "DRX",
    "Nongshim RedForce": "NS",
    "Kwangdong Freecs": "KDF",
    "DN Freecs": "KDF",  // DN은 KDF 계승
    "BNK FEARX": "FOX",
    "Fredit BRION": "BRO",
    "OKSavingsBank BRION": "BRO",
    "SANDBOX": "SB",
    "Sandbox Gaming": "SB",
    "Liiv SANDBOX": "LSB",
    "DAMWON Gaming": "DWG",
    "DWG KIA": "DWG",
    "Afreeca Freecs": "AF",
    "Griffin": "GRF",  // Griffin 약어
    "ROX Tigers": "ROX",
    "KOO Tigers": "KOO",
    "Longzhu Gaming": "LZ"
  };
  
  return shortMapping[teamName];
}

/**
 * 팀 로고 URL 배열 (우선순위대로)
 * 1. square.png
 * 2. logo.png
 * 3. logo.webp
 */
export function getTeamLogoUrls(year: number, teamName: string): string[] {
  const fileName = getTeamFileName(teamName);
  const shortName = getTeamShortName(teamName);
  const urls: string[] = [];
  
  // 우선순위 1: {year}_{ShortName}_logo_square.png (예: 2024_T1_logo_square.png)
  if (shortName) {
    urls.push(`${STORAGE_BASE}/${year}_${shortName}_logo_square.png`);
  }
  
  // 우선순위 2: {year}_{TeamName}_logo.png (예: 2024_Gen.G_logo.png)
  urls.push(`${STORAGE_BASE}/${year}_${fileName}_logo.png`);
  
  // 우선순위 3: {year}_{TeamName}_logo.webp
  urls.push(`${STORAGE_BASE}/${year}_${fileName}_logo.webp`);
  
  return urls;
}

/**
 * 첫 번째 팀 로고 URL 반환 (FIFAReveal에서 폴백 처리)
 */
export function getTeamLogoPath(year: number, teamName: string): string | null {
  const urls = getTeamLogoUrls(year, teamName);
  return urls[0] || null;
}