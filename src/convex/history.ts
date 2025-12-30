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

    // 2. Fetch Timetable Overrides
    const overrides = await ctx.db
      .query("dailyTimetableOverrides")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // 3. Identify Timetables involved
    const logTimetableIds = new Set(logs.map(l => l.timetableId));
    if (user.activeTimetableId) {
      logTimetableIds.add(user.activeTimetableId);
    }
    // Add overridden timetables
    overrides.forEach(o => logTimetableIds.add(o.timetableId));
    
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

    // Fetch Day Tags for the range
    const dayTags = await ctx.db
      .query("dayTags")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // Fetch Reflections (Daily Metrics) for the range
    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

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
      const override = overrides.find(o => o.date === dateStr);
      const tags = dayTags.filter(t => t.date === dateStr).map(t => t.tagId);
      const reflection = reflections.find(r => r.date === dateStr);
      
      // Determine Timetable ID
      let timetableId = null;
      
      if (override) {
        timetableId = override.timetableId;
      } else if (dayLogs.length > 0) {
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
            timetableName: timetable.name,
            timetableId: timetable._id,
            isOverride: !!override,
            // Add daily rating to stats for easy access
            dailyRating: reflection?.dailyRating,
            focusScore: reflection?.focusScore,
          },
          tags, // Add tags to the day data
          metrics: reflection ? {
            focusScore: reflection.focusScore,
            outputLog: reflection.outputLog,
            dailyRating: reflection.dailyRating,
            outputScore: reflection.outputScore,
            workType: reflection.workType,
            targetHours: reflection.targetHours,
            productivityInventory: reflection.productivityInventory,
            improvements: reflection.improvements,
            callsBooked: reflection.callsBooked,
            callsConducted: reflection.callsConducted,
            callsClosed: reflection.callsClosed,
            distractions: reflection.distractions,
            tomorrowPlan: reflection.tomorrowPlan,
            signalTasks: reflection.signalTasks,
            noiseTasks: reflection.noiseTasks,
            signalCompletionRate: reflection.signalCompletionRate,
            theOneThingCompleted: reflection.theOneThingCompleted,
            _id: reflection._id
          } : null,
        };
      } else {
        // No timetable data available for this day
        historyByDate[dateStr] = {
          blocks: [],
          stats: { 
            completedBlocks: 0, 
            totalBlocks: 0,
            // Add daily rating to stats for easy access
            dailyRating: reflection?.dailyRating,
            focusScore: reflection?.focusScore,
          },
          tags, // Add tags even if no timetable
          metrics: reflection ? {
            focusScore: reflection.focusScore,
            outputLog: reflection.outputLog,
            dailyRating: reflection.dailyRating,
            outputScore: reflection.outputScore,
            workType: reflection.workType,
            targetHours: reflection.targetHours,
            productivityInventory: reflection.productivityInventory,
            improvements: reflection.improvements,
            callsBooked: reflection.callsBooked,
            callsConducted: reflection.callsConducted,
            callsClosed: reflection.callsClosed,
            distractions: reflection.distractions,
            tomorrowPlan: reflection.tomorrowPlan,
            signalTasks: reflection.signalTasks,
            noiseTasks: reflection.noiseTasks,
            signalCompletionRate: reflection.signalCompletionRate,
            theOneThingCompleted: reflection.theOneThingCompleted,
            _id: reflection._id
          } : null,
        };
      }
    });

    return historyByDate;
  },
});

export const updateDailyMetrics = mutation({
  args: {
    date: v.string(),
    focusScore: v.optional(v.number()),
    outputLog: v.optional(v.string()),
    dailyRating: v.optional(v.number()),
    outputScore: v.optional(v.number()),
    workType: v.optional(v.string()),
    targetHours: v.optional(v.number()),
    productivityInventory: v.optional(v.array(v.object({ text: v.string(), checked: v.boolean() }))),
    improvements: v.optional(v.array(v.string())),
    callsBooked: v.optional(v.number()),
    callsConducted: v.optional(v.number()),
    callsClosed: v.optional(v.number()),
    distractions: v.optional(v.array(v.string())),
    tomorrowPlan: v.optional(v.string()),
    signalTasks: v.optional(v.array(v.object({
      id: v.string(),
      task: v.string(),
      importance: v.union(
        v.literal("the_one_thing"),
        v.literal("high_signal"),
        v.literal("medium_signal"),
        v.literal("low_signal")
      ),
      completed: v.boolean(),
      completedAt: v.optional(v.number()),
    }))),
    noiseTasks: v.optional(v.array(v.object({
      id: v.string(),
      task: v.string(),
      importance: v.union(
        v.literal("high_noise"),
        v.literal("low_noise")
      ),
      completed: v.boolean(),
      completedAt: v.optional(v.number()),
    }))),
    signalCompletionRate: v.optional(v.number()),
    theOneThingCompleted: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", args.date)
      )
      .unique();

    if (existing) {
      const updateFields: any = {};
      
      if (args.focusScore !== undefined) updateFields.focusScore = args.focusScore;
      if (args.outputLog !== undefined) updateFields.outputLog = args.outputLog;
      if (args.dailyRating !== undefined) updateFields.dailyRating = args.dailyRating;
      if (args.outputScore !== undefined) updateFields.outputScore = args.outputScore;
      if (args.workType !== undefined) updateFields.workType = args.workType;
      if (args.targetHours !== undefined) updateFields.targetHours = args.targetHours;
      
      if (args.productivityInventory !== undefined) updateFields.productivityInventory = args.productivityInventory;
      if (args.improvements !== undefined) updateFields.improvements = args.improvements;
      if (args.callsBooked !== undefined) updateFields.callsBooked = args.callsBooked;
      if (args.callsConducted !== undefined) updateFields.callsConducted = args.callsConducted;
      if (args.callsClosed !== undefined) updateFields.callsClosed = args.callsClosed;
      if (args.distractions !== undefined) updateFields.distractions = args.distractions;
      if (args.tomorrowPlan !== undefined) updateFields.tomorrowPlan = args.tomorrowPlan;
      if (args.signalTasks !== undefined) updateFields.signalTasks = args.signalTasks;
      if (args.noiseTasks !== undefined) updateFields.noiseTasks = args.noiseTasks;
      if (args.signalCompletionRate !== undefined) updateFields.signalCompletionRate = args.signalCompletionRate;
      if (args.theOneThingCompleted !== undefined) updateFields.theOneThingCompleted = args.theOneThingCompleted;

      await ctx.db.patch(existing._id, updateFields);
    } else {
      await ctx.db.insert("reflections", {
        userId: user._id,
        date: args.date,
        type: "daily",
        answers: {},
        didWell: "",
        brokeDispline: "",
        focusScore: args.focusScore ?? 5,
        outputLog: args.outputLog ?? "",
        dailyRating: args.dailyRating ?? 50,
        outputScore: args.outputScore,
        workType: args.workType,
        targetHours: args.targetHours,
        productivityInventory: args.productivityInventory,
        improvements: args.improvements,
        callsBooked: args.callsBooked,
        callsConducted: args.callsConducted,
        callsClosed: args.callsClosed,
        distractions: args.distractions,
        tomorrowPlan: args.tomorrowPlan,
        signalTasks: args.signalTasks,
        noiseTasks: args.noiseTasks,
        signalCompletionRate: args.signalCompletionRate,
        theOneThingCompleted: args.theOneThingCompleted,
      });
    }
  },
});

export const getCalendarTags = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];
    return await ctx.db
      .query("calendarTags")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

export const createCalendarTag = mutation({
  args: {
    label: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    return await ctx.db.insert("calendarTags", {
      userId: user._id,
      label: args.label,
      color: args.color,
    });
  },
});

export const deleteCalendarTag = mutation({
  args: { tagId: v.id("calendarTags") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    // Clean up assignments
    const assignments = await ctx.db
      .query("dayTags")
      .filter(q => q.eq(q.field("tagId"), args.tagId))
      .collect();
      
    for (const assignment of assignments) {
      await ctx.db.delete(assignment._id);
    }
    
    await ctx.db.delete(args.tagId);
  },
});

export const toggleDayTag = mutation({
  args: {
    date: v.string(),
    tagId: v.id("calendarTags"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("dayTags")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", args.date)
      )
      .filter(q => q.eq(q.field("tagId"), args.tagId))
      .first();

    if (existing) {
      await ctx.db.delete(existing._id);
    } else {
      await ctx.db.insert("dayTags", {
        userId: user._id,
        date: args.date,
        tagId: args.tagId,
      });
    }
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

    // 2. Fetch Overrides
    const overrides = await ctx.db
      .query("dailyTimetableOverrides")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    // 3. Fetch Reflections (Daily Verdicts)
    const reflections = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", startDate).lte("date", endDate)
      )
      .collect();

    // 4. Identify Timetables
    const logTimetableIds = new Set(logs.map(l => l.timetableId));
    if (user.activeTimetableId) {
      logTimetableIds.add(user.activeTimetableId);
    }
    overrides.forEach(o => logTimetableIds.add(o.timetableId));

    // 5. Get Block Counts AND Names for each Timetable
    const timetableInfo = new Map<string, { count: number, name: string }>();
    await Promise.all(
      Array.from(logTimetableIds).map(async (tid) => {
        const [blocks, timetable] = await Promise.all([
          ctx.db
            .query("timeBlocks")
            .withIndex("by_timetable", (q) => q.eq("timetableId", tid))
            .collect(),
          ctx.db.get(tid)
        ]);
        
        if (timetable) {
          timetableInfo.set(tid, { 
            count: blocks.length, 
            name: timetable.name 
          });
        }
      })
    );

    // 6. Calculate stats per day
    const statsByDate: Record<string, { total: number; completed: number; timetableName?: string; dailyRating?: number; focusScore?: number }> = {};

    // Iterate all days that have ANY activity (logs, overrides, OR reflections)
    const daysWithActivity = new Set([
      ...logs.map(l => l.date), 
      ...overrides.map(o => o.date),
      ...reflections.map(r => r.date)
    ]);
    
    daysWithActivity.forEach(date => {
      const dayLogs = logs.filter(l => l.date === date);
      const override = overrides.find(o => o.date === date);
      const reflection = reflections.find(r => r.date === date);
      
      let timetableId = null;
      if (override) {
        timetableId = override.timetableId;
      } else if (dayLogs.length > 0) {
        timetableId = dayLogs[0].timetableId;
      } else if (user.activeTimetableId) {
        timetableId = user.activeTimetableId; 
      }

      let total = 0;
      let completed = 0;
      let timetableName = undefined;

      if (timetableId && timetableInfo.has(timetableId)) {
        const info = timetableInfo.get(timetableId)!;
        total = info.count;
        completed = dayLogs.filter(l => l.completed && l.timetableId === timetableId).length;
        timetableName = info.name;
      }

      statsByDate[date] = {
        total,
        completed,
        timetableName,
        dailyRating: reflection?.dailyRating,
        focusScore: reflection?.focusScore
      };
    });

    return statsByDate;
  },
});

export const setDayTimetable = mutation({
  args: {
    date: v.string(),
    timetableId: v.id("timetables"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("dailyTimetableOverrides")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", args.date)
      )
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, { timetableId: args.timetableId });
    } else {
      await ctx.db.insert("dailyTimetableOverrides", {
        userId: user._id,
        date: args.date,
        timetableId: args.timetableId,
      });
    }
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
        goal: "Monthly Objectives",
        category: "General",
        isPrivate: true,
        date: new Date().toISOString().split("T")[0],
      });
    }
  },
});

export const createMonthlyGoal = mutation({
  args: {
    month: v.string(),
    mainObjectives: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("monthlyGoals")
      .withIndex("by_user_and_month", (q) =>
        q.eq("userId", user._id).eq("month", args.month)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        mainObjectives: args.mainObjectives,
        notes: args.notes || "",
      });
    } else {
      await ctx.db.insert("monthlyGoals", {
        userId: user._id,
        month: args.month,
        mainObjectives: args.mainObjectives,
        notes: args.notes || "",
        // Added required fields
        goal: "Monthly Objectives", 
        category: "General",
        isPrivate: true,
        date: new Date().toISOString().split("T")[0],
      });
    }
  },
});