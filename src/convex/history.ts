import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // 1. Fetch Completion Logs (Time Blocks)
    const logs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // 2. Identify Timetables involved
    const logTimetableIds = new Set(logs.map(l => l.timetableId));
    if (user.activeTimetableId) {
      logTimetableIds.add(user.activeTimetableId);
    }
    
    // Fetch all timetables involved
    const timetablesMap = new Map();
    await Promise.all(
      Array.from(logTimetableIds).map(async (id) => {
        const timetable = await ctx.db.get(id);
        if (timetable) {
          timetablesMap.set(id, timetable);
        }
      })
    );

    // Fetch ALL blocks for these timetables
    const timetableBlocksMap = new Map<string, any[]>();
    await Promise.all(
      Array.from(logTimetableIds).map(async (tid) => {
        const blocks = await ctx.db
          .query("timeBlocks")
          .withIndex("by_timetable", (q) => q.eq("timetableId", tid))
          .collect();
        timetableBlocksMap.set(tid, blocks);
      })
    );

    // 4. Structure Data by Date
    const historyByDate: Record<string, any> = {};

    // Helper to generate date range array
    const start = new Date(args.startDate);
    const end = new Date(args.endDate);
    const dateArray = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dateArray.push(d.toISOString().split('T')[0]);
    }

    // Process each day in the range
    dateArray.forEach(dateStr => {
      // Find logs for this date
      const dayLogs = logs.filter(l => l.date === dateStr);
      
      // Determine Timetable ID
      let timetableId = null;
      if (dayLogs.length > 0) {
        timetableId = dayLogs[0].timetableId; // Use the one from logs
      } else if (user.activeTimetableId) {
        timetableId = user.activeTimetableId; // Fallback to active
      }

      // If we have a timetable, we can build the full view
      if (timetableId && timetablesMap.has(timetableId)) {
        const timetable = timetablesMap.get(timetableId);
        const allBlocks = timetableBlocksMap.get(timetableId) || [];
        
        // Map logs for quick lookup
        const logMap = new Map(dayLogs.map(l => [l.timeBlockId, l]));

        // Build full block list (merging schedule with logs)
        const fullBlocks = allBlocks.map(block => {
          const log = logMap.get(block._id);
          return {
            _id: log?._id, // Log ID if exists
            timeBlockId: block._id,
            date: dateStr,
            completed: log?.completed || false, // Default to false if no log
            completedAt: log?.completedAt,
            blockTitle: block.title,
            blockDescription: block.description,
            category: block.category,
            startTime: block.startTime,
            endTime: block.endTime,
            timetableName: timetable.name,
            timetableColor: timetable.color,
            order: block.order,
          };
        });

        // Sort by order or time
        fullBlocks.sort((a, b) => (a.order || 0) - (b.order || 0));

        // Calculate Stats
        const totalBlocks = fullBlocks.length;
        const completedBlocks = fullBlocks.filter(b => b.completed).length;

        historyByDate[dateStr] = {
          blocks: fullBlocks,
          stats: {
            completedBlocks,
            totalBlocks,
            timetableName: timetable.name
          }
        };
      } else {
        // No timetable data available for this day
        historyByDate[dateStr] = {
          blocks: [],
          stats: { completedBlocks: 0, totalBlocks: 0 }
        };
      }
    });

    return historyByDate;
  },
});

export const getYearlyStats = query({
  args: {
    year: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const startDate = `${args.year}-01-01`;
    const endDate = `${args.year}-12-31`;

    // 1. Fetch Completion Logs
    const logs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    // 2. Identify Timetables
    const logTimetableIds = new Set(logs.map(l => l.timetableId));
    if (user.activeTimetableId) {
      logTimetableIds.add(user.activeTimetableId);
    }

    // 3. Get Block Counts for each Timetable
    const timetableCounts = new Map<string, number>();
    await Promise.all(
      Array.from(logTimetableIds).map(async (tid) => {
        const blocks = await ctx.db
          .query("timeBlocks")
          .withIndex("by_timetable", (q) => q.eq("timetableId", tid))
          .collect();
        timetableCounts.set(tid, blocks.length);
      })
    );

    // 4. Calculate stats per day
    const statsByDate: Record<string, { total: number; completed: number }> = {};

    logs.forEach((log) => {
      if (!statsByDate[log.date]) {
        // Initialize with the FULL timetable count, not just log count
        const total = timetableCounts.get(log.timetableId) || 0;
        statsByDate[log.date] = { total, completed: 0 };
      }
      if (log.completed) {
        statsByDate[log.date].completed++;
      }
    });

    return statsByDate;
  },
});

export const getMonthlyGoals = query({
  args: { month: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;
    return await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user_and_month", (q) => q.eq("userId", user._id).eq("month", args.month))
      .unique();
  },
});

export const updateMonthlyGoals = mutation({
  args: {
    month: v.string(),
    mainObjectives: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user_and_month", (q) => q.eq("userId", user._id).eq("month", args.month))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        mainObjectives: args.mainObjectives,
        notes: args.notes,
      });
    } else {
      await ctx.db.insert("monthlyGoals", {
        userId: user._id,
        month: args.month,
        mainObjectives: args.mainObjectives || "",
        notes: args.notes || "",
      });
    }
  },
});