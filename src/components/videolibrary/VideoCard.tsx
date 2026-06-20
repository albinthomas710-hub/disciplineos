import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Edit2, Trash2, ExternalLink, FolderInput } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoCardProps {
  video: {
    _id: Id<"videoLibrary">;
    title: string;
    url: string;
    description?: string;
    notes?: string;
    isFavorite: boolean;
    categoryId: Id<"videoCategories">;
  };
  categories: Array<{
    _id: Id<"videoCategories">;
    name: string;
    color: string;
  }>;
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onMoveToCategory: (categoryId: Id<"videoCategories">) => void;
  index: number;
}

export function VideoCard({
  video,
  categories,
  onToggleFavorite,
  onEdit,
  onDelete,
  onMoveToCategory,
  index,
}: VideoCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-cyan-200 dark:border-cyan-800 group hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-cyan-600 dark:text-cyan-400 mb-2">
                {video.title}
              </h3>
              {video.description && (
                <p className="text-sm mb-2">{video.description}</p>
              )}
              {video.notes && (
                <p className="text-sm text-muted-foreground mt-2 p-2 bg-cyan-50 dark:bg-cyan-950/30 rounded">
                  💭 {video.notes}
                </p>
              )}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Watch Video
              </a>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleFavorite}
                className="cursor-pointer"
              >
                <Star
                  className={`h-4 w-4 ${
                    video.isFavorite ? "fill-yellow-500 text-yellow-500" : ""
                  }`}
                />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="cursor-pointer"
                  >
                    <FolderInput className="h-4 w-4 text-purple-600" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {categories
                    .filter((cat) => cat._id !== video.categoryId)
                    .map((category) => (
                      <DropdownMenuItem
                        key={category._id}
                        onClick={() => onMoveToCategory(category._id)}
                        className="cursor-pointer"
                      >
                        <FolderInput className="h-4 w-4 mr-2" />
                        Move to {category.name}
                      </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                size="sm"
                variant="ghost"
                onClick={onEdit}
                className="cursor-pointer"
              >
                <Edit2 className="h-4 w-4 text-blue-600" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={onDelete}
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
