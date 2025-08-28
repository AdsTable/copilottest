// SEO-first micro-landing with SSR and JSON-LD.
// In production, prefer ISR (revalidate) for bots and cache friendliness.
import { notFound } from "next/navigation";
import { RealEstateItemListJsonLd } from "../../../lib/seo/jsonld";
export async function generateStaticParams() {
  // Pre-render the most important combinations for immediate UX.
  return [
    { city: "moskva", type: "kvartiry" },
    { city: "spb", type: "kvartiry" }
  ];
}

export async function generateMetadata({ params }) {
  const base = process.env.SEO_API_BASE || "http://localhost:4000";
  const url = `${base}/api/seo/meta?city=${encodeURIComponent(params.city)}&type=${encodeURIComponent(params.type)}`;
  let meta = null;
  try {
    const res = await fetch(url, { next: { revalidate: 3600 } });
    if (res.ok) meta = await res.json();
  } catch {
    // Safe fallback when API is offline; page will still render.
  }

  const canonical = `http://localhost:3000/${params.city}/${params.type}`;
  return {
    title: meta?.title ?? `Купить ${params.type} в ${params.city} — цены и фото`,
    description: meta?.description ?? `Актуальные предложения ${params.type} в ${params.city}.`,
    alternates: { canonical },
    keywords: meta?.keywords,
    openGraph: {
      title: meta?.ogTitle ?? meta?.title,
      description: meta?.ogDescription ?? meta?.description,
      url: canonical,
      type: "website"
    }
  };
}

async function fetchListings(city, type) {
  const base = process.env.DATA_API_BASE || "http://localhost:4000";
  try {
    const res = await fetch(
      `${base}/api/listings?city=${encodeURIComponent(city)}&type=${encodeURIComponent(type)}`,
      { cache: "no-store" }
    );
    if (!res.ok) throw new Error(`Bad status ${res.status}`);
    return await res.json();
  } catch {
    // Local dev fallback when API is offline
    return {
      h1: `Лучшие ${type} в ${city}`,
      intro: `API is offline — showing placeholder data for ${type} in ${city}.`,
      items: []
    };
  }
}

export default async function Page({ params }) {
  const data = await fetchListings(params.city, params.type);

  const jsonLd = RealEstateItemListJsonLd({
    city: params.city,
    type: params.type,
    items: (data.items || []).slice(0, 12)
  });

  return (
    <main style={{ padding: 24 }}>
      {/* Inject JSON-LD for better search engine understanding */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <h1>{data.h1 ?? `Лучшие ${params.type} в ${params.city}`}</h1>
      <p>{data.intro ?? `Подборка актуальных предложений ${params.type} в ${params.city}.`}</p>

      {data.items?.length === 0 ? (
        <div style={{ padding: 12, border: "1px dashed #bbb", borderRadius: 8, background: "#fafafa" }}>
          API is offline. No items to display.
        </div>
      ) : (
        <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 16 }}>
          {data.items.map(it => (
            <article key={it.id} style={{ border: "1px solid #eee", borderRadius: 8, padding: 16 }}>
              <h2 style={{ margin: "0 0 8px" }}>{it.title}</h2>
              <p style={{ margin: 0 }}>{it.short}</p>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}