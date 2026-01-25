// 고급 경기 시뮬레이션 엔진 - 이벤트 설정 및 상수

import { EventConfig, GameEventType, CoachCallType, CallModifiers } from "@/types/advancedSimulation";

// ========== 이벤트 설정 테이블 ==========

export const EVENT_CONFIGS: Record<GameEventType, EventConfig> = {
  // === 게임 시작 ===
  GAME_START: {
    type: "GAME_START",
    minTime: 0,
    maxTime: 0,
    baseChance: 1,
    cooldown: 9999,
    statWeights: { mechanics: 0, laning: 0, teamfight: 0, macro: 0, clutch: 0 },
    goldSwingRange: [0, 0]
  },

  // === 초반 (0~10분) ===
  FIRST_BLOOD_GANK: {
    type: "FIRST_BLOOD_GANK",
    minTime: 120, // 2분
    maxTime: 600, // 10분
    baseChance: 0.15,
    cooldown: 9999, // 1회만
    statWeights: { mechanics: 0.3, laning: 0.2, teamfight: 0.1, macro: 0.2, clutch: 0.2 },
    goldSwingRange: [400, 800]
  },
  
  FIRST_BLOOD_SOLO: {
    type: "FIRST_BLOOD_SOLO",
    minTime: 180,
    maxTime: 600,
    baseChance: 0.1,
    cooldown: 9999,
    statWeights: { mechanics: 0.5, laning: 0.4, teamfight: 0, macro: 0, clutch: 0.1 },
    goldSwingRange: [400, 700]
  },
  
  FIRST_BLOOD_DIVE: {
    type: "FIRST_BLOOD_DIVE",
    minTime: 240,
    maxTime: 600,
    baseChance: 0.08,
    cooldown: 9999,
    statWeights: { mechanics: 0.4, laning: 0.1, teamfight: 0.2, macro: 0.1, clutch: 0.2 },
    goldSwingRange: [300, 900]
  },
  
  LANE_PHASE: {
    type: "LANE_PHASE",
    minTime: 60,
    maxTime: 900,
    baseChance: 0.3,
    cooldown: 120,
    statWeights: { mechanics: 0.2, laning: 0.6, teamfight: 0, macro: 0.1, clutch: 0.1 },
    goldSwingRange: [200, 500]
  },
  
  FIRST_DRAGON: {
    type: "FIRST_DRAGON",
    minTime: 300, // 5분
    maxTime: 720,
    baseChance: 0.2,
    cooldown: 9999,
    statWeights: { mechanics: 0.2, laning: 0.1, teamfight: 0.2, macro: 0.4, clutch: 0.1 },
    goldSwingRange: [500, 900],
    conditions: ["dragon_alive"]
  },
  
  HERALD_1: {
    type: "HERALD_1",
    minTime: 480, // 8분
    maxTime: 1200,
    baseChance: 0.25,
    cooldown: 9999,
    statWeights: { mechanics: 0.2, laning: 0.1, teamfight: 0.3, macro: 0.3, clutch: 0.1 },
    goldSwingRange: [600, 1200],
    conditions: ["herald_alive"]
  },
  
  COUNTER_JUNGLE: {
    type: "COUNTER_JUNGLE",
    minTime: 120,
    maxTime: 900,
    baseChance: 0.12,
    cooldown: 180,
    statWeights: { mechanics: 0.4, laning: 0.2, teamfight: 0, macro: 0.3, clutch: 0.1 },
    goldSwingRange: [200, 500]
  },
  
  TOWER_DIVE: {
    type: "TOWER_DIVE",
    minTime: 300,
    maxTime: 1200,
    baseChance: 0.1,
    cooldown: 240,
    statWeights: { mechanics: 0.4, laning: 0, teamfight: 0.3, macro: 0.1, clutch: 0.2 },
    goldSwingRange: [400, 1000]
  },
  
  BOT_SKIRMISH: {
    type: "BOT_SKIRMISH",
    minTime: 180,
    maxTime: 900,
    baseChance: 0.18,
    cooldown: 150,
    statWeights: { mechanics: 0.3, laning: 0.2, teamfight: 0.3, macro: 0.1, clutch: 0.1 },
    goldSwingRange: [300, 700]
  },
  
  MID_SKIRMISH: {
    type: "MID_SKIRMISH",
    minTime: 240,
    maxTime: 900,
    baseChance: 0.15,
    cooldown: 180,
    statWeights: { mechanics: 0.3, laning: 0.2, teamfight: 0.2, macro: 0.2, clutch: 0.1 },
    goldSwingRange: [300, 600]
  },

  // === 중반 (10~20분) ===
  HERALD_2: {
    type: "HERALD_2",
    minTime: 1200, // 20분
    maxTime: 1320,
    baseChance: 0.2,
    cooldown: 9999,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.3, macro: 0.4, clutch: 0.1 },
    goldSwingRange: [700, 1300],
    conditions: ["herald2_alive"]
  },
  
  TOWER_TAKEDOWN: {
    type: "TOWER_TAKEDOWN",
    minTime: 600,
    maxTime: 2400,
    baseChance: 0.25,
    cooldown: 120,
    statWeights: { mechanics: 0.2, laning: 0.1, teamfight: 0.2, macro: 0.4, clutch: 0.1 },
    goldSwingRange: [500, 1200]
  },
  
  DRAGON_FIGHT: {
    type: "DRAGON_FIGHT",
    minTime: 600,
    maxTime: 2400,
    baseChance: 0.3,
    cooldown: 300,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.4, macro: 0.3, clutch: 0.1 },
    goldSwingRange: [600, 1100],
    conditions: ["dragon_alive"]
  },
  
  PICK_OFF: {
    type: "PICK_OFF",
    minTime: 720,
    maxTime: 2400,
    baseChance: 0.2,
    cooldown: 180,
    statWeights: { mechanics: 0.3, laning: 0, teamfight: 0.1, macro: 0.4, clutch: 0.2 },
    goldSwingRange: [400, 800]
  },
  
  TEAMFIGHT_SMALL: {
    type: "TEAMFIGHT_SMALL",
    minTime: 600,
    maxTime: 2400,
    baseChance: 0.25,
    cooldown: 180,
    statWeights: { mechanics: 0.3, laning: 0, teamfight: 0.5, macro: 0.1, clutch: 0.1 },
    goldSwingRange: [700, 1400]
  },
  
  OBJECTIVE_TRADE: {
    type: "OBJECTIVE_TRADE",
    minTime: 600,
    maxTime: 2400,
    baseChance: 0.15,
    cooldown: 200,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.2, macro: 0.5, clutch: 0.1 },
    goldSwingRange: [400, 900]
  },

  // === 후반 (20분~) ===
  BARON_START: {
    type: "BARON_START",
    minTime: 1200, // 20분
    maxTime: 2700,
    baseChance: 0.2,
    cooldown: 300,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.3, macro: 0.4, clutch: 0.1 },
    goldSwingRange: [0, 0], // 시작만, 결과는 BARON_TAKE/STEAL
    conditions: ["baron_alive"]
  },
  
  BARON_TAKE: {
    type: "BARON_TAKE",
    minTime: 1200,
    maxTime: 2700,
    baseChance: 0.15,
    cooldown: 420,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.4, macro: 0.3, clutch: 0.1 },
    goldSwingRange: [1500, 3000],
    conditions: ["baron_alive"]
  },
  
  BARON_STEAL: {
    type: "BARON_STEAL",
    minTime: 1200,
    maxTime: 2700,
    baseChance: 0.05,
    cooldown: 420,
    statWeights: { mechanics: 0.5, laning: 0, teamfight: 0.1, macro: 0.1, clutch: 0.3 },
    goldSwingRange: [2000, 4000],
    conditions: ["baron_alive"]
  },
  
  ELDER_DRAGON: {
    type: "ELDER_DRAGON",
    minTime: 2100, // 35분
    maxTime: 2700,
    baseChance: 0.25,
    cooldown: 360,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.5, macro: 0.2, clutch: 0.1 },
    goldSwingRange: [2000, 3500],
    conditions: ["elder_alive"]
  },
  
  ACE_TEAMFIGHT: {
    type: "ACE_TEAMFIGHT",
    minTime: 1200,
    maxTime: 2700,
    baseChance: 0.18,
    cooldown: 240,
    statWeights: { mechanics: 0.3, laning: 0, teamfight: 0.5, macro: 0.1, clutch: 0.1 },
    goldSwingRange: [1500, 2500]
  },
  
  BASE_SIEGE: {
    type: "BASE_SIEGE",
    minTime: 1500,
    maxTime: 2700,
    baseChance: 0.15,
    cooldown: 300,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.4, macro: 0.3, clutch: 0.1 },
    goldSwingRange: [1000, 2000]
  },
  
  BACKDOOR_ATTEMPT: {
    type: "BACKDOOR_ATTEMPT",
    minTime: 1800,
    maxTime: 2700,
    baseChance: 0.08,
    cooldown: 360,
    statWeights: { mechanics: 0.3, laning: 0, teamfight: 0.1, macro: 0.5, clutch: 0.1 },
    goldSwingRange: [1500, 3000]
  },
  
  NEXUS_END: {
    type: "NEXUS_END",
    minTime: 1500, // 최소 25분
    maxTime: 2700,
    baseChance: 0.2, // 조건 충족 시 증가
    cooldown: 9999,
    statWeights: { mechanics: 0.2, laning: 0, teamfight: 0.3, macro: 0.3, clutch: 0.2 },
    goldSwingRange: [0, 0]
  }
};

// ========== 감독 콜 설정 ==========

export const COACH_CALL_CONFIGS: Record<CoachCallType, {
  cpCost: number;
  duration: number; // 분
  modifiers: CallModifiers;
}> = {
  SAFE_PLAY: {
    cpCost: 15,
    duration: 3,
    modifiers: {
      eventProbability: {
        "TOWER_DIVE": -0.3,
        "COUNTER_JUNGLE": -0.2,
        "PICK_OFF": -0.2
      },
      statBonus: { macro: 5, clutch: 3 },
      riskMultiplier: 0.7
    }
  },
  
  DIVE_CALL: {
    cpCost: 20,
    duration: 2,
    modifiers: {
      eventProbability: {
        "TOWER_DIVE": 0.4,
        "FIRST_BLOOD_DIVE": 0.3
      },
      statBonus: { mechanics: 5, teamfight: 5 },
      riskMultiplier: 1.5
    }
  },
  
  INVADE_CALL: {
    cpCost: 18,
    duration: 2,
    modifiers: {
      eventProbability: {
        "COUNTER_JUNGLE": 0.5,
        "FIRST_BLOOD_GANK": 0.2
      },
      statBonus: { mechanics: 5, macro: 3 }
    }
  },
  
  VISION_CONTROL: {
    cpCost: 12,
    duration: 4,
    modifiers: {
      eventProbability: {
        "PICK_OFF": 0.3,
        "BARON_STEAL": 0.2
      },
      statBonus: { macro: 8 }
    }
  },
  
  FORCE_OBJECTIVE: {
    cpCost: 25,
    duration: 2,
    modifiers: {
      eventProbability: {
        "DRAGON_FIGHT": 0.4,
        "BARON_START": 0.3,
        "HERALD_1": 0.3,
        "HERALD_2": 0.3
      },
      statBonus: { macro: 5, teamfight: 5 }
    }
  },
  
  AVOID_FIGHT: {
    cpCost: 10,
    duration: 3,
    modifiers: {
      eventProbability: {
        "TEAMFIGHT_SMALL": -0.4,
        "ACE_TEAMFIGHT": -0.3,
        "BOT_SKIRMISH": -0.3,
        "MID_SKIRMISH": -0.3
      },
      statBonus: { macro: 5 }
    }
  },
  
  START_BARON: {
    cpCost: 30,
    duration: 1,
    modifiers: {
      eventProbability: {
        "BARON_TAKE": 0.5,
        "BARON_START": 0.8
      },
      statBonus: { teamfight: 8, clutch: 5 }
    }
  },
  
  BARON_FAKE: {
    cpCost: 15,
    duration: 1,
    modifiers: {
      eventProbability: {
        "BARON_STEAL": 0.3,
        "PICK_OFF": 0.4
      },
      statBonus: { macro: 10 }
    }
  }
};

// ========== 게임 플랜 보정 ==========

export const GAME_PLAN_MODIFIERS = {
  EARLY: {
    eventBonus: {
      "FIRST_BLOOD_GANK": 0.2,
      "COUNTER_JUNGLE": 0.2,
      "TOWER_DIVE": 0.15,
      "LANE_PHASE": 0.1
    },
    statBonus: { laning: 5, mechanics: 3 }
  },
  
  OBJECTIVE: {
    eventBonus: {
      "FIRST_DRAGON": 0.3,
      "DRAGON_FIGHT": 0.3,
      "HERALD_1": 0.2,
      "HERALD_2": 0.2,
      "BARON_TAKE": 0.2
    },
    statBonus: { macro: 8, teamfight: 3 }
  },
  
  FIGHT: {
    eventBonus: {
      "BOT_SKIRMISH": 0.2,
      "MID_SKIRMISH": 0.2,
      "TEAMFIGHT_SMALL": 0.3,
      "ACE_TEAMFIGHT": 0.2
    },
    statBonus: { teamfight: 8, mechanics: 5 }
  },
  
  SCALING: {
    eventBonus: {
      "LANE_PHASE": 0.2,
      "AVOID_FIGHT": 0.3,
      "TOWER_TAKEDOWN": -0.1
    },
    statBonus: { laning: 5, macro: 5 }
  },
  
  SIDE: {
    eventBonus: {
      "TOWER_TAKEDOWN": 0.3,
      "BACKDOOR_ATTEMPT": 0.3,
      "PICK_OFF": 0.2
    },
    statBonus: { macro: 8 }
  }
};

// ========== 세트 후 피드백 효과 ==========

export const POST_GAME_FEEDBACK_EFFECTS = {
  REVIEW_MACRO: {
    tendencyBonus: { macro: 3, objective: 2 },
    confidenceBoost: 2
  },
  
  MENTAL_CARE: {
    tendencyBonus: { clutch: 5 },
    confidenceBoost: 8,
    fatigueReduction: 15
  },
  
  LANE_FOCUS: {
    tendencyBonus: { laning: 5 },
    confidenceBoost: 3
  },
  
  TEAMFIGHT_REVIEW: {
    tendencyBonus: { teamfight: 4 },
    confidenceBoost: 2
  }
};

// ========== 기타 상수 ==========

export const SIMULATION_CONSTANTS = {
  TICK_INTERVAL: 60, // 60초
  MIN_GAME_DURATION: 1500, // 25분
  MAX_GAME_DURATION: 2700, // 45분
  
  CP_MAX: 100,
  CP_REGEN_PER_MINUTE: 3,
  
  BASE_GOLD_PER_MINUTE: 300,
  
  FORM_CHANGE_PER_EVENT: {
    WIN: { confidence: 2, condition: -1, fatigue: 1 },
    LOSS: { confidence: -3, condition: -1, fatigue: 1 },
    BIG_WIN: { confidence: 5, condition: -1, fatigue: 2 },
    BIG_LOSS: { confidence: -5, condition: -2, fatigue: 2 }
  },
  
  FATIGUE_PER_SET: 8,
  
  WIN_PROB_FACTORS: {
    goldDiff: 0.0002, // 골드 차이 1당 승률 영향
    towers: 0.05,
    dragons: 0.03,
    barons: 0.15,
    momentum: 0.002
  }
};

// ========== 킬 수 증가 설정 ==========

// 각 이벤트별 킬 수 증가량 (success 시)
export const EVENT_KILL_COUNTS: Partial<Record<GameEventType, number>> = {
  FIRST_BLOOD_GANK: 1,
  FIRST_BLOOD_SOLO: 1,
  FIRST_BLOOD_DIVE: 1,
  TOWER_DIVE: 2, // 타워다이브 성공 시 1-2킬
  BOT_SKIRMISH: 2, // 봇 교전 승리 시 1-2킬
  MID_SKIRMISH: 2, // 미드 교전 승리 시 1-2킬
  PICK_OFF: 1, // 픽 오프 1킬
  TEAMFIGHT_SMALL: 3, // 소규모 한타 2-3킬
  DRAGON_FIGHT: 2, // 드래곤 싸움 승리 시 1-2킬
  ACE_TEAMFIGHT: 5, // 에이스 = 5킬
  BARON_TAKE: 3, // 바론 획득 시 교전 발생
  BARON_STEAL: 1, // 스틸 시 정글러 킬
  BASE_SIEGE: 3, // 본진 공성 2-3킬
  BACKDOOR_ATTEMPT: 1 // 백도어 성공 시 1킬
};

// fail 시 상대팀에게 주는 킬 (역관광)
export const EVENT_FAIL_KILL_COUNTS: Partial<Record<GameEventType, number>> = {
  TOWER_DIVE: 2, // 타워다이브 실패 시 역관광 2킬
  FIRST_BLOOD_DIVE: 1, // 퍼블 다이브 실패 시 1킬
  BARON_TAKE: 2, // 바론 실패 시 역관광 2킬
  BACKDOOR_ATTEMPT: 1 // 백도어 실패 시 1킬
};

// ========== 이벤트 메시지 템플릿 ==========

export const EVENT_MESSAGES: Record<GameEventType, {
  success: (team: string) => string;
  fail?: (team: string) => string;
}> = {
  GAME_START: {
    success: () => "경기가 시작되었습니다!"
  },
  
  FIRST_BLOOD_GANK: {
    success: (team) => `${team}가 정글 갱킹으로 퍼스트 블러드를 획득했습니다!`,
    fail: (team) => `${team}의 갱킹 시도가 실패했습니다.`
  },
  
  FIRST_BLOOD_SOLO: {
    success: (team) => `${team}가 솔로킬로 퍼스트 블러드를 따냈습니다!`
  },
  
  FIRST_BLOOD_DIVE: {
    success: (team) => `${team}가 과감한 타워다이브로 퍼스트 블러드!`,
    fail: (team) => `${team}의 타워다이브가 실패했습니다.`
  },
  
  LANE_PHASE: {
    success: (team) => `${team}가 라인전에서 우위를 점하고 있습니다.`
  },
  
  FIRST_DRAGON: {
    success: (team) => `${team}가 첫 드래곤을 확보했습니다!`
  },
  
  HERALD_1: {
    success: (team) => `${team}가 전령을 획득했습니다!`,
    fail: (team) => `${team}가 전령 싸움에서 밀렸습니다.`
  },
  
  COUNTER_JUNGLE: {
    success: (team) => `${team}가 적 정글을 침투해 이득을 봤습니다!`
  },
  
  TOWER_DIVE: {
    success: (team) => `${team}가 타워다이브에 성공했습니다!`,
    fail: (team) => `${team}의 타워다이브가 역관광당했습니다!`
  },
  
  BOT_SKIRMISH: {
    success: (team) => `${team}가 봇 라인 교전에서 승리했습니다!`
  },
  
  MID_SKIRMISH: {
    success: (team) => `${team}가 미드 교전에서 우위를 점했습니다!`
  },
  
  HERALD_2: {
    success: (team) => `${team}가 두 번째 전령을 획득했습니다!`
  },
  
  TOWER_TAKEDOWN: {
    success: (team) => `${team}가 타워를 파괴했습니다!`
  },
  
  DRAGON_FIGHT: {
    success: (team) => `${team}가 드래곤 싸움에서 승리했습니다!`,
    fail: (team) => `${team}가 드래곤을 뺏겼습니다!`
  },
  
  PICK_OFF: {
    success: (team) => `${team}가 시야 싸움에서 한 명을 끊었습니다!`
  },
  
  TEAMFIGHT_SMALL: {
    success: (team) => `${team}가 소규모 교전에서 승리했습니다!`
  },
  
  OBJECTIVE_TRADE: {
    success: (team) => `${team}가 오브젝트 트레이드에서 이득을 봤습니다!`
  },
  
  BARON_START: {
    success: (team) => `${team}가 바론을 시작했습니다!`
  },
  
  BARON_TAKE: {
    success: (team) => `${team}가 바론을 획득했습니다!`,
    fail: (team) => `${team}의 바론 시도가 저지당했습니다!`
  },
  
  BARON_STEAL: {
    success: (team) => `${team}가 바론을 스틸했습니다!!!`,
    fail: (team) => `${team}의 바론 스틸 시도가 실패했습니다.`
  },
  
  ELDER_DRAGON: {
    success: (team) => `${team}가 장로 드래곤을 획득했습니다!`
  },
  
  ACE_TEAMFIGHT: {
    success: (team) => `${team}가 대규모 한타에서 에이스를 달성했습니다!`
  },
  
  BASE_SIEGE: {
    success: (team) => `${team}가 본진 공성에 성공했습니다!`
  },
  
  BACKDOOR_ATTEMPT: {
    success: (team) => `${team}가 백도어에 성공했습니다!`,
    fail: (team) => `${team}의 백도어 시도가 막혔습니다!`
  },
  
  NEXUS_END: {
    success: (team) => `${team}가 넥서스를 파괴했습니다! 승리!`
  }
};
