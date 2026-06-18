import { internalAction, internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

export const getAbandonedCarts = internalQuery({
  handler: async (ctx) => {
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    const twentyFourHoursAgo = Date.now() - 24 * 60 * 60 * 1000;
    
    const pendingOrders = await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();

    // Stage 1: Older than 2h, newer than 24h, hasn't received 2h email
    const stage1 = pendingOrders.filter(
      (o) => o._creationTime < twoHoursAgo && o._creationTime >= twentyFourHoursAgo && !o.recovery_sent
    );

    // Stage 2: Older than 24h, hasn't received 24h email
    const stage2 = pendingOrders.filter(
      (o) => o._creationTime < twentyFourHoursAgo && !o.recovery_sent_24h
    );

    const groupCarts = (orders, stage) => {
      const unique = {};
      for (const o of orders) {
        if (!unique[o.tx_hash]) unique[o.tx_hash] = { ...o, stage };
      }
      return Object.values(unique);
    };

    return [...groupCarts(stage1, 1), ...groupCarts(stage2, 2)];
  }
});

export const markRecoverySent = internalMutation({
  args: { tx_hash: v.string(), stage: v.number() },
  handler: async (ctx, args) => {
    const orders = await ctx.db
      .query("orders")
      .filter((q) => q.eq(q.field("tx_hash"), args.tx_hash))
      .collect();

    for (const order of orders) {
      if (args.stage === 1) {
        await ctx.db.patch(order._id, { recovery_sent: true });
      } else if (args.stage === 2) {
        await ctx.db.patch(order._id, { recovery_sent_24h: true });
      }
    }
  }
});

export const processAbandonedCarts = internalAction({
  handler: async (ctx) => {
    const enabledSetting = await ctx.runQuery(api.marketing.getGlobalSetting, { key: 'abandoned_cart_enabled' });
    if (!enabledSetting || enabledSetting.value !== true) return;

    const couponSetting = await ctx.runQuery(api.marketing.getGlobalSetting, { key: 'abandoned_cart_coupon' });
    const couponCode = couponSetting?.value || 'BONUS10';

    const carts = await ctx.runQuery(internal.emails.getAbandonedCarts);
    if (carts.length === 0) return;

    for (const cart of carts) {
      const isStage2 = cart.stage === 2;
      
      const subject = isStage2 
        ? "Still thinking about it? (10% OFF inside)" 
        : "Oops, did something go wrong?";
        
      const title = isStage2 
        ? "Final Reminder: You left something behind!" 
        : "Did you need some help?";

      const bodyText = isStage2
        ? `<p>We noticed you still haven't completed your purchase of <strong>${cart.product_name}</strong>.</p>
           <p>To sweeten the deal and help you finalize your project, here is a special discount code you can use at checkout:</p>
           <div style="background: rgba(139,92,246,0.1); border: 1px dashed #8b5cf6; padding: 20px; text-align: center; border-radius: 8px; margin: 30px 0;">
             <h2 style="margin: 0; font-size: 28px; color: #fcfcfd; letter-spacing: 2px;">${couponCode}</h2>
           </div>
           <p>This code is valid for any purchase on our store.</p>`
        : `<p>We noticed you started checking out with <strong>${cart.product_name}</strong> but didn't finish.</p>
           <p>Did something go wrong with the crypto payment? If you need any help, just reply to this email and our support team will assist you right away.</p>
           <p>Otherwise, your cart is still safely saved and waiting for you.</p>`;

      const htmlContent = `
        <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background: #07070f; color: #e8e9f0; padding: 40px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06);">
          <h1 style="color: #8b5cf6;">${title}</h1>
          <p>Hi ${cart.buyer_name || 'there'},</p>
          ${bodyText}
          <div style="text-align: center; margin-top: 40px;">
            <a href="https://www.themeszoo.com/checkout" style="display: inline-block; padding: 14px 32px; background: #8b5cf6; color: #fff; text-decoration: none; border-radius: 100px; font-weight: 700; font-size: 16px;">Complete Your Purchase</a>
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
            from: 'ThemesZoo Support <hello@themeszoo.com>',
            to: cart.buyer_email,
            subject: subject,
            html: htmlContent
          })
        });

        if (res.ok) {
          await ctx.runMutation(internal.emails.markRecoverySent, { tx_hash: cart.tx_hash, stage: cart.stage });
          console.log(`Abandoned cart stage ${cart.stage} email sent to ${cart.buyer_email}`);
        }
      } catch (e) {
        console.error("Failed to send abandoned cart email:", e);
      }
    }
  }
});
