import { v } from "convex/values";
import { mutation, query, internalMutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all manifestations for current user
export const getUserManifestations = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const manifestations = await ctx.db
      .query("manifestations")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return manifestations.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get manifestations by type
export const getManifestationsByType = query({
  args: { 
    type: v.union(
      v.literal("vision"),
      v.literal("affirmation"),
      v.literal("habit"),
      v.literal("mindset")
    )
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const manifestations = await ctx.db
      .query("manifestations")
      .withIndex("by_user_and_type", (q) => 
        q.eq("userId", user._id).eq("type", args.type)
      )
      .collect();

    return manifestations.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Create a new manifestation
export const createManifestation = mutation({
  args: {
    type: v.union(
      v.literal("vision"),
      v.literal("affirmation"),
      v.literal("habit"),
      v.literal("mindset")
    ),
    title: v.string(),
    content: v.string(),
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("manifestations", {
      userId: user._id,
      type: args.type,
      title: args.title,
      content: args.content,
      targetDate: args.targetDate,
      isFavorite: false,
      isAchieved: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a manifestation
export const updateManifestation = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    targetDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.targetDate !== undefined) updates.targetDate = args.targetDate;

    await ctx.db.patch(args.manifestationId, updates);
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.patch(args.manifestationId, {
      isFavorite: !manifestation.isFavorite,
      updatedAt: Date.now(),
    });
  },
});

// Toggle achieved status
export const toggleAchieved = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.patch(args.manifestationId, {
      isAchieved: !manifestation.isAchieved,
      updatedAt: Date.now(),
    });
  },
});

// Delete a manifestation
export const deleteManifestation = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.delete(args.manifestationId);
  },
});

// Calculate manifestation energy score based on content quality
export const calculateEnergyScore = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    // Calculate energy score based on multiple factors
    let score = 0;
    const content = manifestation.content.toLowerCase();
    const title = manifestation.title.toLowerCase();
    
    // Present tense indicators (I am, I have, I do) - +20 points
    if (content.match(/\b(i am|i have|i do|i feel|i experience)\b/g)) {
      score += 20;
    }
    
    // Emotional words - +15 points
    const emotionalWords = ['grateful', 'blessed', 'excited', 'joyful', 'confident', 'powerful', 'abundant', 'successful', 'happy', 'fulfilled'];
    const emotionalCount = emotionalWords.filter(word => content.includes(word)).length;
    score += Math.min(emotionalCount * 3, 15);
    
    // Specificity (longer, detailed content) - +20 points
    if (content.length > 200) score += 20;
    else if (content.length > 100) score += 10;
    
    // Positive language (no negative words) - +15 points
    const negativeWords = ['not', 'never', 'can\'t', 'won\'t', 'don\'t', 'shouldn\'t'];
    const hasNegative = negativeWords.some(word => content.includes(word));
    if (!hasNegative) score += 15;
    
    // Has target date - +10 points
    if (manifestation.targetDate) score += 10;
    
    // Has micro steps - +10 points
    if (manifestation.microSteps && manifestation.microSteps.length > 0) score += 10;
    
    // Visualization streak bonus - +10 points
    if (manifestation.visualizationStreak && manifestation.visualizationStreak > 7) score += 10;

    await ctx.db.patch(args.manifestationId, {
      energyScore: Math.min(score, 100),
      updatedAt: Date.now(),
    });

    return Math.min(score, 100);
  },
});

// Log a visualization session
export const logVisualization = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const now = Date.now();
    const lastVisualized = manifestation.lastVisualized || 0;
    const oneDayAgo = now - (24 * 60 * 60 * 1000);
    
    // Check if visualization was done in last 24 hours
    const streak = lastVisualized > oneDayAgo 
      ? (manifestation.visualizationStreak || 0) + 1 
      : 1;

    await ctx.db.patch(args.manifestationId, {
      visualizationStreak: streak,
      lastVisualized: now,
      updatedAt: now,
    });

    return streak;
  },
});

// Add a synchronicity (sign/coincidence)
export const addSynchronicity = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    description: v.string(),
    significance: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const synchronicities = manifestation.synchronicities || [];
    synchronicities.push({
      description: args.description.trim(),
      timestamp: Date.now(),
      significance: args.significance,
    });

    await ctx.db.patch(args.manifestationId, {
      synchronicities,
      updatedAt: Date.now(),
    });
  },
});

// Add a journal entry
export const addJournalEntry = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    entry: v.string(),
    mood: v.number(),
    actionsToken: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    const journalEntries = manifestation.journalEntries || [];
    const today = new Date().toISOString().split('T')[0];
    
    journalEntries.push({
      date: today,
      entry: args.entry.trim(),
      mood: args.mood,
      actionsToken: args.actionsToken.trim(),
      timestamp: Date.now(),
    });

    await ctx.db.patch(args.manifestationId, {
      journalEntries,
      updatedAt: Date.now(),
    });
  },
});

// Add/update micro steps
export const updateMicroSteps = mutation({
  args: {
    manifestationId: v.id("manifestations"),
    microSteps: v.array(v.object({
      step: v.string(),
      completed: v.boolean(),
      completedAt: v.optional(v.number()),
    })),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.patch(args.manifestationId, {
      microSteps: args.microSteps,
      updatedAt: Date.now(),
    });
  },
});

// Mark celebration as viewed
export const markCelebrationViewed = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.patch(args.manifestationId, {
      celebrationViewed: true,
      updatedAt: Date.now(),
    });
  },
});

// Dismiss reality check (snooze for 24 hours)
export const dismissRealityCheck = mutation({
  args: { manifestationId: v.id("manifestations") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation || manifestation.userId !== user._id) {
      throw new Error("Manifestation not found or unauthorized");
    }

    await ctx.db.patch(args.manifestationId, {
      realityCheckDismissedAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Internal mutation to add AI insights (called from actions)
export const addAIInsights = internalMutation({
  args: {
    manifestationId: v.id("manifestations"),
    insights: v.array(v.object({
      insight: v.string(),
      type: v.union(
        v.literal("limiting_belief"),
        v.literal("action_suggestion"),
        v.literal("pattern_recognition"),
        v.literal("encouragement")
      ),
    })),
  },
  handler: async (ctx, args) => {
    const manifestation = await ctx.db.get(args.manifestationId);
    if (!manifestation) return;

    const aiInsights = manifestation.aiInsights || [];
    
    args.insights.forEach(insight => {
      aiInsights.push({
        ...insight,
        timestamp: Date.now(),
      });
    });

    await ctx.db.patch(args.manifestationId, {
      aiInsights,
      updatedAt: Date.now(),
    });
  },
});