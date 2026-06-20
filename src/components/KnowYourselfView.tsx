import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PersonalityTraitsGrid from "./knowyourself/PersonalityTraitsGrid";
import StrengthsWeaknessesCards from "./knowyourself/StrengthsWeaknessesCards";
import TimeDistributionCard from "./knowyourself/TimeDistributionCard";
import JournalSection from "./knowyourself/JournalSection";
import SelfDiscoveryHeader from "./knowyourself/SelfDiscoveryHeader";
import PatternInsightsCard from "./knowyourself/PatternInsightsCard";
import YearlyVerseBanner from "./YearlyVerseBanner";

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
  const [activeTab, setActiveTab] = useState("journal");

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
      <YearlyVerseBanner />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Know Yourself</h2>
          <p className="text-lg text-muted-foreground">Discover your patterns, strengths, and growth areas</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("journal")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "journal"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Journal
          </button>
          <button
            onClick={() => setActiveTab("insights")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "insights"
                ? "bg-primary text-primary-foreground"
                : "bg-muted hover:bg-muted/80 text-muted-foreground"
            }`}
          >
            Insights
          </button>
        </div>
      </div>

      {/* Header - Dark Psychology: Status & Achievement */}
      <SelfDiscoveryHeader 
        score={score} 
        isAnalyzing={isAnalyzing} 
        onAnalyze={handleAnalyze} 
      />

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

      {/* Self-Reflection Journal */}
      <JournalSection />

      {/* Pattern Insights - Dark Psychology: FOMO & Exclusivity */}
      <PatternInsightsCard insights={insights} />
    </div>
  );
}