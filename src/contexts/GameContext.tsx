// 게임 전역 상태 관리 (DB 동기화 포함)

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { UserData, UserCard, LCKCard, GachaResult, GACHA_CONFIG, Position } from "@/types/lck";
import { loadUserData, saveUserData, getDefaultUserData } from "@/utils/localStorage";
import { pullSingle, pullTen, updateGachaState, craftCard, initializeCardPool, CardPackType } from "@/utils/gachaEngine";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getGameData, 
  updateGameData, 
  getUserCards, 
  addUserCard, 
  upgradeUserCard,
  getUserSquad,
  updateUserSquad 
} from "@/utils/userApi";
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
  setSquadCard: (position: Position, card: UserCard | null) => Promise<void>;
  
  // 유틸
  resetGame: () => void;
  addCurrency: (amount: number) => void;
  syncWithDB: () => Promise<void>;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, hasProfile, accessToken } = useAuth();
  const [userData, setUserData] = useState<UserData>(getDefaultUserData());
  const [isLoading, setIsLoading] = useState(true);
  const [cardPool, setCardPool] = useState<LCKCard[]>([]);

  // DB에서 데이터 로드
  const loadFromDB = async (token: string) => {
    try {
      // 1. 게임 데이터 로드
      const gameDataResult = await getGameData(token);
      const gameData = gameDataResult.gameData;
      
      // 2. 카드 데이터 로드
      const cardsResult = await getUserCards(token);
      const dbCards = cardsResult.cards;
      
      // 3. 스쿼드 로드
      const squadResult = await getUserSquad(token);
      const squadData = squadResult.squad;
      
      // 4. 카드 풀에서 실제 카드 정보 가져오기
      const { getCardPool } = await import("@/data/supabaseCards");
      const allCards = await getCardPool();
      const cardMap = new Map(allCards.map(c => [c.id, c]));
      
      // DB 데이터를 UserData 형식으로 변환
      const loadedCards: UserCard[] = dbCards.map((dbCard: any) => {
        const baseCard = cardMap.get(dbCard.card_id);
        if (!baseCard) {
          console.warn(`카드를 찾을 수 없음: ${dbCard.card_id}`);
          return null;
        }
        return {
          ...baseCard,
          instanceId: dbCard.instance_id,
          upgradeLevel: dbCard.upgrade_level,
          obtainedAt: new Date(dbCard.obtained_at).getTime()
        };
      }).filter((c): c is UserCard => c !== null);
      
      const loadedData: UserData = {
        currency: gameData.currency,
        shards: gameData.shards,
        gachaState: {
          s_pity_stack: gameData.s_pity_stack,
          a_pity_stack: gameData.a_pity_stack,
          total_pulls: gameData.total_pulls
        },
        ownedCards: loadedCards,
        squad: {
          TOP: null,
          JGL: null,
          MID: null,
          ADC: null,
          SUP: null
        }
      };
      
      // 스쿼드 매핑 (instance_id로 카드 찾기)
      if (squadData.top_card_instance_id) {
        const card = loadedCards.find(c => c.instanceId === squadData.top_card_instance_id);
        if (card) loadedData.squad.TOP = card;
      }
      if (squadData.jgl_card_instance_id) {
        const card = loadedCards.find(c => c.instanceId === squadData.jgl_card_instance_id);
        if (card) loadedData.squad.JGL = card;
      }
      if (squadData.mid_card_instance_id) {
        const card = loadedCards.find(c => c.instanceId === squadData.mid_card_instance_id);
        if (card) loadedData.squad.MID = card;
      }
      if (squadData.adc_card_instance_id) {
        const card = loadedCards.find(c => c.instanceId === squadData.adc_card_instance_id);
        if (card) loadedData.squad.ADC = card;
      }
      if (squadData.sup_card_instance_id) {
        const card = loadedCards.find(c => c.instanceId === squadData.sup_card_instance_id);
        if (card) loadedData.squad.SUP = card;
      }
      
      setUserData(loadedData);
      console.log("DB에서 데이터 로드 완료:", loadedData);
    } catch (error) {
      console.error("DB 로드 실패:", error);
      toast.error("데이터 로드에 실패했습니다");
    }
  };

  // 초기 로드
  useEffect(() => {
    const loadData = async () => {
      // 카드 풀 로드
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
            
            // 백그라운드 업데이트
            initializeCardPool().then(async () => {
              const { getCardPool } = await import("@/data/supabaseCards");
              const pool = await getCardPool();
              localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
              localStorage.setItem('lck_card_pool_timestamp', now.toString());
              setCardPool(pool);
            }).catch(() => {});
          } catch (err) {}
        }
      } else {
        try {
          await initializeCardPool();
          const { getCardPool } = await import("@/data/supabaseCards");
          const pool = await getCardPool();
          setCardPool(pool);
          localStorage.setItem('lck_card_pool_cache', JSON.stringify(pool));
          localStorage.setItem('lck_card_pool_timestamp', now.toString());
        } catch (err) {}
      }
      
      // 유저 데이터 로드
      if (isAuthenticated && hasProfile && accessToken) {
        // 로그인: DB에서 로드
        await loadFromDB(accessToken);
      } else {
        // 비로그인: LocalStorage에서 로드
        const loaded = loadUserData();
        setUserData(loaded);
      }
      
      setIsLoading(false);
    };
    
    loadData();
  }, [isAuthenticated, hasProfile, accessToken]);

  // 데이터 저장 (비로그인 시에만 LocalStorage)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      saveUserData(userData);
    }
  }, [userData, isLoading, isAuthenticated]);

  // DB 동기화 함수
  const syncWithDB = async () => {
    if (!accessToken || !isAuthenticated || !hasProfile) return;
    
    try {
      await loadFromDB(accessToken);
      toast.success("데이터 동기화 완료!");
    } catch (error) {
      console.error("동기화 실패:", error);
      toast.error("동기화에 실패했습니다");
    }
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

    // 상태 업데이트
    const newUserData = {
      ...userData,
      currency: userData.currency - cost,
      shards: userData.shards + result.shardsGained,
      ownedCards: result.isDupe ? userData.ownedCards : [...userData.ownedCards, newCard],
      gachaState: updateGachaState(userData.gachaState, [result])
    };
    
    setUserData(newUserData);

    // DB 저장 (로그인한 경우)
    if (accessToken && isAuthenticated && hasProfile) {
      try {
        await updateGameData(accessToken, {
          currency: newUserData.currency,
          shards: newUserData.shards,
          s_pity_stack: newUserData.gachaState.s_pity_stack,
          a_pity_stack: newUserData.gachaState.a_pity_stack,
          total_pulls: newUserData.gachaState.total_pulls
        });
        
        if (!result.isDupe) {
          await addUserCard(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel);
        }
      } catch (error) {
        console.error("DB 저장 실패:", error);
      }
    }

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

    // DB 저장
    if (accessToken && isAuthenticated && hasProfile) {
      try {
        await updateGameData(accessToken, {
          currency: newUserData.currency,
          shards: newUserData.shards,
          s_pity_stack: newUserData.gachaState.s_pity_stack,
          a_pity_stack: newUserData.gachaState.a_pity_stack,
          total_pulls: newUserData.gachaState.total_pulls
        });
        
        for (const card of newCards) {
          await addUserCard(accessToken, card.id, card.instanceId, card.upgradeLevel);
        }
      } catch (error) {
        console.error("DB 저장 실패:", error);
      }
    }

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

    // DB 저장
    if (accessToken && isAuthenticated && hasProfile) {
      try {
        await updateGameData(accessToken, { shards: newUserData.shards });
        await upgradeUserCard(accessToken, cardInstanceId, newCards[cardIndex].upgradeLevel);
      } catch (error) {
        console.error("DB 저장 실패:", error);
      }
    }

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

    // DB 저장
    if (accessToken && isAuthenticated && hasProfile) {
      try {
        await updateGameData(accessToken, { shards: newUserData.shards });
        await addUserCard(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel);
      } catch (error) {
        console.error("DB 저장 실패:", error);
      }
    }

    toast.success(`${grade}등급 카드 제작 성공!`);
    return newCard;
  };

  // 스쿼드 설정
  const setSquadCard = async (position: Position, card: UserCard | null) => {
    const newUserData = {
      ...userData,
      squad: {
        ...userData.squad,
        [position]: card
      }
    };
    
    setUserData(newUserData);

    // DB 저장
    if (accessToken && isAuthenticated && hasProfile) {
      try {
        const squadUpdate: any = {};
        squadUpdate[`${position.toLowerCase()}_card_instance_id`] = card?.instanceId || null;
        await updateUserSquad(accessToken, squadUpdate);
      } catch (error) {
        console.error("스쿼드 저장 실패:", error);
      }
    }
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
    
    // DB 저장
    if (accessToken && isAuthenticated && hasProfile) {
      updateGameData(accessToken, { currency: newUserData.currency }).catch(err => {
        console.error("재화 업데이트 실패:", err);
      });
    }
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
        addCurrency,
        syncWithDB
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