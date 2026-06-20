import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get today's Not To Do List
export const getTodayItems = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    return existing;
  },
});

// Initialize today's Not To Do List (carry over items from yesterday)
export const initializeTodayItems = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];
    
    const existing = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (existing) return existing._id;

    // Get the most recent list to carry over items (not just yesterday)
    const allLists = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();
    
    // Sort by date descending and get the most recent one
    const sortedLists = allLists.sort((a, b) => b.date.localeCompare(a.date));
    const mostRecentList = sortedLists[0];

    // Carry over items but reset their "successfullyAvoided" status for today
    const carryOverItems = mostRecentList?.items.map(item => ({
      ...item,
      successfullyAvoided: false,
      lastChecked: Date.now(),
      totalAvoided: item.totalAvoided || 0, // Preserve total avoided count
    })) || [];

    return await ctx.db.insert("notToDoList", {
      userId,
      date: today,
      items: carryOverItems,
      totalAvoided: 0,
      lastChecked: Date.now(),
    });
  },
});

// Add a new item to avoid
export const addItem = mutation({
  args: {
    title: v.string(),
    category: v.string(),
    description: v.optional(v.string()),
    importance: v.number(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];
    
    let notToDoList = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (!notToDoList) {
      const id = await ctx.db.insert("notToDoList", {
        userId,
        date: today,
        items: [],
        totalAvoided: 0,
        lastChecked: Date.now(),
      });
      notToDoList = await ctx.db.get(id);
      if (!notToDoList) throw new Error("Failed to create list");
    }

    const newItem = {
      id: `${Date.now()}-${Math.random()}`,
      title: args.title,
      category: args.category,
      description: args.description,
      successfullyAvoided: false,
      importance: args.importance,
      color: args.color,
      createdAt: Date.now(),
      totalAvoided: 0,
      lastChecked: Date.now(),
    };

    await ctx.db.patch(notToDoList._id, {
      items: [...notToDoList.items, newItem],
      lastChecked: Date.now(),
    });

    return newItem.id;
  },
});

// Mark item as successfully avoided (and update totalAvoided counter)
export const markAvoided = mutation({
  args: {
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];
    
    const notToDoList = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (!notToDoList) throw new Error("List not found");

    const updatedItems = notToDoList.items.map(item => {
      if (item.id === args.itemId) {
        const newStatus = !item.successfullyAvoided;
        const currentTotal = item.totalAvoided || 0;
        return { 
          ...item, 
          successfullyAvoided: newStatus,
          totalAvoided: newStatus ? currentTotal + 1 : currentTotal,
          lastChecked: Date.now(),
        };
      }
      return item;
    });

    const totalAvoided = updatedItems.filter(item => item.successfullyAvoided).length;

    await ctx.db.patch(notToDoList._id, {
      items: updatedItems,
      totalAvoided,
      lastChecked: Date.now(),
    });

    return { totalAvoided, allAvoided: totalAvoided === updatedItems.length };
  },
});

// Delete an item
export const deleteItem = mutation({
  args: {
    itemId: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split('T')[0];
    
    const notToDoList = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId).eq("date", today))
      .first();

    if (!notToDoList) throw new Error("List not found");

    const updatedItems = notToDoList.items.filter(item => item.id !== args.itemId);
    const totalAvoided = updatedItems.filter(item => item.successfullyAvoided).length;

    await ctx.db.patch(notToDoList._id, {
      items: updatedItems,
      totalAvoided,
      lastChecked: Date.now(),
    });
  },
});

// Get weekly stats
export const getWeeklyStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date();
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const weekData = await ctx.db
      .query("notToDoList")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();

    const thisWeek = weekData.filter(d => {
      const date = new Date(d.date);
      return date >= weekAgo && date <= today;
    });

    const totalItems = thisWeek.reduce((sum, day) => sum + day.items.length, 0);
    const totalAvoided = thisWeek.reduce((sum, day) => sum + day.totalAvoided, 0);
    const successRate = totalItems > 0 ? Math.round((totalAvoided / totalItems) * 100) : 0;

    return {
      totalItems,
      totalAvoided,
      successRate,
      daysTracked: thisWeek.length,
    };
  },
});
