import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all holy videos
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("holyVideos")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get favorite videos
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("holyVideos")
      .withIndex("by_user_and_favorite", (q) => 
        q.eq("userId", user._id).eq("isFavorite", true)
      )
      .order("desc")
      .collect();
  },
});

// Create video entry
export const create = mutation({
  args: {
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    speaker: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const videoId = await ctx.db.insert("holyVideos", {
      userId: user._id,
      title: args.title.trim(),
      url: args.url.trim(),
      description: args.description?.trim(),
      category: args.category?.trim(),
      speaker: args.speaker?.trim(),
      notes: args.notes?.trim(),
      isFavorite: false,
      createdAt: Date.now(),
    });

    return videoId;
  },
});

// Update video entry
export const update = mutation({
  args: {
    videoId: v.id("holyVideos"),
    title: v.string(),
    url: v.string(),
    description: v.optional(v.string()),
    category: v.optional(v.string()),
    speaker: v.optional(v.string()),
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
      category: args.category?.trim(),
      speaker: args.speaker?.trim(),
      notes: args.notes?.trim(),
    });
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: { videoId: v.id("holyVideos") },
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

// Delete video
export const remove = mutation({
  args: { videoId: v.id("holyVideos") },
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
