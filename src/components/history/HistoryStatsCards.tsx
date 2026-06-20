import { Card, CardContent } from "@/components/ui/card";
import { Trophy, Star, Activity } from "lucide-react";

interface HistoryStatsCardsProps {
  monthlyStats: {
    completedBlocks: number;
    totalBlocks: number;
    perfectDays: number;
    totalMinutes: number;
  } | null;
}

export default function HistoryStatsCards({ monthlyStats }: HistoryStatsCardsProps) {
  return (
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
  );
}
