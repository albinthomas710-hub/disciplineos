import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";
import { checkRateLimit } from "./rateLimiting";

// Maximum number of entries to keep in sub-collections (90 days)
const MAX_DAILY_ACTIONS = 90;
const MAX_EVIDENCE_LOG = 90;
const MAX_VISUALIZATION_SESSIONS = 90;
const MAX_AI_INSIGHTS = 50;
const MAX_LIMITING_BELIEFS = 30;
const MAX_OBSTACLES = 60;
const MAX_JOURNAL_ENTRIES = 90;
const MAX_SYNCHRONICITIES = 50;

// Log daily actions — rate limited
export const logDailyActions = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    actions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const rateCheck = await checkRateLimit(ctx, "manifestationActions.logDailyActions");
      if (!rateCheck.allowed) {
        throw new Error(`Slow down! Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      }

      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const today = new Date().toISOString().split('T')[0];
    const dailyActions = manifestation.dailyActions || [];
    
    // Check if already logged today
    const existingIndex = dailyActions.findIndex(d => d.date === today);
    if (existingIndex >= 0) {
      dailyActions[existingIndex].actions = args.actions;
    } else {
      dailyActions.push({
        date: today,
        actions: args.actions,
        timestamp: Date.now(),
      });
    }
    
    // Enforce size limit - keep only most recent entries
    while (dailyActions.length > MAX_DAILY_ACTIONS) {
      dailyActions.shift();
    }

    // Update action streak
    const lastActionDate = manifestation.lastActionDate;
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    let actionStreak = manifestation.actionStreak || 0;
    if (lastActionDate === yesterday) {
      actionStreak += 1;
    } else if (lastActionDate !== today) {
      actionStreak = 1;
    }

    await ctx.db.patch(args.manifestationId, {
      dailyActions,
      actionStreak,
      lastActionDate: today,
      updatedAt: Date.now(),
    });

    return actionStreak;
    } catch (error: any) {
      if (error.message?.includes("Rate limited") || error.message?.includes("Not authenticated") || error.message?.includes("not found")) {
        throw error;
      }
      console.error("logDailyActions error:", error);
      throw new Error("Failed to log actions. Please try again.");
    }
  },
});

// Log evidence — rate limited
export const logEvidence = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    evidence: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      const rateCheck = await checkRateLimit(ctx, "manifestationActions.logEvidence");
      if (!rateCheck.allowed) {
        throw new Error(`Slow down! Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      }

      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const evidenceLog = manifestation.evidenceLog || [];
    const today = new Date().toISOString().split('T')[0];
    
    evidenceLog.push({
      date: today,
      evidence: args.evidence.trim(),
      timestamp: Date.now(),
    });
    
    // Enforce size limit - keep only most recent entries
    while (evidenceLog.length > MAX_EVIDENCE_LOG) {
      evidenceLog.shift();
    }

    await ctx.db.patch(args.manifestationId, {
      evidenceLog,
      updatedAt: Date.now(),
    });
    } catch (error: any) {
      if (error.message?.includes("Rate limited") || error.message?.includes("Not authenticated") || error.message?.includes("not found")) {
        throw error;
      }
      console.error("logEvidence error:", error);
      throw new Error("Failed to log evidence. Please try again.");
    }
  },
});

// Log structured visualization session — rate limited
export const logVisualizationSession = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    emotionalIntensity: v.number(),
    sensoryDetails: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
    try {
      const rateCheck = await checkRateLimit(ctx, "manifestationActions.logVisualizationSession");
      if (!rateCheck.allowed) {
        throw new Error(`Slow down! Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      }

      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const visualizationSessions = manifestation.visualizationSessions || [];
    const today = new Date().toISOString().split('T')[0];
    
    visualizationSessions.push({
      date: today,
      emotionalIntensity: args.emotionalIntensity,
      sensoryDetails: args.sensoryDetails.trim(),
      duration: args.duration,
      timestamp: Date.now(),
    });
    
    // Enforce size limit - keep only most recent entries
    while (visualizationSessions.length > MAX_VISUALIZATION_SESSIONS) {
      visualizationSessions.shift();
    }

    // Update visualization streak
    const now = Date.now();
    const lastVisualized = manifestation.lastVisualized || 0;
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    const streak = lastVisualized > oneDayAgo 
      ? (manifestation.visualizationStreak || 0) + 1 
      : 1;

    await ctx.db.patch(args.manifestationId, {
      visualizationSessions,
      visualizationStreak: streak,
      lastVisualized: now,
      updatedAt: now,
    });

    return streak;
    } catch (error: any) {
      if (error.message?.includes("Rate limited") || error.message?.includes("Not authenticated") || error.message?.includes("not found")) {
        throw error;
      }
      console.error("logVisualizationSession error:", error);
      throw new Error("Failed to log visualization. Please try again.");
    }
  },
});

// Add limiting belief — rate limited
export const addLimitingBelief = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    belief: v.string(),
    reframe: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    try {
      const rateCheck = await checkRateLimit(ctx, "manifestationActions.addLimitingBelief");
      if (!rateCheck.allowed) {
        throw new Error(`Slow down! Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)} seconds.`);
      }

      const user = await getCurrentUser(ctx);
      if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const limitingBeliefs = manifestation.limitingBeliefs || [];
    
    limitingBeliefs.push({
      belief: args.belief.trim(),
      reframe: args.reframe?.trim(),
      identified: Date.now(),
      resolved: false,
    });
    
    // Enforce size limit - keep only most recent entries
    while (limitingBeliefs.length > MAX_LIMITING_BELIEFS) {
      limitingBeliefs.shift();
    }

    await ctx.db.patch(args.manifestationId, {
      limitingBeliefs,
      updatedAt: Date.now(),
    });
    } catch (error: any) {
      if (error.message?.includes("Rate limited") || error.message?.includes("Not authenticated") || error.message?.includes("not found")) {
        throw error;
      }
      console.error("addLimitingBelief error:", error);
      throw new Error("Failed to add belief. Please try again.");
    }
  },
});

// Log obstacle and solution
export const logObstacle = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    obstacle: v.string(),
    solution: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const obstacles = manifestation.obstacles || [];
    const today = new Date().toISOString().split('T')[0];
    
    obstacles.push({
      date: today,
      obstacle: args.obstacle.trim(),
      solution: args.solution.trim(),
      timestamp: Date.now(),
    });
    
    // Enforce size limit - keep only most recent entries
    while (obstacles.length > MAX_OBSTACLES) {
      obstacles.shift();
    }

    await ctx.db.patch(args.manifestationId, {
      obstacles,
      updatedAt: Date.now(),
    });
  },
});

// Resolve limiting belief with reframe
export const resolveLimitingBelief = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    beliefIndex: v.number(),
    reframe: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const limitingBeliefs = manifestation.limitingBeliefs || [];
    if (args.beliefIndex >= 0 && args.beliefIndex < limitingBeliefs.length) {
      limitingBeliefs[args.beliefIndex].reframe = args.reframe.trim();
      limitingBeliefs[args.beliefIndex].resolved = true;
    }

    await ctx.db.patch(args.manifestationId, {
      limitingBeliefs,
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to add AI insights
export const addAIInsights = internalMutation({
  args: {
    manifestationId: v.id("manifestations"),
    insights: v.array(v.object({
      insight: v.string(),
      type: v.union(
        v.literal("limiting_belief"),
        v.literal("action_suggestion"),
        v.literal("pattern_recognition"),
        v.literal("encouragement")
      ),
    })),
  },
  handler: async (ctx, args) => {
    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation) return;

    const aiInsights = manifestation.aiInsights || [];
    
    args.insights.forEach(insight => {
      aiInsights.push({
        ...insight,
        timestamp: Date.now(),
      });
    });
    
    // Enforce size limit - keep only most recent entries
    while (aiInsights.length > MAX_AI_INSIGHTS) {
      aiInsights.shift();
    }

    await ctx.db.patch(args.manifestationId, {
      aiInsights,
      updatedAt: Date.now(),
    });
  },
});

// Update identity statement and pain leverage
export const updateFoundation = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    identityStatement: v.optional(v.string()),
    painLeverage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.identityStatement !== undefined) updates.identityStatement = args.identityStatement;
    if (args.painLeverage !== undefined) updates.painLeverage = args.painLeverage;

    await ctx.db.patch(args.manifestationId, updates);
  },
});