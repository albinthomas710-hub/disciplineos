import { v } from "convex/values";
import { query } from "./_generated/server";

// Check if a time block overlaps with existing blocks
export const checkOverlap = query({
  args: {
    timetableId: v.id("timetables"),
    startTime: v.string(),
    endTime: v.string(),
    excludeBlockId: v.optional(v.id("timeBlocks")),
  },
  handler: async (ctx, args) => {
    const blocks = await ctx.db
      .query("timeBlocks")
      .withIndex("by_timetable", (q) => q.eq("timetableId", args.timetableId))
      .collect();

    const newStart = timeToMinutes(args.startTime);
    const newEnd = timeToMinutes(args.endTime);

    for (const block of blocks) {
      // Skip the block being edited
      if (args.excludeBlockId && block._id === args.excludeBlockId) continue;

      const existingStart = timeToMinutes(block.startTime);
      const existingEnd = timeToMinutes(block.endTime);

      // Check for overlap
      if (
        (newStart >= existingStart && newStart < existingEnd) ||
        (newEnd > existingStart && newEnd <= existingEnd) ||
        (newStart <= existingStart && newEnd >= existingEnd)
      ) {
        return {
          hasOverlap: true,
          conflictingBlock: {
            title: block.title,
            startTime: block.startTime,
            endTime: block.endTime,
          },
        };
      }
    }

    return { hasOverlap: false };
  },
});

// Helper function to convert time string to minutes
function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}
