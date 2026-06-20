import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Target, CheckCircle2, Zap, Sparkle } from "lucide-react";

interface ManifestationStatsProps {
  activeCount: number;
  achievedCount: number;
  avgEnergy: number;
  maxStreak: number;
}

export default function ManifestationStats({
  activeCount,
  achievedCount,
  avgEnergy,
  maxStreak,
}: ManifestationStatsProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      <div className="bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Target className="h-4 w-4 text-purple-600" />
          <span className="text-xs text-muted-foreground">Active</span>
        </div>
        <p className="text-2xl font-bold">{activeCount}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <span className="text-xs text-muted-foreground">Achieved</span>
        </div>
        <p className="text-2xl font-bold">{achievedCount}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Zap className="h-4 w-4 text-yellow-600" />
          <span className="text-xs text-muted-foreground">Avg Energy</span>
        </div>
        <p className="text-2xl font-bold">{avgEnergy}</p>
      </div>
      <div className="bg-white/50 dark:bg-gray-900/50 p-3 rounded-lg">
        <div className="flex items-center gap-2 mb-1">
          <Sparkle className="h-4 w-4 text-pink-600" />
          <span className="text-xs text-muted-foreground">Max Streak</span>
        </div>
        <p className="text-2xl font-bold">{maxStreak}</p>
      </div>
    </div>
  );
}
