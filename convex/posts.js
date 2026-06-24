import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ────────────────────────────────────────────────────────
// List all posts (Admin)
// ────────────────────────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("posts").order("desc").collect();
  },
});

// ────────────────────────────────────────────────────────
// List published posts (Storefront)
// ────────────────────────────────────────────────────────
export const listPublished = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .collect();
  },
});

// ────────────────────────────────────────────────────────
// Get a single post by ID (Admin Editor)
// ────────────────────────────────────────────────────────
export const getById = query({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// ────────────────────────────────────────────────────────
// Get a single post by slug (Storefront Reader)
// ────────────────────────────────────────────────────────
export const getBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
  },
});

// ────────────────────────────────────────────────────────
// Create Post
// ────────────────────────────────────────────────────────
export const create = mutation({
  args: {
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    short_desc: v.string(),
    cover_image_url: v.optional(v.string()),
    author: v.optional(v.string()),
    status: v.string(),
    meta_title: v.optional(v.string()),
    meta_desc: v.optional(v.string()),
    meta_keywords: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Basic slug uniqueness check
    const existing = await ctx.db
      .query("posts")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error("A post with this slug already exists.");
    }

    const payload = {
      ...args,
      published_at: args.status === "published" ? Date.now() : undefined,
    };

    return await ctx.db.insert("posts", payload);
  },
});

// ────────────────────────────────────────────────────────
// Update Post
// ────────────────────────────────────────────────────────
export const update = mutation({
  args: {
    id: v.id("posts"),
    title: v.string(),
    slug: v.string(),
    content: v.string(),
    short_desc: v.string(),
    cover_image_url: v.optional(v.string()),
    author: v.optional(v.string()),
    status: v.string(),
    meta_title: v.optional(v.string()),
    meta_desc: v.optional(v.string()),
    meta_keywords: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    const existingPost = await ctx.db.get(id);

    if (!existingPost) throw new Error("Post not found");

    // Enforce slug uniqueness if slug changed
    if (updates.slug !== existingPost.slug) {
      const slugCheck = await ctx.db
        .query("posts")
        .withIndex("by_slug", (q) => q.eq("slug", updates.slug))
        .first();
      
      if (slugCheck) throw new Error("A post with this slug already exists.");
    }

    // Handle published_at logic
    if (updates.status === "published" && existingPost.status === "draft") {
      updates.published_at = Date.now();
    } else if (updates.status === "draft") {
      updates.published_at = undefined;
    }

    await ctx.db.patch(id, updates);
    return id;
  },
});

// ────────────────────────────────────────────────────────
// Delete Post
// ────────────────────────────────────────────────────────
export const remove = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// ────────────────────────────────────────────────────────
// Toggle Status Quick Action
// ────────────────────────────────────────────────────────
export const toggleStatus = mutation({
  args: { id: v.id("posts") },
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.id);
    if (!post) throw new Error("Post not found");

    const newStatus = post.status === "published" ? "draft" : "published";
    const publishedAt = newStatus === "published" ? Date.now() : undefined;

    await ctx.db.patch(args.id, {
      status: newStatus,
      published_at: publishedAt
    });
  }
});
