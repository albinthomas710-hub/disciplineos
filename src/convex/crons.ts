import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up rate limit entries every 5 minutes to prevent table bloat
crons.interval("cleanup-rate-limits", { minutes: 5 }, internal.rateLimiting.cleanup);

// All other cron jobs disabled to reduce database bandwidth usage.
// Streak calculation still happens per-user on each block completion.

export default crons;
