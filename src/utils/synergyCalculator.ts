// LCK 스쿼드 시너지 계산기

import { UserCard, Synergy, CardStats } from "@/types/lck";

export interface Squad {
  TOP: UserCard | null;
  JGL: UserCard | null;
  MID: UserCard | null;
  ADC: UserCard | null;
  SUP: UserCard | null;
}

export interface SquadStats {
  totalOVR: number;
  avgOVR: number;
  totalMechanics: number;
  totalLaning: number;
  totalTeamfight: number;
  totalMacro: number;
  totalClutch: number;
}

export interface SynergyBonus {
  ovrBonus: number; // % 증가
  mechanicsBonus: number;
  laningBonus: number;
  teamfightBonus: number;
  macroBonus: number;
  clutchBonus: number;
}

/**
 * 스쿼드에서 활성화된 시너지 계산
 */
export function calculateActiveSynergies(squad: Squad): Synergy[] {
  const activeSynergies: Synergy[] = [];
  const cards = Object.values(squad).filter(c => c !== null) as UserCard[];
  
  if (cards.length === 0) return [];

  // === 특별 선수 조합 시너지 ===
  
  // === T1/SKT 전설의 조합들 ===
  
  // 구케 조합 (Gumayusi + Keria)
  if (squad.ADC?.name === "Gumayusi" && squad.SUP?.name === "Keria") {
    activeSynergies.push({
      id: "guke_combo",
      name: "🔥 구케 조합",
      description: "Gumayusi + Keria (T1 바텀듀오)",
      isActive: true,
      bonus: "ADC/SUP OVR +5, Clutch +7, Teamfight +5"
    });
  }

  // 데프트케리아 (Deft + Keria)
  if (squad.ADC?.name === "Deft" && squad.SUP?.name === "Keria") {
    activeSynergies.push({
      id: "deft_keria",
      name: "💎 데프트케리아",
      description: "Deft + Keria (2022 T1)",
      isActive: true,
      bonus: "ADC/SUP Laning +6, Mechanics +5"
    });
  }

  // 뱅울프 (Bang + Wolf)
  if (squad.ADC?.name === "Bang" && squad.SUP?.name === "Wolf") {
    activeSynergies.push({
      id: "bang_wolf",
      name: "💥 뱅울프",
      description: "Bang + Wolf (SKT 전설의 바텀)",
      isActive: true,
      bonus: "ADC/SUP Teamfight +6, Clutch +6"
    });
  }

  // 페구 조합 (Faker + Gumayusi)
  if (squad.MID?.name === "Faker" && squad.ADC?.name === "Gumayusi") {
    activeSynergies.push({
      id: "faker_guma",
      name: "👑 페구 캐리",
      description: "Faker + Gumayusi",
      isActive: true,
      bonus: "MID/ADC Clutch +8, Mechanics +5"
    });
  }

  // 페뱅 (Faker + Bang)
  if (squad.MID?.name === "Faker" && squad.ADC?.name === "Bang") {
    activeSynergies.push({
      id: "faker_bang",
      name: "👑 페뱅 듀오",
      description: "Faker + Bang (SKT 황금기)",
      isActive: true,
      bonus: "MID/ADC Clutch +7, Teamfight +5"
    });
  }

  // 제우스오너 (Zeus + Oner)
  if (squad.TOP?.name === "Zeus" && squad.JGL?.name === "Oner") {
    activeSynergies.push({
      id: "zeus_oner",
      name: "🌩️ 제우스오너",
      description: "Zeus + Oner (T1 탑정 듀오)",
      isActive: true,
      bonus: "TOP/JGL Laning +5, Teamfight +4"
    });
  }

  // 마벵 (Marin + Bengi)
  if (squad.TOP?.name === "MaRin" && squad.JGL?.name === "Bengi") {
    activeSynergies.push({
      id: "marin_bengi",
      name: "🏆 마벵 탑정",
      description: "MaRin + Bengi (2015 SKT)",
      isActive: true,
      bonus: "TOP/JGL Macro +6, Teamfight +5"
    });
  }

  // === Gen.G/Samsung 조합들 ===

  // 쵸비캐니언 (Chovy + Canyon)
  if (squad.MID?.name === "Chovy" && squad.JGL?.name === "Canyon") {
    activeSynergies.push({
      id: "chovy_canyon",
      name: "⚡ 쵸비캐니언",
      description: "Chovy + Canyon (Gen.G 미정 듀오)",
      isActive: true,
      bonus: "MID/JGL 모든 스탯 +4, Macro +6"
    });
  }

  // 룰라 (Ruler + Life)
  if (squad.ADC?.name === "Ruler" && squad.SUP?.name === "Life") {
    activeSynergies.push({
      id: "ruler_life",
      name: "👑 룰라",
      description: "Ruler + Life (Gen.G/SSG)",
      isActive: true,
      bonus: "ADC/SUP Clutch +7, Mechanics +5"
    });
  }

  // 바이퍼렌즈 (Viper + Lehends)
  if (squad.ADC?.name === "Viper" && squad.SUP?.name === "Lehends") {
    activeSynergies.push({
      id: "viper_lehends",
      name: "🐍 바이퍼렌즈",
      description: "Viper + Lehends (HLE)",
      isActive: true,
      bonus: "ADC/SUP Laning +6, Teamfight +5"
    });
  }

  // 페이즈렌즈 (Peyz + Lehends)
  if (squad.ADC?.name === "Peyz" && squad.SUP?.name === "Lehends") {
    activeSynergies.push({
      id: "peyz_lehends",
      name: "💫 페이즈렌즈",
      description: "Peyz + Lehends (Gen.G)",
      isActive: true,
      bonus: "ADC/SUP Mechanics +5, Macro +4"
    });
  }

  // === HLE 조합들 ===

  // 키인피즈 (Kiin + Peanut)
  if (squad.TOP?.name === "Kiin" && squad.JGL?.name === "Peanut") {
    activeSynergies.push({
      id: "kiin_peanut",
      name: "🔶 키인피즈",
      description: "Kiin + Peanut (HLE 탑정)",
      isActive: true,
      bonus: "TOP/JGL Macro +5, Mechanics +4"
    });
  }

  // 제카 (Zeka + Peanut)
  if (squad.MID?.name === "Zeka" && squad.JGL?.name === "Peanut") {
    activeSynergies.push({
      id: "zeka_peanut",
      name: "🥜 제카피넛",
      description: "Zeka + Peanut (HLE)",
      isActive: true,
      bonus: "MID/JGL Clutch +6, Macro +5"
    });
  }

  // === DAMWON/DK 조합들 ===

  // 쇼메캐니언 (ShowMaker + Canyon)
  if (squad.MID?.name === "ShowMaker" && squad.JGL?.name === "Canyon") {
    activeSynergies.push({
      id: "showmaker_canyon",
      name: "🌟 쇼메캐니언",
      description: "ShowMaker + Canyon (2020 Worlds)",
      isActive: true,
      bonus: "MID/JGL Mechanics +6, Clutch +5"
    });
  }

  // 누캐 (Nuguri + Canyon)
  if (squad.TOP?.name === "Nuguri" && squad.JGL?.name === "Canyon") {
    activeSynergies.push({
      id: "nuguri_canyon",
      name: "⚔️ 누캐 듀오",
      description: "Nuguri + Canyon (DAMWON)",
      isActive: true,
      bonus: "TOP/JGL Mechanics +6, Laning +5"
    });
  }

  // 고데 (Ghost + BeryL)
  if (squad.ADC?.name === "Ghost" && squad.SUP?.name === "BeryL") {
    activeSynergies.push({
      id: "ghost_beryl",
      name: "👻 고데 바텀",
      description: "Ghost + BeryL (DAMWON)",
      isActive: true,
      bonus: "ADC/SUP Macro +6, Teamfight +5"
    });
  }

  // === KT 조합들 ===

  // 데투 (Deft + TusiN)
  if (squad.ADC?.name === "Deft" && squad.SUP?.name === "TusiN") {
    activeSynergies.push({
      id: "deft_tusin",
      name: "💙 데투 조합",
      description: "Deft + TusiN (KT)",
      isActive: true,
      bonus: "ADC/SUP Laning +6, Clutch +5"
    });
  }

  // 스마우 (Smeb + Score + Ucal)
  const hasSmebScoreUcal = squad.TOP?.name === "Smeb" && squad.JGL?.name === "Score" && squad.MID?.name === "Ucal";
  if (hasSmebScoreUcal) {
    activeSynergies.push({
      id: "kt_2018_core",
      name: "🐯 2018 KT 코어",
      description: "Smeb + Score + Ucal",
      isActive: true,
      bonus: "TOP/JGL/MID 모든 스탯 +5"
    });
  }

  // === DRX 조합들 ===

  // 제카카스 (Zeka + Kingen)
  if (squad.MID?.name === "Zeka" && squad.TOP?.name === "Kingen") {
    activeSynergies.push({
      id: "zeka_kingen",
      name: "🐉 제카킹겐",
      description: "Zeka + Kingen (2022 DRX)",
      isActive: true,
      bonus: "MID/TOP Clutch +7"
    });
  }

  // 데프트데프트 (Deft + 2022 DRX)
  if (squad.ADC?.name === "Deft" && squad.ADC?.team === "DRX" && squad.ADC?.year === 2022) {
    activeSynergies.push({
      id: "deft_drx_2022",
      name: "🏆 데프트의 복수",
      description: "Deft 2022 DRX (Worlds 우승)",
      isActive: true,
      bonus: "ADC Clutch +10, 전원 Clutch +3"
    });
  }

  // === Griffin 조합들 ===

  // 타잔초비 (Tarzan + Chovy)
  if (squad.JGL?.name === "Tarzan" && squad.MID?.name === "Chovy") {
    activeSynergies.push({
      id: "tarzan_chovy",
      name: "🦅 타잔초비",
      description: "Tarzan + Chovy (Griffin)",
      isActive: true,
      bonus: "JGL/MID 모든 스탯 +5, Macro +6"
    });
  }

  // 바레 (Viper + Lehends) - Griffin
  if (squad.ADC?.name === "Viper" && squad.SUP?.name === "Lehends" && 
      squad.ADC?.team === "Griffin") {
    activeSynergies.push({
      id: "viper_lehends_grf",
      name: "🦅 Griffin 바이퍼렌즈",
      description: "Viper + Lehends (2019 Griffin)",
      isActive: true,
      bonus: "ADC/SUP 모든 스탯 +4"
    });
  }

  // === ROX Tigers 조합들 ===

  // 프고 (PraY + GorillA)
  if (squad.ADC?.name === "PraY" && squad.SUP?.name === "GorillA") {
    activeSynergies.push({
      id: "pray_gorilla",
      name: "🐯 프고 조합",
      description: "PraY + GorillA (ROX Tigers)",
      isActive: true,
      bonus: "ADC/SUP Clutch +7, Teamfight +6"
    });
  }

  // 스밉피넛 (Smeb + Peanut) - ROX
  if (squad.TOP?.name === "Smeb" && squad.JGL?.name === "Peanut" && 
      squad.TOP?.team === "ROX Tigers") {
    activeSynergies.push({
      id: "smeb_peanut_rox",
      name: "🐯 스밉피넛 (ROX)",
      description: "Smeb + Peanut (ROX Tigers)",
      isActive: true,
      bonus: "TOP/JGL 모든 스탯 +5"
    });
  }

  // === 기타 유명 조합들 ===

  // 루에이 (Lucid + Aiming) - DK
  if (squad.JGL?.name === "Lucid" && squad.ADC?.name === "Aiming") {
    activeSynergies.push({
      id: "lucid_aiming",
      name: "🎯 루에이밍",
      description: "Lucid + Aiming (DK)",
      isActive: true,
      bonus: "JGL/ADC Mechanics +5"
    });
  }

  // 쿠잔 (Kuro + Hojin)
  if (squad.MID?.name === "Kuro" && squad.JGL?.name === "Hojin") {
    activeSynergies.push({
      id: "kuro_hojin",
      name: "🐯 쿠로호진",
      description: "Kuro + Hojin (ROX Tigers)",
      isActive: true,
      bonus: "MID/JGL Macro +5, Teamfight +4"
    });
  }

  // === 전설의 팀 로스터 시너지 ===

  // 한화생명 전차 (HLE 5명)
  const hleCount = cards.filter(c => c.team === "Hanwha Life Esports").length;
  if (hleCount === 5) {
    activeSynergies.push({
      id: "hle_tank",
      name: "🚜 한화생명 전차",
      description: "HLE 5인 로스터 (밈)",
      isActive: true,
      bonus: "전원 Teamfight +6, Clutch +4 (믿고 있었어!)"
    });
  }

  // 2022 DRX 우승 로스터
  const drx2022 = cards.filter(c => c.team === "DRX" && c.year === 2022).length;
  if (drx2022 === 5) {
    activeSynergies.push({
      id: "drx_2022_worlds",
      name: "🏆 DRX 2022 Worlds",
      description: "2022 DRX 우승 로스터",
      isActive: true,
      bonus: "전원 Clutch +10 (역대급 역전극)"
    });
  }

  // 2019 Griffin (전설의 팀)
  const griffin2019 = cards.filter(c => c.team === "Griffin" && c.year === 2019).length;
  if (griffin2019 >= 3) {
    activeSynergies.push({
      id: "griffin_2019",
      name: "🦅 2019 Griffin",
      description: "전설의 Griffin 로스터",
      isActive: true,
      bonus: "전원 모든 스탯 +3 (무패신화)"
    });
  }

  // 2020 DAMWON (Worlds 우승)
  const dwg2020 = cards.filter(c => c.team === "DAMWON Gaming" && c.year === 2020).length;
  if (dwg2020 === 5) {
    activeSynergies.push({
      id: "dwg_2020_worlds",
      name: "🏆 2020 DAMWON Worlds",
      description: "2020 Worlds 우승 로스터",
      isActive: true,
      bonus: "전원 모든 스탯 +5, Clutch +7"
    });
  }

  // 2015 SKT (완전체)
  const skt2015 = cards.filter(c => c.team === "T1" && c.year === 2015).length;
  if (skt2015 === 5) {
    activeSynergies.push({
      id: "skt_2015_golden",
      name: "👑 2015 SKT 완전체",
      description: "MaRin Bengi Faker Bang Wolf",
      isActive: true,
      bonus: "전원 OVR +7, 모든 스탯 +5"
    });
  }

  // 2016 SKT
  const skt2016 = cards.filter(c => c.team === "T1" && c.year === 2016).length;
  if (skt2016 === 5) {
    activeSynergies.push({
      id: "skt_2016",
      name: "👑 2016 SKT (재패권)",
      description: "2016 SKT 로스터",
      isActive: true,
      bonus: "전원 Clutch +6, Teamfight +5"
    });
  }

  // 2023 T1 (황금 로스터)
  const t1_2023 = cards.filter(c => c.team === "T1" && c.year === 2023).length;
  if (t1_2023 === 5) {
    activeSynergies.push({
      id: "t1_2023_golden",
      name: "👑 T1 2023 Golden",
      description: "2023 T1 완전체",
      isActive: true,
      bonus: "전원 OVR +5, 모든 스탯 +4"
    });
  }

  // 2024 Gen.G (MSI 우승)
  const geng2024 = cards.filter(c => c.team === "Gen.G" && c.year === 2024).length;
  if (geng2024 === 5) {
    activeSynergies.push({
      id: "geng_2024_msi",
      name: "🏅 Gen.G 2024 MSI",
      description: "2024 MSI 우승 로스터",
      isActive: true,
      bonus: "전원 Teamfight +6, Macro +5"
    });
  }

  // 2016 ROX Tigers
  const rox2016 = cards.filter(c => c.team === "ROX Tigers" && c.year === 2016).length;
  if (rox2016 >= 4) {
    activeSynergies.push({
      id: "rox_2016",
      name: "🐯 2016 ROX Tigers",
      description: "전설의 호랑이군단",
      isActive: true,
      bonus: "전원 모든 스탯 +4, Teamfight +6"
    });
  }

  // 2017 Longzhu Gaming (프고 이적)
  const lz2017 = cards.filter(c => c.team === "Longzhu Gaming" && c.year === 2017).length;
  if (lz2017 >= 3) {
    activeSynergies.push({
      id: "lz_2017",
      name: "🐉 2017 Longzhu Gaming",
      description: "LZ 로스터",
      isActive: true,
      bonus: "전원 Laning +4, Mechanics +4"
    });
  }

  // 2018 KT (롤스터)
  const kt2018 = cards.filter(c => c.team === "KT Rolster" && c.year === 2018).length;
  if (kt2018 === 5) {
    activeSynergies.push({
      id: "kt_2018_roster",
      name: "🐯 2018 KT 롤스터",
      description: "Smeb Score Ucal Deft Mata",
      isActive: true,
      bonus: "전원 OVR +6, Clutch +8 (아쉬운 준우승)"
    });
  }

  // 2017 Samsung Galaxy (Worlds 우승)
  const ssg2017 = cards.filter(c => c.team === "Gen.G" && c.year === 2017).length;
  if (ssg2017 === 5) {
    activeSynergies.push({
      id: "ssg_2017_worlds",
      name: "👑 2017 SSG Worlds",
      description: "Samsung Galaxy 우승",
      isActive: true,
      bonus: "전원 Clutch +7, Macro +6"
    });
  }

  return activeSynergies;
}

/**
 * 시너지 보너스 계산
 */
export function calculateSynergyBonus(squad: Squad, synergies: Synergy[]): SynergyBonus {
  const bonus: SynergyBonus = {
    ovrBonus: 0,
    mechanicsBonus: 0,
    laningBonus: 0,
    teamfightBonus: 0,
    macroBonus: 0,
    clutchBonus: 0
  };

  for (const synergy of synergies) {
    switch (synergy.id) {
      case "full_roster":
        bonus.ovrBonus += 3; // 3% OVR 증가
        bonus.macroBonus += 2; // 전원 +2
        break;
      
      case "bot_duo":
        // ADC/SUP만 적용
        break;
      
      case "mid_jungle":
        // MID/JGL만 적용
        break;
      
      case "top_jungle":
        // TOP/JGL만 적용
        break;
      
      case "team_core_3":
        bonus.teamfightBonus += 2;
        bonus.macroBonus += 2;
        break;
      
      case "team_core_5":
        bonus.clutchBonus += 5;
        break;
      
      case "era_stack_3":
        bonus.mechanicsBonus += 1;
        bonus.laningBonus += 1;
        bonus.teamfightBonus += 1;
        bonus.macroBonus += 1;
        bonus.clutchBonus += 1;
        break;
      
      case "era_stack_5":
        bonus.mechanicsBonus += 2;
        bonus.laningBonus += 2;
        bonus.teamfightBonus += 2;
        bonus.macroBonus += 2;
        bonus.clutchBonus += 2;
        break;

      // === 특별 시너지 보너스 ===
      case "guke_combo":
        bonus.ovrBonus += 5;
        bonus.clutchBonus += 7;
        bonus.teamfightBonus += 5;
        break;
      
      case "deft_keria":
        bonus.laningBonus += 6;
        bonus.mechanicsBonus += 5;
        break;
      
      case "chovy_canyon":
        bonus.mechanicsBonus += 4;
        bonus.laningBonus += 4;
        bonus.teamfightBonus += 4;
        bonus.macroBonus += 6;
        break;
      
      case "faker_guma":
        bonus.clutchBonus += 8;
        bonus.mechanicsBonus += 5;
        break;
      
      case "zeus_oner":
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 4;
        break;
      
      case "kiin_peanut":
        bonus.macroBonus += 5;
        bonus.mechanicsBonus += 4;
        break;
      
      case "hle_tank":
        bonus.teamfightBonus += 6;
        bonus.clutchBonus += 4;
        break;
      
      case "drx_2022_worlds":
        bonus.clutchBonus += 10;
        break;
      
      case "griffin_2019":
        bonus.mechanicsBonus += 3;
        bonus.laningBonus += 3;
        bonus.teamfightBonus += 3;
        bonus.macroBonus += 3;
        bonus.clutchBonus += 3;
        break;
      
      case "t1_2023_golden":
        bonus.ovrBonus += 5;
        bonus.mechanicsBonus += 4;
        bonus.laningBonus += 4;
        bonus.teamfightBonus += 4;
        bonus.macroBonus += 4;
        bonus.clutchBonus += 4;
        break;
      
      case "geng_2024_msi":
        bonus.teamfightBonus += 6;
        bonus.macroBonus += 5;
        break;
      
      case "showmaker_canyon":
        bonus.mechanicsBonus += 6;
        bonus.clutchBonus += 5;
        break;
      
      case "bang_wolf":
        bonus.teamfightBonus += 6;
        bonus.clutchBonus += 6;
        break;
      
      case "faker_bang":
        bonus.clutchBonus += 7;
        bonus.teamfightBonus += 5;
        break;
      
      case "marin_bengi":
        bonus.macroBonus += 6;
        bonus.teamfightBonus += 5;
        break;
      
      case "ruler_life":
        bonus.clutchBonus += 7;
        bonus.mechanicsBonus += 5;
        break;
      
      case "viper_lehends":
        bonus.laningBonus += 6;
        bonus.teamfightBonus += 5;
        break;
      
      case "peyz_lehends":
        bonus.mechanicsBonus += 5;
        bonus.macroBonus += 4;
        break;
      
      case "zeka_peanut":
        bonus.clutchBonus += 6;
        bonus.macroBonus += 5;
        break;
      
      case "nuguri_canyon":
        bonus.mechanicsBonus += 6;
        bonus.laningBonus += 5;
        break;
      
      case "ghost_beryl":
        bonus.macroBonus += 6;
        bonus.teamfightBonus += 5;
        break;
      
      case "deft_tusin":
        bonus.laningBonus += 6;
        bonus.clutchBonus += 5;
        break;
      
      case "kt_2018_core":
        bonus.mechanicsBonus += 5;
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 5;
        bonus.macroBonus += 5;
        bonus.clutchBonus += 5;
        break;
      
      case "zeka_kingen":
        bonus.clutchBonus += 7;
        break;
      
      case "deft_drx_2022":
        bonus.clutchBonus += 10;
        break;
      
      case "tarzan_chovy":
        bonus.mechanicsBonus += 5;
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 5;
        bonus.macroBonus += 6;
        bonus.clutchBonus += 5;
        break;
      
      case "viper_lehends_grf":
        bonus.mechanicsBonus += 4;
        bonus.laningBonus += 4;
        bonus.teamfightBonus += 4;
        bonus.macroBonus += 4;
        bonus.clutchBonus += 4;
        break;
      
      case "pray_gorilla":
        bonus.clutchBonus += 7;
        bonus.teamfightBonus += 6;
        break;
      
      case "smeb_peanut_rox":
        bonus.mechanicsBonus += 5;
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 5;
        bonus.macroBonus += 5;
        bonus.clutchBonus += 5;
        break;
      
      case "lucid_aiming":
        bonus.mechanicsBonus += 5;
        break;
      
      case "kuro_hojin":
        bonus.macroBonus += 5;
        bonus.teamfightBonus += 4;
        break;
      
      case "dwg_2020_worlds":
        bonus.mechanicsBonus += 5;
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 5;
        bonus.macroBonus += 5;
        bonus.clutchBonus += 7;
        break;
      
      case "skt_2015_golden":
        bonus.ovrBonus += 7;
        bonus.mechanicsBonus += 5;
        bonus.laningBonus += 5;
        bonus.teamfightBonus += 5;
        bonus.macroBonus += 5;
        bonus.clutchBonus += 5;
        break;
      
      case "skt_2016":
        bonus.clutchBonus += 6;
        bonus.teamfightBonus += 5;
        break;
      
      case "rox_2016":
        bonus.mechanicsBonus += 4;
        bonus.laningBonus += 4;
        bonus.teamfightBonus += 6;
        bonus.macroBonus += 4;
        bonus.clutchBonus += 4;
        break;
      
      case "lz_2017":
        bonus.laningBonus += 4;
        bonus.mechanicsBonus += 4;
        break;
      
      case "kt_2018_roster":
        bonus.ovrBonus += 6;
        bonus.clutchBonus += 8;
        break;
      
      case "ssg_2017_worlds":
        bonus.clutchBonus += 7;
        bonus.macroBonus += 6;
        break;
    }
  }

  return bonus;
}

/**
 * 개별 카드 스탯 (시너지 적용)
 */
export function getCardStatsWithSynergy(
  card: UserCard,
  squad: Squad,
  synergies: Synergy[]
): CardStats {
  const baseStats = { ...card.stats };
  const bonus = calculateSynergyBonus(squad, synergies);
  
  // 강화 레벨 적용 (+1 OVR per level)
  baseStats.ovr += card.upgradeLevel;

  // 전역 보너스
  baseStats.mechanics += bonus.mechanicsBonus;
  baseStats.laning += bonus.laningBonus;
  baseStats.teamfight += bonus.teamfightBonus;
  baseStats.macro += bonus.macroBonus;
  baseStats.clutch += bonus.clutchBonus;

  // 포지션별 특정 시너지
  for (const synergy of synergies) {
    if (synergy.id === "bot_duo" && (card.position === "ADC" || card.position === "SUP")) {
      baseStats.teamfight += 4;
      baseStats.clutch += 3;
    }
    
    if (synergy.id === "mid_jungle" && (card.position === "MID" || card.position === "JGL")) {
      baseStats.macro += 4;
      baseStats.mechanics += 3;
    }
    
    if (synergy.id === "top_jungle") {
      if (card.position === "TOP") {
        baseStats.laning += 3;
      }
      if (card.position === "JGL") {
        baseStats.macro += 2;
      }
    }
  }

  // OVR 보너스 (% 증가)
  if (bonus.ovrBonus > 0) {
    baseStats.ovr = Math.round(baseStats.ovr * (1 + bonus.ovrBonus / 100));
  }

  return baseStats;
}

/**
 * 스쿼드 총합 스탯 계산
 */
export function calculateSquadStats(squad: Squad, synergies: Synergy[]): SquadStats {
  const cards = Object.values(squad).filter(c => c !== null) as UserCard[];
  
  if (cards.length === 0) {
    return {
      totalOVR: 0,
      avgOVR: 0,
      totalMechanics: 0,
      totalLaning: 0,
      totalTeamfight: 0,
      totalMacro: 0,
      totalClutch: 0
    };
  }

  let totalOVR = 0;
  let totalMechanics = 0;
  let totalLaning = 0;
  let totalTeamfight = 0;
  let totalMacro = 0;
  let totalClutch = 0;

  for (const card of cards) {
    const stats = getCardStatsWithSynergy(card, squad, synergies);
    totalOVR += stats.ovr;
    totalMechanics += stats.mechanics;
    totalLaning += stats.laning;
    totalTeamfight += stats.teamfight;
    totalMacro += stats.macro;
    totalClutch += stats.clutch;
  }

  return {
    totalOVR,
    avgOVR: Math.round(totalOVR / cards.length),
    totalMechanics,
    totalLaning,
    totalTeamfight,
    totalMacro,
    totalClutch
  };
}

// Helper functions
function getTeamYearCounts(cards: UserCard[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of cards) {
    const key = `${card.team}_${card.year}`;
    counts[key] = (counts[key] || 0) + 1;
  }
  return counts;
}

function getYearCounts(cards: UserCard[]): Record<number, number> {
  const counts: Record<number, number> = {};
  for (const card of cards) {
    counts[card.year] = (counts[card.year] || 0) + 1;
  }
  return counts;
}