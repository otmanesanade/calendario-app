export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/"],
      },
    ],
    sitemap: "https://www.glowfy.es/sitemap.xml",
  };
}
