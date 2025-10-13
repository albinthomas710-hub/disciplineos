import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Removed automatic timetable seeding - users should create their own
export const seedDefaultTimetable = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if user already has timetables
    const existing = await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    // Return existing timetable ID if found, otherwise return null
    // No longer auto-creating default timetable
    return existing ? existing._id : null;
  },
});