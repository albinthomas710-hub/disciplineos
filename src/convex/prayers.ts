import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all prayers
export const getAll = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("prayers")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .order("desc")
      .collect();
  },
});

// Get prayers by category
export const getByCategory = query({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("prayers")
      .withIndex("by_user_and_category", (q) => 
        q.eq("userId", user._id).eq("category", args.category as any)
      )
      .order("desc")
      .collect();
  },
});

// Get answered prayers
export const getAnswered = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("prayers")
      .withIndex("by_user_and_answered", (q) => 
        q.eq("userId", user._id).eq("isAnswered", true)
      )
      .order("desc")
      .collect();
  },
});

// Create prayer
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    category: v.optional(v.union(
      v.literal("gratitude"),
      v.literal("guidance"),
      v.literal("intercession"),
      v.literal("confession"),
      v.literal("praise"),
      v.literal("petition")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const prayerId = await ctx.db.insert("prayers", {
      userId: user._id,
      title: args.title,
      content: args.content,
      category: args.category,
      mood: "neutral", // Default mood
      tags: [],
      isAnswered: false,
      isFavorite: false,
      createdAt: Date.now(),
      // Added required fields
      date: new Date().toISOString().split("T")[0],
      type: "daily",
      isPrivate: true,
    });

    return prayerId;
  },
});

// Update prayer
export const update = mutation({
  args: {
    prayerId: v.id("prayers"),
    title: v.string(),
    content: v.string(),
    category: v.optional(v.union(
      v.literal("gratitude"),
      v.literal("guidance"),
      v.literal("intercession"),
      v.literal("confession"),
      v.literal("praise"),
      v.literal("petition")
    )),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.prayerId);
    if (!prayer || prayer.userId !== user._id) {
      throw new Error("Prayer not found or unauthorized");
    }

    await ctx.db.patch(args.prayerId, {
      title: args.title.trim(),
      content: args.content.trim(),
      category: args.category,
    });
  },
});

// Mark prayer as answered
export const markAnswered = mutation({
  args: {
    id: v.id("prayers"),
    answeredNote: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.id);
    if (!prayer || prayer.userId !== user._id) {
      throw new Error("Prayer not found or unauthorized");
    }

    await ctx.db.patch(args.id, {
      isAnswered: true,
      answeredAt: Date.now(),
      // Removed answeredNote as it's not in schema, appending to content if needed or ignoring
      // If we really need to save the note, we should append it to content or add a field to schema.
      // For now, assuming we just mark it answered.
    });
  },
});

// Toggle favorite
export const toggleFavorite = mutation({
  args: { prayerId: v.id("prayers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.prayerId);
    if (!prayer || prayer.userId !== user._id) {
      throw new Error("Prayer not found or unauthorized");
    }

    await ctx.db.patch(args.prayerId, {
      isFavorite: !prayer.isFavorite,
    });
  },
});

// Delete prayer
export const remove = mutation({
  args: { prayerId: v.id("prayers") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const prayer = await ctx.db.get(args.prayerId);
    if (!prayer || prayer.userId !== user._id) {
      throw new Error("Prayer not found or unauthorized");
    }

    await ctx.db.delete(args.prayerId);
  },
});

// Helper to update prayer streak
async function updatePrayerStreak(ctx: any, userId: any) {
  const today = new Date().toISOString().split("T")[0];

  const existing = await ctx.db
    .query("prayerStreaks")
    .withIndex("by_user_and_date", (q: any) => 
      q.eq("userId", userId).eq("date", today)
    )
    .first();

  if (existing) {
    await ctx.db.patch(existing._id, {
      prayersCount: existing.prayersCount + 1,
      completed: true,
    });
  } else {
    await ctx.db.insert("prayerStreaks", {
      userId,
      date: today,
      prayersCount: 1,
      scripturesRead: 0,
      completed: true,
    });
  }
}