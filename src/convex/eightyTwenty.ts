import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new 80/20 activity
export const createActivity = mutation({
  args: {
    activityName: v.string(),
    category: v.string(), // "product", "marketing", "sales", "operations", "learning"
    timeInvested: v.number(), // hours per week
    expectedImpact: v.optional(v.string()),
    startDate: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("eightyTwentyActivities", {
      userId,
      activityName: args.activityName,
      category: args.category,
      timeInvested: args.timeInvested,
      expectedImpact: args.expectedImpact,
      startDate: args.startDate,
      status: "active",
      actualResults: [],
      totalImpactScore: 0,
      efficiencyRatio: 0,
    });
  },
});

// Log results for an activity
export const logResult = mutation({
  args: {
    activityId: v.id("eightyTwentyActivities"),
    resultType: v.string(), // "revenue", "users", "engagement", "learning", "efficiency"
    resultValue: v.number(),
    resultDescription: v.string(),
    dateLogged: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activity = await ctx.db.get(args.activityId);
    if (!activity || activity.userId !== userId) {
      throw new Error("Activity not found");
    }

    const newResult = {
      resultType: args.resultType,
      resultValue: args.resultValue,
      resultDescription: args.resultDescription,
      dateLogged: args.dateLogged,
    };

    const updatedResults = [...(activity.actualResults || []), newResult];
    
    // Calculate impact score (weighted by result type)
    const impactWeights: Record<string, number> = {
      revenue: 10,
      users: 5,
      engagement: 3,
      learning: 2,
      efficiency: 4,
    };
    
    const totalImpact = updatedResults.reduce((sum, result) => {
      const weight = impactWeights[result.resultType] || 1;
      return sum + (result.resultValue * weight);
    }, 0);

    // Calculate efficiency ratio (impact per hour invested)
    const efficiencyRatio = activity.timeInvested > 0 
      ? totalImpact / activity.timeInvested 
      : 0;

    await ctx.db.patch(args.activityId, {
      actualResults: updatedResults,
      totalImpactScore: totalImpact,
      efficiencyRatio: Math.round(efficiencyRatio * 100) / 100,
    });

    return { success: true, newImpactScore: totalImpact, efficiencyRatio };
  },
});

// Get all activities
export const getAllActivities = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("eightyTwentyActivities")
      .filter((q) => q.eq(q.field("userId"), userId))
      .order("desc")
      .collect();
  },
});

// Get top performers (the 20% that delivers 80% of results)
export const getTopPerformers = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const activities = await ctx.db
      .query("eightyTwentyActivities")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    // Sort by efficiency ratio
    return activities
      .sort((a, b) => b.efficiencyRatio - a.efficiencyRatio)
      .slice(0, Math.ceil(activities.length * 0.2) || 3);
  },
});

// Get insights and recommendations
export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const activities = await ctx.db
      .query("eightyTwentyActivities")
      .filter((q) => q.eq(q.field("userId"), userId))
      .collect();

    if (activities.length === 0) return null;

    const totalTime = activities.reduce((sum, a) => sum + a.timeInvested, 0);
    const totalImpact = activities.reduce((sum, a) => sum + a.totalImpactScore, 0);

    // Find top 20%
    const topCount = Math.ceil(activities.length * 0.2) || 1;
    const topActivities = activities
      .sort((a, b) => b.efficiencyRatio - a.efficiencyRatio)
      .slice(0, topCount);

    const topImpact = topActivities.reduce((sum, a) => sum + a.totalImpactScore, 0);
    const topTime = topActivities.reduce((sum, a) => sum + a.timeInvested, 0);

    // Find bottom performers
    const bottomActivities = activities
      .sort((a, b) => a.efficiencyRatio - b.efficiencyRatio)
      .slice(0, topCount);

    return {
      totalActivities: activities.length,
      totalTimeInvested: totalTime,
      totalImpact,
      topPerformersCount: topCount,
      topPerformersImpact: topImpact,
      topPerformersTime: topTime,
      impactPercentageFromTop: totalImpact > 0 ? Math.round((topImpact / totalImpact) * 100) : 0,
      timePercentageFromTop: totalTime > 0 ? Math.round((topTime / totalTime) * 100) : 0,
      bottomPerformers: bottomActivities.map(a => ({
        name: a.activityName,
        timeWasted: a.timeInvested,
        lowImpact: a.totalImpactScore,
      })),
    };
  },
});

// Update activity status
export const updateActivityStatus = mutation({
  args: {
    activityId: v.id("eightyTwentyActivities"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activity = await ctx.db.get(args.activityId);
    if (!activity || activity.userId !== userId) {
      throw new Error("Activity not found");
    }

    await ctx.db.patch(args.activityId, {
      status: args.status as any,
    });
  },
});

// Delete activity
export const deleteActivity = mutation({
  args: {
    activityId: v.id("eightyTwentyActivities"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const activity = await ctx.db.get(args.activityId);
    if (!activity || activity.userId !== userId) {
      throw new Error("Activity not found");
    }

    await ctx.db.delete(args.activityId);
  },
});
