import { defineTable } from "convex/server";
import { v } from "convex/values";

// Client Feedback - The core feedback loop
export const clientFeedback = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  clientName: v.string(),
  clientEmail: v.optional(v.string()),
  clientPhone: v.optional(v.string()),
  companyName: v.optional(v.string()),
  socialLinks: v.optional(v.object({
    linkedin: v.optional(v.string()),
    twitter: v.optional(v.string()),
    website: v.optional(v.string()),
  })),
  feedbackType: v.union(
    v.literal("testimonial"),
    v.literal("feature_request"),
    v.literal("bug_report"),
    v.literal("general"),
    v.literal("complaint"),
    v.literal("praise")
  ),
  feedbackText: v.string(),
  satisfactionScore: v.number(),
  category: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  status: v.union(
    v.literal("new"),
    v.literal("reviewing"),
    v.literal("planned"),
    v.literal("in_progress"),
    v.literal("completed"),
    v.literal("archived")
  ),
  priority: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
    v.literal("critical")
  ),
  isPublicTestimonial: v.boolean(),
  notes: v.optional(v.string()),
  painHours: v.optional(v.number()),
  revenueImpactType: v.optional(v.union(
    v.literal("losing_revenue"),
    v.literal("missing_opportunity"),
    v.literal("no_impact")
  )),
  revenueAmount: v.optional(v.number()),
  urgencyLevel: v.optional(v.union(
    v.literal("blocking"),
    v.literal("major_friction"),
    v.literal("nice_to_have"),
    v.literal("critical_for_renewal")
  )),
  willTestFix: v.optional(v.boolean()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"])
  .index("by_user_and_status", ["userId", "status"])
  .index("by_user_and_type", ["userId", "feedbackType"]);

// Iterations - Track product iterations based on feedback
export const iterations = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  feedbackIds: v.array(v.id("clientFeedback")),
  iterationNumber: v.number(),
  title: v.string(),
  description: v.string(),
  hypothesis: v.string(),
  changes: v.array(v.object({
    change: v.string(),
    reason: v.string(),
    expectedImpact: v.string(),
  })),
  status: v.union(
    v.literal("planning"),
    v.literal("building"),
    v.literal("testing"),
    v.literal("launched"),
    v.literal("measuring"),
    v.literal("shipped")
  ),
  metrics: v.optional(v.object({
    beforeSatisfaction: v.optional(v.number()),
    afterSatisfaction: v.optional(v.number()),
    feedbackCount: v.optional(v.number()),
    positiveResponses: v.optional(v.number()),
    negativeResponses: v.optional(v.number()),
  })),
  startDate: v.optional(v.string()),
  targetShipDate: v.optional(v.string()),
  actualShipDate: v.optional(v.string()),
  complexity: v.optional(v.number()),
  daysToShip: v.optional(v.number()),
  launchedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  learnings: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"])
  .index("by_user_and_status", ["userId", "status"]);

// Impact Validation - Post-ship validation and measurement
export const impactValidations = defineTable({
  userId: v.id("users"),
  iterationId: v.id("iterations"),
  feedbackId: v.id("clientFeedback"),
  problemSolved: v.union(
    v.literal("yes_confirmed"),
    v.literal("no_still_issues"),
    v.literal("not_tested_yet")
  ),
  postSatisfaction: v.number(),
  timeSaved: v.optional(v.number()),
  revenueGained: v.optional(v.number()),
  iterationFailed: v.boolean(),
  customerQuote: v.optional(v.string()),
  nextAction: v.union(
    v.literal("mark_resolved"),
    v.literal("needs_additional_iteration"),
    v.literal("request_case_study")
  ),
  validatedAt: v.number(),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_iteration", ["iterationId"])
  .index("by_feedback", ["feedbackId"]);

// Customer Satisfaction Tracking - Aggregate metrics over time
export const satisfactionMetrics = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  date: v.string(),
  averageSatisfaction: v.number(),
  totalFeedback: v.number(),
  positiveCount: v.number(),
  neutralCount: v.number(),
  negativeCount: v.number(),
  nps: v.optional(v.number()),
  testimonialCount: v.number(),
  featureRequestCount: v.number(),
  bugReportCount: v.number(),
}).index("by_user_and_date", ["userId", "date"])
  .index("by_project_and_date", ["projectId", "date"]);

// Entrepreneur Action Tracking - Daily accountability and goals
export const entrepreneurActions = defineTable({
  userId: v.id("users"),
  date: v.string(),
  builtSomething: v.boolean(),
  builtSomethingNote: v.optional(v.string()),
  talkedToCustomers: v.boolean(),
  customersCount: v.optional(v.number()),
  customerInsights: v.optional(v.string()),
  qualityFlags: v.optional(v.array(v.string())),
  learnedNewSkill: v.boolean(),
  skillLearned: v.optional(v.string()),
  betterThanYesterday: v.boolean(),
  lessonLearned: v.optional(v.string()),
  hoursWorked: v.optional(v.number()),
  revenueClosed: v.optional(v.number()),
  pipelineAdded: v.optional(v.number()),
  outreachCount: v.optional(v.number()),
  dealsClosed: v.optional(v.number()),
  action24hrs: v.optional(v.string()),
  goal7days: v.optional(v.string()),
  goal30days: v.optional(v.string()),
  goal90days: v.optional(v.string()),
  streaks: v.optional(v.object({
    builtStreak: v.number(),
    customerStreak: v.number(),
    learningStreak: v.number(),
    eightyHourWeeks: v.number(),
  })),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user_and_date", ["userId", "date"]);

// Weekly Reviews - End of week reflection
export const weeklyReviews = defineTable({
  userId: v.id("users"),
  weekStartDate: v.string(),
  weekEndDate: v.string(),
  totalConversations: v.number(),
  thingsBuilt: v.number(),
  skillsLearned: v.array(v.string()),
  totalRevenue: v.number(),
  totalHours: v.number(),
  avgHoursPerDay: v.number(),
  whatWorked: v.string(),
  whatDidntWork: v.string(),
  topPriority: v.string(),
  conversationsChange: v.optional(v.number()),
  revenueChange: v.optional(v.number()),
  hoursChange: v.optional(v.number()),
  createdAt: v.number(),
}).index("by_user_and_week", ["userId", "weekStartDate"]);

// Building Something People Love - Core insights and patterns
export const productInsights = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  insightType: v.union(
    v.literal("pattern"),
    v.literal("opportunity"),
    v.literal("risk"),
    v.literal("win"),
    v.literal("learning")
  ),
  title: v.string(),
  description: v.string(),
  relatedFeedbackIds: v.array(v.id("clientFeedback")),
  relatedIterationIds: v.optional(v.array(v.id("iterations"))),
  actionTaken: v.optional(v.string()),
  impact: v.optional(v.string()),
  confidence: v.number(),
  isArchived: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"])
  .index("by_user_and_type", ["userId", "insightType"]);
