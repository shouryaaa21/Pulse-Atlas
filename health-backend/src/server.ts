import express, { type ErrorRequestHandler } from "express";
import cors from "cors";
import dotenv from "dotenv";

import { conditionsRouter } from "./routes/conditions";
import { regionsRouter } from "./routes/regions";
import { newsRouter } from "./routes/news";
import { refreshNewsFeeds } from "./services/news";

dotenv.config();

const app = express();
const allowedOrigins = (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
  })
);
app.disable("x-powered-by");
app.use(express.json({ limit: "32kb" }));

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "pulseatlas-api", timestamp: new Date().toISOString() });
});

app.use("/api/conditions", conditionsRouter);
app.use("/api/regions", regionsRouter);
app.use("/api/news", newsRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error("Unhandled API error:", err);
  res.status(500).json({ error: "Unexpected server error. Try again shortly." });
};
app.use(errorHandler);

export default app;

if (!process.env.VERCEL) {
  const port = process.env.PORT ? Number(process.env.PORT) : 4000;
  app.listen(port, () => {
    console.log(`PulseAtlas API listening on http://localhost:${port}`);

  // Pull in some news on startup so /api/news/latest isn't empty the
  // first time the frontend asks. Also set up a refresh every 15
  // minutes — real news feeds don't need to be hit more often than that.
  refreshNewsFeeds()
    .then((count) => console.log(`Ingested ${count} news items on startup`))
    .catch((err) => console.error("Startup news refresh failed:", err));

  });
  setInterval(() => {
    refreshNewsFeeds().catch((err) => console.error("Scheduled news refresh failed:", err));
  }, 15 * 60 * 1000);
}
