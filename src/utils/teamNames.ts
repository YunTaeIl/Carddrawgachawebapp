// 리그 팀명 한글 매핑 유틸
// AI 팀 영문명을 한글 팀명으로 변환

/**
 * AI 팀 인덱스(0~8) 또는 영문명을 한글 팀명으로 변환
 */

// 한글 팀명 풀 (실제 LCK 팀명 느낌)
const KOREAN_TEAM_NAMES: Record<string, string> = {
  // 인덱스 기반 매핑 (0~8)
  "0": "천둥기업",
  "1": "백야",
  "2": "홍염",
  "3": "청룡단",
  "4": "검은장미",
  "5": "은빛늑대",
  "6": "폭풍전자",
  "7": "태양검",
  "8": "빙결왕국",
  
  // 영문 팀명 매핑 (기존 AI_TEAM_NAMES와 호환)
  "Team Alpha": "천둥기업",
  "Team Bravo": "백야",
  "Team Charlie": "홍염",
  "Team Delta": "청룡단",
  "Team Echo": "검은장미",
  "Team Foxtrot": "은빛늑대",
  "Team Golf": "폭풍전자",
  "Team Hotel": "태양검",
  "Team India": "빙결왕국",
  
  // team_id 기반 매핑 (ai_team_0 ~ ai_team_8)
  "ai_team_0": "천둥기업",
  "ai_team_1": "백야",
  "ai_team_2": "홍염",
  "ai_team_3": "청룡단",
  "ai_team_4": "검은장미",
  "ai_team_5": "은빛늑대",
  "ai_team_6": "폭풍전자",
  "ai_team_7": "태양검",
  "ai_team_8": "빙결왕국",
};

/**
 * 팀명을 한글로 변환
 * @param teamNameOrId 팀명 또는 팀 ID
 * @returns 한글 팀명 (변환 실패 시 원본 반환)
 */
export function getKoreanTeamName(teamNameOrId: string): string {
  // 플레이어 팀은 그대로 반환
  if (teamNameOrId === "MY TEAM" || teamNameOrId === "player_team") {
    return "MY TEAM";
  }
  
  // 매핑된 한글 팀명 반환
  const koreanName = KOREAN_TEAM_NAMES[teamNameOrId];
  if (koreanName) {
    return koreanName;
  }
  
  // ai_team_X 형식에서 인덱스 추출 시도
  const match = teamNameOrId.match(/ai_team_(\d+)/);
  if (match) {
    const index = match[1];
    const name = KOREAN_TEAM_NAMES[index];
    if (name) {
      return name;
    }
  }
  
  // 변환 실패 시 원본 반환
  return teamNameOrId;
}

/**
 * 팀 코드(A~I)를 한글 팀명으로 변환
 * @param teamCode A~I 문자
 * @returns 한글 팀명
 */
export function getTeamNameByCode(teamCode: string): string {
  const codeMap: Record<string, string> = {
    "A": "천둥기업",
    "B": "백야",
    "C": "홍염",
    "D": "청룡단",
    "E": "검은장미",
    "F": "은빛늑대",
    "G": "폭풍전자",
    "H": "태양검",
    "I": "빙결왕국",
  };
  
  return codeMap[teamCode.toUpperCase()] || teamCode;
}

/**
 * 팀명/ID에서 팀 코드(A~I) 추출
 * @param teamNameOrId 팀명 또는 팀 ID
 * @returns 팀 코드 문자 (추출 실패 시 빈 문자열)
 */
export function getTeamCode(teamNameOrId: string): string {
  // ai_team_X 형식에서 인덱스 추출 → 코드로 변환
  const match = teamNameOrId.match(/ai_team_(\d+)/);
  if (match) {
    const index = parseInt(match[1], 10);
    const codes = ["A", "B", "C", "D", "E", "F", "G", "H", "I"];
    return codes[index] || "";
  }
  
  return "";
}
