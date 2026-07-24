import { defineTable } from "convex/server";
import { v } from "convex/values";

// Dopamine Shield - Temptation Interceptor
export const dopamineShield = defineTable({
  userId: v.id("users"),
  sessionId: v.string(),
  lastLearningEnd: v.union(v.number(), v.null()),
  cooldownExpiresAt: v.union(v.number(), v.null()),
  bypassAttemptsToday: v.number(),
  microChallengeHistory: v.array(
    v.object({
      type: v.string(),
      completedAt: v.number(),
      success: v.boolean(),
      content: v.optional(v.string()),
    })
  ),
  strictBlockUntil: v.union(v.number(), v.null()),
}).index("by_user", ["userId"]);

// Kitchen Micro-Reclaim & Mindful Eats
export const kitchenReclaim = defineTable({
  userId: v.id("users"),
  waitingSessions: v.array(
    v.object({
      startTime: v.number(),
      duration: v.number(),
      activityChosen: v.union(
        v.literal("micro-task"),
        v.literal("learning"),
        v.literal("movement")
      ),
      completed: v.boolean(),
      endTime: v.number(),
    })
  ),
  mindfulMeals: v.array(
    v.object({
      date: v.string(),
      timestamp: v.number(),
      preHunger: v.number(),
      postFullness: v.number(),
      overate: v.boolean(),
      notes: v.optional(v.string()),
    })
  ),
  weeklyStats: v.object({
    minutesReclaimed: v.number(),
    mindfulMealCount: v.number(),
    overeatCount: v.number(),
  }),
}).index("by_user", ["userId"]);

// Emergency Triggers - user-defined temptation triggers
export const emergencyTriggers = defineTable({
  userId: v.id("users"),
  title: v.string(),
  description: v.string(),
  color: v.string(),
  isCritical: v.boolean(),
  order: v.number(),
}).index("by_user", ["userId"]);
