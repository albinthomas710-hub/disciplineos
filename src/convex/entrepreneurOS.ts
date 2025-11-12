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
    clientPhone: v.optional(v.string()),
    companyName: v.optional(v.string()),
    socialLinks: v.optional(v.object({
      linkedin: v.optional(v.string()),
      twitter: v.optional(v.string()),
      website: v.optional(v.string()),
    })),
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
      clientPhone: args.clientPhone,
      companyName: args.companyName,
      socialLinks: args.socialLinks,
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
    startDate: v.optional(v.string()),
    targetShipDate: v.optional(v.string()),
    complexity: v.optional(v.number()),
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
      startDate: args.startDate,
      targetShipDate: args.targetShipDate,
      complexity: args.complexity,
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
      v.literal("measuring"),
      v.literal("shipped")
    )),
    metrics: v.optional(v.object({
      beforeSatisfaction: v.optional(v.number()),
      afterSatisfaction: v.optional(v.number()),
      feedbackCount: v.optional(v.number()),
      positiveResponses: v.optional(v.number()),
      negativeResponses: v.optional(v.number()),
    })),
    learnings: v.optional(v.string()),
    actualShipDate: v.optional(v.string()),
    targetShipDate: v.optional(v.string()),
    complexity: v.optional(v.number()),
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
    if (args.targetShipDate) updates.targetShipDate = args.targetShipDate;
    if (args.complexity) updates.complexity = args.complexity;

    // Calculate days to ship when marking as shipped
    if (args.actualShipDate) {
      updates.actualShipDate = args.actualShipDate;
      if (iteration.startDate) {
        const start = new Date(iteration.startDate);
        const actual = new Date(args.actualShipDate);
        const diffTime = Math.abs(actual.getTime() - start.getTime());
        updates.daysToShip = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

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

export const getTopProblems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Group by similar pain points (simple keyword matching)
    const problemGroups = new Map<string, Array<any>>();
    
    for (const feedback of allFeedback) {
      const text = feedback.feedbackText.toLowerCase();
      let matched = false;
      
      // Try to match with existing groups
      for (const [key, group] of problemGroups.entries()) {
        const keywords = key.split(" ");
        if (keywords.some(kw => text.includes(kw))) {
          group.push(feedback);
          matched = true;
          break;
        }
      }
      
      // Create new group if no match
      if (!matched) {
        const firstWords = text.split(" ").slice(0, 3).join(" ");
        problemGroups.set(firstWords, [feedback]);
      }
    }

    // Calculate metrics for each group
    const problems = Array.from(problemGroups.entries()).map(([key, feedbacks]) => {
      const frequency = feedbacks.length;
      const avgPainHours = feedbacks.reduce((sum, f) => sum + (f.painHours || 0), 0) / frequency;
      const totalRevenue = feedbacks.reduce((sum, f) => sum + (f.revenueAmount || 0), 0);
      const score = frequency * avgPainHours * (totalRevenue > 0 ? totalRevenue / 1000 : 1);
      
      return {
        problemKey: key,
        frequency,
        avgPainHours: Math.round(avgPainHours * 10) / 10,
        totalRevenue,
        score,
        feedbackIds: feedbacks.map(f => f._id),
        sampleText: feedbacks[0].feedbackText,
      };
    });

    return problems.sort((a, b) => b.score - a.score).slice(0, 5);
  },
});

export const getChurnRiskAlerts = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allIterations = await ctx.db
      .query("iterations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Critical renewals without iterations
    const criticalWithoutIteration = allFeedback.filter(f => 
      f.urgencyLevel === "critical_for_renewal" && 
      !allIterations.some(i => i.feedbackIds.includes(f._id))
    );

    // Low satisfaction for >30 days
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const lowSatisfactionOld = allFeedback.filter(f => 
      f.satisfactionScore < 5 && 
      f.createdAt < thirtyDaysAgo
    );

    return {
      criticalCount: criticalWithoutIteration.length,
      lowSatisfactionCount: lowSatisfactionOld.length,
      criticalFeedback: criticalWithoutIteration,
      lowSatisfactionFeedback: lowSatisfactionOld,
    };
  },
});

export const getTestimonialOpportunities = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allValidations = await ctx.db
      .query("impactValidations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // High ratings after validation
    const postIterationWins = allValidations.filter(v => v.postSatisfaction >= 8);
    
    // Praise feedback
    const praiseFeedback = allFeedback.filter(f => 
      f.feedbackType === "praise" || f.feedbackType === "testimonial"
    );

    // High satisfaction feedback
    const highSatisfaction = allFeedback.filter(f => f.satisfactionScore >= 8);

    return {
      postIterationWins: postIterationWins.length,
      praiseFeedback: praiseFeedback.length,
      highSatisfaction: highSatisfaction.length,
      totalOpportunities: postIterationWins.length + praiseFeedback.length,
      opportunities: [
        ...postIterationWins.map(v => ({ type: "post_iteration", data: v })),
        ...praiseFeedback.map(f => ({ type: "praise", data: f })),
      ],
    };
  },
});

export const getIterationEffectiveness = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const allValidations = await ctx.db
      .query("impactValidations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    if (allValidations.length === 0) {
      return {
        totalIterations: 0,
        successfulIterations: 0,
        successRate: 0,
        avgImprovement: 0,
      };
    }

    let successfulCount = 0;
    let totalImprovement = 0;

    for (const validation of allValidations) {
      const originalFeedback = allFeedback.find(f => f._id === validation.feedbackId);
      if (originalFeedback) {
        const improvement = validation.postSatisfaction - originalFeedback.satisfactionScore;
        totalImprovement += improvement;
        
        if (improvement >= 2) {
          successfulCount++;
        }
      }
    }

    return {
      totalIterations: allValidations.length,
      successfulIterations: successfulCount,
      successRate: Math.round((successfulCount / allValidations.length) * 100),
      avgImprovement: Math.round((totalImprovement / allValidations.length) * 10) / 10,
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

// ============================================
// CUSTOMER JOURNEY TIMELINE
// ============================================

export const getCustomerJourney = query({
  args: { clientName: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // Get all feedback for this customer
    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
    
    const customerFeedback = allFeedback.filter(
      f => f.clientName.toLowerCase() === args.clientName.toLowerCase()
    );

    if (customerFeedback.length === 0) return null;

    // Get all iterations linked to this customer's feedback
    const allIterations = await ctx.db
      .query("iterations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const customerFeedbackIds = customerFeedback.map(f => f._id);
    const customerIterations = allIterations.filter(iter =>
      iter.feedbackIds.some(id => customerFeedbackIds.includes(id))
    );

    // Get all validations for these iterations
    const allValidations = await ctx.db
      .query("impactValidations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const iterationIds = customerIterations.map(i => i._id);
    const customerValidations = allValidations.filter(v =>
      iterationIds.includes(v.iterationId)
    );

    // Build timeline events
    const events: Array<{
      date: number;
      type: "feedback" | "iteration" | "validation" | "signup";
      data: any;
      satisfaction?: number;
    }> = [];

    // Add signup event (first feedback date)
    const firstFeedback = customerFeedback.sort((a, b) => a.createdAt - b.createdAt)[0];
    events.push({
      date: firstFeedback.createdAt,
      type: "signup",
      data: { clientName: args.clientName },
    });

    // Add feedback events
    customerFeedback.forEach(feedback => {
      events.push({
        date: feedback.createdAt,
        type: "feedback",
        data: feedback,
        satisfaction: feedback.satisfactionScore,
      });
    });

    // Add iteration events
    customerIterations.forEach(iteration => {
      events.push({
        date: iteration.createdAt,
        type: "iteration",
        data: iteration,
      });
    });

    // Add validation events
    customerValidations.forEach(validation => {
      events.push({
        date: validation.createdAt,
        type: "validation",
        data: validation,
        satisfaction: validation.postSatisfaction,
      });
    });

    // Sort by date
    events.sort((a, b) => a.date - b.date);

    // Calculate metrics
    const satisfactionScores = events
      .filter(e => e.satisfaction !== undefined)
      .map(e => e.satisfaction!);
    
    const firstSatisfaction = satisfactionScores[0] || 0;
    const lastSatisfaction = satisfactionScores[satisfactionScores.length - 1] || 0;
    const trend = lastSatisfaction - firstSatisfaction;

    // Calculate MRR (sum of revenue amounts)
    const totalRevenue = customerFeedback.reduce(
      (sum, f) => sum + (f.revenueAmount || 0),
      0
    );

    return {
      clientName: args.clientName,
      clientEmail: firstFeedback.clientEmail,
      mrr: totalRevenue,
      customerSince: firstFeedback.createdAt,
      events,
      trend,
      firstSatisfaction,
      lastSatisfaction,
      totalFeedback: customerFeedback.length,
      totalIterations: customerIterations.length,
      status: lastSatisfaction >= 8 ? "happy" : lastSatisfaction >= 5 ? "neutral" : "at_risk",
    };
  },
});

export const getAllCustomers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const allFeedback = await ctx.db
      .query("clientFeedback")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    // Group by customer name
    const customerMap = new Map<string, any>();

    allFeedback.forEach(feedback => {
      const name = feedback.clientName;
      if (!customerMap.has(name)) {
        customerMap.set(name, {
          clientName: name,
          clientEmail: feedback.clientEmail,
          firstSeen: feedback.createdAt,
          lastSeen: feedback.createdAt,
          feedbackCount: 0,
          avgSatisfaction: 0,
          totalSatisfaction: 0,
          latestSatisfaction: feedback.satisfactionScore,
        });
      }

      const customer = customerMap.get(name)!;
      customer.feedbackCount++;
      customer.totalSatisfaction += feedback.satisfactionScore;
      customer.lastSeen = Math.max(customer.lastSeen, feedback.createdAt);
      customer.latestSatisfaction = feedback.satisfactionScore;
    });

    // Calculate averages and return
    return Array.from(customerMap.values()).map(customer => ({
      ...customer,
      avgSatisfaction: Math.round((customer.totalSatisfaction / customer.feedbackCount) * 10) / 10,
    })).sort((a, b) => b.lastSeen - a.lastSeen);
  },
});