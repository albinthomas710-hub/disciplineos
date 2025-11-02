import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Edit2, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface AdviceCardProps {
  advice: {
    _id: Id<"adviceLibrary">;
    title: string;
    content: string;
    source?: string;
    tags?: string[];
    isFavorite?: boolean;
  };
  onToggleFavorite: () => void;
  onEdit: () => void;
  onDelete: () => void;
  index: number;
}

export function AdviceCard({
  advice,
  onToggleFavorite,
  onEdit,
  onDelete,
  index,
}: AdviceCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-emerald-200 dark:border-emerald-800 group hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-emerald-600 dark:text-emerald-400 mb-2">
                {advice.title}
              </h3>
              <p className="text-sm mb-3 whitespace-pre-wrap">{advice.content}</p>
              {advice.source && (
                <p className="text-sm text-muted-foreground mb-2">
                  📚 Source: {advice.source}
                </p>
              )}
              {advice.tags && advice.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {advice.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 text-xs rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
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
                    advice.isFavorite ? "fill-yellow-500 text-yellow-500" : ""
                  }`}
                />
              </Button>
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
