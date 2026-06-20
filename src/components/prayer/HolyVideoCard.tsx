import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Star, Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Id } from "@/convex/_generated/dataModel";

interface HolyVideoCardProps {
  video: {
    _id: Id<"holyVideos">;
    title: string;
    url: string;
    description?: string;
    category?: string;
    speaker?: string;
    notes?: string;
    isFavorite: boolean;
  };
  onToggleFavorite: () => void;
  onDelete: () => void;
  index: number;
}

export function HolyVideoCard({
  video,
  onToggleFavorite,
  onDelete,
  index,
}: HolyVideoCardProps) {
  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border-2 border-red-200 dark:border-red-800 group hover:shadow-lg transition-shadow">
        <CardContent className="pt-6">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-bold text-lg text-red-600 dark:text-red-400">
                  {video.title}
                </h3>
                {video.category && (
                  <span className="px-2 py-1 rounded text-xs font-bold bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300">
                    {video.category}
                  </span>
                )}
              </div>
              {video.speaker && (
                <p className="text-sm text-muted-foreground mb-2">
                  🎤 {video.speaker}
                </p>
              )}
              {video.description && (
                <p className="text-sm mb-2">{video.description}</p>
              )}
              {video.notes && (
                <p className="text-sm text-muted-foreground mt-2 p-2 bg-red-50 dark:bg-red-950/30 rounded">
                  💭 {video.notes}
                </p>
              )}
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
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
                <Star className={`h-4 w-4 ${video.isFavorite ? 'fill-yellow-500 text-yellow-500' : ''}`} />
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
