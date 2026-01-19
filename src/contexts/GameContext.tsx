// 게임 전역 상태 관리 (DB 동기화 포함)

import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { UserData, UserCard, LCKCard, GachaResult, GACHA_CONFIG, Position } from "@/types/lck";
import { loadUserData, saveUserData, getDefaultUserData } from "@/utils/localStorage";
import { pullSingle, pullTen, updateGachaState, craftCard, initializeCardPool, CardPackType } from "@/utils/gachaEngine";
import { useAuth } from "@/contexts/AuthContext";
import { updateGameDataDirect, addUserCardDirect, upgradeUserCardDirect } from "@/utils/supabaseDirect";
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

  // DB 저장 함수 (디바운스)
  const saveGameDataToDB = async (data: UserData) => {
    if (!isAuthenticated || !accessToken) {
      console.log("⏭️ DB 저장 스킵 (비로그인)");
      return;
    }
    
    console.log("💾 DB 저장 시작... accessToken:", accessToken.substring(0, 20) + "...");
    
    // 디바운스: 1초 후 저장
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    saveTimeoutRef.current = setTimeout(async () => {
      try {
        await updateGameDataDirect(accessToken, {
          currency: data.currency,
          shards: data.shards,
          s_pity_stack: data.gachaState.s_pity_stack,
          a_pity_stack: data.gachaState.a_pity_stack,
          total_pulls: data.gachaState.total_pulls
        });
        console.log("✅ DB 저장 성공");
      } catch (error: any) {
        // 401 에러는 조용히 무시 (서버 배포 대기 중)
        if (error.message?.includes("401")) {
          console.warn("⚠️ DB 저장 실패 (서버 인증 문제, LocalStorage에는 저장됨)");
        } else {
          console.error("❌ DB 저장 실패:", error);
        }
      }
    }, 1000);
  };

  // 초기 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        // LocalStorage에서 로드
        const saved = loadUserData();
        setUserData(saved);
        
        // 카드 풀 초기화
        const pool = await initializeCardPool();
        setCardPool(pool);
      } catch (error) {
        console.error("데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  // 데이터 변경 시 저장
  useEffect(() => {
    if (!isLoading) {
      // LocalStorage 저장
      saveUserData(userData);
      
      // DB 저장 (로그인 시)
      saveGameDataToDB(userData);
    }
  }, [userData, isLoading]);

  // 가챠 1회 뽑기
  const pullSingleGacha = async (packType?: CardPackType): Promise<GachaResult | null> => {
    const cost = packType ? GACHA_CONFIG.PACK_COSTS[packType] : GACHA_CONFIG.SINGLE_COST;
    
    if (userData.currency < cost) {
      toast.error("RP가 부족합니다!");
      return null;
    }

    // 보유 카드 ID 목록
    const ownedCardIds = userData.ownedCards.map(c => c.id);
    
    // 가챠 실행
    const result = pullSingle(userData.gachaState, ownedCardIds, packType || "standard");
    
    // 천장 카운터 업데이트 (배열로 감싸서 전달)
    const updatedGachaState = updateGachaState(userData.gachaState, [result]);
    
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

    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      currency: userData.currency - cost,
      shards: userData.shards + result.shardsGained,
      gachaState: updatedGachaState
    };

    setUserData(newData);

    // DB 저장 (로그인 시) - 백그라운드로 비동기 처리
    if (isAuthenticated && accessToken && !result.isDupe) {
      addUserCardDirect(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel)
        .catch(error => console.error("카드 DB 저장 실패:", error));
    }

    return { ...result, card: newCard, updatedGachaState };
  };

  // 가챠 10연속 뽑기
  const pullTenGacha = async (packType?: CardPackType): Promise<GachaResult[] | null> => {
    const cost = packType ? GACHA_CONFIG.TEN_COSTS[packType] : GACHA_CONFIG.TEN_COSTS.standard;
    
    if (userData.currency < cost) {
      toast.error("RP가 부족합니다!");
      return null;
    }

    console.log("🎰 10연차 시작...");
    
    // 보유 카드 ID 목록
    const ownedCardIds = userData.ownedCards.map(c => c.id);
    console.log("📦 보유 카드 개수:", ownedCardIds.length);
    
    // 10연차 실행
    console.log("🎲 pullTen 호출 중...", { gachaState: userData.gachaState, packType });
    const results = pullTen(userData.gachaState, ownedCardIds, packType || "standard");
    console.log("✅ pullTen 결과:", results);
    
    if (!results || !Array.isArray(results)) {
      console.error("❌ pullTen이 올바른 결과를 반환하지 않음:", results);
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

    // pullTen 내부에서 이미 천장 계산을 했으므로, 수동으로 계산
    const finalGachaState = updateGachaState(userData.gachaState, results);

    const newData: UserData = {
      ...userData,
      ownedCards: newCards,
      currency: userData.currency - cost,
      shards: userData.shards + totalShards,
      gachaState: finalGachaState
    };

    setUserData(newData);

    // DB 저장 (로그인 시) - 백그라운드로 비동기 처리
    if (isAuthenticated && accessToken && newUserCards.length > 0) {
      Promise.all(
        newUserCards.map(card => 
          addUserCardDirect(accessToken, card.id, card.instanceId, card.upgradeLevel)
            .catch(error => console.error("카드 DB 저장 실패:", error))
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
      try {
        await upgradeUserCardDirect(accessToken, cardInstanceId, newCards[cardIndex].upgradeLevel);
      } catch (error) {
        console.error("강화 DB 저장 실패:", error);
      }
    }

    toast.success(`강화 성공! Lv.${currentLevel + 1}`);
    return true;
  };

  // 샤드로 카드 제작
  const craftCardWithShards = async (grade: "A" | "S"): Promise<UserCard | null> => {
    const cost = GACHA_CONFIG.CRAFT_COST[grade];
    
    if (userData.shards < cost) {
      toast.error(`샤드가 부족합니다! (필요: ${cost})`);
      return null;
    }

    const newCard = craftCard(cardPool, grade);
    
    const newData: UserData = {
      ...userData,
      ownedCards: [...userData.ownedCards, newCard],
      shards: userData.shards - cost
    };

    setUserData(newData);

    // DB 저장 (로그인 시)
    if (isAuthenticated && accessToken) {
      try {
        await addUserCardDirect(accessToken, newCard.id, newCard.instanceId, newCard.upgradeLevel);
      } catch (error) {
        console.error("제작 카드 DB 저장 실패:", error);
      }
    }

    toast.success(`${grade}등급 카드 제작 완료!`);
    return newCard;
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
    pullSingleGacha,
    pullTenGacha,
    upgradeCard,
    craftCardWithShards,
    setSquadCard,
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