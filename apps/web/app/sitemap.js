// Dynamic sitemap powered by the API registry.
// Helps guide crawl budget to important pages.
export default async function sitemap() {
  const base = process.env.SEO_API_BASE || "http://localhost:4000";
  const res = await fetch(`${base}/api/seo/sitemap-entries`, { next: { revalidate: 3600 } });
  const entries = res.ok ? await res.json() : [];
  return entries.map(e => ({
    url: `http://localhost:3000/${e.path}`,
    lastModified: e.lastModified ? new Date(e.lastModified) : new Date(),
    changeFrequency: e.changefreq || "daily",
    priority: e.priority ?? 0.7
  }));
}