// LocalStorage 관리 (나중에 Supabase로 전환 예정)

import { UserData, CardPackType, PackPityState, PackStatistics } from "@/types/lck";

const STORAGE_KEY = "lck_gacha_user_data";

// 🔥 기본 팩별 천장 데이터 생성
function getDefaultPityData(): Record<CardPackType, PackPityState> {
  const packTypes: CardPackType[] = [
    "standard", "live_pack",
    "year_2013", "year_2014", "year_2015", "year_2016", "year_2017",
    "year_2018", "year_2019", "year_2020", "year_2021", "year_2022",
    "year_2023", "year_2024", "year_2025",
    "position_TOP", "position_JGL", "position_MID", "position_ADC", "position_SUP"
  ];
  
  const pityData: any = {};
  packTypes.forEach(pack => {
    pityData[pack] = { s_pity_stack: 0, a_pity_stack: 0 };
  });
  
  return pityData;
}

// 🔥 기본 팩별 통계 생성
function getDefaultPackStatistics(): Record<CardPackType, PackStatistics> {
  const packTypes: CardPackType[] = [
    "standard", "live_pack",
    "year_2013", "year_2014", "year_2015", "year_2016", "year_2017",
    "year_2018", "year_2019", "year_2020", "year_2021", "year_2022",
    "year_2023", "year_2024", "year_2025",
    "position_TOP", "position_JGL", "position_MID", "position_ADC", "position_SUP"
  ];
  
  const stats: any = {};
  packTypes.forEach(pack => {
    stats[pack] = { pulls: 0, rp_spent: 0 };
  });
  
  return stats;
}

export function getDefaultUserData(): UserData {
  return {
    currency: 5000, // 초기 재화 (비로그인)
    shards: 0,
    ownedCards: [],
    gachaState: {
      s_pity_stack: 0,
      a_pity_stack: 0,
      total_pulls: 0
    },
    pityData: getDefaultPityData(),
    packStatistics: getDefaultPackStatistics(),
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
    if (!stored) return getDefaultUserData();
    
    const data = JSON.parse(stored) as UserData;
    
    // 🔥 마이그레이션: 기존 데이터에 새 필드 추가
    if (!data.pityData || Object.keys(data.pityData).length === 0) {
      data.pityData = getDefaultPityData();
      // 기존 gachaState를 standard 팩으로 이전
      if (data.gachaState) {
        data.pityData.standard = {
          s_pity_stack: data.gachaState.s_pity_stack || 0,
          a_pity_stack: data.gachaState.a_pity_stack || 0
        };
      }
    }
    
    if (!data.packStatistics || Object.keys(data.packStatistics).length === 0) {
      data.packStatistics = getDefaultPackStatistics();
      // 기존 total_pulls를 standard 팩으로 이전
      if (data.gachaState?.total_pulls) {
        data.packStatistics.standard = {
          pulls: data.gachaState.total_pulls,
          rp_spent: data.gachaState.total_pulls * 200 // 단일 뽑기 기준
        };
      }
    }
    
    // 🔥 안전성: 팩별 데이터가 undefined면 기본값 설정
    const allPacks: CardPackType[] = [
      "standard", "live_pack",
      "year_2013", "year_2014", "year_2015", "year_2016", "year_2017",
      "year_2018", "year_2019", "year_2020", "year_2021", "year_2022",
      "year_2023", "year_2024", "year_2025",
      "position_TOP", "position_JGL", "position_MID", "position_ADC", "position_SUP"
    ];
    
    allPacks.forEach(pack => {
      if (!data.pityData[pack]) {
        data.pityData[pack] = { s_pity_stack: 0, a_pity_stack: 0 };
      }
      if (!data.packStatistics[pack]) {
        data.packStatistics[pack] = { pulls: 0, rp_spent: 0 };
      }
    });
    
    return data;
  } catch (error) {
    return getDefaultUserData();
  }
}

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    // Silent fail
  }
}

export function resetUserData(): void {
  localStorage.removeItem(STORAGE_KEY);
}