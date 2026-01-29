import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all active sins/struggles
export const getActive = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("sinList")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();
  },
});

// Get conquered sins
export const getConquered = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("sinList")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", user._id).eq("status", "conquered")
      )
      .collect();
  },
});

// Get logs (history of relapses and confessions)
export const getLogs = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("sinLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .order("desc")
      .take(100); // Limit to last 100 entries
  },
});

// Create a new struggle to track
export const create = mutation({
  args: {
    title: v.string(),
    category: v.optional(v.string()),
    scriptureAntidote: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("sinList", {
      userId: user._id,
      title: args.title,
      category: args.category,
      scriptureAntidote: args.scriptureAntidote,
      notes: args.notes,
      status: args.status || "active",
      unconfessedCount: 0,
    });
  },
});

// Batch log relapses (for Daily Examen checklist)
export const batchLogRelapse = mutation({
  args: {
    sinIds: v.array(v.id("sinList")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    for (const sinId of args.sinIds) {
      const sin = await ctx.db.get(sinId);
      if (!sin || sin.userId !== user._id) continue;

      // Log the event
      await ctx.db.insert("sinLogs", {
        userId: user._id,
        sinId: sinId,
        date: today,
        timestamp: Date.now(),
        notes: args.notes,
        type: "relapse",
        trigger: "Daily Examen",
      });

      // Update the main record
      await ctx.db.patch(sinId, {
        lastRelapseDate: today,
        unconfessedCount: (sin.unconfessedCount || 0) + 1,
      });
    }
  },
});

// Log a relapse (fall)
export const logRelapse = mutation({
  args: {
    sinId: v.id("sinList"),
    notes: v.optional(v.string()),
    trigger: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sin = await ctx.db.get(args.sinId);
    if (!sin || sin.userId !== user._id) throw new Error("Not found");

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Log the event
    await ctx.db.insert("sinLogs", {
      userId: user._id,
      sinId: args.sinId,
      date: today,
      timestamp: Date.now(),
      notes: args.notes,
      trigger: args.trigger,
      type: "relapse",
    });

    // Update the main record
    await ctx.db.patch(args.sinId, {
      lastRelapseDate: today,
      unconfessedCount: (sin.unconfessedCount || 0) + 1,
    });
  },
});

// Mark as confessed (clears unconfessed count)
export const confess = mutation({
  args: {
    sinId: v.id("sinList"),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sin = await ctx.db.get(args.sinId);
    if (!sin || sin.userId !== user._id) throw new Error("Not found");

    const now = new Date();
    const today = now.toISOString().split("T")[0];

    // Log the confession
    await ctx.db.insert("sinLogs", {
      userId: user._id,
      sinId: args.sinId,
      date: today,
      timestamp: Date.now(),
      notes: args.notes,
      type: "confession",
    });

    // Reset count
    await ctx.db.patch(args.sinId, {
      unconfessedCount: 0,
    });
  },
});

// Mark as conquered (archive)
export const toggleStatus = mutation({
  args: { sinId: v.id("sinList") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sin = await ctx.db.get(args.sinId);
    if (!sin || sin.userId !== user._id) throw new Error("Not found");

    const newStatus = sin.status === "active" ? "conquered" : "active";
    await ctx.db.patch(args.sinId, { status: newStatus });
  },
});

// Delete
export const remove = mutation({
  args: { sinId: v.id("sinList") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const sin = await ctx.db.get(args.sinId);
    if (!sin || sin.userId !== user._id) throw new Error("Not found");

    await ctx.db.delete(args.sinId);
    // Note: We could also delete logs, but keeping them might be good for history.
    // For now, let's leave logs as orphaned or clean them up if needed.
  },
});