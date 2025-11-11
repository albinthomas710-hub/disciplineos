import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Video, Plus, Loader2, FolderOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { FavoriteFilterButton } from "@/components/shared/FavoriteFilterButton";
import { EmptyStateCard } from "@/components/shared/EmptyStateCard";
import { VideoCategoryForm } from "@/components/videolibrary/VideoCategoryForm";
import { VideoCategoryCard } from "@/components/videolibrary/VideoCategoryCard";
import { VideoForm } from "@/components/videolibrary/VideoForm";
import { VideoCard } from "@/components/videolibrary/VideoCard";

export default function VideoLibraryView() {
  const categories = useQuery((api as any).videoLibrary.getAllCategories);
  const allVideos = useQuery((api as any).videoLibrary.getAllVideos);

  const createCategory = useMutation((api as any).videoLibrary.createCategory);
  const deleteCategory = useMutation((api as any).videoLibrary.deleteCategory);
  const createVideo = useMutation((api as any).videoLibrary.createVideo);
  const deleteVideo = useMutation((api as any).videoLibrary.deleteVideo);
  const toggleFavorite = useMutation((api as any).videoLibrary.toggleFavorite);
  const updateVideo = useMutation((api as any).videoLibrary.updateVideo);
  const updateCategory = useMutation((api as any).videoLibrary.updateCategory);

  const [selectedCategory, setSelectedCategory] = useState<Id<"videoCategories"> | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewVideo, setShowNewVideo] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Id<"videoLibrary"> | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Id<"videoCategories"> | null>(null);

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState("from-blue-500 to-cyan-500");

  // Video form state
  const [videoTitle, setVideoTitle] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoNotes, setVideoNotes] = useState("");

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const toastId = toast.loading(editingCategory ? "Updating category..." : "Creating category...");
    try {
      if (editingCategory) {
        await updateCategory({
          categoryId: editingCategory,
          name: categoryName,
          description: categoryDescription || undefined,
          color: categoryColor,
        });
        toast.success("Category updated! 📁", { id: toastId });
      } else {
        await createCategory({
          name: categoryName,
          description: categoryDescription || undefined,
          color: categoryColor,
        });
        toast.success("Category created! 📁", { id: toastId });
      }
      setCategoryName("");
      setCategoryDescription("");
      setShowNewCategory(false);
      setEditingCategory(null);
    } catch (error) {
      toast.error("Failed to save category", { id: toastId });
    }
  };

  const handleDeleteCategory = async (categoryId: Id<"videoCategories">) => {
    const toastId = toast.loading("Deleting category...");
    try {
      await deleteCategory({ categoryId });
      if (selectedCategory === categoryId) {
        setSelectedCategory(null);
      }
      toast.success("Category deleted!", { id: toastId });
    } catch (error) {
      toast.error("Failed to delete category", { id: toastId });
    }
  };

  const handleEditCategory = (category: any) => {
    setCategoryName(category.name);
    setCategoryDescription(category.description || "");
    setCategoryColor(category.color);
    setEditingCategory(category._id);
    setShowNewCategory(true);
  };

  const handleCreateVideo = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }
    if (!videoTitle.trim() || !videoUrl.trim()) {
      toast.error("Please enter title and URL");
      return;
    }

    const toastId = toast.loading(editingVideo ? "Updating video..." : "Adding video...");
    try {
      if (editingVideo) {
        await updateVideo({
          videoId: editingVideo,
          title: videoTitle,
          url: videoUrl,
          description: videoDescription || undefined,
          notes: videoNotes || undefined,
        });
        toast.success("Video updated! 🎥", { id: toastId });
      } else {
        await createVideo({
          categoryId: selectedCategory,
          title: videoTitle,
          url: videoUrl,
          description: videoDescription || undefined,
          notes: videoNotes || undefined,
        });
        toast.success("Video added! 🎥", { id: toastId });
      }
      
      setVideoTitle("");
      setVideoUrl("");
      setVideoDescription("");
      setVideoNotes("");
      setShowNewVideo(false);
      setEditingVideo(null);
    } catch (error) {
      toast.error("Failed to save video", { id: toastId });
    }
  };

  const handleEditVideo = (video: any) => {
    setVideoTitle(video.title);
    setVideoUrl(video.url);
    setVideoDescription(video.description || "");
    setVideoNotes(video.notes || "");
    setEditingVideo(video._id);
    setShowNewVideo(true);
  };

  if (categories === undefined || allVideos === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredVideos = selectedCategory
    ? allVideos.filter((v: any) => {
        const matchesCategory = v.categoryId === selectedCategory;
        const matchesFavorite = showFavoritesOnly ? v.isFavorite : true;
        return matchesCategory && matchesFavorite;
      })
    : allVideos.filter((v: any) => (showFavoritesOnly ? v.isFavorite : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 via-cyan-50 to-indigo-50 dark:from-blue-950 dark:via-cyan-950 dark:to-indigo-950 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <motion.div
                className="bg-gradient-to-br from-blue-600 to-cyan-600 p-3 rounded-xl shadow-2xl"
                whileHover={{ scale: 1.1, rotate: 5 }}
              >
                <Video className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h2 className="text-3xl font-black bg-gradient-to-r from-blue-600 via-cyan-600 to-indigo-600 bg-clip-text text-transparent">
                  Video Library
                </h2>
                <p className="text-sm text-muted-foreground font-semibold">
                  Organize your YouTube videos by category
                </p>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Categories ({categories.length})</h3>
          <Button
            onClick={() => {
              setShowNewCategory(!showNewCategory);
              setEditingCategory(null);
              setCategoryName("");
              setCategoryDescription("");
              setCategoryColor("from-blue-500 to-cyan-500");
            }}
            className="cursor-pointer bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        <AnimatePresence>
          {showNewCategory && (
            <VideoCategoryForm
              categoryName={categoryName}
              categoryDescription={categoryDescription}
              categoryColor={categoryColor}
              isEditing={!!editingCategory}
              onNameChange={setCategoryName}
              onDescriptionChange={setCategoryDescription}
              onColorChange={setCategoryColor}
              onSubmit={handleCreateCategory}
              onCancel={() => {
                setShowNewCategory(false);
                setEditingCategory(null);
              }}
            />
          )}
        </AnimatePresence>

        {/* Category Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {categories.map((category: any, i: number) => (
            <VideoCategoryCard
              key={category._id}
              category={category}
              isSelected={selectedCategory === category._id}
              videoCount={allVideos.filter((v: any) => v.categoryId === category._id).length}
              onSelect={() => setSelectedCategory(category._id)}
              onEdit={() => handleEditCategory(category)}
              onDelete={() => handleDeleteCategory(category._id)}
              index={i}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <EmptyStateCard
            icon={FolderOpen}
            message="No categories yet. Create your first category!"
            iconClassName="text-blue-400"
          />
        )}
      </div>

      {/* Videos Section */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xl font-bold">
              Videos in {categories.find((c: any) => c._id === selectedCategory)?.name}
            </h3>
            <div className="flex gap-2">
              <FavoriteFilterButton
                showFavoritesOnly={showFavoritesOnly}
                onToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                favoriteCount={filteredVideos.length}
                totalCount={allVideos.filter((v: any) => v.categoryId === selectedCategory).length}
              />
              <Button
                onClick={() => {
                  setShowNewVideo(!showNewVideo);
                  setEditingVideo(null);
                  setVideoTitle("");
                  setVideoUrl("");
                  setVideoDescription("");
                  setVideoNotes("");
                }}
                className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Video
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showNewVideo && (
              <VideoForm
                title={videoTitle}
                url={videoUrl}
                description={videoDescription}
                notes={videoNotes}
                isEditing={!!editingVideo}
                onTitleChange={setVideoTitle}
                onUrlChange={setVideoUrl}
                onDescriptionChange={setVideoDescription}
                onNotesChange={setVideoNotes}
                onSubmit={handleCreateVideo}
                onCancel={() => {
                  setShowNewVideo(false);
                  setEditingVideo(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Video List */}
          <div className="grid gap-4">
            {filteredVideos.map((video: any, i: number) => (
              <VideoCard
                key={video._id}
                video={video}
                onToggleFavorite={() => toggleFavorite({ videoId: video._id })}
                onEdit={() => handleEditVideo(video)}
                onDelete={() => deleteVideo({ videoId: video._id })}
                index={i}
              />
            ))}
          </div>

          {filteredVideos.length === 0 && (
            <EmptyStateCard
              icon={Video}
              message={
                showFavoritesOnly 
                  ? "No favorite videos in this category yet. Star some videos to see them here!" 
                  : "No videos in this category yet. Add your first video!"
              }
              iconClassName="text-cyan-400"
            />
          )}
        </div>
      )}
    </div>
  );
}