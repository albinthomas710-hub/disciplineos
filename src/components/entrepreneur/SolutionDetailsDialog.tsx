import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Lightbulb, Calendar, Clock, BarChart3, Target, CheckCircle2, XCircle } from "lucide-react";
import { Id } from "@/convex/_generated/dataModel";

interface SolutionDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  solution: {
    _id: Id<"solutions">;
    solutionTitle: string;
    solutionDescription: string;
    hypothesis: string;
    expectedOutcome: string;
    actualOutcome?: string;
    buildComplexity: number;
    timeToBuild?: number;
    dateStarted?: string;
    dateShipped?: string;
    status: string;
    validationMetrics?: string;
  };
  problemTitle?: string;
}

export function SolutionDetailsDialog({ open, onOpenChange, solution, problemTitle }: SolutionDetailsDialogProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "validated": return "bg-green-600";
      case "shipped": return "bg-blue-600";
      case "testing": return "bg-yellow-600";
      case "building": return "bg-orange-600";
      case "failed": return "bg-red-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-green-600" />
            {solution.solutionTitle}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status and Problem Link */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getStatusColor(solution.status)} variant="default">
              {solution.status}
            </Badge>
            {problemTitle && (
              <Badge variant="outline">Solving: {problemTitle}</Badge>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Solution Description
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{solution.solutionDescription}</p>
          </div>

          <Separator />

          {/* Hypothesis & Expected Outcome */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border-l-4 border-blue-600">
              <div className="flex items-center gap-2 mb-2">
                <Target className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold">Hypothesis</h3>
              </div>
              <p className="text-sm whitespace-pre-wrap">{solution.hypothesis}</p>
            </div>
            <div className="p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border-l-4 border-green-600">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <h3 className="font-semibold">Expected Outcome</h3>
              </div>
              <p className="text-sm whitespace-pre-wrap">{solution.expectedOutcome}</p>
            </div>
          </div>

          {/* Actual Outcome (if exists) */}
          {solution.actualOutcome && (
            <>
              <Separator />
              <div className="p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg border-l-4 border-purple-600">
                <div className="flex items-center gap-2 mb-2">
                  <BarChart3 className="h-5 w-5 text-purple-600" />
                  <h3 className="font-semibold">Actual Outcome</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{solution.actualOutcome}</p>
              </div>
            </>
          )}

          <Separator />

          {/* Build Metrics */}
          <div>
            <h3 className="font-semibold mb-3">Build Metrics</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg text-center">
                <BarChart3 className="h-5 w-5 mx-auto mb-1 text-orange-600" />
                <p className="text-2xl font-bold">{solution.buildComplexity}/10</p>
                <p className="text-xs text-muted-foreground">Complexity</p>
              </div>
              {solution.timeToBuild && (
                <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg text-center">
                  <Clock className="h-5 w-5 mx-auto mb-1 text-blue-600" />
                  <p className="text-2xl font-bold">{solution.timeToBuild}</p>
                  <p className="text-xs text-muted-foreground">Hours to Build</p>
                </div>
              )}
            </div>
          </div>

          {/* Dates */}
          {(solution.dateStarted || solution.dateShipped) && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Timeline
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {solution.dateStarted && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Date Started</p>
                      <p className="text-sm">{new Date(solution.dateStarted).toLocaleDateString()}</p>
                    </div>
                  )}
                  {solution.dateShipped && (
                    <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                      <p className="text-xs font-semibold mb-1">Date Shipped</p>
                      <p className="text-sm">{new Date(solution.dateShipped).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Validation Metrics */}
          {solution.validationMetrics && (
            <>
              <Separator />
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg border-l-4 border-yellow-600">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle2 className="h-5 w-5 text-yellow-600" />
                  <h3 className="font-semibold">Validation Metrics</h3>
                </div>
                <p className="text-sm whitespace-pre-wrap">{solution.validationMetrics}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
