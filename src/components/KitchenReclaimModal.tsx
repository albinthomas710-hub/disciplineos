import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { Clock, Utensils, Brain, BookOpen, Dumbbell, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";

interface KitchenReclaimModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function KitchenReclaimModal({ open, onOpenChange }: KitchenReclaimModalProps) {
  const [phase, setPhase] = useState<"setup" | "waiting" | "pre-meal" | "post-meal">("setup");
  const [duration, setDuration] = useState(15);
  const [activityType, setActivityType] = useState<"micro-task" | "learning" | "movement" | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [preHunger, setPreHunger] = useState(5);
  const [postFullness, setPostFullness] = useState(5);
  const [overate, setOverate] = useState(false);
  const [notes, setNotes] = useState("");
  const [breathCount, setBreathCount] = useState(0);

  const startWaitingSession = useMutation((api as any).kitchenReclaim.startWaitingSession);
  const completeWaitingSession = useMutation((api as any).kitchenReclaim.completeWaitingSession);
  const logMindfulMeal = useMutation((api as any).kitchenReclaim.logMindfulMeal);

  useEffect(() => {
    if (phase === "waiting" && timeRemaining > 0) {
      const timer = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setPhase("pre-meal");
            toast.success("Food is ready! Time for mindful eating 🍽️");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [phase, timeRemaining]);

  const handleStartWaiting = async () => {
    if (!activityType) {
      toast.error("Please choose an activity");
      return;
    }

    try {
      await startWaitingSession({
        duration,
        activityType,
      });
      setTimeRemaining(duration * 60);
      setPhase("waiting");
      toast.success(`${duration}-minute timer started! 🎯`);
    } catch (error) {
      toast.error("Failed to start session");
    }
  };

  const handleFoodReady = () => {
    setPhase("pre-meal");
    setBreathCount(0);
  };

  const handleBreathingComplete = () => {
    if (breathCount < 3) {
      setBreathCount(breathCount + 1);
      toast.info(`Breath ${breathCount + 1}/3 complete`);
    } else {
      setPhase("post-meal");
      toast.success("Enjoy your meal mindfully! 🙏");
    }
  };

  const handleSubmitReflection = async () => {
    try {
      await logMindfulMeal({
        preHunger,
        postFullness,
        overate,
        notes: notes.trim() || undefined,
      });
      toast.success("Mindful meal logged! 🌟");
      handleReset();
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to log meal");
    }
  };

  const handleReset = () => {
    setPhase("setup");
    setDuration(15);
    setActivityType(null);
    setTimeRemaining(0);
    setPreHunger(5);
    setPostFullness(5);
    setOverate(false);
    setNotes("");
    setBreathCount(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      if (!open) handleReset();
      onOpenChange(open);
    }}>
      <DialogContent className="max-w-2xl">
        {phase === "setup" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl">
                <Utensils className="h-6 w-6 text-orange-600" />
                Kitchen Micro-Reclaim
              </DialogTitle>
              <DialogDescription>
                Turn waiting time into productive moments
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div>
                <Label className="text-base font-semibold mb-3 block">
                  How long until food is ready?
                </Label>
                <div className="flex gap-2">
                  {[5, 15, 30].map((min) => (
                    <Button
                      key={min}
                      variant={duration === min ? "default" : "outline"}
                      onClick={() => setDuration(min)}
                      className="cursor-pointer flex-1"
                    >
                      {min} min
                    </Button>
                  ))}
                </div>
              </div>

              <div>
                <Label className="text-base font-semibold mb-3 block">
                  Choose your waiting activity:
                </Label>
                <div className="space-y-3">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      activityType === "micro-task"
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                    onClick={() => setActivityType("micro-task")}
                  >
                    <div className="flex items-center gap-3">
                      <Brain className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">📋 Micro-Task Sprint</p>
                        <p className="text-sm text-muted-foreground">
                          Quick wins: emails, organize, review notes
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      activityType === "learning"
                        ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                    onClick={() => setActivityType("learning")}
                  >
                    <div className="flex items-center gap-3">
                      <BookOpen className="h-5 w-5 text-purple-600" />
                      <div>
                        <p className="font-semibold">📚 Learning Snack</p>
                        <p className="text-sm text-muted-foreground">
                          Read article, watch video, practice skill
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      activityType === "movement"
                        ? "border-green-500 bg-green-50 dark:bg-green-950"
                        : "border-gray-200 dark:border-gray-800"
                    }`}
                    onClick={() => setActivityType("movement")}
                  >
                    <div className="flex items-center gap-3">
                      <Dumbbell className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-semibold">🏃 Movement Break</p>
                        <p className="text-sm text-muted-foreground">
                          Stretch, quick workout, walking
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>

              <Button
                onClick={handleStartWaiting}
                disabled={!activityType}
                className="w-full cursor-pointer"
                size="lg"
              >
                Start Kitchen Timer
              </Button>
            </div>
          </>
        )}

        {phase === "waiting" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Clock className="h-6 w-6 text-orange-600" />
                Food Ready In...
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-8">
              <div className="text-center">
                <div className="text-6xl font-bold text-orange-600 mb-4">
                  {formatTime(timeRemaining)}
                </div>
                <p className="text-lg text-muted-foreground">
                  {activityType === "micro-task" && "Complete your micro-tasks"}
                  {activityType === "learning" && "Enjoy your learning snack"}
                  {activityType === "movement" && "Get moving!"}
                </p>
              </div>

              <div className="p-4 bg-orange-50 dark:bg-orange-950 rounded-lg border border-orange-200 dark:border-orange-800">
                <p className="text-sm font-medium text-center">
                  💡 Use this time wisely. Every minute counts!
                </p>
              </div>

              <Button
                onClick={handleFoodReady}
                variant="outline"
                className="w-full cursor-pointer"
              >
                Food Ready Early? Skip to Mindful Eating
              </Button>
            </div>
          </>
        )}

        {phase === "pre-meal" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Utensils className="h-6 w-6 text-green-600" />
                Pre-Meal Pause
              </DialogTitle>
              <DialogDescription>
                Take 3 deep breaths before eating
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-6">
              <div className="text-center space-y-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="text-6xl"
                >
                  🫁
                </motion.div>
                <p className="text-lg font-semibold">
                  Breath {breathCount}/3
                </p>
                <p className="text-muted-foreground">
                  Inhale for 4 counts, hold for 4, exhale for 6
                </p>
              </div>

              <div className="space-y-3">
                <Label>Rate your hunger (1-10):</Label>
                <Slider
                  value={[preHunger]}
                  onValueChange={(val) => setPreHunger(val[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="cursor-pointer"
                />
                <p className="text-center text-2xl font-bold">{preHunger}/10</p>
              </div>

              <Button
                onClick={handleBreathingComplete}
                className="w-full cursor-pointer"
                size="lg"
              >
                {breathCount < 3 ? "Complete Breath" : "Start Eating Mindfully"}
              </Button>
            </div>
          </>
        )}

        {phase === "post-meal" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-6 w-6 text-green-600" />
                Post-Meal Reflection
              </DialogTitle>
              <DialogDescription>
                How was your meal?
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div>
                <Label>Fullness level (1-10):</Label>
                <Slider
                  value={[postFullness]}
                  onValueChange={(val) => setPostFullness(val[0])}
                  min={1}
                  max={10}
                  step={1}
                  className="cursor-pointer mt-2"
                />
                <p className="text-center text-2xl font-bold mt-2">{postFullness}/10</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="overate"
                  checked={overate}
                  onChange={(e) => setOverate(e.target.checked)}
                  className="cursor-pointer"
                />
                <Label htmlFor="overate" className="cursor-pointer">
                  I overate this meal
                </Label>
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional):</Label>
                <Textarea
                  id="notes"
                  placeholder="How did you feel? Any insights?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="mt-2"
                />
              </div>

              <Button
                onClick={handleSubmitReflection}
                className="w-full cursor-pointer"
                size="lg"
              >
                Complete Mindful Meal
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
