import { defineTable } from "convex/server";
import { v } from "convex/values";

// Daily Reflections
export const reflections = defineTable({
  userId: v.id("users"),
  date: v.string(),
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
  tomorrowPlan: v.optional(v.string()),
  signalTasks: v.optional(v.array(v.object({
    id: v.string(),
    task: v.string(),
    importance: v.union(
      v.literal("the_one_thing"),
      v.literal("high_signal"),
      v.literal("medium_signal"),
      v.literal("low_signal")
    ),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  noiseTasks: v.optional(v.array(v.object({
    id: v.string(),
    task: v.string(),
    importance: v.union(
      v.literal("high_noise"),
      v.literal("low_noise")
    ),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  signalCompletionRate: v.optional(v.number()),
  theOneThingCompleted: v.optional(v.boolean()),
})
.index("by_user_and_date", ["userId", "date"]);

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
  reference: v.string(),
  text: v.string(),
  translation: v.optional(v.string()),
  category: v.optional(v.string()),
  isFavorite: v.boolean(),
  notes: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_favorite", ["userId", "isFavorite"])
  .searchIndex("search_reference", {
    searchField: "reference",
    filterFields: ["userId"],
  });
