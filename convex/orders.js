import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── List all orders (admin) ──────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("orders").order("desc").collect();
  },
});

// ── List by status ───────────────────────────────────────────────
export const listByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, { status }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_status", (q) => q.eq("status", status))
      .order("desc")
      .collect();
  },
});

// ── Get order by id ──────────────────────────────────────────────
export const getById = query({
  args: { id: v.id("orders") },
  handler: async (ctx, { id }) => {
    return await ctx.db.get(id);
  },
});

// ── List by user id ───────────────────────────────────────────────
export const listByUser = query({
  args: { buyer_id: v.string() },
  handler: async (ctx, { buyer_id }) => {
    return await ctx.db
      .query("orders")
      .withIndex("by_buyer_id", (q) => q.eq("buyer_id", buyer_id))
      .order("desc")
      .collect();
  },
});

// ── Create order ─────────────────────────────────────────────────
export const create = mutation({
  args: {
    product_id:   v.id("products"),
    product_name: v.string(),
    price_usd:    v.number(),
    buyer_email:  v.string(),
    buyer_name:   v.string(),
    buyer_id:     v.optional(v.string()),
    tx_hash:      v.optional(v.string()),
    status:       v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("orders", args);
  },
});

// ── Update order status ──────────────────────────────────────────
export const updateStatus = mutation({
  args: {
    id:           v.id("orders"),
    status:       v.string(),
    tx_hash:      v.optional(v.string()),
    delivered_at: v.optional(v.number()),
    notes:        v.optional(v.string()),
  },
  handler: async (ctx, { id, ...fields }) => {
    await ctx.db.patch(id, fields);
  },
});

// ── Get Download URL for Purchased Product ───────────────────────
export const getDownloadUrl = query({
  args: { order_id: v.id("orders"), buyer_id: v.string() },
  handler: async (ctx, { order_id, buyer_id }) => {
    const order = await ctx.db.get(order_id);
    if (!order) throw new Error("Order not found");
    
    // Verify ownership
    if (order.buyer_id !== buyer_id) {
      throw new Error("Unauthorized to access this download");
    }

    const product = await ctx.db.get(order.product_id);
    if (!product) throw new Error("Product no longer exists");

    if (product.file_url) {
      // Return external link if it exists
      return product.file_url;
    }

    if (product.file_id) {
      // Generate secure short-lived URL for Convex storage file
      return await ctx.storage.getUrl(product.file_id);
    }

    throw new Error("No file associated with this product");
  },
});
