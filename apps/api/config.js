// Centralized configuration for API services.
export const OPENAI_API_KEY = process.env.OPENAI_API_KEY || "";
export const OPENAI_MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
export const META_CACHE_TTL_SECONDS = parseInt(process.env.META_CACHE_TTL_SECONDS || "43200", 10);

export const GSC_SITE_URL = process.env.GSC_SITE_URL || "";
export const GSC_LOOKBACK_DAYS = parseInt(process.env.GSC_LOOKBACK_DAYS || "28", 10);
export const GSC_CACHE_TTL_SECONDS = parseInt(process.env.GSC_CACHE_TTL_SECONDS || "1800", 10);

export const WEB_BASE_URL = process.env.WEB_BASE_URL || "http://localhost:3000";