import { defineTable } from "convex/server";
import { v } from "convex/values";

// Client Feedback - The core feedback loop
export const clientFeedback = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")), // Link to project if applicable
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
  satisfactionScore: v.number(), // 1-10 rating
  category: v.optional(v.string()), // "product", "service", "support", etc.
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
  isPublicTestimonial: v.boolean(), // Can this be used publicly?
  notes: v.optional(v.string()), // Internal notes about this feedback
  // NEW: Pain Level & Business Impact Fields
  painHours: v.optional(v.number()), // Time wasted per week in hours
  revenueImpactType: v.optional(v.union(
    v.literal("losing_revenue"),
    v.literal("missing_opportunity"),
    v.literal("no_impact")
  )),
  revenueAmount: v.optional(v.number()), // Dollar amount of revenue impact
  urgencyLevel: v.optional(v.union(
    v.literal("blocking"),
    v.literal("major_friction"),
    v.literal("nice_to_have"),
    v.literal("critical_for_renewal")
  )),
  willTestFix: v.optional(v.boolean()), // Will customer test within 48 hours?
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
  feedbackIds: v.array(v.id("clientFeedback")), // Which feedback inspired this iteration
  iterationNumber: v.number(), // v1.0, v1.1, v2.0, etc.
  title: v.string(),
  description: v.string(),
  hypothesis: v.string(), // What you're testing/improving
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
  // NEW: Velocity Tracking Fields
  startDate: v.optional(v.string()), // Date iteration started
  targetShipDate: v.optional(v.string()), // Target completion date
  actualShipDate: v.optional(v.string()), // Actual ship date
  complexity: v.optional(v.number()), // 1-10 complexity rating
  daysToShip: v.optional(v.number()), // Calculated: actual - start
  launchedAt: v.optional(v.number()),
  completedAt: v.optional(v.number()),
  learnings: v.optional(v.string()), // What did you learn from this iteration?
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"])
  .index("by_user_and_status", ["userId", "status"]);

// Impact Validation - Post-ship validation and measurement
export const impactValidations = defineTable({
  userId: v.id("users"),
  iterationId: v.id("iterations"),
  feedbackId: v.id("clientFeedback"), // Original feedback this addresses
  problemSolved: v.union(
    v.literal("yes_confirmed"),
    v.literal("no_still_issues"),
    v.literal("not_tested_yet")
  ),
  postSatisfaction: v.number(), // 1-10 rating after ship
  timeSaved: v.optional(v.number()), // Hours per week saved
  revenueGained: v.optional(v.number()), // Dollar amount gained
  iterationFailed: v.boolean(), // Mark if iteration didn't work
  customerQuote: v.optional(v.string()), // Testimonial or feedback
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
  date: v.string(), // "2025-01-11"
  averageSatisfaction: v.number(), // Average of all scores that day
  totalFeedback: v.number(),
  positiveCount: v.number(), // Scores 8-10
  neutralCount: v.number(), // Scores 5-7
  negativeCount: v.number(), // Scores 1-4
  nps: v.optional(v.number()), // Net Promoter Score
  testimonialCount: v.number(),
  featureRequestCount: v.number(),
  bugReportCount: v.number(),
}).index("by_user_and_date", ["userId", "date"])
  .index("by_project_and_date", ["projectId", "date"]);

// Entrepreneur Action Tracking - Daily accountability and goals
export const entrepreneurActions = defineTable({
  userId: v.id("users"),
  date: v.string(), // "2025-01-11"
  builtSomething: v.boolean(),
  builtSomethingNote: v.optional(v.string()),
  talkedToCustomers: v.boolean(),
  customersCount: v.optional(v.number()),
  customerInsights: v.optional(v.string()), // What did you learn from customers?
  qualityFlags: v.optional(v.array(v.string())), // ["pain_point", "roi_impact", "next_step", "closed_deal", "testimonial"]
  learnedNewSkill: v.boolean(),
  skillLearned: v.optional(v.string()),
  betterThanYesterday: v.boolean(),
  lessonLearned: v.optional(v.string()),
  hoursWorked: v.optional(v.number()),
  // NEW: Revenue tracking
  revenueClosed: v.optional(v.number()),
  pipelineAdded: v.optional(v.number()),
  outreachCount: v.optional(v.number()),
  dealsClosed: v.optional(v.number()),
  // Goals
  action24hrs: v.optional(v.string()),
  goal7days: v.optional(v.string()),
  goal30days: v.optional(v.string()),
  goal90days: v.optional(v.string()),
  // NEW: Streaks
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
  weekStartDate: v.string(), // "2025-01-06" (Monday)
  weekEndDate: v.string(), // "2025-01-12" (Sunday)
  // Metrics summary
  totalConversations: v.number(),
  thingsBuilt: v.number(),
  skillsLearned: v.array(v.string()),
  totalRevenue: v.number(),
  totalHours: v.number(),
  avgHoursPerDay: v.number(),
  // Reflection
  whatWorked: v.string(),
  whatDidntWork: v.string(),
  topPriority: v.string(),
  // Comparison to last week
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
    v.literal("pattern"), // Recurring feedback pattern
    v.literal("opportunity"), // Opportunity identified
    v.literal("risk"), // Risk or concern
    v.literal("win"), // Success story
    v.literal("learning") // Key learning
  ),
  title: v.string(),
  description: v.string(),
  relatedFeedbackIds: v.array(v.id("clientFeedback")),
  relatedIterationIds: v.optional(v.array(v.id("iterations"))),
  actionTaken: v.optional(v.string()),
  impact: v.optional(v.string()),
  confidence: v.number(), // 1-10 how confident are you in this insight
  isArchived: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"])
  .index("by_user_and_type", ["userId", "insightType"]);

// Problems - Core problem tracking
export const problems = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  problemTitle: v.string(),
  problemDescription: v.string(),
  problemCategory: v.union(
    v.literal("big_10m_plus"),
    v.literal("roi_focus"),
    v.literal("small_win"),
    v.literal("people_pay_for")
  ),
  dollarValue: v.number(), // Estimated $ impact per month
  painLevel: v.number(), // 1-10 scale
  discoverySource: v.union(
    v.literal("customer_interview"),
    v.literal("market_research"),
    v.literal("personal_experience"),
    v.literal("competitor_analysis"),
    v.literal("industry_report"),
    v.literal("reddit"),
    v.literal("g2_reviews"),
    v.literal("facebook_groups"),
    v.literal("trustpilot"),
    v.literal("forum_mining")
  ),
  discoveredDate: v.string(),
  customerName: v.optional(v.string()),
  industry: v.optional(v.string()),
  status: v.union(
    v.literal("discovered"),
    v.literal("researching"),
    v.literal("building_solution"),
    v.literal("testing"),
    v.literal("validated"),
    v.literal("shelved")
  ),
  peopleWhoHaveThis: v.number(), // Market size estimate
  priorityScore: v.number(), // Auto-calculated: dollarValue × painLevel × peopleWhoHaveThis
  // NEW: Pain/Urgency/Cost Framework
  isPainful: v.optional(v.boolean()), // Does this cause significant pain?
  isUrgent: v.optional(v.boolean()), // Does this need immediate attention?
  isCostly: v.optional(v.boolean()), // Does this cost significant money/time?
  is8020Focus: v.optional(v.boolean()), // Is this a high-leverage problem?
  // NEW: Deadline Tracking
  validationDeadline: v.optional(v.string()), // Deadline to validate this problem
  solutionDeadline: v.optional(v.string()), // Deadline to ship solution
  deadlineNotes: v.optional(v.string()),
  // NEW: Pain Point Mining
  sourceUrl: v.optional(v.string()), // URL where this was found (Reddit, G2, etc.)
  sourceType: v.optional(v.string()), // "reddit", "g2", "facebook", "trustpilot"
  miningNotes: v.optional(v.string()), // Notes from forum/review mining
  notes: v.optional(v.string()),
  tags: v.optional(v.array(v.string())),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_category", ["userId", "problemCategory"])
  .index("by_user_and_status", ["userId", "status"])
  .index("by_user_and_8020", ["userId", "is8020Focus"]);

// Solutions - Track solutions to problems
export const solutions = defineTable({
  userId: v.id("users"),
  problemId: v.id("problems"),
  solutionTitle: v.string(),
  solutionDescription: v.string(),
  hypothesis: v.string(), // "If we build X, then Y will happen"
  expectedOutcome: v.string(),
  actualOutcome: v.optional(v.string()),
  buildComplexity: v.number(), // 1-10 scale
  timeToBuild: v.optional(v.number()), // hours
  dateStarted: v.optional(v.string()),
  dateShipped: v.optional(v.string()),
  status: v.union(
    v.literal("idea"),
    v.literal("building"),
    v.literal("testing"),
    v.literal("shipped"),
    v.literal("validated"),
    v.literal("failed")
  ),
  validationMetrics: v.optional(v.string()),
  lessonsLearned: v.optional(v.string()),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_problem", ["problemId"])
  .index("by_user_and_status", ["userId", "status"]);

// Customer Learnings - Track insights from customer conversations
export const customerLearnings = defineTable({
  userId: v.id("users"),
  date: v.string(),
  customerName: v.string(),
  conversationType: v.union(
    v.literal("discovery_call"),
    v.literal("interview"),
    v.literal("feedback_session"),
    v.literal("support"),
    v.literal("casual")
  ),
  problemsDiscovered: v.string(),
  exactQuotes: v.optional(v.string()), // Their exact words
  painPoints: v.array(v.string()),
  dollarImpact: v.optional(v.number()),
  industryInsights: v.optional(v.string()),
  marketInsights: v.optional(v.string()),
  linkedProblemIds: v.optional(v.array(v.id("problems"))),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_date", ["userId", "date"]);

// Pivot Log - Track major strategic changes
export const pivotLog = defineTable({
  userId: v.id("users"),
  pivotDate: v.string(),
  pivotType: v.union(
    v.literal("niche_change"),
    v.literal("industry_change"),
    v.literal("product_change"),
    v.literal("business_model_change"),
    v.literal("target_customer_change")
  ),
  fromWhat: v.string(),
  toWhat: v.string(),
  whyPivoting: v.string(),
  trigger: v.union(
    v.literal("customer_insight"),
    v.literal("market_research"),
    v.literal("technology_wave"),
    v.literal("opportunity"),
    v.literal("failed_hypothesis"),
    v.literal("competition")
  ),
  evidence: v.string(),
  expectedImpact: v.string(),
  createdAt: v.number(),
}).index("by_user", ["userId"]);

// Failures Vault - Learn from what didn't work
export const failuresVault = defineTable({
  userId: v.id("users"),
  failureDate: v.string(),
  whatFailed: v.string(),
  problemId: v.optional(v.id("problems")),
  solutionId: v.optional(v.id("solutions")),
  whyItFailed: v.string(),
  costOfFailure: v.optional(v.number()), // Time/money lost
  lessonLearned: v.string(),
  whatToDoDifferently: v.string(),
  patternCategory: v.union(
    v.literal("wrong_problem"),
    v.literal("wrong_solution"),
    v.literal("wrong_timing"),
    v.literal("wrong_customer"),
    v.literal("wrong_niche"),
    v.literal("poor_execution")
  ),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_problem", ["problemId"])
  .index("by_solution", ["solutionId"]);

// Eighty Twenty Activities - Track high-leverage activities
export const eightyTwentyActivities = defineTable({
  userId: v.id("users"),
  activityName: v.string(),
  category: v.string(), // "product", "marketing", "sales", "operations", "learning"
  timeInvested: v.number(), // hours per week
  expectedImpact: v.optional(v.string()),
  startDate: v.string(),
  status: v.string(), // "active", "paused", "completed", "eliminated"
  actualResults: v.array(v.object({
    resultType: v.string(),
    resultValue: v.number(),
    resultDescription: v.string(),
    dateLogged: v.string(),
  })),
  totalImpactScore: v.number(),
  efficiencyRatio: v.number(), // impact per hour
})
  .index("by_user", ["userId"]);

// Hard Deadlines - Independent deadline tracking for any goal
export const hardDeadlines = defineTable({
  userId: v.id("users"),
  title: v.string(),
  description: v.optional(v.string()),
  deadline: v.string(), // Date string
  category: v.union(
    v.literal("problem_validation"),
    v.literal("solution_ship"),
    v.literal("customer_conversation"),
    v.literal("revenue_goal"),
    v.literal("learning_goal"),
    v.literal("personal_goal"),
    v.literal("other")
  ),
  linkedProblemId: v.optional(v.id("problems")),
  linkedSolutionId: v.optional(v.id("solutions")),
  status: v.union(
    v.literal("active"),
    v.literal("completed"),
    v.literal("missed"),
    v.literal("extended")
  ),
  completedAt: v.optional(v.number()),
  missedReason: v.optional(v.string()), // Why did you miss it? No lying.
  extensionReason: v.optional(v.string()), // Why extend? Be honest.
  originalDeadline: v.optional(v.string()), // Track if extended
  consequenceIfMissed: v.optional(v.string()), // What happens if you miss this?
  priority: v.union(
    v.literal("critical"),
    v.literal("high"),
    v.literal("medium"),
    v.literal("low")
  ),
  createdAt: v.number(),
  updatedAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_status", ["userId", "status"])
  .index("by_user_and_deadline", ["userId", "deadline"]);
