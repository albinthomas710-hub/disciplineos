import { defineTable } from "convex/server";
import { v } from "convex/values";
import { roleValidator } from "./validators";

export const users = defineTable({
  name: v.optional(v.string()), // name of the user. do not remove
  image: v.optional(v.string()), // image of the user. do not remove
  email: v.optional(v.string()), // email of the user. do not remove
  emailVerificationTime: v.optional(v.number()), // email verification time. do not remove
  isAnonymous: v.optional(v.boolean()), // is the user anonymous. do not remove

  role: v.optional(roleValidator), // role of the user. do not remove
  
  // DisciplineOS specific fields
  currentStreak: v.optional(v.number()),
  longestStreak: v.optional(v.number()),
  totalDaysCompleted: v.optional(v.number()),
  activeTimetableId: v.optional(v.id("timetables")),
  hasCompletedShieldOnboarding: v.optional(v.boolean()),
})
  .index("email", ["email"])
  .searchIndex("search_name", {
    searchField: "name",
    filterFields: ["email"],
  });

export const userSettings = defineTable({
  userId: v.id("users"),
  focusModeEnabled: v.optional(v.boolean()),
  soundEnabled: v.optional(v.boolean()),
  notificationsEnabled: v.optional(v.boolean()),
  theme: v.optional(v.string()), // "light", "dark", "auto"
}).index("by_user", ["userId"]);
