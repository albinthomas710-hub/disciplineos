import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all timetables for current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Get active timetable
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const active = await ctx.db
      .query("timetables")
      .withIndex("by_user_and_active", (q) => 
        q.eq("userId", user._id).eq("isActive", true)
      )
      .first();

    return active;
  },
});

// Get timetable by ID
export const getById = query({
  args: { id: v.id("timetables") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const timetable = await ctx.db.get(args.id);
    if (!timetable || timetable.userId !== user._id) return null;

    return timetable;
  },
});

// Create new timetable
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Deactivate all other timetables
    const existing = await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const tt of existing) {
      await ctx.db.patch(tt._id, { isActive: false });
    }

    const timetableId = await ctx.db.insert("timetables", {
      userId: user._id,
      name: args.name,
      description: args.description,
      color: args.color || "#6366f1",
      isActive: true,
    });

    // Update user's active timetable
    await ctx.db.patch(user._id, { activeTimetableId: timetableId });

    return timetableId;
  },
});

// Update timetable
export const update = mutation({
  args: {
    id: v.id("timetables"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const timetable = await ctx.db.get(args.id);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Timetable not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      description: args.description,
      color: args.color,
    });
  },
});

// Set active timetable
export const setActive = mutation({
  args: { id: v.id("timetables") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const timetable = await ctx.db.get(args.id);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Timetable not found");
    }

    // Deactivate all timetables
    const all = await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    for (const tt of all) {
      await ctx.db.patch(tt._id, { isActive: tt._id === args.id });
    }

    await ctx.db.patch(user._id, { activeTimetableId: args.id });
  },
});

// Delete timetable
export const remove = mutation({
  args: { id: v.id("timetables") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const timetable = await ctx.db.get(args.id);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Timetable not found");
    }

    // Delete all time blocks
    const blocks = await ctx.db
      .query("timeBlocks")
      .withIndex("by_timetable", (q) => q.eq("timetableId", args.id))
      .collect();

    for (const block of blocks) {
      await ctx.db.delete(block._id);
    }

    await ctx.db.delete(args.id);
  },
});
