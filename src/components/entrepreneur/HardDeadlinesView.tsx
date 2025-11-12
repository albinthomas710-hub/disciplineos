import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  useAllDeadlines,
  useActiveDeadlines,
  useOverdueDeadlines,
  useDeadlineStats,
  useCreateDeadline,
  useCompleteDeadline,
  useMissDeadline,
  useExtendDeadline,
  useDeleteDeadline
} from "@/hooks/use-problem-vault-queries";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Clock, 
  Plus, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Calendar,
  Target,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export function HardDeadlinesView() {
  const allDeadlines = useAllDeadlines();
  const activeDeadlines = useActiveDeadlines();
  const overdueDeadlines = useOverdueDeadlines();
  const stats = useDeadlineStats();
  
  const createDeadline = useCreateDeadline();
  const completeDeadline = useCompleteDeadline();
  const missDeadline = useMissDeadline();
  const extendDeadline = useExtendDeadline();
  const deleteDeadline = useDeleteDeadline();

  const [showForm, setShowForm] = useState(false);
  const [showMissDialog, setShowMissDialog] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");
  const [category, setCategory] = useState("personal_goal");
  const [priority, setPriority] = useState("high");
  const [consequenceIfMissed, setConsequenceIfMissed] = useState("");

  // Miss/Extend state
  const [missedReason, setMissedReason] = useState("");
  const [newDeadline, setNewDeadline] = useState("");
  const [extensionReason, setExtensionReason] = useState("");

  const handleCreateDeadline = async () => {
    if (!title.trim() || !deadline) {
      toast.error("Please fill in title and deadline");
      return;
    }

    try {
      await createDeadline({
        title,
        description: description || undefined,
        deadline,
        category: category as any,
        priority: priority as any,
        consequenceIfMissed: consequenceIfMissed || undefined,
      });

      setTitle("");
      setDescription("");
      setDeadline("");
      setCategory("personal_goal");
      setPriority("high");
      setConsequenceIfMissed("");
      setShowForm(false);
      toast.success("Deadline set! No excuses now. 🎯");
    } catch (error) {
      toast.error("Failed to create deadline");
    }
  };

  const handleComplete = async (deadlineId: string) => {
    try {
      await completeDeadline({ deadlineId: deadlineId as any });
      toast.success("Deadline crushed! 💪");
    } catch (error) {
      toast.error("Failed to complete deadline");
    }
  };

  const handleMiss = async () => {
    if (!missedReason.trim()) {
      toast.error("Be honest - why did you miss it?");
      return;
    }

    try {
      await missDeadline({
        deadlineId: selectedDeadline._id,
        missedReason,
      });
      setShowMissDialog(false);
      setMissedReason("");
      setSelectedDeadline(null);
      toast.error("Deadline missed. Learn from it.");
    } catch (error) {
      toast.error("Failed to mark as missed");
    }
  };

  const handleExtend = async () => {
    if (!newDeadline || !extensionReason.trim()) {
      toast.error("Be honest - why extend and when's the new deadline?");
      return;
    }

    try {
      await extendDeadline({
        deadlineId: selectedDeadline._id,
        newDeadline,
        extensionReason,
      });
      setShowExtendDialog(false);
      setNewDeadline("");
      setExtensionReason("");
      setSelectedDeadline(null);
      toast.warning("Deadline extended. Make it count.");
    } catch (error) {
      toast.error("Failed to extend deadline");
    }
  };

  if (!allDeadlines) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-600 text-white";
      case "medium": return "bg-yellow-600 text-white";
      case "low": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getDaysUntil = (deadlineDate: string) => {
    const today = new Date();
    const target = new Date(deadlineDate);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
            <CardContent className="pt-6 text-center">
              <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <p className="text-3xl font-bold">{stats.totalActive}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-950 dark:to-orange-950">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
              <p className="text-3xl font-bold">{stats.totalOverdue}</p>
              <p className="text-sm text-muted-foreground">Overdue</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
            <CardContent className="pt-6 text-center">
              <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <p className="text-3xl font-bold">{stats.totalCompleted}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-950 dark:to-slate-950">
            <CardContent className="pt-6 text-center">
              <XCircle className="h-8 w-8 mx-auto mb-2 text-gray-600" />
              <p className="text-3xl font-bold">{stats.totalMissed}</p>
              <p className="text-sm text-muted-foreground">Missed</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <CardContent className="pt-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <p className="text-3xl font-bold">{stats.completionRate}%</p>
              <p className="text-sm text-muted-foreground">Hit Rate</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Deadline Button */}
      <Card className="border-2 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Hard Deadlines - No Lying to Yourself
            </CardTitle>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              {showForm ? "Cancel" : "Set Deadline"}
            </Button>
          </div>
        </CardHeader>
        {showForm && (
          <CardContent className="space-y-4">
            <div>
              <Label>What are you committing to? *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Ship MVP, Talk to 10 customers, Close first deal"
              />
            </div>
            <div>
              <Label>Details</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What exactly needs to be done?"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Deadline *</Label>
                <Input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>
              <div>
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">🔥 Critical</SelectItem>
                    <SelectItem value="high">⚡ High</SelectItem>
                    <SelectItem value="medium">📌 Medium</SelectItem>
                    <SelectItem value="low">💡 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="problem_validation">Problem Validation</SelectItem>
                  <SelectItem value="solution_ship">Solution Ship</SelectItem>
                  <SelectItem value="customer_conversation">Customer Conversation</SelectItem>
                  <SelectItem value="revenue_goal">Revenue Goal</SelectItem>
                  <SelectItem value="learning_goal">Learning Goal</SelectItem>
                  <SelectItem value="personal_goal">Personal Goal</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>What happens if you miss this?</Label>
              <Textarea
                value={consequenceIfMissed}
                onChange={(e) => setConsequenceIfMissed(e.target.value)}
                placeholder="Be honest about the cost of missing this deadline..."
                rows={2}
              />
            </div>
            <Button
              onClick={handleCreateDeadline}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Target className="h-4 w-4 mr-2" />
              Lock It In
            </Button>
          </CardContent>
        )}
      </Card>

      {/* Overdue Deadlines Alert */}
      {overdueDeadlines && overdueDeadlines.length > 0 && (
        <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
              <AlertTriangle className="h-5 w-5" />
              🚨 {overdueDeadlines.length} Overdue - Stop Lying to Yourself
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {overdueDeadlines.map((deadline: any) => (
              <div key={deadline._id} className="p-4 bg-white dark:bg-gray-900 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-bold">{deadline.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(deadline.deadline).toLocaleDateString()} ({Math.abs(getDaysUntil(deadline.deadline))} days ago)
                    </p>
                  </div>
                  <Badge className={getPriorityColor(deadline.priority)}>
                    {deadline.priority.toUpperCase()}
                  </Badge>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    onClick={() => handleComplete(deadline._id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Done
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedDeadline(deadline);
                      setShowExtendDialog(true);
                    }}
                  >
                    <Clock className="h-3 w-3 mr-1" />
                    Extend
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedDeadline(deadline);
                      setShowMissDialog(true);
                    }}
                  >
                    <XCircle className="h-3 w-3 mr-1" />
                    Missed
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Active Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Active Deadlines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {activeDeadlines && activeDeadlines.length > 0 ? (
            activeDeadlines.map((deadline: any) => {
              const daysUntil = getDaysUntil(deadline.deadline);
              const isUrgent = daysUntil <= 3;
              
              return (
                <motion.div
                  key={deadline._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 border-2 rounded-lg ${
                    isUrgent ? "border-red-500 bg-red-50 dark:bg-red-950/30" : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold">{deadline.title}</h4>
                        <Badge className={getPriorityColor(deadline.priority)}>
                          {deadline.priority}
                        </Badge>
                        <Badge variant="outline">{deadline.category.replace(/_/g, " ")}</Badge>
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-muted-foreground mb-2">{deadline.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-sm">
                        <span className={`flex items-center gap-1 ${isUrgent ? "text-red-600 font-bold" : ""}`}>
                          <Calendar className="h-3 w-3" />
                          {new Date(deadline.deadline).toLocaleDateString()} ({daysUntil} days)
                        </span>
                      </div>
                      {deadline.consequenceIfMissed && (
                        <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-950/30 rounded text-xs">
                          <strong>If missed:</strong> {deadline.consequenceIfMissed}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-3">
                    <Button
                      size="sm"
                      onClick={() => handleComplete(deadline._id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedDeadline(deadline);
                        setShowExtendDialog(true);
                      }}
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      Extend
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        setSelectedDeadline(deadline);
                        setShowMissDialog(true);
                      }}
                    >
                      <XCircle className="h-3 w-3 mr-1" />
                      Missed
                    </Button>
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="h-16 w-16 mx-auto mb-4 opacity-30" />
              <p>No active deadlines. Set one and commit to it.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Miss Deadline Dialog */}
      <Dialog open={showMissDialog} onOpenChange={setShowMissDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Why Did You Miss This Deadline?</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Be honest with yourself. No excuses, just truth.
            </p>
            <Textarea
              value={missedReason}
              onChange={(e) => setMissedReason(e.target.value)}
              placeholder="What really happened? What will you do differently next time?"
              rows={4}
            />
            <div className="flex gap-2">
              <Button onClick={handleMiss} variant="destructive" className="flex-1">
                Mark as Missed
              </Button>
              <Button onClick={() => setShowMissDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Extend Deadline Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Deadline - Be Honest</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Why are you extending? What's the real reason?
            </p>
            <div>
              <Label>New Deadline</Label>
              <Input
                type="date"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
              />
            </div>
            <div>
              <Label>Why Extend? (Be honest)</Label>
              <Textarea
                value={extensionReason}
                onChange={(e) => setExtensionReason(e.target.value)}
                placeholder="What happened? What will change to hit the new deadline?"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExtend} className="flex-1">
                Extend Deadline
              </Button>
              <Button onClick={() => setShowExtendDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
