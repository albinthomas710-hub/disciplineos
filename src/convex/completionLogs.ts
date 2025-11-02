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

// Helper to update user streak - HONEST calculation based on actual completion
async function updateStreak(ctx: any, userId: any) {
  const user = await ctx.db.get(userId);
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  
  // Get all completion logs for this user, sorted by date
  const allLogs = await ctx.db
    .query("completionLogs")
    .withIndex("by_user_and_date", (q: any) => q.eq("userId", userId))
    .collect();

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
    const completed = logs.filter(log => log.completed).length;
    const total = logs.length;
    if (total > 0 && completed / total >= 0.8) {
      successfulDates.add(date);
    }
  }

  // Calculate current streak (consecutive days ending today)
  let currentStreak = 0;
  let checkDate = new Date();
  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (successfulDates.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak ever
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

  // Total days completed is just the count of successful days
  const totalDaysCompleted = successfulDates.size;

  // Update user with REAL stats
  await ctx.db.patch(userId, {
    currentStreak,
    longestStreak,
    totalDaysCompleted,
  });
}
