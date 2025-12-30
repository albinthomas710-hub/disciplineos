import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  Loader2,
  RefreshCw,
  Lightbulb,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PersonalityTraitsGrid from "./knowyourself/PersonalityTraitsGrid";
import StrengthsWeaknessesCards from "./knowyourself/StrengthsWeaknessesCards";
import TimeDistributionCard from "./knowyourself/TimeDistributionCard";
import JournalSection from "./knowyourself/JournalSection";

export default function KnowYourselfView() {
  const profile = useQuery((api as any).selfDiscovery.getProfile);
  const insights = useQuery((api as any).selfDiscovery.getInsights);
  
  const initializeProfile = useMutation((api as any).selfDiscovery.initializeProfile);
  const analyzePatterns = useMutation((api as any).selfDiscovery.analyzePatterns);
  const addStrength = useMutation((api as any).selfDiscovery.addStrength);
  const removeStrength = useMutation((api as any).selfDiscovery.removeStrength);
  const addWeakness = useMutation((api as any).selfDiscovery.addWeakness);
  const removeWeakness = useMutation((api as any).selfDiscovery.removeWeakness);
  const markWeaknessFixed = useMutation((api as any).selfDiscovery.markWeaknessFixed);
  const addTimeCategory = useMutation((api as any).selfDiscovery.addTimeCategory);
  const updateTimeCategory = useMutation((api as any).selfDiscovery.updateTimeCategory);
  const deleteTimeCategory = useMutation((api as any).selfDiscovery.deleteTimeCategory);

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAddStrength, setShowAddStrength] = useState(false);
  const [showAddWeakness, setShowAddWeakness] = useState(false);
  const [newStrength, setNewStrength] = useState("");
  const [newWeakness, setNewWeakness] = useState("");
  const [showAddTimeCategory, setShowAddTimeCategory] = useState(false);
  const [newTimeCategory, setNewTimeCategory] = useState("");
  const [newTimePercentage, setNewTimePercentage] = useState(0);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editPercentage, setEditPercentage] = useState(0);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    const toastId = toast.loading("Analyzing your patterns...");
    try {
      const result = await analyzePatterns();
      toast.success(`Analysis complete! Discovery Score: ${result.selfDiscoveryScore}/100`, { id: toastId });
    } catch (error) {
      toast.error("Failed to analyze patterns", { id: toastId });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAddStrength = async () => {
    if (!newStrength.trim()) {
      toast.error("Please enter a strength");
      return;
    }

    const toastId = toast.loading("Adding strength...");
    try {
      await addStrength({ strength: newStrength.trim() });
      setNewStrength("");
      setShowAddStrength(false);
      toast.success("Strength added! 💪", { id: toastId });
    } catch (error) {
      toast.error("Failed to add strength", { id: toastId });
    }
  };

  const handleRemoveStrength = async (strength: string) => {
    const toastId = toast.loading("Removing strength...");
    try {
      await removeStrength({ strength });
      toast.success("Strength removed", { id: toastId });
    } catch (error) {
      toast.error("Failed to remove strength", { id: toastId });
    }
  };

  const handleAddWeakness = async () => {
    if (!newWeakness.trim()) {
      toast.error("Please enter a growth area");
      return;
    }

    const toastId = toast.loading("Adding growth area...");
    try {
      await addWeakness({ weakness: newWeakness.trim() });
      setNewWeakness("");
      setShowAddWeakness(false);
      toast.success("Growth area added! 🎯", { id: toastId });
    } catch (error) {
      toast.error("Failed to add growth area", { id: toastId });
    }
  };

  const handleRemoveWeakness = async (weakness: string) => {
    const toastId = toast.loading("Removing growth area...");
    try {
      await removeWeakness({ weakness });
      toast.success("Growth area removed", { id: toastId });
    } catch (error) {
      toast.error("Failed to remove growth area", { id: toastId });
    }
  };

  const handleMarkFixed = async (weakness: string) => {
    const toastId = toast.loading("Marking as fixed...");
    try {
      await markWeaknessFixed({ weakness });
      toast.success("Congratulations! Growth area fixed! 🎉", { id: toastId });
    } catch (error) {
      toast.error("Failed to mark as fixed", { id: toastId });
    }
  };

  const handleAddTimeCategory = async () => {
    if (!newTimeCategory.trim() || newTimePercentage <= 0) {
      toast.error("Please enter a valid category and percentage");
      return;
    }

    const toastId = toast.loading("Adding time category...");
    try {
      await addTimeCategory({ category: newTimeCategory.trim(), percentage: newTimePercentage });
      setNewTimeCategory("");
      setNewTimePercentage(0);
      setShowAddTimeCategory(false);
      toast.success("Time category added! ⏰", { id: toastId });
    } catch (error) {
      toast.error("Failed to add category", { id: toastId });
    }
  };

  const handleUpdateTimeCategory = async (category: string, percentage: number) => {
    const toastId = toast.loading("Updating percentage...");
    try {
      await updateTimeCategory({ category, percentage });
      setEditingCategory(null);
      toast.success("Percentage updated! 📊", { id: toastId });
    } catch (error) {
      toast.error("Failed to update percentage", { id: toastId });
    }
  };

  const handleDeleteTimeCategory = async (category: string) => {
    const toastId = toast.loading("Deleting category...");
    try {
      await deleteTimeCategory({ category });
      toast.success("Category deleted", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete category", { id: toastId });
    }
  };

  // Initialize profile on first load
  useState(() => {
    if (profile === null) {
      initializeProfile();
    }
  });

  if (profile === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const traits = profile?.personalityTraits || { consistency: 0, resilience: 0, ambition: 0, discipline: 0 };
  const score = profile?.selfDiscoveryScore || 0;
  const timeDistribution = profile?.timeDistribution || {};
  const strengths = profile?.strengths || [];
  const weaknesses = profile?.weaknesses || [];

  return (
    <div className="space-y-6">
      {/* Header - Dark Psychology: Status & Achievement */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="border-2 border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 dark:from-cyan-950 dark:via-blue-950 dark:to-indigo-950 shadow-2xl relative overflow-hidden">
          {/* Animated background gradient */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10"
            animate={{
              backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "linear",
            }}
            style={{ backgroundSize: "200% 200%" }}
          />

          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-cyan-600 to-blue-600 p-3 rounded-xl shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <Brain className="h-6 w-6 text-white" />
              </motion.div>
              <div className="flex-1">
                <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-lg">
                  Know Yourself
                </h2>
                <p className="text-sm text-muted-foreground font-semibold">
                  Deep insights into your patterns, strengths, and growth
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-semibold mb-1">Self-Discovery Score</p>
                <motion.p 
                  className="text-5xl font-black bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent drop-shadow-xl"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {score}/100
                </motion.p>
                {/* Dark psychology: Social proof & urgency */}
                <p className={`text-xs font-bold mt-1 ${score < 50 ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                  {score < 30 && "⚠️ Critical: Self-awareness needed"}
                  {score >= 30 && score < 50 && "📊 Below average: Room to grow"}
                  {score >= 50 && score < 70 && "✓ Good: Keep pushing"}
                  {score >= 70 && score < 90 && "🔥 Excellent: Top 20%"}
                  {score >= 90 && "🏆 Elite: Top 5% self-awareness"}
                </p>
              </div>
              <Button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Analyze Patterns
              </Button>
            </div>
            <Progress value={score} className="h-4 shadow-inner" />
          </CardContent>
        </Card>
      </motion.div>

      {/* Personality Traits Grid */}
      <PersonalityTraitsGrid traits={traits} />

      {/* Strengths & Weaknesses */}
      <StrengthsWeaknessesCards
        strengths={strengths}
        weaknesses={weaknesses}
        showAddStrength={showAddStrength}
        showAddWeakness={showAddWeakness}
        newStrength={newStrength}
        newWeakness={newWeakness}
        setShowAddStrength={setShowAddStrength}
        setShowAddWeakness={setShowAddWeakness}
        setNewStrength={setNewStrength}
        setNewWeakness={setNewWeakness}
        onAddStrength={handleAddStrength}
        onRemoveStrength={handleRemoveStrength}
        onAddWeakness={handleAddWeakness}
        onRemoveWeakness={handleRemoveWeakness}
        onMarkFixed={handleMarkFixed}
      />

      {/* Time Distribution */}
      <TimeDistributionCard
        timeDistribution={timeDistribution}
        showAddTimeCategory={showAddTimeCategory}
        newTimeCategory={newTimeCategory}
        newTimePercentage={newTimePercentage}
        editingCategory={editingCategory}
        editPercentage={editPercentage}
        setShowAddTimeCategory={setShowAddTimeCategory}
        setNewTimeCategory={setNewTimeCategory}
        setNewTimePercentage={setNewTimePercentage}
        setEditingCategory={setEditingCategory}
        setEditPercentage={setEditPercentage}
        onAddTimeCategory={handleAddTimeCategory}
        onUpdateTimeCategory={handleUpdateTimeCategory}
        onDeleteTimeCategory={handleDeleteTimeCategory}
      />

      {/* Self-Reflection Journal - Replaced with new component */}
      <JournalSection />

      {/* Pattern Insights - Dark Psychology: FOMO & Exclusivity */}
      {insights && insights.length > 0 && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="border-2 border-yellow-300 dark:border-yellow-700 bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 dark:from-yellow-950 dark:via-amber-950 dark:to-orange-950 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-yellow-600 to-orange-600 p-2.5 rounded-xl shadow-lg">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-black bg-gradient-to-r from-yellow-700 via-amber-700 to-orange-700 dark:from-yellow-400 dark:via-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                    Pattern Insights
                  </h3>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 font-semibold">
                    🔒 Exclusive discoveries about you
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <AnimatePresence>
                  {insights.map((insight: any, i: number) => (
                    <motion.div
                      key={i}
                      initial={{ x: -20, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      exit={{ x: -20, opacity: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="p-4 border-l-4 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/50 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <h4 className="font-bold text-sm mb-1">{insight.title}</h4>
                      <p className="text-sm text-muted-foreground">{insight.description}</p>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}