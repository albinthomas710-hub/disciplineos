import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// List all anonymous users with their data counts
export const listAnonymousUsers = query({
  args: {},
  handler: async (ctx) => {
    // Get current user to help identify which account is theirs
    const currentUserId = await getAuthUserId(ctx);
    
    // Get ALL users from the database (no filtering)
    const users = await ctx.db.query("users").collect();
    
    console.log(`[Recovery Debug] Found ${users.length} total users in database`);
    console.log(`[Recovery Debug] Current user ID: ${currentUserId}`);
    
    const anonymousUsers = [];
    
    for (const user of users) {
      // Include ALL users (anonymous or with email) to help find the real account
      // We'll show all accounts so the user can identify theirs by data
      if (true) {
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

        const accountData = {
          userId: user._id,
          isCurrentUser: currentUserId === user._id,
          createdAt: user._creationTime,
          currentStreak: user.currentStreak || 0,
          longestStreak: user.longestStreak || 0,
          totalDaysCompleted: user.totalDaysCompleted || 0,
          email: user.email || null,
          isAnonymous: user.isAnonymous,
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

            selfDiscovery: selfDiscovery.length,
            legendProfiles: legendProfiles.length,
          },
        };
        
        console.log(`[Recovery Debug] User ${user._id}:`, {
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

          selfDiscovery: selfDiscovery.length,
          legendProfiles: legendProfiles.length,
          email: user.email || 'none',
          isAnonymous: user.isAnonymous,
          isCurrentUser: currentUserId === user._id,
        });
        
        anonymousUsers.push(accountData);
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