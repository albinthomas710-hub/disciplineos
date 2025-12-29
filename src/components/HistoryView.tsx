import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { motion, AnimatePresence } from "framer-motion";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subMonths, addMonths, parseISO } from "date-fns";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle2, 
  Circle, 
  Clock, 
  Trophy,
  Target,
  ListTodo,
  Activity
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";

export default function HistoryView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch data for the current month
  const historyData = useQuery(api.history.getRange, {
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
  });

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayData = historyData?.[selectedDateStr];

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calculate monthly stats
  const monthlyStats = historyData ? Object.values(historyData).reduce((acc: any, day: any) => {
    acc.completedBlocks += day.stats.completedBlocks || 0;
    acc.totalBlocks += day.stats.totalBlocks || 0;
    acc.completedTasks += day.tasks?.filter((t: any) => t.completed).length || 0;
    acc.totalTasks += day.tasks?.length || 0;
    return acc;
  }, { completedBlocks: 0, totalBlocks: 0, completedTasks: 0, totalTasks: 0 }) : null;

  return (
    <div className="space-y-6">
      {/* Header & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-indigo-100 font-medium">Monthly Focus</p>
                <h3 className="text-3xl font-bold">
                  {monthlyStats ? Math.round((monthlyStats.completedBlocks / (monthlyStats.totalBlocks || 1)) * 100) : 0}%
                </h3>
                <p className="text-xs text-indigo-200 mt-1">Completion Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-emerald-100 font-medium">Tasks Crushed</p>
                <h3 className="text-3xl font-bold">
                  {monthlyStats?.completedTasks || 0}
                </h3>
                <p className="text-xs text-emerald-200 mt-1">Vectal Tasks Done</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white border-none shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Activity className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-orange-100 font-medium">Time Invested</p>
                <h3 className="text-3xl font-bold">
                  {monthlyStats ? Math.round(monthlyStats.completedBlocks * 0.5) : 0}h
                </h3>
                <p className="text-xs text-orange-200 mt-1">Approx. Deep Work</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendar Section */}
        <Card className="lg:col-span-5 xl:col-span-4 h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <CardTitle className="text-xl font-bold">History</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={prevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium min-w-[100px] text-center">
                {format(currentDate, "MMMM yyyy")}
              </span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2 text-center mb-2">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-xs text-muted-foreground font-medium">
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {dateRange.map((date, i) => {
                const dateStr = format(date, "yyyy-MM-dd");
                const dayData = historyData?.[dateStr];
                const completionRate = dayData?.stats.totalBlocks 
                  ? dayData.stats.completedBlocks / dayData.stats.totalBlocks 
                  : 0;
                
                const isSelected = isSameDay(date, selectedDate);
                
                // Determine color intensity based on completion
                let bgClass = "bg-secondary/50 hover:bg-secondary";
                if (dayData?.stats.totalBlocks > 0) {
                  if (completionRate >= 0.8) bgClass = "bg-green-500 hover:bg-green-600 text-white";
                  else if (completionRate >= 0.5) bgClass = "bg-green-400/70 hover:bg-green-500/70 text-white";
                  else if (completionRate > 0) bgClass = "bg-green-300/50 hover:bg-green-400/50";
                }

                return (
                  <motion.button
                    key={date.toString()}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(date)}
                    className={`
                      aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-colors
                      ${bgClass}
                      ${isSelected ? "ring-2 ring-primary ring-offset-2" : ""}
                    `}
                  >
                    <span className="font-medium">{format(date, "d")}</span>
                    {dayData?.tasks?.length > 0 && (
                      <div className="absolute bottom-1 right-1 w-1.5 h-1.5 rounded-full bg-blue-500" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Daily Detail Section */}
        <Card className="lg:col-span-7 xl:col-span-8 min-h-[500px]">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  {format(selectedDate, "EEEE, MMMM do")}
                </CardTitle>
                <p className="text-muted-foreground mt-1">
                  Daily Breakdown
                </p>
              </div>
              {selectedDayData && (
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                    <span>{selectedDayData.stats.completedBlocks} Blocks</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>{selectedDayData.tasks?.filter((t: any) => t.completed).length || 0} Tasks</span>
                  </div>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              {!selectedDayData ? (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mb-4 opacity-20" />
                  <p>No activity recorded for this day.</p>
                </div>
              ) : (
                <div className="space-y-8">
                  {/* Time Blocks Timeline */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Clock className="h-5 w-5 text-indigo-500" />
                      Time Blocks
                    </h3>
                    <div className="space-y-4 relative pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 ml-2">
                      {selectedDayData.blocks.length === 0 ? (
                        <p className="text-sm text-muted-foreground pl-4">No time blocks logged.</p>
                      ) : (
                        selectedDayData.blocks.map((block: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative pl-6"
                          >
                            <div className={`absolute -left-[21px] top-1 w-4 h-4 rounded-full border-2 ${
                              block.completed 
                                ? "bg-green-500 border-green-500" 
                                : "bg-background border-gray-300 dark:border-gray-600"
                            }`} />
                            
                            <div className={`p-4 rounded-xl border transition-all ${
                              block.completed 
                                ? "bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800" 
                                : "bg-card border-border"
                            }`}>
                              <div className="flex items-start justify-between mb-2">
                                <div>
                                  <h4 className={`font-semibold ${block.completed ? "text-green-700 dark:text-green-300" : ""}`}>
                                    {block.blockTitle}
                                  </h4>
                                  <div className="flex items-center gap-2 mt-1">
                                    <Badge variant="secondary" className="text-xs">
                                      {block.startTime} - {block.endTime}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {block.category}
                                    </Badge>
                                  </div>
                                </div>
                                {block.completed && (
                                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                                )}
                              </div>
                              {block.blockDescription && (
                                <p className="text-sm text-muted-foreground">
                                  {block.blockDescription}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* Vectal Tasks */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <ListTodo className="h-5 w-5 text-blue-500" />
                      Vectal Tasks
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(!selectedDayData.tasks || selectedDayData.tasks.length === 0) ? (
                        <p className="text-sm text-muted-foreground col-span-2">No tasks recorded.</p>
                      ) : (
                        selectedDayData.tasks.map((task: any, i: number) => (
                          <motion.div
                            key={i}
                            initial={{ y: 10, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.2 + (i * 0.05) }}
                            className={`p-3 rounded-lg border flex items-center gap-3 ${
                              task.completed 
                                ? "bg-blue-50/50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800" 
                                : "bg-card"
                            }`}
                          >
                            {task.completed ? (
                              <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0" />
                            ) : (
                              <Circle className="h-5 w-5 text-muted-foreground shrink-0" />
                            )}
                            <span className={`text-sm font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                              {task.title}
                            </span>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
