import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
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

// Get a random action-oriented quote
export const getActionQuote = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Get quotes related to action, discipline, or focus
    const allQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const actionQuotes = allQuotes.filter(q => 
      q.category === "action" || 
      q.category === "discipline" || 
      q.category === "focus" ||
      q.tags?.some(tag => ["action", "discipline", "focus", "work"].includes(tag))
    );

    if (actionQuotes.length === 0) {
      // Return a default quote if user has none
      return {
        text: "A vision without action is merely a dream. Action without vision just passes the time. Vision with action can change the world.",
        author: "Joel A. Barker",
        category: "action"
      };
    }

    // Return random action quote
    return actionQuotes[Math.floor(Math.random() * actionQuotes.length)];
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
      wisdomJourney: [],
    });
  },
});

// Capture vision and create micro-plan with quote integration
export const captureVision = mutation({
  args: {
    vision: v.string(),
    why: v.string(),
    tinyAction: v.string(),
    triggerQuoteId: v.optional(v.id("quotes")),
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
        wisdomJourney: [],
      });
      status = await ctx.db.get(statusId);
      if (!status) throw new Error("Failed to create status");
    }

    const now = Date.now();

    // Get relevant quotes for each step
    const allQuotes = await ctx.db
      .query("quotes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const getRelevantQuote = (stepType: string) => {
      const filtered = allQuotes.filter(q => {
        if (stepType === "action") return q.category === "action" || q.tags?.includes("action");
        if (stepType === "reflection") return q.category === "wisdom" || q.tags?.includes("mindset");
        if (stepType === "continuation") return q.category === "resilience" || q.tags?.includes("goals");
        return false;
      });
      return filtered.length > 0 ? filtered[Math.floor(Math.random() * filtered.length)] : null;
    };

    // Generate AI micro-plan with quote assignments
    const microPlan = [
      {
        step: `Step 1: ${args.tinyAction}`,
        quoteId: getRelevantQuote("action")?._id,
        completed: false,
      },
      {
        step: `Step 2: Document your progress in 2 sentences`,
        quoteId: getRelevantQuote("reflection")?._id,
        completed: false,
      },
      {
        step: `Step 3: Identify the next smallest action to continue`,
        quoteId: getRelevantQuote("continuation")?._id,
        completed: false,
      },
    ];

    const newEvent = {
      timestamp: now,
      eventType: "vision_captured" as const,
      vision: args.vision,
      why: args.why,
      microPlan: microPlan.map(p => p.step),
      triggerQuoteId: args.triggerQuoteId,
    };

    const newMicroPlan = {
      createdAt: now,
      vision: args.vision,
      steps: microPlan,
      completed: false,
      triggerQuoteId: args.triggerQuoteId,
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

// Complete a micro-plan step and track wisdom manifestation
export const completeMicroPlanStep = mutation({
  args: {
    planIndex: v.number(),
    stepIndex: v.number(),
    reflection: v.optional(v.string()),
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
    if (plans[args.planIndex] && plans[args.planIndex].steps[args.stepIndex]) {
      plans[args.planIndex].steps[args.stepIndex].completed = true;

      // Check if all steps completed
      const allStepsCompleted = plans[args.planIndex].steps.every(s => s.completed);
      if (allStepsCompleted) {
        plans[args.planIndex].completed = true;

        // Add to wisdom journey
        const wisdomJourney = [...(status.wisdomJourney || [])];
        wisdomJourney.push({
          timestamp: Date.now(),
          vision: plans[args.planIndex].vision,
          triggerQuoteId: plans[args.planIndex].triggerQuoteId,
          stepsCompleted: plans[args.planIndex].steps.length,
          reflection: args.reflection,
        });

        await ctx.db.patch(status._id, {
          microPlans: plans,
          wisdomJourney,
        });
      } else {
        await ctx.db.patch(status._id, {
          microPlans: plans,
        });
      }
    }
  },
});

// Get wisdom journey timeline
export const getWisdomJourney = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const status = await ctx.db
      .query("realityAnchor")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!status || !status.wisdomJourney) return [];

    // Enrich with quote data
    const enrichedJourney = await Promise.all(
      status.wisdomJourney.map(async (entry) => {
        let quote = null;
        if (entry.triggerQuoteId) {
          quote = await ctx.db.get(entry.triggerQuoteId);
        }
        return {
          ...entry,
          quote,
        };
      })
    );

    return enrichedJourney.sort((a, b) => b.timestamp - a.timestamp);
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
        wisdomJourney: [],
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

// Complete a micro-plan (legacy - kept for compatibility)
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
      plans[args.planIndex].steps.forEach(s => s.completed = true);
    }

    await ctx.db.patch(status._id, {
      microPlans: plans,
    });
  },
});

// Reset weekly counter (should be called by cron)
export const resetWeeklyCounter = internalMutation({
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