import { Router } from "express";
import { getCountryIndicator, searchIndicatorCatalog, INDICATORS } from "../services/who";

export const regionsRouter = Router();

// GET /api/regions/indicator?country=IND&indicator=lifeExpectancy
// "indicator" can be one of the friendly names below, OR any raw WHO
// indicator code you found via /api/regions/search-indicators.
// Real data from the WHO Global Health Observatory.
regionsRouter.get("/indicator", async (req, res) => {
  const country = String(req.query.country ?? "").toUpperCase();
  const indicator = String(req.query.indicator ?? "lifeExpectancy");

  if (!country) {
    return res.status(400).json({
      error: "Missing query parameter: country (use a 3-letter ISO code, e.g. IND, USA, GBR)",
    });
  }

  try {
    const point = await getCountryIndicator(indicator, country);
    if (!point) {
      return res.status(404).json({ error: `No WHO data found for ${country} / ${indicator}` });
    }
    res.json(point);
  } catch (err) {
    console.error("WHO lookup failed:", err);
    res.status(502).json({ error: "Failed to reach WHO GHO. Try again shortly." });
  }
});

// GET /api/regions/indicators — lists the friendly indicator shortcuts
// this backend already knows, so the frontend can build a picker.
regionsRouter.get("/indicators", (_req, res) => {
  res.json(INDICATORS);
});

// GET /api/regions/search-indicators?q=diabetes
// Searches WHO's full ~2,000-indicator catalog by keyword, so you can
// discover a real indicator code for anything not in the shortcut list
// above, without guessing.
regionsRouter.get("/search-indicators", async (req, res) => {
  const q = String(req.query.q ?? "").trim();
  if (!q) {
    return res.status(400).json({ error: "Missing query parameter: q" });
  }

  try {
    const matches = await searchIndicatorCatalog(q);
    res.json(matches);
  } catch (err) {
    console.error("WHO indicator catalog search failed:", err);
    res.status(502).json({ error: "Failed to reach WHO GHO. Try again shortly." });
  }
});
