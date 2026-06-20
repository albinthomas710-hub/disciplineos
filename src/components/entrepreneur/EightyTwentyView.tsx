import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown,
  Target, 
  Zap, 
  Clock,
  BarChart3,
  Plus,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
  Award,
  Activity,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { motion } from "framer-motion";

import {
  useAllActivities,
  useTopPerformers,
  useEightyTwentyInsights,
  useCreateActivity,
  useLogResult,
  useUpdateActivityStatus,
  useDeleteActivity,
} from "@/hooks/use-problem-vault-queries";

export function EightyTwentyView() {
  const allActivities = useAllActivities();
  const topPerformers = useTopPerformers();
  const insights = useEightyTwentyInsights();
  
  const createActivity = useCreateActivity();
  const logResult = useLogResult();
  const updateStatus = useUpdateActivityStatus();
  const deleteActivity = useDeleteActivity();

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showResultForm, setShowResultForm] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);

  // Activity form state
  const [activityName, setActivityName] = useState("");
  const [category, setCategory] = useState("product");
  const [timeInvested, setTimeInvested] = useState(0);
  const [expectedImpact, setExpectedImpact] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);

  // Result form state
  const [resultType, setResultType] = useState("revenue");
  const [resultValue, setResultValue] = useState(0);
  const [resultDescription, setResultDescription] = useState("");
  const [dateLogged, setDateLogged] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateActivity = async () => {
    if (!activityName.trim() || timeInvested <= 0) {
      toast.error("Please fill in activity name and time invested");
      return;
    }

    try {
      await createActivity({
        activityName,
        category,
        timeInvested,
        expectedImpact: expectedImpact || undefined,
        startDate,
      });

      setActivityName("");
      setCategory("product");
      setTimeInvested(0);
      setExpectedImpact("");
      setStartDate(new Date().toISOString().split('T')[0]);
      setShowActivityForm(false);
      toast.success("Activity tracked! 📊");
    } catch (error) {
      toast.error("Failed to create activity");
    }
  };

  const handleLogResult = async () => {
    if (!selectedActivity || !resultDescription.trim() || resultValue <= 0) {
      toast.error("Please fill in all result fields");
      return;
    }

    try {
      const result = await logResult({
        activityId: selectedActivity._id,
        resultType,
        resultValue,
        resultDescription,
        dateLogged,
      });

      toast.success(`Impact logged! New score: ${Math.round(result.newImpactScore)}`);
      setShowResultForm(false);
      setSelectedActivity(null);
      setResultType("revenue");
      setResultValue(0);
      setResultDescription("");
      setDateLogged(new Date().toISOString().split('T')[0]);
    } catch (error) {
      toast.error("Failed to log result");
    }
  };

  const handleDeleteActivity = async (activityId: string) => {
    try {
      await deleteActivity({ activityId: activityId as any });
      toast.success("Activity deleted");
    } catch (error) {
      toast.error("Failed to delete activity");
    }
  };

  if (!allActivities) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      product: "bg-blue-600",
      marketing: "bg-purple-600",
      sales: "bg-green-600",
      operations: "bg-orange-600",
      learning: "bg-cyan-600",
    };
    return colors[category] || "bg-gray-600";
  };

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      product: Target,
      marketing: TrendingUp,
      sales: Zap,
      operations: Activity,
      learning: Award,
    };
    const Icon = icons[category] || Target;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Target className="h-6 w-6" />
            80/20 Focus System
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Identify the 20% of activities that deliver 80% of your results. Track, measure, and double down on what works.
          </p>
        </CardHeader>
      </Card>

      {/* Insights Dashboard */}
      {insights && insights.totalActivities > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="border-2 border-green-500 bg-green-50 dark:bg-green-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-green-900 dark:text-green-100">Top 20% Impact</h4>
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {insights.impactPercentageFromTop}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                of total results from {insights.topPerformersCount} activities
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-blue-900 dark:text-blue-100">Time Efficiency</h4>
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                {insights.timePercentageFromTop}%
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                of time spent on top performers
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-500 bg-purple-50 dark:bg-purple-950/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-purple-900 dark:text-purple-100">Total Impact</h4>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                {Math.round(insights.totalImpact)}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                across {insights.totalActivities} activities
              </p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Low Performers Alert */}
      {insights && insights.bottomPerformers && insights.bottomPerformers.length > 0 && (
        <Card className="border-2 border-orange-500 bg-orange-50 dark:bg-orange-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-900 dark:text-orange-100">
              <AlertTriangle className="h-5 w-5" />
              ⚠️ Low-Impact Activities to Eliminate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {insights.bottomPerformers.map((activity: any, index: number) => (
                <div key={index} className="p-3 bg-white dark:bg-gray-900 rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{activity.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {activity.timeWasted}h/week invested • Impact score: {Math.round(activity.lowImpact)}
                    </p>
                  </div>
                  <Badge className="bg-orange-600 text-white">Consider Eliminating</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Top Performers */}
      {topPerformers && topPerformers.length > 0 && (
        <Card className="border-2 border-green-500">
          <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              🏆 Top Performers (Your 20%)
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              These activities deliver the most results per hour invested
            </p>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {topPerformers.map((activity: any, index: number) => (
                <motion.div
                  key={activity._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="p-5 border-2 border-green-200 dark:border-green-800 rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-gradient-to-r from-green-600 to-emerald-600 text-white text-lg px-3 py-1">
                          #{index + 1}
                        </Badge>
                        <h4 className="font-bold text-lg">{activity.activityName}</h4>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <Badge className={getCategoryColor(activity.category)}>
                          {getCategoryIcon(activity.category)}
                          <span className="ml-1">{activity.category}</span>
                        </Badge>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-blue-600" />
                          {activity.timeInvested}h/week
                        </span>
                        <span className="flex items-center gap-1">
                          <Zap className="h-4 w-4 text-yellow-600" />
                          Efficiency: <strong>{activity.efficiencyRatio}</strong>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-sm">
                      <strong>Total Impact:</strong> {Math.round(activity.totalImpactScore)} points
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      💡 Double down on this activity for maximum results
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Add Activity Button */}
      <div className="flex justify-center">
        <Button
          onClick={() => setShowActivityForm(true)}
          className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
          size="lg"
        >
          <Plus className="h-5 w-5 mr-2" />
          Track New Activity
        </Button>
      </div>

      {/* All Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            All Activities
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allActivities.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">No activities tracked yet</p>
              <p className="text-sm">Start tracking your activities to discover your 80/20</p>
            </div>
          ) : (
            <div className="space-y-3">
              {allActivities.map((activity: any) => (
                <Card key={activity._id} className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold">{activity.activityName}</h4>
                        <Badge className={getCategoryColor(activity.category)}>
                          {activity.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{activity.timeInvested}h/week</span>
                        <span>Impact: {Math.round(activity.totalImpactScore)}</span>
                        <span>Efficiency: {activity.efficiencyRatio}</span>
                        <span>{activity.actualResults?.length || 0} results logged</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => {
                          setSelectedActivity(activity);
                          setShowResultForm(true);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Log Result
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteActivity(activity._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Form Dialog */}
      <Dialog open={showActivityForm} onOpenChange={setShowActivityForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Track New Activity</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Activity Name *</Label>
              <Input
                value={activityName}
                onChange={(e) => setActivityName(e.target.value)}
                placeholder="e.g., Cold outreach to potential customers"
              />
            </div>

            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product">🎯 Product Development</SelectItem>
                  <SelectItem value="marketing">📢 Marketing</SelectItem>
                  <SelectItem value="sales">💰 Sales</SelectItem>
                  <SelectItem value="operations">⚙️ Operations</SelectItem>
                  <SelectItem value="learning">📚 Learning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Time Invested (hours/week) *</Label>
              <Input
                type="number"
                min="0"
                step="0.5"
                value={timeInvested || ""}
                onChange={(e) => setTimeInvested(parseFloat(e.target.value) || 0)}
                placeholder="5"
              />
            </div>

            <div>
              <Label>Expected Impact (optional)</Label>
              <Textarea
                value={expectedImpact}
                onChange={(e) => setExpectedImpact(e.target.value)}
                placeholder="What results do you expect from this activity?"
                rows={2}
              />
            </div>

            <div>
              <Label>Start Date</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <Button
              onClick={handleCreateActivity}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Target className="h-4 w-4 mr-2" />
              Start Tracking
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Form Dialog */}
      <Dialog open={showResultForm} onOpenChange={setShowResultForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Log Result for {selectedActivity?.activityName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Result Type</Label>
              <Select value={resultType} onValueChange={setResultType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="revenue">💰 Revenue Generated</SelectItem>
                  <SelectItem value="users">👥 New Users/Customers</SelectItem>
                  <SelectItem value="engagement">📈 Engagement Increase</SelectItem>
                  <SelectItem value="efficiency">⚡ Efficiency Gain</SelectItem>
                  <SelectItem value="learning">🧠 Learning/Insight</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Result Value (numeric) *</Label>
              <Input
                type="number"
                min="0"
                value={resultValue || ""}
                onChange={(e) => setResultValue(parseFloat(e.target.value) || 0)}
                placeholder="e.g., 5000 (for $5000 revenue) or 10 (for 10 users)"
              />
            </div>

            <div>
              <Label>Description *</Label>
              <Textarea
                value={resultDescription}
                onChange={(e) => setResultDescription(e.target.value)}
                placeholder="Describe the result achieved..."
                rows={3}
              />
            </div>

            <div>
              <Label>Date</Label>
              <Input
                type="date"
                value={dateLogged}
                onChange={(e) => setDateLogged(e.target.value)}
              />
            </div>

            <Button
              onClick={handleLogResult}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Log Result
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}