import { format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Star } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface HistoryCalendarProps {
  currentDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  dateRange: Date[];
  historyData: any;
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  calendarTags: any[];
}

export default function HistoryCalendar({
  currentDate,
  onPrevMonth,
  onNextMonth,
  dateRange,
  historyData,
  selectedDate,
  onSelectDate,
  calendarTags,
}: HistoryCalendarProps) {
  // Calculate the starting day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDay = dateRange.length > 0 ? dateRange[0].getDay() : 0;
  const blanks = Array.from({ length: startDay });

  return (
    <Card className="border-2 border-muted/50">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-xl font-bold flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-primary" />
          History
        </CardTitle>
        <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
          <Button variant="ghost" size="icon" onClick={onPrevMonth} className="h-8 w-8">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="font-semibold text-sm min-w-[100px] text-center">
            {format(currentDate, "MMMM yyyy")}
          </span>
          <Button variant="ghost" size="icon" onClick={onNextMonth} className="h-8 w-8">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-7 gap-2 text-center mb-2">
          {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
            <div key={day} className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {/* Add empty slots for days before the start of the month */}
          {blanks.map((_, i) => (
            <div key={`blank-${i}`} className="aspect-square" />
          ))}
          
          {dateRange.map((date) => {
            const dateStr = format(date, "yyyy-MM-dd");
            const dayData = historyData?.[dateStr];
            
            // Prioritize Daily Verdict (Rating) for visualization
            const dailyRating = dayData?.stats?.dailyRating;
            
            const completionRate = dayData?.stats.totalBlocks 
              ? dayData.stats.completedBlocks / dayData.stats.totalBlocks 
              : 0;
            
            const isSelected = isSameDay(date, selectedDate);
            // Perfect if rating is 100 OR completion is 100%
            const isPerfect = (dailyRating === 100) || (completionRate === 1 && dayData?.stats.totalBlocks > 0);
            const dayTags = dayData?.tags || [];
            
            // Determine color intensity based on Verdict (primary) or Completion (fallback)
            let bgClass = "bg-secondary/30 hover:bg-secondary/60 text-muted-foreground";
            
            if (dailyRating !== undefined && dailyRating > 0) {
              // Verdict-based coloring (Matches War Map)
              if (dailyRating >= 90) bgClass = "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/20";
              else if (dailyRating >= 80) bgClass = "bg-green-500 hover:bg-green-600 text-white shadow-sm";
              else if (dailyRating >= 60) bgClass = "bg-blue-500 hover:bg-blue-600 text-white";
              else if (dailyRating >= 40) bgClass = "bg-orange-500 hover:bg-orange-600 text-white";
              else bgClass = "bg-red-500 hover:bg-red-600 text-white";
            } else if (dayData?.stats.totalBlocks > 0) {
              // Fallback to Block Completion
              if (isPerfect) bgClass = "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md shadow-orange-200 dark:shadow-orange-900/20";
              else if (completionRate >= 0.8) bgClass = "bg-green-500 hover:bg-green-600 text-white shadow-sm";
              else if (completionRate >= 0.5) bgClass = "bg-green-400/80 hover:bg-green-500/80 text-white";
              else if (completionRate > 0) bgClass = "bg-green-200 dark:bg-green-900/40 text-green-900 dark:text-green-100";
            }

            return (
              <motion.button
                key={date.toString()}
                whileHover={{ scale: 1.1, zIndex: 10 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onSelectDate(date)}
                className={`
                  aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all duration-200
                  ${bgClass}
                  ${isSelected ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 scale-105 z-10 font-bold" : ""}
                `}
              >
                <span className="text-xs sm:text-sm">{format(date, "d")}</span>
                
                {/* Tag Indicators */}
                {dayTags.length > 0 && calendarTags && (
                  <div className="absolute bottom-1 flex gap-0.5 justify-center w-full px-1">
                    {dayTags.slice(0, 3).map((tagId: any) => {
                      const tag = calendarTags.find((t: any) => t._id === tagId);
                      if (!tag) return null;
                      return (
                        <div key={tagId} className={`w-1.5 h-1.5 rounded-full ${tag.color}`} />
                      );
                    })}
                    {dayTags.length > 3 && (
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                    )}
                  </div>
                )}

                {isPerfect && (
                  <motion.div 
                    initial={{ scale: 0 }} 
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Star className="h-3 w-3 text-yellow-200 fill-yellow-200 drop-shadow-sm" />
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}