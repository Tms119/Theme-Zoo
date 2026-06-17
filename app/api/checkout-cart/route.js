import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendInvoiceEmail } from '@/lib/email';

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

    let cartTotalBase = 0;
    const validProducts = [];

    // 1. Fetch products securely and compute base cart total
    for (const item of items) {
      const product = await convex.query(api.products.getById, { id: item._id });
      if (product) {
        cartTotalBase += product.price_usd;
        validProducts.push(product);
      }
    }

    // 2. Promo Code Validation & Calculation
    let pc = null;
    let totalUsdPrice = cartTotalBase;

    // 2a. First, fetch any active volume campaign
    const activeCampaign = await convex.query(api.marketing.getActiveVolumeCampaign);

    if (promoCode) {
      pc = await convex.query(api.promo_codes.getByCode, { code: promoCode });
      if (pc && pc.isActive) {
        if (pc.discountType === 'percentage') {
          totalUsdPrice = cartTotalBase * (1 - pc.discountValue / 100);
        } else if (pc.discountType === 'fixed') {
          totalUsdPrice = Math.max(0, cartTotalBase - pc.discountValue);
        }
        await convex.mutation(api.promo_codes.incrementUse, { codeId: pc._id });
      } else {
        pc = null; // invalid code
      }
    } else if (activeCampaign && items.length >= activeCampaign.minItems) {
      // 2b. If no promo code is used, apply volume campaign if threshold met
      if (activeCampaign.discountType === 'percentage') {
        totalUsdPrice = cartTotalBase * (1 - activeCampaign.discountValue / 100);
      } else if (activeCampaign.discountType === 'fixed') {
        totalUsdPrice = Math.max(0, cartTotalBase - activeCampaign.discountValue);
      }
    }

    const cartId = `cart_${Math.random().toString(36).substr(2, 9)}_${Date.now()}`;

    // 3. Create Orders (Distribute discount proportionally so each item shows correct price)
    for (const product of validProducts) {
      let finalItemPrice = product.price_usd;
      
      if (pc && cartTotalBase > 0) {
        // Distribute manual promo discount
        const itemWeight = product.price_usd / cartTotalBase;
        const discountAmount = cartTotalBase - totalUsdPrice;
        finalItemPrice = Math.max(0, product.price_usd - (discountAmount * itemWeight));
      } else if (!pc && activeCampaign && items.length >= activeCampaign.minItems && cartTotalBase > 0) {
        // Distribute volume campaign discount
        const itemWeight = product.price_usd / cartTotalBase;
        const discountAmount = cartTotalBase - totalUsdPrice;
        finalItemPrice = Math.max(0, product.price_usd - (discountAmount * itemWeight));
      }

      const isDiscounted = pc || (!pc && activeCampaign && items.length >= activeCampaign.minItems);

      await convex.mutation(api.orders.create, {
        product_id: product._id,
        product_name: product.name,
        price_usd: finalItemPrice,
        original_price: isDiscounted ? product.price_usd : undefined,
        promo_code: pc ? pc.code : undefined,
        buyer_email: buyerEmail,
        buyer_name: buyerName || '',
        buyer_id: buyerId || '',
        status: 'pending',
        tx_hash: cartId,
      });
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
      
      console.log(`DEBUG CHECKOUT: Found ${orders.length} orders for tx_hash promo_${cartId}`);
      
      const emailResponse = await sendInvoiceEmail(orders, baseUrl);
      
      return NextResponse.json({
        cartId,
        paymentId: `promo_${cartId}`,
        payAddress: '',
        payAmount: 0,
        payCurrency: coin,
        usdPrice: 0,
        isFree: true,
        debug_orders: orders.length,
        resend_response: emailResponse
      }, { status: 200 });
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
