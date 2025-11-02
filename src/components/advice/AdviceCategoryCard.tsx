import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FolderOpen, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface AdviceCategoryCardProps {
  category: {
    _id: Id<"adviceCategories">;
    name: string;
    description?: string;
    color: string;
  };
  isSelected: boolean;
  videoCount: number;
  onSelect: () => void;
  onDelete: () => void;
  index: number;
}

export function AdviceCategoryCard({
  category,
  isSelected,
  videoCount,
  onSelect,
  onDelete,
  index,
}: AdviceCategoryCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card
        className={`border-2 cursor-pointer transition-all hover:shadow-lg ${
          isSelected
            ? "border-green-500 dark:border-green-400 shadow-lg"
            : "border-green-200 dark:border-green-800"
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
                {videoCount} advice
              </p>
            </div>
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
        </CardContent>
      </Card>
    </motion.div>
  );
}
