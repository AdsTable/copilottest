// Express API with OpenAI meta generation (cached) and GSC-prioritized sitemap.
import "dotenv/config"; // Load .env for local development
import express from "express";
import cors from "cors";
import { getMeta } from "./ai.js";
import { getPrioritizedEntries, addOrUpdateEntry } from "./sitemap.js";

const app = express();
app.use(express.json());
app.use(cors({ origin: ["http://localhost:3000"], credentials: false }));

// SEO meta endpoint using OpenAI (with caching) and heuristic fallback.
app.get("/api/seo/meta", async (req, res) => {
  try {
    const { city, type } = req.query;
    if (!city || !type) return res.status(400).json({ error: "city and type are required" });
    const meta = await getMeta(String(city), String(type));
    // Optionally add new path to sitemap registry on first access
    addOrUpdateEntry(`${String(city)}/${String(type)}`);
    return res.json(meta);
  } catch (err) {
    return res.status(500).json({ error: "failed_to_generate_meta" });
  }
});

// Sitemap entries endpoint with optional prioritization via Search Console signals.
app.get("/api/seo/sitemap-entries", async (_req, res) => {
  try {
    const entries = await getPrioritizedEntries();
    return res.json(entries);
  } catch {
    // Graceful fallback: empty array if something unexpected happens
    return res.json([]);
  }
});

// Optional: Trigger manual refresh logic (placeholder; prioritization is computed on demand).
app.post("/api/seo/rebuild-sitemap", async (_req, res) => {
  try {
    // In this MVP, entries are prioritized on read. Hook a background job here if needed.
    return res.status(202).json({ status: "accepted" });
  } catch {
    return res.status(500).json({ error: "failed_to_rebuild" });
  }
});

// Demo listings for a city/type
app.get("/api/listings", (req, res) => {
  const { city, type } = req.query;
  if (!city || !type) return res.status(400).json({ error: "city and type are required" });

  const items = Array.from({ length: 12 }).map((_, i) => ({
    id: `${city}-${type}-${i + 1}`,
    title: `Предложение ${i + 1}: ${type} — ${city}`,
    short: `Краткое описание объекта №${i + 1} в ${city}.`,
    url: `http://localhost:3000/${city}/${type}/listing-${i + 1}`
  }));

  return res.json({
    h1: `Лучшие ${type} в ${city}`,
    intro: `Актуальные предложения ${type} в ${city}.`,
    items
  });
});

// Health check
app.get("/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});