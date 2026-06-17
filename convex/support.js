import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create a new support ticket
export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    problem: v.string(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("support_tickets", {
      name: args.name,
      email: args.email,
      problem: args.problem,
      status: "open",
    });
  },
});

// List all support tickets
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("support_tickets").order("desc").collect();
  },
});

// Get tickets by email
export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    if (!args.email) return [];
    return await ctx.db
      .query("support_tickets")
      .filter((q) => q.eq(q.field("email"), args.email))
      .order("desc")
      .collect();
  },
});

// Update support ticket status
export const updateStatus = mutation({
  args: {
    id: v.id("support_tickets"),
    status: v.string(), // "open" | "resolved"
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
  },
});
