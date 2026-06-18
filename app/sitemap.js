import { ConvexHttpClient } from "convex/browser";

export const dynamic = 'force-dynamic';

const convex = new ConvexHttpClient(
  (process.env.NEXT_PUBLIC_CONVEX_URL || "").replace(".site", ".cloud")
);

export default async function sitemap() {
  const baseUrl = "https://www.themeszoo.com";

  // Static pages
  const staticPages = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/templates`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/support`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/privacy`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${baseUrl}/terms`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
  ];

  // Dynamic product pages
  let productPages = [];
  try {
    const products = await convex.query("products:listActive");
    productPages = products.map((product) => ({
      url: `${baseUrl}/templates/${product.slug}`,
      lastModified: new Date(product._creationTime),
      changeFrequency: "monthly",
      priority: 0.8,
    }));
  } catch (e) {
    // If Convex is unavailable, return static pages only
    console.error("Sitemap: Could not fetch products from Convex", e);
  }

  return [...staticPages, ...productPages];
}
