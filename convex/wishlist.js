import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Toggle wishlist status
export const toggle = mutation({
  args: {
    user_email: v.string(),
    product_id: v.id("products"),
  },
  handler: async (ctx, args) => {
    // Check if it exists
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("user_email", args.user_email))
      .filter((q) => q.eq(q.field("product_id"), args.product_id))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
      return false; // Removed
    } else {
      await ctx.db.insert("wishlists", {
        user_email: args.user_email,
        product_id: args.product_id,
      });
      return true; // Added
    }
  },
});

// List all wishlisted products for a user
export const listByUser = query({
  args: { user_email: v.string() },
  handler: async (ctx, args) => {
    const wishlists = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("user_email", args.user_email))
      .collect();

    const products = [];
    for (const w of wishlists) {
      const product = await ctx.db.get(w.product_id);
      if (product) products.push(product);
    }
    return products;
  },
});

// Check if a specific product is wishlisted
export const check = query({
  args: { user_email: v.string(), product_id: v.id("products") },
  handler: async (ctx, args) => {
    if (!args.user_email) return false;
    const existing = await ctx.db
      .query("wishlists")
      .withIndex("by_user", (q) => q.eq("user_email", args.user_email))
      .filter((q) => q.eq(q.field("product_id"), args.product_id))
      .first();
    
    return !!existing;
  },
});
