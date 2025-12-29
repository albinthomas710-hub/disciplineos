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
import { Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface YearlyWarMapViewProps {
  year: number;
}

export default function YearlyWarMapView({ year }: YearlyWarMapViewProps) {
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

  const getColor = (dateStr: string) => {
    const stats = yearlyData?.[dateStr];
    if (!stats || stats.total === 0) return "bg-secondary/30"; // No data

    const rate = stats.completed / stats.total;
    
    if (rate === 1) return "bg-amber-500"; // Perfect
    if (rate >= 0.8) return "bg-green-500"; // Great
    if (rate >= 0.6) return "bg-blue-500"; // Good
    if (rate >= 0.4) return "bg-purple-500"; // Okay
    if (rate > 0) return "bg-red-500"; // Struggling
    return "bg-secondary/30";
  };

  const getTooltip = (dateStr: string) => {
    const stats = yearlyData?.[dateStr];
    if (!stats || stats.total === 0) return "No activity";
    const rate = Math.round((stats.completed / stats.total) * 100);
    return `${rate}% Complete (${stats.completed}/${stats.total})`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {months.map((month) => {
          const days = eachDayOfInterval({
            start: startOfMonth(month),
            end: endOfMonth(month),
          });
          
          // Calculate offset for the first day of the month to align grid
          const startDay = getDay(startOfMonth(month)); // 0 = Sunday

          return (
            <Card key={month.toString()} className="border-none shadow-sm bg-card/50">
              <CardHeader className="p-3 pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-center">
                  {format(month, "MMMM")}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-3">
                <div className="grid grid-cols-7 gap-1">
                  {/* Day Headers */}
                  {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                    <div key={i} className="text-[10px] text-center text-muted-foreground font-medium">
                      {d}
                    </div>
                  ))}
                  
                  {/* Empty cells for offset */}
                  {Array.from({ length: startDay }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}

                  {/* Days */}
                  {days.map((date) => {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const colorClass = getColor(dateStr);
                    const isCurrentDay = isToday(date);

                    return (
                      <TooltipProvider key={dateStr}>
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <motion.div
                              whileHover={{ scale: 1.2, zIndex: 10 }}
                              className={`
                                aspect-square rounded-sm cursor-help relative
                                ${colorClass}
                                ${isCurrentDay ? "ring-2 ring-primary ring-offset-1" : ""}
                              `}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-bold">{format(date, "MMM do")}</p>
                            <p>{getTooltip(dateStr)}</p>
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

      {/* Legend */}
      <Card className="p-4 border-none bg-muted/30">
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-secondary/30" />
            <span>No Data</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-red-500" />
            <span>&lt; 40%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-purple-500" />
            <span>40-60%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-blue-500" />
            <span>60-80%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-green-500" />
            <span>80-99%</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-sm bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
            <span className="font-bold text-amber-600 dark:text-amber-400">100% Perfect</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
