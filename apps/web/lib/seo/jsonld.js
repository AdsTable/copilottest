// JSON-LD helper for ItemList pages (listings overview).
export function RealEstateItemListJsonLd(params) {
  const listItems = (params.items || []).map((it, idx) => ({
    "@type": "ListItem",
    position: idx + 1,
    url: it.url || `http://localhost:3000/listing/${it.id}`,
    name: it.title
  }));
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Подборка: ${params.type} в ${params.city}`,
    itemListElement: listItems
  };
}