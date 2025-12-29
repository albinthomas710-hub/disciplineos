import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get today's reflection
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();
  },
});

// Get recent reflections
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    return reflections
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, args.limit || 7);
  },
});

// Save reflection
export const save = mutation({
  args: {
    didWell: v.string(),
    brokeDispline: v.string(),
    improvement: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        didWell: args.didWell,
        brokeDispline: args.brokeDispline,
        improvement: args.improvement,
      });
    } else {
      await ctx.db.insert("reflections", {
        userId: user._id,
        date: today,
        didWell: args.didWell,
        brokeDispline: args.brokeDispline,
        improvement: args.improvement,
        focusScore: 0,
        outputLog: "",
        dailyRating: 0,
      });
    }
  },
});