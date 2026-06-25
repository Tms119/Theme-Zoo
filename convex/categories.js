import { query, mutation } from "./_generated/server";
import { v, ConvexError } from "convex/values";
import { requireAdmin } from "./auth";

// ── Get all categories ─────────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const categories = await ctx.db.query("categories").collect();
    return categories.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  },
});

// ── Create category ─────────────────────────────────────────────
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
    sort_order: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Check if category exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new ConvexError("Category already exists.");
    }
    
    if (args.sort_order === undefined) {
      const all = await ctx.db.query("categories").collect();
      const maxSort = all.reduce((max, c) => Math.max(max, c.sort_order || 0), 0);
      args.sort_order = maxSort + 1;
    }

    return await ctx.db.insert("categories", args);
  },
});

// ── Delete category ─────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("categories") },
  handler: async (ctx, { id }) => {
    await requireAdmin(ctx);
    await ctx.db.delete(id);
  },
});

// ── Reorder Categories ──────────────────────────────────────────
export const reorder = mutation({
  args: {
    items: v.array(v.object({
      id: v.id("categories"),
      sort_order: v.number()
    }))
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    for (const item of args.items) {
      await ctx.db.patch(item.id, { sort_order: item.sort_order });
    }
  }
});

// ── Seed Categories ─────────────────────────────────────────────
export const seed = mutation({
  args: {},
  handler: async (ctx) => {
    await requireAdmin(ctx);
    const existing = await ctx.db.query("categories").collect();
    if (existing.length > 0) return { message: "Categories already seeded" };

    const cats = [
      { name: "WordPress", slug: "wordpress" },
      { name: "Website", slug: "website" },
    ];

    for (const c of cats) {
      await ctx.db.insert("categories", c);
    }
    return { message: "Seeded categories" };
  },
});
