// Robots policy: block internal and param-heavy routes.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: ["/api/", "/_next/", "/search", "/*?*"]
      }
    ],
    sitemap: "http://localhost:3000/sitemap.xml"
  };
}