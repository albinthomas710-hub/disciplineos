import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { TrendingUp, Target, Flame, AlertTriangle, Calendar, Zap } from "lucide-react";

interface ManifestationDashboardProps {
  manifestations: any[];
}

export function ManifestationDashboard({ manifestations }: ManifestationDashboardProps) {
  const activeManifestations = manifestations.filter(m => !m.isAchieved);
  const achievedCount = manifestations.filter(m => m.isAchieved).length;
  
  // Calculate aggregate stats
  const totalActions = manifestations.reduce((sum, m) => {
    const dailyActions = m.dailyActions || [];
    return sum + dailyActions.reduce((s: number, d: any) => s + d.actions.length, 0);
  }, 0);
  
  const totalEvidence = manifestations.reduce((sum, m) => sum + (m.evidenceLog?.length || 0), 0);
  const maxActionStreak = Math.max(...manifestations.map(m => m.actionStreak || 0), 0);
  const avgEnergy = Math.round(manifestations.reduce((acc, m) => acc + (m.energyScore || 0), 0) / manifestations.length) || 0;
  
  // Calculate days wasted (manifestations with no actions in last 2 days)
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const daysWasted = activeManifestations.filter(m => {
    const lastActionDate = m.lastActionDate;
    return !lastActionDate || (lastActionDate !== today && lastActionDate !== yesterday);
  }).length;
  
  // Calculate urgency (manifestations with target dates within 30 days)
  const urgentCount = activeManifestations.filter(m => {
    if (!m.targetDate) return false;
    const daysUntil = Math.floor((new Date(m.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil > 0 && daysUntil <= 30;
  }).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Action Streak - PROMINENT */}
      <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
        <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Flame className="h-8 w-8 text-orange-600 animate-pulse" />
              <Badge className="bg-orange-600 text-white text-lg px-3 py-1">
                {maxActionStreak} days
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-orange-700 dark:text-orange-300">Action Streak</h3>
            <p className="text-sm text-muted-foreground mt-1">Longest consistency run</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Total Actions */}
      <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
        <Card className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Zap className="h-8 w-8 text-green-600" />
              <Badge className="bg-green-600 text-white text-lg px-3 py-1">
                {totalActions}
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-green-700 dark:text-green-300">Total Actions</h3>
            <p className="text-sm text-muted-foreground mt-1">Steps taken toward goals</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Evidence Collected */}
      <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
        <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30 shadow-xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <Target className="h-8 w-8 text-blue-600" />
              <Badge className="bg-blue-600 text-white text-lg px-3 py-1">
                {totalEvidence}
              </Badge>
            </div>
            <h3 className="text-2xl font-black text-blue-700 dark:text-blue-300">Evidence</h3>
            <p className="text-sm text-muted-foreground mt-1">Proof it's working</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* PAIN TRIGGER: Days Wasted */}
      {daysWasted > 0 && (
        <motion.div 
          whileHover={{ scale: 1.05 }} 
          className="cursor-pointer"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <Card className="border-4 border-red-500 dark:border-red-700 bg-gradient-to-br from-red-100 to-orange-100 dark:from-red-950/50 dark:to-orange-950/50 shadow-2xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <AlertTriangle className="h-8 w-8 text-red-600 animate-pulse" />
                <Badge className="bg-red-600 text-white text-lg px-3 py-1 animate-pulse">
                  {daysWasted}
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-red-700 dark:text-red-300">DAYS WASTED</h3>
              <p className="text-sm text-red-600 dark:text-red-400 font-bold mt-1">No action taken!</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Urgency Trigger */}
      {urgentCount > 0 && (
        <motion.div whileHover={{ scale: 1.05 }} className="cursor-pointer">
          <Card className="border-2 border-yellow-400 dark:border-yellow-600 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950/30 dark:to-orange-950/30 shadow-xl">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <Calendar className="h-8 w-8 text-yellow-600" />
                <Badge className="bg-yellow-600 text-white text-lg px-3 py-1">
                  {urgentCount}
                </Badge>
              </div>
              <h3 className="text-2xl font-black text-yellow-700 dark:text-yellow-300">Urgent Goals</h3>
              <p className="text-sm text-muted-foreground mt-1">Due within 30 days</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Action → Evidence Correlation */}
      <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 shadow-xl md:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-purple-600" />
            Action → Evidence Correlation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Actions Taken</span>
              <span className="text-2xl font-bold text-green-600">{totalActions}</span>
            </div>
            <Progress value={Math.min((totalActions / Math.max(totalActions, totalEvidence, 1)) * 100, 100)} className="h-3" />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Evidence Collected</span>
              <span className="text-2xl font-bold text-blue-600">{totalEvidence}</span>
            </div>
            <Progress value={Math.min((totalEvidence / Math.max(totalActions, totalEvidence, 1)) * 100, 100)} className="h-3" />
            <p className="text-xs text-muted-foreground text-center pt-2">
              {totalEvidence >= totalActions * 0.5 
                ? "🎯 Excellent! Your actions are producing visible results."
                : "⚡ Take more actions to see faster results."}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <Card className="border-2 border-gray-300 dark:border-gray-700 md:col-span-2">
        <CardHeader>
          <CardTitle className="text-lg">Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Active Goals</p>
              <p className="text-3xl font-bold">{activeManifestations.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Achieved</p>
              <p className="text-3xl font-bold text-green-600">{achievedCount}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Energy</p>
              <p className="text-3xl font-bold text-purple-600">{avgEnergy}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-3xl font-bold text-blue-600">
                {manifestations.length > 0 ? Math.round((achievedCount / manifestations.length) * 100) : 0}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
