import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all ideas for current user
export const getUserIdeas = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return ideas.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get ideas by project
export const getIdeasByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const ideas = await ctx.db
      .query("ideas")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return ideas.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new idea
export const createIdea = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    content: v.string(),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("ideas", {
      userId: user._id,
      projectId: args.projectId,
      content: args.content,
      color: args.color || "from-yellow-200 to-yellow-300",
      completed: false,
      createdAt: Date.now(),
    });
  },
});

// Update an idea
export const updateIdea = mutation({
  args: {
    ideaId: v.id("ideas"),
    content: v.optional(v.string()),
    color: v.optional(v.string()),
    completed: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found or unauthorized");
    }

    const updates: any = {};
    if (args.content !== undefined) updates.content = args.content;
    if (args.color !== undefined) updates.color = args.color;
    if (args.completed !== undefined) updates.completed = args.completed;

    await ctx.db.patch(args.ideaId, updates);
  },
});

// Delete an idea
export const deleteIdea = mutation({
  args: { ideaId: v.id("ideas") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found or unauthorized");
    }

    await ctx.db.delete(args.ideaId);
  },
});
