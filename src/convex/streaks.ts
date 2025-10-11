import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Calculate and update user streaks based on completion logs
export const calculateDailyStreaks = internalMutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    
    for (const user of allUsers) {
      await updateUserStreak(ctx, user._id);
    }
  },
});

// Helper function to update a single user's streak
async function updateUserStreak(ctx: any, userId: any) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // Get today's logs
  const todayLogs = await ctx.db
    .query("completionLogs")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", today)
    )
    .collect();

  if (todayLogs.length === 0) return;

  const todayCompleted = todayLogs.filter((log: any) => log.completed).length;
  const todayTotal = todayLogs.length;
  const todayRate = todayCompleted / todayTotal;

  // Only update if 80% or more completed
  if (todayRate < 0.8) return;

  const user = await ctx.db.get(userId);
  if (!user) return;

  // Get yesterday's logs
  const yesterdayLogs = await ctx.db
    .query("completionLogs")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", yesterday)
    )
    .collect();

  const yesterdayCompleted = yesterdayLogs.filter((log: any) => log.completed).length;
  const yesterdayTotal = yesterdayLogs.length;
  const yesterdayRate = yesterdayTotal > 0 ? yesterdayCompleted / yesterdayTotal : 0;

  let newStreak = 1;
  
  // Continue streak if yesterday was also 80%+
  if (yesterdayRate >= 0.8) {
    newStreak = (user.currentStreak || 0) + 1;
  }

  const longestStreak = Math.max(user.longestStreak || 0, newStreak);
  const totalDaysCompleted = (user.totalDaysCompleted || 0) + 1;

  await ctx.db.patch(userId, {
    currentStreak: newStreak,
    longestStreak,
    totalDaysCompleted,
  });
}

// Manual trigger for streak calculation (can be called from frontend)
export const triggerStreakUpdate = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, internal.streaks.calculateDailyStreaks);
  },
});
