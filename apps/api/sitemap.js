// In-memory sitemap registry with optional prioritization via GSC.
import { fetchMetricsForPaths, computePriority, changefreqFromPriority } from "./gsc.js";

// Seed registry. Replace with DB in production.
let sitemapEntries = [
  { path: "moskva/kvartiry", priority: 0.8, changefreq: "daily", lastModified: new Date().toISOString() },
  { path: "spb/kvartiry", priority: 0.8, changefreq: "daily", lastModified: new Date().toISOString() }
];

export function listPaths() {
  return sitemapEntries.map(e => e.path);
}

export function addOrUpdateEntry(path) {
  const idx = sitemapEntries.findIndex(e => e.path === path);
  if (idx >= 0) {
    sitemapEntries[idx].lastModified = new Date().toISOString();
    return sitemapEntries[idx];
  }
  const entry = {
    path,
    priority: 0.5,
    changefreq: "weekly",
    lastModified: new Date().toISOString()
  };
  sitemapEntries.push(entry);
  return entry;
}

export async function getPrioritizedEntries() {
  const paths = listPaths();
  const metricsMap = await fetchMetricsForPaths(paths);

  if (!metricsMap) {
    // No GSC metrics available — return as-is.
    return sitemapEntries;
  }

  return sitemapEntries.map(e => {
    const metrics = metricsMap[e.path];
    const priority = computePriority(metrics);
    const changefreq = changefreqFromPriority(priority);
    return {
      ...e,
      priority,
      changefreq
    };
  });
}