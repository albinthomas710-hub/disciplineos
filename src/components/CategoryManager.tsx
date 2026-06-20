import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Palette, Loader2 } from "lucide-react";

interface CategoryManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CategoryManager({
  open,
  onOpenChange,
}: CategoryManagerProps) {
  const categories = useQuery((api as any).categories.list);
  const createCategory = useMutation((api as any).categories.create);
  const removeCategory = useMutation((api as any).categories.remove);

  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newCategory, setNewCategory] = useState({
    name: "",
    color: "from-indigo-500 to-purple-500",
    glowColor: "rgba(99,102,241,0.5)",
  });

  const handleCreate = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      await createCategory(newCategory);
      toast.success("Category created!");
      setShowAddDialog(false);
      setNewCategory({
        name: "",
        color: "from-indigo-500 to-purple-500",
        glowColor: "rgba(99,102,241,0.5)",
      });
    } catch (error: any) {
      toast.error(error.message || "Failed to create category");
    }
  };

  const handleDelete = async (id: Id<"customCategories">) => {
    if (!confirm("Delete this category?")) return;

    try {
      await removeCategory({ id });
      toast.success("Category deleted");
    } catch (error) {
      toast.error("Failed to delete category");
    }
  };

  const colorPresets = [
    { name: "Indigo-Purple", gradient: "from-indigo-500 to-purple-500", glow: "rgba(99,102,241,0.5)" },
    { name: "Pink-Rose", gradient: "from-pink-500 to-rose-500", glow: "rgba(236,72,153,0.5)" },
    { name: "Emerald-Teal", gradient: "from-emerald-500 to-teal-500", glow: "rgba(16,185,129,0.5)" },
    { name: "Amber-Orange", gradient: "from-amber-500 to-orange-500", glow: "rgba(245,158,11,0.5)" },
    { name: "Sky-Blue", gradient: "from-sky-500 to-blue-500", glow: "rgba(14,165,233,0.5)" },
    { name: "Violet-Fuchsia", gradient: "from-violet-500 to-fuchsia-500", glow: "rgba(139,92,246,0.5)" },
  ];

  if (!categories) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Categories</DialogTitle>
            <DialogDescription>
              Customize your time block categories with colors and names
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            {categories.map((category: any, index: number) => (
              <Card key={category._id || index}>
                <CardContent className="p-4 flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-lg bg-gradient-to-r ${category.color} shadow-[0_0_20px_${category.glowColor}]`}
                  />
                  <div className="flex-1">
                    <p className="font-semibold">{category.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {category.isCustom ? "Custom" : "Default"}
                    </p>
                  </div>
                  {category.isCustom && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(category._id)}
                      className="cursor-pointer text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>

          <DialogFooter>
            <Button
              onClick={() => setShowAddDialog(true)}
              className="cursor-pointer"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Custom Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Category Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Custom Category</DialogTitle>
            <DialogDescription>
              Add a new category with a custom name and color
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="categoryName">Category Name</Label>
              <Input
                id="categoryName"
                placeholder="e.g., Work, Hobby, Family"
                value={newCategory.name}
                onChange={(e) =>
                  setNewCategory({ ...newCategory, name: e.target.value })
                }
              />
            </div>
            <div>
              <Label>Color Theme</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setNewCategory({
                        ...newCategory,
                        color: preset.gradient,
                        glowColor: preset.glow,
                      })
                    }
                    className={`p-3 rounded-lg bg-gradient-to-r ${preset.gradient} hover:scale-105 transition-transform ${
                      newCategory.color === preset.gradient
                        ? "ring-2 ring-primary ring-offset-2"
                        : ""
                    }`}
                  >
                    <p className="text-xs text-white font-semibold">
                      {preset.name}
                    </p>
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 rounded-lg border-2 bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
              <p className="text-sm text-muted-foreground mb-2">Preview:</p>
              <div
                className={`p-3 rounded-lg bg-gradient-to-r ${newCategory.color} shadow-[0_0_20px_${newCategory.glowColor}]`}
              >
                <p className="text-white font-semibold">{newCategory.name || "Category Name"}</p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button onClick={handleCreate} className="cursor-pointer">
              <Palette className="h-4 w-4 mr-2" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
