import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, Zap, Calendar } from "lucide-react";

interface ProgressAnalyticsProps {
  manifestation: any;
}

export function ProgressAnalytics({ manifestation }: ProgressAnalyticsProps) {
  const dailyActions = manifestation.dailyActions || [];
  const evidenceLog = manifestation.evidenceLog || [];
  const visualizationSessions = manifestation.visualizationSessions || [];
  const obstacles = manifestation.obstacles || [];
  
  const totalActions = dailyActions.reduce((sum: number, day: any) => sum + day.actions.length, 0);
  const actionStreak = manifestation.actionStreak || 0;
  const visualizationStreak = manifestation.visualizationStreak || 0;
  
  // Calculate action-to-evidence correlation
  const actionDays = dailyActions.length;
  const evidenceDays = evidenceLog.length;
  const correlationRate = actionDays > 0 ? Math.round((evidenceDays / actionDays) * 100) : 0;
  
  // Days since creation
  const daysSinceCreation = Math.floor((Date.now() - manifestation.createdAt) / (1000 * 60 * 60 * 24));
  const daysActive = Math.max(daysSinceCreation, 1);
  
  // Average actions per day
  const avgActionsPerDay = (totalActions / daysActive).toFixed(1);
  
  return (
    <Card className="border-2 border-blue-200 dark:border-blue-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-600" />
          <span>Progress Analytics</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          {/* Total Actions */}
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Total Actions</span>
            </div>
            <p className="text-2xl font-bold">{totalActions}</p>
            <p className="text-xs text-muted-foreground">{avgActionsPerDay} per day</p>
          </div>
          
          {/* Evidence Collected */}
          <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-blue-600" />
              <span className="text-xs text-muted-foreground">Evidence</span>
            </div>
            <p className="text-2xl font-bold">{evidenceLog.length}</p>
            <p className="text-xs text-muted-foreground">signs collected</p>
          </div>
          
          {/* Action Streak */}
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">🔥</span>
              <span className="text-xs text-muted-foreground">Action Streak</span>
            </div>
            <p className="text-2xl font-bold">{actionStreak}</p>
            <p className="text-xs text-muted-foreground">days consistent</p>
          </div>
          
          {/* Days Active */}
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="h-4 w-4 text-purple-600" />
              <span className="text-xs text-muted-foreground">Days Active</span>
            </div>
            <p className="text-2xl font-bold">{daysActive}</p>
            <p className="text-xs text-muted-foreground">since creation</p>
          </div>
        </div>

        {/* Action-to-Result Correlation */}
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/30 dark:to-blue-950/30 rounded-lg border-2 border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-bold">Action → Evidence Correlation</p>
            <Badge className={`${
              correlationRate >= 70 ? "bg-green-500" :
              correlationRate >= 40 ? "bg-yellow-500" : "bg-red-500"
            } text-white`}>
              {correlationRate}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            {correlationRate >= 70 
              ? "🎯 Excellent! Your actions are producing visible results."
              : correlationRate >= 40
              ? "⚡ Good progress. Keep taking action and documenting evidence."
              : "🚀 Take more daily actions to see results faster."}
          </p>
        </div>

        {/* Obstacles Overcome */}
        {obstacles.length > 0 && (
          <div className="p-3 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <p className="text-sm font-bold mb-1">💪 Resilience Score</p>
            <p className="text-2xl font-bold">{obstacles.length}</p>
            <p className="text-xs text-muted-foreground">obstacles overcome</p>
          </div>
        )}

        {/* Visualization Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Visualization Sessions</p>
            <p className="text-xl font-bold">{visualizationSessions.length}</p>
          </div>
          <div className="p-3 bg-pink-50 dark:bg-pink-950/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Visualization Streak</p>
            <p className="text-xl font-bold">{visualizationStreak} days</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
