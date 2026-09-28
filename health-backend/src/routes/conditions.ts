import { Router } from "express";
import { searchCondition } from "../services/medlineplus";
import { searchPubMed } from "../services/pubmed";
import { prisma } from "../lib/prisma";

export const conditionsRouter = Router();

// GET /api/conditions/search?q=migraine
// Real lookup against MedlinePlus (NIH/NLM), cached locally.
conditionsRouter.get("/search", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    const result = await searchCondition(q);
    if (!result) {
      return res.status(404).json({ error: `No MedlinePlus result found for "${q}"` });
    }
    res.json(result);
  } catch (err) {
    console.error("Condition search failed:", err);
    res.status(502).json({ error: "Failed to reach MedlinePlus. Try again shortly." });
  }
});

// GET /api/conditions/citations?q=migraine
// Real, current PubMed articles related to the query — for backing a
// "medical approach" tab with actual sources instead of prose claims.
conditionsRouter.get("/citations", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    const results = await searchPubMed(q);
    res.json(results);
  } catch (err) {
    console.error("PubMed search failed:", err);
    res.status(502).json({ error: "Failed to reach PubMed. Try again shortly." });
  }
});

// POST /api/conditions/log
// Saves a personal note against a condition (the "Personal Symptom Log"
// module). No auth wired up yet — userId is just passed in as a plain
// string until you add real accounts.
conditionsRouter.post("/log", async (req, res) => {
  const { userId, condition, note } = req.body ?? {};
  if (!userId || !condition || !note) {
    return res.status(400).json({ error: "Requires userId, condition, and note" });
  }

  const entry = await prisma.symptomLogEntry.create({
    data: { userId, condition, note },
  });
  res.status(201).json(entry);
});

// GET /api/conditions/log?userId=abc
conditionsRouter.get("/log", async (req, res) => {
  const userId = String(req.query.userId ?? "");
  if (!userId) {
    return res.status(400).json({ error: "Missing query parameter: userId" });
  }

  const entries = await prisma.symptomLogEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  res.json(entries);
});
