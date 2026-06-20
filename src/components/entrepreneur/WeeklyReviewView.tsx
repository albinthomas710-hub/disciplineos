import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Calendar,
  TrendingUp,
  Target,
  Users,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Zap,
  Award,
  Loader2,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  useAllProblems,
  useProblemStats,
  useAllCustomerLearnings,
  useAllPivots,
  useAllFailures,
  useDeadlineStats,
  useActiveDeadlines,
  useOverdueDeadlines,
  useEightyTwentyInsights,
  useTopPerformers,
} from "@/hooks/use-problem-vault-queries";

export function WeeklyReviewView() {
  const problems = useAllProblems();
  const problemStats = useProblemStats();
  const learnings = useAllCustomerLearnings();
  const pivots = useAllPivots();
  const failures = useAllFailures();
  const deadlineStats = useDeadlineStats();
  const activeDeadlines = useActiveDeadlines();
  const overdueDeadlines = useOverdueDeadlines();
  const eightyTwentyInsights = useEightyTwentyInsights();
  const topPerformers = useTopPerformers();

  if (!problems || !problemStats || !learnings) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Get this week's data (last 7 days)
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
  const thisWeekProblems = problems?.filter((p: any) => p.createdAt >= oneWeekAgo) || [];
  const thisWeekLearnings = learnings?.filter((l: any) => l.createdAt >= oneWeekAgo) || [];
  const thisWeekPivots = pivots?.filter((p: any) => p.createdAt >= oneWeekAgo) || [];
  const thisWeekFailures = failures?.filter((f: any) => f.createdAt >= oneWeekAgo) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6" />
            Weekly Problem Review
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Review your problem discovery, validation progress, and learnings from the past 7 days
          </p>
        </CardHeader>
      </Card>

      {/* Weekly Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">New Problems</h4>
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {thisWeekProblems.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">discovered this week</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
          <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-green-900 dark:text-green-100">Customer Talks</h4>
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {thisWeekLearnings.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">conversations logged</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
          <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-purple-900 dark:text-purple-100">Pivots</h4>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {thisWeekPivots.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">strategic changes</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}>
          <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-orange-900 dark:text-orange-100">Lessons</h4>
                <Lightbulb className="h-5 w-5 text-orange-600" />
              </div>
              <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                {thisWeekFailures.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">failures documented</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Overall Progress */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Overall Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Total Problems Discovered</span>
              <span className="text-sm font-bold">{problemStats.totalProblems}</span>
            </div>
            <Progress value={(problemStats.totalProblems / 50) * 100} className="h-2" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Problems Validated</span>
              <span className="text-sm font-bold">{problemStats.problemsValidated}</span>
            </div>
            <Progress 
              value={problemStats.totalProblems > 0 ? (problemStats.problemsValidated / problemStats.totalProblems) * 100 : 0} 
              className="h-2 bg-green-200" 
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Solutions Shipped</span>
              <span className="text-sm font-bold">{problemStats.solutionsShipped}</span>
            </div>
            <Progress 
              value={problemStats.totalProblems > 0 ? (problemStats.solutionsShipped / problemStats.totalProblems) * 100 : 0} 
              className="h-2 bg-blue-200" 
            />
          </div>
        </CardContent>
      </Card>

      {/* Deadline Status */}
      {deadlineStats && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Deadline Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                  {deadlineStats.totalActive}
                </p>
                <p className="text-sm text-muted-foreground">Active</p>
              </div>
              <div className="text-center p-4 bg-red-50 dark:bg-red-950/30 rounded-lg">
                <p className="text-2xl font-bold text-red-700 dark:text-red-300">
                  {deadlineStats.totalOverdue}
                </p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                  {deadlineStats.totalCompleted}
                </p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                  {deadlineStats.completionRate}%
                </p>
                <p className="text-sm text-muted-foreground">Success Rate</p>
              </div>
            </div>

            {overdueDeadlines && overdueDeadlines.length > 0 && (
              <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-2 border-red-500">
                <h4 className="font-bold text-red-900 dark:text-red-100 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  ⚠️ Overdue Deadlines
                </h4>
                <div className="space-y-2">
                  {overdueDeadlines.slice(0, 3).map((deadline: any) => (
                    <div key={deadline._id} className="text-sm">
                      <p className="font-semibold">{deadline.title}</p>
                      <p className="text-muted-foreground">Due: {deadline.deadline}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 80/20 Focus Insights */}
      {eightyTwentyInsights && eightyTwentyInsights.totalActivities > 0 && (
        <Card className="border-2 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              80/20 Focus Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg">
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                  {eightyTwentyInsights.impactPercentageFromTop}%
                </p>
                <p className="text-sm text-muted-foreground">Impact from Top 20%</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  {eightyTwentyInsights.totalActivities}
                </p>
                <p className="text-sm text-muted-foreground">Total Activities</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                  {Math.round(eightyTwentyInsights.totalImpact)}
                </p>
                <p className="text-sm text-muted-foreground">Total Impact Score</p>
              </div>
            </div>

            {topPerformers && topPerformers.length > 0 && (
              <div className="mt-4">
                <h4 className="font-bold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-green-600" />
                  Top Performing Activities
                </h4>
                <div className="space-y-2">
                  {topPerformers.slice(0, 3).map((activity: any, index: number) => (
                    <div key={activity._id} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg flex items-center justify-between">
                      <div>
                        <Badge className="bg-green-600 text-white mr-2">#{index + 1}</Badge>
                        <span className="font-semibold">{activity.activityName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        Efficiency: <strong>{activity.efficiencyRatio}</strong>
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* This Week's Highlights */}
      {(thisWeekProblems.length > 0 || thisWeekLearnings.length > 0) && (
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5" />
              This Week's Highlights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {thisWeekProblems.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-blue-700 dark:text-blue-300">
                  🎯 New Problems Discovered ({thisWeekProblems.length})
                </h4>
                <div className="space-y-2">
                  {thisWeekProblems.slice(0, 3).map((problem: any) => (
                    <div key={problem._id} className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="font-semibold">{problem.problemTitle}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge>{problem.problemCategory}</Badge>
                        <span className="text-sm text-muted-foreground">
                          Priority Score: {Math.round(problem.priorityScore)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {thisWeekLearnings.length > 0 && (
              <div>
                <h4 className="font-bold mb-2 text-green-700 dark:text-green-300">
                  💬 Customer Conversations ({thisWeekLearnings.length})
                </h4>
                <div className="space-y-2">
                  {thisWeekLearnings.slice(0, 3).map((learning: any) => (
                    <div key={learning._id} className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="font-semibold">{learning.customerName}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {learning.problemsDiscovered.substring(0, 100)}...
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {problems.length === 0 && learnings.length === 0 && (
        <Card className="border-2 border-dashed">
          <CardContent className="py-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-sm text-muted-foreground">
              Start tracking problems, customer conversations, and activities to see your weekly review
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
