import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

/**
 * Simple logging utility
 */

export const logEvent = internalMutation({
  args: {
    userId: v.optional(v.id("users")),
    eventType: v.string(),
    details: v.string(),
  },
  handler: async (ctx, args) => {
    console.log(`[LOG] ${args.eventType}`, {
      userId: args.userId,
      details: args.details,
      timestamp: Date.now(),
    });
  },
});
