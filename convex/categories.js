import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { requireAdmin } from "./auth";

// ── Get all categories ─────────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("categories").order("asc").collect();
  },
});

// ── Create category ─────────────────────────────────────────────
export const create = mutation({
  args: {
    name: v.string(),
    slug: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    // Check if category exists
    const existing = await ctx.db
      .query("categories")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();

    if (existing) {
      throw new Error("Category already exists.");
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
