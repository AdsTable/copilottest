// Home page listing sample micro-landings.
// Keep canonical content SSR-friendly; personalization can be added later.
import Link from "next/link";

const POPULAR = [
  { city: "moskva", type: "kvartiry", label: "Квартиры в Москве" },
  { city: "spb", type: "kvartiry", label: "Квартиры в Санкт-Петербурге" },
  { city: "kazan", type: "doma", label: "Дома в Казани" }
];

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>Недвижимость: умный подбор (MVP)</h1>
      <p>Откройте популярные микролендинги:</p>
      <ul>
        {POPULAR.map(p => (
          <li key={`${p.city}-${p.type}`}>
            <Link href={`/${p.city}/${p.type}`}>{p.label}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}