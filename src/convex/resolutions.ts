import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all active resolutions
export const get = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const resolutions = await ctx.db
      .query("resolutions")
      .withIndex("by_user_and_active", (q) => 
        q.eq("userId", user._id).eq("active", true)
      )
      .collect();

    // Sort: Build first, then Break
    return resolutions.sort((a, b) => {
      if (a.type === b.type) return 0;
      return a.type === "build" ? -1 : 1;
    });
  },
});

// Get logs for a specific date range or all logs for active resolutions
// For simplicity, let's fetch logs for the current month for the dashboard
export const getLogs = query({
  args: { 
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(),   // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    // This might be heavy if range is large, but for a month it's fine
    // We can optimize by querying by resolution if needed, but getting all user logs in range is better for heatmap
    // Since we don't have a range index on date easily without more complex queries, 
    // we'll fetch by user and date for each day or just fetch all recent logs.
    
    // Better approach: Fetch all logs for the user and filter in memory for the view 
    // (assuming < 1000 logs per month/year active use)
    // Or just fetch last 365 days.
    
    const logs = await ctx.db
      .query("resolutionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    return logs;
  },
});

// Create a new resolution
export const create = mutation({
  args: {
    title: v.string(),
    type: v.string(), // "build" | "break"
    description: v.optional(v.string()),
    why: v.optional(v.string()),
    consequences: v.optional(v.string()),
    icon: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    return await ctx.db.insert("resolutions", {
      userId: user._id,
      title: args.title,
      type: args.type,
      description: args.description,
      why: args.why,
      consequences: args.consequences,
      icon: args.icon,
      color: args.color,
      active: true,
      startDate: today,
    });
  },
});

// Log daily progress
export const logProgress = mutation({
  args: {
    resolutionId: v.id("resolutions"),
    date: v.string(),
    status: v.string(), // "success" | "failure" | "skip"
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if log exists
    const existing = await ctx.db
      .query("resolutionLogs")
      .withIndex("by_user_resolution_date", (q) => 
        q.eq("userId", user._id)
         .eq("resolutionId", args.resolutionId)
         .eq("date", args.date)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        status: args.status,
        notes: args.notes,
      });
    } else {
      await ctx.db.insert("resolutionLogs", {
        userId: user._id,
        resolutionId: args.resolutionId,
        date: args.date,
        status: args.status,
        notes: args.notes,
      });
    }
  },
});

// Archive/Delete resolution
export const archive = mutation({
  args: { resolutionId: v.id("resolutions") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    await ctx.db.patch(args.resolutionId, {
      active: false,
      archived: true,
    });
  },
});
