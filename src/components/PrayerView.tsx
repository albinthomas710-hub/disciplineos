import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Loader2, Plus, BookOpen, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { FavoriteFilterButton } from "@/components/shared/FavoriteFilterButton";
import { EmptyStateCard } from "@/components/shared/EmptyStateCard";
import { PrayerForm } from "@/components/prayer/PrayerForm";
import { PrayerCard } from "@/components/prayer/PrayerCard";
import { ScriptureForm } from "@/components/prayer/ScriptureForm";
import { ScriptureCard } from "@/components/prayer/ScriptureCard";
import { HolyVideoForm } from "@/components/prayer/HolyVideoForm";
import { HolyVideoCard } from "@/components/prayer/HolyVideoCard";

export default function PrayerView() {
  const prayers = useQuery((api as any).prayers.getAll);
  const scriptures = useQuery((api as any).scriptures.getAll);
  const holyVideos = useQuery((api as any).holyVideos.getAll);
  const favoriteVideos = useQuery((api as any).holyVideos.getFavorites);
  
  const createPrayer = useMutation((api as any).prayers.create);
  const markAnswered = useMutation((api as any).prayers.markAnswered);
  const togglePrayerFavorite = useMutation((api as any).prayers.toggleFavorite);
  const removePrayer = useMutation((api as any).prayers.remove);
  
  const createScripture = useMutation((api as any).scriptures.create);
  const toggleScriptureFavorite = useMutation((api as any).scriptures.toggleFavorite);
  const removeScripture = useMutation((api as any).scriptures.remove);

  const createVideo = useMutation((api as any).holyVideos.create);
  const toggleVideoFavorite = useMutation((api as any).holyVideos.toggleFavorite);
  const removeVideo = useMutation((api as any).holyVideos.remove);

  const [activeTab, setActiveTab] = useState<"prayers" | "scriptures" | "videos">("prayers");
  const [showNewPrayer, setShowNewPrayer] = useState(false);
  const [showNewScripture, setShowNewScripture] = useState(false);
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [showFavoriteVideosOnly, setShowFavoriteVideosOnly] = useState(false);
  const [showFavoritePrayersOnly, setShowFavoritePrayersOnly] = useState(false);
  const [showFavoriteScripturesOnly, setShowFavoriteScripturesOnly] = useState(false);

  // Prayer form state
  const [prayerTitle, setPrayerTitle] = useState("");
  const [prayerContent, setPrayerContent] = useState("");
  const [prayerCategory, setPrayerCategory] = useState<"gratitude" | "guidance" | "intercession" | "confession" | "praise" | "petition">("gratitude");

  // Scripture form state
  const [scriptureRef, setScriptureRef] = useState("");
  const [scriptureText, setScriptureText] = useState("");
  const [scriptureTranslation, setScriptureTranslation] = useState("");
  const [scriptureCategory, setScriptureCategory] = useState("");
  const [scriptureNotes, setScriptureNotes] = useState("");

  // Video form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [videoSpeaker, setVideoSpeaker] = useState("");
  const [videoNotes, setVideoNotes] = useState("");

  const categories = [
    { value: "gratitude", label: "Gratitude", color: "from-green-500 to-emerald-500" },
    { value: "guidance", label: "Guidance", color: "from-blue-500 to-cyan-500" },
    { value: "intercession", label: "Intercession", color: "from-purple-500 to-pink-500" },
    { value: "confession", label: "Confession", color: "from-orange-500 to-red-500" },
    { value: "praise", label: "Praise", color: "from-yellow-500 to-amber-500" },
    { value: "petition", label: "Petition", color: "from-indigo-500 to-purple-500" },
  ];

  const handleCreatePrayer = async () => {
    if (!prayerTitle.trim() || !prayerContent.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    const toastId = toast.loading("Saving prayer...");
    try {
      await createPrayer({
        title: prayerTitle,
        content: prayerContent,
        category: prayerCategory,
      });
      setPrayerTitle("");
      setPrayerContent("");
      setShowNewPrayer(false);
      toast.success("Prayer saved! 🙏", { id: toastId });
    } catch (error) {
      toast.error("Failed to save prayer", { id: toastId });
    }
  };

  const handleCreateScripture = async () => {
    if (!scriptureRef.trim() || !scriptureText.trim()) {
      toast.error("Please enter reference and text");
      return;
    }

    const toastId = toast.loading("Saving scripture...");
    try {
      await createScripture({
        reference: scriptureRef,
        text: scriptureText,
        translation: scriptureTranslation || undefined,
        category: scriptureCategory || undefined,
        notes: scriptureNotes || undefined,
      });
      setScriptureRef("");
      setScriptureText("");
      setScriptureTranslation("");
      setScriptureCategory("");
      setScriptureNotes("");
      setShowNewScripture(false);
      toast.success("Scripture saved! 📖", { id: toastId });
    } catch (error) {
      toast.error("Failed to save scripture", { id: toastId });
    }
  };

  const handleMarkAnswered = async (prayerId: Id<"prayers">) => {
    const toastId = toast.loading("Marking as answered...");
    try {
      await markAnswered({ prayerId });
      toast.success("Praise God! Prayer answered! 🙌", { id: toastId });
    } catch (error) {
      toast.error("Failed to update prayer", { id: toastId });
    }
  };

  const handleCreateVideo = async () => {
    if (!videoTitle.trim() || !videoUrl.trim()) {
      toast.error("Please enter title and URL");
      return;
    }

    const toastId = toast.loading("Saving video...");
    try {
      await createVideo({
        title: videoTitle,
        url: videoUrl,
        description: videoDescription || undefined,
        category: videoCategory || undefined,
        speaker: videoSpeaker || undefined,
        notes: videoNotes || undefined,
      });
      setVideoTitle("");
      setVideoUrl("");
      setVideoDescription("");
      setVideoCategory("");
      setVideoSpeaker("");
      setVideoNotes("");
      setShowNewVideo(false);
      toast.success("Video saved! 🎥", { id: toastId });
    } catch (error) {
      toast.error("Failed to save video", { id: toastId });
    }
  };

  if (prayers === undefined || scriptures === undefined || holyVideos === undefined || favoriteVideos === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayedVideos = showFavoriteVideosOnly ? favoriteVideos : holyVideos;
  const displayedPrayers = showFavoritePrayersOnly 
    ? prayers.filter((p: any) => p.isFavorite) 
    : prayers;
  const displayedScriptures = showFavoriteScripturesOnly 
    ? scriptures.filter((s: any) => s.isFavorite) 
    : scriptures;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-50 dark:from-purple-950 dark:via-indigo-950 dark:to-blue-950 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <motion.div 
                className="bg-gradient-to-br from-purple-600 to-indigo-600 p-3 rounded-xl shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Heart className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 bg-clip-text text-transparent">
                  Prayer Journal
                </h2>
                <p className="text-sm text-muted-foreground font-semibold">
                  Your sacred space for prayers and scripture
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={activeTab === "prayers" ? "default" : "outline"}
          onClick={() => setActiveTab("prayers")}
          className="cursor-pointer"
        >
          <Heart className="h-4 w-4 mr-2" />
          Prayers ({prayers.length})
        </Button>
        <Button
          variant={activeTab === "scriptures" ? "default" : "outline"}
          onClick={() => setActiveTab("scriptures")}
          className="cursor-pointer"
        >
          <BookOpen className="h-4 w-4 mr-2" />
          Scriptures ({scriptures.length})
        </Button>
        <Button
          variant={activeTab === "videos" ? "default" : "outline"}
          onClick={() => setActiveTab("videos")}
          className="cursor-pointer"
        >
          <Video className="h-4 w-4 mr-2" />
          Holy Videos ({holyVideos.length})
        </Button>
      </div>

      {/* Prayers Tab */}
      {activeTab === "prayers" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Button
              onClick={() => setShowNewPrayer(!showNewPrayer)}
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Prayer
            </Button>
            
            <FavoriteFilterButton
              showFavoritesOnly={showFavoritePrayersOnly}
              onToggle={() => setShowFavoritePrayersOnly(!showFavoritePrayersOnly)}
              favoriteCount={displayedPrayers.length}
              totalCount={prayers.length}
            />
          </div>

          <AnimatePresence>
            {showNewPrayer && (
              <PrayerForm
                title={prayerTitle}
                content={prayerContent}
                category={prayerCategory}
                onTitleChange={setPrayerTitle}
                onContentChange={setPrayerContent}
                onCategoryChange={setPrayerCategory}
                onSubmit={handleCreatePrayer}
                onCancel={() => setShowNewPrayer(false)}
              />
            )}
          </AnimatePresence>

          {/* Prayer List */}
          <div className="grid gap-4">
            {displayedPrayers.map((prayer: any, i: number) => {
              const category = categories.find((c) => c.value === prayer.category);
              return (
                <PrayerCard
                  key={prayer._id}
                  prayer={prayer}
                  categoryColor={category?.color || "from-gray-500 to-gray-600"}
                  categoryLabel={category?.label || "Other"}
                  onToggleFavorite={() => togglePrayerFavorite({ prayerId: prayer._id })}
                  onMarkAnswered={() => handleMarkAnswered(prayer._id)}
                  onDelete={() => removePrayer({ prayerId: prayer._id })}
                  index={i}
                />
              );
            })}
          </div>

          {displayedPrayers.length === 0 && (
            <EmptyStateCard
              icon={Heart}
              message={
                showFavoritePrayersOnly 
                  ? "No favorite prayers yet. Star some prayers to see them here!" 
                  : "No prayers yet. Start your prayer journal!"
              }
              iconClassName="text-purple-400"
            />
          )}
        </div>
      )}

      {/* Scriptures Tab */}
      {activeTab === "scriptures" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Button
              onClick={() => setShowNewScripture(!showNewScripture)}
              className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Scripture
            </Button>
            
            <FavoriteFilterButton
              showFavoritesOnly={showFavoriteScripturesOnly}
              onToggle={() => setShowFavoriteScripturesOnly(!showFavoriteScripturesOnly)}
              favoriteCount={displayedScriptures.length}
              totalCount={scriptures.length}
            />
          </div>

          <AnimatePresence>
            {showNewScripture && (
              <ScriptureForm
                reference={scriptureRef}
                text={scriptureText}
                translation={scriptureTranslation}
                category={scriptureCategory}
                notes={scriptureNotes}
                onReferenceChange={setScriptureRef}
                onTextChange={setScriptureText}
                onTranslationChange={setScriptureTranslation}
                onCategoryChange={setScriptureCategory}
                onNotesChange={setScriptureNotes}
                onSubmit={handleCreateScripture}
                onCancel={() => setShowNewScripture(false)}
              />
            )}
          </AnimatePresence>

          {/* Scripture List */}
          <div className="grid gap-4">
            {displayedScriptures.map((scripture: any, i: number) => (
              <ScriptureCard
                key={scripture._id}
                scripture={scripture}
                onToggleFavorite={() => toggleScriptureFavorite({ scriptureId: scripture._id })}
                onDelete={() => removeScripture({ scriptureId: scripture._id })}
                index={i}
              />
            ))}
          </div>

          {displayedScriptures.length === 0 && (
            <EmptyStateCard
              icon={BookOpen}
              message={
                showFavoriteScripturesOnly 
                  ? "No favorite scriptures yet. Star some scriptures to see them here!" 
                  : "No scriptures saved yet. Start building your collection!"
              }
              iconClassName="text-blue-400"
            />
          )}
        </div>
      )}

      {/* Holy Videos Tab */}
      {activeTab === "videos" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <Button
              onClick={() => setShowNewVideo(!showNewVideo)}
              className="cursor-pointer bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Video
            </Button>
            
            <FavoriteFilterButton
              showFavoritesOnly={showFavoriteVideosOnly}
              onToggle={() => setShowFavoriteVideosOnly(!showFavoriteVideosOnly)}
              favoriteCount={favoriteVideos.length}
              totalCount={holyVideos.length}
            />
          </div>

          <AnimatePresence>
            {showNewVideo && (
              <HolyVideoForm
                title={videoTitle}
                url={videoUrl}
                description={videoDescription}
                category={videoCategory}
                speaker={videoSpeaker}
                notes={videoNotes}
                onTitleChange={setVideoTitle}
                onUrlChange={setVideoUrl}
                onDescriptionChange={setVideoDescription}
                onCategoryChange={setVideoCategory}
                onSpeakerChange={setVideoSpeaker}
                onNotesChange={setVideoNotes}
                onSubmit={handleCreateVideo}
                onCancel={() => setShowNewVideo(false)}
              />
            )}
          </AnimatePresence>

          {/* Video List */}
          <div className="grid gap-4">
            {displayedVideos.map((video: any, i: number) => (
              <HolyVideoCard
                key={video._id}
                video={video}
                onToggleFavorite={() => toggleVideoFavorite({ videoId: video._id })}
                onDelete={() => removeVideo({ videoId: video._id })}
                index={i}
              />
            ))}
          </div>

          {displayedVideos.length === 0 && (
            <EmptyStateCard
              icon={Video}
              message={
                showFavoriteVideosOnly 
                  ? "No favorite videos yet. Star some videos to see them here!" 
                  : "No videos saved yet. Start building your collection!"
              }
              iconClassName="text-red-400"
            />
          )}
        </div>
      )}
    </div>
  );
}