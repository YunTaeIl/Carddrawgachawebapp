// LocalStorage 관리 (나중에 Supabase로 전환 예정)

import { UserData, GachaState } from "@/types/lck";

const STORAGE_KEY = "lck_gacha_user_data";

export function getDefaultUserData(): UserData {
  return {
    currency: 5000, // 초기 재화
    shards: 0,
    ownedCards: [],
    gachaState: {
      s_pity_stack: 0,
      a_pity_stack: 0,
      total_pulls: 0
    },
    squad: {
      TOP: null,
      JGL: null,
      MID: null,
      ADC: null,
      SUP: null
    }
  };
}

export function loadUserData(): UserData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return getDefaultUserData();
    }
    return JSON.parse(stored) as UserData;
  } catch (error) {
    console.error("Failed to load user data:", error);
    return getDefaultUserData();
  }
}

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Failed to save user data:", error);
  }
}

export function resetUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}