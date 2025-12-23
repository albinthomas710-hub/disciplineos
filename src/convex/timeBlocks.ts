import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all blocks for a timetable
export const listByTimetable = query({
  args: { timetableId: v.id("timetables") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const blocks = await ctx.db
      .query("timeBlocks")
      .withIndex("by_timetable", (q) => q.eq("timetableId", args.timetableId))
      .collect();

    return blocks.sort((a, b) => a.order - b.order);
  },
});

// Create time block with overlap validation
export const create = mutation({
  args: {
    timetableId: v.id("timetables"),
    title: v.string(),
    description: v.optional(v.string()),
    startTime: v.string(),
    endTime: v.string(),
    category: v.optional(v.string()),
    order: v.number(),
    energyLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    isDeepWork: v.optional(v.boolean()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const timetable = await ctx.db.get(args.timetableId);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Timetable not found");
    }

    // New: Check for overlaps
    const blocks = await ctx.db
      .query("timeBlocks")
      .withIndex("by_timetable", (q) => q.eq("timetableId", args.timetableId))
      .collect();

    const newStart = timeToMinutes(args.startTime);
    const newEnd = timeToMinutes(args.endTime);

    for (const block of blocks) {
      const existingStart = timeToMinutes(block.startTime);
      const existingEnd = timeToMinutes(block.endTime);

      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        throw new Error(`Time block overlaps with "${block.title}" (${block.startTime}-${block.endTime})`);
      }
    }

    return await ctx.db.insert("timeBlocks", {
      timetableId: args.timetableId,
      title: args.title,
      description: args.description,
      startTime: args.startTime,
      endTime: args.endTime,
      category: args.category || "General",
      order: args.order,
      notificationEnabled: true,
      energyLevel: args.energyLevel,
      isDeepWork: args.isDeepWork,
      context: args.context,
    });
  },
});

// Update time block
export const update = mutation({
  args: {
    id: v.id("timeBlocks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    category: v.optional(v.string()),
    order: v.optional(v.number()),
    energyLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
    isDeepWork: v.optional(v.boolean()),
    context: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const block = await ctx.db.get(args.id);
    if (!block) throw new Error("Block not found");

    const timetable = await ctx.db.get(block.timetableId);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    const updateData: any = {};
    if (args.title !== undefined) updateData.title = args.title;
    if (args.description !== undefined) updateData.description = args.description;
    if (args.startTime !== undefined) updateData.startTime = args.startTime;
    if (args.endTime !== undefined) updateData.endTime = args.endTime;
    if (args.category !== undefined) updateData.category = args.category;
    if (args.order !== undefined) updateData.order = args.order;
    if (args.energyLevel !== undefined) updateData.energyLevel = args.energyLevel;
    if (args.isDeepWork !== undefined) updateData.isDeepWork = args.isDeepWork;
    if (args.context !== undefined) updateData.context = args.context;

    await ctx.db.patch(args.id, updateData);
  },
});

// Delete time block
export const remove = mutation({
  args: { id: v.id("timeBlocks") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const block = await ctx.db.get(args.id);
    if (!block) throw new Error("Block not found");

    const timetable = await ctx.db.get(block.timetableId);
    if (!timetable || timetable.userId !== user._id) {
      throw new Error("Unauthorized");
    }

    await ctx.db.delete(args.id);
  },
});

// Helper function
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}