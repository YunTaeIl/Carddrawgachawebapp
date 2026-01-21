// 스쿼드 공유를 위한 암호화/복호화 유틸리티

export interface SquadRoster {
  top: string | null;
  jgl: string | null;
  mid: string | null;
  adc: string | null;
  sup: string | null;
}

// 암호화 키 (프로덕션에서는 환경변수로 관리)
const ENCRYPTION_KEY = "LCK_LEGENDS_MANAGER_2025";

// 간단한 XOR 암호화 (Base64 + 난독화)
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return result;
}

function xorDecrypt(encrypted: string, key: string): string {
  return xorEncrypt(encrypted, key); // XOR는 대칭적
}

/**
 * 스쿼드 데이터를 암호화된 문자열로 변환
 */
export function encryptSquadRoster(roster: SquadRoster): string {
  try {
    // JSON 직렬화
    const jsonStr = JSON.stringify(roster);
    
    // XOR 암호화
    const encrypted = xorEncrypt(jsonStr, ENCRYPTION_KEY);
    
    // Base64 인코딩 (URL-safe)
    const base64 = btoa(encrypted)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
    
    return base64;
  } catch (error) {
    console.error('스쿼드 암호화 실패:', error);
    throw new Error('스쿼드 암호화에 실패했습니다');
  }
}

/**
 * 암호화된 문자열을 스쿼드 데이터로 복호화
 */
export function decryptSquadRoster(encrypted: string): SquadRoster {
  try {
    // URL-safe Base64 디코딩
    const base64 = encrypted
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // 패딩 추가
    const padded = base64 + '==='.slice((base64.length + 3) % 4);
    
    // Base64 디코딩
    const decrypted = atob(padded);
    
    // XOR 복호화
    const jsonStr = xorDecrypt(decrypted, ENCRYPTION_KEY);
    
    // JSON 파싱
    const roster = JSON.parse(jsonStr);
    
    // 유효성 검증
    if (!roster || typeof roster !== 'object') {
      throw new Error('Invalid roster format');
    }
    
    const positions = ['top', 'jgl', 'mid', 'adc', 'sup'];
    for (const pos of positions) {
      if (!(pos in roster)) {
        throw new Error(`Missing position: ${pos}`);
      }
    }
    
    return roster as SquadRoster;
  } catch (error) {
    console.error('스쿼드 복호화 실패:', error);
    throw new Error('잘못된 공유 링크입니다');
  }
}

/**
 * 현재 스쿼드로 공유 URL 생성
 */
export function generateShareURL(roster: SquadRoster): string {
  const encrypted = encryptSquadRoster(roster);
  const baseURL = window.location.origin;
  return `${baseURL}/?page=shared_squad&roster=${encrypted}`;
}
