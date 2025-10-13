import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get user's emergency triggers
export const getUserTriggers = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const triggers = await ctx.db
      .query("emergencyTriggers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return triggers.sort((a, b) => a.order - b.order);
  },
});

// Add a new trigger
export const addTrigger = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    color: v.string(),
    isCritical: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existingTriggers = await ctx.db
      .query("emergencyTriggers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const maxOrder = existingTriggers.length > 0
      ? Math.max(...existingTriggers.map(t => t.order))
      : 0;

    return await ctx.db.insert("emergencyTriggers", {
      userId: user._id,
      title: args.title,
      description: args.description,
      color: args.color,
      isCritical: args.isCritical || false,
      order: maxOrder + 1,
    });
  },
});

// Update a trigger
export const updateTrigger = mutation({
  args: {
    triggerId: v.id("emergencyTriggers"),
    title: v.string(),
    description: v.string(),
    color: v.string(),
    isCritical: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const trigger = await ctx.db.get(args.triggerId);
    if (!trigger || trigger.userId !== user._id) {
      throw new Error("Trigger not found or unauthorized");
    }

    await ctx.db.patch(args.triggerId, {
      title: args.title,
      description: args.description,
      color: args.color,
      isCritical: args.isCritical || false,
    });
  },
});

// Delete a trigger
export const deleteTrigger = mutation({
  args: {
    triggerId: v.id("emergencyTriggers"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const trigger = await ctx.db.get(args.triggerId);
    if (!trigger || trigger.userId !== user._id) {
      throw new Error("Trigger not found or unauthorized");
    }

    await ctx.db.delete(args.triggerId);
  },
});

// Initialize default triggers for new users
export const initializeDefaultTriggers = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("emergencyTriggers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) return; // Already initialized

    const defaultTriggers = [
      {
        title: "YouTube Shorts After Learning",
        description: "Watching useful AI/educational videos → triggered by YT Shorts thumbnails → scrolling for hours",
        color: "from-red-500 to-orange-500",
        isCritical: false,
        order: 1,
      },
      {
        title: "Funk Music Fantasy Loop",
        description: "Listening to funk music → imagining success → experiencing fantasy for hours instead of executing",
        color: "from-purple-500 to-pink-500",
        isCritical: false,
        order: 2,
      },
      {
        title: "Kitchen Idle Time",
        description: "Wasting 30-40 mins waiting for food or overeating instead of productive waiting",
        color: "from-orange-500 to-yellow-500",
        isCritical: false,
        order: 3,
      },
      {
        title: "Instagram Reels + Funk Music",
        description: "Funk music trigger → watching reels and scrolling for hours → thinking about rich life",
        color: "from-blue-500 to-cyan-500",
        isCritical: false,
        order: 4,
      },
      {
        title: "School Thoughts (AVOID)",
        description: "Thinking about school/friends mocking/ego → useless thoughts that won't happen anyway",
        color: "from-gray-500 to-slate-500",
        isCritical: true,
        order: 5,
      },
    ];

    for (const trigger of defaultTriggers) {
      await ctx.db.insert("emergencyTriggers", {
        userId: user._id,
        ...trigger,
      });
    }
  },
});
