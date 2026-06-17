import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    const { name, email, service_type, message, price_usd, coin } = await req.json();

    if (!email || !service_type || !price_usd || !coin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const orderId = `srv_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    const payCurrency = coin.toLowerCase();
    
    // Call NOWPayments
    const nowPaymentsRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: price_usd,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: orderId, // We use this in the webhook to identify it's a service
        order_description: `Payment for ${service_type} Service`,
        ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
      }),
    });

    const paymentData = await nowPaymentsRes.json();

    if (!nowPaymentsRes.ok) {
      console.error('NOWPayments API Error:', paymentData);
      return NextResponse.json({ error: 'Failed to generate crypto invoice', details: paymentData }, { status: 500 });
    }

    // Insert into custom_orders with the tx_hash as orderId
    await convex.mutation(api.services.createOrder, {
      name: name || '',
      email,
      service_type,
      budget: `$${price_usd}`,
      message: message || '',
      tx_hash: orderId,
      price_usd: price_usd,
    });

    return NextResponse.json({
      orderId,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      usdPrice: price_usd,
    });
  } catch (error) {
    console.error('Service Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
