import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const checkLimit = mutation({
  args: { 
    ip: v.string(), 
    endpoint: v.string(), 
    limit: v.number(), 
    windowMs: v.number() 
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    
    const existing = await ctx.db
      .query("rate_limits")
      .withIndex("by_ip_endpoint", (q) => 
        q.eq("ip", args.ip).eq("endpoint", args.endpoint)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("rate_limits", {
        ip: args.ip,
        endpoint: args.endpoint,
        count: 1,
        resetAt: now + args.windowMs,
      });
      return { success: true };
    }

    if (now > existing.resetAt) {
      await ctx.db.patch(existing._id, {
        count: 1,
        resetAt: now + args.windowMs,
      });
      return { success: true };
    }

    if (existing.count >= args.limit) {
      return { success: false, retryAfter: existing.resetAt - now };
    }

    await ctx.db.patch(existing._id, { count: existing.count + 1 });
    return { success: true };
  }
});
