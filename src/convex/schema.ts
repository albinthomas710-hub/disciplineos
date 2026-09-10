import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { ROLES, roleValidator } from "./schema/validators";
import { users, userSettings } from "./schema/users";
import { timetables, dailyTimetableOverrides, timeBlocks, completionLogs, customCategories, calendarTags, dayTags } from "./schema/productivity";
import { reflections, prayers, scriptures } from "./schema/journal";
import { clientFeedback, iterations, impactValidations, satisfactionMetrics, entrepreneurActions, weeklyReviews, productInsights } from "./schema/entrepreneur";
import { manifestations, realityAnchor, affirmationIdeas, ideas } from "./schema/manifestation";
import { quotes, legendProfiles, quoteChains, projects, notes, holyVideos, videoCategories, videoLibrary, adviceCategories, adviceLibrary } from "./schema/content";
import { dopamineShield, kitchenReclaim, emergencyTriggers } from "./schema/health";

// Export validators for use in other files
export { ROLES, roleValidator };
export type { Role } from "./schema/validators";

const schema = defineSchema(
  {
    // default auth tables using convex auth.
    ...authTables, // do not remove or modify

    // Users
    users,
    userSettings,

    // Productivity
    timetables,
    dailyTimetableOverrides,
    timeBlocks,
    completionLogs,
    customCategories,
    calendarTags,
    dayTags,

    // Journal & Reflection

    reflections: defineTable({
      userId: v.id("users"),
      date: v.string(),
      type: v.string(), // "daily", "weekly", "monthly"
      answers: v.any(), // Flexible object for different reflection types
      score: v.optional(v.number()),
      // Extended fields for history tracking
      dailyRating: v.optional(v.number()),
      focusScore: v.optional(v.number()),
      outputLog: v.optional(v.string()),
      outputScore: v.optional(v.number()),
      workType: v.optional(v.string()),
      targetHours: v.optional(v.number()),
      productivityInventory: v.optional(v.any()),
      improvements: v.optional(v.any()),
      callsBooked: v.optional(v.number()),
      callsConducted: v.optional(v.number()),
      callsClosed: v.optional(v.number()),
      distractions: v.optional(v.any()),
      tomorrowPlan: v.optional(v.string()),
      signalTasks: v.optional(v.any()),
      noiseTasks: v.optional(v.any()),
      signalCompletionRate: v.optional(v.number()),
      theOneThingCompleted: v.optional(v.boolean()),
      didWell: v.optional(v.string()),
      brokeDispline: v.optional(v.string()),
    }).index("by_user_and_date", ["userId", "date"]),



    prayers: defineTable({
      userId: v.id("users"),
      date: v.string(),
      type: v.string(), // "daily", "weekly", "monthly"
      content: v.string(),
      mood: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPrivate: v.boolean(),
      title: v.optional(v.string()),
      isAnswered: v.optional(v.boolean()),
      isFavorite: v.optional(v.boolean()),
      category: v.optional(v.string()),
      createdAt: v.optional(v.number()),
      answeredAt: v.optional(v.number()),
    }).index("by_user_and_date", ["userId", "date"])
      .index("by_user", ["userId"])
      .index("by_user_and_category", ["userId", "category"])
      .index("by_user_and_answered", ["userId", "isAnswered"]),

    scriptures: defineTable({
      userId: v.id("users"),
      date: v.string(),
      text: v.string(),
      reflection: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPrivate: v.boolean(),
      reference: v.optional(v.string()),
      isFavorite: v.optional(v.boolean()),
    }).index("by_user_and_date", ["userId", "date"])
      .index("by_user", ["userId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"])
      .searchIndex("search_reference", {
        searchField: "reference",
        filterFields: ["userId"],
      }),



    // Entrepreneur OS
    clientFeedback,
    iterations,
    impactValidations,
    satisfactionMetrics,
    entrepreneurActions,
    weeklyReviews,
    productInsights,

    // Manifestation & Vision
    manifestations,
    realityAnchor,
    affirmationIdeas,
    ideas,

    // Content & Library
    quotes,
    legendProfiles,
    quoteChains,
    projects,
    notes,
    holyVideos,
    videoCategories,
    videoLibrary,
    adviceCategories,
    adviceLibrary,

    // Health & Habits
    dopamineShield,
    kitchenReclaim,
    emergencyTriggers,
    


    // New Year Resolutions / Habits
    resolutions: defineTable({
      userId: v.id("users"),
      title: v.string(),
      type: v.string(), // "build" (good) | "break" (bad)
      description: v.optional(v.string()),
      why: v.optional(v.string()), // The deep psychological driver
      consequences: v.optional(v.string()), // The cost of failure
      icon: v.optional(v.string()),
      color: v.optional(v.string()),
      active: v.boolean(),
      startDate: v.string(),
      archived: v.optional(v.boolean()),
    }).index("by_user", ["userId"])
      .index("by_user_and_active", ["userId", "active"]),

    resolutionLogs: defineTable({
      userId: v.id("users"),
      resolutionId: v.id("resolutions"),
      date: v.string(), // YYYY-MM-DD
      status: v.string(), // "success" | "failure" | "skip"
      notes: v.optional(v.string()),
    }).index("by_user_and_date", ["userId", "date"])
      .index("by_resolution", ["resolutionId"])
      .index("by_user_resolution_date", ["userId", "resolutionId", "date"]),

    // Rate limiting — tracks per-user mutation counts to prevent spam/abuse
    rateLimits: defineTable({
      userId: v.id("users"),
      action: v.string(),       // e.g. "completionLogs.markComplete"
      windowStart: v.number(),   // timestamp of this mutation
    })
      .index("by_user_and_action", ["userId", "action", "windowStart"])
      .index("by_window", ["windowStart"]),

  },
  {
    schemaValidation: false,
  },
);

export default schema;