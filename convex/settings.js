import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

const SOCIAL_LINKS_KEY = "social_links";

export const getSocialLinks = query({
  args: {},
  handler: async (ctx) => {
    const setting = await ctx.db
      .query("globalSettings")
      .withIndex("by_key", (q) => q.eq("key", SOCIAL_LINKS_KEY))
      .first();

    return setting?.value || {
      x: "",
      telegram: "",
      youtube: "",
      instagram: "",
      pinterest: "",
      reddit: "",
      whatsapp: ""
    };
  },
});

export const updateSocialLinks = mutation({
  args: {
    x: v.optional(v.string()),
    telegram: v.optional(v.string()),
    youtube: v.optional(v.string()),
    instagram: v.optional(v.string()),
    pinterest: v.optional(v.string()),
    reddit: v.optional(v.string()),
    whatsapp: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    const setting = await ctx.db
      .query("globalSettings")
      .withIndex("by_key", (q) => q.eq("key", SOCIAL_LINKS_KEY))
      .first();

    if (setting) {
      await ctx.db.patch(setting._id, {
        value: args
      });
    } else {
      await ctx.db.insert("globalSettings", {
        key: SOCIAL_LINKS_KEY,
        value: args
      });
    }

    return { success: true };
  },
});
