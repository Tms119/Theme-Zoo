import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendInvoiceEmail } from '../webhooks/nowpayments/route';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function POST(req) {
  try {
    const { items, buyerEmail, buyerName, buyerId, coin, promoCode } = await req.json();

    if (!items || !items.length || !buyerEmail || !coin) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Determine the base URL dynamically for the webhook
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    let totalUsdPrice = 0;
    const cartId = `cart_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // 1. Fetch products securely and create pending orders grouped by cartId
    for (const item of items) {
      const product = await convex.query(api.products.getById, { id: item._id });
      if (!product) continue;

      totalUsdPrice += product.price_usd;

      await convex.mutation(api.orders.create, {
        product_id: product._id,
        product_name: product.name,
        price_usd: product.price_usd,
        buyer_email: buyerEmail,
        buyer_name: buyerName || '',
        buyer_id: buyerId || '',
        status: 'pending',
        tx_hash: cartId, // Temporarily store the cart ID to group them
      });
    }

    // 2. Promo Code Calculation
    if (promoCode) {
      const pc = await convex.query(api.promo_codes.getByCode, { code: promoCode });
      if (pc && pc.isActive) {
        if (pc.discountType === 'percentage') {
          totalUsdPrice = totalUsdPrice * (1 - pc.discountValue / 100);
        } else if (pc.discountType === 'fixed') {
          totalUsdPrice = Math.max(0, totalUsdPrice - pc.discountValue);
        }
        await convex.mutation(api.promo_codes.incrementUse, { codeId: pc._id });
      }
    }

    // 3. 100% Free Bypass Logic
    if (totalUsdPrice <= 0) {
      // Mark orders as paid immediately
      await convex.mutation(api.orders.updateByTxHash, {
        tx_hash: cartId,
        status: 'paid',
        new_tx_hash: `promo_${cartId}`,
        delivered_at: Date.now(),
      });
      
      const orders = await convex.query(api.orders.listByTxHash, { tx_hash: `promo_${cartId}` });
      await sendInvoiceEmail(orders, baseUrl);
      
      return NextResponse.json({
        cartId,
        isFree: true,
        paymentId: `promo_${cartId}`,
        payAddress: '',
        payAmount: 0,
        payCurrency: coin,
        usdPrice: 0,
      });
    }

    // 4. Call NOWPayments API to generate crypto invoice for the total cart amount
    const payCurrency = coin.toLowerCase();
    
    const nowPaymentsRes = await fetch('https://api.nowpayments.io/v1/payment', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: totalUsdPrice,
        price_currency: 'usd',
        pay_currency: payCurrency,
        order_id: cartId, // Send cartId so webhook can update all items in the cart
        order_description: `Purchase of ${items.length} items from Marketplace`,
        ipn_callback_url: `${baseUrl}/api/webhooks/nowpayments`,
      }),
    });

    const paymentData = await nowPaymentsRes.json();

    if (!nowPaymentsRes.ok) {
      console.error('NOWPayments API Error:', paymentData);
      return NextResponse.json({ error: 'Failed to generate crypto invoice', details: paymentData }, { status: 500 });
    }

    // 3. Return payment details to frontend
    return NextResponse.json({
      cartId,
      paymentId: paymentData.payment_id,
      payAddress: paymentData.pay_address,
      payAmount: paymentData.pay_amount,
      payCurrency: paymentData.pay_currency,
      usdPrice: totalUsdPrice,
    });
  } catch (error) {
    console.error('Checkout Cart API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
