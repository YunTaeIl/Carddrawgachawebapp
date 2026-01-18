import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as lckCards from "./lck_cards.tsx";

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

Deno.serve(app.fetch);