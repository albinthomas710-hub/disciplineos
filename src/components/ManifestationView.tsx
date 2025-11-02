import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery, useAction } from "convex/react";
import { motion } from "framer-motion";
import { 
  Sparkles, 
  Plus, 
  Loader2, 
  Target,
  Brain,
  Zap,
  CheckCircle2,
  Star,
  Search,
  Eye,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import ManifestationStats from "./manifestation/ManifestationStats";
import ManifestationCard from "./manifestation/ManifestationCard";
import CelebrationModal from "./manifestation/CelebrationModal";
import { DailyActionTracker } from "./manifestation/DailyActionTracker";
import { EvidenceCollector } from "./manifestation/EvidenceCollector";
import { VisualizationLogger } from "./manifestation/VisualizationLogger";
import { ObstacleTracker } from "./manifestation/ObstacleTracker";
import { BeliefAudit } from "./manifestation/BeliefAudit";
import { ProgressAnalytics } from "./manifestation/ProgressAnalytics";
import { ManifestationForm } from "./manifestation/ManifestationForm";
import { ManifestationDashboard } from "./manifestation/ManifestationDashboard";
import { RealityCheckModal } from "./manifestation/RealityCheckModal";

export default function ManifestationView() {
  const manifestations = useQuery(api.manifestations.getUserManifestations);
  
  const createManifestation = useMutation(api.manifestations.createManifestation);
  const updateManifestation = useMutation(api.manifestations.updateManifestation);
  const deleteManifestation = useMutation(api.manifestations.deleteManifestation);
  const toggleFavorite = useMutation(api.manifestations.toggleFavorite);
  const toggleAchieved = useMutation(api.manifestations.toggleAchieved);
  const calculateEnergyScore = useMutation(api.manifestations.calculateEnergyScore);
  const logVisualization = useMutation(api.manifestations.logVisualization);
  const updateFoundation = useMutation(api.manifestationActions.updateFoundation);
  const logDailyActions = useMutation(api.manifestationActions.logDailyActions);
  const logEvidence = useMutation(api.manifestationActions.logEvidence);
  const logVisualizationSession = useMutation(api.manifestationActions.logVisualizationSession);
  const logObstacle = useMutation(api.manifestationActions.logObstacle);
  const addLimitingBelief = useMutation(api.manifestationActions.addLimitingBelief);
  const resolveLimitingBelief = useMutation(api.manifestationActions.resolveLimitingBelief);
  const analyzeLimitingBeliefs = useAction(api.manifestationAI.analyzeLimitingBeliefs);

  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | "vision" | "affirmations" | "habits" | "mindset">("all");
  const [showAchievedOnly, setShowAchievedOnly] = useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [celebratingItem, setCelebratingItem] = useState<any>(null);
  const [showFoundation, setShowFoundation] = useState(false);
  const [realityCheckItem, setRealityCheckItem] = useState<any>(null);
  
  const [newManifestation, setNewManifestation] = useState({
    type: "vision" as "vision" | "affirmation" | "habit" | "mindset",
    title: "",
    content: "",
    targetDate: "",
    identityStatement: "",
    painLeverage: "",
  });

  const [editData, setEditData] = useState({
    type: "vision" as "vision" | "affirmation" | "habit" | "mindset",
    title: "",
    content: "",
    targetDate: "",
    identityStatement: "",
    painLeverage: "",
  });

  const manifestationTypes = [
    { value: "vision", label: "Vision Goal", icon: Target, color: "from-purple-500 to-pink-500" },
    { value: "affirmation", label: "Affirmation", icon: Sparkles, color: "from-yellow-500 to-orange-500" },
    { value: "habit", label: "Habit Change", icon: Zap, color: "from-green-500 to-emerald-500" },
    { value: "mindset", label: "Mindset Shift", icon: Brain, color: "from-blue-500 to-cyan-500" },
  ];

  const handleCreate = async () => {
    const trimmedTitle = newManifestation.title.trim();
    const trimmedContent = newManifestation.content.trim();
    
    if (!trimmedTitle || !trimmedContent) {
      toast.error("Please fill in all fields");
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }

    const toastId = toast.loading("Creating manifestation...");
    try {
      const id = await createManifestation({
        type: newManifestation.type,
        title: trimmedTitle,
        content: trimmedContent,
        targetDate: newManifestation.targetDate || undefined,
      });
      
      // Save foundation (identity + pain leverage)
      if (newManifestation.identityStatement || newManifestation.painLeverage) {
        await updateFoundation({
          manifestationId: id,
          identityStatement: newManifestation.identityStatement || undefined,
          painLeverage: newManifestation.painLeverage || undefined,
        });
      }
      
      await calculateEnergyScore({ manifestationId: id });
      
      setNewManifestation({ type: "vision", title: "", content: "", targetDate: "", identityStatement: "", painLeverage: "" });
      setIsCreating(false);
      toast.success("Manifestation created! 🌟", { id: toastId });
    } catch (error) {
      toast.error("Failed to create manifestation", { id: toastId });
    }
  };

  const handleVisualize = async (item: any) => {
    const toastId = toast.loading("Logging visualization session...");
    try {
      const streak = await logVisualization({ manifestationId: item._id });
      toast.success(`🔥 Visualization logged! ${streak} day streak!`, { id: toastId });
    } catch (error) {
      toast.error("Failed to log visualization", { id: toastId });
    }
  };

  const handleToggleAchieved = async (item: any) => {
    try {
      await toggleAchieved({ manifestationId: item._id });
      
      if (!item.isAchieved) {
        setCelebratingItem(item);
        setTimeout(() => setCelebratingItem(null), 5000);
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  const handleEdit = (item: any) => {
    setEditingItem(item);
    setEditData({
      type: item.type,
      title: item.title,
      content: item.content,
      targetDate: item.targetDate || "",
      identityStatement: item.identityStatement || "",
      painLeverage: item.painLeverage || "",
    });
  };

  const handleSave = async () => {
    const trimmedTitle = editData.title.trim();
    const trimmedContent = editData.content.trim();
    
    if (!editingItem || !trimmedTitle || !trimmedContent) {
      toast.error("Please fill in all fields");
      return;
    }

    if (trimmedTitle.length > 200) {
      toast.error("Title must be less than 200 characters");
      return;
    }

    const toastId = toast.loading("Saving changes...");
    try {
      await updateManifestation({
        manifestationId: editingItem._id,
        title: trimmedTitle,
        content: trimmedContent,
        targetDate: editData.targetDate || undefined,
      });
      
      // Update foundation
      await updateFoundation({
        manifestationId: editingItem._id,
        identityStatement: editData.identityStatement || undefined,
        painLeverage: editData.painLeverage || undefined,
      });
      
      setEditingItem(null);
      setEditData({ type: "vision", title: "", content: "", targetDate: "", identityStatement: "", painLeverage: "" });
      toast.success("Updated! ✨", { id: toastId });
    } catch (error) {
      toast.error("Failed to update", { id: toastId });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this manifestation?")) return;
    
    const toastId = toast.loading("Deleting...");
    try {
      await deleteManifestation({ manifestationId: id as any });
      if (editingItem?._id === id) setEditingItem(null);
      toast.success("Deleted", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete", { id: toastId });
    }
  };

  // Reality Check: Show modal for manifestations with no action in 2+ days
  const checkForInactivity = () => {
    const today = new Date().toISOString().split('T')[0];
    const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const inactiveManifestations = manifestations?.filter(m => {
      if (m.isAchieved) return false;
      const lastActionDate = m.lastActionDate;
      return !lastActionDate || lastActionDate < twoDaysAgo;
    }) || [];

    if (inactiveManifestations.length > 0 && !realityCheckItem) {
      // Show reality check for the first inactive manifestation
      const item = inactiveManifestations[0];
      const daysSince = item.lastActionDate 
        ? Math.floor((Date.now() - new Date(item.lastActionDate).getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((Date.now() - item.createdAt) / (1000 * 60 * 60 * 24));
      
      if (daysSince >= 2) {
        setTimeout(() => setRealityCheckItem({ ...item, daysSinceLastAction: daysSince }), 2000);
      }
    }
  };

  // Check for inactivity on mount
  if (manifestations && manifestations.length > 0) {
    checkForInactivity();
  }

  if (!manifestations) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredManifestations = activeTab === "all"
    ? manifestations
    : manifestations.filter((m) => m.type === activeTab);

  let displayedManifestations = filteredManifestations;
  
  if (showAchievedOnly) {
    displayedManifestations = displayedManifestations.filter((m) => m.isAchieved);
  }
  
  if (showFavoritesOnly) {
    displayedManifestations = displayedManifestations.filter((m) => m.isFavorite);
  }

  const getTypeConfig = (type: string) => {
    return manifestationTypes.find((t) => t.value === type) || manifestationTypes[0];
  };

  const stats = {
    activeCount: manifestations.filter(m => !m.isAchieved).length,
    achievedCount: manifestations.filter(m => m.isAchieved).length,
    avgEnergy: Math.round(manifestations.reduce((acc, m) => acc + (m.energyScore || 0), 0) / manifestations.length) || 0,
    maxStreak: Math.max(...manifestations.map(m => m.visualizationStreak || 0), 0),
  };

  return (
    <div className="space-y-6">
      {celebratingItem && (
        <CelebrationModal item={celebratingItem} onClose={() => setCelebratingItem(null)} />
      )}

      {realityCheckItem && (
        <RealityCheckModal
          isOpen={!!realityCheckItem}
          onClose={() => setRealityCheckItem(null)}
          manifestation={realityCheckItem}
          daysSinceLastAction={realityCheckItem.daysSinceLastAction}
        />
      )}

      {/* PSYCHOLOGICAL DASHBOARD - FRONT AND CENTER */}
      {manifestations.length > 0 && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <ManifestationDashboard manifestations={manifestations} />
        </motion.div>
      )}

      {/* Header Card */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="border-2 border-purple-200 dark:border-purple-800 bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-600 to-pink-600 p-3 rounded-xl shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-yellow-600 bg-clip-text text-transparent">
                  Manifestation Board
                </h2>
                <p className="text-sm text-muted-foreground font-normal">
                  Evidence-based achievement system powered by dark psychology
                </p>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={() => setIsCreating(!isCreating)}
                className="cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 h-12 px-6 text-base font-bold shadow-xl"
              >
                <Plus className="h-5 w-5 mr-2" />
                New Manifestation
              </Button>
              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="cursor-pointer h-12 px-6"
              >
                <Star className={`h-5 w-5 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
                Favorites Only
              </Button>
              <Button
                variant={showAchievedOnly ? "default" : "outline"}
                onClick={() => setShowAchievedOnly(!showAchievedOnly)}
                className="cursor-pointer h-12 px-6"
              >
                <CheckCircle2 className={`h-5 w-5 mr-2 ${showAchievedOnly ? "fill-current" : ""}`} />
                Achieved Only
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Create Form */}
      {isCreating && (
        <ManifestationForm
          formData={newManifestation}
          onChange={setNewManifestation}
          onSubmit={handleCreate}
          onCancel={() => {
            setIsCreating(false);
            setNewManifestation({ type: "vision", title: "", content: "", targetDate: "", identityStatement: "", painLeverage: "" });
          }}
        />
      )}

      {/* Edit Form */}
      {editingItem && (
        <ManifestationForm
          formData={editData}
          onChange={setEditData}
          onSubmit={handleSave}
          onCancel={() => {
            setEditingItem(null);
            setEditData({ type: "vision", title: "", content: "", targetDate: "", identityStatement: "", painLeverage: "" });
          }}
          isEditing
        />
      )}

      {/* Main Tabs - Manifestations + Advanced Features */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="grid w-full grid-cols-10 gap-1">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="vision">
            <Target className="h-4 w-4 mr-1" />
            Vision
          </TabsTrigger>
          <TabsTrigger value="affirmations">
            <Sparkles className="h-4 w-4 mr-1" />
            Affirmations
          </TabsTrigger>
          <TabsTrigger value="habits">
            <Zap className="h-4 w-4 mr-1" />
            Habits
          </TabsTrigger>
          <TabsTrigger value="mindset">
            <Brain className="h-4 w-4 mr-1" />
            Mindset
          </TabsTrigger>
          <TabsTrigger value="actions">
            <CheckCircle2 className="h-4 w-4 mr-1" />
            Actions
          </TabsTrigger>
          <TabsTrigger value="evidence">
            <Search className="h-4 w-4 mr-1" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="visualize">
            <Eye className="h-4 w-4 mr-1" />
            Visualize
          </TabsTrigger>
          <TabsTrigger value="obstacles">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Obstacles
          </TabsTrigger>
          <TabsTrigger value="beliefs">
            <Brain className="h-4 w-4 mr-1" />
            Beliefs
          </TabsTrigger>
        </TabsList>

        {/* Manifestation Lists */}
        {["all", "vision", "affirmations", "habits", "mindset"].includes(activeTab) && (
          <TabsContent value={activeTab} className="space-y-4 mt-6">
            <div className="grid gap-4">
              {displayedManifestations.map((item, index) => (
                <ManifestationCard
                  key={item._id}
                  item={item}
                  index={index}
                  typeConfig={getTypeConfig(item.type)}
                  onEdit={handleEdit}
                  onVisualize={handleVisualize}
                  onToggleAchieved={handleToggleAchieved}
                  onToggleFavorite={(id) => toggleFavorite({ manifestationId: id as any })}
                  onDelete={handleDelete}
                />
              ))}

              {displayedManifestations.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Sparkles className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>
                    {showFavoritesOnly && showAchievedOnly
                      ? "No favorite achieved manifestations yet!"
                      : showFavoritesOnly
                      ? "No favorite manifestations yet. Star some to see them here!"
                      : showAchievedOnly
                      ? "No achieved manifestations yet. Keep working towards your goals!"
                      : "No manifestations yet. Start manifesting your dreams into reality!"}
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
        )}

        {/* Daily Actions Tab */}
        <TabsContent value="actions" className="space-y-4 mt-6">
          {manifestations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Create a manifestation first to track daily actions!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-2 border-green-200 dark:border-green-800">
                <CardHeader>
                  <CardTitle className="text-lg">Select Manifestation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {manifestations.map((item) => (
                      <Button
                        key={item._id}
                        variant="outline"
                        className="cursor-pointer justify-start h-auto py-3"
                        onClick={() => {
                          const element = document.getElementById(`actions-${item._id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Target className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {manifestations.map((item) => (
                <Card key={item._id} id={`actions-${item._id}`} className="border-2 border-green-200 dark:border-green-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DailyActionTracker
                      manifestation={item}
                      onLogActions={async (actions) => {
                        const toastId = toast.loading("Logging actions...");
                        try {
                          const streak = await logDailyActions({
                            manifestationId: item._id,
                            actions,
                          });
                          toast.success(`🔥 Actions logged! ${streak} day streak!`, { id: toastId });
                        } catch (error) {
                          toast.error("Failed to log actions", { id: toastId });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Evidence Tab */}
        <TabsContent value="evidence" className="space-y-4 mt-6">
          {manifestations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Create a manifestation first to collect evidence!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-2 border-blue-200 dark:border-blue-800">
                <CardHeader>
                  <CardTitle className="text-lg">Select Manifestation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {manifestations.map((item) => (
                      <Button
                        key={item._id}
                        variant="outline"
                        className="cursor-pointer justify-start h-auto py-3"
                        onClick={() => {
                          const element = document.getElementById(`evidence-${item._id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Target className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {manifestations.map((item) => (
                <Card key={item._id} id={`evidence-${item._id}`} className="border-2 border-blue-200 dark:border-blue-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <EvidenceCollector
                      manifestation={item}
                      onLogEvidence={async (evidence) => {
                        const toastId = toast.loading("Logging evidence...");
                        try {
                          await logEvidence({
                            manifestationId: item._id,
                            evidence,
                          });
                          toast.success("Evidence logged! 📊", { id: toastId });
                        } catch (error) {
                          toast.error("Failed to log evidence", { id: toastId });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Visualization Tab */}
        <TabsContent value="visualize" className="space-y-4 mt-6">
          {manifestations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Eye className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Create a manifestation first to log visualization sessions!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg">Select Manifestation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {manifestations.map((item) => (
                      <Button
                        key={item._id}
                        variant="outline"
                        className="cursor-pointer justify-start h-auto py-3"
                        onClick={() => {
                          const element = document.getElementById(`visualize-${item._id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Target className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {manifestations.map((item) => (
                <Card key={item._id} id={`visualize-${item._id}`} className="border-2 border-purple-200 dark:border-purple-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <VisualizationLogger
                      onLog={async (data) => {
                        const toastId = toast.loading("Logging visualization...");
                        try {
                          const streak = await logVisualizationSession({
                            manifestationId: item._id,
                            ...data,
                          });
                          toast.success(`🔥 Visualization logged! ${streak} day streak!`, { id: toastId });
                        } catch (error) {
                          toast.error("Failed to log visualization", { id: toastId });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Obstacles Tab */}
        <TabsContent value="obstacles" className="space-y-4 mt-6">
          {manifestations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Create a manifestation first to track obstacles!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-2 border-orange-200 dark:border-orange-800">
                <CardHeader>
                  <CardTitle className="text-lg">Select Manifestation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {manifestations.map((item) => (
                      <Button
                        key={item._id}
                        variant="outline"
                        className="cursor-pointer justify-start h-auto py-3"
                        onClick={() => {
                          const element = document.getElementById(`obstacles-${item._id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Target className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {manifestations.map((item) => (
                <Card key={item._id} id={`obstacles-${item._id}`} className="border-2 border-orange-200 dark:border-orange-800">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      {item.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ObstacleTracker
                      manifestation={item}
                      onLogObstacle={async (data) => {
                        const toastId = toast.loading("Logging obstacle...");
                        try {
                          await logObstacle({
                            manifestationId: item._id,
                            ...data,
                          });
                          toast.success("Obstacle logged! 💪", { id: toastId });
                        } catch (error) {
                          toast.error("Failed to log obstacle", { id: toastId });
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Beliefs Tab */}
        <TabsContent value="beliefs" className="space-y-4 mt-6">
          {manifestations.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Create a manifestation first to audit beliefs!</p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                  <CardTitle className="text-lg">Select Manifestation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-2">
                    {manifestations.map((item) => (
                      <Button
                        key={item._id}
                        variant="outline"
                        className="cursor-pointer justify-start h-auto py-3"
                        onClick={() => {
                          const element = document.getElementById(`beliefs-${item._id}`);
                          element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }}
                      >
                        <Target className="h-4 w-4 mr-2 shrink-0" />
                        <span className="text-left">{item.title}</span>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {manifestations.map((item) => (
                <div key={item._id} id={`beliefs-${item._id}`} className="space-y-4">
                  <Card className="border-2 border-purple-200 dark:border-purple-800">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        {item.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <BeliefAudit
                        manifestation={item}
                        onAddBelief={async (belief) => {
                          const toastId = toast.loading("Adding belief...");
                          try {
                            await addLimitingBelief({
                              manifestationId: item._id,
                              belief,
                            });
                            toast.success("Belief added", { id: toastId });
                          } catch (error) {
                            toast.error("Failed to add belief", { id: toastId });
                          }
                        }}
                        onResolveBelief={async (index, reframe) => {
                          const toastId = toast.loading("Resolving belief...");
                          try {
                            await resolveLimitingBelief({
                              manifestationId: item._id,
                              beliefIndex: index,
                              reframe,
                            });
                            toast.success("Belief resolved! ✅", { id: toastId });
                          } catch (error) {
                            toast.error("Failed to resolve belief", { id: toastId });
                          }
                        }}
                        onGenerateReframes={async () => {
                          const toastId = toast.loading("AI analyzing beliefs...");
                          try {
                            await analyzeLimitingBeliefs({
                              manifestationId: item._id,
                              content: item.content,
                            });
                            toast.success("AI reframes generated! 🧠", { id: toastId });
                          } catch (error) {
                            toast.error("Failed to generate reframes", { id: toastId });
                          }
                        }}
                      />
                      <ProgressAnalytics manifestation={item} />
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}