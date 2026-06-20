import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import {
  Heart,
  Trash2,
  CheckCircle2,
  Sparkles,
  Calendar as CalendarIcon,
  Zap,
  TrendingUp,
  Sparkle,
  BookMarked,
} from "lucide-react";

interface ManifestationCardProps {
  item: any;
  index: number;
  typeConfig: any;
  onEdit: (item: any) => void;
  onVisualize: (item: any) => void;
  onToggleAchieved: (item: any) => void;
  onToggleFavorite: (itemId: string) => void;
  onDelete: (itemId: string) => void;
}

export default function ManifestationCard({
  item,
  index,
  typeConfig,
  onEdit,
  onVisualize,
  onToggleAchieved,
  onToggleFavorite,
  onDelete,
}: ManifestationCardProps) {
  const energyScore = item.energyScore || 0;
  const visualizationStreak = item.visualizationStreak || 0;
  const actionStreak = item.actionStreak || 0;

  return (
    <motion.div
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ x: 4 }}
    >
      <Card
        className={`hover:shadow-xl transition-all duration-300 border-2 cursor-pointer ${
          item.isAchieved ? "opacity-75 bg-green-50 dark:bg-green-950/20 border-green-300" : ""
        }`}
        onClick={() => onEdit(item)}
      >
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${typeConfig.color} flex items-center justify-center shadow-lg`}>
                  <typeConfig.icon className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className={`font-semibold text-lg ${item.isAchieved ? "line-through" : ""}`}>
                    {item.title}
                  </h4>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <Badge variant="secondary" className="text-xs">
                      {typeConfig.label}
                    </Badge>
                    {item.targetDate && (
                      <Badge variant="outline" className="text-xs">
                        <CalendarIcon className="h-3 w-3 mr-1" />
                        {new Date(item.targetDate).toLocaleDateString()}
                      </Badge>
                    )}
                    <Badge
                      className={`text-xs ${
                        energyScore >= 80 ? "bg-green-500" :
                        energyScore >= 60 ? "bg-yellow-500" :
                        energyScore >= 40 ? "bg-orange-500" : "bg-red-500"
                      } text-white`}
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      {energyScore}% Energy
                    </Badge>
                    {visualizationStreak > 0 && (
                      <Badge className="text-xs bg-gradient-to-r from-orange-500 to-red-500 text-white">
                        🔥 {visualizationStreak} day streak
                      </Badge>
                    )}
                    {actionStreak > 0 && (
                      <Badge className="text-xs bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                        ⚡ {actionStreak} action streak
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* DARK PSYCHOLOGY: Show Identity & Pain if present */}
              {item.identityStatement && (
                <div className="mb-2 p-2 bg-red-50 dark:bg-red-950/20 border-l-4 border-red-500 rounded">
                  <p className="text-xs font-bold text-red-700 dark:text-red-400">🔥 Identity:</p>
                  <p className="text-sm text-red-600 dark:text-red-300">{item.identityStatement}</p>
                </div>
              )}
              
              {item.painLeverage && (
                <div className="mb-2 p-2 bg-orange-50 dark:bg-orange-950/20 border-l-4 border-orange-500 rounded">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400">⚡ Pain Leverage:</p>
                  <p className="text-sm text-orange-600 dark:text-orange-300">{item.painLeverage}</p>
                </div>
              )}

              <p className={`text-sm text-muted-foreground whitespace-pre-wrap ${item.isAchieved ? "line-through" : ""}`}>
                {item.content}
              </p>

              <div className="mt-3 flex gap-2 flex-wrap">
                {item.microSteps && item.microSteps.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {item.microSteps.filter((s: any) => s.completed).length}/{item.microSteps.length} steps
                  </Badge>
                )}
                {item.synchronicities && item.synchronicities.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <Sparkle className="h-3 w-3 mr-1" />
                    {item.synchronicities.length} signs
                  </Badge>
                )}
                {item.journalEntries && item.journalEntries.length > 0 && (
                  <Badge variant="outline" className="text-xs">
                    <BookMarked className="h-3 w-3 mr-1" />
                    {item.journalEntries.length} entries
                  </Badge>
                )}
                {item.dailyActions && item.dailyActions.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-green-50 dark:bg-green-950/30">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
                    {item.dailyActions.length} action logs
                  </Badge>
                )}
                {item.evidenceLog && item.evidenceLog.length > 0 && (
                  <Badge variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30">
                    📊 {item.evidenceLog.length} evidence
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                Created: {new Date(item.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex flex-col gap-1 ml-4" onClick={(e) => e.stopPropagation()}>
              {!item.isAchieved && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onVisualize(item);
                  }}
                  className="cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-950 transition-all duration-300"
                  title="Log visualization session"
                >
                  <Sparkles className="h-4 w-4 text-purple-600" />
                </Button>
              )}
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleAchieved(item);
                }}
                className="cursor-pointer hover:bg-green-50 dark:hover:bg-green-950 transition-all duration-300"
              >
                <CheckCircle2 className={`h-4 w-4 transition-all duration-300 ${item.isAchieved ? "text-green-600 fill-green-600 scale-110" : "hover:scale-110"}`} />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(item._id);
                }}
                className="cursor-pointer hover:bg-pink-50 dark:hover:bg-pink-950 transition-all duration-300"
              >
                <Heart
                  className={`h-4 w-4 transition-all duration-300 ${
                    item.isFavorite ? "fill-red-500 text-red-500 scale-110" : "hover:scale-110"
                  }`}
                />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  onDelete(item._id);
                }}
                className="cursor-pointer text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition-all duration-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}