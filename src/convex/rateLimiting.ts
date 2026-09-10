import { v } from "convex/values";
import { mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Rate limiting configuration per action
 * - maxRequests: max mutations allowed in the time window
 * - windowMinutes: the time window in minutes
 */
export const RATE_LIMITS: Record<string, { maxRequests: number; windowMinutes: number }> = {
  // Completion logs — max 30 per minute (button spam protection)
  "completionLogs.markComplete": { maxRequests: 30, windowMinutes: 1 },
  // Entrepreneur actions — max 10 per minute
  "entrepreneurActions.upsertTodayAction": { maxRequests: 10, windowMinutes: 1 },
  // Manifestation actions — max 20 per minute
  "manifestationActions.logDailyActions": { maxRequests: 20, windowMinutes: 1 },
  "manifestationActions.logEvidence": { maxRequests: 10, windowMinutes: 1 },
  "manifestationActions.logVisualizationSession": { maxRequests: 10, windowMinutes: 1 },
  "manifestationActions.addLimitingBelief": { maxRequests: 10, windowMinutes: 1 },
  "manifestationActions.logObstacle": { maxRequests: 10, windowMinutes: 1 },
  // Reflections — max 10 per minute
  "reflections.upsert": { maxRequests: 10, windowMinutes: 1 },
  // Prayers — max 15 per minute
  "prayers.create": { maxRequests: 15, windowMinutes: 1 },
  // History — max 5 per minute (heavy queries)
  "history.updateDailyMetrics": { maxRequests: 5, windowMinutes: 1 },
  // Resolutions — max 10 per minute
  "resolutions.create": { maxRequests: 10, windowMinutes: 1 },
  "resolutions.logProgress": { maxRequests: 20, windowMinutes: 1 },
  // Global fallback — 60 per minute for anything not listed
  "_default": { maxRequests: 60, windowMinutes: 1 },
};

/**
 * Check if a mutation is rate-limited for this user.
 * Returns { allowed: true } or { allowed: false, retryAfterMs: number }.
 *
 * Usage in a mutation handler:
 *   const rateCheck = await checkRateLimit(ctx, "myModule.myAction");
 *   if (!rateCheck.allowed) throw new Error(`Rate limited. Try again in ${Math.ceil(rateCheck.retryAfterMs / 1000)}s`);
 */
export async function checkRateLimit(
  ctx: any,
  actionName: string,
): Promise<{ allowed: true } | { allowed: false; retryAfterMs: number }> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return { allowed: true }; // unauthenticated — let the mutation fail naturally

  const config = RATE_LIMITS[actionName] || RATE_LIMITS["_default"];
  const windowStart = Date.now() - config.windowMinutes * 60 * 1000;

  // Count recent mutations by this user for this action
  const recentLogs = await ctx.db
    .query("rateLimits")
    .withIndex("by_user_and_action", (q: any) =>
      q.eq("userId", userId)
        .eq("action", actionName)
        .gte("windowStart", windowStart)
    )
    .collect();

  if (recentLogs.length >= config.maxRequests) {
    // Find the oldest entry in the window to calculate retry time
    const oldest = recentLogs.reduce((min: number, doc: any) =>
      doc.windowStart < min ? doc.windowStart : min, Date.now());
    const retryAfterMs = oldest + config.windowMinutes * 60 * 1000 - Date.now();
    return { allowed: false, retryAfterMs: Math.max(retryAfterMs, 1000) };
  }

  // Record this mutation
  await ctx.db.insert("rateLimits", {
    userId,
    action: actionName,
    windowStart: Date.now(),
  });

  return { allowed: true };
}

/**
 * Clean up old rate limit entries (called by cron every 5 min).
 */
export const cleanup = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    const oldEntries = await ctx.db
      .query("rateLimits")
      .withIndex("by_window", (q: any) => q.lt("windowStart", fiveMinutesAgo))
      .take(100);

    for (const entry of oldEntries) {
      await ctx.db.delete(entry._id);
    }

    return oldEntries.length;
  },
});
