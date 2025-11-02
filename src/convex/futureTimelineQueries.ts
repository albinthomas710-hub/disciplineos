import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's timeline data with enhanced personalization
export const getTimeline = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const timeline = await ctx.db
      .query("futureTimeline")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Get user's manifestations for personalization
    const manifestations = await ctx.db
      .query("manifestations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("isAchieved"), false))
      .take(5);

    // Get recent reflections for deeper personalization
    const recentReflections = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(3);

    // Calculate completion rate for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const weekLogs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .filter((q) => q.gte(q.field("date"), sevenDaysAgo.toISOString().split('T')[0]))
      .collect();

    const weekCompletionRate = weekLogs.length > 0
      ? Math.round((weekLogs.filter(l => l.completed).length / weekLogs.length) * 100)
      : 0;

    // Calculate today's completion rate
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .collect();

    const todayCompletionRate = todayLogs.length > 0
      ? Math.round((todayLogs.filter(l => l.completed).length / todayLogs.length) * 100)
      : 0;

    return {
      timeline,
      manifestations,
      recentReflections,
      currentStreak: user.currentStreak || 0,
      longestStreak: user.longestStreak || 0,
      todayCompletionRate,
      weekCompletionRate,
      userName: user.name || "Friend",
    };
  },
});

// Initialize or update timeline vibrancy based on user actions
export const updateVibrancy = mutation({
  args: {
    completedAction: v.boolean(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    let timeline = await ctx.db
      .query("futureTimeline")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const vibrancyChange = args.completedAction ? 2 : -3;
    
    if (!timeline) {
      // Create initial timeline
      await ctx.db.insert("futureTimeline", {
        userId: user._id,
        timelineAVibrancy: Math.max(0, Math.min(100, 50 + vibrancyChange)),
        timelineBVibrancy: Math.max(0, Math.min(100, 50 - vibrancyChange)),
        lastUpdated: Date.now(),
      });
    } else {
      const newTimelineAVibrancy = Math.max(0, Math.min(100, timeline.timelineAVibrancy + vibrancyChange));
      const newTimelineBVibrancy = Math.max(0, Math.min(100, timeline.timelineBVibrancy - vibrancyChange));

      await ctx.db.patch(timeline._id, {
        timelineAVibrancy: newTimelineAVibrancy,
        timelineBVibrancy: newTimelineBVibrancy,
        lastUpdated: Date.now(),
      });
    }
  },
});

// Reset timeline to neutral state
export const resetTimeline = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const timeline = await ctx.db
      .query("futureTimeline")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (timeline) {
      await ctx.db.patch(timeline._id, {
        timelineAVibrancy: 50,
        timelineBVibrancy: 50,
        lastUpdated: Date.now(),
      });
    } else {
      await ctx.db.insert("futureTimeline", {
        userId: user._id,
        timelineAVibrancy: 50,
        timelineBVibrancy: 50,
        lastUpdated: Date.now(),
      });
    }
  },
});