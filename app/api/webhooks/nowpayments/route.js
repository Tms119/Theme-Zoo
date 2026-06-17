import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { Resend } from 'resend';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
const IPN_SECRET = process.env.NOWPAYMENTS_IPN_SECRET;
const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(ordersArray, baseUrl) {
  if (!ordersArray || ordersArray.length === 0) return;
  const buyerEmail = ordersArray[0].buyer_email;
  const buyerName = ordersArray[0].buyer_name || 'Customer';
  const totalAmount = ordersArray.reduce((sum, o) => sum + (o.price_usd || 0), 0).toFixed(2);
  
  const itemsHtml = ordersArray.map(o => `
    <div style="padding: 20px; margin-bottom: 16px; background-color: #121214; border: 1px solid #27272a; border-radius: 12px;">
      <h3 style="margin: 0 0 6px 0; color: #f4f4f5; font-size: 18px; font-weight: 600;">${o.product_name}</h3>
      <p style="margin: 0 0 16px 0; color: #a1a1aa; font-size: 14px;">Price: $${o.price_usd.toFixed(2)} USD</p>
      <a href="${baseUrl}/download/${o._id}" style="display: inline-block; padding: 12px 24px; background-color: #7c3aed; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">Download Asset</a>
    </div>
  `).join('');

  const htmlContent = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #09090b; padding: 40px 24px; color: #ededed; border: 1px solid #18181b; border-radius: 16px;">
      <div style="text-align: center; margin-bottom: 32px;">
        <div style="display: inline-flex; justify-content: center; align-items: center; width: 48px; height: 48px; border-radius: 50%; background-color: rgba(16, 189, 129, 0.1); margin-bottom: 16px;">
          <span style="font-size: 24px;">✓</span>
        </div>
        <h1 style="color: #ffffff; font-size: 24px; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px;">Payment Confirmed</h1>
        <p style="color: #10b981; font-weight: 600; font-size: 14px; margin: 0;">Crypto Transaction Verified</p>
      </div>
      
      <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8; margin-bottom: 24px;">Hi ${buyerName},</p>
      <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">Thank you for your purchase. Your crypto payment equivalent to <strong>$${totalAmount} USD</strong> has been successfully verified on the blockchain. Your source files are now unlocked and ready for download.</p>
      
      <div style="margin: 40px 0;">
        <h2 style="font-size: 12px; text-transform: uppercase; letter-spacing: 1.5px; color: #71717a; border-bottom: 1px solid #27272a; padding-bottom: 12px; margin-bottom: 20px;">Your Authorized Downloads</h2>
        ${itemsHtml}
      </div>
      
      <p style="font-size: 13px; line-height: 1.5; color: #71717a; text-align: center; margin-top: 40px; padding-top: 24px; border-top: 1px solid #27272a;">
        These links are tied to your email (${buyerEmail}) and will remain active for 48 hours. Please securely backup your files.<br><br>
        If you need any assistance, simply reply to this email.
      </p>
    </div>
  `;

  await resend.emails.send({
    from: process.env.FROM_EMAIL || 'VaultMarket <onboarding@resend.dev>',
    to: buyerEmail,
    subject: `Your Receipt & Download Links - $${totalAmount}`,
    html: htmlContent,
  });
}

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
        await convex.mutation(api.orders.updateByTxHash, {
          tx_hash: order_id,
          status: 'paid',
          new_tx_hash: payment_id.toString(),
          delivered_at: Date.now(),
        });
        
        // Fetch all orders for this cart to send email
        const orders = await convex.query(api.orders.listByTxHash, { tx_hash: payment_id.toString() });
        // Since listByTxHash searches by the updated tx_hash (the payment_id), we pass payment_id
        await sendInvoiceEmail(orders, baseUrl);
        
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
        await convex.mutation(api.orders.updateStatus, {
          id: order_id,
          status: 'paid',
          tx_hash: payment_id.toString(),
          delivered_at: Date.now(),
        });
        
        // Fetch single order
        const order = await convex.query(api.orders.getById, { id: order_id });
        if (order) {
          await sendInvoiceEmail([order], baseUrl);
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
