// 게임 전역 상태 관리

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData, UserCard, LCKCard, GachaResult, GACHA_CONFIG, Position } from "@/types/lck";
import { loadUserData, saveUserData, getDefaultUserData } from "@/utils/localStorage";
import { pullSingle, pullTen, updateGachaState, craftCard, initializeCardPool } from "@/utils/gachaEngine";
import { toast } from "sonner";

interface GameContextType {
  userData: UserData;
  isLoading: boolean;
  cardPool: LCKCard[];  // 🔥 카드 풀 추가
  
  // 가챠
  pullSingleGacha: () => Promise<GachaResult | null>;
  pullTenGacha: () => Promise<GachaResult[] | null>;
  
  // 샤드
  upgradeCard: (cardInstanceId: string) => boolean;
  craftCardWithShards: (grade: "A" | "S") => UserCard | null;
  
  // 스쿼드
  setSquadCard: (position: Position, card: UserCard | null) => void;
  
  // 유틸
  resetGame: () => void;
  addCurrency: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [userData, setUserData] = useState<UserData>(getDefaultUserData());
  const [isLoading, setIsLoading] = useState(true);
  const [cardPool, setCardPool] = useState<LCKCard[]>([]);  // 🔥 카드 풀 상태

  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      // 유저 데이터 로드
      const loaded = loadUserData();
      setUserData(loaded);
      
      // 🔥 카드 풀 캐싱: localStorage에서 먼저 로드, 백그라운드에서 업데이트
      const cachedPool = localStorage.getItem('lck_card_pool_cache');
      const cacheTimestamp = localStorage.getItem('lck_card_pool_timestamp');
      const now = Date.now();
      const CACHE_DURATION = 1000 * 60 * 60; // 1시간
      
      if (cachedPool && cacheTimestamp) {
        const timestamp = parseInt(cacheTimestamp);
        if (now - timestamp < CACHE_DURATION) {
          // 캐시가 유효하면 즉시 사용
          try {
            const pool = JSON.parse(cachedPool);
            setCardPool(pool);
            setIsLoading(false);
            console.log('카드 풀 캐시 로드 완료 (즉시)');
            
            // 백그라운드에서 업데이트 체크
            initializeCardPool().then(async () => {
              const { getCardPool } = await import("@/data/supabaseCards");
              const pool = await getCardPool();
              localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
              localStorage.setItem('lck_card_pool_timestamp', now.toString());
              setCardPool(pool);
            }).catch(err => console.error('백그라운드 카드 풀 업데이트 실패:', err));
            
            return;
          } catch (err) {
            console.error('캐시 파싱 실패:', err);
          }
        }
      }
      
      // 캐시가 없거나 만료됨 → Supabase에서 로드
      try {
        await initializeCardPool();
        const { getCardPool } = await import("@/data/supabaseCards");
        const pool = await getCardPool();
        setCardPool(pool);
        setIsLoading(false);
        // 캐시 저장
        localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
        localStorage.setItem('lck_card_pool_timestamp', now.toString());
        console.log('카드 풀 Supabase 로드 완료');
      } catch (err) {
        console.error('카드 풀 로드 실패:', err);
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 저장 (userData 변경 시)
  useEffect(() => {
    if (!isLoading) {
      saveUserData(userData);
    }
  }, [userData, isLoading]);

  // 단일 가챠
  const pullSingleGacha = async (): Promise<GachaResult | null> => {
    if (userData.currency < GACHA_CONFIG.SINGLE_COST) {
      toast.error("재화가 부족합니다!");
      return null;
    }

    const ownedCardIds = userData.ownedCards.map(c => c.id);
    const result = pullSingle(userData.gachaState, ownedCardIds);
    
    // 새 카드 생성
    const newCard: UserCard = {
      ...result.card,
      instanceId: `${result.card.id}_${Date.now()}_${Math.random()}`,
      obtainedAt: Date.now(),
      upgradeLevel: 0
    };

    // 상태 업데이트
    setUserData(prev => ({
      ...prev,
      currency: prev.currency - GACHA_CONFIG.SINGLE_COST,
      shards: prev.shards + result.shardsGained,
      ownedCards: result.isDupe ? prev.ownedCards : [...prev.ownedCards, newCard],
      gachaState: updateGachaState(prev.gachaState, [result])
    }));

    return result;
  };

  // 10연차
  const pullTenGacha = async (): Promise<GachaResult[] | null> => {
    if (userData.currency < GACHA_CONFIG.TEN_COST) {
      toast.error("재화가 부족합니다!");
      return null;
    }

    const ownedCardIds = userData.ownedCards.map(c => c.id);
    const results = pullTen(userData.gachaState, ownedCardIds);
    
    // 새 카드들 생성
    const newCards: UserCard[] = results
      .filter(r => !r.isDupe)
      .map(r => ({
        ...r.card,
        instanceId: `${r.card.id}_${Date.now()}_${Math.random()}`,
        obtainedAt: Date.now(),
        upgradeLevel: 0
      }));

    const totalShards = results.reduce((sum, r) => sum + r.shardsGained, 0);

    setUserData(prev => ({
      ...prev,
      currency: prev.currency - GACHA_CONFIG.TEN_COST,
      shards: prev.shards + totalShards,
      ownedCards: [...prev.ownedCards, ...newCards],
      gachaState: updateGachaState(prev.gachaState, results)
    }));

    return results;
  };

  // 카드 강화
  const upgradeCard = (cardInstanceId: string): boolean => {
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

    setUserData(prev => {
      const newCards = [...prev.ownedCards];
      newCards[cardIndex] = {
        ...newCards[cardIndex],
        upgradeLevel: newCards[cardIndex].upgradeLevel + 1
      };
      
      return {
        ...prev,
        shards: prev.shards - GACHA_CONFIG.UPGRADE_COST,
        ownedCards: newCards
      };
    });

    toast.success(`${card.name} 강화 성공! (+1 OVR)`);
    return true;
  };

  // 샤드로 카드 제작
  const craftCardWithShards = (grade: "A" | "S"): UserCard | null => {
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

    setUserData(prev => ({
      ...prev,
      shards: prev.shards - cost,
      ownedCards: [...prev.ownedCards, newCard]
    }));

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
  };

  // 게임 리셋
  const resetGame = () => {
    setUserData(getDefaultUserData());
    toast.success("게임이 초기화되었습니다!");
  };

  // 재화 추가 (디버그용)
  const addCurrency = (amount: number) => {
    setUserData(prev => ({
      ...prev,
      currency: prev.currency + amount
    }));
  };

  return (
    <GameContext.Provider
      value={{
        userData,
        isLoading,
        cardPool,  // 🔥 카드 풀 추가
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