import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get today's reflection
export const getToday = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];

    return await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();
  },
});

// Get recent reflections
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const limit = args.limit || 7;

    // Use order desc to get most recent first, take only what we need
    return await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(limit);
  },
});

// Save reflection
export const save = mutation({
  args: {
    didWell: v.string(),
    brokeDispline: v.string(),
    improvement: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    const existing = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        didWell: args.didWell,
        brokeDispline: args.brokeDispline,
        improvements: [args.improvement],
      });
    } else {
      await ctx.db.insert("reflections", {
        userId: user._id,
        date: today,
        type: "daily",
        answers: {},
        didWell: args.didWell,
        brokeDispline: args.brokeDispline,
        improvements: [args.improvement],
        focusScore: 0,
        outputLog: "",
        dailyRating: 0,
        outputScore: 0,
        workType: "N/A",
        targetHours: 0,
        productivityInventory: {},
        callsBooked: 0,
        callsConducted: 0,
        callsClosed: 0,
        distractions: [],
        tomorrowPlan: "",
        signalTasks: [],
        noiseTasks: [],
        signalCompletionRate: 0,
        theOneThingCompleted: false,
      });
    }
  },
});

export const updateReflection = mutation({
  args: {
    id: v.id("reflections"),
    didWell: v.optional(v.string()),
    improvements: v.optional(v.any()),
    focusScore: v.optional(v.number()),
    outputLog: v.optional(v.string()),
    dailyRating: v.optional(v.number()),
    outputScore: v.optional(v.number()),
    workType: v.optional(v.string()),
    targetHours: v.optional(v.number()),
    productivityInventory: v.optional(v.any()),
    callsBooked: v.optional(v.number()),
    callsConducted: v.optional(v.number()),
    callsClosed: v.optional(v.number()),
    distractions: v.optional(v.any()),
    tomorrowPlan: v.optional(v.string()),
    signalTasks: v.optional(v.any()),
    noiseTasks: v.optional(v.any()),
    signalCompletionRate: v.optional(v.number()),
    theOneThingCompleted: v.optional(v.boolean()),
    brokeDispline: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const reflection = await ctx.db.get(args.id);
    if (!reflection || reflection.userId !== user._id) {
      throw new Error("Reflection not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      didWell: args.didWell,
      improvements: args.improvements,
      focusScore: args.focusScore,
      outputLog: args.outputLog,
      dailyRating: args.dailyRating,
      outputScore: args.outputScore,
      workType: args.workType,
      targetHours: args.targetHours,
      productivityInventory: args.productivityInventory,
      callsBooked: args.callsBooked,
      callsConducted: args.callsConducted,
      callsClosed: args.callsClosed,
      distractions: args.distractions,
      tomorrowPlan: args.tomorrowPlan,
      signalTasks: args.signalTasks,
      noiseTasks: args.noiseTasks,
      signalCompletionRate: args.signalCompletionRate,
      theOneThingCompleted: args.theOneThingCompleted,
      brokeDispline: args.brokeDispline,
    });
  },
});