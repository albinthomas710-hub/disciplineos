import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ===== ADVICE CATEGORIES =====

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("adviceCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createCategory = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const categoryId = await ctx.db.insert("adviceCategories", {
      userId: user._id,
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("adviceCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found or unauthorized");
    }

    // Delete all advice in this category
    const adviceList = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const advice of adviceList) {
      await ctx.db.delete(advice._id);
    }

    await ctx.db.delete(args.categoryId);
  },
});

// ===== ADVICE ENTRIES =====

export const getAdviceByCategory = query({
  args: { categoryId: v.id("adviceCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();
  },
});

export const getAllAdvice = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("adviceLibrary")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createAdvice = mutation({
  args: {
    categoryId: v.id("adviceCategories"),
    title: v.string(),
    content: v.string(),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const adviceId = await ctx.db.insert("adviceLibrary", {
      userId: user._id,
      categoryId: args.categoryId,
      title: args.title.trim(),
      content: args.content.trim(),
      source: args.source?.trim(),
      tags: args.tags,
      isFavorite: false,
      createdAt: Date.now(),
    });

    return adviceId;
  },
});

export const updateAdvice = mutation({
  args: {
    adviceId: v.id("adviceLibrary"),
    title: v.string(),
    content: v.string(),
    source: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const advice = await ctx.db.get(args.adviceId);
    if (!advice || advice.userId !== user._id) {
      throw new Error("Advice not found or unauthorized");
    }

    await ctx.db.patch(args.adviceId, {
      title: args.title.trim(),
      content: args.content.trim(),
      source: args.source?.trim(),
      tags: args.tags,
    });
  },
});

export const deleteAdvice = mutation({
  args: { adviceId: v.id("adviceLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const advice = await ctx.db.get(args.adviceId);
    if (!advice || advice.userId !== user._id) {
      throw new Error("Advice not found or unauthorized");
    }

    await ctx.db.delete(args.adviceId);
  },
});

export const toggleFavorite = mutation({
  args: { adviceId: v.id("adviceLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const advice = await ctx.db.get(args.adviceId);
    if (!advice || advice.userId !== user._id) {
      throw new Error("Advice not found or unauthorized");
    }

    await ctx.db.patch(args.adviceId, {
      isFavorite: !advice.isFavorite,
    });
  },
});
