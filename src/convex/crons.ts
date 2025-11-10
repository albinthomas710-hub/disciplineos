import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Run streak calculation daily at midnight UTC
crons.daily(
  "calculate daily streaks",
  { hourUTC: 0, minuteUTC: 0 },
  (internal as any).streaks.calculateDailyStreaks
);

// Reset dopamine shield bypass attempts daily
crons.daily(
  "reset dopamine shield attempts",
  { hourUTC: 0, minuteUTC: 0 },
  (internal as any).dopamineShield.resetDailyAttempts
);

// Reset reality anchor weekly counters
crons.weekly(
  "reset reality anchor weekly",
  { hourUTC: 0, minuteUTC: 0, dayOfWeek: "monday" },
  (internal as any).realityAnchor.resetWeeklyCounter
);

// Reset kitchen reclaim weekly stats
crons.weekly(
  "reset kitchen reclaim weekly",
  { hourUTC: 0, minuteUTC: 0, dayOfWeek: "monday" },
  (internal as any).kitchenReclaim.resetWeeklyStats
);

// Process recurring vectal tasks daily
crons.daily(
  "process recurring vectal tasks",
  { hourUTC: 0, minuteUTC: 5 },
  (internal as any).vectal.processRecurringTasks
);

export default crons;