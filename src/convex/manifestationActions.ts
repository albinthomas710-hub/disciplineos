import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Log daily actions
export const logDailyActions = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    actions: v.array(v.string()),
  },
  handler: async (ctx, args) => {
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
  },
});

// Log evidence
export const logEvidence = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    evidence: v.string(),
  },
  handler: async (ctx, args) => {
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

    await ctx.db.patch(args.manifestationId, {
      evidenceLog,
      updatedAt: Date.now(),
    });
  },
});

// Log structured visualization session
export const logVisualizationSession = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    emotionalIntensity: v.number(),
    sensoryDetails: v.string(),
    duration: v.number(),
  },
  handler: async (ctx, args) => {
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
  },
});

// Add limiting belief
export const addLimitingBelief = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    belief: v.string(),
    reframe: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
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

    await ctx.db.patch(args.manifestationId, {
      limitingBeliefs,
      updatedAt: Date.now(),
    });
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