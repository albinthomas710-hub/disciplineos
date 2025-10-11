import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's kitchen reclaim status
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const status = await ctx.db
      .query("kitchenReclaim")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return status;
  },
});

// Initialize kitchen reclaim status
export const initializeStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("kitchenReclaim")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("kitchenReclaim", {
      userId: user._id,
      waitingSessions: [],
      mindfulMeals: [],
      weeklyStats: {
        minutesReclaimed: 0,
        mindfulMealCount: 0,
        overeatCount: 0,
      },
    });
  },
});

// Start waiting session
export const startWaitingSession = mutation({
  args: {
    duration: v.number(), // in minutes
    activityType: v.union(
      v.literal("micro-task"),
      v.literal("learning"),
      v.literal("movement")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    let status = await ctx.db
      .query("kitchenReclaim")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) {
      const statusId = await ctx.db.insert("kitchenReclaim", {
        userId: user._id,
        waitingSessions: [],
        mindfulMeals: [],
        weeklyStats: {
          minutesReclaimed: 0,
          mindfulMealCount: 0,
          overeatCount: 0,
        },
      });
      status = await ctx.db.get(statusId);
      if (!status) throw new Error("Failed to create status");
    }

    const now = Date.now();
    const newSession = {
      startTime: now,
      duration: args.duration,
      activityChosen: args.activityType,
      completed: false,
      endTime: now + args.duration * 60 * 1000,
    };

    const sessions = [...(status.waitingSessions || []), newSession];

    await ctx.db.patch(status._id, {
      waitingSessions: sessions,
    });

    return newSession;
  },
});

// Complete waiting session
export const completeWaitingSession = mutation({
  args: {
    sessionIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("kitchenReclaim")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) throw new Error("Status not found");

    const sessions = [...(status.waitingSessions || [])];
    if (sessions[args.sessionIndex]) {
      sessions[args.sessionIndex].completed = true;
      
      // Update weekly stats
      const minutesReclaimed = sessions[args.sessionIndex].duration;
      const newStats = {
        ...status.weeklyStats,
        minutesReclaimed: status.weeklyStats.minutesReclaimed + minutesReclaimed,
      };

      await ctx.db.patch(status._id, {
        waitingSessions: sessions,
        weeklyStats: newStats,
      });
    }
  },
});

// Log mindful meal
export const logMindfulMeal = mutation({
  args: {
    preHunger: v.number(),
    postFullness: v.number(),
    overate: v.boolean(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    let status = await ctx.db
      .query("kitchenReclaim")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) {
      const statusId = await ctx.db.insert("kitchenReclaim", {
        userId: user._id,
        waitingSessions: [],
        mindfulMeals: [],
        weeklyStats: {
          minutesReclaimed: 0,
          mindfulMealCount: 0,
          overeatCount: 0,
        },
      });
      status = await ctx.db.get(statusId);
      if (!status) throw new Error("Failed to create status");
    }

    const now = Date.now();
    const newMeal = {
      date: new Date(now).toISOString().split("T")[0],
      timestamp: now,
      preHunger: args.preHunger,
      postFullness: args.postFullness,
      overate: args.overate,
      notes: args.notes,
    };

    const meals = [...(status.mindfulMeals || []), newMeal];
    
    // Update weekly stats
    const newStats = {
      ...status.weeklyStats,
      mindfulMealCount: status.weeklyStats.mindfulMealCount + 1,
      overeatCount: args.overate
        ? status.weeklyStats.overeatCount + 1
        : status.weeklyStats.overeatCount,
    };

    await ctx.db.patch(status._id, {
      mindfulMeals: meals,
      weeklyStats: newStats,
    });
  },
});

// Reset weekly stats (should be called by cron)
export const resetWeeklyStats = mutation({
  args: {},
  handler: async (ctx) => {
    const allStatuses = await ctx.db.query("kitchenReclaim").collect();

    for (const status of allStatuses) {
      await ctx.db.patch(status._id, {
        weeklyStats: {
          minutesReclaimed: 0,
          mindfulMealCount: 0,
          overeatCount: 0,
        },
      });
    }
  },
});
