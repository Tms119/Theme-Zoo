import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const devUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const prodUrl = devUrl ? devUrl.replace("frugal-cobra-312", "cool-hamster-361") : "https://cool-hamster-361.convex.cloud";

const client = new ConvexHttpClient(prodUrl);

async function check() {
  const products = await client.query("products:listAll");
  console.log("All products in PROD:");
  products.forEach(p => console.log(`Name: ${p.name} | Slug: ${p.slug}`));
}

check().catch(console.error);
