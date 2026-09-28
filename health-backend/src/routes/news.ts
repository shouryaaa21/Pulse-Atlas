import { Router } from "express";
import { getLatestNews, refreshNewsFeeds } from "../services/news";

export const newsRouter = Router();

// GET /api/news/latest — items already ingested into the database.
// This is what the frontend ticker should poll (every 30-60s is plenty).
newsRouter.get("/latest", async (_req, res) => {
  const items = await getLatestNews(20);
  res.json(items);
});

// POST /api/news/refresh — pulls fresh items from the configured RSS
// feeds right now. Call this from a scheduled job (see README) rather
// than on every page load.
newsRouter.post("/refresh", async (_req, res) => {
  try {
    const count = await refreshNewsFeeds();
    res.json({ ingested: count });
  } catch (err) {
    console.error("News refresh failed:", err);
    res.status(502).json({ error: "Failed to refresh one or more feeds." });
  }
});
