import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion } from "framer-motion";
import { 
  format, 
  eachDayOfInterval, 
  endOfMonth, 
  startOfMonth, 
  eachMonthOfInterval, 
  startOfYear, 
  endOfYear, 
  getDay,
  isToday
} from "date-fns";
import { Loader2, Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";

interface YearlyWarMapViewProps {
  year: number;
  onMonthSelect?: (date: Date) => void;
  onDaySelect?: (date: Date) => void;
}

export default function YearlyWarMapView({ year, onMonthSelect, onDaySelect }: YearlyWarMapViewProps) {
  const yearlyData = useQuery(api.history.getYearlyStats, { year });

  const yearStart = startOfYear(new Date(year, 0, 1));
  const yearEnd = endOfYear(new Date(year, 0, 1));
  const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });

  if (yearlyData === undefined) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getDayStatus = (dateStr: string) => {
    const stats = yearlyData?.[dateStr];
    
    // If we have a daily rating (Verdict), prioritize that for coloring
    if (stats?.dailyRating !== undefined && stats.dailyRating > 0) {
      const rating = stats.dailyRating;
      if (rating >= 90) return { label: `Legendary (${rating})`, color: "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]", text: "text-amber-600 dark:text-amber-400" };
      if (rating >= 80) return { label: `Excellent (${rating})`, color: "bg-green-500", text: "text-green-600 dark:text-green-400" };
      if (rating >= 60) return { label: `Good (${rating})`, color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" };
      if (rating >= 40) return { label: `Average (${rating})`, color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" };
      return { label: `Weak (${rating})`, color: "bg-red-500", text: "text-red-600 dark:text-red-400" };
    }

    // Fallback to block completion if no rating
    if (!stats || stats.total === 0) return { label: "No Activity", color: "bg-secondary/30", text: "text-muted-foreground" };

    const rate = stats.completed / stats.total;
    
    if (rate >= 1) return { label: "Perfect Day", color: "bg-amber-500", text: "text-amber-600 dark:text-amber-400" };
    if (rate >= 0.8) return { label: "High Performance", color: "bg-green-500", text: "text-green-600 dark:text-green-400" };
    if (rate >= 0.6) return { label: "Building Momentum", color: "bg-blue-500", text: "text-blue-600 dark:text-blue-400" };
    if (rate >= 0.4) return { label: "Making Progress", color: "bg-purple-500", text: "text-purple-600 dark:text-purple-400" };
    return { label: "Off Track", color: "bg-red-500", text: "text-red-600 dark:text-red-400" };
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Legend - Moved to top for visibility */}
      <Card className="p-4 border-none bg-muted/30">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Info className="h-4 w-4" />
            <span>War Map Key (Based on Daily Verdict or Completion)</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-secondary/30" />
              <span>No Activity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-red-500" />
              <span>Weak / Off Track</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-purple-500" />
              <span>Average / Progress</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-blue-500" />
              <span>Good / Momentum</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-green-500" />
              <span>Excellent</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
              <span className="font-bold text-amber-600 dark:text-amber-400">Legendary</span>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month) => {
          const days = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month),
          });
          
          const startDay = getDay(startOfMonth(month));

          return (
            <Card key={month.toString()} className="border-none shadow-sm bg-card/50 hover:shadow-md transition-shadow">
              <CardHeader className="p-3 pb-2">
                <Button 
                  variant="ghost" 
                  className="w-full hover:bg-primary/10 hover:text-primary"
                  onClick={() => onMonthSelect?.(month)}
                >
                  <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">
                    {format(month, "MMMM")}
                  </CardTitle>
                </Button>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
                      {d}
                    </div>
                  ))}
                  
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {days.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const status = getDayStatus(dateStr);
                    const isCurrentDay = isToday(date);
                    const stats = yearlyData?.[dateStr];

                    return (
                      <TooltipProvider key={dateStr}>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.2, zIndex: 10 }}
                              onClick={() => onDaySelect?.(date)}
                              className={`
                                aspect-square rounded-sm cursor-pointer relative transition-colors
                                ${status.color}
                                ${isCurrentDay ? "ring-2 ring-primary ring-offset-1" : ""}
                              `}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs p-2">
                            <p className="font-bold mb-1">{format(date, "MMM do, yyyy")}</p>
                            <div className="flex items-center gap-2 mb-1">
                              <div className={`w-2 h-2 rounded-full ${status.color}`} />
                              <span className={`font-medium ${status.text}`}>{status.label}</span>
                            </div>
                            {stats && (stats.total > 0 || stats.dailyRating !== undefined) && (
                              <div className="text-muted-foreground">
                                {stats.dailyRating !== undefined ? (
                                  <p className="font-bold text-primary">Verdict: {stats.dailyRating}/100</p>
                                ) : (
                                  <p>{Math.round((stats.completed / stats.total) * 100)}% ({stats.completed}/{stats.total})</p>
                                )}
                                {(stats as any).timetableName && (
                                  <p className="text-[10px] opacity-80 mt-1 font-medium text-primary/80">
                                    {(stats as any).timetableName}
                                  </p>
                                )}
                              </div>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}