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
  // World-class features
  imageUrl: v.optional(v.string()), // Vision board image
  currentState: v.optional(v.string()), // Where you are now
  desiredState: v.optional(v.string()), // Where you want to be
  energyScore: v.optional(v.number()), // 0-100 manifestation power score
  visualizationStreak: v.optional(v.number()), // Days of consistent visualization
  lastVisualized: v.optional(v.number()), // Timestamp of last visualization
  microSteps: v.optional(v.array(v.object({
    step: v.string(),
    completed: v.boolean(),
    completedAt: v.optional(v.number()),
  }))),
  synchronicities: v.optional(v.array(v.object({
    description: v.string(),
    timestamp: v.number(),
    significance: v.number(), // 1-5 rating
  }))),
  journalEntries: v.optional(v.array(v.object({
    date: v.string(),
    entry: v.string(),
    mood: v.number(), // 1-10
    actionsToken: v.string(), // What actions were taken
    timestamp: v.number(),
  }))),
  achievedAt: v.optional(v.number()), // When it was achieved
  celebrationViewed: v.optional(v.boolean()), // Has user seen celebration animation
  // NEW: Evidence-based manifestation features
  identityStatement: v.optional(v.string()), // "I am the person who..."
  painLeverage: v.optional(v.string()), // What it costs to NOT achieve this
  dailyActions: v.optional(v.array(v.object({
    date: v.string(),
    actions: v.array(v.string()),
    timestamp: v.number(),
  }))),
  actionStreak: v.optional(v.number()), // Days of consistent action
  lastActionDate: v.optional(v.string()),
  evidenceLog: v.optional(v.array(v.object({
    date: v.string(),
    evidence: v.string(), // Proof this is working
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
    emotionalIntensity: v.number(), // 1-10
    sensoryDetails: v.string(), // What they saw/felt/heard
    duration: v.number(), // minutes
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

// Future Timeline - Template-based parallel futures (no AI required)
export const futureTimeline = defineTable({
  userId: v.id("users"),
  timelineAVibrancy: v.number(), // 0-100, how vivid Timeline A appears
  timelineBVibrancy: v.number(), // 0-100, how vivid Timeline B appears
  lastUpdated: v.number(),
}).index("by_user", ["userId"]);

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
  completed: v.boolean(), // True when converted to full affirmation
  manifestationId: v.optional(v.id("manifestations")), // Link to created manifestation
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_completed", ["userId", "completed"]);

// Ideas - quick capture for thoughts and ideas
export const ideas = defineTable({
  userId: v.id("users"),
  projectId: v.optional(v.id("projects")),
  content: v.string(),
  color: v.optional(v.string()), // sticky note color
  completed: v.boolean(),
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_project", ["projectId"]);

// Know Yourself - Self-discovery and pattern recognition
export const selfDiscovery = defineTable({
  userId: v.id("users"),
  // Personality Insights
  personalityTraits: v.optional(v.object({
    consistency: v.number(), // 0-100
    resilience: v.number(), // 0-100
    ambition: v.number(), // 0-100
    discipline: v.number(), // 0-100
  })),
  // Strengths & Weaknesses
  strengths: v.optional(v.array(v.string())),
  weaknesses: v.optional(v.array(v.string())),
  // Energy Mapping
  peakEnergyHours: v.optional(v.array(v.number())), // Hours of day (0-23)
  lowEnergyHours: v.optional(v.array(v.number())),
  // Time Audit - flexible record to support custom categories
  timeDistribution: v.optional(v.record(v.string(), v.number())),
  // Growth Metrics
  selfDiscoveryScore: v.optional(v.number()), // 0-100
  lastAnalyzed: v.number(),
}).index("by_user", ["userId"]);

// Pattern Insights
export const patternInsights = defineTable({
  userId: v.id("users"),
  insightType: v.union(
    v.literal("productivity_pattern"),
    v.literal("energy_pattern"),
    v.literal("behavior_pattern"),
    v.literal("growth_milestone")
  ),
  title: v.string(),
  description: v.string(),
  discoveredAt: v.number(),
  isRead: v.boolean(),
}).index("by_user", ["userId"])
  .index("by_user_and_read", ["userId", "isRead"]);
