import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ─── Config Queries / Mutations ──────────────────────────────────────────────

export const getConfig = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("services_config").first();
  },
});

export const updateConfig = mutation({
  args: {
    id: v.optional(v.id("services_config")),
    design_title: v.string(),
    design_desc: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
    } else {
      await ctx.db.insert("services_config", data);
    }
  },
});

// ─── Dynamic Service Tiers ────────────────────────────────────────────────
export const listTiers = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("service_tiers").order("asc").collect();
  },
});

export const addTier = mutation({
  args: {
    name: v.string(),
    price: v.number(),
    description: v.string(),
    icon: v.string(),
    is_active: v.boolean(),
    sort_order: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    return await ctx.db.insert("service_tiers", args);
  },
});

export const updateTier = mutation({
  args: {
    id: v.id("service_tiers"),
    name: v.optional(v.string()),
    price: v.optional(v.number()),
    description: v.optional(v.string()),
    icon: v.optional(v.string()),
    is_active: v.optional(v.boolean()),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    const { id, ...data } = args;
    await ctx.db.patch(id, data);
  },
});

export const deleteTier = mutation({
  args: { id: v.id("service_tiers") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.delete(args.id);
  },
});

// ─── Custom Orders (Forms) ────────────────────────────────────────────────

export const createOrder = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    service_type: v.string(),
    budget: v.string(),
    message: v.string(),
    tx_hash: v.optional(v.string()),
    price_usd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("custom_orders", {
      ...args,
      status: args.tx_hash ? "pending" : "open",
    });
  },
});

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    return await ctx.db.query("custom_orders").order("desc").collect();
  },
});

export const listOrdersByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("custom_orders")
      .filter((q) => q.eq(q.field("email"), args.email))
      .order("desc")
      .collect();
  },
});

export const getOrderStatusByTx = query({
  args: { tx_hash: v.string() },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("custom_orders")
      .filter((q) => q.eq(q.field("tx_hash"), args.tx_hash))
      .first();
    return order ? { status: order.status } : null;
  },
});

export const getOrderByTx = query({
  args: { tx_hash: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("custom_orders")
      .filter((q) => q.eq(q.field("tx_hash"), args.tx_hash))
      .first();
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("custom_orders"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    await ctx.db.patch(args.id, { status: args.status });
  },
});

export const updateOrderPaymentStatus = mutation({
  args: {
    tx_hash: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("custom_orders")
      .filter((q) => q.eq(q.field("tx_hash"), args.tx_hash))
      .first();
    
    if (order) {
      await ctx.db.patch(order._id, { status: args.status });
    }
  },
});
