import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a promo code
export const create = mutation({
  args: {
    code: v.string(),
    discountType: v.string(), // "percentage" or "fixed"
    discountValue: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("promo_codes", {
      code: args.code.toUpperCase(),
      discountType: args.discountType,
      discountValue: args.discountValue,
      isActive: args.isActive,
      uses: 0,
    });
  },
});

// Get a promo code by code string
export const getByCode = query({
  args: { code: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("promo_codes")
      .withIndex("by_code", (q) => q.eq("code", args.code.toUpperCase()))
      .first();
  },
});

// Increment use
export const incrementUse = mutation({
  args: { codeId: v.id("promo_codes") },
  handler: async (ctx, args) => {
    const pc = await ctx.db.get(args.codeId);
    if (pc) {
      await ctx.db.patch(args.codeId, {
        uses: pc.uses + 1,
      });
    }
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("promo_codes").order("desc").collect();
  },
});

export const toggleStatus = mutation({
  args: { id: v.id("promo_codes"), isActive: v.boolean() },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { isActive: args.isActive });
  },
});

export const deleteCode = mutation({
  args: { id: v.id("promo_codes") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
