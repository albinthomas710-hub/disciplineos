import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getCurrentUser } from "./users";

// Get today's vectal tasks
export const getTodayTasks = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];
    
    const vectalRecord = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    return vectalRecord;
  },
});

// Initialize today's tasks if they don't exist
export const initializeTodayTasks = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];
    
    const existing = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    if (existing) return existing._id;

    const defaultTasks = [
      { id: "1", title: "Morning Routine", completed: false, importance: 90, isRecurring: true },
      { id: "2", title: "Focus Work Block", completed: false, importance: 100, isRecurring: true },
      { id: "3", title: "Exercise/Movement", completed: false, importance: 80, isRecurring: true },
      { id: "4", title: "Learning Session", completed: false, importance: 95, isRecurring: true },
      { id: "5", title: "Evening Reflection", completed: false, importance: 85, isRecurring: true },
    ];

    return await ctx.db.insert("vectal", {
      userId: user._id,
      date: today,
      tasks: defaultTasks,
      allCompleted: false,
      lastChecked: Date.now(),
    });
  },
});

// Toggle task completion
export const toggleTask = mutation({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];
    
    const vectalRecord = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    if (!vectalRecord) throw new Error("Vectal record not found");

    const updatedTasks = vectalRecord.tasks.map((task: any) =>
      task.id === args.taskId ? { ...task, completed: !task.completed } : task
    );

    const allCompleted = updatedTasks.every((task: any) => task.completed);

    await ctx.db.patch(vectalRecord._id, {
      tasks: updatedTasks,
      allCompleted,
      lastChecked: Date.now(),
    });

    return { allCompleted };
  },
});

// Add custom task
export const addTask = mutation({
  args: {
    title: v.string(),
    importance: v.optional(v.number()),
    isRecurring: v.optional(v.boolean()),
    dueDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];
    
    const vectalRecord = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    if (!vectalRecord) throw new Error("Vectal record not found");

    const newTask = {
      id: crypto.randomUUID(),
      title: args.title,
      completed: false,
      importance: args.importance ?? 50,
      isRecurring: args.isRecurring ?? true,
      dueDate: args.dueDate,
    };

    const updatedTasks = [...vectalRecord.tasks, newTask];

    await ctx.db.patch(vectalRecord._id, {
      tasks: updatedTasks,
      allCompleted: false,
    });
  },
});

// Delete task
export const deleteTask = mutation({
  args: {
    taskId: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];
    
    const vectalRecord = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    if (!vectalRecord) throw new Error("Vectal record not found");

    const updatedTasks = vectalRecord.tasks.filter((task: any) => task.id !== args.taskId);
    const allCompleted = updatedTasks.every((task: any) => task.completed);

    await ctx.db.patch(vectalRecord._id, {
      tasks: updatedTasks,
      allCompleted,
    });
  },
});

// Check if all tasks completed (for daily check)
export const checkDailyCompletion = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const today = new Date().toISOString().split("T")[0];
    
    const vectalRecord = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => q.eq("userId", user._id).eq("date", today))
      .first();

    if (!vectalRecord) return { allCompleted: false, totalTasks: 0, completedTasks: 0 };

    const completedTasks = vectalRecord.tasks.filter((task: any) => task.completed).length;
    const totalTasks = vectalRecord.tasks.length;

    return {
      allCompleted: vectalRecord.allCompleted,
      totalTasks,
      completedTasks,
    };
  },
});
