// 유저 API 클라이언트
import { projectId, publicAnonKey } from "@/utils/supabaseAuth";

const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0`;

// API 호출 헬퍼
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Unknown error" }));
    throw new Error(error.error || `API Error: ${response.statusText}`);
  }

  return response.json();
}

// 프로필 생성
export async function createUserProfile(accessToken: string, username: string) {
  return apiCall("/user/profile", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ username }),
  });
}

// 프로필 조회
export async function getUserProfile(accessToken: string) {
  return apiCall("/user/profile", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// 게임 데이터 조회
export async function getGameData(accessToken: string) {
  return apiCall("/user/game-data", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// 출석 보상 요청. 같은 requestKey 재시도는 최초 결과를 그대로 반환한다.
export async function claimDailyAttendance(accessToken: string, requestKey: string) {
  return apiCall("/user/check-in", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Idempotency-Key": requestKey,
    },
  });
}

// 보유 카드 조회
export async function getUserCards(accessToken: string) {
  return apiCall("/user/cards", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// 카드 추가
export async function addUserCard(
  accessToken: string,
  cardId: string,
  instanceId: string,
  upgradeLevel: number = 0
) {
  return apiCall("/user/cards", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ cardId, instanceId, upgradeLevel }),
  });
}

// 카드 강화
export async function upgradeUserCard(
  accessToken: string,
  instanceId: string,
  upgradeLevel: number
) {
  return apiCall(`/user/cards/${instanceId}/upgrade`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ upgradeLevel }),
  });
}

// 스쿼드 조회
export async function getUserSquad(accessToken: string) {
  return apiCall("/user/squad", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

// 스쿼드 업데이트
export async function updateUserSquad(
  accessToken: string,
  squad: {
    top_card_instance_id?: string | null;
    jgl_card_instance_id?: string | null;
    mid_card_instance_id?: string | null;
    adc_card_instance_id?: string | null;
    sup_card_instance_id?: string | null;
  }
) {
  return apiCall("/user/squad", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(squad),
  });
}
