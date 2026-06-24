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
      reddit: "",
      instagram: "",
      pinterest: "",
      whatsapp: ""
    };
  },
});

export const updateSocialLinks = mutation({
  args: {
    x: v.string(),
    reddit: v.string(),
    instagram: v.string(),
    pinterest: v.string(),
    whatsapp: v.string()
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
