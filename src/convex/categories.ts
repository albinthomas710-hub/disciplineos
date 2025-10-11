import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Default categories that come with the system
export const DEFAULT_CATEGORIES = [
  {
    name: "Focus",
    color: "from-blue-500 to-cyan-500",
    glowColor: "rgba(59,130,246,0.5)",
  },
  {
    name: "Health",
    color: "from-gray-500 to-slate-500",
    glowColor: "rgba(107,114,128,0.5)",
  },
  {
    name: "Spiritual",
    color: "from-purple-500 to-pink-500",
    glowColor: "rgba(168,85,247,0.5)",
  },
  {
    name: "Learning",
    color: "from-orange-500 to-red-500",
    glowColor: "rgba(249,115,22,0.5)",
  },
  {
    name: "General",
    color: "from-green-500 to-lime-500",
    glowColor: "rgba(34,197,94,0.6)",
  },
];

// Get all categories (default + custom) for current user
export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return DEFAULT_CATEGORIES;

    const customCategories = await ctx.db
      .query("customCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return [
      ...DEFAULT_CATEGORIES,
      ...customCategories.map((cat) => ({
        name: cat.name,
        color: cat.color,
        glowColor: cat.glowColor,
        isCustom: true,
        _id: cat._id,
      })),
    ];
  },
});

// Create custom category
export const create = mutation({
  args: {
    name: v.string(),
    color: v.string(),
    glowColor: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if category name already exists (default or custom)
    const existing = await ctx.db
      .query("customCategories")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const allNames = [
      ...DEFAULT_CATEGORIES.map((c) => c.name.toLowerCase()),
      ...existing.map((c) => c.name.toLowerCase()),
    ];

    if (allNames.includes(args.name.toLowerCase())) {
      throw new Error("Category name already exists");
    }

    return await ctx.db.insert("customCategories", {
      userId: user._id,
      name: args.name,
      color: args.color,
      glowColor: args.glowColor,
    });
  },
});

// Update custom category
export const update = mutation({
  args: {
    id: v.id("customCategories"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
    glowColor: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found");
    }

    await ctx.db.patch(args.id, {
      name: args.name,
      color: args.color,
      glowColor: args.glowColor,
    });
  },
});

// Delete custom category
export const remove = mutation({
  args: { id: v.id("customCategories") },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const category = await ctx.db.get(args.id);
    if (!category || category.userId !== user._id) {
      throw new Error("Category not found");
    }

    await ctx.db.delete(args.id);
  },
});
