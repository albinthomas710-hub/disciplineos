import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all scriptures
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("scriptures")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get favorite scriptures
export const getFavorites = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("scriptures")
      .withIndex("by_user_and_favorite", (q) => 
        q.eq("userId", user._id).eq("isFavorite", true)
      )
      .order("desc")
      .collect();
  },
});

// Search scriptures by reference
export const search = query({
  args: { searchTerm: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("scriptures")
      .withSearchIndex("search_reference", (q) =>
        q.search("reference", args.searchTerm).eq("userId", user._id)
      )
      .collect();
  },
});

// Create scripture
export const create = mutation({
  args: {
    reference: v.string(),
    text: v.string(),
    translation: v.optional(v.string()),
    category: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const scriptureId = await ctx.db.insert("scriptures", {
      userId: user._id,
      reference: args.reference.trim(),
      text: args.text.trim(),
      translation: args.translation?.trim(),
      category: args.category?.trim(),
      notes: args.notes?.trim(),
      isFavorite: false,
      createdAt: Date.now(),
    });

    // Update prayer streak
    await updateScriptureStreak(ctx, user._id);

    return scriptureId;
  },
});

export const addScripture = mutation({
  args: {
    text: v.string(),
    reference: v.optional(v.string()),
    reflection: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isFavorite: v.optional(v.boolean()),
    // Removed translation
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    await ctx.db.insert("scriptures", {
      userId: user._id,
      date: today,
      text: args.text.trim(),
      reference: args.reference?.trim(),
      reflection: args.reflection?.trim(),
      tags: args.tags || [],
      isFavorite: args.isFavorite || false,
      isPrivate: true,
      // Removed translation
    });
  },
});

export const updateScripture = mutation({
  args: {
    id: v.id("scriptures"),
    text: v.string(),
    reference: v.optional(v.string()),
    reflection: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    isFavorite: v.optional(v.boolean()),
    // Removed translation
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const scripture = await ctx.db.get(args.id);
    if (!scripture || scripture.userId !== user._id) {
      throw new Error("Scripture not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      text: args.text.trim(),
      reference: args.reference?.trim(),
      reflection: args.reflection?.trim(),
      tags: args.tags || [],
      isFavorite: args.isFavorite || false,
      // Removed translation
    });
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: { scriptureId: v.id("scriptures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const scripture = await ctx.db.get(args.scriptureId);
    if (!scripture || scripture.userId !== user._id) {
      throw new Error("Scripture not found or unauthorized");
    }

    await ctx.db.patch(args.scriptureId, {
      isFavorite: !scripture.isFavorite,
    });
  },
});

// Delete scripture
export const remove = mutation({
  args: { scriptureId: v.id("scriptures") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const scripture = await ctx.db.get(args.scriptureId);
    if (!scripture || scripture.userId !== user._id) {
      throw new Error("Scripture not found or unauthorized");
    }

    await ctx.db.delete(args.scriptureId);
  },
});

// Helper to update scripture reading streak
async function updateScriptureStreak(ctx: any, userId: any) {
  const today = new Date().toISOString().split("T")[0];

  const existing = await ctx.db
    .query("prayerStreaks")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", today)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      scripturesRead: existing.scripturesRead + 1,
    });
  } else {
    await ctx.db.insert("prayerStreaks", {
      userId,
      date: today,
      prayersCount: 0,
      scripturesRead: 1,
      completed: false,
    });
  }
}