import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ============================================
// IMPACT VALIDATION FUNCTIONS
// ============================================

export const createValidation = mutation({
  args: {
    iterationId: v.id("iterations"),
    feedbackId: v.id("clientFeedback"),
    problemSolved: v.union(
      v.literal("yes_confirmed"),
      v.literal("no_still_issues"),
      v.literal("not_tested_yet")
    ),
    postSatisfaction: v.number(),
    timeSaved: v.optional(v.number()),
    revenueGained: v.optional(v.number()),
    iterationFailed: v.boolean(),
    customerQuote: v.optional(v.string()),
    nextAction: v.union(
      v.literal("mark_resolved"),
      v.literal("needs_additional_iteration"),
      v.literal("request_case_study")
    ),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Verify iteration belongs to user
    const iteration = await ctx.db.get(args.iterationId);
    if (!iteration || iteration.userId !== user._id) {
      throw new Error("Iteration not found or unauthorized");
    }

    return await ctx.db.insert("impactValidations", {
      userId: user._id,
      iterationId: args.iterationId,
      feedbackId: args.feedbackId,
      problemSolved: args.problemSolved,
      postSatisfaction: args.postSatisfaction,
      timeSaved: args.timeSaved,
      revenueGained: args.revenueGained,
      iterationFailed: args.iterationFailed,
      customerQuote: args.customerQuote,
      nextAction: args.nextAction,
      validatedAt: Date.now(),
      createdAt: Date.now(),
    });
  },
});

export const getValidationsByIteration = query({
  args: { iterationId: v.id("iterations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("impactValidations")
      .withIndex("by_iteration", (q) => q.eq("iterationId", args.iterationId))
      .collect();
  },
});

export const getValidationsByFeedback = query({
  args: { feedbackId: v.id("clientFeedback") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("impactValidations")
      .withIndex("by_feedback", (q) => q.eq("feedbackId", args.feedbackId))
      .collect();
  },
});

export const getAllValidations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("impactValidations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});
