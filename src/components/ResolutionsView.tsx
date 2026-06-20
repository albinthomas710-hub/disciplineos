import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, Target, ShieldAlert, Sparkles, Trophy, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Flame, CheckCircle2, XCircle } from "lucide-react";
import { AddResolutionDialog } from "./resolutions/AddResolutionDialog";
import { ResolutionCard } from "./resolutions/ResolutionCard";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export function ResolutionsView() {
  const resolutions = useQuery(api.resolutions.get);
  const [isAddOpen, setIsAddOpen] = useState(false);
  
  // Date State
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => date.toISOString().split("T")[0];
  const selectedDateStr = formatDate(selectedDate);
  
  // Calculate date range for fetching logs
  // Fetching 90 days for better streak calculation
  const now = new Date();
  const todayStr = formatDate(now);
  
  const startDateObj = new Date(selectedDate);
  startDateObj.setDate(startDateObj.getDate() - 90); // 90 days back
  const startDate = formatDate(startDateObj);
  
  const endDateObj = new Date(selectedDate);
  endDateObj.setDate(endDateObj.getDate() + 1); // Include selected date
  const endDate = formatDate(endDateObj);
  
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
  const totalResolutions = resolutions.length;

  // Calculate Daily Progress
  const todaysLogs = logs?.filter(l => l.date === selectedDateStr) || [];
  const successCount = todaysLogs.filter(l => l.status === "success").length;
  const failureCount = todaysLogs.filter(l => l.status === "failure").length;
  const progressPercentage = totalResolutions > 0 ? (successCount / totalResolutions) * 100 : 0;

  // Helper to get streak
  const getStreak = (resolutionId: string) => {
    if (!logs) return 0;
    const resLogs = logs
      .filter(l => l.resolutionId === resolutionId && l.status === "success")
      .sort((a, b) => b.date.localeCompare(a.date)); // Descending date
    
    if (resLogs.length === 0) return 0;

    let streak = 0;
    let currentCheckDate = new Date(selectedDate);
    
    // If selected date is not logged yet, check from yesterday
    const selectedLog = resLogs.find(l => l.date === selectedDateStr);
    if (!selectedLog) {
        currentCheckDate.setDate(currentCheckDate.getDate() - 1);
    }
    
    for (let i = 0; i < 90; i++) { // Limit check to fetched range
        const checkStr = formatDate(currentCheckDate);
        const hasLog = resLogs.some(l => l.date === checkStr);
        
        if (hasLog) {
            streak++;
            currentCheckDate.setDate(currentCheckDate.getDate() - 1);
        } else {
            break;
        }
    }
    return streak;
  };

  // Calculate Best Streak (Max of all current streaks)
  const bestStreak = resolutions.reduce((max, res) => {
    const streak = getStreak(res._id);
    return streak > max ? streak : max;
  }, 0);

  const navigateDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const isToday = selectedDateStr === todayStr;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Header & Date Navigation */}
      <div className="flex flex-col gap-6 border-b pb-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
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

        {/* Date Navigator */}
        <div className="flex items-center justify-between bg-muted/30 p-2 rounded-2xl border max-w-md mx-auto md:mx-0">
            <Button variant="ghost" size="icon" onClick={() => navigateDate(-1)} className="h-10 w-10 rounded-full hover:bg-background">
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex flex-col items-center min-w-[140px]">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {isToday ? "Today" : "Viewing"}
              </span>
              <div className="flex items-center gap-2 text-lg font-bold">
                <CalendarIcon className="h-4 w-4 text-primary" />
                {selectedDate.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigateDate(1)} 
              disabled={isToday}
              className={cn("h-10 w-10 rounded-full hover:bg-background", isToday && "opacity-50")}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-3 gap-4 md:gap-8">
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border-green-100 dark:border-green-900/50 shadow-sm">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-2 text-center">
              <span className="text-3xl md:text-5xl font-black text-green-600 dark:text-green-400 tracking-tight">
                {successCount}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-green-700/70 dark:text-green-400/70 tracking-widest uppercase flex items-center gap-1.5">
                <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4" /> Wins
              </span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-100 dark:border-amber-900/50 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-10">
              <Flame className="h-16 w-16 text-amber-500" />
            </div>
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-2 text-center relative z-10">
              <span className="text-3xl md:text-5xl font-black text-amber-600 dark:text-amber-400 tracking-tight">
                {bestStreak}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-amber-700/70 dark:text-amber-400/70 tracking-widest uppercase flex items-center gap-1.5">
                <Flame className="h-3 w-3 md:h-4 md:w-4" /> Best Streak
              </span>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20 border-red-100 dark:border-red-900/50 shadow-sm">
            <CardContent className="p-4 md:p-6 flex flex-col items-center justify-center gap-1 md:gap-2 text-center">
              <span className="text-3xl md:text-5xl font-black text-red-600 dark:text-red-400 tracking-tight">
                {failureCount}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-red-700/70 dark:text-red-400/70 tracking-widest uppercase flex items-center gap-1.5">
                <XCircle className="h-3 w-3 md:h-4 md:w-4" /> Slips
              </span>
            </CardContent>
          </Card>
        </div>
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
                <h3 className="font-bold text-xl text-foreground">Sacred Commitments</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">New Habits • No Excuses</p>
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
                  date={selectedDateStr}
                  log={logs?.find(l => l.resolutionId === res._id && l.date === selectedDateStr)}
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
                <h3 className="font-bold text-xl text-foreground">The Kill List</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Things to Avoid • Boundaries</p>
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
                  date={selectedDateStr}
                  log={logs?.find(l => l.resolutionId === res._id && l.date === selectedDateStr)}
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