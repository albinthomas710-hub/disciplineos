import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all anonymous users with their data counts
export const listAnonymousUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const anonymousUsers = [];
    
    for (const user of users) {
      if (user.isAnonymous) {
        // Count data for each anonymous user
        const timetables = await ctx.db
          .query("timetables")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const manifestations = await ctx.db
          .query("manifestations")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const quotes = await ctx.db
          .query("quotes")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const prayers = await ctx.db
          .query("prayers")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        
        const projects = await ctx.db
          .query("projects")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        anonymousUsers.push({
          userId: user._id,
          createdAt: user._creationTime,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          totalDaysCompleted: user.totalDaysCompleted || 0,
          dataCount: {
            timetables: timetables.length,
            manifestations: manifestations.length,
            quotes: quotes.length,
            prayers: prayers.length,
            projects: projects.length,
          },
        });
      }
    }
    
    return anonymousUsers.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Convert anonymous user to email-based account
export const convertAnonymousToEmail = mutation({
  args: {
    anonymousUserId: v.id("users"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const anonymousUser = await ctx.db.get(args.anonymousUserId);
    
    if (!anonymousUser || !anonymousUser.isAnonymous) {
      throw new Error("User not found or not anonymous");
    }
    
    // Update the user to have an email and remove anonymous flag
    await ctx.db.patch(args.anonymousUserId, {
      email: args.email,
      isAnonymous: false,
    });
    
    return { success: true, userId: args.anonymousUserId };
  },
});
