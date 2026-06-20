import { defineTable } from "convex/server";
import { v } from "convex/values";

// Quotes Saver - motivational quotes and advice
export const quotes = defineTable({
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
  .index("by_user_and_chain", ["userId", "chainId"]);

// Legend Profiles - author/legend information
export const legendProfiles = defineTable({
  userId: v.id("users"),
  name: v.string(),
  bio: v.string(),
  story: v.string(), // Why this legend inspires the user
  imageUrl: v.optional(v.string()),
  category: v.optional(v.string()), // "entrepreneur", "philosopher", "athlete", etc.
  createdAt: v.number(),
}).index("by_user", ["userId"])
  .index("by_user_and_name", ["userId", "name"]);

// Quote Chains - wisdom paths
export const quoteChains = defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.string(),
  theme: v.string(), // "discipline journey", "success mindset", etc.
  color: v.string(), // gradient colors
  createdAt: v.number(),
}).index("by_user", ["userId"]);

// Projects - organize work and learning
export const projects = defineTable({
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
  .index("by_user_and_status", ["userId", "status"]);

// Notes - rich text notes for projects
export const notes = defineTable({
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
  .index("by_user_and_favorite", ["userId", "isFavorite"]);

// Holy Videos Collection
export const holyVideos = defineTable({
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
  .index("by_user_and_favorite", ["userId", "isFavorite"]);

// Video Library - Organize YouTube videos by custom categories
export const videoCategories = defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.string(), // gradient colors
  icon: v.optional(v.string()),
  createdAt: v.number(),
}).index("by_user", ["userId"]);

export const videoLibrary = defineTable({
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
  .index("by_user_and_favorite", ["userId", "isFavorite"]);

// Advice Library - Store and organize advice by categories
export const adviceCategories = defineTable({
  userId: v.id("users"),
  name: v.string(),
  description: v.optional(v.string()),
  color: v.string(), // gradient colors
  createdAt: v.number(),
  isDeleted: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),
}).index("by_user", ["userId"])
  .index("by_user_and_deleted", ["userId", "isDeleted"]);

export const adviceLibrary = defineTable({
  userId: v.id("users"),
  categoryId: v.id("adviceCategories"),
  title: v.string(),
  content: v.string(),
  source: v.optional(v.string()), // Where the advice came from
  tags: v.optional(v.array(v.string())),
  isFavorite: v.boolean(),
  createdAt: v.number(),
  isDeleted: v.optional(v.boolean()),
  deletedAt: v.optional(v.number()),
}).index("by_user", ["userId"])
  .index("by_category", ["categoryId"])
  .index("by_user_and_favorite", ["userId", "isFavorite"])
  .index("by_user_and_deleted", ["userId", "isDeleted"]);
