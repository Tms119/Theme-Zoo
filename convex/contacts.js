import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ── List all contact requests ─────────────────────────────────────
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("contact_requests").order("desc").collect();
  },
});

// ── Create contact request ────────────────────────────────────────
export const create = mutation({
  args: {
    name:         v.string(),
    email:        v.string(),
    project_type: v.optional(v.string()),
    budget:       v.optional(v.string()),
    message:      v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("contact_requests", { ...args, status: "new" });
  },
});

// ── Update status ─────────────────────────────────────────────────
export const updateStatus = mutation({
  args: { id: v.id("contact_requests"), status: v.string() },
  handler: async (ctx, { id, status }) => {
    await ctx.db.patch(id, { status });
  },
});
