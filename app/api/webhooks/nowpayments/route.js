import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;

export async function POST(req) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-nowpayments-sig');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    // Verify HMAC SHA512 signature
    const hmac = crypto.createHmac('sha512', IPN_SECRET);
    hmac.update(rawBody);
    const expectedSignature = hmac.digest('hex');

    if (signature !== expectedSignature) {
      console.error('NOWPayments Webhook Signature Mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    // Parse the verified body
    const body = JSON.parse(rawBody);
    const { order_id, payment_status, payment_id } = body;

    if (!order_id) {
      return NextResponse.json({ error: 'Missing order_id' }, { status: 400 });
    }

    console.log(`NOWPayments Webhook received for order ${order_id}: ${payment_status}`);

    // Update Convex order if payment is confirmed
    // 'finished' means the crypto has been fully received and confirmed on the blockchain
    if (payment_status === 'finished' || payment_status === 'confirmed') {
      await convex.mutation(api.orders.updateStatus, {
        id: order_id,
        status: 'paid',
        tx_hash: payment_id.toString(),
        delivered_at: Date.now(),
      });
    } else if (payment_status === 'failed' || payment_status === 'expired') {
      await convex.mutation(api.orders.updateStatus, {
        id: order_id,
        status: payment_status, // 'failed' or 'expired'
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('NOWPayments Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
