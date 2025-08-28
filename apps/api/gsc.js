// Google Search Console integration to fetch metrics and compute sitemap priority.
import { google } from "googleapis";
import { cache } from "./cache.js";
import { GSC_SITE_URL, GSC_LOOKBACK_DAYS, GSC_CACHE_TTL_SECONDS, WEB_BASE_URL } from "./config.js";

// Fetch Search Analytics rows grouped by page for the property.
// Returns Map<pageUrl, { clicks, impressions, ctr, position }>
async function fetchSearchAnalytics() {
  const cacheKey = `gsc:${GSC_SITE_URL}:${GSC_LOOKBACK_DAYS}`;
  const cached = cache.get(cacheKey);
  if (cached) return cached;

  const auth = new google.auth.GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/webmasters.readonly"]
  });
  const client = await auth.getClient();
  const webmasters = google.webmasters({ version: "v3", auth: client });

  const endDate = new Date();
  const startDate = new Date(Date.now() - GSC_LOOKBACK_DAYS * 86400000);
  const request = {
    siteUrl: GSC_SITE_URL,
    requestBody: {
      startDate: startDate.toISOString().slice(0, 10),
      endDate: endDate.toISOString().slice(0, 10),
      dimensions: ["page"],
      rowLimit: 25000
    }
  };

  const resp = await webmasters.searchanalytics.query(request);
  const rows = resp.data.rows || [];
  const map = new Map();
  for (const r of rows) {
    const page = r.keys?.[0];
    if (!page) continue;
    map.set(page, {
      clicks: r.clicks || 0,
      impressions: r.impressions || 0,
      ctr: r.ctr || 0,
      position: r.position || 0
    });
  }

  cache.set(cacheKey, map, GSC_CACHE_TTL_SECONDS);
  return map;
}

export async function fetchMetricsForPaths(paths) {
  if (!GSC_SITE_URL) return null;
  try {
    const map = await fetchSearchAnalytics();
    const base = new URL(WEB_BASE_URL);
    const result = {};
    for (const path of paths) {
      const pageUrl = new URL(path.startsWith("/") ? path : `/${path}`, base).href;
      const metrics = map.get(pageUrl) || null;
      result[path] = metrics;
    }
    return result;
  } catch {
    return null; // On any error, gracefully disable prioritization for now
  }
}

// Compute a normalized priority [0.1, 1.0] from metrics.
// Heuristic: clicks dominate, then position (closer to 1 is better), then CTR.
export function computePriority(metrics) {
  if (!metrics) return 0.5;
  const clicksNorm = Math.min(1, (metrics.clicks || 0) / 100); // saturate at 100 clicks
  const pos = metrics.position || 0;
  const posNorm = pos > 0 ? Math.min(1, Math.max(0, (10 - Math.min(pos, 50)) / 10)) : 0.5; // 1 at pos<=1, 0 at pos>=10
  const ctrNorm = Math.min(1, (metrics.ctr || 0) / 0.3); // 30% saturates

  const score = 0.3 + 0.5 * clicksNorm + 0.2 * posNorm + 0.1 * ctrNorm;
  return Math.max(0.1, Math.min(1.0, score));
}

export function changefreqFromPriority(priority) {
  if (priority >= 0.85) return "daily";
  if (priority >= 0.6) return "weekly";
  return "monthly";
}