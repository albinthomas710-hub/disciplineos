import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { Infer, v } from "convex/values";

// default user roles. can add / remove based on the project as needed
export const ROLES = {
  ADMIN: "admin",
  USER: "user",
  MEMBER: "member",
} as const;

export const roleValidator = v.union(
  v.literal(ROLES.ADMIN),
  v.literal(ROLES.USER),
  v.literal(ROLES.MEMBER),
);
export type Role = Infer<typeof roleValidator>;

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // the users table is the default users table that is brought in by the authTables
    users: defineTable({
      name: v.optional(v.string()), // name of the user. do not remove
      image: v.optional(v.string()), // image of the user. do not remove
      email: v.optional(v.string()), // email of the user. do not remove
      emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
      isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

      role: v.optional(roleValidator), // role of the user. do not remove
      
      // DisciplineOS specific fields
      currentStreak: v.optional(v.number()),
      longestStreak: v.optional(v.number()),
      totalDaysCompleted: v.optional(v.number()),
      activeTimetableId: v.optional(v.id("timetables")),
    }).index("email", ["email"]), // index for the email. do not remove or modify

    // Timetables - different schedules (School Days, Holidays, etc)
    timetables: defineTable({
      userId: v.id("users"),
      name: v.string(), // "School Days", "Holiday Routine", etc
      description: v.optional(v.string()),
      isActive: v.boolean(),
      color: v.optional(v.string()), // gradient color theme
    })
      .index("by_user", ["userId"])
      .index("by_user_and_active", ["userId", "isActive"]),

    // Time Blocks - individual activities in a timetable
    timeBlocks: defineTable({
      timetableId: v.id("timetables"),
      title: v.string(), // "Wake Up + Stretch"
      description: v.optional(v.string()),
      startTime: v.string(), // "05:00"
      endTime: v.string(), // "05:30"
      category: v.optional(v.string()), // "Focus", "Health", "Spiritual", "Learning"
      order: v.number(), // for sorting
      notificationEnabled: v.optional(v.boolean()),
    }).index("by_timetable", ["timetableId"]),

    // Completion Logs - track daily progress
    completionLogs: defineTable({
      userId: v.id("users"),
      timetableId: v.id("timetables"),
      timeBlockId: v.id("timeBlocks"),
      date: v.string(), // "2025-01-11"
      completed: v.boolean(),
      completedAt: v.optional(v.number()),
    })
      .index("by_user_and_date", ["userId", "date"])
      .index("by_user_and_timeblock", ["userId", "timeBlockId"]),

    // Daily Reflections
    reflections: defineTable({
      userId: v.id("users"),
      date: v.string(), // "2025-01-11"
      didWell: v.string(),
      brokeDispline: v.string(),
      improvement: v.string(),
    }).index("by_user_and_date", ["userId", "date"]),

    // User Settings
    userSettings: defineTable({
      userId: v.id("users"),
      focusModeEnabled: v.optional(v.boolean()),
      soundEnabled: v.optional(v.boolean()),
      notificationsEnabled: v.optional(v.boolean()),
      theme: v.optional(v.string()), // "light", "dark", "auto"
    }).index("by_user", ["userId"]),

    // Dopamine Shield - Temptation Interceptor
    dopamineShield: defineTable({
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
    }).index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;