export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/"],
      },
    ],
    sitemap: "https://ais-pre-r43enrlewo7ya3dvhigaij-775739009472.europe-west2.run.app/sitemap.xml",
  };
}
