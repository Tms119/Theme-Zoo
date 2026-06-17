import { NextResponse } from 'next/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';
import { sendInvoiceEmail } from '@/lib/email';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);

export async function GET(req) {
  const log = [];
  
  try {
    // Step 1: Simulate creating an order with a known tx_hash
    const testCartId = `diag_${Date.now()}`;
    log.push(`[1] Creating order with tx_hash: ${testCartId}`);
    
    // Find any product to use
    const products = await convex.query(api.products.listAll);
    if (!products || products.length === 0) {
      return NextResponse.json({ error: 'No products found', log });
    }
    
    const testProduct = products[0];
    log.push(`[2] Using product: ${testProduct.name} (${testProduct._id})`);
    
    // Create a pending order (exactly like checkout does)
    await convex.mutation(api.orders.create, {
      product_id: testProduct._id,
      product_name: testProduct.name,
      price_usd: 0,
      original_price: testProduct.price_usd,
      promo_code: 'TEST100',
      buyer_email: 'mohammadsayemweb@gmail.com',
      buyer_name: 'Diagnostic Test',
      buyer_id: '',
      status: 'pending',
      tx_hash: testCartId,
    });
    log.push(`[3] Order created with status=pending`);
    
    // Verify we can find it
    const pendingOrders = await convex.query(api.orders.listByTxHash, { tx_hash: testCartId });
    log.push(`[4] Found ${pendingOrders.length} pending orders with tx_hash ${testCartId}`);
    
    // Now update to paid (exactly like checkout does)
    const promoTxHash = `promo_${testCartId}`;
    await convex.mutation(api.orders.updateByTxHash, {
      tx_hash: testCartId,
      status: 'paid',
      new_tx_hash: promoTxHash,
      delivered_at: Date.now(),
    });
    log.push(`[5] Updated orders: status=paid, new_tx_hash=${promoTxHash}`);
    
    // Now query with the NEW tx_hash
    const paidOrders = await convex.query(api.orders.listByTxHash, { tx_hash: promoTxHash });
    log.push(`[6] Found ${paidOrders.length} paid orders with tx_hash ${promoTxHash}`);
    
    if (paidOrders.length === 0) {
      log.push(`[6a] *** BUG FOUND: updateByTxHash succeeded but listByTxHash returns 0 results!`);
      
      // Check if they still have the OLD tx_hash
      const stillOld = await convex.query(api.orders.listByTxHash, { tx_hash: testCartId });
      log.push(`[6b] Orders still with OLD tx_hash: ${stillOld.length}`);
      
      if (stillOld.length > 0) {
        log.push(`[6c] Order status: ${stillOld[0].status}, tx_hash: ${stillOld[0].tx_hash}`);
        log.push(`[6d] ROOT CAUSE: Convex eventual consistency - the mutation hasn't propagated to the query yet`);
      }
      
      return NextResponse.json({ bug: 'RACE_CONDITION', log });
    }
    
    log.push(`[7] Order data: ${JSON.stringify(paidOrders[0], null, 2)}`);
    
    // Step 3: Send email
    const host = req.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;
    
    log.push(`[8] Sending email to ${paidOrders[0].buyer_email}...`);
    const emailResult = await sendInvoiceEmail(paidOrders, baseUrl);
    log.push(`[9] Email result: ${JSON.stringify(emailResult)}`);
    
    return NextResponse.json({ success: true, log, emailResult });
  } catch (error) {
    log.push(`[ERROR] ${error.message}`);
    log.push(`[STACK] ${error.stack}`);
    return NextResponse.json({ error: error.message, log }, { status: 500 });
  }
}
