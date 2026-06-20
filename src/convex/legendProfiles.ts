import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all legend profiles
export const getUserProfiles = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const profiles = await ctx.db
      .query("legendProfiles")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return profiles.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Get profile by name
export const getByName = query({
  args: { name: v.string() },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const profile = await ctx.db
      .query("legendProfiles")
      .withIndex("by_user_and_name", (q) => 
        q.eq("userId", user._id).eq("name", args.name)
      )
      .first();

    return profile;
  },
});

// Create or update legend profile
export const upsertProfile = mutation({
  args: {
    name: v.string(),
    bio: v.string(),
    story: v.string(),
    imageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if profile exists
    const existing = await ctx.db
      .query("legendProfiles")
      .withIndex("by_user_and_name", (q) => 
        q.eq("userId", user._id).eq("name", args.name)
      )
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        bio: args.bio,
        story: args.story,
        imageUrl: args.imageUrl,
        category: args.category,
      });
      return existing._id;
    } else {
      return await ctx.db.insert("legendProfiles", {
        userId: user._id,
        name: args.name,
        bio: args.bio,
        story: args.story,
        imageUrl: args.imageUrl,
        category: args.category,
        createdAt: Date.now(),
      });
    }
  },
});

// Delete legend profile
export const deleteProfile = mutation({
  args: {
    profileId: v.id("legendProfiles"),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const profile = await ctx.db.get(args.profileId);
    if (!profile || profile.userId !== user._id) {
      throw new Error("Profile not found or unauthorized");
    }

    await ctx.db.delete(args.profileId);
  },
});
