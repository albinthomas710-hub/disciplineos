import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// ===== VIDEO CATEGORIES =====

export const getAllCategories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("videoCategories")
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
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const categoryId = await ctx.db.insert("videoCategories", {
      userId: user._id,
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color,
      icon: args.icon,
      createdAt: Date.now(),
    });

    return categoryId;
  },
});

export const deleteCategory = mutation({
  args: { categoryId: v.id("videoCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found or unauthorized");
    }

    // Delete all videos in this category
    const videos = await ctx.db
      .query("videoLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .collect();

    for (const video of videos) {
      await ctx.db.delete(video._id);
    }

    await ctx.db.delete(args.categoryId);
  },
});

export const updateCategory = mutation({
  args: {
    categoryId: v.id("videoCategories"),
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.categoryId);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found or unauthorized");
    }

    await ctx.db.patch(args.categoryId, {
      name: args.name.trim(),
      description: args.description?.trim(),
      color: args.color,
    });
  },
});

// ===== VIDEOS =====

export const getVideosByCategory = query({
  args: { categoryId: v.id("videoCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("videoLibrary")
      .withIndex("by_category", (q) => q.eq("categoryId", args.categoryId))
      .order("desc")
      .collect();
  },
});

export const getAllVideos = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("videoLibrary")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

export const createVideo = mutation({
  args: {
    categoryId: v.id("videoCategories"),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const videoId = await ctx.db.insert("videoLibrary", {
      userId: user._id,
      categoryId: args.categoryId,
      title: args.title.trim(),
      url: args.url.trim(),
      description: args.description?.trim(),
      notes: args.notes?.trim(),
      isFavorite: false,
      createdAt: Date.now(),
    });

    return videoId;
  },
});

export const deleteVideo = mutation({
  args: { videoId: v.id("videoLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.userId !== user._id) {
      throw new Error("Video not found or unauthorized");
    }

    await ctx.db.delete(args.videoId);
  },
});

export const toggleFavorite = mutation({
  args: { videoId: v.id("videoLibrary") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.userId !== user._id) {
      throw new Error("Video not found or unauthorized");
    }

    await ctx.db.patch(args.videoId, {
      isFavorite: !video.isFavorite,
    });
  },
});

export const updateVideo = mutation({
  args: {
    videoId: v.id("videoLibrary"),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const video = await ctx.db.get(args.videoId);
    if (!video || video.userId !== user._id) {
      throw new Error("Video not found or unauthorized");
    }

    await ctx.db.patch(args.videoId, {
      title: args.title.trim(),
      url: args.url.trim(),
      description: args.description?.trim(),
      notes: args.notes?.trim(),
    });
  },
});