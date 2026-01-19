import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as lckCards from "./lck_cards.tsx";
import * as userApi from "./user_api.tsx";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Health check endpoint
app.get("/make-server-ffd115c0/health", (c) => {
  return c.json({ status: "ok" });
});

// LCK 카드 관련 API
app.get("/make-server-ffd115c0/cards", async (c) => {
  try {
    const cards = await lckCards.getAllCards();
    return c.json({ success: true, cards });
  } catch (error) {
    console.log(`Error fetching cards: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

app.get("/make-server-ffd115c0/cards/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const card = await lckCards.getCardById(id);
    if (!card) {
      return c.json({ success: false, error: "Card not found" }, 404);
    }
    return c.json({ success: true, card });
  } catch (error) {
    console.log(`Error fetching card ${c.req.param("id")}: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== 유저 API ====================

// 유저 프로필 생성
app.post("/make-server-ffd115c0/user/profile", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const { username } = await c.req.json();
    if (!username || username.length < 2 || username.length > 20) {
      return c.json({ success: false, error: "Invalid username" }, 400);
    }
    
    const profile = await userApi.createUserProfile(user.id, username);
    return c.json({ success: true, profile });
  } catch (error) {
    console.log(`Error creating profile: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 유저 프로필 조회
app.get("/make-server-ffd115c0/user/profile", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const profile = await userApi.getUserProfile(user.id);
    if (!profile) {
      return c.json({ success: false, error: "Profile not found" }, 404);
    }
    
    return c.json({ success: true, profile });
  } catch (error) {
    console.log(`Error fetching profile: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 게임 데이터 조회
app.get("/make-server-ffd115c0/user/game-data", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const gameData = await userApi.getGameData(user.id);
    if (!gameData) {
      return c.json({ success: false, error: "Game data not found" }, 404);
    }
    
    return c.json({ success: true, gameData });
  } catch (error) {
    console.log(`Error fetching game data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 게임 데이터 업데이트
app.put("/make-server-ffd115c0/user/game-data", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const updates = await c.req.json();
    const gameData = await userApi.updateGameData(user.id, updates);
    
    return c.json({ success: true, gameData });
  } catch (error) {
    console.log(`Error updating game data: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 보유 카드 조회
app.get("/make-server-ffd115c0/user/cards", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const cards = await userApi.getUserCards(user.id);
    return c.json({ success: true, cards });
  } catch (error) {
    console.log(`Error fetching user cards: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 카드 추가
app.post("/make-server-ffd115c0/user/cards", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const { cardId, instanceId, upgradeLevel } = await c.req.json();
    const card = await userApi.addUserCard(user.id, cardId, instanceId, upgradeLevel);
    
    return c.json({ success: true, card });
  } catch (error) {
    console.log(`Error adding card: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 카드 강화
app.put("/make-server-ffd115c0/user/cards/:instanceId/upgrade", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const instanceId = c.req.param("instanceId");
    const { upgradeLevel } = await c.req.json();
    const card = await userApi.upgradeUserCard(instanceId, upgradeLevel);
    
    return c.json({ success: true, card });
  } catch (error) {
    console.log(`Error upgrading card: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 스쿼드 조회
app.get("/make-server-ffd115c0/user/squad", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const squad = await userApi.getUserSquad(user.id);
    if (!squad) {
      return c.json({ success: false, error: "Squad not found" }, 404);
    }
    
    return c.json({ success: true, squad });
  } catch (error) {
    console.log(`Error fetching squad: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// 스쿼드 업데이트
app.put("/make-server-ffd115c0/user/squad", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const updates = await c.req.json();
    const squad = await userApi.updateUserSquad(user.id, updates);
    
    return c.json({ success: true, squad });
  } catch (error) {
    console.log(`Error updating squad: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

Deno.serve(app.fetch);