import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, X, Flame, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface ResolutionCardProps {
  resolution: Doc<"resolutions">;
  todayLog?: Doc<"resolutionLogs">;
  streak: number;
}

export function ResolutionCard({ resolution, todayLog, streak }: ResolutionCardProps) {
  const logProgress = useMutation(api.resolutions.logProgress);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const isBuild = resolution.type === "build";
  const today = new Date().toISOString().split("T")[0];

  const handleLog = async (status: "success" | "failure") => {
    try {
      await logProgress({
        resolutionId: resolution._id,
        date: today,
        status,
      });
      if (status === "success") {
        toast.success(isBuild ? "Habit reinforced." : "Temptation resisted.", {
          icon: "🔥"
        });
      } else {
        toast.error("Reset. Learn from this.", {
          icon: "⚠️"
        });
      }
    } catch (e) {
      toast.error("Failed to log progress");
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Card className={cn(
        "overflow-hidden border-l-4 transition-all duration-300 hover:shadow-lg",
        isBuild 
          ? "border-l-blue-500 dark:border-l-blue-400 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-900/10" 
          : "border-l-red-500 dark:border-l-red-400 bg-gradient-to-br from-white to-red-50/30 dark:from-gray-900 dark:to-red-900/10"
      )}>
        <CardContent className="p-0">
          <div className="p-5 flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg leading-none tracking-tight">
                  {resolution.title}
                </h3>
                {streak > 0 && (
                  <span className={cn(
                    "text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1",
                    isBuild ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700"
                  )}>
                    <Flame className="h-3 w-3" /> {streak}
                  </span>
                )}
              </div>
              
              {/* The "Why" snippet - always visible but subtle */}
              <p className="text-sm text-muted-foreground line-clamp-1 italic">
                "{resolution.why}"
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {todayLog ? (
                <div className={cn(
                  "px-4 py-2 rounded-md font-bold text-sm flex items-center gap-2",
                  todayLog.status === "success" 
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                    : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                )}>
                  {todayLog.status === "success" ? (
                    <>
                      <Check className="h-4 w-4" />
                      Done
                    </>
                  ) : (
                    <>
                      <X className="h-4 w-4" />
                      Failed
                    </>
                  )}
                </div>
              ) : (
                <div className="flex gap-2">
                  {isBuild ? (
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-blue-500/20 transition-all"
                      onClick={() => handleLog("success")}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Complete
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700 text-white shadow-md hover:shadow-green-500/20 transition-all"
                      onClick={() => handleLog("success")}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Avoided
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleLog("failure")}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {/* Expandable Details */}
          <div 
            className={cn(
              "bg-muted/30 border-t px-5 py-3 cursor-pointer hover:bg-muted/50 transition-colors flex justify-center",
              isExpanded && "border-b"
            )}
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
          </div>

          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-5 space-y-4 bg-muted/10">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2 p-3 rounded-lg bg-background border shadow-sm">
                      <h4 className="text-xs font-bold uppercase text-muted-foreground flex items-center gap-2">
                        <Info className="h-3 w-3" /> The Why
                      </h4>
                      <p className="text-sm italic text-foreground/90 leading-relaxed">
                        {resolution.why}
                      </p>
                    </div>
                    
                    {resolution.consequences && (
                      <div className="space-y-2 p-3 rounded-lg bg-red-50/50 dark:bg-red-950/10 border border-red-100 dark:border-red-900/30">
                        <h4 className="text-xs font-bold uppercase text-red-600 dark:text-red-400 flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3" /> Consequences
                        </h4>
                        <p className="text-sm text-red-900/80 dark:text-red-200/80 leading-relaxed">
                          {resolution.consequences}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
