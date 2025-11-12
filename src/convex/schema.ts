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
      hasCompletedShieldOnboarding: v.optional(v.boolean()),
    })
      .index("email", ["email"])
      .searchIndex("search_name", {
        searchField: "name",
        filterFields: ["email"],
      }),

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

    // Reality Anchor - Fantasy To Plan Converter
    realityAnchor: defineTable({
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
    }).index("by_user", ["userId"]),

    // Kitchen Micro-Reclaim & Mindful Eats
    kitchenReclaim: defineTable({
      userId: v.id("users"),
      waitingSessions: v.array(
        v.object({
          startTime: v.number(),
          duration: v.number(), // in minutes
          activityChosen: v.union(
            v.literal("micro-task"),
            v.literal("learning"),
            v.literal("movement")
          ),
          completed: v.boolean(),
          endTime: v.number(),
        })
      ),
      mindfulMeals: v.array(
        v.object({
          date: v.string(),
          timestamp: v.number(),
          preHunger: v.number(), // 1-10 scale
          postFullness: v.number(), // 1-10 scale
          overate: v.boolean(),
          notes: v.optional(v.string()),
        })
      ),
      weeklyStats: v.object({
        minutesReclaimed: v.number(),
        mindfulMealCount: v.number(),
        overeatCount: v.number(),
      }),
    }).index("by_user", ["userId"]),

    // Custom Categories - user-defined time block categories
    customCategories: defineTable({
      userId: v.id("users"),
      name: v.string(),
      color: v.string(), // gradient colors like "from-blue-500 to-cyan-500"
      glowColor: v.string(), // rgba color for glow effect
    }).index("by_user", ["userId"]),

    // Vectal - Daily Task Tracking
    vectal: defineTable({
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
    }).index("by_user_and_date", ["userId", "date"]),

    // Emergency Triggers - user-defined temptation triggers
    emergencyTriggers: defineTable({
      userId: v.id("users"),
      title: v.string(),
      description: v.string(),
      color: v.string(), // gradient colors like "from-red-500 to-orange-500"
      isCritical: v.boolean(),
      order: v.number(),
    }).index("by_user", ["userId"]),

    // Quotes Saver - motivational quotes and advice
    quotes: defineTable({
      userId: v.id("users"),
      text: v.string(),
      author: v.string(),
      category: v.optional(v.string()), // "motivation", "discipline", "success", etc.
      isFavorite: v.boolean(),
      createdAt: v.number(),
      chainId: v.optional(v.string()), // Links quotes into wisdom paths
      chainOrder: v.optional(v.number()), // Order within the chain
      tags: v.optional(v.array(v.string())), // Auto-generated tags for better discovery
    }).index("by_user", ["userId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"])
      .index("by_user_and_author", ["userId", "author"])
      .index("by_user_and_chain", ["userId", "chainId"]),

    // Legend Profiles - author/legend information
    legendProfiles: defineTable({
      userId: v.id("users"),
      name: v.string(),
      bio: v.string(),
      story: v.string(), // Why this legend inspires the user
      imageUrl: v.optional(v.string()),
      category: v.optional(v.string()), // "entrepreneur", "philosopher", "athlete", etc.
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_and_name", ["userId", "name"]),

    // Quote Chains - wisdom paths
    quoteChains: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.string(),
      theme: v.string(), // "discipline journey", "success mindset", etc.
      color: v.string(), // gradient colors
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Projects - organize work and learning
    projects: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.string(), // color indicator
      icon: v.optional(v.string()), // emoji or icon name
      isFavorite: v.boolean(),
      status: v.string(), // "active", "archived", "completed"
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_and_status", ["userId", "status"]),

    // Notes - rich text notes for projects
    notes: defineTable({
      userId: v.id("users"),
      projectId: v.optional(v.id("projects")),
      title: v.string(),
      content: v.string(), // markdown content
      tags: v.optional(v.array(v.string())),
      isFavorite: v.boolean(),
      isPinned: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_project", ["projectId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"]),

    // Ideas - quick capture for thoughts and ideas
    ideas: defineTable({
      userId: v.id("users"),
      projectId: v.optional(v.id("projects")),
      content: v.string(),
      color: v.optional(v.string()), // sticky note color
      completed: v.boolean(),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_project", ["projectId"]),

    // Affirmation Ideas - Quick brain dump for affirmation thoughts
    affirmationIdeas: defineTable({
      userId: v.id("users"),
      content: v.string(),
      completed: v.boolean(), // True when converted to full affirmation
      manifestationId: v.optional(v.id("manifestations")), // Link to created manifestation
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_and_completed", ["userId", "completed"]),

    // Manifestations - goals, affirmations, habit changes, mindset shifts
    manifestations: defineTable({
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
      .index("by_user_and_achieved", ["userId", "isAchieved"]),

    // Future Timeline - Template-based parallel futures (no AI required)
    futureTimeline: defineTable({
      userId: v.id("users"),
      timelineAVibrancy: v.number(), // 0-100, how vivid Timeline A appears
      timelineBVibrancy: v.number(), // 0-100, how vivid Timeline B appears
      lastUpdated: v.number(),
    }).index("by_user", ["userId"]),

    // Know Yourself - Self-discovery and pattern recognition
    selfDiscovery: defineTable({
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
    }).index("by_user", ["userId"]),

    // Self-Reflection Journal
    selfReflectionJournal: defineTable({
      userId: v.id("users"),
      date: v.string(),
      prompt: v.string(),
      response: v.string(),
      mood: v.optional(v.number()), // 1-10
      tags: v.optional(v.array(v.string())),
      isPrivate: v.boolean(),
    }).index("by_user_and_date", ["userId", "date"]),

    // Pattern Insights
    patternInsights: defineTable({
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
      .index("by_user_and_read", ["userId", "isRead"]),

    // Prayer Journal - Christian spiritual feature
    prayers: defineTable({
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
      .index("by_user_and_answered", ["userId", "isAnswered"]),

    // Bible Scriptures Collection
    scriptures: defineTable({
      userId: v.id("users"),
      reference: v.string(), // e.g., "John 3:16"
      text: v.string(),
      translation: v.optional(v.string()), // e.g., "NIV", "KJV"
      category: v.optional(v.string()), // "faith", "hope", "love", "strength", etc.
      isFavorite: v.boolean(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"])
      .searchIndex("search_reference", {
        searchField: "reference",
        filterFields: ["userId"],
      }),

    // Prayer Streak Tracking
    prayerStreaks: defineTable({
      userId: v.id("users"),
      date: v.string(), // "2025-01-11"
      prayersCount: v.number(),
      scripturesRead: v.number(),
      completed: v.boolean(),
    }).index("by_user_and_date", ["userId", "date"]),

    // Holy Videos Collection
    holyVideos: defineTable({
      userId: v.id("users"),
      title: v.string(),
      url: v.string(), // YouTube or other video URL
      description: v.optional(v.string()),
      category: v.optional(v.string()), // "sermon", "worship", "teaching", "testimony", etc.
      speaker: v.optional(v.string()), // Pastor/speaker name
      isFavorite: v.boolean(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"]),

    // Video Library - Organize YouTube videos by custom categories
    videoCategories: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.string(), // gradient colors
      icon: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    videoLibrary: defineTable({
      userId: v.id("users"),
      categoryId: v.id("videoCategories"),
      title: v.string(),
      url: v.string(),
      description: v.optional(v.string()),
      thumbnailUrl: v.optional(v.string()),
      isFavorite: v.boolean(),
      notes: v.optional(v.string()),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_category", ["categoryId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"]),

    // Advice Library - Store and organize advice by categories
    adviceCategories: defineTable({
      userId: v.id("users"),
      name: v.string(),
      description: v.optional(v.string()),
      color: v.string(), // gradient colors
      createdAt: v.number(),
    }).index("by_user", ["userId"]),

    adviceLibrary: defineTable({
      userId: v.id("users"),
      categoryId: v.id("adviceCategories"),
      title: v.string(),
      content: v.string(),
      source: v.optional(v.string()), // Where the advice came from
      tags: v.optional(v.array(v.string())),
      isFavorite: v.boolean(),
      createdAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_category", ["categoryId"])
      .index("by_user_and_favorite", ["userId", "isFavorite"]),

    // Not To Do List - Track tasks/habits to AVOID
    notToDoList: defineTable({
      userId: v.id("users"),
      date: v.string(), // "2025-01-11"
      items: v.array(
        v.object({
          id: v.string(),
          title: v.string(),
          category: v.string(), // "distraction", "bad_habit", "time_waster", "temptation"
          description: v.optional(v.string()),
          successfullyAvoided: v.boolean(),
          importance: v.number(), // 0-100 score (how critical to avoid)
          color: v.string(), // gradient colors
          createdAt: v.number(),
          totalAvoided: v.optional(v.number()), // Track total times avoided across all days
          lastChecked: v.optional(v.number()), // Last time this item was checked
        })
      ),
      totalAvoided: v.number(),
      lastChecked: v.number(),
    }).index("by_user_and_date", ["userId", "date"]),

    // ============================================
    // ENTREPRENEUR OS - Elite Feedback & Iteration System
    // ============================================

    // Client Feedback - The core feedback loop
    clientFeedback: defineTable({
      userId: v.id("users"),
      projectId: v.optional(v.id("projects")), // Link to project if applicable
      clientName: v.string(),
      clientEmail: v.optional(v.string()),
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
      .index("by_user_and_type", ["userId", "feedbackType"]),

    // Iterations - Track product iterations based on feedback
    iterations: defineTable({
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
        v.literal("measuring")
      ),
      metrics: v.optional(v.object({
        beforeSatisfaction: v.optional(v.number()),
        afterSatisfaction: v.optional(v.number()),
        feedbackCount: v.optional(v.number()),
        positiveResponses: v.optional(v.number()),
        negativeResponses: v.optional(v.number()),
      })),
      launchedAt: v.optional(v.number()),
      completedAt: v.optional(v.number()),
      learnings: v.optional(v.string()), // What did you learn from this iteration?
      createdAt: v.number(),
      updatedAt: v.number(),
    }).index("by_user", ["userId"])
      .index("by_project", ["projectId"])
      .index("by_user_and_status", ["userId", "status"]),

    // Customer Satisfaction Tracking - Aggregate metrics over time
    satisfactionMetrics: defineTable({
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
      .index("by_project_and_date", ["projectId", "date"]),

    // Building Something People Love - Core insights and patterns
    productInsights: defineTable({
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
      .index("by_user_and_type", ["userId", "insightType"]),

  },
  {
    schemaValidation: false,
  },
);

export default schema;