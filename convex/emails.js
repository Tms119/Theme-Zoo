import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const getAbandonedCarts = internalQuery({
  handler: async (ctx) => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    
    // Find all pending orders
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Filter ones older than 2 hours that haven't received an email
    const abandoned = pendingOrders.filter(
      (o) => o._creationTime < twoHoursAgo && !o.recovery_sent
    );

    // Group by tx_hash (cartId) to avoid sending multiple emails for one cart
    const uniqueCarts = {};
    for (const order of abandoned) {
      if (!uniqueCarts[order.tx_hash]) {
        uniqueCarts[order.tx_hash] = order;
      }
    }

    return Object.values(uniqueCarts);
  }
});

export const markRecoverySent = internalMutation({
  args: { tx_hash: v.string() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("tx_hash"), args.tx_hash))
      .collect();

    for (const order of orders) {
      await ctx.db.patch(order._id, { recovery_sent: true });
    }
  }
});

export const processAbandonedCarts = internalAction({
  handler: async (ctx) => {
    // Check if the feature is enabled
    const enabledSetting = await ctx.runQuery(api.marketing.getGlobalSetting, { key: 'abandoned_cart_enabled' });
    if (!enabledSetting || enabledSetting.value !== true) {
      return; // Feature is disabled
    }

    // Get the coupon code
    const couponSetting = await ctx.runQuery(api.marketing.getGlobalSetting, { key: 'abandoned_cart_coupon' });
    const couponCode = couponSetting?.value || 'BONUS10';

    const carts = await ctx.runQuery(internal.emails.getAbandonedCarts);

    if (carts.length === 0) return;

    for (const cart of carts) {
      const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #07070f; color: #e8e9f0; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <h1 style="color: #8b5cf6;">You left something behind!</h1>
          <p>Hi ${cart.buyer_name || 'there'},</p>
          <p>We noticed you left <strong>${cart.product_name}</strong> in your cart. We know life gets busy, so we saved it for you!</p>
          <p>To sweeten the deal, here is a special discount code you can use at checkout:</p>
          <div style="background: rgba(139,92,246,0.1); border: 1px dashed #8b5cf6; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
            <h2 style="margin: 0; font-size: 28px; color: #fcfcfd; letter-spacing: 2px;">${couponCode}</h2>
          </div>
          <p>This code is valid for any purchase on our store.</p>
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://themezoo.dev/checkout" style="display: inline-block; padding: 14px 32px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 16px;">Complete Your Purchase</a>
          </div>
        </div>
      `;

      try {
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            from: 'ThemesZoo <hello@themeszoo.com>',
            to: cart.buyer_email,
            subject: "You left something behind! (10% OFF inside)",
            html: htmlContent
          })
        });

        if (res.ok) {
          await ctx.runMutation(internal.emails.markRecoverySent, { tx_hash: cart.tx_hash });
          console.log(`Abandoned cart email sent to ${cart.buyer_email}`);
        }
      } catch (e) {
        console.error("Failed to send abandoned cart email:", e);
      }
    }
  }
});
