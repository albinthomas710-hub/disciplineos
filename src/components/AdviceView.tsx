import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Plus, Loader2, FolderOpen, Trash2, RotateCcw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { FavoriteFilterButton } from "@/components/shared/FavoriteFilterButton";
import { EmptyStateCard } from "@/components/shared/EmptyStateCard";
import { AdviceCategoryCard } from "@/components/advice/AdviceCategoryCard";
import { CategoryForm } from "@/components/advice/CategoryForm";
import { AdviceForm } from "@/components/advice/AdviceForm";
import { AdviceCard } from "@/components/advice/AdviceCard";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export default function AdviceView() {
  const categories = useQuery((api as any).advice.getAllCategories);
  const allAdvice = useQuery((api as any).advice.getAllAdvice);
  const trashItems = useQuery((api as any).advice.getTrash);

  const createCategory = useMutation((api as any).advice.createCategory);
  const deleteCategory = useMutation((api as any).advice.deleteCategory);
  const createAdvice = useMutation((api as any).advice.createAdvice);
  const updateAdvice = useMutation((api as any).advice.updateAdvice);
  const deleteAdvice = useMutation((api as any).advice.deleteAdvice);
  const toggleFavorite = useMutation((api as any).advice.toggleFavorite);
  
  // Restore & Permanent Delete
  const restoreCategory = useMutation((api as any).advice.restoreCategory);
  const restoreAdvice = useMutation((api as any).advice.restoreAdvice);
  const permDeleteCategory = useMutation((api as any).advice.permanentlyDeleteCategory);
  const permDeleteAdvice = useMutation((api as any).advice.permanentlyDeleteAdvice);

  const [selectedCategory, setSelectedCategory] = useState<Id<"adviceCategories"> | null>(null);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [showNewAdvice, setShowNewAdvice] = useState(false);
  const [editingAdvice, setEditingAdvice] = useState<Id<"adviceLibrary"> | null>(null);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  
  // Deletion States
  const [adviceToDelete, setAdviceToDelete] = useState<Id<"adviceLibrary"> | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Id<"adviceCategories"> | null>(null);
  const [showTrash, setShowTrash] = useState(false);

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryDescription, setCategoryDescription] = useState("");
  const [categoryColor, setCategoryColor] = useState("from-green-500 to-emerald-500");

  // Advice form state
  const [adviceTitle, setAdviceTitle] = useState("");
  const [adviceContent, setAdviceContent] = useState("");
  const [adviceSource, setAdviceSource] = useState("");
  const [adviceTags, setAdviceTags] = useState("");

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    const toastId = toast.loading("Creating category...");
    try {
      await createCategory({
        name: categoryName,
        description: categoryDescription || undefined,
        color: categoryColor,
      });
      setCategoryName("");
      setCategoryDescription("");
      setShowNewCategory(false);
      toast.success("Category created! 📁", { id: toastId });
    } catch (error) {
      toast.error("Failed to create category", { id: toastId });
    }
  };

  const handleConfirmDeleteCategory = async () => {
    if (!categoryToDelete) return;
    
    const toastId = toast.loading("Moving category to trash...");
    try {
      await deleteCategory({ categoryId: categoryToDelete });
      if (selectedCategory === categoryToDelete) {
        setSelectedCategory(null);
      }
      toast.success("Category moved to trash", { id: toastId });
      setCategoryToDelete(null);
    } catch (error) {
      toast.error("Failed to delete category", { id: toastId });
    }
  };

  const handleCreateAdvice = async () => {
    if (!selectedCategory) {
      toast.error("Please select a category first");
      return;
    }
    if (!adviceTitle.trim() || !adviceContent.trim()) {
      toast.error("Please enter title and content");
      return;
    }

    const toastId = toast.loading("Adding advice...");
    try {
      const tags = adviceTags.trim() ? adviceTags.split(",").map(t => t.trim()) : undefined;
      
      if (editingAdvice) {
        await updateAdvice({
          adviceId: editingAdvice,
          title: adviceTitle,
          content: adviceContent,
          source: adviceSource || undefined,
          tags,
        });
        toast.success("Advice updated! 💡", { id: toastId });
      } else {
        await createAdvice({
          categoryId: selectedCategory,
          title: adviceTitle,
          content: adviceContent,
          source: adviceSource || undefined,
          tags,
        });
        toast.success("Advice added! 💡", { id: toastId });
      }
      
      setAdviceTitle("");
      setAdviceContent("");
      setAdviceSource("");
      setAdviceTags("");
      setShowNewAdvice(false);
      setEditingAdvice(null);
    } catch (error) {
      toast.error("Failed to save advice", { id: toastId });
    }
  };

  const handleEditAdvice = (advice: any) => {
    setAdviceTitle(advice.title);
    setAdviceContent(advice.content);
    setAdviceSource(advice.source || "");
    setAdviceTags(advice.tags?.join(", ") || "");
    setEditingAdvice(advice._id);
    setShowNewAdvice(true);
  };

  const handleConfirmDeleteAdvice = async () => {
    if (!adviceToDelete) return;
    
    const toastId = toast.loading("Moving advice to trash...");
    try {
      await deleteAdvice({ adviceId: adviceToDelete });
      toast.success("Advice moved to trash", { id: toastId });
      setAdviceToDelete(null);
    } catch (error) {
      toast.error("Failed to delete advice", { id: toastId });
    }
  };

  const handleRestoreCategory = async (id: Id<"adviceCategories">) => {
    const toastId = toast.loading("Restoring category...");
    try {
      await restoreCategory({ categoryId: id });
      toast.success("Category restored!", { id: toastId });
    } catch (error) {
      toast.error("Failed to restore", { id: toastId });
    }
  };

  const handleRestoreAdvice = async (id: Id<"adviceLibrary">) => {
    const toastId = toast.loading("Restoring advice...");
    try {
      await restoreAdvice({ adviceId: id });
      toast.success("Advice restored!", { id: toastId });
    } catch (error) {
      toast.error("Failed to restore", { id: toastId });
    }
  };

  if (categories === undefined || allAdvice === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const filteredAdvice = selectedCategory
    ? allAdvice.filter((a: any) => {
        const matchesCategory = a.categoryId === selectedCategory;
        const matchesFavorite = showFavoritesOnly ? a.isFavorite === true : true;
        return matchesCategory && matchesFavorite;
      })
    : allAdvice.filter((a: any) => (showFavoritesOnly ? a.isFavorite === true : true));

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
        <Card className="border-2 border-green-300 dark:border-green-700 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 shadow-2xl">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-green-600 to-emerald-600 p-3 rounded-xl shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Lightbulb className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    Advice Library
                  </h2>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Store and organize valuable advice by category
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTrash(true)}
                className="border-green-200 hover:bg-green-100 dark:border-green-800 dark:hover:bg-green-900"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Trash Bin
              </Button>
            </CardTitle>
          </CardHeader>
        </Card>
      </motion.div>

      {/* Categories Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold">Categories ({categories.length})</h3>
          <Button
            onClick={() => setShowNewCategory(!showNewCategory)}
            className="cursor-pointer bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Category
          </Button>
        </div>

        <AnimatePresence>
          {showNewCategory && (
            <CategoryForm
              categoryName={categoryName}
              categoryDescription={categoryDescription}
              categoryColor={categoryColor}
              onNameChange={setCategoryName}
              onDescriptionChange={setCategoryDescription}
              onColorChange={setCategoryColor}
              onSubmit={handleCreateCategory}
              onCancel={() => setShowNewCategory(false)}
            />
          )}
        </AnimatePresence>

        {/* Category Grid */}
        <div className="grid md:grid-cols-3 gap-4">
          {categories.map((category: any, i: number) => (
            <AdviceCategoryCard
              key={category._id}
              category={category}
              isSelected={selectedCategory === category._id}
              videoCount={allAdvice.filter((a: any) => a.categoryId === category._id).length}
              onSelect={() => setSelectedCategory(category._id)}
              onDelete={() => setCategoryToDelete(category._id)}
              index={i}
            />
          ))}
        </div>

        {categories.length === 0 && (
          <EmptyStateCard
            icon={FolderOpen}
            message="No categories yet. Create your first category!"
            iconClassName="text-green-400"
          />
        )}
      </div>

      {/* Advice Section */}
      {selectedCategory && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-xl font-bold">
              Advice in {categories.find((c: any) => c._id === selectedCategory)?.name}
            </h3>
            <div className="flex gap-2">
              <FavoriteFilterButton
                showFavoritesOnly={showFavoritesOnly}
                onToggle={() => setShowFavoritesOnly(!showFavoritesOnly)}
                favoriteCount={filteredAdvice.length}
                totalCount={allAdvice.filter((a: any) => a.categoryId === selectedCategory).length}
              />
              <Button
                onClick={() => {
                  setShowNewAdvice(!showNewAdvice);
                  setEditingAdvice(null);
                  setAdviceTitle("");
                  setAdviceContent("");
                  setAdviceSource("");
                  setAdviceTags("");
                }}
                className="cursor-pointer bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Advice
              </Button>
            </div>
          </div>

          <AnimatePresence>
            {showNewAdvice && (
              <AdviceForm
                title={adviceTitle}
                content={adviceContent}
                source={adviceSource}
                tags={adviceTags}
                isEditing={!!editingAdvice}
                onTitleChange={setAdviceTitle}
                onContentChange={setAdviceContent}
                onSourceChange={setAdviceSource}
                onTagsChange={setAdviceTags}
                onSubmit={handleCreateAdvice}
                onCancel={() => {
                  setShowNewAdvice(false);
                  setEditingAdvice(null);
                }}
              />
            )}
          </AnimatePresence>

          {/* Advice List */}
          <div className="grid gap-4">
            {filteredAdvice.map((advice: any, i: number) => (
              <AdviceCard
                key={advice._id}
                advice={advice}
                onToggleFavorite={() => toggleFavorite({ adviceId: advice._id })}
                onEdit={() => handleEditAdvice(advice)}
                onDelete={() => setAdviceToDelete(advice._id)}
                index={i}
              />
            ))}
          </div>

          {filteredAdvice.length === 0 && (
            <EmptyStateCard
              icon={Lightbulb}
              message={
                showFavoritesOnly
                  ? "No favorite advice in this category yet. Star some advice to see them here!"
                  : "No advice in this category yet. Add your first piece of advice!"
              }
              iconClassName="text-emerald-400"
            />
          )}
        </div>
      )}

      {/* Delete Advice Confirmation */}
      <AlertDialog open={!!adviceToDelete} onOpenChange={(open) => !open && setAdviceToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This advice will be moved to the trash bin. You can restore it later if needed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteAdvice}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={!!categoryToDelete} onOpenChange={(open) => !open && setCategoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Move Category to Trash?</AlertDialogTitle>
            <AlertDialogDescription>
              This category and all its advice will be moved to the trash bin. You can restore them later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteCategory}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Move to Trash
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Trash Bin Dialog */}
      <Dialog open={showTrash} onOpenChange={setShowTrash}>
        <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-500" />
              Trash Bin
            </DialogTitle>
            <DialogDescription>
              Restore items or permanently delete them.
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6 py-4">
              {/* Deleted Categories */}
              {trashItems?.categories && trashItems.categories.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Deleted Categories</h4>
                  <div className="grid gap-3">
                    {trashItems.categories.map((cat: any) => (
                      <div key={cat._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-3">
                          <FolderOpen className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{cat.name}</p>
                            <p className="text-xs text-muted-foreground">Deleted {new Date(cat.deletedAt || 0).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRestoreCategory(cat._id)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => permDeleteCategory({ categoryId: cat._id })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Deleted Advice */}
              {trashItems?.advice && trashItems.advice.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Deleted Advice</h4>
                  <div className="grid gap-3">
                    {trashItems.advice.map((item: any) => (
                      <div key={item._id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Lightbulb className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{item.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => handleRestoreAdvice(item._id)}>
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Restore
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => permDeleteAdvice({ adviceId: item._id })}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!trashItems?.categories?.length && !trashItems?.advice?.length) && (
                <div className="text-center py-12 text-muted-foreground">
                  <Trash2 className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>Trash is empty</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}