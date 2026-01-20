// LCK 시너지 데이터베이스

import { Synergy } from "@/types/lck";

export const SYNERGIES: Synergy[] = [
  // ==================== 봇 듀오 (ADC + SUP) ====================
  
  {
    id: "prayrilla",
    name: "프릴라 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 80,
    description: "PraY + GorillA의 전설적인 봇 듀오",
    requiredPlayers: ["pray", "gorilla"]
  },
  
  {
    id: "bangwolf",
    name: "뱅울 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Bang + Wolf의 SKT 왕조 봇 듀오",
    requiredPlayers: ["bang", "wolf"]
  },
  
  {
    id: "impmata",
    name: "임마타 듀오",
    type: "DUO",
    yearRule: "EXACT",
    year: 2014,
    priority: 95,
    description: "imp + Mata의 삼성 화이트 레전드 듀오",
    requiredPlayers: ["imp", "mata"]
  },
  
  {
    id: "deftmata",
    name: "뎊마타 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 80,
    description: "Deft + Mata의 KT 듀오",
    requiredPlayers: ["deft", "mata"]
  },
  
  {
    id: "jacklife",
    name: "캡매라 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 90,
    description: "Captain Jack + MadLife의 레전드 듀오",
    requiredPlayers: ["captainjack", "madlife"]
  },
  
  {
    id: "rulercore",
    name: "룰코 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Ruler + CoreJJ의 Gen.G/SSG 듀오",
    requiredPlayers: ["ruler", "corejj"]
  },
  
  {
    id: "gumakeria",
    name: "구케 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Gumayusi + Keria의 T1 신세대 듀오",
    requiredPlayers: ["gumayusi", "keria"]
  },
  
  {
    id: "ghostberyl",
    name: "고베 듀오",
    type: "DUO",
    yearRule: "EXACT",
    year: 2020,
    priority: 90,
    description: "Ghost + BeryL의 담원 우승 듀오",
    requiredPlayers: ["ghost", "beryl"]
  },
  
  // ==================== 미드-정글 듀오 ====================
  
  {
    id: "fakerbengi",
    name: "페벵 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 95,
    description: "Faker + Bengi의 전설적인 미정 듀오",
    requiredPlayers: ["faker", "bengi"]
  },
  
  {
    id: "canyonshowmaker",
    name: "캐쇼 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 90,
    description: "Canyon + ShowMaker의 담원/DK 핵심 듀오",
    requiredPlayers: ["canyon", "showmaker"]
  },
  
  {
    id: "peanutchovy",
    name: "넛쵸 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Peanut + Chovy의 Gen.G 듀오",
    requiredPlayers: ["peanut", "chovy"]
  },
  
  {
    id: "fakerclid",
    name: "페클 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 80,
    description: "Faker + Clid의 SKT/T1 듀오",
    requiredPlayers: ["faker", "clid"]
  },
  
  {
    id: "bddclid",
    name: "비클 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 75,
    description: "BDD + Clid의 Gen.G 듀오",
    requiredPlayers: ["bdd", "clid"]
  },
  
  // ==================== 탑-정글 듀오 ====================
  
  {
    id: "marinbengi",
    name: "마벵 듀오",
    type: "DUO",
    yearRule: "EXACT",
    year: 2015,
    priority: 95,
    description: "Marin + Bengi의 2015 SKT 우승 듀오",
    requiredPlayers: ["marin", "bengi"]
  },
  
  {
    id: "kiincanyon",
    name: "기캐 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Kiin + Canyon의 Gen.G 상체 듀오",
    requiredPlayers: ["kiin", "canyon"]
  },
  
  {
    id: "khancanyon",
    name: "칸캐 듀오",
    type: "DUO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Khan + Canyon의 DK 듀오",
    requiredPlayers: ["khan", "canyon"]
  },
  
  {
    id: "nuguricanyon",
    name: "너캐 듀오",
    type: "DUO",
    yearRule: "EXACT",
    year: 2020,
    priority: 95,
    description: "Nuguri + Canyon의 담원 우승 듀오",
    requiredPlayers: ["nuguri", "canyon"]
  },
  
  // ==================== 상체 3인 (TOP + JGL + MID) ====================
  
  {
    id: "kiincanyonchovy",
    name: "기캐쵸 라인",
    type: "TRIO",
    yearRule: "OPTIONAL",
    priority: 90,
    description: "Kiin + Canyon + Chovy의 Gen.G 상체",
    requiredPlayers: ["kiin", "canyon", "chovy"]
  },
  
  {
    id: "nuguricanyonshowmaker",
    name: "너캐쇼 라인",
    type: "TRIO",
    yearRule: "EXACT",
    year: 2020,
    priority: 100,
    description: "Nuguri + Canyon + ShowMaker의 담원 우승 상체",
    requiredPlayers: ["nuguri", "canyon", "showmaker"]
  },
  
  {
    id: "khancanyonshowmaker",
    name: "칸캐쇼 라인",
    type: "TRIO",
    yearRule: "OPTIONAL",
    priority: 85,
    description: "Khan + Canyon + ShowMaker의 DK 상체",
    requiredPlayers: ["khan", "canyon", "showmaker"]
  },
  
  {
    id: "marinbengifaker",
    name: "마벵페 라인",
    type: "TRIO",
    yearRule: "EXACT",
    year: 2015,
    priority: 100,
    description: "Marin + Bengi + Faker의 2015 SKT 전설 상체",
    requiredPlayers: ["marin", "bengi", "faker"]
  },
  
  // ==================== 5인 완전체 로스터 ====================
  
  {
    id: "skt2015",
    name: "2015 SKT 왕조",
    type: "ROSTER",
    yearRule: "EXACT",
    year: 2015,
    priority: 150,
    description: "Marin + Bengi + Faker + Bang + Wolf의 완벽한 로스터",
    requiredPlayers: ["marin", "bengi", "faker", "bang", "wolf"]
  },
  
  {
    id: "ssgwhite2014",
    name: "2014 삼성 화이트",
    type: "ROSTER",
    yearRule: "EXACT",
    year: 2014,
    priority: 150,
    description: "Looper + DanDy + PawN + imp + Mata의 레전드 로스터",
    requiredPlayers: ["looper", "dandy", "pawn", "imp", "mata"]
  },
  
  {
    id: "damwon2020",
    name: "2020 담원 제국",
    type: "ROSTER",
    yearRule: "EXACT",
    year: 2020,
    priority: 150,
    description: "Nuguri + Canyon + ShowMaker + Ghost + BeryL의 우승 로스터",
    requiredPlayers: ["nuguri", "canyon", "showmaker", "ghost", "beryl"]
  },
  
  {
    id: "t12023",
    name: "2023 T1 무적함대",
    type: "ROSTER",
    yearRule: "EXACT",
    year: 2023,
    priority: 150,
    description: "Zeus + Oner + Faker + Gumayusi + Keria의 2023 로스터",
    requiredPlayers: ["zeus", "oner", "faker", "gumayusi", "keria"]
  },
  
  {
    id: "geng2024",
    name: "Gen.G 드림팀",
    type: "ROSTER",
    yearRule: "OPTIONAL",
    priority: 120,
    description: "Kiin + Canyon + Chovy + Peyz + Lehends의 Gen.G 로스터",
    requiredPlayers: ["kiin", "canyon", "chovy", "peyz", "lehends"]
  },
  
  // ==================== 테마 시너지 ====================
  
  {
    id: "theme_fullroster",
    name: "풀 로스터",
    type: "THEME",
    yearRule: "OPTIONAL",
    priority: 30,
    description: "5개 포지션 모두 배치",
    requiredPositions: ["TOP", "JGL", "MID", "ADC", "SUP"]
  },
  
  {
    id: "theme_sameteam_exact",
    name: "팀 코어 (동일 연도)",
    type: "THEME",
    yearRule: "EXACT",
    priority: 50,
    description: "같은 팀, 같은 연도의 선수 3명 이상",
    requiredPositions: ["TOP", "JGL", "MID"] // 예시: 실제로는 동적 계산
  },
  
  {
    id: "theme_botlane",
    name: "바텀 듀오",
    type: "THEME",
    yearRule: "OPTIONAL",
    priority: 20,
    description: "ADC + SUP 배치",
    requiredPositions: ["ADC", "SUP"]
  }
];
