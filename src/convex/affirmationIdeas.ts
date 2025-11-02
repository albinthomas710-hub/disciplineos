import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all affirmation ideas for current user
export const getUserIdeas = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const ideas = await ctx.db
      .query("affirmationIdeas")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return ideas.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get incomplete ideas only
export const getIncompleteIdeas = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const ideas = await ctx.db
      .query("affirmationIdeas")
      .withIndex("by_user_and_completed", (q) => 
        q.eq("userId", user._id).eq("completed", false)
      )
      .collect();

    return ideas.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new idea
export const createIdea = mutation({
  args: {
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("affirmationIdeas", {
      userId: user._id,
      content: args.content,
      completed: false,
      createdAt: Date.now(),
    });
  },
});

// Mark idea as completed (converted to full affirmation)
export const markIdeaCompleted = mutation({
  args: {
    ideaId: v.id("affirmationIdeas"),
    manifestationId: v.optional(v.id("manifestations")),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found or unauthorized");
    }

    await ctx.db.patch(args.ideaId, {
      completed: true,
      manifestationId: args.manifestationId,
    });
  },
});

// Delete an idea
export const deleteIdea = mutation({
  args: { ideaId: v.id("affirmationIdeas") },
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

// Update idea content
export const updateIdea = mutation({
  args: {
    ideaId: v.id("affirmationIdeas"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const idea = await ctx.db.get(args.ideaId);
    if (!idea || idea.userId !== user._id) {
      throw new Error("Idea not found or unauthorized");
    }

    await ctx.db.patch(args.ideaId, {
      content: args.content,
    });
  },
});
