import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface VideoCategoryCardProps {
  category: {
    _id: Id<"videoCategories">;
    name: string;
    description?: string;
    color: string;
  };
  isSelected: boolean;
  videoCount: number;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function VideoCategoryCard({
  category,
  isSelected,
  videoCount,
  onSelect,
  onEdit,
  onDelete,
  index,
}: VideoCategoryCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`border-2 cursor-pointer transition-all hover:shadow-lg group ${
          isSelected
            ? "border-blue-500 dark:border-blue-400 shadow-lg"
            : "border-blue-200 dark:border-blue-800"
        }`}
        onClick={onSelect}
      >
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div
                className={`inline-block px-4 py-2 rounded-lg bg-gradient-to-r ${category.color} text-white font-bold mb-2`}
              >
                <FolderOpen className="h-5 w-5 inline mr-2" />
                {category.name}
              </div>
              {category.description && (
                <p className="text-sm text-muted-foreground mt-2">
                  {category.description}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                {videoCount} videos
              </p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
                className="cursor-pointer"
              >
                <Edit2 className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="cursor-pointer"
              >
                <Trash2 className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
