import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendInvoiceEmail } from '@/lib/email';

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

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    const isSuccess = payment_status === 'finished' || payment_status === 'confirmed';
    const isFailed = payment_status === 'failed' || payment_status === 'expired';

    if (order_id.startsWith('cart_')) {
      if (isSuccess) {
        // Fetch orders using the ORIGINAL tx_hash (order_id) BEFORE we mutate them
        const existingOrders = await convex.query(api.orders.listByTxHash, { tx_hash: order_id });

        await convex.mutation(api.orders.updateByTxHash, {
          tx_hash: order_id,
          status: 'paid',
          new_tx_hash: payment_id.toString(),
          delivered_at: Date.now(),
        });
        
        // Build email data from memory to avoid Convex read-after-write latency
        const emailOrders = existingOrders.map(o => ({
          ...o,
          status: 'paid',
          tx_hash: payment_id.toString(),
        }));
        
        if (emailOrders.length > 0) {
          try {
            await sendInvoiceEmail(emailOrders, baseUrl);
            console.log(`Webhook: Sent invoice email for ${emailOrders.length} paid items.`);
          } catch (e) {
            console.error('Webhook: Email failed:', e);
          }
        }
        
      } else if (isFailed) {
        await convex.mutation(api.orders.updateByTxHash, {
          tx_hash: order_id,
          status: payment_status,
        });
      }
    } else if (order_id.startsWith('srv_')) {
      // It's a service order
      if (isSuccess) {
        // We need to update the custom_orders table where tx_hash == order_id
        await convex.mutation(api.services.updateOrderPaymentStatus, {
          tx_hash: order_id,
          status: 'paid',
        });
        
        // Optional: Send a different email here confirming receipt of service payment
        console.log('Service payment verified!');
      }
    } else {
      if (isSuccess) {
        // Fetch order BEFORE mutation
        const order = await convex.query(api.orders.getById, { id: order_id });

        await convex.mutation(api.orders.updateStatus, {
          id: order_id,
          status: 'paid',
          tx_hash: payment_id.toString(),
          delivered_at: Date.now(),
        });
        
        if (order) {
          const emailOrder = {
            ...order,
            status: 'paid',
            tx_hash: payment_id.toString(),
          };
          try {
            await sendInvoiceEmail([emailOrder], baseUrl);
            console.log(`Webhook: Sent invoice email for single paid item.`);
          } catch (e) {
            console.error('Webhook: Email failed:', e);
          }
        }
      } else if (isFailed) {
        await convex.mutation(api.orders.updateStatus, {
          id: order_id,
          status: payment_status,
        });
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('NOWPayments Webhook Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
