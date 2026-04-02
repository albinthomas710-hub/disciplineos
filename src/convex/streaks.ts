import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

// Calculate and update user streaks based on completion logs
export const calculateDailyStreaks = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Process in batches of 50 to avoid excessive reads
    const allUsers = await ctx.db.query("users").take(50);
    
    await Promise.all(allUsers.map(user => updateUserStreak(ctx, user._id)));
  },
});

// Helper function to update a single user's streak - HONEST calculation
async function updateUserStreak(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  // Only look at last 90 days to limit data
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const startDate = ninetyDaysAgo.toISOString().split("T")[0];
  const today = new Date().toISOString().split("T")[0];

  const allLogs = await ctx.db
    .query("completionLogs")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).gte("date", startDate).lte("date", today)
    )
    .take(500);

  // Group logs by date
  const logsByDate = new Map<string, any[]>();
  for (const log of allLogs) {
    if (!logsByDate.has(log.date)) {
      logsByDate.set(log.date, []);
    }
    logsByDate.get(log.date)!.push(log);
  }

  // Calculate which days were successful (80%+ completion)
  const successfulDates = new Set<string>();
  for (const [date, logs] of logsByDate.entries()) {
    const completed = logs.filter((log: any) => log.completed).length;
    const total = logs.length;
    if (total > 0 && completed / total >= 0.8) {
      successfulDates.add(date);
    }
  }

  // Calculate current streak (consecutive days ending today or yesterday)
  let currentStreak = 0;
  let checkDate = new Date();
  
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (successfulDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (currentStreak === 0) {
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split("T")[0];
      if (successfulDates.has(yesterdayStr)) {
        currentStreak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // Calculate longest streak
  const sortedDates = Array.from(successfulDates).sort();
  let longestStreak = 0;
  let tempStreak = 0;
  let prevDate: Date | null = null;

  for (const dateStr of sortedDates) {
    const currentDate = new Date(dateStr);
    if (prevDate === null) {
      tempStreak = 1;
    } else {
      const dayDiff = Math.floor((currentDate.getTime() - prevDate.getTime()) / 86400000);
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    prevDate = currentDate;
  }
  longestStreak = Math.max(longestStreak, tempStreak);

  const totalDaysCompleted = successfulDates.size;

  await ctx.db.patch(userId, {
    currentStreak,
    longestStreak,
    totalDaysCompleted,
  });
}

// Manual trigger for streak calculation (can be called from frontend)
export const triggerStreakUpdate = mutation({
  args: {},
  handler: async (ctx) => {
    await ctx.scheduler.runAfter(0, (internal as any).streaks.calculateDailyStreaks);
  },
});