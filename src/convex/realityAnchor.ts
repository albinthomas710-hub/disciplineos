import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's anchor statistics
export const getStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const status = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return status;
  },
});

// Initialize anchor status for new users
export const initializeStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) return existing._id;

    return await ctx.db.insert("realityAnchor", {
      userId: user._id,
      anchorEvents: [],
      microPlans: [],
      conversionsCountWeek: 0,
      lastWeeklyReset: Date.now(),
    });
  },
});

// Capture vision and create micro-plan
export const captureVision = mutation({
  args: {
    vision: v.string(),
    why: v.string(),
    tinyAction: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    let status = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) {
      const statusId = await ctx.db.insert("realityAnchor", {
        userId: user._id,
        anchorEvents: [],
        microPlans: [],
        conversionsCountWeek: 0,
        lastWeeklyReset: Date.now(),
      });
      status = await ctx.db.get(statusId);
      if (!status) throw new Error("Failed to create status");
    }

    const now = Date.now();

    // Generate AI micro-plan (3 steps)
    const microPlan = [
      `Step 1: ${args.tinyAction}`,
      `Step 2: Document your progress in 2 sentences`,
      `Step 3: Identify the next smallest action to continue`,
    ];

    const newEvent = {
      timestamp: now,
      eventType: "vision_captured" as const,
      vision: args.vision,
      why: args.why,
      microPlan,
    };

    const newMicroPlan = {
      createdAt: now,
      vision: args.vision,
      steps: microPlan,
      completed: false,
    };

    const events = [...(status.anchorEvents || []), newEvent];
    const plans = [...(status.microPlans || []), newMicroPlan];

    await ctx.db.patch(status._id, {
      anchorEvents: events,
      microPlans: plans,
      conversionsCountWeek: status.conversionsCountWeek + 1,
    });

    // Check if weekly planning session should be scheduled
    const weeklyCount = events.filter(
      (e) => e.timestamp > now - 7 * 24 * 60 * 60 * 1000
    ).length;

    return {
      microPlan,
      shouldScheduleWeeklySession: weeklyCount >= 5,
    };
  },
});

// Record anchor event (grounding or redirect)
export const recordAnchorEvent = mutation({
  args: {
    eventType: v.union(v.literal("grounding"), v.literal("redirect")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    let status = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) {
      const statusId = await ctx.db.insert("realityAnchor", {
        userId: user._id,
        anchorEvents: [],
        microPlans: [],
        conversionsCountWeek: 0,
        lastWeeklyReset: Date.now(),
      });
      status = await ctx.db.get(statusId);
      if (!status) throw new Error("Failed to create status");
    }

    const newEvent = {
      timestamp: Date.now(),
      eventType: args.eventType,
    };

    const events = [...(status.anchorEvents || []), newEvent];

    await ctx.db.patch(status._id, {
      anchorEvents: events,
    });
  },
});

// Complete a micro-plan
export const completeMicroPlan = mutation({
  args: {
    planIndex: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const status = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status) throw new Error("Status not found");

    const plans = [...(status.microPlans || [])];
    if (plans[args.planIndex]) {
      plans[args.planIndex].completed = true;
    }

    await ctx.db.patch(status._id, {
      microPlans: plans,
    });
  },
});

// Reset weekly counter (should be called by cron)
export const resetWeeklyCounter = mutation({
  args: {},
  handler: async (ctx) => {
    const allStatuses = await ctx.db.query("realityAnchor").collect();
    const now = Date.now();
    const weekMs = 7 * 24 * 60 * 60 * 1000;

    for (const status of allStatuses) {
      if (now - status.lastWeeklyReset >= weekMs) {
        await ctx.db.patch(status._id, {
          conversionsCountWeek: 0,
          lastWeeklyReset: now,
        });
      }
    }
  },
});
