import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendServiceConfirmationEmail } from '@/lib/email';

const convex = new ConvexHttpClient((process.env.NEXT_PUBLIC_CONVEX_URL || '').replace('.site', '.cloud'));

export async function POST(req) {
  try {
    const { name, email, service_type, message, price_usd, coin, promoCode } = await req.json();

    if (!email || !service_type || !price_usd || !coin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Rate Limit Check
    const ip = req.headers.get('x-forwarded-for') || '127.0.0.1';
    const rateLimit = await convex.mutation(api.rateLimit.checkLimit, { 
      ip, 
      endpoint: 'checkout', 
      limit: 10, 
      windowMs: 3600000 
    });
    
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many checkout attempts. Please try again later.' }, { status: 429 });
    }

    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let finalUsdPrice = price_usd;
    let pc = null;

    if (promoCode) {
      pc = await convex.query(api.promo_codes.getByCode, { code: promoCode });
      if (pc && pc.isActive) {
        if (pc.discountType === 'percentage') {
          finalUsdPrice = price_usd * (1 - pc.discountValue / 100);
        } else if (pc.discountType === 'fixed') {
          finalUsdPrice = Math.max(0, price_usd - pc.discountValue);
        }
        // Moved incrementUse to webhook
      }
    }

    const orderId = `srv_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // 100% Free Bypass Logic
    if (finalUsdPrice <= 0) {
      const freeOrderId = `promo_${orderId}`;
      await convex.mutation(api.services.createOrder, {
        name: name || '',
        email,
        service_type,
        budget: `$${price_usd}`,
        message: message || '',
        tx_hash: freeOrderId,
        price_usd: price_usd,
      });

      // Instantly mark as paid since it's free
      await convex.mutation(api.services.updateOrderPaymentStatus, {
        tx_hash: freeOrderId,
        status: 'paid',
      });
      
      // Increment Promo Code Usage
      if (pc) {
        try {
          await convex.mutation(api.promo_codes.incrementUse, { id: pc._id });
        } catch (e) {
          console.error("Failed to increment promo code usage:", e);
        }
      }
      
      const serviceOrder = await convex.query(api.services.getOrderByTx, { tx_hash: freeOrderId });
      if (serviceOrder) {
        await sendServiceConfirmationEmail(serviceOrder, baseUrl);
      }

      return NextResponse.json({
        orderId: freeOrderId,
        paymentId: freeOrderId,
        payAddress: '',
        payAmount: 0,
        payCurrency: coin,
        usdPrice: 0,
        isFree: true,
      }, { status: 200 });
    }

    const payCurrency = coin.toLowerCase();
    
    // Call NOWPayments
    const nowPaymentsRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: finalUsdPrice,
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
      
      let errorMessage = 'Failed to generate crypto invoice';
      if (paymentData && paymentData.code === 'AMOUNT_MINIMAL_ERROR') {
        errorMessage = 'Service price is below the minimum required by the network. Please choose a different coin like Litecoin (LTC).';
      }
      
      return NextResponse.json({ error: errorMessage, details: paymentData }, { status: 400 });
    }

    // Insert into custom_orders with the tx_hash as orderId
    await convex.mutation(api.services.createOrder, {
      name: name || '',
      email,
      service_type,
      budget: `$${price_usd}`,
      message: message || '',
      tx_hash: orderId,
      price_usd: finalUsdPrice,
    });

    return NextResponse.json({
      orderId,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      usdPrice: finalUsdPrice,
    });
  } catch (error) {
    console.error('Service Checkout API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
