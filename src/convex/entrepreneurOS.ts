import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ============================================
// CLIENT FEEDBACK FUNCTIONS
// ============================================

export const getAllFeedback = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const feedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return feedback.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const getFeedbackByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const feedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return feedback.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createFeedback = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    clientName: v.string(),
    clientEmail: v.optional(v.string()),
    feedbackType: v.union(
      v.literal("testimonial"),
      v.literal("feature_request"),
      v.literal("bug_report"),
      v.literal("general"),
      v.literal("complaint"),
      v.literal("praise")
    ),
    feedbackText: v.string(),
    satisfactionScore: v.number(),
    category: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priority: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    isPublicTestimonial: v.optional(v.boolean()),
    // NEW: Pain Level & Business Impact Fields
    painHours: v.optional(v.number()),
    revenueImpactType: v.optional(v.union(
      v.literal("losing_revenue"),
      v.literal("missing_opportunity"),
      v.literal("no_impact")
    )),
    revenueAmount: v.optional(v.number()),
    urgencyLevel: v.optional(v.union(
      v.literal("blocking"),
      v.literal("major_friction"),
      v.literal("nice_to_have"),
      v.literal("critical_for_renewal")
    )),
    willTestFix: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("clientFeedback", {
      userId: user._id,
      projectId: args.projectId,
      clientName: args.clientName,
      clientEmail: args.clientEmail,
      feedbackType: args.feedbackType,
      feedbackText: args.feedbackText,
      satisfactionScore: args.satisfactionScore,
      category: args.category,
      tags: args.tags,
      status: "new",
      priority: args.priority,
      isPublicTestimonial: args.isPublicTestimonial || false,
      painHours: args.painHours,
      revenueImpactType: args.revenueImpactType,
      revenueAmount: args.revenueAmount,
      urgencyLevel: args.urgencyLevel,
      willTestFix: args.willTestFix,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateFeedbackStatus = mutation({
  args: {
    feedbackId: v.id("clientFeedback"),
    status: v.union(
      v.literal("new"),
      v.literal("reviewing"),
      v.literal("planned"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("archived")
    ),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback || feedback.userId !== user._id) {
      throw new Error("Feedback not found or unauthorized");
    }

    await ctx.db.patch(args.feedbackId, {
      status: args.status,
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

export const deleteFeedback = mutation({
  args: { feedbackId: v.id("clientFeedback") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const feedback = await ctx.db.get(args.feedbackId);
    if (!feedback || feedback.userId !== user._id) {
      throw new Error("Feedback not found or unauthorized");
    }

    await ctx.db.delete(args.feedbackId);
  },
});

// ============================================
// ITERATION FUNCTIONS
// ============================================

export const getAllIterations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const iterations = await ctx.db
      .query("iterations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return iterations.sort((a, b) => b.createdAt - a.createdAt);
  },
});

export const createIteration = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    feedbackIds: v.array(v.id("clientFeedback")),
    iterationNumber: v.number(),
    title: v.string(),
    description: v.string(),
    hypothesis: v.string(),
    changes: v.array(v.object({
      change: v.string(),
      reason: v.string(),
      expectedImpact: v.string(),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("iterations", {
      userId: user._id,
      projectId: args.projectId,
      feedbackIds: args.feedbackIds,
      iterationNumber: args.iterationNumber,
      title: args.title,
      description: args.description,
      hypothesis: args.hypothesis,
      changes: args.changes,
      status: "planning",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateIteration = mutation({
  args: {
    iterationId: v.id("iterations"),
    status: v.optional(v.union(
      v.literal("planning"),
      v.literal("building"),
      v.literal("testing"),
      v.literal("launched"),
      v.literal("measuring")
    )),
    metrics: v.optional(v.object({
      beforeSatisfaction: v.optional(v.number()),
      afterSatisfaction: v.optional(v.number()),
      feedbackCount: v.optional(v.number()),
      positiveResponses: v.optional(v.number()),
      negativeResponses: v.optional(v.number()),
    })),
    learnings: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const iteration = await ctx.db.get(args.iterationId);
    if (!iteration || iteration.userId !== user._id) {
      throw new Error("Iteration not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.status) updates.status = args.status;
    if (args.metrics) updates.metrics = args.metrics;
    if (args.learnings) updates.learnings = args.learnings;

    if (args.status === "launched" && !iteration.launchedAt) {
      updates.launchedAt = Date.now();
    }
    if (args.status === "measuring" && !iteration.completedAt) {
      updates.completedAt = Date.now();
    }

    await ctx.db.patch(args.iterationId, updates);
  },
});

// ============================================
// ANALYTICS & INSIGHTS
// ============================================

export const getSatisfactionMetrics = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (allFeedback.length === 0) return null;

    const totalFeedback = allFeedback.length;
    const avgSatisfaction = allFeedback.reduce((sum, f) => sum + f.satisfactionScore, 0) / totalFeedback;
    const positiveCount = allFeedback.filter(f => f.satisfactionScore >= 8).length;
    const neutralCount = allFeedback.filter(f => f.satisfactionScore >= 5 && f.satisfactionScore < 8).length;
    const negativeCount = allFeedback.filter(f => f.satisfactionScore < 5).length;

    const testimonialCount = allFeedback.filter(f => f.feedbackType === "testimonial").length;
    const featureRequestCount = allFeedback.filter(f => f.feedbackType === "feature_request").length;
    const bugReportCount = allFeedback.filter(f => f.feedbackType === "bug_report").length;

    return {
      totalFeedback,
      averageSatisfaction: Math.round(avgSatisfaction * 10) / 10,
      positiveCount,
      neutralCount,
      negativeCount,
      testimonialCount,
      featureRequestCount,
      bugReportCount,
      positivePercentage: Math.round((positiveCount / totalFeedback) * 100),
    };
  },
});

export const createProductInsight = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    insightType: v.union(
      v.literal("pattern"),
      v.literal("opportunity"),
      v.literal("risk"),
      v.literal("win"),
      v.literal("learning")
    ),
    title: v.string(),
    description: v.string(),
    relatedFeedbackIds: v.array(v.id("clientFeedback")),
    confidence: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("productInsights", {
      userId: user._id,
      projectId: args.projectId,
      insightType: args.insightType,
      title: args.title,
      description: args.description,
      relatedFeedbackIds: args.relatedFeedbackIds,
      confidence: args.confidence,
      isArchived: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getProductInsights = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const insights = await ctx.db
      .query("productInsights")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return insights
      .filter(i => !i.isArchived)
      .sort((a, b) => b.createdAt - a.createdAt);
  },
});
