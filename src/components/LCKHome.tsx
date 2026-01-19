// LCK 가챠 메인 홈 화면

import React, { useState } from "react";
import { useGame } from "@/contexts/GameContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/app/components/ui/button";
import { LCKHoloCard } from "@/components/LCKHoloCard";
import { LCKAuth } from "@/components/LCKAuth";
import { Dialog, DialogContent } from "@/app/components/ui/dialog";
import { GACHA_CONFIG } from "@/types/lck";
import { Coins, Sparkles, Users, Library, Zap, TrendingUp, LogIn, LogOut } from "lucide-react";
import { calculateActiveSynergies, calculateSquadStats } from "@/utils/synergyCalculator";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { toast } from "sonner";

interface LCKHomeProps {
  onNavigate: (page: "home" | "gacha" | "squad" | "collection" | "test" | "terms") => void;
}

export function LCKHome({ onNavigate }: LCKHomeProps) {
  const { userData, addCurrency, syncWithDB } = useGame();
  const { user, isAuthenticated, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  const positions = ["TOP", "JGL", "MID", "ADC", "SUP"] as const;
  
  // 스쿼드 스탯 & 시너지 계산
  const synergies = calculateActiveSynergies(userData.squad);
  const stats = calculateSquadStats(userData.squad, synergies);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("로그아웃되었습니다");
    } catch (error) {
      console.error("로그아웃 실패:", error);
      toast.error("로그아웃에 실패했습니다");
    }
  };

  // DB 동기화 (디버그용)
  const handleSync = async () => {
    try {
      await syncWithDB();
    } catch (error) {
      console.error("동기화 실패:", error);
    }
  };
}