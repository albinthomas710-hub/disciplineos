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
  Link as LinkIcon,
  TrendingDown,
  Award,
  BarChart3,
  User,
  Calendar
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FeedbackForm } from "./entrepreneur/FeedbackForm";
import { IterationDetails } from "./entrepreneur/IterationDetails";
import { ValidationDisplay } from "./entrepreneur/ValidationDisplay";
import CustomerJourneyTimeline from "./CustomerJourneyTimeline";

export function EntrepreneurOSView() {
  const allFeedback = useQuery((api as any).entrepreneurOS.getAllFeedback);
  const allIterations = useQuery((api as any).entrepreneurOS.getAllIterations);
  const metrics = useQuery((api as any).entrepreneurOS.getSatisfactionMetrics);
  const insights = useQuery((api as any).entrepreneurOS.getProductInsights);
  
  // NEW: Insights queries
  const topProblems = useQuery((api as any).entrepreneurOS.getTopProblems);
  const churnRisk = useQuery((api as any).entrepreneurOS.getChurnRiskAlerts);
  const testimonialOps = useQuery((api as any).entrepreneurOS.getTestimonialOpportunities);
  const iterationEffectiveness = useQuery((api as any).entrepreneurOS.getIterationEffectiveness);
  
  // FIXED: Fetch all validations at the top level to avoid hooks in loops
  const allValidations = useQuery((api as any).impactValidation.getAllValidations);
  
  const createFeedback = useMutation((api as any).entrepreneurOS.createFeedback);
  const createIteration = useMutation((api as any).entrepreneurOS.createIteration);
  const updateFeedbackStatus = useMutation((api as any).entrepreneurOS.updateFeedbackStatus);
  const deleteFeedback = useMutation((api as any).entrepreneurOS.deleteFeedback);
  const updateIteration = useMutation((api as any).entrepreneurOS.updateIteration);
  const createValidation = useMutation((api as any).impactValidation.createValidation);
  
  const allCustomers = useQuery((api as any).entrepreneurOS.getAllCustomers);
  const [selectedCustomer, setSelectedCustomer] = useState<string | null>(null);
  const customerJourney = useQuery(
    (api as any).entrepreneurOS.getCustomerJourney,
    selectedCustomer ? { clientName: selectedCustomer } : "skip"
  );
  
  const [activeTab, setActiveTab] = useState("feedback");
  const [showValidationForm, setShowValidationForm] = useState(false);
  const [selectedIteration, setSelectedIteration] = useState<any | null>(null);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showIterationForm, setShowIterationForm] = useState(false);
  const [selectedFeedbackIds, setSelectedFeedbackIds] = useState<string[]>([]);
  
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
        setSelectedIteration(allIterations?.find((i: any) => i._id === iterationId));
        setShowValidationForm(true);
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
      
      setShowValidationForm(false);
      setSelectedIteration(null);
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

  const handleCreateIterationFromProblem = (feedbackIds: string[]) => {
    setSelectedFeedbackIds(feedbackIds);
    setShowIterationForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feedback">Feedback Loop</TabsTrigger>
          <TabsTrigger value="iterations">Iterations</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
          <TabsTrigger value="journey">Customer Journey</TabsTrigger>
        </TabsList>

        {/* FEEDBACK LOOP TAB */}
        <TabsContent value="feedback" className="space-y-6">
          <FeedbackForm onSuccess={() => {}} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold">Recent Feedback</h3>
              {selectedFeedbackIds.length > 0 && (
                <Button
                  onClick={() => {
                    setShowIterationForm(true);
                    setActiveTab("iterations");
                  }}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Create Iteration ({selectedFeedbackIds.length} selected)
                </Button>
              )}
            </div>
            {allFeedback && allFeedback.length > 0 ? (
              allFeedback.map((feedback: any) => (
                <Card 
                  key={feedback._id} 
                  onClick={() => toggleFeedbackSelection(feedback._id)}
                  className={`p-6 border-2 cursor-pointer transition-all duration-300 ${
                    selectedFeedbackIds.includes(feedback._id)
                      ? "border-purple-500 shadow-[0_0_30px_rgba(139,92,246,0.5)] bg-purple-50 dark:bg-purple-950"
                      : "hover:shadow-[0_0_30px_rgba(139,92,246,0.3)]"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedFeedbackIds.includes(feedback._id)}
                        onChange={() => {}}
                        className="w-5 h-5 text-purple-600 cursor-pointer"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-sm font-medium text-muted-foreground">
                        {selectedFeedbackIds.includes(feedback._id) ? "Selected for iteration" : "Click to select"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="text-lg font-bold">{feedback.clientName}</h4>
                        {feedback.companyName && (
                          <p className="text-sm text-muted-foreground">{feedback.companyName}</p>
                        )}
                        {feedback.clientEmail && (
                          <p className="text-sm text-muted-foreground">{feedback.clientEmail}</p>
                        )}
                        {feedback.clientPhone && (
                          <p className="text-sm text-muted-foreground">{feedback.clientPhone}</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Badge className={
                          feedback.priority === "critical" ? "bg-red-600" :
                          feedback.priority === "high" ? "bg-orange-600" :
                          feedback.priority === "medium" ? "bg-yellow-600" : "bg-gray-600"
                        }>
                          {feedback.priority.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">{feedback.feedbackType}</Badge>
                      </div>
                    </div>

                    <p className="text-muted-foreground">{feedback.feedbackText}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg text-center">
                        <p className="text-xs text-muted-foreground">Satisfaction</p>
                        <p className="text-2xl font-bold">{feedback.satisfactionScore}/10</p>
                      </div>
                      {feedback.painHours && feedback.painHours > 0 && (
                        <div className="p-3 bg-orange-50 dark:bg-orange-950 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Pain (hrs/week)</p>
                          <p className="text-2xl font-bold">{feedback.painHours}</p>
                        </div>
                      )}
                      {feedback.revenueAmount && feedback.revenueAmount > 0 && (
                        <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Revenue Impact</p>
                          <p className="text-2xl font-bold">${feedback.revenueAmount}</p>
                        </div>
                      )}
                      {feedback.urgencyLevel && (
                        <div className="p-3 bg-red-50 dark:bg-red-950 rounded-lg text-center">
                          <p className="text-xs text-muted-foreground">Urgency</p>
                          <p className="text-sm font-bold">{feedback.urgencyLevel.replace(/_/g, " ")}</p>
                        </div>
                      )}
                    </div>

                    {feedback.socialLinks && (
                      <div className="flex gap-3 pt-2 border-t">
                        {feedback.socialLinks.linkedin && (
                          <a href={feedback.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                            LinkedIn
                          </a>
                        )}
                        {feedback.socialLinks.twitter && (
                          <a href={feedback.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-sky-500 hover:underline text-sm">
                            Twitter
                          </a>
                        )}
                        {feedback.socialLinks.website && (
                          <a href={feedback.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-green-600 hover:underline text-sm">
                            Website
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No feedback yet. Add your first client feedback above!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* ITERATIONS TAB */}
        <TabsContent value="iterations" className="space-y-6">
          <Card className="p-6 border-2 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold">Create New Iteration</h3>
              <Button
                onClick={() => setShowIterationForm(!showIterationForm)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                {showIterationForm ? "Cancel" : "New Iteration"}
              </Button>
            </div>

            {showIterationForm && (
              <div className="space-y-4 mt-6 p-6 bg-white dark:bg-gray-900 rounded-lg border-2">
                <div>
                  <Label>Select Feedback to Address</Label>
                  <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                    {allFeedback && allFeedback.map((feedback: any) => (
                      <div
                        key={feedback._id}
                        onClick={() => toggleFeedbackSelection(feedback._id)}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedFeedbackIds.includes(feedback._id)
                            ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                            : "border-gray-200 dark:border-gray-700 hover:border-purple-300"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold">{feedback.clientName}</p>
                            <p className="text-sm text-muted-foreground">{feedback.feedbackText.slice(0, 80)}...</p>
                          </div>
                          <Badge className={selectedFeedbackIds.includes(feedback._id) ? "bg-purple-600" : "bg-gray-400"}>
                            {selectedFeedbackIds.includes(feedback._id) ? "Selected" : "Select"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Iteration Title *</Label>
                  <Input
                    value={iterationTitle}
                    onChange={(e) => setIterationTitle(e.target.value)}
                    placeholder="e.g., Improve onboarding flow"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={iterationDescription}
                    onChange={(e) => setIterationDescription(e.target.value)}
                    placeholder="What are you building?"
                    rows={3}
                  />
                </div>

                <div>
                  <Label>Hypothesis</Label>
                  <Textarea
                    value={iterationHypothesis}
                    onChange={(e) => setIterationHypothesis(e.target.value)}
                    placeholder="What do you believe will happen?"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Target Ship Date</Label>
                    <Input
                      type="date"
                      value={targetShipDate}
                      onChange={(e) => setTargetShipDate(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <Label>Complexity (1-10): {complexity}</Label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={complexity}
                    onChange={(e) => setComplexity(parseInt(e.target.value))}
                    className="w-full"
                  />
                </div>

                <Button
                  onClick={handleAddIteration}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Rocket className="h-4 w-4 mr-2" />
                  Create Iteration
                </Button>
              </div>
            )}
          </Card>

          <div className="space-y-4">
            {allIterations && allIterations.length > 0 ? (
              allIterations.map((iteration: any) => {
                // FIXED: Filter validations from the top-level query instead of calling useQuery in the loop
                const iterationValidations = allValidations?.filter(
                  (v: any) => v.iterationId === iteration._id
                ) || [];

                return (
                  <div key={iteration._id} className="space-y-4">
                    <IterationDetails
                      iteration={iteration}
                      onAddValidation={() => {
                        setSelectedIteration(iteration);
                        setShowValidationForm(true);
                      }}
                      onUpdateStatus={(status) => {
                        updateIteration({
                          iterationId: iteration._id,
                          status: status as any,
                          actualShipDate: status === "shipped" ? new Date().toISOString().split("T")[0] : undefined,
                        });
                      }}
                    />

                    {/* Display Validations */}
                    {iterationValidations.length > 0 && (
                      <div className="ml-8 space-y-3">
                        <h4 className="text-lg font-bold flex items-center gap-2">
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                          Impact Validations ({iterationValidations.length})
                        </h4>
                        {iterationValidations.map((validation: any) => {
                          const originalFeedback = allFeedback?.find((f: any) => f._id === validation.feedbackId);
                          return (
                            <ValidationDisplay
                              key={validation._id}
                              validation={validation}
                              originalFeedback={originalFeedback}
                            />
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">No iterations yet. Create your first iteration from feedback!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* INSIGHTS TAB */}
        <TabsContent value="insights" className="space-y-6">
          {/* Churn Risk Alerts */}
          {churnRisk && (churnRisk.criticalCount > 0 || churnRisk.lowSatisfactionCount > 0) && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              <Card className="border-2 border-red-500 bg-red-50 dark:bg-red-950/30 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                    <AlertTriangle className="h-6 w-6" />
                    🚨 Churn Risk Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {churnRisk.criticalCount > 0 && (
                    <div className="p-4 bg-red-100 dark:bg-red-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-red-900 dark:text-red-100">
                          {churnRisk.criticalCount} Critical Renewals Without Action
                        </h4>
                        <Badge className="bg-red-600 text-white">URGENT</Badge>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                        These customers marked issues as "Critical for renewal" but no iteration has been created
                      </p>
                      <div className="space-y-2">
                        {churnRisk.criticalFeedback.slice(0, 3).map((feedback: any) => (
                          <div key={feedback._id} className="p-3 bg-white dark:bg-gray-900 rounded-lg">
                            <p className="font-semibold">{feedback.clientName}</p>
                            <p className="text-sm text-muted-foreground">{feedback.feedbackText.slice(0, 100)}...</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {churnRisk.lowSatisfactionCount > 0 && (
                    <div className="p-4 bg-orange-100 dark:bg-orange-900/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-bold text-orange-900 dark:text-orange-100">
                          {churnRisk.lowSatisfactionCount} Customers Unhappy for 30+ Days
                        </h4>
                        <Badge className="bg-orange-600 text-white">WARNING</Badge>
                      </div>
                      <p className="text-sm text-orange-800 dark:text-orange-200">
                        Long-standing dissatisfaction increases churn risk
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Top Problems Section */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Top Problems by Impact
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Ranked by frequency × pain level × revenue at risk
              </p>
            </CardHeader>
            <CardContent className="pt-6">
              {!topProblems || topProblems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No problem patterns detected yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {topProblems.map((problem: any, index: number) => (
                    <motion.div
                      key={problem.problemKey}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-5 border-2 border-purple-200 dark:border-purple-800 rounded-xl bg-white dark:bg-gray-900 shadow-md"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg px-3 py-1">
                              #{index + 1}
                            </Badge>
                            <h4 className="font-bold text-lg">{problem.sampleText.slice(0, 60)}...</h4>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="flex items-center gap-1">
                              <Users className="h-4 w-4 text-purple-600" />
                              <strong>{problem.frequency}</strong> customers
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-orange-600" />
                              <strong>{problem.avgPainHours}h/week</strong> wasted
                            </span>
                            {problem.totalRevenue > 0 && (
                              <span className="flex items-center gap-1">
                                <TrendingDown className="h-4 w-4 text-red-600" />
                                <strong>${problem.totalRevenue.toLocaleString()}</strong> at risk
                              </span>
                            )}
                          </div>
                        </div>
                        <Button
                          onClick={() => handleCreateIterationFromProblem(problem.feedbackIds)}
                          className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Create Iteration
                        </Button>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <p className="text-xs text-muted-foreground">
                          Impact Score: <strong>{Math.round(problem.score)}</strong>
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Iteration Effectiveness */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Iteration Effectiveness
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!iterationEffectiveness || iterationEffectiveness.totalIterations === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Target className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No validated iterations yet</p>
                  <p className="text-sm">Ship iterations and collect impact data to see effectiveness</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-4">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950 rounded-xl text-center shadow-md"
                  >
                    <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                      {iterationEffectiveness.successRate}%
                    </p>
                    <p className="text-sm text-muted-foreground">Success Rate</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {iterationEffectiveness.successfulIterations} of {iterationEffectiveness.totalIterations} improved by 2+ points
                    </p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950 rounded-xl text-center shadow-md"
                  >
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                      +{iterationEffectiveness.avgImprovement}
                    </p>
                    <p className="text-sm text-muted-foreground">Avg Improvement</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Satisfaction points gained
                    </p>
                  </motion.div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 rounded-xl text-center shadow-md"
                  >
                    <Zap className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                      {iterationEffectiveness.totalIterations}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Validated</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Iterations measured
                    </p>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Testimonial Opportunities */}
          <Card className="shadow-lg">
            <CardHeader className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Testimonial Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {!testimonialOps || testimonialOps.totalOpportunities === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Award className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>No testimonial opportunities yet</p>
                  <p className="text-sm">Ship iterations and collect high satisfaction ratings</p>
                </div>
              ) : (
                <div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                        {testimonialOps.postIterationWins}
                      </p>
                      <p className="text-xs text-muted-foreground">Post-Iteration Wins</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                        {testimonialOps.praiseFeedback}
                      </p>
                      <p className="text-xs text-muted-foreground">Praise Feedback</p>
                    </div>
                    <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg text-center">
                      <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                        {testimonialOps.highSatisfaction}
                      </p>
                      <p className="text-xs text-muted-foreground">High Satisfaction</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center">
                    <Button
                      className="cursor-pointer bg-gradient-to-r from-yellow-600 to-orange-600 hover:from-yellow-700 hover:to-orange-700"
                    >
                      <Award className="h-4 w-4 mr-2" />
                      Request Case Studies ({testimonialOps.totalOpportunities})
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* CUSTOMER JOURNEY TAB */}
        <TabsContent value="journey" className="space-y-6">
          {selectedCustomer && customerJourney ? (
            <CustomerJourneyTimeline
              journey={customerJourney}
              onClose={() => setSelectedCustomer(null)}
            />
          ) : (
            <Card className="shadow-lg">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950 dark:to-emerald-950">
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Journeys
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Track each customer's complete journey from signup to success
                </p>
              </CardHeader>
              <CardContent className="pt-6">
                {!allCustomers || allCustomers.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <User className="h-16 w-16 mx-auto mb-4 opacity-30" />
                    <p className="text-lg font-medium">No customers yet</p>
                    <p className="text-sm">Add feedback to start tracking customer journeys</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {allCustomers.map((customer: any, index: number) => (
                      <motion.div
                        key={customer.clientName}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedCustomer(customer.clientName)}
                        className="p-5 border-2 border-green-200 dark:border-green-800 rounded-xl bg-white dark:bg-gray-900 shadow-md hover:shadow-xl transition-all cursor-pointer hover:border-green-400 dark:hover:border-green-600"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="bg-gradient-to-br from-green-600 to-emerald-600 p-2 rounded-lg">
                                <User className="h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h4 className="font-bold text-lg">{customer.clientName}</h4>
                                {customer.clientEmail && (
                                  <p className="text-xs text-muted-foreground">{customer.clientEmail}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 text-purple-600" />
                                <strong>{customer.feedbackCount}</strong> feedback
                              </span>
                              <span className="flex items-center gap-1">
                                <Star className="h-3 w-3 text-yellow-600" />
                                <strong>{customer.avgSatisfaction}/10</strong> avg
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-blue-600" />
                                Since {new Date(customer.firstSeen).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={customer.latestSatisfaction >= 8 ? "default" : customer.latestSatisfaction >= 5 ? "secondary" : "destructive"}
                              className="text-sm"
                            >
                              {customer.latestSatisfaction >= 8 ? "😊 Happy" : customer.latestSatisfaction >= 5 ? "😐 Neutral" : "😞 At Risk"}
                            </Badge>
                            <ArrowRight className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Validation Form Dialog */}
      {showValidationForm && selectedIteration && (
        <Dialog open={showValidationForm} onOpenChange={(open) => setShowValidationForm(open)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Impact Validation</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
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
                  onClick={() => handleSubmitValidation(selectedIteration._id, selectedIteration.feedbackIds[0])}
                  className="cursor-pointer flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Submit Validation
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowValidationForm(false)}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}