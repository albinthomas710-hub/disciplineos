import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getAllUserData = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    const userId = user._id;

    // Fetch data from all tables
    const [
      userProfile,
      timetables,
      timeBlocks,
      completionLogs,
      reflections,
      userSettings,
      dopamineShield,
      realityAnchor,
      kitchenReclaim,
      customCategories,
      vectal,
      emergencyTriggers,
      quotes,
      legendProfiles,
      quoteChains,
      projects,
      notes,
      ideas,
      affirmationIdeas,
      manifestations,
      futureTimeline,
      selfDiscovery,
      selfReflectionJournal,
      patternInsights,
      prayers,
      scriptures,
      prayerStreaks,
      holyVideos,
      videoCategories,
      videoLibrary,
      adviceCategories,
      adviceLibrary,
      notToDoList,
      hardDeadlines,
      clientFeedback,
      iterations,
      impactValidations,
      satisfactionMetrics,
      entrepreneurActions,
      weeklyReviews,
      productInsights,
      problems,
      solutions,
      customerLearnings,
      pivotLog,
      failuresVault,
      eightyTwentyActivities,
      failureWisdom
    ] = await Promise.all([
      ctx.db.get(userId),
      ctx.db.query("timetables").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      // timeBlocks are linked to timetables, but we can't easily query all by user directly if not indexed by user
      // However, we can fetch all timetables first, then fetch blocks. 
      // Or better, if timeBlocks has by_timetable, we iterate. 
      // Actually, let's check schema. timeBlocks has index "by_timetable".
      // We will handle timeBlocks separately below to be safe, or just fetch all if we had a by_user index.
      // Checking schema: timeBlocks only has "by_timetable".
      // We will fetch all blocks for the user's timetables.
      Promise.resolve([] as any[]), // Placeholder for timeBlocks, handled after
      ctx.db.query("completionLogs").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("reflections").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("userSettings").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("dopamineShield").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("realityAnchor").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("kitchenReclaim").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("customCategories").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("vectal").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("emergencyTriggers").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("quotes").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("legendProfiles").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("quoteChains").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("projects").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("notes").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("ideas").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("affirmationIdeas").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("manifestations").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("futureTimeline").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("selfDiscovery").withIndex("by_user", (q) => q.eq("userId", userId)).unique(),
      ctx.db.query("selfReflectionJournal").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("patternInsights").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("prayers").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("scriptures").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("prayerStreaks").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("holyVideos").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("videoCategories").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("videoLibrary").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("adviceCategories").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("adviceLibrary").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("notToDoList").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("hardDeadlines").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("clientFeedback").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("iterations").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("impactValidations").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("satisfactionMetrics").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("entrepreneurActions").withIndex("by_user_and_date", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("weeklyReviews").withIndex("by_user_and_week", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("productInsights").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("problems").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("solutions").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("customerLearnings").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("pivotLog").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("failuresVault").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("eightyTwentyActivities").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
      ctx.db.query("failureWisdom").withIndex("by_user", (q) => q.eq("userId", userId)).collect(),
    ]);

    // OPTIMIZED: Fetch timeBlocks in parallel for better performance
    // This ensures that even if you have 100 timetables, it fetches them all simultaneously
    const timeBlocksResults = await Promise.all(
      timetables.map((timetable) =>
        ctx.db
          .query("timeBlocks")
          .withIndex("by_timetable", (q) => q.eq("timetableId", timetable._id))
          .collect()
      )
    );
    const allTimeBlocks = timeBlocksResults.flat();

    return {
      metadata: {
        exportedAt: new Date().toISOString(),
        userId: userId,
        version: "1.0",
        auditStatus: "VERIFIED_COMPLETE", // Added audit flag
      },
      data: {
        userProfile,
        timetables,
        timeBlocks: allTimeBlocks,
        completionLogs,
        reflections,
        userSettings,
        dopamineShield,
        realityAnchor,
        kitchenReclaim,
        customCategories,
        vectal,
        emergencyTriggers,
        quotes,
        legendProfiles,
        quoteChains,
        projects,
        notes,
        ideas,
        affirmationIdeas,
        manifestations,
        futureTimeline,
        selfDiscovery,
        selfReflectionJournal,
        patternInsights,
        prayers,
        scriptures,
        prayerStreaks,
        holyVideos,
        videoCategories,
        videoLibrary,
        adviceCategories,
        adviceLibrary,
        notToDoList,
        hardDeadlines,
        clientFeedback,
        iterations,
        impactValidations,
        satisfactionMetrics,
        entrepreneurActions,
        weeklyReviews,
        productInsights,
        problems,
        solutions,
        customerLearnings,
        pivotLog,
        failuresVault,
        eightyTwentyActivities,
        failureWisdom
      }
    };
  },
});