import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all memories for the user
export const getMemories = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const memories = await ctx.db
      .query("sbaMemories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return await Promise.all(
      memories.map(async (memory) => ({
        ...memory,
        displayUrl: memory.imageStorageId
          ? await ctx.storage.getUrl(memory.imageStorageId)
          : memory.imageUrl,
      }))
    );
  },
});

// Get a single memory by ID
export const getMemory = query({
  args: { id: v.id("sbaMemories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const memory = await ctx.db.get(args.id);
    if (!memory || memory.userId !== user._id) return null;

    return {
      ...memory,
      displayUrl: memory.imageStorageId
        ? await ctx.storage.getUrl(memory.imageStorageId)
        : memory.imageUrl,
    };
  },
});

// Generate upload URL for images
export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

// Create a new memory
export const createMemory = mutation({
  args: {
    title: v.string(),
    story: v.string(),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    date: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("sbaMemories", {
      userId: user._id,
      title: args.title,
      story: args.story,
      imageStorageId: args.imageStorageId,
      imageUrl: args.imageUrl,
      date: args.date,
      order: Date.now(), // Simple ordering by creation for now
    });
  },
});

// Update a memory
export const updateMemory = mutation({
  args: {
    id: v.id("sbaMemories"),
    title: v.optional(v.string()),
    story: v.optional(v.string()),
    imageStorageId: v.optional(v.id("_storage")),
    imageUrl: v.optional(v.string()),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const { id, ...updates } = args;
    await ctx.db.patch(id, updates);
  },
});

// Delete a memory
export const deleteMemory = mutation({
  args: { id: v.id("sbaMemories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.delete(args.id);
  },
});