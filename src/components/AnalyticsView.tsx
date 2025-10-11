import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import { Calendar, Flame, Loader2, Target, TrendingUp } from "lucide-react";

export default function AnalyticsView() {
  const todayLogs = useQuery(api.completionLogs.getToday);
  const recentReflections = useQuery(api.reflections.getRecent, { limit: 7 });

  // Calculate last 7 days data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split("T")[0];
  }).reverse();

  const completionRate = todayLogs
    ? Math.round(
        (todayLogs.filter((log) => log.completed).length / todayLogs.length) *
          100
      ) || 0
    : 0;

  if (!todayLogs) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                Today's Completion
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">{completionRate}%</div>
                <Progress value={completionRate} />
                <p className="text-sm text-muted-foreground">
                  {todayLogs.filter((log) => log.completed).length} of{" "}
                  {todayLogs.length} blocks completed
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Flame className="h-5 w-5 text-orange-600" />
                Consistency Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {completionRate >= 80 ? "🔥" : "💪"} {completionRate >= 80 ? "On Fire!" : "Keep Going!"}
                </div>
                <p className="text-sm text-muted-foreground">
                  {completionRate >= 80
                    ? "You're crushing it today!"
                    : "Push through to reach 80%"}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                Weekly Reflections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold">
                  {recentReflections?.length || 0}
                </div>
                <p className="text-sm text-muted-foreground">
                  Reflections completed this week
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Reflections */}
      {recentReflections && recentReflections.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Reflections
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentReflections.map((reflection, i) => (
                <motion.div
                  key={reflection._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="p-4 border rounded-lg space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{reflection.date}</span>
                  </div>
                  <div className="space-y-1 text-sm">
                    <p>
                      <span className="font-medium text-green-600">
                        Did well:
                      </span>{" "}
                      {reflection.didWell}
                    </p>
                    <p>
                      <span className="font-medium text-red-600">
                        Broke discipline:
                      </span>{" "}
                      {reflection.brokeDispline}
                    </p>
                    <p>
                      <span className="font-medium text-blue-600">
                        Improvement:
                      </span>{" "}
                      {reflection.improvement}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
