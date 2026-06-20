import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2, Calendar, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Category color mappings with gradients and glows
const categoryStyles = {
  Focus: {
    gradient: "from-blue-500 to-cyan-500",
    glow: "shadow-[0_0_20px_rgba(59,130,246,0.5)]",
    bg: "bg-gradient-to-r from-blue-500/10 to-cyan-500/10",
    border: "border-blue-500/30",
    text: "text-blue-600 dark:text-blue-400",
  },
  Health: {
    gradient: "from-gray-500 to-slate-500",
    glow: "shadow-[0_0_20px_rgba(107,114,128,0.5)]",
    bg: "bg-gradient-to-r from-gray-500/10 to-slate-500/10",
    border: "border-gray-500/30",
    text: "text-gray-600 dark:text-gray-400",
  },
  Spiritual: {
    gradient: "from-purple-500 to-pink-500",
    glow: "shadow-[0_0_20px_rgba(168,85,247,0.5)]",
    bg: "bg-gradient-to-r from-purple-500/10 to-pink-500/10",
    border: "border-purple-500/30",
    text: "text-purple-600 dark:text-purple-400",
  },
  Learning: {
    gradient: "from-orange-500 to-red-500",
    glow: "shadow-[0_0_20px_rgba(249,115,22,0.5)]",
    bg: "bg-gradient-to-r from-orange-500/10 to-red-500/10",
    border: "border-orange-500/30",
    text: "text-orange-600 dark:text-orange-400",
  },
  General: {
    gradient: "from-green-500 to-lime-500",
    glow: "shadow-[0_0_20px_rgba(34,197,94,0.6)]",
    bg: "bg-gradient-to-r from-green-500/10 to-lime-500/10",
    border: "border-green-500/30",
    text: "text-green-500 dark:text-green-400",
  },
};

export default function ActiveTimerView() {
  const user = useQuery(api.users.currentUser);
  const timetables = useQuery(api.timetables.list);
  const activeTimetable = timetables?.find((t: any) => t.isActive);
  const timeBlocks = useQuery(
    api.timeBlocks.listByTimetable,
    activeTimetable ? { timetableId: activeTimetable._id } : "skip"
  );
  const todayLogs = useQuery((api as any).completionLogs.getToday);
  const markComplete = useMutation((api as any).completionLogs.markComplete);
  const categories = useQuery((api as any).categories.list);

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentBlock, setCurrentBlock] = useState<any>(null);
  const [nextBlock, setNextBlock] = useState<any>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!timeBlocks) return;

    const now = currentTime.toTimeString().slice(0, 5);
    
    let current = null;
    let next = null;

    for (let i = 0; i < timeBlocks.length; i++) {
      const block = timeBlocks[i];
      if (now >= block.startTime && now < block.endTime) {
        current = block;
        next = timeBlocks[i + 1] || null;
        break;
      } else if (now < block.startTime && !next) {
        next = block;
      }
    }

    setCurrentBlock(current);
    setNextBlock(next);
  }, [timeBlocks, currentTime]);

  const handleToggleComplete = async (blockId: Id<"timeBlocks">) => {
    const log = todayLogs?.find((l: any) => l.timeBlockId === blockId);
    const newState = !log?.completed;

    try {
      await markComplete({
        timeBlockId: blockId,
        completed: newState,
      });
      toast.success(newState ? "Block completed! 🎉" : "Block marked incomplete");
    } catch (error) {
      toast.error("Failed to update block");
    }
  };

  const isBlockCompleted = (blockId: Id<"timeBlocks">) => {
    return todayLogs?.find((l: any) => l.timeBlockId === blockId)?.completed || false;
  };

  const getCategoryStyle = (category: string) => {
    // First check if it's a custom category
    if (categories) {
      const customCat = categories.find((cat: any) => cat.name === category);
      if (customCat) {
        return {
          gradient: customCat.color,
          glow: `shadow-[0_0_20px_${customCat.glowColor}]`,
          bg: `bg-gradient-to-r ${customCat.color}/10`,
          border: `border-${customCat.color.split('-')[1]}-500/30`,
          text: `text-${customCat.color.split('-')[1]}-600 dark:text-${customCat.color.split('-')[1]}-400`,
        };
      }
    }
    
    // Fallback to default styles
    return categoryStyles[category as keyof typeof categoryStyles] || categoryStyles.General;
  };

  // Add empty state check after loading
  if (!timetables) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // NEW: Empty state when no timetable exists or is active
  if (!activeTimetable || !timeBlocks || timeBlocks.length === 0) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
          <Card className="border-2 border-orange-300 dark:border-orange-700 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 dark:from-orange-950 dark:via-red-950 dark:to-pink-950 shadow-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <motion.div
                  className="bg-gradient-to-br from-orange-600 to-red-600 p-3 rounded-xl shadow-2xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                >
                  <Clock className="h-6 w-6 text-white" />
                </motion.div>
                <div>
                  <h2 className="text-3xl font-black bg-gradient-to-r from-orange-600 via-red-600 to-pink-600 bg-clip-text text-transparent">
                    Active Timer
                  </h2>
                  <p className="text-sm text-muted-foreground font-semibold">
                    Stay focused on your current time block
                  </p>
                </div>
              </CardTitle>
            </CardHeader>
          </Card>
        </motion.div>

        {/* Empty State */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-2 border-orange-200 dark:border-orange-800">
            <CardContent className="py-16 text-center">
              <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl" />
                  <div className="relative bg-gradient-to-br from-orange-100 to-red-100 dark:from-orange-900/30 dark:to-red-900/30 rounded-full p-8">
                    <Calendar className="h-16 w-16 text-orange-600 dark:text-orange-400" />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    {!activeTimetable ? "No Active Timetable" : "No Time Blocks"}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {!activeTimetable 
                      ? "To use the timer, you need to create and activate a timetable first. Go to the Timetables section to set up your daily schedule."
                      : "Your active timetable doesn't have any time blocks yet. Add some time blocks to start tracking your day."}
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mt-4">
                  <Button
                    onClick={() => {
                      // Navigate to Timetables section
                      const timetablesButton = document.querySelector('[data-view="timetables"]') as HTMLButtonElement;
                      if (timetablesButton) timetablesButton.click();
                    }}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Calendar className="h-5 w-5 mr-2" />
                    Go to Timetables
                  </Button>
                  
                  {activeTimetable && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        const timetablesButton = document.querySelector('[data-view="timetables"]') as HTMLButtonElement;
                        if (timetablesButton) timetablesButton.click();
                      }}
                      className="border-orange-300 dark:border-orange-700 hover:bg-orange-50 dark:hover:bg-orange-950/30 font-semibold px-6 py-3 rounded-xl"
                    >
                      <Plus className="h-5 w-5 mr-2" />
                      Add Time Blocks
                    </Button>
                  )}
                </div>

                <div className="mt-6 p-4 bg-orange-50 dark:bg-orange-950/30 rounded-xl border border-orange-200 dark:border-orange-800">
                  <p className="text-sm text-muted-foreground">
                    💡 <strong>Tip:</strong> Create a timetable with time blocks for your daily routine, then activate it to start using the timer feature.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const completedCount = todayLogs?.filter((l: any) => l.completed).length || 0;
  const totalCount = timeBlocks.length;
  const progressPercent = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="space-y-6">
      {/* Current Block - Large Focus Card */}
      {currentBlock ? (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="border-2 border-indigo-200 dark:border-indigo-800 bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950">
            <CardHeader>
              <div className="flex items-center justify-between">
                <Badge className="bg-indigo-600 text-white">
                  <Clock className="h-3 w-3 mr-1" />
                  Current Block
                </Badge>
                <span className="text-sm font-mono text-muted-foreground">
                  {currentBlock.startTime} - {currentBlock.endTime}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h2 className="text-3xl font-bold mb-2">{currentBlock.title}</h2>
                {currentBlock.description && (
                  <div className={`p-4 rounded-lg border-2 ${getCategoryStyle(currentBlock.category).bg} ${getCategoryStyle(currentBlock.category).border} ${getCategoryStyle(currentBlock.category).glow}`}>
                    <p className={`text-lg whitespace-pre-wrap ${getCategoryStyle(currentBlock.category).text} font-medium`}>
                      {currentBlock.description}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge 
                  className={`bg-gradient-to-r ${getCategoryStyle(currentBlock.category).gradient} text-white ${getCategoryStyle(currentBlock.category).glow} px-4 py-1.5 text-sm font-semibold`}
                >
                  {currentBlock.category}
                </Badge>
              </div>

              <Button
                size="lg"
                onClick={() => handleToggleComplete(currentBlock._id)}
                className={`w-full cursor-pointer ${
                  isBlockCompleted(currentBlock._id)
                    ? "bg-green-600 hover:bg-green-700"
                    : ""
                }`}
              >
                {isBlockCompleted(currentBlock._id) ? (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Completed
                  </>
                ) : (
                  <>
                    <Circle className="h-5 w-5 mr-2" />
                    Mark Complete
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No Active Block</h3>
            <p className="text-muted-foreground">
              {nextBlock
                ? `Next: ${nextBlock.title} at ${nextBlock.startTime}`
                : "All blocks completed for today!"}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Next Block Preview */}
      {nextBlock && (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Up Next
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-lg">{nextBlock.title}</h4>
                  <Badge 
                    className={`bg-gradient-to-r ${getCategoryStyle(nextBlock.category).gradient} text-white ${getCategoryStyle(nextBlock.category).glow} px-3 py-1 text-sm font-semibold`}
                  >
                    {nextBlock.category}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground font-mono">
                  {nextBlock.startTime} - {nextBlock.endTime}
                </p>
                {nextBlock.description && (
                  <div className={`p-3 rounded-lg border-2 ${getCategoryStyle(nextBlock.category).bg} ${getCategoryStyle(nextBlock.category).border} ${getCategoryStyle(nextBlock.category).glow}`}>
                    <p className={`text-sm whitespace-pre-wrap ${getCategoryStyle(nextBlock.category).text} font-medium`}>
                      {nextBlock.description}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Today's Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Today's Progress</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {completedCount} of {totalCount} blocks completed
              </span>
              <span className="text-sm font-semibold">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} />
          </div>

          {/* All Blocks List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {timeBlocks.map((block: any) => {
              const completed = isBlockCompleted(block._id);
              const isCurrent = currentBlock?._id === block._id;
              const style = getCategoryStyle(block.category || "General");

              return (
                <motion.div
                  key={block._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isCurrent
                      ? "bg-indigo-50 dark:bg-indigo-950 border-indigo-200 dark:border-indigo-800"
                      : completed
                      ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                      : "hover:bg-gray-50 dark:hover:bg-gray-900"
                  }`}
                  onClick={() => handleToggleComplete(block._id)}
                >
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 shrink-0 mt-0.5" />
                  ) : (
                    <Circle className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />
                  )}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-medium ${
                          completed ? "line-through text-muted-foreground" : ""
                        }`}
                      >
                        {block.title}
                      </span>
                      {isCurrent && (
                        <Badge variant="default" className="text-xs">
                          Now
                        </Badge>
                      )}
                      <Badge 
                        className={`bg-gradient-to-r ${style.gradient} text-white ${style.glow} text-xs px-2 py-0.5 font-semibold`}
                      >
                        {block.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground font-mono">
                      {block.startTime} - {block.endTime}
                    </p>
                    {block.description && (
                      <div className={`p-2 rounded-md border ${style.bg} ${style.border} ${style.glow}`}>
                        <p className={`text-xs whitespace-pre-wrap ${style.text} font-medium`}>
                          {block.description}
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}