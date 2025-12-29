import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Check if user should see reflection prompt
export const shouldShowReflection = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return { shouldShow: false, reason: "not_authenticated" };

    const today = new Date().toISOString().split("T")[0];

    // Check if already reflected today
    const todayReflection = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .first();

    if (todayReflection) {
      return { shouldShow: false, reason: "already_reflected" };
    }

    // Check completion rate
    const todayLogs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).eq("date", today)
      )
      .collect();

    if (todayLogs.length === 0) {
      return { shouldShow: false, reason: "no_logs" };
    }

    const completed = todayLogs.filter(log => log.completed).length;
    const completionRate = completed / todayLogs.length;

    // Show if 80%+ completion OR after 9 PM
    const currentHour = new Date().getHours();
    const isEvening = currentHour >= 21; // 9 PM or later

    if (completionRate >= 0.8 || isEvening) {
      return { 
        shouldShow: true, 
        reason: completionRate >= 0.8 ? "high_completion" : "evening_time",
        completionRate: Math.round(completionRate * 100)
      };
    }

    return { shouldShow: false, reason: "not_ready" };
  },
});

// Mark reflection as dismissed for today
export const dismissReflection = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // Create empty reflection to mark as dismissed
    await ctx.db.insert("reflections", {
      userId: user._id,
      date: today,
      didWell: "[Skipped]",
      brokeDispline: "[Skipped]",
      improvement: "[Skipped]",
      focusScore: 0,
      outputLog: "[Skipped]",
      dailyRating: 0,
    });
  },
});