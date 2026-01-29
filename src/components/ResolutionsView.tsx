import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Target, ShieldAlert, Sparkles, Trophy } from "lucide-react";
import { AddResolutionDialog } from "./resolutions/AddResolutionDialog";
import { ResolutionCard } from "./resolutions/ResolutionCard";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

export function ResolutionsView() {
  const resolutions = useQuery(api.resolutions.get);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Calculate date range: We want at least the last 30 days for history/streaks
  // and up to the end of the current month.
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  
  // Start date: 30 days ago to ensure we have enough history for streaks/visuals
  const startDateObj = new Date();
  startDateObj.setDate(now.getDate() - 30);
  const startDate = startDateObj.toISOString().split("T")[0];
  
  // End date: End of current month
  const endOfMonthObj = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const endDate = endOfMonthObj.toISOString().split("T")[0];
  
  const logs = useQuery(api.resolutions.getLogs, { startDate, endDate });

  if (resolutions === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/20 animate-ping" />
          <p className="text-muted-foreground font-medium">Loading your protocols...</p>
        </div>
      </div>
    );
  }

  const buildResolutions = resolutions.filter(r => r.type === "build");
  const breakResolutions = resolutions.filter(r => r.type === "break");

  // Helper to get streak
  const getStreak = (resolutionId: string) => {
    if (!logs) return 0;
    const resLogs = logs
      .filter(l => l.resolutionId === resolutionId && l.status === "success")
      .sort((a, b) => b.date.localeCompare(a.date)); // Descending date
    
    if (resLogs.length === 0) return 0;

    // Check if the most recent log is today or yesterday
    const lastLogDate = resLogs[0].date;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];

    if (lastLogDate !== today && lastLogDate !== yesterdayStr) {
      return 0;
    }

    // Simple consecutive count logic could go here, 
    // but for now we'll just return the total count in the fetched period (last 30 days)
    // as a "monthly consistency" metric which is often more encouraging.
    // To do real consecutive: iterate backwards from today/yesterday.
    
    let streak = 0;
    let currentCheckDate = new Date();
    // If not done today, start checking from yesterday
    if (lastLogDate !== today) {
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    }
    
    // This is a simplified consecutive check
    for (let i = 0; i < resLogs.length; i++) {
        const logDate = resLogs[i].date;
        const checkStr = currentCheckDate.toISOString().split("T")[0];
        
        if (logDate === checkStr) {
            streak++;
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else if (logDate < checkStr) {
            // Gap found
            break;
        }
    }
    return streak;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b pb-6">
        <div className="space-y-1">
          <h2 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Protocol Tracker
          </h2>
          <p className="text-muted-foreground text-lg font-medium">
            Architect your character. One day at a time.
          </p>
        </div>
        <Button 
          onClick={() => setIsAddOpen(true)} 
          size="lg"
          className="bg-primary text-primary-foreground shadow-xl hover:shadow-primary/25 hover:scale-105 transition-all duration-300 rounded-full px-6"
        >
          <Plus className="h-5 w-5 mr-2" />
          New Protocol
        </Button>
      </div>

      <div className="grid xl:grid-cols-2 gap-8">
        {/* Build Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Build Habits</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Non-Negotiable</p>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {buildResolutions.length} Active
            </span>
          </div>
          
          <div className="space-y-5">
            {buildResolutions.length === 0 ? (
              <Card className="border-dashed border-2 border-blue-200 bg-blue-50/30 dark:bg-blue-900/5">
                <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                    <Sparkles className="h-8 w-8 text-blue-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-lg">No active protocols</p>
                    <p className="text-muted-foreground">Define who you want to become.</p>
                  </div>
                  <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-2 border-blue-200 text-blue-600 hover:bg-blue-50">
                    Initialize Protocol
                  </Button>
                </CardContent>
              </Card>
            ) : (
              buildResolutions.map(res => (
                <ResolutionCard 
                  key={res._id} 
                  resolution={res} 
                  todayLog={logs?.find(l => l.resolutionId === res._id && l.date === today)}
                  recentLogs={logs?.filter(l => l.resolutionId === res._id) || []}
                  streak={getStreak(res._id)}
                />
              ))
            )}
          </div>
        </div>

        {/* Break Column */}
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
                <ShieldAlert className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-foreground">Break Vices</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Zero Tolerance</p>
              </div>
            </div>
            <span className="text-sm font-medium text-muted-foreground bg-muted px-3 py-1 rounded-full">
              {breakResolutions.length} Active
            </span>
          </div>

          <div className="space-y-5">
            {breakResolutions.length === 0 ? (
              <Card className="border-dashed border-2 border-red-200 bg-red-50/30 dark:bg-red-900/5">
                <CardContent className="p-12 text-center flex flex-col items-center gap-4">
                  <div className="h-16 w-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                    <Trophy className="h-8 w-8 text-red-500" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-lg">Clean slate</p>
                    <p className="text-muted-foreground">No vices to eliminate? Or are you hiding something?</p>
                  </div>
                  <Button onClick={() => setIsAddOpen(true)} variant="outline" className="mt-2 border-red-200 text-red-600 hover:bg-red-50">
                    Confront Weakness
                  </Button>
                </CardContent>
              </Card>
            ) : (
              breakResolutions.map(res => (
                <ResolutionCard 
                  key={res._id} 
                  resolution={res} 
                  todayLog={logs?.find(l => l.resolutionId === res._id && l.date === today)}
                  recentLogs={logs?.filter(l => l.resolutionId === res._id) || []}
                  streak={getStreak(res._id)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <AddResolutionDialog open={isAddOpen} onOpenChange={setIsAddOpen} />
    </div>
  );
}