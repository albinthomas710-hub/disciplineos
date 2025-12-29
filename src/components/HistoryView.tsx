import { useState, useEffect } from "react";
import { useQuery, useMutation } from "convex/react";
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
  Activity,
  Star,
  Sparkles,
  Pencil,
  Save
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import YearlyWarMapView from "./YearlyWarMapView";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface HistoryViewProps {
  onNavigateToTimer?: () => void;
}

export default function HistoryView({ onNavigateToTimer }: HistoryViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "year">("month");
  
  // Monthly Goals State
  const [objectives, setObjectives] = useState("");
  const [notes, setNotes] = useState("");
  const [isEditingGoals, setIsEditingGoals] = useState(false);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const currentMonthStr = format(monthStart, "yyyy-MM");

  // Fetch data
  const historyData = useQuery(api.history.getRange, {
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
  });

  const monthlyGoals = useQuery(api.history.getMonthlyGoals, { month: currentMonthStr });
  const updateMonthlyGoals = useMutation(api.history.updateMonthlyGoals);
  
  // Fetch all timetables for the dropdown
  const allTimetables = useQuery(api.timetables.list);
  const setDayTimetable = useMutation(api.history.setDayTimetable);

  // Sync monthly goals when data loads
  useEffect(() => {
    if (monthlyGoals) {
      setObjectives(monthlyGoals.mainObjectives || "");
      setNotes(monthlyGoals.notes || "");
    } else {
      setObjectives("");
      setNotes("");
    }
  }, [monthlyGoals, currentMonthStr]);

  const handleSaveGoals = async () => {
    try {
      await updateMonthlyGoals({
        month: currentMonthStr,
        mainObjectives: objectives,
        notes: notes,
      });
      setIsEditingGoals(false);
      toast.success("Monthly goals saved");
    } catch (error) {
      toast.error("Failed to save goals");
    }
  };

  const selectedDateStr = format(selectedDate, "yyyy-MM-dd");
  const selectedDayData = historyData?.[selectedDateStr];

  const handleTimetableChange = async (timetableId: string) => {
    try {
      await setDayTimetable({
        date: selectedDateStr,
        timetableId: timetableId as any,
      });
      toast.success("Timetable updated for this day");
    } catch (error) {
      toast.error("Failed to update timetable");
    }
  };

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const handleMonthSelect = (date: Date) => {
    setCurrentDate(date);
    setViewMode("month");
  };

  const handleDaySelect = (date: Date) => {
    setCurrentDate(date);
    setSelectedDate(date);
    setViewMode("month");
  };

  // Calculate monthly stats
  const monthlyStats = historyData ? Object.values(historyData).reduce((acc: any, day: any) => {
    acc.completedBlocks += day.stats.completedBlocks || 0;
    acc.totalBlocks += day.stats.totalBlocks || 0;
    
    // Calculate Perfect Days (100% completion with at least 1 block)
    if (day.stats.totalBlocks > 0 && day.stats.completedBlocks === day.stats.totalBlocks) {
      acc.perfectDays += 1;
    }

    // Calculate actual time invested
    if (day.blocks) {
      day.blocks.forEach((block: any) => {
        if (block.completed && block.startTime && block.endTime) {
          const [h1, m1] = block.startTime.split(':').map(Number);
          const [h2, m2] = block.endTime.split(':').map(Number);
          let diff = (h2 * 60 + m2) - (h1 * 60 + m1);
          if (diff < 0) diff += 1440; // Handle midnight crossing
          acc.totalMinutes += diff;
        }
      });
    }
    
    return acc;
  }, { completedBlocks: 0, totalBlocks: 0, perfectDays: 0, totalMinutes: 0 }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">History & Progress</h2>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "year")} className="w-full sm:w-auto">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="month">Detailed Month</TabsTrigger>
            <TabsTrigger value="year">War Map (Year)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {viewMode === "year" ? (
        <YearlyWarMapView 
          year={currentDate.getFullYear()} 
          onMonthSelect={handleMonthSelect}
          onDaySelect={handleDaySelect}
        />
      ) : (
        <>
          {/* Header & Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Trophy className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                    <Trophy className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-indigo-100 font-medium text-sm">Monthly Focus</p>
                    <h3 className="text-3xl font-bold tracking-tight">
                      {monthlyStats ? Math.round((monthlyStats.completedBlocks / (monthlyStats.totalBlocks || 1)) * 100) : 0}%
                    </h3>
                    <p className="text-xs text-indigo-200 mt-1">Completion Rate</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-amber-400 to-orange-500 text-white border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-amber-100 font-medium text-sm">Perfect Days</p>
                    <h3 className="text-3xl font-bold tracking-tight">
                      {monthlyStats?.perfectDays || 0}
                    </h3>
                    <p className="text-xs text-amber-100 mt-1">100% Execution</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white border-none shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Activity className="h-24 w-24" />
              </div>
              <CardContent className="p-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm shadow-inner">
                    <Activity className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="text-blue-100 font-medium text-sm">Time Invested</p>
                    <h3 className="text-3xl font-bold tracking-tight">
                      {monthlyStats ? Math.round(monthlyStats.totalMinutes / 60) : 0}h
                    </h3>
                    <p className="text-xs text-blue-200 mt-1">Actual Deep Work</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Calendar Section */}
            <div className="lg:col-span-5 xl:col-span-4 space-y-6">
              <Card className="border-2 border-muted/50">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <CalendarIcon className="h-5 w-5 text-primary" />
                    History
                  </CardTitle>
                  <div className="flex items-center gap-2 bg-secondary/50 p-1 rounded-lg">
                    <Button variant="ghost" size="icon" onClick={prevMonth} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-sm min-w-[100px] text-center">
                      {format(currentDate, "MMMM yyyy")}
                    </span>
                    <Button variant="ghost" size="icon" onClick={nextMonth} className="h-8 w-8">
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
                    {dateRange.map((date, i) => {
                      const dateStr = format(date, "yyyy-MM-dd");
                      const dayData = historyData?.[dateStr];
                      const completionRate = dayData?.stats.totalBlocks 
                        ? dayData.stats.completedBlocks / dayData.stats.totalBlocks 
                        : 0;
                      
                      const isSelected = isSameDay(date, selectedDate);
                      const isPerfect = completionRate === 1 && dayData?.stats.totalBlocks > 0;
                      
                      // Determine color intensity based on completion
                      let bgClass = "bg-secondary/30 hover:bg-secondary/60 text-muted-foreground";
                      if (dayData?.stats.totalBlocks > 0) {
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
                          onClick={() => setSelectedDate(date)}
                          className={`
                            aspect-square rounded-xl flex flex-col items-center justify-center text-sm relative transition-all duration-200
                            ${bgClass}
                            ${isSelected ? "ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900 scale-105 z-10 font-bold" : ""}
                          `}
                        >
                          <span className="text-xs sm:text-sm">{format(date, "d")}</span>
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

              {/* Monthly Goals & Notes */}
              <Card className="border-2 border-muted/50">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg font-bold">Monthly Objectives</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => isEditingGoals ? handleSaveGoals() : setIsEditingGoals(true)}
                  >
                    {isEditingGoals ? <Save className="h-4 w-4 mr-2" /> : <Pencil className="h-4 w-4 mr-2" />}
                    {isEditingGoals ? "Save" : "Edit"}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Main Objectives</label>
                    {isEditingGoals ? (
                      <Textarea 
                        value={objectives} 
                        onChange={(e) => setObjectives(e.target.value)} 
                        placeholder="What are your main goals for this month?"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg text-sm min-h-[100px] whitespace-pre-wrap">
                        {objectives || <span className="text-muted-foreground italic">No objectives set.</span>}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Notes</label>
                    {isEditingGoals ? (
                      <Textarea 
                        value={notes} 
                        onChange={(e) => setNotes(e.target.value)} 
                        placeholder="Any notes, reflections, or reminders?"
                        className="min-h-[100px]"
                      />
                    ) : (
                      <div className="p-3 bg-muted/30 rounded-lg text-sm min-h-[100px] whitespace-pre-wrap">
                        {notes || <span className="text-muted-foreground italic">No notes added.</span>}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Daily Detail Section */}
            <Card className="lg:col-span-7 xl:col-span-8 min-h-[500px] border-2 border-muted/50">
              <CardHeader className="border-b bg-muted/10">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-2xl flex items-center gap-2">
                      {format(selectedDate, "EEEE, MMMM do")}
                    </CardTitle>
                    <div className="flex flex-col gap-1 mt-1">
                      <div className="flex items-center gap-2">
                        {allTimetables ? (
                          <Select 
                            value={selectedDayData?.stats.timetableId || ""} 
                            onValueChange={handleTimetableChange}
                          >
                            <SelectTrigger className="h-7 text-xs w-auto min-w-[140px] bg-background border-primary/20 text-primary">
                              <div className="flex items-center gap-1">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                <SelectValue placeholder="Select Timetable" />
                              </div>
                            </SelectTrigger>
                            <SelectContent>
                              {allTimetables.map((tt) => (
                                <SelectItem key={tt._id} value={tt._id}>
                                  {tt.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          selectedDayData?.stats.timetableName && (
                            <Badge variant="outline" className="text-xs font-normal bg-primary/5 border-primary/20 text-primary">
                              <CalendarIcon className="h-3 w-3 mr-1" />
                              {selectedDayData.stats.timetableName}
                            </Badge>
                          )
                        )}
                        {selectedDayData?.stats.isOverride && (
                          <Badge variant="secondary" className="text-[10px] h-5 px-1.5">
                            Manual Override
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-2 text-sm mt-1">
                        <Sparkles className="h-4 w-4 text-amber-500" />
                        Make it Satisfying: Review your wins
                      </p>
                    </div>
                  </div>
                  {selectedDayData && (
                    <div className="flex gap-3 text-sm font-medium">
                      <div className="px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 flex items-center gap-2 border border-green-200 dark:border-green-800">
                        <div className="w-2 h-2 rounded-full bg-green-500" />
                        <span>{selectedDayData.stats.completedBlocks} Blocks</span>
                      </div>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[800px]">
                  <div className="p-6">
                    {!selectedDayData ? (
                      <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                        <div className="bg-muted/50 p-6 rounded-full mb-4">
                          <CalendarIcon className="h-12 w-12 opacity-20" />
                        </div>
                        <p className="text-lg font-medium">No activity recorded</p>
                        <p className="text-sm opacity-70">Start your timer to build your history</p>
                      </div>
                    ) : (
                      <div className="space-y-8">
                        {/* Perfect Day Banner */}
                        {selectedDayData.stats.totalBlocks > 0 && selectedDayData.stats.completedBlocks === selectedDayData.stats.totalBlocks && (
                          <motion.div 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex items-center gap-4"
                          >
                            <div className="bg-amber-500 p-2 rounded-full text-white shadow-lg shadow-amber-500/30">
                              <Trophy className="h-6 w-6" />
                            </div>
                            <div>
                              <h4 className="font-bold text-amber-800 dark:text-amber-200">Perfect Day!</h4>
                              <p className="text-sm text-amber-700 dark:text-amber-300">You completed 100% of your scheduled blocks. Outstanding discipline.</p>
                            </div>
                          </motion.div>
                        )}

                        {/* Time Blocks Timeline */}
                        <div>
                          <h3 className="text-lg font-bold mb-6 flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
                            <Clock className="h-5 w-5" />
                            Time Blocks Timeline
                          </h3>
                          <div className="space-y-6 relative pl-4 border-l-2 border-indigo-100 dark:border-indigo-900 ml-2">
                            {selectedDayData.blocks.length === 0 ? (
                              <p className="text-sm text-muted-foreground pl-4 italic">No time blocks logged.</p>
                            ) : (
                              selectedDayData.blocks.map((block: any, i: number) => (
                                <motion.div
                                  key={i}
                                  initial={{ x: -20, opacity: 0 }}
                                  animate={{ x: 0, opacity: 1 }}
                                  transition={{ delay: i * 0.05 }}
                                  className="relative pl-8 group cursor-pointer"
                                  onClick={onNavigateToTimer}
                                >
                                  <div className={`absolute -left-[23px] top-1/2 -translate-y-1/2 w-5 h-5 rounded-full border-4 border-background transition-colors duration-300 ${
                                    block.completed 
                                      ? "bg-green-500 ring-2 ring-green-200 dark:ring-green-900" 
                                      : "bg-gray-300 dark:bg-gray-600"
                                  }`} />
                                  
                                  <div className={`p-4 rounded-xl border transition-all duration-300 hover:shadow-md group-hover:border-primary/50 ${
                                    block.completed 
                                      ? "bg-gradient-to-r from-green-50/80 to-emerald-50/80 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800" 
                                      : "bg-card border-border"
                                  }`}>
                                    <div className="flex items-start justify-between mb-2">
                                      <div>
                                        <h4 className={`font-bold text-base ${block.completed ? "text-green-800 dark:text-green-200" : ""}`}>
                                          {block.blockTitle}
                                        </h4>
                                        <div className="flex items-center gap-2 mt-1.5">
                                          <Badge variant="secondary" className="text-xs font-mono bg-background/50">
                                            {block.startTime} - {block.endTime}
                                          </Badge>
                                          <Badge variant="outline" className="text-xs border-primary/20 text-primary">
                                            {block.category}
                                          </Badge>
                                        </div>
                                      </div>
                                      {block.completed && (
                                        <div className="bg-green-100 dark:bg-green-900/50 p-1.5 rounded-full">
                                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                                        </div>
                                      )}
                                    </div>
                                    {block.blockDescription && (
                                      <p className="text-sm text-muted-foreground mt-2 pl-1 border-l-2 border-primary/10">
                                        {block.blockDescription}
                                      </p>
                                    )}
                                  </div>
                                </motion.div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}