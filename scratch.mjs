import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
async function run() {
  const products = await client.query("products:listAll");
  products.forEach(p => {
    console.log(p.name, " -> file_url:", p.file_url, " -> file_id:", p.file_id);
  });
}
run().catch(console.error);
