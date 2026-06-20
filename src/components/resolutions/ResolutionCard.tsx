import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Flame, AlertTriangle, Info, ChevronDown, ChevronUp, Zap, Skull, Play, SkipForward, ShieldAlert, MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ResolutionCardProps {
  resolution: Doc<"resolutions">;
  date: string; // The date we are viewing/logging for
  log?: Doc<"resolutionLogs">;
  recentLogs: Doc<"resolutionLogs">[];
  streak: number;
}

export function ResolutionCard({ resolution, date, log, recentLogs, streak }: ResolutionCardProps) {
  const logProgress = useMutation(api.resolutions.logProgress);
  const archiveResolution = useMutation(api.resolutions.archive);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

  const isBuild = resolution.type === "build";
  
  // Generate last 7 days dates ending on the VIEWED date
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(date);
    d.setDate(d.getDate() - (6 - i)); // 6 days ago to viewed date
    return d.toISOString().split("T")[0];
  });

  const handleLog = async (status: "success" | "failure") => {
    try {
      await logProgress({
        resolutionId: resolution._id,
        date: date,
        status,
      });
      if (status === "success") {
        toast.success(isBuild ? "Momentum built. Keep going." : "Temptation crushed. Well done.", {
          icon: "🔥",
          className: isBuild ? "bg-blue-50 border-blue-200" : "bg-red-50 border-red-200"
        });
      } else {
        toast.error("Streak broken. Restart immediately.", {
          icon: "⚠️"
        });
      }
    } catch (e) {
      toast.error("Failed to log progress");
    }
  };

  const handleDelete = async () => {
    try {
      await archiveResolution({ resolutionId: resolution._id });
      toast.success("Resolution deleted");
      setShowDeleteAlert(false);
    } catch (e) {
      toast.error("Failed to delete resolution");
    }
  };

  const getDayStatus = (d: string) => {
    const l = recentLogs.find(log => log.date === d);
    if (!l) return "empty";
    return l.status;
  };

  return (
    <>
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 relative group",
        isBuild 
          ? "bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/20" 
          : "bg-gradient-to-br from-white to-red-50/50 dark:from-gray-900 dark:to-red-950/20"
      )}>
        {/* Left accent bar */}
        <div className={cn(
          "absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-300",
          isBuild ? "bg-blue-500 group-hover:bg-blue-600" : "bg-red-500 group-hover:bg-red-600"
        )} />

        <CardContent className="p-0">
          <div className="p-5 pl-7 flex flex-col gap-4">
            {/* Header Section */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-lg leading-tight tracking-tight text-foreground/90">
                    {resolution.title}
                  </h3>
                  {streak > 0 && (
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className={cn(
                        "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm border",
                        isBuild 
                          ? "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-800" 
                          : "bg-red-100 text-red-700 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800"
                      )}
                    >
                      <Flame className={cn("h-3 w-3", isBuild ? "text-blue-600" : "text-red-600")} fill="currentColor" /> 
                      {streak} day{streak !== 1 ? 's' : ''}
                    </motion.div>
                  )}
                </div>
                
                <p className="text-sm text-muted-foreground line-clamp-1 font-medium italic opacity-80">
                  "{resolution.why}"
                </p>
              </div>

              {/* Action Button & Menu */}
              <div className="shrink-0 flex items-start gap-2">
                {log ? (
                  <motion.div 
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "h-12 px-4 rounded-xl font-bold text-sm flex items-center gap-2 shadow-inner border min-w-[120px] justify-center",
                      log.status === "success" 
                        ? "bg-green-100/50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900"
                        : "bg-red-100/50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900"
                    )}
                  >
                    {log.status === "success" ? (
                      <>
                        <div className="bg-green-500 text-white rounded-full p-0.5">
                          <Check className="h-4 w-4" />
                        </div>
                        <span>{isBuild ? "Done" : "Avoided"}</span>
                      </>
                    ) : (
                      <>
                        <div className="bg-red-500 text-white rounded-full p-0.5">
                          <X className="h-4 w-4" />
                        </div>
                        <span>{isBuild ? "Missed" : "Slipped"}</span>
                      </>
                    )}
                  </motion.div>
                ) : (
                  <div className="flex items-center gap-2">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-12 w-12 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                            onClick={() => handleLog("failure")}
                          >
                            <X className="h-6 w-6" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isBuild ? "Missed" : "Slipped"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    <Button 
                      size="lg" 
                      className={cn(
                        "h-12 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 active:scale-95 min-w-[120px]",
                        isBuild 
                          ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white" 
                          : "bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white"
                      )}
                      onClick={() => handleLog("success")}
                    >
                      {isBuild ? <Check className="h-5 w-5 mr-2" /> : <ShieldAlert className="h-5 w-5 mr-2" />}
                      {isBuild ? "Done" : "Avoided"}
                    </Button>
                  </div>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive cursor-pointer"
                      onClick={() => setShowDeleteAlert(true)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Resolution
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Tracker & Footer */}
            <div className="flex items-end justify-between gap-4 pt-2">
              {/* Visual History Tracker */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground/70">
                  History (Ending {new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })})
                </span>
                <div className="flex items-center gap-1.5">
                  {last7Days.map((d, i) => {
                    const status = getDayStatus(d);
                    const isCurrent = d === date;
                    
                    return (
                      <TooltipProvider key={d}>
                        <Tooltip>
                          <TooltipTrigger>
                            <div className={cn(
                              "w-3 h-8 rounded-full transition-all duration-300",
                              status === "success" 
                                ? (isBuild ? "bg-blue-500 shadow-blue-200 dark:shadow-none" : "bg-red-500 shadow-red-200 dark:shadow-none")
                                : status === "failure"
                                  ? "bg-gray-300 dark:bg-gray-700 opacity-50"
                                  : "bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700",
                              isCurrent && !log && "border-2 border-dashed border-primary animate-pulse",
                              status === "success" && "shadow-sm"
                            )} />
                          </TooltipTrigger>
                          <TooltipContent side="bottom" className="text-xs">
                            <p>{new Date(d).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <p className="capitalize font-semibold">{status === "empty" ? "No Log" : status}</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    );
                  })}
                </div>
              </div>

              {/* Expand Toggle */}
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-foreground gap-1"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                {isExpanded ? "Hide Details" : "Details & Psychology"}
                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
              </Button>
            </div>
          </div>

          {/* Expanded Details */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden bg-muted/30 border-t"
              >
                <div className="p-5 grid md:grid-cols-2 gap-4">
                  <div className="space-y-2 p-4 rounded-xl bg-background border shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-primary/50" />
                    <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                      <Info className="h-3 w-3" /> The Why (Anchor)
                    </h4>
                    <p className="text-sm text-foreground/90 leading-relaxed font-medium">
                      "{resolution.why}"
                    </p>
                  </div>
                  
                  {resolution.consequences && (
                    <div className="space-y-2 p-4 rounded-xl bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-red-500/50" />
                      <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
                        <Skull className="h-3 w-3" /> Cost of Failure
                      </h4>
                      <p className="text-sm text-red-900/80 dark:text-red-200/80 leading-relaxed font-medium">
                        "{resolution.consequences}"
                      </p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>

    <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete this resolution?</AlertDialogTitle>
          <AlertDialogDescription>
            This will remove "{resolution.title}" from your active protocols. History will be preserved in the archives.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}