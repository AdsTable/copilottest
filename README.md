# AI Real Estate Landing — MVP (Next.js + Express) with OpenAI & Google Search Console

Minimal, SEO‑ready MVP to validate an AI‑assisted real estate landing idea:
- SEO-first SSR micro‑landings: `/{city}/{type}`
- Dynamic metadata (title/description/OG) from API (OpenAI-backed with caching)
- JSON‑LD (ItemList) injection
- Dynamic sitemap.xml prioritized by Search Console metrics and robots.txt
- Simple demo listings

## Prerequisites
- Node.js 18+ (recommended 20+)
- npm (or pnpm/yarn)
- (Optional) OpenAI API key
- (Optional) Google Cloud service account with access to your Search Console property

## Run API (localhost:4000)
```bash
cd apps/api
cp .env.example .env
# Edit .env with your OPENAI_API_KEY and model.
# For GSC:
# - Set GSC_SITE_URL to your property (e.g., https://example.com or sc-domain:example.com)
# - Ensure the service account is added as a user in Search Console for that property.
# - Export GOOGLE_APPLICATION_CREDENTIALS=/absolute/path/to/your-service-account.json

npm install
npm run start
```

## Run Web (localhost:3000)
```bash
cd apps/web
cp .env.example .env.local
npm install
npm run dev
```

Open http://localhost:3000 and test:
- `/moskva/kvartiry` and `/spb/kvartiry` (will fetch AI meta and demo listings)
- `/sitemap.xml` (will reflect prioritized entries if GSC is configured)
- `/robots.txt`

## Notes
- If OpenAI is not configured, the API falls back to a safe heuristic generator.
- If GSC is not configured, sitemap entries are served without prioritization (static defaults).
- For production, replace the in-memory cache with Redis and move prioritization into a scheduled job.