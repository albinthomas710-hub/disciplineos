import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, RefreshCw, AlertCircle, Sparkles } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { toast } from "sonner";

interface FailureEntry {
  _id: string;
  _creationTime: number;
  userId: string;
  type: "recurring_mistake" | "single_lesson" | "multi_lesson" | "external_wisdom" | "titan_failures";
  title: string;
  description: string;
  lessons: string[];
  frequency?: string;
  preventionStrategy?: string;
  source?: string;
  tags?: string[];
  date: string;
  relapseCount?: number;
  lastRelapseDate?: string;
  isFavorite: boolean;
}

interface FailureWisdomCardProps {
  entry: FailureEntry;
  index: number;
  onDelete: (id: string) => void;
}

export function FailureWisdomCard({ entry, index, onDelete }: FailureWisdomCardProps) {
  const logRelapse = useMutation("failureWisdom:logRelapse" as any);
  const toggleFavorite = useMutation("failureWisdom:toggleFavorite" as any);

  const handleRelapse = async () => {
    try {
      await logRelapse({ id: entry._id });
      toast.error("Relapse logged. Be kind to yourself, analyze why, and reset.");
    } catch (error) {
      toast.error("Failed to log relapse");
    }
  };

  const handleToggleFavorite = async () => {
    try {
      await toggleFavorite({ id: entry._id });
      toast.success(entry.isFavorite ? "Removed from favorites" : "Added to favorites");
    } catch (error) {
      toast.error("Failed to update favorite");
    }
  };

  return (
    <motion.div
      key={entry._id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ 
        duration: 0.4, 
        delay: index * 0.05,
        ease: [0.22, 1, 0.36, 1]
      }}
      layout
    >
      <Card className="group relative h-full bg-white dark:bg-gradient-to-br dark:from-neutral-900/80 dark:to-neutral-950/80 border border-gray-200 dark:border-neutral-800 hover:border-red-600/30 transition-all duration-500 overflow-hidden backdrop-blur-sm rounded-2xl shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-orange-600/0 group-hover:from-red-600/5 group-hover:via-red-600/5 group-hover:to-orange-600/5 transition-all duration-500 pointer-events-none" />
        
        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-red-600 via-orange-600 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        
        <CardHeader className="relative pb-4">
          <div className="flex justify-between items-start gap-4">
            <CardTitle className="text-xl font-bold leading-tight text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-300">
              {entry.title}
            </CardTitle>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleToggleFavorite}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-neutral-500 hover:text-yellow-500 hover:bg-yellow-950/30 rounded-lg"
              >
                {entry.isFavorite ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 15 }}
                  >
                    <Sparkles className="h-4 w-4 fill-yellow-500 text-yellow-500" />
                  </motion.div>
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(entry._id)}
                className="opacity-0 group-hover:opacity-100 transition-all duration-300 text-neutral-500 hover:text-red-500 hover:bg-red-950/30 rounded-lg"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mt-3">
            {entry.source && (
              <Badge variant="outline" className="border-red-600/30 text-red-500 bg-red-950/20 rounded-lg px-3 py-1">
                {entry.source}
              </Badge>
            )}
            {entry.frequency && (
              <Badge variant="secondary" className="bg-neutral-800 text-neutral-300 rounded-lg px-3 py-1">
                {entry.frequency}
              </Badge>
            )}
            {(entry.relapseCount || 0) > 0 && (
              <Badge variant="outline" className="border-orange-500/50 text-orange-600 dark:text-orange-400 bg-orange-500/10 rounded-lg px-3 py-1 flex items-center gap-1">
                <RefreshCw className="h-3 w-3" />
                {entry.relapseCount} Relapses
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="relative space-y-6">
          <p className="text-gray-600 dark:text-neutral-400 text-sm leading-relaxed">
            {entry.description}
          </p>
          
          <div className="space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500 dark:text-neutral-600">
              Key Takeaways
            </h4>
            <ul className="space-y-2">
              {entry.lessons.map((lesson: string, i: number) => (
                <motion.li 
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-start gap-3 text-sm font-medium text-gray-700 dark:text-neutral-300"
                >
                  <span className="text-red-500 mt-1 text-lg leading-none">•</span>
                  <span>{lesson}</span>
                </motion.li>
              ))}
            </ul>
          </div>

          {entry.preventionStrategy && (
            <div className="pt-4 border-t border-gray-200 dark:border-neutral-800/50">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-600 mb-2">
                Prevention Strategy
              </h4>
              <p className="text-sm font-semibold text-red-500">
                {entry.preventionStrategy}
              </p>
            </div>
          )}
          
          <div className="pt-4 flex items-center justify-between border-t border-gray-200 dark:border-neutral-800/50 mt-4">
            <div className="text-[10px] text-gray-500 dark:text-neutral-600 font-mono tracking-wider">
              {new Date(entry.date).toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleRelapse}
              className="text-xs font-medium text-orange-600 hover:text-orange-700 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-950/30 h-8 px-3 rounded-lg transition-colors"
            >
              <AlertCircle className="h-3 w-3 mr-1.5" />
              I did it again
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}