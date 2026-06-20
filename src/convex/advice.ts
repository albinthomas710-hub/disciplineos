import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ===== ADVICE CATEGORIES =====

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const categories = await ctx.db
      .query("adviceCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
      
    return categories.filter(c => !c.isDeleted);
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
      isDeleted: false,
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

    // Soft delete all advice in this category
    const adviceList = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    const now = Date.now();

    for (const advice of adviceList) {
      await ctx.db.patch(advice._id, { isDeleted: true, deletedAt: now });
    }

    await ctx.db.patch(args.categoryId, { isDeleted: true, deletedAt: now });
  },
});

export const restoreCategory = mutation({
  args: { categoryId: v.id("adviceCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found or unauthorized");
    }

    // Restore category
    await ctx.db.patch(args.categoryId, { isDeleted: false, deletedAt: undefined });

    // Restore advice in this category that was deleted around the same time or just all deleted advice in this category
    // For simplicity, we restore all deleted advice in this category
    const adviceList = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const advice of adviceList) {
      if (advice.isDeleted) {
        await ctx.db.patch(advice._id, { isDeleted: false, deletedAt: undefined });
      }
    }
  },
});

// ===== ADVICE ENTRIES =====

export const getAdviceByCategory = query({
  args: { categoryId: v.id("adviceCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const advice = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();
      
    return advice.filter(a => !a.isDeleted);
  },
});

export const getAllAdvice = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const advice = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
      
    return advice.filter(a => !a.isDeleted);
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
      isDeleted: false,
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

    await ctx.db.patch(args.adviceId, { isDeleted: true, deletedAt: Date.now() });
  },
});

export const restoreAdvice = mutation({
  args: { adviceId: v.id("adviceLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const advice = await ctx.db.get(args.adviceId);
    if (!advice || advice.userId !== user._id) {
      throw new Error("Advice not found or unauthorized");
    }

    await ctx.db.patch(args.adviceId, { isDeleted: false, deletedAt: undefined });
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

export const getTrash = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { categories: [], advice: [] };

    const categories = await ctx.db
      .query("adviceCategories")
      .withIndex("by_user_and_deleted", (q) => q.eq("userId", user._id).eq("isDeleted", true))
      .collect();

    const advice = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_user_and_deleted", (q) => q.eq("userId", user._id).eq("isDeleted", true))
      .collect();

    return { categories, advice };
  },
});

export const permanentlyDeleteCategory = mutation({
  args: { categoryId: v.id("adviceCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== user._id) return;

    // Delete all advice in this category (even if soft deleted)
    const adviceList = await ctx.db
      .query("adviceLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const advice of adviceList) {
      await ctx.db.delete(advice._id);
    }

    await ctx.db.delete(args.categoryId);
  }
});

export const permanentlyDeleteAdvice = mutation({
  args: { adviceId: v.id("adviceLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");
    
    const advice = await ctx.db.get(args.adviceId);
    if (!advice || advice.userId !== user._id) return;

    await ctx.db.delete(args.adviceId);
  }
});