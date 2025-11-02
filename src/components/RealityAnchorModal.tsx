import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Brain, Zap, Timer, Wind, Quote, CheckCircle2, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface RealityAnchorModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RealityAnchorModal({ open, onOpenChange }: RealityAnchorModalProps) {
  const [mode, setMode] = useState<"choice" | "capture" | "grounding" | "redirect" | "journey">("choice");
  const [vision, setVision] = useState("");
  const [why, setWhy] = useState("");
  const [action, setAction] = useState("");
  const [countdown, setCountdown] = useState(60);
  const [currentPlan, setCurrentPlan] = useState<any>(null);
  
  const captureVision = useMutation(api.realityAnchor.captureVision);
  const recordAnchorEvent = useMutation(api.realityAnchor.recordAnchorEvent);
  const completeMicroPlanStep = useMutation(api.realityAnchor.completeMicroPlanStep);
  
  const actionQuote = useQuery(api.realityAnchor.getActionQuote);
  const stats = useQuery(api.realityAnchor.getStats);
  const wisdomJourney = useQuery(api.realityAnchor.getWisdomJourney);

  const handleCaptureVision = () => {
    setMode("capture");
    setCountdown(60);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmitVision = async () => {
    if (!vision.trim() || !why.trim() || !action.trim()) {
      toast.error("Please answer all 3 questions");
      return;
    }

    try {
      // Add a type guard so we only pass an id if present
      const triggerId =
        actionQuote && typeof actionQuote === "object" && "_id" in actionQuote
          ? (actionQuote as any)._id
          : undefined;

      const result = await captureVision({
        vision: vision.trim(),
        why: why.trim(),
        tinyAction: action.trim(),
        triggerQuoteId: triggerId, // was: actionQuote?._id
      });

      setCurrentPlan(result.microPlan);

      toast.success("Vision captured! 🎯 Micro-plan created", {
        description: "Your fantasy is now fuel for action",
      });

      // Show the generated plan with quotes
      toast.info("3-Step Micro-Plan Created", {
        description: "Each step has a wisdom quote to guide you",
        duration: 5000,
      });

      // Reset and close
      setVision("");
      setWhy("");
      setAction("");
      setMode("choice");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to capture vision");
    }
  };

  const handleGroundingExercise = async () => {
    setMode("grounding");
    await recordAnchorEvent({ eventType: "grounding" });
    
    toast.success("Grounding Exercise Started", {
      description: "3 minutes of breathing + movement",
    });

    setTimeout(() => {
      onOpenChange(false);
    }, 3000);
  };

  const handleRedirectToMicroTask = async () => {
    setMode("redirect");
    await recordAnchorEvent({ eventType: "redirect" });
    
    toast.success("15-Minute Deep Work Block Started! 🚀", {
      description: "Focus on one tiny action right now",
    });

    onOpenChange(false);
  };

  const handleViewWisdomJourney = () => {
    setMode("journey");
  };

  const handleClose = () => {
    if (mode === "capture" && (vision || why || action)) {
      const shouldClose = confirm("You'll lose your captured vision. Are you sure?");
      if (!shouldClose) return;
    }
    
    setMode("choice");
    setVision("");
    setWhy("");
    setAction("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        {mode === "choice" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Zap className="h-6 w-6 text-yellow-600" />
                Quote-Powered Reality Anchor
              </DialogTitle>
              <DialogDescription className="text-base">
                Transform fantasies into action with wisdom from legends
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {/* Action Quote Display */}
              {actionQuote && (
                <motion.div
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 rounded-lg border-2 border-yellow-200 dark:border-yellow-800"
                >
                  <div className="flex gap-3">
                    <Quote className="h-6 w-6 text-yellow-600 shrink-0 mt-1" />
                    <div>
                      <p className="italic text-lg mb-2">"{actionQuote.text}"</p>
                      <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100">
                        — {actionQuote.author}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}

              <p className="text-center text-muted-foreground italic">
                "If this thought is worth your time, make it actionable in 60 seconds."
              </p>

              {/* Card A: Capture the Vision */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="p-4 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg bg-yellow-50 dark:bg-yellow-950 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleCaptureVision}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-yellow-600 p-2 rounded-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Capture the Vision (60 seconds)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      AI asks 3 rapid questions + assigns wisdom quotes to each step
                    </p>
                    <Button className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer">
                      Start Capture
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Card B: Grounding Exercise */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-4 border-2 border-blue-200 dark:border-blue-800 rounded-lg bg-blue-50 dark:bg-blue-950 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleGroundingExercise}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-blue-600 p-2 rounded-lg">
                    <Wind className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Grounding Exercise (3 minutes)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Breathing + 1-min physical movement to reset your mind
                    </p>
                    <Button variant="outline" className="cursor-pointer">
                      Start Grounding
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Card C: Redirect to Micro-Task */}
              <motion.div
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="p-4 border-2 border-green-200 dark:border-green-800 rounded-lg bg-green-50 dark:bg-green-950 hover:shadow-lg transition-shadow cursor-pointer"
                onClick={handleRedirectToMicroTask}
              >
                <div className="flex items-start gap-3">
                  <div className="bg-green-600 p-2 rounded-lg">
                    <Timer className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">Redirect to Micro-Task (15 min)</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Auto-assign a 15-minute deep work push and start timer immediately
                    </p>
                    <Button className="bg-green-600 hover:bg-green-700 cursor-pointer">
                      Start Deep Work
                    </Button>
                  </div>
                </div>
              </motion.div>

              {/* Card D: View Wisdom Journey */}
              {wisdomJourney && wisdomJourney.length > 0 && (
                <motion.div
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="p-4 border-2 border-purple-200 dark:border-purple-800 rounded-lg bg-purple-50 dark:bg-purple-950 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={handleViewWisdomJourney}
                >
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-600 p-2 rounded-lg">
                      <Sparkles className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">Wisdom Journey Timeline</h3>
                      <p className="text-sm text-muted-foreground mb-3">
                        See how quotes led to real results ({wisdomJourney.length} completed)
                      </p>
                      <Button variant="outline" className="cursor-pointer">
                        View Journey
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </>
        )}

        {mode === "capture" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-6 w-6 text-yellow-600" />
                  Capture Your Vision
                </span>
                <span className="text-2xl font-bold text-yellow-600">
                  {countdown}s
                </span>
              </DialogTitle>
              <DialogDescription>
                Answer these 3 rapid questions to convert fantasy into action
              </DialogDescription>
            </DialogHeader>

            {actionQuote && (
              <Card className="bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-950 dark:to-orange-950 border-yellow-200 dark:border-yellow-800">
                <CardContent className="p-4">
                  <div className="flex gap-2 items-start">
                    <Quote className="h-5 w-5 text-yellow-600 shrink-0 mt-1" />
                    <div>
                      <p className="italic text-sm mb-1">"{actionQuote.text}"</p>
                      <p className="text-xs font-semibold">— {actionQuote.author}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="space-y-4">
              <div>
                <Label htmlFor="vision" className="text-base font-semibold">
                  1. What is the vision?
                </Label>
                <Textarea
                  id="vision"
                  placeholder="Describe the fantasy/daydream you just had..."
                  value={vision}
                  onChange={(e) => setVision(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="why" className="text-base font-semibold">
                  2. Why does it matter?
                </Label>
                <Textarea
                  id="why"
                  placeholder="What makes this vision important to you?"
                  value={why}
                  onChange={(e) => setWhy(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="action" className="text-base font-semibold">
                  3. What's one tiny action you can take NOW?
                </Label>
                <Textarea
                  id="action"
                  placeholder="A 5-15 minute action you can do right now..."
                  value={action}
                  onChange={(e) => setAction(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmitVision}
                  disabled={countdown === 0}
                  className="flex-1 bg-yellow-600 hover:bg-yellow-700 cursor-pointer"
                >
                  Convert to Micro-Plan
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="cursor-pointer"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </>
        )}

        {mode === "grounding" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Wind className="h-6 w-6 text-blue-600" />
                Grounding Exercise
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-6">
              <div className="text-center space-y-4">
                <p className="text-lg font-semibold">3-Minute Reset Protocol</p>
                
                <div className="space-y-3 text-left">
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="font-medium">Step 1: Deep Breathing (2 minutes)</p>
                    <p className="text-sm text-muted-foreground">
                      Inhale for 4 counts, hold for 4, exhale for 6. Repeat.
                    </p>
                  </div>
                  
                  <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                    <p className="font-medium">Step 2: Physical Movement (1 minute)</p>
                    <p className="text-sm text-muted-foreground">
                      Stand up, stretch, or do 10 jumping jacks to reset your body.
                    </p>
                  </div>
                </div>

                <Button onClick={handleClose} className="cursor-pointer">
                  Got It — Starting Now
                </Button>
              </div>
            </div>
          </>
        )}

        {mode === "journey" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Sparkles className="h-6 w-6 text-purple-600" />
                Wisdom Journey Timeline
              </DialogTitle>
              <DialogDescription>
                See how quotes led to real results in your life
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {wisdomJourney && wisdomJourney.length > 0 ? (
                wisdomJourney.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="border-2 border-purple-200 dark:border-purple-800">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3 mb-3">
                          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-1" />
                          <div className="flex-1">
                            <p className="font-semibold text-lg mb-1">{entry.vision}</p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(entry.timestamp).toLocaleDateString()} • {entry.stepsCompleted} steps completed
                            </p>
                          </div>
                        </div>

                        {entry.quote && (
                          <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg border border-purple-200 dark:border-purple-800 mb-3">
                            <div className="flex gap-2">
                              <Quote className="h-4 w-4 text-purple-600 shrink-0 mt-1" />
                              <div>
                                <p className="italic text-sm mb-1">"{entry.quote.text}"</p>
                                <p className="text-xs font-semibold">— {entry.quote.author}</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {entry.reflection && (
                          <div className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                            <p className="text-sm font-medium mb-1">Your Reflection:</p>
                            <p className="text-sm text-muted-foreground">{entry.reflection}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No wisdom journey entries yet. Complete your first vision to start!</p>
                </div>
              )}

              <Button onClick={() => setMode("choice")} variant="outline" className="w-full cursor-pointer">
                Back to Options
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}