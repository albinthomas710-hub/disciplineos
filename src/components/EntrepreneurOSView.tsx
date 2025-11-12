import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Rocket, 
  MessageSquare, 
  TrendingUp, 
  Lightbulb, 
  Star, 
  Users, 
  Target,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Zap,
  AlertTriangle,
  Clock,
  ArrowRight,
  Edit,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function EntrepreneurOSView() {
  const allFeedback = useQuery((api as any).entrepreneurOS.getAllFeedback);
  const allIterations = useQuery((api as any).entrepreneurOS.getAllIterations);
  const metrics = useQuery((api as any).entrepreneurOS.getSatisfactionMetrics);
  const insights = useQuery((api as any).entrepreneurOS.getProductInsights);
  
  const createFeedback = useMutation((api as any).entrepreneurOS.createFeedback);
  const createIteration = useMutation((api as any).entrepreneurOS.createIteration);
  const updateFeedbackStatus = useMutation((api as any).entrepreneurOS.updateFeedbackStatus);
  const deleteFeedback = useMutation((api as any).entrepreneurOS.deleteFeedback);
  const updateIteration = useMutation((api as any).entrepreneurOS.updateIteration);
  const createValidation = useMutation((api as any).impactValidation.createValidation);
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showIterationForm, setShowIterationForm] = useState(false);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  const [showValidationForm, setShowValidationForm] = useState<string | null>(null);
  const [editingIteration, setEditingIteration] = useState<string | null>(null);
  
  // Feedback form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [priority, setPriority] = useState("medium");
  const [actionTaken, setActionTaken] = useState("");
  // NEW: Pain Level & Business Impact State
  const [painHours, setPainHours] = useState<number>(0);
  const [revenueImpactType, setRevenueImpactType] = useState("no_impact");
  const [revenueAmount, setRevenueAmount] = useState<number>(0);
  const [urgencyLevel, setUrgencyLevel] = useState("nice_to_have");
  const [willTestFix, setWillTestFix] = useState(false);

  // Iteration form state
  const [iterationTitle, setIterationTitle] = useState("");
  const [iterationDescription, setIterationDescription] = useState("");
  const [iterationHypothesis, setIterationHypothesis] = useState("");
  const [iterationChanges, setIterationChanges] = useState([{ change: "", reason: "", expectedImpact: "" }]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [targetShipDate, setTargetShipDate] = useState("");
  const [complexity, setComplexity] = useState(5);

  // Impact Validation form state
  const [problemSolved, setProblemSolved] = useState<"yes_confirmed" | "no_still_issues" | "not_tested_yet">("not_tested_yet");
  const [postSatisfaction, setPostSatisfaction] = useState(5);
  const [timeSaved, setTimeSaved] = useState<number>(0);
  const [revenueGained, setRevenueGained] = useState<number>(0);
  const [iterationFailed, setIterationFailed] = useState(false);
  const [customerQuote, setCustomerQuote] = useState("");
  const [nextAction, setNextAction] = useState<"mark_resolved" | "needs_additional_iteration" | "request_case_study">("mark_resolved");

  const handleAddFeedback = async () => {
    if (!clientName.trim() || !feedbackText.trim()) {
      toast.error("Please fill in client name and feedback");
      return;
    }

    try {
      await createFeedback({
        clientName,
        clientEmail: clientEmail || undefined,
        feedbackType: feedbackType as any,
        feedbackText,
        satisfactionScore,
        priority: priority as any,
        painHours: painHours > 0 ? painHours : undefined,
        revenueImpactType: revenueImpactType !== "no_impact" ? revenueImpactType as any : undefined,
        revenueAmount: revenueAmount > 0 ? revenueAmount : undefined,
        urgencyLevel: urgencyLevel as any,
        willTestFix,
      });
      
      setClientName("");
      setClientEmail("");
      setFeedbackText("");
      setSatisfactionScore(5);
      setPriority("medium");
      setPainHours(0);
      setRevenueImpactType("no_impact");
      setRevenueAmount(0);
      setUrgencyLevel("nice_to_have");
      setWillTestFix(false);
      setShowFeedbackForm(false);
      toast.success("Feedback captured! 🎯");
    } catch (error) {
      toast.error("Failed to add feedback");
    }
  };

  const handleAddIteration = async () => {
    if (!iterationTitle.trim() || selectedFeedbackIds.length === 0) {
      toast.error("Please add a title and select at least one feedback item");
      return;
    }

    try {
      const iterationNumber = (allIterations?.length || 0) + 1;
      await createIteration({
        feedbackIds: selectedFeedbackIds as any,
        iterationNumber,
        title: iterationTitle,
        description: iterationDescription,
        hypothesis: iterationHypothesis,
        changes: iterationChanges.filter(c => c.change.trim()),
        startDate,
        targetShipDate: targetShipDate || undefined,
        complexity,
      });
      
      setIterationTitle("");
      setIterationDescription("");
      setIterationHypothesis("");
      setIterationChanges([{ change: "", reason: "", expectedImpact: "" }]);
      setStartDate(new Date().toISOString().split('T')[0]);
      setTargetShipDate("");
      setComplexity(5);
      setSelectedFeedbackIds([]);
      setShowIterationForm(false);
      toast.success("Iteration created! 🚀");
    } catch (error) {
      toast.error("Failed to create iteration");
    }
  };

  const handleMarkAsShipped = async (iterationId: string) => {
    try {
      const actualShipDate = new Date().toISOString().split('T')[0];
      await updateIteration({
        iterationId: iterationId as any,
        status: "shipped",
        actualShipDate,
      });
      toast.success("Iteration marked as shipped! 🚀");
      
      // Show validation form after 7 days (for demo, show immediately)
      setTimeout(() => {
        setShowValidationForm(iterationId);
      }, 1000);
    } catch (error) {
      toast.error("Failed to mark as shipped");
    }
  };

  const handleUpdateIterationStatus = async (iterationId: string, status: string) => {
    try {
      await updateIteration({
        iterationId: iterationId as any,
        status: status as any,
      });
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleSubmitValidation = async (iterationId: string, feedbackId: string) => {
    try {
      await createValidation({
        iterationId: iterationId as any,
        feedbackId: feedbackId as any,
        problemSolved,
        postSatisfaction,
        timeSaved: timeSaved > 0 ? timeSaved : undefined,
        revenueGained: revenueGained > 0 ? revenueGained : undefined,
        iterationFailed,
        customerQuote: customerQuote || undefined,
        nextAction,
      });
      
      setShowValidationForm(null);
      setProblemSolved("not_tested_yet");
      setPostSatisfaction(5);
      setTimeSaved(0);
      setRevenueGained(0);
      setIterationFailed(false);
      setCustomerQuote("");
      setNextAction("mark_resolved");
      
      toast.success("Impact validation recorded! 📊");
    } catch (error) {
      toast.error("Failed to submit validation");
    }
  };

  const handleDeleteFeedback = async (feedbackId: string) => {
    try {
      await deleteFeedback({ feedbackId: feedbackId as any });
      toast.success("Feedback deleted");
    } catch (error) {
      toast.error("Failed to delete feedback");
    }
  };

  const toggleFeedbackSelection = (feedbackId: string) => {
    setSelectedFeedbackIds(prev => 
      prev.includes(feedbackId) 
        ? prev.filter(id => id !== feedbackId)
        : [...prev, feedbackId]
    );
  };

  if (!allFeedback) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayMetrics = metrics || {
    totalFeedback: 0,
    averageSatisfaction: 0,
    positiveCount: 0,
    neutralCount: 0,
    negativeCount: 0,
    testimonialCount: 0,
    featureRequestCount: 0,
    bugReportCount: 0,
    positivePercentage: 0,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical": return "bg-red-600 text-white";
      case "high": return "bg-orange-600 text-white";
      case "medium": return "bg-yellow-600 text-white";
      case "low": return "bg-green-600 text-white";
      default: return "bg-gray-600 text-white";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical": return <AlertTriangle className="h-3 w-3" />;
      case "high": return <AlertCircle className="h-3 w-3" />;
      default: return null;
    }
  };

  const getFeedbackTypeEmoji = (type: string) => {
    switch (type) {
      case "testimonial": return "✨";
      case "feature_request": return "💡";
      case "bug_report": return "🐛";
      case "praise": return "👏";
      case "complaint": return "😞";
      default: return "💬";
    }
  };

  return (
    <div className="space-y-6">
      {/* Elite Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-3 rounded-xl shadow-lg">
                <Rocket className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
                  Entrepreneur OS
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Build something people love through feedback & iteration
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center shadow-md backdrop-blur-sm"
              >
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{displayMetrics.totalFeedback}</p>
                <p className="text-xs text-muted-foreground">Total Feedback</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center shadow-md backdrop-blur-sm"
              >
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{displayMetrics.averageSatisfaction}/10</p>
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center shadow-md backdrop-blur-sm"
              >
                <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{displayMetrics.positivePercentage}%</p>
                <p className="text-xs text-muted-foreground">Positive Rate</p>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="p-4 bg-white/70 dark:bg-gray-900/70 rounded-xl text-center shadow-md backdrop-blur-sm"
              >
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{allIterations?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Iterations</p>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-gray-900 shadow-md">
          <TabsTrigger value="feedback" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-pink-600 data-[state=active]:text-white">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback Loop
          </TabsTrigger>
          <TabsTrigger value="iterations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-cyan-600 data-[state=active]:text-white">
            <Zap className="h-4 w-4 mr-2" />
            Iterations
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-600 data-[state=active]:to-yellow-600 data-[state=active]:text-white">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Client Feedback
                </CardTitle>
                <Button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AnimatePresence>
                {showFeedbackForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 shadow-inner"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Client Name *</Label>
                        <Input
                          placeholder="John Doe"
                          value={clientName}
                          onChange={(e) => setClientName(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-semibold">Client Email</Label>
                        <Input
                          type="email"
                          placeholder="john@example.com"
                          value={clientEmail}
                          onChange={(e) => setClientEmail(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="font-semibold">Feedback Type</Label>
                        <Select value={feedbackType} onValueChange={setFeedbackType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="testimonial">✨ Testimonial</SelectItem>
                            <SelectItem value="feature_request">💡 Feature Request</SelectItem>
                            <SelectItem value="bug_report">🐛 Bug Report</SelectItem>
                            <SelectItem value="praise">👏 Praise</SelectItem>
                            <SelectItem value="complaint">😞 Complaint</SelectItem>
                            <SelectItem value="general">💬 General</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="font-semibold">Priority Level</Label>
                        <Select value={priority} onValueChange={setPriority}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">🟢 Low</SelectItem>
                            <SelectItem value="medium">🟡 Medium</SelectItem>
                            <SelectItem value="high">🟠 High</SelectItem>
                            <SelectItem value="critical">🔴 Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold">Satisfaction Score: {satisfactionScore}/10</Label>
                      <div className="flex items-center gap-2 mt-2">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                          <motion.button
                            key={score}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setSatisfactionScore(score)}
                            className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
                              satisfactionScore >= score
                                ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                            }`}
                          >
                            {score}
                          </motion.button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold">Feedback *</Label>
                      <Textarea
                        placeholder="What did the client say?"
                        value={feedbackText}
                        onChange={(e) => setFeedbackText(e.target.value)}
                        rows={4}
                        className="mt-1"
                      />
                    </div>

                    {/* NEW: Pain Level Section */}
                    <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border-2 border-orange-200 dark:border-orange-800">
                      <h4 className="font-bold text-sm text-orange-900 dark:text-orange-100">💰 Pain Level & Business Impact</h4>
                      
                      <div>
                        <Label className="font-semibold">How much does this problem cost them?</Label>
                        <div className="mt-2">
                          <Label className="text-xs text-muted-foreground">Time wasted per week (hours)</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.5"
                            placeholder="0"
                            value={painHours || ""}
                            onChange={(e) => setPainHours(parseFloat(e.target.value) || 0)}
                            className="mt-1"
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="font-semibold">Revenue Impact</Label>
                        <Select value={revenueImpactType} onValueChange={setRevenueImpactType}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no_impact">No revenue impact</SelectItem>
                            <SelectItem value="losing_revenue">💸 Losing revenue</SelectItem>
                            <SelectItem value="missing_opportunity">📈 Missing revenue opportunity</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {revenueImpactType !== "no_impact" && (
                        <div>
                          <Label className="font-semibold">Dollar Amount</Label>
                          <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                              type="number"
                              min="0"
                              step="100"
                              placeholder="0"
                              value={revenueAmount || ""}
                              onChange={(e) => setRevenueAmount(parseFloat(e.target.value) || 0)}
                              className="pl-7"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* NEW: Urgency Level */}
                    <div>
                      <Label className="font-semibold">Urgency Level</Label>
                      <Select value={urgencyLevel} onValueChange={setUrgencyLevel}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nice_to_have">Nice to have</SelectItem>
                          <SelectItem value="major_friction">⚠️ Major friction (using workarounds)</SelectItem>
                          <SelectItem value="blocking">🚫 Blocking completely (can't use product)</SelectItem>
                          <SelectItem value="critical_for_renewal">🔥 Critical for renewal (will churn)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* NEW: Customer Commitment */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <Label className="font-semibold flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={willTestFix}
                          onChange={(e) => setWillTestFix(e.target.checked)}
                          className="w-5 h-5 cursor-pointer"
                        />
                        If we build this, will customer test within 48 hours?
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1 ml-7">
                        Customer commitment is a strong signal of real pain
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddFeedback} className="cursor-pointer flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Save Feedback
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowFeedbackForm(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Feedback List */}
              {allFeedback.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No feedback yet</p>
                  <p className="text-sm">Start capturing client insights to build something they love!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allFeedback.map((feedback: any, index: number) => (
                    <motion.div
                      key={feedback._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`p-5 border-2 rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-lg transition-all ${
                        selectedFeedbackIds.includes(feedback._id) 
                          ? "border-purple-500 dark:border-purple-400 bg-purple-50 dark:bg-purple-950" 
                          : "border-gray-200 dark:border-gray-800"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={selectedFeedbackIds.includes(feedback._id)}
                            onChange={() => toggleFeedbackSelection(feedback._id)}
                            className="mt-1 cursor-pointer w-4 h-4"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-2xl">{getFeedbackTypeEmoji(feedback.feedbackType)}</span>
                              <h4 className="font-bold text-lg">{feedback.clientName}</h4>
                              <Badge className={`${getPriorityColor(feedback.priority)} flex items-center gap-1`}>
                                {getPriorityIcon(feedback.priority)}
                                {feedback.priority.toUpperCase()}
                              </Badge>
                            </div>
                            {feedback.clientEmail && (
                              <p className="text-xs text-muted-foreground mb-2">{feedback.clientEmail}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={feedback.satisfactionScore >= 8 ? "default" : feedback.satisfactionScore >= 5 ? "secondary" : "destructive"}
                            className="text-sm font-bold"
                          >
                            <Star className="h-3 w-3 mr-1" />
                            {feedback.satisfactionScore}/10
                          </Badge>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteFeedback(feedback._id)}
                            className="cursor-pointer text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <p className="text-sm mb-3 pl-7 leading-relaxed">{feedback.feedbackText}</p>
                      
                      {/* NEW: Display Pain Level & Business Impact */}
                      {(feedback.painHours || feedback.revenueImpactType || feedback.urgencyLevel || feedback.willTestFix) && (
                        <div className="pl-7 mb-3 space-y-2">
                          {feedback.painHours && feedback.painHours > 0 && (
                            <div className="text-xs bg-orange-100 dark:bg-orange-900/30 px-2 py-1 rounded inline-block mr-2">
                              ⏰ {feedback.painHours}h/week wasted
                            </div>
                          )}
                          {feedback.revenueImpactType && feedback.revenueImpactType !== "no_impact" && (
                            <div className="text-xs bg-red-100 dark:bg-red-900/30 px-2 py-1 rounded inline-block mr-2">
                              💸 {feedback.revenueImpactType === "losing_revenue" ? "Losing" : "Missing"} ${feedback.revenueAmount?.toLocaleString() || "?"}
                            </div>
                          )}
                          {feedback.urgencyLevel && (
                            <div className={`text-xs px-2 py-1 rounded inline-block mr-2 ${
                              feedback.urgencyLevel === "blocking" || feedback.urgencyLevel === "critical_for_renewal"
                                ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200"
                                : feedback.urgencyLevel === "major_friction"
                                ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200"
                                : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200"
                            }`}>
                              {feedback.urgencyLevel === "blocking" && "🚫 Blocking"}
                              {feedback.urgencyLevel === "major_friction" && "⚠️ Major Friction"}
                              {feedback.urgencyLevel === "critical_for_renewal" && "🔥 Critical for Renewal"}
                              {feedback.urgencyLevel === "nice_to_have" && "Nice to Have"}
                            </div>
                          )}
                          {feedback.willTestFix && (
                            <div className="text-xs bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-2 py-1 rounded inline-block">
                              ✅ Will test in 48h
                            </div>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground pl-7">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(feedback.createdAt).toLocaleDateString()}
                        </span>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {feedback.status}
                        </Badge>
                        <span>•</span>
                        <Badge variant="outline" className="text-xs">
                          {feedback.feedbackType.replace("_", " ")}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {selectedFeedbackIds.length > 0 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-xl shadow-2xl"
                >
                  <p className="text-sm font-medium mb-2">
                    {selectedFeedbackIds.length} feedback item{selectedFeedbackIds.length > 1 ? "s" : ""} selected
                  </p>
                  <Button
                    onClick={() => {
                      setShowIterationForm(true);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="w-full bg-white text-purple-600 hover:bg-gray-100 cursor-pointer"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Create Iteration
                  </Button>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Iterations Tab */}
        <TabsContent value="iterations" className="space-y-4">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Product Iterations
                </CardTitle>
                <Button
                  onClick={() => setShowIterationForm(!showIterationForm)}
                  className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
                  disabled={selectedFeedbackIds.length === 0}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Iteration
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4 pt-6">
              <AnimatePresence>
                {showIterationForm && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-4 p-6 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 shadow-inner"
                  >
                    <div>
                      <Label className="font-semibold">Iteration Title *</Label>
                      <Input
                        placeholder="e.g., Improve onboarding flow based on user feedback"
                        value={iterationTitle}
                        onChange={(e) => setIterationTitle(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-semibold">Description</Label>
                      <Textarea
                        placeholder="What are you building/improving?"
                        value={iterationDescription}
                        onChange={(e) => setIterationDescription(e.target.value)}
                        rows={3}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="font-semibold">Hypothesis</Label>
                      <Textarea
                        placeholder="What do you expect to happen? e.g., 'By simplifying the signup form, we'll increase conversion by 20%'"
                        value={iterationHypothesis}
                        onChange={(e) => setIterationHypothesis(e.target.value)}
                        rows={2}
                        className="mt-1"
                      />
                    </div>

                    {/* NEW: Velocity Tracking Fields */}
                    <div className="grid grid-cols-2 gap-4 p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                      <div>
                        <Label className="font-semibold">Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="font-semibold">Target Ship Date</Label>
                        <Input
                          type="date"
                          value={targetShipDate}
                          onChange={(e) => setTargetShipDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="font-semibold">Complexity: {complexity}/10</Label>
                        <div className="flex items-center gap-2 mt-2">
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((level) => (
                            <motion.button
                              key={level}
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setComplexity(level)}
                              className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
                                complexity >= level
                                  ? "bg-gradient-to-br from-blue-600 to-cyan-600 text-white shadow-lg"
                                  : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                              }`}
                            >
                              {level}
                            </motion.button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          1 = Simple fix, 10 = Major rebuild
                        </p>
                      </div>
                    </div>

                    <div>
                      <Label className="font-semibold">Changes & Reasoning</Label>
                      {iterationChanges.map((change, index) => (
                        <div key={index} className="mt-2 p-4 bg-white dark:bg-gray-900 rounded-lg space-y-2">
                          <Input
                            placeholder="What are you changing?"
                            value={change.change}
                            onChange={(e) => {
                              const newChanges = [...iterationChanges];
                              newChanges[index].change = e.target.value;
                              setIterationChanges(newChanges);
                            }}
                          />
                          <Input
                            placeholder="Why this change?"
                            value={change.reason}
                            onChange={(e) => {
                              const newChanges = [...iterationChanges];
                              newChanges[index].reason = e.target.value;
                              setIterationChanges(newChanges);
                            }}
                          />
                          <Input
                            placeholder="Expected impact?"
                            value={change.expectedImpact}
                            onChange={(e) => {
                              const newChanges = [...iterationChanges];
                              newChanges[index].expectedImpact = e.target.value;
                              setIterationChanges(newChanges);
                            }}
                          />
                        </div>
                      ))}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIterationChanges([...iterationChanges, { change: "", reason: "", expectedImpact: "" }])}
                        className="mt-2 cursor-pointer"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Change
                      </Button>
                    </div>

                    <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                      <p className="text-sm font-medium mb-2">Linked Feedback ({selectedFeedbackIds.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedFeedbackIds.map(id => {
                          const fb = allFeedback.find((f: any) => f._id === id);
                          return fb ? (
                            <Badge key={id} variant="secondary">
                              {fb.clientName}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={handleAddIteration} className="cursor-pointer flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700">
                        <Zap className="h-4 w-4 mr-2" />
                        Create Iteration
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowIterationForm(false)}
                        className="cursor-pointer"
                      >
                        Cancel
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Iterations List */}
              {!allIterations || allIterations.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Zap className="h-16 w-16 mx-auto mb-4 opacity-30" />
                  <p className="text-lg font-medium">No iterations yet</p>
                  <p className="text-sm">Select feedback items and create your first iteration!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {allIterations.map((iteration: any, index: number) => (
                    <motion.div
                      key={iteration._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 border-2 border-blue-200 dark:border-blue-800 rounded-xl bg-white dark:bg-gray-900 shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
                              v{iteration.iterationNumber}
                            </Badge>
                            <h4 className="font-bold text-lg">{iteration.title}</h4>
                          </div>
                          <p className="text-sm text-muted-foreground">{iteration.description}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="capitalize">
                            {iteration.status}
                          </Badge>
                          {iteration.complexity && (
                            <Badge variant="secondary">
                              Complexity: {iteration.complexity}/10
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Velocity Tracking Info */}
                      {(iteration.startDate || iteration.targetShipDate || iteration.actualShipDate) && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg grid grid-cols-3 gap-2 text-xs">
                          {iteration.startDate && (
                            <div>
                              <p className="font-semibold text-blue-600 dark:text-blue-400">START</p>
                              <p>{iteration.startDate}</p>
                            </div>
                          )}
                          {iteration.targetShipDate && (
                            <div>
                              <p className="font-semibold text-blue-600 dark:text-blue-400">TARGET</p>
                              <p>{iteration.targetShipDate}</p>
                            </div>
                          )}
                          {iteration.actualShipDate && (
                            <div>
                              <p className="font-semibold text-green-600 dark:text-green-400">SHIPPED</p>
                              <p>{iteration.actualShipDate}</p>
                              {iteration.daysToShip && (
                                <p className="text-muted-foreground">({iteration.daysToShip} days)</p>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {iteration.hypothesis && (
                        <div className="mb-3 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 mb-1">HYPOTHESIS</p>
                          <p className="text-sm">{iteration.hypothesis}</p>
                        </div>
                      )}

                      <div className="mb-3">
                        <p className="text-xs font-semibold mb-2">CHANGES</p>
                        <div className="space-y-2">
                          {iteration.changes.map((change: any, idx: number) => (
                            <div key={idx} className="text-sm pl-3 border-l-2 border-blue-300 dark:border-blue-700">
                              <p className="font-medium">{change.change}</p>
                              <p className="text-xs text-muted-foreground">→ {change.reason}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Status Management Buttons */}
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {iteration.status === "planning" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateIterationStatus(iteration._id, "building")}
                            className="cursor-pointer bg-blue-600 hover:bg-blue-700"
                          >
                            Start Building
                          </Button>
                        )}
                        {iteration.status === "building" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateIterationStatus(iteration._id, "testing")}
                            className="cursor-pointer bg-purple-600 hover:bg-purple-700"
                          >
                            Move to Testing
                          </Button>
                        )}
                        {iteration.status === "testing" && (
                          <Button
                            size="sm"
                            onClick={() => handleUpdateIterationStatus(iteration._id, "launched")}
                            className="cursor-pointer bg-orange-600 hover:bg-orange-700"
                          >
                            Launch
                          </Button>
                        )}
                        {iteration.status === "launched" && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsShipped(iteration._id)}
                            className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1" />
                            Mark as Shipped
                          </Button>
                        )}
                        {iteration.status === "shipped" && (
                          <Button
                            size="sm"
                            onClick={() => setShowValidationForm(iteration._id)}
                            className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                          >
                            <Target className="h-4 w-4 mr-1" />
                            Add Impact Validation
                          </Button>
                        )}
                      </div>

                      {/* Impact Validation Form */}
                      <AnimatePresence>
                        {showValidationForm === iteration._id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="mt-4 p-6 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 space-y-4"
                          >
                            <div className="flex items-center gap-2 mb-4">
                              <Target className="h-5 w-5 text-purple-600" />
                              <h4 className="font-bold text-lg">Impact Validation</h4>
                            </div>

                            <div>
                              <Label className="font-semibold">Problem Solved?</Label>
                              <Select value={problemSolved} onValueChange={(v: any) => setProblemSolved(v)}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="yes_confirmed">✅ Yes, customer confirmed fixed</SelectItem>
                                  <SelectItem value="no_still_issues">❌ No, customer still experiencing issues</SelectItem>
                                  <SelectItem value="not_tested_yet">⏳ Customer hasn't tested yet</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div>
                              <Label className="font-semibold">Post-Ship Satisfaction: {postSatisfaction}/10</Label>
                              <div className="flex items-center gap-2 mt-2">
                                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                                  <motion.button
                                    key={score}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => setPostSatisfaction(score)}
                                    className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
                                      postSatisfaction >= score
                                        ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg"
                                        : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                                    }`}
                                  >
                                    {score}
                                  </motion.button>
                                ))}
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label className="font-semibold">Time Saved (hours/week)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="0.5"
                                  placeholder="0"
                                  value={timeSaved || ""}
                                  onChange={(e) => setTimeSaved(parseFloat(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>
                              <div>
                                <Label className="font-semibold">Revenue Gained ($)</Label>
                                <Input
                                  type="number"
                                  min="0"
                                  step="100"
                                  placeholder="0"
                                  value={revenueGained || ""}
                                  onChange={(e) => setRevenueGained(parseFloat(e.target.value) || 0)}
                                  className="mt-1"
                                />
                              </div>
                            </div>

                            <div className="p-4 bg-red-50 dark:bg-red-950/30 rounded-lg border-2 border-red-200 dark:border-red-800">
                              <Label className="font-semibold flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={iterationFailed}
                                  onChange={(e) => setIterationFailed(e.target.checked)}
                                  className="w-5 h-5 cursor-pointer"
                                />
                                Iteration Failed (didn't solve the problem)
                              </Label>
                            </div>

                            <div>
                              <Label className="font-semibold">Customer Quote (optional)</Label>
                              <Textarea
                                placeholder="What did the customer say about the fix?"
                                value={customerQuote}
                                onChange={(e) => setCustomerQuote(e.target.value)}
                                rows={3}
                                className="mt-1"
                              />
                            </div>

                            <div>
                              <Label className="font-semibold">Next Action</Label>
                              <Select value={nextAction} onValueChange={(v: any) => setNextAction(v)}>
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="mark_resolved">✅ Mark Resolved</SelectItem>
                                  <SelectItem value="needs_additional_iteration">🔄 Needs Additional Iteration</SelectItem>
                                  <SelectItem value="request_case_study">📝 Request Case Study</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleSubmitValidation(iteration._id, iteration.feedbackIds[0])}
                                className="cursor-pointer flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                              >
                                <CheckCircle2 className="h-4 w-4 mr-2" />
                                Submit Validation
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => setShowValidationForm(null)}
                                className="cursor-pointer"
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <LinkIcon className="h-3 w-3" />
                        <span>{iteration.feedbackIds.length} feedback items</span>
                        <span>•</span>
                        <Clock className="h-3 w-3" />
                        <span>{new Date(iteration.createdAt).toLocaleDateString()}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Product Insights
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-12 text-muted-foreground">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg font-medium">AI-powered insights coming soon</p>
                <p className="text-sm">Pattern recognition and opportunity identification</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}