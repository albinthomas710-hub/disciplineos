import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";
import { checkRateLimit } from "./rateLimiting";

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

// Get recent actions (last 7 days) - FIXED: uses date range filter
export const getRecentActions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];

    const actions = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", sevenDaysAgo).lte("date", today)
      )
      .order("desc")
      .take(7);

    return actions;
  },
});

// Create or update today's action
export const upsertTodayAction = mutation({
  args: {
    builtSomething: v.optional(v.boolean()),
    builtSomethingNote: v.optional(v.string()),
    talkedToCustomers: v.optional(v.boolean()),
    customersCount: v.optional(v.number()),
    customerInsights: v.optional(v.string()),
    qualityFlags: v.optional(v.array(v.string())),
    learnedNewSkill: v.optional(v.boolean()),
    skillLearned: v.optional(v.string()),
    betterThanYesterday: v.optional(v.boolean()),
    lessonLearned: v.optional(v.string()),
    hoursWorked: v.optional(v.number()),
    revenueClosed: v.optional(v.number()),
    pipelineAdded: v.optional(v.number()),
    outreachCount: v.optional(v.number()),
    dealsClosed: v.optional(v.number()),
    action24hrs: v.optional(v.string()),
    goal7days: v.optional(v.string()),
    goal30days: v.optional(v.string()),
    goal90days: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      // Rate limit check
      const rateCheck = await checkRateLimit(ctx, "entrepreneurActions.upsertTodayAction");
      if (!rateCheck.allowed) {
        throw new Error(`Slow down! Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      }

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
    if (args.customerInsights !== undefined) data.customerInsights = args.customerInsights;
    if (args.qualityFlags !== undefined) data.qualityFlags = args.qualityFlags;
    if (args.learnedNewSkill !== undefined) data.learnedNewSkill = args.learnedNewSkill;
    if (args.skillLearned !== undefined) data.skillLearned = args.skillLearned;
    if (args.betterThanYesterday !== undefined) data.betterThanYesterday = args.betterThanYesterday;
    if (args.lessonLearned !== undefined) data.lessonLearned = args.lessonLearned;
    if (args.hoursWorked !== undefined) data.hoursWorked = args.hoursWorked;
    if (args.revenueClosed !== undefined) data.revenueClosed = args.revenueClosed;
    if (args.pipelineAdded !== undefined) data.pipelineAdded = args.pipelineAdded;
    if (args.outreachCount !== undefined) data.outreachCount = args.outreachCount;
    if (args.dealsClosed !== undefined) data.dealsClosed = args.dealsClosed;
    if (args.action24hrs !== undefined) data.action24hrs = args.action24hrs;
    if (args.goal7days !== undefined) data.goal7days = args.goal7days;
    if (args.goal30days !== undefined) data.goal30days = args.goal30days;
    if (args.goal90days !== undefined) data.goal90days = args.goal90days;

    // Calculate streaks
    if (args.builtSomething !== undefined || args.talkedToCustomers !== undefined || args.learnedNewSkill !== undefined) {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const yesterdayAction = await ctx.db
        .query("entrepreneurActions")
        .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", yesterday))
        .first();

      const currentStreaks = existing?.streaks || yesterdayAction?.streaks || {
        builtStreak: 0,
        customerStreak: 0,
        learningStreak: 0,
        eightyHourWeeks: 0,
      };

      data.streaks = {
        builtStreak: args.builtSomething ? (currentStreaks.builtStreak + 1) : 0,
        customerStreak: args.talkedToCustomers ? (currentStreaks.customerStreak + 1) : 0,
        learningStreak: args.learnedNewSkill ? (currentStreaks.learningStreak + 1) : 0,
        eightyHourWeeks: currentStreaks.eightyHourWeeks,
      };
    }

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
        customerInsights: args.customerInsights,
        qualityFlags: args.qualityFlags,
        learnedNewSkill: args.learnedNewSkill || false,
        skillLearned: args.skillLearned,
        betterThanYesterday: args.betterThanYesterday || false,
        lessonLearned: args.lessonLearned,
        hoursWorked: args.hoursWorked,
        revenueClosed: args.revenueClosed,
        pipelineAdded: args.pipelineAdded,
        outreachCount: args.outreachCount,
        dealsClosed: args.dealsClosed,
        action24hrs: args.action24hrs,
        goal7days: args.goal7days,
        goal30days: args.goal30days,
        goal90days: args.goal90days,
        streaks: data.streaks,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
      }
    } catch (error: any) {
      if (error.message?.includes("Rate limited") || error.message?.includes("Not authenticated")) {
        throw error;
      }
      console.error("upsertTodayAction error:", error);
      throw new Error("Failed to save action. Please try again.");
    }
  },
});

// Get weekly stats - FIXED: uses date range filter
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = new Date().toISOString().split('T')[0];
    
    const actions = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", sevenDaysAgo).lte("date", today)
      )
      .collect();

    const totalHours = actions.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
    const daysBuilt = actions.filter(a => a.builtSomething).length;
    const totalCustomers = actions.reduce((sum, a) => sum + (a.customersCount || 0), 0);
    const daysLearned = actions.filter(a => a.learnedNewSkill).length;
    const totalRevenue = actions.reduce((sum, a) => sum + (a.revenueClosed || 0), 0);
    const totalPipeline = actions.reduce((sum, a) => sum + (a.pipelineAdded || 0), 0);
    const totalDeals = actions.reduce((sum, a) => sum + (a.dealsClosed || 0), 0);

    return {
      totalHours,
      daysBuilt,
      totalCustomers,
      daysLearned,
      daysTracked: actions.length,
      totalRevenue,
      totalPipeline,
      totalDeals,
    };
  },
});

// Get current streaks
export const getCurrentStreaks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split('T')[0];
    const todayAction = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    return todayAction?.streaks || {
      builtStreak: 0,
      customerStreak: 0,
      learningStreak: 0,
      eightyHourWeeks: 0,
    };
  },
});

// Create weekly review - FIXED: uses date range filter
export const createWeeklyReview = mutation({
  args: {
    weekStartDate: v.string(),
    weekEndDate: v.string(),
    whatWorked: v.string(),
    whatDidntWork: v.string(),
    topPriority: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");

    // Calculate metrics for the week - FIXED: uses date range filter
    const actions = await ctx.db
      .query("entrepreneurActions")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.weekStartDate).lte("date", args.weekEndDate)
      )
      .collect();

    const totalConversations = actions.reduce((sum, a) => sum + (a.customersCount || 0), 0);
    const thingsBuilt = actions.filter(a => a.builtSomething).length;
    const skillsLearned = actions.filter(a => a.skillLearned).map(a => a.skillLearned!);
    const totalRevenue = actions.reduce((sum, a) => sum + (a.revenueClosed || 0), 0);
    const totalHours = actions.reduce((sum, a) => sum + (a.hoursWorked || 0), 0);
    const avgHoursPerDay = totalHours / (actions.length || 1);

    // Get last week's review for comparison - FIXED: uses index with take(1)
    const lastWeekStart = new Date(new Date(args.weekStartDate).getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const lastWeekReview = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user_and_week", (q) => q.eq("userId", user._id).eq("weekStartDate", lastWeekStart))
      .first();

    return await ctx.db.insert("weeklyReviews", {
      userId: user._id,
      weekStartDate: args.weekStartDate,
      weekEndDate: args.weekEndDate,
      totalConversations,
      thingsBuilt,
      skillsLearned,
      totalRevenue,
      totalHours,
      avgHoursPerDay,
      whatWorked: args.whatWorked,
      whatDidntWork: args.whatDidntWork,
      topPriority: args.topPriority,
      conversationsChange: lastWeekReview ? totalConversations - lastWeekReview.totalConversations : undefined,
      revenueChange: lastWeekReview ? totalRevenue - lastWeekReview.totalRevenue : undefined,
      hoursChange: lastWeekReview ? totalHours - lastWeekReview.totalHours : undefined,
      createdAt: Date.now(),
    });
    } catch (error: any) {
      if (error.message?.includes("Not authenticated")) throw error;
      console.error("createWeeklyReview error:", error);
      throw new Error("Failed to create weekly review. Please try again.");
    }
  },
});

// Get latest weekly review - FIXED: uses .take(1) instead of collecting all
export const getLatestWeeklyReview = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const review = await ctx.db
      .query("weeklyReviews")
      .withIndex("by_user_and_week", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(1);

    return review[0] || null;
  },
});
