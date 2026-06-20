import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new hard deadline
export const createDeadline = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    deadline: v.string(),
    category: v.union(
      v.literal("problem_validation"),
      v.literal("solution_ship"),
      v.literal("customer_conversation"),
      v.literal("revenue_goal"),
      v.literal("learning_goal"),
      v.literal("personal_goal"),
      v.literal("other")
    ),
    linkedProblemId: v.optional(v.id("problems")),
    linkedSolutionId: v.optional(v.id("solutions")),
    priority: v.union(
      v.literal("critical"),
      v.literal("high"),
      v.literal("medium"),
      v.literal("low")
    ),
    consequenceIfMissed: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.db.insert("hardDeadlines", {
      userId,
      title: args.title,
      description: args.description,
      deadline: args.deadline,
      category: args.category,
      linkedProblemId: args.linkedProblemId,
      linkedSolutionId: args.linkedSolutionId,
      status: "active",
      priority: args.priority,
      consequenceIfMissed: args.consequenceIfMissed,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get all deadlines for user
export const getAllDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("hardDeadlines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});

// Get active deadlines sorted by date
export const getActiveDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const deadlines = await ctx.db
      .query("hardDeadlines")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    return deadlines.sort((a, b) => 
      new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
    );
  },
});

// Get overdue deadlines
export const getOverdueDeadlines = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const today = new Date().toISOString().split("T")[0];
    const deadlines = await ctx.db
      .query("hardDeadlines")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", userId).eq("status", "active")
      )
      .collect();

    return deadlines.filter(d => d.deadline < today);
  },
});

// Mark deadline as completed
export const completeDeadline = mutation({
  args: {
    deadlineId: v.id("hardDeadlines"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.deadlineId, {
      status: "completed",
      completedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Mark deadline as missed (with reason - no lying!)
export const missDeadline = mutation({
  args: {
    deadlineId: v.id("hardDeadlines"),
    missedReason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.patch(args.deadlineId, {
      status: "missed",
      missedReason: args.missedReason,
      updatedAt: Date.now(),
    });
  },
});

// Extend deadline (with honest reason)
export const extendDeadline = mutation({
  args: {
    deadlineId: v.id("hardDeadlines"),
    newDeadline: v.string(),
    extensionReason: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const deadline = await ctx.db.get(args.deadlineId);
    if (!deadline) throw new Error("Deadline not found");

    await ctx.db.patch(args.deadlineId, {
      originalDeadline: deadline.originalDeadline || deadline.deadline,
      deadline: args.newDeadline,
      extensionReason: args.extensionReason,
      status: "extended",
      updatedAt: Date.now(),
    });
  },
});

// Delete deadline
export const deleteDeadline = mutation({
  args: {
    deadlineId: v.id("hardDeadlines"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.delete(args.deadlineId);
  },
});

// Get deadline stats
export const getDeadlineStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const allDeadlines = await ctx.db
      .query("hardDeadlines")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const today = new Date().toISOString().split("T")[0];
    const active = allDeadlines.filter(d => d.status === "active");
    const overdue = active.filter(d => d.deadline < today);
    const completed = allDeadlines.filter(d => d.status === "completed");
    const missed = allDeadlines.filter(d => d.status === "missed");

    return {
      totalActive: active.length,
      totalOverdue: overdue.length,
      totalCompleted: completed.length,
      totalMissed: missed.length,
      completionRate: allDeadlines.length > 0 
        ? Math.round((completed.length / (completed.length + missed.length)) * 100) || 0
        : 0,
    };
  },
});
