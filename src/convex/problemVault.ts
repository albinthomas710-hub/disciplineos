import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ============================================
// PROBLEMS
// ============================================

export const createProblem = mutation({
  args: {
    problemTitle: v.string(),
    problemDescription: v.string(),
    problemCategory: v.union(
      v.literal("big_10m_plus"),
      v.literal("roi_focus"),
      v.literal("small_win"),
      v.literal("people_pay_for")
    ),
    dollarValue: v.number(),
    painLevel: v.number(),
    discoverySource: v.union(
      v.literal("customer_interview"),
      v.literal("market_research"),
      v.literal("personal_experience"),
      v.literal("competitor_analysis"),
      v.literal("industry_report"),
      v.literal("reddit"),
      v.literal("g2_reviews"),
      v.literal("facebook_groups"),
      v.literal("trustpilot"),
      v.literal("forum_mining")
    ),
    discoveredDate: v.string(),
    customerName: v.optional(v.string()),
    industry: v.optional(v.string()),
    status: v.union(
      v.literal("discovered"),
      v.literal("researching"),
      v.literal("building_solution"),
      v.literal("testing"),
      v.literal("validated"),
      v.literal("shelved")
    ),
    peopleWhoHaveThis: v.number(),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    projectId: v.optional(v.id("projects")),
    // NEW: Pain/Urgency/Cost Framework
    isPainful: v.optional(v.boolean()),
    isUrgent: v.optional(v.boolean()),
    isCostly: v.optional(v.boolean()),
    is8020Focus: v.optional(v.boolean()),
    // NEW: Deadline Tracking
    validationDeadline: v.optional(v.string()),
    solutionDeadline: v.optional(v.string()),
    deadlineNotes: v.optional(v.string()),
    // NEW: Pain Point Mining
    sourceUrl: v.optional(v.string()),
    sourceType: v.optional(v.string()),
    miningNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const priorityScore = args.dollarValue * args.painLevel * args.peopleWhoHaveThis;

    return await ctx.db.insert("problems", {
      userId: user._id,
      projectId: args.projectId,
      problemTitle: args.problemTitle,
      problemDescription: args.problemDescription,
      problemCategory: args.problemCategory,
      dollarValue: args.dollarValue,
      painLevel: args.painLevel,
      discoverySource: args.discoverySource,
      discoveredDate: args.discoveredDate,
      customerName: args.customerName,
      industry: args.industry,
      status: args.status,
      peopleWhoHaveThis: args.peopleWhoHaveThis,
      priorityScore,
      notes: args.notes,
      tags: args.tags,
      isPainful: args.isPainful,
      isUrgent: args.isUrgent,
      isCostly: args.isCostly,
      is8020Focus: args.is8020Focus,
      validationDeadline: args.validationDeadline,
      solutionDeadline: args.solutionDeadline,
      deadlineNotes: args.deadlineNotes,
      sourceUrl: args.sourceUrl,
      sourceType: args.sourceType,
      miningNotes: args.miningNotes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateProblem = mutation({
  args: {
    problemId: v.id("problems"),
    problemTitle: v.optional(v.string()),
    problemDescription: v.optional(v.string()),
    problemCategory: v.optional(v.union(
      v.literal("big_10m_plus"),
      v.literal("roi_focus"),
      v.literal("small_win"),
      v.literal("people_pay_for")
    )),
    dollarValue: v.optional(v.number()),
    painLevel: v.optional(v.number()),
    discoverySource: v.optional(v.union(
      v.literal("customer_interview"),
      v.literal("market_research"),
      v.literal("personal_experience"),
      v.literal("competitor_analysis"),
      v.literal("industry_report")
    )),
    discoveredDate: v.optional(v.string()),
    customerName: v.optional(v.string()),
    industry: v.optional(v.string()),
    status: v.optional(v.union(
      v.literal("discovered"),
      v.literal("researching"),
      v.literal("building_solution"),
      v.literal("testing"),
      v.literal("validated"),
      v.literal("shelved")
    )),
    peopleWhoHaveThis: v.optional(v.number()),
    notes: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const problem = await ctx.db.get(args.problemId);
    if (!problem || problem.userId !== user._id) {
      throw new Error("Problem not found");
    }

    const updates: any = { updatedAt: Date.now() };
    
    if (args.problemTitle !== undefined) updates.problemTitle = args.problemTitle;
    if (args.problemDescription !== undefined) updates.problemDescription = args.problemDescription;
    if (args.problemCategory !== undefined) updates.problemCategory = args.problemCategory;
    if (args.dollarValue !== undefined) updates.dollarValue = args.dollarValue;
    if (args.painLevel !== undefined) updates.painLevel = args.painLevel;
    if (args.discoverySource !== undefined) updates.discoverySource = args.discoverySource;
    if (args.discoveredDate !== undefined) updates.discoveredDate = args.discoveredDate;
    if (args.customerName !== undefined) updates.customerName = args.customerName;
    if (args.industry !== undefined) updates.industry = args.industry;
    if (args.status !== undefined) updates.status = args.status;
    if (args.peopleWhoHaveThis !== undefined) updates.peopleWhoHaveThis = args.peopleWhoHaveThis;
    if (args.notes !== undefined) updates.notes = args.notes;
    if (args.tags !== undefined) updates.tags = args.tags;

    // Recalculate priority score if relevant fields changed
    if (args.dollarValue !== undefined || args.painLevel !== undefined || args.peopleWhoHaveThis !== undefined) {
      const dollarValue = args.dollarValue ?? problem.dollarValue;
      const painLevel = args.painLevel ?? problem.painLevel;
      const peopleWhoHaveThis = args.peopleWhoHaveThis ?? problem.peopleWhoHaveThis;
      updates.priorityScore = dollarValue * painLevel * peopleWhoHaveThis;
    }

    await ctx.db.patch(args.problemId, updates);
  },
});

export const deleteProblem = mutation({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const problem = await ctx.db.get(args.problemId);
    if (!problem || problem.userId !== user._id) {
      throw new Error("Problem not found");
    }

    await ctx.db.delete(args.problemId);
  },
});

export const getAllProblems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return problems.sort((a, b) => b.priorityScore - a.priorityScore);
  },
});

export const getProblemsByCategory = query({
  args: {
    category: v.union(
      v.literal("big_10m_plus"),
      v.literal("roi_focus"),
      v.literal("small_win"),
      v.literal("people_pay_for")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", user._id).eq("problemCategory", args.category)
      )
      .collect();

    return problems.sort((a, b) => b.priorityScore - a.priorityScore);
  },
});

export const getProblemStats = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const solutions = await ctx.db
      .query("solutions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return {
      totalProblems: problems.length,
      bigOpportunities: problems.filter(p => p.problemCategory === "big_10m_plus").length,
      roiFocusProblems: problems.filter(p => p.problemCategory === "roi_focus").length,
      problemsValidated: problems.filter(p => p.status === "validated").length,
      solutionsShipped: solutions.filter(s => s.status === "shipped" || s.status === "validated").length,
      // NEW: 80/20 Focus Stats
      focus8020Problems: problems.filter(p => p.is8020Focus === true).length,
      painfulUrgentCostly: problems.filter(p => p.isPainful && p.isUrgent && p.isCostly).length,
      problemsWithDeadlines: problems.filter(p => p.validationDeadline || p.solutionDeadline).length,
      minedProblems: problems.filter(p => p.sourceUrl).length,
    };
  },
});

// NEW: Get 80/20 Focus Problems
export const get8020FocusProblems = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const problems = await ctx.db
      .query("problems")
      .withIndex("by_user_and_8020", (q) => q.eq("userId", user._id).eq("is8020Focus", true))
      .collect();

    return problems.sort((a, b) => b.priorityScore - a.priorityScore);
  },
});

// ============================================
// SOLUTIONS
// ============================================

export const createSolution = mutation({
  args: {
    problemId: v.id("problems"),
    solutionTitle: v.string(),
    solutionDescription: v.string(),
    hypothesis: v.string(),
    expectedOutcome: v.string(),
    buildComplexity: v.number(),
    timeToBuild: v.optional(v.number()),
    dateStarted: v.optional(v.string()),
    status: v.union(
      v.literal("idea"),
      v.literal("building"),
      v.literal("testing"),
      v.literal("shipped"),
      v.literal("validated"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("solutions", {
      userId: user._id,
      problemId: args.problemId,
      solutionTitle: args.solutionTitle,
      solutionDescription: args.solutionDescription,
      hypothesis: args.hypothesis,
      expectedOutcome: args.expectedOutcome,
      buildComplexity: args.buildComplexity,
      timeToBuild: args.timeToBuild,
      dateStarted: args.dateStarted,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getSolutionsForProblem = query({
  args: { problemId: v.id("problems") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("solutions")
      .withIndex("by_problem", (q) => q.eq("problemId", args.problemId))
      .collect();
  },
});

export const getAllSolutions = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const solutions = await ctx.db
      .query("solutions")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return solutions.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ============================================
// CUSTOMER LEARNINGS
// ============================================

export const createCustomerLearning = mutation({
  args: {
    date: v.string(),
    customerName: v.string(),
    conversationType: v.union(
      v.literal("discovery_call"),
      v.literal("interview"),
      v.literal("feedback_session"),
      v.literal("support"),
      v.literal("casual")
    ),
    problemsDiscovered: v.string(),
    exactQuotes: v.optional(v.string()),
    painPoints: v.array(v.string()),
    dollarImpact: v.optional(v.number()),
    industryInsights: v.optional(v.string()),
    marketInsights: v.optional(v.string()),
    linkedProblemIds: v.optional(v.array(v.id("problems"))),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("customerLearnings", {
      userId: user._id,
      date: args.date,
      customerName: args.customerName,
      conversationType: args.conversationType,
      problemsDiscovered: args.problemsDiscovered,
      exactQuotes: args.exactQuotes,
      painPoints: args.painPoints,
      dollarImpact: args.dollarImpact,
      industryInsights: args.industryInsights,
      marketInsights: args.marketInsights,
      linkedProblemIds: args.linkedProblemIds,
      createdAt: Date.now(),
    });
  },
});

export const getAllCustomerLearnings = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const learnings = await ctx.db
      .query("customerLearnings")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return learnings.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ============================================
// PIVOT LOG
// ============================================

export const createPivot = mutation({
  args: {
    pivotDate: v.string(),
    pivotType: v.union(
      v.literal("niche_change"),
      v.literal("industry_change"),
      v.literal("product_change"),
      v.literal("business_model_change"),
      v.literal("target_customer_change")
    ),
    fromWhat: v.string(),
    toWhat: v.string(),
    whyPivoting: v.string(),
    trigger: v.union(
      v.literal("customer_insight"),
      v.literal("market_research"),
      v.literal("technology_wave"),
      v.literal("opportunity"),
      v.literal("failed_hypothesis"),
      v.literal("competition")
    ),
    evidence: v.string(),
    expectedImpact: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("pivotLog", {
      userId: user._id,
      pivotDate: args.pivotDate,
      pivotType: args.pivotType,
      fromWhat: args.fromWhat,
      toWhat: args.toWhat,
      whyPivoting: args.whyPivoting,
      trigger: args.trigger,
      evidence: args.evidence,
      expectedImpact: args.expectedImpact,
      createdAt: Date.now(),
    });
  },
});

export const getAllPivots = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const pivots = await ctx.db
      .query("pivotLog")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return pivots.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// ============================================
// FAILURES VAULT
// ============================================

export const createFailure = mutation({
  args: {
    failureDate: v.string(),
    whatFailed: v.string(),
    problemId: v.optional(v.id("problems")),
    solutionId: v.optional(v.id("solutions")),
    whyItFailed: v.string(),
    costOfFailure: v.optional(v.number()),
    lessonLearned: v.string(),
    whatToDoDifferently: v.string(),
    patternCategory: v.union(
      v.literal("wrong_problem"),
      v.literal("wrong_solution"),
      v.literal("wrong_timing"),
      v.literal("wrong_customer"),
      v.literal("wrong_niche"),
      v.literal("poor_execution")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("failuresVault", {
      userId: user._id,
      failureDate: args.failureDate,
      whatFailed: args.whatFailed,
      problemId: args.problemId,
      solutionId: args.solutionId,
      whyItFailed: args.whyItFailed,
      costOfFailure: args.costOfFailure,
      lessonLearned: args.lessonLearned,
      whatToDoDifferently: args.whatToDoDifferently,
      patternCategory: args.patternCategory,
      createdAt: Date.now(),
    });
  },
});

export const getAllFailures = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const failures = await ctx.db
      .query("failuresVault")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return failures.sort((a, b) => b.createdAt - a.createdAt);
  },
});