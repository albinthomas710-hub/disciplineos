import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { ROLES, roleValidator } from "./schema/validators";
import { users, userSettings } from "./schema/users";
import { timetables, dailyTimetableOverrides, timeBlocks, completionLogs, vectal, customCategories, calendarTags, dayTags } from "./schema/productivity";
import { reflections, selfReflectionJournal, prayers, scriptures, prayerStreaks, monthlyGoals } from "./schema/journal";
import { clientFeedback, iterations, impactValidations, satisfactionMetrics, entrepreneurActions, weeklyReviews, productInsights, problems, solutions, customerLearnings, pivotLog, failuresVault, eightyTwentyActivities, hardDeadlines } from "./schema/entrepreneur";
import { manifestations, futureTimeline, realityAnchor, affirmationIdeas, ideas, selfDiscovery, patternInsights } from "./schema/manifestation";
import { quotes, legendProfiles, quoteChains, projects, notes, holyVideos, videoCategories, videoLibrary, adviceCategories, adviceLibrary } from "./schema/content";
import { dopamineShield, kitchenReclaim, emergencyTriggers, notToDoList, failureWisdom } from "./schema/health";

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
    vectal,
    customCategories,
    calendarTags,
    dayTags,

    // Journal & Reflection
    morningJournal: defineTable({
      userId: v.id("users"),
      date: v.string(),
      gratitude: v.string(),
      greatToday: v.string(),
      affirmations: v.string(),
      mood: v.optional(v.number()),
    }).index("by_user_and_date", ["userId", "date"]),

    eveningJournal: defineTable({
      userId: v.id("users"),
      date: v.string(),
      wholeDayJournal: v.string(),
      whereAmINow: v.string(),
      whoToBecome: v.string(),
      mood: v.optional(v.number()),
    }).index("by_user_and_date", ["userId", "date"]),

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

    selfReflectionJournal: defineTable({
      userId: v.id("users"),
      date: v.string(),
      prompt: v.string(),
      response: v.string(),
      gratitude: v.optional(v.string()),
      greatToday: v.optional(v.string()),
      affirmations: v.optional(v.string()),
      wholeDayJournal: v.optional(v.string()),
      mood: v.optional(v.number()),
      tags: v.optional(v.array(v.string())),
      isPrivate: v.boolean(),
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

    prayerStreaks: defineTable({
      userId: v.id("users"),
      streak: v.number(),
      lastPrayerDate: v.optional(v.string()),
      currentStreak: v.optional(v.number()),
      isPrivate: v.boolean(),
      date: v.optional(v.string()),
    }).index("by_user_and_date", ["userId", "date"]),

    monthlyGoals: defineTable({
      userId: v.id("users"),
      goal: v.string(),
      category: v.string(),
      targetDate: v.optional(v.string()),
      progress: v.optional(v.number()),
      status: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),
      isPrivate: v.boolean(),
      month: v.optional(v.string()),
      mainObjectives: v.optional(v.any()),
      date: v.optional(v.string()),
      notes: v.optional(v.string()),
    }).index("by_user_and_date", ["userId", "date"])
      .index("by_user_and_month", ["userId", "month"]),

    // Entrepreneur OS
    clientFeedback,
    iterations,
    impactValidations,
    satisfactionMetrics,
    entrepreneurActions,
    weeklyReviews,
    productInsights,
    problems,
    solutions,
    customerLearnings,
    pivotLog,
    failuresVault,
    eightyTwentyActivities,
    hardDeadlines,

    // Manifestation & Vision
    manifestations,
    futureTimeline,
    realityAnchor,
    affirmationIdeas,
    ideas,
    selfDiscovery,
    patternInsights,

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
    notToDoList,
    failureWisdom,
    
    recovery: defineTable({
      userId: v.id("users"),
      date: v.string(),
      type: v.string(),
      notes: v.optional(v.string()),
      rating: v.optional(v.number()),
    }).index("by_user_and_date", ["userId", "date"])
      .index("by_user", ["userId"]),
  },
  {
    schemaValidation: false,
  },
);

export default schema;