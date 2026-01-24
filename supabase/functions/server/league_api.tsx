// 리그 데이터 관리 API

import { Hono } from "npm:hono";
import * as kv from "./kv_store.tsx";

const app = new Hono();

/**
 * 리그 데이터 저장
 * POST /league/save
 */
app.post("/save", async (c) => {
  try {
    const { userId, league } = await c.req.json();

    if (!userId || !league) {
      return c.json({ error: "userId와 league 데이터가 필요합니다" }, 400);
    }

    // KV Store에 저장
    const key = `league:${userId}:current`;
    await kv.set(key, JSON.stringify(league));

    console.log(`✅ 리그 저장 완료: ${key}`);

    return c.json({
      success: true,
      message: "리그 데이터 저장 완료",
    });
  } catch (error) {
    console.error("❌ 리그 저장 오류:", error);
    return c.json(
      { error: `리그 저장 중 오류 발생: ${error.message}` },
      500
    );
  }
});

/**
 * 리그 데이터 로드
 * GET /league/load?userId=xxx
 */
app.get("/load", async (c) => {
  try {
    const userId = c.req.query("userId");

    if (!userId) {
      return c.json({ error: "userId가 필요합니다" }, 400);
    }

    // KV Store에서 조회
    const key = `league:${userId}:current`;
    const data = await kv.get(key);

    if (!data) {
      console.log(`ℹ️ 리그 데이터 없음: ${key}`);
      return c.json({ error: "저장된 리그가 없습니다" }, 404);
    }

    const league = JSON.parse(data);
    console.log(`✅ 리그 로드 완료: ${key}`);

    return c.json({
      success: true,
      league,
    });
  } catch (error) {
    console.error("❌ 리그 로드 오류:", error);
    return c.json(
      { error: `리그 로드 중 오류 발생: ${error.message}` },
      500
    );
  }
});

/**
 * 리그 데이터 삭제
 * DELETE /league/delete
 */
app.delete("/delete", async (c) => {
  try {
    const { userId } = await c.req.json();

    if (!userId) {
      return c.json({ error: "userId가 필요합니다" }, 400);
    }

    // KV Store에서 삭제
    const key = `league:${userId}:current`;
    await kv.del(key);

    console.log(`✅ 리그 삭제 완료: ${key}`);

    return c.json({
      success: true,
      message: "리그 데이터 삭제 완료",
    });
  } catch (error) {
    console.error("❌ 리그 삭제 오류:", error);
    return c.json(
      { error: `리그 삭제 중 오류 발생: ${error.message}` },
      500
    );
  }
});

export default app;
