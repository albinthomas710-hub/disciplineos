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
export const getYearlyQuarterlyPlans = null;

// Create or update a quarterly plan
export const upsertQuarterlyPlan = null;