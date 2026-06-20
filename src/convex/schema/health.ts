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
      duration: v.number(), // in minutes
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
      preHunger: v.number(), // 1-10 scale
      postFullness: v.number(), // 1-10 scale
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
  color: v.string(), // gradient colors like "from-red-500 to-orange-500"
  isCritical: v.boolean(),
  order: v.number(),
}).index("by_user", ["userId"]);

// Not To Do List - Track tasks/habits to AVOID
export const notToDoList = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  items: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      category: v.string(), // "distraction", "bad_habit", "time_waster", "temptation"
      description: v.optional(v.string()),
      successfullyAvoided: v.boolean(),
      importance: v.number(), // 0-100 score (how critical to avoid)
      color: v.string(), // gradient colors
      createdAt: v.number(),
      totalAvoided: v.optional(v.number()), // Track total times avoided across all days
      lastChecked: v.optional(v.number()), // Last time this item was checked
    })
  ),
  totalAvoided: v.number(),
  lastChecked: v.number(),
}).index("by_user_and_date", ["userId", "date"]);

// failureWisdom - Learn from mistakes and failures
export const failureWisdom = defineTable({
  userId: v.id("users"),
  type: v.union(
    v.literal("recurring_mistake"), // Mistakes I do frequently
    v.literal("single_lesson"),     // Learns one lesson from mistake
    v.literal("multi_lesson"),      // Learns multiple lessons from mistakes
    v.literal("external_wisdom"),   // Lessons from mistakes of others
    v.literal("titan_failures")     // Lessons from very successful people
  ),
  title: v.string(), // The mistake or concept
  description: v.string(), // Context/Details
  lessons: v.array(v.string()), // Array of lessons
  frequency: v.optional(v.string()), // For recurring
  preventionStrategy: v.optional(v.string()), // For recurring
  source: v.optional(v.string()), // For external (e.g., "Steve Jobs")
  tags: v.optional(v.array(v.string())), // Array of tags
  date: v.string(),
  relapseCount: v.optional(v.number()), // How many times repeated after logging
  lastRelapseDate: v.optional(v.string()), // When was the last time
  isFavorite: v.boolean(), // Mark important mistakes
}).index("by_user", ["userId"])
  .index("by_user_and_favorite", ["userId", "isFavorite"]);
