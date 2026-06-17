import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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
    tier1_name: v.string(),
    tier1_price: v.number(),
    tier1_desc: v.string(),
    tier2_name: v.string(),
    tier2_price: v.number(),
    tier2_desc: v.string(),
    tier3_name: v.string(),
    tier3_desc: v.string(),
    design_title: v.string(),
    design_desc: v.string(),
  },
  handler: async (ctx, args) => {
    const { id, ...data } = args;
    if (id) {
      await ctx.db.patch(id, data);
    } else {
      await ctx.db.insert("services_config", data);
    }
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
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("custom_orders", {
      ...args,
      status: "open",
    });
  },
});

export const listOrders = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("custom_orders").order("desc").collect();
  },
});

export const updateOrderStatus = mutation({
  args: {
    id: v.id("custom_orders"),
    status: v.string(), // "open", "contacted", "closed"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { status: args.status });
  },
});
