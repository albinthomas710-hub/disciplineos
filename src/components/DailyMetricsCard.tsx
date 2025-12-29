import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Save, Target, Zap, Award, Clock, Calculator, Brain, Hammer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface DailyMetricsCardProps {
  dateStr: string;
  initialMetrics?: {
    focusScore?: number;
    outputLog?: string;
    dailyRating?: number;
    outputScore?: number;
    workType?: string;
    targetHours?: number;
  } | null;
  hoursInvested: number;
}

export default function DailyMetricsCard({ dateStr, initialMetrics, hoursInvested }: DailyMetricsCardProps) {
  const updateMetrics = useMutation(api.history.updateDailyMetrics);
  
  // State
  const [focusScore, setFocusScore] = useState(5);
  const [outputLog, setOutputLog] = useState("");
  const [dailyRating, setDailyRating] = useState(50);
  const [outputScore, setOutputScore] = useState(50);
  const [workType, setWorkType] = useState<"execution" | "thinking">("execution");
  const [targetHours, setTargetHours] = useState(6);
  const [isDirty, setIsDirty] = useState(false);
  const [showCalculator, setShowCalculator] = useState(true);

  // Load initial data
  useEffect(() => {
    if (isDirty) return;
    if (initialMetrics) {
      setFocusScore(initialMetrics.focusScore || 5);
      setOutputLog(initialMetrics.outputLog || "");
      setDailyRating(initialMetrics.dailyRating || 50);
      setOutputScore(initialMetrics.outputScore || 50);
      setWorkType((initialMetrics.workType as "execution" | "thinking") || "execution");
      setTargetHours(initialMetrics.targetHours || 6);
    } else {
      // Defaults
      setFocusScore(5);
      setOutputLog("");
      setDailyRating(50);
      setOutputScore(50);
      setWorkType("execution");
      setTargetHours(6);
    }
    setIsDirty(false);
  }, [initialMetrics, dateStr]);

  // Calculation Logic
  const calculateRating = () => {
    // 1. Hours Score (20%)
    // Cap at 100% (if you work 8 hours but target is 6, you get 100, not 133)
    const rawHoursScore = (hoursInvested / targetHours) * 100;
    const hoursScore = Math.min(100, Math.max(0, rawHoursScore));

    // 2. Focus Score (30%)
    // Convert 1-10 to 0-100
    const focusScoreCalc = focusScore * 10;

    // 3. Output Score (50%)
    // User inputs this directly (0-100) based on the scale
    const outputScoreCalc = outputScore;

    // Weighted Formula
    let calculatedRating = (0.5 * outputScoreCalc) + (0.3 * focusScoreCalc) + (0.2 * hoursScore);

    // Anti-Bullshit Safeguard: If Output Score < 40, Rating is capped at 50%
    if (outputScoreCalc < 40) {
      calculatedRating = Math.min(calculatedRating, 50);
    }

    return Math.round(calculatedRating);
  };

  // Auto-update rating when inputs change
  useEffect(() => {
    const newRating = calculateRating();
    if (newRating !== dailyRating) {
      setDailyRating(newRating);
      setIsDirty(true);
    }
  }, [focusScore, outputScore, hoursInvested, targetHours, workType]);

  const handleSave = async () => {
    // Validation for Thinking Days
    if (workType === "thinking" && outputScore > 80 && outputLog.length < 20) {
      toast.error("High score for Thinking Day requires written proof in Output Log.");
      return;
    }

    try {
      await updateMetrics({
        date: dateStr,
        focusScore,
        outputLog,
        dailyRating,
        outputScore,
        workType,
        targetHours,
      });
      toast.success("Daily verdict saved");
      setIsDirty(false);
    } catch (error) {
      toast.error("Failed to save metrics");
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 90) return "text-amber-500";
    if (rating >= 80) return "text-green-500";
    if (rating >= 60) return "text-blue-500";
    if (rating >= 40) return "text-orange-500";
    return "text-red-500";
  };

  const getRatingLabel = (rating: number) => {
    if (rating >= 90) return "Elite Day";
    if (rating >= 80) return "Efficient Day";
    if (rating >= 60) return "Solid Day";
    if (rating >= 40) return "Mediocre";
    return "Weak Day";
  };

  return (
    <Card className="border-2 border-muted/50 overflow-hidden">
      <CardHeader className="bg-muted/10 pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            Daily Verdict
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowCalculator(!showCalculator)}
              className={showCalculator ? "bg-secondary/50" : ""}
            >
              <Calculator className="h-4 w-4 mr-2" />
              Formula
            </Button>
            {isDirty && (
              <Button size="sm" onClick={handleSave} className="h-8">
                <Save className="h-4 w-4 mr-2" />
                Save Verdict
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Top Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Clock className="h-5 w-5 text-blue-500 mb-1" />
            <span className="text-2xl font-bold">{hoursInvested}h</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quantity</span>
          </div>
          
          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Zap className="h-5 w-5 text-yellow-500 mb-1" />
            <span className="text-2xl font-bold">{focusScore}/10</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Quality</span>
          </div>

          <div className="bg-secondary/20 p-3 rounded-xl border border-secondary/50 flex flex-col items-center justify-center text-center">
            <Target className="h-5 w-5 text-green-500 mb-1" />
            <span className={`text-2xl font-bold ${getRatingColor(dailyRating)}`}>{dailyRating}%</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Verdict</span>
          </div>
        </div>

        <AnimatePresence>
          {showCalculator && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-muted/30 rounded-xl p-4 border border-muted overflow-hidden"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-bold text-sm flex items-center gap-2">
                  <Calculator className="h-4 w-4 text-primary" />
                  Rating Calculator
                </h4>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="font-mono">Output(50%) + Focus(30%) + Hours(20%)</span>
                </div>
              </div>

              <div className="space-y-6">
                {/* 1. Hours Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">1. Quantity (Hours)</label>
                    <span className="text-xs font-mono">{Math.min(100, Math.round((hoursInvested / targetHours) * 100))}% Score</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 transition-all duration-500" 
                          style={{ width: `${Math.min(100, (hoursInvested / targetHours) * 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>0h</span>
                        <span>Target: {targetHours}h</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs whitespace-nowrap">Target:</span>
                      <Input 
                        type="number" 
                        value={targetHours} 
                        onChange={(e) => {
                          setTargetHours(Number(e.target.value));
                          setIsDirty(true);
                        }}
                        className="w-16 h-7 text-xs"
                        min={1}
                        max={24}
                      />
                    </div>
                  </div>
                </div>

                {/* 2. Focus Input */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">2. Quality (Focus)</label>
                    <span className="text-xs font-mono">{focusScore * 10}% Score</span>
                  </div>
                  <Slider
                    value={[focusScore]}
                    min={1}
                    max={10}
                    step={1}
                    onValueChange={(vals) => {
                      setFocusScore(vals[0]);
                      setIsDirty(true);
                    }}
                    className="py-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground uppercase font-bold">
                    <span>Distracted (1)</span>
                    <span>Deep Work (10)</span>
                  </div>
                </div>

                {/* 3. Output Input */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-medium uppercase tracking-wider text-muted-foreground">3. Results (Output)</label>
                    <span className="text-xs font-mono">{outputScore}% Score</span>
                  </div>
                  
                  <Tabs value={workType} onValueChange={(v) => {
                    setWorkType(v as "execution" | "thinking");
                    setIsDirty(true);
                  }} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 h-8 mb-2">
                      <TabsTrigger value="execution" className="text-xs">
                        <Hammer className="h-3 w-3 mr-2" />
                        Execution Day
                      </TabsTrigger>
                      <TabsTrigger value="thinking" className="text-xs">
                        <Brain className="h-3 w-3 mr-2" />
                        Thinking Day
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  <Slider
                    value={[outputScore]}
                    min={0}
                    max={100}
                    step={5}
                    onValueChange={(vals) => {
                      setOutputScore(vals[0]);
                      setIsDirty(true);
                    }}
                    className="py-2"
                  />
                  
                  <div className="bg-background/50 p-3 rounded-lg border border-border/50 text-xs space-y-1">
                    {workType === "execution" ? (
                      <>
                        <div className="flex justify-between"><span>0%</span> <span className="text-muted-foreground">No output</span></div>
                        <div className="flex justify-between"><span>50%</span> <span className="text-muted-foreground">Half of daily target</span></div>
                        <div className="flex justify-between font-medium text-green-600"><span>100%</span> <span>Hit daily target (e.g. 10 DMs)</span></div>
                      </>
                    ) : (
                      <>
                        <div className="flex justify-between"><span>0-20%</span> <span className="text-muted-foreground">Noise / Consumed content</span></div>
                        <div className="flex justify-between"><span>30-50%</span> <span className="text-muted-foreground">Clarity gained / Problems identified</span></div>
                        <div className="flex justify-between"><span>60-70%</span> <span className="text-muted-foreground">Plan defined / Priorities set</span></div>
                        <div className="flex justify-between font-medium text-green-600"><span>80-90%</span> <span>Irreversible decision / Strategy locked</span></div>
                      </>
                    )}
                  </div>
                  
                  {outputScore < 40 && (
                    <div className="text-[10px] text-red-500 font-bold flex items-center gap-1 bg-red-500/10 p-2 rounded">
                      <Target className="h-3 w-3" />
                      Output &lt; 40% caps Rating at 50%. No fake productivity.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Output Log */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Target className="h-4 w-4 text-green-500" />
            Output Log (Proof)
          </label>
          <Textarea
            placeholder={workType === "execution" 
              ? "What did you ship? (e.g. 3 videos, 5 leads, 1 offer)" 
              : "What decision did you make? What clarity did you gain? (REQUIRED for high scores)"}
            value={outputLog}
            onChange={(e) => {
              setOutputLog(e.target.value);
              setIsDirty(true);
            }}
            className={`min-h-[80px] text-sm resize-none bg-background/50 ${
              workType === "thinking" && outputScore > 80 && outputLog.length < 20 ? "border-red-500 ring-1 ring-red-500/20" : ""
            }`}
          />
          <p className="text-xs text-muted-foreground">
            {workType === "thinking" 
              ? "For thinking days, you MUST write the decision/clarity gained to claim a high score."
              : "Be honest. Output dominates everything."}
          </p>
        </div>

        {/* Final Rating Display */}
        <div className="space-y-3 pt-2 border-t">
          <div className="flex justify-between items-center">
            <label className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-primary" />
              Final Rating (Calculated)
            </label>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`${getRatingColor(dailyRating)} border-current`}>
                {getRatingLabel(dailyRating)}
              </Badge>
              <span className={`font-mono font-bold text-lg ${getRatingColor(dailyRating)}`}>
                {dailyRating}%
              </span>
            </div>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${
                dailyRating >= 90 ? "bg-amber-500" :
                dailyRating >= 80 ? "bg-green-500" :
                dailyRating >= 60 ? "bg-blue-500" :
                dailyRating >= 40 ? "bg-orange-500" : "bg-red-500"
              }`}
              style={{ width: `${dailyRating}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}