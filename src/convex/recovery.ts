import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// List all anonymous users with their data counts
export const listAnonymousUsers = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    
    const anonymousUsers = [];
    
    for (const user of users) {
      // Include users where isAnonymous is true OR undefined (legacy accounts)
      // Exclude users with email addresses (they're already converted)
      if ((user.isAnonymous === true || user.isAnonymous === undefined) && !user.email) {
        // Count ALL data types for each anonymous user
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

        // NEW: Check all the missing data types
        const vectal = await ctx.db
          .query("vectal")
          .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
          .collect();

        const scriptures = await ctx.db
          .query("scriptures")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const holyVideos = await ctx.db
          .query("holyVideos")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const videoLibrary = await ctx.db
          .query("videoLibrary")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const adviceLibrary = await ctx.db
          .query("adviceLibrary")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const notToDoList = await ctx.db
          .query("notToDoList")
          .withIndex("by_user_and_date", (q) => q.eq("userId", user._id))
          .collect();

        const selfDiscovery = await ctx.db
          .query("selfDiscovery")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        const legendProfiles = await ctx.db
          .query("legendProfiles")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();

        // Calculate total Vectal tasks across all dates
        const totalVectalTasks = vectal.reduce((sum, v) => sum + (v.tasks?.length || 0), 0);

        // Calculate total Not-To-Do items across all dates
        const totalNotToDoItems = notToDoList.reduce((sum, n) => sum + (n.items?.length || 0), 0);

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
            vectalTasks: totalVectalTasks,
            scriptures: scriptures.length,
            holyVideos: holyVideos.length,
            videoLibrary: videoLibrary.length,
            adviceLibrary: adviceLibrary.length,
            notToDoList: totalNotToDoItems,
            selfDiscovery: selfDiscovery.length,
            legendProfiles: legendProfiles.length,
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
    
    if (!anonymousUser) {
      throw new Error("User not found");
    }
    
    // Check if user is actually anonymous (no email or isAnonymous flag)
    if (anonymousUser.email && !anonymousUser.isAnonymous) {
      throw new Error("User already has an email account");
    }
    
    // Update the user to have an email and remove anonymous flag
    await ctx.db.patch(args.anonymousUserId, {
      email: args.email,
      isAnonymous: false,
    });
    
    return { success: true, userId: args.anonymousUserId };
  },
});