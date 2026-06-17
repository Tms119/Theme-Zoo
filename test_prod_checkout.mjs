// Simulate the EXACT checkout flow that happens on themeszoo.com
// This calls the production API endpoint directly

const PROD_URL = 'https://themeszoo.com';

async function testProdCheckout() {
  console.log('=== PRODUCTION CHECKOUT SIMULATION ===');
  console.log(`Target: ${PROD_URL}/api/checkout-cart`);
  
  // First, get a product ID from Convex
  const convexUrl = 'https://frugal-cobra-312.convex.cloud';
  
  // Query products directly from Convex
  const productsRes = await fetch(`${convexUrl}/api/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      path: 'products:listAll',
      args: {},
      format: 'json',
    }),
  });
  
  const productsData = await productsRes.json();
  console.log(`Found ${productsData.value?.length || 0} products`);
  
  if (!productsData.value || productsData.value.length === 0) {
    console.error('No products found!');
    return;
  }
  
  const testProduct = productsData.value[0];
  console.log(`Using product: ${testProduct.name} (${testProduct._id})`);
  
  // Now call the checkout-cart API on PRODUCTION
  console.log('\n--- Calling checkout-cart API on production ---');
  
  try {
    const checkoutRes = await fetch(`${PROD_URL}/api/checkout-cart`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: [{ _id: testProduct._id }],
        buyerEmail: 'mohammadsayemweb@gmail.com',
        buyerName: 'Production Test',
        buyerId: '',
        coin: 'btc',
        promoCode: 'TEST100',
      }),
    });
    
    console.log(`Response status: ${checkoutRes.status}`);
    const responseText = await checkoutRes.text();
    console.log(`Response body: ${responseText}`);
    
    try {
      const data = JSON.parse(responseText);
      if (data.error) {
        console.error('CHECKOUT ERROR:', data.error);
      } else {
        console.log('\n=== CHECKOUT RESULT ===');
        console.log(`  isFree: ${data.isFree}`);
        console.log(`  cartId: ${data.cartId}`);
        console.log(`  paymentId: ${data.paymentId}`);
      }
    } catch(e) {
      console.error('Response is not JSON:', responseText.substring(0, 500));
    }
  } catch (fetchErr) {
    console.error('FETCH ERROR:', fetchErr.message);
  }
}

testProdCheckout().catch(console.error);
