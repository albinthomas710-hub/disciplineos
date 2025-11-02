import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get all notes for current user
export const getUserNotes = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  },
});

// Get notes by project
export const getNotesByProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return [];

    const notes = await ctx.db
      .query("notes")
      .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
      .collect();

    return notes.sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b.updatedAt - a.updatedAt;
    });
  },
});

// Get note by ID
export const getNote = query({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== user._id) return null;

    return note;
  },
});

// Create a new note
export const createNote = mutation({
  args: {
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    content: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    return await ctx.db.insert("notes", {
      userId: user._id,
      projectId: args.projectId,
      title: args.title,
      content: args.content || "",
      tags: [],
      isFavorite: false,
      isPinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Update a note
export const updateNote = mutation({
  args: {
    noteId: v.id("notes"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    projectId: v.optional(v.union(v.id("projects"), v.null())),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    const updates: any = { updatedAt: Date.now() };
    if (args.title !== undefined) updates.title = args.title;
    if (args.content !== undefined) updates.content = args.content;
    if (args.projectId !== undefined) updates.projectId = args.projectId;
    if (args.tags !== undefined) updates.tags = args.tags;

    await ctx.db.patch(args.noteId, updates);
  },
});

// Toggle favorite status
export const toggleFavorite = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      isFavorite: !note.isFavorite,
      updatedAt: Date.now(),
    });
  },
});

// Toggle pin status
export const togglePin = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.patch(args.noteId, {
      isPinned: !note.isPinned,
      updatedAt: Date.now(),
    });
  },
});

// Delete a note
export const deleteNote = mutation({
  args: { noteId: v.id("notes") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const note = await ctx.db.get(args.noteId);
    if (!note || note.userId !== user._id) {
      throw new Error("Note not found or unauthorized");
    }

    await ctx.db.delete(args.noteId);
  },
});
