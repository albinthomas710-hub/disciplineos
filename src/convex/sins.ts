// Stub - sinList and sinLogs tables were removed
// All functions return empty results / no-ops
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getActive = query({
  args: {},
  handler: async () => {
    return [];
  },
});

export const getConquered = query({
  args: {},
  handler: async () => {
    return [];
  },
});

export const getInbox = query({
  args: {},
  handler: async () => {
    return [];
  },
});

export const getLogs = query({
  args: {},
  handler: async () => {
    return [];
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    category: v.optional(v.string()),
    scriptureAntidote: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async () => {
    return null;
  },
});

export const batchLogRelapse = mutation({
  args: {
    sinIds: v.array(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async () => {},
});

export const logRelapse = mutation({
  args: {
    sinId: v.string(),
    notes: v.optional(v.string()),
    trigger: v.optional(v.string()),
  },
  handler: async () => {},
});

export const confess = mutation({
  args: {
    sinId: v.string(),
    notes: v.optional(v.string()),
  },
  handler: async () => {},
});

export const toggleStatus = mutation({
  args: { sinId: v.string() },
  handler: async () => {},
});

export const updateStatus = mutation({
  args: { sinId: v.string(), status: v.string() },
  handler: async () => {},
});

export const togglePrayedFor = mutation({
  args: { sinId: v.string() },
  handler: async () => {},
});

export const remove = mutation({
  args: { sinId: v.string() },
  handler: async () => {},
});
