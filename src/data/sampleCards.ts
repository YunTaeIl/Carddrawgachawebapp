// 샘플 LCK 카드 데이터 (프로토타입용)
// 나중에 Supabase로 전환 예정

import { LCKCard } from "@/types/lck";

export const SAMPLE_CARDS: LCKCard[] = [
  // 2024 T1 (S등급 테스트용)
  {
    id: "2024_T1_Faker",
    year: 2024,
    team: "T1",
    name: "Faker",
    position: "MID",
    grade: "S",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=600&fit=crop",
    stats: { ovr: 98, mechanics: 94, laning: 99, teamfight: 99, macro: 99, clutch: 99 }
  },
  {
    id: "2024_T1_Zeus",
    year: 2024,
    team: "T1",
    name: "Zeus",
    position: "TOP",
    grade: "S",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=600&fit=crop",
    stats: { ovr: 97, mechanics: 92, laning: 99, teamfight: 95, macro: 99, clutch: 99 }
  },
  {
    id: "2024_T1_Oner",
    year: 2024,
    team: "T1",
    name: "Oner",
    position: "JNG",
    grade: "S",
    image: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=400&h=600&fit=crop",
    stats: { ovr: 92, mechanics: 87, laning: 97, teamfight: 94, macro: 96, clutch: 88 }
  },
  {
    id: "2024_T1_Gumayusi",
    year: 2024,
    team: "T1",
    name: "Gumayusi",
    position: "ADC",
    grade: "S",
    image: "",
    stats: { ovr: 95, mechanics: 98, laning: 95, teamfight: 95, macro: 92, clutch: 99 }
  },
  {
    id: "2024_T1_Keria",
    year: 2024,
    team: "T1",
    name: "Keria",
    position: "SUP",
    grade: "S",
    image: "",
    stats: { ovr: 95, mechanics: 99, laning: 99, teamfight: 92, macro: 97, clutch: 95 }
  },

  // 2024 Gen.G (S등급)
  {
    id: "2024_GenG_Kiin",
    year: 2024,
    team: "Gen.G",
    name: "Kiin",
    position: "TOP",
    grade: "S",
    image: "",
    stats: { ovr: 98, mechanics: 96, laning: 98, teamfight: 93, macro: 99, clutch: 99 }
  },
  {
    id: "2024_GenG_Canyon",
    year: 2024,
    team: "Gen.G",
    name: "Canyon",
    position: "JGL",
    grade: "S",
    image: "",
    stats: { ovr: 99, mechanics: 94, laning: 99, teamfight: 96, macro: 96, clutch: 97 }
  },
  {
    id: "2024_GenG_Chovy",
    year: 2024,
    team: "Gen.G",
    name: "Chovy",
    position: "MID",
    grade: "S",
    image: "",
    stats: { ovr: 98, mechanics: 99, laning: 99, teamfight: 98, macro: 99, clutch: 98 }
  },
  {
    id: "2024_GenG_Lehends",
    year: 2024,
    team: "Gen.G",
    name: "Lehends",
    position: "SUP",
    grade: "S",
    image: "",
    stats: { ovr: 97, mechanics: 92, laning: 99, teamfight: 99, macro: 99, clutch: 97 }
  },

  // A등급
  {
    id: "2024_GenG_Peyz",
    year: 2024,
    team: "Gen.G",
    name: "Peyz",
    position: "ADC",
    grade: "A",
    image: "",
    stats: { ovr: 85, mechanics: 84, laning: 90, teamfight: 92, macro: 86, clutch: 81 }
  },
  {
    id: "2024_DplusKia_Kingen",
    year: 2024,
    team: "Dplus Kia",
    name: "Kingen",
    position: "TOP",
    grade: "A",
    image: "",
    stats: { ovr: 86, mechanics: 89, laning: 81, teamfight: 85, macro: 86, clutch: 92 }
  },
  {
    id: "2024_DplusKia_Lucid",
    year: 2024,
    team: "Dplus Kia",
    name: "Lucid",
    position: "JGL",
    grade: "A",
    image: "",
    stats: { ovr: 89, mechanics: 91, laning: 95, teamfight: 82, macro: 92, clutch: 89 }
  },
  {
    id: "2024_DplusKia_Aiming",
    year: 2024,
    team: "Dplus Kia",
    name: "Aiming",
    position: "ADC",
    grade: "A",
    image: "",
    stats: { ovr: 91, mechanics: 87, laning: 85, teamfight: 91, macro: 95, clutch: 96 }
  },
  {
    id: "2024_DplusKia_Kellin",
    year: 2024,
    team: "Dplus Kia",
    name: "Kellin",
    position: "SUP",
    grade: "A",
    image: "",
    stats: { ovr: 87, mechanics: 82, laning: 80, teamfight: 94, macro: 84, clutch: 91 }
  },

  // B등급
  {
    id: "2024_BNKFEARX_Clear",
    year: 2024,
    team: "BNK FEARX",
    name: "Clear",
    position: "TOP",
    grade: "B",
    image: "",
    stats: { ovr: 74, mechanics: 72, laning: 79, teamfight: 77, macro: 68, clutch: 69 }
  },
  {
    id: "2024_BNKFEARX_Raptor",
    year: 2024,
    team: "BNK FEARX",
    name: "Raptor",
    position: "JGL",
    grade: "B",
    image: "",
    stats: { ovr: 82, mechanics: 89, laning: 77, teamfight: 88, macro: 88, clutch: 77 }
  },
  {
    id: "2024_BNKFEARX_Hena",
    year: 2024,
    team: "BNK FEARX",
    name: "Hena",
    position: "ADC",
    grade: "B",
    image: "",
    stats: { ovr: 78, mechanics: 81, laning: 83, teamfight: 70, macro: 84, clutch: 76 }
  },
  {
    id: "2024_BNKFEARX_Duro",
    year: 2024,
    team: "BNK FEARX",
    name: "Duro",
    position: "SUP",
    grade: "B",
    image: "",
    stats: { ovr: 81, mechanics: 89, laning: 84, teamfight: 74, macro: 84, clutch: 88 }
  },

  // C등급
  {
    id: "2024_BNKFEARX_Execute",
    year: 2024,
    team: "BNK FEARX",
    name: "Execute",
    position: "SUP",
    grade: "C",
    image: "",
    stats: { ovr: 66, mechanics: 69, laning: 60, teamfight: 58, macro: 60, clutch: 63 }
  },
  {
    id: "2024_DplusKia_Moham",
    year: 2024,
    team: "Dplus Kia",
    name: "Moham",
    position: "SUP",
    grade: "C",
    image: "",
    stats: { ovr: 60, mechanics: 56, laning: 53, teamfight: 53, macro: 65, clutch: 68 }
  },

  // 2024 DplusKia ShowMaker (S)
  {
    id: "2024_DplusKia_ShowMaker",
    year: 2024,
    team: "Dplus Kia",
    name: "ShowMaker",
    position: "MID",
    grade: "S",
    image: "",
    stats: { ovr: 94, mechanics: 94, laning: 98, teamfight: 97, macro: 90, clutch: 92 }
  },
  {
    id: "2024_HLE_Zeka",
    year: 2024,
    team: "Hanwha Life Esports",
    name: "Zeka",
    position: "MID",
    grade: "S",
    image: "",
    stats: { ovr: 96, mechanics: 97, laning: 92, teamfight: 97, macro: 98, clutch: 93 }
  },
  {
    id: "2024_HLE_Peanut",
    year: 2024,
    team: "Hanwha Life Esports",
    name: "Peanut",
    position: "JGL",
    grade: "S",
    image: "",
    stats: { ovr: 93, mechanics: 89, laning: 94, teamfight: 89, macro: 92, clutch: 92 }
  },
  {
    id: "2024_HLE_Viper",
    year: 2024,
    team: "Hanwha Life Esports",
    name: "Viper",
    position: "ADC",
    grade: "S",
    image: "",
    stats: { ovr: 92, mechanics: 87, laning: 91, teamfight: 86, macro: 95, clutch: 92 }
  },
  {
    id: "2024_HLE_Delight",
    year: 2024,
    team: "Hanwha Life Esports",
    name: "Delight",
    position: "SUP",
    grade: "S",
    image: "",
    stats: { ovr: 94, mechanics: 89, laning: 91, teamfight: 94, macro: 93, clutch: 98 }
  },

  // 더 많은 A/B/C 등급 추가
  {
    id: "2024_HLE_Doran",
    year: 2024,
    team: "Hanwha Life Esports",
    name: "Doran",
    position: "TOP",
    grade: "A",
    image: "",
    stats: { ovr: 89, mechanics: 83, laning: 86, teamfight: 93, macro: 89, clutch: 88 }
  },
  {
    id: "2024_BNKFEARX_Clozer",
    year: 2024,
    team: "BNK FEARX",
    name: "Clozer",
    position: "MID",
    grade: "A",
    image: "",
    stats: { ovr: 85, mechanics: 91, laning: 86, teamfight: 92, macro: 84, clutch: 79 }
  },
  {
    id: "2024_KT_PerfecT",
    year: 2024,
    team: "KT Rolster",
    name: "PerfecT",
    position: "TOP",
    grade: "A",
    image: "",
    stats: { ovr: 89, mechanics: 91, laning: 84, teamfight: 96, macro: 91, clutch: 95 }
  },
  {
    id: "2024_KT_Pyosik",
    year: 2024,
    team: "KT Rolster",
    name: "Pyosik",
    position: "JNG",
    grade: "A",
    image: "",
    stats: { ovr: 90, mechanics: 89, laning: 89, teamfight: 97, macro: 96, clutch: 89 }
  },
  {
    id: "2024_KT_Bdd",
    year: 2024,
    team: "KT Rolster",
    name: "Bdd",
    position: "MID",
    grade: "S",
    image: "",
    stats: { ovr: 95, mechanics: 99, laning: 92, teamfight: 92, macro: 92, clutch: 95 }
  },
  {
    id: "2024_KT_Deft",
    year: 2024,
    team: "KT Rolster",
    name: "Deft",
    position: "ADC",
    grade: "S",
    image: "",
    stats: { ovr: 92, mechanics: 87, laning: 89, teamfight: 91, macro: 86, clutch: 97 }
  },
  {
    id: "2024_KT_BeryL",
    year: 2024,
    team: "KT Rolster",
    name: "BeryL",
    position: "SUP",
    grade: "B",
    image: "",
    stats: { ovr: 74, mechanics: 69, laning: 82, teamfight: 78, macro: 78, clutch: 76 }
  }
];

// 카드 풀 전체를 시뮬레이션 (확률 테스트용)
export function getCardPool(): LCKCard[] {
  return SAMPLE_CARDS;
}

export function getCardById(id: string): LCKCard | undefined {
  return SAMPLE_CARDS.find(card => card.id === id);
}

export function getCardsByGrade(grade: "S" | "A" | "B" | "C"): LCKCard[] {
  return SAMPLE_CARDS.filter(card => card.grade === grade);
}