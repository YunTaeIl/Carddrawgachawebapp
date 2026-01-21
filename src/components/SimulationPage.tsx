import React from "react";
import { ComingSoon } from "@/components/ComingSoon";

interface SimulationPageProps {
  onBack: () => void;
  isAdmin: boolean;
}

export function SimulationPage({ onBack, isAdmin }: SimulationPageProps) {
  return (
    <ComingSoon
      title="시뮬레이션 시스템"
      description="경기 시뮬레이션 엔진을 설계하고 있습니다."
      isAdminOnly={true}
      isAdmin={isAdmin}
    />
  );
}
