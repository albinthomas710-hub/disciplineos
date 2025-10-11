import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import { CheckCircle2, Circle, Clock, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ActiveTimerView() {
  const activeTimetable = useQuery(api.timetables.getActive);
  const timeBlocks = useQuery(
    api.timeBlocks.listByTimetable,
    activeTimetable ? { timetableId: activeTimetable._id } : "skip"
  );
  const todayLogs = useQuery(api.completionLogs.getToday);
  const markComplete = useMutation(api.completionLogs.markComplete);

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
    const log = todayLogs?.find((l) => l.timeBlockId === blockId);
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
    return todayLogs?.find((l) => l.timeBlockId === blockId)?.completed || false;
  };

  if (!activeTimetable || !timeBlocks) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const completedCount = todayLogs?.filter((l) => l.completed).length || 0;
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
                  <p className="text-lg text-muted-foreground whitespace-pre-wrap">
                    {currentBlock.description}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline">{currentBlock.category}</Badge>
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
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">{nextBlock.title}</h4>
                  <Badge variant="outline">{nextBlock.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {nextBlock.startTime} - {nextBlock.endTime}
                </p>
                {nextBlock.description && (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {nextBlock.description}
                  </p>
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
            {timeBlocks.map((block) => {
              const completed = isBlockCompleted(block._id);
              const isCurrent = currentBlock?._id === block._id;

              return (
                <motion.div
                  key={block._id}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
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
                  <div className="flex-1 min-w-0">
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
                      <Badge variant="outline" className="text-xs">
                        {block.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {block.startTime} - {block.endTime}
                    </p>
                    {block.description && (
                      <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">
                        {block.description}
                      </p>
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