// Root layout with SEO-friendly defaults.
// Comments in English to keep code readable across teams.
export const metadata = {
  title: "Real Estate — AI Landing (MVP)",
  description: "SEO-first landing MVP powered by a simple API.",
  metadataBase: new URL("http://localhost:3000")
};

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <head />
      <body>{children}</body>
    </html>
  );
}