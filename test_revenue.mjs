import { ConvexHttpClient } from "convex/browser";
const client = new ConvexHttpClient("https://small-louse-93.convex.cloud");

async function main() {
  const orders = await client.query("orders:listAll");
  const successfulOrders = orders.filter(o => ['paid', 'delivered', 'completed'].includes(o.status));
  const templateRevenue = successfulOrders.reduce((acc, order) => {
    return acc + (order.price_usd || 0);
  }, 0);
  
  console.log("Template Revenue:", templateRevenue);
  
  const customOrders = await client.query("services:listOrders");
  const successfulCustom = customOrders.filter(o => ['paid', 'delivered', 'completed', 'in_progress'].includes(o.status));
  const customRevenue = successfulCustom.reduce((acc, order) => acc + (order.price_usd || 0), 0);
  
  console.log("Custom Revenue:", customRevenue);
  console.log("Total:", templateRevenue + customRevenue);
  
  // Look for any promo orders
  const promoOrders = successfulOrders.filter(o => o.promo_code);
  console.log("Promo orders count:", promoOrders.length);
  promoOrders.forEach(o => {
    console.log(`Promo Order ID: ${o._id}, price_usd: ${o.price_usd}, original_price: ${o.original_price}`);
  });
}
main();
