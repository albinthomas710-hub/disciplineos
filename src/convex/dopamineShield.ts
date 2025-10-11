import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get current shield status
export const getStatus = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const status = await ctx.db
      .query("dopamineShield")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return status;
  },
});

// Initialize shield status for new users
export const initializeStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("dopamineShield")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("dopamineShield", {
      userId: user._id,
      sessionId: crypto.randomUUID(),
      lastLearningEnd: null,
      cooldownExpiresAt: null,
      bypassAttemptsToday: 0,
      microChallengeHistory: [],
      strictBlockUntil: null,
    });
  },
});

// Complete learning session
export const completeLearningSession = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("dopamineShield")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    const now = Date.now();
    const cooldownDuration = 60 * 60 * 1000; // 60 minutes

    if (status) {
      await ctx.db.patch(status._id, {
        lastLearningEnd: now,
        cooldownExpiresAt: now + cooldownDuration,
        sessionId: crypto.randomUUID(),
      });
    } else {
      await ctx.db.insert("dopamineShield", {
        userId: user._id,
        sessionId: crypto.randomUUID(),
        lastLearningEnd: now,
        cooldownExpiresAt: now + cooldownDuration,
        bypassAttemptsToday: 0,
        microChallengeHistory: [],
        strictBlockUntil: null,
      });
    }
  },
});

// Start micro-task
export const startMicroTask = mutation({
  args: {
    taskType: v.union(v.literal("learning"), v.literal("recovery")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("dopamineShield")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) throw new Error("Shield status not found");

    // Clear cooldown if micro-task is started
    await ctx.db.patch(status._id, {
      cooldownExpiresAt: null,
    });
  },
});

// Complete micro-challenge
export const completeMicroChallenge = mutation({
  args: {
    success: v.boolean(),
    summary: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("dopamineShield")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) throw new Error("Shield status not found");

    const now = Date.now();
    const history = status.microChallengeHistory || [];
    
    history.push({
      type: "summary",
      completedAt: now,
      success: args.success,
      content: args.summary,
    });

    if (args.success) {
      // Grant 3-minute access
      await ctx.db.patch(status._id, {
        cooldownExpiresAt: now + (3 * 60 * 1000),
        microChallengeHistory: history,
      });
    } else {
      // Failed challenge - increment bypass attempts
      const newBypassCount = status.bypassAttemptsToday + 1;
      const updates: any = {
        bypassAttemptsToday: newBypassCount,
        microChallengeHistory: history,
      };

      // Check if strict block should be activated
      if (newBypassCount >= 3) {
        updates.strictBlockUntil = now + (24 * 60 * 60 * 1000); // 24 hours
      }

      await ctx.db.patch(status._id, updates);
    }
  },
});

// Reset daily bypass attempts (should be called by a cron job)
export const resetDailyAttempts = mutation({
  args: {},
  handler: async (ctx) => {
    const allStatuses = await ctx.db.query("dopamineShield").collect();

    for (const status of allStatuses) {
      await ctx.db.patch(status._id, {
        bypassAttemptsToday: 0,
      });
    }
  },
});
