import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ── Global Settings (Banner) ──────────────────────────────────────

export const getGlobalSetting = query({
  args: { key: v.string() },
  handler: async (ctx, { key }) => {
    return await ctx.db
      .query("globalSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();
  },
});

export const setGlobalSetting = mutation({
  args: { key: v.string(), value: v.any() },
  handler: async (ctx, { key, value }) => {
    await requireAdmin(ctx);
    const existing = await ctx.db
      .query("globalSettings")
      .withIndex("by_key", (q) => q.eq("key", key))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { value });
    } else {
      await ctx.db.insert("globalSettings", { key, value });
    }


// ── Campaigns (Volume Discounts) ──────────────────────────────────

export const getActiveVolumeCampaign = query({
  args: {},
  handler: async (ctx) => {
    // Return the first active volume discount campaign
    return await ctx.db
      .query("campaigns")
      .withIndex("by_active", (q) => q.eq("isActive", true))
      .filter((q) => q.eq(q.field("type"), "volume_discount"))
      .first();
  },
});

export const listCampaigns = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("campaigns").order("desc").collect();
  },
});

export const createCampaign = mutation({
  args: {
    name: v.string(),
    type: v.string(),
    isActive: v.boolean(),
    minItems: v.number(),
    discountType: v.string(),
    discountValue: v.number(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // If making active, deactivate others of the same type to prevent stacking conflicts
    if (args.isActive) {
      const activeOthers = await ctx.db
        .query("campaigns")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .filter((q) => q.eq(q.field("type"), args.type))
        .collect();
        
      for (const campaign of activeOthers) {
        await ctx.db.patch(campaign._id, { isActive: false });
      }
    }
    
    return await ctx.db.insert("campaigns", args);
  },
});

export const updateCampaign = mutation({
  args: {
    id: v.id("campaigns"),
    isActive: v.boolean(),
  },
  handler: async (ctx, { id, isActive }) => {
    await requireAdmin(ctx);
    const target = await ctx.db.get(id);
    if (!target) throw new Error("Campaign not found");

    if (isActive) {
      const activeOthers = await ctx.db
        .query("campaigns")
        .withIndex("by_active", (q) => q.eq("isActive", true))
        .filter((q) => q.eq(q.field("type"), target.type))
        .collect();
        
      for (const campaign of activeOthers) {
        if (campaign._id !== id) {
          await ctx.db.patch(campaign._id, { isActive: false });
        }
      }
    }

    await ctx.db.patch(id, { isActive });
  },
});

export const deleteCampaign = mutation({
  args: { id: v.id("campaigns") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});
