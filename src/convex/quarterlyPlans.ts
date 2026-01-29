import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get quarterly plan for a specific quarter
export const getQuarterlyPlan = query({
  args: {
    year: v.number(),
    quarter: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    return await ctx.db
      .query("quarterlyPlans")
      .withIndex("by_user_year_quarter", (q) => 
        q.eq("userId", user._id).eq("year", args.year).eq("quarter", args.quarter)
      )
      .first();
  },
});

// Get all quarterly plans for a year
export const getYearlyQuarterlyPlans = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("quarterlyPlans")
      .withIndex("by_user_year_quarter", (q) => 
        q.eq("userId", user._id).eq("year", args.year)
      )
      .collect();
  },
});

// Create or update a quarterly plan
export const upsertQuarterlyPlan = mutation({
  args: {
    year: v.number(),
    quarter: v.number(),
    objective: v.string(),
    metricTarget: v.string(),
    primaryFocus: v.string(),
    initiatives: v.array(v.string()),
    constraints: v.string(),
    nonNegotiables: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    if (args.initiatives.length > 3) {
      throw new Error("Maximum 3 initiatives allowed");
    }

    const existing = await ctx.db
      .query("quarterlyPlans")
      .withIndex("by_user_year_quarter", (q) => 
        q.eq("userId", user._id).eq("year", args.year).eq("quarter", args.quarter)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        objective: args.objective,
        metricTarget: args.metricTarget,
        primaryFocus: args.primaryFocus,
        initiatives: args.initiatives,
        constraints: args.constraints,
        nonNegotiables: args.nonNegotiables,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("quarterlyPlans", {
        userId: user._id,
        year: args.year,
        quarter: args.quarter,
        objective: args.objective,
        metricTarget: args.metricTarget,
        primaryFocus: args.primaryFocus,
        initiatives: args.initiatives,
        constraints: args.constraints,
        nonNegotiables: args.nonNegotiables,
      });
    }
  },
});
