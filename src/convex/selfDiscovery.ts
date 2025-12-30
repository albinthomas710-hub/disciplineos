import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get self-discovery profile
export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    return profile;
  },
});

// Initialize profile if it doesn't exist
export const initializeProfile = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const existing = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!existing) {
      await ctx.db.insert("selfDiscovery", {
        userId: user._id,
        lastAnalyzed: Date.now(),
      });
    }
  },
});

// Analyze patterns and update profile
export const analyzePatterns = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Get all completion logs
    const allLogs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    // Get all reflections
    const allReflections = await ctx.db
      .query("reflections")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    // Get all time blocks to analyze categories
    const timetables = await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allBlocks = [];
    for (const timetable of timetables) {
      const blocks = await ctx.db
        .query("timeBlocks")
        .withIndex("by_timetable", (q) => q.eq("timetableId", timetable._id))
        .collect();
      allBlocks.push(...blocks);
    }

    // Calculate personality traits
    const totalDays = new Set(allLogs.map(log => log.date)).size;
    const completedDays = user.totalDaysCompleted || 0;
    
    const consistency = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;
    const resilience = Math.min(100, (user.longestStreak || 0) * 10);
    const ambition = Math.min(100, allBlocks.length * 5);
    const discipline = Math.min(100, (user.currentStreak || 0) * 15);

    // Identify strengths and weaknesses
    const strengths = [];
    const weaknesses = [];

    if (consistency >= 70) strengths.push("Highly consistent");
    else if (consistency < 40) weaknesses.push("Struggles with consistency");

    if (resilience >= 70) strengths.push("Resilient mindset");
    else if (resilience < 40) weaknesses.push("Needs to build resilience");

    if (discipline >= 70) strengths.push("Strong discipline");
    else if (discipline < 40) weaknesses.push("Building discipline");

    if (allReflections.length >= 7) strengths.push("Self-aware");
    else weaknesses.push("Needs more reflection");

    // Analyze time distribution by category
    const categoryCount: Record<string, number> = {};
    for (const block of allBlocks) {
      const category = block.category || "other";
      categoryCount[category] = (categoryCount[category] || 0) + 1;
    }

    const total = allBlocks.length || 1;
    const timeDistribution = {
      focus: Math.round(((categoryCount["Focus"] || 0) / total) * 100),
      health: Math.round(((categoryCount["Health"] || 0) / total) * 100),
      learning: Math.round(((categoryCount["Learning"] || 0) / total) * 100),
      spiritual: Math.round(((categoryCount["Spiritual"] || 0) / total) * 100),
      other: Math.round(((categoryCount["other"] || 0) / total) * 100),
    };

    // Calculate self-discovery score
    const selfDiscoveryScore = Math.round(
      (consistency + resilience + ambition + discipline) / 4
    );

    // Update or create profile
    const existingProfile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existingProfile) {
      // Only update personality traits and score, preserve manual edits to strengths/weaknesses/timeDistribution
      const updates: any = {
        personalityTraits: { consistency, resilience, ambition, discipline },
        selfDiscoveryScore,
        lastAnalyzed: Date.now(),
      };
      
      // Only set auto-calculated values if user hasn't manually added any
      if (!existingProfile.strengths || existingProfile.strengths.length === 0) {
        updates.strengths = strengths;
      }
      if (!existingProfile.weaknesses || existingProfile.weaknesses.length === 0) {
        updates.weaknesses = weaknesses;
      }
      if (!existingProfile.timeDistribution || Object.keys(existingProfile.timeDistribution).length === 0) {
        updates.timeDistribution = timeDistribution;
      }
      
      await ctx.db.patch(existingProfile._id, updates);
    } else {
      // First time initialization - use calculated values
      await ctx.db.insert("selfDiscovery", {
        userId: user._id,
        personalityTraits: { consistency, resilience, ambition, discipline },
        strengths,
        weaknesses,
        timeDistribution,
        selfDiscoveryScore,
        lastAnalyzed: Date.now(),
      });
    }

    return { selfDiscoveryScore, strengths: existingProfile?.strengths || strengths, weaknesses: existingProfile?.weaknesses || weaknesses };
  },
});

// Add a custom time category
export const addTimeCategory = mutation({
  args: { 
    category: v.string(),
    percentage: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      await ctx.db.insert("selfDiscovery", {
        userId: user._id,
        timeDistribution: { [args.category]: args.percentage },
        lastAnalyzed: Date.now(),
      });
    } else {
      const currentDistribution = profile.timeDistribution || {};
      await ctx.db.patch(profile._id, {
        timeDistribution: {
          ...currentDistribution,
          [args.category]: args.percentage,
        },
      });
    }
  },
});

// Update time category percentage
export const updateTimeCategory = mutation({
  args: {
    category: v.string(),
    percentage: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile && profile.timeDistribution) {
      await ctx.db.patch(profile._id, {
        timeDistribution: {
          ...profile.timeDistribution,
          [args.category]: args.percentage,
        },
      });
    }
  },
});

// Delete time category
export const deleteTimeCategory = mutation({
  args: { category: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile && profile.timeDistribution) {
      const { [args.category]: _, ...rest } = profile.timeDistribution;
      await ctx.db.patch(profile._id, {
        timeDistribution: rest,
      });
    }
  },
});

// Add a strength manually
export const addStrength = mutation({
  args: { strength: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      await ctx.db.insert("selfDiscovery", {
        userId: user._id,
        strengths: [args.strength],
        lastAnalyzed: Date.now(),
      });
    } else {
      const currentStrengths = profile.strengths || [];
      if (!currentStrengths.includes(args.strength)) {
        await ctx.db.patch(profile._id, {
          strengths: [...currentStrengths, args.strength],
        });
      }
    }
  },
});

// Remove a strength
export const removeStrength = mutation({
  args: { strength: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile && profile.strengths) {
      await ctx.db.patch(profile._id, {
        strengths: profile.strengths.filter((s) => s !== args.strength),
      });
    }
  },
});

// Add a weakness manually
export const addWeakness = mutation({
  args: { weakness: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (!profile) {
      await ctx.db.insert("selfDiscovery", {
        userId: user._id,
        weaknesses: [args.weakness],
        lastAnalyzed: Date.now(),
      });
    } else {
      const currentWeaknesses = profile.weaknesses || [];
      if (!currentWeaknesses.includes(args.weakness)) {
        await ctx.db.patch(profile._id, {
          weaknesses: [...currentWeaknesses, args.weakness],
        });
      }
    }
  },
});

// Remove a weakness
export const removeWeakness = mutation({
  args: { weakness: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile && profile.weaknesses) {
      await ctx.db.patch(profile._id, {
        weaknesses: profile.weaknesses.filter((w) => w !== args.weakness),
      });
    }
  },
});

// Mark a weakness as fixed (moves it to strengths)
export const markWeaknessFixed = mutation({
  args: { weakness: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("selfDiscovery")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (profile && profile.weaknesses) {
      const currentStrengths = profile.strengths || [];
      const currentWeaknesses = profile.weaknesses || [];
      
      // Remove from weaknesses
      const updatedWeaknesses = currentWeaknesses.filter((w) => w !== args.weakness);
      
      // Add to strengths with "Overcame: " prefix
      const strengthText = `Overcame: ${args.weakness}`;
      const updatedStrengths = currentStrengths.includes(strengthText)
        ? currentStrengths
        : [...currentStrengths, strengthText];

      await ctx.db.patch(profile._id, {
        weaknesses: updatedWeaknesses,
        strengths: updatedStrengths,
      });
    }
  },
});

// Get recent journal entries
export const getJournalEntries = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const entries = await ctx.db
      .query("selfReflectionJournal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
      .collect();

    return entries
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, args.limit || 10);
  },
});

// Add journal entry
export const addJournalEntry = mutation({
  args: {
    prompt: v.string(),
    response: v.string(),
    gratitude: v.optional(v.string()),
    greatToday: v.optional(v.string()),
    affirmations: v.optional(v.string()),
    mood: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    await ctx.db.insert("selfReflectionJournal", {
      userId: user._id,
      date: today,
      prompt: args.prompt,
      response: args.response.trim(),
      gratitude: args.gratitude,
      greatToday: args.greatToday,
      affirmations: args.affirmations,
      mood: args.mood,
      tags: args.tags,
      isPrivate: true,
    });
  },
});

// Delete a journal entry
export const deleteJournalEntry = mutation({
  args: { entryId: v.id("selfReflectionJournal") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const entry = await ctx.db.get(args.entryId);
    if (!entry || entry.userId !== user._id) {
      throw new Error("Entry not found or unauthorized");
    }

    await ctx.db.delete(args.entryId);
  },
});

// Get pattern insights
export const getInsights = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    return await ctx.db
      .query("patternInsights")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();
  },
});

// Mark insight as read
export const markInsightRead = mutation({
  args: { insightId: v.id("patternInsights") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.insightId, { isRead: true });
  },
});