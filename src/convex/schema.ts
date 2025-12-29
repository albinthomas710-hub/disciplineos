import { authTables } from "@convex-dev/auth/server";
import { defineSchema } from "convex/server";
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
    reflections,
    selfReflectionJournal,
    prayers,
    scriptures,
    prayerStreaks,
    monthlyGoals,

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
  },
  {
    schemaValidation: false,
  },
);

export default schema;