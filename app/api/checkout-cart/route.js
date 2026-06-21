import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendInvoiceEmail } from '@/lib/email';

const convex = new ConvexHttpClient((process.env.NEXT_PUBLIC_CONVEX_URL || '').replace('.site', '.cloud'));

export async function POST(req) {
  try {
    const { items, buyerEmail, buyerName, buyerId, coin, promoCode } = await req.json();

    if (!items || !items.length || !buyerEmail || !coin) {
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
        // Moved incrementUse to webhook
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

    // 3. Create Orders and collect in-memory copies for email
    const createdOrders = [];
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

      const orderData = {
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
      };

      const orderId = await convex.mutation(api.orders.create, orderData);
      createdOrders.push({ ...orderData, _id: orderId });
    }

    // 4. 100% Free Bypass Logic
    if (totalUsdPrice <= 0) {
      // Mark orders as paid immediately
      await convex.mutation(api.orders.updateByTxHash, {
        tx_hash: cartId,
        status: 'paid',
        new_tx_hash: `promo_${cartId}`,
        delivered_at: Date.now(),
      });
      
      // Build email data from in-memory orders (no database re-query needed)
      const emailOrders = createdOrders.map(o => ({
        ...o,
        status: 'paid',
        tx_hash: `promo_${cartId}`,
      }));
      
      console.log(`CHECKOUT: Sending invoice email for ${emailOrders.length} free items to ${buyerEmail}`);
      
      let emailResponse = null;
      try {
        emailResponse = await sendInvoiceEmail(emailOrders, baseUrl);
        console.log('CHECKOUT: Email sent successfully:', JSON.stringify(emailResponse));
      } catch (emailErr) {
        console.error('CHECKOUT: Email send FAILED:', emailErr);
      }
      
      return NextResponse.json({
        cartId,
        paymentId: `promo_${cartId}`,
        payAddress: '',
        payAmount: 0,
        payCurrency: coin,
        usdPrice: 0,
        isFree: true,
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
      
      let errorMessage = 'Failed to generate crypto invoice';
      if (paymentData && paymentData.code === 'AMOUNT_MINIMAL_ERROR') {
        errorMessage = 'Cart total is below the minimum required by the network. Please add more items or choose a different coin like Litecoin (LTC).';
      }
      
      return NextResponse.json({ error: errorMessage, details: paymentData }, { status: 400 });
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
