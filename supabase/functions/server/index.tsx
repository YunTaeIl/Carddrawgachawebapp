import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as lckCards from "./lck_cards.tsx";
import * as userApi from "./user_api.tsx";
import leagueApi from "./league_api.tsx";

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

// 🔍 디버그: 환경 변수 및 토큰 검증 테스트
app.get("/make-server-ffd115c0/debug/auth", async (c) => {
  const authHeader = c.req.header("Authorization");
  
  console.log("🔍 DEBUG /debug/auth called");
  console.log("🔍 Auth header present:", !!authHeader);
  console.log("🔍 SUPABASE_URL:", Deno.env.get("SUPABASE_URL") ? "SET" : "MISSING");
  console.log("🔍 SUPABASE_ANON_KEY:", Deno.env.get("SUPABASE_ANON_KEY") ? "SET" : "MISSING");
  
  if (!authHeader) {
    return c.json({ error: "No auth header" });
  }
  
  const token = authHeader.substring(7);
  console.log("🔍 Token length:", token.length);
  console.log("🔍 Token first 50 chars:", token.substring(0, 50));
  
  // 토큰 검증 시도
  try {
    const user = await userApi.getUserFromToken(authHeader);
    return c.json({ 
      success: !!user, 
      userId: user?.id,
      email: user?.email,
      tokenLength: token.length
    });
  } catch (error) {
    console.error("🔍 Error:", error);
    return c.json({ error: String(error) }, 500);
  }
});

// 🆕 유저 초기화 (OAuth 로그인 후 호출)
app.post("/make-server-ffd115c0/user/init", async (c) => {
  try {
    const authHeader = c.req.header("Authorization");
    console.log("🔥 /user/init called with auth header:", authHeader ? "Present" : "Missing");
    
    const user = await userApi.getUserFromToken(authHeader);
    if (!user) {
      console.error("❌ getUserFromToken returned null");
      return c.json({ 
        success: false, 
        code: 401,
        message: "Invalid JWT",
        error: "User authentication failed - token may be expired or invalid" 
      }, 401);
    }
    
    console.log("✅ User authenticated, initializing:", user.id, user.email);
    
    const result = await userApi.initializeUser(
      user.id, 
      user.email || "",
      user.user_metadata?.full_name || user.user_metadata?.name
    );
    
    return c.json({ success: true, ...result });
  } catch (error) {
    console.error("❌ Error initializing user:", error);
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

// 출석 체크
app.post("/make-server-ffd115c0/user/check-in", async (c) => {
  try {
    const user = await userApi.getUserFromToken(c.req.header("Authorization"));
    if (!user) {
      return c.json({ success: false, error: "Unauthorized" }, 401);
    }
    
    const result = await userApi.checkDailyAttendance(user.id);
    return c.json(result);
  } catch (error) {
    console.log(`Error checking in: ${error}`);
    return c.json({ success: false, error: String(error) }, 500);
  }
});

// ==================== 리그 API ====================
app.route("/make-server-ffd115c0/league", leagueApi);

Deno.serve(app.fetch);