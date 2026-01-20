// LCK 팀 로고 경로 매핑 (Supabase Storage 사용)

import { projectId } from "/utils/supabase/info";

const STORAGE_BASE = `https://${projectId}.supabase.co/storage/v1/object/public/team-logos`;

/**
 * 팀명을 파일명 형식으로 변환 (실제 Supabase 파일명과 일치)
 */
function getTeamFileName(teamName: string): string {
  const mapping: Record<string, string> = {
    // 현재 메이저 팀
    "T1": "T1",
    "Gen.G": "Gen.G",
    "Hanwha Life Esports": "Hanwha_Life_Esports",
    "Dplus Kia": "Dplus_Kia",
    "KT Rolster": "KT_Rolster",
    "DRX": "DRX",
    "Nongshim RedForce": "NS",
    "Kwangdong Freecs": "Kwangdong_Freecs",
    "BNK FEARX": "FOX",
    
    // BRION 계열
    "Fredit BRION": "Fredit_BRION",
    "OKSavingsBank BRION": "OKSavingsBank_BRION",
    "OK BRION": "OK_BRION",
    
    // 샌드박스
    "SANDBOX Gaming": "SB",
    "Liiv SANDBOX": "Liiv_SANDBOX",
    
    // 담원/DWG
    "DAMWON Gaming": "DAMWON_Gaming",
    "DWG KIA": "DWG_KIA",
    
    // 프릭스
    "Afreeca Freecs": "Afreeca_Freecs",
    "DN Freecs": "DN_Freecs",
    
    // Griffin (2018-2020)
    "Griffin": "griffin",
    
    // ROX/KOO Tigers
    "ROX Tigers": "ROX_Tigers",  // 🔥 정확한 철자 (Tigers)
    "KOO Tigers": "KOO_Tigers",
    
    // 삼성 갤럭시
    "Samsung Galaxy": "Samsung_Galaxy",
    "Samsung White": "Samsung_galaxy_White",
    "Samsung Blue": "Samsung_galaxy_Blue",
    
    // SK Telecom T1 (구단명)
    "SK Telecom T1": "SKT",
    "SK Telecom T1 K": "SKT_T1_K",  // 🔥 2013-2014 K팀 (풀네임)
    "SK Telecom T1 S": "SKT_T1_S",  // 🔥 2013-2014 S팀 (풀네임)
    "SKT T1 K": "SKT_T1_K",          // 🔥 2013-2014 K팀 (약칭)
    "SKT T1 S": "SKT_T1_S",          // 🔥 2013-2014 S팀 (약칭)
    "SKT T1": "SKT",                 // 🔥 일반 SKT T1
    "SKT": "SKT",                    // 🔥 SKT만 있는 경우
    
    // KT Rolster (초기)
    "KT Rolster Arrows": "KT_Rolster_Arrows",
    "KT Rolster Bullets": "KT_Rolster_Bullets",
    
    // CJ Entus
    "CJ Entus": "CJ_Entus",
    "CJ Entus Blaze": "CJ_Entus_Blaze",
    "CJ Entus Frost": "CJ_Entus_Frost",
    
    // NaJin
    "NaJin e-mFire": "NaJin_e-mFire",
    "NaJin Black Sword": "NaJin_Black_Sword",
    "NaJin White Shield": "NaJin_White_Shield",
    
    // MVP
    "MVP": "MVP",
    "MVP Blue": "MVP_Blue",
    "MVP Ozone": "MVP_Ozone",
    
    // Jin Air
    "Jin Air Green Wings": "Jin_Air_Green_Wings",
    "Jin Air Falcons": "Jin_Air_Falcons",
    "Jin Air Stealths": "Jin_Air_Stealths",
    
    // Incredible Miracle
    "Incredible Miracle": "Incredible_Miracle",
    "Incredible Miracle 1": "Incredible_Miracle_1",
    "Incredible Miracle 2": "Incredible_Miracle_2",
    
    // ESC/Ever
    "ESC Ever": "ESC_Ever",
    "Ever8 Winners": "Ever8_Winners",
    
    // Longzhu
    "Longzhu Gaming": "Longzhu_Gaming",
    "Kingzone DragonX": "Kingzone_DragonX",
    
    // 기타 팀들
    "bbq Olivers": "bbq_Olivers",
    "SBENU Sonicboom": "SBENU_Sonicboom",
    "Xenics Storm": "Xenics_Storm",
    "Xenics Blast": "Xenics_Blast",
    "APK Prince": "APK_Prince",
    "SeolHaeOne Prince": "SeolHaeOne_Prince",
    "Bigfile Miracle": "Bigfile_Miracle",
    "MiG Blitz": "MiG_Blitz",
    "MKZ": "MKZ",
    "Rebels Anarchy": "Rebels_Anarchy",
    "Team Dynamics": "Team_Dynamics"
  };
  
  return mapping[teamName] || teamName.replace(/\s+/g, '_').replace(/\./g, '');
}

/**
 * 약어 매핑 (square 파일용)
 */
function getTeamShortName(teamName: string): string {
  const shortMapping: Record<string, string> = {
    // 현재 메이저 팀
    "T1": "T1",
    "Gen.G": "GEN",
    "Hanwha Life Esports": "HLE",
    "Dplus Kia": "DK",
    "KT Rolster": "KT",
    "DRX": "DRX",
    "Nongshim RedForce": "NS",
    "Kwangdong Freecs": "KDF",
    "BNK FEARX": "FOX",
    
    // BRION 계열
    "Fredit BRION": "BRO",
    "OKSavingsBank BRION": "BRO",
    "OK BRION": "BRO",
    
    // 샌드박스
    "SANDBOX Gaming": "SB",
    "Liiv SANDBOX": "LSB",
    
    // 담원/DWG
    "DAMWON Gaming": "DWG",
    "DWG KIA": "DWG",
    
    // 프릭스
    "Afreeca Freecs": "AF",
    "DN Freecs": "KDF",
    
    // Griffin
    "Griffin": "GRF",
    
    // ROX/KOO Tigers
    "ROX Tigers": "ROX",
    "KOO Tigers": "KOO",
    
    // 삼성 갤럭시
    "Samsung Galaxy": "SSG",
    "Samsung White": "SSW",
    "Samsung Blue": "SSB",
    
    // SK Telecom T1
    "SK Telecom T1": "SKT",
    "SK Telecom T1 K": "SKT",
    "SK Telecom T1 S": "SKT",
    
    // KT Rolster
    "KT Rolster Arrows": "KTA",
    "KT Rolster Bullets": "KTB",
    
    // CJ Entus
    "CJ Entus": "CJ",
    "CJ Entus Blaze": "CJB",
    "CJ Entus Frost": "CJF",
    
    // NaJin
    "NaJin e-mFire": "NJE",
    "NaJin Black Sword": "NJBS",
    "NaJin White Shield": "NJWS",
    
    // MVP
    "MVP": "MVP",
    "MVP Blue": "MVPB",
    "MVP Ozone": "MVPO",
    
    // Jin Air
    "Jin Air Green Wings": "JAG",
    "Jin Air Falcons": "JAF",
    "Jin Air Stealths": "JAS",
    
    // Incredible Miracle
    "Incredible Miracle": "IM",
    "Incredible Miracle 1": "IM1",
    "Incredible Miracle 2": "IM2",
    
    // ESC/Ever
    "ESC Ever": "ESC",
    "Ever8 Winners": "E8W",
    
    // Longzhu/Kingzone
    "Longzhu Gaming": "LZ",
    "Kingzone DragonX": "KZ",
    
    // 기타 팀들
    "bbq Olivers": "BBQ",
    "SBENU Sonicboom": "SBN",
    "Xenics Storm": "XS",
    "Xenics Blast": "XB",
    "APK Prince": "APK",
    "SeolHaeOne Prince": "SHP",
    "Bigfile Miracle": "BFM",
    "MiG Blitz": "MGB",
    "MKZ": "MKZ",
    "Rebels Anarchy": "RA",
    "Team Dynamics": "TDM"
  };
  
  return shortMapping[teamName];
}

/**
 * 팀 로고 URL 배열 (우선순위대로)
 * 1. square.png
 * 2. square.svg
 * 3. logo.png
 * 4. logo.svg
 * 5. logo.webp
 */
export function getTeamLogoUrls(year: number, teamName: string): string[] {
  const fileName = getTeamFileName(teamName);
  const shortName = getTeamShortName(teamName);
  const urls: string[] = [];
  
  // 우선순위 1-2: {year}_{ShortName}_logo_square (png, svg)
  if (shortName) {
    urls.push(`${STORAGE_BASE}/${year}_${shortName}_logo_square.png`);
    urls.push(`${STORAGE_BASE}/${year}_${shortName}_logo_square.svg`);
  }
  
  // 우선순위 3: {year}_{TeamName}_logo.png
  urls.push(`${STORAGE_BASE}/${year}_${fileName}_logo.png`);
  
  // 우선순위 4: {year}_{TeamName}_logo.svg
  urls.push(`${STORAGE_BASE}/${year}_${fileName}_logo.svg`);
  
  // 우선순위 5: {year}_{TeamName}_logo.webp
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