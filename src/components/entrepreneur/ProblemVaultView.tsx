import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Loader2, MessageSquare, TrendingUp, XCircle, Calendar, Lightbulb, Trash2 } from "lucide-react";
import { ProblemStatsCards } from "./ProblemStatsCards";
import { ProblemColumn } from "./ProblemColumn";
import { ProblemFormDialog } from "./ProblemFormDialog";
import { LearningFormDialog } from "./LearningFormDialog";
import { PivotFormDialog } from "./PivotFormDialog";
import { FailureFormDialog } from "./FailureFormDialog";
import { SolutionFormDialog } from "./SolutionFormDialog";
import { ProblemDetailsDialog } from "./ProblemDetailsDialog";
import { FailureDetailsDialog } from "./FailureDetailsDialog";
import { LearningDetailsDialog } from "./LearningDetailsDialog";
import { PivotDetailsDialog } from "./PivotDetailsDialog";
import { SolutionDetailsDialog } from "./SolutionDetailsDialog";
import { 
  useAllProblems,
  useProblemStats,
  useAllCustomerLearnings,
  useAllPivots,
  useAllFailures,
  useCreateProblem,
  useCreateLearning,
  useCreatePivot,
  useCreateFailure,
  useAllSolutions,
  useCreateSolution,
  useDeleteProblem,
  useDeleteSolution,
  useDeleteLearning,
  useDeletePivot,
  useDeleteFailure
} from "@/hooks/use-problem-vault-queries";

export function ProblemVaultView() {
  // Use wrapper hooks to avoid deep type instantiation
  const allProblems = useAllProblems();
  const problemStats = useProblemStats();
  const allLearnings = useAllCustomerLearnings();
  const allPivots = useAllPivots();
  const allFailures = useAllFailures();
  const allSolutions = useAllSolutions();
  
  const createProblem = useCreateProblem();
  const createLearning = useCreateLearning();
  const createPivot = useCreatePivot();
  const createFailure = useCreateFailure();
  const createSolution = useCreateSolution();
  
  const deleteProblem = useDeleteProblem();
  const deleteSolution = useDeleteSolution();
  const deleteLearning = useDeleteLearning();
  const deletePivot = useDeletePivot();
  const deleteFailure = useDeleteFailure();
  
  const [activeTab, setActiveTab] = useState("problems");
  const [showProblemForm, setShowProblemForm] = useState(false);
  const [showLearningForm, setShowLearningForm] = useState(false);
  const [showPivotForm, setShowPivotForm] = useState(false);
  const [showFailureForm, setShowFailureForm] = useState(false);
  const [showSolutionForm, setShowSolutionForm] = useState(false);
  
  // NEW: Detail view states
  const [selectedProblemForDetails, setSelectedProblemForDetails] = useState<any | null>(null);
  const [showProblemDetails, setShowProblemDetails] = useState(false);
  
  const [selectedFailureForDetails, setSelectedFailureForDetails] = useState<any | null>(null);
  const [showFailureDetails, setShowFailureDetails] = useState(false);
  
  const [selectedLearningForDetails, setSelectedLearningForDetails] = useState<any | null>(null);
  const [showLearningDetails, setShowLearningDetails] = useState(false);
  
  const [selectedPivotForDetails, setSelectedPivotForDetails] = useState<any | null>(null);
  const [showPivotDetails, setShowPivotDetails] = useState(false);
  
  const [selectedSolutionForDetails, setSelectedSolutionForDetails] = useState<any | null>(null);
  const [showSolutionDetails, setShowSolutionDetails] = useState(false);
  
  // Problem form state
  const [problemTitle, setProblemTitle] = useState("");
  const [problemDescription, setProblemDescription] = useState("");
  const [problemCategory, setProblemCategory] = useState("roi_focus");
  const [dollarValue, setDollarValue] = useState(0);
  const [painLevel, setPainLevel] = useState(5);
  const [discoverySource, setDiscoverySource] = useState("customer_interview");
  const [discoveredDate, setDiscoveredDate] = useState(new Date().toISOString().split('T')[0]);
  const [customerName, setCustomerName] = useState("");
  const [industry, setIndustry] = useState("");
  const [status, setStatus] = useState("discovered");
  const [peopleWhoHaveThis, setPeopleWhoHaveThis] = useState(1);
  const [notes, setNotes] = useState("");
  
  // NEW: Pain/Urgency/Cost Framework state
  const [isPainful, setIsPainful] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCostly, setIsCostly] = useState(false);
  const [is8020Focus, setIs8020Focus] = useState(false);
  
  // NEW: Deadline Tracking state
  const [validationDeadline, setValidationDeadline] = useState("");
  const [solutionDeadline, setSolutionDeadline] = useState("");
  const [deadlineNotes, setDeadlineNotes] = useState("");
  
  // NEW: Pain Point Mining state
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceType, setSourceType] = useState("");
  const [miningNotes, setMiningNotes] = useState("");

  // Learning form state
  const [learningDate, setLearningDate] = useState(new Date().toISOString().split('T')[0]);
  const [learningCustomer, setLearningCustomer] = useState("");
  const [conversationType, setConversationType] = useState("discovery_call");
  const [problemsDiscovered, setProblemsDiscovered] = useState("");
  const [exactQuotes, setExactQuotes] = useState("");
  const [painPoints, setPainPoints] = useState("");
  const [dollarImpact, setDollarImpact] = useState(0);
  const [industryInsights, setIndustryInsights] = useState("");

  // Pivot form state
  const [pivotDate, setPivotDate] = useState(new Date().toISOString().split('T')[0]);
  const [pivotType, setPivotType] = useState("niche_change");
  const [fromWhat, setFromWhat] = useState("");
  const [toWhat, setToWhat] = useState("");
  const [whyPivoting, setWhyPivoting] = useState("");
  const [trigger, setTrigger] = useState("customer_insight");
  const [evidence, setEvidence] = useState("");
  const [expectedImpact, setExpectedImpact] = useState("");

  // Failure form state
  const [failureDate, setFailureDate] = useState(new Date().toISOString().split('T')[0]);
  const [whatFailed, setWhatFailed] = useState("");
  const [whyItFailed, setWhyItFailed] = useState("");
  const [costOfFailure, setCostOfFailure] = useState(0);
  const [lessonLearned, setLessonLearned] = useState("");
  const [whatToDoDifferently, setWhatToDoDifferently] = useState("");
  const [patternCategory, setPatternCategory] = useState("wrong_problem");

  // Solution form state
  const [selectedProblemId, setSelectedProblemId] = useState("");
  const [solutionTitle, setSolutionTitle] = useState("");
  const [solutionDescription, setSolutionDescription] = useState("");
  const [hypothesis, setHypothesis] = useState("");
  const [expectedOutcome, setExpectedOutcome] = useState("");
  const [buildComplexity, setBuildComplexity] = useState(5);
  const [timeToBuild, setTimeToBuild] = useState(0);
  const [solutionStatus, setSolutionStatus] = useState("idea");

  const handleAddProblem = async () => {
    if (!problemTitle.trim() || !problemDescription.trim()) {
      toast.error("Please fill in title and description");
      return;
    }

    try {
      await createProblem({
        problemTitle,
        problemDescription,
        problemCategory: problemCategory as any,
        dollarValue,
        painLevel,
        discoverySource: discoverySource as any,
        discoveredDate,
        customerName: customerName || undefined,
        industry: industry || undefined,
        status: status as any,
        peopleWhoHaveThis,
        notes: notes || undefined,
        isPainful: isPainful || undefined,
        isUrgent: isUrgent || undefined,
        isCostly: isCostly || undefined,
        is8020Focus: is8020Focus || undefined,
        validationDeadline: validationDeadline || undefined,
        solutionDeadline: solutionDeadline || undefined,
        deadlineNotes: deadlineNotes || undefined,
        sourceUrl: sourceUrl || undefined,
        sourceType: sourceType || undefined,
        miningNotes: miningNotes || undefined,
      });
      
      resetProblemForm();
      setShowProblemForm(false);
      toast.success("Problem added to vault! 💡");
    } catch (error) {
      toast.error("Failed to add problem");
    }
  };

  const handleAddLearning = async () => {
    if (!learningCustomer.trim() || !problemsDiscovered.trim()) {
      toast.error("Please fill in customer name and problems discovered");
      return;
    }

    try {
      await createLearning({
        date: learningDate,
        customerName: learningCustomer,
        conversationType: conversationType as any,
        problemsDiscovered,
        exactQuotes: exactQuotes || undefined,
        painPoints: painPoints.split(",").map(p => p.trim()).filter(p => p),
        dollarImpact: dollarImpact > 0 ? dollarImpact : undefined,
        industryInsights: industryInsights || undefined,
      });
      
      resetLearningForm();
      setShowLearningForm(false);
      toast.success("Customer learning logged! 📝");
    } catch (error) {
      toast.error("Failed to log learning");
    }
  };

  const handleAddPivot = async () => {
    if (!fromWhat.trim() || !toWhat.trim() || !whyPivoting.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createPivot({
        pivotDate,
        pivotType: pivotType as any,
        fromWhat,
        toWhat,
        whyPivoting,
        trigger: trigger as any,
        evidence,
        expectedImpact,
      });
      
      resetPivotForm();
      setShowPivotForm(false);
      toast.success("Pivot logged! 🔄");
    } catch (error) {
      toast.error("Failed to log pivot");
    }
  };

  const handleAddFailure = async () => {
    if (!whatFailed.trim() || !whyItFailed.trim() || !lessonLearned.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createFailure({
        failureDate,
        whatFailed,
        whyItFailed,
        costOfFailure: costOfFailure > 0 ? costOfFailure : undefined,
        lessonLearned,
        whatToDoDifferently,
        patternCategory: patternCategory as any,
      });
      
      resetFailureForm();
      setShowFailureForm(false);
      toast.success("Failure documented! 📚");
    } catch (error) {
      toast.error("Failed to log failure");
    }
  };

  const handleAddSolution = async () => {
    if (!selectedProblemId || !solutionTitle.trim() || !solutionDescription.trim() || !hypothesis.trim() || !expectedOutcome.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    try {
      await createSolution({
        problemId: selectedProblemId as any,
        solutionTitle,
        solutionDescription,
        hypothesis,
        expectedOutcome,
        buildComplexity,
        timeToBuild: timeToBuild > 0 ? timeToBuild : undefined,
        dateStarted: solutionStatus !== "idea" ? new Date().toISOString().split('T')[0] : undefined,
        status: solutionStatus as any,
      });
      
      resetSolutionForm();
      setShowSolutionForm(false);
      toast.success("Solution added! 💡");
    } catch (error) {
      toast.error("Failed to add solution");
    }
  };

  const handleDeleteProblem = async (problemId: string) => {
    if (!confirm("Are you sure you want to delete this problem?")) return;
    try {
      await deleteProblem({ problemId: problemId as any });
      toast.success("Problem deleted");
    } catch (error) {
      toast.error("Failed to delete problem");
    }
  };

  const handleDeleteSolution = async (solutionId: string) => {
    if (!confirm("Are you sure you want to delete this solution?")) return;
    try {
      await deleteSolution({ solutionId: solutionId as any });
      toast.success("Solution deleted");
    } catch (error) {
      toast.error("Failed to delete solution");
    }
  };

  const handleDeleteLearning = async (learningId: string) => {
    if (!confirm("Are you sure you want to delete this learning?")) return;
    try {
      await deleteLearning({ learningId: learningId as any });
      toast.success("Learning deleted");
    } catch (error) {
      toast.error("Failed to delete learning");
    }
  };

  const handleDeletePivot = async (pivotId: string) => {
    if (!confirm("Are you sure you want to delete this pivot?")) return;
    try {
      await deletePivot({ pivotId: pivotId as any });
      toast.success("Pivot deleted");
    } catch (error) {
      toast.error("Failed to delete pivot");
    }
  };

  const handleDeleteFailure = async (failureId: string) => {
    if (!confirm("Are you sure you want to delete this failure?")) return;
    try {
      await deleteFailure({ failureId: failureId as any });
      toast.success("Failure deleted");
    } catch (error) {
      toast.error("Failed to delete failure");
    }
  };

  const resetProblemForm = () => {
    setProblemTitle("");
    setProblemDescription("");
    setProblemCategory("roi_focus");
    setDollarValue(0);
    setPainLevel(5);
    setDiscoverySource("customer_interview");
    setDiscoveredDate(new Date().toISOString().split('T')[0]);
    setCustomerName("");
    setIndustry("");
    setStatus("discovered");
    setPeopleWhoHaveThis(1);
    setNotes("");
    setIsPainful(false);
    setIsUrgent(false);
    setIsCostly(false);
    setIs8020Focus(false);
    setValidationDeadline("");
    setSolutionDeadline("");
    setDeadlineNotes("");
    setSourceUrl("");
    setSourceType("");
    setMiningNotes("");
  };

  const resetLearningForm = () => {
    setLearningDate(new Date().toISOString().split('T')[0]);
    setLearningCustomer("");
    setConversationType("discovery_call");
    setProblemsDiscovered("");
    setExactQuotes("");
    setPainPoints("");
    setDollarImpact(0);
    setIndustryInsights("");
  };

  const resetPivotForm = () => {
    setPivotDate(new Date().toISOString().split('T')[0]);
    setPivotType("niche_change");
    setFromWhat("");
    setToWhat("");
    setWhyPivoting("");
    setTrigger("customer_insight");
    setEvidence("");
    setExpectedImpact("");
  };

  const resetFailureForm = () => {
    setFailureDate(new Date().toISOString().split('T')[0]);
    setWhatFailed("");
    setWhyItFailed("");
    setCostOfFailure(0);
    setLessonLearned("");
    setWhatToDoDifferently("");
    setPatternCategory("wrong_problem");
  };

  const resetSolutionForm = () => {
    setSelectedProblemId("");
    setSolutionTitle("");
    setSolutionDescription("");
    setHypothesis("");
    setExpectedOutcome("");
    setBuildComplexity(5);
    setTimeToBuild(0);
    setSolutionStatus("idea");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated": return "bg-green-600";
      case "building_solution": return "bg-blue-600";
      case "testing": return "bg-yellow-600";
      case "shelved": return "bg-gray-600";
      default: return "bg-orange-600";
    }
  };

  if (!allProblems) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const bigProblems = allProblems.filter((p: any) => p.problemCategory === "big_10m_plus");
  const roiFocusProblems = allProblems.filter((p: any) => p.problemCategory === "roi_focus");
  const smallWinProblems = allProblems.filter((p: any) => p.problemCategory === "small_win");
  const peoplePayProblems = allProblems.filter((p: any) => p.problemCategory === "people_pay_for");

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="problems">Problems</TabsTrigger>
          <TabsTrigger value="solutions">Solutions</TabsTrigger>
          <TabsTrigger value="learnings">Customer Learnings</TabsTrigger>
          <TabsTrigger value="pivots">Pivots</TabsTrigger>
          <TabsTrigger value="failures">Failures</TabsTrigger>
          <TabsTrigger value="review">Weekly Review</TabsTrigger>
        </TabsList>

        {/* PROBLEMS TAB */}
        <TabsContent value="problems" className="space-y-6">
          <ProblemStatsCards stats={problemStats} />

          <div className="flex justify-end">
            <Button
              onClick={() => setShowProblemForm(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Problem
            </Button>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <ProblemColumn
              title="Big $10M+"
              problems={bigProblems}
              gradientColor="from-purple-600 to-purple-800"
              borderColor="border-purple-200 dark:border-purple-800"
              getStatusColor={getStatusColor}
              onDelete={handleDeleteProblem}
              onViewDetails={(problemId) => {
                const problem = allProblems?.find((p: any) => p._id === problemId);
                if (problem) {
                  setSelectedProblemForDetails(problem);
                  setShowProblemDetails(true);
                }
              }}
            />
            <ProblemColumn
              title="ROI Focus"
              problems={roiFocusProblems}
              gradientColor="from-green-600 to-green-800"
              borderColor="border-green-200 dark:border-green-800"
              getStatusColor={getStatusColor}
              onDelete={handleDeleteProblem}
              onViewDetails={(problemId) => {
                const problem = allProblems?.find((p: any) => p._id === problemId);
                if (problem) {
                  setSelectedProblemForDetails(problem);
                  setShowProblemDetails(true);
                }
              }}
            />
            <ProblemColumn
              title="Small Wins"
              problems={smallWinProblems}
              gradientColor="from-blue-600 to-blue-800"
              borderColor="border-blue-200 dark:border-blue-800"
              getStatusColor={getStatusColor}
              onDelete={handleDeleteProblem}
              onViewDetails={(problemId) => {
                const problem = allProblems?.find((p: any) => p._id === problemId);
                if (problem) {
                  setSelectedProblemForDetails(problem);
                  setShowProblemDetails(true);
                }
              }}
            />
            <ProblemColumn
              title="People Pay For"
              problems={peoplePayProblems}
              gradientColor="from-yellow-600 to-yellow-800"
              borderColor="border-yellow-200 dark:border-yellow-800"
              getStatusColor={getStatusColor}
              onDelete={handleDeleteProblem}
              onViewDetails={(problemId) => {
                const problem = allProblems?.find((p: any) => p._id === problemId);
                if (problem) {
                  setSelectedProblemForDetails(problem);
                  setShowProblemDetails(true);
                }
              }}
            />
          </div>
        </TabsContent>

        {/* SOLUTIONS TAB */}
        <TabsContent value="solutions" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Solutions</h3>
              <p className="text-sm text-muted-foreground">Track solution ideas and their outcomes</p>
            </div>
            <Button
              onClick={() => setShowSolutionForm(true)}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Solution
            </Button>
          </div>

          <div className="space-y-4">
            {allSolutions && allSolutions.length > 0 ? (
              allSolutions.map((solution: any) => {
                const problem = allProblems?.find((p: any) => p._id === solution.problemId);
                return (
                  <Card 
                    key={solution._id} 
                    className="border-2 border-green-200 dark:border-green-800 cursor-pointer hover:shadow-lg transition-all"
                    onClick={() => {
                      setSelectedSolutionForDetails(solution);
                      setShowSolutionDetails(true);
                    }}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-bold text-lg">{solution.solutionTitle}</h4>
                          {problem && (
                            <p className="text-sm text-muted-foreground">
                              Solving: {problem.problemTitle}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={
                            solution.status === "validated" ? "bg-green-600" :
                            solution.status === "shipped" ? "bg-blue-600" :
                            solution.status === "testing" ? "bg-yellow-600" :
                            solution.status === "building" ? "bg-orange-600" :
                            solution.status === "failed" ? "bg-red-600" : "bg-gray-600"
                          }>
                            {solution.status}
                          </Badge>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteSolution(solution._id);
                            }}
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{solution.solutionDescription}</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Hypothesis:</p>
                          <p className="text-sm">{solution.hypothesis}</p>
                        </div>
                        <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                          <p className="text-xs font-semibold mb-1">Expected Outcome:</p>
                          <p className="text-sm">{solution.expectedOutcome}</p>
                        </div>
                      </div>
                      <div className="flex gap-4 text-sm">
                        <span>Complexity: {solution.buildComplexity}/10</span>
                        {solution.timeToBuild && <span>Time: {solution.timeToBuild} hours</span>}
                      </div>
                      <p className="text-xs text-muted-foreground italic">Click to view full details...</p>
                    </CardContent>
                  </Card>
                );
              })
            ) : (
              <Card className="p-12 text-center">
                <Lightbulb className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">No solutions yet. Start adding solution ideas for your problems!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* CUSTOMER LEARNINGS TAB */}
        <TabsContent value="learnings" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Customer Learnings</h3>
              <p className="text-sm text-muted-foreground">Document insights from customer conversations</p>
            </div>
            <Button
              onClick={() => setShowLearningForm(true)}
              className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Learning
            </Button>
          </div>

          <div className="space-y-4">
            {allLearnings && allLearnings.length > 0 ? (
              allLearnings.map((learning: any) => (
                <Card key={learning._id} className="border-2 border-blue-200 dark:border-blue-800 cursor-pointer hover:shadow-lg transition-all" onClick={() => {
                  setSelectedLearningForDetails(learning);
                  setShowLearningDetails(true);
                }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg">{learning.customerName}</h4>
                            <p className="text-sm text-muted-foreground">{new Date(learning.date).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-blue-600">{learning.conversationType}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLearning(learning._id);
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border-l-4 border-red-600">
                        <p className="font-semibold text-sm mb-1">📋 Problems Discovered:</p>
                        <p className="text-sm line-clamp-2">{learning.problemsDiscovered}</p>
                      </div>
                      <p className="text-xs text-muted-foreground italic">Click to view full details...</p>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">No customer learnings yet. Start logging conversations!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* PIVOTS TAB */}
        <TabsContent value="pivots" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Strategic Pivots</h3>
              <p className="text-sm text-muted-foreground">Track major strategic shifts and their outcomes</p>
            </div>
            <Button
              onClick={() => setShowPivotForm(true)}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Log Pivot
            </Button>
          </div>

          <div className="space-y-4">
            {allPivots && allPivots.length > 0 ? (
              allPivots.map((pivot: any) => (
                <Card key={pivot._id} className="border-2 border-orange-200 dark:border-orange-800 cursor-pointer hover:shadow-lg transition-all" onClick={() => {
                  setSelectedPivotForDetails(pivot);
                  setShowPivotDetails(true);
                }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <Badge className="bg-orange-600 mb-2">{pivot.pivotType}</Badge>
                            <p className="text-sm text-muted-foreground">{new Date(pivot.pivotDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">{pivot.trigger}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeletePivot(pivot._id);
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <p className="text-xs font-semibold mb-1">FROM:</p>
                        <p className="text-sm line-clamp-2">{pivot.fromWhat}</p>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <p className="text-xs font-semibold mb-1">TO:</p>
                        <p className="text-sm line-clamp-2">{pivot.toWhat}</p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Click to view full details...</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <TrendingUp className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">No pivots logged yet. Document strategic shifts here!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* FAILURES TAB */}
        <TabsContent value="failures" className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-2xl font-bold">Failures Vault</h3>
              <p className="text-sm text-muted-foreground">Learn from what didn't work</p>
            </div>
            <Button
              onClick={() => setShowFailureForm(true)}
              className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Document Failure
            </Button>
          </div>

          <div className="space-y-4">
            {allFailures && allFailures.length > 0 ? (
              allFailures.map((failure: any) => (
                <Card key={failure._id} className="border-2 border-red-200 dark:border-red-800 cursor-pointer hover:shadow-lg transition-all" onClick={() => {
                  setSelectedFailureForDetails(failure);
                  setShowFailureDetails(true);
                }}>
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-bold text-lg">{failure.whatFailed}</h4>
                            <p className="text-sm text-muted-foreground">{new Date(failure.failureDate).toLocaleDateString()}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-red-600">{failure.patternCategory}</Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteFailure(failure._id);
                              }}
                              className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
                      <p className="font-semibold text-sm mb-1">Lesson Learned:</p>
                      <p className="text-sm line-clamp-2">{failure.lessonLearned}</p>
                    </div>
                    <p className="text-xs text-muted-foreground italic">Click to view full details...</p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="p-12 text-center">
                <XCircle className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-muted-foreground">No failures documented yet. Learn from what doesn't work!</p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* WEEKLY REVIEW TAB */}
        <TabsContent value="review" className="space-y-6">
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium mb-2">Weekly Problem Review</p>
            <p className="text-sm text-muted-foreground">
              Review your problem discovery, validation progress, and learnings
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      <ProblemFormDialog
        open={showProblemForm}
        onOpenChange={setShowProblemForm}
        onSubmit={handleAddProblem}
        problemTitle={problemTitle}
        setProblemTitle={setProblemTitle}
        problemDescription={problemDescription}
        setProblemDescription={setProblemDescription}
        problemCategory={problemCategory}
        setProblemCategory={setProblemCategory}
        status={status}
        setStatus={setStatus}
        dollarValue={dollarValue}
        setDollarValue={setDollarValue}
        painLevel={painLevel}
        setPainLevel={setPainLevel}
        discoverySource={discoverySource}
        setDiscoverySource={setDiscoverySource}
        discoveredDate={discoveredDate}
        setDiscoveredDate={setDiscoveredDate}
        customerName={customerName}
        setCustomerName={setCustomerName}
        industry={industry}
        setIndustry={setIndustry}
        peopleWhoHaveThis={peopleWhoHaveThis}
        setPeopleWhoHaveThis={setPeopleWhoHaveThis}
        notes={notes}
        setNotes={setNotes}
        isPainful={isPainful}
        setIsPainful={setIsPainful}
        isUrgent={isUrgent}
        setIsUrgent={setIsUrgent}
        isCostly={isCostly}
        setIsCostly={setIsCostly}
        is8020Focus={is8020Focus}
        setIs8020Focus={setIs8020Focus}
        validationDeadline={validationDeadline}
        setValidationDeadline={setValidationDeadline}
        solutionDeadline={solutionDeadline}
        setSolutionDeadline={setSolutionDeadline}
        deadlineNotes={deadlineNotes}
        setDeadlineNotes={setDeadlineNotes}
        sourceUrl={sourceUrl}
        setSourceUrl={setSourceUrl}
        sourceType={sourceType}
        setSourceType={setSourceType}
        miningNotes={miningNotes}
        setMiningNotes={setMiningNotes}
      />

      <LearningFormDialog
        open={showLearningForm}
        onOpenChange={setShowLearningForm}
        onSubmit={handleAddLearning}
        learningDate={learningDate}
        setLearningDate={setLearningDate}
        learningCustomer={learningCustomer}
        setLearningCustomer={setLearningCustomer}
        conversationType={conversationType}
        setConversationType={setConversationType}
        problemsDiscovered={problemsDiscovered}
        setProblemsDiscovered={setProblemsDiscovered}
        exactQuotes={exactQuotes}
        setExactQuotes={setExactQuotes}
        painPoints={painPoints}
        setPainPoints={setPainPoints}
        dollarImpact={dollarImpact}
        setDollarImpact={setDollarImpact}
        industryInsights={industryInsights}
        setIndustryInsights={setIndustryInsights}
      />

      <PivotFormDialog
        open={showPivotForm}
        onOpenChange={setShowPivotForm}
        onSubmit={handleAddPivot}
        pivotDate={pivotDate}
        setPivotDate={setPivotDate}
        pivotType={pivotType}
        setPivotType={setPivotType}
        fromWhat={fromWhat}
        setFromWhat={setFromWhat}
        toWhat={toWhat}
        setToWhat={setToWhat}
        whyPivoting={whyPivoting}
        setWhyPivoting={setWhyPivoting}
        trigger={trigger}
        setTrigger={setTrigger}
        evidence={evidence}
        setEvidence={setEvidence}
        expectedImpact={expectedImpact}
        setExpectedImpact={setExpectedImpact}
      />

      <FailureFormDialog
        open={showFailureForm}
        onOpenChange={setShowFailureForm}
        onSubmit={handleAddFailure}
        failureDate={failureDate}
        setFailureDate={setFailureDate}
        whatFailed={whatFailed}
        setWhatFailed={setWhatFailed}
        whyItFailed={whyItFailed}
        setWhyItFailed={setWhyItFailed}
        costOfFailure={costOfFailure}
        setCostOfFailure={setCostOfFailure}
        lessonLearned={lessonLearned}
        setLessonLearned={setLessonLearned}
        whatToDoDifferently={whatToDoDifferently}
        setWhatToDoDifferently={setWhatToDoDifferently}
        patternCategory={patternCategory}
        setPatternCategory={setPatternCategory}
      />

      <SolutionFormDialog
        open={showSolutionForm}
        onOpenChange={setShowSolutionForm}
        onSubmit={handleAddSolution}
        allProblems={allProblems || []}
        selectedProblemId={selectedProblemId}
        setSelectedProblemId={setSelectedProblemId}
        solutionTitle={solutionTitle}
        setSolutionTitle={setSolutionTitle}
        solutionDescription={solutionDescription}
        setSolutionDescription={setSolutionDescription}
        hypothesis={hypothesis}
        setHypothesis={setHypothesis}
        expectedOutcome={expectedOutcome}
        setExpectedOutcome={setExpectedOutcome}
        buildComplexity={buildComplexity}
        setBuildComplexity={setBuildComplexity}
        timeToBuild={timeToBuild}
        setTimeToBuild={setTimeToBuild}
        status={solutionStatus}
        setStatus={setSolutionStatus}
      />

      {/* NEW: Problem Details Dialog */}
      {selectedProblemForDetails && (
        <ProblemDetailsDialog
          open={showProblemDetails}
          onOpenChange={setShowProblemDetails}
          problem={selectedProblemForDetails}
          getStatusColor={getStatusColor}
        />
      )}

      {/* NEW: Failure Details Dialog */}
      {selectedFailureForDetails && (
        <FailureDetailsDialog
          open={showFailureDetails}
          onOpenChange={setShowFailureDetails}
          failure={selectedFailureForDetails}
        />
      )}

      {/* NEW: Learning Details Dialog */}
      {selectedLearningForDetails && (
        <LearningDetailsDialog
          open={showLearningDetails}
          onOpenChange={setShowLearningDetails}
          learning={selectedLearningForDetails}
        />
      )}

      {/* NEW: Pivot Details Dialog */}
      {selectedPivotForDetails && (
        <PivotDetailsDialog
          open={showPivotDetails}
          onOpenChange={setShowPivotDetails}
          pivot={selectedPivotForDetails}
        />
      )}

      {/* NEW: Solution Details Dialog */}
      {selectedSolutionForDetails && (
        <SolutionDetailsDialog
          open={showSolutionDetails}
          onOpenChange={setShowSolutionDetails}
          solution={selectedSolutionForDetails}
          problemTitle={allProblems?.find((p: any) => p._id === selectedSolutionForDetails.problemId)?.problemTitle}
        />
      )}
    </div>
  );
}