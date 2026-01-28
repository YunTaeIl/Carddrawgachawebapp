// 게임 전역 상태 관리 (DB 동기화 포함)

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserData, UserCard, LCKCard, GachaResult, GACHA_CONFIG, Position, CardPackType, PackPityState } from "@/types/lck";
import { loadUserData, saveUserData, getDefaultUserData } from "@/utils/localStorage";
import { pullSingle, pullTen, updatePackPityState, craftCard, initializeCardPool } from "@/utils/gachaEngine";
import { useAuth } from "@/contexts/AuthContext";
import { 
  updateGameDataDirect, 
  addUserCardDirect, 
  upgradeUserCardDirect,
  getGameDataDirect,
  getUserCardsDirect,
  saveUserSquadDirect,
  getUserSquadDirect
} from "@/utils/supabaseDirect";
import { toast } from "sonner";

export interface CraftResult {
  card: UserCard;
  isDupe: boolean;
  shardsGained: number;
}

interface GameContextType {
  userData: UserData;
  isLoading: boolean;
  cardPool: LCKCard[];
  allCards: LCKCard[]; // 추가
  
  // 가챠
  pullSingleGacha: (packType?: CardPackType) => Promise<GachaResult | null>;
  pullTenGacha: (packType?: CardPackType) => Promise<GachaResult[] | null>;
  
  // 샤드
  upgradeCard: (cardInstanceId: string) => Promise<boolean>;
  craftCardWithShards: (grade: "A" | "S") => Promise<CraftResult | null>;
  
  // 스쿼드
  setSquadCard: (position: Position, card: UserCard | null) => void;
  saveSquadToDB: () => Promise<boolean>;
  
  // 유틸
  resetGame: () => void;
  addCurrency: (amount: number) => void;
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const isAuthenticated = auth?.isAuthenticated ?? false;
  const accessToken = auth?.accessToken ?? null;
  const [userData, setUserData] = useState<UserData>(getDefaultUserData());
  const [isLoading, setIsLoading] = useState(true);
  const [cardPool, setCardPool] = useState<LCKCard[]>([]);
  const [allCards, setAllCards] = useState<LCKCard[]>([]); // 추가
  const [dbLoaded, setDbLoaded] = useState(false); // DB 로드 완료 플래그
  
  // DB 저장 디바운스용
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 🔥 DB 저장 함수 (디바운스) - 팩별 천장 시스템
  const saveGameDataToDB = async (data: UserData) => {
    if (!isAuthenticated || !accessToken) {
      return;
    }
    
    // 디바운스: 1초 후 저장
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateGameDataDirect(accessToken, {
          currency: data.currency,
          shards: data.shards,
          pity_data: data.pityData, // 🔥 JSONB
          pack_statistics: data.packStatistics // 🔥 JSONB
        });
      } catch (error: any) {
        console.error("DB 저장 실패:", error);
      }
    }, 1000);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // 로그인 상태면 LocalStorage 로드 스킵 (DB에서 불러올 예정)
        if (isAuthenticated === true && accessToken) {
          // 기본 데이터만 설정 (DB에서 덮어씌워질 예정)
          setUserData(getDefaultUserData());
        } else {
          // 비로그인 시 LocalStorage에서 로드
          const saved = loadUserData();
          setUserData(saved);
        }
        
        // 카드 풀 초기화 (로그인 여부 상관없이 필수)
        const pool = await initializeCardPool();
        setCardPool(pool);
        setAllCards(pool); // allCards도 동일하게 설정
      } catch (error) {
        console.error("GameContext init error:", error);
        // 에러가 나도 기본 데이터로 진행
        setUserData(getDefaultUserData());
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 로그인 시 DB에서 재화 데이터 먼저 로드 (카드 풀 독립적)
  useEffect(() => {
    const loadGameDataFromDB = async () => {
      if (!isAuthenticated || !accessToken || dbLoaded) {
        return;
      }
      
      try {
        const gameData = await getGameDataDirect(accessToken);
        
        // 🔥 팩별 천장 데이터 파싱
        let pityData = gameData.pity_data || {};
        let packStatistics = gameData.pack_statistics || {};
        
        // 마이그레이션: 빈 객체면 기본값 설정
        if (Object.keys(pityData).length === 0) {
          const defaultData = getDefaultUserData();
          pityData = defaultData.pityData;
          // 기존 천장 데이터를 standard 팩으로 이전
          pityData.standard = {
            s_pity_stack: gameData.s_pity_stack || 0,
            a_pity_stack: gameData.a_pity_stack || 0
          };
        }
        
        if (Object.keys(packStatistics).length === 0) {
          const defaultData = getDefaultUserData();
          packStatistics = defaultData.packStatistics;
          packStatistics.standard = {
            pulls: gameData.total_pulls || 0,
            rp_spent: (gameData.total_pulls || 0) * 200
          };
        }
        
        // 재화 데이터 업데이트
        setUserData(prevData => ({
          ...prevData,
          currency: gameData.currency,
          shards: gameData.shards,
          lastCheckIn: gameData.last_check_in || undefined,
          pityData,
          packStatistics,
          gachaState: {
            s_pity_stack: gameData.s_pity_stack || 0,
            a_pity_stack: gameData.a_pity_stack || 0,
            total_pulls: gameData.total_pulls || 0
          }
        }));
        
        setDbLoaded(true);
      } catch (error) {
        // 에러 무시
      }
    };

    loadGameDataFromDB();
  }, [isAuthenticated, accessToken]);

  // 카드 데이터 로드 (카드 풀 로드 후)
  useEffect(() => {
    const loadCardsFromDB = async () => {
      if (!isAuthenticated || !accessToken) {
        return;
      }

      if (!cardPool || cardPool.length === 0) {
        return;
      }
      
      try {
        const dbCards = await getUserCardsDirect(accessToken);
        
        // DB 카드 데이터를 UserCard 형식으로 변환
        const userCards: UserCard[] = await Promise.all(
          dbCards.map(async (dbCard) => {
            const cardInfo = cardPool.find(c => c.id === dbCard.card_id);
            if (!cardInfo) {
              return null;
            }
            
            return {
              ...cardInfo,
              instanceId: dbCard.instance_id,
              upgradeLevel: dbCard.upgrade_level || 0,
              obtainedAt: new Date(dbCard.obtained_at).getTime()
            };
          })
        ).then(cards => cards.filter(c => c !== null) as UserCard[]);
        
        // 스쿼드 로드 (실패해도 카드는 로드)
        let squad = {
          TOP: null,
          JGL: null,
          MID: null,
          ADC: null,
          SUP: null
        };
        
        try {
          const squadData = await getUserSquadDirect(accessToken);
          
          // 스쿼드 카드 매칭
          squad = {
            TOP: userCards.find(c => c.instanceId === squadData.top_card_instance_id) || null,
            JGL: userCards.find(c => c.instanceId === squadData.jgl_card_instance_id) || null,
            MID: userCards.find(c => c.instanceId === squadData.mid_card_instance_id) || null,
            ADC: userCards.find(c => c.instanceId === squadData.adc_card_instance_id) || null,
            SUP: userCards.find(c => c.instanceId === squadData.sup_card_instance_id) || null
          };
        } catch (squadError) {
          // 스쿼드 없어도 계속 진행
        }
        
        // 카드 + 스쿼드 데이터 업데이트
        setUserData(prevData => ({
          ...prevData,
          ownedCards: userCards,
          squad: squad
        }));
        
        if (dbCards.length === 0) {
          toast.info("DB에 저장된 카드가 없습니다. 가챠를 뽑아보세요!");
        } else {
          toast.success(`DB에서 ${userCards.length}개 카드 로드 완료!`);
        }
      } catch (error) {
        toast.error("DB 데이터 로드 실패. LocalStorage 데이터를 사용합니다.");
      }
    };

    loadCardsFromDB();
  }, [isAuthenticated, accessToken, cardPool?.length]);

  // 데이터 변경 시 저장
  useEffect(() => {
    if (!isLoading) {
      // LocalStorage 저장 (항상)
      saveUserData(userData);
      
      // DB 저장 (로그인 시) - 재화만 저장
      if (isAuthenticated && accessToken) {
        saveGameDataToDB(userData);
      }
    }
  }, [
    userData.currency, 
    userData.shards, 
    userData.ownedCards.length,
    userData.pityData,
    userData.packStatistics,
    isLoading
  ]); // 스쿼드는 의존성에서 제외 → 스쿼드 변경 시 DB 저장 안 함

  // 🔥 가챠 1회 뽑기 (팩별 천장 시스템)
  const pullSingleGacha = async (packType?: CardPackType): Promise<GachaResult | null> => {
    const pack = packType || "standard";
    const cost = packType ? GACHA_CONFIG.PACK_COSTS[packType] : GACHA_CONFIG.SINGLE_COST;
    
    if (userData.currency < cost) {
      toast.error("RP가 부족합니다!");
      return null;
    }

    // 🔥 팩별 천장 데이터 가져오기
    const currentPityState = userData.pityData[pack] || { s_pity_stack: 0, a_pity_stack: 0 };
    
    // 보유 카드 ID 목록
    const ownedCardIds = userData.ownedCards.map(c => c.id);
    
    // 가챠 실행
    const result = pullSingle(currentPityState, ownedCardIds, pack);
    
    // 🔥 팩별 천장 카운터 업데이트
    const updatedPityState = updatePackPityState(currentPityState, [result]);
    
    // 새 카드 추가 (중복이 아닐 때만)
    const newCard: UserCard = {
      ...result.card,
      instanceId: `${result.card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      upgradeLevel: 0,
      obtainedAt: Date.now()
    };
    
    const newCards = result.isDupe 
      ? userData.ownedCards 
      : [...userData.ownedCards, newCard];

    // 🔥 팩별 통계 업데이트
    const currentStats = userData.packStatistics[pack] || { pulls: 0, rp_spent: 0 };
    const updatedStats = {
      pulls: currentStats.pulls + 1,
      rp_spent: currentStats.rp_spent + cost
    };

    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      currency: userData.currency - cost,
      shards: userData.shards + result.shardsGained,
      pityData: {
        ...userData.pityData,
        [pack]: updatedPityState
      },
      packStatistics: {
        ...userData.packStatistics,
        [pack]: updatedStats
      },
      gachaState: userData.gachaState // deprecated
    };

    setUserData(newData);

    // DB 저장 (로그인 시) - 백그라운드로 비동기 처리
    if (isAuthenticated && accessToken && !result.isDupe) {
      addUserCardDirect(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel).catch(() => {});
    }

    return { ...result, card: newCard };
  };

  // 🔥 가챠 10연속 뽑기 (팩별 천장 시스템)
  const pullTenGacha = async (packType?: CardPackType): Promise<GachaResult[] | null> => {
    const pack = packType || "standard";
    const cost = packType ? GACHA_CONFIG.TEN_COSTS[packType] : GACHA_CONFIG.TEN_COSTS.standard;
    
    if (userData.currency < cost) {
      toast.error("RP가 부족합니다!");
      return null;
    }

    // 🔥 팩별 천장 데이터 가져오기
    const currentPityState = userData.pityData[pack] || { s_pity_stack: 0, a_pity_stack: 0 };
    
    // 보유 카드 ID 목록
    const ownedCardIds = userData.ownedCards.map(c => c.id);
    
    // 10연차 실행
    const results = pullTen(currentPityState, ownedCardIds, pack);
    
    if (!results || !Array.isArray(results)) {
      toast.error("가챠 시스템 오류!");
      return null;
    }
    
    let newCards = [...userData.ownedCards];
    let totalShards = 0;
    const newUserCards: UserCard[] = [];

    results.forEach((result) => {
      if (!result.isDupe) {
        const userCard: UserCard = {
          ...result.card,
          instanceId: `${result.card.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          upgradeLevel: 0,
          obtainedAt: Date.now()
        };
        newCards.push(userCard);
        newUserCards.push(userCard);
      } else {
        totalShards += result.shardsGained;
      }
    });

    // 🔥 팩별 천장 카운터 업데이트
    const finalPityState = updatePackPityState(currentPityState, results);

    // 🔥 팩별 통계 업데이트
    const currentStats = userData.packStatistics[pack] || { pulls: 0, rp_spent: 0 };
    const updatedStats = {
      pulls: currentStats.pulls + 10,
      rp_spent: currentStats.rp_spent + cost
    };

    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      currency: userData.currency - cost,
      shards: userData.shards + totalShards,
      pityData: {
        ...userData.pityData,
        [pack]: finalPityState
      },
      packStatistics: {
        ...userData.packStatistics,
        [pack]: updatedStats
      },
      gachaState: userData.gachaState // deprecated
    };

    setUserData(newData);

    // DB 저장 (로그인 시) - 백그라운드로 비동기 처리
    if (isAuthenticated && accessToken && newUserCards.length > 0) {
      Promise.all(
        newUserCards.map(card => 
          addUserCardDirect(accessToken, card.id, card.instanceId, card.upgradeLevel).catch(() => {})
        )
      ).catch(() => {});
    }

    // 결과에 UserCard 반영
    return results.map((result, index) => {
      const newCardIndex = newUserCards.findIndex(c => c.id === result.card.id);
      if (!result.isDupe && newCardIndex !== -1) {
        return { ...result, card: newUserCards[newCardIndex] };
      }
      return result;
    });
  };

  // 카드 강화
  const upgradeCard = async (cardInstanceId: string): Promise<boolean> => {
    const cardIndex = userData.ownedCards.findIndex(c => c.instanceId === cardInstanceId);
    if (cardIndex === -1) {
      toast.error("카드를 찾을 수 없습니다!");
      return false;
    }

    const card = userData.ownedCards[cardIndex];
    const currentLevel = card.upgradeLevel;
    
    if (currentLevel >= 10) {
      toast.error("최대 강화 레벨입니다!");
      return false;
    }

    const cost = GACHA_CONFIG.UPGRADE_COST[currentLevel + 1];
    if (userData.shards < cost) {
      toast.error(`샤드가 부족합니다! (필요: ${cost})`);
      return false;
    }

    const newCards = [...userData.ownedCards];
    newCards[cardIndex] = { ...card, upgradeLevel: currentLevel + 1 };

    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      shards: userData.shards - cost
    };

    setUserData(newData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken) {
      upgradeUserCardDirect(accessToken, cardInstanceId, newCards[cardIndex].upgradeLevel).catch(() => {});
    }

    toast.success(`강화 성공! Lv.${currentLevel + 1}`);
    return true;
  };

  // 샤드로 카드 제작
  const craftCardWithShards = async (grade: "A" | "S"): Promise<CraftResult | null> => {
    const cost = GACHA_CONFIG.CRAFT_COSTS[grade];
    
    if (userData.shards < cost) {
      toast.error(`샤드가 부족합니다! (필요: ${cost})`);
      return null;
    }

    const craftedCard = craftCard(grade);
    
    // 🔥 중복 체크: 이미 보유한 카드인지 확인
    const isDupe = userData.ownedCards.some(c => c.id === craftedCard.id);
    const shardsGained = isDupe ? GACHA_CONFIG.SHARD_VALUES[grade] : 0;
    
    const newCard: UserCard = {
      ...craftedCard,
      instanceId: `${craftedCard.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      upgradeLevel: 0,
      obtainedAt: Date.now()
    };
    
    // 중복이면 카드 추가하지 않고, 샤드만 지급
    const newCards = isDupe 
      ? userData.ownedCards 
      : [...userData.ownedCards, newCard];
    
    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      shards: userData.shards - cost + shardsGained
    };

    setUserData(newData);

    // DB 저장 (로그인 시) - 중복이 아닐 때만 카드 추가
    if (isAuthenticated && accessToken && !isDupe) {
      addUserCardDirect(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel).catch(() => {});
    }

    if (isDupe) {
      toast.success(`중복 카드! +${shardsGained} 샤드 획득`, { 
        icon: "✨",
        duration: 3000 
      });
    } else {
      toast.success(`${grade}등급 카드 제작 완료!`);
    }
    
    return {
      card: newCard,
      isDupe,
      shardsGained
    };
  };

  // 스쿼드 설정
  const setSquadCard = (position: Position, card: UserCard | null) => {
    setUserData({
      ...userData,
      squad: {
        ...userData.squad,
        [position]: card
      }
    });
  };
  
  // 스쿼드 DB 저장
  const saveSquadToDB = async () => {
    if (!isAuthenticated || !accessToken) {
      toast.error("로그인이 필요합니다!");
      return false;
    }
    
    try {
      await saveUserSquadDirect(accessToken, {
        top_card_instance_id: userData.squad.TOP?.instanceId || null,
        jgl_card_instance_id: userData.squad.JGL?.instanceId || null,
        mid_card_instance_id: userData.squad.MID?.instanceId || null,
        adc_card_instance_id: userData.squad.ADC?.instanceId || null,
        sup_card_instance_id: userData.squad.SUP?.instanceId || null
      });
      toast.success("스쿼드가 저장되었습니다!");
      return true;
    } catch (error) {
      toast.error("스쿼드 저장에 실패했습니다.");
      return false;
    }
  };

  // 게임 리셋
  const resetGame = () => {
    const defaultData = getDefaultUserData();
    setUserData(defaultData);
    saveUserData(defaultData);
    toast.success("게임 데이터가 초기화되었습니다!");
  };

  // 재화 추가 (테스트용)
  const addCurrency = (amount: number) => {
    setUserData({
      ...userData,
      currency: userData.currency + amount
    });
  };

  const value: GameContextType = {
    userData,
    isLoading,
    cardPool,
    allCards, // 추가
    pullSingleGacha,
    pullTenGacha,
    upgradeCard,
    craftCardWithShards,
    setSquadCard,
    saveSquadToDB,
    resetGame,
    addCurrency
  };

  return (
    <GameContext.Provider value={value}>
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