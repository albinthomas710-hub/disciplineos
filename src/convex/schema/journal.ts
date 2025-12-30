import { defineTable } from "convex/server";
import { v } from "convex/values";

// Daily Reflections
export const reflections = defineTable({
  userId: v.id("users"),
  date: v.string(), // YYYY-MM-DD
  didWell: v.string(),
  brokeDispline: v.string(),
  improvement: v.string(),
  focusScore: v.number(),
  outputLog: v.string(),
  dailyRating: v.number(),
  outputScore: v.optional(v.number()),
  workType: v.optional(v.string()),
  targetHours: v.optional(v.number()),
  productivityInventory: v.optional(v.array(v.object({ text: v.string(), checked: v.boolean() }))),
  improvements: v.optional(v.array(v.string())),
  callsBooked: v.optional(v.number()),
  callsConducted: v.optional(v.number()),
  callsClosed: v.optional(v.number()),
  distractions: v.optional(v.array(v.string())),
  tomorrowPlan: v.optional(v.string()), // Plan for the next day
  // Signal vs Noise - The ONE Thing tracking
  signalTasks: v.optional(v.array(v.object({
    id: v.string(),
    task: v.string(),
    importance: v.union(
      v.literal("the_one_thing"), // The needle mover
      v.literal("high_signal"),   // Critical signal
      v.literal("medium_signal"), // Important signal
      v.literal("low_signal")     // Minor signal
    ),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  noiseTasks: v.optional(v.array(v.object({
    id: v.string(),
    task: v.string(),
    importance: v.union(
      v.literal("high_noise"),   // Urgent but not important
      v.literal("low_noise")     // Neither urgent nor important
    ),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  signalCompletionRate: v.optional(v.number()), // % of signal tasks completed
  theOneThingCompleted: v.optional(v.boolean()), // Did they do THE ONE THING?
})
.index("by_user_and_date", ["userId", "date"]);

// Self-Reflection Journal
export const selfReflectionJournal = defineTable({
  userId: v.id("users"),
  date: v.string(),
  prompt: v.string(),
  response: v.string(),
  mood: v.optional(v.number()), // 1-10
  tags: v.optional(v.array(v.string())),
  isPrivate: v.boolean(),
}).index("by_user_and_date", ["userId", "date"]);

// Prayer Journal - Christian spiritual feature
export const prayers = defineTable({
  userId: v.id("users"),
  title: v.string(),
  content: v.string(),
  category: v.union(
    v.literal("gratitude"),
    v.literal("guidance"),
    v.literal("intercession"),
    v.literal("confession"),
    v.literal("praise"),
    v.literal("petition")
  ),
  isAnswered: v.boolean(),
  answeredAt: v.optional(v.number()),
  answeredNote: v.optional(v.string()),
  isFavorite: v.boolean(),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_category", ["userId", "category"])
  .index("by_user_and_answered", ["userId", "isAnswered"]);

// Bible Scriptures Collection
export const scriptures = defineTable({
  userId: v.id("users"),
  reference: v.string(), // e.g., "John 3:16"
  text: v.string(),
  translation: v.optional(v.string()), // e.g., "NIV", "KJV"
  category: v.optional(v.string()), // "faith", "hope", "love", "strength", etc.
  isFavorite: v.boolean(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_favorite", ["userId", "isFavorite"])
  .searchIndex("search_reference", {
    searchField: "reference",
    filterFields: ["userId"],
  });

// Prayer Streak Tracking
export const prayerStreaks = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  prayersCount: v.number(),
  scripturesRead: v.number(),
  completed: v.boolean(),
}).index("by_user_and_date", ["userId", "date"]);

// Monthly Goals & Notes (War Map features)
export const monthlyGoals = defineTable({
  userId: v.id("users"),
  month: v.string(), // "2025-01"
  mainObjectives: v.optional(v.string()),
  notes: v.optional(v.string()),
}).index("by_user_and_month", ["userId", "month"]);