import { defineTable } from "convex/server";
import { v } from "convex/values";

// Timetables - different schedules (School Days, Holidays, etc)
export const timetables = defineTable({
  userId: v.id("users"),
  name: v.string(), // "School Days", "Holiday Routine", etc
  description: v.optional(v.string()),
  isActive: v.boolean(),
  color: v.optional(v.string()), // gradient color theme
})
  .index("by_user", ["userId"])
  .index("by_user_and_active", ["userId", "isActive"]);

// Daily Timetable Overrides - Explicitly set which timetable applies to a specific date
export const dailyTimetableOverrides = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  timetableId: v.id("timetables"),
})
  .index("by_user_and_date", ["userId", "date"]);

// Time Blocks - individual activities in a timetable
export const timeBlocks = defineTable({
  timetableId: v.id("timetables"),
  title: v.string(), // "Wake Up + Stretch"
  description: v.optional(v.string()),
  startTime: v.string(), // "05:00"
  endTime: v.string(), // "05:30"
  category: v.optional(v.string()), // "Focus", "Health", "Spiritual", "Learning"
  order: v.number(), // for sorting
  notificationEnabled: v.optional(v.boolean()),
  // CEO / High-Performance Fields
  energyLevel: v.optional(v.union(v.literal("high"), v.literal("medium"), v.literal("low"))),
  isDeepWork: v.optional(v.boolean()),
  context: v.optional(v.string()), // "Office", "Home", "Commute", "Gym"
}).index("by_timetable", ["timetableId"]);

// Completion Logs - track daily progress
export const completionLogs = defineTable({
  userId: v.id("users"),
  timetableId: v.id("timetables"),
  timeBlockId: v.id("timeBlocks"),
  date: v.string(), // "2025-01-11"
  completed: v.boolean(),
  completedAt: v.optional(v.number()),
})
  .index("by_user_and_date", ["userId", "date"])
  .index("by_user_and_timeblock", ["userId", "timeBlockId"]);

// Vectal - Daily Task Tracking
export const vectal = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  tasks: v.array(
    v.object({
      id: v.string(),
      title: v.string(),
      completed: v.boolean(),
      importance: v.number(), // 0-100 score
      isRecurring: v.boolean(), // true for recurring, false for date-specific
      recurringPattern: v.optional(v.string()), // "every day", "every Monday", "every month", etc.
      dueDate: v.optional(v.string()), // for date-specific tasks
    })
  ),
  allCompleted: v.boolean(),
  lastChecked: v.number(),
}).index("by_user_and_date", ["userId", "date"]);

// Custom Categories - user-defined time block categories
export const customCategories = defineTable({
  userId: v.id("users"),
  name: v.string(),
  color: v.string(), // gradient colors like "from-blue-500 to-cyan-500"
  glowColor: v.string(), // rgba color for glow effect
}).index("by_user", ["userId"]);

// Calendar Tags - User defined tags for days
export const calendarTags = defineTable({
  userId: v.id("users"),
  label: v.string(),
  color: v.string(),
}).index("by_user", ["userId"]);

// Day Tags - Assigning tags to specific dates
export const dayTags = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  tagId: v.id("calendarTags"),
}).index("by_user_and_date", ["userId", "date"]);
