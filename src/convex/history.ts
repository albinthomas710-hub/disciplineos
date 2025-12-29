import { v } from "convex/values";
import { query } from "./_generated/server";
import { getCurrentUser } from "./users";

export const getRange = query({
  args: {
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await getCurrentUser(ctx);
    if (!user) return null;

    // 1. Fetch Completion Logs (Time Blocks)
    const logs = await ctx.db
      .query("completionLogs")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // 2. Fetch Vectal Logs (Tasks)
    const vectalEntries = await ctx.db
      .query("vectal")
      .withIndex("by_user_and_date", (q) => 
        q.eq("userId", user._id).gte("date", args.startDate).lte("date", args.endDate)
      )
      .collect();

    // 3. Fetch Time Block Details
    // We need to get the titles for the blocks. 
    // Optimization: Collect unique IDs first.
    const blockIds = new Set(logs.map(l => l.timeBlockId));
    const blocksMap = new Map();
    
    await Promise.all(
      Array.from(blockIds).map(async (id) => {
        const block = await ctx.db.get(id);
        if (block) {
          blocksMap.set(id, block);
        }
      })
    );

    // 4. Fetch Timetables for context (colors, names)
    const timetableIds = new Set(Array.from(blocksMap.values()).map(b => b.timetableId));
    const timetablesMap = new Map();
    
    await Promise.all(
      Array.from(timetableIds).map(async (id) => {
        const timetable = await ctx.db.get(id as any);
        if (timetable) {
          timetablesMap.set(id, timetable);
        }
      })
    );

    // 5. Structure Data by Date
    const historyByDate: Record<string, any> = {};

    // Initialize dates in range (optional, but good for complete data)
    // For now, we'll just populate what we have.

    // Process Logs
    logs.forEach(log => {
      if (!historyByDate[log.date]) {
        historyByDate[log.date] = { blocks: [], tasks: [], stats: { completedBlocks: 0, totalBlocks: 0 } };
      }
      
      const block = blocksMap.get(log.timeBlockId);
      const timetable = block ? timetablesMap.get(block.timetableId) : null;

      if (block) { // Only add if block still exists
        historyByDate[log.date].blocks.push({
          ...log,
          blockTitle: block.title,
          blockDescription: block.description,
          category: block.category,
          startTime: block.startTime,
          endTime: block.endTime,
          timetableName: timetable?.name,
          timetableColor: timetable?.color,
        });
        
        if (log.completed) {
          historyByDate[log.date].stats.completedBlocks++;
        }
        historyByDate[log.date].stats.totalBlocks++;
      }
    });

    // Process Vectal
    vectalEntries.forEach(entry => {
      if (!historyByDate[entry.date]) {
        historyByDate[entry.date] = { blocks: [], tasks: [], stats: { completedBlocks: 0, totalBlocks: 0 } };
      }
      
      historyByDate[entry.date].tasks = entry.tasks;
      historyByDate[entry.date].vectalCompleted = entry.allCompleted;
    });

    // Sort blocks by time for each day
    Object.keys(historyByDate).forEach(date => {
      historyByDate[date].blocks.sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));
    });

    return historyByDate;
  },
});
