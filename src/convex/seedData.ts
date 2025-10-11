import { mutation } from "./_generated/server";
import { getCurrentUser } from "./users";

// Seed default timetable for new users
export const seedDefaultTimetable = mutation({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) throw new Error("Not authenticated");

    // Check if user already has timetables
    const existing = await ctx.db
      .query("timetables")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .first();

    if (existing) return existing._id;

    // Create default "School Day Routine"
    const timetableId = await ctx.db.insert("timetables", {
      userId: user._id,
      name: "School Day Routine",
      description: "My daily discipline schedule for school days",
      color: "#6366f1",
      isActive: true,
    });

    // Create time blocks
    const blocks = [
      {
        title: "Wake Up & Energize",
        description: "Stretch, make bed, drink water",
        startTime: "05:00",
        endTime: "05:30",
        category: "Health",
        order: 1,
      },
      {
        title: "Meditation & Prayer",
        description: "Breathe deeply, pray, practice gratitude",
        startTime: "05:30",
        endTime: "06:30",
        category: "Spiritual",
        order: 2,
      },
      {
        title: "Bible & Reading",
        description: "Study scripture and read for 30 minutes",
        startTime: "06:30",
        endTime: "07:30",
        category: "Learning",
        order: 3,
      },
      {
        title: "Breakfast & Prep",
        description: "Energize and get ready for school",
        startTime: "07:30",
        endTime: "08:00",
        category: "Health",
        order: 4,
      },
      {
        title: "School",
        description: "Focused learning and growth",
        startTime: "08:00",
        endTime: "15:00",
        category: "Learning",
        order: 5,
      },
      {
        title: "Break & Rest",
        description: "Recharge and relax",
        startTime: "15:00",
        endTime: "16:00",
        category: "Health",
        order: 6,
      },
      {
        title: "AI/Automation Learning",
        description: "Deep work mode - build and learn",
        startTime: "16:00",
        endTime: "18:00",
        category: "Focus",
        order: 7,
      },
      {
        title: "Exercise & Shower",
        description: "Body reset and physical training",
        startTime: "18:00",
        endTime: "19:00",
        category: "Health",
        order: 8,
      },
      {
        title: "Dinner & Family Time",
        description: "Connect and nourish",
        startTime: "19:00",
        endTime: "20:30",
        category: "Health",
        order: 9,
      },
      {
        title: "Review Day & Sleep Prep",
        description: "Reflect, pray, and prepare for rest",
        startTime: "20:30",
        endTime: "21:30",
        category: "Spiritual",
        order: 10,
      },
    ];

    for (const block of blocks) {
      await ctx.db.insert("timeBlocks", {
        timetableId,
        ...block,
        notificationEnabled: true,
      });
    }

    // Update user
    await ctx.db.patch(user._id, {
      activeTimetableId: timetableId,
      currentStreak: 0,
      longestStreak: 0,
      totalDaysCompleted: 0,
    });

    return timetableId;
  },
});
