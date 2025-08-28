# AI Real Estate Landing — MVP

Ready-to-run AI-powered real estate landing with Next.js 14 web app + Express API, featuring OpenAI-based meta generation with caching, and sitemap prioritization via Google Search Console signals.

## Features

**SEO-First Architecture:**
- SSR micro-landings with dynamic routes: `/{city}/{type}`
- AI-generated metadata (title/description/OG tags) with smart caching
- JSON-LD structured data injection for better search understanding  
- Dynamic sitemap.xml prioritized by Search Console metrics
- SEO-optimized robots.txt

**API Endpoints:**
- `GET /api/seo/meta` - OpenAI-powered SEO meta generation with TTL cache
- `GET /api/seo/sitemap-entries` - GSC-prioritized sitemap entries  
- `POST /api/seo/rebuild-sitemap` - Manual sitemap refresh trigger
- `GET /api/listings` - Demo property listings dataset

**Tech Stack:**
- **Web**: Next.js 14 with App Router, React 18, SSG/SSR
- **API**: Express with ESM modules, OpenAI integration, Google APIs
- **Architecture**: Monorepo structure with graceful fallbacks

## Prerequisites

- Node.js 18+ (recommended 20+)
- npm (or pnpm/yarn)
- (Optional) OpenAI API key for AI-generated meta
- (Optional) Google Cloud service account for Search Console integration

## Quick Start

### 1. Setup API Server (localhost:4000)

```bash
cd apps/api
cp .env.example .env
# Edit .env with your configuration (see Configuration section)
npm install
npm start
```

### 2. Setup Web App (localhost:3000)

```bash
cd apps/web  
cp .env.example .env.local
npm install
npm run dev
```

### 3. Test the MVP

Open http://localhost:3000 and explore:
- **Home page**: Overview with popular micro-landing links
- **Dynamic pages**: `/moskva/kvartiry`, `/spb/kvartiry` (AI-generated SEO meta)
- **SEO files**: `/sitemap.xml`, `/robots.txt`

## Configuration

### API Configuration (.env)

```env
# OpenAI Integration (optional - falls back to heuristic generation)
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-4o-mini

# Cache Settings (seconds)
META_CACHE_TTL_SECONDS=43200      # 12 hours for meta cache
GSC_CACHE_TTL_SECONDS=1800        # 30 minutes for GSC data

# Google Search Console (optional - falls back to static priorities)
GSC_SITE_URL=https://your-domain.com
GSC_LOOKBACK_DAYS=28

# Server Settings
WEB_BASE_URL=http://localhost:3000
PORT=4000
```

### Google Search Console Setup (Optional)

For sitemap prioritization based on actual search performance:

1. Create a Google Cloud service account
2. Enable Search Console API in Google Cloud Console  
3. Add the service account as a user in Search Console for your property
4. Download the service account JSON key file
5. Set environment variable: `GOOGLE_APPLICATION_CREDENTIALS=/path/to/key.json`
6. Configure `GSC_SITE_URL` in your .env file

### Web Configuration (.env.local)

```env
SEO_API_BASE=http://localhost:4000
DATA_API_BASE=http://localhost:4000
```

## API Reference

### Generate SEO Metadata
```
GET /api/seo/meta?city={city}&type={type}
```
Returns AI-generated or heuristic SEO metadata with caching.

### Get Sitemap Entries  
```
GET /api/seo/sitemap-entries
```
Returns sitemap entries prioritized by Search Console metrics (if configured).

### Refresh Sitemap Registry
```
POST /api/seo/rebuild-sitemap  
```
Placeholder for manual sitemap refresh workflows.

### Get Property Listings
```
GET /api/listings?city={city}&type={type}
```
Returns demo property listings for the specified location and type.

## Development

### Building for Production

```bash
# Build web app
cd apps/web && npm run build && npm start

# API runs the same in dev/prod
cd apps/api && npm start
```

### Adding New Cities/Types

The system automatically handles new city/type combinations:
- Add new routes by visiting `/{city}/{type}` 
- Entries are automatically registered in sitemap
- Meta generation works for any city/type combination

## Architecture Notes

- **Graceful Fallbacks**: System works without OpenAI or GSC configuration
- **Caching Strategy**: In-memory TTL cache (replace with Redis for production)
- **SEO Optimization**: Static generation for popular routes, SSR for dynamic content
- **Extensible**: TypeScript-ready structure, easy to add new features

## Production Considerations

- Replace in-memory cache with Redis or similar
- Move GSC prioritization to scheduled background jobs
- Configure proper CORS policies for your domain
- Set up monitoring for OpenAI API usage and costs
- Consider implementing rate limiting for API endpoints

## Troubleshooting

- **Build errors**: Ensure all dependencies are installed with `npm install`
- **API connection issues**: Verify both servers are running on correct ports
- **Missing meta data**: Check OpenAI API key configuration and quotas  
- **GSC integration**: Verify service account permissions and site URL format