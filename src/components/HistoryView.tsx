import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, BarChart3, Map } from "lucide-react";
import HistoryCalendar from "./history/HistoryCalendar";
import HistoryStatsCards from "./history/HistoryStatsCards";
import YearlyWarMapView from "./YearlyWarMapView";
import { startOfMonth, endOfMonth, format, addMonths, subMonths, eachDayOfInterval } from "date-fns";

interface HistoryViewProps {
  onNavigateToTimer: () => void;
}

export default function HistoryView({ onNavigateToTimer }: HistoryViewProps) {
  const [selectedYear, setSelectedYear] = useState<string>(new Date().getFullYear().toString());
  const [viewMode, setViewMode] = useState<"calendar" | "stats" | "warmap">("warmap");

  // Calendar State
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Queries
  const calendarTags = useQuery(api.history.getCalendarTags);
  
  const monthStart = startOfMonth(calendarDate);
  const monthEnd = endOfMonth(calendarDate);
  const dateRange = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const historyData = useQuery(api.history.getRange, {
    startDate: format(monthStart, "yyyy-MM-dd"),
    endDate: format(monthEnd, "yyyy-MM-dd"),
  });

  const handlePrevMonth = () => setCalendarDate(subMonths(calendarDate, 1));
  const handleNextMonth = () => setCalendarDate(addMonths(calendarDate, 1));

  // Calculate Stats
  const calculateStats = () => {
    if (!historyData) return null;
    
    let totalBlocks = 0;
    let completedBlocks = 0;
    let perfectDays = 0;
    let totalMinutes = 0;

    Object.values(historyData).forEach((day: any) => {
      if (day.stats) {
        totalBlocks += day.stats.totalBlocks || 0;
        completedBlocks += day.stats.completedBlocks || 0;
        
        // Check for perfect day (Rating 100 OR 100% completion of >0 blocks)
        const isPerfect = (day.stats.dailyRating === 100) || 
                          (day.stats.totalBlocks > 0 && day.stats.completedBlocks === day.stats.totalBlocks);
        if (isPerfect) perfectDays++;
      }
      
      // Estimate minutes (assuming 30 min blocks if not specified)
      if (day.blocks) {
         day.blocks.forEach((b: any) => {
           if (b.completed) {
             totalMinutes += 30; 
           }
         });
       }
    });

    return {
      completedBlocks,
      totalBlocks,
      perfectDays,
      totalMinutes
    };
  };

  const monthlyStats = calculateStats();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={onNavigateToTimer}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h2 className="text-2xl font-bold tracking-tight">History & Analytics</h2>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
              <SelectItem value="2026">2026</SelectItem>
            </SelectContent>
          </Select>

          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)} className="w-auto">
            <TabsList>
              <TabsTrigger value="warmap">
                <Calendar className="h-4 w-4 mr-2" />
                Heatmap
              </TabsTrigger>
              <TabsTrigger value="calendar">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="stats">
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {viewMode === "warmap" && (
        <YearlyWarMapView year={parseInt(selectedYear)} />
      )}

      {viewMode === "calendar" && (
        <HistoryCalendar 
          currentDate={calendarDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          dateRange={dateRange}
          historyData={historyData}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
          calendarTags={calendarTags || []}
        />
      )}

      {viewMode === "stats" && (
        <HistoryStatsCards monthlyStats={monthlyStats} />
      )}
    </div>
  );
}