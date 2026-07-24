import { cronJobs } from "convex/server";

const crons = cronJobs();

// All cron jobs temporarily disabled to reduce database bandwidth usage.
// The shared Convex plan has limited bandwidth, and scanning all user records
// daily/weekly was consuming too much.
//
// Streak calculation still happens per-user on each block completion
// (see completionLogs.ts -> updateStreak) so streaks still work.

export default crons;