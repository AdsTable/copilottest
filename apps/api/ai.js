// OpenAI-powered meta generator with strict JSON output and caching.
import OpenAI from "openai";
import { z } from "zod";
import { cache } from "./cache.js";
import { OPENAI_API_KEY, OPENAI_MODEL, META_CACHE_TTL_SECONDS } from "./config.js";

// Schema to validate AI output.
const MetaSchema = z.object({
  title: z.string().min(10).max(120),
  description: z.string().min(30).max(320),
  keywords: z.string().min(5).max(512),
  ogTitle: z.string().min(10).max(120),
  ogDescription: z.string().min(30).max(320)
});

const openai = OPENAI_API_KEY ? new OpenAI({ apiKey: OPENAI_API_KEY }) : null;

// Heuristic fallback used when AI is unavailable or fails validation.
function heuristicMeta(city, type) {
  const normCity = String(city || "").trim().toLowerCase();
  const normType = String(type || "").trim().toLowerCase();
  const displayType = normType === "kvartiry" ? "квартиры" : normType === "doma" ? "дома" : normType || "недвижимость";
  const displayCity = normCity || "вашем городе";
  const title = `Купить ${displayType} в ${displayCity} — цены, фото, районы`;
  const description = `Подборка актуальных предложений ${displayType} в ${displayCity}. Смотрите фото, цены и расположение районов. Обновление ежедневно.`;
  const keywords = `${normType}, ${normCity}, недвижимость, купить, цены, фото`;
  return { title, description, keywords, ogTitle: title, ogDescription: description };
}

// Build a stable cache key to avoid excessive OpenAI calls.
function metaCacheKey(city, type) {
  return `meta:v1:${OPENAI_MODEL}:${String(city).toLowerCase()}:${String(type).toLowerCase()}`;
}

// Call OpenAI with strict JSON format. Keep temperature low for consistency.
async function generateMetaWithOpenAI(city, type) {
  if (!openai) return heuristicMeta(city, type);

  const system = [
    "You are an SEO assistant for a real estate landing page.",
    "Return ONLY a JSON object with fields: title, description, keywords, ogTitle, ogDescription.",
    "Language: Russian. Audience: buyers of real estate.",
    "Constraints: title<=120 chars, description<=320 chars, natural language, no clickbait, include city and type context.",
    "Keywords: comma-separated, include locality and property type."
  ].join(" ");

  const user = JSON.stringify({
    city,
    type,
    instructions: "Generate SEO meta for list page of real estate offers."
  });

  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: "system", content: system },
      { role: "user", content: user }
    ],
    response_format: { type: "json_object" },
    temperature: 0.4,
    max_tokens: 300
  });

  const content = completion.choices?.[0]?.message?.content;
  if (!content) throw new Error("OpenAI returned empty content");

  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    throw new Error("OpenAI returned non-JSON content");
  }

  const result = MetaSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error("Meta validation failed");
  }
  return result.data;
}

export async function getMeta(city, type) {
  const key = metaCacheKey(city, type);
  const cached = cache.get(key);
  if (cached) return cached;

  let meta;
  try {
    meta = await generateMetaWithOpenAI(city, type);
  } catch (err) {
    // Fallback on heuristic if AI fails or is not configured.
    meta = heuristicMeta(city, type);
  }

  cache.set(key, meta, META_CACHE_TTL_SECONDS);
  return meta;
}