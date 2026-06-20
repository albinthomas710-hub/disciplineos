import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface ScriptureCardProps {
  scripture: {
    _id: Id<"scriptures">;
    reference: string;
    text: string;
    translation?: string;
    notes?: string;
    isFavorite: boolean;
  };
  onToggleFavorite: () => void;
  onDelete: () => void;
  index: number;
}

export function ScriptureCard({
  scripture,
  onToggleFavorite,
  onDelete,
  index,
}: ScriptureCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-blue-200 dark:border-blue-800 group">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-blue-600 dark:text-blue-400">
                  {scripture.reference}
                </h3>
                {scripture.translation && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                    {scripture.translation}
                  </span>
                )}
              </div>
              <p className="text-sm italic mb-2">"{scripture.text}"</p>
              {scripture.notes && (
                <p className="text-sm text-muted-foreground mt-2 p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                  💭 {scripture.notes}
                </p>
              )}
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleFavorite}
                className="cursor-pointer"
              >
                <Star className={`h-4 w-4 ${scripture.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
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
