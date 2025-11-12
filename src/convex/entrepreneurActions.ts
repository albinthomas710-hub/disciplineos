import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get today's action log
export const getTodayAction = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    
    const action = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    return action;
  },
});

// Get recent actions (last 7 days)
export const getRecentActions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const actions = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    return actions.sort((a, b) => b.createdAt - a.createdAt).slice(0, 7);
  },
});

// Create or update today's action
export const upsertTodayAction = mutation({
  args: {
    builtSomething: v.optional(v.boolean()),
    builtSomethingNote: v.optional(v.string()),
    talkedToCustomers: v.optional(v.boolean()),
    customersCount: v.optional(v.number()),
    learnedNewSkill: v.optional(v.boolean()),
    skillLearned: v.optional(v.string()),
    betterThanYesterday: v.optional(v.boolean()),
    lessonLearned: v.optional(v.string()),
    hoursWorked: v.optional(v.number()),
    action24hrs: v.optional(v.string()),
    goal7days: v.optional(v.string()),
    goal30days: v.optional(v.string()),
    goal90days: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    const data: any = {
      updatedAt: Date.now(),
    };

    if (args.builtSomething !== undefined) data.builtSomething = args.builtSomething;
    if (args.builtSomethingNote !== undefined) data.builtSomethingNote = args.builtSomethingNote;
    if (args.talkedToCustomers !== undefined) data.talkedToCustomers = args.talkedToCustomers;
    if (args.customersCount !== undefined) data.customersCount = args.customersCount;
    if (args.learnedNewSkill !== undefined) data.learnedNewSkill = args.learnedNewSkill;
    if (args.skillLearned !== undefined) data.skillLearned = args.skillLearned;
    if (args.betterThanYesterday !== undefined) data.betterThanYesterday = args.betterThanYesterday;
    if (args.lessonLearned !== undefined) data.lessonLearned = args.lessonLearned;
    if (args.hoursWorked !== undefined) data.hoursWorked = args.hoursWorked;
    if (args.action24hrs !== undefined) data.action24hrs = args.action24hrs;
    if (args.goal7days !== undefined) data.goal7days = args.goal7days;
    if (args.goal30days !== undefined) data.goal30days = args.goal30days;
    if (args.goal90days !== undefined) data.goal90days = args.goal90days;

    if (existing) {
      await ctx.db.patch(existing._id, data);
      return existing._id;
    } else {
      return await ctx.db.insert("entrepreneurActions", {
        userId: user._id,
        date: today,
        builtSomething: args.builtSomething || false,
        builtSomethingNote: args.builtSomethingNote,
        talkedToCustomers: args.talkedToCustomers || false,
        customersCount: args.customersCount,
        learnedNewSkill: args.learnedNewSkill || false,
        skillLearned: args.skillLearned,
        betterThanYesterday: args.betterThanYesterday || false,
        lessonLearned: args.lessonLearned,
        hoursWorked: args.hoursWorked,
        action24hrs: args.action24hrs,
        goal7days: args.goal7days,
        goal30days: args.goal30days,
        goal90days: args.goal90days,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    }
  },
});

// Get weekly stats
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    
    const actions = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    const recentActions = actions.filter(a => a.createdAt >= sevenDaysAgo);

    const totalHours = recentActions.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
    const daysBuilt = recentActions.filter(a => a.builtSomething).length;
    const totalCustomers = recentActions.reduce((sum, a) => sum + (a.customersCount || 0), 0);
    const daysLearned = recentActions.filter(a => a.learnedNewSkill).length;

    return {
      totalHours,
      daysBuilt,
      totalCustomers,
      daysLearned,
      daysTracked: recentActions.length,
    };
  },
});
