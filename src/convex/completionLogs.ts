import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get today's completion logs
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .collect();
  },
});

// Get logs for date range
export const getByDateRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const logs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    return logs.filter(
      (log) => log.date >= args.startDate && log.date <= args.endDate
    );
  },
});

// Mark block as complete
export const markComplete = mutation({
  args: {
    timeBlockId: v.id("timeBlocks"),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const block = await ctx.db.get(args.timeBlockId);
    if (!block) throw new Error("Block not found");

    const today = new Date().toISOString().split("T")[0];

    // Check if log exists
    const existing = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .collect();

    const existingLog = existing.find((log) => log.timeBlockId === args.timeBlockId);

    if (existingLog) {
      await ctx.db.patch(existingLog._id, {
        completed: args.completed,
        completedAt: args.completed ? Date.now() : undefined,
      });
    } else {
      await ctx.db.insert("completionLogs", {
        userId: user._id,
        timetableId: block.timetableId,
        timeBlockId: args.timeBlockId,
        date: today,
        completed: args.completed,
        completedAt: args.completed ? Date.now() : undefined,
      });
    }

    // Update streak if needed
    await updateStreak(ctx, user._id);
  },
});

// Helper to update user streak
async function updateStreak(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  const todayLogs = await ctx.db
    .query("completionLogs")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", today)
    )
    .collect();

  const todayCompleted = todayLogs.filter((log: any) => log.completed).length;
  const todayTotal = todayLogs.length;

  // If 80% or more completed, count as successful day
  if (todayTotal > 0 && todayCompleted / todayTotal >= 0.8) {
    const yesterdayLogs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q: any) => 
        q.eq("userId", userId).eq("date", yesterday)
      )
      .collect();

    const yesterdayCompleted = yesterdayLogs.filter((log: any) => log.completed).length;
    const yesterdayTotal = yesterdayLogs.length;

    const currentStreak = user.currentStreak || 0;
    let newStreak = 1;

    if (yesterdayTotal > 0 && yesterdayCompleted / yesterdayTotal >= 0.8) {
      newStreak = currentStreak + 1;
    }

    const longestStreak = Math.max(user.longestStreak || 0, newStreak);

    await ctx.db.patch(userId, {
      currentStreak: newStreak,
      longestStreak,
      totalDaysCompleted: (user.totalDaysCompleted || 0) + 1,
    });
  }
}
