import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all projects for current user
export const getUserProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get active projects
export const getActiveProjects = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const projects = await ctx.db
      .query("projects")
      .withIndex("by_user_and_status", (q) => 
        q.eq("userId", user._id).eq("status", "active")
      )
      .collect();

    return projects.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get project by ID
export const getProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) return null;

    return project;
  },
});

// Create a new project
export const createProject = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    color: v.string(),
    icon: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("projects", {
      userId: user._id,
      name: args.name,
      description: args.description,
      color: args.color,
      icon: args.icon,
      isFavorite: false,
      status: "active",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a project
export const updateProject = mutation({
  args: {
    projectId: v.id("projects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    color: v.optional(v.string()),
    icon: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.description !== undefined) updates.description = args.description;
    if (args.color !== undefined) updates.color = args.color;
    if (args.icon !== undefined) updates.icon = args.icon;
    if (args.status !== undefined) updates.status = args.status;

    await ctx.db.patch(args.projectId, updates);
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized");
    }

    await ctx.db.patch(args.projectId, {
      isFavorite: !project.isFavorite,
      updatedAt: Date.now(),
    });
  },
});

// Delete a project
export const deleteProject = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const project = await ctx.db.get(args.projectId);
    if (!project || project.userId !== user._id) {
      throw new Error("Project not found or unauthorized");
    }

    // Delete all notes in this project
    const notes = await ctx.db
      .query("notes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    for (const note of notes) {
      await ctx.db.delete(note._id);
    }

    await ctx.db.delete(args.projectId);
  },
});
