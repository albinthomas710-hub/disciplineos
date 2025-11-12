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
import { motion } from "framer-motion";
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
  Zap
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
  
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [showIterationForm, setShowIterationForm] = useState(false);
  
  // Feedback form state
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [feedbackType, setFeedbackType] = useState("general");
  const [feedbackText, setFeedbackText] = useState("");
  const [satisfactionScore, setSatisfactionScore] = useState(5);
  const [priority, setPriority] = useState("medium");

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
      });
      
      setClientName("");
      setClientEmail("");
      setFeedbackText("");
      setSatisfactionScore(5);
      setShowFeedbackForm(false);
      toast.success("Feedback captured! 🎯");
    } catch (error) {
      toast.error("Failed to add feedback");
    }
  };

  if (!allFeedback) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Handle empty metrics (no feedback yet)
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

  return (
    <div className="space-y-6">
      {/* Elite Header */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
      >
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 dark:from-purple-950 dark:via-pink-950 dark:to-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 via-pink-600 to-orange-600 p-3 rounded-xl">
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
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold">{displayMetrics.totalFeedback}</p>
                <p className="text-xs text-muted-foreground">Total Feedback</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg text-center">
                <Star className="h-6 w-6 mx-auto mb-2 text-yellow-600" />
                <p className="text-2xl font-bold">{displayMetrics.averageSatisfaction}/10</p>
                <p className="text-xs text-muted-foreground">Avg Satisfaction</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg text-center">
                <ThumbsUp className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold">{displayMetrics.positivePercentage}%</p>
                <p className="text-xs text-muted-foreground">Positive Rate</p>
              </div>
              <div className="p-4 bg-white/50 dark:bg-gray-900/50 rounded-lg text-center">
                <TrendingUp className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold">{allIterations?.length || 0}</p>
                <p className="text-xs text-muted-foreground">Iterations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="feedback" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="feedback">
            <MessageSquare className="h-4 w-4 mr-2" />
            Feedback Loop
          </TabsTrigger>
          <TabsTrigger value="iterations">
            <Zap className="h-4 w-4 mr-2" />
            Iterations
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Lightbulb className="h-4 w-4 mr-2" />
            Insights
          </TabsTrigger>
        </TabsList>

        {/* Feedback Tab */}
        <TabsContent value="feedback" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Client Feedback</CardTitle>
                <Button
                  onClick={() => setShowFeedbackForm(!showFeedbackForm)}
                  className="cursor-pointer"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Feedback
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {showFeedbackForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  className="space-y-4 p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50/50 dark:bg-purple-950/50"
                >
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Client Name *</Label>
                      <Input
                        placeholder="John Doe"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Client Email</Label>
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
                      <Label>Feedback Type</Label>
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
                      <Label>Priority</Label>
                      <Select value={priority} onValueChange={setPriority}>
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                          <SelectItem value="critical">Critical</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label>Satisfaction Score: {satisfactionScore}/10</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((score) => (
                        <button
                          key={score}
                          onClick={() => setSatisfactionScore(score)}
                          className={`w-10 h-10 rounded-lg font-bold transition-all cursor-pointer ${
                            satisfactionScore >= score
                              ? "bg-gradient-to-br from-purple-600 to-pink-600 text-white"
                              : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                          }`}
                        >
                          {score}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label>Feedback *</Label>
                    <Textarea
                      placeholder="What did the client say?"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={4}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleAddFeedback} className="cursor-pointer flex-1">
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

              {/* Feedback List */}
              {allFeedback.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No feedback yet. Start capturing client insights!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {allFeedback.map((feedback: any) => (
                    <motion.div
                      key={feedback._id}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      className="p-4 border-2 rounded-lg bg-white dark:bg-gray-900"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold">{feedback.clientName}</h4>
                          <p className="text-xs text-muted-foreground">{feedback.clientEmail}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={feedback.satisfactionScore >= 8 ? "default" : "secondary"}>
                            {feedback.satisfactionScore}/10
                          </Badge>
                          <Badge>{feedback.feedbackType}</Badge>
                        </div>
                      </div>
                      <p className="text-sm mb-2">{feedback.feedbackText}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{new Date(feedback.createdAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <Badge variant="outline">{feedback.status}</Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Iterations Tab */}
        <TabsContent value="iterations">
          <Card>
            <CardHeader>
              <CardTitle>Product Iterations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Iteration tracking coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Insights Tab */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>Product Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Lightbulb className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>AI-powered insights coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
