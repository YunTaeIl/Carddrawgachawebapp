// 게임 전역 상태 관리 (DB 동기화 포함)

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserData, UserCard, LCKCard, GachaResult, GACHA_CONFIG, Position } from "@/types/lck";
import { loadUserData, saveUserData, getDefaultUserData } from "@/utils/localStorage";
import { pullSingle, pullTen, updateGachaState, craftCard, initializeCardPool, CardPackType } from "@/utils/gachaEngine";
import { useAuth } from "@/contexts/AuthContext";
import { updateGameData, addUserCard as apiAddUserCard, upgradeUserCard as apiUpgradeUserCard } from "@/utils/userApi";
import { toast } from "sonner";

interface GameContextType {
  userData: UserData;
  isLoading: boolean;
  cardPool: LCKCard[];
  
  // 가챠
  pullSingleGacha: (packType?: CardPackType) => Promise<GachaResult | null>;
  pullTenGacha: (packType?: CardPackType) => Promise<GachaResult[] | null>;
  
  // 샤드
  upgradeCard: (cardInstanceId: string) => Promise<boolean>;
  craftCardWithShards: (grade: "A" | "S") => Promise<UserCard | null>;
  
  // 스쿼드
  setSquadCard: (position: Position, card: UserCard | null) => void;
  
  // 유틸
  resetGame: () => void;
  addCurrency: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, accessToken } = useAuth();
  const [userData, setUserData] = useState<UserData>(getDefaultUserData());
  const [isLoading, setIsLoading] = useState(true);
  const [cardPool, setCardPool] = useState<LCKCard[]>([]);
  
  // DB 저장 디바운스용
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      // 유저 데이터 로드 (LocalStorage)
      const loaded = loadUserData();
      setUserData(loaded);
      
      // 카드 풀 캐싱
      const cachedPool = localStorage.getItem('lck_card_pool_cache');
      const cacheTimestamp = localStorage.getItem('lck_card_pool_timestamp');
      const now = Date.now();
      const CACHE_DURATION = 1000 * 60 * 60; // 1시간
      
      if (cachedPool && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp);
        if (now - timestamp < CACHE_DURATION) {
          try {
            const pool = JSON.parse(cachedPool);
            setCardPool(pool);
            setIsLoading(false);
            
            // 백그라운드 업데이트
            initializeCardPool().then(async () => {
              const { getCardPool } = await import("@/data/supabaseCards");
              const pool = await getCardPool();
              localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
              localStorage.setItem('lck_card_pool_timestamp', now.toString());
              setCardPool(pool);
            }).catch(() => {});
            
            return;
          } catch (err) {}
        }
      }
      
      // 캐시 없음 → Supabase에서 로드
      try {
        await initializeCardPool();
        const { getCardPool } = await import("@/data/supabaseCards");
        const pool = await getCardPool();
        setCardPool(pool);
        setIsLoading(false);
        localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
        localStorage.setItem('lck_card_pool_timestamp', now.toString());
      } catch (err) {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // LocalStorage 저장 (항상)
  useEffect(() => {
    if (!isLoading) {
      saveUserData(userData);
    }
  }, [userData, isLoading]);

  // DB 저장 함수 (디바운스)
  const saveGameDataToDB = async (data: UserData) => {
    if (!isAuthenticated || !accessToken) return;
    
    // 디바운스: 1초 후 저장
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateGameData(accessToken, {
          currency: data.currency,
          shards: data.shards,
          s_pity_stack: data.gachaState.s_pity_stack,
          a_pity_stack: data.gachaState.a_pity_stack,
          total_pulls: data.gachaState.total_pulls
        });
        console.log("✅ DB 저장 성공");
      } catch (error) {
        console.error("❌ DB 저장 실패:", error);
      }
    }, 1000);
  };

  // 단일 가챠
  const pullSingleGacha = async (packType?: CardPackType): Promise<GachaResult | null> => {
    const cost = packType ? GACHA_CONFIG.PACK_COSTS[packType] : GACHA_CONFIG.SINGLE_COST;
    if (userData.currency < cost) {
      toast.error("재화가 부족합니다!");
      return null;
    }

    const ownedCardIds = userData.ownedCards.map(c => c.id);
    const result = pullSingle(userData.gachaState, ownedCardIds, packType);
    
    const newCard: UserCard = {
      ...result.card,
      instanceId: `${result.card.id}_${Date.now()}_${Math.random()}`,
      obtainedAt: Date.now(),
      upgradeLevel: 0
    };

    const newUserData = {
      ...userData,
      currency: userData.currency - cost,
      shards: userData.shards + result.shardsGained,
      ownedCards: result.isDupe ? userData.ownedCards : [...userData.ownedCards, newCard],
      gachaState: updateGachaState(userData.gachaState, [result])
    };
    
    setUserData(newUserData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken && !result.isDupe) {
      try {
        await apiAddUserCard(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel);
      } catch (error) {
        console.error("카드 DB 저장 실패:", error);
      }
    }
    
    saveGameDataToDB(newUserData);

    return result;
  };

  // 10연차
  const pullTenGacha = async (packType?: CardPackType): Promise<GachaResult[] | null> => {
    const cost = packType ? GACHA_CONFIG.TEN_COSTS[packType] : GACHA_CONFIG.TEN_COSTS.standard;
    if (userData.currency < cost) {
      toast.error("재화가 부족합니다!");
      return null;
    }

    const ownedCardIds = userData.ownedCards.map(c => c.id);
    const results = pullTen(userData.gachaState, ownedCardIds, packType);
    
    const newCards: UserCard[] = results
      .filter(r => !r.isDupe)
      .map(r => ({
        ...r.card,
        instanceId: `${r.card.id}_${Date.now()}_${Math.random()}`,
        obtainedAt: Date.now(),
        upgradeLevel: 0
      }));

    const totalShards = results.reduce((sum, r) => sum + r.shardsGained, 0);

    const newUserData = {
      ...userData,
      currency: userData.currency - cost,
      shards: userData.shards + totalShards,
      ownedCards: [...userData.ownedCards, ...newCards],
      gachaState: updateGachaState(userData.gachaState, results)
    };
    
    setUserData(newUserData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken) {
      try {
        for (const card of newCards) {
          await apiAddUserCard(accessToken, card.id, card.instanceId, card.upgradeLevel);
        }
      } catch (error) {
        console.error("카드 DB 저장 실패:", error);
      }
    }
    
    saveGameDataToDB(newUserData);

    return results;
  };

  // 카드 강화
  const upgradeCard = async (cardInstanceId: string): Promise<boolean> => {
    const cardIndex = userData.ownedCards.findIndex(c => c.instanceId === cardInstanceId);
    if (cardIndex === -1) return false;
    
    const card = userData.ownedCards[cardIndex];
    if (card.upgradeLevel >= GACHA_CONFIG.MAX_UPGRADE) {
      toast.error("최대 강화 레벨입니다!");
      return false;
    }
    
    if (userData.shards < GACHA_CONFIG.UPGRADE_COST) {
      toast.error("샤드가 부족합니다!");
      return false;
    }

    const newCards = [...userData.ownedCards];
    newCards[cardIndex] = {
      ...newCards[cardIndex],
      upgradeLevel: newCards[cardIndex].upgradeLevel + 1
    };
    
    const newUserData = {
      ...userData,
      shards: userData.shards - GACHA_CONFIG.UPGRADE_COST,
      ownedCards: newCards
    };
    
    setUserData(newUserData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken) {
      try {
        await apiUpgradeUserCard(accessToken, cardInstanceId, newCards[cardIndex].upgradeLevel);
      } catch (error) {
        console.error("강화 DB 저장 실패:", error);
      }
    }
    
    saveGameDataToDB(newUserData);

    toast.success(`${card.name} 강화 성공! (+1 OVR)`);
    return true;
  };

  // 샤드로 카드 제작
  const craftCardWithShards = async (grade: "A" | "S"): Promise<UserCard | null> => {
    const cost = GACHA_CONFIG.CRAFT_COSTS[grade];
    
    if (userData.shards < cost) {
      toast.error("샤드가 부족합니다!");
      return null;
    }

    const craftedCard = craftCard(grade);
    const newCard: UserCard = {
      ...craftedCard,
      instanceId: `${craftedCard.id}_${Date.now()}_${Math.random()}`,
      obtainedAt: Date.now(),
      upgradeLevel: 0
    };

    const newUserData = {
      ...userData,
      shards: userData.shards - cost,
      ownedCards: [...userData.ownedCards, newCard]
    };
    
    setUserData(newUserData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken) {
      try {
        await apiAddUserCard(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel);
      } catch (error) {
        console.error("제작 카드 DB 저장 실패:", error);
      }
    }
    
    saveGameDataToDB(newUserData);

    toast.success(`${grade}등급 카드 제작 성공!`);
    return newCard;
  };

  // 스쿼드 설정
  const setSquadCard = (position: Position, card: UserCard | null) => {
    setUserData(prev => ({
      ...prev,
      squad: {
        ...prev.squad,
        [position]: card
      }
    }));
    
    // 스쿼드는 LocalStorage만 (나중에 추가 가능)
  };

  // 게임 리셋
  const resetGame = () => {
    setUserData(getDefaultUserData());
    toast.success("게임이 초기화되었습니다!");
  };

  // 재화 추가
  const addCurrency = (amount: number) => {
    const newUserData = {
      ...userData,
      currency: userData.currency + amount
    };
    setUserData(newUserData);
    saveGameDataToDB(newUserData);
  };

  return (
    <GameContext.Provider
      value={{
        userData,
        isLoading,
        cardPool,
        pullSingleGacha,
        pullTenGacha,
        upgradeCard,
        craftCardWithShards,
        setSquadCard,
        resetGame,
        addCurrency
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error("useGame must be used within GameProvider");
  }
  return context;
}