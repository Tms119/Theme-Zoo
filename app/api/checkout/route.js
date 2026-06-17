import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    const { productId, buyerEmail, buyerName, coin } = await req.json();

    if (!productId || !buyerEmail || !coin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine the base URL dynamically for the webhook
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // 1. Fetch product directly from backend (prevents price tampering)
    const product = await convex.query(api.products.getById, { id: productId });
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // 2. Create order in Convex as "pending"
    const orderId = await convex.mutation(api.orders.create, {
      product_id: product._id,
      product_name: product.name,
      price_usd: product.price_usd,
      buyer_email: buyerEmail,
      buyer_name: buyerName || '',
      status: 'pending',
    });

    // 3. Call NOWPayments API to generate crypto invoice
    // Ensure we map the requested coin correctly
    const payCurrency = coin.toLowerCase();
    
    const nowPaymentsRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: product.price_usd,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: orderId, // Send Convex orderId so webhook can identify it
        order_description: `Purchase of ${product.name}`,
        ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`, // Dynamically set based on environment
      }),
    });

    const paymentData = await nowPaymentsRes.json();

    if (!nowPaymentsRes.ok) {
      console.error('NOWPayments API Error:', paymentData);
      return NextResponse.json({ error: 'Failed to generate crypto invoice', details: paymentData }, { status: 500 });
    }

    // 4. Temporarily save payment_id in Convex as tx_hash just for reference
    await convex.mutation(api.orders.updateStatus, {
      id: orderId,
      status: 'pending',
      tx_hash: paymentData.payment_id,
    });

    // 5. Return payment details to frontend
    return NextResponse.json({
      orderId,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      usdPrice: product.price_usd,
    });
  } catch (error) {
    console.error('Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
