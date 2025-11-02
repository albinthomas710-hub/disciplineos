import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Check, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface PrayerCardProps {
  prayer: {
    _id: Id<"prayers">;
    title: string;
    content: string;
    category: string;
    isAnswered: boolean;
    isFavorite: boolean;
    createdAt: number;
  };
  categoryColor: string;
  categoryLabel: string;
  onToggleFavorite: () => void;
  onMarkAnswered: () => void;
  onDelete: () => void;
  index: number;
}

export function PrayerCard({
  prayer,
  categoryColor,
  categoryLabel,
  onToggleFavorite,
  onMarkAnswered,
  onDelete,
  index,
}: PrayerCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`border-2 ${prayer.isAnswered ? 'border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/30' : 'border-purple-200 dark:border-purple-800'} group`}>
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r ${categoryColor} text-white`}>
                  {categoryLabel}
                </span>
                {prayer.isAnswered && (
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-600 text-white flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Answered
                  </span>
                )}
              </div>
              <h3 className="font-bold text-lg">{prayer.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 whitespace-pre-wrap">{prayer.content}</p>
            </div>
            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                size="sm"
                variant="ghost"
                onClick={onToggleFavorite}
                className="cursor-pointer"
              >
                <Star className={`h-4 w-4 ${prayer.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
              </Button>
              {!prayer.isAnswered && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onMarkAnswered}
                  className="cursor-pointer"
                >
                  <Check className="h-4 w-4 text-green-600" />
                </Button>
              )}
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
          <p className="text-xs text-muted-foreground">
            {new Date(prayer.createdAt).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}
