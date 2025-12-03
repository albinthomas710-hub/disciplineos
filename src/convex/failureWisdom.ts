import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createEntry = mutation({
  args: {
    type: v.union(
      v.literal("recurring_mistake"),
      v.literal("single_lesson"),
      v.literal("multi_lesson"),
      v.literal("external_wisdom")
    ),
    title: v.string(),
    description: v.string(),
    lessons: v.array(v.string()),
    frequency: v.optional(v.string()),
    preventionStrategy: v.optional(v.string()),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    await ctx.db.insert("failureWisdom", {
      userId,
      ...args,
    });
  },
});

export const updateEntry = mutation({
  args: {
    id: v.id("failureWisdom"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    lessons: v.optional(v.array(v.string())),
    frequency: v.optional(v.string()),
    preventionStrategy: v.optional(v.string()),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const { id, ...updates } = args;
    const existing = await ctx.db.get(id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }

    await ctx.db.patch(id, updates);
  },
});

export const deleteEntry = mutation({
  args: { id: v.id("failureWisdom") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Unauthorized");

    const existing = await ctx.db.get(args.id);
    if (!existing || existing.userId !== userId) {
      throw new Error("Unauthorized or not found");
    }

    await ctx.db.delete(args.id);
  },
});

export const getEntries = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("failureWisdom")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .collect();
  },
});
