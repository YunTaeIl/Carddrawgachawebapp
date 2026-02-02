// 리그 데이터 Supabase 저장/로드 유틸리티

import { LeagueInstance } from "@/types/league";
import { projectId, publicAnonKey } from "/utils/supabase/info";

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-ffd115c0`;

/**
 * 리그 데이터 저장
 */
export async function saveLeagueToDb(userId: string, league: LeagueInstance): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/league/save`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({
        userId,
        league,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("❌ 서버 응답 에러:", error);
      throw new Error(`리그 저장 실패: ${error}`);
    }

    await response.json();
  } catch (error) {
    console.error("❌ 리그 DB 저장 오류:", error);
    throw error;
  }
}

/**
 * 리그 데이터 로드
 */
export async function loadLeagueFromDb(userId: string): Promise<LeagueInstance | null> {
  try {
    const response = await fetch(`${SERVER_URL}/league/load?userId=${userId}`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${publicAnonKey}`,
      },
    });

    if (!response.ok) {
      if (response.status === 404) {
        // 리그가 없는 경우 - 정상적인 상황이므로 에러 로그 없이 null 반환
        return null;
      }
      const error = await response.text();
      console.error("❌ 리그 로드 실패:", error);
      throw new Error(`리그 로드 실패: ${error}`);
    }

    const data = await response.json();
    return data.league;
  } catch (error: any) {
    // 404는 정상 케이스이므로 에러 로그 표시 안 함
    if (error?.message?.includes("404")) {
      return null;
    }
    console.error("❌ 리그 DB 로드 오류:", error);
    return null;
  }
}

/**
 * 리그 데이터 삭제
 */
export async function deleteLeagueFromDb(userId: string): Promise<void> {
  try {
    const response = await fetch(`${SERVER_URL}/league/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${publicAnonKey}`,
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`리그 삭제 실패: ${error}`);
    }
  } catch (error) {
    console.error("❌ 리그 DB 삭제 오류:", error);
    throw error;
  }
}
