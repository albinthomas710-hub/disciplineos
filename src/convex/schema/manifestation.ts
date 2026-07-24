import { defineTable } from "convex/server";
import { v } from "convex/values";

// Manifestations - goals, affirmations, habit changes, mindset shifts
export const manifestations = defineTable({
  userId: v.id("users"),
  type: v.union(
    v.literal("vision"),
    v.literal("affirmation"),
    v.literal("habit"),
    v.literal("mindset")
  ),
  title: v.string(),
  content: v.string(),
  targetDate: v.optional(v.string()),
  isFavorite: v.boolean(),
  isAchieved: v.boolean(),
  createdAt: v.number(),
  updatedAt: v.number(),
  imageUrl: v.optional(v.string()),
  currentState: v.optional(v.string()),
  desiredState: v.optional(v.string()),
  energyScore: v.optional(v.number()),
  visualizationStreak: v.optional(v.number()),
  lastVisualized: v.optional(v.number()),
  microSteps: v.optional(v.array(v.object({
    step: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  synchronicities: v.optional(v.array(v.object({
    description: v.string(),
    timestamp: v.number(),
    significance: v.number(),
  }))),
  journalEntries: v.optional(v.array(v.object({
    date: v.string(),
    entry: v.string(),
    mood: v.number(),
    actionsToken: v.string(),
    timestamp: v.number(),
  }))),
  achievedAt: v.optional(v.number()),
  celebrationViewed: v.optional(v.boolean()),
  identityStatement: v.optional(v.string()),
  painLeverage: v.optional(v.string()),
  dailyActions: v.optional(v.array(v.object({
    date: v.string(),
    actions: v.array(v.string()),
    timestamp: v.number(),
  }))),
  actionStreak: v.optional(v.number()),
  lastActionDate: v.optional(v.string()),
  evidenceLog: v.optional(v.array(v.object({
    date: v.string(),
    evidence: v.string(),
    timestamp: v.number(),
  }))),
  limitingBeliefs: v.optional(v.array(v.object({
    belief: v.string(),
    reframe: v.optional(v.string()),
    identified: v.number(),
    resolved: v.boolean(),
  }))),
  visualizationSessions: v.optional(v.array(v.object({
    date: v.string(),
    emotionalIntensity: v.number(),
    sensoryDetails: v.string(),
    duration: v.number(),
    timestamp: v.number(),
  }))),
  aiInsights: v.optional(v.array(v.object({
    insight: v.string(),
    type: v.union(
      v.literal("limiting_belief"),
      v.literal("action_suggestion"),
      v.literal("pattern_recognition"),
      v.literal("encouragement")
    ),
    timestamp: v.number(),
  }))),
  obstacles: v.optional(v.array(v.object({
    date: v.string(),
    obstacle: v.string(),
    solution: v.string(),
    timestamp: v.number(),
  }))),
}).index("by_user", ["userId"])
  .index("by_user_and_type", ["userId", "type"])
  .index("by_user_and_achieved", ["userId", "isAchieved"]);

// Reality Anchor - Fantasy To Plan Converter
export const realityAnchor = defineTable({
  userId: v.id("users"),
  anchorEvents: v.array(
    v.object({
      timestamp: v.number(),
      eventType: v.union(
        v.literal("vision_captured"),
        v.literal("grounding"),
        v.literal("redirect")
      ),
      vision: v.optional(v.string()),
      why: v.optional(v.string()),
      microPlan: v.optional(v.array(v.string())),
      triggerQuoteId: v.optional(v.id("quotes")),
    })
  ),
  microPlans: v.array(
    v.object({
      createdAt: v.number(),
      vision: v.string(),
      steps: v.array(
        v.object({
          step: v.string(),
          quoteId: v.optional(v.id("quotes")),
          completed: v.boolean(),
        })
      ),
      completed: v.boolean(),
      triggerQuoteId: v.optional(v.id("quotes")),
    })
  ),
  conversionsCountWeek: v.number(),
  lastWeeklyReset: v.number(),
  wisdomJourney: v.optional(v.array(
    v.object({
      timestamp: v.number(),
      vision: v.string(),
      triggerQuoteId: v.optional(v.id("quotes")),
      stepsCompleted: v.number(),
      reflection: v.optional(v.string()),
    })
  )),
}).index("by_user", ["userId"]);

// Affirmation Ideas - Quick brain dump for affirmation thoughts
export const affirmationIdeas = defineTable({
  userId: v.id("users"),
  content: v.string(),
  completed: v.boolean(),
  manifestationId: v.optional(v.id("manifestations")),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_completed", ["userId", "completed"]);

// Ideas - quick capture for thoughts and ideas
export const ideas = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  content: v.string(),
  color: v.optional(v.string()),
  completed: v.boolean(),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"]);
